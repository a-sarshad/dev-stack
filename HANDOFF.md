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

## بعدی
- commit هر سه repo با هم (dev-agents + dev-knowledge + Vitrina) — به هم وابسته‌اند.
- فاز ۳: `vision-diff` — crop + pixel-diff دترمینیستیک بین screenshot طرح و preview،
  بدون مدل. جای پیشنهادی: `dev-agents/tools/vision-diff/` (Python + Pillow، نه TS —
  چون build/link هر iteration را کند می‌کند و کار اصلی پردازش تصویر است).
- **نصب مجدد skillها** همچنان معلق است (`dev-implement`/`dev-engine`) — نسخهٔ deployed
  جداست؛ ویرایش `.skill` تا re-install اثر ندارد.
- تصمیم باز: آیا `layout-derive` هم حذف شود؟ (فعلاً نگه داشته شد — صفر هزینه.)
