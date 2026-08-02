import type { CheckModule, LayoutSnapshot, LayoutSnapshotCache, ProjectConfig, Violation } from '../types.js'
import { loadLayoutSnapshots } from '../layout-cache.js'
import { findButtonBlocks } from './dom-order.js'
import {
  isRtl,
  semanticToPhysical,
  physicalFa,
  normalizeTextAlign,
  normalizeJustify,
  normalizeAlign,
  normalizeColorToken,
} from '../direction.js'

// ── layout-diff ────────────────────────────────────────────────────────────────
// برخلاف dom-order/icon-direction (که rule عمومی چک می‌کنن)، این ماژول کد رو با
// facts واقعیِ همون طرح مشخص فیگما (از .claude/context/figma-layout.json) مقایسه
// می‌کنه — یعنی می‌تونه دقیقاً همون باگی رو بگیره که rule عمومی نمی‌گیره: یه المان
// خاص که تو طرح راسته ولی تو کد چپ پیاده شده (استثنا نسبت به قاعده‌ی کلی).
//
// اگه برای یه کامپوننت snapshot نباشه، صفر violation — false-positive نمی‌زنیم.
// population: STEP 2 در dev-implement، یا `dev-engine layout-sync --set`.

const EXPORT_NAME_RE = /export\s+(?:default\s+)?(?:function|const)\s+([A-Z][A-Za-z0-9]*)/g

interface ComponentSpan {
  name: string
  start: number   // offset اعلان export
  end: number     // offset شروع کامپوننت بعدی (یا انتهای فایل)
}

// ⚠️ قبلاً از content.indexOf(name) استفاده می‌شد که اولین *ذکر* اسم رو پیدا می‌کرد
// (اغلب داخل import یا type)، نه اعلان export رو — و بعد return block یه کامپوننت
// دیگه رو تحلیل می‌کرد. حالا از m.index خودِ regex استفاده می‌کنیم.
function findComponentSpans(content: string): ComponentSpan[] {
  const spans: { name: string; start: number }[] = []
  let m: RegExpExecArray | null
  EXPORT_NAME_RE.lastIndex = 0
  while ((m = EXPORT_NAME_RE.exec(content)) !== null) {
    spans.push({ name: m[1], start: m.index })
  }
  return spans.map((s, i) => ({
    ...s,
    end: i + 1 < spans.length ? spans[i + 1].start : content.length,
  }))
}

function lineAt(content: string, offset: number): number {
  return content.slice(0, offset).split('\n').length
}

// انتهای تگِ بازِ شروع‌شده در `start` رو پیدا می‌کنه، با آگاهی از {} و quote
// تا arrow fn داخل prop (onClick={() => …}) تشخیص رو خراب نکنه.
function scanOpeningTag(s: string, start: number): { end: number; selfClosing: boolean } {
  let depth = 0
  let quote = ''
  for (let i = start + 1; i < s.length; i++) {
    const c = s[i]
    if (quote) { if (c === quote) quote = ''; continue }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue }
    if (c === '{') depth++
    else if (c === '}') depth--
    else if (c === '>' && depth === 0) return { end: i, selfClosing: s[i - 1] === '/' }
  }
  return { end: s.length, selfClosing: false }
}

// بلوک JSX اصلی کامپوننت — هم `return (…)` و هم arrow با return ضمنی `=> (…)`.
function findReturnBlock(content: string, from: number, to: number): { jsx: string; offset: number } | null {
  const region = content.slice(from, to)
  const m = /return\s*\(|=>\s*\(/.exec(region)
  if (!m) return null
  const openParen = m.index + m[0].length - 1 + from
  let depth = 1
  let i = openParen + 1
  for (; i < to && depth > 0; i++) {
    if (content[i] === '(') depth++
    else if (content[i] === ')') depth--
  }
  return { jsx: content.slice(openParen + 1, i - 1), offset: openParen + 1 }
}

// اسم فرزندهای مستقیمِ root رو به ترتیب برمی‌گردونه.
// ⚠️ باگ قبلی: ریشه‌ی Fragment (`<>`) با regex تگ مطابقت نمی‌کرد، پس depth هیچ‌وقت
// زیاد نمی‌شد و فرزندهای واقعی در depth 0 دیده و نادیده گرفته می‌شدن — یعنی هر
// کامپوننتی با ریشه‌ی Fragment کاملاً از این چک فرار می‌کرد.
function topLevelChildNames(jsx: string, maxChildren = 12): string[] {
  const names: string[] = []
  let depth = 0
  let i = 0
  while (i < jsx.length && names.length <= maxChildren) {
    const lt = jsx.indexOf('<', i)
    if (lt === -1) break

    if (jsx[lt + 1] === '/') {           // </Name> یا </>
      depth--
      const gt = jsx.indexOf('>', lt)
      i = gt === -1 ? jsx.length : gt + 1
      continue
    }
    if (jsx[lt + 1] === '>') {           // <>  — Fragment باز
      if (depth === 1) names.push('Fragment')
      depth++
      i = lt + 2
      continue
    }
    const tag = /^<([A-Za-z][A-Za-z0-9.]*)/.exec(jsx.slice(lt))
    if (!tag) { i = lt + 1; continue }

    const { end, selfClosing } = scanOpeningTag(jsx, lt)
    if (depth === 1) names.push(tag[1])
    if (!selfClosing) depth++
    i = end + 1
  }
  return names
}

function isCommentLine(line: string): boolean {
  const t = line.trim()
  return t.startsWith('//') || t.startsWith('*') || t.startsWith('{/*')
}

// ── چک‌ها ─────────────────────────────────────────────────────────────────────
// همه‌شون به بازه‌ی خودِ کامپوننت محدودن (نه کل فایل) — قبلاً checkTextAlign کل
// فایل رو برای هر snapshot اسکن می‌کرد، پس دو کامپوننتِ snapshot‌دار در یک فایل
// خطاهای هم رو به هم نسبت می‌دادن.

function checkTextAlign(
  filePath: string, content: string, span: ComponentSpan, snap: LayoutSnapshot, rtl: boolean
): Violation[] {
  if (!snap.textAlign) return []
  const out: Violation[] = []
  const re = /textAlign[=:]\s*\{?\s*["'`](start|end|center|left|right)["'`]/g
  const region = content.slice(span.start, span.end)
  let m: RegExpExecArray | null
  re.lastIndex = 0
  while ((m = re.exec(region)) !== null) {
    const abs = span.start + m.index
    const line = lineAt(content, abs)
    if (isCommentLine(content.split('\n')[line - 1] ?? '')) continue

    const actual = normalizeTextAlign(m[1], rtl)
    if (!actual || actual === snap.textAlign) continue

    const want = physicalFa(semanticToPhysical(snap.textAlign, rtl))
    const got = physicalFa(semanticToPhysical(actual, rtl))
    out.push({
      file: filePath, line,
      module: 'layout-diff', rule: 'text-align-mismatch',
      message: `textAlign="${m[1]}" در ${span.name} یعنی ${got}، ولی طرح فیگما ${snap.textAlign} (${want}) می‌خواد`,
      severity: 'error', autoFixable: true,
      original: m[0],
      replacement: m[0].replace(m[1], snap.textAlign),
    })
  }
  return out
}

function checkJustify(
  filePath: string, content: string, span: ComponentSpan, snap: LayoutSnapshot, rtl: boolean
): Violation[] {
  if (!snap.justify) return []
  const out: Violation[] = []
  const re = /\b(justify|justifyContent)=\s*\{?\s*["'`]([a-z-]+)["'`]/g
  const region = content.slice(span.start, span.end)
  let m: RegExpExecArray | null
  re.lastIndex = 0
  while ((m = re.exec(region)) !== null) {
    const abs = span.start + m.index
    const line = lineAt(content, abs)
    if (isCommentLine(content.split('\n')[line - 1] ?? '')) continue

    const actual = normalizeJustify(m[2], rtl)
    if (!actual || actual === snap.justify) continue

    const sideNote = (v: string) =>
      v === 'start' ? ` (${physicalFa(semanticToPhysical('start', rtl))})`
      : v === 'end' ? ` (${physicalFa(semanticToPhysical('end', rtl))})` : ''
    out.push({
      file: filePath, line,
      module: 'layout-diff', rule: 'justify-mismatch',
      message: `${m[1]}="${m[2]}" در ${span.name} یعنی ${actual}${sideNote(actual)}، ولی طرح ${snap.justify}${sideNote(snap.justify)} می‌خواد`,
      severity: 'error', autoFixable: false,
      fix: `${m[1]} را به معادل ${snap.justify} تغییر بده (زیر dir=rtl مقدار flex-start می‌ره راست و flex-end می‌ره چپ)`,
    })
  }
  return out
}

function checkAlign(
  filePath: string, content: string, span: ComponentSpan, snap: LayoutSnapshot, rtl: boolean
): Violation[] {
  if (!snap.align) return []
  const out: Violation[] = []
  const re = /\b(align|alignItems)=\s*\{?\s*["'`]([a-z-]+)["'`]/g
  const region = content.slice(span.start, span.end)
  let m: RegExpExecArray | null
  re.lastIndex = 0
  while ((m = re.exec(region)) !== null) {
    const abs = span.start + m.index
    const line = lineAt(content, abs)
    if (isCommentLine(content.split('\n')[line - 1] ?? '')) continue

    const actual = normalizeAlign(m[2], rtl)
    if (!actual || actual === snap.align) continue

    out.push({
      file: filePath, line,
      module: 'layout-diff', rule: 'align-mismatch',
      message: `${m[1]}="${m[2]}" در ${span.name} یعنی ${actual}، ولی طرح ${snap.align} می‌خواد`,
      severity: 'error', autoFixable: false,
      fix: `${m[1]} را به معادل ${snap.align} تغییر بده`,
    })
  }
  return out
}

function checkChildOrder(
  filePath: string, content: string, span: ComponentSpan, snap: LayoutSnapshot
): Violation[] {
  if (!snap.childOrder || snap.childOrder.length < 2) return []
  const block = findReturnBlock(content, span.start, span.end)
  if (!block) return []

  const actualOrder = topLevelChildNames(block.jsx, snap.childOrder.length + 4)
  const expected = snap.childOrder

  // فقط وقتی مجموعه‌ها همپوشانی معنادار دارن مقایسه کن (وگرنه احتمالاً بخش دیگه‌ای
  // از UI رو گرفتیم، نه اون container ای که snapshot براش گرفته شده).
  const overlap = actualOrder.filter(n => expected.includes(n))
  if (overlap.length < Math.min(2, expected.length)) return []

  const expectedFiltered = expected.filter(n => actualOrder.includes(n))
  const actualFiltered = actualOrder.filter(n => expected.includes(n))
  if (expectedFiltered.every((n, i) => n === actualFiltered[i])) return []

  return [{
    file: filePath, line: lineAt(content, span.start),
    module: 'layout-diff', rule: 'child-order-mismatch',
    message: `ترتیب فرزندهای ${span.name} با طرح فیگما نمی‌خونه — طرح: [${expected.join(', ')}]، کد: [${actualOrder.join(', ')}]`,
    severity: 'error', autoFixable: false,
    fix: `ترتیب JSX رو مطابق طرح عوض کن: [${expected.join(', ')}]`,
  }]
}

// ⚠️ باگ قبلی: فقط buttons[0] بررسی می‌شد، پس هر دکمه‌ی دیگه‌ای در همون کامپوننت
// می‌تونست آیکونش سمت غلط باشه و بی‌صدا رد شه. حالا همه‌ی دکمه‌ها چک می‌شن.
function checkIconSide(
  filePath: string, content: string, span: ComponentSpan, snap: LayoutSnapshot
): Violation[] {
  if (!snap.iconSide) return []
  const block = findReturnBlock(content, span.start, span.end)
  if (!block) return []

  const out: Violation[] = []
  for (const btn of findButtonBlocks(block.jsx)) {
    const inner = btn.inner.replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    if (!/<[A-Z][A-Za-z]/.test(inner)) continue          // آیکونی نداره

    const firstTag = inner.search(/</)
    const beforeTag = firstTag === -1 ? inner : inner.slice(0, firstTag)
    const labelFirst = /[A-Za-z؀-ۿ]/.test(beforeTag)
    const actualSide: 'start' | 'end' = labelFirst ? 'end' : 'start'
    if (actualSide === snap.iconSide) continue

    out.push({
      file: filePath,
      line: lineAt(content, block.offset + btn.index),
      module: 'layout-diff', rule: 'icon-side-mismatch',
      message: `آیکون این دکمه در ${span.name} سمت ${actualSide === 'start' ? 'ابتدا' : 'انتها'}ی متنه، ولی طرح فیگما ${snap.iconSide === 'start' ? 'ابتدا' : 'انتها'} می‌خواد`,
      severity: 'error', autoFixable: false,
      fix: snap.iconSide === 'start' ? 'آیکون رو قبل از متن بذار' : 'آیکون رو بعد از متن بذار',
    })
  }
  return out
}

// آیکون‌های lucide امضای `size={N}` دارن — از همین برای تشخیص «این یه آیکونه»
// استفاده می‌کنیم تا رنگِ متن/کارت را اشتباهی به‌عنوان رنگ آیکون نگیریم.
function checkIconColor(
  filePath: string, content: string, span: ComponentSpan, snap: LayoutSnapshot
): Violation[] {
  if (!snap.iconColor) return []
  const want = normalizeColorToken(snap.iconColor)
  const out: Violation[] = []
  const region = content.slice(span.start, span.end)
  const re = /<([A-Z][A-Za-z0-9]*)\b([^>]*?)\/?>/g
  let m: RegExpExecArray | null
  re.lastIndex = 0
  while ((m = re.exec(region)) !== null) {
    const props = m[2]
    if (!/\bsize=\{/.test(props)) continue               // آیکون نیست
    const colorMatch = /\bcolor=\s*\{?\s*["'`]([^"'`]+)["'`]/.exec(props)
    if (!colorMatch) continue

    const actual = normalizeColorToken(colorMatch[1])
    if (actual === want) continue

    const abs = span.start + m.index
    out.push({
      file: filePath, line: lineAt(content, abs),
      module: 'layout-diff', rule: 'icon-color-mismatch',
      message: `رنگ آیکون <${m[1]}> در ${span.name} «${actual}» است، ولی طرح فیگما «${want}» می‌خواد`,
      severity: 'error', autoFixable: true,
      original: colorMatch[0],
      replacement: colorMatch[0].replace(colorMatch[1], snap.iconColor),
    })
  }
  return out
}

export function createLayoutDiffModule(projectRoot: string): CheckModule {
  let cache: LayoutSnapshotCache | null = null
  const getCache = (): LayoutSnapshotCache => {
    if (cache === null) cache = loadLayoutSnapshots(projectRoot)
    return cache
  }

  return {
    id: 'layout-diff',
    name: 'Figma Layout Diff',
    description:
      'کد رو با facts واقعیِ طرح فیگما (ترتیب فرزند/textAlign/justify/align/سمت و رنگ آیکون) مقایسه می‌کنه — instance-specific، نه rule عمومی',
    supportedDirections: ['rtl', 'ltr', 'both'],

    check(filePath: string, content: string, config: ProjectConfig): Violation[] {
      const snapshots = getCache()
      if (Object.keys(snapshots).length === 0) return []

      const violations: Violation[] = []
      const rtl = isRtl(config.direction)

      for (const span of findComponentSpans(content)) {
        const snap = snapshots[span.name]
        if (!snap) continue

        violations.push(...checkTextAlign(filePath, content, span, snap, rtl))
        violations.push(...checkJustify(filePath, content, span, snap, rtl))
        violations.push(...checkAlign(filePath, content, span, snap, rtl))
        violations.push(...checkChildOrder(filePath, content, span, snap))
        violations.push(...checkIconSide(filePath, content, span, snap))
        violations.push(...checkIconColor(filePath, content, span, snap))
      }

      return violations
    },

    fix(content: string, violations: Violation[]): string {
      let fixed = content
      for (const v of violations) {
        if (!v.autoFixable || !v.original || !v.replacement) continue
        fixed = fixed.replace(v.original, v.replacement)
      }
      return fixed
    },
  }
}
