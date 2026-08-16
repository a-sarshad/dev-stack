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

