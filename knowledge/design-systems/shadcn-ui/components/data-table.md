# shadcn/ui — Data Table

## ⚠️ `data-table` یه registry item نیست

```bash
npx shadcn@latest add data-table   # ❌ چنین چیزی وجود نداره
```

Data Table یه **الگوی composition** ـه: `Table` (رجیستری) + `@tanstack/react-table`
(پکیج npm). تو رجیستری فقط `data-table-demo` از نوع `registry:example` هست.

**نقطه‌ی شروع درست** — مثال زنده رو بگیر و بومی‌سازی کن:
```bash
npx shadcn@latest view @shadcn/data-table-demo
# یا کاملش داخل بلاک: npx shadcn@latest view @shadcn/dashboard-01
```

## 🔴 TanStack Table v9 — API عوض شده، هر feature باید صریح رجیستر بشه

امروز (۲۰۲۶) `pnpm add @tanstack/react-table` نسخه‌ی **v9.x** نصب می‌کنه.
اکثر tutorialها و حافظه‌ی مدل v8 ـه:

| v8 (قدیمی) | v9 (فعلی) |
|---|---|
| `useReactTable` | `useTable` |
| `getCoreRowModel()` / `getSortedRowModel()` | `tableFeatures({...})` + `createSortedRowModel()` |
| `flexRender(component, props)` (تابع) | `<FlexRender cell={cell} />` (کامپوننت JSX) |

### تله‌ی اصلی: feature رجیستر‌نشده = خطای TS روی متد بی‌ربط

**هر feature باید صریح در `tableFeatures({...})` رجیستر بشه، حتی وقتی فقط یه
متد جانبی‌شو لازم داری.**

**تجربه‌ی واقعی** (Sample Dashboard): فقط `rowSortingFeature` رجیستر شد (برای
sort ستون‌ها) ولی `row.getVisibleCells()` با **TS2339** شکست — چون
`getVisibleCells` روی نوع `Row` فقط وقتی تعریف می‌شه که
`columnVisibilityFeature` هم رجیستر شده باشه، **حتی بدون هیچ UI برای toggle
کردن visibility**.

```ts
// اگه از FlexRender / getVisibleCells استفاده می‌کنی، این همیشه لازمه:
tableFeatures({ rowSortingFeature, columnVisibilityFeature, ... })
```

**درس کلی:** خطای TS2339 روی یه متد TanStack = «feature مربوطه رجیستر نشده»،
نه «تایپ خرابه». دنبال feature بگرد، نه دنبال cast.

**منبع درست API:** خودِ `dashboard-01/components/data-table.tsx` زنده — نه
حافظه، نه tutorial.
