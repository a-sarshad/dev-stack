---
name: dev-init-wizard
description: >
  Interactive wizard for scaffolding a new project from scratch with full tokenization.
  ALWAYS trigger when the user says anything like: "پروژه جدید بساز", "پروژه جدید می‌خوام",
  "scaffold project", "create new project", "init project", "new project wizard",
  "شروع پروژه", "پروژه رو راه بنداز", "ساخت پروژه", or any request to start/initialize
  a new development project. Ask questions step-by-step, then generate all files.
  Do NOT wait to be asked — run this wizard automatically whenever a new project is requested.
---

<!-- version: 3 | updated: 2026-05-22 | changelog: Bootstrap SCSS theming scaffold -->

# Project Init Wizard

یک wizard تعاملی universal برای ساخت پروژه جدید با tokenization کامل.
مستقل از Design System — برای Chakra UI، Bootstrap، Tailwind، یا هر DS دیگه‌ای کار می‌کنه.

---

## قوانین اجرا

1. **مرحله‌به‌مرحله** — حداکثر ۳ سوال در هر مرحله، نه همه یکجا
2. **Confirm بعد از هر مرحله** — جواب‌ها رو به صورت جدول نشون بده و confirm بگیر
3. **پیشنهاد Claude** — سوال‌های فنی همیشه گزینه «پیشنهاد Claude» دارن
4. **Skip قبوله** — «بعداً» یا «نمیدونم» → مقدار `TBD` بذار و ادامه بده
5. **JSON tokens اولویت داره** — اگه کاربر JSON داد، سوال‌های رنگ رو حذف کن
6. **بعد از فاز ۹** — بگو «شروع می‌کنم» و همه فایل‌ها رو بساز

---

## فاز ۱ — هویت پروژه

```
۱. نام پروژه چیه؟ (برای folder name و package.json)
۲. نوع پروژه؟
   - Admin Panel / Dashboard
   - Landing Page / Marketing
   - E-commerce / Internal Tool / Other
۳. یه جمله کوتاه — این پروژه برای چیه؟
```

---

## فاز ۲ — Stack فنی

```
۴. Framework؟
   - Next.js 14+ App Router  ← پیشنهاد Claude برای پروژه‌های بزرگ
   - React + Vite            ← پیشنهاد Claude برای پروژه‌های سبک‌تر
   - Vue 3 / Nuxt / Other

۵. TypeScript یا JavaScript؟  ← پیشنهاد Claude: TypeScript

۶. Package Manager: **pnpm** (استاندارد همه‌ی پروژه‌ها — نپرس مگه کاربر صریح npm خواست)
   → scaffold با `pnpm`: لاک‌فایل pnpm-lock.yaml، فیلد `packageManager` در package.json،
     و دستورهای CLAUDE.md (`pnpm dev`/`pnpm build`/`pnpm type-check`) همه pnpm.
   → استثنای مستند: Airport (npm، به‌خاطر rolldown native binding). مرجع: BLUEPRINT «standard PM».
```

---

## فاز ۳ — Design System

```
۷. Design System؟
   - Chakra UI v3
   - Bootstrap 5
   - Tailwind CSS
   - MUI / shadcn / Other / Custom

۸. Figma file داری؟
   بله → لینک: ___  |  خیر  |  بعداً می‌فرستم
```

**بر اساس DS انتخابی، skill مناسب را load کن:**
- Chakra UI → load skill: `ds-chakra-ui`
- Bootstrap 5 → از template در `knowledge/design-systems/bootstrap5/` استفاده کن (جزئیات در بخش خروجی)
- اگه project-context skill موجود باشه → آن را load کن (اولویت بالاتر از DS generic skill)

---

## فاز ۴ — Brand Tokens ⭐

**اول بپرس:**
```
آیا فایل JSON توکن داری؟
(از Figma Tokens Plugin، Style Dictionary، یا هر export tool دیگه‌ای)
- بله → فایل رو بفرست / paste کن
- خیر → ادامه با سوال‌های رنگ
```

### اگه JSON tokens داشت:
فایل JSON را parse کن و token های زیر را استخراج کن:
- رنگ‌های primary، secondary، neutral، semantic (error/success/warning/info)
- font family ها
- font size ها
- spacing scale
- border radius
- shadow ها
- هر چیز دیگه‌ای که در JSON بود

> هر DS و هر پروژه ساختار JSON متفاوتی داره — به ساختار واقعی فایل نگاه کن، حدس نزن.
> Pattern های رایج: Style Dictionary، Figma Tokens (W3C format)، یا custom flat JSON.

### اگه JSON نداشت — سوال‌های دستی:
```
۹.  رنگ Primary؟ (hex)
۱۰. رنگ Secondary / Accent؟ (یا «ندارم»)
۱۱. رنگ‌های Semantic خاص؟ Error/Success/Warning (یا «از DS defaults»)
۱۲. Dark Mode لازمه؟  ← پیشنهاد Claude: خیر برای شروع
۱۳. فونت؟
    - Vazirmatn (RTL/فارسی) | Inter (LTR/انگلیسی) | هر دو | Custom
```

---

## فاز ۵ — Layout و Responsive

> سه مسیر — بر اساس جواب ۱۴b یکی رو دنبال کن

```
۱۴.  Target Platform؟
     - هر دو (Responsive)  ← پیشنهاد Claude
     - Desktop only / Mobile only

۱۴b. آیا layout reference داری؟
     - بله، لینک Figma دارم  → لینک بده [مسیر A]
     - بله، تصویر/screenshot  → آپلود کن  [مسیر B]
     - خیر، توضیح می‌دم       → سوال‌های متنی [مسیر C]
```

### مسیر A — Figma link
از Figma MCP این‌ها رو استخراج کن:
- ارتفاع Navbar / عرض Sidebar (expanded + collapsed) / max-width محتوا
- padding داخلی / تعداد ستون grid
← سپس برو مرحله تأیید

### مسیر B — Screenshot
تصویر رو آنالیز کن:
- چند zone؟ (Navbar / Sidebar / Main / Footer)
- sidebar collapse می‌شه؟ / content محدودیت عرض داره؟
- پیش‌فرض: Navbar≈64px، Sidebar≈256px، collapsed≈72px، maxW≈1920px
← سپس برو مرحله تأیید

### مسیر C — توضیح متنی
```
۱۵. Layout اصلی؟
    - Dashboard (Navbar + Sidebar + Main)   ← رایج admin panel
    - Top Navbar + Main (بدون sidebar)
    - Full Width / Centered / Custom per page

۱۶. Navbar داری؟  sticky / static / خیر
۱۷. Sidebar داری؟  collapse می‌شه / ثابت / خیر
    اگه داری: چپ یا راست؟ (← RTL: راست)
۱۸. Footer داری؟  بله (ارتفاع؟) / خیر
```

### تأیید Layout Constants (همه مسیرها)
بعد از استخراج، این جدول رو نشون بده و تأیید بگیر:
```
| Component            | مقدار    |
|----------------------|----------|
| Navbar height        | 64px     |
| Sidebar w expanded   | 256px    |
| Sidebar w collapsed  | 72px     |
| Content max-width    | 1920px   |
| Content padding      | 24px     |
| Grid columns         | 12       |
فقط ردیف‌های مرتبط رو نشون بده
```

```
۱۹. Breakpoints؟
    Desktop: Standard(480/768/992/1280/1536) / Widescreen(768/1440/1920) / Custom
    Mobile:  xs(320)/sm(375)/md(425)/lg(768) / Custom
    هر دو:   Standard Chakra  ← پیشنهاد Claude
```

### خروجی در tokens.ts
```ts
export const layout = {
  navbar:  { h: "64px" },
  sidebar: { w: "256px", wCollapsed: "72px" },  // حذف اگه نیست
  content: { maxW: "1920px", px: "24px", py: "24px" },
  grid:    { columns: 12, gap: "24px" },
} as const
```
در CLAUDE.md پروژه هم Layout section رو با مقادیر واقعی پر کن.

---

## فاز ۶ — زبان و جهت

```
۱۶. زبان‌های پروژه؟
    - فقط فارسی (RTL)
    - فقط انگلیسی (LTR)
    - دوزبانه فارسی + انگلیسی

۱۷. Language Switcher در UI لازمه؟ (فقط اگه دوزبانه)
```

---

## فاز ۷ — معماری کد [فنی — همه پیشنهاد Claude دارن]

```
۱۸. API-ready؟  ← پیشنهاد Claude: بله
۱۹. TypeScript types برای backend؟  ← پیشنهاد Claude: بله
۲۰. State Management؟  ← پیشنهاد Claude: Zustand
۲۱. Data Fetching؟  ← پیشنهاد Claude: TanStack Query
```

---

## فاز ۸ — کیفیت کد [فنی — پیشنهاد Claude]

```
۲۲. ESLint + Prettier؟  ← پیشنهاد Claude: بله
۲۳. Git Hooks با Husky؟  ← پیشنهاد Claude تیمی: بله
۲۴. Testing Setup؟  ← پیشنهاد Claude: خیر برای شروع
```

---

## فاز ۹ — Git

```
۲۵. Git Repository URL؟ (اختیاری)
۲۶. Branch Strategy؟  ← پیشنهاد Claude: main / develop
```

---

## خروجی — فایل‌هایی که باید ساخته بشن

### همیشه اجباری

```
src/theme/
  tokens.ts     ← ⭐ single source of truth — همه رنگ/فونت/spacing از اینجا
  index.ts      ← DS-specific theme setup

src/providers/
  AppProviders.tsx

CLAUDE.md       ← از DS skill مربوطه template بگیر + بلوک GATE زیر (اجباری)
HANDOFF.md
```

#### ⭐ اجباری در CLAUDE.md هر پروژه جدید — Figma → Code gate

CLAUDE.md هر پروژه باید بخش `## Figma → Code Protocol` رو داشته باشه. منبع:
`knowledge/universal/figma-to-code.md` → بلوک «COPY INTO PROJECT CLAUDE.md».

موقع کپی این placeholderها رو با مقدار پروژه پر کن:
- `[MCP]` → MCP server دیزاین‌سیستم (Chakra UI MCP، یا «Bootstrap docs» اگه MCP نداره)
- breakpointها → مقادیر واقعی پروژه (از فاز ۵)
- زبان gate → فارسی یا انگلیسی، هماهنگ با بقیه CLAUDE.md

> **چرا اجباری:** قانون اجباری Figma→code باید always-on باشه (CLAUDE.md هر پیام لود میشه)، نه در skill که ممکنه trigger نشه یا نصب نباشه. بدون این gate، مرحله‌ها وسط کار فراموش میشن.

### Bootstrap 5 — SCSS Theming Setup

**این قدم اجباریه هر وقت DS = Bootstrap 5 انتخاب شد.**

راهنمای کامل scaffold در `knowledge/design-systems/bootstrap5/scaffold.md` هست.
template فایل‌ها (`_tokens.scss`، `_overrides.scss`، `bootstrap.scss`) در همان پوشه قابل کپی هستن.

خلاصه اقدامات:
1. `sass` به devDependencies اضافه کن
2. سه فایل از template به `src/styles/` کپی کن، `_tokens.scss` رو با brand color پر کن
3. import در `main.tsx` را از `bootstrap.min.css` به `./styles/bootstrap.scss` تغییر بده

---

### tokens.ts — universal pattern

```typescript
// ⚠️ single source of truth
// برای تغییر رنگ/فونت/spacing — فقط اینجا تغییر بده

export const tokens = {
  colors: {
    // اگه JSON داشتیم → از JSON استخراج کن
    // اگه نداشتیم → از سوال‌های فاز ۴ بساز
    primary:   { /* scale کامل: 50, 100, ..., 900, 950 */ },
    secondary: { /* اگه داشت */ },
    neutral:   { /* gray scale */ },
    semantic: {
      error:   "[HEX]",
      success: "[HEX]",
      warning: "[HEX]",
      info:    "[HEX]",
    },
  },
  fonts: {
    primary:   "[فونت اصلی]",
    secondary: "[فونت ثانوی — اگه دوزبانه]",
    mono:      "JetBrains Mono",
  },
  fontSizes: { /* از JSON یا DS defaults */ },
  spacing:   { /* از JSON یا DS defaults */ },
  radii:     { /* از JSON یا DS defaults */ },
  shadows:   { /* از JSON یا DS defaults */ },
} as const

export type Tokens = typeof tokens
```

### شرطی

```
src/i18n/LocaleContext.tsx    ← دوزبانه
src/services/api.ts           ← API-ready
src/types/api.ts              ← backend types
src/contexts/ColorModeContext.tsx  ← Dark Mode
```

### project-context skill — در dev-knowledge

```
dev-knowledge/projects/[name]/[name]-project-context.md
```

**نام‌گذاری:** `[project-name]-project-context.md` — مثال: `airport-project-context.md`
این فایل بعداً به عنوان skill نصب میشه تا مستقل از مسیر فایل باشه.

محتوای این فایل:
```markdown
---
name: [project-name]-project-context
description: "Use for ALL tasks related to [Project]. Load automatically."
---
## Stack: [framework] + [DS] + [languages]
## Brand Tokens: [رنگ‌ها و فونت‌های این پروژه]
## Layout: [breakpoints، grid، sidebar]
## Notes: [نکات خاص این پروژه]
```

---

## چک‌لیست tokenization قبل از تحویل

- [ ] همه رنگ‌ها از `tokens.ts` — هیچ hex مستقیم در component نیست
- [ ] همه font-family ها از token
- [ ] spacing از scale token
- [ ] direction هیچ‌جا hardcode نشده (اگه multilang)
- [ ] `CLAUDE.md` ساخته شد
- [ ] `CLAUDE.md` بخش `## Figma → Code Protocol` (gate) رو داره — با MCP/breakpoint پروژه پر شده
- [ ] `[name]-project-context.md` در dev-knowledge ساخته شد
- [ ] Bootstrap: `src/styles/bootstrap.scss` ساخته شد و import در main.tsx آپدیت شد
- [ ] git commit message آماده شد

---

## Commit Message نهایی

```
feat: scaffold [project-name] project

- src/theme/tokens.ts: brand tokens از [JSON file / manual]
- src/theme/index.ts: [DS name] theme setup
- src/providers/AppProviders.tsx: providers
- src/styles/bootstrap.scss: Bootstrap SCSS theming (اگه Bootstrap)
- src/services/api.ts: API layer             (اگه API-ready)
- src/types/api.ts: backend types            (اگه types)
- src/i18n/LocaleContext.tsx: multilang      (اگه دوزبانه)
- CLAUDE.md + HANDOFF.md
- dev-knowledge/projects/[name]/[name]-project-context.md
```

---

## مراجع — بر اساس DS انتخابی

**Chakra UI:** load skill `ds-chakra-ui` ← این skill همه چیز رو داره

**Bootstrap 5:** template در `knowledge/design-systems/bootstrap5/` —
سه فایل `_tokens.scss`، `_overrides.scss`، `bootstrap.scss` رو به `src/styles/` کپی کن.

**Universal:** `knowledge/universal/project-init-wizard.md` — این wizard کامل

> هیچ مرجع DS-specific اینجا hardcode نشده — skill مناسب را load کن.
