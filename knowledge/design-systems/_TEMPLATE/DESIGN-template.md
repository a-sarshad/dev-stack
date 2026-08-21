---
name: {{PROJECT_NAME}}
description: TODO — یک خط، چه محصولی است
omitted:
  - section: colors
    reason: "canonical در کد ({{TOKENS_PATH}}) + CLAUDE.md §Token Reference — اینجا duplicate نمی‌شود"
  - section: typography
    reason: "استاندارد {{DS}} — canonical در کد"
  - section: spacing
    reason: "استاندارد {{DS}} scale — canonical در کد"
  - section: rounded
    reason: "استاندارد {{DS}} scale — نقش هر level در §Shapes"
---

# {{PROJECT_NAME}} — Design Reference

<!-- version: 1 | updated: {{DATE}} | changelog: ساخته شد از _TEMPLATE -->

> **این فایل چیست:** منبع حقیقت **تصمیم‌های بصری**. «محصول باید چه شکلی باشد».
> **این فایل چه نیست:** gate، پروتکل، قانون اجراشونده → آن‌ها در `CLAUDE.md` (always-on) هستند.
> **کِی خوانده می‌شود:** هر task که UI، styling، layout، responsive، a11y یا motion را عوض می‌کند.

---

## Source of Truth — کدام عدد کجاست

> ⛔ **قانون سخت این فایل: هیچ hex، هیچ عدد spacing، هیچ breakpoint اینجا inline نمی‌شود.** فقط ارجاع.
> دلیل: مقدار دو-خانه‌ای همیشه drift می‌کند. مقدار یک خانه دارد — کد.

| چه چیزی | خانهٔ canonical |
|---|---|
| مقدار توکن brand | `{{TOKENS_PATH}}` · جدول در `CLAUDE.md` §Token Reference |
| scale های {{DS}} | `{{TOKENS_PATH}}` · مرجع: `design-systems/{{DS_FOLDER}}/tokens.md` |
| breakpoints | `CLAUDE.md` §Design Scale |
| قوانین جهت ({{DIRECTION}}) | `CLAUDE.md` §Direction · enforce: `dev-engine` |
| قالب‌های صفحه | `.claude/context/page-templates.md` (اگر ساخته شد) |
| باگ‌های project-specific | `.claude/context/known-bugs.md` |
| نگاشت نام Figma → import | `.claude/context/figma-resolve.json` |

---

## Overview — جهت طراحی

TODO — یک جمله دربارهٔ حسی که محصول باید بدهد، بعد **تصمیم‌های قابل‌مشاهده‌ای که آن حس را می‌سازند.**

> ⚠️ «مدرن»، «تمیز»، «مینیمال»، «premium» به‌تنهایی بی‌مصرف‌اند. هر صفت باید به یک قاعدهٔ
> قابل‌سنجش وصل شود. تست: اگر دو نفر بتوانند یک جمله را دو جور بخوانند، ناقص است.

- TODO: سطح‌بندی با border یا با سایه؟
- TODO: یک رنگ برند یا چند؟ کجا مجاز، کجا نه؟
- TODO: تراکم اطلاعات — فشرده یا هوادار؟
- TODO: چه چیزی صریحاً **نداریم** (gradient؟ glass؟ تیتر تزئینی؟)

---

## Colors — نقش و مرز

مقادیر → §Source of Truth. اینجا فقط **کجا استفاده شود و کجا نه**:

| نقش | توکن | استفاده | ⛔ استفاده نکن |
|---|---|---|---|
| کنش اصلی | TODO | TODO | TODO |
| سطح | TODO | TODO | TODO |
| خطا / تخریب | TODO | TODO | TODO |

**قانون:** رنگ به‌تنهایی حامل معنا نباشد — همیشه متن یا آیکون همراهش.

---

## Typography

- فونت: **TODO** (فونت دوم بدون دلیل اضافه نکن)
- scale = استاندارد {{DS}}
- TODO: قواعد truncate / wrap عنوان

---

## Layout & Responsiveness

> **رفتار را بنویس، نه فقط عدد breakpoint.** «md = 768px» به agent نمی‌گوید دو ستون کِی
> یک ستون می‌شود، حاشیه چه می‌شود، و چه چیزی حذف می‌شود.

### Grid

TODO — تعداد ستون، gutter، margin، فرمول `span(N)`.

### ساختار لایه‌بندی

```
TODO — درخت پوستهٔ صفحه (navbar / sidebar / main / ستون‌ها)
```

### رفتار در هر breakpoint

TODO — برای هر بازه: چند ستون · ناوبری چه می‌شود · حاشیه چقدر · چه چیزی حذف/جابه‌جا می‌شود.

---

## Elevation & Depth

TODO — سیستم border-محور است یا shadow-محور؟ سایه دقیقاً برای چه چیزی مجاز است؟

---

## Shapes

TODO — نقش هر level از scale (کدام برای panel، کدام برای کارت، کدام برای عنصر ریز).

---

## Components

> قاعده: هر چه کامپوننت پرتکرارتر، مستندسازی دقیق‌تر.
> فقط چیزی را بنویس که agent احتمالاً **غلط حدس می‌زند** — نه هر جزئیات پیاده‌سازی.

### TODO
- آناتومی · variant ها · اندازه · سلسله‌مراتب · محدودیت‌ها

---

## Interaction & States

هر کامپوننت تعاملی باید این حالت‌ها را **صریح** داشته باشد:

| حالت | وضعیت | الزام |
|---|---|---|
| default | TODO | — |
| hover | TODO | — |
| active/pressed | TODO | — |
| disabled | TODO | — |
| loading | TODO | — |
| focus-visible | TODO | هرگز حذف نشود |
| empty | TODO | متن باید قدم بعدی را بگوید |
| error | TODO | پیام باید راه‌حل بدهد |

---

## Accessibility

- **کنتراست:** حداقل WCAG AA — ۴.۵:۱ متن، ۳:۱ عنصر کنشی و border.
- **کیبورد:** هر کنترل با Tab قابل‌رسیدن، با Enter/Space فعال‌شدنی. `onClick` روی `div` بدون `role`/`tabIndex` ممنوع.
- **focus قابل‌دیدن:** حلقهٔ focus هرگز حذف نشود.
- **معنا فقط با رنگ نه:** وضعیت همیشه متن یا آیکون همراه داشته باشد.
- **پیام خطا به فیلدش وصل باشد** (`aria-describedby`).
- **آیکون تنها در دکمه** → `aria-label`. آیکون تزئینی → `aria-hidden`.
- **زبان و جهت:** `dir="{{DIRECTION}}"` + `lang="{{LANG}}"` روی `<html>`.

---

## Motion

| نوع | duration | easing |
|---|---|---|
| تغییر رنگ / بازخورد | TODO | TODO |
| محو/ظهور | TODO | TODO |
| تغییر چیدمان | TODO | TODO |

- سقف: هیچ transition ای بالای **300ms**.
- motion فقط برای **توضیح تغییر وضعیت** — نه تزئین. انیمیشن ورود برای تک‌تک عناصر ممنوع.
- `prefers-reduced-motion` را احترام بگذار (حرکت → صرفاً opacity).

---

## Iconography

- کتابخانه: **TODO** — تنها کتابخانهٔ آیکون. منبع دوم اضافه نکن.
- `strokeWidth`: TODO
- اندازه‌های مجاز: TODO (یک مجموعهٔ بسته — عدد دلخواه نساز)
- filled و outline در یک ناحیهٔ ناوبری قاطی نشوند.
- آیکون بدون متن برای کنش ناآشنا ممنوع.
- **جهت:** آیکون جهت‌دار در {{DIRECTION}} باید flip شود — `dev-engine` rule `icon-direction` چک می‌کند.

---

## Product Content — لحن

TODO:
- label دکمه با فعل شروع شود؛ «بله/خیر/تأیید/ارسال» وقتی گزینهٔ گویاتری هست ممنوع.
- پیام خطا بگوید **چه شد** و **کاربر چه کند**.
- قواعد عدد/تاریخ/واحد → TODO

---

## Do's & Don'ts

**Do**
- کامپوننت موجود را قبل از ساخت نو جست‌وجو کن.
- توکن استفاده کن.
- هر حالت (خالی، بارگذاری، خطا) را همان اول در نظر بگیر.

**Don't**
- ⛔ رنگ/spacing/radius خارج از توکن — `dev-engine` error می‌دهد.
- ⛔ gradient تزئینی، glassmorphism (مگر صریحاً خواسته شود).
- ⛔ emoji به‌عنوان آیکون محصول.
- ⛔ کارت داخل کارت.
- ⛔ همه‌چیز را برجسته کردن — در هر نما یک کنش اصلی.
- ⛔ ساخت کامپوننت نو وقتی معادلش هست.

---

## Maintenance & Validation

- **کِی آپدیت شود:** الگوی reusable نو تأیید شد · نقش رنگ عوض شد · قاعدهٔ layout/responsive عوض شد · تصمیم motion/icon/a11y گرفته شد. (skill `wf-update` چک می‌کند.)
- **کِی آپدیت نشود:** مقدار توکن → کد. باگ → `known-bugs.md`. قالب صفحه → `page-templates.md`.
- **سقف:** ~۳۵۰ خط. بلندتر شد یعنی چیزی اینجاست که خانهٔ دیگری دارد.
- **اعتبارسنجی ساختاری:**
  ```
  npx @google/design.md lint DESIGN.md
  ```
- **تعارض دیدی؟** کد برنده است. این فایل را اصلاح کن، نه برعکس — و تعارض را گزارش بده.
