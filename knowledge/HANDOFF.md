# dev-knowledge — Handoff
> 2026-08-13

## الان
**uncommitted** — لایهٔ scaffold پروژهٔ جدید کامل شد (زوجِ تغییرات `dev-agents`):

- **`universal/hooks/rtl_gate.py`** (جدید) — نسخهٔ canonical هوک `Stop`. قبلاً تنها
  نسخه‌اش داخل Vitrina بود، پس پروژهٔ جدید باید دستی کپی‌اش می‌کرد. خودِ فایل از قبل
  project-agnostic بود؛ فقط توزیع نشده بود.
- **`_TEMPLATE/CLAUDE-template.md`** (جدید) — قالب **پایهٔ** DS-agnostic: پروتکل‌ها
  (Figma gate، Scope Triage، Figma→Code، DoD، مقایسهٔ preview) + بخش جهت.
  placeholderها `{{VAR}}` که `dev-engine init` جایگزین می‌کند.
- **`chakra-ui-v3/CLAUDE-template.md`** — از قالب کامل به **مکمل** تبدیل شد (فقط
  چیزهای Chakra). `init` پایه + مکمل را به هم می‌چسباند. اگر هر DS قالب کامل خودش
  را داشت، پروتکل‌های مشترک در N جا کپی و drift می‌کردند.
  ضمناً یک **توصیهٔ غلط** فیکس شد: `bg="bg.default"` → «از `bg="white"` استفاده کن»
  که dark mode را می‌شکند؛ درستش `bg="bg.panel"` است.
- README (درخت) · COMMANDS · `universal/dev-engine.md` با قابلیت جدید sync شدند.
- **COMMANDS.md** یک پاراگراف پرچم اضافه کرد به `tools/vision-diff/`
  (فاز ۳+۴ pipeline optimization، جزئیات کامل در `HANDOFF.md`).

## بعدی
- commit هر سه repo با هم (dev-knowledge + dev-agents + Vitrina).
- **نصب مجدد اسکیل‌ها** — `dev-implement` و `dev-engine` ویرایش شده‌اند ولی نسخهٔ
  deployed جداست؛ تا re-install نشوند نسخهٔ قدیمی فعال است.
  تشخیص drift: `diff <(unzip -p <name>.skill <name>/SKILL.md) "<deployed path>"`.
- تصمیم Tailwind: `4a-financial` و `azita-jafari` یا `tailwind-v4` بگیرند یا
  out-of-pipeline اعلام شوند.
- `bootstrap5/_tokens.scss` رنگ برند واقعی در لایهٔ shared دارد → `_tokens.template.scss`.
- **تصمیم باز: ادغام `dev-stack` + `dev-stack/knowledge` (+ `claude-live-dashboard`
  بی‌گیت) به یک مونوریپوی `Tools/`.** بحث شد، هنوز commit به مسیر (با/بدون حفظ
  تاریخچه) انتخاب نشده. با حفظ تاریخچه ~۱۰ دقیقه گران‌تر از بدون‌تاریخچه‌ست چون هر دو
  ریپو push شده‌ان (چیزی از دست نمی‌ره). قبل از شروع: دو فایل معلق همین‌جا
  (`COMMANDS.md`, `HANDOFF.md`) باید commit بشن.
