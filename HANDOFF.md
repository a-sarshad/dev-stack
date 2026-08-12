# dev-agents — Handoff
> آخرین آپدیت: 2026-08-12

## الان
**هنوز commit نشده** — دو تغییر در `packages/dev-engine`:

- **رجیستری DS داده‌محور** — `paths.ts` حالا `design-systems/*/ds.json` را می‌خواند
  (`loadDsRegistry`/`findDs`)؛ نسخهٔ hardcoded (`DS_FOLDER`/`DS_PACKAGE`) فقط fallback
  ماند. `doctor.ts` سه چک تازه گرفت: رجیستری، نسخهٔ نصب‌شده در برابر `targets`، و
  `contract`. `cli.ts` دستور `ds-list` گرفت. `cache.ts` باگ کوچک داشت (`dsFolder()`
  آرگومان `dev_knowledge_path` را نادیده می‌گرفت) که در همین کار فیکس شد.

- **حذف ریشه‌ای زیرسیستم snapshot متنی** — `modules/layout-diff.ts` ·
  `verify-render.ts` · `layout-sync.ts` · `layout-cache.ts` حذف شدند (~۱۳۰۰ خط).
  از `types.ts`: `LayoutSnapshot`/`ContainerLayout`/`RenderedSnapshot`/
  `LayoutSnapshotCache` حذف. از `engine.ts` و `doctor.ts` ارجاعشان حذف.
  **دلیل:** snapshot (نوشته‌شده در STEP 2 از یک screenshot) و کد (نوشته‌شده در
  STEP 3 از همان screenshot) هر دو از یک خواندن می‌آمدند، پس سبزشدنِ چک هیچ
  اطلاعات مستقلی نداشت — یک تأیید خودارجاع که ⚠️ روتینش ⚠️ واقعی را در DoD
  نامرئی می‌کرد. جزئیات کامل و شواهد → `dev-knowledge/HANDOFF.md`.
  `layout-derive.ts` ماند ولی بازنویسی شد: دیگر snapshot نمی‌نویسد، فقط بازگشتی
  روی کل درخت `get_metadata` پیمایش می‌کند و چاپ می‌کند (سوخت جدول ترجمه).

- `dist/` پاک و از نو build شد — بدون این کار، خروجی‌های کهنه‌ی `layout-*.js`
  زیر `dist/` می‌ماندند.

## تست رگرسیون (انجام شد)
`tsc --noEmit` تمیز → build تمیز → `doctor` روی Vitrina: ۹ چک، همه ✓ →
اجرای کامل روی Vitrina: ۸۹ warning، دقیقاً برابر پیش از تغییر (بدون false-negative
جدید) → `layout-derive` روی دامپ ساختگی RTL درست کار کرد (تشخیص محور، ترتیب DOM،
و `notes` وقتی هندسه نامتقارن بود).

## بعدی
- **این commit + دو‌تای دیگه (dev-knowledge، Vitrina) با هم مرتبطن** — سه‌تا با هم
  commit شوند تا یک repo نصفه‌کاره نماند.
- **نصب مجدد skillها لازم است** — `dev-implement.skill`/`dev-engine.skill` ویرایش
  شدند ولی نسخهٔ deployed جداست؛ تا re-install نشوند نسخهٔ قدیمی (که هنوز
  `layout-sync`/`verify-render` صدا می‌زند) فعال می‌ماند.
- تصمیم باز: آیا `layout-derive` هم حذف شود؟ (بررسی شد — صفر هزینهٔ زمان اجرا دارد،
  هیچ‌جا خودکار صدا زده نمی‌شود؛ فعلاً نگه داشته شد.)
