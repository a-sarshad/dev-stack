# Chakra UI v3 — Token Reference
> updated: 2026-05-28

---

## Semantic Tokens — Background

| Token | Light | Dark |
|-------|-------|------|
| `bg` | white | black |
| `bg.subtle` | gray.50 | gray.950 |
| `bg.muted` | gray.100 | gray.900 |
| `bg.emphasized` | gray.200 | gray.800 |
| `bg.inverted` | black | white |
| `bg.panel` | white | gray.950 |
| `bg.error` | red.50 | red.950 |
| `bg.warning` | orange.50 | orange.950 |
| `bg.success` | green.50 | green.950 |
| `bg.info` | blue.50 | blue.950 |

## Semantic Tokens — Foreground

| Token | Light | Dark |
|-------|-------|------|
| `fg` | black | gray.50 |
| `fg.muted` | gray.600 | gray.400 |
| `fg.subtle` | gray.400 | gray.500 |
| `fg.inverted` | gray.50 | black |
| `fg.error` | red.500 | red.400 |
| `fg.warning` | orange.600 | orange.300 |
| `fg.success` | green.600 | green.300 |
| `fg.info` | blue.600 | blue.300 |

## Semantic Tokens — Border

| Token | Light | Dark |
|-------|-------|------|
| `border` | gray.200 | gray.800 |
| `border.muted` | gray.100 | gray.900 |
| `border.subtle` | gray.50 | gray.950 |
| `border.emphasized` | gray.300 | gray.700 |
| `border.inverted` | gray.800 | gray.200 |
| `border.error` | red.500 | red.400 |
| `border.warning` | orange.500 | orange.400 |
| `border.success` | green.500 | green.400 |
| `border.info` | blue.500 | blue.400 |

## Per-Color Tokens

Pattern: `{color}.{variant}` برای: `gray | red | orange | yellow | green | teal | blue | cyan | purple | pink`

| Variant | کاربرد |
|---------|--------|
| `.solid` | background اصلی |
| `.fg` | متن رنگی |
| `.subtle` | background خیلی روشن |
| `.muted` | background روشن |
| `.emphasized` | background متوسط |
| `.contrast` | متن روی solid bg |
| `.focusRing` | focus ring |
| `.border` | border رنگی |

---

## Spacing Scale

| Token | px |
|-------|----|
| 0.5 | 2 |
| 1 | 4 |
| 1.5 | 6 |
| 2 | 8 |
| 2.5 | 10 |
| 3 | 12 |
| 4 | 16 |
| 5 | 20 |
| 6 | 24 |
| 7 | 28 |
| 8 | 32 |
| 10 | 40 |
| 12 | 48 |
| 14 | 56 |
| 16 | 64 |

---

## Typography

### Font Size
```
2xs(10) | xs(12) | sm(14) | md(16) | lg(18) | xl(20) | 2xl(24)
3xl(30) | 4xl(36) | 5xl(48) | 6xl(60) | 7xl(72)
```

### Font Weight
```
thin(100) | light(300) | normal(400) | medium(500)
semibold(600) | bold(700) | extrabold(800)
```

### Line Height — ⚠️ numeric tokens broken
```tsx
// ❌ numeric tokens broken (unitless CSS)
lineHeight="8"

// ✅ ratio strings
lineHeight="1.333"  // برای 2xl
lineHeight="1.14"   // برای 3xl
lineHeight="normal" // 1.5
lineHeight="tight"  // 1.25
```

---

## Border Radius

```
none | sm(2px) | md(4px) | lg(6px) | xl(8px) | 2xl(12px) | 3xl(16px) | full(9999px)
```

## Shadows
```
xs | sm | md | lg | xl | 2xl | inner | none
```

## Breakpoints
```
sm(480px) | md(768px) | lg(992px) | xl(1280px) | 2xl(1536px)
```

---

## Custom Brand Tokens (pattern برای هر پروژه)

```ts
// src/theme/tokens.ts
export const projectTokens = defineConfig({
  theme: {
    tokens: {
      fonts: {
        body: { value: 'Vazirmatn, sans-serif' },
        heading: { value: 'Vazirmatn, sans-serif' },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid:      { value: { base: '{colors.teal.600}', _dark: '{colors.teal.600}' } },
          contrast:   { value: { base: 'white',             _dark: 'white'             } },
          fg:         { value: { base: '{colors.teal.700}', _dark: '{colors.teal.300}' } },
          subtle:     { value: { base: '{colors.teal.100}', _dark: '{colors.teal.900}' } },
          muted:      { value: { base: '{colors.teal.200}', _dark: '{colors.teal.800}' } },
          emphasized: { value: { base: '{colors.teal.300}', _dark: '{colors.teal.700}' } },
          focusRing:  { value: { base: '{colors.teal.500}', _dark: '{colors.teal.500}' } },
          border:     { value: { base: '{colors.teal.500}', _dark: '{colors.teal.400}' } },
          bg:         { value: { base: '{colors.teal.50}',  _dark: '{colors.teal.950}' } },
        },
        surface: {
          card:   { value: { base: 'white',                  _dark: '{colors.gray.900}' } },
          subtle: { value: { base: '{colors.gray.50}',       _dark: '{colors.gray.900}' } },
          muted:  { value: { base: '{colors.gray.100}',      _dark: '{colors.gray.800}' } },
        },
      },
    },
  },
})
```
