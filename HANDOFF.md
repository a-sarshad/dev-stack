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

## بعدی
- **batch C (معوق — نیاز branch):** dedupe root docs — CLAUDE.md به pointer
  (skill catalog، جدول context، reliability، build flow → منبع یگانه
  `skills/README.md` + BLUEPRINT). tombstoneها یک‌خطی. جدول tier / geometry-sort /
  binary-resolution block → منبع یگانه + pointer.
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
