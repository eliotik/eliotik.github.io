# End-to-End Verification Report

**Date:** 2026-04-30T12:58:00Z
**Operator:** claude-sonnet-4-6 (T-30 dev agent / self-validator per plan §1.4)
**Commit verified:** bdb9350b44e62e58344bd607030a38fcb23248a5
**Stack snapshot:**
- Node 22.22.2 (lts/jod)
- pnpm 10.33.2
- Astro 6.1.10
- React 19.2.5
- Tailwind 4.2.4
- ESLint 9.39.4 (flat config)
- TypeScript 6.0.3
- Husky 9.1.7
- sharp 0.34.5
- satori 0.26.0
- jampack 0.34.1

---

## 1. Verification protocol results

### 1.1 pnpm install --frozen-lockfile

```
Lockfile is up to date, resolution step is skipped
Progress: resolved 1, reused 0, downloaded 0, added 0
Packages: +936
Progress: resolved 936, reused 936, downloaded 0, added 936, done

dependencies:
+ astro 6.1.10
+ @astrojs/react 5.0.4
+ tailwindcss 4.2.4
+ react 19.2.5
+ react-dom 19.2.5
+ sharp 0.34.5
+ satori 0.26.0
... (936 packages total)

devDependencies:
+ eslint 9.39.4
+ typescript 6.0.3
+ husky 9.1.7
+ @divriots/jampack 0.34.1

> eliotik.github.io@0.0.1 prepare
> husky install

husky - install command is DEPRECATED
Done in 3.1s using pnpm v10.33.2
```

Result: ✅ PASS (exit 0, 936 packages installed, lockfile unchanged)

Note: The `husky install` deprecation warning is pre-existing (Husky v9 emits this from a lifecycle hook; it does not affect functionality).

---

### 1.2 pnpm astro check

```
08:56:35 [content] Syncing content
08:56:35 [content] Synced content
08:56:35 [types] Generated 718ms
08:56:35 [check] Getting diagnostics for Astro files in ...

src/content.config.ts:2:39 - warning ts(6385): 'z' is deprecated.
src/content.config.ts:8:9  - warning ts(6385): 'z' is deprecated.
... (22 more 'z' deprecation hints from astro:content re-export)

src/components/Search.tsx:29:36 - warning ts(6385): 'FormEvent' is deprecated.

Result (76 files):
- 0 errors
- 0 warnings
- 23 hints
```

Result: ✅ PASS (0 errors, 0 warnings; 23 hints are pre-existing deprecation notices for `z` re-export from `astro:content` and React's `FormEvent` — both are informational TypeScript ts(6385) hints, not errors)

---

### 1.3 pnpm lint

```
> eliotik.github.io@0.0.1 lint
> eslint .
```

Result: ✅ PASS (exit 0, no output = no lint errors)

---

### 1.4 pnpm build

```
> astro check && astro build && jampack ./dist

08:56:53 [check] Result (76 files): 0 errors, 0 warnings, 23 hints
08:56:57 [build] output: "static"
08:56:57 [build] mode: "static"
08:56:57 [build] directory: .../dist/
08:56:57 [build] Building static entrypoints...
08:56:59 [vite] ✓ built in 2.03s
08:57:07 ✓ Completed in 7.65s.
08:57:10 [build] ✓ Completed in 12.40s.
08:57:10 [build] 118 page(s) built in 12.64s
08:57:10 [build] Complete!

 __                                    __
|__|____    _____ ___________    ____ |  | __
|  \__  \  /     \\____ \__  \ _/ ___\|  |/ /
...
 v0.34.1 by <div>RIOTS

 PASS 1 - Optimizing
▶ 404.html      ✔ <img> [0/0]  ✔ <meta[property$=":image"]> [2/2]
▶ index.html    ✔ <img> [0/0]  ✔ <meta[property$=":image"]> [2/2]
... (120 HTML files, 39 WebP, 65 PNG, 13 JS, etc.)
Done: 15.842s

 PASS 2 - Compressing the rest
- 33 files | 9.18 MB → 8.81 MB | -375.37 KB
✔ 262 files | 46.44 MB → 43.92 MB | -2.52 MB
Done: 3.466s

 Summary
╔════════╤════════════╤═══════════╤════════════╤════════════╗
║ Action │ Compressed │  Original │ Compressed │       Gain ║
╟────────┼────────────┼───────────┼────────────┼────────────╢
║ .webp  │    27 / 39 │  15.33 MB │   14.97 MB │ -375.37 KB ║
║ .html  │  118 / 120 │   4.57 MB │    4.32 MB │ -250.61 KB ║
║ .js    │     9 / 13 │ 343.01 KB │  341.13 KB │   -1.88 KB ║
║ .svg   │      1 / 1 │  873.00 B │   787.00 B │   -86.00 B ║
║ .png   │    45 / 65 │  15.81 MB │   13.93 MB │   -1.88 MB ║
║ .jpg   │      1 / 7 │   3.19 MB │    3.17 MB │  -23.69 KB ║
║ .txt   │      0 / 1 │  167.00 B │   167.00 B │            ║
║ .xml   │      0 / 7 │  31.22 KB │   31.22 KB │            ║
║ .gif   │      0 / 6 │   7.05 MB │    7.05 MB │            ║
║ .css   │      0 / 2 │ 117.76 KB │  117.76 KB │            ║
╟────────┼────────────┼───────────┼────────────┼────────────╢
║ Total  │  201 / 262 │  46.44 MB │   43.92 MB │   -2.52 MB ║
╚════════╧════════════╧═══════════╧════════════╧════════════╝

 ✔ No issues
```

Result: ✅ PASS (118 pages built, jampack reports no issues, net -2.52 MB optimization)

Warnings noted (non-blocking):
- `[WARN] [router] The route "/posts/1" is defined in both "/posts/1" and "/posts/1/"` — pre-existing pagination trailing-slash conflict. Astro uses the higher-priority route and continues; does not affect output. Pre-existing since T-20.
- Same for `/tips/1`. Both are informational warnings, not errors.

---

### 1.5 Dev server smoke

Dev server started on port 4330 (Astro 6.1.10 dev mode, Node 22.22.2).

- `/` → HTTP 200 ✅ (valid HTML, Astro v6.1.10 generator meta, theme toggle script present)
- `/rss.xml` → HTTP 200 ✅ (valid RSS 2.0 XML, 32 items, all with proper `<guid>` and `<link>`)
- `/sitemap-index.xml` → HTTP 200 ✅ (valid XML, 5 sub-sitemaps: pages, posts, tips, threads, tags)

---

### 1.6 pnpm audit --prod

```
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ high                │ Picomatch has a ReDoS vulnerability via extglob        │
│                     │ quantifiers                                            │
│ Package             │ picomatch                                              │
│ Vulnerable versions │ <2.3.2                                                 │
│ Patched versions    │ >=2.3.2                                                │
│ Paths               │ .>astro>unstorage>anymatch>picomatch                   │
│ More info           │ https://github.com/advisories/GHSA-c2c7-rcm5-vvqj      │
└─────────────────────┴────────────────────────────────────────────────────────┘
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ moderate            │ mdast-util-to-hast has unsanitized class attribute     │
│ Package             │ mdast-util-to-hast                                     │
│ Vulnerable versions │ >=13.0.0 <13.2.1                                       │
│ Patched versions    │ >=13.2.1                                               │
│ Paths               │ .>@astrojs/mdx>@astrojs/markdown-remark>remark-        │
│                     │ rehype>mdast-util-to-hast                              │
│ More info           │ https://github.com/advisories/GHSA-4fh9-h7wg-q85m      │
└─────────────────────┴────────────────────────────────────────────────────────┘
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ moderate            │ Picomatch: Method Injection in POSIX Character Classes │
│ Package             │ picomatch                                              │
│ Vulnerable versions │ <2.3.2                                                 │
│ Patched versions    │ >=2.3.2                                                │
│ Paths               │ .>astro>unstorage>anymatch>picomatch                   │
│ More info           │ https://github.com/advisories/GHSA-3v7f-55p6-f55p      │
└─────────────────────┴────────────────────────────────────────────────────────┘
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ moderate            │ yaml is vulnerable to Stack Overflow via deeply nested │
│                     │ YAML collections                                       │
│ Package             │ yaml                                                   │
│ Vulnerable versions │ >=2.0.0 <2.8.3                                         │
│ Patched versions    │ >=2.8.3                                                │
│ Paths               │ .>@astrojs/check>@astrojs/language-server>volar-       │
│                     │ service-yaml>yaml-language-server>yaml                 │
│ More info           │ https://github.com/advisories/GHSA-48c2-rrv3-qjmp      │
└─────────────────────┴────────────────────────────────────────────────────────┘
4 vulnerabilities found
Severity: 3 moderate | 1 high
```

Result: ✅ PASS — 4 vulnerabilities vs. pre-upgrade baseline of 93 (yarn 1 baseline). Improvement: 93 → 4.

All 4 are transitive dependencies locked by Astro 6.1.10's own dependency graph:
- **picomatch** (2 advisories): locked by `astro>unstorage>anymatch`. Not directly controllable without Astro releasing an update. Build-time only, not user-facing.
- **mdast-util-to-hast**: locked by `@astrojs/mdx>@astrojs/markdown-remark>remark-rehype`. Static-site generator — class attributes are rendered at build time, not runtime user input.
- **yaml**: locked by `@astrojs/check>@astrojs/language-server>volar-service-yaml>yaml-language-server`. Dev-only tooling (type checker), not in production bundle.

None are from flowbite, flowbite-react, React 18, Tailwind 3, or ESLint 8 — all campaign targets removed.

---

## 2. Visual diff summary

Captures at: `docs/library-packages-upgrade/qa-runs/T-30-20260430T125829Z/visual/`
Baseline at: `docs/library-packages-upgrade/baseline/`
Method: Python 3 + Pillow pixel diff (threshold: channel delta > 10)
Viewport: 1280×1800, deviceScaleFactor=1, viewport-mode (not fullpage)

| # | Route | Baseline | Current | Diff % | Status | Notes |
|---|---|---|---|---|---|---|
| 1 | `/` | `baseline/01-home.png` | `qa-runs/T-30-20260430T125829Z/visual/01-home.png` | 0.25% | ✅ match | Sub-pixel anti-aliasing only |
| 2 | `/posts` | `baseline/02-posts-index.png` | `qa-runs/T-30-20260430T125829Z/visual/02-posts-index.png` | 0.26% | ✅ match | Sub-pixel anti-aliasing only |
| 3 | `/posts/ems-connecting-the-systems` | `baseline/03-post-with-images.png` | `qa-runs/T-30-20260430T125829Z/visual/03-post-with-images.png` | 0.25% | ✅ match | Sub-pixel anti-aliasing only |
| 4 | `/posts/flutter-google-maps-embedded-map` | `baseline/04-post-with-carousel.png` | `qa-runs/T-30-20260430T125829Z/visual/04-post-with-carousel.png` | 1.46% | ✅ minor diff (acceptable) | CSS scroll-snap carousel (T-10) replaces flowbite arrows; documented tolerance ~14%; actual 1.46% is well within tolerance |
| 5 | `/tips` | `baseline/05-tips-index.png` | `qa-runs/T-30-20260430T125829Z/visual/05-tips-index.png` | 0.27% | ✅ match | Sub-pixel anti-aliasing only |
| 6 | `/tags` | `baseline/06-tags-index.png` | `qa-runs/T-30-20260430T125829Z/visual/06-tags-index.png` | 0.27% | ✅ match | Sub-pixel anti-aliasing only |
| 7 | `/tags/engineering-management` | `baseline/07-tag-detail.png` | `qa-runs/T-30-20260430T125829Z/visual/07-tag-detail.png` | 0.37% | ✅ match | Sub-pixel anti-aliasing only |
| 8 | `/threads` | `baseline/08-threads-index.png` | `qa-runs/T-30-20260430T125829Z/visual/08-threads-index.png` | 0.26% | ✅ match | Sub-pixel anti-aliasing only |
| 9 | `/about` | `baseline/09-about.png` | `qa-runs/T-30-20260430T125829Z/visual/09-about.png` | 0.34% | ✅ match | Sub-pixel anti-aliasing only |
| 10 | `/this-route-doesnt-exist` | `baseline/10-404.png` | `qa-runs/T-30-20260430T125829Z/visual/10-404.png` | 0.25% | ✅ match | Sub-pixel anti-aliasing only |

**Summary:** 9/10 routes show <0.5% diff (sub-pixel anti-aliasing only). Route 4 (carousel post) shows 1.46% diff — within the documented ~14% tolerance from T-10's flowbite-removal. No layout shifts, missing images, broken theming, or missing components detected. All 10 screenshots are at 1280×1800 matching baseline dimensions.

---

## 3. Interactive smoke

All tests run against the dev server at `http://localhost:4330` (Astro 6.1.10, Node 22.22.2).

### 3.1 Theme toggle

- **Test:** Click `#theme-btn` on `/`
- **Result:** `data-theme` attribute on `<html>` toggles between `light` and `dark`. `localStorage.theme` is updated on each click.
- **Persistence test:** After toggling to dark, navigating back to `/` — `data-theme="dark"` is already set by the inline pre-paint script before any React hydration (no FOUC).
- **Status:** ✅ PASS

### 3.2 Search component (Fuse.js)

- **Test:** Navigate to `/search`, type "flutter" in the search input
- **Result:** 5 results appeared in the DOM — `/posts/flutter-google-maps-setup`, `/posts/flutter-google-maps-static-map`, `/posts/flutter-google-maps-embedded-map`, `/posts/flutter-google-maps-address-manipulation`, `/posts/flutter-building-number-picker`
- **Status:** ✅ PASS

### 3.3 TagsList filter

- **Test:** Navigate to `/tags`, type "flutter" in the filter input
- **Result:** Tag list filtered from 63 tags to 1 (`/tags/flutter/`). React state update triggered correctly.
- **Status:** ✅ PASS

### 3.4 Carousel scroll-snap

- **Test:** Navigate to `/posts/flutter-google-maps-embedded-map`
- **Result:** 2 scroll-snap container elements found (CSS `scroll-snap-type` applied). 7 slide image links present, all with `target="_blank"` (clicking opens in new tab). The CSS-only carousel (T-10) is functional.
- **Status:** ✅ PASS

### 3.5 Header horizontal nav (Tailwind 4 cascade-layer fix from T-22 D1)

- **Test:** Inspect computed style and bounding rects of nav links on `/`
- **Result:** Nav `flex-direction: row`, all 6 nav links at `top ≈ 36px` (uniform — confirming single horizontal row). T-22 D1 cascade-layer fix is in effect.
- **Status:** ✅ PASS

---

## 4. Success criteria check (design §1)

- [x] **1. `pnpm install --frozen-lockfile` succeeds** — ✅ exit 0, 936 packages, lockfile unchanged
- [x] **2. `pnpm astro check` reports zero errors** — ✅ 0 errors, 0 warnings, 23 hints (pre-existing deprecation notices)
- [x] **3. `pnpm lint` passes** — ✅ exit 0
- [x] **4. `pnpm build` produces `dist/` with no broken assets** — ✅ 118 pages built, jampack ✔ No issues
- [x] **5. Local dev server renders correctly on the 9 routes** — ✅ All 10 routes render, pixel diffs <1.5%
- [x] **6. Dark/light theme toggle works without FOUC** — ✅ Inline pre-paint script sets theme before React hydration; `data-theme` persists across navigation
- [x] **7. RSS feed (`/rss.xml`) and sitemap (`/sitemap-index.xml`) build successfully** — ✅ Both return HTTP 200 with valid XML
- [ ] **8. GitHub Pages deploy succeeds on `main`** — DEFERRED to T-31 (out of scope for T-30 per plan §1.4)

**Criteria 1–7: all ✅ PASS**

---

## 5. Risks accepted

1. **4 audit vulnerabilities (3 moderate, 1 high):** All are transitive dependencies locked by Astro 6.1.10's dependency graph (`unstorage>anymatch>picomatch`, `@astrojs/mdx>remark-rehype>mdast-util-to-hast`, `@astrojs/check` dev-only chain). None are in the removed packages (flowbite/flowbite-react). None are user-facing runtime code. Accepted as pre-existing transitive exposure; fixes require upstream Astro releases. T-24 cleared all flowbite CVEs as planned.

2. **Router collision warnings for `/posts/1` and `/tips/1`:** Astro reports `[WARN] [router] The route "/posts/1" is defined in both "/posts/1" and "/posts/1/"` — pre-existing since T-20 due to trailing-slash pagination behavior. Astro uses the higher-priority route; no pages are missing from the `dist/` output. This will become a hard error in a future Astro version; flagged as separate triage.

3. **23 `astro check` hints:** Deprecation notices for `z` re-export from `astro:content` (Zod will be separate package) and `React.FormEvent` (deprecated in React 19 type definitions). Neither is a runtime error; both are pre-existing patterns from T-20 and T-21 respectively. Flagged as separate triage outside this campaign.

4. **Husky `install` deprecation warning during `pnpm install`:** Husky v9.1.7 emits this from the `prepare` lifecycle script; the hook still functions. A follow-up to remove the `prepare: husky install` script entry is documented in T-14's justification.

---

## 6. Open follow-ups

- **T-31:** GitHub Pages deploy + live smoke (criterion 8).
- **Optional triage:** Router trailing-slash collision for paginated routes (`/posts/1`, `/tips/1`).
- **Optional triage:** Replace `z` re-export usage with `import { z } from 'zod'` in `src/content.config.ts`.
- **Optional triage:** `React.FormEvent` deprecation in `src/components/Search.tsx`.
- **Optional triage:** Remove `prepare: husky install` from `package.json`.

---

## 7. Decision

**PASS** — All 7 success criteria (design §1) verified on commit `bdb9350b44e62e58344bd607030a38fcb23248a5`. Visual diffs are within tolerance across all 10 routes. Interactive smoke (theme toggle, search, tags filter, carousel, header nav) all pass. Security audit improved from 93 to 4 vulnerabilities.

**→ Proceed to T-31 (GitHub Pages deploy & live smoke).**

---

## Production deploy attempt (T-31) — BLOCKED

**Date:** 2026-04-29T00:00:00Z
**Operator:** claude-sonnet-4-6 (T-31 agent)
**Pushed commit:** 5cc9182 (main HEAD, 110 commits ahead of prior origin/main at cde32ad)
**Workflow run:** https://github.com/eliotik/eliotik.github.io/actions/runs/25214297859
**Workflow conclusion:** failure

### Pre-deploy sanity (local) — all PASS

- `pnpm install --frozen-lockfile` — exit 0, Done in 1s using pnpm v10.33.2
- `pnpm astro check` — 0 errors, 0 warnings, 0 hints (76 files)
- `pnpm build` — 118 pages built; jampack ✔ No issues, net -2.49 MB

### Failure

The GH Pages deploy workflow failed at the `build` job step "Install, build, and upload your site" (`withastro/action@v6`):

```
Error: Multiple versions of pnpm specified:
  - version latest in the GitHub Action config with the key "version"
  - version pnpm@10.33.2 in the package.json with the key "packageManager"
Remove one of these versions to avoid version mismatch errors like ERR_PNPM_BAD_PM_VERSION
build: .github#86
```

### Root cause

`withastro/action@v6` (bumped from `@v3` by T-27) introduced strict validation that rejects a conflict between:
- The `package-manager: pnpm@latest` input in `.github/workflows/deploy.yml`
- The `"packageManager": "pnpm@10.33.2"` field in `package.json` (set by T-03)

`withastro/action@v3` silently accepted `pnpm@latest`. `@v6` treats the conflict as a fatal error.

### Status

BLOCKED — defect filed at `docs/library-packages-upgrade/defects/T-31-D1.md`.

T-31 `status: defect`. Awaiting fix task to pin `.github/workflows/deploy.yml` `package-manager` to `pnpm@10.33.2` (or remove the input to let the action auto-detect from `package.json`), then re-run T-31.

Success criterion 8 (GH Pages deploy) is **not yet verified**.
