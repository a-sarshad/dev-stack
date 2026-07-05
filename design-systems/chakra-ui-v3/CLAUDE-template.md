# [PROJECT NAME] — Claude Reference
# کپی این فایل برای پروژه جدید، موارد [CUSTOMIZE] رو عوض کن
# updated: 2026-05-20

<!-- QUICK CONTEXT — Claude reads this first, no tool call needed -->
> **[PROJECT NAME]** | DS: Chakra UI v3 | Stack: React+Vite+TS | Lang: FA/RTL | PM: pnpm
> Constraints: [CUSTOMIZE — e.g. Zustand · TanStack Query · JWT localStorage]

---

## Stack
<!-- [CUSTOMIZE] -->
- React 19 + Vite + TypeScript
- Chakra UI v3
- RTL / Persian (Vazirmatn font)
- pnpm

---

## Critical Rules

### RTL
- `dir="rtl"` on `<html>` in `index.html`
- `LocaleProvider locale="fa-IR"` wraps app in `main.tsx`
- RTL flex: **first DOM child = rightmost visually**
- Use logical CSS props: `ms/me/ps/pe` not `ml/mr/pl/pr`
- Portal components: add `dir="rtl"` to Positioner explicitly

### Conventions — always-on (cross-project)
این قوانین در **همه** taskها اجباری‌ان (نه فقط Figma→code):
1. **Select فقط** — `NativeSelect` ممنوع؛ همه‌جا `Select` + `createListCollection`. → `chakra-ui-v3.md §۱-الف`
2. **Table alt-row** — قبل از ساخت هر جدول بپرس: سطر متناوب رنگ بخواد؟ چه رنگی؟ (پیش‌فرض `bg.subtle`). → `chakra-ui-v3.md §۱-الف`
3. **Sidebar selected** — صفحه‌ی فعال باید item متناظرش در Sidebar را active نشان دهد (route-aware؛ parent + sub-item). → `universal/app-conventions.md`
4. **Responsive assets** — برای حالت responsive/mobile اگر لینک/تصویر مخصوص آن view ندادی، قبل از ساخت ماژولار بپرس. → `universal/app-conventions.md`

### Chakra v3 Known Issues
→ see `dev-knowledge/design-systems/chakra-ui-v3/known-bugs.md`

Key issues:
- `lineHeight="8"` → BROKEN. Use ratio strings: `"1.333"` or `"1.14"`
- `bg="bg.default"` → BROKEN. Use `bg="white"` or `bg="bg"`
- `useColorMode` → DOES NOT EXIST in v3. Use custom ColorModeContext
- Dark mode: toggle `.dark` class on `document.documentElement`
- Avatar.Root + asChild → wrap in `<Box as="button">` first

### Project-Specific Bugs
<!-- باگ‌هایی که در این پروژه کشف شدن — نه DS-level -->
<!-- فرمت: symptom → fix (یه خط) — اگه باگی نیست این section رو خالی بذار -->
<!-- wf-update این بخش رو بعد از کشف باگ جدید آپدیت می‌کنه -->

### Layout
<!-- [CUSTOMIZE] مشخصات layout این پروژه -->
- Navbar: full-width sticky header
- Body: `maxW="1920px" mx="auto"`
- Sidebar: `w="256px"` expanded

---

## Brand Tokens
<!-- [CUSTOMIZE] رنگ اصلی این پروژه — از project-context.md بیار -->
| Token | Light | Dark |
|-------|-------|------|
| `brand.solid` | teal.600 | teal.600 |
| `brand.contrast` | white | white |
| `brand.fg` | teal.700 | teal.300 |
| `brand.subtle` | teal.100 | teal.900 |
| `brand.muted` | teal.200 | teal.800 |
| `brand.emphasized` | teal.300 | teal.700 |
| `brand.focusRing` | teal.500 | teal.500 |
| `brand.border` | teal.500 | teal.400 |
| `brand.bg` | teal.50 | teal.950 |

→ کامل: `src/theme/tokens.ts`
→ جدول همه variant‌ها: `dev-knowledge/design-systems/chakra-ui-v3/tokens.md`

---

## Architectural Decisions
<!-- این تصمیم‌ها قطعی هستن — پیشنهاد جایگزین نده مگه کاربر صریحاً بخواد -->
<!-- wf-update این section رو آپدیت می‌کنه هر بار تصمیم معماری جدیدی گرفته بشه -->

| حوزه | تصمیم | دلیل |
|------|-------|------|
| State Management | <!-- [CUSTOMIZE] مثال: Zustand --> | <!-- [CUSTOMIZE] --> |
| Data Fetching | <!-- [CUSTOMIZE] مثال: TanStack Query --> | — |
| Routing | <!-- [CUSTOMIZE] مثال: React Router v6 --> | — |
| Auth | <!-- [CUSTOMIZE] مثال: JWT در localStorage --> | — |

<!-- اگه تصمیم جدیدی در session گرفته شد، Claude این جدول رو آپدیت می‌کنه -->
<!-- فرمت ردیف جدید: | حوزه | تصمیم | دلیل کوتاه | -->

---

## File Structure
<!-- [CUSTOMIZE] ساختار این پروژه رو اینجا بنویس -->
```
src/
  components/layout/
  contexts/
    ColorModeContext.tsx
  pages/
  theme/
    index.ts
    tokens.ts
  types/
  services/
```

---

## Knowledge References
- Chakra full reference: `dev-knowledge/design-systems/chakra-ui-v3/chakra-ui-v3.md`
- All tokens: `dev-knowledge/design-systems/chakra-ui-v3/tokens.md`
- Known bugs: `dev-knowledge/design-systems/chakra-ui-v3/known-bugs.md`
- RTL concepts: `dev-knowledge/universal/language.md`
- Figma→Code: `dev-knowledge/universal/figma-to-code.md`
