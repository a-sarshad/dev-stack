# vision-diff

Deterministic crop + pixel-diff for design-vs-preview comparison. Pure Pillow,
**no LLM call, no network** — this is the free/instant pre-filter that decides
which crops are worth a human (or, later, a paid vision model) looking at, so
you're not eyeballing every element on every check.

Not a `dev-engine` module — it needs no AST, only two screenshots — so it
lives here rather than in `packages/dev-engine/src/modules/`. Standalone
script, no build step: `python3 tools/vision-diff/vision_diff.py ...` from
the `dev-agents` repo root, or symlink/alias it like any other script.

## Where this sits in the pipeline

Every project scaffolded by `dev-engine init` documents a **preview-vs-design
comparison** step in its CLAUDE.md (mandatory before shipping any new Figma
surface) that already downloads exactly two raw screenshots — the design
frame and the rendered preview — and crops both locally. `vision_diff.py` is
that crop step, written once instead of typed fresh as a `python3 -c` one-liner
each time, plus an actual pass/fail instead of "looks the same to me":

```
design screenshot ─┐
                    ├─ vision_diff.py batch ─→ ✅/❌ per region + .compare.png
preview screenshot ─┘
```

It does **not** replace the human/Claude judgment call of *which* two boxes
correspond to the same element, and it cannot tell you whether `start` is the
right value vs `end` — only whether two crops you already believe match, look
alike. That decision is still the "translation table" step in CLAUDE.md.

## Requirements

```bash
python3 -c "import PIL" || pip3 install pillow
```

Nothing else — stdlib + Pillow only, so it runs anywhere Python 3.8+ is
available, no `npm link`/build step to go stale.

## Usage

### One region

```bash
python3 vision_diff.py diff \
  --design design.png --design-box 100,200,400,260 \
  --preview preview.png --preview-box 50,80,350,140 \
  --out-dir ./out/badge --name badge
```

### Many named regions in one pass (typical real usage)

```bash
python3 vision_diff.py batch \
  --design design.png --preview preview.png \
  --regions regions.json --out-dir ./out
```

`regions.json`:
```json
[
  { "name": "kpi-badge",   "design_box": [100, 200, 400, 260], "preview_box": [50, 80, 350, 140] },
  { "name": "filter-chip", "design_box": [420, 200, 620, 240], "preview_box": [360, 80, 520, 116] }
]
```

Each region produces `<name>.compare.png` (design / resized-preview / red diff
heatmap stacked) and `<name>.json` (numbers). Exit code: `0` all match,
`1` at least one region differs, `2` usage/file error.

### Just crop (no diff)

```bash
python3 vision_diff.py crop design.png --box 100,200,400,260 --out crop.png
```

## `regions.py` — small composite-element detector

Catches the documented failure mode where icon+text order inside a small
element (badge, pill) can't be judged from a full-page composite screenshot —
the element is too small on screen to see order by eye, even though the check
"passed". Feed it a DOM rect dump; it flags anything under ~50px that mixes
an icon and text as needing its own zoomed `get_screenshot`.

Get the dump from the browser preview via `javascript_tool`:

```js
JSON.stringify(
  [...document.querySelectorAll('[data-testid], .badge, .chip, button')].map((el, i) => {
    const r = el.getBoundingClientRect()
    return {
      name: el.dataset.testid || el.className || `el-${i}`,
      width: Math.round(r.width), height: Math.round(r.height),
      hasIcon: !!el.querySelector('svg'),
      hasText: (el.textContent || '').trim().length > 0,
    }
  })
)
```

Then:
```bash
python3 regions.py elements.json
```

## `model_review.py` — optional external vision-model second opinion

Sends only the `❌` (`pass: false`) `.compare.png` crops from a `batch` run to
a vision-capable LLM (default: a free OpenRouter model) for a second opinion —
not every region, not a replacement for Claude's own browser-based preview
review. Needs `$OPENROUTER_API_KEY` and **sends those images to a third-party
API** — see the privacy note in the script's docstring before using it on
anything but disposable UI screenshots.

```bash
export OPENROUTER_API_KEY=sk-or-...

# one crop
python3 model_review.py review --compare out/badge_bug.compare.png

# everything vision_diff.py batch flagged as differing, in one pass
python3 model_review.py batch --dir out/
```

Each writes `<name>.review.json` next to the `.compare.png`:
```json
{"verdict": "differs", "issue_type": "direction-or-order",
 "explanation": "icon is on the left in preview, right in design"}
```

`issue_type` values: `direction-or-order` · `color` · `missing-element` ·
`spacing` · `text` · `other` · `none`. Override the model with `--model` or
`$VISION_DIFF_MODEL` — check current pricing/availability at
https://openrouter.ai/models, it changes.

**Verified false positive (free model, tested 1405/08):** a crop with no real
bug (icon on the same side in both, only resize/anti-aliasing noise ~5%
pixel change) was still called `differs / direction-or-order`. Treat any
`differs` verdict as "worth a human glance at the `.compare.png`", not as a
confirmed bug — same rule as every other automated layer in this pipeline
(see CLAUDE.md § preview comparison: it's the only thing that decides `start`
vs `end` is actually correct).
