---
name: airport-project-context
description: "Use for ALL tasks related to the Kish Airport project — bilingual RTL/LTR, Bootstrap 5, brand tokens, and project-specific settings. Load automatically for any Airport design or development task."
---

<!-- thin loader | updated 2026-06-04 | محتوا در repo پروژه: Airport/.claude/context/ -->

# Kish Airport — Context Loader

این skill فقط **loader**ـه. محتوای واقعی در repo خود پروژه زندگی می‌کنه
(با repo سفر می‌کنه، هرگز drift نمی‌کنه). دیگه محتوا اینجا embed نمی‌شه.

## مرحله ۱ — تشخیص مسیر repo

```bash
ROOT=$(ls -d /sessions/*/mnt/[Aa]irport 2>/dev/null | head -1)
[ -z "$ROOT" ] && ROOT="$HOME/Documents/GitHub/Projects/Airport"
echo "Airport root: $ROOT"
```

## مرحله ۲ — خواندن context

```bash
cat "$ROOT/DESIGN.md"   # stack، brand tokens، RTL/LTR، layout
cat "$ROOT/.claude/context/known-bugs.md"         # باگ‌های project-specific
```

## نکته

قوانین اجباری Airport (Figma gate، DoD، RTL/LTR، Bootstrap setup) در **`CLAUDE.md` خود پروژه**
هستن — always-on، خودکار لود. این loader فقط context تفصیلی design-side رو میاره.

`DESIGN.md` در **ریشهٔ** پروژه‌ست (نه `.claude/context/`) — قرارداد رسمی فرمت.
