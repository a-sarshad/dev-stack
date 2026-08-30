# shadcn/ui — Calendar (تقویم جلالی)

> قانون **نمایش** تقویم فارسی (حروف هفته، ارقام، ماه شمسی) → `knowledge/universal/language.md`
> §«تقویم فارسی». این فایل فقط **how** مخصوص react-day-picker است.

## react-day-picker موتورش میلادی است — جلالی با `dateLib` override

shadcn `Calendar` روی `react-day-picker` v10 سوار است و هیچ prop «calendar system»
ندارد. جلالی‌کردن = تزریق `date-fns-jalali` به‌جای `date-fns` داخلی.

**کلید:** rdp پراپ `dateLib` را به سازندهٔ داخلی به‌عنوان **overrides** می‌دهد
(`new DateLib(options, props.dateLib)` — هر متد `this.overrides?.fn ?? dateFns.fn`).
چون `date-fns-jalali` سطح API `date-fns` را آینه می‌کند، پاس‌دادن کل namespace ⇒
ریاضی ماه/هفته/روز جلالی می‌شود.

```bash
npm i date-fns-jalali   # tag هم‌نسخه با date-fns v4 که rdp استفاده می‌کند (مثلاً 4.4.0-0)
```

```tsx
import * as jalali from "date-fns-jalali";
import { faIR } from "date-fns-jalali/locale";
import type { DateLib } from "react-day-picker";

// index = Date.getDay()  (0 = یک‌شنبه … 6 = شنبه)
const FA_WEEKDAY_NARROW = ["ی", "د", "س", "چ", "پ", "ج", "ش"];

<Calendar
  dir="rtl"
  locale={faIR}
  numerals="arabext"        // ارقام فارسی — DateLib.format خودش replaceDigits می‌کند
  weekStartsOn={6}          // شنبه
  dateLib={jalali as unknown as Partial<typeof DateLib.prototype>}
  formatters={{ formatWeekdayName: (d: Date) => FA_WEEKDAY_NARROW[d.getDay()] }}
/>
```

`en` را جلالی نکن — این پراپ‌ها را با شرط `locale === "fa"` بده، وگرنه `undefined`.
یک helper مشترک (`src/lib/jalali.ts` در پروژه) تمیزتر از تکرار در هر call site است.

## تله‌ها

- **`dateLib` رسماً `@experimental`** است (ممکن است semver را رعایت نکند). نسخهٔ
  `react-day-picker` را pin کن و بعد از bump تست بصری بگیر.
- rdp default `formatWeekdayName` فرمت `cccccc` است → با faIR جلالی «۱ش/۲ش…»
  می‌دهد، نه تک‌حرفی. `formatWeekdayName` را **حتماً** override کن (map ثابت بالا).
  `ccccc` (narrow) هم درست است ولی map صریح‌تر و مقاوم‌تر است.
- لیبل تاریخِ **بیرونِ** تقویم (متن trigger یک date-picker) از `DateLib` رد نمی‌شود
  ⇒ ارقام لاتین می‌مانَد. `format` را از `date-fns-jalali` بگیر و خروجی را دستی به
  ارقام فارسی ببر: `s.replace(/[0-9]/g, d => "۰۱۲۳۴۵۶۷۸۹"[+d])`.
- `captionLayout="dropdown"` → `formatMonthDropdown` پیش‌فرض `toLocaleString` (میلادی)
  صدا می‌زند. با جلالی از `captionLayout="label"` (پیش‌فرض) استفاده کن یا آن formatter
  را هم override کن.
- `date-fns-jalali` سنگین است (~۲۰kB+ به chunk صفحه). روی مسیر حساس lazy-load کن.

## تجربهٔ واقعی

kish-airport، ۱۴۰۵/۰۶/۰۸ — date-range picker صفحهٔ Flights. helper: `src/lib/jalali.ts`.
فارسی جلالی، انگلیسی میلادی. `/flights` bundle: 44kB → 66kB.
