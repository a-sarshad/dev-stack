# Chakra UI v3 — Known Bugs & Gotchas
> updated: 2026-07-12
> این فایل در حین کار با پروژه‌های واقعی update می‌شه

---

## 🔴 Bugs تأییدشده

### lineHeight numeric tokens — BROKEN
```tsx
// ❌ اشتباه — unitless CSS تولید می‌کنه (8 × font-size = 192px!)
<Text lineHeight="8">

// ✅ درست — از ratio string استفاده کن
<Text lineHeight="1.333">  {/* 32px at 2xl */}
<Text lineHeight="1.14">   {/* 32px at 3xl */}
```

### textAlign="end" در RTL — چپ‌چین میشه
```tsx
// ❌ در RTL، end = inline-end = LEFT
<Text textAlign="end">متن فارسی</Text>  // چپ‌چین!

// ✅ برای راست‌چین در RTL:
<Text textAlign="right">متن فارسی</Text>
// یا
<Text textAlign="start">متن فارسی</Text>  // start = راست در RTL
```
> **چرا؟** در RTL، inline-start = راست، inline-end = چپ.
> پس `end` عکس چیزیه که انتظار داری.

### bg="bg.default" — BROKEN
```tsx
// ❌ CSS var به transparent resolve می‌شه
<Box bg="bg.default">

// ✅
<Box bg="white">   // light mode
<Box bg="bg">      // semantic (safe)
```

### useColorMode — DOES NOT EXIST
```tsx
// ❌ از Chakra import نکن
import { useColorMode } from '@chakra-ui/react'

// ✅ از custom context استفاده کن
import { useColorMode } from '@/contexts/ColorModeContext'
```

### PinInput — native `autoFocus` on `Input` races with Next.js hydration
```tsx
// ❌ native HTML autofocus fires before React attaches listeners (SSR/hydration race)
// → zag-js machine never receives INPUT.FOCUS → stays in "idle" state
// → typing fires INPUT.CHANGE which "idle" state doesn't handle → only box 0 ever fills,
//   rest never advance. Manual blur+refocus "fixes" it because that focus event fires
//   post-hydration and is properly captured.
<PinInput.Input index={0} autoFocus />

// ✅ pass autoFocus at Root level — it's a machine prop (see pin-input.props.js),
// applied via queueMicrotask after mount, so React's onFocus is already attached
<PinInput.Root autoFocus otp dir="ltr">
  <PinInput.Input index={0} />
```
> سابقه: Vitrina OtpForm.tsx (۱۴۰۴) — فقط روی page load اول رخ می‌ده، نه بعد از هر refocus دستی.

### PinInput — `type="numeric"` ارقام فارسی رو رد می‌کنه
```tsx
// ❌ zag-js REGEX.numeric = /^[0-9]+$/ — فقط ASCII؛ کاراکتر فارسی (۰-۹) رو
// event.preventDefault() می‌کنه، هیچ رقمی وارد نمی‌شه (نه فقط "نمایش اشتباه" — کامل reject)
<PinInput.Root otp type="numeric">

// ✅ pattern رو دستی باز کن تا هر دو رنج رو قبول کنه، بعد در onValueChange نرمالایز کن
<PinInput.Root
  otp
  pattern="^[0-9۰-۹]+$"
  onValueChange={(e) => setValue(e.value.map(toLatinDigits))}
>
```
> سابقه: Vitrina OtpForm.tsx (۱۴۰۴) — کاربردی برای هر پروژهٔ فارسی/RTL که کیبورد فارسی می‌فرسته.

### Progress `striped` — `--stripe-color` conditional custom-property resolve نمی‌شه
```tsx
// ❌ recipe داخلی Progress.Range: "--stripe-color": { _light: "...", _dark: "..." }
// این مقدار conditional روی یه CSS custom property (نه یه property معمولی) resolve نمی‌شه —
// computed value خالی می‌مونه → backgroundImage که بهش var(--stripe-color) رفرنس می‌ده
// invalid می‌شه → کلاً "none". تأیید شده با computed style: --stripe-size و backgroundSize
// از recipe اومدن (پس context/variant propagation کار می‌کنه)، فقط --stripe-color نه.
<Progress.Root striped>  {/* بی‌اثر — راه‌راه دیده نمی‌شه */}
  <Progress.Track><Progress.Range /></Progress.Track>
</Progress.Root>

// ✅ backgroundImage رو مستقیم با مقدار ثابت بده + override با _dark (نه custom property)
<Progress.Range
  backgroundImage="linear-gradient(45deg, rgba(255,255,255,0.3) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.3) 75%, transparent 75%, transparent)"
  backgroundSize="1rem 1rem"
  _dark={{
    backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.3) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.3) 75%, transparent 75%, transparent)',
  }}
/>
```
> نسخه: `@chakra-ui/react@3.35.0`. `animated` variant هم همین ریسک رو داره چون از همون `--stripe-size` استفاده می‌کنه — تست نشده، ولی احتیاط کن.
> سابقه: Vitrina SignupPreparingView.tsx (۱۴۰۴).

### Avatar.Root / Complex Components — asChild ref issue
```tsx
// ❌ ref forward نمی‌کنه برای asChild
<Avatar.Root asChild>
  <button>

// ✅ با Box wrap کن
<Box as="button" type="button">
  <Avatar.Root>
```

---

## 🟡 Gotchas (اشتباه نیستن، ولی غیر‌منتظره‌ان)

### bg="bg.subtle" — کار می‌کنه
```tsx
// ✅ این token درسته
<Box bg="bg.subtle">  // #fafafa در light mode
```

### Tooltip namespace
```tsx
// ✅ روش درست Chakra v3
<Tooltip.Root>
  <Tooltip.Trigger asChild>
    <Button>hover me</Button>
  </Tooltip.Trigger>
  <Tooltip.Content>متن tooltip</Tooltip.Content>
</Tooltip.Root>
```

### Text و Flex — href قبول نمی‌کنن
```tsx
// ❌
<Text href="/path">

// ✅ با <a> wrap کن
<a href="/path"><Text>لینک</Text></a>
```

### Dark Mode — class روی html نه wrapper div
```tsx
// ✅ Portal content باید .dark class روی <html> ببینه
document.documentElement.classList.toggle('dark')

// ❌ روی wrapper div
<div className="dark"><App /></div>
```

### RadioCard — border روی `Item` (label)، نه `ItemControl`
```tsx
// recipe رادیو-کارت border + box-shadow ring رو روی RadioCard.Item (همون <label>)
// می‌ذاره. اگه border خودت رو روی ItemControl هم بذاری → دو border نمایش داده میشه
// (Item recipe + ItemControl تو).

// ❌ double-border
<RadioCard.Item value={v}>
  <RadioCard.ItemControl borderWidth="1px" borderColor="border.muted">…

// ✅ استایل کارت روی Item، ItemControl فقط layout
<RadioCard.Item value={v}
  borderWidth="1px" borderColor="border.muted" boxShadow="none"
  _hover={{ borderColor: 'brand.border' }} _checked={{ borderColor: 'brand.solid' }}>
  <RadioCard.ItemHiddenInput />
  <RadioCard.ItemControl border="none" p="0" boxShadow="none">…
```
> `boxShadow="none"` لازمه: حالت checked یه ring (`0 0 0 1px`) جدا از border می‌ذاره = خط دوم.
> سابقه: Vitrina Sender-Card (۱۴۰۴) — verify با computed style: Item border، ItemControl border=0.

---

## 🟢 Patterns کار‌کرده

### Portal + RTL
```tsx
// همیشه dir="rtl" به Positioner اضافه کن
<Menu.Positioner dir="rtl">
<Drawer.Positioner dir="rtl">
<Tooltip.Positioner dir="rtl">
```

### Select/Menu داخل Dialog با scrollBehavior="inside" → Portal کن
```tsx
// Dialog با scrollBehavior="inside" → body اش overflow:auto میشه. اگه Select.Positioner
// inline بمونه، dropdown داخل body clip میشه و کاربر مجبوره body رو اسکرول کنه.

// ✅ Positioner رو Portal کن → content به <body> میره، بالای dialog و clip نمیشه
<Portal>
  <Select.Positioner>
    <Select.Content>…</Select.Content>
  </Select.Positioner>
</Portal>
```
> Dialog خودش Portal شده؛ content چاکرا z-index=`popover` می‌گیره (۱۵۰۱) > dialog (۱۵۰۰)
> → روی dialog، clickable، floating-ui نسبت به trigger position می‌کنه.
> سابقه: Vitrina EditAddressDialog (۱۴۰۴).

### bg="white" در Chakra
```tsx
// ✅ این palette token هست، hardcode نیست
<Box bg="white">
// ❌ hardcode
<Box bg="#ffffff">
```

### Color Mode Storage
```tsx
// localStorage key پروژه Vitrina
localStorage.key = 'vitrina-color-mode'
// برای پروژه‌های دیگه، نام پروژه رو عوض کن
```
