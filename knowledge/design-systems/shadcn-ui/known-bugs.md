# shadcn/ui — Known Bugs & Gotchas

<!--
اینجا چی می‌ره: رفتار غیرمنتظره‌ی خودِ کتابخانه/CLI که **cross-component** ـه —
CLI، preset/config، RTL کلی، رجیستری، tooling.
اینجا چی نمی‌ره:
  · باگ یه کامپوننت مشخص → `components/<name>.md`
  · باگ مخصوص کد یک پروژه → known-bugs محلی همون پروژه
-->

## 📍 باگ‌های مخصوص یک کامپوننت → `components/`

| کامپوننت | تله |
|---|---|
| [`chart`](components/chart.md) | رنگ پیش‌فرض achromatic — چارت خاکستری درمیاد |
| [`combobox`](components/combobox.md) | multi-select + chips (Base-only)، فیکس عرض popover |
| [`collapsible`](components/collapsible.md) | `data-panel-open` (نه `data-state`) زیر Base UI |
| [`data-table`](components/data-table.md) | registry item نیست + TanStack Table v9 |
| [`dropdown-menu`](components/dropdown-menu.md) | `onSelect` بی‌صدا از کار می‌افته |
| [`sidebar`](components/sidebar.md) | RTL auto-migrate ردش می‌کنه |

قانون اینکه چی لایق فایل جداست → `components/README.md`.

---

## 🔴 Config / CLI

### Style و base بعد از `init` قفل می‌شن
`style`, `base` (radix/base), و `tailwind.cssVariables` در `components.json`
بعد از init قابل تغییر نیستن بدون حذف و نصب مجدد **همه‌ی** کامپوننت‌های
نصب‌شده. قبل از شروع implement جدی، این سه تا رو مطمئن شو.

---

## 🔴 RTL (کلی — قوانین کامل در `rtl.md`)

### `tw-animate-css` — انیمیشن‌های logical کار نمی‌کنن
باگ شناخته‌شده در خودِ `tw-animate-css`: کلاس‌های logical slide (مثل تبدیل
`slide-in-from-right` به `slide-in-from-end`) درست کار نمی‌کنن. فیکس فعلی
(workaround رسمی خودِ shadcn، نه راه‌حل کامل): پراپ `dir="rtl"` رو مستقیم
به portal content بده:
```tsx
<PopoverContent dir="rtl">...</PopoverContent>
<TooltipContent dir="rtl">...</TooltipContent>
```

### auto-transform فقط روی preset جدید کار می‌کنه
`rtl: true` در `components.json` باعث می‌شه CLI کلاس‌های physical
(`left-*`/`right-*`) رو موقع `add` به logical (`start-*`/`end-*`) تبدیل کنه —
ولی **فقط** برای پروژه‌های ساخته‌شده با style جدید (`base-nova`, `radix-nova`
و مشابه). برای style قدیمی‌تر باید migration دستی انجام بدی.

### سه کامپوننت با `migrate rtl` تبدیل نمی‌شن
`npx shadcn@latest migrate rtl [path]` همه‌ رو تبدیل می‌کنه **به‌جز**
`Calendar`, `Pagination`, `Sidebar` — این سه دستی. رایج‌ترین‌شون Sidebar ـه
→ [`components/sidebar.md`](components/sidebar.md).

---

## 🔴 Migration radix→base (الگوی کلی)

### درس اصلی: `pnpm build` سبز ≠ migration سالم
دو کلاس خطا از تور TypeScript رد می‌شن و **فقط رفتار** رو می‌شکنن:

| نوع | چرا نامرئیه | sweep |
|---|---|---|
| کلاس Tailwind دستی روی state پرایمیتیو (`data-[state=open]`) | فقط یه رشته‌ی `className` ـه، نه prop تایپ‌شده | `grep -rn "data-\[state=" src --include=*.tsx \| grep -v "/ui/"` |
| propای که React خودش هم‌نامش رو داره (`onSelect`) | به تایپ عمومی React resolve می‌شه، نه پراپ نبودهٔ primitive | `grep -rn "onSelect=" src --include=*.tsx \| grep -v "/ui/"` |

هر دو `--overwrite` رو هم رد می‌کنن، چون CLI فقط `ui/` رو بازنویسی می‌کنه نه
کد اپ. **بعد از هر migration این دو تا grep اجباری‌ان.**

نمونه‌های مشخص → [`components/collapsible.md`](components/collapsible.md) ·
[`components/dropdown-menu.md`](components/dropdown-menu.md)

⛔ اسم attribute رو **حدس نزن** — هر primitive فرق داره. مرجع:
`node_modules/@base-ui/react/docs/react/components/<name>.md` (۳۷ فایل،
auto-versioned با پکیج).

---

## 🔴 Tooling

### MCP registry tools می‌تونن false `NOT_FOUND` بدن
تجربه‌ی واقعی (۲۰۲۶-۰۸-۲۶، gap audit روی `dev-stack`):
`mcp__shadcn__view_items_in_registries` با `@shadcn/questionnaire` (کامپوننت
واقعاً موجود، نصب‌پذیر با `npx shadcn@latest add questionnaire`) خطای
`NOT_FOUND` داد — چون به‌جای style پروژه یه URL هاردکد با style قدیمی می‌زد:
`ui.shadcn.com/r/styles/new-york-v4/questionnaire.json`.
مشابهش `list_items_in_registries` هم `questionnaire`/`form`/`toast` رو در
فهرست ۶۱تایی‌ش نداشت، با اینکه هر سه واقعاً در رجیستری هستن.

**درس:** برای «این کامپوننت وجود داره یا نه» به MCP تنها تکیه نکن — با
`npx shadcn@latest add <name> --dry-run` یا `ui.shadcn.com/docs/components/<name>`
صحت‌سنجی کن، مخصوصاً برای کامپوننت‌های تازه‌اضافه‌شده.

---

## 🟡 Gotchas

- `npx shadcn add ... command ...` (هر ترکیبی که `command` رو شامل بشه)
  به‌خاطر دپندنسی داخلی `CommandDialog` روی `Dialog`، فایل‌های اضافه‌ای هم
  می‌سازه که مستقیم نخواستی (`dialog.tsx`, `textarea.tsx`, `input-group.tsx`
  در یه تجربه‌ی واقعی). بی‌ضررن (tree-shake می‌شن) ولی توی commit دیده
  می‌شن — تعجب نکن.
- `--defaults`/`-d` روی `init` معنی preset پیش‌فرض رو داره؛ این preset **خودش
  بین نسخه‌های CLI عوض می‌شه** (طی چند ماه از `nova` به `base-nova` رفت).
  همیشه با `npx shadcn@latest preset resolve` چک کن، حدس نزن.
- ⚠️ preset **code** (رشته‌ی base62 مثل `aJMi5Dc`) می‌تونه به base اشتباه
  resolve بشه. باگ واقعی گیت‌هاب (`shadcn-ui/ui#9914`): یه code که باید
  `base-vega` می‌داد، `radix-vega` می‌داد و skill سعی می‌کرد پروژه رو از
  Base UI به Radix برگردونه. **الان fix شده (PR #9923)** ولی درسش می‌مونه:
  بعد از `preset` زدن، `npx shadcn@latest info` رو چک کن که `base` عوض نشده
  باشه.
- ساختن پروژه‌ی Vite جدید با scaffold دستی (`pnpm create vite` + نصب دستی
  Tailwind + ویرایش دستی `tsconfig`/`vite.config`) کار اضافه‌ست — CLI با یه
  دستور (`shadcn init -t vite --name <app>`) همه‌شو انجام می‌ده →
  `scaffold.md`.
- `iconLibrary` رو هیچ‌وقت فرض نکن `lucide-react` — از `components.json` یا
  `npx shadcn@latest info` بخون. کامپوننت‌های community registry
  (`@magicui`, `@tailark`, …) معمولاً با آیکون‌ست خودشون میان و باید بعد از
  نصب دستی swap بشن.
- کامپوننت‌های رجیستری‌های community ممکنه import path هاردکد
  (`@/components/ui/...`) داشته باشن که با alias واقعی پروژه (مثلاً
  `@workspace/ui/components` در monorepo) نمی‌خونه — بعد از `add` از رجیستری
  غیر `@shadcn`، importها رو چک کن.
