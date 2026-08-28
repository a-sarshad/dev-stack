# Chakra UI v3 — Known Bugs & Gotchas
> updated: 2026-08-28
> این فایل در حین کار با پروژه‌های واقعی update می‌شه
> **canonical برای باگ‌های cross-component Chakra v3** — توکن، RTL کلی،
> styling system، dark mode. باگ **یک کامپوننت مشخص** → `components/`.
> تناقض دیدی؟ این فایل برنده است.

---

## 📍 باگ‌های مخصوص یک کامپوننت → `components/`

| کامپوننت | تله |
|---|---|
| [`pin-input`](components/pin-input.md) | autoFocus hydration race، رد ارقام فارسی |
| [`progress`](components/progress.md) | `--stripe-color` conditional resolve نمی‌شه |
| [`steps`](components/steps.md) | orientation responsive، height:100%، Status رقم لاتین |
| [`combobox`](components/combobox.md) | `inputValue` کنترل‌شده + `allowCustomValue` |
| [`radio-card`](components/radio-card.md) | `value ?? undefined` پاک نمی‌کنه + border جای اشتباه |
| [`avatar`](components/avatar.md) | `asChild` ref issue |
| [`input-group`](components/input-group.md) | فرمول padding برای element متنی کافی نیست |
| [`popover`](components/popover.md) | `asChild` + `Box as="button"` type error |
| [`tooltip`](components/tooltip.md) | namespace API + RTL |
| [`select`](components/select.md) | داخل Dialog باید Portal بشه |

قانون اینکه چی لایق فایل جداست → `components/README.md`.

---

## 🔴 Token System

### `lineHeight` numeric tokens — BROKEN
```tsx
// ❌ اشتباه — unitless CSS تولید می‌کنه (8 × font-size = 192px!)
<Text lineHeight="8">

// ✅ درست — از ratio string استفاده کن
<Text lineHeight="1.333">  {/* 32px at 2xl */}
<Text lineHeight="1.14">   {/* 32px at 3xl */}
```

### `bg="bg.default"` — BROKEN
```tsx
// ❌ CSS var به transparent resolve می‌شه
<Box bg="bg.default">

// ✅ سطح کارت/پنل (تم‌پذیر — در dark خودش gray.950 می‌شود)
<Box bg="bg.panel">
// ✅ سطح صفحه
<Box bg="bg">
```
> ⛔ `bg="white"` را به‌عنوان جایگزین نگذار — hardcode نیست ولی **تم‌پذیر هم نیست**
> (در dark هم white می‌ماند). جزئیات ↓ § «`bg="white"`».

### `bg="white"` — توکن هست، ولی dark را می‌شکند
```tsx
// ❌ hardcode واقعی
<Box bg="#ffffff">

// 🟡 توکن هست (gate hardcode نمی‌گیردش) ولی در dark هم white می‌ماند
<Box bg="white">

// ✅ برای هر سطح تم‌پذیر (کارت، پنل، SegmentGroup.Indicator، Drawer)
<Box bg="bg.panel">   // white در light · gray.950 در dark
```
> چون `white` یک palette token معتبر است، نه linter و نه `dev-engine` آن را می‌گیرند —
> فقط dark mode آن را لو می‌دهد.
> سابقه: Vitrina (۱۴۰۴) — چهار صفحهٔ auth (`AuthLayout`, `SignupLayout`,
> `SignupPreparingView`, `SignupDoneView`) با `bg="white"` ship شدند و در dark روشن ماندند.

### 🟡 `bg="bg.subtle"` — کار می‌کنه
```tsx
// ✅ این token درسته
<Box bg="bg.subtle">  // #fafafa در light mode
```

### `useColorMode` — DOES NOT EXIST
```tsx
// ❌ از Chakra import نکن
import { useColorMode } from '@chakra-ui/react'

// ✅ از custom context استفاده کن
import { useColorMode } from '@/contexts/ColorModeContext'
```

### Dark Mode — class روی `html`، نه wrapper div
```tsx
// ✅ Portal content باید .dark class روی <html> ببینه
document.documentElement.classList.toggle('dark')

// ❌ روی wrapper div
<div className="dark"><App /></div>
```

### Color Mode Storage
```tsx
// localStorage key پروژه Vitrina
localStorage.key = 'vitrina-color-mode'
// برای پروژه‌های دیگه، نام پروژه رو عوض کن
```

---

## 🔴 Styling System (chakra() factory — چند کامپوننت را هم‌زمان می‌گیرد)

### `direction` prop — فقط روی `Flex`/`Stack` کار می‌کنه
```tsx
// ❌ `direction` رو Flex/Stack به‌صورت ویژه به flexDirection ترجمه می‌کنن؛ کامپوننت‌های
// دیگه (RadioCard.ItemControl, Grid, هر chakra() factory عمومی) این ترجمهٔ ویژه رو ندارن —
// prop بی‌صدا drop می‌شه (نه warning، نه error) و رسیپیِ پیش‌فرض (معمولاً flex-direction:row) می‌مونه.
<RadioCard.ItemControl direction={{ base: 'column', sm: 'row' }}>  // بی‌اثر!

// ✅ همیشه از shorthand عمومیِ style-system استفاده کن
<RadioCard.ItemControl flexDirection={{ base: 'column', sm: 'row' }}>
```
> تشخیص داده شد با inspect مستقیمِ computed CSS در preview: خروجی media query برای
> `direction` کاملاً خالی بود. قانون: روی هر کامپوننتی جز `Flex`/`Stack`، `flexDirection`
> بنویس نه `direction`.
> سابقه: Vitrina `DiscountSelectPanel.tsx` (۱۴۰۴) — چیدمان موبایل کارت تخفیف ستونی نمی‌شد.

### `sx` prop — selectorهای تودرتو inject نمی‌شوند
```tsx
// ❌ بی‌اثر — nested selector اصلاً به CSS تبدیل نمی‌شود
<Box sx={{ '& .child': { color: 'red' }, '&:focus-within': { borderColor: 'blue' } }} />

// ✅ سه جایگزین، بسته به مورد
<Box _focusWithin={{ borderColor: 'blue' }} />        // pseudo → prop خودِ Chakra
<Global styles={{ '.child': { color: 'red' } }} />    // @emotion/react
editorProps={{ attributes: { style: '…' } }}          // کتابخانهٔ ثالث (مثلاً Tiptap)
```
> سابقه: Vitrina (۱۴۰۴) — استایل‌دهی به محتوای Tiptap.

### `Text` و `Flex` — `href` قبول نمی‌کنن
```tsx
// ❌
<Text href="/path">

// ✅ با <a> wrap کن
<a href="/path"><Text>لینک</Text></a>
```

### Flex ستونی با `justify="center"` و تنها فرزندِ `flex="1"` — بی‌اثر می‌شود
```tsx
// ❌ فرزند تمام فضا را می‌بلعد، چیزی برای توزیع نمی‌ماند → centering اتفاق نمی‌افتد
<Flex direction="column" justify="center"><Box flex="1">…</Box></Flex>

// ✅ justify را روی همان فرزند flex=1 هم بگذار
<Flex direction="column"><Flex flex="1" direction="column" justify="center">…</Flex></Flex>
```
> باگ چاکرا نیست — رفتار استاندارد flexbox است، ولی مکرراً به‌عنوان باگ گزارش می‌شود.
> سابقه: Vitrina `AuthLayout.tsx` (`centerContent` prop، ۱۴۰۴).

---

## 🔴 RTL (کلی)

### `textAlign="end"` در RTL — چپ‌چین میشه
```tsx
// ❌ در RTL، end = inline-end = LEFT
<Text textAlign="end">متن فارسی</Text>  // چپ‌چین!

// ✅ تنها شکل درست برای راست‌چین در RTL:
<Text textAlign="start">متن فارسی</Text>  // start = راست در RTL
```
> **چرا؟** در RTL، inline-start = راست، inline-end = چپ. پس `end` عکس چیزیه که انتظار داری.
> ⛔ **`textAlign="right"` راه‌حل نیست** — مقدار فیزیکی است، با `dir` فلیپ نمی‌شود و در یک
> کدبیس دو-جهته می‌شکند. `dev-engine` روی آن error می‌دهد (rule `one-align-idiom`).
> یک idiom در کل پروژه: `start`/`end`، هرگز `right`/`left`.

### `position="fixed"` + centering — `insetInlineStart` فرمول را در RTL می‌شکند
```tsx
// ❌ در RTL به right ترجمه می‌شود؛ فرمول centering فیزیکی و جهت‌مستقل است → عنصر پرت می‌شود
<Box position="fixed" insetInlineStart="50%" transform="translateX(-50%)" />

// ✅ ترجیحی — وقتی عرض باید fill بماند: دو لبه با مقدار یکسان
<Box position="fixed" insetInlineStart="4" insetInlineEnd="4" />
// چون دو طرف برابرند، منطقی/فیزیکی فرقی ندارد؛ عرض خودش از فاصلهٔ لبه‌ها می‌آید
// (بدون maxW/w/transform، با کوچک‌شدن viewport خودش کوچک می‌شود).

// ✅ فقط اگر maxW ثابت لازم داری: left فیزیکی + transform (تنها استثنای مجازِ فیزیکی)
<Box position="fixed" left="50%" transform="translateX(-50%)" maxW="640px" />
```
> سابقه: Vitrina `ManualOrderFooter.tsx` (۱۴۰۴).

### 🟢 Portal + RTL — الگوی کارکرده
```tsx
// همیشه dir="rtl" به Positioner اضافه کن
<Menu.Positioner dir="rtl">
<Drawer.Positioner dir="rtl">
<Tooltip.Positioner dir="rtl">
```
