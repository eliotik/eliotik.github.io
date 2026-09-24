# End-to-End Verification Report: September 2026 upgrade (T-39, Task 8)

This file holds two runs of Task 8 (spec §5.2, final local verification):

- **v2** (top) verifies the final tree, `63efd08`. It is the verification of record.
- **v1** (bottom) verified `55a6530`, before Task 8b and Phase 2. It is kept unchanged as history, with one added line under its verdict.

Section references (§) inside each part point to that part's own sections.

---

## v2 — final (commit 63efd0867a0ba7fa14759fe98cfe0d1b363ce7a5)

**Date:** 2026-09-24. The recorded lane timestamps run from 16:27Z (build) to 17:01Z (playwright-e2e run 2), UTC. This report was written at 17:28Z.
**Operator:** claude-opus-5-5, the T-39 Task 8 v2 QA report writer. The results come from six QA lanes (R2): build, chrome-islands, playwright-e2e, visual-regression and site-wide ran against this commit; devtoolbar is carried over from Task 8b (§6).
**Commit verified:** `63efd0867a0ba7fa14759fe98cfe0d1b363ce7a5` on branch `upgrade/2026-09`. The build lane built `dist/` from it at 16:29:02Z (after the HEAD commit time); the served pages carry `<meta name="generator" content="Astro v7.3.5">`.
**Spec:** `docs/library-packages-upgrade/2026-09-23-upgrade-design.md` (§1 success criteria, §5.2 final local verification, §7 Phase 2 addendum).
**Pre-upgrade reference:** `main` at `3df6160395385555a22efd646626e6a009114a7d` (Astro 6.2.1). The visual lane built it in a scratch worktree (Node 22.22.2, pnpm 10.33.2, `astro check` 0 errors, 127 pages) and served it on :4331. The site-wide lane used a read-only `rsync` snapshot of that build's `dist/`. The playwright-e2e lane built its own copy of main for one probe (served on `[::1]:4333`). April-end `bdb9350` (Astro 6.1.10, :4332) was used only to explain differences from the April baseline.
**QA artifacts:** `docs/library-packages-upgrade/qa-runs/T-39-2026-09-v2/`: `lane-build.md`, `lane-chrome-islands.md`, `lane-playwright-e2e.md`, `lane-visual-regression.md` (+ `.json`), `lane-site-wide.md`, `build.log`, `stack.txt`, `peers.txt`, `outdated.txt`, screenshots, `chrome-islands/`, `playwright/`, `diff/april/`, and the harness scripts as `*.mjs.txt`.

**Overall: FAIL.** There is one open failure, site-wide W7 (§5): every post page's `og:image`/`twitter:image` URL returns 404. That URL is the same on `main` and in production, so T-39 did not introduce it, but the check is absolute and no ruling excludes it (§11, §12). v1's only failure, the Partytown `proxytown` console error on ClientRouter navigation, is fixed (§3). Every other check passes.

**Stack snapshot** (`qa-runs/T-39-2026-09-v2/stack.txt`, captured 2026-09-24T16:29:22Z after a clean `pnpm install --frozen-lockfile`):

- Node `v22.23.3` (`.nvmrc`; the latest v22 LTS "Jod")
- pnpm `10.34.5` (`packageManager`; registry `latest-10`)
- `pnpm list --depth 0` (exit 0, 40 direct packages: 19 dependencies, 21 devDependencies):

```
dependencies:
@astrojs/check 0.9.10            @astrojs/markdown-remark 7.3.1   @astrojs/mdx 8.0.2
@astrojs/partytown 2.1.8         @astrojs/react 7.0.0             @astrojs/rss 4.0.19
@astrojs/ts-plugin 1.10.12       @expressive-code/plugin-collapsible-sections 0.44.2
@expressive-code/plugin-line-numbers 0.44.2                       @resvg/resvg-js 2.6.2
astro 7.3.5                      astro-expressive-code 0.44.2     fuse.js 7.5.0
github-slugger 2.0.0             remark-collapse 0.1.2            remark-toc 9.0.0
satori 0.33.5                    sharp 0.35.4                     tailwindcss 4.3.3

devDependencies:
@divriots/jampack 0.34.1         @eslint/js 10.0.1                @tailwindcss/typography 0.5.20
@tailwindcss/vite 4.3.3          @types/node 22.20.4              @types/react 19.3.0
@types/react-dom 19.3.0          @typescript-eslint/eslint-plugin 8.70.1
@typescript-eslint/parser 8.70.1                                  astro-eslint-parser 3.2.0
eslint 10.11.0                   eslint-plugin-astro 3.2.1        eslint-plugin-jsx-a11y-x 0.2.0
husky 9.1.7                      lint-staged 17.5.1               prettier 3.9.9
prettier-plugin-astro 1.0.1      prettier-plugin-tailwindcss 0.8.1
react 19.3.0                     react-dom 19.3.0                 typescript 6.0.3
```

Changes from v1's snapshot: astro 7.3.4 → **7.3.5**, astro-eslint-parser 3.1.0 → **3.2.0**, `@astrojs/sitemap` 3.7.4 → **removed**, `@types/node` **22.20.4 added** (exact), pnpm 10.33.2 → **10.34.5**. Node is unchanged.

Notable transitive versions (from `pnpm-lock.yaml` at this commit): vite `8.3.0` (unchanged from v1); `@qwik.dev/partytown` `0.14.4` (unchanged); `@astrojs/compiler-rs` `0.5.0` (via astro 7.3.5 and astro-eslint-parser 3.2.0) plus `0.4.1` (still required by prettier-plugin-astro 1.0.1's own `^0.4.0` range).

Test browsers:
- The user's Chrome 151 (macOS, Default profile with extensions, including uBlock Origin Lite), driven through Claude in Chrome. The window was hidden (§1.1).
- Google Chrome 153.0.8010.53, headless, through Playwright 1.63.0 (`channel: 'chrome'`), with a clean, non-persistent context per test group (playwright-e2e P0–P8, visual-regression, `pt-repro`).
- WebKit 17.4 and Firefox 125.0.1, the cached Playwright 1.44.1 builds (playwright-e2e P9). Playwright's WebKit is not Safari; real Safari was not tested.

---

### 1. Verification protocol results (gate)

Source: the build lane (`qa-runs/T-39-2026-09-v2/lane-build.md`, `build.log`). It started from a clean tree on Node v22.23.3, and every command ran through `rtk proxy` so the output was not filtered. B11 and B12 were run by the report writer.

| # | Check | Result | Evidence |
|---|---|---|---|
| B0 | Ports 4321-4340 free, no stray Astro daemons | PASS | `lsof -iTCP:4321-4340 -sTCP:LISTEN` exited 1 with no output, both at the start and just before the preview started. `pnpm astro preview status`: "No preview server is running."; `pnpm astro dev status`: "No dev server is running." |
| B1 | Clean tree (`rm -rf node_modules .astro dist`) | PASS | `ls -d node_modules .astro dist` then reported "No such file or directory" for all three. |
| B2 | `pnpm install --frozen-lockfile` | PASS | exit 0. "Lockfile is up to date, resolution step is skipped"; `Packages: +719`; "Done in 2.2s using pnpm v10.34.5". No warn, peer, deprecated, error, ignored or build-script lines. `pnpm-lock.yaml` sha256 `cb7f0f70…d6aea1` was unchanged across the whole lane. |
| B3 | `pnpm astro check` | PASS | exit 0. `Result (77 files): - 0 errors - 0 warnings - 0 hints`. |
| B4 | `pnpm lint` | PASS | exit 0 with no diagnostics. `eslint . -f json` linted 74 files (34 .astro, 27 .ts, 11 .tsx, 1 .js, 1 .mjs): 0 errors, 0 warnings, 0 fatal, 0 deprecated-rule usages. |
| B5 | `pnpm format:check` | PASS | exit 0: "All matched files use Prettier code style!" `prettier . --list-different` prints 0 lines. `prettier --file-info` reports none of the 34 tracked `.astro` files as ignored, so R22's enforcement is real. |
| B6 | `pnpm build` (`astro check && astro build && jampack ./dist`) | PASS | exit 0 in 24 s. Embedded check: 77 files, 0/0/0. `[build] 127 page(s) built in 13.04s`, `[build] Complete!`. jampack: `✔ 308 files \| 49.01 MB → 46.16 MB \| -2.85 MB`, `✔ No issues`. `dist/` has 362 files, 130 of them .html, including the 5 `~partytown/` assets, `rss.xml` and the index plus 5 custom sitemaps. The only warnings are the 9 known `[WARN] [vite] [MODULE_LEVEL_DIRECTIVE] "use astro:head-inject"` lines, one per .mdx post (§10). |
| B7 | Stack snapshot | PASS | `stack.txt` (above): each of the 40 resolved versions matches its `package.json` spec. |
| B8 | Peer check (R11) | PASS | See §8. No new unmet peer. |
| B9 | `pnpm outdated`: registry latest except the caps | PASS | Lists only `typescript (dev) 6.0.3 → 7.0.2` (peer-range cap) and `@types/node (dev) 22.20.4 → 26.6.2` (R27 cap). See §9. `pnpm outdated` exits 1 whenever it lists anything. |
| B10 | Shared preview on :4321 | PASS | `pnpm astro preview --port 4321` → "Preview server running at http://localhost:4321 (pid 18132)". `curl /` → 200, and the served `/` is byte-identical to `dist/index.html` (sha256 `d838393d…216389`). Smoke test: 16 routes (pages, RSS, sitemap, OG images, the 3 Partytown assets) → 200 with the right content types; an unknown route → 404. It binds IPv6 loopback only, so lanes used `http://localhost:4321`. The playwright-e2e and visual lanes found it still at 200 when they finished. |
| B11 | Gate re-run at report-commit time (report writer, on the final QA directory contents) | PASS | `pnpm lint` exit 0; `pnpm format:check` exit 0 ("All matched files use Prettier code style!"); `pnpm astro check` exit 0 with `Result (77 files): 0 errors, 0 warnings, 0 hints`. The QA directory contains no `.js`/`.mjs` files: every harness script is archived as `*.mjs.txt`, so `eslint .` does not pick them up (v1 §1 B11). |
| B12 | Teardown at report time (report writer) | PASS | `pnpm astro preview status` showed pid 18132 running (uptime 2813 s); `pnpm astro preview stop` printed "Stopped preview server (pid 18132)." `lsof -iTCP:4321-4340 -sTCP:LISTEN` then exited 1 with no listeners; `astro preview status`: "No preview server is running."; `astro dev status`: "No dev server is running."; `curl http://localhost:4321/` → 000. `git worktree list` shows only the main checkout (`63efd08 [upgrade/2026-09]`), so every lane's scratch worktree is gone. |

Gate output tail (`build.log`, lines 9-12, 331-332, 992, 1014):

```
Result (77 files):
- 0 errors
- 0 warnings
- 0 hints
[build] 127 page(s) built in 13.04s
[build] Complete!
✔ 308 files | 49.01 MB → 46.16 MB | -2.85 MB
 ✔ No issues
```

#### 1.1 Step 2: browser window visibility

| Check | Result | Evidence |
|---|---|---|
| `document.visibilityState` in the user's Chrome (chrome-islands lane) | PASS (after switching to Playwright, as plan Step 2 requires) | **`"hidden"`**, with `document.hidden === true`, `hasFocus() === false`, outer size 0×0, inner 1040×1449 after resizing to 1280×1800. The lane measured what that means: the document timeline stayed at 0 for about 20 s, `requestAnimationFrame` and `IntersectionObserver` never fired, and CSS transitions stayed at t=0; frames are produced only when the extension takes a screenshot. Real typing and real wheel scroll work; smooth scroll from a Next click stalls (0 → 2.5 px); a trusted click made before the first frame after a full navigation is dropped. The lane delegated the Next/Prev scroll-delta checks to Playwright and used **no** native setter, `el.click()`, `scrollLeft =` or instant-scroll substitute. Every click it cites as evidence was `isTrusted` and made after a frame. |
| `document.visibilityState` in Playwright (playwright-e2e lane) | PASS | `"visible"` on 34 of 34 recorded visits. All authoritative real-input checks below come from this lane. |

#### 1.2 Step 2a: Partytown service worker (ruling R20)

| Check | Result | Evidence |
|---|---|---|
| 2a.1 Partytown assets on the branch | PASS | `/~partytown/partytown.js` → 200 text/javascript (3198 B); `/~partytown/partytown-sw.js` → 200 text/javascript (47177 B); `/~partytown/partytown-sandbox-sw.html` → 200 text/html (45949 B). curl (`playwright/p0-curl.txt`) and in-page `fetch` (P0.1) agree. |
| 2a.2/2a.3 Clean headless profile, branch :4321 (**authoritative**) | PASS | Playwright P0 (`P0.2.sw-registration`, `P0.2.console-zero`): `navigator.serviceWorker.getRegistrations()` returns `[{scope: http://localhost:4321/~partytown/, active: …/partytown-sw.js, state: activated}]`, with no registration error; the P0 context logged 0 console errors and 0 warnings. gtag runs inside Partytown: gtag.js is fetched from the sandbox, and the `text/partytown` scripts become `text/partytown-x` (executed). |
| 2a (characterisation) The SW error in the user's Chrome profile | PASS (R20: extension-caused, observation only) | Chrome lane PT-1: every full load logs `TypeError: Failed to register a ServiceWorker for scope ('…/~partytown/')`. An in-page `fetch('/~partytown/partytown-sw.js')` fails with "Failed to fetch", while `curl` of the same URL returns 200, so a client-side blocker stops the request (uBlock Origin Lite's rule on `/partytown-sw.js`, as characterised in v1 §1.2). New in v2: when registration fails, the Partytown 0.14.4 snippet falls back to running the scripts on the main thread and never creates the sandbox iframe. That is why PT-1/PT-2 could not be observed in this profile (§3). |

---

### 2. React islands (spec §5.2)

Evidence lanes:
- **Chrome** = chrome-islands (`lane-chrome-islands.md`): the user's Chrome, hidden window.
- **PW** = playwright-e2e (`lane-playwright-e2e.md`, `playwright/results.json`, 291/291 checks; the repeat `results-run2.json` is also 291/291): clean headless Chrome 153, visible document.
- **P9** = the same lane's cross-browser smoke on WebKit 17.4 and Firefox 125.0.1 (`playwright/xb-webkit.json`, `xb-firefox.json`).

Where the hidden window stopped the chrome lane from completing a real-input check, plan Step 2 allows switching to headless Playwright. Such a row is graded on the Playwright result and cites both lanes.

#### 2.1 `ImageSliderClient` (`client:only="react"`)

| Island | Page | Check | Result | Evidence |
|---|---|---|---|---|
| ImageSliderClient | `/posts/octoprint-prusa-core-one-raspberry-pi/` | 3.1 Carousels present, slide count = N | PASS | Chrome S3-O1: 7 `[aria-roledescription=carousel]`, N = 2,2,2,3,3,2,2 (16 slides); each `clientWidth` 734, `scrollWidth` N×734; `scroll-snap-type: x mandatory`; all 7 islands hydrated. PW P1: 7 carousels = 7 slider islands, N equal to each island's props. |
| ImageSliderClient | octoprint | 3.2 Every slide `<img>` has `complete && naturalWidth>0` | PASS | Chrome S3-O2: 0/16 right after load (the slides are `loading="lazy"` and the hidden tab runs no IntersectionObserver). After bringing each carousel into view and a real wheel scroll to slide 2 of the 3-slide carousels: 16/16. All 16 sources also return 200 image/webp and decode. PW P1: every image loaded after walking the slides. `loading="lazy"` is unchanged from main. |
| ImageSliderClient | octoprint | 3.3 Start state: Prev disabled, Next enabled | PASS | Chrome S3-O3 (light and dark) and PW P1: all 7 at `scrollLeft 0`, Prev `disabled`, Next enabled. |
| ImageSliderClient | octoprint | 3.4 Next = +1 slide width; N−1 clicks reach the end (Next disabled); Prev = −1 slide | PASS (via PW) | Chrome S3-O4: a trusted click landed on carousel 0's Next, but smooth scroll cannot advance in the hidden window (0 → 2.5 px), so no delta is claimed and the check is delegated. PW P1 desktop (128/128 checks across 9 carousels): a real mouse click on Next moves +734 at every step; walking to the end reaches `scrollWidth − clientWidth` with Next disabled; Prev moves −734; focusing Next and pressing Enter or Space moves +734 with page `scrollY` unchanged. |
| ImageSliderClient | octoprint | 3.5 Partial horizontal scroll snaps to a slide edge | PASS | Chrome S3-W (real input): wheel scrolls on carousels 3 and 4 rest at 734, `scrollLeft % clientWidth = 0`. PW P1: a 40% wheel (287 px) moves the scroller and snaps back to offset 0, both from the start and from the end; a 70% wheel advances exactly one slide (mod 0). |
| ImageSliderClient | octoprint | 3.6 Labels read "Slide k of N" | PASS | Chrome S3-O5: all 16 `aria-label`s match their position. PW P1: the same on every carousel. |
| ImageSliderClient | octoprint | 3.7 After a theme toggle, checks 1 and 3 still pass and the carousel is readable | PASS | Chrome S3-O6: a real `#theme-btn` click switched dark → light (`data-theme=light`, body `rgb(251,254,251)`); all 7 still at the start state; button colours follow the theme. Screenshot `chrome-islands/02-octoprint-carousel1-light.jpg`. PW P1-dark (11/11): a toggle click switched light → dark; all 9 carousels (both posts) at the start state; Next icon contrast 9.63:1 on body `rgb(33,39,55)`. Screenshot `playwright/screenshots/dark-carousel-octoprint-prusa-core-one-raspberry-pi.png`. |
| ImageSliderClient | octoprint, 375×812 touch | Mobile slider (extra) | PASS | PW P1-mobile (99/99): `clientWidth 341`; taps on Next/Prev move ±341; Enter/Space move +341; a 40% CDP touch swipe (133-137 px) snaps back to offset 0 and a 70% swipe advances one slide; all images loaded. Screenshot `playwright/screenshots/mobile-carousel-octoprint.png`. |
| ImageSliderClient | `/posts/flutter-google-maps-embedded-map/` | 3.1 Carousels present, slide count = N | PASS | Chrome S3-F1: 2 carousels, N = 2 and 3, `clientWidth` 734, `scrollWidth` 1468 and 2202, both hydrated. PW P1: 2 carousels = 2 islands, N equal to the props. |
| ImageSliderClient | flutter | 3.2 Images loaded | PASS | Chrome S3-F2: 0/5 at load, 4/5 once in view, 5/5 after a real wheel scroll to slide 2 of carousel 1 (all 200 image/png and decodable). PW P1: all loaded after the walk. |
| ImageSliderClient | flutter | 3.3 Start state | PASS | Chrome S3-F3 (light and dark) and PW P1: `scrollLeft 0`, Prev disabled, Next enabled. |
| ImageSliderClient | flutter | 3.4 Next/Prev movement | PASS (via PW) | Chrome S3-F4: delegated (hidden window). PW P1: Next +734 at every step, the end reached after N−1 clicks with Next disabled, Prev −734, Enter/Space +734, on both carousels. |
| ImageSliderClient | flutter | 3.5 Snap after a partial scroll | PASS | Chrome S3-W (real wheel, 0-based carousel 1): right → 734 (mod 0, Prev and Next enabled); right again → 1468 = `scrollWidth − clientWidth` with Next disabled; left → 734. PW P1: a 40% wheel snaps back to offset 0 and a 70% wheel advances one slide, on both carousels. |
| ImageSliderClient | flutter | 3.6 Labels | PASS | Chrome S3-F5: `Slide 1 of 2`, `Slide 2 of 2`; `Slide 1 of 3` … `Slide 3 of 3`. PW P1: the same. |
| ImageSliderClient | flutter | 3.7 After a theme toggle | PASS | Chrome S3-F6: a real toggle switched light → dark; both carousels still at the start state and readable (`chrome-islands/03-flutter-carousel1-light.jpg`, `04-flutter-carousel1-dark.jpg`). PW P1-dark: start state holds on both. Screenshot `playwright/screenshots/dark-carousel-flutter-google-maps-embedded-map.png`. |
| ImageSliderClient | both posts | 3.8 Console `error\|hydrat\|warning` shows nothing new | PASS | Chrome S3-O7/S3-F7: every full load of both posts logged exactly one message, the R20 SW-registration TypeError; no hydration messages, warnings or `Uncaught`. PW: 0 console errors, 0 warnings and 0 page errors from any source on both runs; P7 found 0 hydration messages. |

No GIF was produced for Step 3. Exporting from `gif_creator` requires a browser file download, which the lane did not trigger. The per-step `scrollLeft` measurements above, the screenshots in `chrome-islands/` and `playwright/screenshots/`, and PW P4b's per-frame theme sampling (§2.4) are the substitute evidence.

#### 2.2 `Search` (`client:load`, `/search/`)

| Island | Page | Check | Result | Evidence |
|---|---|---|---|---|
| Search | `/search/` | 4.1 Typing `hiring` lists results | PASS | Chrome S4-1: real typing produced trusted `insertText` events h → … → hiring, and the page shows "Found 5 results for 'hiring'" (ems-the-people-system, the-emotional-roller-coaster-of-hiring, two-books-which-influenced-my-hiring-pipeline, ems-why-systems-not-processes, dad-ops-playbook). PW P2: real `keyboard.type('hiring')` gives the same 5 results. |
| Search | `/search/` | 4.2 `location.search` contains `q=hiring` | PASS | Chrome S4-2 and PW P2: `location.search === '?q=hiring'`. |
| Search | `/search/` | 4.3 Reload keeps the input and results | PASS | Chrome S4-3: a full document load of `/search/?q=hiring` (a fresh navigation, so there was no browser form state to restore) shows input `hiring` and the same 5 results; screenshot `chrome-islands/05-search-q-hiring-after-reload.jpg`. PW P2: after `page.reload()`, the same 5 hrefs appear in the same order. |
| Search | `/search/` | 4.4 Clicking the first result opens `/posts/...` with 200 | PASS | Chrome S4-4 and PW P2: a real click navigates through ClientRouter (the window marker survives) to `/posts/ems-the-people-system`, h1 "The People System"; the fetch returns 200 with no redirect. |
| Search | `/search/` | 4.5 No console errors | PASS (via PW) | Chrome S4-5 logged the R20 SW TypeError plus one `InvalidStateError: Transition was aborted because of invalid state` on the result navigation. That error is the hidden-window view-transition artifact v1 characterised (v1 §2.2 row 4.5); the visible PW document has none. PW P2 logged 0 console errors, including the result click. |
| Search | `/search/` | No-match query (extra) | PASS | PW P2: `zzzzqqq` gives "Found 0 results for 'zzzzqqq'", 0 items, 0 errors. |

#### 2.3 `TagsList` (`client:load`, `/tags/`)

| Island | Page | Check | Result | Evidence |
|---|---|---|---|---|
| TagsList | `/tags/` | 5.1 Typing `engin` narrows the list and includes engineering-management | PASS | Chrome S5-1 (5 trusted `insertText` events) and PW P3: 68 → 5 (engineering-management, engineering-leadership, engineering-culture, senior-software-engineer, software-engineering); counter "5 of 68 tags matching "engin"". |
| TagsList | `/tags/` | 5.2 Sort alpha vs count | PASS | Chrome S5-2 and PW P3: default count order over all 68 (engineering-management 15, engineering-leadership 11, leadership 11, …). a→z gives alphabetical order (first `3d-printing`, last `wsl2`) and sets `aria-pressed`. Count order is non-increasing with alphabetical ties. PW also checked that the cleared alphabetical list is *not* count-sorted, so the two orders are distinguishable. Screenshot `chrome-islands/06-tags-filter-engin-count-order.jpg`. |
| TagsList | `/tags/` | 5.3 Clicking a tag opens `/tags/<tag>/` | PASS | Chrome S5-3 and PW P3: a real click reaches `/tags/engineering-management/` ("Tag: engineering management"), 200, 5 post links. |
| TagsList | `/tags/` | 5.4 No console errors | PASS (via PW) | Chrome S5-4: the R20 SW TypeError plus one hidden-window `InvalidStateError` (see 4.5). PW P3 and both full runs: 0 console errors. v1 failed this row on the `proxytown` NetworkError at the tag-click navigation; v2 records 0 such errors (§3). |

#### 2.4 `ClientRouter` (home → carousel post → header `/search/` → header `/tags/`)

| Island | Page | Check | Result | Evidence |
|---|---|---|---|---|
| ClientRouter | `/` → octoprint post | 6.1 Navigation happens client-side and the carousel works afterwards | PASS (via PW) | Chrome S6-1: a trusted click on the home card kept the same document (window marker survived), all 7 islands hydrated with the right start state; the Next scroll delta was delegated (hidden window). PW P4: the marker survived all 3 navigations, 0 `load` and 0 DOMContentLoaded events after the first load, `astro:page-load` 1 → 2 → 3, 0 `[ssr]` islands; carousel Next 0 → 734 after the navigation. |
| ClientRouter | header → `/search/` | 6.2 Search works after navigation | PASS | Chrome S6-2 and PW P4: same document; typing `hiring` gives 5 results and `?q=hiring`. |
| ClientRouter | header → `/tags/` | 6.3 TagsList works after navigation | PASS | Chrome S6-3 and PW P4: same document; `engin` narrows 68 → 5, including engineering-management. |
| ClientRouter | `/` dark → navigations | 6.4 The theme persists with no light flash | PASS | PW P4b: an rAF sampler saw **83 frames, 0 not dark** (`rgb(33,39,55)`) across 2 header navigations; Astro's swap drops `data-theme` and `toggle-theme.js`'s `astro:after-swap` handler restores it 2-3 ms later with no frame painted in between; the toggle still works afterwards. Chrome S6-4: `data-theme=dark` at every `astro:*` navigation event over 4 navigations; a MutationObserver shows the removal and the restore separated only by a microtask boundary (`astro/dist/transitions/router.js:202-208`), so no light frame can render. Pre-existing design; `public/toggle-theme.js` is unchanged from main. |
| ClientRouter / theme | `/posts/`, `/tags/`, `/about/`, `/posts/audio-vs-paper-books/` | Theme on full loads, no FOUC (extra) | PASS | PW P5: `data-theme=dark` and body `rgb(33,39,55)` already at DOMContentLoaded (10-17 ms) and at the first rAF on all 4 `page.goto` loads; a reload and a new tab (`/tips/`) are dark from DOMContentLoaded. |
| ClientRouter | all navigations above | 6.5 No hydration or runtime errors on any page (spec §5.2) | PASS | PW P7: 0 `astro-island[ssr]` left over 34 visits and 46 islands; 0 hydration or React #418-425 messages from any source. PW console: 0 errors, 0 warnings, 0 `pageerror` on both runs. PW P8 re-ran v1's failing flow (`/` → post → `/search/`) at 0.5/3/10 s dwell, 2 reps each: 0 console errors and 0 aborted `proxytown` XHRs in 6/6 runs (v1: 21 NetworkErrors on this flow). Chrome PT-4: 0 `proxytown` requests or errors over 12 full loads and 9 client navigations. |

#### 2.5 SSR React components and hydration

| Island | Page | Check | Result | Evidence |
|---|---|---|---|---|
| SSR React (`Card`, `Datetime`, `Thread`, `ThreadCard`, `TipCard`) | `/`, `/posts`, `/tips`, `/threads` | Render identically to the pre-upgrade build; children pass through | PASS | Visual lane: main-vs-branch captures are byte-identical (0 px) on all four routes in both themes, with equal element counts and `innerText` hashes (§4). |
| All islands | 34 visits (goto, reload, client navigation) | P7 hydration sanity | PASS | 0 `astro-island[ssr]` remained on 46 islands; 0 console, `pageerror`, frame, worker or SW messages matched `hydrat`, `Minified React error #418-425`, `did not match` or `server rendered HTML`. |

#### 2.6 Cross-browser smoke (P9; Playwright 1.44.1)

| Engine | Check | Result | Evidence |
|---|---|---|---|
| WebKit 17.4 | Capture control, 10 soft navigations with an island after each of the first 3, Partytown sandbox, slider, search, tags, console | PASS | 14/14 (`xb-webkit.json`). The positive control captured a page error, a main-frame worker error, a worker created inside the Partytown sandbox iframe, a worker uncaught throw and a page error. 10/10 soft navigations; carousel 0 → 734, search 5 results, tags 68 → 5 after navigation. Sandbox parent `HTML` ×1 on all 12 snapshots, 1 iframe load, 1 sandbox-html request, same element 10/10, 1 worker, gtag.js once, 0 failed `proxytown`, in-worker hook buffer `[]`. P1 octoprint: 7/7 carousels, every Next Δ 734, Next disabled at the end, all images loaded. Console: 36 errors, all `kCFErrorDomainCFNetwork error 310` from the harness proxy refusing the blocked analytics hosts (exactly 2 per refused `g/collect`, 36 = 2 × 18); 0 page errors; 0 failed non-analytics requests. |
| Firefox 125.0.1 | Same | PASS | 14/14 (`xb-firefox.json`). Same navigation, island, sandbox, gtag, worker, `proxytown` and in-worker hook results as WebKit; P1, P2 and P3 pass. **0 console errors**, 0 page errors, 0 failed non-analytics requests. 59 warnings, none of them errors (§10). |

#### 2.7 Console summary (spec criterion 6: "with no console errors")

| Check | Result | Evidence |
|---|---|---|
| Chrome CON: no console errors other than the R20 SW TypeError (user profile, hidden window) | PASS (via PW) | Over 12 full loads and 9 client navigations the only `[ERROR]` was the R20 SW TypeError. The only other entry was an `InvalidStateError` unhandled rejection once per client navigation (9/9), the hidden-window view-transition artifact v1 characterised (v1 §2.6); PW's visible document records none. 0 `proxytown` errors. |
| No console errors at all, clean profile (spec §1 criterion 6; §5.2; Steps 3.8, 4.5, 5.4) | PASS | PW Chrome runs 1 and 2: **0 errors, 0 warnings and 0 `pageerror`** from page, frames, dedicated workers and SW, across 34 visits each. The harness proved it can see errors from each of those sources (`H.capture-control`: page ×3, worker ×1, pageerror ×1, excluded from the count). `requestfailed`: only the 64 DNS-blocked GA `g/collect` requests, which log nothing in Chrome. P0 repeats: 0. `pt-repro`: 0 other console errors, 0 page errors. Firefox: 0. WebKit: 0 apart from the harness-induced blocked-analytics network errors (§2.6). This is the criterion v1 failed on (21 errors on the branch). |

---

### 3. Partytown fix evidence (Task 14, `80a9626`)

**Root cause** (spec §7.2; commit `80a9626`): `@astrojs/partytown`'s `astro:before-swap` hook moved the Partytown sandbox iframe out of the live `<body>` into the incoming document on every ClientRouter navigation. That destroyed the sandbox and the worker running gtag, aborting any in-flight synchronous XHR to `/~partytown/proxytown` (v1's `NetworkError: Failed to execute 'send' on 'XMLHttpRequest'`), then recreated both and re-ran gtag.js. The error was pre-existing: v1 measured the same signature on main and in production.

**Fix:** `sandboxParent: 'html'` in `astro.config.mjs`, so the sandbox lives on `<html>` outside the subtree Astro swaps, plus `transition:persist="gtag-src"` / `"gtag-init"` on the two gtag scripts in `src/layouts/Layout.astro`, so the already-executed scripts survive the swap instead of re-running. Both files carry comments saying the two changes go together. Soft-navigation page views depend on the GA4 "Page changes based on browser history events" setting staying on.

Evidence is from this run's lane reports; the "before" side is v1's own measurement at `55a6530` and the main build.

| Aspect | Before (v1 run; main `3df6160`) | After (v2, `63efd08`) | Source | Result |
|---|---|---|---|---|
| `proxytown` console errors on ClientRouter navigation | v1: 21 page-level NetworkErrors on the branch, 21 on main, 6 on production (v1 §2.6) | **0.** P0: 178 `proxytown` sync XHRs over 10 real-click navigations (183 in two repeats), 0 failed or aborted, 0 `proxytown` console messages, identical in 5/5 runs. P8 (v1's flow): 0 in 6/6 runs. `pt-repro --strict`: `proxytownErrors 0` (139 and 326 requests, 0 failed). Chrome PT-4: 0. P9: 0 failed on WebKit and Firefox. | `lane-playwright-e2e.md` P0/P8/P9, `playwright/pt-repro.json`, `lane-chrome-islands.md` PT-4 | PASS |
| Sandbox placement | main: the library default (`sandboxParent\|\|"body"`); visual lane records `<html>` children `[HEAD, BODY]` | P0: parent `HTML` ×1 on 12/12 snapshots, the iframe is `<html>`'s last child. Visual VR7: `<html>` children `[HEAD, BODY, IFRAME]`; the iframe is `visibility: hidden`, 0×0, and scrollHeight and element counts are unchanged on every route (all 28 screenshots byte-identical to main). W5a: all 127 Layout pages carry `sandboxParent:"html"`. | `lane-playwright-e2e.md` P0(2), `lane-visual-regression.md` §3.1, `lane-site-wide.md` W5a | PASS |
| Sandbox survives navigation (no reload) | the swap destroyed and recreated it on every navigation (root cause above) | P0: iframe DOM `load` events 1, sandbox-html requests 1, `framenavigated` 1, `framedetached` 0, mutation removals 0, the same element after 10/10 navigations; Partytown workers 1 created, 0 closed. `pt-repro`: `softNavsWithSandboxReload 0` of 28 soft navigations. P9: the same on WebKit and Firefox. | P0(2), P0(3), P9 | PASS |
| gtag.js runs once per visit | re-fetched and re-run after each recreation (root cause); the visual lane saw an aborted `googletagmanager.com/a` request only on main | P0: `gtag/js?id=G-QQMCTBW5TH` requested once; both gtag `<script>`s are the same persisted elements after 10/10 navigations, 0 pending `text/partytown`. Chrome PT-3: the two `script[data-astro-transition-persist]` elements are `===` the saved references after 3 navigations and the gtag.js resource count stays at 1. | P0(2), `lane-chrome-islands.md` PT-3 | PASS |
| Analytics page views per navigation | v1 did not measure it | P0 (5/5 runs): `page_view` is sent for the initial `/` and for each of the 5 pages viewed for 3 s; collect attempts continue after the last navigation. `pt-repro`: 14/14 soft-navigation `page_view`s at 3 s dwell. Pages left after 0.5 s get no `page_view` of their own (1/14 at 0.5 s in `pt-repro`); the lane notes pre-fix builds also lost short-dwell views. No real hit reached GA: the collect hosts were NXDOMAINed (Chrome) or refused by a proxy (P9). | P0(2), P0(3), lane observation 3 | PASS (at ≥3 s dwell; short-dwell loss is informational, §10) |
| PT-1: on `/` the sandbox iframe is a child of `<html>`, after `<body>` | — | Chrome lane reported this as **not verifiable in its profile**: uBlock Origin Lite blocks `partytown-sw.js`, the SW registration rejects, and Partytown's main-thread fallback never creates an iframe (0 iframes on `/`). Graded on the clean-profile authority (R20): P0 shows parent `HTML` ×1 and the iframe as `<html>`'s last child on 12/12 snapshots; VR7 shows `[HEAD, BODY, IFRAME]` on all 28 routes; P9 shows the same on WebKit and Firefox. | `lane-chrome-islands.md` PT-1, P0(2), VR7, P9 | PASS (via PW) |
| PT-2: the same sandbox element after 3 ClientRouter navigations; iframe count 1 | — | Chrome lane: not verifiable in its profile (0 iframes, same cause). Graded on P0: count 1 and the same element (WeakMap identity) after each of 10/10 navigations, 1 load, 0 detaches; P9 the same on both engines. | `lane-chrome-islands.md` PT-2, P0(2), P9 | PASS (via PW) |
| PT-3: the `transition:persist` gtag scripts are the same elements after 3 navigations (user profile) | — | Same objects, markers intact, `isConnected`; gtag.js fetched once. This half of the fix is observable even with Partytown in main-thread fallback. | `lane-chrome-islands.md` PT-3 | PASS |
| Served config | — | 127/127 Layout pages: exactly one `{lib:"/~partytown/",sandboxParent:"html",debug:!1}` with `forward ["dataLayer.push"]`; the `src` gtag script has `data-astro-transition-persist="gtag-src"` and the inline one `"gtag-init"`, each once per page, both in `<head>`. main has no `sandboxParent` and no persist attributes. | `lane-site-wide.md` W5a | PASS |

---

### 4. Visual comparison (spec §1 criterion 7; plan Step 7)

Source: the visual-regression lane (`lane-visual-regression.md`, `lane-visual-regression.json`).

Method:
- The upgraded site on :4321 (HEAD's `dist/`; a hash of the whole `dist/` tree was identical before and after all captures) against main `3df6160` on :4331 (Astro 6.2.1). `git diff main HEAD -- src/content public` is empty, so both builds have the same content.
- Headless Chrome 153 through Playwright 1.63.0, 1280×1800, device scale factor 1, `reducedMotion: 'reduce'`, theme set through `localStorage.theme` (verified on 56/56 shots), `networkidle` reached on 28/28 per server, IBM Plex Mono loaded on every shot, 0 broken images.
- Diff: pixelmatch 7.2.0 at threshold 0.1 as specified, plus exact decoded-buffer equality and an exact any-channel pixel count. Pixelmatch at 0.1 misses low-contrast fills, so the verdicts rest on exact equality.

#### 4.1 Upgraded branch vs pre-upgrade main (same content)

| # | Route | Screenshots (branch) | Light: mismatch / exact px | Dark: mismatch / exact px | Parity notes | Result |
|---|---|---|---|---|---|---|
| 01 | `/` | `01-home.png`, `01-home-dark.png` | 0.0000% / 0 | 0.0000% / 0 | byte-identical; scrollHeight 1800/1800; 196/196 elements; `innerText` hash equal | PASS |
| 02 | `/posts` | `02-posts-index.png`, `02-posts-index-dark.png` | 0.0000% / 0 | 0.0000% / 0 | byte-identical | PASS |
| 03 | `/posts/ems-connecting-the-systems` | `03-post-with-images.png`, `03-post-with-images-dark.png` | 0.0000% / 0 | 0.0000% / 0 | byte-identical; scrollHeight 14586/14586 | PASS |
| 04 | `/posts/flutter-google-maps-embedded-map` | `04-post-with-carousel.png`, `04-post-with-carousel-dark.png` | 0.0000% / 0 | 0.0000% / 0 | byte-identical; carousel 5/5 slides, 7/7 images, 0 broken | PASS |
| 05 | `/tips` | `05-tips-index.png`, `05-tips-index-dark.png` | 0.0000% / 0 | 0.0000% / 0 | byte-identical | PASS |
| 06 | `/tags` | `06-tags-index.png`, `06-tags-index-dark.png` | 0.0000% / 0 | 0.0000% / 0 | byte-identical; scrollHeight 3029/3029 | PASS |
| 07 | `/tags/engineering-management/` | `07-tag-detail.png`, `07-tag-detail-dark.png` | 0.0000% / 0 | 0.0000% / 0 | byte-identical; the inline `#tag` row and breadcrumb, where a `compressHTML` spacing change would show, match | PASS |
| 08 | `/threads` | `08-threads-index.png`, `08-threads-index-dark.png` | 0.0000% / 0 | 0.0000% / 0 | byte-identical | PASS |
| 09 | `/about` | `09-about.png`, `09-about-dark.png` | 0.0000% / 0 | 0.0000% / 0 | byte-identical | PASS |
| 10 | `/this-route-doesnt-exist` | `10-404.png`, `10-404-dark.png` | 0.0000% / 0 | 0.0000% / 0 | byte-identical; HTTP 404 on both builds (expected) | PASS |
| 11 | `/posts/octoprint-prusa-core-one-raspberry-pi/` | `11-octoprint.png`, `11-octoprint-dark.png` | 0.0000% / 0 | 0.0000% / 0 | byte-identical; scrollHeight 39002/39002; 24 images; 16 slides | PASS |
| 12 | `/search/?q=hiring` | `12-search.png`, `12-search-dark.png` | 0.0000% / 0 | 0.0000% / 0 | byte-identical; "Found 5 results for 'hiring'" on both | PASS |
| fp | `/` (full page) | `fp-home.png`, `fp-home-dark.png` | 0.0000% / 0 | 0.0000% / 0 | 1280×1800 on both; the page fits within the viewport | PASS |
| fp | `/posts/ems-the-delivery-system/` (full page) | `fp-ems-the-delivery-system.png`, `fp-ems-the-delivery-system-dark.png` | 0.0000% / 0 | 0.0000% / 0 | 1280×7977 on both after a lazy-load pre-walk; appendix table, related posts, `#tag` row, share icons and footer checked visually | PASS |

28 of 28 main-vs-branch pairs are byte-identical after decoding, so no diff PNGs were written (0 pairs above 0.1%). Neither Task 13's CSS minification change nor Task 14's hidden sandbox iframe on `<html>` produces a rendered difference.

#### 4.2 Supporting visual checks

| Check | Result | Evidence |
|---|---|---|
| Noise floor (a second capture of the upgraded site) | PASS | up-A vs up-B: 28/28 byte-identical. |
| Below the fold: 1800-px scroll segments of 03, 04, 06 and 11 in both themes (84 pairs) | PASS | Same sizes and scroll positions on both builds. 83/84 exact 0 px. `seg-11-octoprint-dark-18` has 17 px differing by ±1 LSB in one 1-px column inside a downscaled webp (threshold 0.1 = 0). Three repeat captures per server produce that variant on both builds, so it is rasterisation noise, not a build difference. |
| DOM and metadata parity (all 28 shots) | PASS | Status, final URL, title, theme, colours, fonts, scrollHeight, element count, image counts, `innerText` hash, console and page errors are all equal. The only differing key is `htmlChildren`: `[HEAD, BODY, IFRAME]` on the branch vs `[HEAD, BODY]` on main, which is Task 14's sandbox move (§3). |
| Console and network parity (clean profile) | PASS | 0 page errors on either build; the only console error on either is the expected document 404 on `/this-route-doesnt-exist`; the only failed requests are GA beacons aborted when each context closes, on both builds. |
| Sensitivity controls | PASS | Deleting inline whitespace between inline elements (the `compressHTML: 'jsx'` failure mode): 3691 px (0.0361%) on the ems full page and 937 px (0.0407%) on the tag page. One NBSP: 1.2518%. A 1-px nav margin: 0.0295% (1858 exact px). An unchanged re-capture: 0 px. The pipeline sees one-character and one-pixel changes. |

#### 4.3 April baseline (`baseline/*.png`) vs upgraded branch

The lane Read both images for every route. It attributed each difference with three extra captures in the same Chrome 153: the upgraded site at a 1268-px viewport (April's capture painted a 12-px scrollbar gutter from `base.css` `overflow-y: scroll`, while Playwright passes `--hide-scrollbars`, which shifts the centred column by +6 px), the April-end commit `bdb9350` rendered today, and the April-era T-30 captures. The April baseline was also captured on `astro dev`, so its dev-toolbar pill is visible. **main is byte-identical to the branch (§4.1), so none of these differences come from T-39.**

| # | Route | Mismatch unaligned / aligned 1268 | Explanation | Result |
|---|---|---|---|---|
| 01 | `/` | 1.8783% / 1.6402% | Content added on main since April: 2 new posts and the Top tags section (13deae2). Plus the +6 px shift, the dev toolbar, the April-era nav offset (already in T-30) and Chrome 153 placing some link text 1 px higher (also on April-end code). | PASS |
| 02 | `/posts` | 1.8611% / 1.6116% | 2 new posts at the top; still 5 per page, "1 / 6". The active "Posts" wavy underline renders differently in Chrome 153; its classes are unchanged. | PASS |
| 03 | `/posts/ems-connecting-the-systems` | 4.4359% / 0.1706% | Text, line breaks and spacing identical. Aligned, only the header band and the dev toolbar differ; April-end code today vs T-30 = 0 px and April-end code vs the branch = 0 px. | PASS |
| 04 | `/posts/flutter-google-maps-embedded-map` | 2.3411% / 0.6891% | Expected: the pure-CSS scroll-snap carousel (T-10) with round Prev/Next buttons (T-36, 0ce59e8). April-end code vs the branch differs only in those buttons (84 px at 0.1, 3137 exact). Chrome 153 renders the dashed underline, the TOC marker spacing and the code-tab offset slightly differently, identically on April-end code. | PASS |
| 05 | `/tips` | 1.5100% / 1.3299% | The Tips listing was redesigned on main in 465cc8c (2026-05-07). | PASS |
| 06 | `/tags` | 1.5041% / 0.7013% | 63 → 68 tags and changed counts reorder rows; filter, sort and bars unchanged; `#`-to-name spacing is the same 14 px as April. | PASS |
| 07 | `/tags/engineering-management/` | 2.1164% / 1.5333% | 14 → 15 articles; `#hiring` moved into the first related-tags row. Inline `#tag` spacing matches April. | PASS |
| 08 | `/threads` | 1.7342% / 0.2395% | Content identical; April-end code vs the branch = 0 px. Shift, toolbar, nav offset, Chrome 153 text placement. | PASS |
| 09 | `/about` | 2.9787% / 0.1792% | Content identical; April-end code vs the branch = 0 px. Chrome 153 renders the list bullets and the fallback-font kaomoji differently. | PASS |
| 10 | `/this-route-doesnt-exist` | 0.5484% / 0.1873% | April-end code vs the branch = 0 px. The "Go back home" dashed underline has longer dashes in Chrome 153; April-end code in Chrome 153 shows the identical 383 px. | PASS |

Aligned diff PNGs are in `diff/april/`, and evidence crops (April / T-30 / now) in `diff/april/crops/`.

---

### 5. Site-wide (spec §5.2 "Site-wide"; plan Step 8)

Sources: the site-wide lane (`lane-site-wide.md`), which crawls the branch `dist/` and the preview with a case-exact resolver (GitHub Pages is case-sensitive) and compares with main's `dist/`; PW P6 for the TOC in a browser; the build lane for OG hashes.

| ID | Area / check | Result | Evidence |
|---|---|---|---|
| W1 | RSS, sitemaps, OG, robots: status, content types, `xmllint`, RSS items, every `<loc>` → 200 | PASS | `/rss.xml` 200 text/xml; `/sitemap-index.xml` 200 text/xml; `/og.png` and `/posts/audio-vs-paper-books/index.png` 200 image/png; `/robots.txt` 200 text/plain. `xmllint --noout` ok on the RSS feed, the index and all 5 referenced sitemaps (pages 7, posts 28, tips 7, threads 3, tags 69 locs). RSS has 35 items: `rss.xml.ts` merges posts and tips by design, so the literal "item count = published posts" (28) does not apply; the 28 post links are set-equal to the posts derived from frontmatter (29 files − 1 draft − 0 scheduled) and the 7 tip links to the 7 tips; no duplicates, `link == guid`, sorted by date. 114/114 `<loc>` → 200 with 0 redirects. `rss.xml`, `robots.txt` and the 5 sitemaps are byte-identical to main; the index differs only in `<lastmod>`. The sitemaps come from the custom endpoints, confirming the `@astrojs/sitemap` removal changed nothing. |
| W2 | Internal link integrity (`/`-rooted refs, case-exact) and in-page `#fragment`s | PASS | 130 HTML files, 3622 refs. 2175 `a[href]` (187 unique): 0 broken. 347 in-page fragment links: 0 unmatched. 0 cross-page fragments, 0 links to redirect stubs. The only unresolved same-site absolute URLs are 29 meta/canonical values (the 28 post `og:image`s of W7 and the 404 page's canonical, §10), the same set as main. |
| W3 | Redirects `/posts/1/` → `/posts`, `/tips/1/` → `/tips`; custom 404 | PASS | Both stubs carry `<meta http-equiv="refresh" content="0;url=/posts">` (or `/tips`), byte-identical to main and matching `astro.config.mjs`. `/this-route-doesnt-exist` (with and without the slash) → 404 text/html, body byte-identical to `dist/404.html`, text identical to main. |
| W4 | An OG image for every eligible post; valid 1200×630 PNG | PASS | The route's filter (`!draft && !ogImage`) expects 28; 28 `dist/posts/*/index.png` are present, set-equal. sharp 0.35.4 decodes all 29 (28 + `og.png`): PNG, 1200×630, 4 channels. The 28 post PNGs are byte-identical to main. |
| W5a | Partytown config: `sandboxParent:"html"` and the gtag persist attributes | PASS | 127/127 Layout pages (130 HTML − 2 redirect stubs − the Partytown sandbox asset): exactly one bootstrap with `sandboxParent:"html"`, and exactly one each of `data-astro-transition-persist="gtag-src"` and `"gtag-init"`, all in `<head>`. Site-wide persist ids are only those two (127 each). main has neither. |
| W5 | Partytown assets and GA `text/partytown` blocks with forwarded `dataLayer.push` | PASS | All 5 files in `dist/~partytown` → 200, served bytes equal to `dist`. 127/127 pages have exactly 2 `type="text/partytown"` blocks (gtag `src` for `G-QQMCTBW5TH` plus the inline init) and `forward ["dataLayer.push"]`. Running the inline GA body gives `dataLayer=[["js",<Date>],["config","G-QQMCTBW5TH"]]`, the same as main. |
| W6 | Asset references resolve (script, stylesheet, img, srcset, island component/renderer URLs) | PASS | Case-exact, 0 broken in every category (262 `script[src]`, 145 stylesheets, 41 `img[src]`, 74 srcset candidates, 17 `component-url`, 17 `renderer-url`). 299/299 unique internal paths → 200 from the preview. 8 JS import specifiers all resolve. Per-category counts equal main. |
| W7 | `<head>` sanity on `/`, a post, a tip, `/tags/`, `/about/` vs main, **including "og:image resolves"** | **FAIL** | The absolute sub-criterion "og:image resolves" holds on 4/5 pages. On the post page, `og:image` and `twitter:image` are `https://www.novifyx.com/posts/audio-vs-paper-books.png`, which returns 404 in this build, in the main build and in production (read-only GET); the generated image is at `/posts/<slug>/index.png` (200). All 28 posts are affected, the same set on main. Cause: `src/layouts/PostDetails.astro:34` builds `` `/posts/${post.id}.png` `` while `src/pages/posts/[slug]/index.png.ts` emits `/posts/<slug>/index.png`; that line is identical on main. **Not a regression.** Everything else matches main on 5/5 pages: title, description, canonical, og:image value, twitter:image, theme-color, element counts (36/44/41/36/36) and tag multisets. The only attribute deltas are the generator (Astro v6.2.1 → v7.3.5), the two Task 14 persist attributes and one renamed CSS chunk on `/` (exists, 200). v1's W7 checked only parity with main, and passed on the same facts (v1 §4, with the 404 recorded as v1 §8 item 1); v2's lane added the absolute sub-criterion, which is why the same defect now fails the row. |
| W8 | Built page sets vs the pre-upgrade build | PASS | Equal sets, not just counts: posts 28, post pagination 6, tips 7, tip pagination 2, tags 68, tag pagination 8, threads 2, other pages 8. Both builds report 127 pages; the extra `.html` on the branch is the Partytown sandbox asset. |
| W9 | OG baseline hashes (`shasum -a 256`) | PASS | `dist/posts/audio-vs-paper-books/index.png` = `951f184b268e003e34c26b90e7109b07c988969269b38a0e3892e668c5838660`, equal to `baseline/2026-09/og/sha256.txt`. `dist/og.png` = `ae6c9aa406da0d27944d155e4e9ec5fe8a92116b2f78d9897fe14697749e8902`, equal to Task 6's accepted value (main's fresh `og.png` is the pre-satori `5eb52b44…`, so the delta comes only from satori 0.33.5), so no visual fallback was needed. |
| W10 | TOC `<details>` counts in `dist` (.md and .mdx) | PASS | `grep -o '<details' \| wc -l`: `audio-vs-paper-books` (.md) 1, `ems-the-delivery-system` (.md) 1, `dad-ops-playbook` (.mdx) 1, equal to `baseline/2026-09/toc-counts.txt` (1/1/1). One `<summary>Open Table of contents</summary>` each; 8/10/7 TOC links, all to in-page ids; each TOC block byte-identical to main. |
| P6 | TOC collapse in a browser, .md `audio-vs-paper-books` and .mdx `dad-ops-playbook` | PASS | PW P6: exactly 1 `<details>` per page, closed initially with the links hidden; a real click on the summary opens it; anchors exist for 8/8 and 7/7; two real link clicks per post set the hash and scroll to the target. |
| W11 | Toolchain and config (Phase 2) | PASS | `@astrojs/sitemap` absent from `package.json` and `pnpm-lock.yaml` (R23). `packageManager` `pnpm@10.34.5` = latest 10.x, lockfile v9.0 (R25). lint-staged simulated with lint-staged 17.5.1's own matcher: `*.{js,mjs,cjs,jsx,ts,tsx,astro}` → eslint --fix then prettier; `*.{md,mdx,json,css,yml,yaml}` and `.prettierrc` → prettier; 0 files match more than one glob (R22). `ci.yml`: `pnpm/action-setup@v6` with no `version:` (reads `packageManager`), `setup-node@v7` with `.nvmrc` and `cache: pnpm`, then install, `astro check`, lint, **format:check**, build, `audit --prod`; no `corepack` anywhere under `.github/`; all action tags exist (R24). `dependabot.yml`: both generic groups' `exclude-patterns` equal the 17-pattern union of the named groups; `ignore:` caps `@types/node` semver-major and `typescript >= 6.1.0`. `compressHTML: true` matches `astroCompressHTML: true`. Audit and outdated: §9. |

---

### 6. devToolbar decision (spec §5.2; plan Step 9)

| Check | Result | Evidence |
|---|---|---|
| T8b: devToolbar workaround removed | PASS (carried from Task 8b; not re-run at `63efd08`) | v1's devtoolbar lane decided to remove the T-38 workaround after 9/9 toolbar-on cold starts were clean on Astro 7.3.4 / Vite 8.3.0 (0 × 504, 0 failed dynamic imports; v1 §5). Commit `58f9565` (Task 8b) removed `devToolbar: { enabled: false }` and its T-38 comment; `astro.config.mjs` at `63efd08` has no `devToolbar` key. The v2 run did not repeat the cold-start test. Since then vite is unchanged at 8.3.0 (lockfile) and astro moved 7.3.4 → 7.3.5. The toolbar is dev-only; the production checks above are unaffected. |

---

### 7. What changed since v1 (`55a6530..63efd08`)

| Commit | Task | Change | Verified in v2 by |
|---|---|---|---|
| `08e2953` | 8 | The v1 report (documentation only). | — |
| `58f9565` | 8b | Removed the T-38 `devToolbar` workaround from `astro.config.mjs`. | §6 |
| `d5a4218` | 10 | Removed the unused `@astrojs/sitemap` (and its transitive `sitemap`, `@types/sax`, `arg`). For the record (R32): the commit body says the integration "was never registered"; in fact 7e4b33e (2024-01-17) registered `sitemap()` and cde32ad (2026-04-28) removed it from `astro.config.mjs` when the custom `src/pages/sitemap-*.xml.ts` endpoints replaced it. | W1 (sitemaps byte-identical to main), W11 |
| `5179209` | 11 | Prettier enforced on `.astro`: non-overlapping lint-staged globs, a CI `format:check` step, and the `.prettierignore` whitelist fixed so `astro.config.mjs` and `eslint.config.js` are format-checked (formatting-only reformat). | B5, W11 |
| `98d72fd` | 12, 12b | CI takes pnpm from `packageManager` (`pnpm/action-setup@v6`), the `corepack prepare pnpm@latest` steps are gone from `ci.yml` and `deploy.yml`, Dependabot grouping plus `exclude-patterns`, `pnpm.onlyBuiltDependencies` pruned. | W11 |
| `b80d41b` | 13 | A comment in `dependabot.yml` that `exclude-patterns` must mirror the named groups. | W11 |
| `cfad89f` | 13 | Lockfile-only dev-tooling refresh within declared ranges, `packageManager` pnpm 10.34.5, `@types/node` 22.20.4 exact (R25, R27). Full `pnpm audit` 37 → 17; `--prod` unchanged at 1. Accurate account where the commit body is imprecise (R32), checked against `pnpm-lock.yaml` at `55a6530` and `63efd08`: (a) the companion bumps undici (astro/unifont copy) 8.11.0 → 8.11.2, caniuse-lite 1.0.30001791 → 1.0.30001812, electron-to-chromium 1.5.344 → 1.5.438, node-releases 2.0.38 → 2.0.57 and update-browserslist-db 1.2.3 → 1.3.3 came with the targeted `pnpm update --depth Infinity`, not with `pnpm dedupe` as the body says (per the Phase 2 review); (b) the explicit pin replaced the `@types/node` 24.13.3 the tree used to get through optional peer edges, and `undici-types` moved 7.18.2 → 6.21.0, so the type environment changed from Node 24 types to Node 22 types, as R27 intends; (c) undici 5.29.0 (via `@divriots/cheerio`'s `^5.22.1`) is inside the 12 remaining advisories' vulnerable ranges (`<6.23.0` … `<6.28.0`) and no 5.x release is patched, so these are accepted risk, not audit false positives. | B2, B9, §8, §9, W11 |
| `4d323d5` | 13b | astro 7.3.5 and astro-eslint-parser 3.2.0, both released 2026-09-24 (bringing `@astrojs/compiler-rs` 0.5.0). | B7, all lanes (generator `Astro v7.3.5`) |
| `80a9626` | 14 | The Partytown/ClientRouter fix (`sandboxParent: 'html'` + `transition:persist` on both gtag scripts). | §3, §2.7, W5a, VR7 |
| `66dcef2` | 15 | LinkButton's scope-class forwarding removed: compiler-rs 0.5.0 merges the parent's scoped class itself; `class:list` stays. | §4.1 (0 px on every route), W7/W8 parity |
| `35d1250` | review fix wave | Plan Task 9 title, and an interim Phase 2 status section in this report. This v2 supersedes that section and removes it (R33). | — |
| `63efd08` | 16, 16b | Dependabot `ignore:` caps (`@types/node` majors; `typescript >= 6.1.0`), CLAUDE.md Partytown/GA4 and `@types/node` invariants, the spec §7 Phase 2 addendum, plan Task 9 `--body-file`. | W11 (ignore caps) |

Measured differences from v1: install `+721` → `+719` packages; jampack `49.06 → 46.23 MB` → `49.01 → 46.16 MB` (308 files both); pages 127, files 362, HTML 130 and the 9 MODULE_LEVEL_DIRECTIVE warnings unchanged; deprecated transitive packages 2 → 1; console errors in the clean profile 21 → 0.

---

### 8. Peer warnings (R11 criterion; R13: transitive peer warnings are recorded here)

Source: `qa-runs/T-39-2026-09-v2/peers.txt`. `pnpm install --resolution-only` on a `mktemp -d` scratch copy exited 0, and the scratch lockfile sha256 `cb7f0f70…d6aea1` was unchanged and equal to the repo lockfile.

```
 WARN  Issues with peer dependencies found
.
└─┬ @divriots/jampack 0.34.1
  └─┬ quicklink 2.3.0
    ├── ✕ unmet peer react@^16.8.0: found 19.3.0
    └── ✕ unmet peer react-dom@^16.8.0: found 19.3.0
```

| Item vs baseline (`baseline/2026-09/gate.txt`) | Status | Result |
|---|---|---|
| `@divriots/jampack 0.34.1 > quicklink 2.3.0 > react/react-dom@^16.8.0` (found 19.3.0) | SAME. Transitive and upstream-locked: jampack 0.34.1 is the registry latest and declares `quicklink ^2.3.0`; only quicklink 3.x accepts React 19. | PASS (informational under R11/R13) |
| `astro 6.2.1 > tsconfck 3.1.6 > typescript@^5.0.0` | GONE (0 `tsconfck` entries in the lockfile) | PASS |
| `astro-eslint-parser 3.0.0 > … > @emnapi/runtime` | GONE (`@napi-rs/wasm-runtime` 1.2.4 peers `^1.7.1 \|\| ^2.0.0-alpha.4`) | PASS |
| `eslint-plugin-jsx-a11y 6.10.2 > eslint@^3..^9` | GONE (replaced by `eslint-plugin-jsx-a11y-x`) | PASS |
| NEW unmet peer under a direct-dependency parent | none | PASS |

Deprecated subdependencies: 4 in the baseline, 2 in v1, **1** now: `whatwg-encoding@2.0.0`, via jampack > `@divriots/cheerio` > `encoding-sniffer@0.0.2` (`^2.0.0`), not fixable within the declared ranges. `@ungap/structured-clone`, flagged in v1, is at 1.4.0 after Task 13. No direct dependency is deprecated.

---

### 9. Outdated packages and caps

Source: `qa-runs/T-39-2026-09-v2/outdated.txt`.

| Check | Result | Evidence |
|---|---|---|
| `pnpm outdated` lists only the capped packages | PASS | Exactly two rows: `@types/node (dev) 22.20.4 → 26.6.2` and `typescript (dev) 6.0.3 → 7.0.2`; the JSON gives `wanted` = `current` for both, `isDeprecated false`. |
| All other direct dependencies at registry latest | PASS | An independent registry cross-check: 38/40 direct dependencies at `dist-tags.latest`; the other 2 are exactly the two caps; 0 deprecated (installed or latest). The caret specifiers all resolve to registry latest. |
| TypeScript cap is justified | PASS | Stable 6.x releases are 6.0.2 and 6.0.3, so 6.0.3 is the highest. `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser` and `typescript-eslint` @latest 8.70.1 all peer `typescript ">=4.8.4 <6.1.0"` (the canary 8.70.2-alpha.7 too), and `@astrojs/check@latest` 0.9.10 peers `"^5.0.0 \|\| ^6.0.0"`. `semver.satisfies`: 7.0.2 fails both, 6.0.3 passes both. |
| `@types/node` cap is ruled | PASS (R27) | R27 pins `@types/node` exactly to the latest 22.x to match the Node 22 runtime; `semver.maxSatisfying(all published, '^22')` = 22.20.4 = installed. No peer range forbids 26.x (the only declared peer is vite 8.3.0's optional `^20.19.0 \|\| >=22.12.0`), so this cap rests on R27 and the runtime, not on peer ranges. Dependabot ignores its majors (W11). |

Toolchain: Node v22.23.3 is the latest v22 LTS. pnpm 10.34.5 is the registry `latest-10`; the overall `latest` is 12.6.0, and R25 keeps the major at 10.

---

### 10. Observations and pre-existing issues (not failures of T-39)

**Pre-existing site defects** (identical on main; outside T-39's "no content or design changes" scope; follow-ups for the user):
1. **Post `og:image` and `twitter:image` return 404.** This is the W7 failure (§5). All 28 posts; `src/layouts/PostDetails.astro:34` builds `/posts/${post.id}.png`, but the image route emits `/posts/<slug>/index.png`. Production serves the same broken meta. Fix options: point the URL at `/posts/${post.id}/index.png`, or move the route to `src/pages/posts/[slug].png.ts`.
2. **Four relative links in three .mdx posts 404** (new in v2; outside W2's `/`-rooted scope): `flutter-google-maps-static-map.mdx:27` `./flutter-google-maps-address-manipulation`; `flutter-google-maps-address-manipulation.mdx:27` `./flutter-google-maps-embedded-map` and `:477` `./flutter-google-maps-setup`; `flutter-google-maps-embedded-map.mdx:27` `./flutter-google-maps-setup`. From the canonical `/posts/<slug>/` URL they resolve to `/posts/<slug>/<other-slug>`, which is 404 in the preview and in production. Suggested fix: absolute `/posts/<slug>/` links.
3. **`dist/404.html` canonical URLs** (`canonical`, `og:url`, `twitter:url`) point at the non-existent `https://www.novifyx.com/404/`.
4. **Duplicate sitemap entries:** `/tags/` and `/threads/` each appear in two sitemaps (114 locs, 112 unique). Harmless.
5. **Search caret race** (`src/components/Search.tsx:52-55`, unchanged from main): a 50 ms post-mount `setTimeout` resets the caret, so typing that starts inside that window is reordered (`hiring` → `iringh`). With immediate typing, 10 reps: main 7/10 (WebKit) and 7/10 (Firefox); the branch 6/10 and 2/10; Chrome 0/5; with a 300 ms wait, 0 on every engine. Not a regression.
6. **`<html class="false">`** from `src/layouts/Layout.astro:41`. No visual effect.
7. **Search result links have no trailing slash** (`/posts/ems-the-people-system`); served 200 with no redirect. `Card.tsx` and `Search.tsx` are unchanged from main.
8. **Tips footer sits mid-viewport** (y≈1122) on `/tips` at 1800 px, from the Tips redesign 465cc8c; identical on main.
9. **`baseline/SCREENSHOTS.md` misnames route 03** as a "post with multiple inline images"; it has 0 `<img>` on every build, April included. Images are covered by 04 and 11.

**Partytown and analytics:**
10. **Short-dwell page views.** GA4 records a soft-navigation `page_view` only for pages that stay open long enough (all 3 s pages; 1 of 14 at 0.5 s). This depends on GA4's "Page changes based on browser history events" setting, which must stay on (CLAUDE.md, spec §7.2).
11. **The user's Chrome runs Partytown in main-thread fallback.** uBlock Origin Lite blocks `partytown-sw.js`, so there is no sandbox and gtag runs on the main thread (R20). The profile also has a stale service worker at `/~partytown/debug/` from an earlier dev session; it controls none of the tested pages.
12. **Firefox warnings** (59, not errors): Partytown sandbox property enumeration triggers deprecation notices (`InstallTrigger`, `onmozfullscreen*`, `SVGGraphicsElement.*ViewportElement`, `MouseEvent.moz*`), and gtag sets `_ga` cookies without SameSite. The sandbox notices appear only at the initial load and first click, consistent with the sandbox never reloading.

**Environment and harness notes:**
13. **Hidden Chrome window** (§1.1): smooth scroll, CSS transitions, IntersectionObserver and lazy loading advance only when a screenshot forces a frame; the first trusted click after a full navigation is dropped; `startViewTransition` rejects with `InvalidStateError` once per client navigation. All environmental; the affected checks were graded on Playwright.
14. **WebKit console attribution:** WebKit logs refused proxy connections as `kCFErrorDomainCFNetwork error 310` with no URL. They are attributed to the harness-blocked analytics hosts: the proxy refused only `www.google-analytics.com` and `www.google.com`, never another host, and each label has exactly 2 errors per refused `g/collect`.
15. **P9 harness iterations:** the first WebKit attempt failed 3 of 12 checks, all from harness timing (counting `client:only` carousels before React 19's async render, the Search caret race, and the unattributed error-310 messages). The final harness waits for the carousels and hydration and adds worker-level capture; the product results were identical across attempts 2-4.
16. **`pt-repro` route mode** recorded 10 `g/collect` POSTs ending `net::ERR_ABORTED` against its local fake Google. Not `proxytown` requests or console errors; excluded by its verdict.
17. **Scope limits:** real Safari was not verified (WebKit 17.4 only). The devToolbar cold-start test (§6) and v1 §8 item 13 (the dev-toolbar Audit app's "`iframe` Required attributes missing" finding, probably the Partytown sandbox, which now sits under `<html>`) were not re-run at `63efd08`.
18. **Preview listens on IPv6 only** (`localhost` → `::1`); `http://127.0.0.1:4321/` is refused. Astro's default on macOS.
19. **Lane process notes:** main's Astro 6.2.1 preview runs in the foreground (no `stop` subcommand), so the visual lane stopped it and the April-end preview by PID after checking each process's cwd with `lsof`; the `:4321` daemon stayed up. The site-wide lane created a scratch main worktree, then used the visual lane's build instead and removed its own unbuilt. Every scratch worktree is gone (B12).

**Visual and build notes:**
20. **Pixelmatch at threshold 0.1 misses low-contrast fills** (a light-grey carousel button: 84 px at 0.1, 3137 exact), so the visual verdicts rest on exact equality.
21. **v1's claim not reproduced:** v1 §3.3 said forcing a 1-px `text-decoration-thickness` reproduces April's dashed underline exactly; 315 of 383 px remain. The attribution to Chrome 153 still holds, because April-end code in Chrome 153 produces the same 383 px.
22. **April-era nav offset:** the header nav text sits 8 px and the search icon 4 px further left than in April. The T-30 capture already shows it, so it dates from the April upgrade; main and the branch render it identically.
23. **CSS text drift:** Astro's 7 `@keyframes astro*` rules and the `prefers-reduced-motion` view-transition rule moved from per-page inline `<style>` into the shared `Footer.css`, so `/` and `/about/` now load them too (the reduced-motion rule now also applies there). No selector is missing on any W7 page. Sampled declaration differences are whitespace and equivalent forms (`calc(10 * -1)` vs `-10`), consistent with the Task 13 browserslist/lightningcss refresh. No rendered difference (§4).
24. **`/about/` `<head>` order:** the breadcrumb `<style>`, the `Footer.css` link and the Partytown bootstrap moved to the end of `<head>`, as in v1; cascade unaffected.
25. **Build warnings:** the 9 Vite `[MODULE_LEVEL_DIRECTIVE] "use astro:head-inject"` warnings (one per .mdx post) are the known item parked in Task 4 (upstream Astro 7 + Rolldown). No other warning types.
26. **Audit:** `pnpm audit --prod` = 1 moderate, `fflate@0.7.3` via satori's exact pin (GHSA-px8p-9vwx-vf98). Full `pnpm audit` = 17 (2 low, 10 moderate, 5 high, 0 critical), all in the build-time jampack tree (`sharp@0.33.5`, `undici@5.29.0` via `@divriots/cheerio`, `esbuild@0.20.2`, `file-type@19.6.0`) plus fflate; none fixable within the declared ranges (§7, `cfad89f`).
27. **Carousel border colour** computes to a light grey `oklch(0.928 0.006 264.531)` in both themes. The component differs from main only by the R10 class reorder, and the carousel pages are byte-identical to main in both themes (§4.1).
28. **No GIF** was produced (§2.1).
29. **Task 9 Step 1 grep:** the plan's `grep -ciE '\bFAIL\b'` on this file counts v1's history rows as well as v2's. It cannot reach 0 while v1 is kept here; how to apply that gate is a controller decision.

---

### 11. Defects

| ID | Description | Regression? | Status |
|---|---|---|---|
| (open, no defect file) | **Post `og:image`/`twitter:image` URLs return 404** (W7). `PostDetails.astro:34` points at `/posts/<slug>.png`; the image is generated at `/posts/<slug>/index.png`. | **No.** The line and the 28-post set are identical on main `3df6160`, and production serves the same broken URL. | Open (W7 FAIL): needs a controller or user decision (§12). The root cause is known, so the rule "write `defects/T-39-D<n>.md` when the root cause isn't clear" does not apply, and no defect file was created. |
| v1 open item | **ClientRouter navigation logged a Partytown `proxytown` NetworkError** (v1 §9). | No (pre-existing on main and production). | **Fixed** in `80a9626` (Task 14); the rows it failed in v1 PASS in v2 (§3, §2.3 row 5.4, §2.4 row 6.5, §2.7: 0 errors). |

No T-39 regression was found in any lane.

---

### 12. Overall verdict

| Lane | Lane verdict (as reported) | After grading in this report |
|---|---|---|
| build | PASS | PASS (§1, §8, §9) |
| chrome-islands | FAIL (PT-1 and PT-2: not verifiable in the user's profile, because uBlock Origin Lite stops Partytown from creating its sandbox) | PASS. PT-1 and PT-2 are graded on the clean-profile authority (R20): playwright-e2e P0 verifies both assertions directly, with VR7 and P9 in support (§3). The Next/Prev scroll deltas are graded on PW (plan Step 2); every other chrome check passed. |
| playwright-e2e | PASS | PASS (§2, §3) |
| visual-regression | PASS | PASS (§4) |
| site-wide | FAIL (W7: og:image resolves) | **FAIL**: W7 stays open. It is pre-existing and not a regression, but the check is absolute and no ruling excludes it. The other 12 rows PASS (§5). |
| devtoolbar | PASS (carried from Task 8b) | PASS (§6); not re-run at `63efd08` |

**FAIL rows:**
1. §5 W7 "og:image resolves" on post pages (all 28 posts).

**Overall: FAIL**

Under R8 and spec §5.3, Task 9 (push and PR) must not proceed until the controller resolves this failure. The two options are:
- **(a) Rule it out.** Issue a ruling like R20 that classifies the post `og:image` 404 as pre-existing and outside T-39's scope, with a follow-up for the fix. The evidence: the same line and the same 28 broken URLs on main `3df6160`, the same broken meta in production, and a fix that would be a markup change outside the spec's "no content or design changes" non-goal. W7 would then become PASS with no re-test needed.
- **(b) Fix it on the branch.** A one-line change in `PostDetails.astro:34` to `/posts/${post.id}/index.png`, or moving the route to `src/pages/posts/[slug].png.ts`. That is a change outside T-39's stated scope, and under spec §5.3 the whole of §5.2 would then run again.

---

## v1 (2026-09-24, commit 55a6530)

**Date:** 2026-09-23 (local, EDT). The lanes ran from 2026-09-24T03:03Z to 04:22Z (UTC), and this report was written at 04:30Z.
**Operator:** claude-opus-5-5, the T-39 Task 8 QA report writer. Six independent Opus QA lanes (R2) produced the results: build, chrome-islands, playwright-e2e, visual-regression, site-wide and devtoolbar.
**Commit verified:** `55a65300a2dce56e7c225232ca8c4abb2c7bd5b4` on branch `upgrade/2026-09`.
**Spec:** `docs/library-packages-upgrade/2026-09-23-upgrade-design.md` (§1 success criteria, §5.2 final local verification).
**Pre-upgrade reference:** `main` at `3df6160395385555a22efd646626e6a009114a7d` (Astro 6.2.1). Two lanes built it in scratch worktrees and served it locally. The visual lane's build, served on :4331, was also used read-only by site-wide and chrome-islands. The playwright-e2e lane served its own build on :4332.
**QA artifacts:** `docs/library-packages-upgrade/qa-runs/T-39-2026-09/`.

**Overall: FAIL.** There is one open failure: a console error that also occurs on `main` and in production, so T-39 did not introduce it (see §2.6, §9 and §10). Everything else passes.

**Stack snapshot** (`qa-runs/T-39-2026-09/stack.txt`, clean install at 2026-09-24T03:05:27Z):

- Node `v22.23.3` (`.nvmrc`; the latest v22 LTS "Jod")
- pnpm `10.33.2` (`packageManager`)
- `pnpm list --depth 0` (exit 0, 40 direct packages):

```
dependencies:
@astrojs/check 0.9.10            @astrojs/markdown-remark 7.3.1   @astrojs/mdx 8.0.2
@astrojs/partytown 2.1.8         @astrojs/react 7.0.0             @astrojs/rss 4.0.19
@astrojs/sitemap 3.7.4           @astrojs/ts-plugin 1.10.12       @expressive-code/plugin-collapsible-sections 0.44.2
@expressive-code/plugin-line-numbers 0.44.2                       @resvg/resvg-js 2.6.2
astro 7.3.4                      astro-expressive-code 0.44.2     fuse.js 7.5.0
github-slugger 2.0.0             remark-collapse 0.1.2            remark-toc 9.0.0
satori 0.33.5                    sharp 0.35.4                     tailwindcss 4.3.3

devDependencies:
@divriots/jampack 0.34.1         @eslint/js 10.0.1                @tailwindcss/typography 0.5.20
@tailwindcss/vite 4.3.3          @types/react 19.3.0              @types/react-dom 19.3.0
@typescript-eslint/eslint-plugin 8.70.1                           @typescript-eslint/parser 8.70.1
astro-eslint-parser 3.1.0        eslint 10.11.0                   eslint-plugin-astro 3.2.1
eslint-plugin-jsx-a11y-x 0.2.0   husky 9.1.7                      lint-staged 17.5.1
prettier 3.9.9                   prettier-plugin-astro 1.0.1      prettier-plugin-tailwindcss 0.8.1
react 19.3.0                     react-dom 19.3.0                 typescript 6.0.3
```

Notable transitive versions: vite `8.3.0` (devtoolbar and visual lanes), `@qwik.dev/partytown` `0.14.4` (through `@astrojs/partytown` 2.1.8, Task 2).

Test browsers:
- The user's Chrome 151 (Default profile, with extensions), via Claude in Chrome.
- Google Chrome 153.0.8010.53, headless through Playwright 1.63.0 (`channel: 'chrome'`), each run in a clean, non-persistent profile.

---

### 1. Verification protocol results (gate)

Source: the build lane (`qa-runs/T-39-2026-09/lane-build.md`, `build.log`). It started from a clean tree (`rm -rf node_modules .astro dist`) on Node v22.23.3, and every command ran through `rtk proxy` so the output was not filtered.

| # | Check | Result | Evidence |
|---|---|---|---|
| B0 | Ports 4321-4340 free before start | PASS | `lsof -iTCP:4321-4340 -sTCP:LISTEN` exited 1 with no output, both before the gate and just before the preview started. |
| B1 | Clean tree | PASS | After `rm -rf`, `ls -d node_modules .astro dist` reports "No such file or directory" for all three. |
| B2 | `pnpm install --frozen-lockfile` | PASS | exit 0. "Lockfile is up to date, resolution step is skipped"; `Packages: +721`; "Done in 2.1s using pnpm v10.33.2". No warn, peer, deprecated or error lines. |
| B3 | `pnpm astro check` | PASS | exit 0. `Result (77 files): - 0 errors - 0 warnings - 0 hints` (April: 76 files, 23 hints). |
| B4 | `pnpm lint` | PASS | exit 0 with no diagnostics. `eslint . -f json` linted 74 files (34 .astro, 27 .ts, 11 .tsx, 1 .js, 1 .mjs) with 0 problems. |
| B5 | `pnpm format:check` | PASS | exit 0: "All matched files use Prettier code style!" |
| B6 | `pnpm build` (`astro check && astro build && jampack ./dist`) | PASS | exit 0 in 23 s. Embedded check: 77 files, 0/0/0. `[build] 127 page(s) built in 13.17s`, `[build] Complete!`. jampack: `✔ 308 files \| 49.06 MB → 46.23 MB \| -2.83 MB`, `✔ No issues`. `dist/` has 362 files, 130 of them .html. The only warnings are 9 `[WARN] [vite] [MODULE_LEVEL_DIRECTIVE] "use astro:head-inject"` lines, one per .mdx post: the known item parked in Task 4 (§8). |
| B7 | Stack snapshot | PASS | `stack.txt` (above). |
| B8 | Peer check (R11) | PASS | See §6. No NEW unmet peer under a direct-dependency parent. |
| B9 | `pnpm outdated` | PASS | Lists only `typescript (dev) 6.0.3 → 7.0.2`, the justified cap (§7). `pnpm outdated` exits 1 whenever it lists anything. |
| B10 | Shared preview on :4321 | PASS | `pnpm astro preview --port 4321` → "Preview server running at http://localhost:4321 (pid 46521)". `curl /` → 200, and still 200 at the end of every lane. Smoke test: `/posts/`, both carousel posts, `/search/`, `/tags/` → 200 text/html; `/rss.xml` and `/sitemap-index.xml` → 200 text/xml; `/og.png` → 200 image/png; the three `/~partytown/` assets → 200. |
| B11 | Gate re-run at report-commit time (report writer, after the devtoolbar harness `.mjs` files were archived as `.mjs.txt`, see §8) | PASS | `pnpm lint` exit 0; `pnpm astro check` exit 0 with `Result (77 files): 0 errors, 0 warnings, 0 hints`; `pnpm format:check` exit 0. Before the rename, `pnpm lint` failed with 42 `no-undef` errors, all in `qa-runs/T-39-2026-09/devtoolbar/harness/*.mjs`, which were QA artifacts and not site code. |
| B12 | Teardown at report time (report writer) | PASS | `pnpm astro preview stop` printed "Stopped preview server (pid 46521)." `lsof -iTCP:4321-4340 -sTCP:LISTEN` then exited 1 with no listeners, and `astro preview status` reports "No preview server is running." `git worktree list` shows only the main checkout (`55a6530 [upgrade/2026-09]`), so every lane's scratch worktree is gone. |

Gate output tail (`build.log`, lines 9-12, 331-332, 1014):

```
Result (77 files):
- 0 errors
- 0 warnings
- 0 hints
[build] 127 page(s) built in 13.17s
[build] Complete!
✔ 308 files | 49.06 MB → 46.23 MB | -2.83 MB
 ✔ No issues
```

#### 1.1 Step 2: browser window visibility

| Check | Result | Evidence |
|---|---|---|
| `document.visibilityState` in the user's Chrome (chrome-islands lane) | PASS (after switching to Playwright, as plan Step 2 requires) | **`"hidden"`**, with `document.hidden === true` and `hasFocus() === false`, right after opening tab 1068544351 and on every later page. `resize_window` to 1280×1800 had no effect: inner size stayed 1854×1064, and the outer size read 0×0, then 291×167. Plan Step 2 says to switch to headless Playwright in this case. The chrome lane handed off the real-input parts of the slider, search, tags and navigation checks and did **not** use any native-setter, `scrollLeft=` or `scrollBy` fallback. Every input it did send was confirmed `isTrusted === true`. |
| `document.visibilityState` in Playwright (playwright-e2e lane) | PASS | `"visible"` on 27 of 27 recorded visits. All authoritative real-input checks below come from this lane. |

#### 1.2 Step 2a: Partytown service worker (Task 2 carry-over; ruling R20)

| Check | Result | Evidence |
|---|---|---|
| 2a.1 Partytown assets on the branch | PASS | `/~partytown/partytown.js` → 200 (3198 B); `/~partytown/partytown-sw.js` → 200 (47177 B); `/~partytown/partytown-sandbox-sw.html` → 200 (45949 B). Checked with curl (build lane B10, Playwright P0) and in-page `fetch` (P0). |
| 2a.2/2a.3 Clean headless profile, branch :4321, `/posts/octoprint-prusa-core-one-raspberry-pi/` (**authoritative**) | PASS (at item 3) | Playwright P0: fresh non-persistent context, no GA blocking, 7 s wait. **Console: 0 errors, 0 warnings, and no ServiceWorker registration error.** `navigator.serviceWorker.getRegistrations()` returns `[{scope: "http://localhost:4321/~partytown/", active: ".../~partytown/partytown-sw.js", state: "activated"}]`. gtag runs through Partytown: `gtag/js?id=G-QQMCTBW5TH` and `g/collect?...en=page_view` appear in the blob worker's resource timing and not in the main window's. The page-target CDP `Network` stream has no googletagmanager request. The analytics `<script>` tags are `type="text/partytown-x"`. The one `g/collect` ended `net::ERR_ABORTED` (recorded, not a failure). Because P0 passed at item 3, items 4-5 were not needed. For extra evidence, P0 was also run against main `3df6160` (:4332) in the same clean-profile setup: no SW error, registration `activated`. |
| 2a (characterisation) The error Task 4 saw in the user's Chrome profile | PASS (R20 confirmed: extension-caused) | Chrome lane PT. An in-page `fetch('/~partytown/partytown-sw.js')` is rejected with "Failed to fetch", while `curl` returns 200 (47177 B). The lane pointed the page at a scratch logging server (127.0.0.1:4391): its requests for `/control.js`, `/~partytown/partytown.js` and `/~partytown/other-sw.js` reached the server, but `/~partytown/partytown-sw.js` and `/x/partytown-sw.js` **never did**, while a `curl` of the same URL was logged. Cause: uBlock Origin Lite (`ddkjiahejlhfcafbddmgiahcphecmpfh`) has a declarativeNetRequest rule, id 202, `urlFilter '/partytown-sw.js'`, action `block`, in `rulesets/main/annoyances-notifications.json`. The block happens before the request is sent, so there is no `chrome-extension://` stack frame. main (Astro 6.2.1, partytown 0.13.2, :4331) logs the identical TypeError in this profile. None of the clean-profile runs (branch, main, prod) showed it. |

Because Step 2a passed at item 3, its exclusion clause ("excludes only this one documented, profile-independent error") does not apply. The SW TypeError depends on the profile and never appears in the authoritative clean profile. Steps 3.8, 4.5 and 5.4 are graded in §2 below.

---

### 2. React islands (spec §5.2)

Evidence lanes:
- **Chrome** = chrome-islands (`lane-chrome-islands.md`): the user's Chrome, hidden window.
- **PW** = playwright-e2e (`lane-playwright-e2e.md`, `playwright/results.json`, 275/275 checks): clean headless profile, visible document.

When the chrome lane could not complete a real-input check because the window was hidden, plan Step 2 allows switching to headless Playwright. Such a row is graded on the Playwright result and cites both lanes.

#### 2.1 `ImageSliderClient` (`client:only="react"`)

| Island | Page | Check | Result | Evidence |
|---|---|---|---|---|
| ImageSliderClient | `/posts/octoprint-prusa-core-one-raspberry-pi/` | 3.1 Carousels present, slide count = N | PASS | Chrome S3.1a: 7 `[aria-roledescription=carousel]` with N = 2,2,2,3,3,2,2 (16 slides); every `clientWidth` is 734 and `scrollWidth` is N×734. PW P1: N matches the `astro-island` props on all 7. |
| ImageSliderClient | octoprint | 3.2 Every slide `<img>` has `complete && naturalWidth>0` | PASS | Chrome S3.2a: the slides are `loading=lazy` and off-screen at load, so 0/16 are loaded then. After a real wheel scroll through every carousel, 16/16 are complete with `naturalWidth>0`. The 2 that had not yet been requested (slide 3 of #3 and #4) also returned 200 image/webp and decoded (530×438, 858×1010). PW P1: all images `naturalWidth>0` after walking the slides (2/3 at start on 3-slide carousels). |
| ImageSliderClient | octoprint | 3.3 Start state: Prev disabled, Next enabled | PASS | Chrome S3.3a: all 7 have `scrollLeft 0`, Prev `disabled` (opacity 0.3), Next enabled, and `__reactProps` present (proof of hydration). PW P1: the same on all 7. |
| ImageSliderClient | octoprint | 3.4 Next = +1 slide width; N−1 clicks reach the end (Next disabled); Prev = −1 slide | PASS (via PW) | Chrome S3.4a (partial, hidden window): a trusted Next click on #0 ended at `scrollLeft 734` = `clientWidth`, then Next was disabled and Prev went back to 0. A real click on #1 stalled at 5 px because smooth scroll does not advance in a hidden window, so the check was handed to PW. PW P1 desktop (128/128): a real mouse click on Next moves +734 at every step. Walking to the end reaches `scrollWidth−clientWidth` with Next disabled, and Prev moves −734. Focus Next + Enter/Space moves +734 with page `scrollY` unchanged. Identical on main. |
| ImageSliderClient | octoprint | 3.5 Partial horizontal scroll snaps to a slide edge | PASS | Chrome S3.5a: real single-tick wheel scrolls settled at exact multiples of 734 (#0 0→734→0; #3 0→734→1468→0; #4 0→734→1468→734). PW P1: a 40% wheel (287 px) moved the scroller and snapped back to offset 0 (mod 0), both from the start and from the end. A 70% wheel advanced 1→2 (mod 0). |
| ImageSliderClient | octoprint | 3.6 Labels read "Slide k of N" | PASS | Chrome S3.6a: every `aria-label` is exactly `Slide k of N`. PW P1: the same on all 7. |
| ImageSliderClient | octoprint | 3.7 After a theme toggle, checks 1 and 3 still pass and the carousel is readable | PASS | Chrome S3.7a: a real `#theme-btn` click switched dark→light (`data-theme=light`, body `rgb(251,254,251)`, `localStorage.theme=light`). After a reload, all 7 carousels had the right N, the start state and hydration. Carousel border and button colours match main exactly. PW P1-dark (11/11): a toggle click switched light→dark. The Next icon `rgb(234,237,243)` on `bg-skin-card/80` over `rgb(33,39,55)` measures 9.63:1 contrast (light theme 12.44:1; main 9.63:1). Screenshot: `playwright/screenshots-branch/dark-carousel-octoprint-prusa-core-one-raspberry-pi.png`. |
| ImageSliderClient | octoprint, 375×812 touch | Mobile slider (extra) | PASS | PW P1-mobile (99/99): `clientWidth 341`. Taps on Next/Prev move ±341, and Enter/Space move +341. Touch swipes (CDP `synthesizeScrollGesture`): a 40% swipe snaps back to offset 0, a 70% swipe advances one slide. All images loaded. Screenshot: `playwright/screenshots-branch/mobile-carousel-octoprint.png`. |
| ImageSliderClient | `/posts/flutter-google-maps-embedded-map/` | 3.1 Carousels present, slide count = N | PASS | Chrome S3.1b: 2 carousels, N=2 and N=3, `clientWidth` 734, `scrollWidth` 1468/2202. PW P1: N matches the props. |
| ImageSliderClient | flutter | 3.2 Images loaded | PASS | Chrome S3.2b: 5/5 after scrolling into view plus a real wheel scroll (502×1014, 762×1618, 570×1206, 570×1206, 570×1216). PW P1: all loaded after the walk. |
| ImageSliderClient | flutter | 3.3 Start state | PASS | Chrome S3.3b and PW P1: `scrollLeft 0`, Prev disabled, Next enabled, hydrated. |
| ImageSliderClient | flutter | 3.4 Next/Prev movement | PASS (via PW) | Chrome S3.4b (hidden window): a trusted Next click started the scroll (0.5→5 px) and then stalled, so the check was handed to PW. A real wheel scroll gave #0 0→734 (Next disabled)→0 and #1 0→734→1468→734. PW P1: Next +734 on every step, end reached after N−1 clicks, Prev −734, Enter/Space +734. |
| ImageSliderClient | flutter | 3.5 Snap after a partial scroll | PASS | PW P1: a 40% wheel snaps back to offset 0 and a 70% wheel advances one slide (mod 0), on both carousels. |
| ImageSliderClient | flutter | 3.6 Labels | PASS | Chrome S3.6b: `Slide 1 of 2`, `Slide 2 of 2`; `Slide 1 of 3` … `Slide 3 of 3`. |
| ImageSliderClient | flutter | 3.7 After a theme toggle | PASS | Chrome S3.7b: a real toggle switched light→dark (`rgb(33,39,55)`, `localStorage.theme=dark`). After a reload: start state, labels and hydration all correct. PW P1-dark: all 9 carousels (both posts) pass the start check. Screenshot: `playwright/screenshots-branch/dark-carousel-flutter-google-maps-embedded-map.png`. |
| ImageSliderClient | both posts | 3.8 Console `error\|hydrat\|warning` shows nothing new | PASS | Chrome S3.8: every full load of both posts, in both themes, logged only the R20 SW TypeError, with no hydration messages and no warnings. PW: the P0 load of the octoprint post had 0 errors and 0 warnings, and P7 found 0 hydration messages. Carousel posts reached by a **full load** never logged the Partytown `proxytown` error, which occurs only on ClientRouter navigations (§2.6). |

No GIF artifact was produced for Step 3. Chrome S3.GIF recorded 6 frames of carousel #0, but exporting `image_slider_<slug>.gif` triggers a browser file download, so the lane discarded the frames without exporting them. The GIF was meant as evidence of motion. The substitute evidence is the per-step `scrollLeft` measurements above and PW P4b for the no-flash check (§2.4).

#### 2.2 `Search` (`client:load`, `/search/`)

| Island | Page | Check | Result | Evidence |
|---|---|---|---|---|
| Search | `/search/` | 4.1 Typing `hiring` lists results | PASS | Chrome S4.1: `computer` typing sent 6 trusted keydown events and 6 trusted insertText events, and the page shows "Found 5 results for 'hiring'" (ems-the-people-system, the-emotional-roller-coaster-of-hiring, two-books-which-influenced-my-hiring-pipeline, ems-why-systems-not-processes, dad-ops-playbook). PW P2: real `keyboard.type('hiring')` gives the same 5 cards. |
| Search | `/search/` | 4.2 `location.search` contains `q=hiring` | PASS | Chrome S4.2 and PW P2: `location.search === '?q=hiring'`. |
| Search | `/search/` | 4.3 Reload keeps the input and results | PASS | Chrome S4.3: a real cmd+R reload (navigation type `reload`) keeps value `hiring` and the same 5 results. PW P2: after `page.reload()`, the same 5 hrefs appear in the same order. |
| Search | `/search/` | 4.4 Clicking the first result opens `/posts/...` with 200 | PASS | Chrome S4.4 and PW P2: a real click navigates through ClientRouter to `/posts/ems-the-people-system` (h1 "The People System"). The fetch returns 200 with no redirect, and `curl` returns 200 with or without the trailing slash. |
| Search | `/search/` | 4.5 No console errors | PASS (via PW) | Chrome S4.5 logged 1× `InvalidStateError: Transition was aborted because of invalid state` on the result navigation. That error comes from the hidden window: a bare `document.startViewTransition(()=>{})` in the same hidden tab rejects `.ready` with the same message, and main (Astro 6.2.1) reproduces it on 2 of 2 navigations. The authoritative visible document (PW) has **0** `InvalidStateError` in the branch, main and prod results, and PW P2 on the branch logged **0** console errors, including the result click (`P2:click-result` is not among the branch's error labels in `playwright/console-diff.json`). One caveat: the error behind §2.6 is intermittent. main logged it at `P2:click-result` in its run, and nothing about the search page prevents it on the branch. |
| Search | `/search/` | No-match query (extra) | PASS | PW P2: `zzzzqqq` gives "Found 0 results for 'zzzzqqq'" with 0 items and 0 console errors. |

#### 2.3 `TagsList` (`client:load`, `/tags/`)

| Island | Page | Check | Result | Evidence |
|---|---|---|---|---|
| TagsList | `/tags/` | 5.1 Typing `engin` narrows the list and includes engineering-management | PASS | Chrome S5.1 (5 trusted input events after a retry, because the first click after load was lost in the hidden window) and PW P3: "5 of 68 tags matching engin", namely engineering-management 15, engineering-leadership 11, engineering-culture 2, senior-software-engineer 1, software-engineering 1. |
| TagsList | `/tags/` | 5.2 Sort alpha vs count | PASS | Chrome S5.2 and PW P3: a→z sorts by `localeCompare` ascending (3d-printing, agile, architecture-decision-records, …, wsl2) and sets `aria-pressed`. Count sorts descending with an alphabetical tiebreak (engineering-management 15, engineering-leadership 11, leadership 11, systems-thinking 8, tutorial 7), checked across all 68. The × Clear filter button restores 68. |
| TagsList | `/tags/` | 5.3 Clicking a tag opens `/tags/<tag>/` | PASS | Chrome S5.3 and PW P3: ClientRouter navigates to `/tags/engineering-management/` ("Tag: engineering management"). The fetch and `curl` both return 200. |
| TagsList | `/tags/` | 5.4 No console errors | **FAIL** | The hidden-window part passes via PW: Chrome S5.4's 1× `InvalidStateError` comes from the hidden window, as explained in 4.5, and the branch's PW results contain 0 of them. **But in the authoritative clean profile the tag-click navigation (`P3:tag-detail`) logged `NetworkError: Failed to execute 'send' on 'XMLHttpRequest': Failed to load 'http://localhost:4321/~partytown/proxytown'`**: 1 page-level error plus its mirror in the worker console. The stack runs from gtag (`qd`, `googletagmanager.com/gtag/js`) through Partytown `N.get` to a sync XHR. The error is pre-existing and identical on main; see §2.6. Step 5.4 and spec criterion 6 ask for no console errors, with no carve-out for errors that already exist. |

#### 2.4 `ClientRouter` (home → carousel post → header `/search/` → header `/tags/`)

| Island | Page | Check | Result | Evidence |
|---|---|---|---|---|
| ClientRouter | `/` → octoprint post | 6.1 Navigation happens client-side and the carousel works afterwards | PASS (via PW) | Chrome S6.1: a real link click kept the same document (a JS marker survived), all 7 islands hydrated, and a trusted Next click started the scroll and then stalled in the hidden window. A wheel scroll reached 734. PW P4: `window.__pwMarker` survived all 3 navigations, with 0 `load` and 0 `domcontentloaded` events after the initial load, and `astro:page-load` counted 1→2→3. Carousel Next went 0→734 after the navigation. |
| ClientRouter | header → `/search/` | 6.2 Search works after navigation | PASS | Chrome S6.2 and PW P4: same document, input hydrated, typing `hiring` gives 5 results and `?q=hiring`. |
| ClientRouter | header → `/tags/` | 6.3 TagsList works after navigation | PASS | Chrome S6.3 and PW P4: same document, 68 tags, and `engin` narrows the list to 5. |
| ClientRouter | `/` dark → 2 navigations | 6.4 The theme persists with no light flash | PASS | PW P4b: an rAF loop sampled **every frame (83)** across 2 header navigations, and **0 frames were not dark** (`rgb(33,39,55)` on all of them). Astro's swap drops `data-theme`, and `toggle-theme.js` restores it on `astro:after-swap` 1-4 ms later, in the same task, before anything is painted. The toggle still works after navigation. Chrome S6.4: `data-theme=dark` at every `astro:after-swap` and `astro:page-load` over 3 navigations, with null gaps of 26, 2 and 15 ms inside the view-transition update callback. main shows the same pattern with a 20 ms gap. |
| ClientRouter / theme | `/posts/`, `/tags/`, `/about/`, `/posts/audio-vs-paper-books/` | Theme on full loads, no FOUC (extra) | PASS | PW P5: an `addInitScript` recorded `data-theme=dark` and body `rgb(33,39,55)` at `DOMContentLoaded` and at the first rAF (t = 9-22 ms) on 4 `page.goto` loads. A reload and a new tab were also dark. |
| ClientRouter | all navigations above | 6.5 No hydration or runtime errors on any page (spec §5.2) | **FAIL** | Hydration: P7 found 0 `astro-island[ssr]` left over 27 visits and 47 islands, and 0 hydration messages. Chrome's 5× `InvalidStateError` comes from the hidden window (evidence in 4.5) and does not occur in PW. **But the clean profile logged the Partytown `proxytown` NetworkError on the P4 navigations**, in addition to `P3:tag-detail` (§2.3): 2 at `P4:post` and 1 at `P4:search` (page level, each mirrored in the worker console). The error is pre-existing and not a regression (§2.6). |

#### 2.5 SSR React components and hydration

| Island | Page | Check | Result | Evidence |
|---|---|---|---|---|
| SSR React (`Card`, `Datetime`, `Thread`, `ThreadCard`, `TipCard`) | `/`, `/posts`, `/tips`, `/threads` | Render identically to the pre-upgrade build; children pass through | PASS | Visual lane: main-vs-branch captures are **0 px** different on all four routes in both themes. Element counts (196/156/219/220), `innerText` and per-element computed styles are identical (§3). |
| All islands | 27 visits (goto, reload, client-nav) | P7 hydration sanity | PASS | 0 `astro-island[ssr]` remained on 47 islands. 0 console, `pageerror`, iframe, worker or SW messages matched `hydrat`, `Minified React error #418-425`, `did not match` or `server rendered HTML`. |

#### 2.6 Console summary (spec criterion 6: "with no console errors")

| Check | Result | Evidence |
|---|---|---|
| Chrome CON: no console errors other than the R20 SW TypeError (user profile, hidden window) | PASS (via PW) | The chrome lane recorded FAIL for 5× `InvalidStateError` (one per ClientRouter navigation). That error comes from the hidden window: a bare `startViewTransition` in the same tab rejects `.ready` with the same message, main (Astro 6.2.1) reproduces it on 2 of 2 navigations, and `astro/dist/transitions/router.js:318` never handles `.ready` in either 6.2.1 or 7.3.4. The lane named PW P4 (a visible document) as the authority, and `grep -c InvalidStateError` returns 0 in `playwright/results.json`, `results-main-baseline.json` and `results-prod-baseline.json`. |
| No console error on the branch that is absent from the pre-upgrade build (regression check) | PASS | `playwright/console-diff.json`: `branchOnlyCount 0`, and 0 warnings anywhere. The branch has one error signature (21 page-level errors), and main `3df6160` (same content, :4332) has the same signature with the same count, 21. |
| No console errors at all, clean profile (spec §1 criterion 6; §5.2 "No hydration or runtime errors on any page"; Steps 4.5/5.4) | **FAIL** | Error: `NetworkError: Failed to execute 'send' on 'XMLHttpRequest': Failed to load 'ORIGIN/~partytown/proxytown'`. It appears **only on ClientRouter navigations** away from a page whose Partytown worker is running gtag, never on a full load. The swap removes the Partytown sandbox iframe, which aborts the worker's sync XHR to `/~partytown/proxytown` (`requestfailed … net::ERR_ABORTED`), and gtag then logs the NetworkError. Counts: branch 21, main 21, prod (www.novifyx.com, Astro 6.2.1) 6. The rate is independent of dwell time: P8, 2 reps at each dwell, branch 1,3 / 2,2 / 3,1; main 3,2 / 2,4 / 3,1; prod 1,1 / 2,0 / 1,1 at 0.5 / 3 / 10 s. Present on `@qwik.dev/partytown` 0.13.2 (main, prod) and 0.14.4 (branch). **T-39 did not introduce it, but the criterion is absolute, and no ruling excludes it.** R20 covers only the SW-registration TypeError. |

---

### 3. Visual comparison (spec §1 criterion 7; plan Step 7)

Source: the visual-regression lane (`qa-runs/T-39-2026-09/lane-visual-regression.json`). That lane was blocked from writing a `.md` report, so the JSON plus the tables below are the record.

Method:
- Captured 1280×1800 viewports, plus 2 full-page captures, in light and dark, on the branch (:4321, Astro 7.3.4) and on main `3df6160` (:4331, Astro 6.2.1).
- Browser: headless Chrome 153 through Playwright 1.63.0.
- Diff: pixelmatch 7.2.0 (threshold 0.1) plus a raw RGB diff.
- The deciding metric is the raw pixel count, because a sensitivity control showed that a one-character inline shift is only about 0.1%.
- Both servers returned the same status and final URL for all 56 captures.

#### 3.1 Upgraded branch vs pre-upgrade main (same content)

| # | Route | Screenshots (branch) | Light: mismatch / raw px | Dark: mismatch / raw px | Parity (both themes) | Result |
|---|---|---|---|---|---|---|
| 01 | `/` | `01-home.png`, `01-home-dark.png` | 0.0000% / 0 | 0.0000% / 0 | 200/200; scrollHeight 1800/1800; 196/196 elements; innerText identical; IBM Plex Mono loaded | PASS |
| 02 | `/posts` | `02-posts-index.png`, `02-posts-index-dark.png` | 0.0000% / 0 | 0.0000% / 0 | 156/156 elements | PASS |
| 03 | `/posts/ems-connecting-the-systems` | `03-post-with-images.png`, `03-post-with-images-dark.png` | 0.0000% / 0 | 0.0000% / 0 | scrollHeight 14586/14586; 512/512 elements | PASS |
| 04 | `/posts/flutter-google-maps-embedded-map` | `04-post-with-carousel.png`, `04-post-with-carousel-dark.png` | 0.0000% / 0 | 0.0000% / 0 | scrollHeight 14417/14417; 3431/3431 elements; slides 5/5; in-viewport images 2 loaded, 0 broken on both | PASS |
| 05 | `/tips` | `05-tips-index.png`, `05-tips-index-dark.png` | 0.0000% / 0 | 0.0000% / 0 | 219/219 elements | PASS |
| 06 | `/tags` | `06-tags-index.png`, `06-tags-index-dark.png` | 0.0000% / 0 | 0.0000% / 0 | scrollHeight 3029/3029; 613/613 elements | PASS |
| 07 | `/tags/engineering-management/` | `07-tag-detail.png`, `07-tag-detail-dark.png` | 0.0000% / 0 | 0.0000% / 0 | 193/193 elements. The inline `#tag` row, where a `compressHTML` spacing change would show, is pixel-identical | PASS |
| 08 | `/threads` | `08-threads-index.png`, `08-threads-index-dark.png` | 0.0000% / 0 | 0.0000% / 0 | 220/220 elements | PASS |
| 09 | `/about` | `09-about.png`, `09-about-dark.png` | 0.0000% / 0 | 0.0000% / 0 | 149/149 elements | PASS |
| 10 | `/this-route-doesnt-exist` | `10-404.png`, `10-404-dark.png` | 0.0000% / 0 | 0.0000% / 0 | HTTP 404/404 (expected); 112/112 elements | PASS |
| 11 | `/posts/octoprint-prusa-core-one-raspberry-pi/` | `11-octoprint.png`, `11-octoprint-dark.png` | 0.0000% / 0 | 0.0000% / 0 | scrollHeight 39002/39002; 3961/3961 elements; slides 16/16 | PASS |
| 12 | `/search/?q=hiring` | `12-search.png`, `12-search-dark.png` | 0.0000% / 0 | 0.0000% / 0 | 150/150 elements; "Found 5 results for 'hiring'" on both | PASS |
| fp | `/` (full page) | `fp-home.png`, `fp-home-dark.png` | 0.0000% / 0 | 0.0000% / 0 | The page fits within 1800 px | PASS |
| fp | `/posts/ems-the-delivery-system/` (full page) | `fp-ems-the-delivery-system.png`, `fp-ems-the-delivery-system-dark.png` | 0.0000% / 0 | 0.0000% / 0 | 1280×7977 on both after a lazy-load pre-walk; 357/357 elements. Visually checked: TOC, appendix table, related posts, `#tag #tag` row spacing, share icons, footer | PASS |

28 of 28 main-vs-branch pairs are byte-identical, so no diff PNGs were written: 0 pairs are above 0.1%.

#### 3.2 Supporting visual checks

| Check | Result | Evidence |
|---|---|---|
| Noise floor (capture determinism) | PASS | A second capture of each server gave 56/56 self-pairs at 0.0000% and 0 raw px. Rendering is deterministic, so any nonzero pixel in a pair would be a real difference. |
| Sensitivity control | PASS | One NBSP inserted before one tag link on `/tags/engineering-management/` gives 0.1070% (2466 px; raw 5165 px) in one region. Light vs dark on `/` gives 98.45%. The diff pipeline can therefore see a one-character shift. |
| Below the fold: scroll-segmented captures (03, 04, 11, 06 × 2 themes) | PASS | 84/84 segment pairs are 0.0000% and 0 raw px, with identical scroll positions. Images loaded: 6/7 (04) and 22/24 (11), the same on both builds. |
| Lazy slide images not loaded in the segmented pass | PASS | `map-screen-with-marker.D1Ov7Ltm.png`, `prusaslicer-pause-gcode.CEE20evh.webp` and `telegram-resumed.CMBcKYyv.webp` are `loading=lazy` off-screen slides on both builds. `curl` returns 200 with the same size from both (110153 / 2890 / 58064 B), and each decodes once shown. |
| CSS bundle semantics (Vite 7.3.2 → 8.3.0; lightningcss 1.33, Task 7) | PASS | CSSOM multiset diff after normalisation: Tips 0/0, index 1/1, ec 0/0, Footer 11/7 residual. Every residual is an equivalent form (for example `line-height 1.5` vs `calc(1.5/1)`, `z-index -10` vs `calc(-10)`), a merged selector list with identical declarations, or merged `@layer properties` fallbacks (65 = 65 vars, identical). |
| Per-element computed styles and boxes (12 routes × 2 themes) | PASS | Element counts are equal on all 24 page-themes. There are 0 differences in non-custom properties or boxes. The only differences are the serialisation of unregistered custom properties, the `undefined` class token that 451b2c9 removed (no CSS targets it), and reordered class tokens in the carousel (R10). |
| Forced `:hover` styles | PASS | CDP `forcePseudoState(':hover')` on every a/button/summary/label (14-241 per page), after transitions finished: 0 differences on 24 page-themes. |
| Image asset hashes | PASS | 203 of 204 images in `dist` are byte-identical. Only `og.png` differs, and it equals the value Task 6 accepted (§4). |
| Console and network parity (clean profile) | PASS | 0 `pageerror`s. The only console errors are the expected 404 on `/this-route-doesnt-exist`, on both builds. The only failed requests are GA beacons, on both builds. There was no Partytown SW error. |

#### 3.3 April baseline (`baseline/*.png`) vs upgraded branch

The April baseline has known capture-environment differences:
- It was captured on `astro dev`, so the dev-toolbar pill is visible.
- It has a classic scrollbar, which shifts the whole layout uniformly by +6 px.
- It used an older Chromium.

Content added to `main` since April also shows up as differences. **main is byte-identical to the branch (§3.1), so none of these differences come from T-39.**

| # | Route | Mismatch | Explanation | Result |
|---|---|---|---|---|
| 01 | `/` | 1.8783% (21 regions) | +6 px shift and dev toolbar. Content drift: 2 new posts, and the Top tags section (13deae2, 2026-05-07). Header, nav, fonts, colours and theme icon unchanged. | PASS |
| 02 | `/posts` | 1.8611% (15) | Shift and toolbar. 2 new posts at the top; pager still "1 / 6". | PASS |
| 03 | `/posts/ems-connecting-the-systems` | 4.4359% (23) | The dense text column shifted 6 px, and the April capture shows a scrollbar. Text, line breaks and spacing are identical. | PASS |
| 04 | `/posts/flutter-google-maps-embedded-map` | 2.3411% (29) | Shift and toolbar. The carousel is the post-April pure-CSS scroll-snap version (bea04a1 T-10) with round Prev/Next buttons (0ce59e8 T-36), not the flowbite one, as expected. The longer dashes in the dashed underline come from how Chrome 153 resolves `auto` thickness: forcing 1px reproduces April exactly. | PASS |
| 05 | `/tips` | 1.5100% (48) | The Tips listing was redesigned on main in 465cc8c (2026-05-07). | PASS |
| 06 | `/tags` | 1.5041% (134) | Content drift from 63 to 68 tags, with new tags reordering rows. Controls unchanged. | PASS |
| 07 | `/tags/engineering-management/` | 2.1164% (21) | 14 → 15 articles, the expected count difference. Inline `#tag` spacing is identical to April. | PASS |
| 08 | `/threads` | 1.7342% (47) | Only the shift and the dev toolbar. | PASS |
| 09 | `/about` | 2.9787% (25) | Shift and toolbar. The kaomoji's combining U+0335 is placed differently by a fallback font in Chrome 153. main renders it identically to the branch. | PASS |
| 10 | `/this-route-doesnt-exist` | 0.5484% (16) | Shift and toolbar, plus the same `auto` dashed-underline difference as 04. | PASS |

---

### 4. Site-wide (spec §5.2 "Site-wide"; plan Step 8)

Sources:
- site-wide lane (`lane-site-wide.md`): crawls the branch `dist/` and preview and compares them with main `3df6160`'s `dist`.
- PW P6: the TOC in a browser.
- build lane: OG hashes.

| Area | Check | Result | Evidence |
|---|---|---|---|
| RSS / sitemap | W1: status, content type, `xmllint`, item and `<loc>` reachability | PASS | `/rss.xml` → 200 text/xml; `/sitemap-index.xml` → 200 text/xml; `/robots.txt` → 200 text/plain with a `Sitemap:` line. `xmllint --noout` passes on the RSS feed and on all 6 sitemaps (the index plus pages, posts, tips, threads and tags). RSS has 35 items: 28 posts and 7 tips, because `rss.xml.ts` merges tips by design. The 28 post links equal the published set derived from frontmatter (29 files, 1 draft, 0 scheduled), and the 7 tip links equal the tip slugs. All 114 sitemap `<loc>` URLs → 200 with 0 redirects, and each resolves case-exactly in `dist`. `rss.xml` is byte-identical to main, and the sitemaps are identical to main except for `<lastmod>`. |
| OG | W4: an OG image for every eligible post, each a valid 1200×630 PNG | PASS | The route filter is `!draft && !ogImage`: 28 expected, and 28 `dist/posts/*/index.png` present. sharp decodes all 29 PNGs (28 plus `og.png`): 1200×630, 4 channels. The 28 post PNGs are byte-identical to main. |
| OG | W9: baseline comparison (`shasum -a 256`) | PASS | `dist/posts/audio-vs-paper-books/index.png` = `951f184b268e003e34c26b90e7109b07c988969269b38a0e3892e668c5838660`, which **equals** `baseline/2026-09/og/sha256.txt`. `dist/og.png` = `ae6c9aa406da0d27944d155e4e9ec5fe8a92116b2f78d9897fe14697749e8902`, which **equals Task 6's accepted value**, as expected: the pre-satori baseline hash is `5eb52b44…`. A strict any-channel diff against the baseline `og.png` gives 1626 px (0.215%), all inside bbox x818-1070 y497-523: the hostname line, shifted 1-2 px, with no clipping. The report writer re-ran `shasum` on `dist/` at report time and got the same hashes. |
| TOC | W10: `<details>` counts in `dist` (.md and .mdx) | PASS | `grep -o '<details' \| wc -l`: `audio-vs-paper-books` (.md) 1, `ems-the-delivery-system` (.md) 1, `dad-ops-playbook` (.mdx) 1, matching `baseline/2026-09/toc-counts.txt` (1/1/1). The report writer re-ran it and got the same counts. Each page has one `<summary>Open Table of contents</summary>` and 8/10/7 TOC links, all pointing to ids on the same page. Each TOC block is byte-identical to main (717/1088/744 B). |
| TOC | P6: browser collapse check, .md `audio-vs-paper-books` and .mdx `dad-ops-playbook` | PASS | PW P6: exactly 1 `<details>` per page. It starts closed with the links hidden. A real click on the summary sets `open=true` and shows the links. Anchors exist for 8/8 and 7/7. Two real link clicks per post set the hash and scroll the target into view. |
| Links | W2: internal link and fragment integrity | PASS | 130 HTML files and 3622 refs checked with a case-exact resolver (GitHub Pages is case-sensitive, macOS is not). 2175 `a[href]` refs with 0 broken; 347 in-page `#frag` links with 0 unmatched. The only unresolved refs are 29 absolute meta/canonical URLs. That set is identical on main, so it is pre-existing (§8). |
| Links | W3: redirects `/posts/1/` and `/tips/1/`, and the custom 404 | PASS | Each redirect page has `<meta http-equiv="refresh" content="0;url=/posts">` (or `/tips`) and is byte-identical to main. `/this-route-doesnt-exist` → 404 text/html, and its body is byte-identical to `dist/404.html`. |
| Assets | W6: script, stylesheet, img, srcset and island component/renderer URLs resolve | PASS | 0 broken in every category. All 299 unique internal paths return 200 from the preview. The 8 JS import specifiers in `_astro` all resolve. Per-category counts are identical to main. |
| Head / meta | W7: `/`, a post, a tip, `/tags/` and `/about/` compared with main | PASS | title, description, canonical, og:image, twitter:image and theme-color are equal to main, and head element counts are equal (36/44/41/36/36). Explained differences: generator Astro 6.2.1→7.3.4; GA inline script re-laid out (Task 5) but still runs; CSS chunk renamed (Vite 8); Partytown snippet 0.13.2→0.14.4; the `/about/` head-injection block moved to the end of `<head>` with no cascade effect. |
| Pages | W8: built page sets vs the pre-upgrade build | PASS | The same *sets*, not only the same counts: posts 28, post pagination 6, tips 7, tips pagination 2, tags 68, tag pagination 8, threads 2, other 8. Astro reports 127 pages on both. The only extra `.html` is `~partytown/partytown-sandbox-sw.html`, an asset added by Partytown 0.14.4. |
| Partytown | W5: assets and GA `text/partytown` blocks with forwarded `dataLayer.push` | PASS | All 5 files in `dist/~partytown` → 200. Each of 127/127 content pages has exactly 2 `<script type="text/partytown">` (the gtag `src` for `G-QQMCTBW5TH` plus the inline config) and a bootstrap with `lib:"/~partytown/"` and `.concat(["dataLayer.push"])`. Running the inline GA body in Node gives `dataLayer [[js,<Date>],[config,G-QQMCTBW5TH]]`. Runtime behaviour: §1.2 (Step 2a PASS). |

---

### 5. devToolbar decision (spec §5.2; plan Step 9)

Source: devtoolbar lane (`lane-devtoolbar.md`, `devtoolbar/analysis-on.json`, `analysis-off.json`, `devtoolbar/runs/*`).

Setup:
- Astro 7.3.4 / Vite 8.3.0, `pnpm astro dev --port 4322`.
- The toolbar was temporarily enabled.
- Each cold start began by clearing `node_modules/.vite` and `.astro/` (keeping the `:4321` preview lock).

**Decision: remove the T-38 workaround.** The acceptance criteria were written before the first toolbar-on run.

| Check | Result | Evidence |
|---|---|---|
| C1 No 504s with the toolbar on (9 cold starts: 3 curl, 3 Chrome sequential, 3 curl + Chrome in parallel) | PASS | `count504=0` in every run. curl: 67 requests per run, all 200. Chrome: 421 responses per seq run and 365-370 per par run, all 200 or 304. |
| C2 No failed dynamic imports, pageerrors or unhandled rejections | PASS | 0 `Failed to fetch dynamically imported module`, 0 `Importing a module script failed`, 0 `UNHANDLED_REJECTION`; `pageErrors=0`, `requestfailed=0`. |
| C3 No bad optimizer lines in `dev.log` | PASS | 0 matches in 9/9 logs for `optimized dependencies changed. reloading`, `Outdated`, `error while updating dependencies`, `Processing Error` or `Mixed ESM and CJS`. 0 warn/error lines. |
| C4 The T-38 race window was actually exercised | PASS | Every run logged the late `dependencies optimized: …transitions-*` re-run while toolbar chunks were in flight. None of the 14 toolbar files was ever served under more than one `?v=` hash. |
| C5 Matches the toolbar-off baseline | PASS | Exactly 1 buffered Vite `full-reload` per run, the same as with the toolbar off. 0 console errors or warnings; all islands hydrated. |
| C6 The toolbar loaded and worked | PASS | `astro-dev-toolbar` with 4 apps on 5/5 pages in all 6 Chrome runs. Every app opened with `errorsDuringAppClicks=0`, and all 14 files in the toolbar closure returned 200/304. Screenshot: `devtoolbar/runs/on-seq-1/app-astro_audit.png`. |
| Positive controls (curl and Chrome) | PASS | `react.js?v=deadbeef` → 504, and `import(...?v=deadbe01)` threw "Failed to fetch dynamically imported module", so the detectors do catch both failure modes. |
| Toolbar-off control, config restore, daemon stop, cache state, preview still up | PASS | off-seq-1 and off-both-1 were clean (0 × 504, 1 buffered reload). `astro.config.mjs` was restored to sha256 `17f877ac…2d12`, and `git diff --exit-code` exits 0. The dev daemon stopped and :4322 is free; the :4321 preview stayed up (200). |

**Status at the verified commit:** `astro.config.mjs` at `55a6530` **still contains** the workaround (lines 20-23: the 3-line T-38 comment plus `devToolbar: { enabled: false },`), because the lane was read-only and restored the file. Removing it is a code change that the implementer must commit under R2. The plan message is `chore(T-39): drop T-38 devToolbar workaround, fixed on Vite 8`. Astro 7.3.4 defaults to `devToolbar.enabled: true`, which is exactly the configuration tested here, and production is unaffected because the toolbar is dev-only. That commit changes the tree, so it must pass the per-commit gate.

---

### 6. Peer warnings (R11 criterion; R13: transitive peer warnings are recorded here)

Source: `qa-runs/T-39-2026-09/peers.txt`. `pnpm install --resolution-only` on a scratch copy exited 0, and the scratch lockfile sha256 `f2e6d155…6cdd` was unchanged and equal to the repo lockfile.

```
 WARN  Issues with peer dependencies found
.
└─┬ @divriots/jampack 0.34.1
  └─┬ quicklink 2.3.0
    ├── ✕ unmet peer react@^16.8.0: found 19.3.0
    └── ✕ unmet peer react-dom@^16.8.0: found 19.3.0
```

| Item vs baseline (`baseline/2026-09/gate.txt`) | Status | Result |
|---|---|---|
| `@divriots/jampack 0.34.1 > quicklink 2.3.0 > react/react-dom@^16.8.0` (found 19.3.0) | SAME. Transitive: quicklink is not a direct dependency. Upstream-locked: jampack 0.34.1 is the registry latest and declares `quicklink ^2.3.0`, and only quicklink 3.x accepts React 19. | PASS (informational under R11/R13) |
| `astro 6.2.1 > tsconfck 3.1.6 > typescript@^5.0.0` | GONE: tsconfck has 0 matches in the lockfile under Astro 7.3.4 | PASS |
| `astro-eslint-parser 3.0.0 > … > @emnapi/runtime@^2.0.0-alpha.3` | GONE | PASS |
| `eslint-plugin-jsx-a11y 6.10.2 > eslint@^3..^9` | GONE: replaced by `eslint-plugin-jsx-a11y-x ^0.2.0` | PASS |
| NEW unmet peer under a direct-dependency parent | none | PASS |

Deprecated subdependencies went from 4 (3 transitive plus the direct `@types/github-slugger`) to 2 transitive: `@ungap/structured-clone@1.2.0` and `whatwg-encoding@2.0.0`. No direct dependency is deprecated.

---

### 7. Outdated packages and the TypeScript cap

Source: `qa-runs/T-39-2026-09/outdated.txt`.

| Check | Result | Evidence |
|---|---|---|
| `pnpm outdated` lists only the capped TypeScript | PASS | The only row is `typescript (dev) 6.0.3 → 7.0.2`. The JSON gives `wanted 6.0.3`, `isDeprecated false`. |
| All other direct dependencies at registry latest | PASS | An independent `pnpm view <pkg>@latest` cross-check found 39/40 equal to registry latest and 0 deprecated. |
| TypeScript cap is justified | PASS | Stable 6.x releases are 6.0.2 and 6.0.3, so 6.0.3 is the highest. `@typescript-eslint/eslint-plugin@latest` 8.70.1, `@typescript-eslint/parser@latest` 8.70.1 and `typescript-eslint@latest` 8.70.1 all peer `typescript ">=4.8.4 <6.1.0"`, and `@astrojs/check@latest` 0.9.10 peers `"^5.0.0 \|\| ^6.0.0"`. TS 7.0.2 falls outside both ranges even at their latest versions, so 6.0.3 is the highest allowed version (global constraint "TypeScript: the highest version allowed by the tightest peer range"). |

Toolchain notes (out of scope under R19, user follow-ups):
- Node v22.23.3 is the latest v22 LTS.
- pnpm 10.33.2 trails `latest-10` 10.34.5 and `latest` 12.6.0.

---

### 8. Observations and pre-existing issues (not failures of T-39)

**Pre-existing site defects** (identical on main; all outside T-39 scope and follow-ups for the user):
1. **Post `og:image` and `twitter:image` return 404.**
   - Affected: all 28 posts. `src/layouts/PostDetails.astro:34` builds `/posts/${post.id}.png`, but the route `src/pages/posts/[slug]/index.png.ts` emits `/posts/<slug>/index.png`.
   - Evidence: a read-only GET of `https://www.novifyx.com/posts/audio-vs-paper-books.png` returns 404, while `.../audio-vs-paper-books/index.png` returns 200. Also live in production.
   - Origin: 7e4b33e (2024-01-17).
   - Possible fixes: point the URL at `/posts/${post.id}/index.png`, or move the route to `src/pages/posts/[slug].png.ts`.
2. **`dist/404.html` canonical URLs point at a non-existent page.** Its canonical, `og:url` and `twitter:url` are `https://www.novifyx.com/404/`. Low impact.
3. **Duplicate sitemap entries.** `/tags/` and `/threads/` each appear in two sitemaps. Harmless.
4. **ClientRouter Partytown teardown error.** This is the error behind the FAIL rows in §2.3, §2.4 and §2.6. Possible fixes outside T-39: keep the Partytown sandbox out of swaps, or reload the analytics per page.
5. **Invalid class on `<html>` (`<html class="false">`).** It comes from `src/layouts/Layout.astro:41` (`${scrollSmooth && 'scroll-smooth'}`). The inline script's `dark` class is also dropped on each ClientRouter swap. Neither has a visual effect, because CSS keys only on `data-theme`.

**Environment and harness notes:**
6. **Hidden Chrome window.** In the user's Chrome window (Chrome 151, `visibilityState: hidden`):
   - smooth scroll stalls;
   - the first click after a full load is sometimes lost;
   - `startViewTransition().ready` rejects with `InvalidStateError`.

   All of this is environmental and reproduces on main. Every such check was graded on Playwright (visible document) instead.
7. **Stale Partytown debug service worker.** The user's Chrome profile already had a service worker registered at `/~partytown/debug/` on localhost:4321 from an earlier dev session. The lanes left it untouched. The user's theme preference was restored to `dark`.
8. **Theme flip on reload in Playwright.** `page.reload()` after `history.replaceState` on a host in macOS Dark mode fires `prefers-color-scheme`, and `toggle-theme.js` then persists `dark`. The behaviour is identical on branch, main and prod. See `playwright/probe-theme-reload.txt`.
9. **Production content lags main.** Production (www.novifyx.com, last deploy 31 Jul 2026) has no octoprint post, so main `3df6160` served locally was the primary same-content baseline.
10. **Wrong stop command for Astro 6.** Brief Step 2a item 5's `pnpm astro preview stop` is wrong for main's Astro 6.2.1, which has no `stop` subcommand and starts a new preview instead. The Playwright lane stopped main's preview by PID, and the branch `:4321` preview stayed at 200 throughout.
11. **Build warnings.** The 9 Vite `[MODULE_LEVEL_DIRECTIVE] "use astro:head-inject"` warnings (one per .mdx post) are the known item parked in Task 4 (upstream Astro 7 + Rolldown). There are no other warning types.
12. **Deprecated transitives and audit findings.**
    - `@ungap/structured-clone@1.2.0` ("Potential CWE-502 - Update to 1.3.1 or higher"): its parents declare `^1.0.0`, so a lockfile-only refresh to 1.4.0 is possible. It was not attempted and needs controller triage in the spirit of R19. `whatwg-encoding@2.0.0` cannot be fixed within the declared ranges.
    - `pnpm audit --prod`: 1 moderate (`fflate@0.7.3` via satori, known to be unreachable).
    - Full `pnpm audit`, dev included: 37 (8 low, 17 moderate, 12 high, 0 critical), all in build and lint tooling. Several are fixable within the declared ranges: brace-expansion, svgo, browserslist, baseline-browser-mapping, undici ×2, postcss-selector-parser. See `lane-build.md` observation 6. R19 scoped the refresh to prod, so these are flagged, not failed.
13. **Dev-toolbar Audit a11y finding.** With the toolbar re-enabled, its Audit app flags 1 dev-only a11y item on `/` ("`iframe` Required attributes missing"). The iframe is injected at runtime, probably the Partytown sandbox (unverified).
14. **Preview listens on IPv6 only.** The preview binds to `localhost` (IPv6 `::1`) only, so `http://127.0.0.1:4321/` is refused. This is Astro's default on Node ≥17 under macOS.

**QA artifact housekeeping:**
15. **Harness scripts archived as `.txt`.** The devtoolbar harness scripts are archived as `devtoolbar/harness/{analyze,crawl,pw,toolbar-closure}.mjs.txt`, following the Playwright lane's `*.mjs.txt` convention. As `.mjs` under `docs/`, `eslint .` linted them and failed with 42 `no-undef` errors (§1 B11). The code is unchanged. To rerun, copy them back to `.mjs`: `coldstart.sh` and `lane-devtoolbar.md` still use the `.mjs` names.
16. **Missing visual-lane report.** The visual lane could not write `lane-visual-regression.md` because the harness rejected the write. `lane-visual-regression.json` plus §3 of this report are the record. The main-build captures and segment captures stayed in the session scratchpad; the JSON holds their metadata and every diff result.
17. **No GIF.** No GIF was committed (see §2.1).

---

### 9. Defects

| ID | Description | Regression? | Status |
|---|---|---|---|
| (open, no defect file) | **ClientRouter navigation logs a Partytown `proxytown` NetworkError.** In the clean profile it violates spec criterion 6 and §5.2 ("no console errors" / "no runtime errors on any page") and fails Step 5.4 and the ClientRouter check. Root cause: the Astro ClientRouter swap removes the Partytown sandbox iframe, which aborts the worker's in-flight sync XHR to `/~partytown/proxytown`, and gtag then logs the resulting NetworkError. | **No.** The same signature with the same count occurs on main `3df6160` (21 = 21) and on production (6), on `@qwik.dev/partytown` 0.13.2 and 0.14.4. | Open: needs a controller decision (§10). The root cause is known, so the global-constraint rule "write `defects/T-39-D<n>.md` when the root cause isn't clear" does not apply. This lane did not create a defect file. |

No T-39 regression was found in any lane. The pre-existing site defects in §8 (items 1-3) are outside T-39 scope.

---

### 10. Overall verdict

| Lane | Lane verdict (as reported) | After grading in this report |
|---|---|---|
| build | PASS | PASS (§1, §6, §7) |
| chrome-islands | FAIL (CON / S4.5 / S5.4: `InvalidStateError`) | Those rows PASS via PW: the error comes from the hidden window and has 0 occurrences in the visible PW document. Everything else PASS. |
| playwright-e2e | PASS (console criterion "no branch-only error vs main") | Every functional check PASS. The absolute console criterion is **FAIL** (§2.6). |
| visual-regression | PASS | PASS (§3) |
| site-wide | PASS | PASS (§4) |
| devtoolbar | PASS (decision: remove) | PASS (§5); removal pending an implementer commit |

**FAIL rows:**
1. §2.3 TagsList 5.4 "No console errors"
2. §2.4 ClientRouter 6.5 "No hydration or runtime errors on any page (spec §5.2)"
3. §2.6 "No console errors at all, clean profile (spec criterion 6)"

All three have a single cause: the pre-existing Partytown `proxytown` NetworkError on ClientRouter navigation. T-39 changed nothing observable here: the branch and main are identical.

**Overall: FAIL**

Superseded by v2 above: the proxytown console error was fixed in 80a9626 (Task 14).

Under R8 and spec §5.3, Task 9 (push and PR) must not proceed until the controller resolves this failure. The two options are:
- **(a) Rule it out.** Issue a ruling like R20 that classifies the `proxytown` NetworkError as pre-existing and excluded from criterion 6. The evidence: identical signature and count on main `3df6160`, present in production, independent of dwell time and of the Partytown version, and caused by ClientRouter teardown rather than by any T-39 change. The three FAIL rows would then become PASS with no re-test needed.
- **(b) Fix it on the branch.** For example, keep the Partytown sandbox out of ClientRouter swaps. That would be a behaviour change outside T-39's "no design changes" scope, and §5.2 would then have to run again from Step 1.

Separately, the devToolbar workaround removal (§5) still needs its implementer commit and gate run.
