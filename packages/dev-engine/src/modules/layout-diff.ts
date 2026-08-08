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

// متنِ کاملِ یک المان (از `<` تا تگِ بستهٔ متناظرش) — برای اینکه بشود فرزندهای
// مستقیمِ یک container داخلی را با topLevelChildNames شمرد، نه فقط root کامپوننت.
function extractElement(s: string, lt: number): string {
  const { end, selfClosing } = scanOpeningTag(s, lt)
  if (selfClosing) return s.slice(lt, end + 1)
  let depth = 1
  let i = end + 1
  while (i < s.length && depth > 0) {
    const next = s.indexOf('<', i)
    if (next === -1) break
    if (s[next + 1] === '/') {
      depth--
      const gt = s.indexOf('>', next)
      i = gt === -1 ? s.length : gt + 1
      if (depth === 0) return s.slice(lt, i)
      continue
    }
    const tag = /^<([A-Za-z][A-Za-z0-9.]*)/.test(s.slice(next))
    if (!tag) { i = next + 1; continue }
    const inner = scanOpeningTag(s, next)
    if (!inner.selfClosing) depth++
    i = inner.end + 1
  }
  return s.slice(lt, i)
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

const sideFa = (v: string, rtl: boolean) =>
  v === 'start' || v === 'end' ? ` (${physicalFa(semanticToPhysical(v, rtl))})` : ''

// ⚠️ محدود به تگِ بازِ **root** بلوک return — نه هر تطبیقی در کل کامپوننت.
// snapshot توصیف‌گرِ همان یک node فیگماست، پس تعمیم دادنش به همهٔ containerهای
// داخلی از پایه غلط بود: هر کامپوننت چندردیفی روی مقدار درست هم false-positive
// می‌گرفت، و نتیجه‌اش این شد که کسی فیلد را پر نکند و چک بی‌صدا خاموش بماند.
// چیدمانِ containerهای داخلی → `snap.containers` + marker (checkContainers).
function rootTagProps(content: string, span: ComponentSpan): { props: string; line: number } | null {
  const block = findReturnBlock(content, span.start, span.end)
  if (!block) return null
  const lt = block.jsx.indexOf('<')
  if (lt === -1) return null
  const { end } = scanOpeningTag(block.jsx, lt)
  return { props: block.jsx.slice(lt, end), line: lineAt(content, block.offset + lt) }
}

function checkJustify(
  filePath: string, content: string, span: ComponentSpan, snap: LayoutSnapshot, rtl: boolean
): Violation[] {
  if (!snap.justify) return []
  const root = rootTagProps(content, span)
  if (!root) return []
  const m = /\b(justify|justifyContent)=\s*\{?\s*["'`]([a-z-]+)["'`]/.exec(root.props)
  if (!m) return []
  const actual = normalizeJustify(m[2], rtl)
  if (!actual || actual === snap.justify) return []

  return [{
    file: filePath, line: root.line,
    module: 'layout-diff', rule: 'justify-mismatch',
    message: `${m[1]}="${m[2]}" روی root ${span.name} یعنی ${actual}${sideFa(actual, rtl)}، ولی طرح ${snap.justify}${sideFa(snap.justify, rtl)} می‌خواد`,
    severity: 'error', autoFixable: true,
    original: m[0],
    replacement: m[0].replace(m[2], snap.justify),
  }]
}

function checkAlign(
  filePath: string, content: string, span: ComponentSpan, snap: LayoutSnapshot, rtl: boolean
): Violation[] {
  if (!snap.align) return []
  const root = rootTagProps(content, span)
  if (!root) return []
  const m = /\b(align|alignItems)=\s*\{?\s*["'`]([a-z-]+)["'`]/.exec(root.props)
  if (!m) return []
  const actual = normalizeAlign(m[2], rtl)
  if (!actual || actual === snap.align) return []

  return [{
    file: filePath, line: root.line,
    module: 'layout-diff', rule: 'align-mismatch',
    message: `${m[1]}="${m[2]}" روی root ${span.name} یعنی ${actual}${sideFa(actual, rtl)}، ولی طرح ${snap.align}${sideFa(snap.align, rtl)} می‌خواد`,
    severity: 'error', autoFixable: true,
    original: m[0],
    replacement: m[0].replace(m[2], snap.align),
  }]
}

// ── containerهای داخلی، anchor شده با prop ────────────────────────────────────
// `data-layout="ComponentName.containerName"` روی خودِ تگِ container.
//
// چرا prop و نه کامنت: anchor باید در **هر دو لایه** پیدا شود — این ماژول متن کد
// را می‌خواند، ولی verify-render دامپِ DOM را. کامنت در DOM وجود ندارد، پس با
// کامنت هرگز نمی‌شد همان container را در رندر پیدا کرد و هر لایه anchor جدا
// می‌خواست. `data-layout` هم در source قابل‌regex است هم در DOM قابل‌query —
// یک مکانیزم، دو لایه، یک زبان. (سود جانبی: prop برخلاف `{/* */}` داخل شاخهٔ
// ternary هم parse می‌شود.)
//
// نامِ کامل (Component.container) لازم است چون دامپِ DOM اسم کامپوننت React را
// نمی‌داند؛ و همین باعث می‌شود prefix هم قابل‌اعتبارسنجی باشد (پایین).
// جزئیاتِ «چرا اصلاً container-level» در types.ts (ContainerLayout).
const ANCHOR_RE = /data-layout=\s*["'`]([A-Za-z][A-Za-z0-9_]*)\.([A-Za-z][A-Za-z0-9_]*)["'`]/g

function checkContainers(
  filePath: string, content: string, span: ComponentSpan, snap: LayoutSnapshot, rtl: boolean
): Violation[] {
  const spec = snap.containers
  const region = content.slice(span.start, span.end)
  const seen = new Set<string>()
  const out: Violation[] = []

  ANCHOR_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = ANCHOR_RE.exec(region)) !== null) {
    const [, prefix, name] = m
    const line = lineAt(content, span.start + m.index)

    // prefix باید اسم کامپوننتِ در‌بر‌گیرنده باشه — وگرنه verify-render دنبال
    // کلیدی می‌گرده که در snapshot وجود نداره و بی‌صدا هیچی مقایسه نمی‌کنه.
    if (prefix !== span.name) {
      out.push({
        file: filePath, line,
        module: 'layout-diff', rule: 'container-name-mismatch',
        message: `data-layout="${prefix}.${name}" داخل ${span.name} است — prefix باید «${span.name}» باشه وگرنه هیچ لایه‌ای این container را پیدا نمی‌کند`,
        severity: 'error', autoFixable: true,
        original: m[0],
        replacement: m[0].replace(`${prefix}.${name}`, `${span.name}.${name}`),
      })
      continue
    }
    seen.add(name)
    const want = spec?.[name]

    // anchor در کد ولی هیچ facts ای در snapshot → صریح بگو، نه سکوت.
    if (!want) {
      out.push({
        file: filePath, line,
        module: 'layout-diff', rule: 'container-snapshot-missing',
        message: `data-layout="${prefix}.${name}" در کد هست ولی snapshot براش چیزی نداره — این container بی‌چک می‌مونه`,
        severity: 'warning', autoFixable: false,
        fix: `dev-engine layout-sync . --set ${span.name} --data '{"containers":{"${name}":{"justify":"start"}}}'`,
      })
      continue
    }

    // خودِ تگِ حاملِ attribute — پس `<` قبل از آن، نه بعد از آن.
    const lt = region.lastIndexOf('<', m.index)
    if (lt === -1) continue
    const { end } = scanOpeningTag(region, lt)
    const props = region.slice(lt, end)
    const tagLine = lineAt(content, span.start + lt)

    const checks: Array<[keyof typeof want, RegExp, (v: string, r: boolean) => string | null]> = [
      ['justify', /\b(?:justify|justifyContent)=\s*\{?\s*["'`]([a-z-]+)["'`]/, normalizeJustify],
      ['align', /\b(?:align|alignItems)=\s*\{?\s*["'`]([a-z-]+)["'`]/, normalizeAlign],
      ['textAlign', /\btextAlign=\s*\{?\s*["'`]([a-z-]+)["'`]/, normalizeTextAlign],
    ]

    if (want.childOrder && want.childOrder.length >= 2) {
      const el = extractElement(region, lt)
      const actual = topLevelChildNames(el, want.childOrder.length + 4)
      const expected = want.childOrder
      const overlap = actual.filter(n => expected.includes(n))
      if (overlap.length < Math.min(2, expected.length)) {
        out.push({
          file: filePath, line: tagLine,
          module: 'layout-diff', rule: 'snapshot-stale',
          message: `childOrder برای container «${name}» با هیچ فرزند واقعی نمی‌خونه — طرح: [${expected.join(', ')}]، کد: [${actual.join(', ')}] → چک اجرا نشد`,
          severity: 'warning', autoFixable: false,
          fix: 'اسم فرزندها را با تگ‌های واقعی کد هم‌راستا کن',
        })
      } else {
        const ef = expected.filter(n => actual.includes(n))
        const af = actual.filter(n => expected.includes(n))
        if (!ef.every((n, i) => n === af[i])) {
          out.push({
            file: filePath, line: tagLine,
            module: 'layout-diff', rule: 'child-order-mismatch',
            message: `ترتیب فرزندهای container «${name}» (${span.name}) آینه‌ایه — طرح: [${expected.join(', ')}]، کد: [${af.join(', ')}]. اولین فرزند DOM = راست‌ترین در RTL`,
            severity: 'error', autoFixable: false,
            fix: `ترتیب JSX داخل این container را به [${expected.join(', ')}] عوض کن`,
          })
        }
      }
    }

    for (const [key, re, normalize] of checks) {
      const expected = want[key]
      if (!expected || typeof expected !== 'string') continue
      const pm = re.exec(props)
      // prop غایب → مقدار default اعمال می‌شه. برای justify/align دیفالت فلکس
      // `start` است، پس فقط وقتی طرح چیزِ دیگری می‌خواهد ایراد است.
      const actual = pm ? normalize(pm[1], rtl) : (key === 'textAlign' ? null : 'start')
      if (!actual || actual === expected) continue

      out.push({
        file: filePath, line: tagLine,
        module: 'layout-diff', rule: `${key === 'textAlign' ? 'text-align' : key}-mismatch`,
        message: `${key} در container «${name}» (${span.name}) ${actual}${sideFa(actual, rtl)} است، ولی طرح ${expected}${sideFa(expected, rtl)} می‌خواد`,
        severity: 'error', autoFixable: pm !== null,
        ...(pm ? { original: pm[0], replacement: pm[0].replace(pm[1], expected) } : {}),
        ...(pm ? {} : { fix: `${key}="${expected}" را صریح روی این تگ بذار (الان دیفالت ${actual} می‌گیره)` }),
      })
    }
  }

  // snapshot facts دارد ولی marker اش در کد نیست → یعنی چک اجرا نشد. سکوت ممنوع.
  for (const name of Object.keys(spec ?? {})) {
    if (seen.has(name)) continue
    out.push({
      file: filePath, line: lineAt(content, span.start),
      module: 'layout-diff', rule: 'container-anchor-missing',
      message: `snapshot برای container «${name}» در ${span.name} facts دارد ولی anchor «data-layout="${span.name}.${name}"» در کد نیست — این چک بی‌صدا اجرا نشد`,
      severity: 'warning', autoFixable: false,
      fix: `prop data-layout="${span.name}.${name}" را روی همان container بگذار`,
    })
  }

  return out
}

// ── سلامتِ خودِ snapshot ───────────────────────────────────────────────────────
// «۰ issue» باید یعنی «چک شد و تمیز بود»، نه «هیچی چک نشد». هر حالتی که باعث
// خاموشیِ بی‌صدای چک می‌شود از این‌جا صدا در می‌آورد.
function checkSnapshotHealth(
  filePath: string, content: string, span: ComponentSpan, snap: LayoutSnapshot
): Violation[] {
  const out: Violation[] = []
  const line = lineAt(content, span.start)

  const hasAxisFacts = snap.justify || snap.align || (snap.containers && Object.keys(snap.containers).length > 0)
  if (snap.layoutMode === 'HORIZONTAL' && !hasAxisFacts) {
    out.push({
      file: filePath, line,
      module: 'layout-diff', rule: 'snapshot-incomplete',
      message: `${span.name}: layoutMode=HORIZONTAL ولی نه justify/align نه containers — چیدمان محورها اصلاً چک نمی‌شه`,
      severity: 'warning', autoFixable: false,
      fix: `justify/align را از طرح بخوان و بنویس؛ برای containerهای داخلیِ با intent متفاوت از containers + marker استفاده کن`,
    })
  }

  // childOrder ای که با هیچ فرزند واقعی همپوشانی ندارد = چکِ مرده. قبلاً همین
  // حالت بی‌صدا `[]` برمی‌گرداند (اسم‌های خیالی مثل "Title"/"Code" در برابر
  // فرزندهای واقعیِ "Table.Root") — یعنی گزارشِ تمیزِ کاملاً توخالی.
  if (snap.childOrder && snap.childOrder.length >= 2) {
    const block = findReturnBlock(content, span.start, span.end)
    if (block) {
      const actual = topLevelChildNames(block.jsx, snap.childOrder.length + 4)
      const overlap = actual.filter(n => snap.childOrder!.includes(n))
      if (overlap.length < Math.min(2, snap.childOrder.length)) {
        out.push({
          file: filePath, line,
          module: 'layout-diff', rule: 'snapshot-stale',
          message: `childOrder برای ${span.name} با هیچ فرزند واقعی نمی‌خونه — طرح: [${snap.childOrder.join(', ')}]، کد: [${actual.join(', ')}] → این چک بی‌صدا اجرا نشد`,
          severity: 'warning', autoFixable: false,
          fix: `childOrder را با اسم واقعی تگ‌های سطح‌اولِ کد بنویس، یا اگر فرزندها generic اند (Flex/Box) حذفش کن و از containers + marker استفاده کن`,
        })
      }
    }
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
        violations.push(...checkContainers(filePath, content, span, snap, rtl))
        violations.push(...checkChildOrder(filePath, content, span, snap))
        violations.push(...checkIconSide(filePath, content, span, snap))
        violations.push(...checkIconColor(filePath, content, span, snap))
        violations.push(...checkSnapshotHealth(filePath, content, span, snap))
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
