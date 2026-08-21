
---

## Bootstrap 5 — واژگان این فایل

> این بخش به `_TEMPLATE/DESIGN-template.md` **الحاق** می‌شود. اینجا مقدار توکن ننویس —
> فقط نام utility ها و متغیرهایی که موقع پرکردن TODO های بالا لازم داری.

### Grid

سیستم ۱۲ستونه با `container` / `row` / `col-*`. breakpoint ها: `sm 576 · md 768 · lg 992 · xl 1200 · xxl 1400`.
در §Layout بالا **رفتار** هر بازه را بنویس (چند ستون، ناوبری چه می‌شود، چه چیزی حذف می‌شود) — نه صرفاً این اعداد.

### Shapes — کلاس‌های `rounded`

`rounded-0 · rounded-1 · rounded-2 · rounded-3 · rounded-4 · rounded-5 · rounded-circle · rounded-pill`.
در §Shapes بنویس کدام برای کدام نقش.

### Elevation

`shadow-none · shadow-sm · shadow · shadow-lg`.
متغیر SCSS: `$box-shadow-*` در `_overrides.scss`.

### Interaction & States — selector ها

| حالت | selector / کلاس |
|---|---|
| hover | `:hover` |
| active | `.active` / `:active` |
| disabled | `.disabled` / `[disabled]` / `:disabled` |
| focus قابل‌دیدن | `:focus-visible` (نه `:focus`) |
| بارگذاری | `.spinner-border` / `.placeholder` (skeleton) |

### توکن‌ها

منبع: `_tokens.scss` (متغیرهای پروژه) + `_overrides.scss` (بازنویسی پیش‌فرض‌های Bootstrap).
هرگز مقدار را در این فایل کپی نکن — فقط نام متغیر (`$primary`، `$body-bg`، …).

### RTL

Bootstrap 5 نسخهٔ RTL جدا دارد (`bootstrap.rtl.css`) و از logical property ها استفاده می‌کند:
`ms-*` / `me-*` / `ps-*` / `pe-*` — نه `ml-*` / `mr-*`.
قواعد جهت → `CLAUDE.md` §Direction (enforce: `dev-engine`).
