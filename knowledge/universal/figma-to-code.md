# Figma → Code — پیاده‌سازی دیزاین
> universal — مستقل از design system
> کاربرد: وقتی دیزاین آماده‌ست و می‌خوای کدش کنی — نه برای شروع پروژه جدید
> updated: 2026-05-23 | منبع واحد حقیقت برای Figma→code (skill `figma-page-implement` بازنشسته شد، محتوا اینجا ادغام شد)

## Table of Contents
- [ساختار فایل](#این-فایل-دو-بخش-داره)
- [GATE — کپی در CLAUDE.md](#-copy-into-project-claudemd-)
  - Figma Access Gate
  - Figma → Code Protocol (Component Resolution / DS Second / DoD)
- [مرجع عمیق](#فازهای-کار)
  - [فازهای کار](#فازهای-کار)
  - [نگاشت Auto Layout](#نگاشت-figma-auto-layout-به-css)
  - [RTL DOM Order](#rtl-dom-order)
  - [Verification](#verification--قبل-از-تحویل-همه-اجباری)
  - [Pitfalls رایج](#pitfalls-رایج)

---

## این فایل دو بخش داره

1. **GATE (بلوک قابل‌کپی)** — بخش بعدی. این رو در `## Figma → Code Protocol` هر پروژه‌ی CLAUDE.md کپی کن. کوتاهه، همیشه‌فعاله، هیچ‌وقت فراموش نمیشه.
2. **مرجع عمیق** — بقیه فایل. وقتی جزئیات لازم شد read کن.

> **چرا gate در CLAUDE.md؟** CLAUDE.md هر پیام خودکار لود میشه. قانون اونجا = همیشه در context. skill ممکنه trigger نشه یا اصلاً نصب نباشه — به skill برای قانون اجباری تکیه نکن.

---

## ▼▼▼ COPY INTO PROJECT CLAUDE.md ▼▼▼
<!-- نسخه‌ی DS-agnostic. موقع کپی، `[DS]`، `[MCP]` و `[TYPECHECK]` رو با مقدار پروژه پر کن. -->

## Scope Triage (اجباری — اول هر تغییر، قبل از Figma→Code)

هر task → اول tier رو تعیین کن. tier تعیین می‌کنه چقدر pipeline لازمه:

| Tier | چیه | کار | screenshot؟ |
|------|-----|-----|------------|
| **0 — trivial** | متن/label، rename، comment، config | فقط Edit | ❌ |
| **1 — code/style** | prop، token، spacing، bugfix، refactor، ریسپانسیو روی component موجود — **بدون surface نو از Figma** | Edit + `[TYPECHECK]` | ❌ |
| **2 — Figma→code نو** | frame/page/component نو از Figma، یا pixel-match با spec | کل Protocol پایین | ✅ |

- **screenshot = opt-in.** default نزن. فقط **Tier 2** یا وقتی کاربر صریح گفت «compare / pixel / screenshot».
- **MCP Figma fetch فقط Tier 2.** Tier 0/1 از local cache، صفر MCP call.
- **شک بین دو tier؟ → پایین‌تر**، لازم شد escalate. سرعت اول.

مرجع عمیق: `dev-knowledge/universal/scope-triage.md`

---

## Figma Access Gate (اجباری — بالاتر از همه)

**اگه Figma tool خطا داد یا data برنگشت → STOP. هیچ کدی نزن.**

```
Figma tool fail شد؟
  → اول مشکل دسترسی رو حل کن (tool دیگه امتحان کن، از کاربر link/node-id دوباره بخواه)
  → هرگز با حدس/ذهن خودت ادامه نده
  → هرگز محتوا (text، label، color، layout) از خودت نساز
  → اگه بعد از تلاش باز هم نشد → به کاربر بگو و منتظر بمون

مجاز نیست:
  ✗ ادامه دادن بدون Figma data
  ✗ حدس زدن TitleBar text / button label / component variant
  ✗ ساختن layout از پیش‌فرض‌های ذهنی
  ✗ گفتن «data نگرفتم ولی ادامه می‌دم»
```

---

## Figma → Code Protocol (اجباری — فقط Tier 2)

هر task که از Figma به کد تبدیل میشه — حتی «اصلاح کن» / «مقایسه کن» / «ریسپانسیو کن» — این gate رو رد نکن.

**Component Resolution (به ترتیب، اجباری):**
```
1. Local first → src/components/ رو grep کن. موجوده؟ import کن (نساز).
2. DS second   → از [MCP] design-system بگیر. هیچ‌وقت کامپوننت DS رو از HTML خام rebuild نکن.
3. Build last  → فقط اگه هیچ‌کدوم نبود، با primitives DS بساز (Box/Flex/Text). صفر hardcode.
```

**MCP servers این پروژه:**
- `[MCP]` — کامپوننت/مثال/props دیزاین‌سیستم (مثلاً Chakra UI MCP)
- Figma MCP — `get_design_context` / `get_screenshot` / `get_variable_defs`

**Definition of Done — آخر هر task point-by-point گزارش بده:**
- [ ] Component Resolution رعایت شد (Local→DS MCP→Build) — کدوم مسیر؟
- [ ] صفر hardcode (رنگ/spacing/font) — همه token
- [ ] logical CSS props (`insetInlineEnd` نه `right`)
- [ ] RTL DOM order — با evidence per-row (نه checkbox خالی): `container → اولین child → راست‌ترین در Figma`
- [ ] responsive روی breakpointهای پروژه چک شد
- [ ] type-check / build سبز

اگه چکی skip شد → با ⚠️ علامت بزن، نگو ✅.

<!-- مرجع عمیق: dev-knowledge/universal/figma-to-code.md -->
## ▲▲▲ END COPY ▲▲▲

---
---

# مرجع عمیق

## فازهای کار

**فاز ۱ — Context**
قبل از شروع، اینا رو داشته باش:
- CLAUDE.md پروژه (stack، RTL rules، known bugs، gate بالا)
- لیست کامپوننت‌های local در `src/components/`
- ساختار layout templates پروژه

**فاز ۲ — Figma بخون**
از Figma MCP یا screenshot برای فهمیدن layout و tokens:
- کدوم layout template؟ (1-col، 2-col، sidebar+main، ...)
- spacing‌ها (padding، gap) چند px؟ → کدوم spacing token
- رنگ‌ها از کدوم token یا variable؟ (`get_variable_defs`)
- typography از کدوم text style؟
- responsive: همون node رو در عرض‌های مختلف ببین (موبایل/دسکتاپ)

**فاز ۳ — Component Resolution (اجباری)**

قبل از نوشتن هر کد، برای هر کامپوننت ترتیب gate بالا رو دنبال کن:

```
1. Local first  → src/components/ پروژه رو بگرد
2. DS second    → MCP server دیزاین‌سیستم چک کن
3. Build last   → فقط اگه هیچ‌کدام نبود — از primitives، نه custom HTML
```

**Local components:**
```bash
# قبل از ساختن هر چیزی:
find src/components -name "*.tsx" | xargs grep -l "ComponentName"
# یا:
ls src/components/ui/ src/components/<feature>/
```
موجود بود → import کن. variant جدید لازمه → extend کن، نساز.

**DS components — از MCP بگیر، حدس نزن:**
```
# Chakra UI MCP (پروژه Vitrina):
mcp__chakra-ui__list_components        → لیست کامپوننت‌ها
mcp__chakra-ui__get_component_example  → مثال استفاده
mcp__chakra-ui__get_component_props    → props و انواع
mcp__chakra-ui__get_theme              → tokenها

# Figma MCP (همه پروژه‌ها):
search_design_system("<component-name>")   → کامپوننت DS در Figma

# روش پشتیبان — داکس DS (URL از CLAUDE.md پروژه):
WebFetch("<ds-docs-url>/<component-name>")
```
موجود بود → props رو بخون، از همون کامپوننت استفاده کن.
**هیچ‌وقت** یه کامپوننت DS رو با HTML/div خام rebuild نکن.

**Component descriptions = implementation checklist (اجباری):**
```
get_design_context output بخش "Component descriptions" داشت؟
  → آن لیست = تمام DS componentهای استفاده‌شده در آن node
  → قبل از نوشتن هر sub-element، اسمش رو در آن لیست چک کن
  → هر component لیست‌شده باید از DS import بشه — rebuild ممنوع

چرا مهمه:
  Figma این section رو فقط برای named DS components می‌سازه
  → badge/alert/button در آن لیست = آن component در DS وجود داره
  → builder ممکنه روی layout تمرکز کنه و sub-componentها رو از scratch بسازه ← این اشتباهه
```

**Build new (فقط اگه هیچ‌کدوم نبود):**
- با primitives DS بساز (Box، Flex، Text، ...)
- هیچ رنگ یا spacing hardcode نکن
- در `src/components/ui/` یا محل مناسب پروژه بذار

**جدول component mapping بساز:**

| Figma Component | Code Component | وضعیت | منبع |
|----------------|---------------|--------|------|
| Button/Primary | `<Button colorPalette="brand">` | ✅ موجود (DS) | MCP |
| PhoneCard | `<PhoneCard>` | ✅ موجود (local) | src/components |
| FancyThing | — | ❌ بساز | primitives |

---

**فاز ۴ — کد بنویس**
- Figma local components → پس از Component Resolution بالا
- Figma tokens → DS tokens پروژه (مقادیر hardcode نکن)
- Figma auto layout → Flex/Grid

برای mapping token های Figma به DS خاص:
→ `design-systems/<ds-name>/tokens.md`

### قوانین سخت — هیچ استثنایی ندارن

**❌ هرگز:** `color: '#1E293B'`، `padding: '16px'`، `fontSize: '14px'`، `marginLeft` (در RTL می‌شکنه)
**✅ همیشه:** `color: 'fg'`، `padding={4}`، `textStyle="sm"`، `marginInlineStart={4}`

---

## نگاشت Figma Auto Layout به CSS

| Figma | CSS |
|-------|-----|
| Horizontal auto layout | `display: flex; flex-direction: row` |
| Vertical auto layout | `display: flex; flex-direction: column` |
| Fill container | `flex: 1` یا `width: 100%` |
| Hug contents | بدون width ثابت |
| Fixed width | `width: 256px` |
| gap | `gap: Npx` → spacing token |
| padding | `padding: Npx` → spacing token |

> هر DS این‌ها رو به syntax خودش ترجمه می‌کنه. مثال Chakra: `design-systems/chakra-ui-v3/chakra-ui-v3.md`

---

## RTL DOM Order

در RTL، اولین child = rightmost. قانون CSS/HTML خالص، مستقل از DS:

```html
<!-- Figma: [Start(راست)] [Middle] [End(چپ)] -->
<div style="display:flex">
  <div>Start — rightmost</div>
  <div style="flex:1">Middle</div>
  <div>End — leftmost</div>
</div>
```

### ⚠️ ترتیب فرزندها از هندسه دربیار، نه از خروجی کد Figma

خروجی `get_design_context` فرزندها رو به ترتیب **چپ→راست** (LTR canvas) لیست می‌کنه.
کپی verbatim این ترتیب در app با `dir=rtl` = layout **آینه‌ای**. این شایع‌ترین
الگوی باگ تکراری Figma→code در پروژه‌های RTL هست (۱۴۰۴: سه نقطه آینه‌ای در یک
تحویل — هر سه کپی verbatim ترتیب Figma بودن).

**الگوریتم اجباری برای هر container افقی (Box/Flex/Grid ساده):**
1. مختصات x فرزندها از `get_metadata` (bounding box) یا screenshot
2. sort بر اساس x **نزولی** → راست‌ترین = اولین child در JSX
3. خروجی کد Figma فقط مرجع style/token — ساختار ردیف افقی از آن کپی نشه

**استثنا:** کامپوننت‌های DS که خودشون dir ست می‌کنن (در Chakra: Table، Pagination،
Steps، Select، Menu...) — داخلشون reorder نکن. همین «بعضی جاها بدون reverse درست
به‌نظر می‌رسه» منبع گیج‌شدن و کپی verbatim هست.

**در DoD:** تیک «RTL DOM order» بدون evidence قبول نیست — برای هر ردیف افقی یک خط:
`container → اولین DOM child → راست‌ترین المان در Figma`

### Button + icon — default: icon اول DOM (leading) — هر دو جهت

آیکن دکمه پیش‌فرض **اول DOM** = سمت start. RTL → راستِ متن · LTR → چپِ متن.
**یک DOM برای هر دو جهت** (icon-first)؛ `dir` خودش flip می‌کند — ترتیب را per-direction عوض نکن.
استثنا (تنها دو حالت): کاربر صریح trailing بخواهد، یا آیکن **هر دو طرف** متن باشد.
> دام رایج: کد Figma اغلب `text` بعد `icon` لیست می‌کند (LTR canvas) — کپی verbatim = آیکن سمت غلط.
> dev-engine `dom-order` → `button-icon-after-text` این را flag می‌کند (Latin+فارسی، multi-line، arrow-fn).

### رنگ سطح‌ها — توکن semantic نه palette خام

برای bg/border/fg کارت/پنل/سطح، متغیر semantic فیگما (`bg/teal`، `teal/muted`) را به توکن
**semantic** پروژه map کن (`brand.bg`، `brand.muted`، `bg.subtle`…) — نه به palette خام (`teal.50`) با hex-match.
palette خام در dark mode adapt نمی‌کند. gate hardcode این را نمی‌گیرد (palette هم token است)؛
dev-engine `token-replacer` → `raw-palette-on-theme-prop` flag می‌کند.

→ مفاهیم کامل‌تر: `universal/language.md`

---

## Verification — قبل از تحویل (همه اجباری)

```bash
# ۱. صفر hardcode
grep -nE '#[0-9a-fA-F]{3,6}|[0-9]+px|fontSize:|fontWeight:' src/path/to/NewFile.tsx
# چیزی پیدا شد → token کن → دوباره grep تا صفر

# ۲. build سبز
pnpm type-check 2>&1 | tail -20   # یا: npx tsc --noEmit
```

**preview/screenshot = هیچ‌وقت خودکار. همیشه اول از کاربر بپرس** (قانون کاربر، ۱۴۰۴):
> «preview بگیرم و pixel-perfect با طرح چک کنم؟» — فقط با «بله» سراغ Preview MCP برو.
> type-check سبز + RTL DOM order = کافی برای بستن task. verify بصری مرحله‌ی جدا و opt-in است.

**responsive (فقط اگه کاربر preview خواست):** روی breakpointهای پروژه screenshot بگیر (Vitrina: 480 / 1440 / 1920).

**visual (فقط اگه کاربر preview خواست):** screenshot کد را با screenshot Figma (فاز ۲) مقایسه کن — layout/typography/رنگ/spacing/shadow/radius.

چک‌لیست نهایی = Definition of Done در بلوک GATE بالا. point-by-point گزارش بده.

---

## Pitfalls رایج

| مشکل Figma | راه‌حل در کد |
|-----------|-------------|
| `position: absolute` در Figma | از `flex`/`grid` استفاده کن |
| Auto-layout gap | `gap` در CSS، نه `margin` بین children |
| state‌ها (hover/focus/disabled) | حتی اگه در فریم نیستن، implement کن |
| فونت با وزن خاص | تأیید کن فونت آن weight رو load می‌کنه |
| Box shadow | ترتیب پارامترهای CSS با Figma فرق داره |
| متن overflow | متن فارسی ۱۵-۳۰٪ بلندتر — truncation/wrap handle کن |
| Portal/overlay (Menu/Drawer/Dialog) | `dir="rtl"` روی Positioner |
| Images/icons ندارن | به کاربر flag کن، placeholder موقت |

---

## skill مرتبط

برای pipeline قدم‌به‌قدم Figma→code، از skill رسمی `figma-implement-design` استفاده کن.
gate بالا (در CLAUDE.md) تضمین صحت میده — skill فقط شتاب‌دهنده‌ست، نه منبع قانون.
