# dev-agents — Handoff
> 2026-08-13

## الان
**uncommitted:** `dev-engine init` از «فقط ساخت `.dev-engine.json`» به **scaffold کامل
harness پروژه** ارتقا پیدا کرد (`init.ts` + flagهای `cli.ts`).

- می‌سازد: `CLAUDE.md` (ترکیبِ قالب پایهٔ `_TEMPLATE` + مکمل DS) · `.claude/hooks/rtl_gate.py`
  (کپی از `dev-knowledge/universal/hooks/`) · `.claude/settings.json` (هوک `Stop`) ·
  دو stub در `.claude/context/`.
- **هیچ فایل موجودی overwrite نمی‌شود** — فقط غایب‌ها؛ بقیه `⏭` گزارش می‌شوند.
  `settings.json` هم merge می‌شود نه replace. پس روی پروژهٔ زنده امن است.
- **حالت غیرتعاملی** اضافه شد (`--yes` + flagها). قبلاً `readline` روی stdin پایپ‌شده
  خطوط اضافه را drop می‌کرد، یعنی `init` اصلاً از اسکریپت/agent قابل اجرا نبود.

تست: chakra+rtl · generic+ltr · `--no-scaffold` · اجرای دوباره (idempotent) ·
merge روی `settings.json` که هوک دیگری داشت · اجرا روی Vitrina (همه skip، `git status` تمیز).

> `packages/dev-engine/package.json` یک تغییر uncommitted دارد (`chmod +x` در build script)
> که **از قبلِ این session** بود.

**فاز ۳ هم اضافه شد (uncommitted):** `tools/vision-diff/` — `vision_diff.py`
(crop + pixel-diff دترمینیستیک بین دو screenshot، بدون مدل؛ subcommands
`crop`/`diff`/`batch`، خروجی `.compare.png` + JSON + exit code) و `regions.py`
(تشخیص المان‌های کوچیک icon+text که از composite screenshot قابل‌قضاوت نیستن —
همون باگی که در `ProductList2` سه‌بار از چشم رد شد). Python + Pillow، صفر
dependency دیگه، بدون build step. تست شد با تصاویر synthetic: حالت match ۴٪
تغییر، حالت باگ (آیکن جابه‌جا) ۲۳٪ — تفکیک واضح. جزئیات و مثال کامل:
`tools/vision-diff/README.md`.

## بعدی
- commit هر سه repo با هم (dev-agents + dev-knowledge + Vitrina) — به هم وابسته‌اند.
- فاز ۴ (اختیاری): لایهٔ vision model روی خروجی `.compare.png` فقط برای موارد `❌` —
  نه جایگزین بررسی preview خودِ Claude، فقط یه نظر دوم اضافه روی موارد پرچم‌شده.
- **نصب مجدد skillها** همچنان معلق است (`dev-implement`/`dev-engine`) — نسخهٔ deployed
  جداست؛ ویرایش `.skill` تا re-install اثر ندارد.
- تصمیم باز: آیا `layout-derive` هم حذف شود؟ (فعلاً نگه داشته شد — صفر هزینه.)
