# DOM verification (T-35 QA)

## /posts/local-coding-model-desktop-macbook/ on localhost:4321 (T-35 dev server)

```
{"url":"http://localhost:4321/posts/local-coding-model-desktop-macbook/",
 "title":"How I run a local coding model on my desktop and use it from my MacBook | Novi Fyx",
 "pres":35,
 "ecFrames":35,
 "ecCopyButtons":35,
 "manualButtons":0,
 "buttonsInsideAnyPre":0}
```

PASS — 0 manual buttons, 35 EC native (1:1 with frames).

## /posts/this-blog/ on localhost:4321 (T-35 dev server)

```
{"ecFrames":8,"ecButtons":8,"manualButtons":0}
```

PASS — 0 manual buttons, 8 EC native (1:1 with frames).

## Scroll-end test on widest overflow pre (local-coding-model)

Widest pre: index 20, scrollWidth=869, clientWidth=733, overflow=136px.
After `pre.scrollLeft = pre.scrollWidth` (final scrollLeft=136.5):
- EC copy button rect: left=960.5, right=992.5, width=32, height=32 (pinned at frame right edge, viewport-relative).
- manualCopyCodeInFrame: 0
- buttonsInsidePre: 0

PASS — no button revealed inside `<pre>` at scroll-end.

## Multi-block scroll-end test (all overflow pres)

```
{"url":"http://localhost:4321/posts/local-coding-model-desktop-macbook/",
 "totalPres":35,
 "scrolledCount":5,
 "manualAfter":0,
 "buttonsInPres":0}
```

PASS — 5 pres with horizontal overflow scrolled to right end, zero manual buttons exposed, zero buttons inside any pre.

## Click-to-copy state

EC's native button has the canonical attributes:
```
<button title="Copy to clipboard" data-copied="Copied!" data-code="wsl --install -d Ubuntu-24.04">
  <div></div>
</button>
```

The `data-copied="Copied!"` attribute drives EC's CSS `::after` tooltip on click via `plugin-frames`'s state toggle. Markup matches Expressive Code 0.41.7's `plugin-frames` canonical pattern.

## Built artifact (dist/) verification

- Zero `copy-code` string occurrences anywhere in `dist/`.
- 77 EC `<div class="copy">` blocks across all post HTML files.
- `dist/posts/local-coding-model-desktop-macbook/index.html`: 35 EC copy buttons, 0 manual.
- `dist/posts/this-blog/index.html`: 8 EC copy buttons, 0 manual.

## Source verification

`grep -n 'attachCopyButtons\|copy-code' src/layouts/PostDetails.astro` → zero matches (exit 1).

## Environment notes

- T-35 dev server bound IPv6-only (`::1`); curl over `localhost` IPv6 works.
- Stale dev servers from `eliotik.github.io-T-36` worktree intermittently held port 4323 and caused chrome MCP tab cross-contamination during scroll-end runs. Killed via `kill <pid>`. Final discriminating eval results (above) collected from a cleanly verified `localhost:4321` URL.
- Screenshot capture quirks matched the dev's documented note (justification §6); fullpage screenshots stored at visual/01-default-fullpage.png and visual/02-scrolled-right-fullpage.png.
