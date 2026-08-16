---
name: dev-implement
description: "Orchestrator واحد برای پیاده‌سازی طرح Figma به کد — کل pipeline رو step-by-step enforce می‌کنه (preflight → context → Figma fetch → implement → verify → commit) تا چیزی فراموش نشه. Trigger وقتی کاربر می‌خواد یه frame/طرح/کامپوننت Figma رو implement کنه: «implement کن»، «این طرح/frame رو کد کن»، «figma to code»، «implement design/frame/component»، «پیاده‌سازی کن»، «این رو بساز [+ Figma URL]». از dev-engine CLI برای check و cache resolution استفاده می‌کنه (صفر token اضافه)."
---

<!-- dev-implement | orchestrator | BLUEPRINT §3 | updated 2026-08-16 -->

# dev-implement — Figma → Code Pipeline

نقطه‌ی ورود **واحد** برای Figma→code. ترتیب رو enforce می‌کنه — **step پریدن ممنوع**.
هدف: کمترین خطا، کمترین token، چیزی فراموش نشه.

> هر چیز دترمینیستیک = `dev-engine` (CLI، صفر token). MCP فقط برای fetch هدفمند Figma.

---

## RULE 0 — قانون «هیچ‌وقت بی‌صدا کد نزن» (بالاتر از همه)

هر step این pipeline که **نتونه اجرا بشه** (باینری نیست، doctor رد شد، cache نیست،
Figma برنگشت) → **سه راه داری، و فقط سه راه:**

```
۱. خودت درستش کن  → بعد از اول همون step ادامه بده.
۲. نمی‌تونی درست کنی → به کاربر بگو دقیقاً چی لازمه، و صبر کن.
۳. کاربر گفت بدون اون ادامه بده → ادامه بده، ولی تو DoD ⚠️ ثبت کن.

❌ ممنوع: step رو skip کنی و کد بزنی.
❌ ممنوع: بعداً معلوم شه pipeline اجرا نشده.
```

**اعلام اجباری، قبل از اولین Edit:** یه خط بنویس —
`dev-implement | tier N | dev-engine: <version> | doctor: <ok|warn|fail>`
اگه این خط رو ننوشتی، یعنی pipeline اجرا نشده و حق نداری کد بزنی.

---

## مرحله ۰ — resolve کردن root و باینری (هر دو اجباری)

### الف) project root — **همیشه repo root، نه subdirectory**

```bash
ROOT="$PWD"
while [ "$ROOT" != "/" ]; do
  [ -f "$ROOT/.dev-engine.json" ] && break
  ROOT=$(dirname "$ROOT")
done
[ "$ROOT" = "/" ] && ROOT="$PWD"
echo "project root: $ROOT"
```

> **⚠️ چرا repo root و نه `src/`:** آرگومان `path` هم‌زمان root اسکن فایل و root
> حل‌کردن config/cache است (`.dev-engine.json`، `.claude/context/figma-resolve.json`).
> اگه `"$ROOT/src"` بدی، دنبالشون تو `src/.claude/context/` می‌گرده، پیدا نمی‌کنه، و
> خروجی **بی‌هیچ خطایی «۰ issue»** می‌شه — یعنی «هیچی چک نشد»، نه «چک شد و تمیز بود».
> **همیشه `dev-engine "$ROOT"`.** برای محدود کردن دامنه از `--changed` استفاده کن، نه از مسیر زیرشاخه.

### ب) باینری dev-engine — هرگز اینجا متوقف نشو

```bash
DE=$(command -v dev-engine || echo "node $HOME/Documents/GitHub/dev-stack/packages/dev-engine/dist/cli.js")
$DE --version || (cd "$HOME/Documents/GitHub/dev-stack/packages/dev-engine" && npm run build && npm link)
```

از این به بعد **همه‌جا `$DE` بزن**، نه `dev-engine` خام. اگه build+link هم شکست →
**RULE 0 مسیر ۲** (به کاربر بگو، صبر کن). ❌ «نصب نیست پس ادامه می‌دم» ممنوع.

---

## STEP -1 — scope triage (اول هر چیز — route کن)

قبل از هر pipeline، tier تغییر رو تعیین کن. **اکثر تغییرها Tier 2 نیستن** —
pipeline کامل (fetch + screenshot) فقط برای surface نو از Figma لازمه.

| Tier | چیه | مسیر |
|------|-----|------|
| **0 — trivial** | متن، rename، comment، config | فقط Edit → STEP 5 (commit). **STEP 0-4 رو بپر.** |
| **1 — code/style** | prop، token، spacing، bugfix، refactor، ریسپانسیو روی component موجود — **بدون Figma نو** | Edit → `$DE "$ROOT" --changed --fix` → STEP 5. **STEP 2 (Figma fetch) و screenshot رو بپر.** |
| **2 — Figma→code نو** | frame/page/component نو از Figma، یا pixel-match با spec | کل STEP 0→5 پایین. |

- **screenshot/visual-diff = فقط Tier 2** یا وقتی کاربر صریح خواست. Tier 0/1 → CLI verify کافیه.
- **شک؟ → tier پایین‌تر.** وسط کار بزرگ‌تر شد → escalate به Tier 2.
- مرجع: `knowledge/universal/scope-triage.md` · gate همیشه‌فعال در `CLAUDE.md` پروژه.

> Tier 0/1 از همین STEP -1 خارج شو. ادامه‌ی STEP 0→5 پایین **فقط Tier 2**ـه.

---

## LAYER 0 — gate (always-on، فقط یادآوری)

این قوانین در `CLAUDE.md` پروژه همیشه‌فعال‌ان. اینجا فقط reminder:
- **Figma tool fail → STOP.** حدس نزن، محتوا از خودت نساز.
- **Component Resolution:** Local → DS → Build last. کامپوننت DS رو از div خام rebuild نکن.
- صفر hardcode. logical CSS props. RTL DOM order.

---

## STEP 0 — preflight (CLI)

```bash
$DE doctor "$ROOT"
```
- **✗ hard-fail** (config/DS نصب نیست) → **RULE 0**. کد نزن.
- **⚠ warn** (figma_source/cache نیست) → ادامه مجازه ولی تو DoD ثبتش کن.

اگه `figma_source` تنظیم نشده و اول پروژه‌ست → از کاربر بپرس: **MCP یا REST؟** → در `.dev-engine.json` ذخیره کن.

---

## STEP 1 — context load (local، نه MCP)

```bash
[ -f "$ROOT/.claude/context/figma-resolve.json" ] || $DE figma-sync "$ROOT" --scan
cat "$ROOT/.claude/context/project-context.md" 2>/dev/null
```
+ skill `<project>-context` رو load کن (tokens، breakpoints، feature flags).

→ token/component map از cache local میاد. **MCP برای این صدا نزن.**

---

## STEP 2 — Figma fetch (هدفمند، نه scatter)

فقط **frame مورد نظر** رو بگیر:
- `get_design_context` / `get_screenshot` / `get_variable_defs` — فقط همون node.
- چند call پراکنده نزن. یه‌بار، هدفمند.
- **fail → LAYER 0 gate (STOP).**

**⚠️ Variant sweep (اجباری):** هر component **مجزا** رو از **node خودش** بگیر —
نه instance ساده‌شده‌ی داخل parent. همه‌ی state/variant رو enumerate کن:
**Default / Hover / Focus / Selected / Open / Disabled**. دکمه‌های hover-only،
border focus، bg selected اغلب فقط در component اصلی‌ان نه در instance صفحه.
**ندیدی ≠ نیست → fetch کن، حدس نزن.**

### جدول ترجمه — **اجباری، قبل از هر خط کد**

بلافاصله بعد از `get_screenshot` و **قبل از** STEP 3. برای هر المان جهت‌دارِ آن node
یک ردیف بنویس. تا جدول پر نشده، کد نزن. ~۲۰ ثانیه، صفر tool call.

| # | المان | در طرح دیده می‌شود | ترجمه | مقدار در کد |
|---|-------|---------------------|-------|-------------|
| ۱ | عنوان کارت | راست‌چین | راست در RTL = `start` | `textAlign="start"` |
| ۲ | Badge وضعیت | گوشهٔ **چپ**-بالا | چپ در RTL = `end` | `insetInlineEnd` + `top` |
| ۳ | دکمه با آیکون ✓ | آیکون سمت **راستِ** متن | راست‌ترین = اولین فرزند | `<Check/>` اول ← بعد متن |

```
❌ ممنوع: ستون «در طرح دیده می‌شود» را از خروجی get_design_context بنویسی
          → آن کد با فرض LTR تولید شده؛ ترجمهٔ غلط است نه داده. از screenshot بخوان.
❌ ممنوع: ستون «ترجمه» را حذف کنی چون «بدیهی» است
          → همین ستون فلیپ را از فرض ضمنی به تصمیم نوشته‌شده تبدیل می‌کند.
❌ ممنوع: در یک تصحیح، هم‌زمان ترتیب DOM و مقدار logical را عوض کنی
          → یا خنثی می‌شوند یا دوباره برعکس. هر بار فقط یک متغیر.
✅ اجباری: حداقل یک برچسب/دکمهٔ کوتاه در جدول باشد
          → المان w="full" جابه‌جا نمی‌شود و باگ جهت را پنهان می‌کند.
✅ اجباری: هر container افقیِ تودرتو ردیف خودش را دارد — قاعده بازگشتی است.
```

**چرا لازم است** (مکانیزم دابل-فلیپ، قانون ترجمه، استثناها) →
`knowledge/universal/language.md` § «دابل-فلیپ». **منبع canonical — تکرارش نکن.**

جدول را در DoD گزارش کن: چند ردیف، کدام‌ها `end` شدند و چرا.

---

### ترتیب و سمت را **حساب** کن، با چشم نخوان (اختیاری ولی ارزان)

ستون «در طرح دیده می‌شود» را از screenshot می‌نویسی — و همان‌جاست که چشم اشتباه
می‌کند (پنج incident). برای هر ردیفی که مطمئن نیستی، به‌جای نگاه‌کردن، از هندسه
حساب بگیر:

```bash
# خروجی get_metadata همون node رو در یه فایل بریز، بعد:
$DE layout-derive "$ROOT" --metadata /tmp/meta.xml --node 2659:82005
```

برای هر container چاپ می‌کند: `layoutMode` · `justify`/`align` **semantic** ·
و ترتیب صحیح DOM (اولین = راست‌ترین در RTL). بازگشتی است — هر container تودرتو
ردیف خودش را دارد، چون قاعده بازگشتی است.

چیزی نمی‌نویسد و هیچ چک خودکاری نمی‌سازد؛ فقط جدول ترجمه را پر می‌کند.
**تأیید نهایی همچنان مقایسهٔ preview با طرح است** (STEP 4b).

---

## STEP 3 — implement

درخت Figma رو از بالا بگرد. هر node:

```
۱. resolve:  $DE resolve "<ComponentName>"
     hit  → import کن (Local یا DS — هر چی cache گفت)، STOP descend
     miss → DS MCP بپرس (props) → آخر Build از primitives DS
۲. token:    از figma-resolve / tokens.ts. صفر hardcode رنگ/spacing/font.
۳. responsive: breakpoints از project-context (mobile/desktop/wide).
۴. RTL:      **از جدول ترجمه (STEP 2) بخون — دوباره تصمیم نگیر.**
             هر مقدار جهت‌دار باید ردیف متناظر در جدول داشته باشه؛ نداشت →
             برگرد جدول رو کامل کن، از ذهنت پرش نکن.
             logical props (insetInlineEnd)، DOM order (first=rightmost، بازگشتی).
             heuristic شخصی («grip میره چپ») ممنوع. مقدار خام از خروجی Figma کپی نکن.
۵. states:   هر state رو پیاده کن (hover/focus/selected/disabled)، نه فقط default.
             UIِ خارج از frame (empty/loading/error) هم Resolution داره:
             اول DS (مثلاً Chakra EmptyState) → آخر Build. از primitive نساز اگه DS داره.
```

composite موجود رو از اجزاش rebuild نکن — کلش import کن.

---

## STEP 4 — verify (CLI-first، loop تا تطابق یا سقف)

```bash
$DE "$ROOT" --changed --fix    # code checks + auto-fix + build-git
```

> مسیر = **repo root**. هرگز `"$ROOT/src"` — دلیلش در مرحله ۰-الف.

این یه‌بار اجرا نیست — **حلقه‌ست، با شرط توقف قطعی، نه با تشخیص خودت:**

۱. اجرا کن، تعداد violation باقی‌مونده رو بشمار.
۲. صفره → برو STEP 5.
۳. صفر نیست:
   - **auto-fixable** → `--fix` خودش زد، دوباره از ۱ اجرا کن.
   - **manual** → خودت edit کن مطابق پیام violation (نه حدس)، دوباره از ۱.
۴. **سقف ۴ iteration** یا اینکه تعداد violation نسبت به دور قبل کم نشد (گیر کرده/نوسان) — هرکدوم زودتر رسید، حلقه رو نگه دار.
۵. به سقف رسیدی و صفر نشد → **STOP**، به کاربر بگو کدوم violationها موندن، ⚠️ نه ✅ تو DoD. حدس نزن، ادامه‌ی خودسرانه ممنوع.
- **build fail → STOP.** روی build شکسته جلو نرو (مستقل از شمارنده‌ی بالا).

**⚠️ «۰ violation» یعنی «قاعده‌ها رعایت شد»، نه «با طرح می‌خونه».**
`dev-engine` فقط قاعده‌ی ثابت را می‌سنجد (فیزیکی ننویس، آیکن اول DOM). هیچ‌کدام
**نمی‌گویند `start` درست است یا `end`** — و کدی که همه‌جا logical است می‌تواند کاملاً
معکوس باشد و همه‌ی چک‌ها سبز بمانند. آن را فقط STEP 4b می‌گیرد.

### STEP 4b — مقایسهٔ preview با طرح (اجباری، Tier 2)

**تنها لایه‌ای که وقتی فهمِ خودت معکوس باشد هم خطا را می‌گیرد.** بقیه‌ی لایه‌ها
می‌سنجند «کد با آنچه *من گفتم* درست است می‌خواند؟» — پس با فهم غلط، سبز می‌مانند.

```
screenshot طرح  ←→  screenshot preview  →  اندازه‌گیری DOM  →  فیکس
```

- **عدد بگیر، به چشم اکتفا نکن:** `getBoundingClientRect()` روی المان و پنل والد.
  راست‌چین درست = `right` المان == `right` پنل.
- **حتماً یک برچسب/دکمهٔ کوتاه بسنج** — المان `w="full"` جابه‌جا نمی‌شود و باگ جهت را پنهان می‌کند.
- **المان ترکیبیِ کوچک** (icon+text، بج، پیل) که در screenshot کل‌صفحه زیر ~۵۰px دیده
  می‌شود → `get_screenshot` **جداگانه** روی همان node با `maxDimension` بالا. استنتاج
  از رندر کل‌صفحه در آن اندازه غیرممکن است.
- **ساختار را هم مقایسه کن، نه فقط جهت** — سلسله‌مراتبِ تخت‌شده و المان جاافتاده
  هیچ ابزار متنی‌ای نمی‌گیرد.

روش دقیق و اندازه‌ها → `CLAUDE.md` پروژه § «تطابق با طرح فیگما».
مکانیزم دابل-فلیپ → `knowledge/universal/language.md`. **منبع canonical، تکرارش نکن.**

---

## STEP 5 — DoD + commit

۱. **Definition of Done** رو point-by-point گزارش بده (از `CLAUDE.md` پروژه):
   - چک skip‌شده = **⚠️ نه ✅**. صادق باش.
   - اضافه بر DoD پروژه، این سه رو هم گزارش کن:
     `dev-engine اجرا شد؟ (نسخه/مسیر)` · `مقایسهٔ preview انجام شد؟ چند المان سنجیده شد؟`
     · `جدول ترجمه: چند ردیف؟ کدام‌ها end شدند و چرا؟`

۲. skill `wf-commit` → دستور commit آماده (هرگز از sandbox git write).

---

## قوانین خطا (BLUEPRINT §3)

| نوع | رفتار |
|-----|-------|
| باینری/cache/step اجرا نشد | **RULE 0** — درست کن یا بپرس. کد نزن |
| env/data/build fail | **hard-STOP** + به کاربر بگو |
| fixable (logical/hardcode) | **auto-fix**، ادامه، گزارش |
| ambiguous/subjective | **از کاربر بپرس** |

هیچ‌وقت بی‌صدا رد نشو. هیچ‌وقت با حدس ادامه نده.
