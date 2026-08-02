import type { CheckModule, LayoutSnapshot, LayoutSnapshotCache, ProjectConfig, Violation } from '../types.js'
import { loadLayoutSnapshots } from '../layout-cache.js'
import { findButtonBlocks } from './dom-order.js'

// ── layout-diff ────────────────────────────────────────────────────────────────
// برخلاف dom-order/icon-direction (که rule عمومی چک می‌کنن)، این ماژول کد رو با
// facts واقعیِ همون طرح مشخص فیگما (از .claude/context/figma-layout.json) مقایسه
// می‌کنه — یعنی می‌تونه دقیقاً همون باگی رو بگیره که rule عمومی نمی‌گیره: یه المان
// خاص که تو طرح راسته ولی تو کد چپ پیاده شده (استثنا نسبت به قاعده‌ی کلی).
//
// اگه برای یه کامپوننت snapshot نباشه، صفر violation — false-positive نمی‌زنیم.
// population: STEP 2 در dev-implement (Claude موقع fetch از MCP می‌نویسه).

const EXPORT_NAME_RE = /export\s+(?:default\s+)?(?:function|const)\s+([A-Z][A-Za-z0-9]*)/g

function findExportedComponentNames(content: string): string[] {
  const names: string[] = []
  let m: RegExpExecArray | null
  EXPORT_NAME_RE.lastIndex = 0
  while ((m = EXPORT_NAME_RE.exec(content)) !== null) names.push(m[1])
  return names
}

// نیم‌قطعه‌ی return(...) اصلی هر export رو پیدا می‌کنه (heuristic ساده، نه AST کامل —
// هم‌راستا با بقیه‌ی ماژول‌ها که از string/line scan استفاده می‌کنن نه babel).
function findReturnBlock(content: string, afterIndex: number): string | null {
  const returnIdx = content.indexOf('return (', afterIndex)
  if (returnIdx === -1) return null
  let i = returnIdx + 'return ('.length
  let depth = 1
  const start = i
  for (; i < content.length && depth > 0; i++) {
    if (content[i] === '(') depth++
    else if (content[i] === ')') depth--
  }
  return content.slice(start, i - 1)
}

// اسم‌های tag/component که مستقیماً فرزند سطح اول هستن رو به ترتیب استخراج می‌کنه
// (عمق را با depth‌شمارِ '<' / '</' ردیابی می‌کنیم، فقط عمق ۱ رو نگه می‌داریم).
function topLevelChildNames(jsx: string, maxChildren = 8): string[] {
  const names: string[] = []
  const tagRe = /<\/?([A-Za-z][A-Za-z0-9.]*)/g
  let depth = 0
  let m: RegExpExecArray | null
  while ((m = tagRe.exec(jsx)) !== null) {
    const isClose = jsx[m.index + 1] === '/'
    const selfClosing = jsx.slice(m.index).match(/^<[^>]*\/>/)
    if (isClose) {
      depth--
      continue
    }
    if (depth === 1) names.push(m[1])
    if (!selfClosing) depth++
    else { /* self-closing: depth بدون تغییر، فقط اگه سطح ۱ بود قبلاً ثبت شد */ }
    if (names.length > maxChildren) break
  }
  return names
}

function normalizeAlign(v: string): 'start' | 'end' | 'center' | null {
  const s = v.replace(/["'`]/g, '').trim()
  if (s === 'start' || s === 'left') return 'start'
  if (s === 'end' || s === 'right') return 'end'
  if (s === 'center') return 'center'
  return null
}

// نگاشت semantic → فیزیکی، جهت‌آگاه (برای پیام خطا خوانا باشه)
function semanticToPhysical(v: 'start' | 'end', isRtl: boolean): 'left' | 'right' {
  if (v === 'start') return isRtl ? 'right' : 'left'
  return isRtl ? 'left' : 'right'
}

function checkTextAlign(
  filePath: string,
  content: string,
  snapshot: LayoutSnapshot,
  isRtl: boolean
): Violation[] {
  if (!snapshot.textAlign) return []
  const violations: Violation[] = []
  const lines = content.split('\n')
  const re = /textAlign[=:]\s*["'`](start|end|center|left|right)["'`]/

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue

    const m = line.match(re)
    if (!m) continue
    const actual = normalizeAlign(m[1])
    if (!actual || actual === snapshot.textAlign) continue

    const expectedPhysical = snapshot.textAlign !== 'center'
      ? semanticToPhysical(snapshot.textAlign, isRtl)
      : 'center'

    violations.push({
      file: filePath,
      line: i + 1,
      module: 'layout-diff',
      rule: 'text-align-mismatch',
      message: `textAlign="${m[1]}" مغایر با طرح فیگماست — طرح می‌گه ${snapshot.textAlign} (یعنی ${expectedPhysical})`,
      severity: 'error',
      autoFixable: true,
      original: m[0],
      replacement: m[0].replace(m[1], snapshot.textAlign!),
    })
  }
  return violations
}

function checkChildOrder(filePath: string, content: string, snapshot: LayoutSnapshot): Violation[] {
  if (!snapshot.childOrder || snapshot.childOrder.length < 2) return []
  const violations: Violation[] = []

  const names = findExportedComponentNames(content)
  for (const name of names) {
    const nameIdx = content.indexOf(name)
    const block = findReturnBlock(content, nameIdx)
    if (!block) continue

    const actualOrder = topLevelChildNames(block, snapshot.childOrder.length + 2)
    const expected = snapshot.childOrder

    // فقط وقتی هر دو مجموعه از یه‌سری اسم مشترک تشکیل شدن مقایسه کن (وگرنه احتمالاً
    // یه بخش دیگه از UI رو گرفتیم، نه اون container که snapshot براش گرفته شده).
    const overlap = actualOrder.filter(n => expected.includes(n))
    if (overlap.length < Math.min(2, expected.length)) continue

    const expectedFiltered = expected.filter(n => actualOrder.includes(n))
    const actualFiltered = actualOrder.filter(n => expected.includes(n))
    const sameOrder = expectedFiltered.every((n, idx) => n === actualFiltered[idx])

    if (!sameOrder) {
      const lineNo = content.slice(0, nameIdx).split('\n').length
      violations.push({
        file: filePath,
        line: lineNo,
        module: 'layout-diff',
        rule: 'child-order-mismatch',
        message:
          `ترتیب فرزندهای ${name} با طرح فیگما نمی‌خونه — طرح: [${expected.join(', ')}]، کد: [${actualOrder.join(', ')}]`,
        severity: 'error',
        autoFixable: false,
        fix: `ترتیب JSX رو مطابق طرح عوض کن: [${expected.join(', ')}]`,
      })
    }
  }
  return violations
}

function checkIconSide(filePath: string, content: string, snapshot: LayoutSnapshot): Violation[] {
  if (!snapshot.iconSide) return []
  const violations: Violation[] = []
  const names = findExportedComponentNames(content)

  for (const name of names) {
    const nameIdx = content.indexOf(name)
    const block = findReturnBlock(content, nameIdx)
    if (!block) continue

    const buttons = findButtonBlocks(block)
    if (buttons.length === 0) continue
    const inner = buttons[0].inner.replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

    const firstTag = inner.search(/</)
    const beforeTag = firstTag === -1 ? inner : inner.slice(0, firstTag)
    const hasLabelBeforeIcon = /[A-Za-z؀-ۿ]/.test(beforeTag)
    const hasIcon = /<[A-Z][A-Za-z]/.test(inner)
    if (!hasIcon) continue

    const actualSide: 'start' | 'end' = hasLabelBeforeIcon ? 'end' : 'start'
    if (actualSide === snapshot.iconSide) continue

    const lineNo = content.slice(0, nameIdx).split('\n').length
    violations.push({
      file: filePath,
      line: lineNo,
      module: 'layout-diff',
      rule: 'icon-side-mismatch',
      message:
        `آیکون دکمه تو ${name} سمت ${actualSide === 'start' ? 'ابتدا' : 'انتها'}ی متنه، ولی طرح فیگما می‌گه باید ${snapshot.iconSide === 'start' ? 'ابتدا' : 'انتها'} باشه`,
      severity: 'error',
      autoFixable: false,
      fix: snapshot.iconSide === 'start' ? 'آیکون رو قبل از متن بذار' : 'آیکون رو بعد از متن بذار',
    })
  }
  return violations
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
      'کد رو با facts واقعیِ طرح فیگما (ترتیب فرزند/textAlign/سمت آیکون) مقایسه می‌کنه — instance-specific، نه rule عمومی',
    supportedDirections: ['rtl', 'ltr', 'both'],

    check(filePath: string, content: string, config: ProjectConfig): Violation[] {
      const snapshots = getCache()
      if (Object.keys(snapshots).length === 0) return []

      const violations: Violation[] = []
      const names = findExportedComponentNames(content)
      const isRtl = config.direction !== 'ltr'

      for (const name of names) {
        const snapshot = snapshots[name]
        if (!snapshot) continue

        violations.push(...checkTextAlign(filePath, content, snapshot, isRtl))
        violations.push(...checkChildOrder(filePath, content, snapshot))
        violations.push(...checkIconSide(filePath, content, snapshot))
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
