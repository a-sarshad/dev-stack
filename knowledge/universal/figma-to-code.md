# Figma → Code — مرجع عمیق پیاده‌سازی دیزاین
> universal — مستقل از design system
> کاربرد: وقتی دیزاین آماده‌ست و می‌خوای کدش کنی — نه برای شروع پروژه جدید
> updated: 2026-08-28 | این فایل لایهٔ **REFERENCE** است؛ gate جای دیگری زندگی می‌کند ↓

## GATE کجاست — این فایل دیگر بلوک کپی ندارد

قانون اجباری Figma→code (**Scope Triage · Figma Access Gate · Component Resolution ·
Token rules · DoD**) canonical در **`design-systems/_TEMPLATE/CLAUDE-template.md`**
(+ مکمل DS) است. `dev-engine init` از همان‌جا در `CLAUDE.md` هر پروژه bake می‌کند —
always-on، هر پیام لود می‌شود.

| لازم داری | برو |
|-----------|-----|
| مفاهیم جهت — دابل-فلیپ، جدول ترجمه، DOM order بازگشتی | **`universal/language.md`** (canonical) |
| سطح‌بندی tier (کِی pipeline کامل) | **`universal/scope-triage.md`** (canonical) |
| فازهای کار، نگاشت Auto Layout، pitfalls، verification | همین فایل، پایین |

---

## فازهای کار

**فاز ۱ — Context**
قبل از شروع، اینا رو داشته باش:
- CLAUDE.md پروژه (stack، RTL rules، known bugs، gate)
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

قبل از نوشتن هر کد، برای هر کامپوننت ترتیب gate پروژه رو دنبال کن:

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

> مکانیزم کامل (دابل-فلیپ، چرا preview به‌تنهایی کافی نیست، جدول ترجمهٔ اجباری قبل از کد)
> → **`universal/language.md` § «دابل-فلیپ»**. اینجا فقط الزام‌های تحویل.

- اولین فرزند DOM هر container افقی = راست‌ترین المان بصری. **بازگشتی** — هر container
  تودرتو جدا (نه فقط ردیف بیرونی).
- ترتیب را از **هندسه** دربیار، نه از خروجی `get_design_context` (LTR-canvas → کپی
  verbatim = layout آینه‌ای؛ ۱۴۰۴: سه نقطهٔ آینه‌ای در یک تحویل). ابزار:
  `dev-engine layout-derive` مختصات خام را به ترتیب DOM ترجمه می‌کند.
- تیک «RTL DOM order» در DoD بدون evidence قبول نیست — برای هر ردیف افقی یک خط:
  `container → اولین DOM child → راست‌ترین المان در Figma`.
- **استثنا:** کامپوننت DS که خودش `dir` ست می‌کند (Table، Select، Menu، Steps،
  Pagination…) — داخلش reorder نکن.

**Button + icon:** آیکن پیش‌فرض **اول DOM** (leading) = سمت start. یک DOM برای هر دو
جهت؛ `dir` خودش flip می‌کند — per-direction عوض نکن. استثنا: کاربر صریح trailing
بخواهد، یا آیکن هر دو طرف متن. ماژول `dom-order` → `button-icon-after-text` flag می‌کند.

**رنگ سطح‌ها:** متغیر semantic فیگما (`bg/teal`، `teal/muted`) → توکن **semantic**
پروژه (`brand.bg`، `bg.subtle`…)، نه palette خام (`teal.50`) با hex-match. palette خام
در dark adapt نمی‌کند و gate hardcode نمی‌گیردش؛ ماژول `token-replacer` →
`raw-palette-on-theme-prop` flag می‌کند.

---

## Verification — قبل از تحویل

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

چک‌لیست نهایی = Definition of Done در `CLAUDE.md` پروژه. point-by-point گزارش بده.

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
gate در `CLAUDE.md` پروژه تضمین صحت می‌دهد — skill فقط شتاب‌دهنده‌ست، نه منبع قانون.
