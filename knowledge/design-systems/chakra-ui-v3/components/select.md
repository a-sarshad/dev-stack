# Chakra UI v3 — Select (و Menu مشابه)

## 🟢 داخل `Dialog` با `scrollBehavior="inside"` → حتماً Portal کن

```tsx
// Dialog با scrollBehavior="inside" → body اش overflow:auto میشه. اگه Select.Positioner
// inline بمونه، dropdown داخل body clip میشه و کاربر مجبوره body رو اسکرول کنه.

// ✅ Positioner رو Portal کن → content به <body> میره، بالای dialog و clip نمیشه
<Portal>
  <Select.Positioner>
    <Select.Content>…</Select.Content>
  </Select.Positioner>
</Portal>
```
> Dialog خودش Portal شده؛ content چاکرا z-index=`popover` می‌گیره (۱۵۰۱) > dialog (۱۵۰۰)
> → روی dialog، clickable، floating-ui نسبت به trigger position می‌کنه. همین قاعده برای
> `Menu.Positioner` داخل Dialog هم صادقه.
> سابقه: Vitrina `EditAddressDialog` (۱۴۰۴).
