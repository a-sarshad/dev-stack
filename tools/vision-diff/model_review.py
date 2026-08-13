#!/usr/bin/env python3
"""model_review — optional external vision-model second opinion, on top of vision_diff.

Why this exists, and why it is NOT the previous "vision layer" idea revived:
    Deterministic pixel-diff (vision_diff.py) tells you *that* two crops
    differ, not *why* — a resized/anti-aliased match and a genuine
    icon-flipped-sides bug can both show up as "some pixels changed". A vision
    model is good exactly at that remaining judgment call, but bad as a first
    pass — it's slow, costs money/quota, and (per this project's own incident
    history) is no more reliable than Claude's own preview review at *finding*
    a bug it wasn't pointed at. So: pixel-diff decides WHAT to look at,
    the model only ever looks at crops already flagged `pass: false`.

    This never replaces Claude's own browser-based preview-vs-design check
    (CLAUDE.md § preview comparison) — it's an optional, occasional, additive
    second opinion on the small subset of regions that already look different.

Privacy note: this SENDS the flagged crop images to a third-party API
(OpenRouter, or whatever your own model gateway is). Only run this on UI
screenshots you're fine leaving your machine — never on anything containing
real user/customer data.

Setup:
    export OPENROUTER_API_KEY=sk-or-...
    (or pass --api-key, though env var avoids leaking it into shell history)

    A `.env` file next to this script (OPENROUTER_API_KEY=sk-or-...) also
    works and is picked up automatically — gitignored repo-wide (`.env` is
    in dev-agents/.gitignore), never commit it, never store a key in any
    tracked file.

Default model is a free vision-capable one; override with --model or
$VISION_DIFF_MODEL if you want a stronger/paid model (e.g. a Qwen3-VL or
gemini-2.5-flash-lite variant — check https://openrouter.ai/models for
current pricing/availability, it changes).

Usage:
    # single crop pair already flagged by vision_diff.py
    model_review.py review --compare out/badge_bug.compare.png

    # everything vision_diff.py batch flagged pass:false in a directory
    model_review.py batch --dir out/

Exit codes: 0 = ran (regardless of verdict — verdict is in the output/JSON,
this isn't a lint gate) · 2 = usage/auth/network error.
"""
import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

DEFAULT_MODEL = "nvidia/nemotron-nano-12b-v2-vl:free"
API_URL = "https://openrouter.ai/api/v1/chat/completions"


def _load_dotenv():
    """Read KEY=VALUE lines from a .env next to this script, as a fallback —
    never overrides an already-exported env var. No dependency (no
    python-dotenv), a handful of lines is all this needs."""
    env_path = Path(__file__).parent / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key, value = key.strip(), value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)

PROMPT = """You are reviewing two crops of the same UI element for a visual regression check.
Image layout (stacked vertically, top to bottom): "design" (the intended design), \
"preview" (the actual rendered app), "diff" (red = pixels that changed).

Judge only what's visible. Answer with ONLY a JSON object, no other text:
{
  "verdict": "match" | "differs" | "unsure",
  "issue_type": "none" | "direction-or-order" | "color" | "missing-element" | "spacing" | "text" | "other",
  "explanation": "one short sentence"
}

"direction-or-order" means an icon/element appears on the opposite side, or child order is
reversed, versus the design. Only use it if you can actually see that in the images — don't
guess from general RTL knowledge."""


def _api_key(cli_key):
    key = cli_key or os.environ.get("OPENROUTER_API_KEY")
    if not key:
        raise RuntimeError(
            "no API key — export OPENROUTER_API_KEY=sk-or-... or pass --api-key"
        )
    return key


def _b64_image(path):
    data = Path(path).read_bytes()
    return base64.b64encode(data).decode("ascii")


def call_model(image_path, model, api_key, timeout=60):
    payload = {
        "model": model,
        "messages": [{
            "role": "user",
            "content": [
                {"type": "text", "text": PROMPT},
                {"type": "image_url", "image_url": {
                    "url": f"data:image/png;base64,{_b64_image(image_path)}"
                }},
            ],
        }],
    }
    req = urllib.request.Request(
        API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"OpenRouter HTTP {e.code}: {e.read().decode(errors='replace')[:300]}")
    except urllib.error.URLError as e:
        raise RuntimeError(f"network error calling OpenRouter: {e.reason}")

    try:
        text = body["choices"][0]["message"]["content"]
    except (KeyError, IndexError):
        raise RuntimeError(f"unexpected response shape: {json.dumps(body)[:300]}")

    return _extract_json(text, raw_response=body)


def _extract_json(text, raw_response=None):
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end == -1:
        return {"verdict": "unsure", "issue_type": "other",
                 "explanation": text.strip()[:200], "_raw": text}
    try:
        parsed = json.loads(text[start:end + 1])
    except json.JSONDecodeError:
        return {"verdict": "unsure", "issue_type": "other",
                 "explanation": text.strip()[:200], "_raw": text}
    parsed.setdefault("verdict", "unsure")
    parsed.setdefault("issue_type", "other")
    parsed.setdefault("explanation", "")
    return parsed


def cmd_review(args):
    key = _api_key(args.api_key)
    result = call_model(args.compare, args.model, key)
    result["_source"] = str(args.compare)
    result["_model"] = args.model
    if args.out:
        Path(args.out).write_text(json.dumps(result, ensure_ascii=False, indent=2))
    _print_one(args.compare, result, args.json)
    return 0


def cmd_batch(args):
    key = _api_key(args.api_key)
    out_dir = Path(args.dir)
    json_files = sorted(out_dir.glob("*.json"))
    # skip our own *.review.json output from a previous run
    json_files = [f for f in json_files if not f.name.endswith(".review.json")]

    targets = []
    for f in json_files:
        try:
            data = json.loads(f.read_text())
        except json.JSONDecodeError:
            continue
        if not args.all and data.get("pass", True):
            continue
        compare = data.get("composite") or str(out_dir / f"{data.get('name', f.stem)}.compare.png")
        if not Path(compare).exists():
            print(f"⚠️  skip {f.name}: no compare image at {compare}", file=sys.stderr)
            continue
        targets.append((data.get("name", f.stem), compare))

    if not targets:
        print("nothing to review — no regions flagged pass:false"
              " (use --all to review everything anyway).")
        return 0

    results = []
    for name, compare in targets:
        try:
            result = call_model(compare, args.model, key)
        except RuntimeError as e:
            result = {"verdict": "error", "issue_type": "other", "explanation": str(e)}
        result["_source"] = compare
        result["_model"] = args.model
        results.append((name, result))
        (out_dir / f"{name}.review.json").write_text(json.dumps(result, ensure_ascii=False, indent=2))

    if args.json:
        print(json.dumps({name: r for name, r in results}, ensure_ascii=False, indent=2))
    else:
        for name, r in results:
            _print_one(name, r, as_json=False)
    return 0


def _print_one(label, result, as_json):
    if as_json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return
    icon = {"match": "✅", "differs": "❌", "unsure": "❓", "error": "⚠️"}.get(result["verdict"], "❓")
    print(f"{icon} {label}: {result['verdict']} [{result.get('issue_type', '-')}] "
          f"— {result.get('explanation', '')}")


def main():
    _load_dotenv()
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--model", default=os.environ.get("VISION_DIFF_MODEL", DEFAULT_MODEL))
    p.add_argument("--api-key", help="overrides $OPENROUTER_API_KEY (prefer the env var)")
    sub = p.add_subparsers(dest="cmd", required=True)

    r = sub.add_parser("review", help="review one .compare.png")
    r.add_argument("--compare", required=True)
    r.add_argument("--out", help="write result JSON here")
    r.add_argument("--json", action="store_true")
    r.set_defaults(func=cmd_review)

    b = sub.add_parser("batch", help="review every pass:false region in a vision_diff output dir")
    b.add_argument("--dir", required=True, help="the --out-dir passed to vision_diff.py batch")
    b.add_argument("--all", action="store_true", help="review every region, not just failed ones")
    b.add_argument("--json", action="store_true")
    b.set_defaults(func=cmd_batch)

    args = p.parse_args()
    try:
        sys.exit(args.func(args))
    except RuntimeError as e:
        print(f"model_review: {e}", file=sys.stderr)
        sys.exit(2)


if __name__ == "__main__":
    main()
