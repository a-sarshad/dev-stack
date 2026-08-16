#!/usr/bin/env bash
# skills/src/<name>/ → skills/dist/<name>.skill
#
# سورس skillها متن ساده است (skills/src) تا diff و review معنی داشته باشد؛
# فایل .skill فقط خروجی build است و در گیت نگه داشته نمی‌شود.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$ROOT/skills/src"
DIST="$ROOT/skills/dist"

[ -d "$SRC" ] || { echo "✗ skills/src پیدا نشد" >&2; exit 1; }
command -v zip >/dev/null || { echo "✗ zip نصب نیست" >&2; exit 1; }

rm -rf "$DIST"
mkdir -p "$DIST"

built=0
for dir in "$SRC"/*/; do
  name="$(basename "$dir")"
  if [ ! -f "$dir/SKILL.md" ]; then
    echo "  ⚠ $name — SKILL.md ندارد، رد شد" >&2
    continue
  fi
  # ساختار داخل آرشیو: <name>/SKILL.md — همان چیزی که نصب‌کنندهٔ Claude انتظار دارد
  ( cd "$SRC" && zip -qr "$DIST/$name.skill" "$name" -x '*.DS_Store' )
  printf '  ✓ %-28s %s\n' "$name" "$(du -h "$DIST/$name.skill" | cut -f1 | tr -d ' ')"
  built=$((built + 1))
done

echo ""
echo "$built skill ساخته شد → skills/dist/"
echo "نصب: در اپ Claude روی هر فایل .skill کلیک کن → Save skill"
