# Chakra UI v3 — PinInput

## 🔴 native `autoFocus` روی `Input` با hydration نکست‌جی‌اس ریس می‌کنه

```tsx
// ❌ native HTML autofocus قبل از اتصال listenerهای React فایر می‌شه (SSR/hydration race)
// → machine داخلی zag-js هیچ‌وقت INPUT.FOCUS نمی‌گیره → توی state "idle" می‌مونه
// → تایپ‌کردن INPUT.CHANGE فایر می‌کنه که "idle" state هندلش نمی‌کنه → فقط باکس ۰ پر
// می‌شه، بقیه هیچ‌وقت جلو نمی‌رن. blur+refocus دستی "فیکسش می‌کنه" چون اون رویداد
// فوکوس بعد از hydration فایر می‌شه و درست capture می‌شه.
<PinInput.Input index={0} autoFocus />

// ✅ autoFocus رو سطح Root بده — این یه machine prop ـه (نگاه کن pin-input.props.js)،
// از طریق queueMicrotask بعد از mount اعمال می‌شه، پس onFocus ری‌اکت از قبل وصله
<PinInput.Root autoFocus otp dir="ltr">
  <PinInput.Input index={0} />
```
> سابقه: Vitrina `OtpForm.tsx` (۱۴۰۴) — فقط روی page load اول رخ می‌ده، نه بعد از هر refocus دستی.

## 🔴 `type="numeric"` ارقام فارسی رو رد می‌کنه

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
> سابقه: Vitrina `OtpForm.tsx` (۱۴۰۴) — کاربردی برای هر پروژهٔ فارسی/RTL که کیبورد فارسی می‌فرسته.
