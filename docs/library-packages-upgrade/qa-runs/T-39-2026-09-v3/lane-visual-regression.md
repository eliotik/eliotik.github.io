# Lane: visual-regression — T-39 v3 (HEAD `9eb1ec3`)

**Verdict: PASS.**

- **Screenshots, main vs upgraded:** all 28 pairs are byte-identical after PNG decoding, with 0 differing pixels at any threshold. That covers 12 routes × 2 themes plus 2 full-page captures × 2 themes.
- **Below the fold:** 84 scroll-segment pairs were compared. 83 are identical. The last one has a 17-px ±1-LSB variant, and 4 repeat captures on each server all match one another (render noise, §3.1).
- **v3 vs v2:** all 28 upgraded v3 shots are byte-identical to the v2 shots committed at `63efd08`, so Tasks 17, 17b and 17c changed no rendered pixel.
- **The Task 17b CSS reduction** was tested four ways beyond screenshots. The ledger records the branch's Footer bundle going from 98690 B to 63291 B; main's `Footer.CKIJxfJt.css` is 96.0 KiB. None found a rendering difference:
  1. **Computed styles:** 266 page states on both servers, 221,564 element comparisons. That is 21 page types at 4 widths × 2 themes, plus interactive states.
  2. **Forced `:hover` / `:focus` states:** CDP-forced on 9,996 targets across 21 page types × 2 themes, with 332,108 element comparisons.
  3. **Site-wide rule-set diff:** every same-origin CSS rule applied on all 129 HTML pages, in both themes, on both builds.
  4. **Positive and negative controls:** 7/7 behave as expected, so the comparators would have caught a real difference.
- **April baseline:** every difference from the April screenshots comes from one of these:
  - content added since April;
  - the post-April pure-CSS carousel and its buttons;
  - two post-April features on `main` (TopTags and the Tips redesign);
  - the capture environment (scrollbar gutter, dev toolbar);
  - Chrome 153 rendering changes.

  The 1268-px-aligned captures used for attribution are byte-identical to v2's, so v2's per-route attribution to the April-end build (`bdb9350`) carries over unchanged.
- No FAILs.

Machine-readable results are in `lane-visual-regression.json` (same directory). Scripts are in `visual-regression-scripts/*.mjs.txt`, stored as `.txt` so `eslint .` does not lint them.

---

## 1. What was compared (evidence the servers served the right builds)

| Server | Build | Evidence |
|---|---|---|
| `http://localhost:4321` (upgraded; shared daemon, not stopped) | Repo `dist/` at HEAD `9eb1ec391aedca5a7ad615f37d53568f0a0f2aa0` (PID 3520; its cwd is the repo, per `lsof`) | <ul><li>Served `/`, `/posts/octoprint-prusa-core-one-raspberry-pi/` and `/_astro/Footer.BnrdipP9.css` are byte-identical to the `dist` files (sha256 `cccfac2e…`, `9f10b770…`, `1b31ced1…`).</li><li>Generator: `Astro v7.3.5`.</li><li>`src/styles/base.css:1` is `@import 'tailwindcss' source('..');`.</li><li>`Footer.BnrdipP9.css` is 63291 B (61.8 K).</li><li>The sorted sha256 list of all 362 `dist` files hashes to `272b40eb43f3fda501093be6c796ebcea03b0098`, both before and after every capture (§6).</li></ul> |
| `http://localhost:4331` (pre-upgrade) | Scratch worktree `…/t8v3/main-before` at `main` = `3df6160395385555a22efd646626e6a009114a7d`. Node 22.22.2 (the worktree's `.nvmrc`), pnpm 10.33.2. | <ul><li>`pnpm install --frozen-lockfile`: exit 0.</li><li>`pnpm build`: exit 0, `0 errors`, `127 page(s) built`, `Complete!`, jampack `✔ No issues`.</li><li>Generator: `Astro v6.2.1`.</li><li>`Footer.CKIJxfJt.css` is 96.0 K.</li><li>Logs: `…/t8v3/vr-main-install.log` and `vr-main-build.log`.</li></ul> |

**Content parity.** Both dists contain the same 129 HTML pages; the only extra file is `~partytown/partytown-sandbox-sw.html`, which is not a page. On all 28 shots the rendered `innerText` hash, `scrollHeight`, `scrollWidth`, element count, image count and slide count are equal between main and upgraded. So there is no content or date drift, and none was expected.

## 2. Method

- **Browser.** Playwright 1.63.0 drives the installed Google Chrome **153.0.8010.53** (`channel: 'chrome'`, headless, a fresh context per page). No browser was downloaded.
- **Viewport and settings.** 1280×1800, `deviceScaleFactor: 1`, `reducedMotion: 'reduce'`, `colorScheme` equal to the theme.
- **Theme.** Set through `localStorage.theme`, the key that `public/toggle-theme.js` and the inline script in `Layout.astro` read, via `addInitScript`.
  - Every shot asserts `html[data-theme] === theme` and `html.dark === (theme === 'dark')`.
  - This held on **84/84** captures: up-A 28, main 28, up-B 28.
- **Wait sequence before each shot:** `load`, then `networkidle` (reached on 28/28 on each server), then `document.fonts.ready`, then all in-viewport images `complete`, then 500 ms.
  - `/search/?q=hiring` also waits for the text `Found N results for`. It shows `Found 5 results for 'hiring'` on both builds, in both themes.
  - IBM Plex Mono is loaded on every shot, and 0 images are broken.
- **Screenshot options:** `animations: 'disabled'`, `caret: 'hide'`.
- **Diff.** pixelmatch 7.2.0 + pngjs 7.0.0 at threshold 0.1 (the task metric), with AA excluded.
  - The expected result is exactly 0 px, so the lane also records whether the decoded RGBA buffers are identical, the exact any-channel pixel count, and a threshold-0 count.
  - pixelmatch at 0.1 misses low-contrast fills (v2 §2 found 84 px at 0.1 against 3137 exact px). So **"0 px" in this report always means exact equality.**
- **Where the shots are.**
  - Upgraded: this directory, as `NN-name[-dark].png` for 01–10, `11-octoprint*`, `12-search*`, and `fp-*` for the full-page captures.
  - Main: `/private/tmp/claude-501/-Users-ap-development-other-eliotik-github-io/917b6b41-1b79-43b6-8c59-b21d1efcf946/scratchpad/t8v3/main-shots/`.
  - Noise run (up-B): `…/t8v3/visual-regression/up-B/`.

## 3. Main (pre-upgrade) vs upgraded: the task table

"exact px" counts pixels where any RGBA channel differs. "byte-identical" means the decoded RGBA buffers are equal. Every row also has the same `scrollHeight`, element count and `innerText` hash on both servers (heights and counts are listed where they are informative).

| # | Route | Theme | Mismatch % (pm 0.1) | exact px | Verdict | Explanation |
|---|---|---|---|---|---|---|
| 01 | `/` | light | 0.0000% | 0 (byte-identical) | PASS | Identical. h 1800/1800, 196/196 elements. Includes the TopTags `#tag` rows. |
| 01 | `/` | dark | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 02 | `/posts` | light | 0.0000% | 0 (byte-identical) | PASS | Identical. 156/156 elements; breadcrumb and pager match. |
| 02 | `/posts` | dark | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 03 | `/posts/ems-connecting-the-systems` | light | 0.0000% | 0 (byte-identical) | PASS | Identical. h 14586/14586. |
| 03 | `/posts/ems-connecting-the-systems` | dark | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 04 | `/posts/flutter-google-maps-embedded-map` | light | 0.0000% | 0 (byte-identical) | PASS | Identical. 7/7 images and 5 slides. The round Prev/Next buttons (`rounded-full`, `-translate-y-1/2`) match; their re-serialised CSS is covered in §4.1 and §4.3. |
| 04 | `/posts/flutter-google-maps-embedded-map` | dark | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 05 | `/tips` | light | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 05 | `/tips` | dark | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 06 | `/tags` | light | 0.0000% | 0 (byte-identical) | PASS | Identical. h 3029/3029. The filter-icon `-translate-y-1/2` renders the same (§4.1). |
| 06 | `/tags` | dark | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 07 | `/tags/engineering-management/` | light | 0.0000% | 0 (byte-identical) | PASS | Identical. The inline related-`#tag` rows and the `Home » Tags » …` breadcrumb, where compressHTML spacing problems would show, match. |
| 07 | `/tags/engineering-management/` | dark | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 08 | `/threads` | light | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 08 | `/threads` | dark | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 09 | `/about` | light | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 09 | `/about` | dark | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 10 | `/this-route-doesnt-exist` | light | 0.0000% | 0 (byte-identical) | PASS | Identical. HTTP 404 on both builds, as expected. |
| 10 | `/this-route-doesnt-exist` | dark | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 11 | `/posts/octoprint-prusa-core-one-raspberry-pi/` | light | 0.0000% | 0 (byte-identical) | PASS | Identical. h 39002/39002, 24 images, 3961/3961 elements. |
| 11 | `/posts/octoprint-prusa-core-one-raspberry-pi/` | dark | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| 12 | `/search/?q=hiring` | light | 0.0000% | 0 (byte-identical) | PASS | Identical. 5 results. |
| 12 | `/search/?q=hiring` | dark | 0.0000% | 0 (byte-identical) | PASS | Identical. |
| fp | `/` full page | light | 0.0000% | 0 (byte-identical) | PASS | 1280×1800 on both. The home page is exactly 1800 px tall, so this equals the viewport shot. |
| fp | `/` full page | dark | 0.0000% | 0 (byte-identical) | PASS | Same. |
| fp | `/posts/ems-the-delivery-system/` full page | light | 0.0000% | 0 (byte-identical) | PASS | 1280×7977 on both. A lazy-load pre-walk ran first, and all images were complete. |
| fp | `/posts/ems-the-delivery-system/` full page | dark | 0.0000% | 0 (byte-identical) | PASS | Same. |

**Result: 28/28 byte-identical, and 0 pairs above 0.1%.** No main-vs-upgraded diff PNGs were written, because none qualified. `diff/` holds only the April evidence (§5).

### 3.1 Supporting pixel checks

| Check | Result | Evidence |
|---|---|---|
| **Noise floor.** A second upgraded capture (up-B) diffed against up-A. | PASS | 28/28 byte-identical. |
| **v3 vs v2.** The upgraded v3 shots diffed against the committed `qa-runs/T-39-2026-09-v2/*.png`, which were verified at `63efd08`, before Tasks 17 and 17b. | PASS | **28/28 byte-identical.** The Tailwind source restriction, the og:image meta fix and the CLAUDE.md note changed no rendered pixel on these routes. |
| **Below the fold.** 1800-px scroll segments of 03, 04, 06 and 11, in both themes, on both servers: 84 pairs. | PASS | <ul><li>All 84 pairs have the same size and the same `scrollY`, and every visible image was loaded (`complete && naturalWidth > 0`).</li><li>83/84 are byte-identical.</li><li>`seg-11-octoprint-18` (light) has **17 exact px, 0 at pm 0.1**, in a 1-px column at x=777, y=159–188 and y=296, inside the downscaled `temperature-graph-cancel.webp`.</li><li>**Repeat test** (`repeat-seg.mjs`): that segment was captured 4× on each server. All 8 captures equal the original *main* capture (0 px), and all differ from the original up capture by the same 17 px.</li><li>So the 17-px variant was a one-off rasterisation of the downscaled image, and on repeat the upgraded build renders exactly like main. v2 saw the same artifact on the dark twin of this segment.</li></ul> |
| **DOM and metadata parity** on all 28 shots. Keys compared: status, final URL, title, data-theme, html class, body colours and font, loaded font count, `scrollHeight`/`scrollWidth`, element count, image count, broken images, slide count, innerText length and hash, console, page errors, bad responses. | PASS | <ul><li>The only differing key is `htmlChildren`: `[HEAD, BODY, IFRAME]` upgraded vs `[HEAD, BODY]` main, on all 28 shots.</li><li>That is the intended Task 14 change: the Partytown sandbox iframe (`/~partytown/partytown-sandbox-sw.html`) moved from `<body>` to `<html>`.</li><li>On both builds that iframe is `visibility: hidden` with a **0×0 rect** at (0, 1800), and heights and element counts are equal. So it does not render and does not shift layout.</li></ul> |
| **Console and network** (clean profile) | PASS (parity) | <ul><li>0 page errors on either build.</li><li>The only console error is the expected `404 (Not Found)` of the document on `/this-route-doesnt-exist`: 2 on each build.</li><li>The only failed requests are GA beacons aborted when each context closes. Upgraded: 32 `g/collect` + 1 `googletagmanager.com/td`; main: 30 `g/collect`.</li><li>No 4xx/5xx subresources on either build.</li></ul> |

## 4. CSS-reduction risk: computed styles, forced states and rule sets

Task 17b removed about 400 utility rules from the Footer bundle, which is loaded on all 127 generated pages. Screenshots cover only one width and the resting state. The lane therefore compared the two servers directly, in memory, on more widths, more states and more pages.

### 4.1 Computed-style comparator (`cstyle.mjs static`)

- **How each state is loaded.** Main and upgraded are loaded side by side. Before comparing, the comparator waits for `networkidle`, for no `astro-island[ssr]` left (hydrated), and for `document.fonts.ready`.
- **Element walk.**
  - Elements are walked in document order, keyed by tag path.
  - `script`, `style`, `link`, `meta`, `noscript`, `template` and the Partytown iframe are skipped.
  - Elements are not keyed by `class`: main emits a literal `undefined` class token on one LinkButton, which Task 15 removed. Class differences are reported separately.
- **What is recorded per element:**
  - every computed longhand (477 standard properties), plus all custom properties;
  - the same for `::before` and `::after`, `::marker` on list items and summaries, and `::placeholder` on inputs;
  - the element's `getBoundingClientRect` in document coordinates.
- **Normalisation.** `localhost:43xx`, Astro scope hashes (`astro-xxxxxxxx`) and `/_astro/*.<hash>.*` URLs are normalised.
- **Coverage:**
  - 21 page types: the 12 routes plus a `.md` TOC post, an `.mdx` post, `/posts/2/`, `/tips/2/`, a tip detail, a thread detail, `/tags/hiring/`, `/tags/engineering-management/2/` and `/posts/ems-the-delivery-system/`.
  - Widths **1280, 800, 700 and 375**. These straddle both breakpoints the CSS uses: `sm` at 640 px and `base.css`'s `max-width: 768px`.
  - Both themes.
  - Interactive states, as follows.

  | State | Where | Evidence it took effect |
  |---|---|---|
  | Hamburger menu open | `/` at 375 | `#menu-items` 176×329.875 on both builds |
  | Carousel scrolled to the end | 04 and 11 | Next `disabled`, Prev enabled; exercises the `disabled:` variants |
  | Every `<details>` open | TOC posts and 03 | — |
  | Tags filter `engin` + `a→z` sort | `/tags` | — |
  | "Expand all" | `/tips` and `/tips/2/` | — |
  | Search with no results | `/search/?q=hiring` | — |

| Measure | Result |
|---|---|
| Page states compared | **266**: 168 route×width×theme defaults + 98 interactive-state runs |
| Element comparisons | **221,564** (0 elements present on only one side) |
| Standard computed longhands that differ (elements and pseudo-elements) | **0** |
| Layout rects that differ | **0** |
| Custom-property differences outside `:root` | 456, all one signature. **`--tw-translate-y: -50%` (main) vs `calc(calc(1 / 2 * 100%) * -1)` (upgraded)** on `-translate-y-1/2` elements: the carousel buttons on 04 and 11, and the filter icon on 06. The consuming longhand `translate` and the rects are identical: 0 std and 0 rect differences on those elements. `--tw-translate-y` is a `syntax: "*"` custom property, so Chrome keeps the token text as written. This is a minifier re-serialisation (§4.3), not a value change. |
| Custom-property differences on `:root` | <ul><li>118 theme variables exist only on main. No upgraded rule references any of them, except `--ease-in-out`, whose single use carries an identical fallback (§4.3):<ul><li>unused palette colours such as `--color-cyan-*` and `--color-pink-*`;</li><li>`--container-*`, `--ease-in/out`, `--animate-spin`, `--leading-tight`, `--font-weight-normal`, `--drop-shadow-md`;</li><li>gradient, space and divide `--tw-*` initials.</li></ul></li><li>2 are re-serialised with equal values: `--text-base--line-height` `1.5` vs `calc(1.5 / 1)`, and `--text-3xl--line-height` `1.2` vs `calc(2.25 / 1.875)` (= 1.2).</li><li>The set is identical in all 266 runs, and nothing is added on the upgraded side.</li></ul> |
| `class` attribute differences | 226 element-in-state instances across the 266 runs, 2 patterns. **(a)** `inline-block group hover:text-skin-accent undefined` (main) vs no `undefined` token (upgraded), on the "All Posts" LinkButton on `/`: this is Task 15, and there is no `.undefined` rule on either build. **(b)** The carousel scroller's class tokens are reordered but form the same multiset: this is the R10 prettier-plugin-tailwindcss reorder in `ImageSliderClient.tsx` (`bfbc685`). Neither affects any computed value. |
| Theme / hydration | 266/266 have the correct `data-theme` on both sides, and 266/266 are hydrated on both. |
| Console | Only the expected document `404` on `/this-route-doesnt-exist`: 8 on each build. |

### 4.2 Forced `:hover` / `:focus` pass (`cstyle.mjs interactive`)

- **Setup.**
  - Chrome DevTools Protocol `CSS.forcePseudoState` is used on both servers, at 1280 px, in both themes, on all 21 page types.
  - For hover, `hover` is forced on the target **and every ancestor**, as a real pointer would.
  - For focus, `focus`, `focus-visible` and `focus-within` are forced on the target, and `focus-within` on its ancestors.
  - Forced states are cleared after each target.
  - For this pass only, `*,*::before,*::after{transition:none!important;animation:none!important}` is injected on both servers, so `transition-colors` cannot yield values read mid-transition.
- **`(hover: hover)` media query.** `matchMedia('(hover: hover)').matches` was **true** on all 84 runs. Tailwind v4 wraps `hover:` utilities in that media query, so the pass does exercise them.
- **Two modes, by page size.** Everything recorded carries the full computed style, pseudo-elements and rect, as in §4.1.

| Mode | Pages | Candidates (targets forced) | Recorded per target |
|---|---|---|---|
| **full** (60 runs) | 06–10, 12, and the 9 extra page types; all have ≤ 613 elements | **Every element.** The `::-webkit-scrollbar-thumb:hover` rule strips to `*`, so every element qualifies. | Ancestors, own subtree, the `.group` ancestor's subtree, and **every sibling's subtree**. None of these pages is big enough to reach the size caps. |
| **lean** (24 runs) | 01–05 and 11. On 04 and 11 every Expressive Code token `<span>` is an element, which makes full mode run for more than an hour per page. | The principled set, with the scrollbar-part rule excluded because it cannot be forced through element state: <ul><li>every `a`, `button`, `summary`, `input`, `label`, `li`, `svg`, `[tabindex]`, `.group`;</li><li>every element matched by the stripped superset of any `:hover`/`:focus*` rule's subject;</li><li>every **anchor**, meaning the compound that carries the state pseudo-class: `article.prose` for `.prose:hover :where(a)`, `.group` for `group-hover:*`, `figure.frame` for Expressive Code's `.frame:hover .copy button`.</li></ul> | Ancestors, the **uncapped** own subtree, and the `.group` subtree. |

**Why lean is sound here:**

- A state rule can only restyle elements that are descendants of a forced element (via descendant combinators), unless it uses a sibling combinator or `:has()`.
- `grep` of all four CSS bundles and all 208 distinct inline `<style>` blocks, on both builds, finds **no `:has()`**.
- It finds exactly **one** sibling-combinator state rule: `.expressive-code .frame:focus-within :focus-visible ~ .copy button`. It lives in `ec.s4b1i.css`, which is byte-identical on both builds (sha256 `73388dd2…` on each).
- Forcing a rule's subject covers "subject and ancestors hovered". Forcing its anchor with the whole subtree recorded covers "anchor hovered, descendants not".
- Lean controls C0, C5 and C6 (§4.4) show this path detects a deleted anchor rule.
- The first, killed full-mode attempt on 01–03 had also completed 12 runs, all with 0 mismatches (`cs-int-A-fullmode-partial.log`, scratch).

| Measure | Result |
|---|---|
| Forced targets | **9,996** in 84 runs (21 page types × 2 themes × hover and focus): full 6,830 and lean 3,166 |
| Element comparisons under forced state | **332,108**: full 256,840 and lean 75,268 |
| Targets where forcing changed at least one style or rect | main **6,714**, upgraded **6,714**. The target set is identical on both (0 candidates on one side only), and main and upgraded never disagreed on whether a state had an effect (0 "state effect" disagreements). |
| Standard longhand, pseudo-element or rect differences under forced state | **0**. These are **summed from the full per-target difference arrays** (the `summary` counts of all 142 mismatch entries): std 0, pstd 0, rect 0, elements on one side only 0, custom-property (non-`:root`) 174, class 18. The class differences are the §4.1 patterns. |
| Other differences | All **174** custom-property differences are the §4.1 `--tw-translate-y` serialisation, which is present in the resting state too, on the `-translate-y-1/2` elements of 04, 06 and 11. <ul><li>The pass inspects at most 8 elements per target. That accounts for 162 of the 174.</li><li>Only 2 targets had more than 8 differing elements: the `article.prose` anchor on 11, light and dark, with 14 each.</li><li>Main was rebuilt from the same commit (same `Footer.CKIJxfJt.css` asset), re-served on 4331, and those 2 targets were re-inspected with the cap at 50 (`cstyle.mjs article11`).</li><li>All 14 per theme have that same single signature, with std 0 and rect 0. So 162 + 2 × 6 = 174, and every difference is accounted for.</li></ul> |
| Console | 16 console errors, all on `10-404` (8 main, 8 upgraded). Each is the expected `Failed to load resource … 404` whose location is the document URL `/this-route-doesnt-exist`. There are two per build per run: one at page load, and one emitted after the forcing session attaches (`e404-probe.mjs`: `addStyleTag` plus CDP `CSS.enable` re-request the 404 document). There are 0 console errors on the other 20 page types and 0 page errors. |

### 4.3 Site-wide CSS rule-set diff (`cssrules.mjs`), the "removed rules are dead" proof

- **What was collected.** Every same-origin CSS rule applied on a page, flattened through `@layer`, `@media` and `@supports`:
  - on **all 129 HTML pages** in both themes, plus the interactive states from §4.1 and the 375-px menu;
  - **300 visits per build**.
- **How rules are keyed.** Each rule is keyed by Chrome's CSSOM serialisation, with scope hashes normalised. Two serialisation-only changes are also canonicalised:
  - `@media (min-width: 640px)` ≡ `(width >= 640px)`;
  - whitespace inside token lists.
- **How liveness is tested.** For each rule, a **superset selector** (all state pseudo-classes and pseudo-elements stripped) is run with `querySelectorAll` on the live DOM of every visit. A rule whose superset matches nothing on any page, in any theme or state, can never apply under any width, state or theme.

| Measure | Result |
|---|---|
| Distinct rules: main / upgraded / common | 1981 / 1566 / 1553 |
| Only on main | **428**: 402 dead + 12 global at-rules + 14 live-but-paired. <ul><li>**402 dead:** the superset matches **0 elements** on any of the 300 main visits. Their selectors name 399 distinct class tokens, and **0** of them appear on any element in any visit of either build. Of the 402, 395 are `@layer utilities` rules, such as unused palette colours (`.text-cyan-600`, `.bg-gray-800` …), gradients, `.space-y-*`, `.divide-*`, `.animate-spin`, `.ring-*` and `.max-w-*`.</li><li>**12 global at-rules**: 11 `@property` rules and `@keyframes spin`. They are used only by the removed gradient, space-y, divide-x and animate-spin utilities, and **no upgraded rule references any of those custom properties**.</li><li>**14 live-but-paired rules:** each has an upgraded counterpart with the same effect (next row).</li></ul> |
| The 14 live-but-paired rules | Each was checked against its upgraded counterpart. <ul><li>**Merged selectors, same declarations:**<ul><li>`body ::selection` + `body::selection` become one rule.</li><li>The `.prose li ::marker` pair becomes one rule.</li><li>`.flex-shrink-0, .shrink-0` becomes `.shrink-0`; `.flex-shrink-0` is used nowhere.</li><li>The reduced-motion `::view-transition-*` and `[data-astro-transition-scope]` rules become one rule.</li></ul></li><li>**Re-serialised values:**<ul><li>`.-translate-y-1/2` (§4.1).</li><li>`.rounded-full`: `3.40282e38px` vs `2147483647px`. **Computed value probed:** `border-*-radius` = `3.35544e+07px` on both builds, and the 40×40 button renders identically (§3).</li><li>The `--text-3xl--line-height` fallback `1.2` vs `calc(2.25/1.875)` inside `#main-content h1` and `.not-found-wrapper p`.</li></ul></li><li>**`:root` theme block:** minus the 118 unused variables.</li><li>**`@layer properties` fallback:** the union of main's three Footer blocks (65 properties) minus exactly the 11 removed gradient, space and divide properties equals the upgraded single block (54). No value differs.</li></ul> |
| Only on upgraded | **13**: the paired counterparts above, plus 3 rules that are dead on both builds. <ul><li>`.grow`, formerly `.flex-grow, .grow`.</li><li>`#hero h1`: no `#hero` element exists on any page, on either build.</li><li>`.astro-route-announcer`: the same 9 declarations, reordered. The element is created only during ClientRouter navigation.</li></ul> |
| Custom properties dropped from `:root` (§4.1) | <ul><li>`var(--x)` references in the upgraded dist, over all 147 css/html/js/mjs files: **1** of the 118, `--ease-in-out`. It is used as `var(--ease-in-out,cubic-bezier(.4, 0, .2, 1))` in the scoped `.menu-icon line` rule. main defined `--ease-in-out: cubic-bezier(.4, 0, .2, 1)`, which equals the fallback, so the hamburger icon's transition timing is unchanged.</li><li>`var(--x)` references in the main dist: 118 of 118, each only from the removed utilities.</li></ul> |
| DOM class vocabulary (all visits) | main 346 classes, upgraded 345. The only difference is `undefined` (main only; Task 15). |
| Rules the stripping made unparseable | 0 on either build. |

**Classes that reach the DOM outside `src/` markup.** Tailwind now scans only `src/`, so any class that reaches the DOM from outside `src/` markup is exactly what Task 17b could have dropped. Every such source was checked:

- **`astro.config.mjs`.** `remark-toc` and `remark-collapse` inject no classes (they emit plain `<details>`/`<summary>`). Expressive Code's CSS is a separate, byte-identical bundle (`ec.s4b1i.css` on both builds).
- **`public/toggle-theme.js`.** It sets only `data-theme` and reads computed style, with no `classList` calls. The inline theme script in `Layout.astro` adds and removes `dark`.
- **Runtime class mutations in `src`.** These are covered by the scan, and each state was also exercised:

  | Mutation | Covered by |
  |---|---|
  | `Header` `is-active`, `display-none!` | 375-px menu state |
  | `Tips` `is-expanded` | "Expand all" |
  | `PostDetails` `progress-*` and `heading-link`/`group` | Created on load, so present in every post visit |

- **Result.** All of those classes are present in the DOM that was matched, and **none of the 399 removed class tokens occurs in any visited DOM**.

### 4.4 Controls: the comparators can see a difference

| Control | Result | Evidence |
|---|---|---|
| C1 Forced hover changes a known `hover:` link on both servers | PASS | Header "Posts" link: `rgb(40, 39, 40)` → forced hover `rgb(0, 108, 172)` → cleared `rgb(40, 39, 40)`, identical on main and upgraded. |
| C2 Deleting one used rule from the upgraded page's CSSOM is flagged by the static comparator | PASS | Deleted `.text-skin-accent { color: var(--color-skin-accent) }`, which matches 6 elements on `/`. The comparator went from std=0 to **std=11**: the 6 links plus inheriting descendants. |
| C3 Deleting the upgraded page's nav-link `:hover` rule is flagged by the forced-hover pass | PASS | Deleted `nav … a:where(.astro-…):hover { color: … }`. The pass flagged "state effect main=true up=false" and a `color` / `caret-color` difference: `rgb(0,108,172)` vs `rgb(40,39,40)`. |
| C4 Same target, no mutation → clean | PASS | 1 candidate, state effect on both servers, 0 mismatches. |
| C0 (lean) `article.prose` is forced as an anchor candidate | PASS | On `/posts/ems-the-delivery-system/`: 1 candidate, 155 subtree elements recorded, 0 mismatches. No state effect on either build, as expected: `hover:prose-a:text-skin-accent` is overridden by `prose-a:!text-skin-base` (`!important`) on both builds. |
| C5 (lean) Deleting an anchor-only rule from the upgraded page is flagged | PASS | Deleted `.expressive-code .frame:hover .copy button:not(:hover) … { opacity: 0.75 }`. Target: the first `figure.frame`, which is a candidate **only** through the anchor logic. Flagged "state effect main=true up=false", and the copy `BUTTON` `opacity` is `0.75` (main) vs `0` (upgraded). |
| C6 (lean) Same anchor, no mutation → clean | PASS | 1 candidate, 280 elements recorded, state effect on both servers, 0 mismatches. |

Earlier sensitivity controls for whitespace between inline elements (the compressHTML failure mode), a single NBSP and a 1-px shift were run in v2 (§3.1 there). They used the same capture and diff code, which is unchanged here apart from paths.

## 5. Upgraded (light) vs the April baseline `baseline/NN-*.png` (step 4)

I Read all 10 April/upgraded pairs, listed below. For attribution, the lane re-captured the upgraded site at a **1268-px** layout width, matching the April capture's 12-px classic scrollbar gutter, and diffed columns 0–1267 against April.

- **Those 10 aligned captures are byte-identical to v2's aligned captures, and they give identical pixel counts.** v2 attributed every aligned band to one of three sources, and those attributions still apply unchanged:
  - the April environment (T-30);
  - Chrome 153 (April-end code `bdb9350` rendered today);
  - post-April `main` commits.
- Aligned diff PNGs are in `diff/april/NN-*-april-vs-up-aligned1268.png`.
- Capture-environment facts behind these results:
  - **(a) Scrollbar gutter.** `html { overflow-y: scroll }` with a 12-px `::-webkit-scrollbar`. The April capture tool painted the gutter; Playwright headless runs with `--hide-scrollbars`. So the layout is 1280 px wide instead of 1268, and the centred column moves **+6 px** (April x=266 → now x=272).
  - **(b) Dev toolbar.** The April shots were taken on `astro dev`, so the dev-toolbar pill appears at y≥1782. These shots come from the production preview.

| # | Route | pm 0.1 unaligned | pm 0.1 aligned 1268 | Verdict | What differs (from Reading both images; bands from the aligned diff) |
|---|---|---|---|---|---|
| 01 | `/` | 1.8783% | 1.6402% | PASS | **Content added since April:** OctoPrint (`3df6160`) and "Two books…" (`33f6bde`) are now at the top of Recent Posts, which pushes "Connecting the Systems" down and drops "The Decision/Information System" from the 4-item list. The **Top tags** section was added in `13deae2` (2026-05-07, on main). Also (a), (b), and the April-era nav offset: nav text sits a few px left of April, which T-30 already showed in April. Header, fonts, colours and the theme icon are unchanged. |
| 02 | `/posts` | 1.8611% | 1.6116% | PASS | **Content:** 2 new posts at the top. Still 5 per page, pager `1 / 6`. The active "Posts" wavy underline renders slightly differently in Chrome 153, with the same classes since `d8bf57e`. Also (a), (b) and the nav offset. |
| 03 | `/posts/ems-connecting-the-systems` | 4.4359% | **0.1706%** | PASS | Text, line breaks and spacing are identical. The aligned bands are only the header nav band y42–60 and the dev toolbar y1782–1799. The high unaligned figure is entirely the +6-px shift on a dense text column. (This post has 0 `<img>` on every build; see Observations.) |
| 04 | `/posts/flutter-google-maps-embedded-map` | 2.3411% | 0.6891% | PASS | **Expected pure-CSS scroll-snap carousel** (flowbite removed in April), with the round Prev/Next buttons added on main in `0ce59e8`, T-36. Prev is disabled at the start. The slide image is the same. Chrome 153 renders the dashed "First post" underline with longer dashes and the TOC summary about 3 px wider, and code lines sit 1 px higher. v2 showed the same on April-end code. |
| 05 | `/tips` | 1.5100% | 1.3299% | PASS | The **Tips listing redesign on main** (`465cc8c`, 2026-05-07) adds NOTE numbering, a "5 notes · page 1 of 2" status bar, "Expand all" and an inline pager. The footer now sits at y≈1122 because of that redesign; main is identical. Also (a), (b) and the nav. |
| 06 | `/tags` | 1.5041% | 0.7013% | PASS | **Content:** 63 → 68 tags, and counts changed (engineering-management 14 → 15; hiring 2 → 3; new `recruiting`, `3d-printing`, `home-lab` …), so rows reorder. The filter box, the `by count / a→z` toggle and the bars are unchanged, and so is the `#` to tag-name spacing. Also (a) and the nav. |
| 07 | `/tags/engineering-management/` | 2.1164% | 1.5333% | PASS | **Content:** 14 → 15 articles, with "Two books…" first. `#hiring` moved into the first related-tags row (count 3). Pager `1 / 3`. Spacing between inline related-`#tag` links matches April. The other differences are (a), (b), the nav, and Chrome's 1-px text placement. |
| 08 | `/threads` | 1.7342% | 0.2395% | PASS | Content identical. The remaining differences are (a), (b), the nav, and Chrome 153 placing headings 1 px higher (the same on April-end code, per v2). |
| 09 | `/about` | 2.9787% | 0.1792% | PASS | Content identical. Chrome 153 renders the list bullets and the fallback-font kaomoji `( ๑ ˃̵ᴗ˂̵)و` differently (the same on April-end code, per v2). Also (a), (b) and the nav. |
| 10 | `/this-route-doesnt-exist` | 0.5484% | 0.1873% | PASS | The only differences are (a), (b), and the "Go back home" dashed underline, which has longer dashes in Chrome 153. It has the same classes since `d8bf57e`, and April-end code in Chrome 153 gives the identical 383 px (v2). |

**Result:** every difference from April is content added since April, the expected pure-CSS carousel with its T-36 buttons, two post-April `main` features (TopTags and the Tips redesign), the capture environment (gutter, dev toolbar, nav offset already present in T-30), or Chrome 153 rendering, which is identical on April-end code. None comes from T-39, since main is byte-identical to the branch (§3). There are no missing images or components, no broken theming and no font loss, and inline spacing is unchanged.

## 6. Cleanup (step 6)

- **Stopping main's preview.** It ran Astro **6.2.1**, which is *not* a daemon and has no `preview stop` subcommand: `grep stop` in `node_modules/astro/dist/cli/{index,preview/index}.js` finds 0 matches. Running `pnpm astro preview stop` in the repo would have hit the Astro 7 daemon on 4321, which must stay up. So after `lsof` confirmed that the 4331 listener, PID 19801, had its cwd at `…/t8v3/main-before`, the lane stopped it and its `pnpm` parent, PID 19773, with SIGTERM. **This departs from the brief's stop command, as v2's lane did.**
- **Ports after stopping.** `lsof -iTCP:4321-4340 -sTCP:LISTEN` shows only PID 3520 on 4321. `curl` returns 4321 = `200` and 4331 = `000`.
- **Worktree.** `git worktree remove --force …/t8v3/main-before` exited 0, followed by `git worktree prune`. Main was later re-created once more, from the same commit, for the detail-cap re-inspection in §4.2: Node 22.22.2, install exit 0, build exit 0, `127 page(s) built`, `Complete!`, same `Footer.CKIJxfJt.css`. It was served on 4331 and stopped the same way (PID 15115 plus its `pnpm` parent 15097, cwd confirmed), then removed again with `git worktree remove --force` and `git worktree prune`. `git worktree list` now shows only `~/development/other/eliotik.github.io 9eb1ec3 [upgrade/2026-09]`. The `site-wide-main` worktree (another lane's) appeared in `git worktree list` at the start. By cleanup time its directory no longer existed. This lane did not create or remove it; `git worktree prune` only cleared its stale metadata.
- **The upgraded `dist/` is unchanged.** The sorted sha256 list of all 362 files hashes to `272b40eb43f3fda501093be6c796ebcea03b0098` both before the first capture and after the last one.
- **Repo state.** HEAD is still `9eb1ec391aedca5a7ad615f37d53568f0a0f2aa0`. `git status --porcelain` shows only `?? .claude/`, `?? .serena/` and `?? docs/library-packages-upgrade/qa-runs/T-39-2026-09-v3/`, and `git diff --stat` is empty. No tracked file was modified; this lane wrote only under `qa-runs/T-39-2026-09-v3/` (untracked) and scratch.
- **Screenshot integrity.** All 28 upgraded PNGs in this directory still decode to the same bytes as the up-B noise run (28/28). Their mtimes all fall within the up-A capture window, 19:05:57Z–19:07:17Z, so no concurrent lane overwrote them.

## 7. Observations (non-failing)

1. **Serialisation-only CSS changes from the branch's build toolchain.** These come from the Astro 7 / Vite 8 CSS pipeline and lightningcss 1.33.0: the branch lockfile has 1.33.0 alongside 1.32.0, while main has only 1.32.0 (T7 note). These changes appear:
   - `-translate-y-1/2`: `-50%` becomes `calc(calc(1 / 2 * 100%) * -1)`;
   - `rounded-full`: `3.40282e38px` becomes `2147483647px`;
   - line-heights: `1.5` / `1.2` become `calc(…)`;
   - media queries: `min-width` becomes range syntax;
   - duplicate selectors and `@layer properties` blocks are merged.

   All were verified equal by computed value and pixels. They are build-output drift from Tasks 4, 7 and 13, as the brief expected, not Task 17b.
2. **One transitive difference in a removed variable.** `--ease-in-out` was dropped from `:root`, but its only remaining user has an identical fallback (§4.3). If a future edit uses the `ease-in-out` utility from `src/`, Tailwind will emit the variable again.
3. **Route 03 has no images.** `baseline/SCREENSHOTS.md` calls 03 (`ems-connecting-the-systems`) a "post with multiple inline images", but it has 0 `<img>` on every build (also noted in v2). Images are exercised by 04 (7) and 11 (24 images, 16 slides).
4. **Tips footer position.** On `/tips` at 1800 px the footer sits mid-viewport. This comes from the Tips redesign on main (`465cc8c`), and main renders the same. It is a design matter, not T-39.
5. **Segment render noise.** A one-off 17-px ±1-LSB variant appeared in a downscaled webp on `seg-11-octoprint-18` (§3.1). It is not reproducible, and 8/8 repeat captures on both servers are identical.
6. **An inert hover rule, the same on both builds.** `hover:prose-a:text-skin-accent` in `src/styles/base.css:126` compiles to `.prose:hover :where(a) { color: accent }`. `prose-a:!text-skin-base` (`!important`) in the same `@apply` overrides it, so hovering an article never recolours its links. This is identical on main and the branch (control C0), so it is not a regression. It is a pre-existing design no-op.

## 8. Artifacts

- `NN-name.png` / `NN-name-dark.png` (01–12) and `fp-home[-dark].png`, `fp-ems-the-delivery-system[-dark].png`: the upgraded captures (this directory).
- `lane-visual-regression.json` contains:
  - capture metadata for up-A, main and up-B;
  - every pixel diff (byte, exact, threshold-0 and threshold-0.1 counts, bounding boxes) for main-vs-up, up-A-vs-up-B, v2-vs-v3, the 84 segments, and April (unaligned and aligned);
  - the segment repeat;
  - the computed-style summaries (static and forced-state, with per-run counts and difference signatures);
  - the controls;
  - the full site-wide rule-set diff, listing every only-main and only-upgraded rule with its match counts.
- `diff/april/NN-*-april-vs-up-aligned1268.png`: aligned April diff PNGs. There are no main-vs-upgraded diff PNGs, because every pair is 0 px.
- `visual-regression-scripts/*.mjs.txt`: capture, segments, diff, computed-style comparator, rule-set diff, removed-variable reference check, segment repeat and aggregator. `ignore-root-vars.txt` lists the 120 `:root` variables excluded from the per-element custom-property hash; they are compared separately in §4.1.
- Scratch, not in the repo: main shots in `…/t8v3/main-shots/`; in `…/t8v3/visual-regression/`, the up-B shots, segment PNGs, repeat captures, aligned captures, and raw comparator outputs (`cs-static-*.json`, `cs-int-*.json`, `cr-*.json`).
