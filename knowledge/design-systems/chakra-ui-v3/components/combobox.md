# Chakra UI v3 — Combobox

## 🔴 `Combobox.Root` — `inputValue` کنترل‌شده + `allowCustomValue` ورودی دلخواه را گم می‌کند

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
> هم‌خانوادهٔ باگِ `RadioCard value={x ?? undefined}` (`radio-card.md`) — الگوی کلی: در این
> کامپوننت‌ها state داخلیِ zag با controlled prop کاملاً sync نمی‌ماند.
> سابقه: Vitrina `VariantAccordion.tsx` (`SuggestCombobox`، ۱۴۰۴).
