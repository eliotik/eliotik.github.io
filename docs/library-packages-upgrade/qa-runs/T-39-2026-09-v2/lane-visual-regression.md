# Lane: visual-regression — T-39 v2 (HEAD `63efd08`)

**Verdict: PASS.** All 28 main-vs-upgraded screenshot pairs are byte-identical after PNG decoding: 0 differing pixels at any threshold, in both themes. This covers the 12 routes plus full-page captures of 2 pages. So do all 84 scroll-segment pairs below the fold, apart from one 17-pixel ±1-LSB variant that the upgraded build also produces against itself (render noise, shown below). No main-vs-upgraded pair exceeds 0.1%, so the lane wrote no diff PNGs to `diff/`. Every difference from the April baseline comes from one of four places: the capture environment, changes already accepted in the April upgrade, the newer Chrome, or changes made on `main` after April. For each route, a build of the April-end commit (`bdb9350`) shows which of these applies. None comes from T-39.

Machine-readable results: `lane-visual-regression.json` (same directory). Scripts: `visual-regression-scripts/*.mjs.txt`.

---

## 1. What was compared (evidence the servers served the right builds)

| Server | Build | Evidence |
|---|---|---|
| `http://localhost:4321` (upgraded, not stopped) | repo `dist/` at HEAD `63efd0867a0ba7fa14759fe98cfe0d1b363ce7a5`. `dist/index.html` mtime is 12:29:02, after the HEAD commit at 12:26:18. The daemon's cwd is the repo. | `find dist -type f … \| shasum` = `41e8505681eb44a17d285b4d3dbae1d792213e6d` **before and after** all captures. Served `/` and `/posts/octoprint-prusa-core-one-raspberry-pi/` are byte-identical to the `dist` files (`e85d8ad9…`, `1009e4a1…`). Generator `Astro v7.3.5`. The served HTML contains the Task 14 markers: `sandboxParent:"html"`, `data-astro-transition-persist="gtag-src"` and `data-astro-transition-persist="gtag-init"`. `git status` shows no changes in `src/`, `public/`, `astro.config.mjs`, `package.json` or `pnpm-lock.yaml`. |
| `http://localhost:4331` (pre-upgrade) | scratch worktree `main-before` @ `3df6160395385555a22efd646626e6a009114a7d`. Node 22.22.2 and pnpm 10.33.2. `pnpm install --frozen-lockfile && pnpm build`: EXIT 0, `0 errors`, `Complete!`. | Generator `Astro v6.2.1`. None of the Task 14 markers are present, only the library default `sandboxParent\|\|"body"`. |
| `http://localhost:4332` (April-end, attribution only) | scratch worktree @ `bdb9350`: the commit the April T-30 verification captured. Built the same way, Astro v6.1.10. | Used only to explain differences from the April baseline (§5). |

Content parity: `git diff main HEAD -- src/content public` is **0 lines**. main and HEAD have the same content, so any content or date drift would have been suspicious. None was found.

## 2. Method

- Playwright 1.63.0 drives the installed Google Chrome **153.0.8010.53** (`channel: 'chrome'`, headless, clean context per shot). No browser was downloaded.
- Viewport 1280×1800, `deviceScaleFactor: 1`, `reducedMotion: 'reduce'`, `colorScheme` equal to the theme.
- Theme set through `localStorage.theme`, the key used by `public/toggle-theme.js` and the inline script in `Layout.astro`, injected with `addInitScript`. Every shot asserts `html[data-theme] === theme` and `html.dark === (theme === 'dark')`: **56/56 true** (up-A 28, main 28), plus 28/28 on the up-B noise run.
- Wait sequence: `load`, then `networkidle` (28/28 reached it on each server), then `document.fonts.ready`, then in-viewport images complete, then 500 ms. `/search/?q=hiring` additionally waits for `Found N results for`: `Found 5 results for 'hiring'` on both builds, in both themes. IBM Plex Mono is loaded on every shot. There are 0 broken images.
- Screenshots use `animations: 'disabled'` and `caret: 'hide'`.
- Diff: pixelmatch 7.2.0 + pngjs 7.0.0 at threshold 0.1 (AA excluded), as the task specifies. Because the expected result is exactly 0 px, the lane also records whether the decoded RGBA buffers are identical, the exact any-channel pixel count, and a threshold-0 pixelmatch count. Pixelmatch at 0.1 does not see low-contrast fills: a light-grey carousel button scores 84 px at 0.1 but 3137 px exact (§5, row 04). A verdict of "0 px" therefore always means **exact**.
- Upgraded shots are in this directory as `NN-name[-dark].png`, `11-octoprint*`, `12-search*` and `fp-*`. Main shots are in `…/scratchpad/t8v2/main-shots/`.

## 3. Main (pre-upgrade) vs upgraded: the task table

"exact px" counts pixels where any RGBA channel differs. "byte-identical" means the decoded RGBA buffers are equal.

| # | Route | Theme | Mismatch % (pm 0.1) | exact px | Verdict | Explanation |
|---|---|---|---|---|---|---|
| 01 | `/` | light | 0.0000% | 0 (byte-identical) | PASS | Identical. scrollHeight 1800/1800, 196/196 elements, innerText hash equal. |
| 01 | `/` | dark | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 02 | `/posts` | light | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 02 | `/posts` | dark | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 03 | `/posts/ems-connecting-the-systems` | light | 0.0000% | 0 (byte-identical) | PASS | Identical. scrollHeight 14586/14586. |
| 03 | `/posts/ems-connecting-the-systems` | dark | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 04 | `/posts/flutter-google-maps-embedded-map` | light | 0.0000% | 0 (byte-identical) | PASS | Identical. Carousel: 5/5 slides, 7/7 images, 0 broken. |
| 04 | `/posts/flutter-google-maps-embedded-map` | dark | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 05 | `/tips` | light | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 05 | `/tips` | dark | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 06 | `/tags` | light | 0.0000% | 0 (byte-identical) | PASS | Identical. scrollHeight 3029/3029. |
| 06 | `/tags` | dark | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 07 | `/tags/engineering-management/` | light | 0.0000% | 0 (byte-identical) | PASS | Identical. The inline `#tag` row and the breadcrumb (the compressHTML-sensitive spots) match. |
| 07 | `/tags/engineering-management/` | dark | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 08 | `/threads` | light | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 08 | `/threads` | dark | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 09 | `/about` | light | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 09 | `/about` | dark | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 10 | `/this-route-doesnt-exist` | light | 0.0000% | 0 (byte-identical) | PASS | Identical. HTTP 404 on both builds, as expected. |
| 10 | `/this-route-doesnt-exist` | dark | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 11 | `/posts/octoprint-prusa-core-one-raspberry-pi/` | light | 0.0000% | 0 (byte-identical) | PASS | Identical. scrollHeight 39002/39002, 24 images, 16 slides. |
| 11 | `/posts/octoprint-prusa-core-one-raspberry-pi/` | dark | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 12 | `/search/?q=hiring` | light | 0.0000% | 0 (byte-identical) | PASS | Identical. 5 results. |
| 12 | `/search/?q=hiring` | dark | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| fp | `/` full page | light | 0.0000% | 0 (byte-identical) | PASS | 1280×1800 on both. The home page fits in 1800 px (scrollHeight 1800), so the viewport shot already covers the whole page. |
| fp | `/` full page | dark | 0.0000% | 0 (byte-identical) | PASS | Same. |
| fp | `/posts/ems-the-delivery-system/` full page | light | 0.0000% | 0 (byte-identical) | PASS | 1280×7977 on both, after a lazy-load pre-walk with all images complete. Checked visually: appendix table, related posts, `#tag` row, share icons, footer. |
| fp | `/posts/ems-the-delivery-system/` full page | dark | 0.0000% | 0 (byte-identical) | PASS | Same. |

**Result: 28/28 byte-identical. 0 pairs above 0.1%, so no diff PNGs were needed.** The two expected risks show no rendered difference: Task 13's CSS minification change and Task 14's hidden Partytown sandbox iframe, now a child of `<html>`.

### 3.1 Supporting checks

| Check | Result | Evidence |
|---|---|---|
| **Noise floor.** A second upgraded capture (up-B) was diffed against up-A. | PASS | 28/28 byte-identical, so captures are deterministic at viewport level. |
| **Below the fold.** Scroll segments of 1800 px on 03, 04, 06 and 11, in both themes, on both servers: 84 pairs. | PASS | All 84 pairs have the same size and identical scroll positions. 83/84 have exact 0 px. `seg-11-octoprint-dark-18` has 17 exact px (pm 0.1 = 0) in a 1-px column at x=777, inside the downscaled `temperature-graph-cancel.webp`, with values ±1 LSB (e.g. 254 vs 255). **Repeat test:** that segment was captured 3× on each server. Runs up-0, up-1, main-0, main-1 and main-2 equal the original *main* capture, and up-2 equals the original *up* capture. The 17-px variant appears on both builds, so it is rasterisation nondeterminism, not a build difference. Every segment reports all visible images loaded (`complete && naturalWidth > 0`). |
| **DOM and metadata parity** (all 28 shots). Compared: status, final URL, title, data-theme, html class, body colours and font, loaded font faces, scrollHeight and scrollWidth, element count, image count, broken images, slide count, innerText length and hash, console, page errors, bad responses. | PASS | The only differing key is `htmlChildren`: `[HEAD, BODY, IFRAME]` on the upgraded build vs `[HEAD, BODY]` on main. That is the intended Task 14 change: the Partytown sandbox iframe moves from `<body>` to `<html>`. On both builds the iframe is `visibility: hidden` with a **0×0 rect** at the document bottom, and scrollHeight and element counts are equal on every route. |
| **Console and network** (clean profile) | PASS (parity) | 0 page errors on either build. The only console error is the expected `404 (Not Found)` of the document on `/this-route-doesnt-exist`, on both builds. The only failed requests are GA `g/collect` beacons aborted when each context closes, on both builds. Main also had one aborted `googletagmanager.com/a` request on one shot (see Observations). |
| **Sensitivity control: whitespace between inline elements.** Deletes whitespace-only text nodes between two inline-level siblings in non-flex parents, the failure mode of compressHTML `'jsx'`. | PASS (pipeline sees it) | `/posts/ems-the-delivery-system/` full page: 28 nodes removed, 3691 px (0.0361%). `/tags/engineering-management/`: 13 removed, 937 px (0.0407%, breadcrumb `Home » tags`). On `/`, 10 removed with 0 px, because those nodes do not render. |
| **Sensitivity control: 1 NBSP or 1 px** | PASS (pipeline sees it) | One NBSP before one tag link on 07 gives 1.2518% (28841 px). `nav { margin-top: 1px }` on `/` gives 0.0295% (679 px, exact 1858). Re-capturing without changes gives 0 px. |

## 4. Full-page captures (step 5)

Covered by the four `fp` rows above: `/` in 2 themes and `/posts/ems-the-delivery-system/` in 2 themes. All are byte-identical between main and upgraded, with no height difference. The scroll segments in §3.1 add below-the-fold coverage of the three longest pages (03, 04, 11) and of `/tags`.

## 5. Upgraded (light) vs the April baseline `baseline/NN-*.png` (step 4)

For each of the 10 routes, I Read both images. Differences are attributed with three extra captures, all in the same Chrome 153:
- **aligned1268**: the upgraded site at a 1268-px viewport. The April capture had a 12-px classic scrollbar gutter; the reason is explained under (a) below.
- **aprilEnd-now**: the April-end commit `bdb9350`, rendered today at 1268 and at 1280 px.
- **T-30**: the April-end captures in `qa-runs/T-30-20260430T125829Z/visual/`, taken in April's environment.

Each comparison isolates one cause:

| Comparison | Isolates | Result |
|---|---|---|
| April baseline vs T-30 (both April environment, 1268 layout) | Changes made *during* the April upgrade | Only the header nav band y42-66 and the dev-toolbar band y1782-1799 on every route, plus the carousel on 04. |
| aprilEnd-now-1268 vs T-30 (same code, different Chrome and capture) | Chrome version / capture environment | See the per-route column. **03 = 0 px.** |
| aprilEnd-now-1280 vs upgraded (same Chrome, different code) | Changes to `main` after April. T-39 contributes 0 (§3). | **03, 08, 09 and 10 = 0 exact px.** 04 differs only in the T-36 carousel buttons. 01, 02, 05, 06 and 07 differ by content, TopTags and the tips redesign. |

Capture-environment facts behind these results:
- **(a) Scrollbar gutter.** `src/styles/base.css:175` sets `html { overflow-y: scroll; }` with a 12-px (`w-3`) `::-webkit-scrollbar`. The April capture tool (headful Chromium over CDP) painted it: the April PNGs show the grey track at x=1268-1279. Playwright headless starts Chrome with `--hide-scrollbars` (found in `playwright-core/lib/coreBundle.js`), so the layout width is 1280 instead of 1268. The centred 736-px column therefore moves **+6 px** (April x=266-1002, now 272-1008). This one shift causes most of the unaligned mismatch.
- **(b) Dev toolbar.** The April baseline was taken on `astro dev`: the Astro dev-toolbar pill is visible at x≈546-722, y≥1782. The upgraded shots come from the production preview.

| # | Route | pm 0.1 unaligned | pm 0.1 aligned1268 | same code, April env vs today: Chrome + capture (aprilEnd-now-1268 vs T-30, px) | post-April main (aprilEnd-now-1280 vs upgraded, px) | Verdict | Explanation (from Reading both images plus the attribution diffs) |
|---|---|---|---|---|---|---|---|
| 01 | `/` | 1.8783% | 1.6402% | 5509 | 32303 | PASS | Expected content added since April: 2 new posts (OctoPrint 3df6160, "Two books…" 33f6bde) push the list down, and the **Top tags** section was added (13deae2, 2026-05-07). Other differences: the +6 px shift (a), the dev toolbar (b), and the April-era nav offset (the text links sit 8 px further left and the search icon 4 px, relative to April; T-30 shows the same, so this was accepted during the April upgrade). Chrome 153 also places link text 1 px higher, for example the "Motivation is a trap" link; the same happens on April-end code. Header, fonts, colours and theme icon are otherwise unchanged. |
| 02 | `/posts` | 1.8611% | 1.6116% | 6048 | 32272 | PASS | Content: 2 new posts at the top. There are still 5 posts per page and the pager still reads "1 / 6". Also (a), (b) and the April-era nav offset. The active "Posts" wavy underline renders slightly differently in Chrome 153 (`crops/active-nav-wavy-*`); its classes `underline decoration-wavy decoration-2 underline-offset-4` are unchanged since d8bf57e. |
| 03 | `/posts/ems-connecting-the-systems` | 4.4359% | **0.1706%** | **0** | **0** | PASS | Text, line breaks and spacing are identical. Once aligned, only the header band and the dev toolbar differ; T-30 vs April shows the same two bands. The high unaligned figure comes entirely from the +6 px shift on a dense text column. Note: this post has 0 `<img>` elements on every build (see Observations). |
| 04 | `/posts/flutter-google-maps-embedded-map` | 2.3411% | 0.6891% | 23713 (≈12029 of it is the T-30 slide-image scroll artifact in band y942-1268; the rest is Chrome) | 84 (exact 3137) | PASS | Expected: the **pure-CSS scroll-snap carousel** (T-10, flowbite removed) with round Prev/Next buttons (0ce59e8, T-36, 2026-04-30); Prev is disabled at the start. The slide image is the same. Chrome 153 renders these differently on April-end code too (`crops/04-*`): the "First post" dashed underline has longer dashes, the TOC `<summary>` has ~3 px more space between the ▶ marker and the text, and the Expressive Code tab and code lines sit 1 px higher. In the T-30 capture itself the slide image was scrolled about 13 px inside its frame; the baseline, aprilEnd-now and upgraded captures all show it unscrolled. |
| 05 | `/tips` | 1.5100% | 1.3299% | 165 | 26295 | PASS | The Tips listing was **redesigned on main** in 465cc8c (2026-05-07): note numbering, a "5 notes · page 1 of 2" bar, "Expand all" and inline pagination. Also (a), (b) and the nav. The footer now sits at y≈1122 instead of the page bottom; this is part of that redesign and is identical on main (see Observations). |
| 06 | `/tags` | 1.5041% | 0.7013% | 1161 | 11172 | PASS | Content: 63 → 68 tags, and the counts changed (engineering-management 14 → 15, hiring 2 → 3, new `recruiting`, `3d-printing`, `home-lab` and others), so rows reorder. The filter, sort toggle and bars are unchanged. The `#` to tag-name spacing is the same 14 px as in April. The count digits sit 1 px higher in Chrome 153, as on April-end code. |
| 07 | `/tags/engineering-management/` | 2.1164% | 1.5333% | 6497 | 31027 | PASS | Content: 14 → 15 articles; "Two books…" is first. `#hiring` moved into the first related-tags row because its count rose to 3. The pager still reads "1 / 3". The spacing between inline related `#tag` links matches April. The other differences are (a), (b), the nav, and Chrome's 1-px text placement. |
| 08 | `/threads` | 1.7342% | 0.2395% | 1566 | **0** | PASS | The content is identical. The code rendered today is identical to April-end code. The remaining differences are (a), (b), the April-era nav offset, and Chrome 153 placing thread headings 1 px higher, which also happens on April-end code. |
| 09 | `/about` | 2.9787% | 0.1792% | 172 | **0** | PASS | The content is identical. Chrome 153 renders the list bullets and the closing kaomoji `( ๑ ˃̵ᴗ˂̵)و` differently. The kaomoji uses U+0E51, U+02C3 and U+02C2, each arrowhead with a COMBINING SHORT STROKE OVERLAY U+0335, and U+0648; all of these come from fallback fonts. April-end code shows the same, and main is byte-identical. The rest is (a), (b) and the nav. |
| 10 | `/this-route-doesnt-exist` | 0.5484% | 0.1873% | 383 | **0** | PASS | The only differences are (a), (b), and the "Go back home" dashed underline, which has longer dashes in Chrome 153. Its classes `underline decoration-dashed underline-offset-8` are unchanged since d8bf57e, and April-end code in Chrome 153 shows the identical 383 px. Forcing `text-decoration-thickness: 1px` does **not** reproduce April exactly (315 px remain), so this is a rasterisation difference in the Chrome version, not a thickness setting. |

**Result:** every difference from the April baseline falls into one of these groups:
1. Expected content added since April.
2. The expected pure-CSS carousel (plus the T-36 buttons).
3. The capture environment: scrollbar gutter and dev toolbar.
4. The April-era nav offset, already present in T-30.
5. Rendering differences in Chrome 153, identical on April-end code.
6. Two post-April `main` features: TopTags and the Tips redesign.

None comes from T-39: main is byte-identical to the branch (§3). There are no missing images or components, no broken theming and no font loss. Inline spacing, where a compressHTML problem would show, is unchanged.

Evidence crops (April / T-30 / now), in `diff/april/crops/`: `header-nav-april-vs-now1268.png`, `active-nav-wavy-april-T30-now1268.png`, `404-dashed-underline-april-T30-now1268.png`, `04-toc-summary-april-T30-now1268.png`, `04-code-tab-april-T30-now1268.png`, `04-carousel-april-T30-aprilendNow-branch.png`. Aligned April diff PNGs are in `diff/april/NN-*-april-vs-up-aligned1268.png`. The unaligned ones are kept in scratch only, because the 6-px shift makes them uninformative.

## 6. Cleanup (step 6)

- The main preview (Astro 6.2.1) runs in the **foreground**, not as a daemon, so `pnpm astro preview stop` does not apply to it. Running `stop` from the repo root would have stopped the 4321 daemon, which must stay up. The lane therefore stopped main's preview with SIGTERM to its PID 28584, after confirming with `lsof` that its cwd was `…/t8v2/main-before`. It stopped the April-end preview (PID 70358, cwd `…/visual-regression/april-end`) the same way. **This departs from the brief's stop command.**
- After stopping: `lsof -iTCP:4321-4340 -sTCP:LISTEN` shows only PID 18132 on 4321, and `curl` gets 4321=200, 4331=000, 4332=000.
- `git worktree remove --force` was run on both scratch worktrees, then `git worktree prune`. `git worktree list` now shows only `~/development/other/eliotik.github.io 63efd08 [upgrade/2026-09]`.
- No tracked files were modified. The lane wrote files only under `docs/library-packages-upgrade/qa-runs/T-39-2026-09-v2/`, which is untracked, and in scratch.
- Final integrity check: all 28 upgraded PNGs in this directory still decode to the same bytes as up-B and as main (28/28). Their mtimes all fall within the up-A capture window (16:42:14Z to 16:43:19Z), so no concurrent lane overwrote them.

## 7. Observations (non-failing)

1. **Render noise on one segment.** `seg-11-octoprint-dark-18` has a 17-px ±1-LSB variant in a downscaled webp, and both builds produce it. It is nondeterministic, not a regression; the repeat test is in §3.1.
2. **Pixelmatch 0.1 misses low-contrast fills.** For example, the round carousel buttons on a near-white background register 84 px at 0.1 against 3137 exact px. The lane therefore based its verdicts on exact pixel equality.
3. **Name mismatch for route 03.** `baseline/SCREENSHOTS.md` describes 03 (`ems-connecting-the-systems`) as a "post with multiple inline images", but it has **0** `<img>` on every build, April included. The name and the doc are wrong; this is not a regression. Images are exercised by 04 (7 images) and 11 (24 images, 16 slides).
4. **Tips footer position.** On `/tips` at 1800 px the footer sits mid-viewport (y≈1122). This dates from the Tips redesign 465cc8c on main and is identical on main. It is a design matter, not T-39.
5. **One aborted gtag request on main.** Main's capture of `fp-ems-the-delivery-system-dark` includes an aborted `googletagmanager.com/a` request; the branch has none. This fits Task 14 (gtag is no longer re-run) and does not affect rendering.
6. **v1 claim not reproduced.** The v1 report said forcing a 1-px thickness "reproduces April exactly" for the dashed underline. This lane could not reproduce that: 315 of 383 px remain. The attribution to the Chrome version still holds, because April-end code in Chrome 153 gives the same 383 px.

## 8. Artifacts

- `NN-name.png` and `NN-name-dark.png` for 01-12, plus `fp-home[-dark].png` and `fp-ems-the-delivery-system[-dark].png`: the upgraded captures (this directory).
- `lane-visual-regression.json`: capture metadata for up-A, main and up-B; every diff with byte, exact, threshold-0 and threshold-0.1 counts and bounding boxes; segments; noise repeat; April attribution diffs; sensitivity controls.
- `diff/april/`: aligned April diff PNGs and evidence crops. There are no main-vs-upgraded diff PNGs because every pair is 0 px.
- `visual-regression-scripts/*.mjs.txt`: the capture, segment, diff, attribution and control scripts. They are saved as `.txt` so the repo's `eslint .` does not lint them.
- Scratch (not in the repo): main shots in `…/t8v2/main-shots/`; up-B, the segment PNGs, the repeat runs, the aprilEnd captures and the crops in `…/t8v2/visual-regression/`.
