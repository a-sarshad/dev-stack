# shadcn/ui — Known Bugs & Gotchas

<!--
اینجا چی می‌ره: رفتار غیرمنتظره‌ی خودِ کتابخانه/CLI که در هر پروژه‌ای که از
این DS استفاده کنه تکرار می‌شه. اینجا چی نمی‌ره: باگ مخصوص کد یک پروژه‌ی
خاص — اون known-bugs محلی همون پروژه‌ست.
-->

## 🔴 Bugs / رفتار تأییدشده

### `chart-1..5` رنگی نمی‌شن مگر دستی ست کنی
`baseColor`های موجود (`neutral`, `stone`, `zinc`, `mauve`, `olive`, `mist`,
`taupe`) پالت `chart-1..5` رو achromatic (chroma≈۰، طیف خاکستری) تولید
می‌کنن — حتی وقتی spec/طرح صریحاً یه پالت رنگی (مثلاً آبی) برای چارت
می‌خواد. هیچ preset پیش‌فرضی خودش چارت رنگی نمی‌سازه.

**تجربه‌ی واقعی (۲۰۲۶-۰۸-۲۵، پروژه Sample Dashboard):** بعد از `init` با
`baseColor: neutral`، چارت خط دشبورد خاکستری درومد در حالی که spec دقیقاً
`oklch(...)` آبی (blue-300→blue-800) خواسته بود. فیکس: مقادیر
`--chart-1`..`--chart-5` رو دستی در `:root`/`.dark` جایگزین کن — راهنمای
اضافه‌کردن/override توکن → `tokens.md`.

### Style/base بعد از `init` قفل می‌شه
`style`, `base` (radix/base), و `tailwind.cssVariables` در `components.json`
بعد از init قابل تغییر نیستن بدون حذف و نصب مجدد **همه‌ی** کامپوننت‌های
نصب‌شده. قبل از شروع implement جدی، این سه تا رو مطمئن شو.

### `tw-animate-css` + RTL — انیمیشن‌های logical کار نمی‌کنن
باگ شناخته‌شده در خودِ `tw-animate-css`: کلاس‌های logical slide (مثل تبدیل
`slide-in-from-right` به `slide-in-from-end`) درست کار نمی‌کنن. فیکس فعلی
(نه راه‌حل کامل، workaround رسمی خودِ shadcn): پراپ `dir="rtl"` رو مستقیم
به portal content بده:
```tsx
<PopoverContent dir="rtl">...</PopoverContent>
<TooltipContent dir="rtl">...</TooltipContent>
```

### RTL auto-transform فقط روی preset جدید کار می‌کنه
`rtl: true` در `components.json` باعث می‌شه CLI کلاس‌های physical
(`left-*`/`right-*`) رو موقع `add` به logical (`start-*`/`end-*`) تبدیل کنه —
ولی **فقط** برای پروژه‌های ساخته‌شده با style جدید (`base-nova`, `radix-nova`
و مشابه). برای style قدیمی‌تر باید migration دستی انجام بدی.

### سه کامپوننت auto-migrate نمی‌شن با `migrate rtl`
دستور `npx shadcn@latest migrate rtl [path]` همه‌ی کامپوننت‌های نصب‌شده رو
physical→logical تبدیل می‌کنه **به‌جز**:
- `Calendar`
- `Pagination`
- `Sidebar`

این سه باید طبق بخش RTL همون کامپوننت در docs دستی migrate بشن. اگه پروژه
از `Sidebar` استفاده می‌کنه (خیلی رایجه، dashboard-01 هم همینه) و RTL لازمه،
**این رو فراموش نکن** — auto-transform این یکی رو رد می‌کنه.

### `dashboard-01`/`data-table` بلاک از API جدید TanStack Table v9 استفاده می‌کنه، نه v8 کلاسیک
اگه `pnpm add @tanstack/react-table` بزنی، امروز (۲۰۲۶) نسخه‌ی نصب‌شده v9.x
هست — API متفاوته از الگوهای v8 که در خیلی از tutorialها/مثال‌های قدیمی‌تره:
- `useReactTable` + `getCoreRowModel()`/`getSortedRowModel()` (v8) به‌جای
  `useTable` + `tableFeatures({...})` + `createSortedRowModel()` (v9) رفته.
- `flexRender(component, props)` تابع (v8) شده `<FlexRender cell={cell} />`
  کامپوننت JSX (v9).
- **هر feature باید صریح در `tableFeatures({...})` رجیستر بشه، حتی وقتی
  فقط یه متد جانبی‌ش رو لازم داری.** تجربه‌ی واقعی: فقط `rowSortingFeature`
  رجیستر شد (برای sort ستون‌ها) ولی `row.getVisibleCells()` با خطای
  TS2339 شکست — چون `columnVisibilityFeature` هم باید رجیستر بشه تا
  `getVisibleCells` روی نوع `Row` تعریف بشه، حتی بدون هیچ UI برای toggle
  کردن visibility. اگه از `FlexRender`/`getVisibleCells` استفاده می‌کنی،
  `columnVisibilityFeature` رو همیشه اضافه کن.
- منبع درست API: مثال زنده‌ی خودِ `dashboard-01/components/data-table.tsx`
  از `get_item_examples_from_registries` (MCP) یا `npx shadcn@latest view
  @shadcn/dashboard-01` — نه حافظه/tutorial قدیمی.

## 🟡 Gotchas

- `--defaults`/`-d` روی `init` معنی preset پیش‌فرض رو داره؛ این preset **خودش
  بین نسخه‌های CLI عوض می‌شه** (طی همین چند ماه از `nova` به `base-nova`
  تغییر کرد). همیشه preset فعلی رو با `npx shadcn@latest preset resolve`
  چک کن، حدس نزن.
- ساختن پروژه‌ی Vite جدید با scaffold دستی (`pnpm create vite` + نصب دستی
  Tailwind + ویرایش دستی `tsconfig`/`vite.config`) کار اضافه‌ست — CLI خودش
  با یه دستور (`shadcn init -t vite --name <app>`) همه‌ی این مرحله‌ها رو
  انجام می‌ده. مسیر درست → `scaffold.md`.
- `iconLibrary` رو هیچ‌وقت فرض نکن `lucide-react` — از `components.json`
  یا `npx shadcn@latest info` بخون. کامپوننت‌های community registry
  (`@magicui`, `@tailark`, …) معمولاً با آیکون‌ست خودشون میان و باید بعد از
  نصب دستی swap بشن اگه با iconLibrary پروژه فرق دارن.
- کامپوننت‌های نصب‌شده از رجیستری‌های community ممکنه import path هاردکد
  (`@/components/ui/...`) داشته باشن که با alias واقعی پروژه (مثلاً
  `@workspace/ui/components` در monorepo) نمی‌خونه — بعد از `add` از رجیستری
  غیر `@shadcn`، importها رو چک کن.
