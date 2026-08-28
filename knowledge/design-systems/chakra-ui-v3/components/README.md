# Chakra UI v3 — Per-Component Notes

> این پوشه **مرجع API نیست.** فقط تله‌هایی که تجربه شدن.

## چی اینجا می‌ره
باگ یا رفتاری که واقعاً روی یه پروژه گاز گرفته (با تاریخ/پروژه)، تله‌ای که
type-check نمی‌گیره، یا تصمیم composition تکرارشونده — همه مخصوص **یک
کامپوننت مشخص**.

## چی اینجا نمی‌ره
- prop/variant/size — از `node_modules/@chakra-ui/react` types یا
  `chakra-ui-v3.md` بخون
- باگ **cross-component** (توکن، RTL کلی، dark mode، styling system) →
  `../known-bugs.md`

## فهرست فعلی

| فایل | چی توشه |
|---|---|
| [`pin-input.md`](pin-input.md) | autoFocus hydration race، رد ارقام فارسی |
| [`progress.md`](progress.md) | `--stripe-color` conditional resolve نمی‌شه |
| [`steps.md`](steps.md) | orientation responsive، height:100%، Status رقم لاتین |
| [`combobox.md`](combobox.md) | `inputValue` کنترل‌شده + `allowCustomValue` |
| [`radio-card.md`](radio-card.md) | `value ?? undefined` پاک نمی‌کنه + border جای اشتباه |
| [`avatar.md`](avatar.md) | `asChild` ref issue |
| [`input-group.md`](input-group.md) | فرمول padding برای element متنی کافی نیست |
| [`popover.md`](popover.md) | `asChild` + `Box as="button"` type error |
| [`tooltip.md`](tooltip.md) | namespace API + RTL |
| [`select.md`](select.md) | داخل Dialog باید Portal بشه |
