# dev-stack — Handoff
> 2026-08-28

## الان
audit کل dev-stack (منبع: گزارش glm) صحت‌سنجی شد. batch A (تناقض‌های زندهٔ
RULE-layer) + batch B (کد مردهٔ dev-engine) اعمال شد روی main:

- **preview opt-in:** `_TEMPLATE/CLAUDE-template.md` دیگر «screenshot در Tier 2
  اجباری و بدون پرسیدن» نمی‌گوید — همه‌جا «اول از کاربر تأیید بگیر» (همگام با
  قانون global). `shadcn-ui/CLAUDE-template.md` هم قبلاً همین تناقض را داشت،
  با کوچک‌سازی زیر رفع شد.
- **shadcn template concat bug:** `shadcn-ui/CLAUDE-template.md` از ۲۰۳ خط قالب
  کامل (که `dev-engine init` روی قالب پایه دوباره concat می‌کرد = همه‌چیز دوبار)
  به ~۵۵ خط دلتای additive (سبک chakra) کوچک شد.
- **BLUEPRINT §3:** `dev-engine ./src` / `dod` / `visual-diff` (وجود نداشتند) →
  دستورهای واقعی.
- **`--typecheck` disconnect:** `dev-engine init --typecheck "<cmd>"` حالا وقتی
  غیرپیش‌فرض باشد `build_command` را هم در `.dev-engine.json` می‌نویسد.
- **کد مرده:** `claude_api_key` و `ProjectConfig.modules` از types.ts + example.json
  حذف شد. `--verbose` که silent no-op بود در reporter پیاده شد (فایل‌های clean را
  لیست می‌کند). `token-replacer` دیگر `'chakra-v3'` هاردکد نیست — `config.ds` را
  می‌خواند. `ds-list` به COMMANDS.md + dev-engine.md اضافه شد.

## batch C — اعمال شد (branch `dedup/root-docs`، منتظر merge)
root docs فقط. CLAUDE.md ۱۴۱→۱۰۵ خط:
- کاتالوگ ۵-جدولی skill → مینی‌جدول «کدوم کِی» + pointer به `skills/README.md`.
  tombstoneهای `dev-delivery-check`/`figma-page-implement` (warning «دوباره اضافه نکن») نگه داشته شد.
- جدول reliability ۳-ردیفی (subset ناقص BLUEPRINT §۲) → حذف؛ اصل طلایی + pointer به §۲.
- جدول ۴-ردیفی context → یک نسخهٔ canonical در **BLUEPRINT §۴** اضافه شد؛ CLAUDE.md و README به آن ارجاع.
- فلوی build/check:refs → منبع یگانه `skills/README.md`.

**دامنهٔ عمقی — ۲ و ۴ انجام شد:**
- **۴:** `figma-to-code.md` بلوک «COPY INTO PROJECT CLAUDE.md» (قالب موازیِ مرده،
  از ۲۰۲۶-۰۵ آپدیت نشده) حذف شد. `_TEMPLATE/CLAUDE-template.md` تنها منبع gate است.
  فایل ۳۰۷→~۱۸۰ خط. TOC + intro بازنویسی، «gate بالا»ها → «CLAUDE.md پروژه».
- **۲:** بخش «RTL DOM Order» در `figma-to-code.md` (~۴۸ خط الگوریتم + دابل-فلیپ) →
  ~۱۸ خط الزام DoD + pointer به `language.md § دابل-فلیپ`. بلاک `❌/❌/✅` در
  `dev-implement/SKILL.md` → ۴ خط + pointer.
- **۱ و ۳ عمداً انجام نشد** (تکرار defensible، skill باید self-contained بماند).
- ⚠️ **reinstall لازم:** فقط `skills/dist/dev-implement.skill` (بقیه دست‌نخورده).

## بعدی
- **batch D (معوق — نیاز branch + تصمیم معماری):** یکی‌سازی wizard —
  `knowledge/universal/project-init-wizard.md` (۷۴۵ خط) ≈
  `skills/src/dev-init-wizard/SKILL.md` (۴۵۴). تصمیم: `dev-engine init` CLI جای
  skill را می‌گیرد یا مکمل است؟
- `app-conventions.md` یتیم است (صفر ارجاع ورودی) — محتوایش در chakra template
  §۳-۴ بهتر زندگی می‌کند. حذف یا سیم‌کشی.
- `tools/vision-diff/` را در `dev-implement` STEP 4b اسم ببر (الان فقط COMMANDS.md).
- تأیید نصب مجدد ۹ skill از `skills/dist/`.
- آرشیو `a-sarshad/dev-agents` + `a-sarshad/dev-knowledge` روی گیت‌هاب.
- `bootstrap5/_tokens.scss` → `_tokens.template.scss` (رنگ برند واقعی در لایهٔ shared).
- تصمیم Tailwind برای `4a-financial`/`azita-jafari`: v4 یا out-of-pipeline.
