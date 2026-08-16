# Bootstrap 5 — SCSS Theming Scaffold

راهنمای setup پروژه جدید با Bootstrap 5 از SCSS source.

---

## چرا SCSS و نه bootstrap.min.css؟

Bootstrap pre-compiled CSS رنگ `#0d6efd` رو در SVG data URIs
(checkbox، radio، switch و ...) hardcode می‌کنه.
CSS custom properties روی این data URIs کار نمی‌کنن —
تنها راه compile کردن Bootstrap از source هست.

---

## قدم‌ها

### ۱. نصب sass

در `package.json` به devDependencies اضافه کن:
```json
"sass": "^1.89.0"
```
سپس روی host machine (نه sandbox) اجرا کن:
```bash
npm install
```

### ۲. ساخت پوشه `src/styles/`

سه فایل زیر رو بساز (template در همین پوشه موجوده):

**`_tokens.scss`** — brand vars، فقط این فایل per-project عوض می‌شه:
```scss
$brand-primary:   [PRIMARY_HEX];
$brand-secondary: #6c757d;

$brand-font-sans: '[FONT_LTR]', system-ui, sans-serif;
$brand-font-rtl:  '[FONT_RTL]', system-ui, sans-serif;  // اگه دوزبانه
```

**`_overrides.scss`** — mapping به Bootstrap SCSS vars:
```scss
// ⚠️ $theme-colors رو اینجا define نکن — کل map رو replace می‌کنه و
//    .text-danger / .bg-success و سایر utility classes از بین می‌رن.

$primary:          $brand-primary;
$secondary:        $brand-secondary;
$font-family-base: $brand-font-sans;
```

**`bootstrap.scss`** — entry point:
```scss
@import "tokens";
@import "overrides";
@import "bootstrap/scss/bootstrap";
```

### ۳. آپدیت import در main.tsx

```tsx
// ❌ حذف:
import 'bootstrap/dist/css/bootstrap.min.css'

// ✅ جایگزین:
import './styles/bootstrap.scss'
```

---

## نکات CLAUDE.md

در بخش Styling پروژه اضافه کن:
```
Bootstrap از SCSS source کامپایل می‌شه (نه dist/css/bootstrap.min.css).
برای تغییر رنگ primary: فقط src/styles/_tokens.scss رو ویرایش کن.
```

---

## فایل‌های template

`_tokens.scss`، `_overrides.scss`، و `bootstrap.scss` در همین پوشه
به عنوان template قابل کپی مستقیم هستن.
