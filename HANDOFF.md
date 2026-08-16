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

**فاز ۴ هم اضافه شد (uncommitted):** `tools/vision-diff/model_review.py` —
لایهٔ **اختیاری/opt-in** vision model روی خروجی فاز ۳، فقط برای regionهای
`pass: false` در حالت پیش‌فرض `batch` (نه همه — `--all` override می‌کنه).
هیچ‌جا (نه hook، نه dev-engine، نه vision_diff.py) خودکار صداش نمی‌زنه.
OpenRouter API با `urllib` خام (صفر dependency اضافه)، کلید از
`$OPENROUTER_API_KEY` یا `tools/vision-diff/.env` (gitignored).

۵ مدل روی ۵ تست synthetic مقایسه شدن (آیکون جابه‌جا، آیکون هم‌سمت‌سالم
[چک false-positive]، تودرتو vs تخت، ۳ آیکون کوچیک کاملاً غایب، جابه‌جایی
ترتیب دو دکمه):

| مدل | جابه‌جا | سالم | تودرتو | غایب | ترتیب |
|---|---|---|---|---|---|
| `nemotron-3-ultra-550b:free` | — قابل‌استفاده نیست (text-only، 404 روی image) |
| `nemotron-nano-12b-v2-vl:free` | ✅ | ❌ FP | — | ❌ miss | — |
| `ui-tars-1.5-7b` | ✅ | ✅ | ⚠️ دلیل غلط | ❌ miss | ✅ |
| `gemma-4-31b-it:free` | — | — | ⚠️ دلیل غلط | ✅ | rate-limit شد |
| **`gpt-5.6-luna`** | ✅ | — | ⚠️ دلیل غلط | ✅ | ✅ |

**default شد `openai/gpt-5.6-luna`** — تنها مدل (با `gemma-4-31b`) که مورد
سخت «۳ آیکون کوچیک غایب» رو گرفت، و برخلاف gemma به rate-limit نخورد.
«تودرتو vs تخت» رو همهٔ مدل‌ها با دلیل غلط (`spacing` به‌جای ساختار) جواب
دادن — محدودیت شناخته‌شده، نه چیزی که با عوض‌کردن مدل حل بشه.

**نتیجهٔ کلیدی از این دور تست:** فاز ۳ به‌تنهایی (رایگان، بدون مدل) ۲ از ۳
تست سخت رو با تنظیمات پیش‌فرض پرچم می‌زد (`❌`)؛ فقط تشخیصِ *چرا* نداشت. مورد
سوم (آیکون غایب) رو فاز ۳ هم می‌گرفت اگه crop طبق `regions.py` تنگ گرفته
می‌شد. یعنی فاز ۴ چیزی رو «کشف» نمی‌کنه که فاز ۳ نمی‌گرفت — فقط تشخیصِ خودکار
اضافه می‌کنه روی چیزی که از قبل پرچم خورده. به همین دلیل عمداً نگه داشته شد
(نه حذف) ولی هیچ‌وقت پیش‌فرض/اجباری نمی‌شه — کد و README هر دو این status رو
صریح مستند می‌کنن.

## بعدی
- commit هر سه repo با هم (dev-agents + dev-knowledge + Vitrina) — به هم وابسته‌اند.
- **نصب مجدد skillها** همچنان معلق است (`dev-implement`/`dev-engine`) — نسخهٔ deployed
  جداست؛ ویرایش `.skill` تا re-install اثر ندارد.
- تصمیم باز: آیا `layout-derive` هم حذف شود؟ (فعلاً نگه داشته شد — صفر هزینه.)
