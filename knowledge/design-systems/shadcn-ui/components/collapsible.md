# shadcn/ui — Collapsible

## 🔴 زیر Base UI اسم attribute ـه `data-panel-open` ـه، نه `data-state`

Radix روی Trigger می‌ذاشت `data-state="open"`. Base UI بجاش یه attribute
**حضوری** می‌ذاره: `data-panel-open`.

```tsx
// ❌ بعد از migration به base-*: build سبز، رفتار مرده
className="group-data-[state=open]/collapsible:rotate-90"

// ✅ کلاس رسمی خودشون برای دقیقاً همین usecase (چرخوندن شورون)
className="group-data-panel-open:rotate-90"
```

**چرا خطرناکه:** این فقط یه رشته‌ی `className` ـه، نه یه prop تایپ‌شده —
TypeScript هیچ‌وقت نمی‌گیردش. `shadcn add collapsible --overwrite` هم فقط
فایل `ui/` رو درست می‌کنه، نه کلاس‌هایی که تو کد اپ خودت نوشتی.

**تجربه‌ی واقعی** (۲۰۲۶-۰۸-۲۶، Sample Dashboard): آیکون شورون سایدبار بعد از
migration نمی‌چرخید. تأیید اسم درست attribute از
`node_modules/@base-ui/react/docs/react/components/collapsible.md`.

## ⛔ حدس نزن — هر primitive attribute خودشو داره

`data-panel-open` مخصوص Collapsible ـه. نه `data-open` ـه، نه `data-state`،
و **برای بقیه‌ی primitiveها فرق می‌کنه.**

قانون بعد از هر migration:
```bash
grep -rn "data-\[state=" src --include=*.tsx | grep -v "/ui/"
```
هر match → attribute واقعی رو از داک خودِ primitive بخون:
`node_modules/@base-ui/react/docs/react/components/<name>.md`
