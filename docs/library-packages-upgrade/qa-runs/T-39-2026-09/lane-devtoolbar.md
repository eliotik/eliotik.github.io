# QA lane: devtoolbar (T-39 Task 8, Step 9)

**Question:** is the T-38 `devToolbar: { enabled: false }` workaround in `astro.config.mjs` still needed on Astro 7.3.4 / Vite 8.3.0?

**DECISION: remove.** With the toolbar enabled, all 9 cold starts were clean against the criteria below: 3 curl-only, 3 Chrome sequential, 3 curl plus Chrome in parallel. There were 0 × 504, 0 failed dynamic imports and 0 console errors.
- Every run hit the same late optimizer re-run (`dependencies optimized: …transitions-*`) that produced the T-38 504s. In Vite 8 that re-run no longer invalidates the already-served toolbar chunks. Each toolbar chunk was fetched under exactly one `?v=` hash per run, and every one returned 200.
- The toolbar loaded on all 5 pages, and all 4 of its apps opened with no errors.
- A positive control shows the detectors do catch a 504 and a "Failed to fetch dynamically imported module".

Environment:
- Repo `/Users/ap/development/other/eliotik.github.io`, branch `upgrade/2026-09`, HEAD `55a65300a2dce56e7c225232ca8c4abb2c7bd5b4`.
- Node v22.23.3 (`.nvmrc`), pnpm 10.33.2, astro 7.3.4, vite 8.3.0, @astrojs/react 7.0.0, react 19.3.0.
- Playwright 1.63.0 driving Google Chrome 153.0.8010.53 (channel `chrome`, headless).
- Dev server on :4322. The shared preview daemon on :4321 (pid 46521) was left running throughout.
- Date: 2026-09-24.

## Pre-registered acceptance criteria

These were written into this file **before** the first toolbar-on run. That was after a harness-validation control run with the toolbar off, and before any toolbar-on data existed.

A toolbar-on cold start is **clean** only if every one of these holds:

1. **C1 No 504s.** Zero responses with status 504, whatever the status text, in both the curl crawl and the Chrome context response listener. Positive-control URLs (`?v=deadbe…`) are excluded.
2. **C2 No dynamic-import errors.** Zero console or pageerror text matching `Failed to fetch dynamically imported module`, `Importing a module script failed` or `UNHANDLED_REJECTION`, from any document, including one being reloaded.
3. **C3 No bad dev.log lines.** `.astro/dev.log` has none of: `optimized dependencies changed. reloading`, `Outdated`, `error while updating dependencies`, `Processing Error`, `Mixed ESM and CJS`.
4. **C4 The race window was open.** `dev.log` contains the late `dependencies optimized: …transitions-*` line. With C3 also holding, this shows the optimizer re-ran while toolbar chunks were in flight and kept their hashes. That is the T-38 window, and it is exercised in every run.
5. **C5 Matches the toolbar-off baseline.**
   - Exactly one buffered `{"type":"full-reload","path":"*"}` at first connect, and no other full-reloads.
   - Zero console errors or warnings. The control had none, so any error or warning is new.
   - All islands hydrated.
6. **C6 The toolbar demonstrably ran.**
   - The entrypoint `/@id/astro/runtime/client/dev-toolbar/entrypoint.js` is in the page HTML.
   - `astro-dev-toolbar` exists with its app buttons on every page.
   - Every app opens with zero errors.
   - Every chunk in the toolbar's `.vite/deps` closure returned 200 to curl and to Chrome.

`requestfailed` `net::ERR_ABORTED` entries inside the baseline reload window are neither 504s nor dynamic-import failures. They would be listed but not counted, and C2 would still apply to any error text they produced. In practice none occurred.

**Decision rule:** `remove` only if all toolbar-on cold starts are clean. Any single failure means `keep`, following the spec's "keep unless proven unnecessary" rule (design §77, §162).

A late `dependencies optimized: …` line alone is not a failure. In Vite 8 that line is printed in both the no-reload branch and the invalidating branch (`logNewlyDiscoveredDeps`). The invalidating branch also prints `optimized dependencies changed. reloading` and calls `fullReload()` (`node_modules/.pnpm/vite@8.3.0…/node_modules/vite/dist/node/chunks/node.js:35276-35330`). C3 checks for that second line.

The toolbar-off control shows the late `transitions-*` discovery on every cold start. A rule that treated that line itself as disqualifying could never reach `remove`, whatever the workaround does, so the criteria target the invalidating branch instead.

## Method

The harness is in `devtoolbar/harness/`: `coldstart.sh`, `crawl.mjs`, `pw.mjs`, `toolbar-closure.mjs` and `analyze.mjs`. Every cold start, via `coldstart.sh <run> <mode>`, did the following:

1. `pnpm astro dev stop`, then wait until :4322 is free (checked with `nc -z`) and confirm `astro dev status` says "No dev server is running".
2. Clear the caches: `rm -rf node_modules/.vite` and delete everything in `.astro/` **except `preview.json` and `preview.log`**. This deliberately deviates from a plain `rm -rf .astro`. Astro 7 keeps the background preview daemon's lock file at `.astro/preview.json` (`astro/dist/core/dev/lockfile.js`, `getLockFileURL` = `.astro/${command}.json`). Deleting it would orphan the shared :4321 daemon, and `astro preview stop` would then report no server. The state after clearing is recorded in each run's `02-cache-cleared.txt`: only `preview.json` and `preview.log` remain, and `node_modules/.vite` is absent.
3. Start the daemon with `pnpm astro dev --port 4322`, run in the background. `package.json` defines `"dev": "astro dev"`, so this is the brief's `pnpm dev` plus only `--port 4322`. The port was moved because :4321 is occupied by the shared preview daemon. Poll the port every 20 ms and fire the clients **the moment it accepts connections**, 1.84–1.87 s after the start command in every run. `dev.json` confirms port 4322 in every run.
4. Run the clients, depending on the mode:
   - **curl** (`crawl.mjs`): every HTTP GET is a spawned `curl`.
     - All 5 pages are requested in parallel at t=0: `/`, `/posts/octoprint-prusa-core-one-raspberry-pi/` (the carousel post, 7 islands), `/search/`, `/posts/flutter-google-maps-address-manipulation/` (the URL where T-38 got the entrypoint 504) and `/posts/flutter-google-maps-embedded-map/` (a second carousel post).
     - Each page's module URLs are requested as soon as the page returns. These are `<script src>`, inline module imports (including `/@id/astro/runtime/client/dev-toolbar/entrypoint.js` and `/@vite/client`), `astro-island` `component-url` / `renderer-url` / `before-hydration-url`, and modulepreload/stylesheet links.
     - Every JS module is then followed recursively through its static and string-literal dynamic imports, each fetched as soon as its parent returns. That covers the toolbar entrypoint's 6 dynamic app chunks and their shared chunks.
   - **seq** (`pw.mjs seq`, headless Chrome): one tab loads `/`, settles 10 s, then loads the other 4 pages with 5 s settles. This is the T-38 D1 navigation pattern. It then returns to `/` and opens and closes every toolbar app.
   - **both**: the curl crawl and `pw.mjs par` run concurrently. `par` opens 5 tabs at once, one per page, and settles 10 s.
5. Chrome instrumentation:
   - Listeners at context level: every response, `requestfailed`, console messages at every level, `pageerror` and `load` events (full document loads).
   - An init script wraps `WebSocket` to log Vite HMR payloads, which is how a `full-reload` and its origin are captured. It also logs `unhandledrejection` and resource `error` events.
   - After loading, each page is inspected for `astro-dev-toolbar` and its shadow-root app buttons, islands and unhydrated islands (`[ssr]`), and resource-timing entries with status ≥ 400.
6. After the clients: settle 3 s, run the positive control, then copy `.astro/dev.log`, identical to `pnpm astro dev logs`. Copy `dev.json` and `_metadata.json`, and enumerate the toolbar's `.vite/deps` closure from the actual files (`toolbar-closure.mjs`).
7. `analyze.mjs` scores each run against C1–C6. C5 requires exactly 1 buffered full-reload in both seq and par modes.

**Runs:**
- Toolbar on: 9 cold starts (`on-curl-1..3`, `on-seq-1..3`, `on-both-1..3`). The brief asks for 3. I did 3 of each client type so that the curl, real-browser and mixed-concurrency paths each got their own 3 cold starts.
- Toolbar off, after the config was restored: 2 cold starts (`off-seq-1`, `off-both-1`), used as the baseline.
- Two earlier toolbar-off harness-validation runs (`ctrl-off-seq`, `ctrl-off-curl`) came before the harness was finished. They are not used for scoring (see Observations).

## Results: toolbar ON

The "Late re-opt" column checks for the late `dependencies optimized: …transitions-*` line (C4). The "Toolbar closure" column counts the toolbar's `.vite/deps` closure files: fetched / all returned 200.

| Run | Client | Requests (status counts) | 504 | Failed dyn import / pageerror | Console err/warn | requestfailed | Vite full-reloads | Late re-opt (C4) | Bad log lines (C3) | Toolbar on pages | Toolbar closure | `?v=` per chunk | Clean |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| on-curl-1 | curl | 67 (200×67) | 0 | n/a | n/a | n/a | n/a | yes | none | entrypoint in 5/5 HTML, `/@id/…entrypoint.js` 200 | 14/14 fetched, all 200 | 1 each | yes |
| on-curl-2 | curl | 67 (200×67) | 0 | n/a | n/a | n/a | n/a | yes | none | 5/5, 200 | 14/14, all 200 | 1 each | yes |
| on-curl-3 | curl | 67 (200×67) | 0 | n/a | n/a | n/a | n/a | yes | none | 5/5, 200 | 14/14, all 200 | 1 each | yes |
| on-seq-1 | Chrome seq | 421 (200×361, 304×60) | 0 | 0 / 0 | 0 | 0 | 1 buffered at 1130 ms | yes | none | 5/5 pages, 4 apps each | 14/14, 200/304 | 1 each | yes |
| on-seq-2 | Chrome seq | 421 (200×361, 304×60) | 0 | 0 / 0 | 0 | 0 | 1 buffered at 1132 ms | yes | none | 5/5, 4 apps | 14/14, 200/304 | 1 each | yes |
| on-seq-3 | Chrome seq | 421 (200×342, 304×79) | 0 | 0 / 0 | 0 | 0 | 1 buffered at 1065 ms | yes | none | 5/5, 4 apps | 14/14, 200/304 | 1 each | yes |
| on-both-1 | curl + Chrome par | curl 67 (200×67); Chrome 370 (200×348, 304×22) | 0 | 0 / 0 | 0 | 0 | 1 buffered (first-connected tab) | yes | none | curl 5/5; Chrome 5/5, 4 apps | 14/14 in both | 1 each (same hashes in curl and Chrome) | yes |
| on-both-2 | curl + Chrome par | curl 67 (200×67); Chrome 365 (200×342, 304×23) | 0 | 0 / 0 | 0 | 0 | 1 buffered | yes | none | 5/5; 5/5, 4 apps | 14/14 in both | 1 each | yes |
| on-both-3 | curl + Chrome par | curl 67 (200×67); Chrome 366 (200×343, 304×23) | 0 | 0 / 0 | 0 | 0 | 1 buffered | yes | none | 5/5; 5/5, 4 apps | 14/14 in both | 1 each | yes |

Other checks:
- **dev.log warn/error lines:** none in any toolbar-on run.
- **Islands:** every page was hydrated in every Chrome run (`unhydrated = 0`): 7 islands on octoprint, 3 on flutter-address, 2 on flutter-embedded, 1 on search, 0 on home.
- **Toolbar apps (seq runs 1–3):** each of `astro:home`, `astro:xray`, `astro:audit` and `astro:settings` got the `active` class and rendered its canvas (2, 2, 3 and 2 shadow children), with **0 errors while the apps were open**. Screenshots:
  - `devtoolbar/runs/on-seq-1/app-astro_audit.png`: the Audit window is open and the toolbar bar is visible at the bottom.
  - `devtoolbar/runs/on-seq-1/app-astro_xray.png`
  - `devtoolbar/runs/on-seq-1/home-seq.png`
- **The toolbar closure** (from the real `.vite/deps` files, identical in all 9 runs) is 14 files:
  - `astro_runtime_client_dev-toolbar_entrypoint__js.js`
  - its 6 dynamic imports: `astro-FHoXtXMg.js`, `audit-BhVuJR6h.js`, `xray-d1X_SF6n.js`, `settings-CwxpV2xH.js`, `toolbar-m3qV4lOF.js`, `ui-library-C6QDP-6v.js`. These are the same modules that returned 504 in T-38 D1.
  - 7 shared chunks: `highlight-*`, `icons-*`, `window-*`, `rolldown-runtime-*`, `astro_n_html-escaper`, `astro_n_aria-query` and `astro_n_axobject-query`.

### Evidence that the T-38 race window was exercised, not dodged

- **curl runs.** Toolbar-chunk requests spanned 668–1651 ms (run 1), 695–1670 ms (run 2) and 713–1704 ms (run 3). The late-discovered `transitions-*` dep requests were held by the optimizer from 1562 to 1792 ms, from 1607 to 1842 ms and from 1628 to 1848 ms. In each run the toolbar fetches straddle the start of the optimizer re-run. The re-run finished after the toolbar chunks had been served, and `dev.log` then printed `dependencies optimized: astro/virtual-modules/transitions-events.js, …transitions-router.js, …transitions-swap-functions.js, …transitions-types.js`.
- **Chrome seq runs.** The first document of `/` fetched all 14 toolbar files at about 1.13 s. The buffered `full-reload` then reloaded it, and the second document refetched all 14 at about 1.26 s. The late re-opt happened between these (`[200] / 77ms`, `[200] / 4ms`, then `dependencies optimized: …`). Both fetches used **the same `?v=` hashes** and returned 200. In T-38, this re-run changed the hash and the refetch got `504 Outdated Optimize Dep`.
- **Hash stability.** In every run each of the 14 closure files was requested under exactly one `?v=` value. That is 0 files with more than one hash, in curl and in Chrome. The late `transitions-*` deps got their own separate hash. This matches Vite 8's no-reload branch: `newData.optimized[dep].browserHash = (metadata.optimized[dep] || metadata.discovered[dep]).browserHash`, `node.js:35282-35285`.

### Positive controls (the detectors can see a failure)

- **curl, every run:** `GET /node_modules/.vite/deps/react.js?v=deadbeef` returned **504**. The same file at the hash actually served in that run returned 200. Examples: `?v=4f1ab0cf` → 200 (on-curl-1), `?v=82165a33` → 200 (on-curl-2).
- **Chrome, every run:** `fetch('/node_modules/.vite/deps/react.js?v=deadbeef')` returned **504 "Outdated Optimize Dep"**. `import('/node_modules/.vite/deps/react.js?v=deadbe01')` threw **"Failed to fetch dynamically imported module: http://localhost:4322/node_modules/.vite/deps/react.js?v=deadbe01"**. The context response listener recorded both 504s. The console showed `Failed to load resource: the server responded with a status of 504 (Outdated Optimize Dep)` twice. These control entries are excluded from the tallies above.

## Results: toolbar OFF (baseline, config restored)

| Run | Client | Requests | 504 | Errors | Vite full-reloads | Late re-opt | Toolbar |
|---|---|---|---|---|---|---|---|
| off-seq-1 | Chrome seq | 310 (200×279, 304×31) | 0 | 0 console / 0 pageerror / 0 requestfailed | 1 buffered at 1085 ms | yes, same `transitions-*` line | not rendered (as configured) |
| off-both-1 | curl + Chrome par | curl 52 (200×52); Chrome 284 (200×263, 304×21) | 0 | 0 | 1 buffered (first-connected tab) | yes | entrypoint in 0/5 HTML |

The toolbar-on runs match this baseline exactly apart from the toolbar itself:
- the same single buffered reload,
- the same late re-opt,
- zero errors both ways,
- the extra modules on each page load, which are the toolbar's own: the `/@id/` entrypoint plus the 14 closure files.

**Mechanism (supporting, not replacing, the runs):**
- Astro 7.3.4 unconditionally adds the toolbar to the client environment's `optimizeDeps.include` (`astro/dist/vite-plugin-environment/index.js:62-78`: `"astro > html-escaper"`, `"astro/runtime/client/dev-toolbar/entrypoint.js"`). The source comment there (line 74) says the purpose is to avoid "late re-optimization that 504s already-served modules like the dev toolbar".
- **The toolbar was in the *first* optimize in every run.** Two pieces of evidence show this:
  - The late `dependencies optimized: …` line lists only the 4 `transitions-*` deps. That line names only deps that were not already optimized, so the toolbar entrypoint and its closure were already in the initial set.
  - Every toolbar chunk was served under one stable `?v=` hash from its first fetch onward, both before and after that re-run. The first fetches came 0.67–0.71 s after client start in the curl runs and 1.07–1.13 s after client start in the Chrome seq runs, where client start includes launching the browser.
  - The on-disk `_metadata.json` is **not** evidence of the initial set. It is rewritten when the late re-run commits, and its on-disk `browserHash` differs from the in-memory one after a no-reload re-run, as shown in the harness-validation run.
- The toolbar-off `_metadata.json` also lists `astro/runtime/client/dev-toolbar/entrypoint.js` with the same 14-file closure. So `enabled: false` does not change what the optimizer bundles; it only stops the browser from requesting it.
- The toolbar is pre-bundled in the first optimize. Vite 8 does not reload when a late discovery leaves existing file hashes unchanged, and it keeps existing `browserHash` values. So the late `transitions-*` discovery no longer invalidates the toolbar's chunks.
- The project's own top-level `vite.optimizeDeps.include` (`fuse.js`, `react`, `react-dom`) sits alongside Astro's toolbar include rather than replacing it. The final `_metadata.json` lists both, and the late re-run line lists neither, so both were in the initial optimize.

## Recommended change (for the controller to implement; not committed by this lane)

Remove the T-38 block from `astro.config.mjs` (lines 20–23 at HEAD `55a6530`):

```js
  // T-38 D1: dev-toolbar dynamic imports race with Vite optimizer
  // on cold start in 6.2.x. Disabling eliminates 504s entirely.
  // Production unaffected (toolbar is dev-only).
  devToolbar: { enabled: false },
```

Astro 7.3.4's default is `devToolbar.enabled: true` (`astro/dist/core/config/schemas/defaults.js:26-28`). Removing the block is therefore behaviourally identical to the `enabled: true` configuration tested here. The production build is unaffected either way, because the toolbar is dev-only.

## Observations (not failures)

1. **A buffered full-reload happens on the first cold connect, in both configs.** On every cold start, the first browser client to connect gets `{"type":"full-reload","path":"*"}` about 1 ms after `[vite] connected`. `dev.log` shows `[200] /` twice. The payload has no `triggeredBy`.
   - This fits Vite's WebSocket layer buffering a `full-reload` that was sent before any client was connected, then delivering it to the first client that connects (`node.js:24162-24168` and `24137-24139`). A plausible sender is the `.astro/` regeneration after the cache clear.
   - I did not identify the sender.
   - It is identical with the toolbar off (off-seq-1: 1085 ms; the earlier ctrl-off-seq: 1170 ms), so it does not bear on the decision.
   - In `par` mode only the first-connected tab gets it.
   - It caused no aborted requests (`requestfailed` = 0 in every run).
2. **Vite 8 wording changed.** The late-discovery line is now `dependencies optimized: …`, without the old "✨ new dependencies optimized". The invalidating case prints `optimized dependencies changed. reloading`. `grep "new dependencies optimized"` alone would miss the Vite 8 line. The QA criteria use the Vite 8 strings.
3. **Harness-validation runs.** Two toolbar-off runs before the harness was finished:
   - `ctrl-off-curl` recorded one crawler false positive: `404 /node_modules/.vite/deps/MyComponent`, plus a matching Vite `warn` "The file does not exist at …/deps/MyComponent". The regex had picked up an `import MyComponent from './MyComponent'` string inside a minified dep bundle. After that I restricted the crawler to `.js`/`.mjs` specifiers inside `.vite/deps`, and no such request appeared in any scored run.
   - The first `ctrl-off-seq` showed that `_metadata.json`'s on-disk `browserHash` is not the hash served in memory after a no-reload re-run. The harness therefore takes the "served hash" control URL from the crawl, not from `_metadata.json`.
   - Neither run is used for scoring, and they are not copied into the repo.
4. **Toolbar Audit finding, dev-only and unrelated to the workaround.** On `/` the Audit app reports 1 accessibility item: `iframe` "Required attributes missing" (see `app-astro_audit.png`). I did not identify the iframe. The served HTML of `/` contains no `<iframe>` tag (`curl http://localhost:4321/ | grep '<iframe'` finds nothing), so it is injected at runtime. The Partytown sandbox iframe is a plausible source, but that is unverified. The toolbar was disabled throughout T-38 to T-39, so this finding may simply not have been visible before.
5. **Scope.** The Partytown service-worker `TypeError` that other lanes (R20) saw on the `astro preview` server did **not** appear in `astro dev` on :4322, with the toolbar on or off: 0 console errors in all 8 scored Chrome runs (6 toolbar-on, 2 toolbar-off).

## End state (verified)

- **Config:** `astro.config.mjs` was restored from the scratch backup while no dev server was running. sha256 `17f877accc56571802dd9afb6f61a025926c3875b9130ab40d4750fef2773d12` matches the pre-edit backup, and `git diff --exit-code astro.config.mjs` exits 0. Line 23 reads `devToolbar: { enabled: false },` again.
- **Dev daemon:** stopped (`Stopped dev server (pid 37385)`), `astro dev status` reports "No dev server is running", and :4322 is free.
- **Caches:** `node_modules/.vite` is absent. `.astro/` holds only `preview.json` and `preview.log`, preserved on purpose. `dist/` was not touched.
- **Shared preview:** still running (`Preview server running at http://localhost:4321 (pid 46521, …, background)`), and `GET http://localhost:4321/` returns 200.
- **Git:** `git status --short` shows only the pre-existing `?? .claude/`, `?? .serena/` and this lane's untracked `docs/library-packages-upgrade/qa-runs/T-39-2026-09/` artifacts. Nothing was staged or committed.

## Artifacts

All under `docs/library-packages-upgrade/qa-runs/T-39-2026-09/devtoolbar/`:
- `analysis-on.json` and `analysis-off.json`: the per-run criteria scoring.
- `harness/`: `coldstart.sh`, `crawl.mjs`, `pw.mjs`, `toolbar-closure.mjs`, `analyze.mjs`.
- `runs/<run>/`, one folder per run, each with:
  - `00-meta.txt`: the config line, timings, positive control and closure summary
  - `02-cache-cleared.txt`
  - `03-start-cmd.txt`
  - `04-log-signals.txt`
  - `dev.log`
  - `dev.json`
  - `vite-deps-metadata.json`
  - `toolbar-closure.json`
  - `curl.json` and `curl-summary.json` (curl modes)
  - `chrome-seq.json` or `chrome-par.json`, with every response, console message, docLoad and Vite WS payload, plus its summary
  - PNG screenshots, in `on-seq-1` only
