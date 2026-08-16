---
name: wf-update
description: >
  ذخیره و بروزرسانی وضعیت پروژه — در هر مرحله‌ای از کار، نه لزوماً آخر session.
  این skill را بلافاصله اجرا کن هر وقت کاربر گفت:
  "آپدیت کن", "ذخیره کن", "وضعیت رو ثبت کن", "HANDOFF رو آپدیت کن",
  "session-update بزن", "save کن", "بروزرسانی کن", "update کن",
  یا هر عبارتی که نشون می‌ده می‌خواد snapshot فعلی پروژه رو ذخیره کنه.
  روی هر پروژه‌ای کار می‌کنه — HANDOFF.md، CLAUDE.md، README.md رو اگه وجود داشتن
  آپدیت می‌کنه، اگه نداشتن می‌سازه.
  خروجی: آپدیت HANDOFF.md + بررسی و آپدیت CLAUDE.md و README.md پروژه در صورت نیاز.
---

# Session Update

هدف: در هر لحظه‌ای از کار — وسط session یا آخرش — وضعیت پروژه رو ذخیره کن
تا بشه هر موقع از همینجا ادامه داد.

---

## مرحله ۱ — تشخیص پروژه و مسیر

**بدون سوال،** پروژه و مسیرش رو تشخیص بده:

```bash
# پیدا کردن workspace folder مانت‌شده
ls /sessions/*/mnt/ 2>/dev/null | grep -v outputs | grep -v uploads

# یا از CLAUDE.md که در context هست
# یا از package.json در working directory
```

اولویت تشخیص:
1. Workspace folder مانت‌شده در `/sessions/*/mnt/<project-name>/`
2. CLAUDE.md که در context مکالمه هست (نام و مسیر پروژه توشه)
3. `package.json` در working directory

اگه چند پروژه باز بود → از کاربر بپرس: «کدوم پروژه رو آپدیت کنم؟»

---

## مرحله ۲ — جمع‌آوری اطلاعات

```bash
PROJECT_PATH=<مسیر تشخیص‌داده‌شده>

git -C "$PROJECT_PATH" log --oneline -8
git -C "$PROJECT_PATH" status --short
```

HANDOFF.md فعلی رو بخون (اگه وجود داشت).

**فقط یه سوال بپرس:**
> «قدم بعدی چیه؟» (یه جمله کافیه)

---

## مرحله ۳ — آپدیت HANDOFF.md

HANDOFF.md رو بنویس/آپدیت کن — **کوتاه و فقط چیزهایی که git نمی‌دونه:**

```markdown
# [نام پروژه] — Handoff
> [تاریخ و ساعت]

## الان
[یک جمله — از روی آخرین commits: چه چیزی تازه ساخته یا تغییر کرده]

## بعدی
[جواب کاربر به «قدم بعدی چیه؟»]

## باگ‌های open
[فقط اگه باگی open هست — وگرنه این section رو حذف کن]
```

**قوانین:**
- هدف: زیر ۱۵ خط
- stack، DS، constraints، تصمیم‌های معماری → **در CLAUDE.md هستن، تکرار نکن**
- «الان» از git commits استخراج کن، نه از حافظه مکالمه
- git history رو کپی نکن — skill `wf-start` خودش git log می‌زنه
- اگه HANDOFF.md وجود نداشت → بسازش

---

## مرحله ۴ — بررسی CLAUDE.md و README.md

بعد از HANDOFF، این جدول رو چک کن — آیا تغییرات این session نیاز به آپدیت دارن:

> **این جدول منبع canonical است.** skill `wf-commit` هم به همین ارجاع می‌دهد —
> کپی‌اش نکن، وگرنه دو نسخه drift می‌کنند.

| اگه این اتفاق افتاده... | این فایل باید آپدیت بشه |
|------------------------|------------------------|
| باگ جدید project-specific کشف شد | `CLAUDE.md` → بخش **Project-Specific Bugs** |
| باگ DS-level کشف شد | `dev-stack/knowledge/design-systems/<ds>/known-bugs.md` |
| سورس یک skill عوض شد | `dev-stack/skills/src/<name>/SKILL.md` → بعدش `pnpm build:skills` + **نصب مجدد** |
| قانون یا pattern جدید DS | `CLAUDE.md` پروژه |
| تصمیم معماری گرفته شد | `CLAUDE.md` → بخش **Architectural Decisions** + pointer در HANDOFF |
| library یا tool جدید به stack | `CLAUDE.md` + `README.md` |
| ساختار پوشه‌های پروژه تغییر کرد | `README.md` |
| صفحه یا route جدید اضافه/حذف شد | `README.md` → جدول صفحات (از `src/app/**/page.tsx` sync کن، نه از حافظه) |
| env var یا دستور setup جدید | `README.md` |
| breaking change در DS یا library | `CLAUDE.md` |
| convention جدید برای component‌ها | `CLAUDE.md` |

اگه یکی از شرط‌ها صدق می‌کنه → بدون اینکه کاربر بگه، اون فایل رو هم آپدیت کن.

### sync جدول صفحات README (اجباری وقتی route تغییر کرد)

اگه README جدولِ «صفحات پیاده‌سازی‌شده» (ستون Route) داره، از حافظه آپدیتش نکن —
از فایل‌سیستم sync کن:

```bash
find src/app -name "page.tsx" | sed 's|src/app||; s|/page.tsx||; s|^$|/|' | sort
```

خروجی = لیستِ کاملِ routeها. هر route که در جدول نیست → اضافه کن. هر route در جدول که دیگه فایل نداره → حذف کن. توضیحِ صفحه رو نگه‌دار/بنویس.

اگه CLAUDE.md یا README.md در پروژه وجود ندارن → نساز (پروژه‌های بدون این فایل‌ها هم باید support بشن).

### ثبت تصمیم معماری در CLAUDE.md

هر چیزی که اگه Claude نمی‌دونست گزینه دیگه‌ای پیشنهاد می‌داد:

```
| State Management | Zustand | سادگی — بدون boilerplate |
| Data Fetching    | TanStack Query v5 | caching + invalidation |
| Auth             | JWT در localStorage | — |
```

در HANDOFF فقط pointer: `→ see CLAUDE.md Architectural Decisions`

### ثبت باگ

**فرمت کوتاه:**
```
- `<component/prop>` → BROKEN: <علت>. Fix: `<راه‌حل>`
```

---

## مرحله ۵ — اتمام

یه خط بگو:

> «HANDOFF آپدیت شد ✓»

اگه CLAUDE.md یا README.md هم آپدیت شد:
> «CLAUDE.md / README.md هم آپدیت شد.»

اگه uncommitted changes داشت:
> «⚠️ [N] فایل تغییر کرده — برای commit از skill `wf-commit` استفاده کن.»
