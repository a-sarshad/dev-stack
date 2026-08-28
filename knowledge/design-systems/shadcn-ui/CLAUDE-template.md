---

<!--
  مکمل shadcn/ui — این فایل **ادامهٔ** `_TEMPLATE/CLAUDE-template.md` است، نه جایگزین آن.
  `dev-engine init` اول قالب پایه را می‌نویسد و بعد این را به انتهایش می‌چسباند.
  پس هرگز پروتکل‌های عمومی (Scope Triage، Figma Access Gate، Figma→Code Protocol،
  جدول ترجمه، DoD، جهت، تطابق با طرح) را اینجا تکرار نکن — فقط چیزی که مخصوص shadcn/ui است.
-->

## shadcn/ui — Knowledge References (اضافه بر جدول پایه)

| موضوع | فایل |
|-------|------|
| **تلهٔ یک کامپوننت مشخص** | **`design-systems/shadcn-ui/components/<name>.md`** — قبل از کار جدی روی هر کامپوننت چک کن وجود دارد یا نه |
| scaffold (init flags، AI skill) | `design-systems/shadcn-ui/scaffold.md` |

> اگه `.claude/skills/shadcn/` در همین پروژه نصب است (باید باشد — `scaffold.md`)،
> آن skill خودکار لود می‌شود و context زندهٔ پروژه (`npx shadcn@latest info`) را می‌دهد —
> موقع تعارض، روی آن بیشتر از این فایل‌های static تکیه کن.

## shadcn/ui — قواعد always-on

1. **Component Resolution — یک قدم `Block` بین Local و DS اضافه کن:**
   ```
   1. Local  → src/components/ را grep کن. موجوده؟ import کن (نساز).
   2. Block  → کل صفحه/section شبیه یه پترن رایجه (dashboard، login، pricing، …)؟
              `npx shadcn@latest search -q "<...>" -t block` را چک کن قبل از دستی‌ساختن.
              نمونه: dashboard-01 (sidebar+cards+chart+table).
   3. DS     → کامپوننت تکی از رجیستری (`npx shadcn@latest add <name>`). DS را از div خام rebuild نکن.
   4. Build  → فقط اگه هیچ‌کدوم نبود، با primitives. صفر hardcode.
   ```
   در DoD مسیر را `Local→Block→DS→Build` گزارش کن.
2. **کامپوننت‌های shadcn کدشونه، نه dependency** — قبل از «بازنویسی یه کامپوننت»،
   اول چک کن آیا باید فقط `npx shadcn@latest add <x> --overwrite` بزنی.
3. **استثنای token mapping:** `chart-1..5` هم مثل بقیهٔ surfaceها باید semantic بماند،
   ولی خودِ `init` آکروماتیک تولیدشان می‌کند — اگه spec رنگی می‌خواد، دستی override کن
   (`shadcn-ui/known-bugs.md`).

## shadcn/ui — جهت

- اگه `rtl: true` در `components.json` ست شده، CLI موقع `add` خودش physical→logical
  تبدیل می‌کند — این کلاس‌ها را دستی ننویس.
- ۳ استثنای auto-migrate (Calendar/Pagination/Sidebar) → `shadcn-ui/rtl.md`.

## Stack (بخش‌های shadcn-specific — بقیه از قالب پایه)

- Design System: **shadcn/ui** — base: `TODO(radix|base)` · style: `TODO`
- AI skill نصب‌شده: `.claude/skills/shadcn/` (از `pnpm dlx skills add shadcn/ui`)

## Token Reference

> مقادیر استاندارد shadcn/ui → `design-systems/shadcn-ui/tokens.md`.
> فقط توکن‌های **مخصوص این پروژه** را در جدول Token Reference قالب پایه inline کن —
> منبع در کد معمولاً `src/index.css` (Next.js: `app/globals.css`).
