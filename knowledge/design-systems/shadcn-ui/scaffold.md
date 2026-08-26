# shadcn/ui — Scaffold (منبع حقیقت برای پروژه نو)

> این فایل رو موقع scaffold یه پروژه با شادcn بخون، نه README.md.
> تست‌شده روی: Vite + React + TS (پروژه Sample Dashboard، ۲۰۲۶-۰۸-۲۵).
> Next.js/TanStack Start/React Router مشابه‌ان — فقط `-t` عوض می‌شه؛ جزئیات
> framework-specific → `ui.shadcn.com/docs/installation/<framework>`.

---

## ⛔ اشتباهی که نکن: scaffold دستی وقتی CLI خودش انجامش می‌ده

اگه پروژه از صفر شروع می‌شه (نه یه Vite/Next موجود)، **مسیر دستی
(`pnpm create vite` → نصب دستی Tailwind → ویرایش دستی tsconfig/vite.config →
بعد `shadcn init`) اضافه‌کاریه.** یه دستور همه‌ی این مرحله‌ها رو انجام
می‌ده:

```bash
pnpm dlx shadcn@latest init -t vite --name <project-name>
```

این خودش Vite scaffold می‌کنه، Tailwind نصب می‌کنه، alias `@/*` رو در
tsconfig **و** vite.config می‌ذاره، و components.json رو می‌سازه — همه یهو.

مسیر دستی رو فقط وقتی برو که یه پروژه‌ی Vite **از قبل موجود** داری و
می‌خوای shadcn رو بهش اضافه کنی (existing project retrofit) — آنوقت:

```bash
pnpm add tailwindcss @tailwindcss/vite
# src/index.css را با `@import "tailwindcss";` جایگزین کن
# tsconfig.json + tsconfig.app.json: baseUrl + paths["@/*"]
# vite.config.ts: resolve.alias["@"] = path.resolve(import.meta.dirname, "./src")
pnpm add -D @types/node
pnpm dlx shadcn@latest init
```

---

## قدم‌های scaffold (به ترتیب)

### ۱. تصمیم‌های اجباری قبل از `init` — بعداً بدون reinstall عوض نمی‌شن

| تصمیم | گزینه‌ها | این پروژه چی می‌گیره اگه TODO باشه |
|---|---|---|
| **base** | `radix` یا `base` (Base UI) | **توصیه: `base`** مگر دلیل خاصی برای `radix` باشه (تیم/کدبیس موجود از قبل روی Radix). Base UI جانشین رسمی Radix Primitives‌ه (هم‌پوشانی تیم با Radix+MUI)؛ کامپوننت‌های جدیدتر شادcn (مثل `combobox` با `multiple`/chips) **فقط** روی Base UI موجودن — Radix Primitives اصلاً Combobox نداره. تجربه‌ی واقعی (۲۰۲۶-۰۸-۲۶، Sample Dashboard): با `npx shadcn add combobox --dry-run` روی یه پروژه‌ی `radix-nova` چک شد و حتی اونجا هم `@base-ui/react` دپندنسی اضافه می‌شه و فایل مستقیم `from "@base-ui/react"` ایمپورت می‌کنه — یعنی تب «Radix UI» توی docs شادcn فقط استایلشو مطابق preset عوض می‌کنه، نه اینکه واقعاً روی Radix primitive ساخته شده باشه (چون همچین primitive‌ای اصلاً وجود نداره). چک کن با `preset resolve` چون پیش‌فرض CLI پیوسته عوض می‌شه. |
| **style** | preset مثل `nova`, `vega`, … | پیش‌فرض `nova` |
| **baseColor** | `neutral`/`stone`/`zinc`/`mauve`/`olive`/`mist`/`taupe` | از brand tokens فاز ۴ wizard بگیر — نزدیک‌ترین رو انتخاب کن |
| **cssVariables** | `true` (توصیه‌شده) یا `false` | `true` — اجازه‌ی dark mode/theming semantic می‌ده |
| **rtl** | `true`/`false` | از فاز ۶ wizard (زبان پروژه) — اگه فارسی/عربی/عبری داره، `true` |

### ۲. دستور init

```bash
# پروژه تک‌زبانه LTR:
pnpm dlx shadcn@latest init -t vite --name <project-name> -b radix -p <style-preset>

# پروژه RTL یا دوزبانه:
pnpm dlx shadcn@latest init -t vite --name <project-name> -b radix -p <style-preset> --rtl
```

> اگه پروژه از `dev-init-wizard` می‌آد و برند-توکن JSON داری، preset code
> رو از `ui.shadcn.com/create` بساز (رنگ/فونت/آیکون رو ویژوال انتخاب کن) و
> `--preset <code>` بده به‌جای `-p <named-preset>` — دقیق‌تر از حدس‌زدن
> نزدیک‌ترین named preset ـه.

### ۳. کامپوننت‌های اولیه رو اضافه کن

قبل از هرچی، برای **هر صفحه‌ی رایج** (dashboard, login, pricing, settings)
اول رجیستری blocks رو چک کن — دستی نساز:

```bash
npx shadcn@latest search -q "<چیزی که می‌سازی>" -t block
```

اگه چیزی نبود، تک‌تک کامپوننت لازم رو اضافه کن:
```bash
npx shadcn@latest add button card table badge dropdown-menu sidebar avatar
```

### ۴. ⭐ AI skill رسمی رو نصب کن — همیشه، بدون استثنا

```bash
pnpm dlx skills add shadcn/ui
```

این کار `.agents/skills/shadcn/` + `.agents/skills/migrate-radix-to-base/`
می‌سازه و برای Claude Code (و بقیه agentها) symlink می‌کنه به `.claude/skills/`.
**این خودبه‌روزرسانه** — منبع حقیقت زنده‌ی این DS برای هر agent بعدی روی
همین پروژه، بهتر از این فایل‌های static. commit کن (gitignore نکن) تا هر
عضو تیم/agent همون دانش رو داشته باشه.

بعد از نصب، خودِ Claude Code این‌ها رو داره:
- context خودکار پروژه از `npx shadcn@latest info --json`
- قوانین سخت‌گیرانه styling/forms/composition/icons/RTL/CLI
- دستور `npx shadcn@latest docs <component>` برای گرفتن مستندات/مثال هر کامپوننت

### ۵. MCP registry (اختیاری — فقط اگه رجیستری خصوصی/سفارشی داری)

اگه این محیط Claude از قبل `mcp__shadcn__*` global داره (این session
داشت)، نیازی به این قدم نیست. اگه محیط دیگه‌ای هیچ MCP shadcn نداره یا
رجیستری private/سفارشی اضافه می‌کنی:

```bash
npx shadcn@latest mcp init --client claude
```

فایل تولیدشده: `.mcp.json` (پروژه). رجیستری اضافه در `components.json`:
```json
{ "registries": { "@acme": "https://acme.com/r/{name}.json" } }
```

### ۶. تأیید نهایی

```bash
npx shadcn@latest info --json     # همه‌چی رو تأیید کن: base/style/baseColor/rtl/iconLibrary
pnpm build                        # type-check + build سالمه
```

---

## چک‌لیست خروجی (اضافه به چک‌لیست کلی `project-init-wizard.md`)

- [ ] `components.json` ساخته شد — base/style/baseColor/rtl **عمداً** انتخاب شدن (نه پیش‌فرض کور)
- [ ] اگه صفحه رایجه (dashboard/login/pricing) → بلاک آماده چک شد قبل از دستی‌ساختن
- [ ] `pnpm dlx skills add shadcn/ui` اجرا و commit شد
- [ ] اگه چارت داره → `chart-1..5` دستی چک شد (پیش‌فرض achromatic می‌مونه — `known-bugs.md`)
- [ ] اگه RTL/دوزبانه‌ست → `Sidebar`/`Calendar`/`Pagination` دستی migrate چک شدن (auto-migrate نمی‌شن — `rtl.md`)
- [ ] `.claude/launch.json` برای dev server ساخته شد (پورت پیش‌فرض Vite `5173` ممکنه اشغال باشه)
