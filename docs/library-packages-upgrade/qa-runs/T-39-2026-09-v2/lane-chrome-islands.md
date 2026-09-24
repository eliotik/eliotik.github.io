# Lane chrome-islands: T-39 Task 8 v2 (real Chrome, user profile)

- **Date:** 2026-09-24.
- **Repo:** `upgrade/2026-09` @ `63efd0867a0ba7fa14759fe98cfe0d1b363ce7a5`.
- **Preview:** shared `http://localhost:4321`. This lane did not start or stop it.
- **Browser:** the user's Chrome 151.0.0.0 (macOS) with extensions loaded, driven through the Claude in Chrome extension. I opened my own new tabs (1068544359, then 1068544363) and closed both at the end. I did not touch tab 1068544356, which already existed.

**Lane result: FAIL.** No site defect was found. The lane fails only because two assigned Partytown assertions (PT-1 and PT-2) cannot be evaluated in this Chrome profile. The extension blocks `partytown-sw.js`, so Partytown never builds its sandbox iframe (details below). Every other check passed, or was delegated to Playwright as the plan requires for a hidden window. The controller needs to reconcile PT-1 and PT-2 against the clean-profile playwright-e2e lane, P0.

## 0. Preflight: is the preview serving HEAD with the Task 14 fix?

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
curl / | grep data-astro-transition-persist  -> gtag-src, gtag-init
curl / | grep sandboxParent                   -> sandboxParent:"html"
dist/index.html mtime Sep 24 12:29:02; HEAD commit time 12:26:18
```

The preview is serving a build of HEAD that includes the Task 14 fix: `sandboxParent:"html"` and `transition:persist` on both gtag scripts.

## 1. Step 2: visibility state (binding)

`javascript_tool` on the new tab returned `visibilityState:"hidden"`, `document.hidden:true`, `hasFocus():false`, `outerWidth/outerHeight 0x0`, `inner 1040x1449`, `dpr 2`. The window was resized to 1280x1800 first.

The window is hidden, so the plan's Step 2 rule applies: checks that need real input for the slider scroll are delegated to the playwright-e2e lane, P1/P4. I did not use a native value setter, `el.click()`, `scrollLeft =` or an instant-scroll substitute anywhere in this lane.

I measured how the hidden tab actually behaves:

| Probe | Result |
|---|---|
| `document.timeline.currentTime` about 20 s after load | `0` (the timeline never advanced) |
| `requestAnimationFrame` callback within 300 ms / 1 s | never fired |
| `IntersectionObserver` on `<body>`, 1 s | never fired |
| Next button CSS transition (`opacity`) | `CSSTransition:opacity:running:t=0`, computed opacity stuck at 0.3 |
| Extension screenshot (`computer screenshot`) | Forces a frame. After one, the timeline advanced to 114720 ms, lazy images in the viewport loaded, and Next opacity became 1. |
| Trusted click right after a full `navigate`, before any screenshot | **Dropped.** No `click` event reached a capture-phase document listener. Reproduced twice on the flutter post. The same ref click landed (`isTrusted:true`, `btn:theme-btn`) after one screenshot. |
| Real typing (`computer type`) | **Works.** Keydown and `insertText` input events are all `isTrusted:true`. |
| Real wheel (`computer scroll` left/right on a carousel) | **Works.** The scroll is instant (one `scroll` event) and snaps. |
| `scrollBy({behavior:'smooth'})` from a real Next click | **Stalls.** `scrollLeft` stayed 0 for 3 s. With forced frames it crept 0 → 0.5 → 1 → 2.5 px. |

As a result:
- The Next/Prev scroll-delta parts of S3 and S6 are delegated to Playwright P1/P4.
- Typing (S4, S5, S6) and wheel snap were done for real and are recorded with real evidence.
- Every click used as evidence was made after at least one frame had rendered since the last full navigation. Three clicks made before a frame were dropped; they are recorded above as a harness observation and not used as evidence.

## 2. Checks

| ID | Check | Result | Evidence |
|---|---|---|---|
| S2 | Visibility state | recorded | `hidden` (see §1) |
| S3-O1 | octoprint: carousels / slide count | PASS | 7 carousels, N = [2,2,2,3,3,2,2] = 16 slides. Each has `clientWidth` 734 and `scrollWidth` = N×734. `scroll-snap-type: x mandatory`; slides `center/always`. All 7 `astro-island` hydrated (`ssr` attribute removed). |
| S3-O2 | octoprint: every slide img `complete && naturalWidth>0` | PASS (method caveat) | Right after load: 0/16, because the images are `loading="lazy"` and the hidden tab runs no IntersectionObserver. Each carousel was brought into view with `scroll_to` plus one screenshot-forced frame, then a real wheel scroll moved each 3-slide carousel to slide 2. After that, `every(complete && naturalWidth>0)` = **true, 16/16**. Before the wheel scroll, slide 3 of each 3-slide carousel was not loaded; it loaded as soon as slide 2 was reached. That is lazy loading working as designed: `loading="lazy"` is unchanged vs main (the only diff in `ImageSliderClient.tsx` is the R10 class reorder). Extra check: all 16 srcs fetched 200 `image/webp` and decode with `createImageBitmap` (e.g. octoprint-connection-panel 608x1332 … cancel-script-final 1568x382). |
| S3-O3 | octoprint: start state | PASS | All 7: `scrollLeft 0`, Prev `disabled`, Next enabled. |
| S3-O4 | octoprint: Next +1 slide width, N−1 clicks to the end (Next disabled), Prev back one | PASS (delegated) | hidden window — real-input part delegated to Playwright lane P1 (plan Step 2). Attempt on record: a trusted click reached carousel 0's Next (`isTrusted:true`, `carouselIdx:0`) and the React state updated (Prev enabled once `scrollLeft` > 0). The smooth scroll could not progress without frames (0 → 2.5 px), so no delta is claimed here. |
| S3-O5 | octoprint: labels | PASS | Every slide `aria-label` = `Slide i of N` (checked per carousel, `labelsOk:true` ×7). Carousel indices in this report are 0-based. |
| S3-O6 | octoprint: theme toggle, then re-check render and start state | PASS | Real click on `#theme-btn`: dark → light (`data-theme` light, body `rgb(251,254,251)`). All 7 carousels still have `scrollLeft 0`, Prev disabled, Next enabled. Button colours follow the theme: dark bg `oklab(0.373 … / 0.8)` with text `rgb(234,237,243)`; light bg `oklab(0.925 … / 0.8)` with text `rgb(40,39,40)`. Render: `chrome-islands/02-octoprint-carousel1-light.jpg`, plus `01-…-dark-hidden-lazy-not-yet-loaded.jpg` (dark frame taken before lazy load; shows the frame and buttons). A zoom of carousel 4 (0-based) at slide 2 of 3 rendered its image with both buttons active. |
| S3-O7 | octoprint: console `error\|hydrat\|Uncaught\|warn` | PASS | Three full loads of this post each logged exactly one message: `TypeError: Failed to register a ServiceWorker for scope ('…/~partytown/') … unknown error occurred when fetching the script` (allowed, R20). Nothing else. |
| S3-F1 | flutter: carousels / slide count | PASS | 2 carousels, N = [2,3] = 5 slides, `clientWidth` 734, `scrollWidth` 1468 and 2202. Both islands hydrated. |
| S3-F2 | flutter: images loaded | PASS (method caveat) | Load: 0/5. After view plus frame: 4/5. After a real wheel scroll to slide 2 of carousel 1: **5/5** (`OK502,OK762 ; 570,570,570`). All 5 fetched 200 `image/png` and decode (502x1014, 762x1618, 570x1206, 570x1206, 570x1216). |
| S3-F3 | flutter: start state | PASS | Both: `scrollLeft 0`, Prev disabled, Next enabled. |
| S3-F4 | flutter: Next / reach end / Prev back | PASS (delegated) | hidden window — real-input part delegated to Playwright lane P1 (plan Step 2). |
| S3-F5 | flutter: labels | PASS | `Slide 1 of 2\|Slide 2 of 2` and `Slide 1 of 3\|Slide 2 of 3\|Slide 3 of 3`. |
| S3-F6 | flutter: theme toggle, then re-check | PASS | light → dark by real click. Both carousels still start-state (sl 0, Prev disabled, Next enabled). Renders: `03-flutter-carousel1-light.jpg`, `04-flutter-carousel1-dark.jpg` (image visible, both buttons visible, readable in both themes). |
| S3-F7 | flutter: console | PASS | Only the allowed SW TypeError. |
| S3-W | Real wheel scroll ends on a slide edge (brief Step 3.5; real input, supplementary to P1) | PASS | Each wheel scroll ended exactly on a slide edge (mod 0). The hidden tab fires a single `scroll` event per wheel scroll, so no intermediate, pre-snap offset was observed. The claim is only the resting position. Carousel indices are 0-based. flutter carousel 1: wheel right ×2 → `scroll` events `[734]`, `scrollLeft % clientWidth = 0`, Prev and Next both enabled. Right ×2 again → `1468` = `scrollWidth − clientWidth`, **Next disabled**, Prev enabled. Left ×2 → `734`, both enabled. octoprint carousels 3 and 4: wheel right → `734`, mod 0. |
| S3-G | GIF `image_slider_octoprint.gif` | skipped | `gif_creator` export needs `download:true`, which is a browser file download. The lane forbids that without the user's approval, so no GIF was produced. The screenshots under `chrome-islands/` are the render evidence. |
| S4-1 | `/search/`: type `hiring` for real, results appear | PASS | After a frame, a click on the input, then `computer type "hiring"`: input events `insertText h→hi→hir→hiri→hirin→hiring`, all `isTrusted:true`. `Found 5 results for 'hiring'`: ems-the-people-system, the-emotional-roller-coaster-of-hiring, two-books-which-influenced-my-hiring-pipeline, ems-why-systems-not-processes, dad-ops-playbook. |
| S4-2 | `location.search` has `q=hiring` | PASS | `?q=hiring` (the tab URL updated as I typed). |
| S4-3 | Reload keeps input and results | PASS | Full document load of the same URL `/search/?q=hiring` through the `navigate` tool (navigation entry `type:'navigate'` rather than `'reload'`, status 200): input value `hiring`, 5 results, same text. Because this was a fresh navigation, the browser had no form state to restore, so `hiring` must have come from the app reading `?q=`. Screenshot `05-search-q-hiring-after-reload.jpg`. |
| S4-4 | First result opens `/posts/…` with 200 | PASS | Trusted click on "The People System" went to `/posts/ems-the-people-system` through ClientRouter (the window marker survived). `h1` "The People System". `fetch` 200, not redirected. curl: `/posts/ems-the-people-system` 200 and `/posts/ems-the-people-system/` 200. |
| S4-5 | Console | PASS | Only the SW TypeError (allowed) and one `InvalidStateError: Transition was aborted because of invalid state` from that navigation (a hidden-window observation, see §4). |
| S5-1 | `/tags/`: filter `engin` narrows and includes engineering-management | PASS | Real typing: 5 `insertText` events, all trusted. 68 → 5: `engineering-culture, engineering-leadership, engineering-management, senior-software-engineer, software-engineering`. Every result contains `engin`. Counter reads `5 of 68 tags matching "engin"`. |
| S5-2 | Sort toggle alpha vs count | PASS | Default is count order over all 68 (verified: count descending, then alpha): engineering-management:15, engineering-leadership:11, leadership:11, systems-thinking:8, tutorial:7 … Clicking `a→z` gives alpha order over all 68; first is `3d-printing` (the expected first), last is `wsl2`. `aria-pressed` switches. The filter holds in alpha mode. Clicking `count` gives `engineering-management:15, engineering-leadership:11, engineering-culture:2, senior-software-engineer:1, software-engineering:1` (count order). Screenshot `06-tags-filter-engin-count-order.jpg`. |
| S5-3 | Clicking a tag opens `/tags/<tag>/` | PASS | Trusted click on `engineering-management` → `/tags/engineering-management/`, title "Tag: engineering management", 5 post cards (page 1), `fetch` 200. |
| S5-4 | Console | PASS | Only the SW TypeError and one InvalidStateError (hidden-window observation). |
| S6-1 | Click-only nav `/` → carousel post; the island works | PASS (Next delegated) | From `/` (full load, `window.__qaWin=1`), a trusted click on the "Setting up OctoPrint…" card led to `/posts/octoprint-prusa-core-one-raspberry-pi/`. `__qaWin` survived, so this was a client-side navigation. All 7 carousel islands hydrated with the correct start state. One Next click: trusted, landed on carousel 0's Next. The smooth scroll stalls in the hidden window, so the scroll delta is recorded as: hidden window — real-input part delegated to Playwright lane P4 (plan Step 2). |
| S6-2 | Header → `/search/`; one search works | PASS | Trusted click on the header search icon → `/search/` (`__qaWin` survived). Search island hydrated. Real typing `hiring` → 5 results and `?q=hiring`. |
| S6-3 | Header → `/tags/`; one filter works | PASS | Trusted click on header "Tags" → `/tags/` (`__qaWin` survived). TagsList hydrated. Real typing `engin` → 68 → 5, including engineering-management. A further tag click → `/tags/engineering-management/` (4th client navigation, `__qaWin` survived). |
| S6-4 | Dark set on `/` persists across navigations with no light flash | PASS | Theme set to dark on `/` by a real click. At every `astro:before-preparation`, `after-preparation`, `before-swap`, `after-swap` and `page-load` across 4 client navigations: live `data-theme=dark`, `localStorage.theme=dark`, body bg `rgb(33,39,55)`. A MutationObserver on `<html>` during navigation 4 recorded this sequence: `data-theme` removed by the router's root-attribute swap, then set back to `dark` by `toggle-theme.js`'s `astro:after-swap` handler. Between the two there is only a microtask boundary (`await doSwap(...)` → `triggerEvent("astro:after-swap")`, `node_modules/astro/dist/transitions/router.js:202-208`), never a task boundary, so a light-themed frame cannot render. This is pre-existing design (`public/toggle-theme.js` is unchanged vs main). After 3 more navigations (`/` → `/posts/` → `/tags/` → `/search/`) the header theme button still works: a real click set light, which restored the user's original preference. |
| PT-0 | Served Partytown config (Task 14) | PASS | Inline snippet has `sandboxParent:"html"`. Both gtag scripts carry `data-astro-transition-persist` `gtag-src` and `gtag-init`. |
| PT-1 | On `/` the sandbox iframe is a child of `<html>`, after `<body>` | **FAIL: not verifiable in this profile** | `document.querySelectorAll("iframe[src*='/~partytown/']").length === 0` on `/`, also after waiting 3 s, and there are no iframes at all. Cause, from evidence: `fetch('/~partytown/partytown-sw.js')` from the page fails with `TypeError: Failed to fetch`, while curl of the same URL returns 200 `text/javascript`. So a client-side blocker stops the request (R20: uBlock Origin Lite). `navigator.serviceWorker.register('/~partytown/partytown-sw.js',{scope:'/~partytown/'})` then rejects with the same TypeError that appears in the console. On that rejection the Partytown 0.14.4 inline snippet runs its fallback straight away (`…,function(e){console.error(e),T()}`). The fallback clones each `text/partytown` script to a main-thread script (types become `text/partytown-x`; the gtag.js resource has `initiatorType:'script'`). **It never creates the sandbox iframe.** The fix's `sandboxParent` placement therefore cannot be observed in this Chrome profile. Reconcile with playwright-e2e P0 (clean profile). |
| PT-2 | Same sandbox element after 3 ClientRouter navigations, `length === 1` | **FAIL: not verifiable in this profile** | Same cause as PT-1: iframe count was 0 on `/` and 0 after each of 4 + 3 client navigations. No sandbox exists, so there is no element identity to test. Reconcile with playwright-e2e P0. |
| PT-3 | `transition:persist` gtag scripts survive ClientRouter navigations (the part of the fix observable here) | PASS | On `/` I set a marker on both `script[data-astro-transition-persist]` elements, then made 3 trusted-click client navigations: `/` → `/posts/` → `/tags/` → `/search/`. Afterwards the same element objects are in the DOM (`===` the saved references, markers `persist-gtag-src` and `persist-gtag-init` intact, `isConnected:true`). `googletagmanager.com/gtag/js` resource entries: 1 at `/` and still 1 after the 3 navigations, so gtag.js was not re-fetched or re-run. |
| PT-4 | Console: only the allowed SW error; no proxytown NetworkError; no other error | PASS | Over 12 full loads and 9 ClientRouter navigations, the only `[ERROR]` was the SW-registration TypeError (allowed, R20). `/~partytown/proxytown` requests: 0, errors: 0. My own `console.error`, `error` and `unhandledrejection` hooks caught nothing else except the InvalidStateError observation (§4). No `hydrat`, `warn` or `Uncaught` messages. |

## 3. Failures (self-contained)

1. **PT-1 / PT-2, not verifiable in this Chrome profile.**
   - Observed: 0 Partytown sandbox iframes on `/` and after 7 ClientRouter navigations.
   - Cause: the page's request for `/~partytown/partytown-sw.js` fails client-side (`Failed to fetch`), while curl returns 200. `serviceWorker.register` rejects, and Partytown 0.14.4 falls back to main-thread execution without ever creating the iframe.
   - This is the environment (R20, extension), not code; nothing in the repo is suspected. The branch's `sandboxParent:"html"` config and the gtag `transition:persist` markers are served correctly (PT-0), and the persist half of the fix is verified (PT-3).
   - Resolution: the iframe-identity half must come from the clean-profile playwright-e2e lane, P0.

## 4. Observations (non-failing)

- **InvalidStateError** (`Transition was aborted because of invalid state`): logged as an unhandled rejection exactly once per ClientRouter navigation, 9 of 9 navigations. `visibilityState` was `hidden`, so per the lane instructions this is a hidden-window artifact and recorded as an observation only: `startViewTransition` in a hidden document. The ledger records 0 in a visible document.
- **Hidden-tab input mechanics** (§1): trusted clicks are dropped until the first frame after a full navigation; smooth scroll, CSS transitions, IntersectionObserver and lazy loading all advance only when a screenshot forces a frame. These are properties of the harness and window state, not of the site.
- **Lazy loading in horizontal scrollers:** slide 3 of a 3-slide carousel is 1468 px outside the scroller and does not load until the carousel reaches slide 2. Every image loaded once approached (21/21 in-page), and all 21 assets are served 200 and decode. `loading="lazy"` is pre-existing and unchanged vs main.
- **Carousel border colour** is `oklch(0.928 0.006 264.531)` (light gray) in both themes, as visible in `04-flutter-carousel1-dark.jpg`. The component is unchanged vs main apart from the R10 class reorder. Not assessed as a regression; noted for cross-checking with the visual lane.
- **Search result links have no trailing slash** (`/posts/ems-the-people-system`). The preview serves them 200 with no redirect. `Card.tsx` and `Search.tsx` are unchanged vs main, so this is pre-existing.
- **`<html class="false">`** is pre-existing (Layout.astro:41, already in the ledger). The class becomes `scroll-smooth` on post pages.
- **Leftover service-worker registration:** this profile has a registration with scope `http://localhost:4321/~partytown/debug/`, `active=true`, from some earlier debug session. It does not control any page on this lane's routes (`navigator.serviceWorker.controller` is null).
- **Search input event ordering:** during the S6 `engin` typing, the capture-phase log showed keydown/input events slightly out of order, and one keydown was missing. The final value was correct (`engin`), and a fresh-load run (S5-1) showed 5 clean in-order trusted `insertText` events. Harness noise.
- **Console tool quirk:** after one early full `navigate`, the console-reading tool did not show that load's SW TypeError, although it did show it on every later full load. My own hooks were installed after load, so for full-load errors the tool's per-load reads (S3-O7, S3-F7, S4-5, S5-4, PT-4) are the authority.
- **User state restored:** `localStorage.theme` started as `light`, was toggled for the tests, and was set back to `light` with a real click. Both tabs I opened are closed.

## 5. Artifacts

Screenshots are in `docs/library-packages-upgrade/qa-runs/T-39-2026-09-v2/chrome-islands/`:
- `01-octoprint-carousel1-dark-hidden-lazy-not-yet-loaded.jpg`: dark theme, carousel frame and buttons, image not yet loaded (hidden-tab lazy load).
- `02-octoprint-carousel1-light.jpg`: light theme, slide 1 rendered, Prev dimmed, Next active.
- `03-flutter-carousel1-light.jpg`
- `04-flutter-carousel1-dark.jpg`
- `05-search-q-hiring-after-reload.jpg`
- `06-tags-filter-engin-count-order.jpg`

No GIF was produced (S3-G).
