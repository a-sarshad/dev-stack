# Chakra UI v3 — Progress

## 🔴 `striped` — `--stripe-color` conditional custom-property resolve نمی‌شه

```tsx
// ❌ recipe داخلی Progress.Range: "--stripe-color": { _light: "...", _dark: "..." }
// این مقدار conditional روی یه CSS custom property (نه یه property معمولی) resolve نمی‌شه —
// computed value خالی می‌مونه → backgroundImage که بهش var(--stripe-color) رفرنس می‌ده
// invalid می‌شه → کلاً "none". تأیید شده با computed style: --stripe-size و backgroundSize
// از recipe اومدن (پس context/variant propagation کار می‌کنه)، فقط --stripe-color نه.
<Progress.Root striped>  {/* بی‌اثر — راه‌راه دیده نمی‌شه */}
  <Progress.Track><Progress.Range /></Progress.Track>
</Progress.Root>

// ✅ backgroundImage رو مستقیم با مقدار ثابت بده + override با _dark (نه custom property)
<Progress.Range
  backgroundImage="linear-gradient(45deg, rgba(255,255,255,0.3) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.3) 75%, transparent 75%, transparent)"
  backgroundSize="1rem 1rem"
  _dark={{
    backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.3) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.3) 75%, transparent 75%, transparent)',
  }}
/>
```
> نسخه: `@chakra-ui/react@3.35.0`. `animated` variant هم همین ریسک رو داره چون از همون
> `--stripe-size` استفاده می‌کنه — تست نشده، ولی احتیاط کن.
> سابقه: Vitrina `SignupPreparingView.tsx` (۱۴۰۴).
