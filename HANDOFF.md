# dev-knowledge — Handoff
> آخرین آپدیت: 2026-08-08

## الان
**Commit شد (387aa3d + commits قبل‌تر)** — موازی با `dev-agents` audit:

- **`skills/dev-engine.skill` + `skills/dev-implement.skill` (هاردن شدن, 387aa3d)** — علت: کشف شد که نسخه‌ی نصب‌شده (لود واقعی در session) با source این repo drift داشت — یه skill بروزرسانی‌شده نصب نشده بود و نسخه‌ی قدیمی هنوز فعال بود. هر دو اسکیل الان: (۱) نردبان resolve باینری دارن (`command -v` → مسیر dist شناخته‌شده → self-build+link → فقط آخرش به کاربر) تا دیگه «نصب نیست، stop» رخ نده، (۲) `RULE 0` — هر step که اجرا نشه، یا خودش درست می‌کنه یا می‌پرسه، هیچ‌وقت skip نمی‌کنه، (۳) دستورهای جدید `layout-sync --set` و `verify-render` سیم‌کشی شدن.
- **`COMMANDS.md` + `universal/dev-engine.md`** — مثال‌ها و aliasها از `dev-engine ./src` به `dev-engine .` اصلاح شدن (خودِ سند gotcha رو مستند کرده بود ولی مثال‌هاش خلافش رو یاد می‌دادن). + بخش جدید برای `layout-sync --set` و `verify-render` + توضیح قرارداد semantic (`start`/`end`، نه `left`/`right`).

## نکته‌ی مهم — چرا اسکیل drift کرد
`.skill` زیر `skills/` **source** است، نه runtime. نسخه‌ی واقعاً لودشده یه `SKILL.md` جداست زیر
`Library/Application Support/Claude/.../skills-plugin/.../skills/<name>/SKILL.md`. ویرایش `.skill`
تا وقتی re-install (یا overwrite مستقیم مسیر بالا) نشه اثر نداره. برای تشخیص drift:
`diff <(unzip -p <name>.skill <name>/SKILL.md) "<deployed path>"`.

## بعدی
**✅ Complete:** `dev-agents` commit شد (17fd726 — css-logical-props.ts RTL-aware mapping).
- اگه لازم شد: گسترش `layout-diff`/`verify-render` schema به موارد بیشتر (spacing، border، shadow).
- اختیاری: drift‌چک خودکار بین `.skill` source و deployed SKILL.md.
- **Upstream (Vitrina):** بروزرسانی dev-engine و تست RTL logical props fixes.
