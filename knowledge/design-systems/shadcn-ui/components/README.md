# shadcn/ui — Per-Component Notes

> این پوشه **مرجع API نیست.** آینه‌ی داکیومنت هم نیست.

## چی اینجا می‌ره

فقط چیزی که **از هیچ منبع زنده‌ای قابل استنتاج نیست**:

- باگ یا رفتاری که واقعاً روی یه پروژه گاز گرفته (با تاریخ و اسم پروژه)
- تله‌ای که `tsc`/`pnpm build` نمی‌گیره
- تصمیم composition که تکرار می‌شه و هر بار از نو کشفش پرهزینه‌ست

## چی اینجا **نمی‌ره** — و چرا

| ننویس | چون از اینجا رایگان و **همیشه درست** می‌گیریش |
|---|---|
| لیست `variant` / `size` | `src/components/ui/<x>.tsx` خودِ پروژه (بلوک `cva`) |
| prop table پرایمیتیو | `node_modules/@base-ui/react/docs/react/components/<x>.md` (۳۷ فایل، auto-versioned با پکیج) |
| مثال/demo رسمی | `npx shadcn@latest docs <x>` یا `mcp__shadcn__get_item_examples_from_registries` |
| قوانین کلی styling/forms/icons | `.claude/skills/shadcn/rules/*.md` (خودبه‌روزرسان) |

⚠️ **`variant`/`size` بین presetها فرق می‌کنه** (۸ style × ۲ base = ۱۶ ترکیب).
یه فایل static اینجا فقط یکی‌شو می‌تونه بنویسه → بقیه‌ی پروژه‌ها دیتای **غلط**
می‌خونن. بدتر از نبودِ دیتاست، چون agent چک نمی‌کنه. هرگز ننویس.

## قانون تولد فایل

فایل `<component>.md` **فقط** وقتی ساخته می‌شه که حداقل یه چیز earned داشته
باشه. فایل خالی یا «برای کامل بودن» ممنوع — ۶۱ فایل توخالی یعنی درد
maintenance بدون سود.

## فهرست فعلی

| فایل | چی توشه |
|---|---|
| `breadcrumb.md` | جداکنندهٔ `ChevronRightIcon` هاردکد — RTL flip دستی |
| `calendar.md` | react-day-picker میلادی — تقویم جلالی با `date-fns-jalali` + `dateLib` override |
| `chart.md` | رنگ پیش‌فرض achromatic — چارت خاکستری درمیاد |
| `combobox.md` | multi-select + chips (Base-only)، فیکس عرض popover |
| `collapsible.md` | `data-panel-open` (نه `data-state`) زیر Base UI |
| `data-table.md` | registry item نیست + API جدید TanStack Table v9 |
| `dropzone.md` | registry item نیست (Build) — trigger-only، native DnD + drag-depth counter، `Button variant=link` reset، تلهٔ discriminated-union/eslint |
| `faceted-filter.md` | فیلتر ستون جدول = Popover+Command (نه DropdownMenu)، RTL audit، جداکنندهٔ trigger روی Base UI |
| `dropdown-menu.md` | `onSelect` بی‌صدا از کار می‌افته — type-check می‌شه، fire نمی‌شه |
| `sidebar.md` | RTL auto-migrate ردش می‌کنه — دستی لازمه |

باگ‌های **cross-component** (CLI، preset، RTL کلی، رجیستری) اینجا نیستن →
`../known-bugs.md`.
