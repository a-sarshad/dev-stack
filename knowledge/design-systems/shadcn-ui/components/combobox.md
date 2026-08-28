# shadcn/ui — Combobox

## ✅ multi-select با chip = `Combobox multiple` — کامپوننت جدا لازم نیست

رجیستری `@shadcn` هیچ آیتمی به اسم **`multi-select`** نداره (چک شد با
`search_items_in_registries` + `npx shadcn search`). ولی این **یعنی خودت
از صفر بسازی — نه.** جواب درست: `Combobox` با prop `multiple` + خانواده‌ی
`ComboboxChips`.

⚠️ **فقط روی Base UI.** Radix Primitives اصلاً Combobox نداره. حتی روی یه
پروژه‌ی `radix-nova` هم `npx shadcn add combobox` دپندنسی `@base-ui/react`
اضافه می‌کنه و فایل مستقیم `from "@base-ui/react"` ایمپورت می‌کنه — یعنی تب
«Radix UI» تو docs فقط استایل رو مطابق preset عوض می‌کنه، نه اینکه واقعاً
روی Radix primitive ساخته شده باشه. (تأیید: `--dry-run`، ۲۰۲۶-۰۸-۲۶.)

## 🔴 عرض popover با trigger هم‌تراز نمی‌شه — `useComboboxAnchor` لازمه

بدون anchor صریح، `ComboboxContent` عرض خودشو می‌گیره نه عرض فیلد. فیکس:
`useComboboxAnchor()` رو به `ComboboxChips` (بعنوان `ref`) **و**
`ComboboxContent` (بعنوان `anchor`) بده.

```tsx
const anchor = useComboboxAnchor()

<Combobox items={options} multiple value={value} onValueChange={onChange}>
  <ComboboxChips ref={anchor} className="w-full">
    <ComboboxValue>
      {value.map((item) => <ComboboxChip key={item}>{item}</ComboboxChip>)}
    </ComboboxValue>
    <ComboboxChipsInput
      placeholder={value.length === 0 ? placeholder : undefined}
    />
  </ComboboxChips>

  <ComboboxContent anchor={anchor}>
    <ComboboxEmpty>No match.</ComboboxEmpty>
    <ComboboxList>
      {(item) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}
    </ComboboxList>
  </ComboboxContent>
</Combobox>
```

نکات ریز که هر بار از نو کشف می‌شن:
- `placeholder` رو شرطی کن — وگرنه کنار chipها هم می‌مونه.
- `ComboboxList` بچه‌شو به‌شکل **تابع** می‌گیره (render prop)، نه `.map()`.
- chipها رو خودت داخل `ComboboxValue` رندر می‌کنی؛ خودکار نیست.

**تجربه‌ی واقعی:** ۲۰۲۶-۰۸-۲۶، Sample Dashboard — چهار فیلد multi-select
صفحه‌ی Resource Configuration.

## هنوز رجیستری نداره

free-text **tag input** (Enter برای افزودن آیتم دلخواه) — الگوی رایج، ولی
جایی copy-paste نمی‌شه. اگه `allowCustomValue`-مانند خواستی، داکیومنت
پرایمیتیو رو بخون: `node_modules/@base-ui/react/docs/react/components/combobox.md`
