# shadcn/ui — Dropzone (file-drop trigger)

## ⚠️ رجیستری آیتم `dropzone` / `file-upload` ندارد

```bash
npx shadcn@latest add dropzone     # ❌ نیست
npx shadcn@latest add file-upload  # ❌ نیست
```

چک شد (`search_items_in_registries` + `npx shadcn search`، ۲۰۲۶-۰۹). رجیستری
`@shadcn` فقط `Attachment` را دارد — و آن **کارتِ نمایشِ فایلِ انتخاب‌شده** است
(media + title + size + دکمهٔ حذف)، نه سطحِ drop. یعنی «کادرِ dashed که drag & drop
می‌گیرد» یک **Build** است: HTML5 native drag-and-drop + `<input type="file">` مخفی
+ `Button`. کتابخانهٔ سوم لازم نیست — `react-dropzone` را برای این کار نیاور.

## 🔴 اول تصمیم بگیر: فقط trigger یا کلِ widget؟

«dropzone»‌های آماده بیرون (originui, kibo-ui, shadcn.io) معمولاً **لیستِ فایل هم**
دارند. اگر از صفر می‌سازی این دو مسئولیت را جدا نگه دار:

| لایه | چه می‌خواهد |
|---|---|
| **trigger** — کادرِ dashed + Browse | native DnD + inputِ مخفی. بی‌حالت. `File[]` خام emit می‌کند. |
| **لیست** — کارت‌های `<Attachment>` زیرش | state، حذف، thumbnail، `URL.createObjectURL`/`revokeObjectURL`، validation |

trigger کوچک و پایدار است؛ لیست state و i18n و تصمیمِ نوع می‌خواهد. یک کامپوننتِ
trigger-only بساز که `onDrop(files: File[])` بدهد و بس — مصرف‌کننده لیست را با
`<Attachment>` می‌چیند. نسخهٔ batteries-included را فقط وقتی بساز که **مصرف‌کنندهٔ
دومِ واقعی** داری (پایین).

## 🔴 trigger به‌صورتِ لینکِ inline = `<Button variant="link">` را باید reset کنی

الگوی «Drag & drop here or [Browse]» که Browse لینکِ وسطِ جمله است:

```tsx
<Button
  variant="link"
  className="text-foreground h-auto p-0 align-baseline"
  onClick={openFileDialog}
>
  Browse
</Button>
```

چرا هر سه override لازم است:
- `h-auto p-0` — `link` هم `cva` است، ارتفاع/پدینگِ دکمه دارد → از خطِ متن بیرون می‌زند.
- `text-foreground` — variant `link` رنگِ برند (`text-primary`) است. داخلِ یک خطِ
  `text-muted-foreground`، لینکِ رنگی جیغ است؛ رنگِ متنِ صفحه طبیعی‌تر است.
- `align-baseline` — وگرنه baselineِ دکمه با متنِ اطراف یکی نمی‌شود.

underline: variant `link` فقط `hover:underline` دارد (نه همیشه) — همان کافی است، دست نزن.

## 🔴 native DnD: drag-depth counter، نه boolean

`dragenter`/`dragleave` از هر فرزندِ داخلِ zone bubble می‌کنند. با یک
`useState(false)` ساده، حرکتِ ماوس روی آیکن/متنِ داخل → `dragleave` → کادر پِلِپِل می‌زند.

```tsx
const dragDepth = React.useRef(0);
// onDragEnter: dragDepth.current += 1;            setActive(true)
// onDragLeave: if (--dragDepth.current <= 0) { dragDepth.current = 0; setActive(false) }
// onDrop:      dragDepth.current = 0;             setActive(false)
```

`onDragOver` را هم `preventDefault` کن + `dataTransfer.dropEffect = "copy"` وگرنه
مرورگر drop را نمی‌پذیرد.

## 🔴 تله‌های TypeScript

- **propsِ triggerِ داخلی = `React.ComponentProps<"button">`، نه
  `React.ComponentProps<typeof Button>`.** Base UI رویدادِ `onClick` را
  `BaseUIEvent<MouseEvent>` تایپ می‌کند (متدِ `preventBaseUIHandler` دارد). اگر props
  را از `typeof Button` بگیری، handlerِ ساده‌ات با امضای `React.MouseEvent<HTMLButtonElement>`
  دیگر assignable نیست.
- **rootِ zone = `Omit<React.ComponentProps<"div">, "onDrop" | "title">`.** `onDrop`
  امضای خودت `(files: File[])` است نه `DragEventHandler`؛ `title` هم اگر propی به اسمِ
  `title` داری (لایوتِ basic) با اتریبیوتِ HTMLِ `title` روی `<div>` تصادم دارد.
- **merge کردنِ دو لایوت با یک prop `type` + props به‌صورتِ discriminated union:** موقعِ
  کندنِ `type` از union قبلِ spread روی `<div>` (`const { type: _t, ...rest } = props`)،
  پروژه‌هایی که eslintشان `^_` را ignore نمی‌کنند `no-unused-vars` warning می‌دهند
  (`tsc` نمی‌گیرد، `npm run lint` می‌گیرد). چاره: یا union را رها کن و flat type بده
  (`type?: "a" | "b"` + propهای هر دو حالت optional، گِیت با JSDoc نه TS)، یا `type` را
  با `if (props.type === …)` مصرف کن بدونِ destructure.

## 🔵 توکن: hover ≠ drag-active

- hover روی خودِ کادر → یک تیره‌شدنِ خیلی ملایم. اگر پروژه قراردادی برای این دارد
  (مثلاً `hover:bg-muted/50` که `TableRow` استفاده می‌کند) همان را بردار — نه
  `bg-muted` تخت که سنگین است.
- drag-active → حالتِ «الان ول کن» → `bg-accent` + `border-ring` (یا رنگِ برند).
  واضح‌تر از hover.
- disabled → `pointer-events-none` + `opacity-60` + input هم `disabled`.

## 🔵 RTL: این یکی audit نمی‌خواهد

بدنهٔ zone فقط `flex` + `flex-col`/`flex-row` + `gap` است، صفر کلاسِ فیزیکی
(`ml/mr/left/right/translate-x`). `flex-row` از `direction`ِ CSS که از اتریبیوتِ DOMِ
`dir` می‌آید پیروی می‌کند → آیکن در LTR چپ، در RTL راست، خودکار. برخلافِ
`switch`/`attachment` که `translate` یا `right-*`ِ فیزیکی دارند و بعدِ هر `shadcn add`
باید دستی logical شوند، اینجا چیزی برای برگرداندن نیست.

فقط: لینکِ Browse را با ترتیبِ JSXِ بعد از متن بگذار (نه با `order-*`) تا bidi درست بچیند.

## 🔵 validationِ کلاینت: خطا در state جدا از چرخهٔ `validate`ِ فرم

trigger فیلتر نمی‌کند — پس گیتِ `accept`/size/count را خودت داخلِ `onDrop` بگذار.
اما خطای «این فایل رد شد» با خطای «این فیلد موقعِ submit خالی بود» یکی نیست:

- یک state محلیِ جدا (`localError`) برای ردِ drop. `validate`ِ CRUD/فرم دستش به آن نیست.
- نمایش: `shownError = localError ?? fieldError` → داخلِ همان `<FieldError>`.
- فایلِ ردشده **draft را دست نمی‌زند** — فقط `localError` را ست می‌کند. کاربر فایلِ
  درست بعدی را که بیندازد پاک می‌شود.
- استایلِ خطا روی خودِ zone: `border-destructive/60` (نه فقط متنِ زیر).
- گیتِ MIME تنها کافی نیست — بعضی OSها روی drop `file.type` خالی می‌فرستند؛ fallback به
  پسوندِ `file.name`.

hintِ «PNG or SVG · up to 20 KB» → propِ `description`ِ خودِ `<Dropzone type="basic">`
است، نه `<FieldDescription>`ِ جدا (یک متنِ کمتر، داخلِ خودِ کادر).

## 🔵 نسخهٔ batteries-included (`<DropzoneField>`) — کِی و تلهٔ اصلی

وقتی چند صفحهٔ آپلود داری، یک `<DropzoneField>` که trigger + لیستِ `<Attachment>` +
validation (`accept`/`maxSize`/`maxFiles`) + پوستهٔ `<Field>` را compose کند صرفه دارد.

**تا مصرف‌کنندهٔ دومِ واقعی نساز.** و تصمیمِ سختش این است: **`value` چه نگه دارد؟**

- حالتِ add ساده است: `File[]`.
- حالتِ edit نه — ردیفِ موجود یک فایلِ از قبل آپلودشده دارد که `File` object ندارد،
  فقط نام/URL از بک‌اند. پس یا:
  - `File[]` خالص → کامپوننت add-only، فایل‌های موجود را مصرف‌کننده جدا نشان می‌دهد.
  - آیتمِ union `{ id, name, size?, previewUrl?, file?: File, existing: boolean }` →
    کامپوننت هر دو را نمایش می‌دهد ولی هر مصرف‌کننده موقعِ submit باید `existing` را از
    `file` جدا کند.

این انتخاب کلِ API را شکل می‌دهد؛ با یک مصرف‌کننده حدس است.

## تجربهٔ واقعی

- kish-airport، ۱۴۰۵/۰۶/۱۱ — `<Dropzone type="inline"|"basic">` ساخته شد
  (`src/components/ui/dropzone.tsx`). trigger-only؛ لیستِ فایل با `<Attachment>` سمتِ
  مصرف‌کننده. دو لایوت با prop `type` merge شد → props از discriminated union به flat
  افتاد چون eslintِ پروژه `no-unused-vars` روی `type`ِ کنده‌شده warning می‌داد.
  اولین مصرف‌کننده = `LogoField` (آپلودِ لوگوی ایرلاین، تک‌فایل PNG/SVG): گیتِ
  کلاینت (MIME + fallbackِ پسوند + سقفِ حجم) داخلِ خودِ `onDrop`، خطا در یک state
  محلیِ **جدا از چرخهٔ `validate`ِ فرم** + استایلِ خطا روی خودِ zone؛ hintِ نوع/حجم =
  propِ `description`ِ `<Dropzone>` نه `<FieldDescription>`. `<DropzoneField>`ِ عمومی
  (چند‌فایل + لیست) هنوز به تعویق تا مصرف‌کنندهٔ دومِ چندفایلی.
