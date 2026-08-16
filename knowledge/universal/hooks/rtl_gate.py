#!/usr/bin/env python3
"""RTL gate — روی Stop اجرا می‌شود و نمی‌گذارد یک turn با error چیدمانی بسته شود.

چرا این وجود دارد:
    باگ «flex-end در RTL یعنی چپ» سه بار ship شد (CampaignCard و NewCampaignDialog
    در 1404/05/12، DiscountCodesTable/Card در 1404/05/17). هر سه بار درس در یک
    کامنت یا در `_note` یک فایل JSON نوشته شد، و هر سه بار نویسندهٔ بعدی آن را
    نخواند. لایهٔ گمشده «چکِ دقیق‌تر» نبود — چک از قبل وجود داشت. لایهٔ گمشده
    «چکی که بدون تصمیمِ کسی اجرا شود» بود.

    پس این hook عمداً کمترین کار را می‌کند: فقط ماژول‌های سریع و قطعی را روی
    فایل‌های git-changed اجرا می‌کند و اگر error داشت جلوی بستن turn را می‌گیرد.

طراحی:
    - فقط error ها block می‌کنند. warning ها گزارش می‌شوند ولی متوقف نمی‌کنند،
      وگرنه ۸۱ warning موجود هر turn را قفل می‌کرد.
    - ماژول‌های build/git اجرا نمی‌شوند (پنج دقیقه طول می‌کشند و «uncommitted
      files» را error می‌دانند — یعنی هر turn قفل می‌شد).
    - `stop_hook_active` → exit 0. بدون این، یک error غیرقابل‌فیکس بی‌نهایت loop می‌زد.
    - هر خطای خودِ ابزار (نبودن dev-engine، JSON خراب) → exit 0 با پیام روی stderr.
      گِیتی که خودش بشکند نباید کار را قفل کند؛ ولی باید *صدا* بدهد، نه سکوت —
      همان اشتباهی که در Bug Summary ریشهٔ ۲ بود.
"""
import json
import subprocess
import sys

# این گیت فقط مقادیر **فیزیکیِ** چیدمان را می‌گیرد — نمی‌گوید `start` درست است یا
# `end`. آن را فقط مقایسهٔ preview با طرح می‌گیرد (CLAUDE.md § «تطابق با طرح فیگما»).
MODULES = "css-logical-props,dom-order,icon-direction"


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        payload = {}

    # جلوگیری از loop بی‌نهایت وقتی error قابل‌فیکس نیست
    if payload.get("stop_hook_active"):
        return 0

    cwd = payload.get("cwd") or "."

    try:
        proc = subprocess.run(
            ["dev-engine", ".", "--changed", "--module", MODULES,
             "--report-only", "--json", "--exit-zero"],
            cwd=cwd, capture_output=True, text=True, timeout=120,
        )
    except FileNotFoundError:
        print("⚠️  rtl_gate: dev-engine در PATH نیست — چک چیدمان اجرا نشد.\n"
              "   fix: cd ~/Documents/GitHub/dev-stack/packages/dev-engine "
              "&& npm run build && npm link", file=sys.stderr)
        return 0
    except subprocess.TimeoutExpired:
        print("⚠️  rtl_gate: dev-engine timeout — چک چیدمان اجرا نشد.", file=sys.stderr)
        return 0

    out = proc.stdout
    start = out.find("[")
    if start == -1:
        print("⚠️  rtl_gate: خروجی JSON پیدا نشد — چک چیدمان اجرا نشد.", file=sys.stderr)
        return 0

    try:
        results = json.loads(out[start:])
    except json.JSONDecodeError as e:
        print(f"⚠️  rtl_gate: JSON خراب ({e}) — چک چیدمان اجرا نشد.", file=sys.stderr)
        return 0

    errors = [
        (r["file"], v)
        for r in results
        for v in r.get("violations", [])
        if v.get("severity") == "error"
    ]
    if not errors:
        return 0

    lines = [f"❌ rtl_gate: {len(errors)} خطای چیدمان — turn بسته نمی‌شود تا فیکس شوند.\n"]
    for path, v in errors[:20]:
        lines.append(f"  {path}:{v.get('line')}  [{v.get('rule')}] {v.get('message')}")
        if v.get("autoFixable"):
            lines.append("      → auto-fix دارد: dev-engine . --changed --fix")
        elif v.get("fix"):
            lines.append(f"      → {v['fix']}")
    if len(errors) > 20:
        lines.append(f"  … و {len(errors) - 20} مورد دیگر")
    lines.append("\nمرجع قواعد: بخش «RTL — مرجع واحد» در CLAUDE.md")

    print("\n".join(lines), file=sys.stderr)
    return 2


if __name__ == "__main__":
    sys.exit(main())
