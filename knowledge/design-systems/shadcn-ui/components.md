# shadcn/ui — Component Index

<!--
اینجا چی می‌ره: فهرست کامپوننت‌های موجود در رجیستری shadcn — تا قبل از
ساختن یه چیز از صفر، اول چک بشه که از قبل وجود داره یا نه. این فایل
**index/router** ـه، نه مرجع API.
اینجا چی نمی‌ره: کامپوننت سفارشی یک پروژه‌ی خاص، یا اینکه پروژه‌ی X چطور
از این کامپوننت‌ها composition ساخته — اون سطح پروژه‌ست.
-->

## 🧭 قبل از کار با یه کامپوننت — کجا رو بخون

| دنبال چی هستی | برو اینجا |
|---|---|
| `variant` / `size` موجود | `src/components/ui/<x>.tsx` خودِ پروژه (بلوک `cva`) — **preset-specific، هرگز از حافظه** |
| prop / data-attribute پرایمیتیو | `node_modules/@base-ui/react/docs/react/components/<x>.md` |
| مثال و demo رسمی | `npx shadcn@latest docs <x>` |
| **تله‌ای که قبلاً گاز گرفته** | **`components/<x>.md` ← این پوشه** |
| باگ CLI / preset / RTL کلی | `known-bugs.md` |

فایل‌های موجود در `components/`: `chart` · `combobox` · `collapsible` ·
`data-table` · `dropdown-menu` · `sidebar` — فهرست و قانون تولد فایل →
`components/README.md`.

## ⛔ قانون طلایی این DS — قبل از هر primitive-by-primitive build

```bash
npx shadcn@latest search -q "<چیزی که می‌سازی>"
# یا با MCP: mcp__shadcn__search_items_in_registries
```

**یه صفحه‌ی رایج (dashboard، login، pricing، …) رو دستی از primitive نساز
بدون این‌که اول چک کنی یه `block` آماده هست یا نه.** مثال واقعی: صفحه‌ی
"دشبورد با sidebar + KPI cards + chart + data table" دقیقاً به‌عنوان بلاک
رسمی `dashboard-01` وجود داره (با `@tanstack/react-table`، `@dnd-kit/*` برای
drag-reorder، کامپوننت رسمی `chart` روی Recharts، `zod`) — قبل از implement،
`ui.shadcn.com/blocks` یا `mcp__shadcn__search_items_in_registries` رو چک کن.

## Component Resolution ترتیب (هماهنگ با gate کلی dev-stack)

```
1. Local  → src/components/ را grep کن؛ موجوده؟ import کن.
2. Block  → یه بلاک رسمی/community کل صفحه رو پوشش می‌ده؟ (`shadcn search -t block`)
3. DS     → کامپوننت تکی از رجیستری shadcn (`shadcn add <name>`)
4. Build  → فقط اگه هیچ‌کدوم نبود، با primitive بساز — صفر hardcode.
```

## دسته‌بندی (از AI skill رسمی، `Component Selection`)

| نیاز | کامپوننت |
|---|---|
| دکمه/کنش | `Button` (با variant مناسب) |
| ورودی فرم | `Input`, `Select`, `Combobox`, `Switch`, `Checkbox`, `RadioGroup`, `Textarea`, `InputOTP`, `Slider` |
| toggle بین ۲–۵ گزینه | `ToggleGroup` + `ToggleGroupItem` (نه loop دستی Button) |
| نمایش داده | `Table`, `Card`, `Badge`, `Avatar` |
| ناوبری | `Sidebar`, `NavigationMenu`, `Breadcrumb`, `Tabs`, `Pagination` |
| overlay | `Dialog` (modal), `Sheet` (side panel), `Drawer` (bottom sheet), `AlertDialog` (تأیید) |
| feedback | `toast`(Base)/`sonner`(Radix) , `Alert`, `Progress`, `Skeleton`, `Spinner` |
| command palette | `Command` داخل `Dialog` |
| چارت | `Chart` (wrap روی Recharts — دستی SVG نساز) |
| layout | `Card`, `Separator`, `Resizable`, `ScrollArea`, `Accordion`, `Collapsible` |
| empty state | `Empty` (نه div سفارشی) |
| منو | `DropdownMenu`, `ContextMenu`, `Menubar` |
| tooltip/info | `Tooltip`, `HoverCard`, `Popover` |
| فرم گروه‌بندی | `FieldGroup` + `Field` (نه `div` با `space-y-*`) |
| فرم با validation | `Form` — wrapper روی React Hook Form **یا** TanStack Form **یا** Formisch (سه گزینه مستقل، از `docs/forms/<lib>` انتخاب کن؛ `useActionState` هم "به‌زودی") |
| چت/پیام | `MessageScroller`, `Message`, `Bubble`, `Attachment`, `Marker` |
| پرسش‌نامه چندمرحله‌ای | `Questionnaire` (+ `QuestionnaireChoice/Choices/Progress/Next/Previous/Skip/Submit`, …) — flow سوال با جواب fixed/freeform/multiple/skippable |

## فهرست کامل کامپوننت‌های رجیستری `@shadcn` (نام‌ها، برای lookup)

> ✅ تأیید شده در برابر رجیستری زنده (۲۰۲۶-۰۸-۲۶، `mcp__shadcn__list_items_in_registries` + `ui.shadcn.com/docs/components`).

Accordion, Alert, Alert Dialog, Aspect Ratio, Attachment, Avatar, Badge,
Breadcrumb, Bubble, Button, Button Group, Calendar, Card, Carousel, Chart,
Checkbox, Collapsible, Combobox, Command, Context Menu, Dialog, Direction,
Drawer, Dropdown Menu, Empty, Field, **Form**, Hover Card, Input, Input
Group, Input OTP, Item, Kbd, Label, Marker, Menubar, Message, Message
Scroller, Native Select, Navigation Menu, Pagination, Popover, Progress,
Questionnaire, Radio Group, Resizable, Scroll Area, Select, Separator,
Sheet, Sidebar, Skeleton, Slider, Spinner, Switch, Table, Tabs, Textarea,
Toast (Base UI only — چیزی جدا از `sonner`), Toggle, Toggle Group, Tooltip

⚠️ **`Form` تا امروز (۲۰۲۶-۰۸-۲۶) توی این فهرست نبود — گم شده بود، الان اضافه شد.**
قبل از دستی composition زدن روی فرم با validation، این رو چک کن، نه فقط
`FieldGroup`/`Field` خام.

## اینا کامپوننت add-شدنی **نیستن** — guide/pattern‌ان، با اسم تو رجیستری اشتباه نگیر

`data-table`, `date-picker`, `typography` تو رجیستری `registry:ui` وجود
ندارن؛ فقط به‌شکل `registry:example` demo هستن
(`data-table-demo`, `date-picker-demo`, `date-picker-with-range`,
`date-picker-with-presets`, `typography-h1`/`-p`/`-list`/…). یعنی:

- `npx shadcn add data-table` / `add date-picker` / `add typography` کار
  نمی‌کنه (چنین registry itemای نیست) — این‌ها **الگوی composition** از
  primitiveهای دیگه‌ان: Data Table = `Table` + TanStack Table (v9 API —
  `known-bugs.md`)، Date Picker = `Popover` + `Calendar` + `Input`،
  Typography = کلاس‌های Tailwind دستی روی تگ‌های HTML، نه یه کامپوننت.
- برای شروع، مثال کامل رو با `get_item_examples_from_registries` (query
  `data-table-demo` یا `date-picker-with-presets`) یا
  `npx shadcn@latest view @shadcn/data-table-demo` بگیر، کپی کن، بومی‌سازی کن.

## قوانین composition سخت‌گیرانه (خیلی زود اشتباه می‌ره)

- `SelectItem` همیشه داخل `SelectGroup`. `DropdownMenuItem` داخل
  `DropdownMenuGroup`. `CommandItem` داخل `CommandGroup`.
- `Dialog`/`Sheet`/`Drawer` همیشه `*Title` لازم دارن (a11y) — اگه مخفیه،
  `className="sr-only"`.
- `Card` رو کامل استفاده کن: `CardHeader`/`CardTitle`/`CardDescription`/
  `CardContent`/`CardFooter` — همه‌چیز رو توی `CardContent` نریز.
- `Button` پراپ `isLoading`/`isPending` نداره — با `Spinner` + `data-icon` +
  `disabled` بساز.
- `TabsTrigger` فقط داخل `TabsList`.
- `Avatar` همیشه `AvatarFallback` لازم داره (وقتی image لود نشه).
- آیکون داخل `Button`: `data-icon="inline-start"` یا `"inline-end"` — نه
  کلاس سایز دستی (`size-4`) روی آیکون‌های داخل کامپوننت‌های خودِ shadcn.

## بلاک‌های آماده‌ی شناخته‌شده (نمونه، نه فهرست کامل)

| Block | چیه |
|---|---|
| `dashboard-01` | Sidebar + KPI cards + chart تعاملی + data table (sort/dnd/pagination) |
| `sidebar-07` | سایدباری که به آیکون collapse می‌شه |
| `sidebar-03` | سایدبار با زیرمنو |
| `login-03` / `login-04` | صفحه لاگین |

فهرست کامل و به‌روز: `ui.shadcn.com/blocks` یا `shadcn search -t block`.
