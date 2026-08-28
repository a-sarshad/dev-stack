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
