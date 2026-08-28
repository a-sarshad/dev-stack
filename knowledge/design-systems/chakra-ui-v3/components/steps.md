# Chakra UI v3 — Steps

## 🔴 `orientation` به‌شکل responsive object — variant CSS از هم leak می‌کنه، خط اتصال محو می‌شه

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

## 🔴 `orientation="vertical"` — رسیپی `height:100%` دارد، خط رابط کشیده می‌شود

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

## 🔴 `Steps.Status` بدون `current` — قدم فعلی با رقم لاتین رندر می‌شود

```tsx
// ❌ به incomplete fallback نمی‌کند؛ فقط قدم‌های غیرفعال locale می‌گیرند
<Steps.Status incomplete={toPersianDigits(i + 1)} />

// ✅ current را صریح بده
<Steps.Status current={toPersianDigits(i + 1)} incomplete={toPersianDigits(i + 1)} />
```
> مهم برای هر locale با ارقام غیر-ASCII (فارسی، عربی، هندی).
