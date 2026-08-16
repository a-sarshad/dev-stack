# Skills — راهنمای کامل

این پوشه شامل skill‌های **workflow و dev** که در این repo نگهداری می‌شن.

## سورس و build

```
skills/src/<name>/SKILL.md    ← سورس — اینجا ویرایش کن (در گیت هست)
skills/dist/<name>.skill      ← خروجی build (در گیت نیست)
```

```bash
pnpm build:skills             # check:refs → src → dist
pnpm check:refs               # فقط اعتبارسنجی، بدون build
```

> **نصب:** بعد از build، در اپ Claude روی فایل `skills/dist/<name>.skill`
> کلیک کن → **Save skill**.

### اعتبارسنجی ارجاع‌ها

`build:skills` قبل از zip کردن `scripts/check-refs.mjs` را اجرا می‌کند. اگر
ارجاعی شکسته باشد **build انجام نمی‌شود** — تا skillِ خراب اصلاً نصب نشود.

| چک | منبع حقیقت |
|---|---|
| مسیر فایل/پوشه (`knowledge/…` · `skills/…` · `packages/…`) | فایل‌سیستم |
| لینک نسبی markdown | فایل‌سیستم |
| نام skill داخل بک‌تیک | `skills/src/*` + `externalSkills` |
| زیرفرمان و فلگ `dev-engine` (فقط داخل بلوک bash) | `packages/dev-engine/src/cli.ts` |
| شناسهٔ `--module` | `packages/dev-engine/src/modules/*.ts` |
| نام repoهای قبل از ادغام | ممنوع، مگر در allowlist |

استثنا (مثال، یادداشت تاریخی، skill خارجی) → `scripts/refs-allow.json`. هر ورودی
باید `why` داشته باشد. استثنایی که دیگر چیزی را پوشش نمی‌دهد خودش ⚠ می‌گیرد.

> **⚠ drift:** نسخهٔ نصب‌شده کپی جداست. تا وقتی build + نصب مجدد نکنی،
> ویرایش سورس هیچ اثری ندارد و نسخهٔ قدیمی فعال می‌ماند.
>
> تشخیص drift برای یک skill:
> ```bash
> diff skills/src/<name>/SKILL.md "<مسیر نسخهٔ نصب‌شده>"
> ```

> **توجه:** بخشی از skillها خارج از این repo مدیریت می‌شن:
> - `dev-delivery-check` ← نصب‌شده از anthropic-skills (بدون فایل در این پوشه)
> - Figma skills (`figma-implement-design`، `figma-use`، ...) ← از figma plugin رسمی
> - `ds-chakra-ui` ← از anthropic-skills
>
> **Context skills** (`vitrina-project-context`، `airport-project-context`) حالا **thin-loader**ـن:
> source در همین پوشه، ولی محتوا رو از `Projects/<X>/.claude/context/` می‌خونن (embed نمی‌کنن، drift نمی‌کنن).

---

## فهرست سریع

| Skill | دسته | کاربرد خلاصه |
|-------|------|--------------|
| [wf-start](#wf-start) | workflow | شروع session — briefing وضعیت پروژه |
| [wf-update](#wf-update) | workflow | ذخیره وضعیت + آپدیت HANDOFF/CLAUDE/README — هر پروژه |
| [wf-commit](#wf-commit) | workflow | commit message آماده — هر git repo |
| dev-implement ⭐ | dev | **orchestrator واحد Figma→code** — pipeline کامل، نقطه ورود |
| [dev-init-wizard](#dev-init-wizard) | dev | scaffold پروژه جدید قدم‌به‌قدم |
| [dev-engine](#dev-engine) | dev | اجرای dev-engine — بررسی و auto-fix کد (شامل token/hardcode) |
| vitrina-project-context | context | thin loader — context ویترینا از repo پروژه |
| airport-project-context | context | thin loader — context Airport از repo پروژه |
| [figma-mcp-reconnect](#figma-mcp-reconnect) | figma | وقتی اتصال Figma MCP قطع شده — reconnect خودکار با computer-use |

> **Figma → code:** skill جدا توی این repo نیست. از skill رسمی `figma-implement-design` استفاده کن. قانون اجباری (Component Resolution / DS MCP / DoD) در **CLAUDE.md هر پروژه** هست (always-on). جزئیات: بخش [Figma → Code](#figma--code) پایین.

---

## Workflow Skills — مدیریت session و repo

### wf-start

**فایل:** `wf-start.skill`

**کاربرد:** در شروع هر session کاری، یه briefing سریع از وضعیت پروژه می‌ده — کجا بودیم، آخرین تغییرات چی بود، قدم بعدی چیه.

**چه موقع فعال می‌شه:**
- «بریم سراغ [پروژه]»
- «شروع کنیم» / «ادامه بدیم»
- «کجا بودیم؟» / «وضعیت پروژه چیه؟»
- «start session» / «let's continue» / «where were we»

**خروجی:** briefing ۳-۴ خطی از git log + HANDOFF.md

**وابستگی:** HANDOFF.md پروژه

---

### wf-update

**فایل:** `wf-update.skill`

**کاربرد:** روی **هر پروژه‌ای** کار می‌کنه. وضعیت فعلی رو snapshot می‌کنه — HANDOFF.md رو آپدیت می‌کنه، و اگه تغییر معماری/باگ/ساختار داشتیم CLAUDE.md و README.md پروژه رو هم آپدیت می‌کنه. اگه این فایل‌ها وجود نداشتن کار می‌کنه، اگه وجود داشتن آپدیت می‌کنه.

**چه موقع فعال می‌شه:**
- «آپدیت کن» / «ذخیره کن» / «save کن»
- «وضعیت رو ثبت کن» / «HANDOFF رو آپدیت کن»
- «session-update بزن» / «update کن»

**خروجی:** آپدیت HANDOFF.md + بررسی و آپدیت CLAUDE.md / README.md در صورت نیاز

**تشخیص پروژه:** از workspace folder مانت‌شده، CLAUDE.md در context، یا package.json

---

### wf-commit

**فایل:** `wf-commit.skill`

**کاربرد:** برای **هر git repo** — Vitrina، Airport، dev-stack، یا هر پروژه جدیدی — یه commit message آماده می‌کنه. مسیر رو خودش از context/CLAUDE.md/package.json تشخیص می‌ده. هیچ‌وقت git commit نمی‌زنه — فقط دستور آماده برای copy-paste در Terminal می‌ده.

**چه موقع فعال می‌شه:**
- **خودکار** — بعد از هر عملیات روی فایل‌های هر پروژه
- «commit کن» / «push کن» / «commit message بساز»
- «save کن» / «sync کن» / «بزن رو git»

**خروجی:** دستور `git add -A && git commit -m "..." && git push` آماده برای Terminal

**نکته مهم:** هیچ‌وقت از sandbox git write نمی‌زنه — فقط `git status` می‌خونه

**جایگزین:** این skill جایگزین `wf-commit-dn` و `wf-commit-project` شده — برای DN هم همین skill رو استفاده کن

---

## Dev Skills — کدنویسی و پروژه

### dev-init-wizard

**فایل:** `dev-init-wizard.skill`

**کاربرد:** یه wizard تعاملی برای scaffold کردن پروژه React جدید از صفر. سوال‌به‌سوال پیش می‌ره (نام، DS، RTL، feature flags) و بعد تمام فایل‌های پروژه رو با tokenization کامل می‌سازه.

**چه موقع فعال می‌شه:**
- «پروژه جدید بساز» / «پروژه جدید می‌خوام»
- «scaffold project» / «create new project» / «init project»
- «شروع پروژه» / «پروژه رو راه بنداز» / «ساخت پروژه»

**خروجی:** ساختار کامل پروژه با CLAUDE.md، HANDOFF.md، config files، token setup

**وابستگی:** مشخص کردن DS (Chakra UI / Bootstrap 5) و RTL preference

---

### dev-engine

**فایل:** `dev-engine.skill`

**کاربرد:** dev-engine رو روی پروژه اجرا می‌کنه — violations پیدا می‌کنه، auto-fix می‌زنه، و موارد manual رو راهنمایی می‌کنه. برای هر پروژه‌ای با `.dev-engine.json` کار می‌کنه — هر DS، هر direction.

**چه موقع فعال می‌شه:**
- «review-fix» / «dev-engine بزن» / «run dev-engine»
- «fix issues» / «بررسی کد» / «check and fix» / «اصلاح کن»
- بعد از پیاده‌سازی Figma یا تغییرات چند-فایلی

**خروجی:** گزارش violations (error/warning) + auto-fix + راهنمای manual fixes

**وابستگی:** وجود `.dev-engine.json` در پروژه + نصب `dev-engine` CLI

---

## Figma → Code

> skill اختصاصی `figma-page-implement` **بازنشسته شد**. دلیل: نصب نبود و قانون اجباریش هیچ‌وقت لود نمی‌شد. محتوای اجباریش به دو جای always-on منتقل شد.

**حالا چطور Figma رو کد می‌کنیم:**

| لایه | کجا | نقش |
|------|-----|-----|
| **قانون اجباری (gate)** | `## Figma → Code Protocol` در CLAUDE.md هر پروژه | همیشه‌فعال — Component Resolution + DoD. هیچ‌وقت فراموش نمیشه |
| **مرجع عمیق** | `universal/figma-to-code.md` | فازها، MCP tool names، pitfalls، verification |
| **pipeline قدم‌به‌قدم** | skill رسمی `figma-implement-design` | شتاب‌دهنده — atoms→page |

**کدوم Figma skill کِی:**

| می‌خوای... | skill |
|-----------|-------|
| Figma → کد (پیاده‌سازی) | `figma-implement-design` + gate پروژه |
| کد/ایده → Figma (طراحی) | `figma-generate-design` (+ `vitrina-figma-rules` برای Vitrina) |
| اجرای JS در Figma | `figma-use` (prerequisite) |
| library در Figma | `figma-generate-library` |
| اتصال کد ↔ Figma | `figma-code-connect` |

**اصل:** قانونِ «نباید فراموش شه» → CLAUDE.md پروژه (always-on). skill = شتاب، نه منبع قانون.

---

## Figma — نگهداری اتصال

### figma-mcp-reconnect

**فایل:** `figma-mcp-reconnect.skill`

**کاربرد:** وقتی اتصال Figma MCP قطع شده (وضعیت «needs authentication» یا خطای auth روی هر Figma tool)، این skill مراحل کلیک‌کردن در تنظیمات Claude Desktop رو با computer-use خودکار می‌کنه تا فرآیند reconnect شروع بشه. اگه صفحه‌ی OAuth فرم لاگین (ایمیل/پسورد) نشون بده، **هیچ‌وقت credential وارد نمی‌کنه** — متوقف می‌شه و از کاربر می‌خواد خودش لاگین کنه.

**چه موقع فعال می‌شه:**
- «figma رو reconnect کن» / «figma قطع شده» / «دوباره به figma وصل شو»
- «figma mcp رو وصل کن»
- خودکار وقتی هر فراخوانی ابزار Figma با خطای auth/not-connected مواجه بشه

**خروجی:** وضعیت اتصال (وصل شد / نشد و چرا) — بعد از ۲-۳ تلاش ناموفق، مراحل دستی رو به کاربر می‌گه (Settings → Connectors → Figma → Reconnect) به جای تلاش بی‌پایان

**وابستگی:** دسترسی computer-use برای اپ Claude + ابزارهای `mcp__claude-in-chrome__*` برای مرحله OAuth مرورگر

**محدودیت شناخته‌شده:** قطع‌شدن مکرر اتصال Figma MCP یه مشکل token persistence سمت پلتفرمه، نه چیزی که این skill ریشه‌ای حلش کنه — فقط فرآیند reconnect رو سریع‌تر می‌کنه.

---

## نحوه استفاده از یه skill جدید

۱. فایل `.skill` رو نصب کن (Save skill در Cowork)
۲. در session بعدی، skill به طور خودکار در لیست available skills هست
۳. Claude بر اساس trigger phrases خودش load می‌کنه

## ساختن skill جدید

از skill `skill-creator` در Cowork استفاده کن.
