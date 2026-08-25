# shadcn/ui — Token Reference

<!--
اینجا چی می‌ره: اسم semantic tokenهای این DS و نقش‌شون — چیزی که خودِ
shadcn به عنوان API تعریف کرده. مقدار واقعی رنگ brand هر پروژه اینجا نیست
(اون project-level ـه، در `{project}/src/index.css` یا `app/globals.css`).
-->

## Semantic Color Tokens

هر جفت `X` / `X-foreground` هست: `X` رنگ surface، `X-foreground` رنگ متن/آیکون
روی همون surface. Tailwind این‌ها رو به utility می‌کنه: `bg-background`,
`text-foreground`, `border-border`, `ring-ring`.

| Token | کنترل می‌کنه | استفاده در |
|---|---|---|
| `background` / `foreground` | پس‌زمینه و متن پیش‌فرض اپ | page shell، متن پیش‌فرض |
| `card` / `card-foreground` | سطوح elevated | Card، پنل‌های dashboard |
| `popover` / `popover-foreground` | سطوح شناور | Popover، DropdownMenu، ContextMenu |
| `primary` / `primary-foreground` | کنش پراهمیت | Button پیش‌فرض، selected state، accent فعال |
| `secondary` / `secondary-foreground` | کنش کم‌اهمیت‌تر | دکمه/بج ثانویه |
| `muted` / `muted-foreground` | سطح/متن کم‌اهمیت | description، placeholder، empty state |
| `accent` / `accent-foreground` | hover/focus/active | ghost button، منوی highlight، ردیف hover |
| `destructive` | کنش مخرب/خطا | دکمه destructive، invalid state |
| `border` | جداکننده پیش‌فرض | Card، منو، جدول، Separator |
| `input` | حاشیه فرم | Input، Textarea، Select |
| `ring` | حلقه focus | هر عنصر قابل‌فوکوس |
| `chart-1` … `chart-5` | پالت پیش‌فرض چارت | Chart component |
| `sidebar` / `sidebar-foreground` | سطح پایه سایدبار | Sidebar container |
| `sidebar-primary` / `-foreground` | کنش پراهمیت داخل سایدبار | آیتم active، آیکون‌تایل |
| `sidebar-accent` / `-foreground` | hover/selected داخل سایدبار | ردیف hover، آیتم باز |
| `sidebar-border` | جداکننده سایدبار | header/group داخل سایدبار |
| `sidebar-ring` | focus ring سایدبار | کنترل‌های داخل سایدبار |
| `radius` | مقیاس گردی پایه | مشتق‌شده‌ها زیر |

⚠️ **`chart-1..5` از `baseColor` مشتق نمی‌شن با یه رنگ ثابت.** با preset
`base`/`radix` پیش‌فرض معمولاً achromatic (بی‌رنگ، chroma≈0) تولید می‌شن —
حتی اگه spec/طرح یه پالت رنگی (مثلاً آبی) بخواد. اگه چارت باید رنگی باشه،
دستی در `:root`/`.dark` ست کن. (تجربه‌ی واقعی → `known-bugs.md`.)

## Radius Scale

`--radius` توکن پایه‌ست؛ بقیه ازش مشتق می‌شن (در `@theme inline`):

```css
--radius-sm:  calc(var(--radius) * 0.6);
--radius-md:  calc(var(--radius) * 0.8);
--radius-lg:  var(--radius);
--radius-xl:  calc(var(--radius) * 1.4);
--radius-2xl: calc(var(--radius) * 1.8);
--radius-3xl: calc(var(--radius) * 2.2);
--radius-4xl: calc(var(--radius) * 2.6);
```

## Base Colors (`tailwind.baseColor` در `components.json`)

مقادیر پیش‌فرض تمام تکن‌های بالا رو موقع `init` تولید می‌کنه. **بعد از init
قابل تغییر نیست** (باید کامپوننت‌ها re-install بشن).

گزینه‌ها: `neutral` · `stone` · `zinc` · `mauve` · `olive` · `mist` · `taupe`

## اضافه کردن یه token جدید

تعریف زیر `:root` و `.dark`، بعد expose به Tailwind با `@theme inline`:

```css
:root {
  --warning: oklch(0.84 0.16 84);
  --warning-foreground: oklch(0.28 0.07 46);
}
.dark {
  --warning: oklch(0.41 0.11 46);
  --warning-foreground: oklch(0.99 0.02 95);
}
@theme inline {
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
}
```
حالا `bg-warning` / `text-warning-foreground` قابل استفاده‌ست.

## فیلدهای کلیدی `components.json` (نه توکن رنگ، ولی هر پروژه lookup لازمش داره)

| فیلد | معنی |
|---|---|
| `base` | `"radix"` یا `"base"` — primitive library. بعد از init ثابت. |
| `style` | مثل `"nova"`, `"vega"` — visual treatment. بعد از init ثابت. |
| `tailwind.cssVariables` | `true`=semantic tokens (پیش‌فرض)، `false`=inline utility رنگ خام. بعد از init ثابت. |
| `iconLibrary` | تعیین می‌کنه از کدوم پکیج icon import بشه (`lucide-react`, `@tabler/icons-react`, …) — هیچ‌وقت `lucide-react` رو فرض نکن، از این فیلد بخون. |
| `rtl` | `true`/`false` — روشن کردن RTL auto-transform در CLI (جزئیات → `rtl.md`) |
| `registries` | رجیستری‌های اضافه شده با namespace `@name` |
| `aliases.*` | مسیر import برای `components`/`ui`/`lib`/`hooks`/`utils` |

مرجع کامل و تازه: `npx shadcn@latest info --json` (بعد از نصب AI skill،
خودکار در ابتدای هر session تزریق می‌شه).
