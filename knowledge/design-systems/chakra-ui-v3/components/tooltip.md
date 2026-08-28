# Chakra UI v3 — Tooltip

## 🟢 namespace API — شکل درست

```tsx
<Tooltip.Root>
  <Tooltip.Trigger asChild>
    <Button>hover me</Button>
  </Tooltip.Trigger>
  <Tooltip.Content>متن tooltip</Tooltip.Content>
</Tooltip.Root>
```

## RTL

```tsx
<Tooltip.Positioner dir="rtl">
```
الگوی کلی Portal+RTL (Menu/Drawer/Tooltip) → `../known-bugs.md` §Patterns.
