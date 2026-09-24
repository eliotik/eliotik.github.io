# Lane chrome-islands: T-39 Task 8 v3 (real Chrome, user profile)

- **Date:** 2026-09-24, 15:00 to 15:27 EDT.
- **Repo:** `upgrade/2026-09` @ `9eb1ec391aedca5a7ad615f37d53568f0a0f2aa0`.
- **Preview:** shared `http://localhost:4321`. This lane did not start or stop it; it still returned `/ 200` at the end.
- **Browser:** the user's Chrome 151.0.0.0 (macOS) with extensions loaded, driven through the Claude in Chrome extension. I opened two new tabs and closed both:
  - Tab 1068544374 was the main pass.
  - Tab 1068544380 was a completion pass. It covered the carousel Next/Prev sequences the main pass had not clicked, and re-read the console for the two full loads whose console the main pass had not read.
  - I did not touch tab 1068544356, which already existed.
- **Why this re-run:** Ruling R38. Task 17b restricted Tailwind sources to `src/` and removed 412 CSS rules, so every island is re-checked on the final tree. That includes computed styles, which are compared with the v2 values.

**Lane result: FAIL.** No site defect was found. The lane fails only on PT-1 and PT-2. These two Partytown sandbox assertions cannot be evaluated in this Chrome profile: the page's request for `partytown-sw.js` is blocked client-side (R20), so Partytown falls back to main-thread execution and never creates the sandbox iframe.

Ruling R35 already makes the clean-profile playwright-e2e lane (P0) the authority for PT-1 and PT-2. R35 settles where the verdict comes from; it does not turn an unobserved check into a pass here. Every other check passed. Nothing was substituted with a native-setter, `el.click()`, `scrollLeft =` or instant-scroll fallback.

## 0. Preflight: is the preview serving HEAD?

```
/ 200 text/html
/posts/octoprint-prusa-core-one-raspberry-pi/ 200 text/html
/posts/flutter-google-maps-embedded-map/ 200 text/html
/search/ 200 text/html
/tags/ 200 text/html
/tags/engineering-management/ 200 text/html
/~partytown/partytown.js 200 text/javascript
/~partytown/partytown-sw.js 200 text/javascript
/~partytown/partytown-sandbox-sw.html 200 text/html;charset=utf-8
curl / | sha256  = cccfac2e4ff072303dce48f15c9caba0503a44d4f65a63115988609b015421b5 = sha256(dist/index.html)
dist/index.html mtime 2026-09-24 14:50:54; HEAD (9eb1ec3) commit time 14:47:51
curl / -> data-astro-transition-persist="gtag-src", "gtag-init"; sandboxParent:"html"
octoprint og:image -> https://www.novifyx.com/posts/octoprint-prusa-core-one-raspberry-pi/index.png (Task 17 fix present)
```

The preview serves the HEAD build: the Task 14 Partytown fix and the Task 17 og:image fix are both present. The only change in HEAD after 5723bef is to `CLAUDE.md`.

## 1. Step 2: visibility state (binding)

`javascript_tool` on the new tab returned:
- `visibilityState:"hidden"`, `document.hidden:true`, `hasFocus():false`.
- `outerWidth/outerHeight` of `0x0` at first and `287x168` later. `inner 1488x871`, `dpr 2`.
- `document.timeline.currentTime` of `0` at first.

I called `resize_window 1280x1800` twice. Both calls reported success, but the viewport stayed 1488x871 CSS px, and the screen is only 1728x1117 anyway. Screenshots use a 1435x840 frame. The completion tab (1068544380) was also `hidden`, with a 1040x871 viewport and a 1204x1008 frame. In both tabs the carousel's `clientWidth` is 734 px, set by the content column, which is the same as in v2.

The window is hidden, so the plan's Step 2 rule applies. Here is how I handled each kind of input:

| Input | How it behaved in this hidden tab | Used as evidence? |
|---|---|---|
| Trusted click (`computer left_click`) | A capture-phase listener logged `isTrusted:true` with the right `aria-label`. Every click was made after a frame had rendered following the last full navigation. | Yes |
| Smooth scroll from the slider's own `scrollBy({behavior:'smooth'})` | Stalls between frames. It advances and completes when screenshots force frames: scroll-event trace `0.5, 1, 2.5, 734`. No script touched `scrollLeft`. | Yes. The click is real, and the component's own scroll ran to completion. |
| Real typing (`computer type`) | Every `insertText` input event had `isTrusted:true`. | Yes |
| Real reload (`computer key cmd+r`) | Navigation entry `type:'reload'`, `responseStatus 200`. | Yes |
| `computer scroll` on a carousel | Window- and document-level capture listeners saw **0 `wheel` events** and 0 pointer or mouse events. I can't prove this is real wheel input. | No. The snap check is delegated to Playwright P1 (see S3-SNAP). |
| Keyboard on the slider (focus the carousel region, arrow keys) | Not exercised in this lane. | Delegated to Playwright P1. |

## 2. Checks

Carousel indices are 0-based.

| ID | Check | Result | Evidence |
|---|---|---|---|
| S2 | Visibility state | recorded | `hidden` (§1) |
| S3-O1 | octoprint: carousels and slide count | PASS | 7 carousels, N = [2,2,2,3,3,2,2] = 16 slides. `clientWidth` 734 and `scrollWidth` = N×734 for each. Computed: `scroll-snap-type: x mandatory`, `overflow-x: auto`, `overflow-y: hidden`, `scroll-behavior: smooth`, `scrollbar-width: none`, height 384px, border `oklch(0.928 0.006 264.531)` 1px solid, radius 8px. Slides are `center/always`, each 734 px wide. All 7 `astro-island` hydrated (`ssr` removed). |
| S3-O2 | octoprint: every slide img `complete && naturalWidth>0` | PASS | Right after load: 0/16. The images are `loading="lazy"` and the tab is hidden. After each carousel was brought into view (`scroll_to` plus a frame) and each 3-slide carousel reached slide 2 by a real Next click: `every()` = **true, 16/16**. naturalWidth by carousel: c0 608,1313 · c1 1316,1316 · c2 1358,1297 · c3 1518,1568,530 · c4 858,1265,858 · c5 1364,680 · c6 1166,1568. |
| S3-O3 | octoprint: start state | PASS | All 7: `scrollLeft 0`. Prev is `disabled` (opacity 0.3, cursor not-allowed); Next is enabled (opacity 1, cursor pointer). |
| S3-O4 | octoprint: Next moves one slide width, N−1 clicks reach the end with Next disabled, Prev goes back one | PASS | hidden window — real-input part delegated to Playwright lane P1 (plan Step 2). **All 7 carousels were also exercised here** with trusted clicks and no scroll substitution (the scroll trace comes from each carousel's own smooth `scrollBy`). `clientWidth` is 734 on every carousel, so every Next Δ below is exactly 734 (0 px off). **c0 (N=2):** Next `0.5,1,2.5,734`, giving 734. At the end (`sl+cw ≥ sw−1`), **Next disabled** (opacity 0.3). Prev `733.5,733,731.5,0`, giving 0, Prev disabled. **c1 (N=2):** Next `0.5,1,2.5,734`, end, Next disabled. Prev `733.5,733,731.5,0`, Prev disabled. **c2 (N=2):** Next `0.5,1,2.5,4.5,734`, end, Next disabled. Prev `733,731.5,0`. **c3 (N=3):** Next 0 → 734 (mod 0). Next 734 → 1468 = `scrollWidth − clientWidth` (2202 − 734), **Next disabled**. Prev 1468 → 734 (mod 0), both enabled. **c4 (N=3):** Next `0.5,1,2.5,734`. Next `734.5,735,736.5,1468`, end, **Next disabled**. Prev `1467.5,1465.5,734`, both enabled. **c5 (N=2):** Next `0.5,1,2.5,5,734`, end, Next disabled. Prev `733.5,732.5,731,0`, Prev disabled. **c6 (N=2):** Next `1,2.5,4.5,734`, end, Next disabled. Prev `733.5,733,731,0`, Prev disabled. c0 and c3 were done in tab 1068544374 (c4 Next only). c1, c2, c4 (full), c5 and c6 were done in tab 1068544380: 11/11 clicks trusted, in-page error hooks `[]`. |
| S3-O5 | octoprint: labels | PASS | Every slide `aria-label` = `Slide i of N`: `labelsOk:true` on all 7, e.g. `Slide 1 of 2\|Slide 2 of 2`, `Slide 1 of 3\|Slide 2 of 3\|Slide 3 of 3`. |
| S3-O6 | octoprint: after the theme toggle, render and start state still pass | PASS | After a full reload, a real click on `#theme-btn` switched light → dark (`data-theme` dark, `localStorage.theme` dark, body `rgb(33, 39, 55)`). All 7 carousels are still N-correct, hydrated, `scrollLeft 0`, Prev disabled, Next enabled. **Computed button styles match v2 at the precision v2 recorded** (v2 wrote `oklab(0.373 …/0.8)` and `oklab(0.925 …/0.8)`). Full values here: dark bg `oklab(0.373388 -0.000638 -0.058752 / 0.8)`, text `rgb(234, 237, 243)`; light bg `oklab(0.924934 0.000042 0.000019 / 0.8)`, text `rgb(40, 39, 40)`. Light ring `rgb(236,233,233) 0 0 0 1px` plus a shadow. Buttons are 40×40, fully rounded, `position:absolute`, `display:flex`. The carousel border `oklch(0.928 0.006 264.531)` is the same in both themes, as in v2. Renders: `chrome-islands/01-octoprint-carousel0-light-after-next-prev.png` and `02-octoprint-carousel0-dark-start.png`. Image, frame and both buttons are readable. |
| S3-O7 | octoprint: console `error\|hydrat\|Uncaught\|warn` | PASS | Three full loads of this post, two in tab 1068544374 and one in tab 1068544380, all read. Each logged exactly one message, `TypeError: Failed to register a ServiceWorker for scope ('…/~partytown/') … unknown error occurred when fetching the script`, which is allowed under R20. My in-page `console.error`/`console.warn`/`error`/`unhandledrejection` hooks caught `[]`. |
| S3-F1 | flutter: carousels and slide count | PASS | 2 carousels, N = [2,3] = 5 slides. `clientWidth` 734, `scrollWidth` 1468 and 2202. Both hydrated, `x mandatory`, same border. |
| S3-F2 | flutter: images loaded | PASS | `every()` = **true, 5/5**: 502x1014, 762x1618, 570x1206, 570x1206, 570x1216. Slide 3 of c1 loaded once slide 2 was reached (lazy). |
| S3-F3 | flutter: start state | PASS | On load in dark and again after toggling to light: both carousels `scrollLeft 0`, Prev disabled (0.3), Next enabled (1). |
| S3-F4 | flutter: Next / reach the end / Prev back | PASS | hidden window — real-input part delegated to Playwright lane P1 (plan Step 2). **Both carousels were also exercised here** with trusted clicks. **c1 (N=3):** Next `0.5,1,2.5,734`, giving 734 (Δ = `clientWidth` 734). Next `734.5,735,736.5,1468`, giving 1468 = sw−cw; **Next disabled** (opacity 0.3). Prev `1467.5,1467,1465.5,734`, back to 734 (mod 0), both enabled. **c0 (N=2):** Next `0.5,1,2.5,734` (tab 1068544374, and again in tab 1068544380 as `0.5,1,2.5,5,7.5,734`), reaching the end; **Next disabled**, Prev enabled. Prev (tab 1068544380) `733.5,733,731.5,729.5,0`, giving 0; Prev disabled, Next enabled. |
| S3-F5 | flutter: labels | PASS | `Slide 1 of 2\|Slide 2 of 2` and `Slide 1 of 3\|Slide 2 of 3\|Slide 3 of 3`, `labelsOk:true` for both. |
| S3-F6 | flutter: theme toggle, then re-check | PASS | Dark → light by a real click after a full reload. Both carousels are still in their start state. Light button colours are the same values as S3-O6. Renders: `03-flutter-carousel1-dark-at-end.png` (map slide, Next dimmed at the end) and `04-flutter-carousel0-light-start.png`. |
| S3-F7 | flutter: console | PASS | Three full loads of this post. In tab 1068544374, load 1 was read: only the allowed SW TypeError, and in-page hooks `[]` through all the clicks. Load 2, the theme-toggle reload, was not read before the next navigation cleared the tool's buffer. It was replaced by load 3, a fresh load in tab 1068544380, which was read: only the SW TypeError. In-page hooks through 2 more clicks: `[]`. |
| S3-SNAP | A partial horizontal scroll snaps to a slide edge (brief Step 3.5) | PASS (delegated) | Hidden window: the real-input part is delegated to Playwright lane P1 (plan Step 2). **Supplementary, not claimed as real input:** `computer scroll` left ×1 on octoprint c3 went 734 → 0 in one `scroll` event (mod 0, Prev disabled again). Right ×1 went 0 → 734 (mod 0). Window- and document-capture `wheel` listeners recorded **0 events** for both, so this tool's scroll is not proven to be a real wheel. |
| S3-G | GIF `image_slider_octoprint.gif` | skipped | `gif_creator start_recording` captured 3 frames of the c0 Next/Prev interaction. Exporting requires `download:true`, which triggers a browser file download, and this lane may not do that without the user's approval. I stopped the recording and cleared the frames, so no GIF was produced. The PNGs under `chrome-islands/` are the render evidence. |
| S4-1 | `/search/`: type `hiring` for real; results appear | PASS | Trusted click on the input, then `computer type "hiring"`. Input events `insertText h→hi→hir→hiri→hirin→hiring`, all `isTrusted:true`. `Found 5 results for 'hiring'`: `/posts/ems-the-people-system`, `/posts/the-emotional-roller-coaster-of-hiring`, `/posts/two-books-which-influenced-my-hiring-pipeline`, `/posts/ems-why-systems-not-processes`, `/posts/dad-ops-playbook`. Focused input (light): bg `rgb(251,254,251)`, text `rgb(40,39,40)`, border `rgb(0,108,172)`, padding `12px 12px 12px 40px`. Result links `rgb(0,108,172)`. |
| S4-2 | `location.search` contains `q=hiring` | PASS | `?q=hiring`. The tab URL updated as I typed. |
| S4-3 | Reload keeps the input and the results | PASS | **Real reload** with `computer key cmd+r`. `performance.getEntriesByType('navigation')[0].type === 'reload'`, `responseStatus 200`, the window marker is gone and `timeOrigin` changed. After the reload the input value is `hiring` and the same 5 results show. The input has `autocomplete="off"`, so this is not browser form restoration; the app read `?q=`. Screenshot `05-search-q-hiring-after-real-reload.png`. |
| S4-4 | Clicking the first result opens `/posts/…` with 200 | PASS | A trusted click on "The People System" went to `/posts/ems-the-people-system` through ClientRouter. `h1` is "The People System". `fetch(location.href)` returned 200, not redirected. curl: `/posts/ems-the-people-system` 200, `/posts/ems-the-people-system/` 200. |
| S4-5 | Console | PASS | Only the allowed SW TypeError (on the reload) and one `InvalidStateError: Transition was aborted because of invalid state` from the ClientRouter navigation. The window is hidden, so that is an observation only (§4). The console tool's buffer for the first `/search/` load was cleared by the cmd+r reload before I read it. In-page hooks installed after that load caught `[]` while typing. A fresh `/search/` load in tab 1068544380 was read: only the SW TypeError. |
| S5-1 | `/tags/`: filter `engin` narrows the list and includes engineering-management | PASS | Hydrated island, 68 tags, counter `68 of 68 tags`. Real typing gave 5 trusted `insertText` events. The list went from 68 to 5: `engineering-management:15, engineering-leadership:11, engineering-culture:2, senior-software-engineer:1, software-engineering:1`. `every(name includes 'engin')`, and the counter reads `5 of 68 tags matching “engin”`. Screenshot `06-tags-filter-engin-count-order-light.png`. |
| S5-2 | Sort toggle, alpha vs count | PASS | The default is count order over all 68, verified pairwise (count descending, ties alphabetical): `engineering-management:15, engineering-leadership:11, leadership:11, systems-thinking:8, tutorial:7`. A trusted click on `a→z` switches `aria-pressed` (count=false, a→z=true, the active one coloured `rgb(0,108,172)`). The filtered list is then alphabetical: `engineering-culture, engineering-leadership, engineering-management, senior-software-engineer, software-engineering`. A trusted click on "Clear filter" gives all 68 in alphabetical order, first `3d-printing`, last `wsl2`. A trusted click on `count` gives count order over all 68 again, same first 5. |
| S5-3 | Clicking a tag opens `/tags/<tag>/` | PASS | Trusted click on `engineering-management` → `/tags/engineering-management/` through ClientRouter (the window marker survived). Title "Tag: engineering management \| Novi Fyx", 5 post cards, `fetch` 200. |
| S5-4 | Console | PASS | Only the SW TypeError (allowed) and one InvalidStateError (hidden-window observation). |
| S6-1 | Click-only navigation `/` → carousel post; the island works | PASS | hidden window — real-input part delegated to Playwright lane P4 (plan Step 2). Measured here: from `/` (full load, `window.__qaWin='S6-root'`), a trusted click on the "Setting up OctoPrint…" link went to `/posts/octoprint-prusa-core-one-raspberry-pi/`. `__qaWin` survived, so this was a client-side navigation. 7 carousels / 16 slides, all hydrated, all in the start state. **One Next click (trusted) on c0:** scroll events `1,2.5,5,8,734`, scrollLeft 734 = `clientWidth`. Next disabled (end, N=2), Prev enabled. Images OK608, OK1313. |
| S6-2 | Header → `/search/`; one search works | PASS | Trusted click on the header search icon (`href="/search/"`) → `/search/`, `__qaWin` survived. The Search island is hydrated. Real typing `hiring` gave 6 trusted events, 5 results and `?q=hiring`. Dark input: bg `rgb(33,39,55)`, text `rgb(234,237,243)`, focus border `rgb(255,107,1)`. Links `rgb(255,107,1)`. |
| S6-3 | Header → `/tags/`; one filter works | PASS | Trusted click on header "Tags" → `/tags/`, `__qaWin` survived. TagsList is hydrated. Real typing `engin` gave 5 trusted events and a 68 → 5 list that includes engineering-management. Dark bar track `rgb(171,75,8)` (`--color-border`) with fill `skin-base/40`, the same look as the v2 screenshot. Screenshot `07-S6-tags-filter-engin-dark-after-clientrouter.png`. After that: tag click → `/tags/engineering-management/` (navigation 4), then header logo → `/` (navigation 5). `__qaWin` survived all 5. |
| S6-4 | Dark set on `/` persists across navigations with no light flash | PASS | Dark was set on `/` by a real click (`localStorage.theme=dark`). I hooked `astro:before-preparation/after-preparation/before-swap/after-swap/page-load`. At **all 25 events** (5 navigations × 5 events) the log shows `data-theme=dark`, `ls=dark`, body `rgb(33, 39, 55)`. A MutationObserver on `<html>` recorded the same pattern on every navigation: the router's root-attribute swap sets `data-theme -> null`, then `data-theme -> dark`. A `setTimeout(0)` scheduled when the removal was observed **had not run** by the time `dark` was re-set (`taskBoundarySinceRemoval=false` on 5/5 navigations). The removal and the re-set therefore happen in the same task, and no frame, light or otherwise, can render between them. `class` ends as `scroll-smooth` on the post and `false` elsewhere (pre-existing, §4). |
| PT-0 | Served Partytown config (Task 14) | PASS | The served inline snippet has `sandboxParent:"html"`. Both gtag scripts carry `data-astro-transition-persist` `gtag-src` / `gtag-init` (curl and DOM). |
| PT-1 | On `/` the sandbox iframe is a child of `<html>`, after `<body>` | **FAIL: not verifiable in this profile** | `document.querySelectorAll("iframe[src*='/~partytown/']").length === 0` on `/`, also after waiting 3 s, and there are no iframes at all. `<html>` children are `HEAD,BODY` only. The reason, from fresh evidence: in the page, `fetch('/~partytown/partytown-sw.js')` fails with `TypeError: Failed to fetch`. From the same page, `fetch('/~partytown/partytown.js')` returns 200 and `fetch('/~partytown/partytown-sandbox-sw.html')` returns 200. curl of the SW returns `200 text/javascript`. So only the SW URL is blocked client-side (R20, uBlock Origin Lite). The console shows the matching SW-registration TypeError. The Partytown snippet then runs its main-thread fallback: both gtag scripts are rewritten to `type="text/partytown-x"` and the gtag.js resource has `initiatorType:'script'`. The fallback never creates a sandbox iframe. Authority: playwright-e2e P0 (clean profile), per R35. |
| PT-2 | Same sandbox element after 3 ClientRouter navigations, and `length === 1` | **FAIL: not verifiable in this profile** | Same cause as PT-1. The iframe count was 0 on `/` and 0 after each of the 5 client navigations, `/` → post → `/search/` → `/tags/` → `/tags/engineering-management/` → `/`. No sandbox exists, so there is no `contentWindow` to mark and no identity to compare. `length === 1` is false (it is 0). Authority: playwright-e2e P0, per R35. |
| PT-3 | `transition:persist` gtag scripts survive ClientRouter navigations (the part of the fix observable here) | PASS | On `/` I saved references to both `script[data-astro-transition-persist]` elements and set `__qaMark` on each. After each of the 5 client navigations, the elements in the DOM are `===` the saved references, the markers `persist-gtag-src` / `persist-gtag-init` are intact, and `isConnected:true`. `googletagmanager.com/gtag/js` resource entries: 1 on `/` and still 1 after 5 navigations, so gtag.js was not re-fetched. |
| PT-4 | Console: only the allowed SW error; no proxytown NetworkError; no other error | PASS | The two tabs made 12 full loads and 7 ClientRouter navigations. The console tool was read for 10 of the 12 full loads, and each showed only the SW-registration TypeError (allowed, R20). The 2 unread loads were tab 1's second flutter load and its first `/search/` load; both URLs were reloaded fresh in tab 2 and read, again with only the SW TypeError. There were **0** `/~partytown/proxytown` requests or errors. That is trivially true in this profile, because the main-thread fallback never uses proxytown; the proxytown assertion itself belongs to P0. No `hydrat`, `warn` or `Uncaught` messages. The in-page hooks caught nothing except one `InvalidStateError` per client navigation (7 of 7), which is a hidden-window observation (§4). |
| CSS-R38 | Island utilities survive the Task 17b Tailwind source restriction (supplementary) | PASS | Script `scratchpad/t8v3/chrome-islands/classcheck.mjs` checked every `className` token of `ImageSliderClient.tsx` (41), `Search.tsx`, `TagsList.tsx` and `Card.tsx` against `dist/_astro/*.css`. 0 real tokens missing. The only misses were parser noise: the `astro:content` import string and the fragments of TagsList's template-literal ternary. Those three ternary classes, `text-skin-accent`, `text-skin-base/60` and `hover:text-skin-base`, were then grepped separately and are present. The computed-style matches with v2 above confirm this in the browser. |

## 3. Failures (self-contained)

1. **PT-1 / PT-2, not verifiable in this Chrome profile.**
   - Observed: 0 Partytown sandbox iframes on `/` and after 5 ClientRouter navigations; `<html>` children are only `HEAD,BODY`.
   - Cause (environment):
     - In the page, `fetch('/~partytown/partytown-sw.js')` fails with `TypeError: Failed to fetch`. Sibling `~partytown` assets fetch 200 from the same page, and curl of the SW returns 200.
     - So `serviceWorker.register` rejects, which is the console TypeError.
     - Partytown 0.14.4 then falls back to main-thread execution: the scripts become `text/partytown-x`, and no sandbox iframe is ever created.
   - Nothing in the repo is suspected:
     - PT-0: the `sandboxParent:"html"` config and the persist attributes are served.
     - PT-3: the persist half of the Task 14 fix is verified here.
   - Resolution: the iframe placement and identity half comes from the clean-profile playwright-e2e P0 lane. R35 already rules the same situation for v2.

## 4. Observations (non-failing)

- **InvalidStateError** (`Transition was aborted because of invalid state`) was logged as an unhandled rejection exactly once per ClientRouter navigation, 7 of 7. `visibilityState` was `hidden` throughout, so per the lane instructions this is a hidden-window artifact (`startViewTransition` in a hidden document) and recorded as an observation only.
- **Hidden-tab mechanics:**
  - Smooth scroll, CSS transitions and lazy loading only advance when a screenshot forces a frame. The slider's own smooth scroll completed on every trusted Next/Prev click once 2 frames had been forced.
  - `computer scroll` produced no DOM `wheel` events, so it was not used as real-input evidence.
  - The resize to 1280x1800 did not change the viewport (1488x871 CSS px, and the screen is 1728x1117).
- **Prose image margin, pre-existing:** carousel `<img>` elements have `!my-0` (`.\!my-0{margin-block:0!important}` is in the dist CSS), but their computed margin is 8px. The base-layer rule `prose-img:my-2!` (`src/styles/base.css:126`) is also `!important`. With cascade layers, important declarations in an earlier layer (base) beat those in a later layer (utilities). `base.css` is identical to `main` apart from the Task 17b `@import` line, so this is pre-existing and not a regression.
- **Filled filter icon, pre-existing:** the global base rule `svg { fill-skin-base … h-6 w-6 }` (`src/styles/base.css:119-121`) overrides the `fill="none"` / `width="14"` attributes on the TagsList filter icon. The icon renders as a filled 24px glyph, visible in both v2 and v3 screenshots.
- **Two × buttons on the tags filter, pre-existing:** the input is `type="search"`, so while it is focused and non-empty, Chrome's native cancel button shows next to the app's own "Clear filter" ×. `TagsList.tsx` is unchanged vs `main`.
- **Search result links have no trailing slash** (`/posts/ems-the-people-system`). The preview serves both forms 200 without a redirect. Pre-existing.
- **`<html class="false">`** is pre-existing (Layout.astro:41, already in the ledger). The class becomes `scroll-smooth` on post pages.
- **Leftover SW registration:** this profile has a registration with scope `http://localhost:4321/~partytown/debug/`, `active=true`, from an earlier debug session. It controls none of the pages this lane visited (`navigator.serviceWorker.controller` is null).
- **Console tool:** `read_console_messages` only keeps messages since the last full document load. Two tab-1 loads were cleared before being read: the second flutter load and the first `/search/` load. Both URLs were reloaded fresh in tab 2 and read (SW TypeError only). Every ClientRouter navigation was covered by the tool's per-load buffer as well as my in-page hooks.
- **User state restored:** `localStorage.theme` started as `light`. It was toggled for the tests and set back to `light` with a real click (body `rgb(251,254,251)`); tab 2 confirmed `light`. Both tabs I opened are closed.

## 5. Artifacts

Screenshots are in `docs/library-packages-upgrade/qa-runs/T-39-2026-09-v3/chrome-islands/`:
- `01-octoprint-carousel0-light-after-next-prev.png`: light theme, slide 1 after Next then Prev; Prev dimmed, Next active.
- `02-octoprint-carousel0-dark-start.png`: dark theme start state; image, border and both buttons readable.
- `03-flutter-carousel1-dark-at-end.png`: dark theme, slide 3 of 3 (map); Next dimmed at the end, Prev active.
- `04-flutter-carousel0-light-start.png`: light theme start state.
- `05-search-q-hiring-after-real-reload.png`: `/search/?q=hiring` after a real reload; input `hiring`, 5 results.
- `06-tags-filter-engin-count-order-light.png`: `/tags/` filtered by `engin`, count order, light.
- `07-S6-tags-filter-engin-dark-after-clientrouter.png`: `/tags/` filtered by `engin` in dark, after 3 client-side navigations.

No GIF was produced (S3-G). The scratch helper `classcheck.mjs` is at `/private/tmp/claude-501/-Users-ap-development-other-eliotik-github-io/917b6b41-1b79-43b6-8c59-b21d1efcf946/scratchpad/t8v3/chrome-islands/`.
