# dev-agents — Handoff
> آخرین آپدیت: 2026-08-08

## الان
**Commit شده (e8649b5 + commits قبل‌تر)** — Audit کامل روی `dev-engine` (لایه‌ی تطابق کد ↔ طرح فیگما) اجرا شد:

- **`src/direction.ts` (جدید)** — تک‌منبع نگاشت جهت (فیزیکی↔semantic). باگ ریشه‌ای فیکس شد: `normalizeAlign` قبلاً جهت‌کور بود (`right`→`end` بدون توجه به RTL) که در پروژه‌ی RTL کل قضاوت `textAlign` رو معکوس می‌کرد — هم false-negative (کد غلط تمیز)، هم false-positive (کد درست error، با auto-fix ای که متن رو غلط جابه‌جا می‌کرد).
- **`src/modules/layout-diff.ts` (بازنویسی)** — سه باگ دیگه فیکس شد: کامپوننت با ریشه‌ی Fragment (`<>`) کاملاً نامرئی بود؛ فقط دکمه‌ی اول هر فایل چک می‌شد (نه همه‌ی دکمه‌ها)؛ چک‌ها روی کل فایل اسکن می‌شدن نه بازه‌ی خود کامپوننت. + دو چک جدید: `justify`/`align` mismatch و `icon-color` mismatch.
- **`src/verify-render.ts` (جدید)** — لایه‌ای که وجود نداشت: diff عددی بین geometry واقعیِ DOM رندرشده (دامپ از preview) و طرح. `layout-diff` فقط متن کد رو می‌خونه؛ این لایه چیزهایی مثل «`justify` زیر `dir=rtl` واقعاً کجا نشست» رو قطعی می‌گیره. subcommand `verify-render [--snippet]`.
- **`src/layout-sync.ts`** — نوشتن snapshot دستی JSON بود؛ الان `layout-sync --set <name> --data '<json>'` با اعتبارسنجی (`validateSnapshot`) اضافه شد — مقدار فیزیکی (`right`) یا رنگ خام (`#hex`) رد می‌شه.
- **`src/doctor.ts`** — چک جدید: پوشش layout snapshot (۰ یعنی `layout-diff` no-op است، ولی قبلاً preflight همچنان سبز بود).
- **`src/types.ts`** — فیلدهای `justify`/`align`/`iconColor` به `LayoutSnapshot` + type های `RenderedSnapshot`/`RenderedChild` برای verify-render.
- همه با harness ایزوله (نه Vitrina) تست شد — هر باگ قبل/بعد از فیکس reproduce شد.

- **`src/modules/css-logical-props.ts` (بازنویسی, 17fd726)** — بهبود دستاویزات و اصلاح نگاشت جهت. تاریخچه‌ی RTL logical props bug: این فایل قبلاً `right→InlineEnd` / `left→InlineStart` ثابت می‌کرد؛ طبق MDN "in RTL: inline-start=right, inline-end=left"؛ نگاشت ثابت فقط در LTR درست است و در پروژه RTL برعکس می‌شد. حالا `physicalToSemantic()` از `direction.ts` استفاده می‌کنه و RTL-aware نگاشت انجام می‌دهد. اضافه شد +108 خط دستاویزات توضیح‌دهنده.

## نکته‌ی حل‌شده از قبل
باینری `dev-engine` global لینک شد (`npm link` از این پکیج) — دیگه نیازی به `node dist/cli.js` نیست. مستند شد در `dev-knowledge/universal/dev-engine.md`.

## بعدی
- **Upstream (Vitrina):** css-logical-props و direction.ts fixes را test کند و اگه نیاز باشه (false-positive/negative) بگزارش دهد.
- **Optional:** بهبود‌های اضافی برای `verify-render` اگه در Vitrina یا پروژه دیگه case edge جدید کشف شود.
- **Scope:** دو repo (dev-knowledge + dev-agents) الان sync شدند؛ audit کامل RTL logical props انجام شد.
