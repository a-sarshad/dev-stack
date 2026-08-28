# dev-stack — Handoff
> 2026-08-28

## الان
Gap-audit روی `knowledge/design-systems/shadcn-ui/` (منبع: `ui.shadcn.com` +
رجیستری زنده): `Form` که کلاً غایب بود اضافه شد، `Data Table`/`Date Picker`/
`Typography` که اشتباه registry item معرفی شده بودن اصلاح شدن، لیست style
با `sera`/`rhea` کامل شد. باگ‌های per-component از `known-bugs.md` (که تخت
داشت بزرگ می‌شد) به `components/<name>.md` منتقل شدن — الگوش در
`design-systems/README.md` به‌عنوان قرارداد اختیاری ثبت شد.
`Documents/GitHub/Tools/` دیگه وجود نداره — حذف شده.

## بعدی
- **اولویت اول:** همین split رو روی `chakra-ui-v3/known-bugs.md` بزن
  (۳۹۶ خط، ۲۷ باگ — دو برابر shadcn، بیشترین سود).
- تأیید نصب مجدد ۹ skill از `skills/dist/` (وضعیتش از ۰۸-۱۷ verify نشده).
- آرشیو `a-sarshad/dev-agents` + `a-sarshad/dev-knowledge` روی گیت‌هاب.
- `bootstrap5/_tokens.scss` → باید `_tokens.template.scss` بشه (رنگ برند
  واقعی توی لایه‌ی shared مونده).
- تصمیم Tailwind برای `4a-financial`/`azita-jafari`: v4 یا out-of-pipeline.
