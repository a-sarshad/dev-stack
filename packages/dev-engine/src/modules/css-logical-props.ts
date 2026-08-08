import type { CheckModule, ProjectConfig, Violation } from '../types.js'
import { isRtl, physicalToSemantic, semanticToPhysical, physicalFa } from '../direction.js'

// ── نگاشت فیزیکی → منطقی ─────────────────────────────────────────────────────
// ⚠️ باگ تاریخی (کل این فایل قبلاً به همین شکل بود): هر ورودی مستقیم و ثابت
// right→InlineEnd / left→InlineStart نوشته می‌شد. طبق MDN (margin-inline-end
// docs): "if you were using a horizontal-tb writing mode with a right-to-left
// text direction then margin-inline-start would be the same as margin-right" —
// یعنی در RTL: inline-start = right، inline-end = left. نگاشت ثابت فقط در LTR
// درسته؛ برای این پروژه (RTL) دقیقاً برعکس بود.
// خودِ CLAUDE.md هم با خودش تناقض داشت: «insetInlineEnd not right» (قانون کلی،
// اشتباه) در برابر «insetInlineStart در RTL به right تبدیل می‌شه» (gotcha واقعی،
// تست‌شده با getBoundingClientRect، درست).
//
// فیکس: بجای ۲۰+ جفت hardcoded، فقط «کدوم اسم فیزیکی چه جفت منطقی‌ای داره» رو
// نگه می‌داریم؛ سمت واقعی (Start/End) در لحظه‌ی چک از physicalToSemantic
// (direction.ts — همون single source of truth که layout-diff هم ازش استفاده
// می‌کنه) محاسبه می‌شه، بر اساس config.direction همون فایل (چون ProjectConfig
// امکان override جهت per-path هم داره — یه جدول ثابت اون رو هم می‌شکست).

type Side = 'Start' | 'End'

function semSide(physical: 'right' | 'left', rtl: boolean): Side {
  return physicalToSemantic(physical, rtl) === 'start' ? 'Start' : 'End'
}

interface PropPair {
  right: string
  left: string
  logical: (side: Side) => string
}

// Chakra shorthand + CSS-in-JS property names که جفت فیزیکی راست/چپ دارن.
const SIMPLE_PAIRS: PropPair[] = [
  { right: 'mr=', left: 'ml=', logical: s => (s === 'Start' ? 'ms=' : 'me=') },
  { right: 'pr=', left: 'pl=', logical: s => (s === 'Start' ? 'ps=' : 'pe=') },
  { right: 'borderRightWidth', left: 'borderLeftWidth', logical: s => `borderInline${s}Width` },
  { right: 'borderRightColor', left: 'borderLeftColor', logical: s => `borderInline${s}Color` },
  { right: 'borderRight', left: 'borderLeft', logical: s => `borderInline${s}` },
  { right: 'marginRight', left: 'marginLeft', logical: s => `marginInline${s}` },
  { right: 'paddingRight', left: 'paddingLeft', logical: s => `paddingInline${s}` },
  { right: 'insetRight', left: 'insetLeft', logical: s => `inset${s}` },
  { right: 'right:', left: 'left:', logical: s => `insetInline${s}:` },
]

// گوشه‌های border-radius: محور block (بالا/پایین) با جهت flip نمی‌شه (Top =
// همیشه block-start، در RTL هم همینه چون فقط inline axis از dir تأثیر می‌گیره)؛
// فقط محور inline (چپ/راست) به جهت وابسته‌ست.
interface RadiusCorner {
  physical: string
  blockSide: Side
  inlinePhysical: 'right' | 'left'
}
const RADIUS_CORNERS: RadiusCorner[] = [
  { physical: 'borderTopRightRadius', blockSide: 'Start', inlinePhysical: 'right' },
  { physical: 'borderTopLeftRadius', blockSide: 'Start', inlinePhysical: 'left' },
  { physical: 'borderBottomRightRadius', blockSide: 'End', inlinePhysical: 'right' },
  { physical: 'borderBottomLeftRadius', blockSide: 'End', inlinePhysical: 'left' },
]

// textAlign: فرم prop-value است (نه اسم property)، هم style-object
// (`textAlign: "right"`) هم JSX prop (`textAlign="right"`) رو می‌گیره.
const TEXT_ALIGN_RE = /textAlign(\s*[:=]\s*)\{?\s*(["'`])(right|left)\2/g

// ── یک idiom برای چیدمان محورها ────────────────────────────────────────────────
// ⚠️ چرا این rule وجود داره — سه incident در Vitrina (CampaignCard 2026-08-03،
// NewCampaignDialog 2026-08-03، DiscountCodesTable 2026-08-08): همه یک الگو.
//
// `flex-start`/`flex-end` از نظر CSS **درست و جهت‌آگاه** ان — دقیقاً مثل
// `start`/`end`. مشکل رفتاری نیست، مشکل **اسم** است: کلمهٔ «end» با آموزشِ
// LTR-first یعنی «راست»، و در RTL یعنی چپ. پس هر نوشتنِ آن یک flip ذهنیِ دستی
// می‌خواهد که در ۲۶۰+ سایت قابل‌اتکا نیست. بدتر: هر دو idiom هم‌زمان زنده بودند،
// پس خواندنِ یک sibling با intent متفاوت به‌عنوان الگو، باگ را تکثیر می‌کرد.
// (نمونهٔ واقعی: idiom درستِ `justify="flex-end"` ستون عملیاتِ BulkSmsHistoryTable
// روی ۴ سلولِ DiscountCodesTable کپی شد که نیازشان برعکس بود.)
//
// فیکس: یک idiom، `start`/`end` — همان واژگانی که snapshotها، layout-diff و خودِ
// CLAUDE.md با آن حرف می‌زنند. آن‌وقت «چه سمتی؟» یک فکتِ واحدِ یادگرفتنی است
// (RTL: start=راست)، نه یک ترجمهٔ per-site.
//
// ⚠️ تنها حالتی که `start` ≠ `flex-start`: محورِ معکوس (`row-reverse`/
// `column-reverse`) — `flex-*` از جهتِ معکوس‌شده تبعیت می‌کند، `start` از
// writing-mode. پس خطوطی که reverse دارند skip می‌شوند.
const FLEX_ALIGN_PROPS = 'justify|justifyContent|justifySelf|align|alignItems|alignSelf|alignContent|placeItems|placeContent'
const FLEX_VALUE_RE = new RegExp(`\\b(${FLEX_ALIGN_PROPS})(\\s*[:=]\\s*[^\\n]*?)(["'\`])(flex-start|flex-end)\\3`, 'g')

// مقادیر واقعاً فیزیکیِ همین propها — این یکی برخلاف بالا یک باگ واقعی است،
// چون `left`/`right` جهت‌کورند و در RTL اصلاً flip نمی‌شوند.
const PHYSICAL_ALIGN_RE = new RegExp(`\\b(${FLEX_ALIGN_PROPS})(\\s*[:=]\\s*[^\\n]*?)(["'\`])(right|left)\\3`, 'g')

export const cssLogicalPropsModule: CheckModule = {
  id: 'css-logical-props',
  name: 'CSS Logical Properties',
  description: 'Detects physical CSS direction props that should be logical',
  supportedDirections: ['rtl', 'ltr', 'both'],

  check(filePath: string, content: string, config: ProjectConfig): Violation[] {
    const violations: Violation[] = []
    const lines = content.split('\n')
    const rtl = isRtl(config.direction)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*') || trimmed.startsWith('{/*')) continue

      for (const pair of SIMPLE_PAIRS) {
        for (const [physical, physSide] of [[pair.right, 'right'], [pair.left, 'left']] as const) {
          if (!line.includes(physical)) continue
          const logical = pair.logical(semSide(physSide, rtl))
          violations.push({
            file: filePath,
            line: i + 1,
            module: 'css-logical-props',
            rule: 'use-logical-props',
            message: `Physical prop "${physical.replace(/[=:]/g, '')}" — use "${logical.replace(/[=:]/g, '')}" instead (direction: ${config.direction})`,
            severity: 'warning',
            autoFixable: true,
            original: physical,
            replacement: logical,
          })
        }
      }

      for (const corner of RADIUS_CORNERS) {
        if (!line.includes(corner.physical)) continue
        const hasColon = line.includes(corner.physical + ':')
        const inlineSide = semSide(corner.inlinePhysical, rtl)
        const logicalBase = `border${corner.blockSide}${inlineSide}Radius`
        violations.push({
          file: filePath,
          line: i + 1,
          module: 'css-logical-props',
          rule: 'use-logical-props',
          message: `Physical prop "${corner.physical}" — use "${logicalBase}" instead (direction: ${config.direction})`,
          severity: 'warning',
          autoFixable: true,
          original: corner.physical + (hasColon ? ':' : ''),
          replacement: logicalBase + (hasColon ? ':' : ''),
        })
      }

      // textAlign: مقدار جایگزین وابسته به config.direction است، پس نمی‌تونه
      // یک entry ثابت باشه — از physicalToSemantic محاسبه می‌شه.
      TEXT_ALIGN_RE.lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = TEXT_ALIGN_RE.exec(line)) !== null) {
        const [full, , quote, physicalVal] = m
        const semantic = physicalToSemantic(physicalVal as 'right' | 'left', rtl)
        violations.push({
          file: filePath,
          line: i + 1,
          module: 'css-logical-props',
          rule: 'use-logical-props',
          message: `Physical prop "textAlign: ${physicalVal}" — use "textAlign: ${semantic}" instead (direction: ${config.direction})`,
          severity: 'warning',
          autoFixable: true,
          original: full,
          replacement: full.replace(`${quote}${physicalVal}${quote}`, `${quote}${semantic}${quote}`),
        })
      }

      // یک idiom: flex-start/flex-end → start/end. جزئیات «چرا» بالای FLEX_VALUE_RE.
      if (!/\b(?:row|column)-reverse\b/.test(line)) {
        FLEX_VALUE_RE.lastIndex = 0
        while ((m = FLEX_VALUE_RE.exec(line)) !== null) {
          const [full, prop, , quote, value] = m
          const semantic = value === 'flex-start' ? 'start' : 'end'
          // ⚠️ original باید کلِ match باشه نه فقط مقدار — چون fix() از replaceAll
          // استفاده می‌کنه و مثلاً original="right" کل فایل رو خراب می‌کرد
          // (placement="right" روی Tooltip، textAlign="right"، …).
          violations.push({
            file: filePath,
            line: i + 1,
            module: 'css-logical-props',
            rule: 'one-align-idiom',
            message: `${prop}="${value}" — «${semantic}» بنویس. رفتار یکیه، ولی «${value}» به‌غلط فیزیکی خوانده می‌شه (در ${config.direction} مقدار end یعنی ${physicalFa(semanticToPhysical('end', rtl))}). سه incident از همین اسم آمده`,
            severity: 'error',
            autoFixable: true,
            original: full,
            replacement: full.replace(`${quote}${value}${quote}`, `${quote}${semantic}${quote}`),
          })
        }
      }

      // مقدار فیزیکیِ واقعی روی propهای چیدمان — در RTL flip نمی‌شه، باگ واقعیه.
      PHYSICAL_ALIGN_RE.lastIndex = 0
      while ((m = PHYSICAL_ALIGN_RE.exec(line)) !== null) {
        const [full, prop, , quote, physicalVal] = m
        const semantic = physicalToSemantic(physicalVal as 'right' | 'left', rtl)
        violations.push({
          file: filePath,
          line: i + 1,
          module: 'css-logical-props',
          rule: 'one-align-idiom',
          message: `${prop}="${physicalVal}" مقدار فیزیکیه و با جهت flip نمی‌شه — «${semantic}» بنویس (direction: ${config.direction})`,
          severity: 'error',
          autoFixable: true,
          original: full,
          replacement: full.replace(`${quote}${physicalVal}${quote}`, `${quote}${semantic}${quote}`),
        })
      }
    }

    return violations
  },

  fix(content: string, violations: Violation[]): string {
    let fixed = content
    for (const v of violations) {
      if (!v.original || !v.replacement) continue
      fixed = fixed.replaceAll(v.original, v.replacement)
    }
    return fixed
  },
}
