# Bootstrap 5 — RTL
> updated: 2026-05-18

---

## Setup

Bootstrap 5 از `dir="rtl"` روی `<html>` برای RTL پشتیبانی می‌کنه.

```html
<html dir="rtl" lang="fa">
  <link rel="stylesheet" href="bootstrap.min.css">
</html>
```

> اگه پروژه **RTL-only** باشه می‌تونی از `bootstrap.rtl.min.css` استفاده کنی تا نیازی به override دستی نباشه.
> اگه پروژه **دوزبانه** (RTL/LTR runtime switch) باشه، از نسخه معمولی استفاده کن و override بزن.

---

## Logical Classes در Bootstrap 5

Bootstrap 5 از utility classes جهت‌دار پشتیبانی می‌کنه — در RTL خودکار flip می‌شن:

| Physical ❌ | Logical ✅ |
|------------|-----------|
| `ms-*` | margin-inline-start |
| `me-*` | margin-inline-end |
| `ps-*` | padding-inline-start |
| `pe-*` | padding-inline-end |
| `float-start` | شروع (راست در RTL) |
| `float-end` | پایان (چپ در RTL) |
| `text-start` | راست‌چین در RTL |
| `text-end` | چپ‌چین در RTL |

---

## ⚠️ دام رایج — modal close button

Bootstrap 5 روی `.modal-header .btn-close` این رو hardcode می‌کنه:
```css
margin-left: auto;   /* دکمه × رو همیشه راست نگه می‌داره */
margin-right: calc(-.5 * var(--bs-modal-header-padding-x));
```

در RTL flex، `margin-left: auto` باز هم دکمه رو سمت **راست** نگه می‌داره.
نتیجه: دکمه × کنار title می‌مونه، نه گوشه چپ modal.

**فیکس:**
```css
:root[dir="rtl"] .modal-header .btn-close {
  margin-left: calc(-.5 * var(--bs-modal-header-padding-x));
  margin-right: auto;
}
```

این رو در بخش `BOOTSTRAP OVERRIDES` پروژه اضافه کن.

> **چرا این مشکل وجود داره؟** چون `bootstrap.min.css` LTR-only هست. نسخه `bootstrap.rtl.min.css` این رو درست کرده ولی در پروژه دوزبانه که از نسخه معمولی استفاده می‌کنی باید override دستی بزنی.

---

## مراجع

- RTL concepts عمومی (CSS/HTML): `universal/language.md`
- پیاده‌سازی دوزبانه در پروژه Airport: `Airport/.claude/context/project-context.md`
