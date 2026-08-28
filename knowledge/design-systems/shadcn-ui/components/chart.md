# shadcn/ui — Chart

## 🔴 `chart-1..5` رنگی نمی‌شن مگر دستی ست کنی

همه‌ی `baseColor`های موجود (`neutral`, `stone`, `zinc`, `mauve`, `olive`,
`mist`, `taupe`) پالت `chart-1..5` رو **achromatic** (chroma≈۰، طیف خاکستری)
تولید می‌کنن — حتی وقتی spec/طرح صریحاً یه پالت رنگی می‌خواد. **هیچ preset
پیش‌فرضی خودش چارت رنگی نمی‌سازه.**

**تجربه‌ی واقعی** (۲۰۲۶-۰۸-۲۵، پروژه Sample Dashboard): بعد از `init` با
`baseColor: neutral`، چارت خط دشبورد خاکستری درومد در حالی که spec دقیقاً
`oklch(...)` آبی (blue-300 → blue-800) خواسته بود.

**فیکس:** مقادیر `--chart-1` .. `--chart-5` رو دستی در `:root` و `.dark`
جایگزین کن. الگوی override توکن → `../tokens.md` §«اضافه کردن یه token جدید».

**چک‌لیست:** هر پروژه‌ای که چارت داره، این رو **قبل از** implement ببین —
نه بعد از اینکه کاربر گفت «چرا خاکستریه».

## SVG دستی نساز

`Chart` یه wrapper رسمی روی Recharts ـه. برای هر نمودار اول اینجا رو بگرد:
رجیستری ~۵۰ بلاک آماده‌ی چارت داره (`chart-area-*`, `chart-bar-*`,
`chart-line-*`, `chart-pie-*`, `chart-radar-*`, `chart-radial-*`,
`chart-tooltip-*`).

```bash
npx shadcn@latest search -q chart -t block
```
