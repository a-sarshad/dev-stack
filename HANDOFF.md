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

## بعدی
- commit هر سه repo با هم (dev-knowledge + dev-agents + Vitrina).
- فاز ۳: vision-diff (crop + pixel-diff بدون مدل) — جزئیات در `dev-agents/HANDOFF.md`.
- **نصب مجدد اسکیل‌ها** — `dev-implement` و `dev-engine` ویرایش شده‌اند ولی نسخهٔ
  deployed جداست؛ تا re-install نشوند نسخهٔ قدیمی فعال است.
  تشخیص drift: `diff <(unzip -p <name>.skill <name>/SKILL.md) "<deployed path>"`.
- تصمیم Tailwind: `4a-financial` و `azita-jafari` یا `tailwind-v4` بگیرند یا
  out-of-pipeline اعلام شوند.
- `bootstrap5/_tokens.scss` رنگ برند واقعی در لایهٔ shared دارد → `_tokens.template.scss`.
