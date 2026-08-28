---

<!--
  مکمل Chakra UI v3 — این فایل **ادامهٔ** `_TEMPLATE/CLAUDE-template.md` است، نه جایگزین آن.
  `dev-engine init` اول قالب پایه را می‌نویسد و بعد این را به انتهایش می‌چسباند.
  پس هرگز پروتکل‌های عمومی (Scope Triage، Figma→Code، DoD، جهت) را اینجا تکرار نکن —
  فقط چیزی که مخصوص Chakra v3 است.
-->

## Chakra v3 — قواعد always-on

1. **Select فقط** — `NativeSelect` ممنوع. همه‌جا `Select` namespace + `createListCollection`.
   → `design-systems/{{DS_FOLDER}}/chakra-ui-v3.md §۱-الف`
2. **Table alt-row** — قبل از ساخت هر جدول از کاربر بپرس: سطرهای متناوب رنگ پس‌زمینهٔ
   متفاوت بخوان؟ چه رنگی؟ (پیش‌فرض `bg.subtle`). پیاده‌سازی:
   `<Table.Row bg={i % 2 ? 'bg.subtle' : undefined}>`
3. **Sidebar selected** — صفحهٔ فعال باید item متناظرش در Sidebar را active نشان دهد،
   route-aware (نه state دستی) — هم parent هم sub-item.
4. **Responsive assets** — اگر لینک/تصویر مخصوص view موبایل به تو داده نشده،
   قبل از ساخت بپرس (حدس نزن).

## Chakra v3 — تله‌های شناخته‌شده

> فهرست کامل باگ cross-component: `design-systems/{{DS_FOLDER}}/known-bugs.md`. باگ یک کامپوننت مشخص: `design-systems/{{DS_FOLDER}}/components/<name>.md`. اینجا فقط پرتکرارها:

- `lineHeight` عددی (`lineHeight="8"`) → **BROKEN** — به CSS بدونِ واحد resolve می‌شود
  (۸ برابر font-size). همیشه ratio string: `lineHeight="1.333"`.
- `bg="bg.default"` → **BROKEN** (به transparent resolve می‌شود). از `bg="bg"` استفاده کن.
- `bg="white"` روی کارت/پنل → **dark mode را می‌شکند** (white در dark هم white می‌ماند).
  برای هر surface تم‌پذیر: **`bg="bg.panel"`**. `bg="white"` فقط وقتی درست است که
  عمداً بخواهی رنگ ثابت بماند.
- `useColorMode` → **در v3 وجود ندارد**. یک `ColorModeContext` محلی بساز/استفاده کن.
- Dark mode: کلاس `.dark` روی `document.documentElement` (نه یک wrapper div) —
  محتوای Portal بیرون درخت React است و کلاس را باید از `<html>` بگیرد.
- `Avatar.Root` و کامپوننت‌های مرکب → ref را برای `asChild` forward نمی‌کنند.
  اول در `<Box as="button" type="button">` بپیچ.
- `sx` prop → selectorهای تودرتو inject **نمی‌شوند**. از `_focusWithin`/`_hover` یا
  `Global` از `@emotion/react` استفاده کن.

## Chakra v3 — جهت

- کامپوننت‌های namespace (Table, Select, Menu, Steps, Pagination…) خودشان `dir` را
  ست می‌کنند → **داخلشان reorder نکن**. قاعدهٔ ترتیب DOM فقط برای `Box`/`Flex`/`Grid` است.
- محتوای Portal (Menu, Drawer, Popover, Tooltip) زیر `<body>` رندر می‌شود ولی `dir` را
  از `<html>` ارث می‌برد. با این حال `dir="{{DIRECTION}}"` را صریح روی `*.Positioner`
  بگذار (safeguard).
- جزئیات بیشتر: `design-systems/{{DS_FOLDER}}/rtl.md`

## Brand Tokens

> مقادیر استاندارد Chakra (semantic + per-color) → `design-systems/{{DS_FOLDER}}/tokens.md`.
> فقط توکن‌های brand این پروژه را اینجا نگه دار. مقدارهای زیر **نمونه‌اند** — عوضشان کن.

| Token | Light | Dark |
|-------|-------|------|
| `brand.solid` | teal.600 | teal.600 |
| `brand.contrast` | white | white |
| `brand.fg` | teal.700 | teal.300 |
| `brand.subtle` | teal.100 | teal.900 |
| `brand.muted` | teal.200 | teal.800 |
| `brand.emphasized` | teal.300 | teal.700 |
| `brand.focusRing` | teal.500 | teal.500 |
| `brand.border` | teal.500 | teal.400 |
| `brand.bg` | teal.50 | teal.950 |

→ منبع در کد: `src/theme/tokens.ts`

**قانون token mapping:** برای surfaceهای theme-able هرگز palette خام (`teal.50`، `gray.200`)
نگذار وقتی توکن semantic معادل هست. hex در light یکی است ولی raw در dark می‌شکند —
و هیچ gateای این را نمی‌گیرد (چون `teal.50` خودش یک token معتبر است)، پس دستی چک کن.

## Architectural Decisions

> این تصمیم‌ها قطعی‌اند — جایگزین پیشنهاد نده مگر کاربر صریحاً بخواهد.

| حوزه | تصمیم | دلیل |
|------|-------|------|
| State Management | TODO | TODO |
| Data Fetching | TODO | — |
| Routing | TODO | — |
| Auth | TODO | — |

## File Structure

```
src/
  components/
    layout/
    ui/          ← کامپوننت‌های DS-wrapper (snippetهای Chakra + adaptation پروژه)
  contexts/
  theme/
    index.ts
    tokens.ts
  services/
  utils/
```
