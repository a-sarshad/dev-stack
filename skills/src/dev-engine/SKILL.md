---
name: dev-engine
description: >
  Run dev-engine on the current project, report violations, and apply auto-fixes.
  Use this skill immediately whenever the user says: "review-fix", "run dev-engine",
  "fix issues", "بررسی کد", "dev-engine بزن", "check and fix", "اصلاح کن",
  or after completing a Figma-to-code implementation or multi-file change.
  ALSO use for direction/RTL auditing of EXISTING code when the user says:
  "audit جهت", "audit جهت بزن", "چک جهت", "direction audit", "چیدمان برعکسه",
  "left/right اشتباهه", "جاهایی که راست/چپ قاطی شده رو پیدا کن" — see the
  «حالت audit جهت» section, which has its own scoping rules and protocol.
  Works for any project — auto-creates .dev-engine.json if missing. Any design system, any direction (RTL/LTR).
---

# dev-engine

Run dev-engine on the project with user-selected options.

---

## Step 1 — Resolve the binary (never stop here)

```bash
DE=$(command -v dev-engine || echo "node $HOME/Documents/GitHub/dev-stack/packages/dev-engine/dist/cli.js")
$DE --version || (cd "$HOME/Documents/GitHub/dev-stack/packages/dev-engine" && npm run build && npm link)
```

Use `$DE` **everywhere below**, never a bare `dev-engine`. If the build+link also
fails, tell the user exactly what failed. **Do not check code and do not report
anything as verified.**

> ❌ Never "it isn't installed, so I'll skip the check and continue."
> A skipped check must surface as ⚠️, never as a silent pass.

---

## Step 2 — Find project root

Walk up from cwd looking for `.dev-engine.json` (preferred) or `package.json`:

```bash
PROJECT_ROOT=$(pwd)
while [ "$PROJECT_ROOT" != "/" ]; do
  { [ -f "$PROJECT_ROOT/.dev-engine.json" ] || [ -f "$PROJECT_ROOT/package.json" ]; } && break
  PROJECT_ROOT=$(dirname "$PROJECT_ROOT")
done
echo "root: $PROJECT_ROOT"
```

If `.dev-engine.json` is NOT at `PROJECT_ROOT` but exists elsewhere (monorepo), use `--config <path>`.

---

## Step 3 — Auto-create .dev-engine.json if missing

If `.dev-engine.json` does NOT exist in `PROJECT_ROOT`:

```bash
$DE init "$PROJECT_ROOT" --auto --yes --no-scaffold
```

`--auto` derives ds / direction / locale / calendar / icon_lib from the codebase
(`package.json` deps, `dir="rtl"` in the entry file, script of the strings) and
prints one evidence line per field. Relay those lines to the user, unchanged.

> Do **not** re-derive any of this yourself. It is a fixed rule set, so it lives in
> `init.ts` — deterministic, free, identical every run. BLUEPRINT §2.

If the user wants to set values by hand ("می‌خوام تنظیمات رو خودم بذارم") drop
`--yes` for the interactive prompts, or pass explicit flags (`--ds`, `--direction`, …)
which always beat detection.

> `--auto` reads `dir="rtl"` from the entry file, so a **bilingual** project shows up
> as `rtl`. If the project really serves both, set `--direction both` explicitly.

---

## Step 4 — Ask options

**Skip this menu and use `--changed --fix` when the run is a verification step of
another workflow** — i.e. invoked from `dev-implement` STEP 4, or right after a
Figma→code / multi-file change. Asking there just burns a turn. Say which mode you
picked in one line and run.

Otherwise (user asked for dev-engine directly), present the menu and wait:

```
dev-engine آماده‌ست. چه حالتی اجرا کنم؟

📂 scope:
  1. همه فایل‌ها (full scan)
  2. فقط فایل‌های تغییر‌کرده (--changed)
  3. watch mode — اجرای خودکار روی تغییر فایل (--watch)

🔧 action:
  4. فقط گزارش (report only — no fix)
  5. گزارش + auto-fix موارد قابل fix (--fix)

🎯 modules (اختیاری — پیش‌فرض: همه):
  6. فقط css-logical-props
  7. فقط dom-order
  8. فقط ds-component-usage
  9. فقط chakra-known-bugs
 10. فقط token-replacer
 11. همه modules (پیش‌فرض)
 12. audit جهت — نامزدهای left/right معکوس در کد موجود (direction-audit)

مثال: «۱ و ۵» = همه فایل‌ها + auto-fix
مثال: «۳» = watch mode (Ctrl+C برای توقف)
```

| انتخاب | flag |
|--------|------|
| changed | `--changed` |
| watch | `--watch` |
| report only | `--report-only` |
| fix | `--fix` |
| specific module | `--module <id>` |
| non-standard config | `--config <path>` |

---

## Step 5 — Run from the repo root

```bash
$DE "$PROJECT_ROOT" [flags] 2>&1
```

> **⚠️ Always pass the repo root — never `./src` or any subdirectory.**
> The `path` argument is simultaneously the file-scan root *and* the root used to
> resolve config and caches (`.dev-engine.json`, `.claude/context/figma-resolve.json`).
> Given a subdirectory, those are looked up under `<subdir>/.claude/context/…`,
> silently missed, and the run reports **"0 issues" without any error** — which
> means "nothing was checked", not "checked and clean". Narrow the scope with
> `--changed`, not with the path.

**If watch mode selected:** run and inform user "در حال watch هستم — Ctrl+C برای توقف". No further steps.

**If zero violations:** report it precisely — `✅ All clean — N files checked`.

> ⚠️ **Never phrase this as "matches the design."** Every module here checks a
> *fixed rule* (`don't write physical`, `icon first in DOM`). **None of them says
> whether `start` or `end` is the correct side.** Code that is logical everywhere
> can be completely mirrored and stay green — that is exactly how five direction
> incidents shipped. Only two layers answer that question, both outside this skill:
> the translation table before the code, and the **preview-vs-design comparison**
> after it (`dev-implement` STEP 4b · project `CLAUDE.md`).

Values are **semantic** (`start`/`end`), never physical. In RTL `start` = right.
Figma's canvas renders LTR, so text that looks right-aligned in Figma is `start`
in an RTL project — mapping it straight to `"end"` inverts every later judgment.

To get that translation out of someone's head, compute it from raw geometry
instead of reading it off a screenshot:

```bash
$DE layout-derive "$PROJECT_ROOT" --metadata dump.xml --node 2659:82005
```
Prints, per container: `layoutMode`, semantic `justify`/`align`, and the correct
DOM order (first child = rightmost in RTL). It writes nothing and feeds no
automated check — it is fuel for the translation table.

---

## Step 6 — Report violations

Grouped by severity:

```
❌ Errors (N):
  file.tsx:12 — [module] message

⚠️  Warnings (N):
  file.tsx:34 — [module] message
```

---

## Step 7 — Manual fix guidance

For each remaining manual violation, one-line actionable fix:

- `css-logical-props` → exact prop + replacement
- `dom-order` → which element moves first in JSX
- `ds-component-usage` → which DS component replaces it
- `chakra-known-bugs` → exact fix
- `direction-audit` → review candidate, not an error — see the audit section below

Offer: "Want me to fix these manually?"

---

## حالت audit جهت — کد موجود (opt-in)

وقتی کاربر می‌خواهد باگ‌های left/right در کدی که **از قبل نوشته شده** پیدا شوند.
با بقیهٔ ماژول‌ها فرق دارد: خروجی «نامزد بازبینی» است نه «خطا»، و **auto-fix ندارد**.

### چرا لازم است

`css-logical-props` و `one-align-idiom` فقط می‌گویند «فیزیکی ننویس» — **نمی‌گویند
`start` درست است یا `end`.** کدی که همه‌جا logical است می‌تواند کاملاً معکوس باشد و
همهٔ چک‌ها سبز بمانند. مرجع مفهومی: `knowledge/universal/language.md` § «دابل-فلیپ».

### دامنه — جدول انتخاب

| کاربر می‌گوید | دستور |
|---|---|
| «audit جهت کل پروژه» | `$DE "$PROJECT_ROOT" --module direction-audit` |
| «audit جهت صفحهٔ X» / یک پوشه | `$DE "$PROJECT_ROOT/src/.../X" --config "$PROJECT_ROOT/.dev-engine.json" --module direction-audit` |
| «audit جهت چیزی که تازه زدم» | `$DE "$PROJECT_ROOT" --changed --module direction-audit` |
| «audit جهت این جدول/کامپوننت» | اجرای کامل روی صفحهٔ **والد**، بعد فیلتر خروجی روی همان فایل |

> ⚠️ **این تنها جایی است که دادن subdirectory مجاز است — و فقط با `--config` صریح.**
> بدون `--config`، هم فایل‌ها اسکن نمی‌شوند هم config پیدا نمی‌شود و خروجی
> `✅ All good — 0 files checked` می‌آید که یک false-negative خطرناک است.
> هرگز مسیر فایل تکی نده (همیشه ۰ فایل می‌دهد). پوشه بده، نه فایل.

> ⚠️ برای «یک جدول داخل صفحه» صفحهٔ والد را اسکن کن، نه فقط همان کامپوننت —
> باگ ممکن است در container والد باشد و با اسکن محدود از دست برود.

### پروتکل (بعد از گرفتن لیست)

```
۱. لیست را بگیر. warningها اول (بدون کامنت جهت)، infoها بعد (کامنت دارند).
۲. screenshot طرح Figma را بگیر — یک بار برای کل frame.
   ❌ خروجی get_design_context مرجع جهت نیست (با فرض LTR تولید شده).
۳. جدول ترجمه بنویس — فقط برای المان‌های flag شده، نه کل صفحه.
   ستون‌ها: المان | در طرح دیده می‌شود | ترجمه | مقدار فعلی | درست؟
۴. فیکس کن — هر بار فقط **یک متغیر** (یا ترتیب DOM یا مقدار logical، نه هر دو،
   وگرنه خنثی می‌شوند یا دوباره برعکس).
۵. تأیید با preview — یک بار برای کل صفحه، نه هر warning.
   همهٔ المان‌ها را در یک پاس بسنج:
     el.getBoundingClientRect().right === parent.getBoundingClientRect().right
   → راست‌چین درست. حتماً یک **برچسب کوتاه** را بسنج؛ w="full" باگ را پنهان می‌کند.
۶. هر موردی که درست بود کامنت جهت بگیرد → دفعهٔ بعد [info] می‌شود نه [warn].
۷. audit را دوباره بزن — هدف: صفر warning.
```

### قیدها

- **هرگز `--fix`.** ماژول عمداً auto-fix ندارد؛ سمت درست فقط از طرح می‌آید.
  سابقه در `src/direction.ts`: auto-fixِ جهت «متن رو به سمت اشتباه می‌برد».
- **هرگز خودت حدس نزن** که `end` درست است یا نه. طرح ندیدی → به کاربر بگو
  node-id بدهد. ادامه دادن بدون طرح ممنوع.
- موردی که `justify` روی ردیفی است که فرزندش `flex="1"` دارد → **no-op**، نه باگ.
  می‌شود حذفش کرد ولی اولویت ندارد؛ همین را به کاربر بگو.
- هزینه به تعداد warning بستگی ندارد، به تعداد **صفحه** — یک screenshot طرح +
  یک preview برای کل صفحه، هرچقدر warning داشته باشد.

---

## Rules

- Resolve the binary (Step 1) before anything else — a missing binary is yours to fix, not the user's to be told about
- Always run from `PROJECT_ROOT`, never a subdirectory — a subdirectory silently disables cache-backed modules
- **تنها استثنای قانون بالا:** `direction-audit` روی یک پوشه، و فقط با `--config` صریح — بخش «حالت audit جهت»
- Show the options menu (Step 4) when the user invoked dev-engine directly; skip it when this is a verification step inside another workflow
- Always dry run first if user chose `--fix` (show what will be fixed before applying)
- A check that did not run is ⚠️, never ✅ — say so explicitly
- `// dev-engine-ignore` or `// dev-engine-disable` / `// dev-engine-enable` for intentional exceptions
