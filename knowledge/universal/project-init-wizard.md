# Project Init Wizard
> universal — مستقل از design system
> updated: 2026-05-19

این فایل checklist تعاملی برای ایجاد پروژه جدید است.
Claude این سوال‌ها را مرحله‌به‌مرحله می‌پرسد و بر اساس جواب‌ها پروژه را **واقعاً** می‌سازد —
یعنی shell commands اجرا می‌کند، dependencies نصب می‌کند، و git init می‌زند.

---

## قوانین اجرا

- حداکثر ۳ سوال در هر مرحله — نه همه یکجا
- بعد از هر مرحله، جواب‌ها را به صورت جدول confirm کن
- سوال‌های فنی همیشه گزینه **«پیشنهاد Claude»** دارند
- اگه کاربر گفت «بعداً» یا «نمیدونم» → مقدار را `TBD` بذار و ادامه بده

---

## فاز ۰ — مسیر پروژه

```
Q0. پروژه کجا ساخته بشه؟
    مثال: ~/Documents/GitHub/Projects/
    (پیشنهاد Claude: ~/Documents/GitHub/Projects/)
```

این مسیر رو به عنوان `PARENT_PATH` نگه دار. پروژه در `PARENT_PATH/<project-name>/` ساخته می‌شه.

---

## فاز ۱ — هویت پروژه

```
Q1. نام پروژه چیه؟ (برای folder name و package.json)
Q2. نوع پروژه؟
    - Admin Panel / Dashboard
    - Landing Page / Marketing
    - E-commerce
    - Internal Tool
    - Other: ___
Q3. یه جمله کوتاه — این پروژه برای چیه؟
```

---

## فاز ۲ — Stack فنی

```
Q4. Framework؟
    - Next.js 14+ App Router  ← پیشنهاد Claude برای پروژه‌های بزرگ
    - React + Vite            ← پیشنهاد Claude برای پروژه‌های سبک
    - Vue 3 / Nuxt
    - Other: ___

Q5. زبان برنامه‌نویسی؟
    - TypeScript  ← پیشنهاد Claude
    - JavaScript

Q6. Package Manager؟
    - pnpm  ← پیشنهاد Claude
    - npm
    - yarn
```

---

## فاز ۳ — Design System

```
Q7. Design System؟
    - Chakra UI v3   ← پیشنهاد Claude اگه RTL/فارسی لازمه
    - Tailwind CSS   ← پیشنهاد Claude اگه LTR/انگلیسی
    - MUI / shadcn
    - Custom (بدون DS)

Q8. Figma file داری؟
    - بله → لینک: ___
    - خیر
    - بعداً می‌فرستم
```

---

## فاز ۴ — Brand Tokens ⭐

```
Q9.  رنگ Primary برند؟ (hex)
     یا بگو «از Figma می‌گیرم» یا «نمیدونم → پیشنهاد Claude»

Q10. رنگ Secondary / Accent؟
     (اگه نداری بگو «ندارم»)

Q11. رنگ‌های Semantic خاصی داری؟
     Error / Success / Warning
     (اگه نه → Chakra defaults استفاده می‌شه)

Q12. Dark Mode لازمه؟
     - بله
     - خیر  ← پیشنهاد Claude برای شروع

Q13. فونت اصلی؟
     - Vazirmatn  ← پیشنهاد برای RTL/فارسی
     - Inter      ← پیشنهاد برای LTR/انگلیسی
     - هر دو (دوزبانه)
     - Custom: ___
```

---

## فاز ۵ — Layout و Responsive

> این فاز سه مسیر داره — بر اساس جواب Q14b، یکی رو دنبال کن.

### مرحله ۵.۱ — شناخت اولیه

```
Q14. Target Platform؟
     - Desktop only
     - Mobile only
     - هر دو (Responsive)  ← پیشنهاد Claude

Q14b. آیا layout reference داری؟
      - بله، لینک Figma دارم    → لینک رو بده، Claude از Figma می‌خونه  [مسیر A]
      - بله، تصویر/screenshot    → آپلود کن، Claude آنالیز می‌کنه        [مسیر B]
      - خیر، توضیح می‌دم         → Claude سوال‌های هدفمند می‌پرسه        [مسیر C]
```

---

### مسیر A — Figma link

```
Claude باید این کارها رو بکنه:
1. از Figma MCP این اطلاعات رو استخراج کن:
   - اندازه frame های اصلی (desktop / mobile)
   - ارتفاع Navbar (اگه داره)
   - عرض Sidebar expanded و collapsed (اگه داره)
   - حداکثر عرض content area
   - فاصله‌های داخلی (padding/gap)
   - تعداد ستون‌های grid (اگه داره)

2. نتیجه رو به صورت جدول نشون بده (مرحله ۵.۲)
3. منتظر تأیید کاربر باش
```

---

### مسیر B — Screenshot / تصویر

```
Claude باید این کارها رو بکنه:
1. تصویر رو با دقت آنالیز کن:
   - چند zone اصلی داره؟ (Navbar / Sidebar / Main / Footer)
   - هر zone تقریباً چه ratio ای از صفحه داره؟
   - sidebar collapse می‌شه یا ثابته؟
   - آیا content محدودیت عرض داره (centered) یا full-width؟
   - چند ستون grid داره؟ (اگه مشخصه)

2. مقادیر رو با این پیش‌فرض‌ها تخمین بزن:
   - Navbar: اگه ~8% ارتفاع صفحه → 64px
   - Sidebar: اگه ~15% عرض صفحه → 256px
   - Collapsed Sidebar: اگه داره → 72px
   - Content max-width: اگه full → 1920px، اگه centered → 1440px یا 1280px

3. نتیجه رو به صورت جدول نشون بده (مرحله ۵.۲)
4. منتظر تأیید کاربر باش
```

---

### مسیر C — توضیح متنی

```
Q15. Layout اصلی؟
     - Sidebar ثابت + Main content
     - Top Navbar + Main content (بدون sidebar)
     - Full Width (بدون محدودیت)
     - Centered (max-width مشخص)
     - Dashboard (Navbar + Sidebar + Main)   ← رایج‌ترین برای admin panel
     - Custom: ___

Q16. Navbar داری؟
     - بله، sticky (همیشه بالا)
     - بله، static (با scroll می‌ره)
     - خیر

Q17. Sidebar داری؟
     - بله، collapse می‌شه (expanded/collapsed دو حالت داره)
     - بله، ثابت (همیشه باز)
     - خیر

اگه Sidebar = بله:
Q17b. Sidebar کجاست؟
      - چپ (LTR) / راست (RTL)  ← پیشنهاد Claude برای RTL
      - چپ همیشه

Q18. Footer داری؟
     - بله (ارتفاع تقریبی؟)
     - خیر  ← پیشنهاد Claude برای admin panel
```

---

### مرحله ۵.۲ — تأیید Layout Constants

بعد از استخراج (از هر مسیر)، این جدول رو نشون بده و تأیید بگیر:

```
┌─────────────────────────────────────────────────────────┐
│  Layout Constants — [نام پروژه]                         │
├──────────────────────┬──────────────────┬───────────────┤
│ Component            │ مقدار            │ وضعیت         │
├──────────────────────┼──────────────────┼───────────────┤
│ Navbar height        │ 64px             │ ✓ تأیید / تغییر│
│ Sidebar w (expanded) │ 256px            │ ✓ / تغییر     │
│ Sidebar w (collapsed)│ 72px             │ ✓ / تغییر     │
│ Content max-width    │ 1920px           │ ✓ / تغییر     │
│ Content padding X    │ 24px             │ ✓ / تغییر     │
│ Content padding Y    │ 24px             │ ✓ / تغییر     │
│ Grid columns (desk.) │ 12               │ ✓ / تغییر     │
│ Grid gap             │ 24px             │ ✓ / تغییر     │
└──────────────────────┴──────────────────┴───────────────┘
فقط ردیف‌هایی رو نشون بده که مربوطه (مثلاً اگه sidebar نداری، اون ردیف‌ها نباشن)
```

اگه کاربر چیزی رو تغییر داد → مقدار رو آپدیت کن و جدول رو دوباره نشون بده.

---

### مرحله ۵.۳ — Breakpoints

```
Q19. Breakpoints؟
     بر اساس Q14 (Target Platform) پیشنهاد بده:

     اگه Desktop only:
     - Standard Chakra: sm(480) / md(768) / lg(992) / xl(1280) / 2xl(1536)
     - Widescreen: md(768) / xl(1440) / 2xl(1920)  ← پیشنهاد Claude
     - Custom: ___

     اگه Mobile only:
     - xs(320) / sm(375) / md(425) / lg(768)  ← پیشنهاد Claude
     - Standard Chakra
     - Custom: ___

     اگه Responsive:
     - Standard Chakra  ← پیشنهاد Claude
     - Vitrina-style: 480/1440/1920
     - Custom: ___
```

---

### مرحله ۵.۴ — خروجی در tokens.ts

بعد از تأیید همه مقادیر، این بخش رو به `src/theme/tokens.ts` اضافه کن:

```ts
// ── Layout ─────────────────────────────────────────────
export const layout = {
  navbar: {
    h: "64px",           // از Q16 / Figma / screenshot
  },
  sidebar: {
    w: "256px",          // expanded — حذف کن اگه sidebar نیست
    wCollapsed: "72px",  // collapsed — حذف کن اگه collapse ندارد
  },
  content: {
    maxW: "1920px",      // از Q15 / Figma
    px: "24px",          // padding x
    py: "24px",          // padding y
  },
  grid: {
    columns: 12,
    gap: "24px",
  },
} as const

// ── Breakpoints ─────────────────────────────────────────
// (در createSystem تعریف می‌شه — اینجا فقط reference)
export const breakpoints = {
  sm: "480px",
  md: "768px",
  lg: "992px",
  xl: "1280px",
  "2xl": "1536px",
} as const
```

و در `CLAUDE.md` پروژه، بخش Layout رو با مقادیر واقعی پر کن:
```markdown
### Layout
- Navbar: sticky, h=64px
- Sidebar: w=256px (expanded) / 72px (collapsed), RTL-right
- Content: maxW=1920px, px=24px
- Grid: 12col, gap=24px
- Breakpoints: sm(480) / md(768) / lg(992) / xl(1280) / 2xl(1536)
```

---

## فاز ۶ — زبان و جهت

```
Q20. زبان‌های پروژه؟
     - فقط فارسی (RTL)
     - فقط انگلیسی (LTR)
     - دوزبانه فارسی + انگلیسی

Q21. Language Switcher در UI لازمه؟
     (فقط اگه دوزبانه انتخاب شد)
     - بله — runtime switching
     - خیر
```

---

## فاز ۷ — معماری کد [سوال‌های فنی]

> همه گزینه‌های این فاز «پیشنهاد Claude» دارند

```
Q22. API-ready باشه؟ (services/ جدا از UI)
     - بله — services/api/ جداگانه بساز
     - خیر — inline کافیه
     ← پیشنهاد Claude: بله (برای هر پروژه قابل رشد)

Q23. TypeScript types برای backend لازمه؟
     - بله — types/api.ts با interface ها
     - خیر
     ← پیشنهاد Claude: بله (اگه TypeScript انتخاب شده)

Q24. State Management؟
     - Zustand       ← پیشنهاد Claude
     - TanStack Query کافیه
     - Context API
     - Redux Toolkit

Q25. Data Fetching؟
     - TanStack Query (React Query)  ← پیشنهاد Claude
     - SWR
     - Axios + Fetch
```

---

## فاز ۸ — کیفیت کد [سوال‌های فنی]

```
Q26. ESLint + Prettier لازمه؟
     - بله  ← پیشنهاد Claude
     - خیر

Q27. Git Hooks با Husky لازمه؟
     - بله (lint-staged)  ← پیشنهاد Claude برای تیمی
     - خیر

Q28. Testing Setup لازمه؟
     - بله → Vitest  ← پیشنهاد Claude
     - خیر
```

---

## فاز ۹ — Git

```
Q29. Git Repository URL داری؟ (اختیاری)
Q30. Branch Strategy؟
     - main / develop  ← پیشنهاد Claude
     - main only
```

---

## فاز ۱۰ — Scaffold واقعی 🚀

بعد از جمع‌بندی همه جواب‌ها و تأیید کاربر، این مراحل را **به ترتیب** اجرا کن:

### گام ۱ — ساخت پروژه با CLI

```bash
cd <PARENT_PATH>

# React + Vite (اگه Q4 = React + Vite)
pnpm create vite <project-name> --template react-ts

# Next.js (اگه Q4 = Next.js)
pnpm dlx create-next-app@latest <project-name> --typescript --eslint --app --src-dir --import-alias "@/*" --no-tailwind

# Vue 3 (اگه Q4 = Vue 3)
pnpm create vite <project-name> --template vue-ts

# Nuxt (اگه Q4 = Nuxt)
pnpm dlx nuxi@latest init <project-name>
```

### گام ۲ — نصب dependencies

```bash
cd <PARENT_PATH>/<project-name>
pnpm install

# Chakra UI v3 (اگه Q7 = Chakra UI)
pnpm add @chakra-ui/react

# Bootstrap 5 (اگه Q7 = Bootstrap 5)
pnpm add bootstrap
# اگه پروژه دوزبانه (RTL + LTR):
pnpm add sass   # برای override راحت‌تر

# Tailwind (اگه Q7 = Tailwind)
pnpm add -D tailwindcss postcss autoprefixer && pnpm dlx tailwindcss init -p

# State Management
pnpm add zustand                          # اگه Q24 = Zustand
pnpm add @tanstack/react-query            # اگه Q25 = TanStack Query

# فونت فارسی
pnpm add @fontsource/vazirmatn            # اگه Q13 = Vazirmatn یا هر دو

# i18n (اگه Q20 = دوزبانه)
pnpm add i18next react-i18next
```

### گام ۳ — ساخت فایل‌های پروژه

این فایل‌ها را بساز (با محتوای واقعی بر اساس جواب‌های wizard):

**همیشه اجباری:**

> **⚠️ مهم — CLAUDE.md Architectural Decisions:**
> جواب‌های فاز ۷ رو مستقیماً در جدول `Architectural Decisions` داخل `CLAUDE.md` بنویس.
> این تصمیم‌ها constraint دائمی هستن — Claude در session‌های بعدی جایگزین پیشنهاد نمی‌ده.
>
> ```
> | State Management | {Q24}         | انتخاب wizard |
> | Data Fetching    | {Q25}         | انتخاب wizard |
> | Auth             | TBD           | — |
> ```
>
> هر تصمیم معماری که بعداً در session گرفته می‌شه هم اینجا اضافه می‌شه (توسط wf-update skill).

**اگه Q7 = Chakra UI v3:**
```
src/theme/
  tokens.ts        ← brand colors، fonts، spacing
  index.ts         ← createSystem با projectTokens

src/providers/
  AppProviders.tsx ← ChakraProvider + سایر providers

CLAUDE.md          ← از design-systems/chakra-ui-v3/CLAUDE-template.md کپی و customize
```

**اگه Q7 = Bootstrap 5:**
```
src/styles/
  _tokens.scss     ← از design-systems/bootstrap5/_tokens.scss کپی و customize
  _overrides.scss  ← از design-systems/bootstrap5/_overrides.scss کپی
  bootstrap.scss   ← از design-systems/bootstrap5/bootstrap.scss کپی (entry point)
  index.scss       ← @use './bootstrap'; (import در main.tsx)

CLAUDE.md          ← بر اساس CLAUDE-template عمومی، بخش DS رو با Bootstrap جایگزین کن
```

**مشترک (همه DS):**
```
HANDOFF.md         ← از universal/session-management.md الگو بگیر
README.md          ← template در فاز ۱۱ همین فایل — هر {Qx} را با جواب wizard جایگزین کن
```

**شرطی:**
```
src/i18n/LocaleContext.tsx    ← اگه Q20 = دوزبانه
src/services/api.ts           ← اگه Q22 = بله  [محتوا → زیر]
src/types/api.ts              ← اگه Q23 = بله  [محتوا → زیر]
src/contexts/ColorModeContext.tsx ← اگه Q12 = Dark Mode
.env.example                  ← اگه Q22 = بله  [محتوا → زیر]
```

**محتوای `src/services/api.ts` (اگه Q22 = بله):**
```ts
import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — auth header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor — error handling
api.interceptors.response.use(
  (res) => res.data,
  (error) => {
    if (error.response?.status === 401) {
      // TODO: redirect to login
    }
    return Promise.reject(error.response?.data ?? error)
  }
)
```
> اگه Q25 = TanStack Query، نیازی به axios نیست — می‌تونی `fetch` ساده استفاده کنی.
> اگه Q25 = SWR، همین pattern کار می‌کنه.

**محتوای `src/types/api.ts` (اگه Q23 = بله):**
```ts
// ── Shared ─────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
}

export interface ApiError {
  message: string
  code?: string
  field?: string  // برای validation errors
}

// ── Auth ────────────────────────────────────────
export interface LoginPayload { email: string; password: string }
export interface LoginResponse { token: string; user: UserResponse }
export interface UserResponse  { id: string; name: string; email: string }

// ── {Domain} — اینجا entity های پروژه اضافه کن ─
// export interface CreateXxxPayload { ... }
// export interface XxxResponse { ... }
```

**محتوای `.env.example` (اگه Q22 = بله):**
```env
# Backend
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=10000
```

### گام ۴ — context پروژه (در repo خودِ پروژه)

```
<project-root>/.claude/context/
  project-context.md  ← brand tokens، stack، layout این پروژه
```
+ thin-loader skill `<project>-context.skill` در dev-knowledge/skills/ (فقط loader — محتوا رو از repo پروژه می‌خونه، embed نمی‌کنه)

### گام ۵ — Git

```bash
cd <PARENT_PATH>/<project-name>
git init
git add -A
git commit -m "feat: scaffold <project-name> project"

# اگه Q29 = URL داره:
git remote add origin <url>
git branch -M main
git push -u origin main
```

---

## چک‌لیست تحویل

- [ ] `pnpm dev` بدون خطا اجرا می‌شه
- [ ] همه رنگ‌ها از `tokens.ts` می‌آن — هیچ hex مستقیم در component نیست
- [ ] layout constants در `tokens.ts` موجودن (navbar.h، sidebar.w، content.maxW)
- [ ] `CLAUDE.md` و `HANDOFF.md` ساخته شدن
- [ ] بخش Layout در `CLAUDE.md` با مقادیر واقعی پر شده
- [ ] `README.md` با اطلاعات واقعی پر شده
- [ ] `project-context.md` در `<project>/.claude/context/` ساخته شد + thin-loader skill
- [ ] git commit انجام شد

---

## Commit Message نهایی

```
feat: scaffold [project-name] project

- pnpm create vite / create-next-app: base project
- src/theme/tokens.ts: brand tokens (colors, fonts, spacing)
- src/theme/index.ts: Chakra UI theme system
- src/providers/AppProviders.tsx: provider setup
- src/services/api.ts: API service layer        (اگه API-ready)
- src/types/api.ts: backend TypeScript types    (اگه types لازمه)
- src/i18n/LocaleContext.tsx: multilang setup   (اگه دوزبانه)
- CLAUDE.md + HANDOFF.md + README.md
- <project>/.claude/context/project-context.md
```

---

---

## فاز ۱۱ — README.md Template

هنگام scaffold، متن زیر رو کپی کن و هر `{Qx}` رو با جواب wizard جایگزین کن.
بخش‌های `[فقط اگه ...]` رو بر اساس انتخاب‌ها نگه‌دار یا حذف کن.

| فیلد README | منبع |
|-------------|------|
| نام پروژه | Q1 |
| توضیح | Q3 |
| Framework | Q4 |
| Language | Q5 |
| Design System | Q7 |
| Package Manager | Q6 |
| State Management | Q24 |
| Data Fetching | Q25 |
| زبان / جهت | Q20 |

```markdown
# {Q1}

{Q3}

## Stack

| بخش | تکنولوژی |
|-----|----------|
| Framework | {Q4} |
| Language | {Q5} |
| Design System | {Q7} |
| State | {Q24} |
| Data Fetching | {Q25} |
| Package Manager | {Q6} |
| زبان | {Q20: فارسی RTL / انگلیسی LTR / فارسی + انگلیسی} |

## شروع سریع

\`\`\`bash
{Q6} install
{Q6} dev
\`\`\`

## ساختار پروژه

\`\`\`
src/
├── theme/              ← design tokens و system config
│   ├── tokens.ts       ← single source of truth (رنگ، فونت، spacing)
│   └── index.ts        ← {Q7} system setup
├── providers/          ← app-level providers
├── components/         ← reusable UI components
├── pages/              ← صفحات / routes
[فقط اگه Q22 = بله:]
├── services/           ← API calls و data layer
[فقط اگه Q23 = بله:]
├── types/              ← TypeScript interfaces (api.ts, ...)
[فقط اگه Q24 = Zustand:]
├── stores/             ← Zustand stores
[فقط اگه Q20 = دوزبانه:]
└── i18n/               ← multilang setup (fa / en)
\`\`\`

[فقط اگه Q22 = بله:]
## برای توسعه‌دهنده Backend

\`\`\`bash
cp .env.example .env.local
\`\`\`

متغیرهای محیطی (`.env.example`):

\`\`\`env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=10000
\`\`\`

### افزودن endpoint جدید

1. تایپ در `src/types/api.ts`
2. تابع سرویس در `src/services/{domain}Service.ts`
3. استفاده با {Q25} در component

### ساختار services/ و types/

\`\`\`
src/services/
├── api.ts              ← axios/fetch instance
└── {domain}Service.ts  ← هر domain = یه فایل

src/types/
└── api.ts              ← همه request/response interfaces
\`\`\`

**قرارداد نامگذاری:** `Create{Entity}Payload` / `{Entity}Response`

## مستندات بیشتر

- `CLAUDE.md` — راهنمای کار با Claude
- `HANDOFF.md` — وضعیت فعلی و قدم بعدی
- `.claude/context/project-context.md` — tokens و معماری
```

---

## مراجع

**Chakra UI v3:**
- Chakra UI v3 (شامل setup): `design-systems/chakra-ui-v3/chakra-ui-v3.md`
- Tokens کامل: `design-systems/chakra-ui-v3/tokens.md`
- Known bugs: `design-systems/chakra-ui-v3/known-bugs.md`

**Bootstrap 5:**
- RTL setup + overrides: `design-systems/bootstrap5/rtl.md`
- Scaffold guide: `design-systems/bootstrap5/scaffold.md`

**همه پروژه‌ها:**
- Language & RTL: `universal/language.md`
- Figma→Code: `universal/figma-to-code.md`
