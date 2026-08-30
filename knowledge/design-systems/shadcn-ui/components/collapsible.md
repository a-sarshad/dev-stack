# shadcn/ui — Collapsible

## 🔴 زیر Base UI اسم attributeها با Radix فرق دارد

Radix: روی Trigger `data-state="open"` + روی Content `--radix-collapsible-content-height`.

Base UI (`@base-ui/react/collapsible`) — تأیید‌شده از سورس
`node_modules/@base-ui/react/collapsible/*/`:

| المان | attribute حضوری | مقدار |
|---|---|---|
| `Collapsible.Root` | `data-open` / `data-closed` | یکی حاضر است |
| `Collapsible.Trigger` | `data-panel-open` | فقط وقتی باز |
| `Collapsible.Panel` | `data-open` / `data-closed` + `data-starting-style` / `data-ending-style` | حین ترنزیشن |
| `Collapsible.Panel` (CSS var) | `--collapsible-panel-height` / `--collapsible-panel-width` | `<N>px` حین انیمیشن، `auto` در حالت idle |

```tsx
// ❌ بعد از migration به base-*: build سبز، رفتار مرده
className="group-data-[state=open]/collapsible:rotate-90"

// ✅ گزینه A — group روی Trigger باشد → از data-panel-open استفاده کن
className="group-data-[panel-open]/collapsible:rotate-90"

// ✅ گزینه B — group روی Root باشد (الگوی sidebar-07) → Root فقط data-open/data-closed دارد،
//    data-panel-open ندارد. باید data-closed را هدف بگیری:
//    <Collapsible className="group/collapsible">  (Root)
className="ltr:group-data-[closed]/collapsible:-rotate-90 rtl:group-data-[closed]/collapsible:rotate-90"
```

**نکته‌ی حیاتی:** اگر `group/collapsible` روی **Root** باشد (چون `render={<SidebarMenuItem/>}`
یا wrapper است) ولی کلاس چرخش `group-data-[panel-open]` بنویسی → **هیچ‌وقت match نمی‌شود**
(چون `data-panel-open` روی Trigger است نه Root). این خطای خاموشِ رایج است.

## 🔴 انیمیشن ارتفاع: `animate-collapsible-*` از tw-animate-css با Base UI کار نمی‌کند

`tw-animate-css` کی‌فریم‌های `collapsible-down/up` را با
`var(--radix-collapsible-content-height, var(--bits-…, auto))` تعریف می‌کند —
Base UI هیچ‌کدام از این‌ها را ست نمی‌کند، فقط `--collapsible-panel-height`.
نتیجه: fallback به `auto` → انیمیشن نمی‌شود.

راه درست (transition، نه keyframe) — داخل `CollapsibleContent` در `ui/collapsible.tsx`:

```tsx
className={cn(
  "h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out",
  "data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none",
  className,
)}
```

Base UI موقع بستن، قبل از `data-ending-style` سایز پیکسلیِ اندازه‌گیری‌شده را در
`--collapsible-panel-height` می‌گذارد، پس ترنزیشن `Npx → 0` سالم اجرا می‌شود.
موقع باز شدن هم از `data-starting-style` (h-0) به `var(px)` می‌رود و بعد به `auto`
برمی‌گردد (بدون پرش، چون هم‌اندازه است).

**منبع تأیید:** `node_modules/@base-ui/react/collapsible/panel/CollapsiblePanel.js:96-99`
(ست‌کردن CSS var)، `useCollapsiblePanel.js:184-193` (capture سایز قبل از فاز ending).
تجربه‌ی واقعی: kish-airport، ۲۰۲۶-۰۸-۲۹، سایدبار RMS.

## ⛔ حدس نزن — هر primitive attribute خودشو داره

قانون بعد از هر migration:
```bash
grep -rn "data-\[state=" src --include=*.tsx | grep -v "/ui/"
```
هر match → attribute واقعی رو از سورس خودِ primitive بخون:
`node_modules/@base-ui/react/<name>/*/`
