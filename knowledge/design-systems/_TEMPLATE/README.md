# _TEMPLATE — قالب ساخت یک DS جدید

> این پوشه خودش یک DS نیست — زیرخط اول عمدیه، تولینگ پوشه‌های
> `_`-دار رو نادیده می‌گیره (هیچ‌وقت به عنوان DS واقعی خونده نمی‌شه).
> برای اضافه کردن یک design system جدید، این پوشه رو کپی کن به
> `../<ds-id>/` و فایل‌های زیر رو پر کن.

## قدم‌ها

1. کپی: `cp -r design-systems/_TEMPLATE design-systems/<ds-id>`
2. `ds.json` رو پر کن — `id`, `aliases`, `package`, `targets`, `contract`
3. بقیه‌ی فایل‌ها (`figma-resolve.json`, `tokens.md`, `components.md`,
   `known-bugs.md`, `rtl.md`) رو با محتوای واقعی DS جایگزین کن
4. هیچ تغییر کدی لازم نیست — تولینگ با خوندن `ds.json` پوشه‌های DS
   رو auto-discover می‌کنه

## فایل‌های اجباری این پوشه

| فایل | برای چی |
|------|---------|
| `ds.json` | manifest — id/aliases/package/targets/contract |
| `README.md` | همین فایل — راهنمای خودِ پوشه (بعد از کپی، محتوای DS واقعی رو توضیح بده) |
| `figma-resolve.json` | Figma component/token name → import کد این DS (لایه شیرد) |
| `tokens.md` | جدول توکن‌های این DS (lookup بدون tool call) |
| `components.md` | فهرست کامپوننت‌های این DS |
| `known-bugs.md` | باگ‌ها/gotchaهای شناخته‌شده‌ی این نسخه از DS |
| `rtl.md` | قوانین RTL مخصوص این DS (اگه DS جهت‌آگاه نیست، بنویس «ندارد» + دلیل) |

## فایل اختیاری

| فایل | برای چی |
|------|---------|
| `CLAUDE-template.md` | قالب CLAUDE.md پروژه — `dev-engine init` این را برمی‌دارد، placeholderها را جایگزین می‌کند و در ریشهٔ پروژهٔ جدید می‌نویسد. اگر DS نسخهٔ خودش را نداشته باشد، همین `_TEMPLATE/CLAUDE-template.md` استفاده می‌شود. |

### placeholderهای قابل جایگزینی

`{{PROJECT_NAME}}` · `{{DS}}` · `{{DS_FOLDER}}` · `{{DIRECTION}}` · `{{LANG}}` ·
`{{LOCALE}}` · `{{CALENDAR}}` · `{{START_SIDE}}` · `{{END_SIDE}}` · `{{DK_PATH}}` ·
`{{TYPECHECK_CMD}}`

> `{{START_SIDE}}`/`{{END_SIDE}}` از روی `direction` حساب می‌شوند
> (rtl → راست/چپ · ltr → چپ/راست) تا متن قالب در هر دو جهت درست بخواند.

## قانون لایه‌بندی — همیشه رعایت کن

هر فایل این پوشه فقط چیزهایی رو نگه می‌داره که **بین همه‌ی پروژه‌های
این DS مشترکه** — نه چیزی که مخصوص یک پروژه‌ست. جزئیات کامل →
`../README.md` بخش «قانون لایه‌بندی».
