# shadcn/ui — RTL Rules

> منبع: `ui.shadcn.com/docs/rtl` (۲۰۲۶-۰۸-۲۵)

<!--
اینجا چی می‌ره: قوانین RTL خاص API/CLI این DS. اینجا چی نمی‌ره: اینکه یک
پروژه‌ی خاص RTL-only یا دوزبانه‌ست، یا فونت/locale پروژه — اون project-level ـه.
-->

## Direction Setup

shadcn/ui از RTL به‌صورت first-class پشتیبانی می‌کنه — **ولی auto-transform
فقط برای پروژه‌های ساخته‌شده با preset جدید کار می‌کنه** (`base-nova`,
`radix-nova` و مشابه؛ نه styleهای قدیمی مثل `new-york`/`default`).

فعال‌سازی، یکی از این دو مسیر:

**۱. موقع init (پروژه نو):**
```bash
npx shadcn@latest init -t vite --rtl
```

**۲. با ست کردن `rtl: true` در `components.json`** (پروژه موجود) — بعدش هر
`add` جدید خودکار transform می‌شه.

بعد باید طبق راهنمای framework خودت (Get Started → Next.js/Vite/TanStack
Start در docs) کامپوننت `DirectionProvider` رو اضافه کنی:
```bash
npx shadcn@latest add direction
```

## DOM Order / Logical Props — چطور کار می‌کنه

وقتی `rtl: true` باشه، CLI موقع `add` این تبدیل‌ها رو خودش انجام می‌ده —
**دستی این کلاس‌ها رو ننویس، بذار CLI بنویسه:**

| Physical (تولید نمی‌شه) | Logical (تولید می‌شه) |
|---|---|
| `left-*` / `right-*` | `start-*` / `end-*` |
| انیمیشن `slide-in-from-right` | `slide-in-from-end` |

آیکون‌های جهت‌دار پشتیبانی‌شده خودکار با `rtl:rotate-180` flip می‌شن.

## ⚠️ سه کامپوننت auto-migrate نمی‌شن

`npx shadcn@latest migrate rtl [path]` همه‌چیز رو تبدیل می‌کنه **به‌جز**:

- **Calendar**
- **Pagination**
- **Sidebar** ← خیلی رایجه (dashboard-01 و اکثر admin panelها ازش استفاده می‌کنن)

این‌ها رو باید طبق بخش «RTL support» همون کامپوننت در `ui.shadcn.com/docs`
دستی migrate کنی. اگه پروژه سایدبار داره و RTL می‌خواد، این قدم رو گم نکن.

**Calendar + فارسی:** علاوه بر RTL، در locale فارسی تقویم باید **جلالی** باشد
(نه فقط راست‌چین‌شدهٔ میلادی). recipe کامل → `components/calendar.md`.

## Migrate کردن یه پروژه‌ی موجود (کامپوننت از قبل نصب‌شده)

```bash
npx shadcn@latest migrate rtl [path]   # [path] خالی = کل src/components/ui
```

## آیکون‌های جهت‌دار

بعضی آیکون‌ها (`ArrowRightIcon`, `ChevronLeftIcon`, …) خودکار flip نمی‌شن،
باید دستی کلاس بدی:
```tsx
<ArrowRightIcon className="rtl:rotate-180" />
```

## ⚠️ باگ `tw-animate-css`

کلاس‌های logical slide توی `tw-animate-css` درست کار نمی‌کنن. workaround
رسمی: `dir="rtl"` رو مستقیم به portal content بده:
```tsx
<PopoverContent dir="rtl"><div>...</div></PopoverContent>
<TooltipContent dir="rtl"><div>...</div></TooltipContent>
```

## فونت پیشنهادی

برای بهترین تجربه RTL: **Noto** — با Inter و Geist خوب جفت می‌شه.
(تصمیم فونت پروژه خودش → project-level، نه اینجا.)

## مراجع

- مفاهیم عمومی RTL/logical props (فریمورک‌مستقل): `universal/language.md`
- Airport project (RTL/LTR دوزبانه، ولی Bootstrap5 نه shadcn): `Airport/CLAUDE.md`
