# T-39 Task 8: QA lane `playwright-e2e`

**Verdict: PASS.** All 275 checks passed on the branch preview. No console error, warning or `pageerror` appears on the branch unless it also appears on the pre-upgrade build.

| | |
|---|---|
| Repo / branch / HEAD | `upgrade/2026-09` @ `55a65300a2dce56e7c225232ca8c4abb2c7bd5b4` |
| Target | shared branch preview `http://localhost:4321` (Astro v7.3.4 generator tag). This lane did not start, stop or restart it. |
| Browser | installed Google Chrome 153.0.8010.53, `chromium.launch({ channel: 'chrome', headless: true })`, Playwright 1.63.0. No browser download. |
| Node | v22.23.3 (repo `.nvmrc`) |
| Profile | every test group gets a fresh non-persistent `BrowserContext` (clean profile, no extensions), viewport 1280×1800 unless noted, `colorScheme: 'light'` |
| `document.visibilityState` | `visible` on all 27 recorded visits (brief Step 2 requirement; the hidden-window problem from Task 4 does not apply) |
| Branch run | 2026-09-24T03:44:56Z → 03:49:01Z, 275 checks, 0 failed (`playwright/results.json`) |

## Baselines used for the console comparison

1. **main build `3df6160`, served on `:4332`.** This is the same content as the branch, so it is the primary baseline. It was built in a scratch worktree on Node 22.22.2 with `pnpm install --frozen-lockfile && pnpm build` (exit 0, generator `Astro v6.2.1`). The whole suite ran against it: 275 checks, and the only failure was the expected `P0.1.assets` (`partytown-sandbox-sw.html` returns 404 on `@qwik.dev/partytown` 0.13.2). Output: `playwright/results-main-baseline.json`.
2. **Production `https://www.novifyx.com`.** This is the literal "pre-upgrade production site": `Astro v6.2.1`, `last-modified: Fri, 31 Jul 2026`. Its deploy predates the octoprint post, so every octoprint-dependent step returns 404 there. Functional results on prod are informational only. Output: `playwright/results-prod-baseline.json`.

**Analytics safety.** Every context except P0 ran in a Chrome launched with `--host-resolver-rules` that makes `www.google-analytics.com`, `*.google-analytics.com`, `analytics.google.com`, `*.doubleclick.net` and `www.google.com` fail DNS lookup. Blocking `www.google.com` matters because gtag falls back to `www.google.com/g/collect`. As a result, 0 test hits reached the real GA property from the prod run: all 70 collect requests failed with `ERR_NAME_NOT_RESOLVED`.

P0 on the branch and on main ran unmodified, as the brief requires for an authoritative clean profile. It sent one collect request per run, with `dl=localhost`, and each ended `net::ERR_ABORTED`.

I avoided request interception (`context.route`) on purpose. Partytown relies on sync XHRs to `/~partytown/proxytown` that its service worker serves, and interception could interfere with them.

## P0: Partytown service worker (brief Step 2a, authoritative clean profile) — **PASS at item 3** (4 checks)

1. **Assets on the branch.** `curl` and in-script `fetch`:
   - `/~partytown/partytown.js`: **200**, text/javascript, 3198 B
   - `/~partytown/partytown-sw.js`: **200**, text/javascript, 47177 B
   - `/~partytown/partytown-sandbox-sw.html`: **200**, text/html, 45949 B
2. **Page load.** Clean headless profile, no GA blocking, loaded `/posts/octoprint-prusa-core-one-raspberry-pi/` (200) and waited 7 s:
   - **Console:** no error or warning of any kind. Only informational events were recorded: SW created `…/~partytown/partytown-sw.js`, and a dedicated worker created `blob:http://localhost:4321/<uuid>`.
   - **`navigator.serviceWorker.getRegistrations()`:** `[{scope: "http://localhost:4321/~partytown/", active: ".../~partytown/partytown-sw.js", state: "activated"}]`
   - **gtag runs in the Partytown worker.**
     - The worker's `performance.getEntriesByType('resource')` contains `https://www.googletagmanager.com/gtag/js?id=G-QQMCTBW5TH` and `https://www.google-analytics.com/g/collect?...&en=page_view`.
     - The main window's resource timing contains no googletagmanager or google-analytics entry; its only Google entry is the fonts stylesheet.
     - The page-target CDP `Network.requestWillBeSent` stream also shows no googletagmanager request. The only Google request there is `fonts.googleapis.com` (Stylesheet, initiator `parser`).
     - Playwright attributes the gtag `fetch` to the frame `…/~partytown/partytown-sandbox-sw.html`, the frame that owns the blob worker.
     - The analytics `<script>` tags on the main thread have `type="text/partytown-x"`, meaning Partytown processed them and they never ran on the main thread.
   - The one `g/collect` request ended `net::ERR_ABORTED`. This is recorded, not treated as a failure.
3. **No service-worker registration error on the branch in the clean profile**, so P0 is **PASS** and items 4–5 are not required.
4. **Not required** (P0 passed at item 3). A main build was still made, but only as the same-content console baseline (see "Baselines" above). For extra evidence, the same P0 probe ran in the same clean-profile configuration against the main build (`:4332`): again no SW error, registration `activated`, and gtag fetched in the worker. This supports Ruling R20: the `Failed to register a ServiceWorker` error Task 4 saw came from the extension-loaded Chrome profile, not from the upgrade.
5. **Cleanup.** Main's Astro 6.2.1 preview is a foreground process with no `preview stop` subcommand. Running `pnpm astro preview stop` inside the worktree started a *new* preview of main's build instead. It first tried the shared port (`Port 4321 is in use, trying another one...`) and then bound :4322; `timeout 20` killed it, and `lsof` confirmed it was gone. **If the branch preview had been down at that moment, main's build would have been served on :4321.** The brief's step 5 command is only valid for Astro 7. I then stopped the `:4332` process by PID (90644/90664, cwd verified as the worktree). After that, `curl http://localhost:4321/` returned **200** and the branch preview never went down. `git worktree remove --force …/t8/pw-main` completed. The `…/t8/main-before` worktree and the `:4331` listener belong to other lanes and were left alone.
6. Evidence: `playwright/results.json` → `.p0`, and `.p0` in each baseline JSON.

## P1: Image slider — **PASS** (desktop 128 + dark 11 + mobile 99 = 238 checks)

Method:
- Each carousel is scrolled into view vertically, then the test waits for the post-mount state (Next enabled when N>1).
- Buttons are pressed with real `locator.click()` mouse events, or `locator.tap()` on mobile.
- After each press the test waits for a scroll event and then for `scrollLeft` to hold steady for 8 consecutive 50 ms samples, plus 2 rAF.
- Keyboard: `locator.focus()` on Next, confirming `document.activeElement` is Next, then `keyboard.press('Enter' | 'Space')`.
- Desktop gestures: `page.mouse.wheel(±0.4·cw, 0)` at the scroller centre, followed by a 0.7·cw wheel.
- Mobile gestures: CDP `Input.synthesizeScrollGesture`, `gestureSourceType: 'touch'`, `preventFling`, with 40% and 70% swipes.
- Snap is judged two ways: `scrollLeft % clientWidth`, and geometrically (some slide's left edge within 2 px of the scroller content-box edge).
- A gesture only passes if the scroller actually moved during it (maximum displacement taken from a scroll listener).
- Expected N comes from the `astro-island` `props` (server data), independent of what React rendered.

Carousel counts: octoprint **7** (7 slider islands), flutter-embedded **2** (2 islands).

In the table:
- "imgs loaded" is the count at start → after walking every slide. Images are `loading="lazy"`, so the third slide loads once it is scrolled to.
- Every step delta is in px.
- For the wheel/swipe 40% columns, the first number is the maximum displacement during the gesture, followed by where it settled.

| viewport | carousel | N | clientWidth | imgs loaded | Next click Δ | walk-to-end Δs | Prev Δ | Enter / Space Δ (page scrollY) | wheel/swipe 40% back from end | 40% fwd from start | 70% fwd | result |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| desktop 1280 | octoprint #1 | 2 | 734 | 2/2 → 2/2 | 734 | [734] | -734 | 734 / 734 (20528→20528) | 287px → slide 2, off 0 | 287px → slide 1, off 0 | 1→2, mod 0 | PASS (14) |
| desktop 1280 | octoprint #2 | 2 | 734 | 2/2 → 2/2 | 734 | [734] | -734 | 734 / 734 (24725→24725) | 287px → slide 2, off 0 | 287px → slide 1, off 0 | 1→2, mod 0 | PASS (14) |
| desktop 1280 | octoprint #3 | 2 | 734 | 2/2 → 2/2 | 734 | [734] | -734 | 734 / 734 (24928→24928) | 287px → slide 2, off 0 | 287px → slide 1, off 0 | 1→2, mod 0 | PASS (14) |
| desktop 1280 | octoprint #4 | 3 | 734 | 2/3 → 3/3 | 734 | [734,734] | -734 | 734 / 734 (26952→26952) | 287px → slide 3, off 0 | 287px → slide 1, off 0 | 1→2, mod 0 | PASS (14) |
| desktop 1280 | octoprint #5 | 3 | 734 | 2/3 → 3/3 | 734 | [734,734] | -734 | 734 / 734 (30893→30893) | 287px → slide 3, off 0 | 287px → slide 1, off 0 | 1→2, mod 0 | PASS (14) |
| desktop 1280 | octoprint #6 | 2 | 734 | 2/2 → 2/2 | 734 | [734] | -734 | 734 / 734 (31012→31012) | 287px → slide 2, off 0 | 287px → slide 1, off 0 | 1→2, mod 0 | PASS (14) |
| desktop 1280 | octoprint #7 | 2 | 734 | 2/2 → 2/2 | 734 | [734] | -734 | 734 / 734 (32437→32437) | 287px → slide 2, off 0 | 287px → slide 1, off 0 | 1→2, mod 0 | PASS (14) |
| desktop 1280 | flutter #1 | 2 | 734 | 2/2 → 2/2 | 734 | [734] | -734 | 734 / 734 (0→0) | 287px → slide 2, off 0 | 287px → slide 1, off 0 | 1→2, mod 0 | PASS (14) |
| desktop 1280 | flutter #2 | 3 | 734 | 2/3 → 3/3 | 734 | [734,734] | -734 | 734 / 734 (11630→11630) | 287px → slide 3, off 0 | 287px → slide 1, off 0 | 1→2, mod 0 | PASS (14) |
| mobile 375 (touch) | octoprint #1 | 2 | 341 | 2/2 → 2/2 | 341 | [341] | -341 | 341 / 341 (29008→29008) | 138px → slide 2, off 0 | 139px → slide 1, off 0 | 1→2, mod 0 | PASS (14) |
| mobile 375 (touch) | octoprint #2 | 2 | 341 | 2/2 → 2/2 | 341 | [341] | -341 | 341 / 341 (34709→34709) | 137px → slide 2, off 0 | 137px → slide 1, off 0 | 1→2, mod 0 | PASS (14) |
| mobile 375 (touch) | octoprint #3 | 2 | 341 | 2/2 → 2/2 | 341 | [341] | -341 | 341 / 341 (36013→36013) | 137px → slide 2, off 0 | 137px → slide 1, off 0 | 1→2, mod 0 | PASS (14) |
| mobile 375 (touch) | octoprint #4 | 3 | 341 | 3/3 → 3/3 | 341 | [341,341] | -341 | 341 / 341 (37988→37988) | 138px → slide 3, off 0 | 138px → slide 1, off 0 | 1→2, mod 0 | PASS (14) |
| mobile 375 (touch) | octoprint #5 | 3 | 341 | 3/3 → 3/3 | 341 | [341,341] | -341 | 341 / 341 (43053→43053) | 136px → slide 3, off 0 | 133px → slide 1, off 0 | 1→2, mod 0 | PASS (14) |
| mobile 375 (touch) | octoprint #6 | 2 | 341 | 2/2 → 2/2 | 341 | [341] | -341 | 341 / 341 (44245→44245) | 133px → slide 2, off 0 | 137px → slide 1, off 0 | 1→2, mod 0 | PASS (14) |
| mobile 375 (touch) | octoprint #7 | 2 | 341 | 2/2 → 2/2 | 341 | [341] | -341 | 341 / 341 (45245→45245) | 136px → slide 2, off 0 | 139px → slide 1, off 0 | 1→2, mod 0 | PASS (14) |

Each carousel's 14 checks also cover the following:
- Labels are exactly `Slide 1 of N … Slide N of N`, and N matches the island props.
- At the start, `scrollLeft=0`, Prev is `disabled` (opacity 0.3) and Next is enabled.
- At the end, Next is `disabled` and `scrollLeft = scrollWidth−clientWidth`.
- Walking back with Prev lands at `scrollLeft=0` with Prev disabled.
- After each gesture, the Prev/Next disabled state matches the position.
- Every `<img>` is `complete && naturalWidth>0` once all slides have been visited.

**How the gestures behaved.** A 40% wheel or swipe moves the scroller by about 40% of a slide (287 px desktop, about 137 px touch), then scroll-snap-mandatory snaps it back to the nearest slide edge (offset 0). A 70% gesture advances exactly one slide. The wheel and swipe values on main are identical to the branch; a diff of the whole table, ignoring scrollY and px displacement, came back empty.

**Mobile setup.** `isMobile: true, hasTouch: true, deviceScaleFactor: 3`. clientWidth is 341, the rect is 343 (2 px border), and the slide rect is 341, so there is no fractional drift.

**Dark theme** (set with a real click on `#theme-btn`; `data-theme` went light→dark and `localStorage.theme` became `dark`):
- All 9 carousels passed the start check: N matches the props, `scrollLeft=0`, Prev disabled, Next enabled.
- I also measured readability after the 150 ms colour transitions finished. The Next icon `rgb(234,237,243)` on the button background `bg-skin-card/80` composited over the body `rgb(33,39,55)` gives a contrast of **9.63:1**. Light theme gives 12.44:1. Main gives the identical 9.63:1.
- Screenshots: `playwright/screenshots-branch/dark-carousel-*.png`, `mobile-carousel-octoprint.png`.

## P2: Search `/search/` — **PASS** (5 checks)

- **Typing.** Real `keyboard.type('hiring')` into the input gave `Found 5 results for 'hiring'`, with 5 `<li>` cards. The first was `/posts/ems-the-people-system`.
- **URL.** `location.search === '?q=hiring'`, and `page.url()` is `http://localhost:4321/search/?q=hiring`.
- **Reload.** After `page.reload()`, the input value is `hiring` and the same 5 hrefs appear in the same order.
- **Result click.** A real click on the first result went through ClientRouter (the window marker survived). Response chain: `GET /posts/ems-the-people-system` returned **200** with no redirect, even though the link has no trailing slash. The landed `h1` is "The People System" and no `astro-island[ssr]` remained.
- **No-match.** Typing `zzzzqqq` gave `Found 0 results for 'zzzzqqq'` with 0 items and 0 console errors under that step's label.

## P3: Tags `/tags/` — **PASS** (6 checks)

- **Initial state.** 68 tags, sorted by count descending with ties alphabetical; the `count` button has `aria-pressed="true"`. The first five are engineering-management 15, engineering-leadership 11, leadership 11, systems-thinking 8, tutorial 7.
- **Filter.** Typing `engin` narrowed 68 → 5 (engineering-management, engineering-leadership, engineering-culture, senior-software-engineer, software-engineering). Every item contains `engin`.
- **Sorting.**
  - `a→z` on the filtered list is alphabetical by `localeCompare`, with `aria-pressed` set.
  - A real click on the × (Clear filter) restores all 68 in alphabetical order (3d-printing, agile, … wsl2), and the input empties. I also confirmed this order is *not* count-sorted, so the test can tell the two orders apart.
  - `count` restores descending counts.
- **Tag click.** `/tags/engineering-management/` loaded via ClientRouter fetch with status **200** and 5 post links.

## P4: ClientRouter — **PASS** (6 + 2 P4b checks)

The route was `/`, then a real click on the home card for the octoprint post, then the header search icon, then the header Tags link. No `goto` was used after the initial load.

- **Proof of client-side navigation.** A `window.__pwMarker` set on `/` survived all 3 navigations. Playwright counted **0** `load` and **0** `domcontentloaded` events after the initial load. The `astro:page-load` counter went 1 → 2 → 3.
- **Islands.** After each navigation every island was hydrated (7 on the post, 1 on search, 1 on tags; 0 `[ssr]` left).
- **Island interaction after each navigation:**
  - Carousel Next click: 0 → 734 (= clientWidth).
  - Search: typing `hiring` gave 5 results and set `?q=hiring`.
  - Tags: filter `engin` narrowed 68 → 5 and includes engineering-management.
- **P4b, dark theme across client navigation.** Dark was set on `/` with the toggle, then two header navigations went to `/posts/` and `/tags/`.
  - An rAF loop sampled `data-theme` and the body background on **every frame (83 frames)**; there were **0 non-dark frames**. Every frame had `rgb(33,39,55)`.
  - A MutationObserver shows Astro's swap drops `data-theme` and `toggle-theme.js`'s `astro:after-swap` handler restores it 1–4 ms later, in the same task, with no frame painted in between.
  - The toggle still works after navigation: dark→light→dark.

## P5: Theme persistence and first-paint theme (FOUC) — **PASS** (6 checks)

- **Toggle on `/`.** It sets `data-theme=dark` and `localStorage.theme=dark`. The body background goes from `rgb(251,254,251)` to `rgb(33,39,55)`, and `meta[name=theme-color]` becomes `rgb(33,39,55)`.
- **Full loads.** Pages loaded with `page.goto`: `/posts/`, `/tags/`, `/about/`, `/posts/audio-vs-paper-books/`. A context `addInitScript` recorded the theme at `DOMContentLoaded` and at the first rAF with a body. On every page, both samples show `data-theme=dark` and a body background exactly equal to the measured dark value `rgb(33, 39, 55)`, at t = 9–22 ms. There was no light first paint.
- **Persistence.** A reload, and a new tab (`/tips/`) in the same context, both render dark from `DOMContentLoaded`, and `localStorage.theme` stays `dark`.
- **Caveat on the reload leg.** On this Dark-mode host, Playwright's `page.reload()` can itself write `theme=dark` (Observation 2). So the reload result alone cannot tell working persistence apart from that artifact. Three results do:
  - `localStorage.theme === 'dark'` immediately after the toggle click, before any reload.
  - The four `page.goto` full loads, all dark at `DOMContentLoaded`.
  - The probe's control run, which shows `goto` does not trigger the flip.

## P6: TOC `<details>` — **PASS** (6 checks)

For both `audio-vs-paper-books` (.md) and `dad-ops-playbook` (.mdx):
- Each page has exactly 1 `<details>` with summary "Open Table of contents".
- It is closed initially; the first link has `isVisible=false`.
- A real click on the summary sets `open=true` and makes the link visible.
- Every in-page anchor target exists (8/8 and 7/7).
- I clicked two TOC links for real on each post:
  - The hash is set and the target is scrolled to (top = 0).
  - When the target is the last section and the page bottoms out, the target is still in view (`atBottom=true`).

## P7: Hydration sanity — **PASS** (2 checks)

- **Islands.** 27 visits (goto, reload and client-nav) covered 47 islands in total. **0** `astro-island[ssr]` remained after load or navigation on any visit.
- **Hydration messages.** **0** console or pageerror messages matched `/hydrat|Minified React error #(418|419|422|423|425)|did not match|server rendered HTML/i`. This covers page, frame and dedicated-worker console, and `pageerror`.

## Console: full capture and comparison with the pre-upgrade builds — **PASS**

- **What was captured.** Page console (including iframes and dedicated workers), `worker.on('console')`, service-worker console, `pageerror`, `requestfailed`.
- **Normalisation.** Origin, blob UUIDs, hashed `/_astro/*.js` names, `line:col`, and `?timestamp` are stripped before comparing (see `diff-console.mjs.txt`).
- **Result.** `playwright/console-diff.json`: `pass: true`, `branchOnlyCount: 0`.

| signature (error level; no warnings anywhere) | branch | main (:4332, same content) | prod |
|---|---|---|---|
| `NetworkError: Failed to execute 'send' on 'XMLHttpRequest': Failed to load 'ORIGIN/~partytown/proxytown'.` | 21 | 21 | 6 |
| `Failed to load resource: the server responded with a status of 404 ()` | 0 | 0 | 4 (the octoprint post is missing on prod) |

**The proxytown error is pre-existing, not introduced by this upgrade.** It only happens during a **ClientRouter navigation** away from a page whose Partytown worker is running gtag: P2 result click, P3 tag click, P4, P4b and P8. It never happens on a plain `goto`.

The mechanism: the swap removes the Partytown sandbox iframe, which aborts the worker's in-flight synchronous XHR to `/~partytown/proxytown` (`requestfailed … proxytown net::ERR_ABORTED`). gtag's code then gets the NetworkError. The stack is `qd (googletagmanager.com/gtag/js)` → Partytown `N.get` → sync XHR.

P8 characterised it with 2 reps at each dwell time before navigating (errors per rep are the dedup'd page-console count):

| dwell before nav | branch | main | prod |
|---|---|---|---|
| 500 ms | 1, 3 | 3, 2 | 1, 1 |
| 3000 ms | 2, 2 | 2, 4 | 2, 0 |
| 10000 ms | 3, 1 | 3, 1 | 1, 1 |

The rate is the same on the branch (`@qwik.dev/partytown` 0.14.4) and on main or prod (0.13.2), and it does not depend on dwell time. The Partytown SW-registration message from Task 4 did **not** occur in any clean-profile run (branch, main or prod). It is recorded here only as absent.

## Observations (non-failing)

1. **The pre-existing Partytown and ClientRouter teardown error above** may be worth a follow-up outside T-39. Options: exclude the Partytown sandbox from swaps, or reload the analytics per page.
2. **Harness artifact: the theme flips on `page.reload()` after `history.replaceState`.**
   - This host's macOS is in Dark mode (`AppleInterfaceStyle=Dark`). During Playwright's `page.reload()` of `/search/?q=hiring`, the old document receives a `prefers-color-scheme` change event with `matches:true`.
   - `public/toggle-theme.js`'s change listener (`setPreference`) then persists `localStorage.theme='dark'`. The stack is `setPreference ← MediaQueryList listener`.
   - Without the typing, and so without the `replaceState` URL change, it does not happen. It is identical on branch, main and prod, and `toggle-theme.js` is unchanged from main.
   - None of the P2 assertions depend on the theme. Evidence: `playwright/probe-theme-reload.mjs.txt` and `probe-theme-reload.txt`.
   - The site behaviour behind it is pre-existing and by design: an OS theme change is persisted as the user's choice.
3. **Production is behind main on content** (last deploy 31 Jul 2026; no octoprint post). That is why main `3df6160` served locally is the primary same-content baseline. Prod's 6 functional FAILs in `results-prod-baseline.json` are all "post missing (404)" or "no carousel on the fallback post".
4. **The unblocked P0 runs sent GA hits.** On the branch and on main, each sent one `g/collect` with `dl=localhost`, and each ended `net::ERR_ABORTED`. Every other context blocked GA at DNS.
5. **Port deviation.** Main was served on **:4332**, as this lane's instructions required, not the brief's :4322.
6. **Astro 6 has no `preview stop` subcommand.** The brief's P0 step-5 command (`pnpm astro preview stop` inside the main worktree) is wrong for Astro 6.2.1. It was parsed as a new preview, which first tried the shared :4321 (in use, so it moved to :4322) and was killed by `timeout`. Had the branch preview been down, main's build would have taken :4321. Main's preview was then stopped by PID after verifying its cwd.
7. **The scripts are archived with a `.txt` suffix.** As `.mjs` under `docs/`, they were picked up by the repo gate:
   - `eslint .` reported 240 `no-undef` errors.
   - `astro check` went from 77 to 80 files and from 0 to 3 hints.

   With the `.txt` suffix, the gate is back to `pnpm lint` exit 0, `astro check` 77 files with 0 errors, 0 warnings and 0 hints, and `format:check` clean (`docs/` is prettier-ignored). The code bodies are byte-identical to the executed scripts; only a 3-line header comment was added.

## Artifacts

All under `docs/library-packages-upgrade/qa-runs/T-39-2026-09/playwright/`:
- `e2e.mjs.txt`: the Playwright script (copy as `.mjs` to run). Usage: `node e2e.mjs <base> <out.json> <screenshotDir>`; `ONLY=P0,P1,…` selects groups.
- `diff-console.mjs.txt`: the console signature diff.
- `results.json`: the branch run of record (275/275 PASS).
- `results-main-baseline.json` and `results-prod-baseline.json`: the baseline runs.
- `console-diff.json`
- `probe-theme-reload.mjs.txt` and `probe-theme-reload.txt`
- `screenshots-branch/`: dark carousels and mobile carousel. There are no failure screenshots because nothing failed.
- `screenshots-main/`, and `screenshots-prod/` (the latter includes the prod 404 failure shots).

Repro, from a scratch dir holding `npm i playwright` and the scripts copied as `.mjs`, with the nvm prefix:
```bash
node e2e.mjs http://localhost:4321 results.json screenshots-branch
node diff-console.mjs results.json results-main-baseline.json results-prod-baseline.json console-diff.json
```
