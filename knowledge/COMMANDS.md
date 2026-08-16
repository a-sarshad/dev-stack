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
> root اسکن فایل **و** root پیدا کردن cache است؛ با زیرشاخه، `.dev-engine.json` و
> `figma-resolve.json` پیدا نمی‌شن و خروجی «۰ issue» می‌شه — یعنی «هیچی چک نشد»،
> نه «تمیزه». دامنه رو با `--changed` محدود کن، نه با مسیر.

---

## ۲. Figma pipeline (معمولاً خودکار — این‌ها نسخه‌ی دستی)

| دستور | چیکار می‌کنه | کِی دستی می‌زنی |
|-------|--------------|----------------|
| `dev-engine doctor .` | preflight: DS نصبه؟ نسخه/contract می‌خوره؟ cache هست و کهنه نشده؟ | قبل شروع کار، چک آمادگی |
| `dev-engine resolve Button` | اسم Figma → import کد (از cache local، صفر MCP) | می‌خوای ببینی فلان کامپوننت به چی map می‌شه |
| `dev-engine figma-sync .` | وضعیت cache دو لایه (DS + Local) + شمارش | ببینی cache چقدر پره |
| `dev-engine figma-sync . --scan` | `src/components` رو scan کن، cache Local رو پر کن | کامپوننت جدید اضافه کردی، cache آپدیت شه |
| `dev-engine figma-sync . --init` | یه template خالی cache بساز | پروژه‌ی نو، اولین بار |

---

## ۲.۵ تطابق با طرح فیگما

**تأیید نهایی = مقایسهٔ screenshot طرح با screenshot preview.** هیچ ابزار CLIای
جایگزینش نیست و هیچ‌کدام «جهت درست است یا نه» را نمی‌گویند.

تنها کمکِ ماشینی، حساب‌کردن سمت از **هندسهٔ خام** است به‌جای خواندن با چشم:

| دستور | چیکار می‌کنه |
|-------|--------------|
| `dev-engine layout-derive . --metadata dump.xml` | از دامپ `get_metadata`، برای هر container: `layoutMode`، `justify`/`align`، و ترتیب صحیح DOM را **حساب** و چاپ می‌کند |
| `… --node 2659:82005` | فقط همان node و زیرمجموعه‌اش |

خروجی سوختِ **جدول ترجمه** است، نه یک چک خودکار — هیچ فایلی نمی‌نویسد.

> **قرارداد semantic (مهم):** مقدارها `start`/`end` ان، نه `left`/`right`.
> در RTL: `start` = راست · `end` = چپ. canvas فیگما همیشه LTR رندر می‌شه، پس
> متنی که در فیگما راست‌چین می‌بینی در پروژه‌ی RTL یعنی `start`.

> **حذف‌شده در 1405/05:** `layout-diff` · `verify-render` · `layout-sync` ·
> `figma-layout.json`. دلیل: snapshot و کد هر دو از یک خواندنِ screenshot می‌آمدند،
> پس سبزشدنشان هیچ اطلاعات مستقلی نداشت — و ⚠️ روتینشان ⚠️ واقعی را در DoD
> نامرئی می‌کرد.

> **ابزار جانبی اختیاری (1405/08):** `dev-agents/tools/vision-diff/` —
> `vision_diff.py` (crop + pixel-diff دترمینیستیک، بدون مدل، pass/fail خودکار
> روی یه جفت screenshot) و `model_review.py` (نظر دوم اختیاری از یه vision
> model فقط روی regionهای `❌`). جایگزین مقایسهٔ چشمی نیست، فقط pre-filter
> ارزون قبلش. جزئیات: `tools/vision-diff/README.md`.

---

## ۳. گزینه‌های بیشتر dev-engine

| دستور | چیکار می‌کنه |
|-------|--------------|
| `dev-engine . --watch` | هر بار فایل عوض شه، خودکار دوباره check (زنده) |
| `dev-engine . --module token-replacer` | فقط یه module خاص رو اجرا کن |
| `dev-engine . --json` | خروجی JSON (برای CI/اسکریپت) |
| `dev-engine init` | سوال‌به‌سوال: `.dev-engine.json` + scaffold کردن `CLAUDE.md` و `.claude/` |
| `dev-engine init . --yes --ds chakra-v3 --name MyApp` | همان، **بدون سوال** (برای اسکریپت/agent) |
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
