# dev-engine — راهنمای استفاده

ابزار CLI برای بررسی و auto-fix مشکلات کد. بدون Claude کار می‌کنه — صفر توکن.

---

## نصب

```bash
# build + لینک گلوبال (یه بار — بعدش `dev-engine` مستقیم در PATH هست)
cd ~/Documents/GitHub/Tools/dev-agents/packages/dev-engine
npm run build && npm link

# تست
command -v dev-engine && dev-engine --version
```

> **این پکیج روی npm منتشر نشده** — `npm i -g dev-engine` چیز دیگه‌ای نصب می‌کنه.
> تنها راه درست `npm link` از همین پوشه‌ست.
>
> اگه `command -v dev-engine` چیزی برنگردوند، **متوقف نشو و کار رو skip نکن** —
> یا `npm link` بالا رو بزن، یا مستقیم باینری build‌شده رو صدا کن:
> ```bash
> node ~/Documents/GitHub/Tools/dev-agents/packages/dev-engine/dist/cli.js <args>
> ```
> سابقه: 1404 — چون اسکیل‌ها `command -v dev-engine` می‌زدن و «نصب نیست → stop»
> می‌گفتن، یه session کامل بدون هیچ چکی کد زد و بعداً معلوم شد pipeline اصلاً اجرا نشده.

---

## راه‌اندازی پروژه

`.dev-engine.json` را در root پروژه (کنار `package.json`) بساز:

```json
{
  "direction": "rtl",
  "locale": "fa-IR",
  "calendar": "jalali",
  "ds": "chakra-v3",
  "icon_lib": "lucide",
  "ignore": ["node_modules", "dist", "build", "public"]
}
```

| فیلد | مقادیر |
|------|--------|
| `direction` | `rtl` · `ltr` · `both` |
| `ds` | `chakra-v3` · `chakra-v2` · `mui` · `antd` · `mantine` · `generic` |
| `icon_lib` | `lucide` · `heroicons` · `fa` · `generic` |

> **سریع‌تر:** `dev-engine init` رو اجرا کن — سوال‌به‌سوال پیش می‌ره و فایل رو می‌سازه.
> اگه `.dev-engine.json` نباشه، skill `dev-engine` آن را auto-detect و می‌سازه.
>
> `init` علاوه بر config، **کل harness پروژه** را هم scaffold می‌کند ↓

---

## ⚠️ اجرای صحیح — `path` هم scan-root است هم config/cache-root

آرگومان `path` که به `dev-engine` می‌دی، هم‌زمان **هم** root اسکن فایل‌هاست **هم** root حل‌کردن
`.dev-engine.json` و کل `.claude/context/*` (`figma-resolve.json`, ...).
اگه یه subdirectory بدی (نه repo root) — مثلاً `dev-engine ./components/foo` — این cacheها
silently پیدا نمی‌شن (چون دنبالشون تو `./src/components/foo/.claude/context/...` می‌گرده) و
خروجی بدون هیچ خطایی «۰ issue» می‌شه. این یعنی «هیچی چک نشد»، نه
«چک شد و تمیز بود» — یه false-negative بی‌صدا.

**همیشه از repo root اجرا کن، حتی برای چک یه subfolder خاص:**
```bash
cd <repo-root>
dev-engine .              # نه dev-engine ./components/foo
```

اگه `dev-engine` global لینک نشده (دستور خام «command not found» می‌ده)، باینری build‌شده رو
مستقیم با `node` صدا بزن:
```bash
node ~/Documents/GitHub/Tools/dev-agents/packages/dev-engine/dist/cli.js .
```

سابقه: 1404 — پروژه Vitrina، یه session کامل `dev-engine src/components/marketing --fix` زد و
«۰ issue» گرفت؛ بعداً از repo root معلوم شد که cache اصلاً لود نشده بود.
با یه decoy file تأیید شد که از root واقعاً mismatch رو می‌گیره.

---

## دستورات Terminal

```bash
# بررسی کامل src/ — از repo root اجرا کن (بالا رو بخون)
dev-engine .

# فقط فایل‌های تغییرکرده (git diff HEAD)
dev-engine . --changed

# auto-fix موارد قابل fix
dev-engine . --fix

# فقط changed + fix
dev-engine . --changed --fix

# فقط یه module خاص
dev-engine . --module css-logical-props
dev-engine . --module dom-order,chakra-known-bugs

# فقط گزارش بدون خروجی رنگی (برای CI)
dev-engine . --json

# CI — report بدون fail کردن pipeline
dev-engine . --json --exit-zero

# همه فایل‌ها (حتی clean) نمایش بده
dev-engine . --verbose

# config در مسیر دیگه (monorepo)
dev-engine ./packages/ui/src --config ./packages/ui/.dev-engine.json

# watch — اجرای خودکار روی تغییر فایل
dev-engine . --watch

# ساخت .dev-engine.json + scaffold کل harness — interactive
dev-engine init

# همان، غیرتعاملی (برای اسکریپت/agent/CI)
dev-engine init . --yes --ds chakra-v3 --name MyApp --typecheck "pnpm build"
dev-engine init . --yes --direction ltr --ds generic     # پروژهٔ LTR
dev-engine init . --yes --no-scaffold                    # فقط config
```

**`init` چه چیزی می‌سازد:**

| فایل | منبع |
|------|------|
| `.dev-engine.json` | جواب‌های wizard / flagها |
| `CLAUDE.md` | `_TEMPLATE/CLAUDE-template.md` (پایه) **+** `<ds>/CLAUDE-template.md` (مکمل) |
| `.claude/hooks/rtl_gate.py` | کپی از `universal/hooks/rtl_gate.py` |
| `.claude/settings.json` | هوک `Stop` → rtl_gate (اگه فایل باشد **merge** می‌شود، نه overwrite) |
| `.claude/context/{known-bugs,project-context}.md` | stub خالی با ساختار درست |

> **هیچ فایل موجودی overwrite نمی‌شود** — فقط غایب‌ها ساخته می‌شوند و بقیه `⏭` گزارش
> می‌شوند. پس روی یک پروژهٔ زنده هم امن است (برای گرفتن فایل‌های تازه‌اضافه‌شده).
> تنها استثنا `.dev-engine.json` با `--force`.

---

## Figma pipeline subcommands (BLUEPRINT §3، §6)

```bash
# preflight — قبل از impl: env، DS، cache، freshness (hard-fail روی env)
dev-engine doctor ./

# resolve نام Figma → mapping کد (از cache local، صفر MCP/token)
dev-engine resolve Button          # → @chakra-ui/react#Button       (لایه DS)
dev-engine resolve TitleBar        # → @/components/ui/TitleBar#...   (لایه Local)
dev-engine resolve Button --json

# figma-resolve cache (دو لایه)
dev-engine figma-sync ./           # وضعیت DS + Local + شمارش merge
dev-engine figma-sync ./ --scan    # auto-populate لایه Local از scan src/components
dev-engine figma-sync ./ --init    # template خالی در .claude/context/

# layout-derive — سمت و ترتیب را از هندسهٔ خام حساب کن، نه با چشم
dev-engine layout-derive . --metadata dump.xml        # کل دامپ، تا عمق ۳
dev-engine layout-derive . --metadata dump.xml --node 2659:82005
```

**⚠️ قرارداد semantic:** همه‌ی مقادیر جهت‌دار `start`/`end` ان، نه `left`/`right`.
در RTL: `start` = راست · `end` = چپ. canvas فیگما **همیشه LTR** رندر می‌شه، پس
متنی که در فیگما راست‌چین می‌بینی در پروژه‌ی RTL یعنی `start`، نه `end`.
نگاشت مستقیمِ `textAlignHorizontal: RIGHT` فیگما به `"end"` رایج‌ترین خطاست و کل
قضاوت رو معکوس می‌کنه — `layout-derive` این ترجمه رو مکانیکی انجام می‌ده تا از سرِ
آدم دربیاد.

**cache دو-لایه:**
- لایه DS (shared): `dev-knowledge/design-systems/<ds>/figma-resolve.json`
- لایه Local (پروژه): `<project>/.claude/context/figma-resolve.json`
- merge: **Local-first** — local روی DS override (آینه‌ی Component Resolution)
- `resolve` و scan صفر MCP مصرف می‌کنن — همه local

**`.dev-engine.json` فیلدهای Figma:** `figma_source` (mcp|rest)، `figma_file_key`، `ds_mcp`، `import_alias` (پیش‌فرض `@/`)، `dev_knowledge_path` (override).

**تطابق با طرح — چه چیزی این‌جا نیست:** هیچ چکِ CLIای نمی‌گوید «`start` درست است یا `end`».
ماژول‌ها فقط قاعده‌ی ثابت را اعمال می‌کنند («فیزیکی ننویس»، «آیکن اول DOM»). تشخیص سمتِ
درست فقط از دو راه می‌آید: **جدول ترجمه** قبل از کد (که `layout-derive` تغذیه‌اش می‌کند) و
**مقایسهٔ screenshot preview با طرح** بعد از کد.

> زیرسیستم `layout-diff` / `verify-render` / `layout-sync` / `figma-layout.json` در 1405/05
> ریشه‌ای حذف شد: snapshot و کد هر دو از یک خواندنِ screenshot می‌آمدند، پس سبزشدنش هیچ
> اطلاعات مستقلی نداشت — یک تأییدِ خودارجاع که ⚠️ واقعی را در DoD زیر نویز می‌برد.

---

## Aliases — اضافه کن به `~/.zshrc`

```bash
# dev-engine shortcuts
alias den='dev-engine .'
alias denc='dev-engine . --changed'
alias denf='dev-engine . --fix'
alias dencf='dev-engine . --changed --fix'
alias denw='dev-engine . --watch'
alias den-ci='dev-engine . --json --exit-zero'
```

بعد از اضافه کردن: `source ~/.zshrc`

---

## Modules

| Module | کاربرد | DS |
|--------|--------|-----|
| `css-logical-props` | physical props → logical (mr → me، borderRight → borderInlineEnd) | همه |
| `dom-order` | Button: آیکن باید FIRST (leading) باشه — هر دو جهت، Latin+فارسی، multi-line/arrow-fn (`button-icon-after-text`). RTL-only: Switch FIRST + Dialog close `insetEnd` (بالا-چپ) | همه |
| `chakra-known-bugs` | lineHeight="8"، bg.default، noOfLines، NativeSelect | chakra-v3 |
| `ds-component-usage` | raw `<select>`/`<table>` → DS components | chakra-v3 |
| `debug-artifacts` | console.log، debugger، TODO/FIXME | همه |
| `token-replacer` | hardcode → token: hex رنگ + spacing (`padding="16px"` و shorthand چاکرا `p/m/mt/...`) + fontSize/fontWeight/borderRadius · + `raw-palette-on-theme-prop`: palette خام روی bg/border/fg (`teal.50`) → semantic (`brand.bg`) چون dark نمی‌شکنه | همه |
| `persian-numerals` | اعداد لاتین در رشته فارسی + display number بدون locale (comment/scale-prop رو نادیده) | fa-IR |
| `icon-direction` | آیکون‌های جهت‌دار (arrow) در RTL | RTL |
| `build-git` | ۳ چک project-level (نه per-file): **①** `pnpm type-check` / build failure — **②** uncommitted files + unpushed commits — **③** HANDOFF.md staleness (N commits behind) | همه |
| `direction-audit` 🔒 | **opt-in، گزارش‌محض.** فهرست رتبه‌بندی‌شدهٔ نامزدهای جهت‌معکوس در کد **موجود** — هر `end` روی محور افقی. `end-usage-unexplained` (warning) / `end-usage-documented` (info) | همه |

---

### `direction-audit` — ماژول درمانی (opt-in)

```bash
dev-engine . --module direction-audit      # فقط همین ماژول
```

**چرا جداست از بقیه.** `css-logical-props` و `one-align-idiom` فقط می‌گویند «فیزیکی
ننویس» — **نمی‌گویند `start` درست است یا `end`.** کدی که همه‌جا logical است می‌تواند
کاملاً معکوس باشد و همهٔ چک‌ها سبز بمانند؛ دقیقاً همان چیزی که در چهار incident واقعی
رخ داد. آن ماژول‌ها پیشگیرانه‌اند (کار جدید)؛ این یکی درمانی است (کد موجود).

**منطق.** در RTL، `end` یعنی چپ — استثنا، نه قاعده. پس هر `end` روی محور افقی یک
تصمیم آگاهانه بوده که می‌توانسته ترجمهٔ معکوس باشد. ماژول محور را درست تشخیص می‌دهد:
`justify` روی ردیف افقی است، `align` روی ستون افقی است، `textAlign` همیشه افقی.

**رتبه‌بندی.** نامزدی که کامنتِ **جهت‌دار** در ۳ خط بالایش ندارد → `warning` (اول
اینها). نامزدی که دارد → `info`. کامنتِ نامربوط حساب نمی‌شود.

**سه قید طراحی (عمدی، تغییرشان نده):**

1. **هرگز auto-fix.** درست بودن `end` فقط با دیدن طرح معلوم می‌شود. سابقه در کامنت
   `src/direction.ts`: auto-fixِ جهت قبلاً «متن رو به سمت اشتباه می‌برد».
2. **opt-in، نه default.** ~۱۰۰ نامزد روی یک کدبیس متوسط؛ در اجرای عادی errorهای
   واقعی را زیر نویز دفن می‌کند. فیلتر: `OPT_IN_MODULE_IDS` در `engine.ts`.
3. **هرگز severity=error.** خروجی «مشکوک» است نه «غلط»؛ بیشتر نامزدها مشروع‌اند.

**روش استفاده:** لیست warning را بگیر → برای هر مورد screenshot طرح را ببین → اگر
درست بود کامنت جهت بگذار (دفعهٔ بعد `info` می‌شود) → اگر غلط بود `start` کن.
**هر بار فقط یک متغیر** (یا ترتیب DOM یا مقدار logical، نه هر دو).

مرجع مفهومی: `universal/language.md` § «دابل-فلیپ».

---

## Ignore — موارد intentional

```tsx
// یه خط — inline ignore
<NativeSelect.Root size="xs"> // dev-engine-ignore

// یه block — چند خط
// dev-engine-disable
<NativeSelect.Root>
  <NativeSelect.Field>...</NativeSelect.Field>
</NativeSelect.Root>
// dev-engine-enable
```

---

## workflow پیشنهادی

```
پروژه جدید؟
  → dev-engine init (interactive setup .dev-engine.json)
کد نوشتی؟
  → denc (فقط changed — سریع)
  → اگه violation داشت → denf (auto-fix)
  → اگه manual violation موند → Claude skill dev-engine
حین توسعه؟
  → denw (watch mode — auto-rerun روی تغییر)
قبل از commit؟
  → den (full scan)
CI؟
  → den-ci (= dev-engine . --json --exit-zero)
```
