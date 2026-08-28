# shadcn/ui — Dropdown Menu

## 🔴 `onSelect` زیر Base UI بی‌صدا از کار می‌افته — نه warning، نه error

**شامل هر چیزی که از `Menu.Item` مشتق می‌شه:** `DropdownMenuItem`,
`ContextMenuItem`, `MenubarItem`.

`Menu.Item` تو **Radix** یه prop اختصاصی `onSelect` داشت (رویداد فعال‌سازی
آیتم). `Menu.Item` تو **Base UI** اصلاً همچین propای نداره — بجاش `onClick`
+ `closeOnClick` داره.

**چرا build نمی‌گیردش:** React's own `DOMAttributes` یه `onSelect` عمومی
*دیگه* هم داره (رویداد انتخاب متن داخل المنت، کاملاً بی‌ربط) که روی تقریباً
همه‌ی HTML propها اعمال می‌شه. پس `onSelect={...}` روی
`MenuPrimitive.Item.Props` **type-check می‌شه** (به اون onSelect عمومی
resolve می‌کنه) ولی Base UI هیچ‌وقت صداش نمی‌زنه.

```tsx
// ❌ type-check سبز، ولی هیچ‌وقت اجرا نمی‌شه
<DropdownMenuItem onSelect={() => setTheme(v)}>

// ✅
<DropdownMenuItem onClick={() => setTheme(v)}>
```

**تجربه‌ی واقعی** (۲۰۲۶-۰۸-۲۶، Sample Dashboard): تم تاریک/روشن کاملاً از کار
افتاده بود بعد از migration. `pnpm build` سبز بود و گزارش migration هم "clean"
ثبت شده بود. کاربر گزارش داد «dark mode کار نمی‌کنه». این rename در
`.claude/skills/migrate-radix-to-base/menus.md:83` از قبل مستند بود ولی sweep
ردش کرد — چون sweep فقط چیزی رو دوباره چک می‌کرد که `pnpm build` قرمز کرده.

**فیکس بعد از هر migration:**
```bash
grep -rn "onSelect=" src --include=*.tsx | grep -v "/ui/"
```

## ⚠️ `closeOnClick` روی Checkbox/Radio item پیش‌فرضش عوض شده

Radix بعد از انتخاب `CheckboxItem`/`RadioItem` منو رو **خودکار می‌بست**.
Base UI روی این دوتا `closeOnClick` رو پیش‌فرض `false` گذاشته.

`DropdownMenuItem` ساده هنوز خودش می‌بنده — فقط checkbox/radio فرق دارن.
اگه بعد از migration اضافه‌شون کردی، صریح `closeOnClick` بده.

## `asChild` → `render`

```tsx
// ❌ Radix
<DropdownMenuTrigger asChild><Button/></DropdownMenuTrigger>

// ✅ Base UI — children آیکون/لیبل از داخل trigger بیرون میان
<DropdownMenuTrigger render={<Button />}>…</DropdownMenuTrigger>
```
