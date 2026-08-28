# {{PROJECT_NAME}} — Claude Reference

> این فایل با `dev-engine init` از قالب shadcn/ui ساخته شده. بخش‌های `TODO:`
> را پر کن. تفاوت این قالب با `_TEMPLATE/CLAUDE-template.md`: بخش
> **Component Resolution** یه قدم اضافه داره (`Block`) — قبل از دیدنش هم
> `../shadcn-ui/README.md` §«مهم‌ترین فکت این DS» رو بخون.

## Knowledge References

→ repo خارجیِ مشترک — **بیرون پروژه است، auto-load نمی‌شود؛ موقع نیاز با Read باز کن.**
ریشه: `{{DK_PATH}}` — مسیرهای جدول زیر نسبت به همین ریشه‌اند.

| موضوع | فایل |
|-------|------|
| مفاهیم جهت (RTL/LTR) | `universal/language.md` |
| Figma→Code workflow | `universal/figma-to-code.md` |
| Scope triage | `universal/scope-triage.md` |
| باگ‌های shadcn/ui (CLI/preset/RTL کلی) | `design-systems/shadcn-ui/known-bugs.md` |
| **تله‌ی یک کامپوننت مشخص** | **`design-systems/shadcn-ui/components/<name>.md`** — قبل از کار جدی روی هر کامپوننت چک کن وجود داره یا نه |
| توکن‌های shadcn/ui | `design-systems/shadcn-ui/tokens.md` |
| کامپوننت‌ها + بلاک‌های آماده | `design-systems/shadcn-ui/components.md` |
| RTL مخصوص shadcn/ui | `design-systems/shadcn-ui/rtl.md` |
| scaffold (init flags، AI skill) | `design-systems/shadcn-ui/scaffold.md` |

**علاوه بر این‌ها**، اگه `.claude/skills/shadcn/` در همین پروژه نصبه (باید
باشه — `scaffold.md`)، اون skill خودکار لود می‌شه و context زنده‌ی پروژه
(`npx shadcn@latest info`) رو می‌ده — روی اون بیشتر از این فایل‌های static
تکیه کن وقتی تعارض دیدی.

→ **محتوای مخصوص همین پروژه — داخل repo، نه knowledge/ مشترک:**

| موضوع | فایل |
|-------|------|
| باگ‌های project-specific | `.claude/context/known-bugs.md` |
| **تصمیم‌های بصری** (grid، layout، responsive، a11y، motion، icon، لحن) | **`DESIGN.md`** (ریشهٔ پروژه) |

---

## Protocols

### Figma Access Gate (اجباری — بالاتر از همه)

**اگه Figma tool خطا داد یا data برنگشت → STOP. هیچ کدی نزن.**
هرگز با حدس ادامه نده؛ هرگز محتوا (text، label، color، layout) از خودت نساز.
اگه بعد از تلاش باز هم نشد → به کاربر بگو و منتظر بمون.

---

### Scope Triage (اجباری — اول هر تغییر)

| Tier | چیه | کار | screenshot؟ |
|------|-----|-----|------------|
| **0 — trivial** | متن/label، rename، comment، config | فقط Edit | ❌ |
| **1 — code/style** | prop، token swap، spacing، bugfix، refactor — بدون surface نو از Figma | Edit + type-check | فقط اگر چیدمان عوض شد |
| **2 — Figma→code نو** | frame/page/component نو، یا تغییری که باید با Figma spec بخوره | کل Protocol پایین | ✅ اجباری |

- **screenshot در Tier 2 اجباری است و بدون پرسیدن انجام می‌شود.**
- **MCP Figma fetch فقط Tier 2.** Tier 0/1 از cache محلی، صفر MCP call.
- شک بین دو tier؟ → پایین‌تر را بگیر، لازم شد escalate کن.

---

### Figma → Code Protocol (فقط Tier 2)

**گام ۰ — جدول ترجمه (اجباری، قبل از هر خط کد):**

بعد از `get_screenshot` و **قبل از** Component Resolution، برای هر المان جهت‌دار یک ردیف
بنویس. تا جدول پر نشده، کد نزن.

| # | المان | در طرح دیده می‌شود | ترجمه | مقدار در کد |
|---|-------|---------------------|-------|-------------|
| ۱ | عنوان کارت | {{START_SIDE}}‌چین | {{START_SIDE}} = `start` | `textAlign="start"` |
| ۲ | Badge وضعیت | گوشهٔ **{{END_SIDE}}**-بالا | {{END_SIDE}} = `end` | `insetInlineEnd` + `top` |

```
❌ ممنوع: ستون «در طرح دیده می‌شود» را از خروجی get_design_context بنویسی
          → آن کد با فرض LTR تولید شده؛ ترجمهٔ غلط است نه داده. از screenshot بخوان.
❌ ممنوع: ستون «ترجمه» را حذف کنی چون «بدیهی» است.
❌ ممنوع: در یک تصحیح، هم‌زمان ترتیب DOM و مقدار logical را عوض کنی — هر بار فقط یک متغیر.
✅ اجباری: حداقل یک برچسب/دکمهٔ کوتاه در جدول باشد — المان full-width باگ جهت را پنهان می‌کند.
```

**Component Resolution (به ترتیب، اجباری — نسخه‌ی shadcn/ui، ۴ قدم):**
```
1. Local  → src/components/ را grep کن. موجوده؟ import کن (نساز).
2. Block  → کل صفحه/section شبیه یه پترن رایجه (dashboard، login، pricing، …)؟
            `npx shadcn@latest search -q "<...>" -t block` را چک کن قبل از
            دستی‌ساختن. نمونه: dashboard-01 (sidebar+cards+chart+table).
3. DS     → کامپوننت تکی از رجیستری shadcn (`npx shadcn@latest add <name>`).
            هیچ‌وقت کامپوننت DS را از HTML/div خام rebuild نکن.
4. Build  → فقط اگه هیچ‌کدوم نبود، با primitives. صفر hardcode.
```

**Token mapping — semantic، نه palette خام:** برای surfaceهای theme-able (bg/border/fg)
هرگز palette خام نذار وقتی توکن semantic معادل وجود داره. hex در light یکیه ولی raw در
dark می‌شکنه — و هیچ gateای این را نمی‌گیرد، پس دستی چک کن.
⚠️ **استثنای شادcn:** `chart-1..5` هم همینه ولی خودِ init آچروماتیک تولید می‌کنه —
اگه spec رنگی می‌خواد، دستی override کن (`shadcn-ui/known-bugs.md`).

---

### Definition of Done (اجباری — آخر هر task)

point-by-point گزارش بده. چک skip‌شده = ⚠️ نه ✅.

- [ ] **جدول ترجمه قبل از کد نوشته شد** (Tier 2) — چند ردیف؟
- [ ] Component Resolution رعایت شد (Local→Block→DS→Build) — کدوم مسیر؟
- [ ] صفر hardcode (رنگ/spacing/font) — همه token
- [ ] type-check سبز — `{{TYPECHECK_CMD}}`
- [ ] **مقایسهٔ preview با طرح** (اجباری برای Tier 2)
- [ ] `dev-engine .` بدون error

---

### تطابق با طرح — از روی preview (اجباری برای Tier 2)

**تنها روش معتبر: screenshot طرح کنار screenshot preview + اندازه‌گیری DOM.**
هیچ استنتاج ذهنی، هیچ محاسبهٔ دستی.

```js
const box = (n) => `l=${Math.round(n.getBoundingClientRect().left)} r=${Math.round(n.getBoundingClientRect().right)}`
// {{START_SIDE}}‌چین درست = لبهٔ {{START_SIDE}} عنصر == لبهٔ {{START_SIDE}} پنل
```

> ⚠️ عنصری که full-width است جابه‌جا نمی‌شود؛ فقط عناصر کوتاه باگ جهت را نشان می‌دهند.
> ⚠️ **screenshot کامپوزیت کل صفحه برای المان‌های کوچک کافی نیست.** المان ترکیبی
> (icon+text، badge، پیل) که در رندر کل‌صفحه کوچک‌تر از ~۵۰px دیده می‌شود → `get_screenshot`
> را **جداگانه روی همان node** با `maxDimension` بالا بگیر.

---

## Direction — مرجع واحد

setup: `dir="{{DIRECTION}}"` + `lang="{{LANG}}"` روی `<html>`.
اگه `rtl: true` در `components.json` ست شده، CLI موقع `add` خودش
physical→logical تبدیل می‌کنه — دستی این کلاس‌ها را ننویس، جزئیات و ۳
استثنای auto-migrate (Calendar/Pagination/Sidebar) → `shadcn-ui/rtl.md`.

### یک فکت، همه‌جا

```
start = {{START_SIDE}}        end = {{END_SIDE}}
```

**ممنوع (dev-engine خودکار error می‌دهد):**

| ننویس | بنویس |
|-------|-------|
| `flex-start` / `flex-end` | `start` / `end` |
| `textAlign="right"` / `"left"` | `"start"` / `"end"` |
| `mr` `ml` `pr` `pl` `right:` `left:` | `me` `ms` `pe` `ps` `insetInlineEnd` `insetInlineStart` |

> استثنا: centering با `left:"50%"` + `translateX(-50%)` — فرمول فیزیکی و جهت‌مستقل است.

### ترتیب DOM

**قاعده:** اولین فرزند DOM = {{START_SIDE}}‌ترین بصری. **بازگشتی است.**

**استثنا:** namespace componentهای DS که خودشان `dir` ست می‌کنند — داخلشان reorder نکن.

### ⛔ قانون طلایی: سمت را ببین، حدس نزن

مسیر درست: screenshot طرح ← جدول ترجمه ← کد ← screenshot preview ← مقایسه ← فیکس.

---

## Stack

- TODO: framework / نسخه (Vite/Next/…)
- Design System: **shadcn/ui** — base: `TODO(radix|base)` · style: `TODO`
- زبان/جهت: {{LANG}} — {{DIRECTION}}
- Package manager: pnpm
- Dev: `pnpm dev` · Build: `pnpm build` · type-check: `{{TYPECHECK_CMD}}`
- AI skill نصب‌شده: `.claude/skills/shadcn/` (از `pnpm dlx skills add shadcn/ui`)

## Critical Rules — project-specific

- TODO: قواعد always-on این پروژه (کامپوننت‌های اجباری، الگوهای ممنوع، …)
- کامپوننت‌های shadcn کدشونه، نه dependency — قبل از "بازنویسی یه کامپوننت"،
  اول چک کن آیا باید فقط `npx shadcn@latest add <x> --overwrite` بزنی.

## UI و طراحی — کجا را بخوان

هر task که **UI، styling، layout، responsive، a11y یا motion** را عوض می‌کند:

1. اول `DESIGN.md` (ریشهٔ پروژه) را بخوان.
2. کامپوننت/بلاک موجود را قبل از ساخت نو جست‌وجو کن (`shadcn search`).
3. توکن استفاده کن؛ رنگ/spacing/radius نو اختراع نکن.
4. تعارض `DESIGN.md` با کد → **کد برنده است**؛ تعارض را گزارش کن و `DESIGN.md` را اصلاح کن.
5. الگوی reusable نو تأیید شد → `DESIGN.md` را آپدیت کن.

## Layout shell

- TODO: مسیر فایل layout اصلی، navbar/sidebar
- قواعد **بصری** این پوسته (اندازه، grid، رفتار responsive) → `DESIGN.md` §Layout

## Token Reference

> مقادیر استاندارد shadcn/ui → `design-systems/shadcn-ui/tokens.md`.
> فقط توکن‌های **مخصوص این پروژه** را اینجا inline کن.
> ⚠️ این جدول canonical است — در `DESIGN.md` تکرارش نکن.

- TODO: brand tokens · منبع در کد: `{{TOKENS_PATH}}` (معمولاً `src/index.css` یا `app/globals.css`)
