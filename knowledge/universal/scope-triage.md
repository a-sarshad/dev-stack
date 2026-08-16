# Scope Triage — یک خونه‌ی واحد (canonical)

> **مشکلی که حل می‌کنه:** هر تغییر از همون pipeline کامل Figma→code رد می‌شد —
> fetch + implement + screenshot. برای یه تغییر یه‌خطی هم ۲۰ دقیقه. fast lane نبود.
> updated: 2026-06-05 · مرجع: [`BLUEPRINT.md`](../BLUEPRINT.md) §3

این فایل **تعریف عمیق**ـه (لایه REFERENCE). خلاصه‌ی همیشه‌فعالش
به‌صورت یه gate کوتاه در `{project}/CLAUDE.md` زندگی می‌کنه (لایه RULE).
خط دقیق اجرا در skill `dev-implement` (STEP -1، لایه ACCELERATOR).
هر سه آینه‌ی همین جدول‌ان — تکرار کامل ممنوع، فقط pointer.

---

## سه tier

| Tier | چیه | کار لازم | Figma fetch؟ | screenshot؟ |
|------|-----|----------|-------------|------------|
| **0 — trivial** | متن/label، rename، comment، config، import sort، تغییر بدون اثر بصری | فقط Edit | ❌ | ❌ |
| **1 — code/style** | prop، token swap، spacing/padding، bugfix، refactor، ریسپانسیو **روی component موجود** — بدون surface نو از Figma | Edit + `dev-engine --changed --fix` (یا `type-check` پروژه) | ❌ | ❌ |
| **2 — Figma→code نو** | frame/page/component نو از Figma، یا تغییری که باید **pixel با Figma spec** بخوره | کل Figma→Code Protocol پروژه | ✅ هدفمند | ✅ |

---

## قوانین

1. **اول tier، بعد عمل.** هر task → یه‌خط tier تعیین کن، بعد شروع کن.
2. **screenshot = opt-in.** default = نزن. فقط **Tier 2** یا وقتی کاربر صریح گفت
   «compare / pixel-perfect / screenshot». غیر این → CLI verify کافیه.
   - چرا امنه: check دترمینیستیک (token، logical-props، ds-usage) رو CLI **صفر token**
     می‌گیره. screenshot برای تغییر غیربصری = اضافه‌کاری.
3. **MCP Figma fetch فقط Tier 2.** Tier 0/1 هیچ MCP call نمی‌خواد — همه از local cache.
4. **شک بین دو tier؟ → پایین‌تر رو بگیر.** اگه وسط کار معلوم شد بزرگ‌تره، escalate کن. سرعت اول.
5. **Tier ربطی به «درست بودن» نداره.** Tier 1 هم باید `--changed --fix` رو سبز کنه —
   فقط screenshot و fetch حذف می‌شن، نه check.

---

## مثال‌ها

| request | tier | چرا |
|---------|------|-----|
| «این متن دکمه رو عوض کن» | 0 | غیربصری، بدون pipeline |
| «padding این card رو ۸ کن» / «این رنگ رو به token درست ببند» | 1 | style، component موجود، CLI verify کافی |
| «این bug رو fix کن» / «این component رو refactor کن» | 1 | کد، Figma نو نیست |
| «این frame Figma رو implement کن [URL]» | 2 | surface نو، fetch + screenshot لازم |
| «این صفحه رو با طرح Figma pixel-perfect کن» | 2 | کاربر صریح pixel خواست |
