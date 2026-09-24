# T-39 Phase 3 QA (v4): lane `runtime-delta`

**Overall: PASS.** All five required checks (R1–R5) pass. A harness self-test also passes. There are no unexplained differences between the two builds.

## Trees under test

| Role | SHA | Served on |
| --- | --- | --- |
| HEAD (Phase 3) | `ab5c02d687e5266ad122db3a37de873ca385a991` | `http://localhost:4411` |
| BASE (v3 final, fully verified) | `9eb1ec391aedca5a7ad615f37d53568f0a0f2aa0` | `http://localhost:4412` |

The four Phase 3 code commits are:
- Task 18 (`1326205`): absolute links in 3 Flutter posts.
- Task 19 (`05c8894`): the 404 page drops canonical, `og:url` and `twitter:url`, and adds noindex.
- Task 20 (`889a6cf`): `/tags/` and `/threads/` appear only in their own sitemaps.
- Task 21 (`ab5c02d`): `<html>` gets `class="scroll-smooth"` only when enabled; `class="false"` is gone.

## Environment

- **Worktrees.** Each tree was built in its own detached worktree (`scratchpad/p3v/runtime-delta-head` and `runtime-delta-base`) with `nvm use` (Node 22.23.3), `pnpm install --frozen-lockfile` and `pnpm build`.
  - Both builds report `astro check` 0 errors / 0 warnings, and jampack finished.
  - The main checkout was not built in and not modified.
- **Serving.** `pnpm astro preview --port 4411|4412` (daemonised), started from inside each worktree.
- **Browser.** Playwright 1.63.0 driving installed Google Chrome 153.0.8010.53 (`channel: 'chrome'`, headless). Each test group ran in a fresh non-persistent context.
- **Analytics blocking.** Same `--host-resolver-rules` as v3: NXDOMAIN for `www.google-analytics.com`, `*.google-analytics.com`, `analytics.google.com`, `*.doubleclick.net` and `www.google.com`.
  - `googletagmanager.com` is not blocked, so the real gtag.js runs inside Partytown.
  - No request interception is used.
- **Console capture.** Every context records:
  - page console messages (including child frames and the Partytown sandbox iframe)
  - `pageerror` and `crash`
  - dedicated-worker console messages
  - service-worker console messages
  - `requestfailed` events and every response ≥ 400
- **Harness self-test (`SELFTEST.capture`, PASS).** Four injected errors were all captured: a page `console.error`, an uncaught page error, a Blob-worker `console.error`, and a `console.error` in the Partytown sandbox iframe.
- **Narrow error exception (same one the v3 visual-regression lane used).** Chrome logs `Failed to load resource: the server responded with a status of 404 (Not Found)` for the main document when the nonexistent URL is requested on purpose.
  - Only that exact text, located exactly at `<origin>/this-route-does-not-exist`, is excused.
  - It appears identically on both builds: 12× across the two R1 runs (6 head, 6 base: one per 404 capture) and 2× in R4 (1 head, 1 base).
  - Any other error would fail the check. None occurred.

## Checks

| ID | Check | Result |
| --- | --- | --- |
| R1 | Pixel diff, 8 routes × light/dark, head vs base | **PASS**: 0 px on all 16 viewport pairs; 0 px on all 16 full-page pairs (tall-viewport method) |
| R2 | Flutter links: real click, ClientRouter, 200, right post, full loads | **PASS** |
| R3 | `<html>` class and theme through ClientRouter; comparison with base | **PASS**: the only difference is the removed `false` token |
| R4 | Custom 404: render, head meta, Go back home | **PASS** |
| R5 | Islands smoke and Partytown | **PASS** |

### R1 Pixel diff: PASS

Capture settings for both builds:
- 1280×1800 viewport, `deviceScaleFactor: 1`, `reducedMotion: 'reduce'`, `colorScheme` light or dark.
- An init script sets `localStorage.theme`, as in v3.
- Screenshots use `animations: 'disabled'` and `caret: 'hide'`.

Before each capture, the harness waited for all of the following:
- the `load` event and network idle
- the Google Fonts `<link>` flipping from `media=print` to `all`, and IBM Plex Mono faces present, then `document.fonts.ready`
- no `astro-island[ssr]` left
- in-viewport images complete (full-page mode: all images, after an instant scroll pass)
- a final 500 ms

Comparison is exact RGBA equality from decoded PNGs (pngjs), not a threshold diff.

Preconditions (PASS on every capture, both builds):
- HTTP status is 200 (404 for the 404 route).
- `data-theme` matches the requested theme.
- The set of loaded IBM Plex Mono faces is identical between the builds.
- All islands are hydrated.

| Route | vp light | vp dark | full-page (tall method) light | full-page (tall method) dark | Full-page size |
| --- | --- | --- | --- | --- | --- |
| `/` | 0 | 0 | 0 | 0 | 1280×1800 |
| `/posts/flutter-google-maps-embedded-map/` | 0 | 0 | 0 | 0 | 1280×14417 |
| `/posts/flutter-google-maps-address-manipulation/` | 0 | 0 | 0 | 0 | 1280×10283 |
| `/posts/flutter-google-maps-static-map/` | 0 | 0 | 0 | 0 | 1280×8423 |
| `/posts/audio-vs-paper-books/` | 0 | 0 | 0 | 0 | 1280×4542 |
| `/tags/` | 0 | 0 | 0 | 0 | 1280×3029 |
| `/threads/` | 0 | 0 | 0 | 0 | 1280×1800 |
| `/this-route-does-not-exist` (404) | 0 | 0 | 0 | 0 | 1280×1800 |

**The required check is the 1280×1800 viewport pair: 0 px on all 16.** Full-page was an extra check, run twice:

1. **Playwright `fullPage: true` (first attempt).** 12 of 16 pairs had 0 px. Four pairs were non-zero: embedded-map light 1600 px and dark 2956 px; static-map light 1600 px and dark 2956 px.
   - Every differing pixel is inside a ~44×44 box at x = 957–1002: the carousel's **"Next slide" button**. It is enabled on one capture and disabled on the other. See the crops in `diff/runtime-delta-R1.fp.*-crop-head-base-diff.png`, which stack head, base and diff; the full diff maps are alongside them.
   - Repeating the capture on the same build shows the same toggle, so this is capture noise, not a difference between the builds.

     | Pair | head vs head | base vs base | repeat head vs repeat base |
     | --- | --- | --- | --- |
     | embedded light | 1600 | 1600 | 1600 |
     | embedded dark | 0 | 1478 | 1478 |
     | static light | 1600 | 0 | 0 |
     | static dark | 0 | 0 | 2956 |

   - The same-build repeats are the evidence. The likely cause, not verified, is that `fullPage` capture (Chrome `captureBeyondViewport`) resizes the viewport during the capture. That would fire the slider's `resize` handler (`updateScrollState` → React state) in a race with the capture. `ImageSliderClient.tsx` is unchanged between the two trees. The viewport captures, which include the first embedded-map carousel at y ≈ 1087, show the button enabled on both builds.
   - This optional check is recorded as `R1.fullpage` with `pass: false` in `runtime-delta/results-R1-viewport-and-pwfullpage.json`. It is superseded by `R1.fullpage-tall`. Its non-zero pairs were handled under the task's "else Read both and explain" rule: head and base crops were read and the difference is explained above. It is not a failure of this lane.
2. **Tall-viewport method (deterministic, `R1_FP_METHOD=tall`).** The viewport is set to 1280×scrollHeight, resize handlers get about 1.3 s to settle, then a plain screenshot is taken. **0 px on all 16 pairs.** Every Next-slide button is enabled on both builds: `EE`/`EE` for embedded-map and static-map, `EEE`/`EEE` for address-manipulation.

Expected non-visual differences were confirmed in the DOM: `<html>` class is `null` on head vs `"false"` on base (`"dark"` vs `"false dark"` in dark mode), and the Flutter link `href`s changed. Neither changes a pixel.

R1 console: 0 unexpected errors across every R1 capture context (both runs, including the noise-floor repeats). The only errors were the excused 404 document messages listed above.

### R2 Flutter links (HEAD): PASS

Each changed link was tested from a fresh full load of its source post. The link is located as `#article a[href=<new>]` with an exact text match; each resolves to exactly one element. A real Playwright click follows.

| # | Source post | Link text → href | After click | Soft nav | Target fetch |
| --- | --- | --- | --- | --- | --- |
| 1 | `/posts/flutter-google-maps-embedded-map/` | First post → `/posts/flutter-google-maps-setup/` | `/posts/flutter-google-maps-setup/`, h1 "Flutter Google Maps - Setup" | yes (token kept, 0 load events) | 200 (fetch, +123 ms) |
| 2 | `/posts/flutter-google-maps-address-manipulation/` | Second post → `/posts/flutter-google-maps-embedded-map/` | `/posts/flutter-google-maps-embedded-map/`, h1 "Flutter Google Maps - Embedded Map" | yes | 200 (+67 ms) |
| 3 | `/posts/flutter-google-maps-address-manipulation/` | First post → `/posts/flutter-google-maps-setup/` | `/posts/flutter-google-maps-setup/`, h1 "Flutter Google Maps - Setup" | yes | 200 (+78 ms) |
| 4 | `/posts/flutter-google-maps-static-map/` | Third post → `/posts/flutter-google-maps-address-manipulation/` | `/posts/flutter-google-maps-address-manipulation/`, h1 "Flutter Google Maps - Address Manipulation" | yes | 200 (+84 ms) |

- After each click, the h1 and `<title>` match a full load of the target.
- Full loads of all 3 targets return 200 at the same path (no redirect).
- **Base contrast** (fetched from Node, not clicked):
  - The base HTML still has the old relative hrefs, e.g. `./flutter-google-maps-setup`.
  - From the trailing-slash post URL these resolve to nested paths such as `/posts/flutter-google-maps-embedded-map/flutter-google-maps-setup`, which all return **404**. This is the defect Task 18 fixes.
  - The head HTML has only the new hrefs.
- Console: 0 errors of any kind in all R2 contexts.

### R3 `<html>` class and theme through ClientRouter: PASS

The sequence ran on each build in a fresh context: light colour scheme, **no** `reducedMotion`, and an init script that records `astro:page-load` and DOMContentLoaded / first-rAF snapshots.

1. Full load of `/`.
2. After the `load` event, click `#theme-btn` to switch to dark.
3. Start a rAF sampler.
4. Click the home card to `/posts/local-coding-model-desktop-macbook/`.
5. Click the header `/tags/` link.
6. Press browser Back, then Forward, then Back again.
7. Do four full loads: reload the post, `goto /tags/`, `goto /`, `goto` the post.

| Step | HEAD `class` | BASE `class` | scroll-behavior (both) | data-theme (both) | Soft (both) |
| --- | --- | --- | --- | --- | --- |
| 1 full load `/` | `null` | `"false"` | auto | light | n/a |
| 2 theme toggle on `/` | `null` | `"false"` | auto | dark | n/a |
| 3 click → post | `"scroll-smooth"` | `"scroll-smooth"` | **smooth** | dark | yes |
| 4 header → `/tags/` | `null` | `"false"` | auto | dark | yes |
| 5 Back → post | `"scroll-smooth"` | `"scroll-smooth"` | **smooth** | dark | yes |
| 5b Forward → `/tags/` | `null` | `"false"` | auto | dark | yes |
| 5c Back → post | `"scroll-smooth"` | `"scroll-smooth"` | smooth | dark | yes |
| 6 reload post (full) | `"scroll-smooth dark"` | `"scroll-smooth dark"` | smooth | dark | n/a |
| 7 goto `/tags/` (full) | `"dark"` | `"false dark"` | auto | dark | n/a |
| 8 goto `/` (full) | `"dark"` | `"false dark"` | auto | dark | n/a |
| 9 goto post (full) | `"scroll-smooth dark"` | `"scroll-smooth dark"` | smooth | dark | n/a |

- **HEAD `false` token.** HEAD never has a `false` class token: not in any step, and not in any of the 139 rAF samples.
- **Dark theme holds everywhere.** After the toggle, `data-theme` is `dark` and the body background is `rgb(33, 39, 55)` on every page, soft and full; light is `rgb(251, 254, 251)`. `localStorage.theme` is `dark`.
- **No light flash during soft navigations.** The rAF sampler captured 139 frames on head and 138 on base across the 5 soft navigations. Every frame had `data-theme=dark` and the dark body background.
- **No light flash on full loads.** On all 4 full loads, both builds already show `data-theme=dark` and the dark background at DOMContentLoaded and at the first rAF. A MutationObserver attached from document creation saw `data-theme` written only as `dark`, first by `toggle-theme.js` at about 11–40 ms.
- **HEAD vs BASE.** After removing the `false` token, every step matches: class tokens, scroll-behavior, data-theme, body background, soft-nav flag, theme-button aria-label, h1, and DCL / first-frame theme and background. **No behavioural difference besides the removed `false` token.**
- Console: 0 errors on either build.

The table also shows that a soft navigation drops the `dark` class token the inline head script adds. That happens on both builds; see the notes at the end.

### R4 404 page (HEAD): PASS

- **Status and render.** `GET http://localhost:4411/this-route-does-not-exist` returns **404** and renders the custom page:
  - `<title>404 Not Found | Novi Fyx</title>`
  - h1 "404" with `aria-label="404 Not Found"`
  - "¡Ay, caramba!" and "Page Not Found"
  - a "Go back home" link (`href="/"`), plus the header (with the theme button) and the footer
- **Head meta.**
  - `<meta name="robots" content="noindex,follow">` is present, exactly once.
  - There is **no** `link[rel=canonical]`, `meta[property=og:url]` or `meta[property=twitter:url]`.
  - `og:title` and `twitter:title` are still present.
  - `<html>` has no class attribute.
- **Go back home.** Clicking it navigates to `/` through ClientRouter: a soft nav with 0 load events and a 200 fetch of `/`.
  - After the head swap, home has canonical, `og:url` and `twitter:url` = `https://www.novifyx.com/`, and no robots meta. The `notFound` branch does not carry over to the next page.
- **Base contrast.** The base 404 has canonical, `og:url` and `twitter:url` = `https://www.novifyx.com/404/`, no robots meta, and `class="false"`. Its Go back home behaves the same (soft nav to `/`).
- Console: the excused main-document 404 message only, 1× head and 1× base. Nothing else.

### R5 Islands smoke and Partytown: PASS (head and base identical)

- **Octoprint carousel.** On `/posts/octoprint-prusa-core-one-raspberry-pi/`, carousel 1 (2 slides) started at "Slide 1 of 2" with scrollLeft 0 and Prev disabled. After a real click on Next it showed "Slide 2 of 2", scrollLeft 734 = clientWidth, Prev enabled and Next disabled. That is exactly one slide.
- **Search.** On `/search/`, the harness waited 300 ms after hydration (the known pre-existing 50 ms caret race), then typed `hiring` with the real keyboard.
  - It showed "Found 5 results for 'hiring'" (5 items) and set `?q=hiring`.
- **Tags filter.** On `/tags/`, typing `engin` narrowed 68 tags to 5, all containing "engin", including `engineering-management`.
- **Partytown.** Clean context; full load of `/`; then 3 real-click ClientRouter navigations: home card → octoprint post, header → `/tags/`, logo → `/`.
  - The sandbox iframe's parent is `<html>` on every page, with 1 sandbox iframe throughout (added 1, removed 0).
  - The iframe loaded once and the sandbox HTML was requested once.
  - The window token is kept across navigations, with 0 full loads.
  - There was **1 gtag.js request** and 1 Partytown worker.
  - Of 105 proxytown requests: 0 failed, 0 returned ≥ 400, and 0 console messages mention proxytown.
- The base run gives identical outcomes: the same slide index, search result list, filtered tags, gtag count and sandbox parents.
- Console: 0 errors on either build.

## Notes (none affect the verdict)

1. **Full-page Next-button flake.** With Playwright `fullPage: true`, the carousel "Next slide" button sometimes renders disabled. It reproduces within a single build. The likely cause is a capture race with the resize that `captureBeyondViewport` performs. `ImageSliderClient.tsx` is unchanged. The tall-viewport method gives 0 px on all 16 full-page pairs.
2. **The `dark` class token is dropped on soft navigation, on both builds.** The inline head script adds `dark` on full loads. ClientRouter's root-attribute swap removes it, because it copies the new document's `<html>` attributes.
   - This is harmless: CSS keys on `data-theme`, which `toggle-theme.js` restores on `astro:after-swap`, and no frame was ever non-dark.
   - This is not new: base behaves identically. On base the swap wrote `class="false"` instead.
3. **Transitional rAF frames.** During soft navigations, the rAF sampler saw 1–2 transitional frames where `location.pathname` had already changed but the `<html>` class still belonged to the previous page (e.g. `/tags/ => scroll-smooth`). Base shows the same pattern with `false`. This is ClientRouter's normal history-before-swap ordering. `data-theme` and the background stayed dark throughout.
4. **Expected network failures.** The only failed requests were the blocked GA hosts (`www.google-analytics.com` and `www.google.com` returning `ERR_NAME_NOT_RESOLVED`). There was also one `googletagmanager.com/td` beacon `ERR_ABORTED` on base R3, caused by a full-load navigation interrupting it. None of these produced a console message.

## Artifacts (this directory)

- `runtime-delta.md`: this report.
- `runtime-delta/rd.mjs.txt`: the harness (final version: R1–R5, `SELFTEST`, `R1_FP_METHOD=pw|tall`).
  - Run: `ONLY=R2,R3,R4,R5 node rd.mjs out.json diff shots`.
  - R1: `ONLY=R1`, optionally with `R1_VIEWPORT=0 R1_FP_METHOD=tall`.
  - The R2–R5 run used the same R2–R5 code before `SELFTEST` and the tall mode were added.
- `runtime-delta/stack.mjs.txt`, `crop.mjs.txt` and `bbox.mjs.txt`: helpers for the diff composites, crops and bounding boxes of differing pixels.
- `runtime-delta/results-R2-R5.json`, `runtime-delta/results-R1-viewport-and-pwfullpage.json` and `runtime-delta/results-R1-tallfullpage-selftest.json`: all checks with evidence, the full console log and failed requests.
- `runtime-delta/r1-viewport-and-pwfullpage.log` and `runtime-delta/r1-tallfullpage-selftest.log`: per-pair R1 logs.
- `runtime-delta/r4-head-404.png`: the head 404 page.
- `diff/runtime-delta-R1.fp.{light,dark}.posts_flutter-google-maps-{embedded-map,static-map}-diff.png`: full-page diff maps from the Playwright `fullPage` attempt. Red marks differing pixels.
- `diff/runtime-delta-R1.fp.*-rerun-diff.png` (3 files): diff maps for the non-zero "repeat head vs repeat base" pairs in the noise-floor table. The raw head/base full-page PNGs were not archived; they are about 1–1.6 MB each and remain only in the session scratch directory (`scratchpad/p3v/runtime-delta-pw/diff/`).
- `diff/runtime-delta-R1.fp.*-crop-head-base-diff.png`: 800×~600 crops stacking head, base and diff for those four pairs.

## Cleanup (done)

- **Build logs** (kept in the scratch directory, outside the worktrees): both show `v22.23.3`, `Result (77 files): 0 errors, 0 warnings, 0 hints` and `[build] Complete!`.
- **Servers.** Stopped with `pnpm astro preview stop` inside each worktree:
  - "Stopped preview server (pid 11059)" on 4411 (head)
  - "Stopped preview server (pid 11091)" on 4412 (base)
- **Ports.** Afterwards `lsof -iTCP:4411 -iTCP:4412 -sTCP:LISTEN` returned nothing, `ps -p 11059,11091` found neither pid, and `curl` to both ports failed to connect.
- **Worktrees.** `git worktree remove --force` was run on `scratchpad/p3v/runtime-delta-head` and `scratchpad/p3v/runtime-delta-base` only. No `git worktree prune` was run.
  - `git worktree list` now shows only the main checkout (`ab5c02d [upgrade/2026-09]`).
  - The `static-delta-*` worktrees had already been removed by their own lane.
- **Main checkout.** Not built in and not modified. The only new files are under `docs/library-packages-upgrade/qa-runs/T-39-2026-09-v4/` (`runtime-delta.md`, `runtime-delta/` and `diff/runtime-delta-*`).
