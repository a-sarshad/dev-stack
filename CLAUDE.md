# dev-stack — راهنمای کار با Claude

این مونوریپو engine، دانش مشترک پروژه‌ها، و skillها را با هم نگه می‌دارد.
Claude این فایل رو در هر session می‌خونه تا بدونه ساختار چیه و چطور باهاش کار کنه.

> **معماری کل سیستم + فلوی Figma→code + تصمیمات قطعی → [`knowledge/BLUEPRINT.md`](knowledge/BLUEPRINT.md)** (قانون اساسی).
> هر وقت گیج شدی «این کجا بره / چه فلویی»، اول اونجا.

---

## ساختار و ویرایش

- درخت کامل پوشه‌ها + دستورهای build → [`README.md`](README.md) (**canonical**، اینجا تکرار نمی‌شود).
- سورس skill = `skills/src/<name>/SKILL.md` (متن). `skills/dist/*.skill` خروجی build است
  و در گیت نیست — هرگز آنجا ویرایش نکن.
- **بعد از هر ویرایش skill:** `pnpm build:skills` **و** نصب مجدد در اپ Claude —
  تا نصب مجدد نشود نسخهٔ قدیمی فعال است. راهنمای trigger/خروجی هر skill +
  فلوی کامل build/install → [`skills/README.md`](skills/README.md).

> **ارجاع مرده = خطای build.** `build:skills` اول `pnpm check:refs` را می‌زند
> (مسیرها، لینک‌ها، نام skillها، سطح فرمان `dev-engine`، قرارداد اسکلت DS).
> جزئیات + استثناها → [`skills/README.md`](skills/README.md) §«اعتبارسنجی ارجاع‌ها».

---

## قوانین scope

### universal/
- فقط چیزهایی که بدون تغییر در **همه پروژه‌ها** صدق می‌کنن.
- نکتهٔ project-specific یا DS-specific اینجا نذار.

### context پروژه — در repo خودِ پروژه، نه اینجا
- قانون always-on (gate، DoD، معماری، توکن) → `Projects/<name>/CLAUDE.md`
- تصمیم بصری (رنگ، چیدمان، responsive، a11y، motion، لحن) → `Projects/<name>/DESIGN.md` (**ریشه**، نه `.claude/`)
- باگ project-specific، قالب صفحه، cache فیگما → `Projects/<name>/.claude/context/`
- وضعیت و کار معوق → `Projects/<name>/HANDOFF.md`

> جدول کامل «این فایل کجا بره» + مرز `CLAUDE.md ↔ DESIGN.md` → [`BLUEPRINT.md`](knowledge/BLUEPRINT.md) §۴.
> load context: skill `<project>-context` (thin loader — محتوا رو از repo پروژه می‌خونه، embed نمی‌کنه).

### design-systems/<name>/
- راهنما، token، و نکات خاص اون DS — قابل استفاده در چند پروژه.

---

## Workflow استاندارد

1. **خوندن context** — قبل از هر کار مرتبط با پروژه، skill آن پروژه رو load کن.
2. **ویرایش فایل‌ها** — با ابزارهای Read/Write/Edit.
3. **Commit خودکار** — بعد از هر تغییر، skill `wf-commit` اجرا می‌شه.

### اصل طلایی — قانون اجباری در always-on، نه skill

> **چرا قبلاً مرحله‌ها فراموش می‌شدن:** قوانین حیاتی فقط در skillهای on-demand بودن.
> skill اگه trigger نشه یا نصب نباشه = قانون در context نیست.

→ هر چیزی که **نباید فراموش شه** باید در CLAUDE.md پروژه باشه (لایهٔ RULE، هر پیام لود می‌شه).
knowledge/ فقط وقتی صریح read بشه؛ skill فقط با trigger match. این قانونه، نه سلیقه.

> چهار لایهٔ قابلیت اطمینان (RULE / ENGINE / REFERENCE / ACCELERATOR) و کِی هرکدام لود می‌شه
> → [`BLUEPRINT.md`](knowledge/BLUEPRINT.md) §۲.

#### مثال
```
User: روی Vitrina کار می‌کنم
Claude: [loads vitrina-project-context skill] → [reads Vitrina/DESIGN.md + .claude/context/*]
```

---

## Skills — کدوم کِی

| نیاز | skill / دستور |
|------|---------------|
| پروژهٔ جدید | `dev-init-wizard` |
| شروع session | `wf-start` |
| ذخیرهٔ وضعیت | `wf-update` |
| commit | `wf-commit` (بعد از هر تغییر، خودکار) |
| بررسی/fix کد (token/hardcode/RTL) | `dev-engine` |
| Figma → code | `dev-implement` ⭐ (نقطهٔ ورود واحد، pipeline کامل) |
| load context پروژه | `<project>-context` (vitrina/airport) |
| Figma MCP قطع شد | `figma-mcp-reconnect` |

> **جدول کامل** (trigger phrases، خروجی، وابستگی هر skill) → [`skills/README.md`](skills/README.md).
> Figma skills رسمی (`figma-implement-design`, `figma-use`, `figma-generate-design`, …) از figma plugin می‌آن.

**قانون اجباری Figma→code** (Component Resolution / DS MCP / DoD) در **CLAUDE.md هر پروژه** زندگی می‌کنه
(always-on) — skill فقط شتاب‌دهنده‌ست. مرجع عمیق: [`knowledge/universal/figma-to-code.md`](knowledge/universal/figma-to-code.md).

**skillهای بازنشسته — دوباره اضافه نکن:**
- `dev-delivery-check` (`73b0517`) → checklist‌ش در `dev-engine` + گیت DoD در CLAUDE.md پروژه ادغام شد.
  ⚠️ یک‌بار به‌غلط به‌عنوان skill «external» احیا شد (`720531a`).
- `figma-page-implement` → محتوای اجباریش در `figma-to-code.md` + gate پروژه‌ها.

---

## نکات مهم برای Claude

- **هیچ‌وقت session ID رو hardcode نکن** — dynamic path detection:
  ```bash
  DN_PATH=$(ls -d /sessions/*/mnt/dev-stack/knowledge 2>/dev/null | head -1)
  ```
- بعد از هر تغییر فایل در این repo، بدون اینکه کاربر بخواد، `wf-commit` اجرا کن.
- خطاهای git → [`knowledge/universal/git-troubleshoot.md`](knowledge/universal/git-troubleshoot.md).
- استفاده از dev-engine CLI → [`knowledge/universal/dev-engine.md`](knowledge/universal/dev-engine.md).
