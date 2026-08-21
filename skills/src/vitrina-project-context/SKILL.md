---
name: vitrina-project-context
description: "Use for ALL tasks related to Vitrina project — variables, local styles, feature flags, and project-specific settings. Load automatically for any Vitrina design or development task."
---

<!-- thin loader | updated 2026-06-04 | محتوا در repo پروژه: Vitrina/.claude/context/ -->

# Vitrina — Context Loader

این skill فقط **loader**ـه. محتوای واقعی در repo خود پروژه زندگی می‌کنه
(با repo سفر می‌کنه، هرگز drift نمی‌کنه). دیگه محتوا اینجا embed نمی‌شه.

## مرحله ۱ — تشخیص مسیر repo

```bash
ROOT=$(ls -d /sessions/*/mnt/[Vv]itrina 2>/dev/null | head -1)
[ -z "$ROOT" ] && ROOT="$HOME/Documents/GitHub/Projects/Vitrina"
echo "Vitrina root: $ROOT"
```

## مرحله ۲ — خواندن context

```bash
cat "$ROOT/DESIGN.md"                             # تصمیم‌های بصری — grid، layout، responsive، a11y، motion، icon، لحن
cat "$ROOT/.claude/context/known-bugs.md"         # باگ‌های project-specific
cat "$ROOT/.claude/context/page-templates.md"     # الگوهای صفحه
```

## نکته

قوانین اجباری Vitrina (Figma gate، DoD، RTL، tokens) در **`CLAUDE.md` خود پروژه**
هستن — always-on، خودکار لود. این loader فقط context تفصیلی design-side رو میاره.

`DESIGN.md` در **ریشهٔ** پروژه‌ست (نه `.claude/context/`) — قرارداد رسمی فرمت.
