// ── نگاشت جهت: فیزیکی ↔ semantic ─────────────────────────────────────────────
// تک‌منبعِ حقیقت برای ترجمه‌ی چپ/راست به start/end. هر ماژولی که درباره‌ی «سمت»
// قضاوت می‌کنه باید از همین‌جا استفاده کنه.
//
// ⚠️ باگ تاریخی که این فایل برای رفعش ساخته شد: نگاشتِ جهت‌کور
//        right → end   ·   left → start
//    این فقط در LTR درسته. در RTL دقیقاً برعکسه، و چون snapshotها semantic ذخیره
//    می‌شن، نتیجه‌ش این بود که هر قضاوتِ textAlign در پروژه‌ی RTL معکوس می‌شد —
//    هم false-negative (کد غلط «تمیز» گزارش می‌شد) و هم false-positive (کد درست
//    error می‌گرفت، با auto-fix ای که متن رو به سمت اشتباه می‌برد).

export type Semantic = 'start' | 'end' | 'center'
export type Physical = 'left' | 'right' | 'center'

export function isRtl(direction: string): boolean {
  return direction !== 'ltr'   // 'rtl' و 'both' هر دو RTL حساب می‌شن
}

/** فیزیکی (left/right) → semantic (start/end)، با در نظر گرفتن جهت. */
export function physicalToSemantic(v: Physical, rtl: boolean): Semantic {
  if (v === 'center') return 'center'
  if (rtl) return v === 'right' ? 'start' : 'end'
  return v === 'right' ? 'end' : 'start'
}

/** semantic (start/end) → فیزیکی (left/right)، برای خوانا کردن پیام خطا. */
export function semanticToPhysical(v: Semantic, rtl: boolean): Physical {
  if (v === 'center') return 'center'
  if (rtl) return v === 'start' ? 'right' : 'left'
  return v === 'start' ? 'left' : 'right'
}

/** واژه‌ی فارسی برای پیام خطا. */
export function physicalFa(v: Physical): string {
  return v === 'right' ? 'راست' : v === 'left' ? 'چپ' : 'وسط'
}

/**
 * هر مقداری که در کد برای textAlign نوشته می‌شه رو به semantic تبدیل می‌کنه.
 * مقادیر semantic (start/end) همون‌طور می‌مونن؛ مقادیر فیزیکی (left/right) با
 * جهت ترجمه می‌شن. این تمایز همون چیزیه که قبلاً وجود نداشت.
 */
export function normalizeTextAlign(raw: string, rtl: boolean): Semantic | null {
  const s = raw.replace(/["'`]/g, '').trim()
  if (s === 'center') return 'center'
  if (s === 'start') return 'start'
  if (s === 'end') return 'end'
  if (s === 'left' || s === 'right') return physicalToSemantic(s as Physical, rtl)
  return null
}

export type JustifySemantic = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
export type AlignSemantic = 'start' | 'end' | 'center' | 'stretch' | 'baseline'

/**
 * justify-content کد → semantic.
 * `flex-start`/`start` هر دو semantic اند (زیر dir=rtl خودشون flip می‌شن، پس
 * ترجمه‌ی جهتی لازم ندارن). ولی `left`/`right` فیزیکی‌ان و باید ترجمه بشن.
 */
export function normalizeJustify(raw: string, rtl: boolean): JustifySemantic | null {
  const s = raw.replace(/["'`]/g, '').trim()
  switch (s) {
    case 'flex-start': case 'start': return 'start'
    case 'flex-end': case 'end': return 'end'
    case 'center': return 'center'
    case 'space-between': case 'between': return 'between'
    case 'space-around': case 'around': return 'around'
    case 'space-evenly': case 'evenly': return 'evenly'
    case 'left': case 'right': return physicalToSemantic(s as Physical, rtl) as JustifySemantic
    default: return null
  }
}

export function normalizeAlign(raw: string, rtl: boolean): AlignSemantic | null {
  const s = raw.replace(/["'`]/g, '').trim()
  switch (s) {
    case 'flex-start': case 'start': return 'start'
    case 'flex-end': case 'end': return 'end'
    case 'center': return 'center'
    case 'stretch': return 'stretch'
    case 'baseline': return 'baseline'
    case 'left': case 'right': return physicalToSemantic(s as Physical, rtl) as AlignSemantic
    default: return null
  }
}

/**
 * رنگ رو به شکل قابل‌مقایسه نرمالایز می‌کنه.
 * در کدبیس دو شکل رایجه: توکن مستقیم (`fg.muted`) و CSS var چاکرا
 * (`var(--chakra-colors-fg-subtle)`). هر دو به `fg.subtle` تبدیل می‌شن.
 */
export function normalizeColorToken(raw: string): string {
  const s = raw.replace(/["'`]/g, '').trim()
  const varMatch = /^var\(--chakra-colors-([a-z0-9-]+)\)$/i.exec(s)
  if (varMatch) return varMatch[1].replace(/-/g, '.')
  return s
}
