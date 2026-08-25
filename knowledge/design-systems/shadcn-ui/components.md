# shadcn/ui — Component Index

<!--
اینجا چی می‌ره: فهرست کامپوننت‌های موجود در رجیستری shadcn — تا قبل از
ساختن یه چیز از صفر، اول چک بشه که از قبل وجود داره یا نه.
اینجا چی نمی‌ره: کامپوننت سفارشی یک پروژه‌ی خاص، یا اینکه پروژه‌ی X چطور
از این کامپوننت‌ها composition ساخته — اون سطح پروژه‌ست.
-->

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
| چت/پیام | `MessageScroller`, `Message`, `Bubble`, `Attachment`, `Marker` |

## فهرست کامل کامپوننت‌های رجیستری `@shadcn` (نام‌ها، برای lookup)

Accordion, Alert, Alert Dialog, Aspect Ratio, Attachment, Avatar, Badge,
Breadcrumb, Bubble, Button, Button Group, Calendar, Card, Carousel, Chart,
Checkbox, Collapsible, Combobox, Command, Context Menu, Data Table, Date
Picker, Dialog, Direction, Drawer, Dropdown Menu, Empty, Field, Hover Card,
Input, Input Group, Input OTP, Item, Kbd, Label, Marker, Menubar, Message,
Message Scroller, Native Select, Navigation Menu, Pagination, Popover,
Progress, Questionnaire, Radio Group, Resizable, Scroll Area, Select,
Separator, Sheet, Sidebar, Skeleton, Slider, Spinner, Switch, Table, Tabs,
Textarea, Toast, Toggle, Toggle Group, Tooltip, Typography

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
