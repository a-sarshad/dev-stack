#!/usr/bin/env python3
"""vision-diff — deterministic crop + pixel-diff for design-vs-preview comparison.

Why this exists:
    The only reliable check for RTL/layout comprehension bugs is comparing a
    design screenshot against the rendered preview (see any project's CLAUDE.md
    § "Preview vs design comparison"). That workflow already downloads exactly
    two raw images (design frame + preview page) and crops them locally with
    PIL one-liners typed fresh each time. This script is that one-liner,
    written once: crop, align, diff, and a plain pass/fail — no LLM call.
    A vision model (optional, separate layer) is only worth invoking on crops
    this script already flags as different; most crops match and cost nothing.

    This is deterministic pixel comparison, not layout understanding — it
    cannot tell you `start` vs `end` is correct, only that two crops you
    already believe correspond to the same element look different. Deciding
    *which* crops to compare (design box vs preview box) is still on you.

No dependencies beyond Pillow (`pip install pillow` if not already present).

Usage:
    # single region
    vision_diff.py diff --design design.png --design-box 100,200,400,260 \\
                         --preview preview.png --preview-box 50,80,350,140 \\
                         --out-dir ./out/badge

    # many named regions in one pass (typical real usage)
    vision_diff.py batch --design design.png --preview preview.png \\
                          --regions regions.json --out-dir ./out

    # just crop, no diff (replaces the ad-hoc "python3 -c ... PIL ... crop" step)
    vision_diff.py crop design.png --box 100,200,400,260 --out crop.png

regions.json format (see batch):
    [
      {"name": "kpi-badge", "design_box": [100,200,400,260], "preview_box": [50,80,350,140]},
      {"name": "filter-chip", "design_box": [...], "preview_box": [...]}
    ]

Exit codes: 0 = all regions match within threshold · 1 = at least one region
differs (needs a human/vision-model look) · 2 = usage or file error.
"""
import argparse
import json
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageColor, ImageDraw, ImageOps

DEFAULT_PIXEL_THRESHOLD = 30  # 0-255, per-channel; below this a pixel counts as "same"
DEFAULT_FAIL_PERCENT = 2.0    # % of pixels allowed to differ before flagging the crop
LABEL_H = 18


def parse_box(s):
    parts = [int(p.strip()) for p in s.split(",")]
    if len(parts) != 4:
        raise argparse.ArgumentTypeError(f"box must be 'L,T,R,B', got: {s}")
    return tuple(parts)


def crop_box(image_path, box, out_path=None):
    im = Image.open(image_path).convert("RGB")
    l, t, r, b = box
    l, t = max(0, l), max(0, t)
    r, b = min(im.width, r), min(im.height, b)
    if r <= l or b <= t:
        raise ValueError(
            f"empty crop after clamping to image bounds ({im.width}x{im.height}): {box}"
        )
    cropped = im.crop((l, t, r, b))
    if out_path:
        cropped.save(out_path)
    return cropped


def _worst_channel(diff_rgb):
    """Per-pixel max(|ΔR|,|ΔG|,|ΔB|) as a single grayscale image — pure Pillow,
    no numpy: a color-only shift (icon recolored, wrong token) must not get
    diluted the way averaging channels would dilute it."""
    r, g, b = diff_rgb.split()
    return ImageChops.lighter(ImageChops.lighter(r, g), b)


def _label(img_w, text):
    strip = Image.new("RGB", (img_w, LABEL_H), "white")
    d = ImageDraw.Draw(strip)
    d.text((4, 3), text, fill="black")
    return strip


def diff_crops(design_crop, preview_crop, out_dir, name="region",
                pixel_threshold=DEFAULT_PIXEL_THRESHOLD, fail_percent=DEFAULT_FAIL_PERCENT):
    """Compare two already-cropped PIL images. Preview is resized onto the
    design crop's pixel grid — this checks content/color/order match, not DPI."""
    design = design_crop.convert("RGB")
    preview = preview_crop.convert("RGB")
    if preview.size != design.size:
        preview = preview.resize(design.size, Image.LANCZOS)

    diff = ImageChops.difference(design, preview)
    worst = _worst_channel(diff)
    mask = worst.point(lambda p: 255 if p > pixel_threshold else 0)

    total = mask.width * mask.height
    changed = sum(1 for p in mask.getdata() if p) if total else 0
    percent = (changed / total * 100) if total else 0.0
    passed = percent <= fail_percent

    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    heatmap = ImageOps.colorize(ImageOps.autocontrast(worst) if worst.getextrema() != (0, 0) else worst,
                                 black=ImageColor.getrgb("black"), white=ImageColor.getrgb("red"))

    w = design.width
    composite = Image.new("RGB", (w, (design.height + LABEL_H) * 3), "white")
    y = 0
    for label, im in (("design", design), ("preview (resized)", preview), ("diff (red=changed)", heatmap)):
        composite.paste(_label(w, label), (0, y))
        composite.paste(im, (0, y + LABEL_H))
        y += design.height + LABEL_H

    composite_path = out_dir / f"{name}.compare.png"
    composite.save(composite_path)

    result = {
        "name": name,
        "size": list(design.size),
        "changed_pixels": changed,
        "total_pixels": total,
        "percent_changed": round(percent, 2),
        "pixel_threshold": pixel_threshold,
        "fail_percent": fail_percent,
        "pass": passed,
        "composite": str(composite_path),
    }
    (out_dir / f"{name}.json").write_text(json.dumps(result, ensure_ascii=False, indent=2))
    return result


def cmd_crop(args):
    out = args.out or (Path(args.image).stem + ".crop.png")
    crop_box(args.image, args.box, out)
    print(out)
    return 0


def cmd_diff(args):
    design_crop = crop_box(args.design, args.design_box)
    preview_crop = crop_box(args.preview, args.preview_box)
    result = diff_crops(design_crop, preview_crop, args.out_dir,
                         name=args.name, pixel_threshold=args.pixel_threshold,
                         fail_percent=args.fail_percent)
    _print_report([result], args.json)
    return 0 if result["pass"] else 1


def cmd_batch(args):
    regions = json.loads(Path(args.regions).read_text())
    results = []
    for region in regions:
        name = region["name"]
        try:
            design_crop = crop_box(args.design, tuple(region["design_box"]))
            preview_crop = crop_box(args.preview, tuple(region["preview_box"]))
            results.append(diff_crops(design_crop, preview_crop, args.out_dir, name=name,
                                       pixel_threshold=args.pixel_threshold,
                                       fail_percent=args.fail_percent))
        except Exception as e:  # noqa: BLE001 — one bad region must not abort the batch
            results.append({"name": name, "error": str(e), "pass": False})
    _print_report(results, args.json)
    return 0 if all(r.get("pass") for r in results) else 1


def _print_report(results, as_json):
    if as_json:
        print(json.dumps(results, ensure_ascii=False, indent=2))
        return
    failed = [r for r in results if not r.get("pass")]
    for r in results:
        if r.get("error"):
            print(f"⚠️  {r['name']}: {r['error']}")
        else:
            mark = "✅" if r["pass"] else "❌"
            print(f"{mark} {r['name']}: {r['percent_changed']}% changed "
                  f"(threshold {r['fail_percent']}%) → {r['composite']}")
    if failed:
        print(f"\n{len(failed)}/{len(results)} region(s) differ — open the .compare.png "
              f"files, or hand them to a vision model for a second opinion.")


def main():
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = p.add_subparsers(dest="cmd", required=True)

    c = sub.add_parser("crop", help="crop one region from one image")
    c.add_argument("image")
    c.add_argument("--box", type=parse_box, required=True, help="L,T,R,B in source-image pixels")
    c.add_argument("--out")
    c.set_defaults(func=cmd_crop)

    d = sub.add_parser("diff", help="crop + diff one region from two images")
    d.add_argument("--design", required=True)
    d.add_argument("--design-box", type=parse_box, required=True)
    d.add_argument("--preview", required=True)
    d.add_argument("--preview-box", type=parse_box, required=True)
    d.add_argument("--out-dir", required=True)
    d.add_argument("--name", default="region")
    d.add_argument("--pixel-threshold", type=int, default=DEFAULT_PIXEL_THRESHOLD)
    d.add_argument("--fail-percent", type=float, default=DEFAULT_FAIL_PERCENT)
    d.add_argument("--json", action="store_true")
    d.set_defaults(func=cmd_diff)

    b = sub.add_parser("batch", help="crop + diff many named regions in one pass")
    b.add_argument("--design", required=True)
    b.add_argument("--preview", required=True)
    b.add_argument("--regions", required=True, help="path to regions.json (see module docstring)")
    b.add_argument("--out-dir", required=True)
    b.add_argument("--pixel-threshold", type=int, default=DEFAULT_PIXEL_THRESHOLD)
    b.add_argument("--fail-percent", type=float, default=DEFAULT_FAIL_PERCENT)
    b.add_argument("--json", action="store_true")
    b.set_defaults(func=cmd_batch)

    args = p.parse_args()
    try:
        sys.exit(args.func(args))
    except (FileNotFoundError, ValueError, json.JSONDecodeError, KeyError) as e:
        print(f"vision-diff: {e}", file=sys.stderr)
        sys.exit(2)


if __name__ == "__main__":
    main()
