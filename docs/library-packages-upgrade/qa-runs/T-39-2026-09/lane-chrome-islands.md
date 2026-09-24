# QA lane "chrome-islands": Task 8, Steps 2–6, in the user's Chrome

- Date: 2026-09-23 (23:13–23:30 local)
- Repo / HEAD: `/Users/ap/development/other/eliotik.github.io`, branch `upgrade/2026-09`, `55a65300a2dce56e7c225232ca8c4abb2c7bd5b4`
- Target: shared branch preview `http://localhost:4321` (Astro v7.3.4, `<meta name="generator">`). This lane did not start or stop it.
- Comparison target (read-only, used only to classify two console messages and the theme-swap mechanics): another lane's `main` (`3df6160`) preview on `http://localhost:4331` (Astro v6.2.1), served from `…/scratchpad/t8/main-before`.
- Browser: the user's Chrome 151 (`Default` profile, with extensions), driven through the Claude in Chrome extension. The lane used its own new tab (id 1068544351) and closed it at the end.

**Verdict: FAIL, on one check only (CON / S4.5 / S5.4).** Every ClientRouter navigation logs `InvalidStateError: Transition was aborted because of invalid state`. The evidence says the hidden window causes it and that it is already on `main`: the same error reproduces with a bare `startViewTransition` in this hidden tab and on the Astro 6.2.1 `main` build in the same window. The lane rules say to record any console error other than Partytown as a failure, so deciding whether it can be excluded is for the controller. The Playwright lane's P4 (a visible document) is the authority on whether it happens outside a hidden window. Every other check passed or was delegated as plan Step 2 requires.

## Step 2: window visibility (binding)

| Item | Value |
|---|---|
| `document.visibilityState` (right after opening the tab, and again on every page) | **`"hidden"`** (`document.hidden === true`, `hasFocus() === false`) |
| Resize to 1280×1800 | The call succeeded but had no effect. `innerWidth×innerHeight` stayed at 1854×1064, and `outerWidth×outerHeight` read 0×0, then 291×167, so the window is hidden or minimised. All carousel checks are relative to `clientWidth` (734 px), so this doesn't block anything. |

Because the window is hidden, I followed plan Step 2. The real-input parts of P1 (slider Next/Prev via clicks, keyboard and wheel snap), P2 (search typing), P3 (tag typing) and P4 (navigation) are **delegated to the Playwright lane**. I didn't use any native-setter, `scrollLeft=` or `scrollBy` fallback. All input below is real CDP input from the `computer` tool, confirmed trusted with `event.isTrusted === true` listeners. I never set the carousel's scroll position from script. The only programmatic scrolling was page-level `scrollIntoView` / `scrollTo(0,0)`, used to bring a carousel or the header into view.

What real input did in this hidden window:
- **Real typing works.** Trusted `keydown` and `insertText` events fired for every character, so S4, S5 and S6 typing were done for real.
- **Real clicks work,** with one quirk: the first click after a full-page load, before any screenshot, was sometimes lost. This happened on `/tags/` (branch) and on `/search/` (main). A retry after a screenshot always landed.
- **Real wheel scrolling works,** and scroll-snap settles exactly on slide edges.
- **Smooth-scroll animation stalls.** A trusted Next click runs `onClick → scrollBy({behavior:'smooth'})`. The scroll starts (for example 0 → 1 → 2.5 → 5 → 8 px) and then stops, because the hidden window produces no frames. On carousel #0 it did reach exactly 734 px after a screenshot pumped frames. On other carousels it stayed at 1–8 px. The Task 4 carry-forward note describes the same thing. The "Next moves by exactly one slide width" check is therefore **delegated to the Playwright lane (P1)**.

## Results

| ID | Check | Result | Evidence (summary; details below) |
|---|---|---|---|
| S2 | Visibility state recorded | PASS (recorded: `hidden`) | See the table above |
| S3.1a | octoprint: carousels present, slide count | PASS | 7 carousels. N = 2,2,2,3,3,2,2 (16 slides). `scrollWidth = N×734` for each. |
| S3.2a | octoprint: every slide `img` complete with `naturalWidth>0` | PASS | Right after load, 0/16 were complete: `loading="lazy"` and the carousels sit off-screen (top ≥ 21369 px). After each carousel was scrolled into view, 14/16 were loaded. The other 2 (slide 3 of #3 and #4, two slide widths off-view) had not been requested yet (no resource-timing entry). A page `fetch` returned 200 `image/webp` (2890 B and 58064 B), and `new Image().decode()` succeeded (530×438, 858×1010). After a real wheel scroll through those carousels, **16/16 had `complete && naturalWidth>0`**. |
| S3.3a | octoprint: start state | PASS | All 7: `scrollLeft 0`, Prev `disabled=true` (opacity 0.3), Next `disabled=false`. Next starts `disabled` and is only enabled by the React effect, so this also proves hydration without any input. The `__reactProps$…` key is present on all 7. |
| S3.4a | octoprint: Next = +1 slide width, end reached after N−1 clicks, Prev = −1 | PASS (hidden window: real-input part delegated to Playwright lane P1, plan Step 2) | Real trusted click on #0 Next: the scroll started (Prev became enabled). Once a screenshot pumped frames it ended at `scrollLeft 734` = `clientWidth` (`734 % 734 = 0`). Next was then `disabled` (end reached after N−1 = 1 click). A real Prev click took it back to `0`, with Prev `disabled` again. A real click on #1 stalled at 5 px (Prev then went to 1 px), which is the hidden-window smooth-scroll stall. No fallback was used. |
| S3.5a | octoprint: wheel scroll snaps to a slide edge | PASS (real wheel), and also delegated to P1 | Real horizontal wheel, 1 tick each. #0: 0→734→0. #3: 0→734→1468 (Next `disabled` at the end)→0. #4: 0→734→1468→734. #1 went from the stalled 1 px to 0. Every settled value is an exact multiple of 734 (`% clientWidth = 0`). |
| S3.6a | octoprint: labels | PASS | Every slide's `aria-label` is exactly `Slide k of N`, e.g. `["Slide 1 of 2","Slide 2 of 2"]`. The 3-slide ones read `Slide 1 of 3` … `Slide 3 of 3`. |
| S3.7a | octoprint: theme toggle, then re-check render and start state | PASS | A real click on `#theme-btn` changed dark→light: `data-theme="light"`, body bg `rgb(251, 254, 251)`, `localStorage.theme="light"`. After a reload in light: all 7 carousels had N and labels OK, `sL 0`, Prev disabled and Next enabled, and were hydrated. Zoomed screenshots of #0 and #3 are readable in light. (The carousel border colour `oklch(0.928 0.006 264.531)` and the button colours match `main` exactly in dark.) |
| S3.1b | flutter: carousels present, slide count | PASS | 2 carousels, N = 2 and 3 |
| S3.2b | flutter: images loaded | PASS | 0/5 at load (lazy, off-screen). After scroll-into-view and real wheel: **5/5** (502×1014, 762×1618, 570×1206, 570×1206, 570×1216). |
| S3.3b | flutter: start state | PASS | Both: `sL 0`, Prev disabled, Next enabled, `__reactProps` present. |
| S3.4b | flutter: Next/Prev movement | PASS (hidden window: real-input part delegated to Playwright lane P1, plan Step 2) | Real trusted click on #0 Next: the scroll started (0.5 → 1 → 2.5 → 5 px) and then stalled, the same hidden-window stall. Real wheel: #0 0→734 (Next `disabled` at the end)→0 (Prev `disabled`). #1 0→734→1468 (Next `disabled`)→734. Screenshots show the right slide each time (Hello World screen, then loading circle, then map). |
| S3.6b | flutter: labels | PASS | `Slide 1 of 2; Slide 2 of 2` and `Slide 1 of 3; Slide 2 of 3; Slide 3 of 3` |
| S3.7b | flutter: theme toggle, then re-check | PASS | A real click changed light→dark: `data-theme="dark"`, bg `rgb(33, 39, 55)`, `localStorage.theme="dark"`. After a reload: both carousels at start state, labels OK, hydrated. Zoomed screenshot readable. |
| S3.8 | Carousel pages: console (`error|hydrat|Uncaught|warn`) | PASS | On every load of both posts, in both themes, the only message was the Partytown SW `TypeError` (R20, see below). No hydration messages and no warnings. |
| S3.GIF | GIF `image_slider_octoprint.gif` | Not exported | I recorded 6 frames of the carousel #0 interaction. The extension's export needs `download: true`, which is a browser file download, so I skipped the export as instructed and discarded the frames. No GIF artifact. |
| S4.1 | Search: real typing `hiring`, results | PASS | Click on the input, then `computer type "hiring"`: 6 trusted `keydown` events plus 6 trusted `insertText` events. `value="hiring"`, and the page reads "Found 5 results for 'hiring'": `/posts/ems-the-people-system`, `/posts/the-emotional-roller-coaster-of-hiring`, `/posts/two-books-which-influenced-my-hiring-pipeline`, `/posts/ems-why-systems-not-processes`, `/posts/dad-ops-playbook`. |
| S4.2 | `location.search` contains `q=hiring` | PASS | `location.search === "?q=hiring"` |
| S4.3 | Reload keeps input and results | PASS | Real `cmd+r`. Navigation entry `type === "reload"` and a new `timeOrigin`, so it was a real reload. After it: `value="hiring"`, the same 5 results, same "Found 5…" text. |
| S4.4 | Click first result → `/posts/…`, 200 | PASS | A real click on "The People System" went to `/posts/ems-the-people-system` through ClientRouter (same document), h1 "The People System". `curl` returns 200 for both `/posts/ems-the-people-system` and `/posts/ems-the-people-system/`. |
| S4.5 | Search: console | **FAIL** (environment-caused, pending controller ruling; see the Console section) | Only the Partytown SW `TypeError` (R20) and one `InvalidStateError: Transition was aborted because of invalid state` on the ClientRouter navigation. That second one is caused by the hidden window, and it reproduces on `main`. |
| S5.1 | Tags: real typing `engin` narrows and includes engineering-management | PASS | The first click after page load was lost (hidden-window quirk). On retry: trusted click on the INPUT plus 5 trusted input events. Page reads "5 of 68 tags matching "engin"": engineering-management 15, engineering-leadership 11, engineering-culture 2, senior-software-engineer 1, software-engineering 1. Every result contains `engin`. |
| S5.2 | Sort: a→z vs count | PASS | Real click on the "Clear filter" button brought back 68 tags. Real click on `a→z`: `aria-pressed` changed, and the order is strictly `localeCompare`-ascending (`3d-printing, agile, architecture-decision-records, astro, blogging` … `vllm, web-development, wsl2`). Real click on `count`: order is count descending with alphabetical tiebreak (`engineering-management 15, engineering-leadership 11, leadership 11, systems-thinking 8, tutorial 7`), checked over all 68 tags. |
| S5.3 | Click a tag opens `/tags/<tag>/` | PASS | A real click on `#engineering-management` went to `/tags/engineering-management/` through ClientRouter. Title "Tag: engineering management \| Novi Fyx", "15 articles" header, 5 cards on page 1. `curl` 200. |
| S5.4 | Tags: console | **FAIL** (environment-caused, pending controller ruling; see the Console section) | Partytown SW `TypeError` (R20) and one hidden-window `InvalidStateError` from the tag-link navigation. |
| S6.1 | `/` → carousel post by clicking a link; island works | PASS (hidden window: real-input part delegated to Playwright lane P4, plan Step 2) | A real click on the home-page link "Setting up OctoPrint…" went to `/posts/octoprint-prusa-core-one-raspberry-pi/`. It was the same document (a JS marker survived), so this was a ClientRouter swap. All 7 `astro-island`s had hydrated (no `ssr` attribute), `__reactProps` present, Next enabled and Prev disabled. A real Next click was trusted and the scroll started (Prev became enabled, `sL` 3) before the hidden-window stall. A real wheel then gave `sL 734` with Next `disabled`. |
| S6.2 | Header → `/search/`; island works | PASS | A real click on the header Search icon went to `/search/` (same document). The input has `__reactProps`. Real typing `hiring` gave "Found 5 results for 'hiring'", `?q=hiring`, the same 5 results. |
| S6.3 | Header → `/tags/`; island works | PASS | A real click on the header "Tags" went to `/tags/` (same document), with 68 tags. Real typing `engin` gave "5 of 68 tags matching "engin"". |
| S6.4 | Theme: toggle on `/`, navigate, `data-theme` persists, no light flash | PASS | On `/`, real clicks went dark→light→dark. The MutationObserver on `<html>` logged `data-theme: dark->light` then `light->dark`. Body bg went `rgb(251,254,251)` → `rgb(33,39,55)`, and `localStorage.theme` ended as `dark`. Then 3 ClientRouter navigations (/ → post → /search/ → /tags/). At `astro:after-swap` and `astro:page-load`, `data-theme` was `"dark"` every time and body bg was `rgb(33, 39, 55)`, and every screenshot after a navigation is dark. The same observer shows a transient `data-theme: dark->null` when ClientRouter swaps the root attributes (the new document's `<html>` has no `data-theme`), and `null->dark` when `toggle-theme.js` handles `astro:after-swap`. The gaps were 26 ms, 2 ms and 15 ms. **`main` (Astro 6.2.1) shows the same pattern** (`dark->null` then `null->dark`, 20 ms gap on the same navigation), so this was not introduced by the upgrade. In Chrome the swap runs inside the `startViewTransition` update callback, where rendering is suppressed, so the gap is not painted. A hidden window paints no frames, so I couldn't observe paint directly here. |
| PT | Partytown in this profile (R20) | Confirmed: extension-caused, pre-existing | See the Partytown section. The authoritative verdict is the Playwright lane's Step 2a (clean profile). |
| CON | No console errors other than the Partytown SW `TypeError` | **FAIL** (environment-caused and on `main` too; the controller decides whether to exclude it, and Playwright P4 is the authority) | The only other message was `InvalidStateError: Transition was aborted because of invalid state`, once per ClientRouter navigation (5 on the branch). I proved it comes from the hidden window: a bare `document.startViewTransition(()=>{})` in the same tab rejects `.ready` with the identical message. It reproduces identically on `main` (Astro 6.2.1), 2 of 2 navigations. Neither Astro version's router attaches a handler to `viewTransition.ready` (`node_modules/astro/dist/transitions/router.js:318`, the same code in 6.2.1 and 7.3.4). The Playwright lane (a visible headless document) is the authority on whether it is absent when the document is visible. |

## Partytown in the user's Chrome profile (controller ruling R20): confirmed

1. The console on every full page load of `/`, both carousel posts, `/search/` and `/tags/` shows `TypeError: Failed to register a ServiceWorker for scope ('http://localhost:4321/~partytown/') with script ('http://localhost:4321/~partytown/partytown-sw.js'): An unknown error occurred when fetching the script.` Nothing else appears on a full load.
2. Page `fetch` from `http://localhost:4321/`:
   - `/~partytown/partytown-sw.js` was **rejected** with `TypeError: Failed to fetch`.
   - `/~partytown/partytown.js` returned 200 `text/javascript`, 3198 B.
   - `/~partytown/partytown-sandbox-sw.html` returned 200 `text/html`, 45949 B.
   - The `read_network_requests` entries for the blocked URLs showed status 503.
3. `curl` against the same server:
   - `/~partytown/partytown-sw.js` returned **200** `text/javascript`, 47177 B, the same size as `dist/~partytown/partytown-sw.js`.
   - `partytown.js` returned 200, 3198 B.
   - `partytown-sandbox-sw.html` returned 200, 45949 B.
4. **No server hit, shown with a logging server.** I started a scratch `python3 -m http.server` on 127.0.0.1:4391 and requested these paths from the page with `fetch(…, {mode:'no-cors'})`:
   - `/control.js`: resolved, and appeared in the server log.
   - `/~partytown/partytown.js`: resolved, and appeared in the server log (as a 404, which is expected).
   - `/~partytown/other-sw.js`: resolved, and appeared in the server log.
   - `/~partytown/partytown-sw.js`: **rejected, and no log line**.
   - `/x/partytown-sw.js`: **rejected, and no log line**.
   - `curl` of `/~partytown/partytown-sw.js` on the same server: 200, and it was logged.

   So Chrome blocks any URL containing `/partytown-sw.js`, on any host and any path, before the request is sent. The server was stopped afterwards.
5. **The blocking rule.** uBlock Origin Lite (`ddkjiahejlhfcafbddmgiahcphecmpfh`) is installed in the `Default` profile (versions 2026.825 to 2026.920). Its declarativeNetRequest ruleset `rulesets/main/annoyances-notifications.json` contains `{"action":{"type":"block"},"condition":{"urlFilter":"/partytown-sw.js"},"id":202,"priority":10}`. That matches the observed pattern exactly: `…/partytown-sw.jsX` is blocked and `…/other-sw.js` is not. The block uses declarativeNetRequest, so no `chrome-extension://` stack frame exists or is needed.
6. **`main` in the same profile:** the `main` preview (`http://localhost:4331/search/?q=hiring`, Astro 6.2.1 with `@qwik.dev/partytown` 0.13.2) logs the identical `TypeError` for `http://localhost:4331/~partytown/`.
7. This confirms R20: the error is caused by the extension, doesn't depend on the build, and is not a regression. The authoritative verdict is the Playwright lane's Step 2a in a clean profile.

## Other console messages: `InvalidStateError: Transition was aborted because of invalid state`

- **Branch:** logged as `[EXCEPTION]` once per ClientRouter navigation, 5 times in total:
  - search result click
  - tag link click
  - / → post
  - post → /search/
  - /search/ → /tags/
- **Cause:** the document is hidden. Chrome aborts view transitions in a hidden document, and ClientRouter doesn't handle the rejected `.ready` promise. In the same hidden tab, `document.startViewTransition(() => {})` produced:
  - `updateCallbackDone`: resolved
  - `ready`: rejected with `InvalidStateError: Transition was aborted because of invalid state`
  - `finished`: resolved

  The navigations themselves completed: the DOM swapped, `astro:page-load` fired, and the islands hydrated.
- **`main` (Astro 6.2.1), same window:** the identical exception, on `/search/?q=hiring` → first result and on `/` → octoprint post.
- **Router code:** in both Astro versions, `router.js` calls `document.startViewTransition(...)` and only chains `.updateCallbackDone` and `.finished`, never `.ready`.
- **Classification:** the evidence says it is caused by the environment (hidden window) and already present on `main`, so it is not a regression. Under the lane rule ("record any other console error as a failure") it is still recorded as **FAIL** for CON, S4.5 and S5.4. Excluding it would take a controller ruling, as R20 did for Partytown. Whether it is absent in a visible document is for the Playwright lane (P4) to confirm.

## Observations (not failures)

- **`<html class="false">`** comes from `src/layouts/Layout.astro:41` (``class={`${scrollSmooth && 'scroll-smooth'}`}``). The source is the same on `main`, and main's `/` also renders `class="false dark"`. It's pre-existing and harmless.
- **The `dark` class is lost after a ClientRouter swap.** The inline head script adds `dark` to `<html>`, and the root-attribute swap replaces it with the new document's class list. CSS keys only on `data-theme` (`src/styles/base.css:49`, `html[data-theme='dark']`), so nothing visible changes. Same on `main`.
- **The theme attribute gap during swaps** (`data-theme` is null between the root-attribute swap and `astro:after-swap`) is the same on `main`. No paint happens in Chrome because of the view-transition rendering suppression. The absence of a flash on a visible screen can only be judged from the Playwright lane's frames.
- **Pre-existing SW registration in this profile.** `localhost:4321` has one activated registration, scope `/~partytown/debug/`, script `/~partytown/debug/partytown-sw.js`. It is not the page's controller. It dates from an earlier dev-mode session: Partytown's debug build, which this lane never served. I left it untouched. It doesn't affect the production `/~partytown/` path. While checking R20, my one explicit `navigator.serviceWorker.register('/~partytown/partytown-sw.js')` probe was rejected with the same `TypeError`, so it registered nothing.
- **Lazy images.** `loading="lazy"` on slide images means slides two widths off-view are not fetched until the carousel is scrolled. The component is the same on `main`.
- **Hidden-window input quirks.**
  - The first click after a full-page load, before any screenshot, was lost twice (branch `/tags/` and main `/search/`).
  - Smooth scroll (`scrollBy({behavior:'smooth'})`) stalls without frames.
  - Wheel scrolling and typing work normally.
- **Theme state restored.** I toggled the theme during the run, and it ended as `localStorage.theme = "dark"` (the user's original) with `data-theme="dark"`.

## Artifacts

- This report: `docs/library-packages-upgrade/qa-runs/T-39-2026-09/lane-chrome-islands.md`
- There is no GIF: exporting it would have needed a browser download, so it was skipped as instructed. Screenshots were viewed inline and not saved to disk. The screenshot lane owns the Step 7 PNGs.
- Scratch copies of the curled Partytown assets are under `…/scratchpad/t8/chrome-islands/` (not part of the repo).
