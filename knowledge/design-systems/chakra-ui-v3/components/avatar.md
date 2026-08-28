# Chakra UI v3 — Avatar

## 🔴 `Avatar.Root` / کامپوننت‌های ترکیبی — مشکل ref با `asChild`

```tsx
// ❌ ref forward نمی‌کنه برای asChild
<Avatar.Root asChild>
  <button>

// ✅ با Box wrap کن
<Box as="button" type="button">
  <Avatar.Root>
```
