---
name: wf-start
description: >
  شروع هر session کاری روی پروژه‌های موجود. این skill را بلافاصله اجرا کن هر وقت کاربر گفت:
  "بریم سراغ [پروژه]", "شروع کنیم", "ادامه بدیم", "کجا بودیم؟", "وضعیت پروژه چیه؟",
  "session جدید", "start session", "let's continue", "where were we", یا هر جمله‌ای که
  نشون می‌ده می‌خواد کار روی یه پروژه رو شروع یا از سر بگیره.
  خروجی: یه briefing ۳-۴ خطی از وضعیت فعلی پروژه.
---

# Session Start

هدف: در کمتر از ۱۵ ثانیه به کاربر بگو الان کجای پروژه هستیم.

**اصل مهم — CLAUDE.md رایگانه:**
اگه workspace folder پروژه باز هست، CLAUDE.md قبلاً در context هست — نیازی به خواندن مجدد نیست.
stack، DS، زبان، constraints، architectural decisions — همه اینا بدون tool call در دسترسن.
فقط دو چیز نیاز به tool call داره: **git log** و **HANDOFF.md**.

---

## مرحله ۱ — تشخیص پروژه (بدون tool call)

از CLAUDE.md که در context هست، یا از اسمی که کاربر گفته، پروژه و مسیرش رو بخون.
فقط اگه هیچ‌کدام مشخص نبود یه سوال بپرس: «کدوم پروژه؟»

---

## مرحله ۲ — فقط دو tool call

```bash
git -C <project_path> log --oneline -5
git -C <project_path> status --short
```

و `HANDOFF.md` رو بخون. همین — نه بیشتر.
DESIGN.md، tokens.md، و هیچ فایل دیگه‌ای رو نخون — DESIGN.md فقط وقتی task واقعاً UI باشه.

---

## مرحله ۳ — briefing

**اگه HANDOFF.md وجود داشت:**
```
📁 [نام پروژه]  ·  [DS]  ·  [زبان]
🕐 [پیام آخرین commit]  ([زمان نسبی])
📍 [الان کجاییم — از HANDOFF]
⏭  [قدم بعدی — از HANDOFF]
```

**اگه HANDOFF.md وجود نداشت** (فقط همین دو خط):
```
📁 [نام پروژه]  ·  [DS]  ·  [زبان]
🕐 [پیام آخرین commit]  ([زمان نسبی])
```

DS و زبان رو از CLAUDE.md در context بخون — tool call نزن.
(`DESIGN.md` رو اینجا نخون — فقط وقتی task واقعاً UI باشه.)
اگه uncommitted changes داشت: `⚠️ [N] فایل uncommitted`
وقتی HANDOFF نیست، هیچ محتوای جایگزینی اضافه نکن — فقط git info.

---

## قوانین

- بعد از briefing منتظر بمون — کاری شروع نکن
- project-context skill رو **فقط** اگه کاربر به اطلاعات دقیق token/breakpoint نیاز داشت load کن
- خطاهای git نمایش نده — اگه مسیر پیدا نشد: «folder رو در Cowork باز کن»
- هیچ سوال اضافه‌ای نپرس

---

## مثال خروجی

```
📁 Vitrina  ·  Chakra UI v3  ·  فارسی RTL
🕐 feat: add sidebar navigation  (3 ساعت پیش)
📍 صفحه Dashboard در حال ساخت
⏭  پیاده‌سازی DataTable کامپوننت
```
