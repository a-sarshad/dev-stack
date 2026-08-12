# design-systems/ — قرارداد اسکلت (skeleton contract)

> updated: 2026-08-12
> این فایل تعریف می‌کنه هر پوشه‌ی DS چه شکلیه، `ds.json` یعنی چی، و
> چطور یک DS جدید اضافه می‌شه — **بدون تغییر کد**. برای معماری کل سیستم
> (BLUEPRINT، Figma pipeline) → `../BLUEPRINT.md`.

---

## ۱. فایل‌های اجباری هر پوشه‌ی DS

هر پوشه زیر `design-systems/<ds-id>/` باید این ۷ فایل رو داشته باشه
(الگو/قالب خالی‌شون → `_TEMPLATE/`):

| فایل | نقش |
|------|-----|
| `ds.json` | manifest — id/aliases/package/targets/contract (بخش ۳) |
| `README.md` | راهنمای خودِ همون DS |
| `figma-resolve.json` | لایه DS: Figma component/token name → import کد (کش شیرد) |
| `tokens.md` | جدول semantic tokenهای این DS |
| `components.md` | فهرست کامپوننت‌های این DS |
| `known-bugs.md` | باگ/gotcha شناخته‌شده‌ی خودِ کتابخانه |
| `rtl.md` | قوانین RTL مخصوص API این DS |

پوشه‌ای که با `_` شروع بشه (مثل `_TEMPLATE`) عمداً از این قرارداد مستثناست —
تولینگ اون رو به‌عنوان DS واقعی نمی‌خونه.

---

## ۲. قانون لایه‌بندی — DS در برابر پروژه

این مهم‌ترین قانون این فایله. هر وقت شک داشتی یه نکته کجا بره
(اینجا در `design-systems/`، یا در `{project}/.claude/context/`)، از این
تست استفاده کن:

> **اگه تغییرش فقط ظاهر رو عوض می‌کنه (چه شکلیه) → سطح پروژه.**
> **اگه تغییرش چیزی که وجود داره رو عوض می‌کنه (یه اسم، یه API، یه قرارداد) → سطح DS.**

- **لایه‌ی DS (این پوشه‌ها)** = **اسم‌ها / قراردادهای** کتابخانه:
  اسم semantic tokenها (`bg.subtle`، نه مقدار رنگش)، فهرست کامپوننت‌ها،
  گیرهای شناخته‌شده‌ی خودِ کتابخانه، قوانین RTL که از API کتابخانه می‌آد.
  این‌ها بین **همه‌ی** پروژه‌هایی که از این DS استفاده می‌کنن یکسانه.

- **لایه‌ی پروژه (`{project}/.claude/context/`)** = **مقدارها**:
  رنگ brand، فونت پروژه، نگاشت‌های مخصوص همون پروژه، تصمیمات UI محلی.

مثال: «این DS یه token به اسم `bg.subtle` داره» → DS-level.
«رنگ `brand.solid` پروژه‌ی X تیل ۶۰۰ـه» → project-level.
«`NativeSelect` تو این نسخه از Chakra باگ داره» → DS-level (خودِ کتابخانه).
«پروژه‌ی X تصمیم گرفته جدولش zebra-row با `bg.subtle` باشه» → project-level.

---

## ۳. فیلدهای `ds.json`

```json
{
  "id": "chakra-v3",
  "aliases": ["chakra-v2"],
  "package": "@chakra-ui/react",
  "targets": "^3",
  "contract": 1
}
```

| فیلد | معنی |
|------|------|
| `id` | شناسه‌ی کانونیک این DS — همین مقدار در فیلد `"ds"` فایل `.dev-engine.json` پروژه استفاده می‌شه (مثلاً `"ds": "chakra-v3"`) |
| `aliases` | شناسه‌های قدیمی/جایگزینی که باید به همین پوشه resolve بشن (مثلاً پروژه‌ای که هنوز `"ds": "chakra-v2"` نوشته) |
| `package` | نام پکیج npm که واقعاً نصب کتابخانه رو تأیید می‌کنه (برای preflight/doctor) |
| `targets` | این دانش برای کدوم رنج نسخه‌ی upstream معتبره (semver range، مثل `^3`) |
| `contract` | نسخه‌ی schema لایه‌ی shared این DS — روی هر تغییر **breaking** در قرارداد override (مثلاً فرمت `figma-resolve.json` عوض بشه، یا معنی یه فیلد فرق کنه) یک عدد بالا می‌ره. پروژه‌ها با فیلد `"ds_contract"` در `.dev-engine.json` خودشون این عدد رو pin می‌کنن؛ mismatch یعنی دانش DS جلوتر از چیزیه که پروژه براش ساخته شده — علامتِ نیاز به بازبینی، نه silent break |

---

## ۴. جایگزین changelog — قانون نسخه‌بندی

یک پوشه‌ی DS **منتشرشده هیچ‌وقت به‌شکل breaking عوض نمی‌شه.**
وقتی کتابخانه یک major جدید منتشر می‌کنه:

```
❌ ویرایش design-systems/chakra-ui-v3/  برای پشتیبانی از Chakra v4
✅ ساخت design-systems/chakra-ui-v4/    پوشه‌ی جدید، مستقل
```

`chakra-ui-v3/` دست‌نخورده می‌مونه — پروژه‌های قدیمی که هنوز v3 دارن
همچنان درست resolve می‌شن. این جایگزین changelog‌ـه: به‌جای «تاریخچه‌ی
تغییرات یک فایل»، هر نسخه‌ی ناسازگار پوشه‌ی خودش رو داره و از قبلی
مستقله.

---

## ۵. اضافه کردن یک DS جدید

```bash
cp -r design-systems/_TEMPLATE design-systems/<ds-id>
# بعد: پر کردن ds.json + بقیه‌ی فایل‌ها با محتوای واقعی
```

همین. **هیچ تغییر کدی در جای دیگه لازم نیست** — تولینگ (`dev-engine doctor`،
`resolve`، `figma-sync`) با خوندن `ds.json` هر پوشه، DSها رو auto-discover
می‌کنه؛ چیزی hardcode نشده.

برای دیدن چیزی که تولینگ واقعاً discover کرده (نه چیزی که فکر می‌کنی هست):

```bash
dev-engine ds-list        # id، aliases، package، targets، contract هر DS
```

اگه یه DS اینجا نبود یعنی `ds.json` نداره یا JSONـش خرابه — و پروژه‌ای که
`ds`ـش به اون اشاره کنه، در `doctor` **hard fail** می‌گیره (نه warning).

اگه پروژه‌ای اصلاً کتابخانه‌ی کامپوننتی نداره، از DS جدید استفاده نکن —
`ds: "generic"` رو ببین (`generic/README.md`).
