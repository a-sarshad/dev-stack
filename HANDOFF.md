# dev-knowledge — Handoff
> آخرین آپدیت: 2026-08-02

## الان
دو تکه uncommitted روی `main`، در حال commit شدن با هم:

**۱. مستندسازی فیچر `layout-diff`** (companion doc برای commit موازی در `dev-agents`):
- `universal/dev-engine.md`: بخش `layout-sync` command + توضیح cache `figma-layout.json` (تک‌لایه Local، برخلاف `figma-resolve` که DS+Local داره) + ردیف `layout-diff` در جدول ماژول‌ها.
- **⚠️ اضافه‌شده در همین commit** (فراتر از چیزی که فقط doc-sync بود): یه بخش هشدار جدید بالای «دستورات Terminal» — کشف شد که آرگومان `path` هم‌زمان scan-root و config/cache-root است؛ اگه subdirectory بدی (نه repo root)، cacheها silently پیدا نمی‌شن و `layout-diff` بی‌صدا «۰ issue» می‌ده. این تو پروژه Vitrina کشف شد، اینجا mesent شد تا بقیه پروژه‌ها هم تکرار نکنن.

**۲. `skills/figma-mcp-reconnect.skill`** (جدید، بدون‌ربط به مورد ۱):
- reconnect خودکار Figma MCP با computer-use، وقتی اتصال قطع می‌شه یا نیاز به authenticate داره.
- سه‌جا برای پیدا‌شدنش آپدیت شد (طبق قانون «skill جدید → CLAUDE.md + README.md + skills/README.md»):
  - `CLAUDE.md`: بخش جدید «Figma — نگهداری اتصال» زیر جدول‌های Figma رسمی.
  - `skills/README.md`: ردیف در «فهرست سریع» + یه subsection کامل («## Figma — نگهداری اتصال»).
  - `README.md` (ریشه): چیزی اضافه نشد — قبلاً فقط pointer به CLAUDE.md می‌ده، duplicate لازم نبود.

## بعدی
مشخص نیست — این commit صرفاً ذخیره‌سازی کار موجود بود. اگه لازم شد، قدم بعدیِ منطقی:
- gotcha «CLI path = projectRoot» که تازه مستند شد رو در خودِ `dev-agents/packages/dev-engine/src/cli.ts` **فیکس** کنیم (نه فقط مستند)، چون فعلاً فقط warning نوشتاریه.
