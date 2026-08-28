# Chakra UI v3 — InputGroup

## 🔴 element متنی — فرمول padding پیش‌فرض کافی نیست

```tsx
// ❌ ps/pe پیش‌فرض بر اساس var(--input-height) حساب می‌شود — برای یک آیکون درست است،
// برای متن عریض‌تر نه؛ متن ورودی روی دکوریشن می‌افتد.
<InputGroup startElement="https://" endElement=".example.com"><Input /></InputGroup>

// ✅ ps/pe را دستی متناسب با عرض واقعیِ اندازه‌گیری‌شده بده
<InputGroup startElement={<span ref={preRef}>https://</span>}>
  <Input ps={`${preW + 12}px`} />   // preW = preRef.current.getBoundingClientRect().width
```
> سابقه: Vitrina `SignupBasicInfoView.tsx` (۱۴۰۴) — فیلد آدرس اختصاصی فروشگاه.
