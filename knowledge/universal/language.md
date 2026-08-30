# Language & Direction — مفاهیم پایه
> universal — مستقل از design system
> updated: 2026-08-11
> ⬅️ **جایگزین:** `rtl-concepts.md` + `multilang-concepts.md` (هر دو در این فایل ادغام شدن)
> 📍 **منبع canonical جهت.** `CLAUDE.md` پروژه‌ها، skill `dev-implement` و `dev-engine`
> همگی باید به این فایل ارجاع بدهند، نه کپی کنند. تغییر قانون جهت = فقط اینجا.

---

## زبان‌های RTL

فارسی، عربی، عبری، اردو
در RTL:
- متن از راست شروع می‌شه
- layout از راست به چپ جاریه
- اولین DOM child = rightmost visually

---

## HTML Setup

```html
<!-- RTL-only -->
<html dir="rtl" lang="fa">

<!-- LTR-only -->
<html dir="ltr" lang="en">
```

این کافیه برای cascade — همه child elements ارث می‌برن.

---

## LanguageConfig Type

```ts
type LanguageConfig = {
  locale: string        // 'fa' | 'ar' | 'en' | 'de' | ...
  dir: 'rtl' | 'ltr'
  font: string          // 'Vazirmatn' | 'Inter' | ...
}
```

### Locale Presets

| locale | dir | font |
|--------|-----|------|
| `fa` | `rtl` | `Vazirmatn` |
| `ar` | `rtl` | `Vazirmatn` یا `Cairo` |
| `en` | `ltr` | `Inter` |
| `de` | `ltr` | `Inter` |

fallback برای locale ناشناخته: `ltr` + `Inter`

---

## Font Loading

```css
/* فارسی / عربی */
@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap');

/* انگلیسی */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

---

## Dynamic Direction Switch (runtime)

```ts
// وقتی locale در runtime عوض می‌شه
document.documentElement.setAttribute('dir', config.dir)
document.documentElement.setAttribute('lang', config.locale)
document.documentElement.style.fontFamily = config.font
```

---

## Logical CSS Properties

به جای physical (left/right) از logical استفاده کن — خودشون با direction adapt می‌شن.
ترجمه **دو گام** دارد و گام دوم جهت‌وابسته است. یکی‌شان را جا بیندازی، نتیجه برعکس می‌شود.

### گام ۱ — خانوادهٔ property (جهت‌مستقل)

| Physical ❌ | Logical ✅ |
|------------|-----------|
| `margin-left` / `margin-right` | `margin-inline-start` / `margin-inline-end` |
| `padding-left` / `padding-right` | `padding-inline-start` / `padding-inline-end` |
| `border-left` / `border-right` | `border-inline-start` / `border-inline-end` |
| `left:` / `right:` | `inset-inline-start` / `inset-inline-end` |
| `text-align: left` / `right` | `text-align: start` / `end` |
| `flex-start` / `flex-end` | `start` / `end` |

### گام ۲ — کدام سمت؟ (جهت‌وابسته)

```
RTL:   راست = start   ·   چپ  = end
LTR:   چپ  = start   ·   راست = end
```

> ⚠️ **نگاشت کورِ `left→start` و `right→end` فقط در LTR درست است.**
> در RTL دقیقاً برعکس است. این تک‌سطری‌ترین علتِ باگ‌های جهت‌معکوس است —
> مکانیزم کاملش در بخش «دابل-فلیپ» پایین.

### استثنا — centering

فرمول `left: 50%` + `transform: translateX(-50%)` **فیزیکی و جهت‌مستقل** است؛ اگر
`left` را logical کنی، در RTL به `right` تبدیل می‌شود و عنصر از وسط پرت می‌شود.
اینجا `left` فیزیکی بماند. راه تمیزترِ ترجیحی وقتی عرض باید fill بماند: به‌جای
`left + transform`، هر دو `inset-inline-start` و `inset-inline-end` را با مقدار
**یکسان** بده — چون دو طرف برابرند، منطقی/فیزیکی فرقی نمی‌کند.

---

## DOM Order = Visual Order

در RTL، flex container عناصر رو از راست می‌چینه:
```
DOM: [A] [B] [C]
RTL visual: C | B | A
```

**قانون:** اولین فرزند DOM = راست‌ترین عنصر بصری.

**⚠️ این قانون بازگشتی است.** برای *هر* container افقی جداگانه اعمالش کن — نه فقط
ردیف بیرونی. یک ردیف بیرونیِ درست می‌تواند ردیف‌های داخلیِ معکوس داشته باشد و
چون کل بلوک سرجایش است، به چشم نمی‌آید.

```
۱. به طرح نگاه کن → راست‌ترین المان = اولین فرزند JSX
۲. برای هر container افقیِ داخلِ آن تکرار کن
۳. با preview مقایسه کن
```

**استثنا — namespace componentها.** کامپوننت‌هایی که خودشان `dir` ست می‌کنند
(Table، Select، Menu، Pagination، Steps، Tabs در اکثر DSها) داخلشان reorder نکن؛
خودشان flip می‌کنند و دستکاری = فلیپ دوم. قانون فقط برای container خام
(`div`/`Box`/`Flex`/`Grid`) است.

**هرگز `row-reverse`.** اگر ترتیب غلط است، DOM را درست کن نه CSS را. `row-reverse`
زیر `dir=rtl` یک فلیپ روی فلیپ است و ترتیب focus/tab را هم از ترتیب بصری جدا می‌کند.

**سه استثنای مجاز برای «آیکون بعد از متن»:** آیکون در طرح واقعاً سمت پایانی باشد
(دکمهٔ «ادامه» با فلش)، آیکون هر دو طرف متن باشد، یا کاربر صریح گفته باشد.
هر سه باید با کامنت کنار کد مستند شوند، وگرنه بازبینِ بعدی به‌عنوان باگ «فیکس»شان می‌کند.

---

## Chevron / Arrow Icons

در RTL، جهت "جلو" برعکسه:
```
LTR: → (ChevronRight = next)
RTL: ← (ChevronLeft = next)
```

```tsx
const NextIcon = ({ dir }) =>
  dir === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />
```

---

## Mixed Content — اعداد و کدهای انگلیسی

اعداد و کدها همیشه LTR هستن حتی در RTL context:

```html
<p dir="rtl">
  کد پیگیری:
  <span dir="ltr" style="unicode-bidi: embed">TRK-2024-001</span>
</p>
```

---

## Portal Components

کامپوننت‌هایی که outside React tree رندر می‌شن (Menu, Modal, Drawer, Tooltip):
- از `<html dir="rtl">` ارث می‌برن از طریق CSS cascade ✅
- ولی DOM order داخلشون رو باید خودت کنترل کنی
- همیشه `dir="rtl"` رو explicit روی Positioner/Portal container اضافه کن

---

## ⚠️ دابل-فلیپ — چرا طرح‌های RTL برعکس پیاده می‌شوند

> این بخش منبع canonical است. سه incident مستندشده در Vitrina و یک باگ در خودِ
> `dev-engine` (که فایل `src/direction.ts` برای رفعش ساخته شد) همگی از همین‌جا آمدند.

**مکانیزم.** دو تبدیل پشت سر هم رخ می‌دهد و هیچ‌کدام خودشان را اعلام نمی‌کنند:

```
۱. بوم Figma همیشه LTR رندر می‌شود — حتی وقتی کل طرح فارسی است.
   مختصات و ترتیب لایه‌ها LTR-encoded اند، در حالی که تصویر RTL-looking است.

۲. مرورگر زیر dir="rtl" خودش دوباره flip می‌کند.

هر کس از تصویر بخواند و مستقیم به کد ترجمه کند، این دو را روی هم سوار می‌کند.
```

**قانون ترجمه (اجباری):**

```
❌ ممنوع:  textAlignHorizontal: RIGHT  →  "end"      (نگاشت کور، LTR-محور)
✅ اجباری: اول به جهتِ پروژه ترجمه کن، بعد بنویس

  در پروژهٔ RTL:
    آنچه در Figma راست‌چین دیده می‌شود  →  start
    آنچه در Figma چپ‌چین دیده می‌شود   →  end
```

**چرا preview به‌تنهایی نجاتت نمی‌دهد.** خطا ادراکی نیست، نمادین است. تصویر درست
دیده می‌شود («آیکون سمت راست است») ولی اشتباه در لایهٔ ترجمه رخ می‌دهد که در تصویر
دیده نمی‌شود. بدتر: هنگام «تصحیح»، اگر هم‌زمان ترتیب DOM و مقدار logical عوض شوند،
یا خنثی می‌شوند یا دوباره برعکس. پس **در هر تصحیح فقط یک متغیر را عوض کن.**

**همچنین:** ابزارهای lint (از جمله `dev-engine`) فقط می‌گویند «فیزیکی ننویس» —
**نمی‌گویند `start` درست است یا `end`.** کدی که همه‌جا `start`/`end` دارد می‌تواند
کاملاً معکوس باشد و همهٔ چک‌ها سبز بمانند. تنها چیزی که این را می‌گیرد، جدول زیر است.

### جدول ترجمه (گیت اجباری — قبل از نوشتن کد)

قبل از هر Figma→code، برای **هر المان جهت‌دار** یک ردیف بنویس. تا جدول پر نشده،
کد نزن. هزینه‌اش ~۲۰ ثانیه است و صفر tool call لازم دارد.

| # | المان | در طرح دیده می‌شود | ترجمه | مقدار در کد |
|---|-------|---------------------|-------|-------------|
| ۱ | عنوان کارت | راست‌چین | راست در RTL = `start` | `textAlign="start"` |
| ۲ | Badge وضعیت | گوشهٔ **چپ**-بالا | چپ در RTL = `end` | `insetInlineEnd` + `top` |
| ۳ | دکمه با آیکون ✓ | آیکون سمت **راستِ** متن | راست‌ترین = اولین فرزند | `<Check/>` اول ← بعد متن |
| ۴ | متن دکمه | وسط‌چین | جهت‌مستقل | بدون تغییر |

**قواعد پرکردن:**

- ستون «در طرح دیده می‌شود» را از **screenshot** بنویس، نه از خروجی کد Figma.
  خروجی `get_design_context` کد Tailwind/JSX با فرض LTR می‌دهد؛ آن یک ترجمهٔ غلط
  است نه داده.
- ستون «ترجمه» را حذف نکن حتی وقتی بدیهی است — همین ستون است که فلیپ را از فرضِ
  ضمنی به تصمیمِ نوشته‌شده تبدیل می‌کند، و تصمیم نوشته‌شده خیلی راحت‌تر از فرض
  ضمنی گیر می‌افتد.
- هر ردیف که در سه بند «استثنای مجاز» بالا می‌افتد، همان توضیح را به‌صورت کامنت
  کنار کد هم بگذار.
- المان‌های `w="full"` باگ جهت را **پنهان می‌کنند** (جابه‌جا نمی‌شوند). حتماً یک
  برچسب یا دکمهٔ کوتاه را هم در جدول بیاور.

---

## تقویم فارسی — جلالی (شمسی)

در locale فارسی، تقویم **جلالی** است و **جایگزین** میلادی می‌شود (نه کنار هم).
`en` و بقیهٔ locale‌های LTR میلادی می‌مانند.

**قواعد نمایش (اجباری):**

| چیز | مقدار |
|---|---|
| حروف روزهای هفته | تک‌حرفی فارسی، **شنبه‌اول**: `ش` `ی` `د` `س` `چ` `پ` `ج` |
| شروع هفته | شنبه |
| ارقام | فارسی `۰۱۲۳۴۵۶۷۸۹` — در گرید تقویم **و** در هر لیبل تاریخ |
| ماه و سال | جلالی (مثلاً «مرداد ۱۴۰۵») |

> حروف کامل: شنبه، یک‌شنبه، دوشنبه، سه‌شنبه، چهارشنبه، پنج‌شنبه، جمعه.
> رفع ابهام: `شنبه → ش`، `سه‌شنبه → س` (نه هر دو `ش`).

**این یک قانون لایهٔ نمایش است، نه data.** تاریخ در state/سرویس همان `Date`
(timestamp، تقویم‌مستقل) می‌ماند؛ فقط format/render جلالی می‌شود. منطق مقایسه و
بازه‌ها بدون تغییر کار می‌کند.

پیاده‌سازی per-DS:
- shadcn/ui (react-day-picker) → `../design-systems/shadcn-ui/components/calendar.md`

---

## پیاده‌سازی در هر DS

- Chakra UI v3 → `design-systems/chakra-ui-v3/chakra-ui-v3.md` (بخش Direction Setup)
- Bootstrap 5 → `design-systems/bootstrap5/rtl.md`
