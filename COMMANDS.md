# COMMANDS — دستورهای دستی (cheat-sheet)

> همه‌ی دستورهایی که **می‌تونی** خودت تو Terminal بزنی + هر کدوم چیکار می‌کنه.
>
> ⚠️ **مهم:** جز `git`، هیچ‌کدوم **اجباری نیست**. وقتی لینک Figma بدی و بگی «implement کن»،
> skill `dev-implement` خودش همه‌ی `dev-engine`ها رو خودکار می‌زنه. این لیست برای وقتیه
> که **خودت دستی** بخوای یه کاری بکنی.

---

## ۰. یک‌بار — فعال‌سازی alias

```bash
source ~/.zshrc        # alias‌های den/denc/denf فعال شن (یا فقط tab جدید Terminal)
type den               # تست: باید بگه "den is an alias for dev-engine ."
```

---

## ۱. روزمره — check کد (از root پروژه)

| دستور | چیکار می‌کنه | کِی |
|-------|--------------|-----|
| `den` | check کامل کل repo (هیچ تغییری نمی‌ده، فقط گزارش) | می‌خوای ببینی کد مشکل داره |
| `denc` | فقط فایل‌های **git-changed** — سریع‌تر | بعد چند تا edit، چک سریع |
| `denf` | check + **auto-fix** موارد قابل‌اصلاح | می‌خوای خودش درست کنه |

> `den` = `dev-engine .` · `denc` = `--changed` · `denf` = `--fix`
> چی fix می‌کنه: hardcode رنگ→token، `right`→`insetInlineEnd`، RTL DOM order، console.log، و... .

> **⚠️ همیشه repo root (`.`) بده، هیچ‌وقت `./src` یا زیرشاخه.** آرگومان `path` هم‌زمان
> root اسکن فایل **و** root پیدا کردن cache است؛ با زیرشاخه، `figma-layout.json` و
> `figma-resolve.json` پیدا نمی‌شن و ماژول‌هایی مثل `layout-diff` بی‌هیچ خطایی
> «۰ issue» می‌دن — یعنی «هیچی چک نشد»، نه «تمیزه». دامنه رو با `--changed` محدود کن، نه با مسیر.

---

## ۲. Figma pipeline (معمولاً خودکار — این‌ها نسخه‌ی دستی)

| دستور | چیکار می‌کنه | کِی دستی می‌زنی |
|-------|--------------|----------------|
| `dev-engine doctor .` | preflight: DS نصبه؟ cache هست؟ کهنه نشده؟ پوشش snapshot چقدره؟ | قبل شروع کار، چک آمادگی |
| `dev-engine resolve Button` | اسم Figma → import کد (از cache local، صفر MCP) | می‌خوای ببینی فلان کامپوننت به چی map می‌شه |
| `dev-engine figma-sync .` | وضعیت cache دو لایه (DS + Local) + شمارش | ببینی cache چقدر پره |
| `dev-engine figma-sync . --scan` | `src/components` رو scan کن، cache Local رو پر کن | کامپوننت جدید اضافه کردی، cache آپدیت شه |
| `dev-engine figma-sync . --init` | یه template خالی cache بساز | پروژه‌ی نو، اولین بار |

---

## ۲.۵ تطابق با طرح فیگما (layout-diff + verify-render)

دو لایه‌ی مستقل: یکی **متن کد** رو با طرح می‌سنجه، یکی **پیکسل رندرشده** رو.

| دستور | چیکار می‌کنه |
|-------|--------------|
| `dev-engine layout-sync .` | چند کامپوننت snapshot دارن + سنشون. **۰ یعنی layout-diff هیچی چک نمی‌کنه** |
| `dev-engine layout-sync . --set Card --data '{"textAlign":"start"}'` | نوشتن snapshot **با اعتبارسنجی** (به‌جای ویرایش دستی JSON) |
| `dev-engine verify-render --snippet` | اسنیپت JS رو چاپ می‌کنه تا در کنسول preview اجرا کنی |
| `dev-engine verify-render .` | geometry دامپ‌شده رو **عددی** با طرح diff می‌کنه |

> **قرارداد semantic (مهم):** مقدارها `start`/`end` ان، نه `left`/`right`.
> در RTL: `start` = راست · `end` = چپ. canvas فیگما همیشه LTR رندر می‌شه، پس
> متنی که در فیگما راست‌چین می‌بینی در پروژه‌ی RTL یعنی `start`. اگه مقدار فیزیکی
> بدی، `--set` ردش می‌کنه و همین اشتباه رو یادآوری می‌کنه.

---

## ۳. گزینه‌های بیشتر dev-engine

| دستور | چیکار می‌کنه |
|-------|--------------|
| `dev-engine . --watch` | هر بار فایل عوض شه، خودکار دوباره check (زنده) |
| `dev-engine . --module token-replacer` | فقط یه module خاص رو اجرا کن |
| `dev-engine . --json` | خروجی JSON (برای CI/اسکریپت) |
| `dev-engine init` | فایل `.dev-engine.json` رو سوال‌به‌سوال بساز |
| `dev-engine --help` | لیست کامل دستورها و گزینه‌ها |

---

## ۴. dev server (اپ رو اجرا کن)

از **root پروژه** (`~/Documents/GitHub/Projects/Vitrina`):

| دستور | چیکار می‌کنه |
|-------|--------------|
| `pnpm dev` | dev server با hot-reload (موقع کد زدن) → localhost:5173 |
| `pnpm build` | build نهایی production در `dist/` |
| `pnpm preview` | نسخه‌ی build‌شده رو serve کن (تست production) |
| `pnpm lint` | eslint |

> یا بهم بگو «server رو start کن» — خودم با preview tool بالا میارم.

---

## ۵. git — تنها چیز **اجباری دستی** ⚠️

من از sandbox **هیچ‌وقت** git write نمی‌زنم (قانون امنیتی). commit/push رو **تو** می‌زنی.

```bash
cd <مسیر پروژه>
git add -A
git commit -m "پیام"
git push
```

> معمولاً من دستور آماده‌ی copy-paste بهت می‌دم — فقط paste کن و Enter.

---

## خلاصه‌ی خلاصه

```
کار عادی:   لینک Figma بده → "implement کن" → من همه‌چی خودکار
دستی فقط اگه خواستی:  den (چک)  ·  denf (چک + fix)
اجباری دستی:  git commit/push
```
