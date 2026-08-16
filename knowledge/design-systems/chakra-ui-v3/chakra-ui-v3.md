# Chakra UI v3 — Skill Reference
> جایگزین: rtl.md + multilang.md + unified-skill-content.md
> updated: 2026-05-18

## Table of Contents
| # | بخش |
|---|-----|
| ۱ | [قوانین پایه](#۱-قوانین-پایه--همیشه) |
| ۲ | [Brand Token Pattern](#۲-brand-token-pattern) |
| ۳ | [Semantic Tokens](#۳-semantic-tokens--کلیدی‌ترین‌ها) |
| ۴ | [Typography](#۴-typography) |
| ۵ | [Spacing / Radius / Shadow](#۵-spacing-radius-shadow-component-size) |
| ۶ | [Direction Setup — سه حالت](#۶-direction-setup--سه-حالت) |
| ۷ | [RTL DOM Order](#۷-rtl--dom-order-و-layout) |
| ۸ | [Logical Props](#۸-logical-props--قانون-مطلق) |
| ۹ | [Portal Components](#۹-portal-components-در-rtl) |
| ۱۰ | [Sidebar Patterns](#۱۰-sidebar-patterns) |
| ۱۱ | [Known Bugs — خلاصه](#۱۱-known-bugs--خلاصه) → [فایل کامل](known-bugs.md) |
| ۱۲ | [Chakra Docs URLs](#۱۲-chakra-docs--web_fetch-urls) |
| ۱۳ | [Setup پروژه جدید](#۱۳-setup--پروژه-جدید) |

این فایل محتوای کامل skill Chakra UI است — برای همه پروژه‌ها (RTL، LTR، دوزبانه).
رنگ brand هر پروژه از `<project>/.claude/context/project-context.md` می‌آید — اینجا hardcode نیست.

---

## ۱. قوانین پایه — همیشه

1. **Token فقط** — هیچ hex یا مقدار hardcode — همیشه از token استفاده کن
2. **Logical Props** — `ms/me/ps/pe` نه `ml/mr/pl/pr`
3. **Direction** — هیچ‌وقت hardcode نکن مگر پروژه single-language باشد
4. **قبل از props ناشناخته** → `web_fetch https://chakra-ui.com/docs/components/[name]`
5. **هیچ‌وقت props را حدس نزن** — اشتباه در props = کد غیرقابل اجرا
6. **Select فقط — `NativeSelect` ممنوع** — همه‌جا `Select` (namespace + `createListCollection`). دلیل: استایل یکدست، کنترل کامل Portal/RTL، ItemIndicator. → §۱-الف
7. **Table → alt-row را بپرس** — قبل از ساخت هر جدول از کاربر بپرس آیا سطرهای متناوب رنگ پس‌زمینه متفاوت داشته باشن و چه رنگی. پیش‌فرض `bg.subtle`. → §۱-الف

---

## ۱-الف. Select و Table — قوانین اجباری component

### Select (نه NativeSelect)

`NativeSelect` هیچ‌وقت — حتی برای dropdown ساده. الگوی استاندارد (RTL-safe، Portal، ItemIndicator):

```tsx
const collection = createListCollection({
  items: [{ label: 'همه', value: 'all' }, { label: 'الکترونیک', value: 'electronics' }],
})

<Select.Root collection={collection} size="sm" value={value} onValueChange={(e) => setValue(e.value)}>
  <Select.HiddenSelect />
  <Select.Control>
    <Select.Trigger><Select.ValueText placeholder="..." /></Select.Trigger>
    <Select.IndicatorGroup><Select.Indicator /></Select.IndicatorGroup>
  </Select.Control>
  <Select.Positioner>   {/* RTL: dir از html ارث می‌بره؛ اگه drift دیدی dir="rtl" بده */}
    <Select.Content>
      {collection.items.map((it) => (
        <Select.Item key={it.value} item={it}>
          <Select.ItemText>{it.label}</Select.ItemText>
          <Select.ItemIndicator />
        </Select.Item>
      ))}
    </Select.Content>
  </Select.Positioner>
</Select.Root>
```

**عرض منو > عرض trigger** (متن بلند تک‌خطی بمونه، نه ۲ خطی):
```tsx
<Select.Content minW="max-content" maxW="360px">   {/* به‌جای پیش‌فرض = عرض trigger */}
  <Select.Item ...><Select.ItemText whiteSpace="nowrap">...</Select.ItemText></Select.Item>
```
`max-content` = منو به اندازه عریض‌ترین آیتم باز می‌شه؛ `maxW` سقف می‌ذاره. `whiteSpace="nowrap"` روی ItemText جلوی wrap رو می‌گیره.

### Table — alt-row (زبراسطر)

**قبل از ساخت هر جدول، بپرس** (سوال اجباری):
1. سطرهای متناوب رنگ پس‌زمینه متفاوت داشته باشن؟ (بله/خیر)
2. اگه بله، چه رنگی؟ — **پیش‌فرض `bg.subtle`**

پیاده‌سازی با token دقیق (ترجیح بر `striped` — چون رنگ `striped` از recipe میاد و token نیست):

```tsx
<Table.Row bg={i % 2 === 1 ? 'bg.subtle' : undefined}>
```

---

## ۲. Brand Token Pattern

هر پروژه brand color خودش را دارد. در `src/theme/tokens.ts`:

```ts
// BRAND را با رنگ پروژه جایگزین کن (از project-context): teal, blue, violet, orange, ...
export const projectTokens = defineConfig({
  theme: {
    tokens: {
      fonts: {
        body:    { value: 'Vazirmatn, sans-serif' },  // یا Inter برای LTR
        heading: { value: 'Vazirmatn, sans-serif' },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid:      { value: { base: '{colors.BRAND.600}', _dark: '{colors.BRAND.600}' } },
          contrast:   { value: { base: 'white',              _dark: 'white'              } },
          fg:         { value: { base: '{colors.BRAND.700}', _dark: '{colors.BRAND.300}' } },
          subtle:     { value: { base: '{colors.BRAND.100}', _dark: '{colors.BRAND.900}' } },
          muted:      { value: { base: '{colors.BRAND.200}', _dark: '{colors.BRAND.800}' } },
          emphasized: { value: { base: '{colors.BRAND.300}', _dark: '{colors.BRAND.700}' } },
          focusRing:  { value: { base: '{colors.BRAND.500}', _dark: '{colors.BRAND.500}' } },
          border:     { value: { base: '{colors.BRAND.500}', _dark: '{colors.BRAND.400}' } },
          bg:         { value: { base: '{colors.BRAND.50}',  _dark: '{colors.BRAND.950}' } },
        },
      },
    },
  },
})
```

---

## ۳. Semantic Tokens — کلیدی‌ترین‌ها

| کاربرد | Token |
|--------|-------|
| Background | `bg` / `bg.subtle` / `bg.muted` |
| متن | `fg` / `fg.muted` / `fg.subtle` |
| Border | `border` / `border.muted` / `border.emphasized` |
| خطا | `bg.error` / `fg.error` / `border.error` |
| موفقیت | `bg.success` / `fg.success` |
| هشدار | `bg.warning` / `fg.warning` |

> جدول کامل همه توکن‌ها → `tokens.md`

---

## ۴. Typography

| موقعیت | Size | Weight |
|--------|------|--------|
| body / فرم | `sm` (14px) | `normal` (400) |
| label / caption | `xs` (12px) | `medium` (500) |
| عنوان بخش | `md` (16px) | `semibold` (600) |
| عنوان صفحه | `xl` (20px) | `semibold` (600) |
| عنوان بزرگ | `2xl` (24px) | `bold` (700) |

**⚠️ lineHeight Bug:**
```tsx
lineHeight="8"       // ❌ BROKEN — unitless = 192px
lineHeight="1.333"   // ✅ ratio string
lineHeight="normal"  // ✅ = 1.5
lineHeight="tight"   // ✅ = 1.25
```

---

## ۵. Spacing، Radius، Shadow، Component Size

```
Spacing:  2=8px | 3=12px | 4=16px | 6=24px | 10=40px
Radius:   badge/btn/input=md(4px) | card=lg(6px) | modal=xl(8px) | avatar=full
Shadow:   card=sm | modal=lg | dropdown=md | tooltip=xs
Size:     همیشه md (40px) مگر مشخص شود
```

---

## ۶. Direction Setup — سه حالت

### RTL-only (فارسی/عربی)

```html
<!-- index.html -->
<html dir="rtl" lang="fa">
```

```ts
// src/theme/index.ts
const layoutConfig = defineConfig({
  globalCss: { 'html, body': { direction: 'rtl', fontFamily: 'body' } },
})
export const system = createSystem(defaultConfig, projectTokens, layoutConfig)
```

```tsx
// main.tsx
<ChakraProvider value={system}>
  <LocaleProvider locale="fa-IR">
    <ColorModeProvider><App /></ColorModeProvider>
  </LocaleProvider>
</ChakraProvider>
```

### LTR-only (انگلیسی)

```ts
const layoutConfig = defineConfig({
  globalCss: { 'html, body': { direction: 'ltr', fontFamily: 'body' } },
})
// main.tsx → LocaleProvider locale="en-US"
```

### دوزبانه (runtime switching)

```tsx
// src/i18n/LocaleContext.tsx
const LANG_CONFIG = {
  fa: { locale: 'fa-IR', dir: 'rtl', font: 'Vazirmatn' },
  ar: { locale: 'ar',    dir: 'rtl', font: 'Vazirmatn' },
  en: { locale: 'en-US', dir: 'ltr', font: 'Inter'     },
}

export function MultiLangProvider({ defaultLang = 'fa', children }) {
  const [lang, setLang] = useState(defaultLang)
  const config = LANG_CONFIG[lang] ?? LANG_CONFIG['en']

  useEffect(() => {
    document.documentElement.setAttribute('dir',  config.dir)
    document.documentElement.setAttribute('lang', config.locale)
  }, [config])

  return (
    <LocaleCtx.Provider value={{ lang, config, setLang }}>
      <LocaleProvider locale={config.locale}>
        <DirectionProvider dir={config.dir}>
          <Box fontFamily={config.font}>{children}</Box>
        </DirectionProvider>
      </LocaleProvider>
    </LocaleCtx.Provider>
  )
}
```

```tsx
// main.tsx (دوزبانه)
<ChakraProvider value={system}>
  <MultiLangProvider defaultLang="fa">
    <ColorModeProvider><App /></ColorModeProvider>
  </MultiLangProvider>
</ChakraProvider>
```

---

## ۷. RTL — DOM Order و Layout

**قانون اصلی RTL:** اولین child در DOM = راست‌ترین المان بصری

```tsx
// Navbar RTL: [Logo/Hamburger] [Spacer] [Actions] [Bell] [Avatar]
<Flex>
  <HamburgerOrLogo />   {/* راست‌ترین → FIRST در DOM */}
  <Spacer />
  <MinMax />
  <Bell />
  <Avatar />            {/* چپ‌ترین → LAST در DOM */}
</Flex>

// Layout Body RTL: Sidebar سمت راست → FIRST در DOM
<Flex maxW="1920px" mx="auto" alignItems="flex-start">
  <Sidebar w="256px" flexShrink={0} />  {/* FIRST → rightmost در RTL */}
  <Box flex={1} minW={0}>              {/* SECOND → left در RTL */}
    <PageHeader />
    <Content />
  </Box>
</Flex>
```

⚠️ در RTL: `align="flex-start"` = سمت راست، `align="flex-end"` = سمت چپ

---

## ۷-الف. RTL DOM Order — الگوهای component-specific

> **چرا این مهمه؟** Chakra v3 + @ark-ui RTL را از طریق `LocaleProvider locale="fa-IR"` → `dir:"rtl"` به همه کامپوننت‌ها می‌رسونه. CSS `flex-direction:row` در RTL context به طور خودکار main axis رو برعکس می‌کنه. **اما DOM ORDER به دست ما نوشته می‌شه** — اشتباه در DOM order = اشتباه بصری.

### Button + icon

```tsx
// ✅ Start icon (leading) — FIRST در DOM = راست‌ترین در RTL
<Button>
  <Plus size={16} />   {/* راست (start) ✓ */}
  افزودن
</Button>

// ✅ End icon (trailing) — LAST در DOM = چپ‌ترین در RTL
<Button>
  مشاهده بیشتر
  <ChevronLeft size={16} />   {/* چپ (end) ✓ — در RTL forward = چپ */}
</Button>

// ❌ اشتباه: start icon بعد از text
<Button>
  افزودن
  <Plus size={16} />   {/* چپ = end position ✗ */}
</Button>
```

### Switch — standalone toggle

```tsx
// ✅ Switch FIRST = راست‌ترین (position: start)
<Flex align="center" gap="2.5">
  <Switch.Root colorPalette="brand" ...>
    <Switch.HiddenInput />
    <Switch.Control><Switch.Thumb /></Switch.Control>
  </Switch.Root>
  <Text fontSize="sm">ارسال رایگان</Text>   {/* LAST → چپ ✓ */}
</Flex>

// ❌ اشتباه: text قبل از switch
<Flex align="center" gap="2.5">
  <Text>ارسال رایگان</Text>   {/* FIRST → راست ✗ */}
  <Switch.Root ...>...</Switch.Root>
</Flex>
```

### Switch.Label داخل Switch.Root

```tsx
// ✅ Control FIRST = راست‌ترین (order:-1 در theme به عنوان CSS fallback هم داریم)
<Switch.Root>
  <Switch.HiddenInput />
  <Switch.Control><Switch.Thumb /></Switch.Control>   {/* FIRST → راست ✓ */}
  <Switch.Label>فعال / غیرفعال</Switch.Label>         {/* SECOND → چپ ✓ */}
</Switch.Root>

// ❌ اشتباه: label قبل از control
<Switch.Root>
  <Switch.Label>فعال</Switch.Label>   {/* FIRST → راست ✗ */}
  <Switch.Control>...</Switch.Control>
</Switch.Root>
```

> **CSS Defensive Fix** — در `globalCss` پروژه‌های RTL اضافه کن:
> ```ts
> '[data-scope="switch"][data-part="control"]': { order: -1 }
> ```
> این CSS حتی اگه DOM order اشتباه باشه، Control را بصری اول می‌آره (راست در RTL).

### Settings row (full-width)

```tsx
// ✅ Switch راست، Label چپ، فاصله‌دار
<Flex align="center" gap="2.5" w="full">
  <Switch.Root flexShrink={0}>...</Switch.Root>   {/* FIRST → راست ✓ */}
  <Text flex="1" fontSize="sm">عنوان تنظیم</Text> {/* LAST → چپ ✓ */}
</Flex>

// توجه: برعکس LTR settings (که label چپ و toggle راست)
// در RTL: toggle/control همیشه start = راست
```

### Flex row عمومی

```tsx
// ✅ ترتیب صحیح برای هر row component
<Flex align="center" gap="3">
  <Icon />          {/* FIRST = راست‌ترین ✓ */}
  <Text flex="1">متن اصلی</Text>
  <ActionBtn />     {/* LAST = چپ‌ترین ✓ */}
</Flex>
```

### Dialog / Modal — دکمه بستن (×)

عنوان در start (راست) می‌شینه؛ دکمه‌ی بستن باید گوشه‌ی **دور = بالا-چپ = end** باشه.
در RTL یعنی **`insetEnd`** — نه `insetStart` (که می‌شه راست، روی عنوان)، نه `right=`/`left=` (physical).

```tsx
// ✅ × گوشه‌ی بالا-چپ — insetEnd
<Dialog.Header position="relative">
  <Dialog.Title>فیلترها</Dialog.Title>             {/* start = راست ✓ */}
  <Dialog.CloseTrigger asChild position="absolute" top="4" insetEnd="4">
    <CloseButton size="sm" />                       {/* end = چپ ✓ */}
  </Dialog.CloseTrigger>
</Dialog.Header>

// ❌ insetStart → × می‌ره راست (start) = گوشه‌ی اشتباه، روی عنوان
<Dialog.CloseTrigger position="absolute" top="4" insetStart="4">
```

> dev-engine module `dom-order` این رو می‌گیره (rule `close-button-wrong-corner` + `close-button-physical-prop`).

---

## ۸. Logical Props — قانون مطلق

```tsx
<Box ms={4} me={2} ps={3} pe={2}>   // ✅ logical — direction-aware
<Box ml={4} mr={2} pl={3} pr={2}>   // ❌ هیچ‌وقت physical

// Arrow/Chevron در RTL
dir === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />
```

---

## ۹. Portal Components در RTL

```tsx
// همیشه dir="rtl" به Positioner اضافه کن
<Menu.Positioner dir="rtl">
<Drawer.Positioner dir="rtl" maxW="256px">
<Popover.Positioner dir="rtl">
<Tooltip.Positioner dir="rtl">

// Drawer از راست باز بشه
<Drawer.Root placement="start">   // "start" = راست در RTL ✅
```

---

## ۱۰. Sidebar Patterns

```tsx
// Desktop — expanded/collapsed
<Box w="256px">   // expanded
<Box w="16">      // collapsed (64px)

// Mobile — Drawer
<Drawer.Root placement="start">
  <Drawer.Positioner dir="rtl" maxW="256px">

// Compact Mode
<Box maxW={isCompact ? "512px" : "1920px"} mx="auto">
  <Box display={isCompact ? "none" : "block"}><Sidebar /></Box>
</Box>
```

---

## ۱۱. Known Bugs — خلاصه

```tsx
bg="bg.default"  // ❌ → ✅ bg="bg"
lineHeight="8"   // ❌ → ✅ lineHeight="1.333"
useColorMode()   // ❌ وجود ندارد → ✅ custom ColorModeContext
textAlign="end"  // ❌ در RTL = LEFT → ✅ textAlign="start"
// dark mode: document.documentElement.classList.toggle('dark')
// Avatar+asChild: ❌ <Avatar.Root asChild><button> → ✅ <Box as="button"><Avatar.Root>
```

> لیست کامل با مثال‌های کد → `known-bugs.md`

---

## ۱۲. Chakra Docs — web_fetch URLs

```
Button  → https://chakra-ui.com/docs/components/button
Input   → https://chakra-ui.com/docs/components/input
Select  → https://chakra-ui.com/docs/components/select
Table   → https://chakra-ui.com/docs/components/table
Dialog  → https://chakra-ui.com/docs/components/dialog
Drawer  → https://chakra-ui.com/docs/components/drawer
Badge   → https://chakra-ui.com/docs/components/badge
Tabs    → https://chakra-ui.com/docs/components/tabs
```

---

## ۱۳. Setup — پروژه جدید

### نصب

```bash
pnpm add @chakra-ui/react @emotion/react @emotion/styled
```

### ساختار فایل‌های Chakra

```
src/
  contexts/
    ColorModeContext.tsx   ← dark mode toggle
  theme/
    index.ts               ← createSystem entry
    tokens.ts              ← custom tokens
```

### Theme Setup

```ts
// src/theme/index.ts
import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'
import { projectTokens } from './tokens'

const layoutConfig = defineConfig({
  globalCss: {
    'html, body': {
      direction: 'rtl',   // یا 'ltr' برای LTR projects
      fontFamily: 'body',
    },
  },
})

export const system = createSystem(defaultConfig, projectTokens, layoutConfig)
```

### main.tsx

```tsx
import { ChakraProvider, LocaleProvider } from '@chakra-ui/react'
import { system } from './theme'
import { ColorModeProvider } from './contexts/ColorModeContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider value={system}>
      <LocaleProvider locale="fa-IR">   {/* یا حذف کن برای LTR */}
        <ColorModeProvider>
          <App />
        </ColorModeProvider>
      </LocaleProvider>
    </ChakraProvider>
  </StrictMode>,
)
```

### CLAUDE.md
از `CLAUDE-template.md` همین پوشه کپی و customize کن.

---

## مراجع این پوشه

| فایل | کاربرد |
|------|--------|
| `tokens.md` | جداول کامل همه توکن‌ها (lookup) |
| `known-bugs.md` | لیست زنده باگ‌ها با مثال کد |
| `CLAUDE-template.md` | template برای CLAUDE.md پروژه‌های جدید |
