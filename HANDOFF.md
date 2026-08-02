# dev-agents — Handoff
> آخرین آپدیت: 2026-08-02

## الان
فیچر `layout-diff` (+ `layout-sync` command) به `dev-engine` اضافه شد — uncommitted روی `main`، در حال commit شدن همین الان:
- `packages/dev-engine/src/layout-cache.ts` (جدید) — read/write `<project>/.claude/context/figma-layout.json`، تک‌لایه (Local only، per-instance).
- `packages/dev-engine/src/layout-sync.ts` (جدید) — CLI command `layout-sync [path] [--init]`: status یا scaffold فایل خالی.
- `packages/dev-engine/src/modules/layout-diff.ts` (جدید) — ماژول چک: `child-order-mismatch`، `text-align-mismatch` (auto-fixable)، `icon-side-mismatch`. اگه snapshot برای یه کامپوننت نباشه، صفر violation (false-positive نمی‌زنه).
- `cli.ts`/`engine.ts`/`types.ts`/`modules/dom-order.ts` — سیم‌کشی command جدید + type `LayoutSnapshot`/`LayoutSnapshotCache` + ثبت ماژول در `getModules`.
- **واقعاً end-to-end تست شد** (نه فقط unit) — روی پروژه Vitrina: `layout-sync --init` زده شد، snapshot دستی برای دو کامپوننت نوشته شد، و با یه decoy file تأیید شد که `child-order-mismatch` واقعاً detect می‌شه.

## نکتهٔ مهم کشف‌شده (حل نشده، فعلاً فقط مستند)
باینری `dev-engine` **global لینک نیست** — دستور خام `dev-engine` در PATH نیست، باید با `node dist/cli.js` صداش زد.
**gotcha جدی‌تر:** آرگومان `path` هم‌زمان هم root اسکن فایل‌هاست هم root حل‌کردن `.dev-engine.json`/`.claude/context/*`. اگه یه subdirectory بدی (نه repo root)، cacheها silently پیدا نمی‌شن و ماژول‌هایی مثل `layout-diff` بی‌صدا «۰ issue» می‌دن — یعنی «هیچی چک نشد»، نه «تمیزه». باید همیشه از repo root (`path="."`) اجرا بشه. این تو Vitrina کشف شد؛ در `packages/dev-engine` هیچ‌جا مستند نشده بود.

## بعدی
یکی از این دو (کاربر هنوز تصمیم نگرفته):
1. `dev-engine` رو global لینک کنیم (`pnpm link` یا `npm i -g`) تا دستور خام کار کنه.
2. یا حداقل `cli.ts` رو طوری فیکس کنیم که `path` فقط scan-root باشه و config/cache همیشه از نزدیک‌ترین `.dev-engine.json` بالادستی resolve بشه (مستقل از `path` آرگومان) — ریشهٔ واقعی باگ.

فعلاً فقط در `README.md`/مستندات dev-knowledge (`universal/dev-engine.md`) این gotcha جایی مستند نشده — باید اضافه بشه (جدا از این repo).
