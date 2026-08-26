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

## 🔴 Bugs / رفتار تأییدشده (ادامه)

### migration radix→base: کلاس Tailwind دستی روی state پرایمیتیو، build رو سبز نگه می‌داره ولی رفتار می‌شکنه
اگه یه کلاس Tailwind دستی برای state یه primitive نوشته باشی (نه از خروجی
CLI، بلکه خودت نوشته باشی) — مثل `group-data-[state=open]/collapsible:rotate-90`
برای چرخوندن آیکون شورون — بعد از `shadcn add <x> --overwrite` به base-nova،
**TypeScript این رو نمی‌گیره** چون فقط یه رشتهٔ className‌ه، نه prop تایپ‌شده.
ولی دیگه کار نمی‌کنه، چون Base UI روی خیلی از primitiveها به‌جای
`data-state="open"` (Radix) از یه attribute حضوری جدا استفاده می‌کنه —
مثلاً Collapsible Trigger: `data-panel-open` (نه `data-open`، نه `data-state`).
تجربه‌ی واقعی (۲۰۲۶-۰۸-۲۶، Sample Dashboard): چک با
`node_modules/@base-ui/react/docs/react/components/collapsible.md` تأیید کرد
اسم درست attribute و کلاس رسمی خودشون برای دقیقاً همین usecase (چرخوندن
آیکون) `group-data-panel-open:rotate-90` هست.
**فیکس:** بعد از هر migration، `grep -rn "data-\[state="` روی کد اپ (نه
`ui/`، اونا رو CLI درست می‌کنه) بزن — هر match یعنی باید attribute واقعی رو
از داکیومنت خودِ primitive تو `node_modules/@base-ui/react/docs/react/components/<name>.md`
چک کنی، حدس نزن (هر primitive ممکنه attribute متفاوتی داشته باشه).

### migration radix→base: `DropdownMenuItem onSelect` بی‌صدا از کار می‌افته — نه warning، نه error
`Menu.Item` تو Radix یه prop اختصاصی به اسم `onSelect` داشت (event فعال‌سازی
آیتم). `Menu.Item` تو Base UI اصلاً همچین prop ای نداره — بجاش `onClick` +
`closeOnClick` داره (طبق `menus.md:83` خودِ skill). مشکل: React's own
`DOMAttributes` type یه `onSelect` عمومی دیگه هم داره (event انتخاب متن
داخل المنت، بی‌ربط به "این آیتم منو انتخاب شد") که رو تقریباً همه‌ی
HTML props اعمال می‌شه. پس `onSelect={...}` رو `MenuPrimitive.Item.Props`
**type-check می‌شه** (چون به اون onSelect عمومی resolve می‌کنه) ولی
Base UI's Menu.Item هیچ‌وقت صداش نمی‌زنه — نه build خطا می‌ده، نه runtime
warning، فقط callback هیچ‌وقت اجرا نمی‌شه.

تجربه‌ی واقعی (۲۰۲۶-۰۸-۲۶، Sample Dashboard): تم تاریک/روشن پروژه کاملاً از
کار افتاده بود بعد از migration — `mode-toggle.tsx` از
`<DropdownMenuItem onSelect={() => setTheme(...)}>` استفاده می‌کرد. کاربر
گزارش داد "dark mode کار نمی‌کنه"؛ `pnpm build` قبلش سبز بود و در گزارش
migration هم "clean" ثبت شده بود — چون این خطا از نوعی نیست که تایپ‌اسکریپت
بگیره.

**فیکس:** `onSelect` → `onClick`.
**درس:** leftover sweep بعد از migration نباید فقط به `pnpm build` قرمز
تکیه کنه — برای `DropdownMenuItem`/`ContextMenuItem`/`MenubarItem` (هر چیزی
که از `Menu.Item` بیس‌ ی‌می‌گیره) صریحاً `grep -rn "onSelect="` روی کد اپ
(نه `ui/`) بزن، چون این یکی type-check رو رد می‌کنه و فقط رفتار خودش رو
می‌شکنه.

## 🟡 Gotchas

- رجیستری `@shadcn` هیچ کامپوننت رسمی «multi-select» نداره (چک شد با
  `search_items_in_registries`/`npx shadcn search`). برای فیلد چندانتخابی
  با chip باید خودت از ترکیب `Popover` + `Command` + `Badge` بسازیش —
  الگوی رایج، ولی جایی در رجیستری copy-paste نمی‌شه. مشابهش برای
  free-text tag input (Enter برای افزودن) هم رجیستری نداره.
- `npx shadcn add select popover command calendar switch label` (یا هر
  ترکیبی که `command` رو شامل بشه) به‌خاطر dependency داخلی
  `CommandDialog` روی `Dialog`، فایل‌های اضافه‌ای هم می‌سازه که مستقیم
  نخواستی (`dialog.tsx`, `textarea.tsx`, `input-group.tsx` در یه تجربه‌ی
  واقعی). بی‌ضررن (اگه import نشن tree-shake می‌شن) ولی توی commit دیده
  می‌شن — تعجب نکن.
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
