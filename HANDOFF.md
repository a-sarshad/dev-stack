# dev-knowledge — Handoff
> آخرین آپدیت: 2026-08-12

## الان
**دو کار بزرگ، هنوز commit نشده:**

- **رجیستری DS داده‌محور** — هر `design-systems/<ds>/` حالا `ds.json` دارد
  (`id`/`aliases`/`package`/`targets`/`contract`). افزودن یک DS جدید = کپی
  `_TEMPLATE/`، **بدون هیچ تغییر کدی**. `doctor` سه چک تازه گرفت (رجیستری،
  نسخه در برابر `targets`، `contract`) و `dev-engine ds-list` اضافه شد.
  قرارداد اسکلت → `design-systems/README.md`.

- **حذف ریشه‌ای زیرسیستم snapshot متنی** — `layout-diff` · `verify-render` ·
  `layout-sync` · `figma-layout.json` (~۱۳۰۰ خط) حذف شدند.
  **دلیل:** snapshot در STEP 2 و کد در STEP 3 هر دو از یک خواندنِ screenshot
  می‌آمدند، پس سبزشدنِ چک هیچ اطلاعات مستقلی نداشت — یک تأیید خودارجاع که ⚠️
  روتینش ⚠️ واقعی را در DoD نامرئی می‌کرد. تطابق با طرح = **مقایسهٔ preview**.
  `layout-derive` ماند ولی دیگر چیزی نمی‌نویسد؛ فقط چاپ می‌کند تا «جدول ترجمه»
  را تغذیه کند (تنها لایه‌ای که واقعاً مستقل است — سمت را از هندسه حساب می‌کند).

## نکته‌ی مهم — چرا اسکیل drift کرد
`.skill` زیر `skills/` **source** است، نه runtime. نسخه‌ی واقعاً لودشده یه `SKILL.md` جداست زیر
`Library/Application Support/Claude/.../skills-plugin/.../skills/<name>/SKILL.md`. ویرایش `.skill`
تا وقتی re-install (یا overwrite مستقیم مسیر بالا) نشه اثر نداره. برای تشخیص drift:
`diff <(unzip -p <name>.skill <name>/SKILL.md) "<deployed path>"`.

## بعدی
- **نصب مجدد اسکیل‌ها** — `dev-implement` و `dev-engine` هر دو ویرایش شدند
  (STEP 4b و بلوک‌های snapshot حذف شدند). تا re-install نشوند، نسخه‌ی قدیمی فعال است.
- تصمیم Tailwind: `4a-financial` و `azita-jafari` یا `tailwind-v4` بگیرند یا out-of-pipeline اعلام شوند.
- `bootstrap5/_tokens.scss` رنگ برند واقعی در لایه‌ی shared دارد → `_tokens.template.scss`.
- اختیاری: drift‌چک خودکار بین `.skill` source و deployed SKILL.md.
