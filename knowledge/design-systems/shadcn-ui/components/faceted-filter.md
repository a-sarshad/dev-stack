# shadcn/ui — Faceted Filter (table column filter)

Multi-select filter for a **data-table toolbar** — "narrow the view by airline /
status / category". Not a form field (for that see [`combobox.md`](combobox.md)
§`Combobox multiple` — chips inline in the input).

## ✅ الگوی canonical = Popover + Command

هیچ آیتم رجیستری به اسم `faceted-filter` نیست. مرجع، سورس بلاک `tasks` است:
`shadcn-ui/ui` → `.../examples/tasks/components/data-table-faceted-filter.tsx`.
ساختار:

- `Popover` + `PopoverTrigger` روی یک `Button variant="outline" size="sm"
  className="border-dashed"` با آیکون `PlusCircle`
- `PopoverContent` `className="w-[200px] p-0"` شامل `Command`:
  - `CommandInput` جستجو
  - `CommandList` → `CommandEmpty` + `CommandGroup` از `CommandItem`ها
  - هر آیتم: **`<div>` شبه‌چک‌باکس** (مربع bordered که با انتخاب `bg-primary`
    پر می‌شود + آیکون `Check`) — نه `<Checkbox>` واقعی، نه `DropdownMenuCheckboxItem`.
    خودِ `CommandItem` کنترل است؛ div فقط نمایش. `<Checkbox>` واقعی داخل
    `CommandItem` = دو focus target و تداخل کیبورد.
  - `facets?.get(value)` → شمارش هر گزینه با `ms-auto` (اختیاری)
  - وقتی چیزی انتخاب است: `CommandSeparator` + `CommandGroup` با یک
    `CommandItem` «Clear filters» (`className="justify-center text-center"`)
- Trigger وقتی انتخاب دارد: جداکننده + روی `lg-` فقط بَج شمارش، روی `lg+` تا ۲
  لیبل واقعی، بیشتر → «N selected».

```tsx
<CommandItem key={option.value} onSelect={() => toggle(option.value)}>
  <div className={cn(
    "flex size-4 items-center justify-center rounded-[4px] border",
    isSelected
      ? "border-primary bg-primary text-primary-foreground"
      : "border-input [&_svg]:invisible"
  )}>
    <Check className="size-3.5 text-primary-foreground" />
  </div>
  <span>{option.label}</span>
</CommandItem>
```

## 🔴 چرا `DropdownMenu` نه

`DropdownMenu` معنایی `role="menu"` است — برای فهرست **اکشن**. فیلتر چند‌انتخابی
یک listbox/فرم‌کنترل است. `Command` (cmdk) درست `role="listbox"` + `option`
رندر می‌کند. استفاده از `DropdownMenuCheckboxItem` برای فیلتر = بوی a11y و خارج
از الگوی مستند shadcn.

هزینه: `npx shadcn add command` → `cmdk` (~۱۶kB gz) + `command.tsx` + `dialog.tsx`
(دپ `CommandDialog`). **یک‌بار** است — هر فیلتر/جدول بعدی `+۰kB`.

## 🔴 RTL audit بعد از `npx shadcn add command`

پروژه‌های `rtl:false` (پیش‌فرض) auto-transform ندارند. در فایل تازه:
- `command.tsx`: `pl-2!` → `ps-2!` (addon جستجو)؛ `ml-auto` → `ms-auto` (آیکون
  Check و `CommandShortcut`).
- `dialog.tsx`: دکمهٔ بستن `right-2` → `end-2`. (`left-1/2 -translate-x-1/2`
  وسط‌چین است، جهت‌مستقل — دست نزن.)
- `textarea.tsx` که registry `command` می‌آورد اگر بلااستفاده است حذف کن.

## 🔴 جداکنندهٔ trigger روی Base UI

اگر `Separator` پروژه `data-vertical:self-stretch` دارد (نسخهٔ Base UI shadcn
دارد)، یک خط عمودی با ارتفاع ثابت (`h-4`) به‌جای وسط به **flex-start** می‌چسبد —
چون `align-self: stretch` وقتی سایز cross ثابت است به flex-start سقوط می‌کند.
canonical از `<Separator>` استفاده می‌کند (Radix، بدون این کلاس). روی Base UI
جایگزین کن با `<span aria-hidden className="bg-border mx-2 h-4 w-px shrink-0 self-center" />`.

## توصیه‌ها

- **جستجو شرطی:** برای لیست کوتاه (≤~۱۰) `CommandInput` نویز است. یک prop
  `searchThreshold` بگذار، فقط وقتی `options.length > threshold` رندر کن.
- **کامپوننت مشترک:** یک‌بار بساز (`components/common/faceted-filter.tsx`)،
  props عمومی `{title, options, selected, onSelectedChange, searchThreshold?}`،
  همهٔ جدول‌ها همان را import کنند. قانون در `CLAUDE.md` پروژه.

**تجربهٔ واقعی:** kish-airport، ۱۴۰۵/۰۶/۰۸ — فیلتر airline/status/aircraft صفحهٔ
Flights. نسخهٔ اولیه روی `DropdownMenu` بود، به canonical مهاجرت کرد.
