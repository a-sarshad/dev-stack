# shadcn/ui — Breadcrumb

## 🔴 جداکنندهٔ پیش‌فرض RTL-aware نیست

`BreadcrumbSeparator` این‌طوری تعریف شده:
```tsx
<li className="[&>svg]:size-3.5" ...>
  {children ?? <ChevronRightIcon />}
</li>
```
`ChevronRightIcon` هاردکد است و هیچ flip ندارد. زیر RTL شورون هم‌چنان به راست
اشاره می‌کند → خلافِ جهت خواندن. `migrate rtl` هم درستش نمی‌کند (این کلاس
`left-*`/`right-*` نیست، اسم یک آیکون است — تراسنفورم CLI فقط کلاس‌های physical
را می‌گیرد).

**فیکس (روی خودِ `ui/breadcrumb.tsx`):**
```tsx
className={cn("[&>svg]:size-3.5 rtl:[&>svg]:-scale-x-100", className)}
```
`-scale-x-100` آینهٔ افقی می‌کند → chevron-right ⇢ chevron-left. برای شورونِ
عمودی‌متقارن با `rotate-180` هم یکی است؛ `-scale-x-100` نیت را روشن‌تر می‌رساند.

**نکته دربارهٔ variant `rtl`:** حتی وقتی `components.json → rtl: false` است،
preset `base-nova` یک `rtl` variant دارد که به `[dir=rtl]` **و** `:lang(fa)`
(و ~۱۲ زبان RTL دیگر) match می‌شود. یعنی همین یک کلاس هم با `<html dir="rtl">`
و هم با `<html lang="fa">` کار می‌کند. تأییدشده از CSS بیلد:
```
…:lang(fa),…,[dir=rtl],[dir=rtl] *)>svg{--tw-scale-x:calc(100%*-1);scale:…}
```

## breadcrumb داینامیک از nav tree

مسیر (`usePathname`) → trail. اگر گروه‌های nav صفحهٔ landing ندارند، crumbِ
میانی را به `items[0].href` (اولین فرزند) لینک کن، نه به `basePath` که ۴۰۴ می‌دهد.
آخرین crumb = `BreadcrumbPage` (بدون لینک، `aria-current="page"`).

تجربهٔ واقعی: kish-airport، ۲۰۲۶-۰۸-۳۰، breadcrumb داخل topbar به‌جای search.
