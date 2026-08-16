# BLUEPRINT — قانون اساسی سیستم

> **این فایل چیه:** نقطه‌ی مرجع واحد برای کل سیستم. هر وقت گیج شدی
> «این فایل کجا بره؟»، «این قانون کجا زندگی کنه؟»، «فلوی Figma→code دقیقاً چیه؟»
> — جواب اینجاست. این سند مقصد (target) رو تعریف می‌کنه، نه لزوماً وضع فعلی رو.
> updated: 2026-06-04

---

## ۰. مشکلی که این سند حل می‌کنه

دانش پخش شده روی ۳ repo و چند لایه. مراحل Figma→code زیاد شده.
ریسک: چیزی وسط کار فراموش بشه، یا فایل اشتباه جای اشتباه ساخته بشه.

**اصل بنیادی:** چیزی که نباید فراموش شه، نباید فقط «نوشته» بشه —
باید **اجراشونده** بشه. نوشته فراموش می‌شه؛ CLI که step به step اجرا می‌شه
و وسط fail می‌کنه، نمی‌تونه فراموش کنه.

→ راه‌حل sprawl: **کمتر کردن + یک نقطه‌ی ورود واحد**، نه اضافه کردن فایل.

---

## ۱. دو repo — سه مسئولیت (هیچ overlap)

> **تغییر ۱۴۰۵/۰۵:** `dev-agents` و `dev-knowledge` در یک مونوریپو به نام
> `dev-stack` ادغام شدند. دلیل: وابستگی دوطرفه بود (engine مسیرهای knowledge را
> می‌خواند، knowledge به CLI ارجاع می‌داد) ولی تغییر هماهنگ در یک commit ممکن
> نبود. مسئولیت‌ها همان سه‌تای قبلی‌اند — فقط دو تای اولی حالا هم‌ریپو هستند.

| محل | مسئولیت واحد | چی توش هست | چی **نباید** توش باشه |
|-----|--------------|-----------|----------------------|
| `dev-stack/packages/` | **ENGINE** — همه‌ی check دترمینیستیک (صفر توکن) | dev-engine CLI + subcommandها | دانش، context، قانون نرم |
| `dev-stack/knowledge/` + `dev-stack/skills/` | **دانش cross-project** + source اسکیل‌ها | universal/، design-systems/، skills/src/ | context یک پروژه‌ی خاص |
| `Projects/<X>` | **قانون + context خودِ پروژه** | CLAUDE.md (always-on)، .claude/context/، .dev-engine.json | دانشی که روی همه پروژه‌ها صدق می‌کنه |

**قانون طلایی جای فایل:**
```
روی همه پروژه‌ها صدق می‌کنه؟        → knowledge/universal یا packages/dev-engine
فقط یک پروژه؟                       → repo همون پروژه
باید هرگز فراموش نشه؟               → CLAUDE.md پروژه (always-on)
check دترمینیستیک (قابل اجرا)؟      → packages/dev-engine (CLI)
شتاب‌دهنده‌ی فلو (نه منبع قانون)؟   → skills/src/
```

---

## ۲. چهار لایه‌ی قابلیت اطمینان (کِی چی لود می‌شه)

| لایه | محل | کِی لود می‌شه | برای چی | ریسک فراموشی |
|------|-----|---------------|---------|--------------|
| **RULE** | `{project}/CLAUDE.md` | هر پیام، خودکار | gate اجباری + DoD | صفر |
| **ENGINE** | `dev-agents` (dev-engine) | وقتی CLI صدا زده شه | check + auto-fix | صفر (fail-hard) |
| **REFERENCE** | `knowledge/*.md` | وقتی صریح read شه | دانش عمیق | بالا — فقط on-demand |
| **ACCELERATOR** | `skills/*.skill` | فقط trigger match | orchestration فلو | متوسط — اگه trigger نخوره |

> **duplication بین لایه‌ها = منبع گیجی.** هر فکت فقط **یک خونه** داره.
> مثال: قانون «token نه hardcode» → خونه‌اش `token-replacer` در dev-engine (ENGINE) +
> یک خط در gate (RULE). توضیح عمیقش در figma-to-code.md (REFERENCE). تکرار کامل ممنوع.

---

## ۳. Pipeline واحد Figma → Code

**یک نقطه‌ی ورود:** skill `dev-implement` (جایگزین figma-impl-checklist + impl-session پیشنهادی).
این skill ترتیب رو enforce می‌کنه — step‌ها رو نمی‌شه پرید.

```
USER: "این frame رو implement کن: [Figma URL]"
   │
   ▼
┌─ LAYER 0 — AUTO (بدون trigger) ───────────────────────────┐
│ {project}/CLAUDE.md gate همیشه فعال:                       │
│  ✓ Figma tool fail → STOP، حدس نزن                         │
│  ✓ Component Resolution order: Local → DS MCP → Build last │
└────────────┬───────────────────────────────────────────────┘
             ▼
┌─ STEP 0 — PRE-FLIGHT (CLI) ──────────────────────────────┐
│ dev-engine doctor                                          │
│  ✓ DS installed?  ✓ figma-resolve.json fresh?            │
│  ✓ cache موجود؟  → fail-hard اگه چیزی کمه                │
└────────────┬───────────────────────────────────────────────┘
             ▼
┌─ STEP 1 — CONTEXT LOAD (Claude reads LOCAL، نه MCP) ──────┐
│ reads: figma-resolve.json (Local + DS، merge شده)         │
│ reads: {project}/.claude/context/project-context.md       │
│  → token/component map از local cache؛ صفر MCP call       │
└────────────┬───────────────────────────────────────────────┘
             ▼
┌─ STEP 2 — FIGMA FETCH (targeted، نه scatter) ────────────┐
│ MCP: فقط frame مورد نظر + componentهای داخلش              │
│  → checklist مخصوص این frame ساخته و pin می‌شه           │
└────────────┬───────────────────────────────────────────────┘
             ▼
┌─ STEP 3 — IMPLEMENT (Claude) ────────────────────────────┐
│  Resolution: dev-engine resolve → DS MCP → Build last     │
│  Token: از figma-resolve.json local، صفر hardcode         │
│  Responsive: breakpoints از snapshot/map                   │
│  RTL: logical props، DOM order (ref: universal/language.md)│
└────────────┬───────────────────────────────────────────────┘
             ▼
┌─ STEP 4 — VERIFY (CLI-first) ────────────────────────────┐
│ dev-engine ./src --changed --fix   ← code checks + auto-fix  │
│ dev-engine dod / build-git         ← build + DoD + git state │
│ dev-engine visual-diff (اختیاری)   ← screenshot vs Figma     │
└────────────┬───────────────────────────────────────────────┘
             ▼
┌─ STEP 5 — COMMIT ────────────────────────────────────────┐
│ skill wf-commit → دستور آماده (هرگز از sandbox)           │
└───────────────────────────────────────────────────────────┘
```

**DS-agnostic چطوریه:** هر چیز DS-specific از `.dev-engine.json` (`ds: chakra-v3`)
و MCP خونده می‌شه — نه hardcode در flow. همین pipeline برای Bootstrap/Chakra/هر DS کار می‌کنه.

**تقسیم کار CLI vs Claude:**
- **CLI (dev-agents):** preflight، token-sync، dod، build-git، visual-diff — هر چیز دترمینیستیک
- **Claude:** فقط STEP 1-3 (read context، Figma fetch، implement)
- **skill `dev-implement`:** orchestrator — step‌ها رو به ترتیب صدا می‌زنه، نمی‌پره

**STEP -1 — scope triage (اول هر چیز):** pipeline کامل فقط برای **Tier 2** (surface نو از Figma).
Tier 0 (trivial) = فقط Edit. Tier 1 (code/style، بدون Figma نو) = Edit + `--changed --fix`، **بدون fetch، بدون screenshot**.
screenshot/visual-diff = opt-in، نه default. خونه‌ی canonical: `universal/scope-triage.md`؛ gate همیشه‌فعال در `{project}/CLAUDE.md`؛ route در skill `dev-implement` STEP -1.

---

## ۴. درخت تصمیم — «این چیز کجا بره؟»

```
یه فکت/قانون/فایل جدید داری؟
│
├─ قابل اجرا با grep/script هست؟ (check دترمینیستیک)
│   └─ بله → dev-agents: dev-engine module یا subcommand
│
├─ روی همه پروژه‌ها صدق می‌کنه؟
│   ├─ بله، DS-agnostic → knowledge/universal/
│   └─ بله، DS-specific → knowledge/design-systems/<ds>/
│
├─ فقط یک پروژه؟
│   ├─ قانون اجباری (نباید فراموش شه) → {project}/CLAUDE.md
│   └─ context/reference          → {project}/.claude/context/
│
└─ شتاب‌دهنده‌ی فلو؟
    └─ skill (source در skills، نصب global در Cowork)
```

---

## ۵. جای skillها و contextها (تصمیم Cowork)

**واقعیت Cowork:** skill با کلیک روی `.skill` به‌صورت **global** نصب می‌شه
(نه per-project). پروژه‌ها `.claude/skills` ندارن.

نتیجه:
- **source اسکیل** → مرکزی در `skills/` می‌مونه (یک‌جا مدیریت/نصب)
- **محتوای project-specific** → از dev-knowledge منتقل می‌شه به repo خود پروژه:
  `{project}/.claude/context/`
- **skill project-context** → یه loader نازک می‌شه که محتوا رو از repo پروژه read می‌کنه،
  نه اینکه خودش محتوا نگه داره (پایان duplication)

> **توجه:** CLAUDE.md ویترینا الان ~۲۵KB‌ـه — خودش بزرگه. محتوای بیشتر
> **نباید** بره توش. context تفصیلی → `.claude/context/`، فقط قانون اجباری → CLAUDE.md.

---

## ۶. Figma Sync + Cache + Resolution

> هسته‌ی صرفه‌جویی توکن. **یک‌بار pull، بعد همیشه local.**

### ۶.۱ منبع — MCP اول، REST دوم

| منبع | کِی | هزینه Claude token |
|------|-----|-------------------|
| **MCP** (default) | هر جا MCP server هست | یه‌بار، کم |
| **REST** (fallback) | پروژه‌ی بدون figma/DS MCP | صفر (CLI native، نیاز `FIGMA_TOKEN`) |

«MCP» دوتاست — هر کدوم یه محور:
- **Figma MCP** → Variables، design context، Code Connect map
- **DS MCP** (chakra-ui) → component props، default theme

**اول پروژه یه‌بار پرسیده می‌شه** → ذخیره در `.dev-engine.json`، **session بعد دوباره نمی‌پرسه**:
```jsonc
{ "figma_source": "mcp",        // یا "rest"
  "figma_file_key": "...",
  "ds_mcp": "chakra-ui" }
```

### ۶.۲ cache = یک قرارداد، دو producer

CLI نمی‌تونه MCP بزنه. پس دو مسیر تولید، یک فرمت خروجی:
```
مسیر MCP :  Claude می‌کشه (MCP) → فایل cache می‌نویسه
مسیر REST:  dev-engine می‌کشه (REST) → فایل می‌نویسه
            └── خروجی هر دو هم‌فرمت → بعدش CLI + Claude فقط read
```

### ۶.۳ دو لایه cache — split بر اساس مالکیت

| لایه | چی | کجا | shared |
|------|----|----|--------|
| **DS** | DS comp→import + DS var→token | `dn/design-systems/<ds>/figma-resolve.json` | ✅ همه پروژه‌های اون DS |
| **Local** | comp/token/var مخصوص پروژه | `<project>/.claude/context/figma-resolve.json` | ❌ |

**merge با precedence Local-first** — آینه‌ی gate Component Resolution (Local → DS).

فرمت (هر دو محور تو یه فایل):
```jsonc
{ "components": { "Button": "@chakra-ui/react#Button" },
  "tokens":     { "color/primary/500": "colors.primary.500" },
  "variables":  { },
  "_synced": "2026-06-04", "_source": "mcp" }
```

> **چرا دو فایل نه یکی:** قانون scope (shared→dn، project→repo) + DRY (cache DS یه‌بار ساخته، هر پروژه‌ی اون DS استفاده می‌کنه) + آینه‌ی ترتیب resolution.
> لایه DS نیمه‌موجوده: `components.md` + `tokens.md` الان هستن؛ figma-resolve فقط **نگاشت Figma→code** رو روش اضافه می‌کنه.

### ۶.۴ Resolution — top-down، stop-at-match

Claude درخت Figma رو از بالا می‌گرده. هر node:
```
instance یه component شناخته‌شده‌ست؟ (figma-resolve: Local → DS)
  → بله → import کن، STOP (داخلش dive نکن)
  → نه  → برو تو، از بچه‌ها بساز (Build last)
```
به‌محض match توقف. **composite موجود رو از اجزاش rebuild نمی‌کنه.**

مثال: Figma instance «ProductCard» (local، داخلش Chakra Box+Button) → resolve به `@/components/settings/ProductCard` → `<ProductCard/>` نوشته می‌شه، تموم. Box/Button جدا ساخته نمی‌شن (داخل ProductCard‌ان).

detection = scan `src/components/` (اسم→path). لازم نیست داخل composite رو بفهمه — فقط اینکه وجود داره.

### ۶.۵ Resolution ≠ Check — دو لایه‌ی جدا (اشتباه نگیر)

| سوال | لایه | ابزار |
|------|------|-------|
| component رو **استفاده** کنم؟ | resolution | figma-resolve (top-level match) |
| داخلش **درست** نوشته؟ (DS نه div، token نه hardcode) | check | dev-engine modules: `ds-component-usage`، `token-replacer` |

«local از DS استفاده کرده» برای **استفاده** بی‌ربطه (کلش import می‌شه)؛ برای **صحت داخل** کار module‌های check‌ـه.

### ۶.۶ staleness + edge

- `_synced` timestamp تو cache. `dev-engine doctor` چک می‌کنه کهنه نشده (مثلاً >۷ روز یا «طراحی عوض شد») → کهنه: re-sync. وگرنه local می‌مونه = صفر pull.
- **edge:** طرح فراتر از توان local component (variant/prop که نداره) → silently rebuild **نمی‌کنه**؛ یا local رو extend یا flag «طرح از component موجود فراتره». (gate: حدس نزن.)

---

## ۷. ساختار مقصد (target tree)

```
dev-stack/                          ← ENGINE
└── packages/dev-engine/
    ├── modules/ (موجود)                   ← token-replacer، css-logical-props، ...
    └── subcommands/ (جدید)
        ├── preflight                       ← env/token/DS ready check
        ├── figma-sync                      ← Figma Variables → local JSON
        └── visual-diff                     ← screenshot vs Figma

dev-stack/knowledge/                        ← دانش cross-project
├── BLUEPRINT.md                            ← همین فایل (constitution)
├── universal/                              ← DS-agnostic
└── design-systems/<ds>/                    ← DS-specific
    ├── components.md، tokens.md (موجود)    ← لیست DS بدون tool call
    └── figma-resolve.json   (generated)    ← لایه DS: Figma→code map (shared)

dev-stack/CLAUDE.md                         ← قوانین کار با خودِ dev-stack
dev-stack/skills/src/                       ← سورس اسکیل‌ها (متن، نه zip)
├── dev-implement/SKILL.md                  ← orchestrator واحد Figma→code
├── dev-engine/SKILL.md
├── wf-*/SKILL.md
└── <project>-context/SKILL.md (نازک)       ← فقط loader، محتوا در repo پروژه
                                               build → skills/dist/*.skill

Projects/<X>/                               ← قانون + context خودِ پروژه
├── CLAUDE.md                               ← فقط قانون اجباری (gate + DoD)
├── .dev-engine.json
└── .claude/context/
    ├── project-context.md                  ← منتقل‌شده از dev-knowledge/projects/<X>/
    ├── known-bugs.md                       ← منتقل‌شده از dev-knowledge/projects/<X>/
    └── figma-resolve.json    (generated)   ← لایه Local: Figma→code map
                                               (merge با لایه DS، Local-first)
```

---

## ۸. نقشه‌ی مهاجرت (فعلی → مقصد)

| # | کار | از | به | نوع |
|---|-----|----|----|-----|
| 1 | محتوای context پروژه‌ها | `dev-knowledge/projects/<X>/` | `Projects/<X>/.claude/context/` | MOVE |
| 2 | skill project-context | محتوای کامل | loader نازک (read از پروژه) | REFACTOR |
| 3 | `dod-check` پیشنهادی | — | حذف (dev-engine پوشش می‌ده) | DROP |
| 4 | ۶ script پیشنهادی | فایل‌های جدا | subcommand‌های dev-engine (`doctor`/`figma-sync`/`visual-diff`) | MERGE → dev-agents |
| 7 | cache توکن/کامپوننت | (نبود) | `figma-resolve.json` دو-لایه (DS+Local، بخش ۶) | BUILD |
| 5 | figma-impl-checklist + impl-session | دو skill | یک skill `dev-implement` | MERGE |
| 6 | duplication قانون token بین لایه‌ها | چند جا | یک خونه (dev-engine + یک خط gate) | DEDUPE |

**ترتیب اجرا (وقتی شروع کردیم):**
1. rename projfix → dev-engine ✓ (انجام شد)
2. اول این BLUEPRINT تثبیت ✓
3. مهاجرت context پروژه‌ها (#1، #2) ✓ — محتوا → `Projects/<X>/.claude/context/`، skillها thin-loader شدن، `projects/` حذف شد
4. extend dev-engine + cache دو-لایه (#4، #7):
   - `doctor` (preflight) ✓ · `resolve` (Figma name→code، صفر MCP) ✓ · `figma-sync --scan/--init/status` ✓ · cache merge Local-first ✓ · seed DS chakra ✓
   - `visual-diff` (نیاز browser dep) — defer · `figma-sync` REST pull (Enterprise-gated) — scaffold فقط
5. ساخت skill `dev-implement` (#5) ✓ — orchestrator واحد، pipeline §3 رو step-by-step enforce می‌کنه
6. حذف/dedupe باقی‌مونده (#3، #6) ✓ — Vitrina: tokens/breakpoints duplicate از context cut شد (canonical → CLAUDE.md، drift بسته شد) · Airport: از قبل split ایده‌آل داشت · dod-check هیچ‌وقت ساخته نشد (DROP بی‌مورد)

---

## ۹. چک‌لیست «آیا درست دارم کار می‌کنم؟»

هر وقت شک کردی:
- [ ] قانونی که نباید فراموش شه، در CLAUDE.md پروژه‌ست؟ (نه فقط skill)
- [ ] check قابل‌اجرا، CLI شده؟ (نه دستی توسط Claude)
- [ ] فکت فقط یک خونه داره؟ (نه duplicate بین لایه‌ها)
- [ ] context پروژه‌ی خاص، در repo همون پروژه‌ست؟ (نه dev-knowledge)
- [ ] فلوی Figma→code از `dev-implement` می‌گذره؟ (نه ad-hoc)

---

## ۱۰. استاندارد package manager — **pnpm** (تصمیم قطعی)

> updated: 2026-06-05 — انگیزه: mixed بودن pm (Vitrina/dev-agents=pnpm، Airport=npm)
> باعث یه باگ شد (dev-engine فرض pnpm سراسری کرد و node_modules npmـی Airport رو آلود).

- **همه‌ی پروژه‌های نو + فعلی → pnpm.** در `dev-init-wizard` bake شده (سؤال نمی‌شه).
  package.json فیلد `packageManager` داشته باشه، لاک‌فایل pnpm-lock.yaml، دستورهای CLAUDE.md `pnpm`.
- **استثنای مستند: Airport → npm** (به‌خاطر rolldown/vite native binding). تا تست dev-server
  روی pnpm پاس نشده، npm می‌مونه. `.dev-engine.json`ش `build_command: "npx tsc --noEmit"` داره.
- **dev-engine چطور pm رو می‌فهمه:** اول `build_command` در `.dev-engine.json`؛ وگرنه از **lockfile** پروژه
  (نه «pnpm سراسری نصبه؟»). هیچ‌وقت build-git نباید روی پروژه‌ی npm، pnpm بزنه (آلودگی node_modules).
