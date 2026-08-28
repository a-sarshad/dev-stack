# shadcn/ui

> updated: 2026-08-26 — از سورس زنده (`ui.shadcn.com/docs`) + AI skill رسمی
> (`pnpm dlx skills add shadcn/ui`) استخراج شده، نه از حافظه. shadcn خیلی سریع
> تغییر می‌کنه (نمونه: بین نوشتن این پرونده‌ها، `--defaults` preset از `nova`
> به `base-nova` عوض شد) — قبل از پروژه‌ی بزرگ، فایل‌های اینجا رو با
> `npx shadcn@latest info` و `pnpm dlx skills add shadcn/ui` تازه چک کن.

shadcn/ui یه "design system" کلاسیک نیست — یه **CLI + registry** ـه که کد
کامپوننت رو مستقیم داخل `src/components/ui/` پروژه کپی می‌کنه (نه یه پکیج
npm که import کنی). یعنی کد کامپوننت‌ها **مال پروژه‌ست**، نه یه dependency
خارجی — می‌تونی هرجور خواستی ویرایششون کنی.

## این پوشه چیه

فایل‌های اجباری قرارداد DS (`../README.md` §۱) + یه فایل اضافه:

| فایل | نقش |
|------|-----|
| `ds.json` | manifest |
| `figma-resolve.json` | نگاشت Figma → import (seed خالی — پایین رو بخون) |
| `tokens.md` | جدول semantic tokenها + base color options |
| `components.md` | فهرست کامپوننت‌ها + قانون «قبل از ساخت، search کن» |
| `known-bugs.md` | gotchaهای **cross-component**: CLI، preset/config، RTL کلی، رجیستری، tooling |
| `components/` | تله‌های **یک کامپوننت مشخص** — یه فایل به‌ازای هر کامپوننتی که واقعاً گاز گرفته. قانون تولد فایل → `components/README.md`. ⛔ مرجع API نیست |
| `rtl.md` | RTL از `ui.shadcn.com/docs/rtl` |
| **`scaffold.md`** | ⭐ دستورهای واقعی و تست‌شده برای راه‌اندازی پروژه نو — این رو موقع scaffold بخون، نه این README |

## مهم‌ترین فکت این DS

**یه AI skill رسمی وجود داره که خیلی از این پوشه رو زائد می‌کنه:**

```bash
pnpm dlx skills add shadcn/ui
```

این دستور (که باید **همیشه** یکی از قدم‌های scaffold باشه — جزئیات در
`scaffold.md`) یه skill کامل و **خودبه‌روزرسان** نصب می‌کنه که پروژه رو
می‌شناسه (از `npx shadcn@latest info --json`) و قوانین دقیق styling/forms/
composition/icons/RTL/CLI رو می‌ده. فایل‌های این پوشه (`tokens.md`،
`components.md`) خلاصه‌ی static همون دانشن — برای lookup سریع بدون tool call.
وقتی شک داری یا drift مشکوکه، skill نصب‌شده در پروژه (`.claude/skills/shadcn/`)
یا خودِ `npx shadcn@latest info` مرجع نهاییه، نه این فایل‌ها.

## Presets و Style — یه فکت که مدام عوض می‌شه

شادcn دیگه اسم style مثل `"new-york"` نداره (deprecated). سیستم فعلی
**preset** ـه: هفت style شناخته‌شده تا امروز (۲۰۲۶-۰۸-۲۶) —
`nova` (کم‌فاصله/compact)، `vega` (استایل کلاسیک shadcn)، `maia` (نرم و گرد،
فاصله زیاد)، `lyra` (زاویه‌دار)، `mira` (فشرده، برای UI متراکم)، `luma`
(نرم‌تر و سیال)، `sera` (ادیتوریال/تایپوگرافیک — اضافه‌شده آوریل ۲۰۲۶).
`rhea` (اضافه‌شده می ۲۰۲۶) رو هم چنجلاگ رسمی اسم برده ولی جزئیات ویژوالش
مستند نشده — قبل استفاده با `ui.shadcn.com/create` پیش‌نمایش بگیر.
هر preset = ترکیب `{base}-{style}` (مثل `base-nova`, `radix-vega`). دو محور
مستقلن:

- **`base`** (`radix` یا `base`) — کدوم primitive library زیرشه (Radix UI
  در برابر Base UI). API فرق می‌کنه: `asChild` (radix) در برابر `render`
  (base)، `Select`/`ToggleGroup`/`Slider`/`Accordion` prop shape فرق داره.
  جزئیات کامل → skill نصب‌شده، فایل `rules/base-vs-radix.md`.
- **`style`** (`nova`, `vega`, …) — visual treatment.

⚠️ **این محور بعد از `init` قابل تغییر نیست** بدون حذف و نصب مجدد کامپوننت‌ها.

## مرجع‌های زنده

- Docs: `ui.shadcn.com/docs`
- Blocks آماده (قبل از دستی ساختن یه صفحه‌ی رایج چک کن): `ui.shadcn.com/blocks`
- MCP tools این session: `mcp__shadcn__*` (search/view/add-command روی رجیستری)
