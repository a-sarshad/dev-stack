#!/usr/bin/env python3
"""regions — flags small composite elements that a full-page screenshot lies about.

Why this exists:
    Documented incident (ProductList2, KpiRow/FilterResultBadges): icon+text
    order inside small composite elements (badge, pill, icon+label) was judged
    from a full-page ~1920px composite screenshot and read backwards three
    times in a row — the element was too small on screen to see icon-vs-text
    order by eye, but looked "fine" at a glance. The fix isn't a smarter eye,
    it's a rule: any element under ~50px on a side that mixes an icon and text
    gets its own zoomed screenshot instead of being judged from the composite.
    This script applies that rule to a DOM rect dump so it's not re-judged by
    eye each time either.

Input: JSON array of DOM elements, e.g. from a snippet run in the browser
       preview via javascript_tool (see README.md for the exact snippet):

    [
      {"name": "kpi-badge-1", "width": 42, "height": 20,
       "hasIcon": true, "hasText": true, "box": [100, 200, 400, 260]},
      ...
    ]

Output: the subset that needs an individual get_screenshot(node, maxDimension=…)
        instead of being read off the composite.

Usage:
    regions.py elements.json
    cat elements.json | regions.py -
"""
import json
import sys

SIZE_THRESHOLD_PX = 50


def flag_risky(elements, size_threshold=SIZE_THRESHOLD_PX):
    risky = []
    for el in elements:
        composite = bool(el.get("hasIcon")) and bool(el.get("hasText"))
        w, h = el.get("width", 9999), el.get("height", 9999)
        small = min(w, h) < size_threshold
        if composite and small:
            risky.append(el)
    return risky


def main():
    if len(sys.argv) != 2:
        print(__doc__.strip().splitlines()[-3])  # usage line
        sys.exit(2)
    src = sys.stdin.read() if sys.argv[1] == "-" else open(sys.argv[1], encoding="utf-8").read()
    try:
        elements = json.loads(src)
    except json.JSONDecodeError as e:
        print(f"regions: bad JSON — {e}", file=sys.stderr)
        sys.exit(2)

    risky = flag_risky(elements)
    if not risky:
        print("✅ no small icon+text composites found — composite screenshot is enough.")
        return 0

    print(f"⚠️  {len(risky)}/{len(elements)} element(s) too small to judge from a composite "
          f"screenshot — get an individual get_screenshot for each:\n")
    for el in risky:
        name = el.get("name", "?")
        print(f"  - {name}  ({el.get('width')}×{el.get('height')}px)")
    return 1


if __name__ == "__main__":
    sys.exit(main())
