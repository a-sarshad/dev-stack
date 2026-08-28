# Chakra UI v3 — RadioGroup / RadioCard

## 🔴 `value={x ?? undefined}` نمی‌تونه انتخاب رو پاک کنه

```tsx
// ❌ zag-js RadioGroupProps.value نوعش `string | null | undefined`ه، ولی undefined یعنی
// «uncontrolled» — یه بار که machine مقدار گرفت، پاس دادن undefined بعدی نادیده گرفته
// می‌شه و انتخاب قبلی (internal state) دست‌نخورده می‌مونه، حتی وقتی state بیرونی null شده.
<RadioCard.Root value={selectedId ?? undefined} onValueChange={...}>

// ✅ null رو صریح پاس بده — این controlled می‌مونه و واقعاً پاک می‌کنه
<RadioCard.Root value={selectedId} onValueChange={...}>  // selectedId: string | null
```
> علامتِ باگ: یه دکمهٔ «حذف انتخاب» بیرونی `state=null` می‌کنه ولی کارت هنوز visually
> checked می‌مونه؛ یا سوییچ‌کردن بین دو گروه radio مرتبط (mutually exclusive) که یکی باید
> دیگری رو پاک کنه، پاک نمی‌شه. هم‌خانوادهٔ باگِ `Combobox controlled inputValue`
> (`combobox.md`) — الگوی کلی: مقدار «خالی» رو با `null`/مقدارِ معنادار پاس بده، نه `undefined`.
> سابقه: Vitrina `DiscountSelectPanel.tsx` (۱۴۰۴) — «حذف تخفیف» لیست رو دیزلکت نمی‌کرد.

## 🟡 border روی `Item` (label)، نه `ItemControl`

```tsx
// recipe رادیو-کارت border + box-shadow ring رو روی RadioCard.Item (همون <label>)
// می‌ذاره. اگه border خودت رو روی ItemControl هم بذاری → دو border نمایش داده میشه
// (Item recipe + ItemControl تو).

// ❌ double-border
<RadioCard.Item value={v}>
  <RadioCard.ItemControl borderWidth="1px" borderColor="border.muted">…

// ✅ استایل کارت روی Item، ItemControl فقط layout
<RadioCard.Item value={v}
  borderWidth="1px" borderColor="border.muted" boxShadow="none"
  _hover={{ borderColor: 'brand.border' }} _checked={{ borderColor: 'brand.solid' }}>
  <RadioCard.ItemHiddenInput />
  <RadioCard.ItemControl border="none" p="0" boxShadow="none">…
```
> `boxShadow="none"` لازمه: حالت checked یه ring (`0 0 0 1px`) جدا از border می‌ذاره = خط دوم.
> سابقه: Vitrina Sender-Card (۱۴۰۴) — verify با computed style: Item border، ItemControl border=0.
