# T-39 Task 8 v3: QA lane `playwright-e2e`

**Verdict: PASS.** The Chrome suite ran twice and passed 291 of 291 checks each time. Across every source (page, frames, dedicated workers, service worker, `pageerror`), it logged **0 console errors, 0 console warnings and 0 page errors**.

- **Partytown (Task 14 fix).** It holds on the final tree, with 10 ClientRouter navigations in 5 independent Chrome runs:
  - the sandbox iframe stays under `<html>` and loads once;
  - there is 1 worker and 1 gtag.js request;
  - there are 0 proxytown failures.
- **`pt-repro.mjs --strict`.** Exits **0**: 28 soft navigations, 0 sandbox reloads.
- **WebKit 17.4 and Firefox 125.0.1.** The P9 smoke passes 14 of 14 on each. WebKit's only console errors are network failures to the analytics hosts this harness blocked. Firefox logs none.
- **Comparison with v2.** v3 has one product change since v2 that can affect islands: Tailwind source detection is now restricted to `src/` (5723bef, 412 unused rules removed from the shipped CSS).
  - I compared the raw measurements from v2 (63efd08) with v3 run 1: **912 of 912 measured keys are identical**. The keys cover carousel geometry, button styles, colours and contrast, search results, tag order, TOC links and Partytown structure.
  - v3 run 2 also matches v2 on 912 of 912. The v2 run-to-run noise floor is 912 of 912 as well.
  - The dark and mobile carousel screenshots are **byte-identical** to v2's (same SHA-256).

| | |
|---|---|
| Repo / branch / HEAD | `upgrade/2026-09` @ `9eb1ec391aedca5a7ad615f37d53568f0a0f2aa0` |
| Target | Shared preview `http://localhost:4321`: pid 3520, cwd = repo, IPv6 loopback, started 14:56:47 −04:00.<br>`dist/` was built at 14:50 −04:00, after HEAD's commit time of 14:47:51.<br>It serves generator `Astro v7.3.5`, `Footer.BnrdipP9.css` at 63291 B (the Task 17b size, with no `.isolate`) and post `og:image` = `/posts/<slug>/index.png`, so it is the final tree's build.<br>This lane did not start, stop or restart the preview; `curl /` still returned 200 at the end. |
| Browser (P0–P8) | Installed Google Chrome **153.0.8010.53**, launched with `chromium.launch({ channel: 'chrome', headless: true })`, Playwright **1.63.0**. No browser download. |
| Browser (P9) | Playwright **1.44.1** (installed with `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`), using the cached `webkit-2003` (WebKit **17.4**) and `firefox-1449` (Firefox **125.0.1**) |
| Node | v22.23.3 (`nvm use --silent 22.23.3`) |
| Profile | Every test group gets a fresh non-persistent `BrowserContext`: clean, no extensions, `colorScheme: 'light'`, 1280×1800 unless stated. |
| `document.visibilityState` | `visible` on all 34 recorded visits (both runs) |
| Run of record | Run 1, 2026-09-24T19:05:30Z → 19:09:55Z: **291 checks, 0 failed** (`playwright/results.json`) |
| Repeats | Run 2, 19:10:04Z → 19:14:28Z: **291/291**, 0 console errors (`playwright/results-run2.json`).<br>P0 alone ×3 (19:14:39Z, 19:15:06Z, 19:15:34Z): 15/15 each (`playwright/p0-repeats/`).<br>`pt-repro` 19:03:44Z → 19:04:55Z. WebKit ended 19:16:59Z; Firefox ended 19:17:50Z. |

## Harness: v2 reused, v3 edits

This lane reuses the v2 harness (`qa-runs/T-39-2026-09-v2/playwright/e2e.mjs.txt`, `xb-e2e.mjs.txt`). It covers every item in this lane's brief, and its positive-control contexts show that the zero-error result is real, not an artefact of a capture that isn't listening.

Edits, all visible in `diff`:
1. The header line of both scripts now says v3.
2. `e2e.mjs`: the `wheel-back`, `swipe-back`, `wheel-fwd` and `swipe-fwd` checks now require **both** `scrollLeft % clientWidth ≈ 0` (±2 px) **and** a geometric slide-edge alignment (±2 px).
   - In v2, `*-fwd` accepted geometric alignment alone, and `*-back` had a redundant `(modOk || geomOk)` term.
   - The stricter form matches the brief literally: "after settle scrollLeft % clientWidth ≈ 0".
   - All 32 such checks pass under the stricter rule.

Nothing else changed. The archived `*.mjs.txt` files are the exact executed bytes plus a 3-line header; `tail -n +4 … | cmp` was verified for all five scripts.

Two new helper scripts:
- **`compare-v2.mjs`.** Diffs 912 measured values between two `results.json` files. The tolerance is ±15 px on the maximum displacement during a partial gesture only, because that value is timing-dependent: v2 run 1 and run 2 differ by up to 9 px on mobile. Every other key must match exactly.
- **`tables.mjs`.** Generates the P1 table below from `results.json`.

## Analytics safety and harness validity

- **Chrome.**
  - `--host-resolver-rules` NXDOMAINs `www.google-analytics.com`, `*.google-analytics.com`, `analytics.google.com`, `*.doubleclick.net` and `www.google.com`.
  - `www.googletagmanager.com` is **not** blocked, so the real gtag.js loads and runs inside Partytown.
  - All 64 `requestfailed` events in run 1 are these DNS-blocked collect hosts (`C.requests-failed` PASS). No hit reached GA.
  - No request interception (`context.route`) is used, so the Partytown service worker and the `/~partytown/proxytown` path run unmodified.
- **WebKit and Firefox (P9).**
  - A local CONNECT proxy (localhost, 127.0.0.1 and [::1] bypassed) **refuses (403)** the same analytics hosts and tunnels every other host.
  - `httpRefused` and `tunnelErrors` are empty in both engines.
  - Blocked hosts: WebKit `www.google-analytics.com` ×10 and `www.google.com` ×10; Firefox ×8 each.
  - Tunnelled hosts: WebKit `fonts.googleapis.com` 6, `fonts.gstatic.com` 6, `www.googletagmanager.com` 3. Firefox the same set (3/16/3) plus Firefox's own `aus5.mozilla.org` update ping.
- **Positive control, Chrome (`H.capture-control`, PASS).** This context is excluded from the zero-error count. The harness captured all four injected faults:
  - page `console.error`;
  - dedicated-worker `console.error`, seen on both the `worker` and `page` channels;
  - uncaught exception (`pageerror`);
  - a 404 `<img>` ("Failed to load resource … 404").
- **Positive control, service-worker channel (Chrome, v3 addition, `probe-sw-console.mjs`, run 19:23:02Z).** H does not cover the service-worker source, so a separate probe tested it.
  - **Setup:** a fresh context, wired exactly like the harness's `instrument()` (`ctx.on('serviceworker') → sw.on('console')`), loaded `/about/`.
  - **Injection:** `sw.evaluate(() => { console.error(…); console.warn(…) })` inside the **real Partytown service worker** `/~partytown/partytown-sw.js`.
  - **Result:** both messages were delivered through the harness's listener: `errorViaServiceworkerEventListener: true`, `warnViaServiceworkerEventListener: true`.
  - **Why the SW listener matters:** neither message appeared on the page channel (`errorLeakedToPageChannel: false`). This listener is the only path for SW messages, and it works.
  - **Conclusion:** the "0 errors from the service worker" result is a real measurement. Evidence: `probe-sw-console.json` and `probe-sw-console.txt`.
- **Positive control, WebKit and Firefox (`P9.<engine>.H.capture-control`, PASS on both).** Captured:
  - a page `console.error`;
  - a main-frame blob-worker `console.error`, which arrives on the page channel (Playwright 1.44.1's `worker.on('console')` never fires);
  - a blob-worker `console.error` created **inside the Partytown sandbox iframe**;
  - a worker uncaught throw;
  - a page `pageerror`.

  P9 also hooks the **real Partytown worker** at creation, wrapping `console.error`/`warn` and adding `error`/`unhandledrejection` listeners. After the 10 navigations its buffer was `[]` on both engines.
- **Non-vacuity.** P0 requires gtag.js to be seen, a `page_view` collect attempt for `/` before navigation 1, and collect attempts after navigation 10. All three were observed.

## P0 Partytown (Task 14 fix): **PASS**

### P0(1) Assets: PASS

Source: `playwright/p0-curl.txt`, captured 2026-09-24T19:03:18Z. The in-script `fetch` returns identical results (`P0.1.assets`).
```
/~partytown/partytown.js 200 text/javascript 3198B
/~partytown/partytown-sw.js 200 text/javascript 47177B
/~partytown/partytown-sandbox-sw.html 200 text/html;charset=utf-8 45949B
```

### P0(2) Clean headless profile, 10 ClientRouter navigations: PASS (10 checks + assets; 5/5 runs)

Instrumentation, armed before `goto('/')`:
- **Init script** (top frame only): counts DOM `load` events on the sandbox iframe, sandbox add/remove mutations, `astro:page-load` and `astro:before-swap`.
- **Playwright listeners:** `framenavigated`/`framedetached` for the sandbox frame; `page.on('worker')` plus `worker.on('close')`; requests to `partytown-sandbox-sw.html`, `googletagmanager.com/gtag/js`, `/~partytown/proxytown` and `g/collect`, with their failures.
- **Element identity:** after boot, the sandbox `<iframe>` and both `data-astro-transition-persist` gtag `<script>`s were tagged in a `WeakMap`. That makes "same element after every navigation" checkable.

Every navigation is a real `locator.click()`. The dwell timer starts at `astro:page-load`, and there is a 6 s settle at the end.

| # | click | dwell | landed | soft | sandbox parent × count | iframe `load` so far | same iframe / gtag-src / gtag-init | pending `text/partytown` |
|---|---|---|---|---|---|---|---|---|
| 0 | initial `goto('/')` | — | `/` | — | HTML × 1 (last child of `<html>`) | 1 | tagged | 0 |
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

Measured totals. Run 1 is shown; run 2 and P0 repeats 1–3 are identical apart from the proxytown request total.

| check | measured | result |
|---|---|---|
| `P0.2.initial` | 1 sandbox, parent `HTML`, 1 iframe load, 1 worker, 1 gtag.js request, 2 collect attempts (`page_view /`). Both gtag scripts are `text/partytown-x` (executed). | PASS |
| `P0.2.soft-navs` | 10/10 soft: the window token survives and `astro:page-load` goes 1 → 11 with 10 `astro:before-swap`. **0** `load` and **0** DOMContentLoaded after the initial load. | PASS |
| `P0.2.sandbox-parent-html` | 12/12 snapshots (initial, 10 navigations, final) show `HTML ×1`, with the iframe as the last child of `<html>` | PASS |
| `P0.2.iframe-never-reloads` | Iframe DOM `load` events **1**. Sandbox-html requests **1**. Sandbox `framenavigated` **1**. `framedetached` **0**. Mutation added 1, removed **0**. Same element after 10/10 navigations. | PASS |
| `P0.2.one-worker` | `page.on('worker')` fired **1** time (`blob:http://localhost:4321/…`); closed before context close: **0** | PASS |
| `P0.2.gtag-once` | `https://www.googletagmanager.com/gtag/js?id=G-QQMCTBW5TH` requested **1×** (navIdx 0, `fetch` from the sandbox). gtag-src and gtag-init are the same elements after 10/10 navigations; 0 pending. | PASS |
| `P0.2.proxytown` | `/~partytown/proxytown` sync XHRs: **183** in run 1, 178 in run 2 and each repeat. **0** failed or aborted. **0** proxytown console messages. | PASS |
| `P0.2.analytics-alive` | Collect events: 6 `page_view` + 1 `scroll`. `page_view` for `/`, `/search/`, `/tags/engineering-management/`, `/posts/`, `/tips/`, `/`. After the last navigation: `page_view /tips/` and `page_view /`. | PASS |
| `P0.2.console-zero` | P0 context: **0** errors and **0** warnings from any source | PASS |
| `P0.2.sw-registration` | `[{scope: http://localhost:4321/~partytown/, active: …/partytown-sw.js, state: activated}]`, no registration error | PASS |

### P0(3) Deterministic repro `pt-repro.mjs --strict`: **PASS, exit 0**

- **Command:** `node <scratchpad>/t8v3/../pt/pt-repro.mjs http://localhost:4321 --strict --out=<lane>/pt-repro.json`, exactly as the brief gives it, with `--out` pointed at this lane's scratch dir.
- **Environment:** it resolved its own Playwright and launched `channel: 'chrome'`.
- **Run:** 19:03:44Z → 19:04:55Z, **exit code 0**, stderr empty (`pt-repro-run.txt`).
- **Mode:** default route mode. Cached gtag.js is served locally, other Google hosts are answered locally, and DNS leak-net is on; `harnessLeaks []`.

Verdict:
```
{"proxytownErrors":0,"softNavigations":28,"softNavsWithSandboxReload":0,"strict":true,
 "otherConsoleErrors":0,"pageErrors":0,"vacuousOrLeaky":false,"exitCode":0}
```

| run | soft navs | reloads | proxytown req / failed | workers | sandbox loads | gtag served | page_view (initial + soft) |
|---|---|---|---|---|---|---|---|
| 0.5 s dwell | 14 | 0 | 139 / 0 | 1 | 1 | 1 | 1 + 1 |
| 3 s dwell | 14 | 0 | 321 / 0 | 1 | 1 | 1 | 1 + 14 |

`badNavigations []`, `deadAnalyticsRuns []`, `consoleErrors []`, `consoleOther []`. Each run's worker closed only at context close.

## P1 Image slider: **PASS** (desktop 128 + dark 11 + mobile 99 = 238 checks, both runs)

**Method**
- **Expected N:** taken from the `astro-island` `props` (server data).
- **Button presses:** real `locator.click()` (`locator.tap()` on mobile). After each press the harness waits for the scroll to start, then for `scrollLeft` to stay stable for 8 × 50 ms, then 2 rAF.
- **Keyboard:** `locator.focus()` on Next, assert `document.activeElement === Next`, then `keyboard.press('Enter' | 'Space')`.
- **Wheel:** `page.mouse.wheel(±0.4·cw, 0)` at the scroller centre, then a 0.7·cw wheel.
- **Mobile:** context `isMobile`, `hasTouch`, `deviceScaleFactor 3`. Real touch-source gestures come from CDP `Input.synthesizeScrollGesture` (`gestureSourceType: 'touch'`) at 40% and 70%.
- **Snap criterion (v3):** `scrollLeft % clientWidth` within 2 px **and** the nearest slide's left edge within 2 px of the scroller content edge. The gesture must also have actually moved the scroller.

Carousels found: octoprint **7** (7 slider islands), flutter-embedded **2** (2 islands).

How to read the table:
- Δ values are in px.
- "imgs" is the number of loaded images at start → after every slide was visited (the images are `loading="lazy"`).
- The 40% columns show the maximum displacement during the gesture → the slide it settled on, with its `scrollLeft % cw` and geometric offset.

| viewport | carousel | N | cw | imgs | Next click Δ | walk-to-end Δs → Next disabled | Prev Δ | Enter / Space Δ (page scrollY before→after Space) | 40% back from end | 40% fwd from start | 70% fwd | checks |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1280 | octoprint #1 | 2 | 734 | 2→2 | 734 | [734] ✓ | -734 | 734 / 734 (20528→20528) | 287 → slide 2, mod 0, off 0 | 287 → slide 1, mod 0, off 0 | 1→2, mod 0 | 14/14 |
| 1280 | octoprint #2 | 2 | 734 | 2→2 | 734 | [734] ✓ | -734 | 734 / 734 (24725→24725) | 287 → slide 2, mod 0, off 0 | 287 → slide 1, mod 0, off 0 | 1→2, mod 0 | 14/14 |
| 1280 | octoprint #3 | 2 | 734 | 2→2 | 734 | [734] ✓ | -734 | 734 / 734 (24928→24928) | 287 → slide 2, mod 0, off 0 | 287 → slide 1, mod 0, off 0 | 1→2, mod 0 | 14/14 |
| 1280 | octoprint #4 | 3 | 734 | 2→3 | 734 | [734,734] ✓ | -734 | 734 / 734 (26952→26952) | 287 → slide 3, mod 0, off 0 | 287 → slide 1, mod 0, off 0 | 1→2, mod 0 | 14/14 |
| 1280 | octoprint #5 | 3 | 734 | 2→3 | 734 | [734,734] ✓ | -734 | 734 / 734 (30893→30893) | 287 → slide 3, mod 0, off 0 | 287 → slide 1, mod 0, off 0 | 1→2, mod 0 | 14/14 |
| 1280 | octoprint #6 | 2 | 734 | 2→2 | 734 | [734] ✓ | -734 | 734 / 734 (31012→31012) | 287 → slide 2, mod 0, off 0 | 287 → slide 1, mod 0, off 0 | 1→2, mod 0 | 14/14 |
| 1280 | octoprint #7 | 2 | 734 | 2→2 | 734 | [734] ✓ | -734 | 734 / 734 (32437→32437) | 287 → slide 2, mod 0, off 0 | 287 → slide 1, mod 0, off 0 | 1→2, mod 0 | 14/14 |
| 1280 | flutter #1 | 2 | 734 | 2→2 | 734 | [734] ✓ | -734 | 734 / 734 (0→0) | 287 → slide 2, mod 0, off 0 | 287 → slide 1, mod 0, off 0 | 1→2, mod 0 | 14/14 |
| 1280 | flutter #2 | 3 | 734 | 2→3 | 734 | [734,734] ✓ | -734 | 734 / 734 (11630→11630) | 287 → slide 3, mod 0, off 0 | 287 → slide 1, mod 0, off 0 | 1→2, mod 0 | 14/14 |
| 375 touch | octoprint #1 | 2 | 341 | 2→2 | 341 (tap) | [341] ✓ | -341 | 341 / 341 (29008→29008) | 137 → slide 2, mod 0, off 0 | 137 → slide 1, mod 0, off 0 | 1→2, mod 0 | 14/14 |
| 375 touch | octoprint #2 | 2 | 341 | 2→2 | 341 (tap) | [341] ✓ | -341 | 341 / 341 (34709→34709) | 137 → slide 2, mod 0, off 0 | 137 → slide 1, mod 0, off 0 | 1→2, mod 0 | 14/14 |
| 375 touch | octoprint #3 | 2 | 341 | 2→2 | 341 (tap) | [341] ✓ | -341 | 341 / 341 (36013→36013) | 138 → slide 2, mod 0, off 0 | 134 → slide 1, mod 0, off 0 | 1→2, mod 0 | 14/14 |
| 375 touch | octoprint #4 | 3 | 341 | 3→3 | 341 (tap) | [341,341] ✓ | -341 | 341 / 341 (37988→37988) | 137 → slide 3, mod 0, off 0 | 137 → slide 1, mod 0, off 0 | 1→2, mod 0 | 14/14 |
| 375 touch | octoprint #5 | 3 | 341 | 3→3 | 341 (tap) | [341,341] ✓ | -341 | 341 / 341 (43053→43053) | 137 → slide 3, mod 0, off 0 | 137 → slide 1, mod 0, off 0 | 1→2, mod 0 | 14/14 |
| 375 touch | octoprint #6 | 2 | 341 | 2→2 | 341 (tap) | [341] ✓ | -341 | 341 / 341 (44245→44245) | 137 → slide 2, mod 0, off 0 | 136 → slide 1, mod 0, off 0 | 1→2, mod 0 | 14/14 |
| 375 touch | octoprint #7 | 2 | 341 | 2→2 | 341 (tap) | [341] ✓ | -341 | 341 / 341 (45245→45245) | 136 → slide 2, mod 0, off 0 | 136 → slide 1, mod 0, off 0 | 1→2, mod 0 | 14/14 |

Each carousel's 14 checks also cover:
- **Labels:** exactly `Slide 1 of N … Slide N of N`.
- **Start state:** `scrollLeft 0`, Prev `disabled` (opacity 0.3), Next enabled and visible.
- **End state:** Next `disabled`, `scrollLeft = scrollWidth − clientWidth`, nearest slide = N.
- **Walking back** to `scrollLeft 0` leaves Prev disabled.
- **Buttons after gestures:** the Prev/Next disabled state tracks the position.
- **Images:** every `<img>` is `complete && naturalWidth > 0`.

A 40% wheel or swipe moves the scroller by about 40% of a slide, and scroll-snap returns it to the nearest edge (mod 0, offset 0). A 70% gesture advances exactly one slide. Space on the focused Next button does not scroll the page: `scrollY` is unchanged in every row.

**Dark theme**
- **How it was set:** a real click on the site toggle `#theme-btn`. `data-theme` went light → dark, `localStorage.theme` = `dark`, and the button label = `dark`. The 44 or 16 CSS transitions finished before measuring (0 remaining).
- **Start state on all 9 carousels:** N matches the props, `scrollLeft 0`, Prev disabled, Next enabled.
- **Colours:** body `rgb(33, 39, 55)`. The contrast between the Next icon and the composited button background is **9.63:1** in dark and 12.44:1 in light.
- **Screenshots:** `playwright/screenshots/dark-carousel-octoprint-prusa-core-one-raspberry-pi.png`, `dark-carousel-flutter-google-maps-embedded-map.png` and `mobile-carousel-octoprint.png`. All three are SHA-256-identical to the v2 screenshots and between v3 runs 1 and 2.

## P2 Search `/search/`: **PASS** (5 checks)

- **Typing:** real `keyboard.type('hiring', {delay: 60})` produced `Found 5 results for 'hiring'` with 5 cards. The first 3 are `/posts/ems-the-people-system`, `/posts/the-emotional-roller-coaster-of-hiring` and `/posts/two-books-which-influenced-my-hiring-pipeline`.
- **URL:** `location.search === '?q=hiring'` (`http://localhost:4321/search/?q=hiring`).
- **Reload:** after `page.reload()` the input value is `hiring`, with the same 5 hrefs in the same order.
- **Result click:** a real click on the first result produced `GET /posts/ems-the-people-system` **200** (ClientRouter `fetch`, no redirect). The window marker survived, the h1 is "The People System", and 0 `[ssr]` islands remain.
- **No match:** `zzzzqqq` produced `Found 0 results for 'zzzzqqq'` with 0 items, `?q=zzzzqqq` and 0 errors.

## P3 Tags `/tags/`: **PASS** (6 checks)

- **Initial state:** 68 tags, count-sorted, `count` button `aria-pressed=true`: engineering-management 15, engineering-leadership 11, leadership 11, systems-thinking 8, tutorial 7.
- **Filter:** typing `engin` narrowed 68 → **5**. The five are engineering-management 15, engineering-leadership 11, engineering-culture 2, senior-software-engineer 1 and software-engineering 1; every one contains `engin`.
- **`a→z`:** the filtered list sorts alphabetically (`localeCompare`), and `a→z` is `aria-pressed=true`.
- **Clear (×):** all 68 return, alphabetical (3d-printing, agile, architecture-decision-records, astro, blogging … vllm, web-development, wsl2). The harness also asserted this order is *not* count-sorted.
- **`count`:** counts are non-increasing, with ties alphabetical (… flutter 5, mobile-development 5, google-maps 4 …).
- **Tag click:** a real click on `engineering-management` loaded `/tags/engineering-management/` with **200** and 5 post links.

## P4 ClientRouter: **PASS** (6 + 2 P4b checks)

**Route:** `/` → home card (octoprint post) → header Search → header Tags. There was no `goto` after the first load.

**The navigation stayed client-side.** The window marker set on `/` survived all 3 navigations. There were **0** `load` events and **0** DOMContentLoaded events, while `astro:page-load` went 1 → 2 → 3. After each navigation the islands were hydrated (7 / 1 / 1 islands, 0 `[ssr]`).

**Island interaction after each navigation:**
- **Carousel:** a Next click moved `scrollLeft` 0 → **734** (= clientWidth). Prev went from disabled to enabled.
- **Search:** typing `hiring` returned 5 results and set `?q=hiring`.
- **Tags:** `engin` narrowed 68 → 5.

**P4b: dark theme across client navigation.** Dark was set via the toggle, then two header navigations followed (`/posts/`, `/tags/`).
- An rAF sampler saw **82 frames, 0 non-dark**; all were `rgb(33, 39, 55)`.
- The `data-theme` mutations show the swap dropping the attribute and the `astro:after-swap` handler restoring it 1–3 ms later: 550 → 551 ms and 1251 → 1254 ms. No frame was painted in between.
- The toggle still works after navigation: dark → light → dark.

## P5 Theme / FOUC: **PASS** (6 checks)

**Toggle on `/`.** `data-theme` = `dark` and `localStorage.theme` = `dark`. The body went `rgb(251, 254, 251)` → `rgb(33, 39, 55)`, and `meta[name=theme-color]` = `rgb(33, 39, 55)`.

**Full loads.** A context-level `addInitScript` (it applies to every page the context opens, including the new tab) recorded `data-theme` and `getComputedStyle(document.body).backgroundColor` at DOMContentLoaded and at the first rAF with a body. The results for each `page.goto`:

| page | at DCL | first rAF |
|---|---|---|
| `/posts/` | dark, `rgb(33, 39, 55)` (t=13 ms) | dark, `rgb(33, 39, 55)` (t=11 ms) |
| `/tags/` | dark, `rgb(33, 39, 55)` (18 ms) | dark (14 ms) |
| `/about/` | dark, `rgb(33, 39, 55)` (17 ms) | dark (13 ms) |
| `/posts/audio-vs-paper-books/` | dark, `rgb(33, 39, 55)` (18 ms) | dark (14 ms) |

No page had a light first paint.

**Persistence.** A reload, and a new tab on `/tips/` in the same context, both render dark from DOMContentLoaded, with `localStorage.theme = dark`.

## P6 TOC: **PASS** (6 checks)

`audio-vs-paper-books` (.md) and `dad-ops-playbook` (.mdx) behave the same way:
- Exactly 1 `<details>`, with summary "Open Table of contents".
- It is closed initially, and the first link is not visible.
- A real click on the summary sets `open=true` and makes the link visible.
- Every anchor target exists: 8/8 and 7/7.

Two TOC links per post were clicked for real. Each click set the hash and scrolled the target to `top 0` (`#my-thoughts-on-paper-books`, `#principle-2-the-art-of-patient-observation`). Where the page bottomed out, the target was in view instead (`#conclusion` top 1011, `#appendix-1` top 953, both `atBottom=true`).

## P7 Hydration sanity: **PASS** (2 checks)

- **Islands:** 34 visits (goto, reload and client navigation) covered 46 islands, and **0** `astro-island[ssr]` remained on any of them.
- **Messages:** **0** console or pageerror messages matched `/hydrat|Minified React error #(418|419|422|423|425)|did not match|server rendered HTML/i` on any channel: page, frames, workers or `pageerror`.

## P8 (extra): v1 proxytown flow at 0.5 / 3 / 10 s dwell, 2 reps each: **PASS** (6 checks)

This flow (`/` → post → `/search/`, fresh context per run) is the one that produced v1's `NetworkError … /~partytown/proxytown`. All 6 runs show **0 console errors and 0 aborted proxytown XHRs**.

## P9 Cross-browser smoke (Playwright 1.44.1, cached browsers): **PASS** (14/14 WebKit, 14/14 Firefox)

Both engines launched from the cache without any download, and `localhost` reached the IPv6-only preview in both. Results are in `xb-webkit.json` / `xb-firefox.json`, with logs in `xb-*.log`.

| check | WebKit 17.4 | Firefox 125.0.1 |
|---|---|---|
| H capture control | page ✓; main-frame worker ✓ (page channel); sandbox-iframe worker ✓; worker uncaught ✓; pageerror ✓ | same |
| P4 soft navigations (token survives, 0 `load`, expected paths, 0 `[ssr]`) | 10/10 | 10/10 |
| P4 carousel after navigation (Next Δ = cw) | 0 → 734 (cw 734), Prev disabled before | same |
| P4 search after navigation | `hiring`, 5 results, `?q=hiring` | same |
| P4 tags after navigation | 68 → 5, includes engineering-management, all match | same |
| P0 sandbox parent | `HTML ×1` on all 12 snapshots | same |
| P0 iframe not reloaded | DOM loads 1, sandbox-html requests 1, `framenavigated` 1, detached 0, same element 10/10, removals 0 | same |
| P0 gtag.js | 1 request (on `A:/`); gtag-src same element 10/10; 0 pending | same |
| P0 worker event | `page.on('worker')`: 1 created, 0 closed | same |
| P0 proxytown | 0 failed, 0 console | same |
| P0 hook inside the real Partytown worker | hooked at creation; buffer `[]` after 10 navigations | same |
| P1 octoprint (7 carousels / 7 islands) | N = 2,2,2,3,3,2,2. Start: Prev disabled, Next enabled. Every Next Δ = 734. End: Next disabled at max. All images loaded. Labels OK. | identical values |
| P2 search typing | `hiring` → 5 results, `?q=hiring` | same |
| P3 tags filter | 68 → 5 | same |
| console (contexts A + B) | 36 errors, **all exempt** (blocked-analytics network, see below). 0 page errors. 0 failed non-analytics requests. 0 warnings. | **0 errors**, 0 page errors, 0 failed non-analytics requests |

**Why the 36 WebKit errors are exempt**
- **What WebKit logs:** `Failed to load resource: The operation couldn’t be completed. (kCFErrorDomainCFNetwork error 310.)`, **with no URL**, for every request the proxy refused.
- **What 310 means:** CFNetwork 310 is `kCFErrorHTTPSProxyConnectionFailure`, which only a CONNECT the proxy refused can produce.
- **What the proxy refused:** **only** `www.google-analytics.com` ×10 and `www.google.com` ×10. `httpRefused` and `tunnelErrors` are both empty.
- **Per-label cross-check:** every label's console count is exactly 2× its `requestfailed` count for blocked `g/collect` URLs:

  | label | console errors | blocked requests |
  |---|---|---|
  | `A:/`, `A:nav2`, `A:nav6`, `A:nav8`, `A:settle`, `B:P1`, `B:P3` | 4 each | 2 each |
  | `B:P2` | 8 | 4 |

  Total: 36 = 2 × 18.

These are the same numbers as v2.

## Console criterion (spec §1.6, absolute): **PASS**

- **Chrome runs 1 and 2.** Each covered 34 visits. Outside the positive-control context the only captured messages were informational SW-created and worker-created events (`typesSeen` in `results.json`). There were **0 errors, 0 warnings and 0 `pageerror`** from any source.
- **`requestfailed`.** Only the 64 DNS-blocked GA collect requests.
- **P0 repeats ×3:** 0.
- **`pt-repro`:** 0.
- **Firefox and WebKit:** 0 errors, apart from the WebKit blocked-analytics network errors attributed above.

No console error occurred, so no main-build comparison was needed.

## v3 vs v2: measured-value comparison (the Tailwind source restriction)

`compare-v2.mjs` extracts 912 measured values from each `results.json`:
- carousel start geometry: `clientWidth`, `scrollWidth`, `rectWidth`, `slideRectWidth`;
- button disabled state, visibility and opacity;
- slide labels, image `naturalWidth` and `src`;
- every step's Δ and snap result;
- light and dark body, button background and foreground, and contrast;
- search result hrefs, counts and texts;
- tag totals, filtered set and both sort orders;
- P4 hydration counts;
- P5 colours per page;
- TOC links and anchor results;
- the P0 structure (parents, element identity, tallies, `page_view` list, SW registration);
- console totals.

| comparison | identical / compared |
|---|---|
| v2 run 1 vs v2 run 2 (noise floor) | 912 / 912 |
| **v2 run 1 vs v3 run 1** | **912 / 912** |
| v2 run 1 vs v3 run 2 | 912 / 912 |
| v3 run 1 vs v3 run 2 | 912 / 912 |

Among the numbers compared, the following are all unchanged from v2:
- slide width 734 px at desktop and 341 px on mobile;
- Prev opacity 0.3 at start;
- dark button background `oklab(0.373388 -0.000638455 -0.0587515 / 0.8)`;
- icon contrast 9.63 in dark and 12.44 in light;
- dark body `rgb(33, 39, 55)` and light body `rgb(251, 254, 251)`.

Removing the 412 unused CSS rules did not change any island's layout, styling or behaviour that this lane measures.

The carousel utilities used by `ImageSliderClient.tsx` are all present in the served `Footer.BnrdipP9.css`: `snap-x`, `snap-mandatory`, `snap-center`, `snap-always`, `scroll-smooth`, `[scrollbar-width:none]`, `overflow-x-auto`, `flex-none`, `object-contain`, `h-80`, `h-96`, `bg-skin-card/80`, `ring-skin-line`, `-translate-y-1/2`, `disabled:opacity-30` and the `::-webkit-scrollbar` rules.

Evidence: `compare-v2-vs-v3run1.json`, `compare-v2-vs-v3run2.json`, `compare-v3run1-vs-v3run2.json`, `compare-v2run1-vs-v2run2.json`.

## Observations (non-failing)

1. **Search caret race (pre-existing; `src/components/Search.tsx:52-55`). It did not reproduce in this run.** v2 classified the 50 ms mount `setTimeout` caret reset as pre-existing: main 3df6160 reordered `hiring` → `iringh` 7/10 in WebKit and 7/10 in Firefox with immediate typing, and the branch was no worse. That classification still stands: `git diff main..HEAD -- src/components/Search.tsx` is still empty at 9eb1ec3. In this run, every typed query in Chrome, WebKit and Firefox arrived intact (`hiring`, `zzzzqqq`, `engin`). The harness waits for hydration plus 300 ms before typing, as v2 did.
2. **GA `page_view` at short dwell (informational; GA semantics, not an error).**
   - In Chrome, all 5 P0 runs recorded a `page_view` for the initial `/` and for the 5 pages viewed for 3 s. Pages left after 0.5 s get no `page_view`.
   - `pt-repro`: 1 soft-navigation `page_view` over 14 navigations at 0.5 s dwell, and 14/14 at 3 s.
   - This is the same result as Task 14 and v2. As the ledger records, the fix relies on GA4's "page changes based on browser history events" setting.
3. **Firefox logs 61 warnings (not errors); v2 logged 59.**
   - Deprecation notices from Partytown's sandbox property enumeration, all from `partytown-sandbox-sw.html`: `InstallTrigger` 4, `onmozfullscreenchange` 8, `onmozfullscreenerror` 8, `SVGGraphicsElement.nearest/farthestViewportElement` 4 + 4, `MouseEvent.mozPressure` / `mozInputSource` 2 + 2.
   - gtag cookies without SameSite: `_ga_QQMCTBW5TH` 26, `_ga` 3.
   - In context A, the sandbox deprecation notices appear only on the initial load and at the first click. That fits a sandbox that never reloads.
   - The +2 difference from v2 is in the cookie-warning count, which depends on timing (one per gtag cookie write).
   - Chrome logged 0 warnings and WebKit logged 0.
4. **`pt-repro` logged 10 `g/collect` POSTs as `net::ERR_ABORTED`** in its own route mode (a local fake Google). These are neither proxytown requests nor console errors, and pt-repro's verdict excludes them. v2 saw the same.
5. **Scope limits.**
   - WebKit 17.4 (the Playwright build) is not Safari; real Safari was not verified.
   - P9 uses Playwright 1.44.1 because only its browser builds are cached.
   - Firefox's own update ping (`aus5.mozilla.org`) went through the tunnel. It is internal to the browser and harmless.
6. **Shared environment.** During this lane, a listener on `:4331` (pid 19801) and a scratch worktree `t8v3/main-before` at 3df6160 existed. Both belong to other lanes and were left alone. This lane created no worktree and no server, and stopped nothing.
7. **Gate hygiene.** Scripts are archived as `*.mjs.txt` because `docs/**/qa-runs` is not in the ESLint ignores. `.prettierignore` excludes `docs/`, so Prettier does not check these files. After everything was archived:
   - `pnpm lint` (`eslint .`) exited **0**.
   - `pnpm format:check` exited **0** ("All matched files use Prettier code style!").
   - `git status --porcelain` shows exactly `?? .claude/`, `?? .serena/` and `?? docs/library-packages-upgrade/qa-runs/T-39-2026-09-v3/`.
   - `git diff --name-only` is empty.
   - `curl http://localhost:4321/` returned 200.

## Artifacts

All under `docs/library-packages-upgrade/qa-runs/T-39-2026-09-v3/playwright/`.

**Scripts** (executed bytes + 3-line header):
- `e2e.mjs.txt`: the Chrome harness (H, P0–P8, P7, console). Usage: `node e2e.mjs <base> <out.json> <shotsDir>`; `ONLY=H,P0,…` selects groups.
- `xb-e2e.mjs.txt`: P9. Usage: `node xb-e2e.mjs <webkit|firefox> <base> <out.json>`, with Playwright 1.44.1.
- `compare-v2.mjs.txt`: the v2/v3 measured-value diff.
- `tables.mjs.txt`: the P1 table generator.
- `pt-repro.mjs.txt`: an unchanged copy of the investigation tool.
- `probe-sw-console.mjs.txt`: the service-worker console-channel positive control. Its output is in `probe-sw-console.json` and `probe-sw-console.txt`.

**Results:**
- `results.json`: run of record, 291/291.
- `results-run2.json`: 291/291.
- `run1.log`, `run2.log`.
- `p0-repeats/p0-rep{1,2,3}.{json,log}`: 15/15 each.
- `xb-webkit.json`, `xb-firefox.json`, `xb-webkit.log`, `xb-firefox.log`: 14/14 each.
- `pt-repro.json`, `pt-repro-run.txt`: exit code 0.
- `p0-curl.txt`.
- `compare-*.json`.

**Screenshots:**
- `screenshots/dark-carousel-octoprint-prusa-core-one-raspberry-pi.png`
- `screenshots/dark-carousel-flutter-google-maps-embedded-map.png`
- `screenshots/mobile-carousel-octoprint.png`

There are no failure screenshots because no check failed.

**To reproduce:** from a scratch dir with `npm i playwright` (1.63.0) and the scripts copied as `.mjs`, run with the nvm prefix:
```bash
node e2e.mjs http://localhost:4321 results.json shots
( cd xb && PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm i playwright@1.44.1 && node xb-e2e.mjs webkit http://localhost:4321 xb-webkit.json && node xb-e2e.mjs firefox http://localhost:4321 xb-firefox.json )
node <scratchpad>/pt/pt-repro.mjs http://localhost:4321 --strict
node compare-v2.mjs <v2>/results.json results.json compare.json
```
