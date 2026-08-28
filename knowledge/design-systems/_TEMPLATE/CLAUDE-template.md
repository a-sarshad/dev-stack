# {{PROJECT_NAME}} — Claude Reference

> این فایل با `dev-engine init` از قالب ساخته شده. بخش‌های `TODO:` را پر کن.
> قواعد **مشترک بین همهٔ پروژه‌ها** اینجا هستند؛ چیزی که مخصوص این پروژه است را
> اضافه کن، ولی قواعد مشترک را حذف نکن — با هر `init` دوباره از قالب می‌آیند.

## Knowledge References

→ repo خارجیِ مشترک — **بیرون پروژه است، auto-load نمی‌شود؛ موقع نیاز با Read باز کن.**
ریشه: `{{DK_PATH}}` — مسیرهای جدول زیر نسبت به همین ریشه‌اند.

| موضوع | فایل |
|-------|------|
| مفاهیم جهت (RTL/LTR) | `universal/language.md` |
| Figma→Code workflow | `universal/figma-to-code.md` |
| Scope triage | `universal/scope-triage.md` |
| باگ‌های {{DS}} | `design-systems/{{DS_FOLDER}}/known-bugs.md` |
| توکن‌های {{DS}} | `design-systems/{{DS_FOLDER}}/tokens.md` |
| کامپوننت‌های {{DS}} | `design-systems/{{DS_FOLDER}}/components.md` |
| جهت در {{DS}} | `design-systems/{{DS_FOLDER}}/rtl.md` |

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
| **2 — Figma→code نو** | frame/page/component نو، یا تغییری که باید با Figma spec بخوره | کل Protocol پایین | opt-in — اول بپرس |

- **screenshot/preview = opt-in، حتی در Tier 2.** اول از کاربر تأیید بگیر
  («preview بگیرم و با طرح مقایسه کنم؟») — قانون global: هیچ‌وقت خودکار preview نگیر.
  type-check سبز + RTL DOM order = کافی برای بستن task؛ مقایسهٔ بصری مرحلهٔ جدا و opt-in است.
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

**Component Resolution (به ترتیب، اجباری):**
```
1. Local first → src/components/ را grep کن. موجوده؟ import کن (نساز).
2. DS second   → از {{DS}} بگیر. هیچ‌وقت کامپوننت DS را از HTML/div خام rebuild نکن.
3. Build last  → فقط اگه هیچ‌کدوم نبود، با primitives. صفر hardcode.
```

**Token mapping — semantic، نه palette خام:** برای surfaceهای theme-able (bg/border/fg)
هرگز palette خام نذار وقتی توکن semantic معادل وجود داره. hex در light یکیه ولی raw در
dark می‌شکنه — و هیچ gateای این را نمی‌گیرد، پس دستی چک کن.

---

### Definition of Done (اجباری — آخر هر task)

point-by-point گزارش بده. چک skip‌شده = ⚠️ نه ✅.

- [ ] **جدول ترجمه قبل از کد نوشته شد** (Tier 2) — چند ردیف؟
- [ ] Component Resolution رعایت شد (Local→DS→Build) — کدوم مسیر؟
- [ ] صفر hardcode (رنگ/spacing/font) — همه token
- [ ] type-check سبز — `{{TYPECHECK_CMD}}`
- [ ] `dev-engine .` بدون error
- [ ] **مقایسهٔ preview با طرح** — Tier 2 (فقط اگر کاربر تأیید کرد؛ وگرنه ⚠️ «preview نگرفتم»)

---

### تطابق با طرح — از روی preview (Tier 2، فقط با تأیید کاربر)

> preview هیچ‌وقت خودکار نیست. اول بپرس «preview بگیرم و با طرح مقایسه کنم؟».
> با «بله» → روش زیر. بدون تأیید → task با type-check سبز + RTL DOM order بسته می‌شود و در DoD ⚠️ ثبت کن.

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

**چرا این وجود دارد:** ابزارهای متنی می‌سنجند «کد با آنچه *من گفتم* درست است می‌خواند؟» —
وقتی خودِ فهم من معکوس باشد، همه سبز می‌مانند. فقط مقایسه با **خود طرح** آن را می‌گیرد.

---

## Direction — مرجع واحد

setup: `dir="{{DIRECTION}}"` + `lang="{{LANG}}"` روی `<html>`.

### یک فکت، همه‌جا

```
start = {{START_SIDE}}        end = {{END_SIDE}}
```

هر جا سمتی را بگویی همین دو کلمه‌اند — در `justify`، `align`، `textAlign`، `alignSelf`،
`ms/me`، `ps/pe`، `insetInlineStart/End`. یک DOM می‌نویسی؛ `dir` خودش flip می‌کند.

**ممنوع (dev-engine خودکار error می‌دهد):**

| ننویس | بنویس |
|-------|-------|
| `flex-start` / `flex-end` | `start` / `end` |
| `textAlign="right"` / `"left"` | `"start"` / `"end"` |
| `mr` `ml` `pr` `pl` `right:` `left:` | `me` `ms` `pe` `ps` `insetInlineEnd` `insetInlineStart` |

> استثنا: centering با `left:"50%"` + `translateX(-50%)` — فرمول فیزیکی و جهت‌مستقل است.

### ترتیب DOM

**قاعده:** اولین فرزند DOM = {{START_SIDE}}‌ترین بصری. **بازگشتی است** — برای *هر*
container افقی جدا اعمالش کن، نه فقط ردیف بیرونی.

خروجی کد Figma فقط مرجع style/token است، نه ساختار ردیف‌های افقی — canvas فیگما همیشه
LTR است، پس کپی verbatim ترتیبش = layout آینه‌ای.

**استثنا:** namespace componentهای DS که خودشان `dir` ست می‌کنند — داخلشان reorder نکن.

### ⛔ قانون طلایی: سمت را ببین، حدس نزن

**alignment و ترتیب هرگز از خروجی کد Figma و هرگز از استدلال ذهنی گرفته نشود.**
مسیر درست: screenshot طرح ← جدول ترجمه ← کد ← screenshot preview ← مقایسه ← فیکس.

---

## Stack

- TODO: framework / نسخه
- Design System: **{{DS}}**
- زبان/جهت: {{LANG}} — {{DIRECTION}}
- Package manager: TODO
- Dev: `TODO` · Build: `TODO` · type-check: `{{TYPECHECK_CMD}}`

## Critical Rules — project-specific

- TODO: قواعد always-on این پروژه (کامپوننت‌های اجباری، الگوهای ممنوع، …)

## UI و طراحی — کجا را بخوان

هر task که **UI، styling، layout، responsive، a11y یا motion** را عوض می‌کند:

1. اول `DESIGN.md` (ریشهٔ پروژه) را بخوان — منبع حقیقتِ تصمیم‌های بصری.
2. کامپوننت موجود را قبل از ساخت نو جست‌وجو کن.
3. توکن استفاده کن؛ رنگ/spacing/radius نو اختراع نکن.
4. تعارض `DESIGN.md` با کد → **کد برنده است**؛ تعارض را گزارش کن و `DESIGN.md` را اصلاح کن.
5. الگوی reusable نو تأیید شد → `DESIGN.md` را آپدیت کن.

> import مستقیم `@DESIGN.md` استفاده نشده: لود همیشگی، context هر task غیر-UI را
> بی‌دلیل پر می‌کند. شرطی بخوان. (استثنا: پروژهٔ تماماً frontend با DESIGN.md کوتاه.)

## Layout shell

- TODO: مسیر فایل layout اصلی، navbar/sidebar
- قواعد **بصری** این پوسته (اندازه، grid، رفتار responsive) → `DESIGN.md` §Layout

## Token Reference

> مقادیر استاندارد {{DS}} → `design-systems/{{DS_FOLDER}}/tokens.md`.
> فقط توکن‌های **مخصوص این پروژه** را اینجا inline کن.
> ⚠️ این جدول canonical است — در `DESIGN.md` تکرارش نکن (مقدار دو-خانه‌ای drift می‌کند).

- TODO: brand tokens · منبع در کد: `{{TOKENS_PATH}}`
