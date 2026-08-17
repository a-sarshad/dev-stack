# dev-stack — Handoff
> 2026-08-17

## الان

**ادغام `dev-agents` + `dev-knowledge` → `dev-stack` انجام شد.** تاریخچهٔ هر دو
حفظ شد (۱۲۰ commit قبلی + مهاجرت). ریپوهای قدیمی روی گیت‌هاب دست‌نخورده‌اند.

چیزی که در همین مهاجرت درست شد (نه صرفاً جابه‌جایی):

- **`paths.ts` دیگر مسیر hardcode نمی‌خواند.** `findDevKnowledge` اول از محل
  خودِ ماژول به بالا دنبال `knowledge/design-systems` می‌گردد. قبلاً فقط
  `$HOME/Documents/GitHub/Tools/dev-knowledge` را می‌شناخت — یعنی repo فقط سرِ
  جای دقیق خودش کار می‌کرد. مسیرهای قبلی به‌عنوان fallback مانده‌اند.
- **سورس skillها از zip بیرون آمد.** ۹ فایل `.skill` باینری بودند و در گیت
  ذخیره می‌شدند؛ یعنی `git diff` روی تغییر یک skill فقط blob نشان می‌داد.
  حالا `skills/src/<name>/SKILL.md` سورس است و `scripts/build-skills.sh`
  فایل `.skill` می‌سازد. محتوای هر ۹ تا با نسخهٔ قبلی byte-identical است.
- **`.claude/launch.json`** به `/Users/ali_1/...` اشاره می‌کرد — کاربری که وجود
  ندارد. اصلاح شد.
- `dev-init-wizard.skill` تنها آرشیوی بود که `SKILL.md` را در ریشه داشت (بقیه
  در `<name>/`). build حالا همه را یکدست می‌کند.

تست: `pnpm build` سبز · `doctor` روی Vitrina همه‌چیز ✓ و `knowledge/` را از
داخل خودِ repo پیدا می‌کند (نه fallback قدیمی) · check کامل روی Vitrina،
۲۵۹ فایل، ۸۵ warning، همهٔ ماژول‌ها فعال.

## بعدی

- **نصب مجدد هر ۹ skill** — `pnpm build:skills` اجرا شده، فایل‌ها در
  `skills/dist/` آماده‌اند. تا در اپ Claude نصب نشوند، نسخهٔ قدیمی (که مسیر
  `Tools/dev-agents` را دارد) فعال می‌ماند. **این تنها کار باقی‌مانده‌ای است که
  از ترمینال قابل انجام نیست.**
- آرشیو `a-sarshad/dev-agents` و `a-sarshad/dev-knowledge` روی گیت‌هاب — بعد از
  اینکه چند روز با `dev-stack` کار شد و مطمئن شدیم چیزی جا نمانده.
- حذف پوشهٔ محلی `Documents/GitHub/Tools/` — همان شرط بالا.
  پشتیبان: `~/Documents/backup-Tools-2026-08-16.tar.gz`
- **OpenRouter — متوقف شد، مسیر عوض شد.** طرح CLI (`orx` + `config/registry.md`)
  کنار گذاشته شد؛ هیچ فایلی ساخته نشد. تصمیم ۲۰۲۶-۰۸-۱۷: اول از طریق
  **Claude Desktop developer mode (MCP)** امتحان شود.
  دو نکته که اگر برگشتیم به CLI باید بدانیم: (۱) `orx` فقط وقتی صرفه دارد که
  ورودی حجیم و خروجی کوتاه باشد — برای ساخت/تغییر کد گران‌تر از انجام مستقیم
  است. (۲) سقف خرج روی کلید OpenRouter شرط شروع است، چون repo عمومی است.
- تصمیم Tailwind: `4a-financial` و `azita-jafari` یا `tailwind-v4` بگیرند یا
  out-of-pipeline اعلام شوند.
- `knowledge/design-systems/bootstrap5/_tokens.scss` رنگ برند واقعی در لایهٔ
  shared دارد → باید `_tokens.template.scss` شود.
- تصمیم باز: `layout-derive` حذف شود؟ (فعلاً نگه داشته شد — صفر هزینه.)
