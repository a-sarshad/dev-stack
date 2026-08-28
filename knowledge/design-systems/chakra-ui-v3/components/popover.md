# Chakra UI v3 — Popover

## 🔴 `Popover.Trigger asChild` + `<Box as="button">` — type error

```tsx
// ❌ `as` فقط تگ رندرشده را عوض می‌کند، نه inference تایپ‌اسکریپت را
<Popover.Trigger asChild><Box as="button" type="button" disabled>…</Box></Popover.Trigger>

// ✅ استایل را مستقیم روی Trigger بده — خودش دکمهٔ استایل‌پذیر است
// (PopoverTriggerProps از HTMLChakraProps<"button"> ارث می‌برد)
<Popover.Trigger disabled px="3" borderWidth="1px">…</Popover.Trigger>
```
> سابقه: Vitrina `DatePicker.tsx` (۱۴۰۴).
