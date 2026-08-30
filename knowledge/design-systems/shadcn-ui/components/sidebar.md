# shadcn/ui — Sidebar

## 🔴 RTL: `migrate rtl` این رو **رد می‌کنه** — دستی لازمه

`npx shadcn@latest migrate rtl [path]` همه‌ی کامپوننت‌های نصب‌شده رو
physical→logical تبدیل می‌کنه، **به‌جز سه تا**: `Sidebar`, `Calendar`,
`Pagination`.

از این سه، **Sidebar بیشترین برخورد رو داره** — تقریباً هر admin panel
و خودِ `dashboard-01` ازش استفاده می‌کنن. اگه پروژه RTL ـه و سایدبار داره،
این قدم گم می‌شه و کسی متوجه نمی‌شه تا وقتی سایدبار سمت اشتباه باز شه.

**فیکس:** طبق بخش «RTL support» همین کامپوننت در `ui.shadcn.com/docs` دستی
migrate کن. قوانین کلی RTL این DS → `../rtl.md`.

**چک سریع بعد از migrate:**
```bash
grep -n "left-\|right-\|ml-\|mr-\|pl-\|pr-" src/components/ui/sidebar.tsx
```

## بلاک آماده — دستی نساز

۱۶ نوع سایدبار رسمی در رجیستری هست. قبل از ساختن، انتخاب کن:

| Block | چیه |
|---|---|
| `sidebar-01` | ساده، ناوبری گروه‌بندی‌شده |
| `sidebar-03` | با زیرمنو |
| `sidebar-05` | زیرمنوی collapsible |
| `sidebar-07` | به آیکون collapse می‌شه |
| `sidebar-08` | inset با ناوبری ثانویه |
| `sidebar-11` | file tree ـی |
| `sidebar-14` | سایدبار سمت راست |
| `sidebar-15` | چپ و راست همزمان |
| `sidebar-16` | با site header چسبان |

فهرست کامل (`sidebar-01`..`sidebar-16`): `npx shadcn@latest search -q sidebar -t block`

## آیکون شورون زیرمنو بعد از migration به Base UI

سایدبار معمولاً `Collapsible` توش داره — اگه چرخش شورون مرده،
`data-[state=open]` رو با `data-panel-open` عوض کن → `collapsible.md`

## 🔴 `SidebarMenuButton` هر svg تودرتو رو ۱۶px می‌کنه

`sidebarMenuButtonVariants` (در `ui/sidebar.tsx`) این کلاس‌ها رو دارد:
```
[&_svg]:size-4 [&_svg]:shrink-0
```
`[&_svg]` یک descendant combinator است (`.parent svg`) → specificity ـش از utility
مستقیم روی خود svg (`h-7 w-auto`) بیشتره → **همه رو override می‌کنه**، حتی چند لایه تودرتو.

برای آیکون‌های lucide درسته (همون ۱۶px مطلوبه). ولی اگه **لوگو/wordmark یا هر svg
بزرگ** بذاری داخل `SidebarMenuButton` → له می‌شه به ۱۶×۱۶.

**راه‌ها:**
1. لوگو رو **بیرون** `SidebarMenuButton` بذار. برای هدر، `SidebarHeader` مستقیماً
   یه `<Link>` بگیره (نه `SidebarMenu > SidebarMenuItem > SidebarMenuButton`).
   الگوی رسمی team-switcher هم آیکونش رو تو یه `<div class="size-8">` می‌پیچه که
   دقیقاً همون چیزیه که `[&_svg]:size-4` می‌خواد.
2. اگه ناچاری داخل بمونه: important سافیکس Tailwind v4 → `size-8!` (نه `!size-8`).

## لوگوی تک‌رنگ با رنگ توکن (بدون hex)

wordmark مونوکروم (همه‌ی pathها یک رنگ) → `fill` رو از تک‌تک pathها حذف کن،
`fill="currentColor"` رو روی `<svg>` ریشه بذار (ارث‌بری SVG). بعد رنگ via
`text-*` روی هر والدی: `<Link class="text-primary">` → لوگو teal می‌شه.
recolor برای dark/hover/active مجانی.

لوگوی lockup که mark ـش سمت inline-start می‌شینه → برای RTL و LTR دو نسخهٔ
جدا لازمه (فقط مختصات pathها فرق داره، نه شکل). سوییچ با `dir` از locale context.
حالت `collapsible=icon` → glyph تنها با `group-data-[collapsible=icon]:hidden`/`:block`.
