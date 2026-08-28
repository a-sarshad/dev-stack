
---

## Chakra v3 — واژگان این فایل

> این بخش به `_TEMPLATE/DESIGN-template.md` **الحاق** می‌شود. اینجا مقدار توکن ننویس —
> فقط نامِ props و level هایی که موقع پرکردن TODO های بالا لازم داری.

### Shapes — level های `rounded`

`xs · sm · md · lg · xl · 2xl · 3xl · full` + سه level معنایی `l1 · l2 · l3`.
در §Shapes بالا بنویس **کدام level برای کدام نقش** (panel / کارت / عنصر ریز / دایره) — نه مقدار px.

### Interaction & States — نام prop ها

| حالت | prop چاکرا |
|---|---|
| hover | `_hover` |
| active/pressed | `_active` |
| disabled | `_disabled` (علاوه بر prop `disabled`) |
| focus قابل‌دیدن | `_focusVisible` (نه `_focus` — آن با کلیک ماوس هم فعال می‌شود) |
| selected | `_selected` |
| checked | `_checked` |
| خالی | `EmptyState.Root` |
| بارگذاری | prop `loading` روی Button · `Skeleton` برای محتوا |

### Surface — قانون همیشگی

سطح (کارت، پنل، `SegmentGroup.Indicator`، Drawer) = `bg="bg.panel"`.
`bg="bg.default"` شکسته است (به transparent resolve می‌شود) · `bg="white"` توکن معتبر است
ولی در dark هم white می‌ماند و **هیچ gate ای نمی‌گیردش**.

**رنگ سطوح = توکن semantic، نه palette خام** — `brand.bg` نه `teal.50`.
در light هم‌هگزند، در dark فقط semantic ادپت می‌کند.

### Motion — نحوهٔ نوشتن

`transition="background 0.15s"` (shorthand) یا `transitionProperty` + `transitionDuration`.
مقادیر واقعی پروژه را در §Motion بالا بنویس.

### تایپوگرافی — default پیشنهادی (در §Typography بالا نهایی کن)

نقطهٔ شروع، نه قانون DS. اگر طراحی چیز دیگری می‌گوید همان‌جا override کن.

| موقعیت | Size | Weight |
|--------|------|--------|
| body / فرم | `sm` (14px) | `normal` (400) |
| label / caption | `xs` (12px) | `medium` (500) |
| عنوان بخش | `md` (16px) | `semibold` (600) |
| عنوان صفحه | `xl` (20px) | `semibold` (600) |
| عنوان بزرگ | `2xl` (24px) | `bold` (700) |

مقادیر خام scale (همهٔ size/weight tokenها) → `design-systems/{{DS_FOLDER}}/tokens.md §Typography`.

### تلهٔ تایپوگرافی

`lineHeight` عددی BROKEN است — `lineHeight="8"` یعنی unitless `line-height:8` = ۸× font-size.
همیشه ratio string بده: `"1.333"`.

### Overlay ها

Menu · Popover · Dialog · Drawer · Tooltip سایه‌شان از recipe خودشان می‌آید.
دستی `shadow` نده.
