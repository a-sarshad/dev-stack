# dev-stack

مونوریپوی ابزار توسعه — engine، دانش cross-project، و skillها در یک جا.

> از ادغام `dev-agents` + `dev-knowledge` ساخته شد (۱۴۰۵/۰۵). تاریخچهٔ هر دو حفظ شده.
> 🗺️ معماری کامل → [`knowledge/BLUEPRINT.md`](knowledge/BLUEPRINT.md)

---

## ساختار

```
dev-stack/
├── packages/
│   └── dev-engine/       ← CLI: check + auto-fix دترمینیستیک (TypeScript)
│
├── tools/
│   └── vision-diff/      ← مقایسهٔ pixel-diff دو screenshot (Python، اختیاری)
│
├── knowledge/            ← دانش مشترک همه پروژه‌ها
│   ├── universal/        ← مستقل از stack: RTL/LTR، figma→code، scope، git
│   │   └── hooks/rtl_gate.py     ← نسخهٔ canonical هوک Stop
│   ├── design-systems/   ← دانش خاص هر DS
│   │   ├── _TEMPLATE/    ← قالب ساخت DS جدید
│   │   │   ├── CLAUDE-template.md   ← بذر CLAUDE.md پروژه (قانون always-on)
│   │   │   └── DESIGN-template.md   ← بذر DESIGN.md پروژه (تصمیم بصری)
│   │   ├── shadcn-ui/
│   │   │   └── components/          ← تله‌ی هر کامپوننت (اختیاری، وقتی known-bugs بزرگ شد)
│   │   ├── chakra-ui-v3/
│   │   ├── bootstrap5/
│   │   └── generic/
│   ├── BLUEPRINT.md      ← قانون اساسی: معماری، فلو، تصمیمات
│   └── COMMANDS.md
│
└── skills/
    ├── src/<name>/SKILL.md    ← سورس (این چیزیه که ویرایش می‌کنی)
    └── dist/<name>.skill      ← خروجی build (gitignore شده)
```

> این درخت **canonical** است — `CLAUDE.md` تکرارش نمی‌کند، فقط به اینجا ارجاع می‌دهد.

context هر پروژه اینجا **نیست**:

| چه چیزی | کجای repo پروژه |
|---|---|
| قانون always-on (gate، DoD، معماری، توکن) | `CLAUDE.md` |
| تصمیم بصری (رنگ، چیدمان، responsive، a11y، motion، لحن) | `DESIGN.md` — **ریشه** |
| باگ project-specific، قالب صفحه، cache فیگما | `.claude/context/` |
| وضعیت و کار معوق | `HANDOFF.md` |

---

## build

```bash
pnpm install
pnpm build          # dev-engine + skillها
pnpm build:skills   # فقط skillها
```

`dev-engine` را global در دسترس کن:

```bash
cd packages/dev-engine && npm link
```

---

## نصب skillها

فایل‌های `.skill` **در گیت نگه داشته نمی‌شوند** — خروجی build هستند. سورس متنی در
`skills/src/` است تا `git diff` معنی داشته باشد.

```bash
pnpm build:skills          # → skills/dist/*.skill
```

بعد در اپ Claude روی هر فایل `.skill` کلیک → **Save skill**.

> هر بار سورس یک skill را عوض کردی، باید دوباره build و نصب کنی — وگرنه نسخهٔ
> قدیمی فعال می‌ماند. راهنمای هر skill: [`skills/README.md`](skills/README.md)

---

## نحوهٔ استفاده

```
پروژه جدید   → skill dev-init-wizard
شروع session → skill wf-start
ذخیره وضعیت  → skill wf-update
commit       → skill wf-commit
بررسی کد     → dev-engine <path>  (راهنما: knowledge/universal/dev-engine.md)
Figma→کد     → skill dev-implement
```

قوانین اجباری و workflow کامل: [`CLAUDE.md`](CLAUDE.md)

---

## پروژه‌ها

| پروژه | Design System | زبان |
|-------|--------------|------|
| Vitrina | Chakra UI v3 | فارسی (RTL) |
| Airport | Bootstrap 5 | فارسی + انگلیسی (RTL/LTR) |
