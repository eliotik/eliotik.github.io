# T-39 Task 8 v2: QA lane `playwright-e2e`

**Verdict: PASS.** The whole Chrome suite passed twice: 291 of 291 checks on each run. It logged **0 console errors, 0 console warnings and 0 page errors**, counting every source (page, frames, dedicated workers, service worker, `pageerror`).

The Partytown fix from Task 14 holds:
- **Chrome, 10 ClientRouter navigations:** the sandbox iframe stays under `<html>` and loads once. There is 1 worker and 1 gtag.js request, and 0 proxytown failures. This held on 5 independent runs.
- **`pt-repro.mjs --strict`:** exits **0** (28 soft navigations, 0 sandbox reloads).
- **WebKit 17.4 and Firefox 125.0.1:** the P9 cross-browser smoke passes 14 of 14 on each, including a per-engine capture control and a hook inside the real Partytown worker. WebKit's only console errors are the network failures to the analytics hosts this harness blocked. Firefox logs none.

| | |
|---|---|
| Repo / branch / HEAD | `upgrade/2026-09` @ `63efd0867a0ba7fa14759fe98cfe0d1b363ce7a5` |
| Target | shared preview `http://localhost:4321` (pid 18132, IPv6 loopback, generator `Astro v7.3.5`). This lane did not start, stop or restart it; `curl /` still returned 200 at the end. |
| Browser (P0–P8) | installed Google Chrome **153.0.8010.53** via `chromium.launch({ channel: 'chrome', headless: true })`, Playwright **1.63.0**. No browser download. |
| Browser (P9) | Playwright **1.44.1** (installed with `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`), cached `webkit-2003` = WebKit **17.4**, `firefox-1449` = Firefox **125.0.1** |
| Node | v22.23.3 (`nvm use --silent 22.23.3`; the scratch dir has no `.nvmrc`) |
| Profile | every test group gets a fresh non-persistent `BrowserContext`: clean, no extensions, `colorScheme: 'light'`, 1280×1800 unless stated |
| `document.visibilityState` | `visible` on all 34 recorded visits |
| Run of record | run 1, 2026-09-24T16:45:34Z → 16:49:58Z: **291 checks, 0 failed** (`playwright/results.json`) |
| Repeat | run 2, 16:56:28Z → 17:00:54Z: **291/291, 0 console errors** (`playwright/results-run2.json`). P0 ran 3 more times alone: 15/15 each (`playwright/p0-repeats/`). |

## Analytics safety and harness validity

- **Chrome.** Chrome was launched with `--host-resolver-rules` that NXDOMAIN `www.google-analytics.com`, `*.google-analytics.com`, `analytics.google.com`, `*.doubleclick.net` and `www.google.com`.
  - `www.googletagmanager.com` was **not** blocked, so the real gtag.js loads and runs inside Partytown.
  - All 64 `g/collect` attempts in run 1 failed `net::ERR_NAME_NOT_RESOLVED`: 32 to google-analytics.com and 32 to the www.google.com fallback. **No hit reached GA.**
  - No request interception (`context.route`) was used anywhere, so the Partytown service-worker and `/~partytown/proxytown` path runs unmodified.
  - An earlier probe confirmed that DNS-blocked collect requests produce no console message in Chrome.
- **WebKit and Firefox (P9).** These use a local CONNECT proxy, with localhost, 127.0.0.1 and [::1] bypassed.
  - The proxy **refuses (403)** the same analytics hosts and tunnels every other host to the real internet: gtag.js, Google Fonts and Firefox's own `aus5.mozilla.org` update ping.
  - It never refused a non-analytics host: `httpRefused` and `tunnelErrors` are both empty.
- **Positive control, Chrome (`H.capture-control`, PASS).** This context is excluded from the zero-error count. It injected a page `console.error`, a dedicated-worker `console.error` (blob worker), an uncaught exception and a 404 `<img>`. The harness captured all four: `page:error` ×3, `worker:error` ×1, `pageerror` ×1. The zero-error result below therefore reflects silence, not a capture that isn't listening.
- **Positive control, WebKit and Firefox (`P9.<engine>.H.capture-control`, PASS on both).** The control injected:
  - a page `console.error`;
  - a main-frame blob-worker `console.error`, plus an uncaught throw in that worker;
  - a blob-worker `console.error` created **inside the Partytown sandbox iframe** (where the Partytown worker lives);
  - a page `setTimeout` throw.

  With Playwright 1.44.1, `worker.on('console')` never fires on either engine. Every worker message nevertheless arrives on the `page.on('console')` channel, and worker uncaught errors arrive as `pageerror`, so the capture is complete. As a second layer, P9 hooks the **real Partytown worker** at creation (`worker.evaluate`: wraps `console.error`/`warn` and adds `error`/`unhandledrejection` listeners). After the 10 navigations its buffer was `[]` on both engines (`P0.worker-internal`).
- **Checks that cannot pass vacuously.** P0 requires the following before and after the navigations: the gtag.js request was seen, a `page_view` collect attempt occurred before navigation 1, and collect attempts continued after navigation 10.

## P0 Partytown (Task 14 fix): **PASS**

### P0(1) Assets: PASS

Evidence is `playwright/p0-curl.txt`; the in-script `fetch` gives the same result (`P0.1.assets`).
```
/~partytown/partytown.js 200 text/javascript 3198B
/~partytown/partytown-sw.js 200 text/javascript 47177B
/~partytown/partytown-sandbox-sw.html 200 text/html;charset=utf-8 45949B
```

### P0(2) Clean headless profile, 10 ClientRouter navigations: PASS (10 checks + assets)

Instrumentation, all armed before `goto('/')`:
- A top-frame-only init script counts DOM `load` events on the sandbox iframe, sandbox add/remove mutations, and `astro:page-load` / `astro:before-swap`.
- Playwright counts `framenavigated` and `framedetached` for the sandbox frame, `page.on('worker')` plus `worker.on('close')`, and requests to `partytown-sandbox-sw.html`, `googletagmanager.com/gtag/js`, `/~partytown/proxytown` and `g/collect`, along with their failures.
- After Partytown booted on `/`, the sandbox `<iframe>` and both `data-astro-transition-persist` gtag `<script>`s were tagged in a `WeakMap`, so the test can confirm after every navigation that they are the *same elements*.

Navigations were real `locator.click()` calls. Each dwell timer started after `astro:page-load`. There was a 6 s settle after the last navigation.

| # | click | dwell | landed | soft (token survives) | sandbox parent × count | iframe `load` events so far | same iframe / gtag-src / gtag-init element | pending `text/partytown` |
|---|---|---|---|---|---|---|---|---|
| 0 | initial `goto('/')` | — | `/` | — | HTML × 1 | 1 | tagged | 0 |
| 1 | home card → octoprint post | 0.5 s | `/posts/octoprint-prusa-core-one-raspberry-pi/` | yes | HTML × 1 | 1 | yes / yes / yes | 0 |
| 2 | header → `/search/` | 3 s | `/search/` | yes | HTML × 1 | 1 | yes / yes / yes | 0 |
| 3 | header → `/tags/` | 0.5 s | `/tags/` | yes | HTML × 1 | 1 | yes / yes / yes | 0 |
| 4 | tags island → engineering-management | 3 s | `/tags/engineering-management/` | yes | HTML × 1 | 1 | yes / yes / yes | 0 |
| 5 | header logo → `/` | 0.5 s | `/` | yes | HTML × 1 | 1 | yes / yes / yes | 0 |
| 6 | header → `/posts/` | 3 s | `/posts/` | yes | HTML × 1 | 1 | yes / yes / yes | 0 |
| 7 | posts card → local-coding-model post | 0.5 s | `/posts/local-coding-model-desktop-macbook/` | yes | HTML × 1 | 1 | yes / yes / yes | 0 |
| 8 | header → `/tips/` | 3 s | `/tips/` | yes | HTML × 1 | 1 | yes / yes / yes | 0 |
| 9 | header → `/about/` | 0.5 s | `/about/` | yes | HTML × 1 | 1 | yes / yes / yes | 0 |
| 10 | header logo → `/` | 3 s | `/` | yes | HTML × 1 | 1 | yes / yes / yes | 0 |

Measured totals (run 1; identical in run 2 and P0 repeats 1–3):

| check | measured | result |
|---|---|---|
| `P0.2.initial` | 1 sandbox, parent `HTML`, 1 iframe load, 1 worker, 1 gtag.js request, a `page_view` collect attempt for `/`. The gtag scripts are `text/partytown-x` (executed). | PASS |
| `P0.2.soft-navs` | 10/10 soft. `load` events after the initial load: **0**. DOMContentLoaded: **0**. `astro:page-load` 1 → 11, `astro:before-swap` 10. | PASS |
| `P0.2.sandbox-parent-html` | 12/12 snapshots (initial, 10 navigations, final) show `HTML ×1`. The iframe is `<html>`'s last child. | PASS |
| `P0.2.iframe-never-reloads` | Iframe DOM `load` events **1**. Sandbox-html requests **1**. Sandbox `framenavigated` **1**. `framedetached` **0**. Mutation removals **0** (added 1). Same element after 10/10 navigations. | PASS |
| `P0.2.one-worker` | `page.on('worker')` **1** (`blob:http://localhost:4321/…`). Closed before context close: **0**. | PASS |
| `P0.2.gtag-once` | `https://www.googletagmanager.com/gtag/js?id=G-QQMCTBW5TH` requested **1×** (initial load, `fetch` from the sandbox). Both gtag `<script>`s are the same persisted elements after 10/10 navigations. 0 pending `text/partytown`. | PASS |
| `P0.2.proxytown` | **178** `/~partytown/proxytown` sync XHRs (183 in two of the repeats). **0** failed or aborted. **0** proxytown console messages. | PASS |
| `P0.2.analytics-alive` | Collect events: 6 `page_view`, 1 `scroll`. After the last navigation: `page_view /tips/`, `page_view /` (each also sent to the www.google.com fallback). | PASS |
| `P0.2.console-zero` | P0 context: **0** errors and **0** warnings from any source. | PASS |
| `P0.2.sw-registration` | `[{scope: http://localhost:4321/~partytown/, active: …/partytown-sw.js, state: activated}]`, with no registration error | PASS |

### P0(3) Deterministic repro `pt-repro.mjs --strict`: **PASS, exit 0**

Run as `node …/scratchpad/pt/pt-repro.mjs http://localhost:4321 --strict --out=…`:
- It used `localhost`, not 127.0.0.1, because the preview binds `::1` only.
- It resolved Playwright **1.63.0** from its sibling `pt/pt-keep-persist-pw` directory and launched `channel: 'chrome'`, the same installed Chrome 153.
- It ran 2026-09-24T16:41:24Z → 16:42:33Z with an empty stderr. Its default mode is route mode: cached gtag.js is served locally and Google hosts are answered locally.

Verdict:
```
{"proxytownErrors": 0, "softNavigations": 28, "softNavsWithSandboxReload": 0, "strict": true,
 "otherConsoleErrors": 0, "pageErrors": 0, "vacuousOrLeaky": false, "exitCode": 0}
```

| run | soft navs | reloads | proxytown req / failed | workers | sandbox loads | gtag served |
|---|---|---|---|---|---|---|
| 0.5 s dwell | 14 | 0 | 139 / 0 | 1 | 1 | 1 |
| 3 s dwell | 14 | 0 | 326 / 0 | 1 | 1 | 1 |

Evidence: `playwright/pt-repro.json`, `pt-repro-run.txt`, and `pt-repro.mjs.txt` (a copy of the tool).

## P1 Image slider: **PASS** (desktop 128 + dark 11 + mobile 99 = 238 checks)

**Method.**
- Expected N comes from the `astro-island` `props` (server data).
- Buttons are pressed with real `locator.click()`, or `locator.tap()` on mobile.
- After each press the test waits for scroll to start, then for `scrollLeft` to hold steady for 8 × 50 ms, then 2 rAF.
- Keyboard: `locator.focus()` on Next, confirm `document.activeElement === Next`, then `keyboard.press('Enter' | 'Space')`.
- Wheel: `page.mouse.wheel(±0.4·cw, 0)` at the scroller centre, then a 0.7·cw wheel.
- Mobile: context `isMobile, hasTouch, deviceScaleFactor 3`. Gestures use CDP `Input.synthesizeScrollGesture` with `gestureSourceType: 'touch'` at 40% and 70%.
- Snap is judged two ways: `scrollLeft % clientWidth`, and geometrically (a slide's left edge within 2 px of the scroller content edge).
- A gesture only passes if the scroller actually moved during it.

Carousels: octoprint **7** (7 slider islands), flutter-embedded **2** (2 islands).

In the table:
- Every Δ is in px.
- "imgs" is the count loaded at start → after all slides were visited (images are `loading="lazy"`).
- "wheel/swipe 40%" is the maximum displacement during the gesture → the slide it settled on, with its offset.

| viewport | carousel | N | cw | imgs | Next click Δ | walk-to-end Δs → Next disabled | Prev Δ | Enter / Space Δ (page scrollY before→after Space) | 40% back from end | 40% fwd from start | 70% fwd | checks |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1280 | octoprint #1 | 2 | 734 | 2→2 | 734 | [734] ✓ | −734 | 734 / 734 (20528→20528) | 287 → slide 2, off 0 | 287 → slide 1, off 0 | 1→2, mod 0 | 14/14 |
| 1280 | octoprint #2 | 2 | 734 | 2→2 | 734 | [734] ✓ | −734 | 734 / 734 (24725→24725) | 287 → 2, 0 | 287 → 1, 0 | 1→2, 0 | 14/14 |
| 1280 | octoprint #3 | 2 | 734 | 2→2 | 734 | [734] ✓ | −734 | 734 / 734 (24928→24928) | 287 → 2, 0 | 287 → 1, 0 | 1→2, 0 | 14/14 |
| 1280 | octoprint #4 | 3 | 734 | 2→3 | 734 | [734,734] ✓ | −734 | 734 / 734 (26952→26952) | 287 → 3, 0 | 287 → 1, 0 | 1→2, 0 | 14/14 |
| 1280 | octoprint #5 | 3 | 734 | 2→3 | 734 | [734,734] ✓ | −734 | 734 / 734 (30893→30893) | 287 → 3, 0 | 287 → 1, 0 | 1→2, 0 | 14/14 |
| 1280 | octoprint #6 | 2 | 734 | 2→2 | 734 | [734] ✓ | −734 | 734 / 734 (31012→31012) | 287 → 2, 0 | 287 → 1, 0 | 1→2, 0 | 14/14 |
| 1280 | octoprint #7 | 2 | 734 | 2→2 | 734 | [734] ✓ | −734 | 734 / 734 (32437→32437) | 287 → 2, 0 | 287 → 1, 0 | 1→2, 0 | 14/14 |
| 1280 | flutter #1 | 2 | 734 | 2→2 | 734 | [734] ✓ | −734 | 734 / 734 (0→0) | 287 → 2, 0 | 287 → 1, 0 | 1→2, 0 | 14/14 |
| 1280 | flutter #2 | 3 | 734 | 2→3 | 734 | [734,734] ✓ | −734 | 734 / 734 (11630→11630) | 287 → 3, 0 | 287 → 1, 0 | 1→2, 0 | 14/14 |
| 375 touch | octoprint #1 | 2 | 341 | 2→2 | 341 (tap) | [341] ✓ | −341 | 341 / 341 (29008→29008) | 133 → 2, 0 | 134 → 1, 0 | 1→2, 0 | 14/14 |
| 375 touch | octoprint #2 | 2 | 341 | 2→2 | 341 | [341] ✓ | −341 | 341 / 341 (34709→34709) | 134 → 2, 0 | 133 → 1, 0 | 1→2, 0 | 14/14 |
| 375 touch | octoprint #3 | 2 | 341 | 2→2 | 341 | [341] ✓ | −341 | 341 / 341 (36013→36013) | 133 → 2, 0 | 133 → 1, 0 | 1→2, 0 | 14/14 |
| 375 touch | octoprint #4 | 3 | 341 | 3→3 | 341 | [341,341] ✓ | −341 | 341 / 341 (37988→37988) | 137 → 3, 0 | 137 → 1, 0 | 1→2, 0 | 14/14 |
| 375 touch | octoprint #5 | 3 | 341 | 3→3 | 341 | [341,341] ✓ | −341 | 341 / 341 (43053→43053) | 134 → 3, 0 | 134 → 1, 0 | 1→2, 0 | 14/14 |
| 375 touch | octoprint #6 | 2 | 341 | 2→2 | 341 | [341] ✓ | −341 | 341 / 341 (44245→44245) | 134 → 2, 0 | 134 → 1, 0 | 1→2, 0 | 14/14 |
| 375 touch | octoprint #7 | 2 | 341 | 2→2 | 341 | [341] ✓ | −341 | 341 / 341 (45245→45245) | 134 → 2, 0 | 133 → 1, 0 | 1→2, 0 | 14/14 |

Each carousel's 14 checks also cover:
- **Labels:** exactly `Slide 1 of N … Slide N of N`.
- **Start:** `scrollLeft 0`, Prev `disabled`, Next enabled.
- **End:** Next `disabled`, `scrollLeft = scrollWidth − clientWidth`.
- **Walk back** to `scrollLeft 0` with Prev disabled.
- **Buttons after gestures:** the Prev/Next disabled state matches the position.
- **Images:** every `<img>` is `complete && naturalWidth > 0`.

A 40% wheel or swipe moves the scroller about 40% of a slide, and scroll-snap brings it back to the nearest edge (offset 0, `scrollLeft % clientWidth = 0`). A 70% gesture advances exactly one slide.

**Dark theme.** Dark was set with a real click on the site toggle `#theme-btn`: `data-theme` light → dark, `localStorage.theme = dark`, button label `dark`.
- The start state held on all 9 carousels: N matches the props, `scrollLeft 0`, Prev disabled, Next enabled.
- Body background is `rgb(33, 39, 55)`. Next icon vs composited button background contrast is **9.63:1**.
- Screenshots: `playwright/screenshots/dark-carousel-*.png`, `mobile-carousel-octoprint.png`.

## P2 Search `/search/`: **PASS** (5 checks)

- **Typing.** Real `keyboard.type('hiring')` gave `Found 5 results for 'hiring'` with 5 cards. The first three are `/posts/ems-the-people-system`, `/posts/the-emotional-roller-coaster-of-hiring` and `/posts/two-books-which-influenced-my-hiring-pipeline`.
- **URL.** `location.search === '?q=hiring'`.
- **Reload.** After `page.reload()`, the input value is `hiring` and the same 5 hrefs appear in the same order.
- **Result click.** A real click on the first result gave `GET /posts/ems-the-people-system` **200** (ClientRouter `fetch`, no redirect). The window marker survived, h1 is "The People System", and 0 `[ssr]` islands remained.
- **No-match.** `zzzzqqq` gave `Found 0 results for 'zzzzqqq'`, 0 items, 0 errors.

## P3 Tags `/tags/`: **PASS** (6 checks)

- **Initial state.** 68 tags, count-sorted with the `count` button `aria-pressed=true`: engineering-management 15, engineering-leadership 11, leadership 11, systems-thinking 8, tutorial 7.
- **Filter.** Typing `engin` narrowed 68 → **5**: engineering-management, engineering-leadership, engineering-culture, senior-software-engineer, software-engineering. All contain `engin`.
- **`a→z`.** The filtered list is alphabetical by `localeCompare`, with `aria-pressed` set.
- **Clear (×).** The full 68 come back alphabetical (3d-printing, agile, … wsl2). This order was verified to be *not* count-sorted, so the test can tell the two apart.
- **`count`.** Counts are non-increasing, with ties alphabetical.
- **Tag click.** `/tags/engineering-management/` loaded with **200** and 5 post links.

## P4 ClientRouter: **PASS** (6 + 2 P4b checks)

Route: `/` → home card (octoprint post) → header search → header Tags. There was no `goto` after the first load.
- **Proof of client-side navigation.** The window marker set on `/` survived all 3 navigations. There were **0** `load` and **0** DOMContentLoaded events, and `astro:page-load` went 1 → 2 → 3. Islands were hydrated after each navigation (7 / 1 / 1, 0 `[ssr]`).
- **Island after each navigation:**
  - Carousel Next click: `scrollLeft` 0 → **734** (= clientWidth). Prev was disabled before and enabled after.
  - Search: typing `hiring` gave 5 results and `?q=hiring`.
  - Tags: `engin` narrowed 68 → 5, including engineering-management.
- **P4b, dark across client navigation.** Dark was set via the toggle, then two header navigations went to `/posts/` and `/tags/`.
  - An rAF sampler saw **83 frames, 0 non-dark**; all were `rgb(33, 39, 55)`.
  - A MutationObserver shows Astro's swap drops `data-theme` and the `astro:after-swap` handler restores it 2–3 ms later, with no frame painted in between.
  - The toggle still works after navigation: dark → light → dark.

## P5 Theme / FOUC: **PASS** (6 checks)

- **Toggle on `/`.** `data-theme=dark`, `localStorage.theme=dark`, body `rgb(251, 254, 251)` → `rgb(33, 39, 55)`, `meta[name=theme-color]` = `rgb(33, 39, 55)`.
- **Full loads.** A context `addInitScript` recorded `data-theme` and `getComputedStyle(document.body).backgroundColor` at DOMContentLoaded and at the first rAF with a body. Each page was loaded with `page.goto`:

  | page | at DCL | first rAF |
  |---|---|---|
  | `/posts/` | dark, `rgb(33, 39, 55)` (t=10 ms) | dark, `rgb(33, 39, 55)` (t=25 ms) |
  | `/tags/` | dark, `rgb(33, 39, 55)` (16 ms) | dark (13 ms) |
  | `/about/` | dark, `rgb(33, 39, 55)` (13 ms) | dark (10 ms) |
  | `/posts/audio-vs-paper-books/` | dark, `rgb(33, 39, 55)` (17 ms) | dark (14 ms) |

  No light first paint on any page.
- **Persistence.** A reload and a new tab (`/tips/`) in the same context both render dark from DOMContentLoaded, with `localStorage.theme = dark`.

## P6 TOC: **PASS** (6 checks)

`audio-vs-paper-books` (.md) and `dad-ops-playbook` (.mdx) behave the same way:
- Exactly 1 `<details>` with the summary "Open Table of contents".
- Closed initially; the first link is not visible.
- A real click on the summary sets `open=true` and makes the link visible.
- Every anchor target exists: 8/8 and 7/7.
- Two TOC links were clicked for real on each post. The hash was set and the target scrolled to `top 0`, or into view if the page bottomed out (`atBottom=true`).

## P7 Hydration sanity: **PASS** (2 checks)

- **Islands.** 34 visits (goto, reload and client navigation) covered 46 islands. **0** `astro-island[ssr]` remained on any visit.
- **Messages.** **0** console or pageerror messages matched `/hydrat|Minified React error #(418|419|422|423|425)|did not match|server rendered HTML/i`, across page, frames, workers and `pageerror`.

## P8 (extra): v1 proxytown flow at 0.5 / 3 / 10 s dwell, 2 reps each: **PASS** (6 checks)

This is the flow that produced v1's `NetworkError … /~partytown/proxytown` (21 on the branch, 21 on main): `/` → post → `/search/`, in a fresh context per run.

All 6 runs now show **0 console errors and 0 aborted proxytown XHRs**.

## P9 Cross-browser smoke (Playwright 1.44.1, cached browsers): **PASS** (14/14 WebKit, 14/14 Firefox)

`localhost` resolved to the IPv6-only preview in both engines, so no `[::1]` fallback was needed. The final run is `xb-webkit.json` / `xb-firefox.json` with logs `xb-*.log`. Both engines ran the final script.

- **Context H.** The capture control described under "Analytics safety and harness validity".
- **Context A (P4 + Partytown).** 10 real-click ClientRouter navigations, the same sequence as P0(2), with an island interaction after navigations 1–3.
- **Context B (reduced P1/P2/P3).** Each page loaded with `goto`.

| check | WebKit 17.4 | Firefox 125.0.1 |
|---|---|---|
| H capture control | page ✓; main-frame worker ✓ (page channel); sandbox-iframe worker ✓; worker uncaught ✓; pageerror ✓ | same |
| P4 soft navigations (token survives, 0 `load`, expected paths, 0 `[ssr]`) | 10/10 | 10/10 |
| P4 carousel after navigation (Next Δ = cw) | 0 → 734 (cw 734) | 0 → 734 |
| P4 search after navigation | `hiring`, 5 results, `?q=hiring` | same |
| P4 tags after navigation | 68 → 5, includes engineering-management | same |
| P0 sandbox parent | `HTML ×1` on all 12 snapshots | same |
| P0 iframe not reloaded | DOM loads 1, sandbox-html requests 1, `framenavigated` 1, detached 0, same element 10/10, removals 0 | same |
| P0 gtag.js | 1 request; gtag-src is the same element 10/10; 0 pending | same |
| P0 worker event | `page.on('worker')` fired: 1 created, 0 closed | 1 created, 0 closed |
| P0 proxytown | 0 failed, 0 console | 0 failed, 0 console |
| P0 hook inside the real Partytown worker | hooked at creation; buffer after 10 navigations `[]` | hooked; `[]` |
| P1 octoprint (7 carousels / 7 islands) | N = 2,2,2,3,3,2,2. Start: Prev disabled, Next enabled. Every Next Δ = 734. End: Next disabled at max. All images loaded. Labels OK. | identical values |
| P2 search typing | `hiring` → 5 results, `?q=hiring` | same |
| P3 tags filter | 68 → 5, includes engineering-management, all match | same |
| console (contexts A + B) | 36 errors, **all exempt** (blocked analytics network errors, see below). 0 page errors. 0 failed non-analytics requests. | **0 errors**, 0 page errors, 0 failed non-analytics requests |

**WebKit console attribution.**
- WebKit logs a request the proxy refused as `Failed to load resource: The operation couldn't be completed. (kCFErrorDomainCFNetwork error 310.)`, **with no URL**.
- CFNetwork 310 is `kCFErrorHTTPSProxyConnectionFailure`. Only a CONNECT the proxy refused can produce it. The proxy refused **only** `www.google-analytics.com` ×10 and `www.google.com` ×10, with `httpRefused` and `tunnelErrors` both empty.
- Per label, the console count is exactly 2× the `requestfailed` events for blocked `g/collect` URLs. Examples: `A:/` 4 vs 2, `A:nav2` 4 vs 2, `B:P2` 8 vs 4. In total, 36 = 2 × 18 (`xb-webkit.json → consoleAttribution`).
- Every label with an error also has refused collect requests.

## Console criterion (spec §1.6, absolute): **PASS**

- **Chrome runs 1 and 2.** Over 34 visits each, the only messages captured outside the positive-control context were informational SW- and worker-creation events. There were **0 errors, 0 warnings and 0 `pageerror`** from any source.
- **`requestfailed`.** Only the 64 DNS-blocked GA collect requests (`C.requests-failed` PASS).
- **P0 and P0 repeats:** 0.
- **`pt-repro`:** 0.
- **Firefox and WebKit:** 0 errors apart from the WebKit blocked-analytics network errors attributed above.

No console error occurred, so no main-build console comparison was needed. A main build was made only to classify the Search caret race (Observation 1).

## Observations (non-failing)

1. **Search caret race (pre-existing; `src/components/Search.tsx:52-55`).**
   - **Mechanism.** On mount, the component runs `setTimeout(…, 50)` and sets `selectionStart = selectionEnd = searchStr?.length || 0`. Typing that starts within that 50 ms window has its first character pushed to the end: `hiring` → `iringh`. An instrumented `selectionStart` setter shows the caret being set to 0 while `value === 'h'` (`probe-search-caret-xb.txt`).
   - **Frequency** when typing starts the instant the island loses `ssr` (branch, first probe):
     - WebKit 2/5 and Firefox 1/5.
     - Chrome 0/5, because its hydration timing puts the timer before the first key.
     - With a 300 ms wait, 0/15 across all three engines (`probe-search-caret.txt`, `probe-search-caret-xb.txt`).
   - **Pre-existing, confirmed on a main build.**
     - `git diff main..HEAD -- src/components/Search.tsx` is empty.
     - I built main `3df6160` in a scratch worktree (Node 22.22.2, `pnpm install --frozen-lockfile` + `pnpm astro build`, both exit 0, `Astro v6.2.1`) and served `dist` read-only on `[::1]:4333`.
     - With 10 reps per engine and mode, immediate typing reorders **7/10 in WebKit and 7/10 in Firefox on main**, versus **6/10 and 2/10 on the branch**. With a 300 ms wait it is 0/10 everywhere.
     - Evidence: `probe-search-caret-main-vs-branch.txt`, `probe-search-caret-main-build.txt`. The server was killed and the worktree removed afterwards; `:4321` stayed 200.
     - Conclusion: not a regression. A real user would have to start typing within about 50 ms of hydration to hit it.
   - **Effect on this run.** It caused 1 of the 3 check failures in the first P9 WebKit attempt (below).
2. **P9 harness iterations.** Earlier JSON files were overwritten; their values come from the recorded console output of those runs.
   - **Attempt 1 (WebKit only): 3 of 12 checks failed, all from harness timing.**
     - P1 counted 3 of 7 carousels. The `client:only` slider islands lose `ssr` before React 19's async `root.render()` has created the carousel DOM. A separate probe saw all 7 present by 730 ms.
     - P2 typed `iringh`. This is Observation 1.
     - The console classifier could not attribute WebKit's URL-less error-310 messages.
     - Fix: wait for carousel count = slider-island count plus 300 ms, and for hydration plus 300 ms on search and tags (what the Chrome harness's `go()` already does). Add the 310 attribution.
   - **Attempt 2: WebKit 12/12, Firefox 12/12.** This harness still listened only on `page.on('console')`.
   - **Attempt 3: 13/13 each.** Adds `worker.on('console')` and the H control. It showed that 1.44.1's worker channel is silent, but worker messages reach the page channel.
   - **Final run: 14/14 each.** Adds the sandbox-iframe worker control and the in-worker hook. Product results were identical across attempts 2–4.
3. **GA `page_view` at short dwell (informational; GA semantics, not an error).**
   - **Chrome P0, 5 of 5 runs:** `page_view` is recorded for the initial `/` and for the 5 pages viewed for 3 s: `/search/`, `/tags/engineering-management/`, `/posts/`, `/tips/`, `/`. It is not recorded for the 5 pages left after 0.5 s.
   - **`pt-repro`:** 1 soft-navigation `page_view` for 14 soft navigations at 0.5 s dwell, and 14/14 at 3 s.
   - This matches the Task 14 ledger (14/14 at 3 s). As the ledger notes, the fix relies on GA4's "page changes based on browser history events" setting. Pages left within about 0.5 s do not get their own `page_view`, and pre-fix builds also lost short-dwell page views (ledger: 5/15).
4. **Firefox warnings (not errors), 59 in total:**
   - Partytown's sandbox property enumeration triggers deprecation notices, from `partytown-sandbox-sw.html`: `InstallTrigger`, `onmozfullscreenchange` / `onmozfullscreenerror`, `SVGGraphicsElement.nearest/farthestViewportElement`, `MouseEvent.mozInputSource/mozPressure`.
   - gtag sets `_ga` / `_ga_QQMCTBW5TH` cookies without SameSite.
   - In context A, the sandbox deprecation warnings appear only on the initial load and at the first click. This is consistent with the sandbox never reloading across the 10 navigations.
   - Chrome logged 0 warnings.
5. **`pt-repro` recorded 10 `g/collect` POSTs ending `net::ERR_ABORTED`** under its own route mode (a local fake Google). These are neither proxytown requests nor console errors, and pt-repro's verdict excludes them.
6. **Scope limits.**
   - WebKit 17.4 (Playwright build) is not Safari; real Safari was not verified.
   - The P9 harness uses Playwright 1.44.1 because only its browser builds are cached.
   - Firefox's own update ping (`aus5.mozilla.org`) went through the tunnel; this is browser-internal and harmless.
7. **Gate hygiene.**
   - Scripts are archived as `*.mjs.txt`: `docs/**/qa-runs` is not in the ESLint ignores, and v1 found `.mjs` there broke `eslint .` and `astro check`.
   - After archiving, `pnpm lint` exit 0 and `pnpm format:check` exit 0 ("All matched files use Prettier code style!").
   - `git status` shows only `?? .claude/`, `?? .serena/` and `?? docs/library-packages-upgrade/qa-runs/T-39-2026-09-v2/`; `git diff --stat` is empty.
   - Listeners seen earlier on :4331 and :4332 belonged to other lanes and were left alone.
   - This lane's only extra server was the read-only `python3 -m http.server` on `[::1]:4333`, used for the main caret comparison. It was stopped by PID after its cwd was verified as the scratch worktree's `dist`. `git worktree remove --force` then succeeded; `git worktree list` shows only the main checkout, and `:4321` returned 200 afterwards.

## Artifacts

Under `docs/library-packages-upgrade/qa-runs/T-39-2026-09-v2/playwright/`:
- **Scripts:**
  - `e2e.mjs.txt`: the Chrome harness (P0–P8, H, P7, console). Usage: `node e2e.mjs <base> <out.json> <shotsDir>`; `ONLY=H,P0,…` selects groups.
  - `xb-e2e.mjs.txt`: P9. Usage: `node xb-e2e.mjs <webkit|firefox> <base> <out.json>`, with Playwright 1.44.1.
  - `probe-search-caret.mjs.txt` and `probe-search-caret-xb.mjs.txt`. The xb probe was later parameterised with `BASE`/`REPS` env vars; its defaults reproduce the first run.
  - `pt-repro.mjs.txt`: a copy of the investigation's tool.
  - In each archived script the code body is byte-identical to the executed script; only a 3-line header was added.
- **Results:**
  - `results.json` (run of record, 291/291) and `results-run2.json` (291/291).
  - `run1.log` and `run2.log`.
  - `p0-repeats/p0-rep{1,2,3}.{json,log}`.
  - `xb-webkit.json`, `xb-firefox.json`, `xb-webkit.log` and `xb-firefox.log` (final P9 run, 14/14 each).
  - `pt-repro.json` and `pt-repro-run.txt` (command, times, exit code 0).
  - `p0-curl.txt`, `probe-search-caret.txt`, `probe-search-caret-xb.txt`, `probe-search-caret-main-vs-branch.txt` and `probe-search-caret-main-build.txt`.
- **Screenshots:** `screenshots/dark-carousel-octoprint-prusa-core-one-raspberry-pi.png`, `screenshots/dark-carousel-flutter-google-maps-embedded-map.png` and `screenshots/mobile-carousel-octoprint.png`. There are no failure screenshots because no check of record failed.

Repro, from a scratch dir holding `npm i playwright` (1.63.0) and the scripts copied as `.mjs`, with the nvm prefix:
```bash
node e2e.mjs http://localhost:4321 results.json shots
( cd xb && PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm i playwright@1.44.1 && node xb-e2e.mjs webkit http://localhost:4321 xb-webkit.json && node xb-e2e.mjs firefox http://localhost:4321 xb-firefox.json )
node <scratchpad>/pt/pt-repro.mjs http://localhost:4321 --strict
```
