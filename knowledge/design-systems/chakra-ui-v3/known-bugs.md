# Chakra UI v3 — Known Bugs & Gotchas
> updated: 2026-08-17
> این فایل در حین کار با پروژه‌های واقعی update می‌شه
> **canonical برای باگ‌های Chakra v3.** CLAUDE.md پروژه‌ها فقط ایندکس دارند و به اینجا اشاره
> می‌کنند — متن کامل، fix، و سابقه اینجاست. تناقض دیدی؟ این فایل برنده است.

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

// ✅ تنها شکل درست برای راست‌چین در RTL:
<Text textAlign="start">متن فارسی</Text>  // start = راست در RTL
```
> **چرا؟** در RTL، inline-start = راست، inline-end = چپ. پس `end` عکس چیزیه که انتظار داری.
> ⛔ **`textAlign="right"` راه‌حل نیست** — مقدار فیزیکی است، با `dir` فلیپ نمی‌شود و در یک
> کدبیس دو-جهته می‌شکند. `dev-engine` روی آن error می‌دهد (rule `one-align-idiom`).
> یک idiom در کل پروژه: `start`/`end`، هرگز `right`/`left`.

### bg="bg.default" — BROKEN
```tsx
// ❌ CSS var به transparent resolve می‌شه
<Box bg="bg.default">

// ✅ سطح کارت/پنل (تم‌پذیر — در dark خودش gray.950 می‌شود)
<Box bg="bg.panel">
// ✅ سطح صفحه
<Box bg="bg">
```
> ⛔ `bg="white"` را به‌عنوان جایگزین نگذار — hardcode نیست ولی **تم‌پذیر هم نیست**
> (در dark هم white می‌ماند). جزئیات ↓ § «bg="white" — توکن هست، ولی dark را می‌شکند».

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

### Steps `orientation` as responsive object — variant CSS از هم leak می‌کنه، خط اتصال محو می‌شه
```tsx
// ❌ orientation یه recipe variant prop هست، نه یه style prop معمولی — دو واریانتش
// symmetric نیستن (horizontal روی position/top/insetStart که vertical ست کرده چیزی
// override نمی‌کنه). با responsive object، توی breakpoint بالا فقط چیزهایی که
// horizontal صریح تعریف کرده override می‌شن؛ position:absolute/top/insetStart از
// vertical (که روی base بدون media query نشسته) لو می‌ره و باقی می‌مونه.
<Steps.Root orientation={{ base: 'vertical', lg: 'horizontal' }}>
// نتیجه: data-orientation روی DOM می‌شه رشتهٔ لفظی "[object Object]" (چون machine
// داخلی Ark UI انتظار string داره نه object) + جداکنندهٔ بین step‌ها با
// position:absolute (leaked) عملاً نامرئی/بدجا می‌شه، حتی در breakpoint هورایزنتال.

// ✅ orientation رو با useBreakpointValue به یه string قطعی resolve کن، بعد بده به Root
const bpOrientation = useBreakpointValue({ base: 'vertical', lg: 'horizontal' } as const) ?? 'horizontal'
<Steps.Root orientation={bpOrientation}>
```
> تأیید شده با computed style: قبل از فیکس در breakpoint هورایزنتال، `position: absolute` +
> `height: 0px` (leaked از vertical) با وجود `data-orientation="[object Object]"`. بعد از
> فیکس: `data-orientation="horizontal"`, `position: static`, `height: 2px` (درست).
> `useBreakpointValue` خودش reactive هست (`useMediaQuery` با `addEventListener('change', ...)`
> — سورس تأیید شده) پس روی resize واقعی مرورگر کار می‌کنه؛ فقط CDP viewport override بعضی
> ابزارهای automation ممکنه listener موجود رو trigger نکنه (خود `matchMedia()` تازه درست
> جواب می‌ده، پس این محدودیت تست‌ابزاره نه باگ hook).
> سابقه: Vitrina `DomainCard.tsx` (۱۴۰۴) — خط اتصال بین دو step (ثبت نیم‌سرور / اتصال دامنه) نمایش داده نمی‌شد.

**نکتهٔ تکمیلی (همون باگ، فاز دوم):** فیکس بالا `orientation` رو درست می‌کنه، ولی حتی با
`data-orientation="vertical"` صحیح، خط عمودی می‌تونه هنوز نامرئی بمونه اگه `Steps.Item` ارتفاع
کافی نداشته باشه. Separator عمودی رسیپی `position:absolute` با
`maxHeight: calc(100% - steps-size - gutter*2)` هست — این درصد از ارتفاع خودِ Item محاسبه
می‌شه. اگه Item فقط با محتواش (title/description کوتاه) ارتفاع بگیره (مثلاً ۳۶px)، این calc
منفی/صفر می‌شه و خط زیر indicator آیتم بعدی گم می‌شه (چون indicatorها عملاً به هم چسبیده‌ان).
فیکس: `Steps.Item minH="<steps-size + gutter*2 + حداقل طول خط دلخواه>"` بده (برای `size="sm"`:
32 + 24 + 24 = 80px = token `"20"`). الگوی قدیمی‌تر همین فرمول: `SignupStepper.tsx`
(`minH="112px"` برای محتوای بزرگ‌تر). این رو با `Steps.Separator minH` قاطی نکن — اون یکی طول
خودِ خط رو مشخص می‌کنه، این یکی فضایی که خط توش جا بشه.

### Combobox.Root — `inputValue` کنترل‌شده + `allowCustomValue` ورودی دلخواه را گم می‌کند
```tsx
// ❌ وقتی متن تایپ‌شده با هیچ آیتمی مطابقت ندارد، رویدادِ تایپ گاهی به state بیرونی
// نمی‌رسد و ورودی کاربر ثبت نمی‌شود.
<Combobox.Root inputValue={v} onInputValueChange={e => setV(e.inputValue)} allowCustomValue />

// ✅ uncontrolled + خواندن مقدار لحظهٔ ثبت مستقیم از DOM
<Combobox.Root key={resetKey} defaultInputValue={initial} allowCustomValue>
  <Combobox.Input ref={inputRef} />
// ثبت: inputRef.current?.value  (نه React state)
// reset از بیرون: setResetKey(k => k+1) برای remount — نه پاک‌کردن state کنترل‌شده
```
> هم‌خانوادهٔ باگِ `RadioCard value={x ?? undefined}` پایین‌تر — الگوی کلی: در این
> کامپوننت‌ها state داخلیِ zag با controlled prop کاملاً sync نمی‌ماند.
> سابقه: Vitrina `VariantAccordion.tsx` (`SuggestCombobox`، ۱۴۰۴).

### RadioGroup/RadioCard.Root — `value={x ?? undefined}` نمی‌تونه انتخاب رو پاک کنه
```tsx
// ❌ zag-js RadioGroupProps.value نوعش `string | null | undefined`ه، ولی undefined یعنی
// «uncontrolled» — یه بار که machine مقدار گرفت، پاس دادن undefined بعدی نادیده گرفته
// می‌شه و انتخاب قبلی (internal state) دست‌نخورده می‌مونه، حتی وقتی state بیرونی null شده.
<RadioCard.Root value={selectedId ?? undefined} onValueChange={...}>

// ✅ null رو صریح پاس بده — این controlled می‌مونه و واقعاً پاک می‌کنه
<RadioCard.Root value={selectedId} onValueChange={...}>  // selectedId: string | null
```
> علامتِ باگ: یه دکمهٔ «حذف انتخاب» بیرونی `state=null` می‌کنه ولی کارت هنوز visually
> checked می‌مونه؛ یا سوییچ‌کردن بین دو گروه radio مرتبط (mutually exclusive) که یکی باید
> دیگری رو پاک کنه، پاک نمی‌شه. هم‌خانوادهٔ باگِ `Combobox controlled inputValue` بالاتر در
> همین فایل — الگوی کلی: مقدار «خالی» رو با `null`/مقدارِ معنادار پاس بده، نه `undefined`.
> سابقه: Vitrina `DiscountSelectPanel.tsx` (۱۴۰۴) — «حذف تخفیف» لیست رو دیزلکت نمی‌کرد.

### `direction` prop — فقط روی `Flex`/`Stack` کار می‌کنه، نه کامپوننت‌های recipe-slot دیگه
```tsx
// ❌ `direction` رو Flex/Stack به‌صورت ویژه به flexDirection ترجمه می‌کنن؛ کامپوننت‌های
// دیگه (RadioCard.ItemControl, Grid, هر chakra() factory عمومی) این ترجمهٔ ویژه رو ندارن —
// prop بی‌صدا drop می‌شه (نه warning، نه error) و رسیپیِ پیش‌فرض (معمولاً flex-direction:row) می‌مونه.
<RadioCard.ItemControl direction={{ base: 'column', sm: 'row' }}>  // بی‌اثر!

// ✅ همیشه از shorthand عمومیِ style-system استفاده کن
<RadioCard.ItemControl flexDirection={{ base: 'column', sm: 'row' }}>
```
> تشخیص داده شد با inspect مستقیمِ computed CSS در preview: خروجی media query برای
> `direction` کاملاً خالی بود، در حالی که سایر پراپ‌ها (`gap`, `p`, `justifyContent`) درست
> اعمال می‌شدن. قانون: روی هر کامپوننتی جز `Flex`/`Stack`، `flexDirection` بنویس نه `direction`.
> سابقه: Vitrina `DiscountSelectPanel.tsx` (۱۴۰۴) — چیدمان موبایل کارت تخفیف ستونی نمی‌شد.

### Avatar.Root / Complex Components — asChild ref issue
```tsx
// ❌ ref forward نمی‌کنه برای asChild
<Avatar.Root asChild>
  <button>

// ✅ با Box wrap کن
<Box as="button" type="button">
  <Avatar.Root>
```

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

### `Steps.Root orientation="vertical"` — رسیپی `height:100%` دارد، خط رابط کشیده می‌شود
```tsx
// ❌ اگر پنل والد stretch شده باشد (align="stretch")، آیتم‌ها (flex:1 0 0) کل ارتفاع
// پنل را مساوی تقسیم می‌کنند و separator بیش از حد کشیده می‌شود.
<VStack align="stretch"><Steps.Root orientation="vertical">…

// ✅ رسیپی را override کن + فضای اضافه را با spacer جذب کن
<Steps.Root orientation="vertical" h="auto">…</Steps.Root>
<Box flex="1" />
```
> این با «`Steps.Item` ارتفاع کافی ندارد» (بالاتر) برعکسِ هم‌اند: آنجا خط کوتاه/نامرئی
> می‌شود، اینجا بیش از حد بلند. سابقه: Vitrina `SignupStepper.tsx` (۱۴۰۴).

### `Steps.Status` بدون `current` — قدم فعلی با رقم لاتین رندر می‌شود
```tsx
// ❌ به incomplete fallback نمی‌کند؛ فقط قدم‌های غیرفعال locale می‌گیرند
<Steps.Status incomplete={toPersianDigits(i + 1)} />

// ✅ current را صریح بده
<Steps.Status current={toPersianDigits(i + 1)} incomplete={toPersianDigits(i + 1)} />
```
> مهم برای هر locale با ارقام غیر-ASCII (فارسی، عربی، هندی).

### `InputGroup` با element متنی — فرمول padding پیش‌فرض کافی نیست
```tsx
// ❌ ps/pe پیش‌فرض بر اساس var(--input-height) حساب می‌شود — برای یک آیکون درست است،
// برای متن عریض‌تر نه؛ متن ورودی روی دکوریشن می‌افتد.
<InputGroup startElement="https://" endElement=".example.com"><Input /></InputGroup>

// ✅ ps/pe را دستی متناسب با عرض واقعیِ اندازه‌گیری‌شده بده
<InputGroup startElement={<span ref={preRef}>https://</span>}>
  <Input ps={`${preW + 12}px`} />   // preW = preRef.current.getBoundingClientRect().width
```
> سابقه: Vitrina `SignupBasicInfoView.tsx` (۱۴۰۴) — فیلد آدرس اختصاصی فروشگاه.

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

### `Popover.Trigger asChild` + `<Box as="button">` — type error
```tsx
// ❌ `as` فقط تگ رندرشده را عوض می‌کند، نه inference تایپ‌اسکریپت را
<Popover.Trigger asChild><Box as="button" type="button" disabled>…</Box></Popover.Trigger>

// ✅ استایل را مستقیم روی Trigger بده — خودش دکمهٔ استایل‌پذیر است
// (PopoverTriggerProps از HTMLChakraProps<"button"> ارث می‌برد)
<Popover.Trigger disabled px="3" borderWidth="1px">…</Popover.Trigger>
```
> سابقه: Vitrina `DatePicker.tsx` (۱۴۰۴).

---

## 🟡 Gotchas (اشتباه نیستن، ولی غیر‌منتظره‌ان)

### bg="bg.subtle" — کار می‌کنه
```tsx
// ✅ این token درسته
<Box bg="bg.subtle">  // #fafafa در light mode
```

### Flex ستونی با `justify="center"` و تنها فرزندِ `flex="1"` — `justify` بی‌اثر می‌شود
```tsx
// ❌ فرزند تمام فضا را می‌بلعد، چیزی برای توزیع نمی‌ماند → centering اتفاق نمی‌افتد
<Flex direction="column" justify="center"><Box flex="1">…</Box></Flex>

// ✅ justify را روی همان فرزند flex=1 هم بگذار
<Flex direction="column"><Flex flex="1" direction="column" justify="center">…</Flex></Flex>
```
> باگ چاکرا نیست — رفتار استاندارد flexbox است، ولی مکرراً به‌عنوان باگ گزارش می‌شود.
> سابقه: Vitrina `AuthLayout.tsx` (`centerContent` prop، ۱۴۰۴).

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

### bg="white" — توکن هست، ولی dark را می‌شکند
```tsx
// ❌ hardcode واقعی
<Box bg="#ffffff">

// 🟡 توکن هست (gate hardcode نمی‌گیردش) ولی در dark هم white می‌ماند
<Box bg="white">

// ✅ برای هر سطح تم‌پذیر (کارت، پنل، SegmentGroup.Indicator، Drawer)
<Box bg="bg.panel">   // white در light · gray.950 در dark
```
> چون `white` یک palette token معتبر است، نه linter و نه `dev-engine` آن را می‌گیرند —
> فقط dark mode آن را لو می‌دهد. برای سطوح، همیشه `bg.panel`.
> سابقه: Vitrina (۱۴۰۴) — چهار صفحهٔ auth (`AuthLayout`, `SignupLayout`,
> `SignupPreparingView`, `SignupDoneView`) با `bg="white"` ship شدند و در dark روشن ماندند.

### Color Mode Storage
```tsx
// localStorage key پروژه Vitrina
localStorage.key = 'vitrina-color-mode'
// برای پروژه‌های دیگه، نام پروژه رو عوض کن
```
