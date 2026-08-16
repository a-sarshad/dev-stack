import type { CheckModule, ProjectConfig, Violation } from '../types.js'
import { isRtl, semanticToPhysical, physicalFa } from '../direction.js'

// ── direction-audit — ماژول درمانی (opt-in، گزارش‌محض) ────────────────────────
//
// چه چیزی را می‌گیرد که بقیه نمی‌گیرند:
//   `css-logical-props` و `one-align-idiom` فقط می‌گویند «فیزیکی ننویس». کدی که
//   همه‌جا `start`/`end` دارد می‌تواند کاملاً معکوس باشد و همهٔ چک‌ها سبز بمانند —
//   دقیقاً همان چیزی که در چهار incident واقعی رخ داد (CampaignCard 1404/05/12،
//   NewCampaignDialog همان روز، DiscountCodesTable 05/17، DiscountCodeNew 05/09).
//   این ماژول برای **کد موجود** است: فهرست نامزدهای بازبینی می‌سازد، نه خطا.
//
// منطق: در یک رابط RTL، `end` یعنی چپ — که استثناست نه قاعده. پس هر `end` روی محور
// افقی یک **تصمیم آگاهانه** بوده که می‌توانسته ترجمهٔ معکوس باشد. (در LTR برعکس:
// `end` یعنی راست و باز هم همان استدلال برقرار است، فقط سمتش عوض می‌شود.)
//
// ⚠️ سه قید طراحی که عمداً رعایت شده‌اند:
//
//   ۱. **هرگز auto-fix.** درست بودن `end` فقط با دیدن طرح معلوم می‌شود. کامنت بالای
//      `direction.ts` همین را مستند می‌کند: auto-fixِ جهت قبلاً «متن رو به سمت اشتباه
//      می‌برد». پس نه `fix()` دارد و نه هیچ violationـش `autoFixable` است.
//
//   ۲. **opt-in، نه default.** روی یک کدبیس متوسط ~۱۰۰ نامزد می‌دهد؛ اگر در اجرای
//      عادی `dev-engine .` بیاید، errorهای واقعی را زیر نویز دفن می‌کند. فقط با
//      `dev-engine . --modules direction-audit` اجرا می‌شود (فیلتر در engine.ts).
//
//   ۳. **severity هرگز error.** خروجی این ماژول «مشکوک» است نه «غلط»؛ بیشترِ
//      نامزدها مشروع‌اند. error کردنشان یعنی کاربر یاد می‌گیرد نادیده بگیرد.
//
// رتبه‌بندی: نامزدی که کامنت توضیحی ندارد → `warning`. نامزدی که دارد → `info`.
// این مستقیماً قرارداد پروژه را enforce می‌کند (language.md § «دابل-فلیپ»: هر
// استثنای جهت باید کامنت داشته باشد، وگرنه بازبینِ بعدی به‌عنوان باگ «فیکس»ش می‌کند).

// propهایی که مقدارشان روی محور **افقی** می‌نشیند، به تفکیک جهتِ flex والد.
// (row پیش‌فرض است؛ در column محورها جا‌به‌جا می‌شوند.)
const HORIZONTAL_IN_ROW = ['justify', 'justifyContent']
const HORIZONTAL_IN_COLUMN = ['align', 'alignItems', 'alignSelf']
// همیشه افقی، مستقل از جهت flex
const ALWAYS_HORIZONTAL = ['textAlign']

/** آیا این تگِ باز، container ستونی است؟ */
function isColumn(openTag: string): boolean {
  return /(?:flex)?[Dd]irection=(?:["'`]column|\{[^}]*column)/.test(openTag)
}

/**
 * تگ‌های بازِ JSX را با اسکنِ آگاه به quote/brace پیدا می‌کند تا arrow function و
 * propهای چندخطی ساختار را نشکنند. (همان idiom `findButtonBlocks` در dom-order.)
 */
function findOpenTags(content: string): { tag: string; index: number }[] {
  const out: { tag: string; index: number }[] = []
  let idx = 0
  while ((idx = content.indexOf('<', idx)) !== -1) {
    if (!/[A-Za-z]/.test(content[idx + 1] || '')) { idx++; continue }
    let i = idx + 1
    let depth = 0
    let quote = ''
    for (; i < content.length; i++) {
      const c = content[i]
      if (quote) { if (c === quote) quote = ''; continue }
      if (c === '"' || c === "'" || c === '`') { quote = c; continue }
      else if (c === '{') depth++
      else if (c === '}') depth--
      else if (c === '>' && depth === 0) break
      else if (c === '<' && depth === 0) break // تگ ناقص — رها کن
    }
    if (i >= content.length || content[i] !== '>') { idx++; continue }
    out.push({ tag: content.slice(idx, i + 1), index: idx })
    idx = i + 1
  }
  return out
}

// کامنتی که واقعاً دربارهٔ **جهت** حرف می‌زند — نه هر کامنتی.
// ⚠️ نسخهٔ اول این تابع «هر کامنت در ۳ خط بالا» را قبول می‌کرد و روی یک کدبیس
//    خوب‌کامنت‌شده تقریباً همه‌چیز «توضیح‌دار» شد → سیگنال رتبه‌بندی نابود.
//    الان باید کلیدواژهٔ جهت داشته باشد، وگرنه کامنت ربطی به این تصمیم ندارد.
const DIRECTION_WORDS =
  /(راست|چپ|جهت|آینه|RTL|LTR|rightmost|leftmost|right|left|trailing|leading|start|end|dir=|طرح|figma|فیگما)/i

/** آیا این المان توضیحِ جهت‌دار دارد؟ کامنت در ۳ خط بالا یا انتهای همان خط. */
function hasExplanation(lines: string[], lineIdx: number): boolean {
  const commentOn = (raw: string): boolean => {
    const m = raw.match(/(?:\/\/|\/\*|\{\/\*|^\s*\*)(.*)$/)
    return m ? DIRECTION_WORDS.test(m[1]) : false
  }
  if (commentOn(lines[lineIdx] || '')) return true
  for (let i = Math.max(0, lineIdx - 3); i < lineIdx; i++) {
    if (commentOn(lines[i] || '')) return true
  }
  return false
}

export const directionAuditModule: CheckModule = {
  id: 'direction-audit',
  name: 'Direction Audit',
  description:
    'گزارش‌محض (opt-in): نامزدهای جهت‌معکوس در کد موجود — هر `end` روی محور افقی که باید با طرح تطبیق داده شود',
  supportedDirections: ['rtl', 'ltr', 'both'],

  check(filePath: string, content: string, config: ProjectConfig): Violation[] {
    const violations: Violation[] = []
    const lines = content.split('\n')
    const rtl = isRtl(config.direction)
    // `end` یعنی کدام سمتِ فیزیکی؟ RTL → چپ · LTR → راست
    const endSideFa = physicalFa(semanticToPhysical('end', rtl))

    for (const { tag, index } of findOpenTags(content)) {
      const lineIdx = content.slice(0, index).split('\n').length - 1
      const trimmed = (lines[lineIdx] || '').trim()
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue

      const column = isColumn(tag)
      const horizontalProps = [
        ...ALWAYS_HORIZONTAL,
        ...(column ? HORIZONTAL_IN_COLUMN : HORIZONTAL_IN_ROW),
      ]

      for (const prop of horizontalProps) {
        // مقدار ساده ("end") یا داخل responsive object ({ base: 'start', md: 'end' })
        const re = new RegExp(`\\b${prop}=(?:["'\`]end["'\`]|\\{[^}]*["'\`]end["'\`][^}]*\\})`)
        if (!re.test(tag)) continue

        const explained = hasExplanation(lines, lineIdx)
        const axis = ALWAYS_HORIZONTAL.includes(prop)
          ? ''
          : column
            ? ' (روی container ستونی → محور افقی)'
            : ' (روی ردیف → محور افقی)'

        violations.push({
          file: filePath,
          line: lineIdx + 1,
          module: 'direction-audit',
          rule: explained ? 'end-usage-documented' : 'end-usage-unexplained',
          message:
            `\`${prop}="end"\`${axis} → یعنی «${endSideFa}». ` +
            (explained
              ? 'کامنت توضیحی دارد — با طرح تطبیق بده و رد شو.'
              : '**بدون کامنت توضیحی.** با screenshot طرح تطبیق بده؛ اگر درست است کامنت بگذار، وگرنه به `start` برگردان.'),
          severity: explained ? 'info' : 'warning',
          autoFixable: false,
          fix: 'دستی: screenshot طرح را ببین. هرگز auto-fix نکن — سمت درست فقط از طرح معلوم می‌شود.',
        })
      }
    }

    return violations
  },

  // عمداً بدون fix() — بخش «قید ۱» بالا را بخوان.
}
