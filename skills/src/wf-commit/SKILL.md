---
name: wf-commit
description: >
  آماده‌سازی commit message برای هر git repo — پروژه‌های فعلی (Vitrina، Airport)،
  dev-stack، یا هر repo جدیدی.
  این skill را بلافاصله اجرا کن هر وقت کاربر گفت:
  "commit کن", "push کن", "commit message بساز", "save کن", "sync کن",
  "بزن رو git", "تغییرات رو ذخیره کن", "commit and push",
  یا بعد از هر عملیات روی فایل‌های پروژه که نیاز به commit داره.
  مختص هیچ پروژه خاصی نیست — path رو خودش تشخیص می‌ده.
  خروجی: دستور آماده برای copy-paste در Terminal.
  مهم: هیچ‌وقت git write commands از sandbox اجرا نمی‌کنه.
---

# wf-commit

بعد از هر تغییر در هر پروژه‌ای، یه commit message آماده بساز.

**مهم:** هیچ‌وقت `git add` یا `git commit` از sandbox اجرا نکن —
فقط `git status` (read-only) می‌زنیم تا lock file ایجاد نشه.

---

## مرحله ۱ — تشخیص پروژه و مسیر

پروژه و مسیر git repo رو auto-detect کن:

```bash
# پیدا کردن همه git repoهای مانت‌شده
find /sessions/*/mnt -maxdepth 2 -name ".git" -type d 2>/dev/null | sed 's|/.git||'
```

اولویت تشخیص:
1. **Context مکالمه** — اگه روی پروژه خاصی کار می‌کردیم، همون
2. **Workspace folder** — اولین مانت‌شده که `.git` داره
3. **چند repo باز** → از کاربر بپرس: «کدوم repo رو commit کنم؟»

نام پروژه رو از `package.json` → `name`، یا از آخرین بخش مسیر، یا از CLAUDE.md بخون.

---

## مرحله ۲ — بررسی تغییرات

```bash
PROJECT_PATH=<مسیر تشخیص‌داده‌شده>
git -C "$PROJECT_PATH" status --short
```

اگه **هیچ تغییری نبود** → کاملاً silent بمون، هیچی نگو.

---

## مرحله ۳ — بررسی docs قبل از commit

**جدول «کدام سند را کِی آپدیت کن» در skill `wf-update` است — منبع canonical.**
همان‌جا را اعمال کن؛ اینجا تکرارش نکن (دو نسخه drift می‌کنند — دقیقاً همان اتفاقی
که قبلاً افتاد).

اگه یکی از شرط‌های آن جدول صدق می‌کنه و فایل مربوطه هنوز آپدیت نشده:
1. اول اون فایل رو آپدیت کن
2. بعد commit message رو بساز (شامل همه تغییرات)

**استثنای مخصوص `dev-stack` خودش** (فقط وقتی repo همین مونوریپوست):

| اگه این اتفاق افتاده... | این فایل باید آپدیت بشه |
|------------------------|------------------------|
| skill اضافه/حذف/rename شد | `CLAUDE.md` (جدول skills) + `skills/README.md` |
| فولدر جدید در ریشه | `README.md` + `CLAUDE.md` |
| DS جدید به `knowledge/design-systems/` | `README.md` |
| فایل جدید به `knowledge/universal/` | `README.md` |

> ⚠️ **skill عوض کردی؟** فقط commit کافی نیست — `pnpm build:skills` بزن و به کاربر
> بگو کدام `.skill` را دوباره نصب کند. بدون نصب مجدد، نسخهٔ قدیمی فعال می‌ماند.

---

## مرحله ۴ — ساخت commit message

بر اساس **تمام** فایل‌های تغییرکرده، یه commit message مناسب بساز:

**فرمت Conventional Commits:**
- `feat:` — فایل یا محتوای جدید
- `fix:` — اصلاح اشتباه / باگ fix
- `refactor:` — جابجایی یا بازسازی بدون تغییر رفتار
- `docs:` — به‌روزرسانی مستندات
- `chore:` — تغییرات غیر-کدی (config، dependency، ...)
- `feat(scope):` — وقتی scope مشخصه (مثلاً `feat(auth):` یا `feat(ui):`)

**قوانین message:**
- خط اول: `type(scope): خلاصه به انگلیسی یا فارسی` — زیر ۷۰ کاراکتر
- خط‌های بعد (اگه لازم): لیست تغییرات مهم با `-`
- نام فایل‌های مهم رو ذکر کن

**مثال‌ها:**
```
feat(ui): implement Dashboard page from Figma

- Add StatsCard component
- Add RecentActivity component
- Implement Dashboard page layout
- All tokens used, RTL verified
```

```
feat(skills): add dev-review skill

- skills/src/dev-review/SKILL.md: سورس skill جدید
- CLAUDE.md: skill جدید به جدول اضافه شد
- skills/README.md: مستندات آپدیت شد
```

---

## مرحله ۵ — خروجی copy-paste ready

دقیقاً این بلوک رو نمایش بده (با مسیر و commit message واقعی):

```
در Terminal اجرا کن:

cd <مسیر واقعی پروژه روی mac کاربر>
git add -A
git commit -m "<commit message>"
git push
```

**نکته مسیر:** مسیر sandbox (`/sessions/*/mnt/...`) رو نده — مسیر واقعی Mac رو بده:
- `/sessions/*/mnt/dev-stack` → `~/Documents/GitHub/dev-stack`
- `/sessions/*/mnt/<project>` → `~/Documents/GitHub/Projects/<Project>`

اگه مطمئن نیستی، مسیر رو از `CLAUDE.md` پروژه یا از کاربر بگیر — حدس نزن.

---

## قوانین

- فقط یه بار بعد از **تمام** تغییرات مرتبط commit کن — نه بعد از هر فایل
- همیشه docs check (مرحله ۳) رو قبل از commit message انجام بده
- اگه تغییری نبود هیچی نگو — silent باش
- هیچ‌وقت از sandbox: `git add`، `git commit`، `git push` اجرا نکن
