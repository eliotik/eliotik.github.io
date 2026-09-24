# End-to-End Verification Report: September 2026 upgrade (T-39, Task 8)

This file holds five runs of Task 8 (spec §5.2, final local verification):

- **v5** (top) verifies `81d6e77`, the trailing-slash URL fix (Task 22). It is a delta verification against v4 and is the verification of record.
- **v4** verifies `ab5c02d`, the tree after the Phase 3 fixes (Tasks 18-21). It is a delta verification against v3: it proves that the built site differs from `9eb1ec3` only by the intended changes, verifies each change directly, and carries v3's other results forward.
- **v3** verified `9eb1ec3`, after Tasks 17, 17b and 17c. It is kept unchanged as history, apart from its heading and one added line under its verdict.
- **v2** verified `63efd08`, before Task 17. It is kept unchanged as history, apart from its heading and one added line under its verdict.
- **v1** (bottom) verified `55a6530`, before Task 8b and Phase 2. It is kept unchanged as history, with one added line under its verdict.

Section references (§) inside each part point to that part's own sections. v4 cites v3's sections as "v3 §n".

---

## v5 — trailing-slash delta (commit 81d6e77)

**Date:** 2026-09-24. **Operator:** the Task 22 Opus QA gate (claude-opus-5-5), summarised by the controller. **Compared against:** `6d55212` (the v4-verified code tree `ab5c02d` plus the v4 report commit), built in a scratch worktree.

**What changed (Task 22, `81d6e77`).**
- Tag pages declared `/tags/<tag>` (no slash) as `canonical`, `og:url` and `twitter:url`, while the sitemap and GitHub Pages use `/tags/<tag>/`.
- 121 internal links pointed at no-slash URLs, which 301 on GitHub Pages: breadcrumbs, posts/tag pagination, Thread post links, the home "All Posts" link, and 3 in-content links in `two-books-which-influenced-my-hiring-pipeline.md`.
- The `/posts/1/` and `/tips/1/` redirect stubs targeted `/posts` and `/tips`.
- Search result links (client-rendered) gain the slash as well.
- Layout's default canonical now always ends in `/` for page paths.

| Check | Result | Evidence |
|---|---|---|
| Trailing-slash audit (canonical, og:url, twitter:url, meta-refresh target, internal hrefs) | PASS | Before, on `6d55212`: href 121, canonical 78, og:url 76, twitter:url 76, refresh 2. After: 0 of every kind. |
| Whole-site diff vs `6d55212` | PASS | 362 files on both sides. CSS, images, robots.txt, rss.xml, the 5 urlset sitemaps and 12 of 13 JS files are byte-identical. The Search bundle differs by exactly one inserted `/` (renamed by its content hash). In HTML, every changed attribute is the old value plus `/`: a[href] 121, canonical 78, og:url 76, twitter:url 76, refresh 2. The stub `<title>`/`<code>` text shows the new target. Island uids differ with the build path only. There are no other differences. |
| Canonical ↔ sitemap consistency | PASS | 112 indexable pages have 112 self-canonicals, equal as a set to the 112 urlset `<loc>` entries (0 in either difference); all end in `/` and map to `dist/<path>/index.html`. Before the fix, 68 tag canonicals did not match. |
| Link integrity | PASS | All 2706 internal a/link hrefs across 130 HTML files resolve. None is unresolved, and no page link lacks the trailing slash. |
| Runtime (Chrome 153, clean profile) | PASS | 21 ClientRouter click steps: breadcrumbs, tag and posts pagination, All Posts, a thread post link, and search typing plus result clicks. All were soft navigations to trailing-slash URLs with 200 and no redirect, islands hydrated, and there were 0 console or page errors. `/posts/1/` and `/tips/1/` refresh to `/posts/` and `/tips/`. |
| Pixel diff vs `6d55212` | PASS | 18/18 full-page comparisons are 0 px: `/`, `/posts/`, `/posts/2/`, `/tags/`, `/tags/leadership/`, `/tags/leadership/2/`, 2 thread pages and `/search/?q=hiring`, each in light and dark. |
| Gate | PASS | install `--frozen-lockfile`, astro check 0/0/0, lint, format:check and build all exit 0. The peer check shows only the baseline jampack→quicklink entry. |

**Observations.**
- Pre-existing, unchanged: Astro's redirect stubs have no `<link rel="icon">` and the site ships no `/favicon.ico`, so Chrome may log a `/favicon.ico` 404 before the 0-second refresh leaves a stub. Identical on `6d55212`.
- One blog content file changed, as stated above: only 3 link targets, with 0 rendered pixels changed.

**Carry-forward.** The diff above confirms that the only changes are URL attribute values plus one character in the Search bundle, so v4's (and through it v3's) results for rendering, islands, cross-browser behaviour, Partytown and the gate still hold.

**Overall: PASS**

---

## v4 — Phase 3 delta (commit ab5c02d687e5266ad122db3a37de873ca385a991)

**Date:** 2026-09-24, UTC. The static-delta lane ran from 21:46Z to 22:01Z. The runtime-delta harness runs are timestamped from 21:55:45Z (R2-R5) to 22:13:46Z (tall full-page R1 and the self-test), per the `meta` field of each result JSON. This report was written at 22:23Z.
**Operator:** claude-opus-5-5, the T-39 Phase 3 delta QA report writer. Phase 3 (Tasks 18-21) fixed four pre-existing site defects that v3 recorded in its §10. v4 does not re-run the whole of Task 8. It proves that the built site at `ab5c02d` differs from the v3-verified tree only by the intended deltas, then verifies each delta directly. Two lanes produced the results:
- **static-delta**: the gate, a whole-site `dist/` diff, link integrity, sitemaps and SEO heads.
- **runtime-delta**: pixel diff, real-click navigation, theme and `<html>` class through ClientRouter, the 404 page, and islands and Partytown, in headless Chrome.

**Commit verified:** `ab5c02d687e5266ad122db3a37de873ca385a991` on branch `upgrade/2026-09`.
**Reference:** `9eb1ec391aedca5a7ad615f37d53568f0a0f2aa0`, verified by v3 (below) with Overall PASS. Each lane built both trees from scratch in its own detached scratch worktrees: Node v22.23.3, pnpm 10.34.5, `pnpm install --frozen-lockfile`, then the full `pnpm build` (`astro check`, `astro build`, jampack). Neither lane built in the main checkout.
**Test browser:** Google Chrome 153.0.8010.53, headless, through Playwright 1.63.0 (`channel: 'chrome'`), with a fresh non-persistent context per test group and the same GA host blocking as v3. Previews: `ab5c02d` on :4411, `9eb1ec3` on :4412.
**QA artifacts:** `docs/library-packages-upgrade/qa-runs/T-39-2026-09-v4/`:
- `static-delta.md` and `static-delta/`: gate logs (`new-gate.txt`, `new-check.log`, `new-lint.log`, `new-format.log`, `new-build.log`, `old-gate.txt`, `*-build-warns.txt`), the scripts as `*.py.txt` and `gate.sh.txt`, the result JSONs (`s2.json`, `s3-new.json`, `s3-old.json`, `s4s5.json`, `c-pages.json`), `pin_v3-output.txt`, `old-vs-v3-differing.txt`, and the sha256 manifests of both builds.
- `runtime-delta.md` and `runtime-delta/`: the harness `rd.mjs.txt` and its helpers, `results-R2-R5.json`, `results-R1-viewport-and-pwfullpage.json`, `results-R1-tallfullpage-selftest.json`, the per-pair R1 logs and `r4-head-404.png`.
- `diff/runtime-delta-*`: diff maps and head/base/diff crops from the optional Playwright `fullPage` attempt (§4 item 2).

**Overall: PASS.** Both lanes pass, with no failures and no open defect.
- The whole built site at `ab5c02d` differs from `9eb1ec3` only by the four intended Phase 3 deltas. CSS, JS, images and every other non-HTML file except the one edited sitemap (and `sitemap-index.xml`'s build-time `<lastmod>`) are byte-identical, and all 100 HTML hunks are classified (S2).
- Each delta is verified directly. The Flutter links resolve and navigate (S3, R2). The 404 page has no `canonical`, `og:url` or `twitter:url` and is `noindex,follow` (S5, R4). `/tags/` and `/threads/` are listed once (S4). `<html class="false">` is gone, while the 35 post and tip detail pages keep `scroll-smooth` (S2, R3).
- Rendering is unchanged: 0 differing pixels on 16/16 viewport pairs and 16/16 full-page pairs (R1).
- v3's results for everything the deltas do not touch therefore carry forward (§2).
- The Search caret race (v3 §10 item 3) is intentionally not fixed, by user decision on 2026-09-24 (§4 item 1).

---

### 1. What changed since v3 (`9eb1ec3..ab5c02d`)

`git log --oneline 9eb1ec391aedca5a7ad615f37d53568f0a0f2aa0..ab5c02d687e5266ad122db3a37de873ca385a991`:

```
ab5c02d fix(T-39): render html class only when scroll-smooth is on
889a6cf fix(T-39): list /tags/ and /threads/ once across sitemaps
05c8894 fix(T-39): 404 page drops canonical/og:url and is noindex
1326205 fix(T-39): absolute links between Flutter series posts
a6622c1 docs(T-39): final verification report v3 (final tree)
```

`git diff --name-only 9eb1ec3 ab5c02d -- ':!docs'` lists 6 files, all under `src/`: the 3 Flutter `.mdx` posts, `src/layouts/Layout.astro`, `src/pages/404.astro` and `src/pages/sitemap-pages.xml.ts`. `package.json`, `pnpm-lock.yaml` (sha256 `cb7f0f70…` in both trees), `astro.config.mjs` and `public/` are unchanged. v3's stack snapshot, peer warnings and outdated list (v3 header, §8, §9) therefore still apply as recorded.

| Commit | Task | Change | Fixes | Verified in v4 by |
|---|---|---|---|---|
| `a6622c1` | 8 (v3) | The v3 report, `qa-runs/T-39-2026-09-v3/` and the backlog (documentation only). `docs/` is outside Tailwind's `source('..')` and outside Prettier's allowlist, so it cannot affect `dist/`. | — | S2 (all CSS/JS byte-identical) |
| `1326205` | 18 | Three Flutter `.mdx` posts: 4 relative links `./<slug>` → absolute `/posts/<slug>/` (address-manipulation 2, embedded-map 1, static-map 1). | v3 §10 item 1: the relative links 404 from the canonical trailing-slash URLs | S2 (a), S3, R2 |
| `05c8894` | 19 | `Layout.astro` gains a `notFound` prop. When it is set, the page emits no `canonical`, `og:url` or `twitter:url`, and emits `<meta name="robots" content="noindex,follow">`. `404.astro` passes `notFound`. | v3 §10 item 2: the 404 page's canonical URLs pointed at a nonexistent `/404/` | S2 (b), S3, S5, R4, R1 (404 pair) |
| `889a6cf` | 20 | `sitemap-pages.xml.ts` drops the `/threads/` and `/tags/` entries. They stay in `sitemap-threads.xml` and `sitemap-tags.xml`. | v3 §10 item 4: duplicate sitemap entries | S2 (`sitemap-pages.xml`), S4 |
| `ab5c02d` | 21 | `Layout.astro` `<html>`: `` class={`${scrollSmooth && 'scroll-smooth'}`} `` → `class:list={{ 'scroll-smooth': scrollSmooth }}`. Pages without smooth scroll now render `<html lang="en">` instead of `<html lang="en" class="false">`. | v3 §10 item 5: `<html class="false">` | S2 (c), R1, R3 |

v3 §10 item 3, the Search caret race, is not in this range (§4 item 1). `src/components/Search.tsx` is unchanged.

---

### 2. Carry-forward argument

v4 re-verifies only what changed. The argument that v3's results still hold for everything else has three links.

1. **The rebuilt reference is the v3-verified artifact.** The static-delta lane compared its fresh `9eb1ec3` build with the sha256 manifest of the `dist/` that v3's site-wide lane verified. The file lists are identical and 356 of 362 files are byte-identical. The other 6 are:
   - `sitemap-index.xml`, whose `<lastmod>` is the build time.
   - The 5 pages with `ImageSliderClient` (`client:only`) islands, which differ only in the island `uid`. Astro 7.3.5 hashes the component URL into the uid, so it depends on the build path. The main checkout's existing `dist/`, built at the repo path like v3's, reproduces v3's hashes exactly: raw for `from-skeptic-to-champion` and `octoprint-prusa-core-one-raspberry-pi`, and for the 3 Flutter posts once the 4 Task 18 hrefs are reverted (`static-delta/pin_v3-output.txt`).
2. **`ab5c02d` is the reference plus exactly the four intended deltas (S2).**
   - Both builds have the same 362 files.
   - 230 of the 232 non-HTML files are byte-identical: all 4 CSS bundles, all 13 JS files (so every hashed `_astro` chunk name), every image, `rss.xml`, the 4 section sitemaps, `robots.txt`, `CNAME` and the rest (the Partytown sandbox HTML is among the 33 raw-identical HTML files).
   - The other two: `sitemap-index.xml` differs only by `<lastmod>`, and `sitemap-pages.xml` equals the old file with the `/threads/` and `/tags/` `<url>` blocks cut out.
   - Of 130 HTML files, 33 are raw-identical, 2 differ only in island uid, and 95 have hunks. All 100 hunks are classified by exact token rules, with 0 unclassified: 4 Task 18 hrefs, 4 Task 19 head tags in `404.html`, and 92 `<html lang="en" class="false">` → `<html lang="en">`.
3. **Each delta is verified directly (§1 table), and none of them reaches anything else:**
   - The removed `false` token matches no selector. The byte-identical stylesheets contain 0 `.false` selectors, and the `html` rules key on `data-theme`. R1 shows 0 px on every pair, and R3 shows identical class tokens, `scroll-behavior`, theme and background on both builds once the token is removed.
   - The 404 head tags are not rendered (the R1 404 pairs are 0 px). R4 shows that after "Go back home" the swapped home head has its canonical, `og:url` and `twitter:url` again, so the `notFound` branch does not carry over.
   - The hrefs and the sitemap entry are link and crawler data. S3 resolves every internal ref (0 unresolved) and S4 shows that the sitemap `<loc>` union is unchanged.

**v3 results carried forward:**

| v3 result | Why it still holds at `ab5c02d` | Re-checked in v4 |
|---|---|---|
| §1 gate (install, check, lint, format, build) | Re-run on the new tree | S1: every command exit 0; `astro check` 77 files 0/0/0; 127 pages; the same 9 known warnings. Row G: lint and format:check again at report time. |
| §2 React islands (user's Chrome, Playwright, P9 WebKit and Firefox) | Island JS and CSS byte-identical; island markup identical apart from the uid | R5 smoke in Chrome 153: carousel, search, tags filter; identical on base |
| §3 Partytown fix | Partytown assets byte-identical; no HTML hunk outside the four deltas | R5: 1 sandbox iframe under `<html>` across 3 soft navs, 1 gtag.js request, 105 proxytown requests with 0 failed |
| §4 visual comparison | CSS and images byte-identical; the removed token matches no rule | R1: 0 px on 16 viewport and 16 full-page pairs (8 routes × 2 themes: `/`, the 3 Flutter posts, a plain post, `/tags/`, `/threads/`, 404) |
| §5 site-wide | Re-run where the deltas reach | S3 links and assets (W2, W6), S4 sitemaps (the sitemap part of W1), S5 SEO heads (W7), R4 custom 404 (W3). The other checks (the RSS part of W1, W4, W5, W5a, W8-W11) cover byte-identical files (`rss.xml`, `robots.txt`, OG PNGs, `~partytown`), HTML outside the classified hunks, the identical 362-file list, or unchanged config. |
| §6 devToolbar | `astro.config.mjs`, `package.json` and the lockfile unchanged | — |
| §8-§9 peers and outdated | `package.json` and the lockfile unchanged | — (lockfile sha256 equal in both trees) |

Not re-run in v4, and carried forward on the byte-identical CSS and JS: the WebKit and Firefox smoke (v3 P9), the user's Chrome profile lane, and the devToolbar cold start.

---

### 3. Results

| # | Lane | Check | Result | Evidence |
|---|---|---|---|---|
| S1 | static-delta | Gate at `ab5c02d`: install `--frozen-lockfile`, `astro check`, lint, format:check, build | PASS | Scratch worktree `p3v/static-delta-new`, Node v22.23.3, pnpm 10.34.5. Exit codes: install 0, check 0, lint 0, format:check 0, build 0 (`static-delta/new-gate.txt`). `astro check`: `Result (77 files): 0 errors, 0 warnings, 0 hints`, standalone and inside the build. Build: 127 page(s) built; jampack 246/308 files, "No issues". The only warnings are the same 9 `MODULE_LEVEL_DIRECTIVE` lines as v3 and the `9eb1ec3` build. Lockfile sha256 `cb7f0f70…` in both trees. `git status` clean after the gate. |
| S2 | static-delta | Whole-site diff `9eb1ec3` → `ab5c02d`, both full `pnpm build` including jampack | PASS | 362/362 files, identical lists. 230/230 other non-HTML files byte-identical: css 4, js 13, webp 123, png 67, jpg 7, gif 6, svg 1, xml 5 (`rss.xml` and 4 sitemaps), `robots.txt`, the devtools JSON, `CNAME`, `.gitkeep`; 0 font files in `dist/`. `sitemap-index.xml` equal after stripping `<lastmod>`. `sitemap-pages.xml`: exactly the `/threads/` and `/tags/` `<url>` blocks removed, nothing added, order preserved. HTML: 130 files, only the `astro-island` uid normalized (per-file uid counts equal); 33 raw-identical, 2 uid-only, 95 with hunks. 100 hunks = 4 (a) + 4 (b) + 92 (c), 0 unclassified. (a) the 4 Flutter hrefs `./<slug>` → `/posts/<slug>/`, exactly the source diff. (b) `404.html`: `canonical`, `og:url` and `twitter:url` for `https://www.novifyx.com/404/` deleted, `<meta name="robots" content="noindex,follow">` inserted. (c) 92 pages `<html lang="en" class="false">` → `<html lang="en">`; the old `class="false"` set equals the (c) set. The 35 post and tip detail pages keep `class="scroll-smooth"` (equal sets). `class="false\|undefined\|null"`: 0 in new, 92 in old. |
| S3 | static-delta | Link integrity over all `dist/**/*.html` at `ab5c02d`, against both the trailing-slash and no-slash page URLs | PASS | 130 HTML files, 4632 refs: 2991 root-relative, 0 relative, 128 same-site absolute, 347 fragment-only. 6195 case-exact resolutions (file 1941, dir-index 3853, dir-redirect 401): 0 unresolved. 347 in-page fragments, 0 missing, 0 empty `#`; 0 cross-page fragments. 35 island-prop URLs, 0 broken. 0 duplicate ids. `404.html` has 0 relative refs. Negative control at `9eb1ec3`: 5 unresolved (the 4 Flutter `./` hrefs against the slash base, and the 404 canonical `/404/`). The rule deltas (dir-index +8, dir-redirect −4) match Task 18 exactly. |
| S4 | static-delta | Sitemaps: `xmllint`, total = unique, union set-equal to `9eb1ec3`, every `<loc>` maps to `dist/`, the index lists all | PASS | `xmllint --noout` exit 0, no stderr, on `sitemap-index`, pages, posts, tags, threads, tips and `rss.xml`, in both builds. `<loc>` per file: pages 5, posts 28, tips 7, threads 3, tags 69. Total 112 = unique 112, no duplicates (old: 114 total, 112 unique, with `/tags/` and `/threads/` twice). The union is set-equal to `9eb1ec3` (only-old and only-new both empty). 112/112 locs map case-exactly to a `dist/…/index.html`. The index lists exactly the 5 `sitemap-*.xml` files, and all 5 resolve. |
| S5 | static-delta | SEO heads: `canonical` and `og:url` map to `dist/`; 404 has none of them and is noindex; the noindex pagination set is unchanged | PASS | 128 `canonical`, 126 `og:url` and 126 `twitter:url` tags, 0 unresolved: 50 of each via dir-index, and the 76 tag pages (plus 2 redirect-stub canonicals) via dir-redirect, the same as `9eb1ec3`. 127 `og:image` and 127 `twitter:image` all map to files. `404.html` has no `canonical`, `og:url` or `twitter:url`, and exactly one robots tag, `noindex,follow` (old: none). noindex set: old 17, new 18 = old plus `404.html`. The robots text is identical on all 17 common pages: `/posts/2-6/`, `/tips/2/` and 8 `/tags/<tag>/<n>/` use `noindex,follow`; the 2 redirect stubs and the Partytown sandbox use `noindex`. No page in either build has more than one robots meta. |
| R1 | runtime-delta | Pixel diff `ab5c02d` (:4411) vs `9eb1ec3` (:4412): 8 routes × light/dark, 1280×1800, DSF 1, `reducedMotion: 'reduce'`, after fonts and network idle | PASS | Required viewport captures: 0 px on all 16 pairs, by exact RGBA equality (pngjs). Full page with the tall-viewport method: 0 px on all 16 pairs (up to 1280×14417). Preconditions held on every capture of both builds: status 200 (404 for the 404 route), `data-theme` as requested, identical IBM Plex Mono faces loaded, all islands hydrated. 0 unexpected console errors. The optional Playwright `fullPage` attempt is §4 item 2. |
| R2 | runtime-delta | Flutter links: real click, ClientRouter soft nav, 200, correct post, full loads | PASS | Each of the 4 changed links exists once in `#article` with its new absolute href. Each real click was a soft nav (window token kept, 0 load events) to the exact target: embedded-map "First post" → `/posts/flutter-google-maps-setup/`; address-manipulation "Second post" → `/posts/flutter-google-maps-embedded-map/` and "First post" → `/posts/flutter-google-maps-setup/`; static-map "Third post" → `/posts/flutter-google-maps-address-manipulation/`. Every target fetch returned 200, and h1 and title match a full load of the target. Full loads of the 3 targets return 200 at the same path. Base contrast: the old relative hrefs resolve to nested URLs that return 404 (for example `/posts/flutter-google-maps-embedded-map/flutter-google-maps-setup`). 0 console errors. |
| R3 | runtime-delta | `<html>` class and dark theme through ClientRouter (`/` → post → `/tags/` → back), no light flash, head vs base | PASS | Head: `/` has class `null` and `scroll-behavior: auto`; after the click to a post, `scroll-smooth` and computed `smooth`; header link to `/tags/`, `null` and `auto`; Back, `scroll-smooth` and `smooth`; Forward and Back again behave the same. No `false` token in any step or in any of 139 rAF samples. After the theme toggle, `data-theme` is `dark` and the body background `rgb(33, 39, 55)` on every soft and full page; every rAF frame during the 5 soft navs is dark. On 4 full loads, theme and background are already dark at DOMContentLoaded and at the first rAF, and a MutationObserver saw `data-theme` written only as `dark`. Base, same sequence: identical once the `false` token is removed (class tokens, scroll-behavior, theme, background, soft-nav flag, h1, DCL and first-frame state). The only difference is `class="false"` on `/`, `/tags/` and full loads (`false dark`). 0 console errors on both builds. |
| R4 | runtime-delta | 404: custom page, robots noindex, no `canonical`/`og:url`/`twitter:url`, "Go back home" | PASS | `GET :4411/this-route-does-not-exist` returns 404 and renders the custom page: title "404 Not Found \| Novi Fyx", h1 "404" (`aria-label="404 Not Found"`), "Page Not Found", the "Go back home" link, header and footer. Head: robots `['noindex,follow']`; `canonical`, `og:url` and `twitter:url` absent; no `<html>` class. Clicking "Go back home" soft-navigates to `/` with a 200 fetch, and the swapped home head has `canonical`, `og:url` and `twitter:url` = `https://www.novifyx.com/` and no robots. Base contrast: `canonical`, `og:url` and `twitter:url` point at `/404/` and there is no robots meta. Console: only the excused main-document 404 message, once per build (§4 item 7). |
| R5 | runtime-delta | Islands smoke (carousel, search, tags) and Partytown | PASS | Octoprint carousel 1: Next moves exactly one slide ("Slide 1 of 2" → "Slide 2 of 2", scrollLeft 0 → 734 = clientWidth, Prev enabled). `/search/`, after a 300 ms wait and real typing of `hiring`: "Found 5 results", `?q=hiring`. `/tags/` filter `engin`: 68 → 5 tags, all matching, including `engineering-management`. Partytown over 3 real-click ClientRouter navs: the sandbox iframe's parent is `<html>` on every page, 1 iframe, loaded once, 1 sandbox HTML request, 0 full loads, 1 gtag.js request, 1 worker; 105 proxytown requests, 0 failed, 0 ≥ 400, 0 proxytown console messages. Base gives identical outcomes. 0 console errors on both builds. |
| SELFTEST | runtime-delta | Console-capture harness self-test | PASS | Four injected errors were all captured: a page `console.error`, an uncaught page error, a Blob dedicated-worker `console.error`, and a `console.error` in the Partytown sandbox iframe. So "0 console errors" in R1-R5 is not a blind spot. |
| G | report writer | Gate re-run at report time, main checkout with the v4 QA directory in place | PASS | At 22:22:10Z, Node v22.23.3: `pnpm lint` exit 0 (no diagnostics); `pnpm format:check` exit 0 ("All matched files use Prettier code style!"). The v4 QA directory has 0 `.js`/`.mjs`/`.cjs`/`.ts`/`.tsx`/`.astro` files (scripts are archived as `*.txt`), and `docs/` is outside Prettier's allowlist and Tailwind's `source('..')`. Run again before the commit. |
| T | report writer | Teardown | PASS | At report time `lsof -iTCP:4321-4340 -iTCP:4401 -iTCP:4411 -iTCP:4412 -sTCP:LISTEN` exited 1 with no listeners, and `git worktree list` shows only the main checkout (`ab5c02d [upgrade/2026-09]`). The runtime lane stopped its previews (pids 11059, 11091); both lanes removed their scratch worktrees. |

---

### 4. Observations (not failures)

1. **The Search caret race is intentionally not fixed (user decision, 2026-09-24).** This is v3 §10 item 3: a 50 ms post-mount `setTimeout` in `src/components/Search.tsx` resets the caret, so typing that starts inside that window can be reordered (`hiring` → `iringh`). It is pre-existing on main, and Phase 3 does not touch `Search.tsx`. R5 waits 300 ms after hydration before typing, so its query arrived intact on both builds.
2. **Optional Playwright `fullPage` capture.** The runtime lane also tried Playwright's `fullPage: true`. 12 of its 16 pairs were 0 px. The other 4 (embedded-map and static-map, light and dark: 1600 or 2956 px) all fall inside the 44×44 carousel "Next slide" button, which is enabled in one capture and disabled in the other. Same-build repeats reproduce it (head vs head 1600 px, base vs base 1478 px), so it is capture noise, not a build difference. The lane read the head and base crops (`diff/runtime-delta-R1.fp.*-crop-head-base-diff.png`). The likely cause, not verified, is a race between the resize that `captureBeyondViewport` performs and `ImageSliderClient`'s resize handler; the component is unchanged between the trees. The JSON records this optional check as `R1.fullpage` with `pass: false` (`runtime-delta/results-R1-viewport-and-pwfullpage.json`). It is superseded by `R1.fullpage-tall`, which fixes the viewport at the page height before capture: 0 px on 16/16, with every Next button enabled on both builds. R1 is graded on the required viewport pairs and the tall method.
3. **Island uid depends on the build path.** It is the only normalized variation. It is stable across two builds in the same worktree. Between worktrees, all 15 `ImageSliderClient` (`client:only`) uids differ, while the `Search` and `TagsList` uids do not. Astro 7.3.5 derives the uid from `shorthash(componentExport:componentUrl + html + props)`.
4. **Tag-page canonicals have no trailing slash (pre-existing, not a Phase 3 delta).** The 76 tag pages (`/tags/<tag>/` and `/tags/<tag>/<n>/`) emit `canonical`, `og:url` and `twitter:url` without a trailing slash (for example `https://www.novifyx.com/tags/leadership`), while `sitemap-tags.xml` lists `/tags/<tag>/`. There are also 401 root-relative href resolutions without a trailing slash (`/tags`, `/posts`, `/posts/<n>`, `/posts/<slug>`). All resolve through GitHub Pages' `/x` → `/x/` redirect to existing `index.html` files, and they are identical in both builds. A possible future SEO tidy-up.
5. **ClientRouter drops the `dark` class token on soft navigation (pre-existing, identical on base).** The inline head script adds `dark` on full loads; the root-attribute swap copies the new document's `<html>` attributes and removes it. It is harmless: CSS keys on `data-theme`, which `toggle-theme.js` restores on `astro:after-swap`, and no non-dark frame was ever sampled. On base the swap wrote `class="false"` instead.
6. **Transitional rAF frames (pre-existing, identical on base).** During soft navs the sampler saw 1-2 frames where `location.pathname` had changed but the `<html>` class still belonged to the previous page. This is ClientRouter's normal history-before-swap order; `data-theme` and the background stayed dark.
7. **Narrow console exception** (the same one the v3 visual-regression lane used). Chrome logs "Failed to load resource: the server responded with a status of 404 (Not Found)" for the main document of the deliberately requested `/this-route-does-not-exist`. Only that exact text at that exact location is excused. It appeared 12 times across the two R1 runs (6 head, 6 base) and twice in R4 (once per build), identically on both builds. The only other errors in any result JSON are the self-test's injected ones.
8. **Network failures.** Apart from the intentionally blocked GA hosts (`ERR_NAME_NOT_RESOLVED`), the only failed request was one `googletagmanager.com/td` beacon on base R3, aborted (`net::ERR_ABORTED`) by a full-load navigation. It produced no console message and is not a delta.
9. **Scope.** v4 ran only headless Chrome 153. WebKit, Firefox, the user's Chrome profile and the devToolbar cold start were not re-run (§2); real Safari is still unverified, as in v3 §10 item 21.
10. **Lane process.** static-delta started no server, so port 4401 was not used. The runtime lane served on :4411 and :4412, stopped both previews, and removed its worktrees with `--force` (no prune); static-delta removed its worktrees and pruned. Neither lane built in or modified the main checkout apart from the new files under `qa-runs/T-39-2026-09-v4/`, and neither committed. The static-delta lane also ran `pnpm lint` and `format:check` on a copy of the QA directory inside the `ab5c02d` worktree (both exit 0).
11. **Other v3 §10 items.** Items 6-12 (pre-existing site issues) remain as recorded; Phase 3 does not touch them. Items 13-34 (Partytown, environment, build and process notes) are unchanged.

---

### 5. Defects

| ID | Description | Regression? | Status |
|---|---|---|---|
| (none open) | — | — | No open defect. Neither lane found a Phase 3 regression, so no `defects/T-39-D<n>.md` was needed. |
| v3 §10 item 1 | Four relative links in three Flutter posts 404 from the canonical trailing-slash URLs | No (pre-existing on main) | **Fixed** in `1326205` (Task 18): S3 0 unresolved (control at `9eb1ec3`: these 4 plus the 404 canonical); R2 real clicks land on the right posts with 200. |
| v3 §10 item 2 | `404.html` canonical, `og:url` and `twitter:url` pointed at a nonexistent `/404/` | No (pre-existing on main) | **Fixed** in `05c8894` (Task 19): S5, R4. The page is also `noindex,follow` now. |
| v3 §10 item 4 | `/tags/` and `/threads/` listed in two sitemaps (114 locs, 112 unique) | No (pre-existing on main) | **Fixed** in `889a6cf` (Task 20): S4, 112 = 112, union unchanged. |
| v3 §10 item 5 | `<html class="false">` on 92 pages | No (pre-existing on main) | **Fixed** in `ab5c02d` (Task 21): S2 (c), R3. |
| v3 §10 item 3 | Search caret race (`Search.tsx` 50 ms `setTimeout`) | No (pre-existing on main) | **Not fixed, by user decision on 2026-09-24** (§4 item 1). |

---

### 6. Overall verdict

| Lane | Lane verdict (as reported) | After grading in this report |
|---|---|---|
| static-delta | PASS (S1-S5; no failures) | PASS (§2, §3) |
| runtime-delta | PASS (R1-R5 and SELFTEST; no failures) | PASS (§3). R1 is graded on its required viewport pairs and the tall full-page method; the optional Playwright `fullPage` attempt is capture noise that reproduces within one build (§4 item 2). |
| report writer (G, T) | — | PASS (§3) |
| v3 lanes (build, chrome-islands, playwright-e2e, visual-regression, site-wide, devtoolbar) | PASS at `9eb1ec3` (v3 §12) | Carried forward to `ab5c02d` (§2) |

**FAIL rows:** none.

**Overall: PASS**

No failure is open under R8 and spec §5.3. The built site at `ab5c02d` is the v3-verified site plus exactly the four intended Phase 3 fixes, each verified directly, so v3's verdict carries forward and the Task 8 condition for Task 9 (push and PR) is met on `ab5c02d`.

---

## v3 (2026-09-24, commit 9eb1ec3)

**Date:** 2026-09-24. The recorded lane timestamps run from 18:48Z (build) to about 20:29Z (visual-regression, the last lane to finish), UTC. This report was written at 20:42Z.
**Operator:** claude-opus-5-5, the T-39 Task 8 v3 QA report writer. Ruling R38 withdrew R36's carry-forward because Task 17b changed the shipped CSS, so the whole of Task 8 was run again on the final tree. The results come from six QA lanes (R2): build, chrome-islands, playwright-e2e, visual-regression and site-wide ran against this commit; devtoolbar is carried over from Task 8b (§6).
**Commit verified:** `9eb1ec391aedca5a7ad615f37d53568f0a0f2aa0` on branch `upgrade/2026-09`. The build lane built `dist/` from it at 18:50:54Z (`dist/index.html` mtime, after the HEAD commit time of 18:47:51Z). The served pages carry `<meta name="generator" content="Astro v7.3.5">`, the post `og:image` points at `/posts/<slug>/index.png` (Task 17), and `dist/_astro/Footer.BnrdipP9.css` is 63291 B (Task 17b). The sorted sha256 list of all 362 `dist/` files hashed to `272b40eb43f3fda501093be6c796ebcea03b0098` before the first visual capture and after the last one, and the site-wide lane's `dist/` manifests at 19:01Z and 19:22Z are identical.
**Spec:** `docs/library-packages-upgrade/2026-09-23-upgrade-design.md` (§1 success criteria, §5.2 final local verification, §7 Phase 2 addendum).
**Pre-upgrade reference:** `main` at `3df6160395385555a22efd646626e6a009114a7d` (Astro 6.2.1). The visual lane built it in the scratch worktree `t8v3/main-before` (Node 22.22.2, pnpm 10.33.2, install and build exit 0, 127 pages) and served it on :4331. The site-wide lane built its own copy in `t8v3/site-wide-main` (`astro check` 0/0/0, 127 pages, jampack 307 files, "No issues") and compared `dist/` trees. Both worktrees are removed (B12). The April-end commit `bdb9350` was not rebuilt: the 1268-px aligned April captures are byte-identical to v2's, so v2's attribution carries over (§4.4).
**QA artifacts:** `docs/library-packages-upgrade/qa-runs/T-39-2026-09-v3/`: `lane-build.md`, `lane-chrome-islands.md`, `lane-playwright-e2e.md`, `lane-visual-regression.md` (+ `.json`), `lane-site-wide.md`, `build.log`, `stack.txt`, `peers.txt`, `outdated.txt`, the 28 upgraded screenshots, `chrome-islands/*.png`, `playwright/` (results, logs, `pt-repro.json`, the P0 repeats, the v2 comparisons, screenshots), `diff/april/`, and the harness scripts as `*.mjs.txt`.

**Overall: PASS.** Every lane passes after grading, and no failure is open.
- v2's only failure, site-wide W7 (every post `og:image`/`twitter:image` returned 404), is fixed by `20d335f` (Task 17) and now passes: all 254 `og`/`twitter` image URLs (29 unique) return 200 (§5).
- The chrome-islands lane reported FAIL only on PT-1 and PT-2, which it could not observe in the user's Chrome profile: an extension blocks the Partytown service worker, so Partytown never creates its sandbox there. Under R35 those two checks are graded on the clean-profile playwright-e2e P0 result, which passes, and the chrome finding is recorded as an observation (§3, §10 item 13).
- Task 17b's Tailwind source restriction removed about 35 KB of CSS. Screenshots, computed styles at 4 widths, forced `:hover`/`:focus` states and a site-wide rule-set diff all show that no rule the site uses was removed (§4.3, §7).

**Stack snapshot** (`qa-runs/T-39-2026-09-v3/stack.txt`, captured 2026-09-24T18:51:15Z after a clean `pnpm install --frozen-lockfile`):

- Node `v22.23.3` (`.nvmrc`; `nvm ls-remote v22` marks it "Latest LTS: Jod")
- pnpm `10.34.5` (`packageManager`; registry max `^10`)
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

Changes from v2's snapshot: **none.** All 40 direct versions, Node and pnpm are identical. `package.json` and `pnpm-lock.yaml` are unchanged since `63efd08` (the lockfile sha256 is `cb7f0f7010ac…d8d6aea1` in both runs), so the transitive tree is also unchanged: vite `8.3.0`, `@qwik.dev/partytown` `0.14.4`, `@astrojs/compiler-rs` `0.5.0` plus `0.4.1` (via prettier-plugin-astro 1.0.1). The only toolchain-visible change is Tailwind's input: `src/styles/base.css` line 1 is now `@import 'tailwindcss' source('..');` (§7).

Test browsers:
- The user's Chrome 151.0.0.0 (macOS, profile with extensions, including uBlock Origin Lite), driven through Claude in Chrome. The window was hidden (§1.1).
- Google Chrome 153.0.8010.53, headless, through Playwright 1.63.0 (`channel: 'chrome'`), with a clean, non-persistent context per test group (playwright-e2e P0–P8, visual-regression, `pt-repro`).
- WebKit 17.4 and Firefox 125.0.1, the cached Playwright 1.44.1 builds (`webkit-2003`, `firefox-1449`; playwright-e2e P9). Playwright's WebKit is not Safari; real Safari was not tested.

---

### 1. Verification protocol results (gate)

Source: the build lane (`qa-runs/T-39-2026-09-v3/lane-build.md`, `build.log`). It started from a clean tree on Node v22.23.3. Every gate command ran through `rtk proxy` with its output sent to a file, and exit codes were read without a pipe. B11 and B12 were run by the report writer.

| # | Check | Result | Evidence |
|---|---|---|---|
| B0 | Ports 4321-4340 free, no stray Astro daemons | PASS | `lsof -iTCP:4321-4340 -sTCP:LISTEN` exited 1 with no output at 18:48:34Z and again at 18:56:46Z, just before the preview started. `pnpm astro preview status`: "No preview server is running."; `pnpm astro dev status`: "No dev server is running." (both exit 0). No `stop` was needed. |
| B1 | Clean tree (`rm -rf node_modules .astro dist`) | PASS | `ls -d node_modules .astro dist` then reported "No such file or directory" for all three. |
| B2 | `pnpm install --frozen-lockfile` | PASS | exit 0. "Lockfile is up to date, resolution step is skipped"; `Packages: +719`; "Done in 2.1s using pnpm v10.34.5". `grep -iE 'warn\|peer\|deprecat\|error\|ignored\|build script'` finds nothing. The 40 direct versions match `package.json`. `pnpm-lock.yaml` sha256 `cb7f0f70…d8d6aea1` was unchanged across the whole lane. |
| B3 | `pnpm astro check` | PASS | exit 0. `Result (77 files): - 0 errors - 0 warnings - 0 hints`. |
| B4 | `pnpm lint` | PASS | exit 0 with no diagnostics. `eslint . -f json` linted 74 files (34 .astro, 27 .ts, 11 .tsx, 1 .js, 1 .mjs): 0 errors, 0 warnings, 0 fatal, 0 deprecated-rule usages. |
| B5 | `pnpm format:check` | PASS | exit 0: "All matched files use Prettier code style!" `prettier . --list-different` prints 0 lines. `prettier --file-info` reports none of the 34 tracked `.astro` files as ignored (R22). |
| B6 | `pnpm build` (`astro check && astro build && jampack ./dist`) | PASS | exit 0 in 23 s. Embedded check: 77 files, 0/0/0. `[build] 127 page(s) built in 12.65s`, `[build] Complete!`. jampack: `✔ 308 files \| 48.97 MB → 46.13 MB \| -2.85 MB`, `✔ No issues`. `dist/` has 362 files, 130 of them .html, including the 5 `~partytown/` assets, `rss.xml`, `robots.txt` and the index plus 5 custom sitemaps. `dist/_astro/Footer.BnrdipP9.css` is 63291 B, the post-17b size. The only warnings are the 9 known `[WARN] [vite] [MODULE_LEVEL_DIRECTIVE] "use astro:head-inject"` lines, one per .mdx post (9 .mdx files; §10). |
| B7 | Stack snapshot | PASS | `stack.txt` (above): node v22.23.3, pnpm 10.34.5, `pnpm list` exit 0; each of the 40 resolved versions matches its `package.json` spec. |
| B8 | Peer check (R11) | PASS | See §8. No new unmet peer. |
| B9 | `pnpm outdated`: registry latest except the caps | PASS | Lists only `@types/node (dev) 22.20.4 → 26.6.2` (R27 cap) and `typescript (dev) 6.0.3 → 7.0.2` (peer-range cap). A fresh registry cross-check at 18:55:08Z: 38/40 direct dependencies at `dist-tags.latest`, 0 deprecated. See §9. `pnpm outdated` exits 1 whenever it lists anything. |
| B10 | Shared preview on :4321 | PASS | `pnpm astro preview --port 4321` → "Preview server running at http://localhost:4321 (pid 3520)". The first `curl /` poll returned 200 (remote `::1`); the served `/` has sha256 `cccfac2e…015421b5`, equal to `dist/index.html`, and carries generator Astro v7.3.5. Smoke test: 18 routes (pages, RSS, sitemap, robots, `og.png`, a post OG PNG, the 3 Partytown assets) → 200; an unknown route → 404. It binds IPv6 loopback only, so lanes used `http://localhost:4321`. Every lane found it still at 200 when it finished. |
| B11 | Gate re-run at report time (report writer, on the final QA directory contents) | PASS | At 20:37:05Z: `pnpm lint` exit 0; `pnpm format:check` exit 0 ("All matched files use Prettier code style!"); `pnpm astro check` exit 0 with `Result (77 files): 0 errors, 0 warnings, 0 hints`. The QA directory contains 0 `.js`/`.mjs`/`.cjs`/`.ts`/`.tsx`/`.astro` files: every harness script is archived as `*.mjs.txt`, so `eslint .` does not pick them up. `docs/` is outside Prettier's scope (`.prettierignore` allowlist) and outside Tailwind's `source('..')`, so the new artifacts affect neither `format:check` nor the CSS. |
| B12 | Teardown at report time (report writer) | PASS | At 20:34:50Z `pnpm astro preview status` showed pid 3520 running (uptime 5883 s); `pnpm astro preview stop` printed "Stopped preview server (pid 3520)." `lsof -iTCP:4321-4340 -sTCP:LISTEN` then exited 1 with no listeners; `astro preview status`: "No preview server is running."; `astro dev status`: "No dev server is running."; `curl http://localhost:4321/` → 000. `git worktree list` shows only the main checkout (`9eb1ec3 [upgrade/2026-09]`), so every lane's scratch worktree is gone. |

Gate output tail (`build.log`, lines 9-12, 331-332, 992, 1014):

```
Result (77 files):
- 0 errors
- 0 warnings
- 0 hints
14:50:48 [build] 127 page(s) built in 12.65s
14:50:48 [build] Complete!
✔ 308 files | 48.97 MB → 46.13 MB | -2.85 MB
 ✔ No issues
```

#### 1.1 Step 2: browser window visibility

| Check | Result | Evidence |
|---|---|---|
| `document.visibilityState` in the user's Chrome (chrome-islands lane) | PASS (after switching to Playwright, as plan Step 2 requires) | **`"hidden"`** on both tabs the lane opened (1068544374 and 1068544380), with `document.hidden === true` and `hasFocus() === false`. `resize_window` 1280×1800 did not change the viewport (inner 1488×871 and 1040×871 CSS px; the screen is 1728×1117); the carousel `clientWidth` is 734, as in v2. Trusted clicks, real typing and a real cmd+r reload worked. The slider's own smooth scroll completed only on frames forced by screenshots, and the `computer` scroll action produced 0 DOM `wheel` events. The lane used **no** native setter, `el.click()`, `scrollLeft =` or instant-scroll substitute. It delegated the real-input parts of S3-O4, S3-F4, S3-SNAP and S6-1 to Playwright (P1, P4). |
| `document.visibilityState` in Playwright (playwright-e2e lane) | PASS | `"visible"` on 34 of 34 recorded visits, in both runs. All authoritative real-input checks below come from this lane. |

#### 1.2 Step 2a: Partytown service worker (ruling R20)

| Check | Result | Evidence |
|---|---|---|
| 2a.1 Partytown assets on the branch | PASS | curl at 19:03:18Z (`playwright/p0-curl.txt`): `/~partytown/partytown.js` → 200 text/javascript (3198 B); `/~partytown/partytown-sw.js` → 200 text/javascript (47177 B); `/~partytown/partytown-sandbox-sw.html` → 200 text/html;charset=utf-8 (45949 B). The in-page `fetch` (P0.1.assets) agrees. Site-wide W5: all 5 `dist/~partytown` files → 200 and `cmp`-equal to `dist/`. |
| 2a.2/2a.3 Clean headless profile, branch :4321 (**authoritative**) | PASS | Playwright P0.2: the SW registration is activated for scope `/~partytown/`, with no registration error, and the P0 context logged 0 console errors and 0 warnings, in 5/5 independent runs. gtag runs inside Partytown: the scripts become `text/partytown-x` and gtag.js is requested once. The v3 SW probe (`playwright/probe-sw-console.json`) injected `console.error` and `console.warn` into the real `/~partytown/partytown-sw.js` and both arrived through the harness's `serviceworker` listener, so "0 SW errors" is not a blind spot. |
| 2a (characterisation) The SW error in the user's Chrome profile | PASS (R20: extension-caused, observation only) | Chrome PT-1: every full load logs the SW-registration TypeError. From the page, `fetch('/~partytown/partytown-sw.js')` fails with "TypeError: Failed to fetch", while `partytown.js` and `partytown-sandbox-sw.html` fetch 200 from the same page and `curl` of the SW returns 200. So a client-side blocker stops the request (uBlock Origin Lite, R20). Partytown 0.14.4 then falls back to running the scripts on the main thread (`text/partytown-x`) and never creates the sandbox iframe (§3, §10 item 13). The profile also has a leftover SW registration with scope `/~partytown/debug/` that controls no page. |

---

### 2. React islands (spec §5.2)

Evidence lanes:
- **Chrome** = chrome-islands (`lane-chrome-islands.md`, screenshots in `chrome-islands/`): the user's Chrome, hidden window.
- **PW** = playwright-e2e (`lane-playwright-e2e.md`, `playwright/results.json`, 291/291 checks; the repeat `results-run2.json` is also 291/291): clean headless Chrome 153, visible document.
- **P9** = the same lane's cross-browser smoke on WebKit 17.4 and Firefox 125.0.1 (`playwright/xb-webkit.json`, `xb-firefox.json`).

Where the hidden window stopped the chrome lane from completing a real-input check, plan Step 2 allows switching to headless Playwright. Such a row is graded on the Playwright result and cites both lanes.

#### 2.1 `ImageSliderClient` (`client:only="react"`)

| Island | Page | Check | Result | Evidence |
|---|---|---|---|---|
| ImageSliderClient | `/posts/octoprint-prusa-core-one-raspberry-pi/` | 3.1 Carousels present, slide count = N | PASS | Chrome S3-O1: 7 `[aria-roledescription=carousel]`, N = 2,2,2,3,3,2,2 (16 slides); each `clientWidth` 734, `scrollWidth` N×734. Computed: `scroll-snap-type: x mandatory`, `overflow-x: auto`, slides 734 px wide with snap `center`/`always`, border `oklch(0.928 0.006 264.531)` 1px. All 7 islands hydrated. PW P1: 7 carousels = 7 slider islands, N equal to each island's props. |
| ImageSliderClient | octoprint | 3.2 Every slide `<img>` has `complete && naturalWidth>0` | PASS | Chrome S3-O2: 0/16 right after load (the slides are `loading="lazy"` and the tab is hidden). After `scroll_to` plus a frame for each carousel, and a real Next click on each 3-slide carousel: `every()` true, 16/16 (naturalWidths e.g. carousel 3: 1518, 1568, 530). PW P1: every image complete with `naturalWidth>0` after the walk (2 loaded at the start, N after). |
| ImageSliderClient | octoprint | 3.3 Start state: Prev disabled, Next enabled | PASS | Chrome S3-O3 and PW P1: all 7 at `scrollLeft 0`, Prev `disabled` (opacity 0.3, cursor `not-allowed`), Next enabled (opacity 1). |
| ImageSliderClient | octoprint | 3.4 Next = +1 slide width; N−1 clicks reach the end (Next disabled); Prev = −1 slide | PASS (via PW) | Chrome S3-O4: trusted clicks on all 7 carousels, with the component's smooth scroll completing on screenshot-forced frames. Every Next Δ = 734 = `clientWidth`. N=2: Next → 734 (the end, Next disabled), Prev → 0 (Prev disabled). N=3 (carousels 3 and 4): Next → 734, Next → 1468 = `scrollWidth − clientWidth` with Next disabled, Prev → 734. Every click `isTrusted`; in-page error hooks `[]`. Because those frames were forced in a hidden window, the real-input result of record is PW P1 desktop (128/128 checks in both runs, 9 carousels on both posts): a real mouse click on Next moves +734 at every step; walking to the end reaches `scrollWidth − clientWidth` with Next disabled; Prev moves −734; focus + Enter and focus + Space each move +734 with page `scrollY` unchanged. |
| ImageSliderClient | octoprint | 3.5 Partial horizontal scroll snaps to a slide edge | PASS (via PW) | PW P1: a horizontal `page.mouse.wheel` of 40% (287 px moved) settles at `scrollLeft % 734 = 0` with geometric offset 0, both from the start and from the end; a 70% wheel advances exactly one slide. v3 tightened these checks to require **both** `scrollLeft % clientWidth` and geometric slide-edge alignment within 2 px; all 32 such checks pass. Chrome S3-SNAP is supplementary only: the `computer` scroll action moved carousel 3 734 → 0 and 0 → 734 (mod 0), but capture-phase listeners saw 0 `wheel` events, so it is not claimed as a real wheel. |
| ImageSliderClient | octoprint | 3.6 Labels read "Slide k of N" | PASS | Chrome S3-O5: `labelsOk` on all 7 (e.g. `Slide 1 of 3\|Slide 2 of 3\|Slide 3 of 3`). PW P1: the same on every carousel. |
| ImageSliderClient | octoprint | 3.7 After a theme toggle, checks 1 and 3 still pass and the carousel is readable | PASS | Chrome S3-O6: after a full reload, a trusted `#theme-btn` click switched light → dark (body `rgb(33,39,55)`); all 7 at the start state. Button colours equal v2's: dark bg `oklab(0.373388 -0.000638 -0.058752 / 0.8)`, text `rgb(234,237,243)`; light bg `oklab(0.924934 0.000042 0.000019 / 0.8)`, text `rgb(40,39,40)`. Screenshots `chrome-islands/01-octoprint-carousel0-light-after-next-prev.png`, `02-octoprint-carousel0-dark-start.png`. PW P1-dark (11/11): a toggle click switched light → dark; all 9 carousels (both posts) at the start state; Next icon contrast 9.63:1 (light 12.44:1). Screenshot `playwright/screenshots/dark-carousel-octoprint-prusa-core-one-raspberry-pi.png`, SHA-256 identical to v2's. |
| ImageSliderClient | octoprint, 375×812 touch | Mobile slider (extra) | PASS | PW P1-mobile (99/99, 7 carousels): `clientWidth 341`; a tap on Next moves +341, the walk to the end is 341 per step with Next disabled at the end, Prev −341; Enter and Space each +341 with `scrollY` unchanged. A real CDP touch swipe of 40% (134-138 px) snaps back to mod 0, offset 0; a 70% swipe advances exactly one slide. Screenshot `playwright/screenshots/mobile-carousel-octoprint.png`, SHA-256 identical to v2's. |
| ImageSliderClient | `/posts/flutter-google-maps-embedded-map/` | 3.1 Carousels present, slide count = N | PASS | Chrome S3-F1: 2 carousels, N = 2 and 3, `clientWidth` 734, `scrollWidth` 1468 and 2202, both hydrated, `x mandatory`. PW P1: 2 carousels = 2 islands, N equal to the props. |
| ImageSliderClient | flutter | 3.2 Images loaded | PASS | Chrome S3-F2: `every()` true, 5/5 (502×1014, 762×1618, 570×1206, 570×1206, 570×1216); slide 3 of carousel 1 loaded once slide 2 was reached (lazy). PW P1: all loaded after the walk. |
| ImageSliderClient | flutter | 3.3 Start state | PASS | Chrome S3-F3 (dark, and after toggling to light) and PW P1: `scrollLeft 0`, Prev disabled, Next enabled. |
| ImageSliderClient | flutter | 3.4 Next/Prev movement | PASS (via PW) | Chrome S3-F4 (trusted clicks, screenshot-forced frames): carousel 1 (N=3) Next → 734, Next → 1468 = `scrollWidth − clientWidth` with Next disabled, Prev → 734; carousel 0 (N=2) Next → 734 (the end, Next disabled), Prev → 0 (Prev disabled). PW P1 (real input, both carousels): Next +734 at every step, the end reached after N−1 clicks with Next disabled, Prev −734, Enter/Space +734. |
| ImageSliderClient | flutter | 3.5 Snap after a partial scroll | PASS (via PW) | PW P1: a 40% wheel snaps back to mod 0 and offset 0, and a 70% wheel advances one slide, on both carousels. Chrome: delegated (see octoprint 3.5). |
| ImageSliderClient | flutter | 3.6 Labels | PASS | Chrome S3-F5: `Slide 1 of 2\|Slide 2 of 2` and `Slide 1 of 3\|Slide 2 of 3\|Slide 3 of 3`. PW P1: the same. |
| ImageSliderClient | flutter | 3.7 After a theme toggle | PASS | Chrome S3-F6: after a full reload, a trusted click switched dark → light; both carousels at the start state, light button colours as in octoprint 3.7. Screenshots `chrome-islands/03-flutter-carousel1-dark-at-end.png`, `04-flutter-carousel0-light-start.png`. PW P1-dark: the start state holds on both. Screenshot `playwright/screenshots/dark-carousel-flutter-google-maps-embedded-map.png`, SHA-256 identical to v2's. |
| ImageSliderClient | both posts | 3.8 Console `error\|hydrat\|warning` shows nothing new | PASS | Chrome S3-O7 (3 full loads of octoprint, all read) and S3-F7: each load logged only the R20 SW-registration TypeError; the in-page `console.error`/`console.warn`/`error`/`unhandledrejection` hooks caught `[]` through all clicks. PW: 0 console errors, 0 warnings and 0 page errors from any source on both runs; P7 found 0 hydration messages. |
| Islands (ImageSliderClient, Search, TagsList, Card) | dist CSS | Utility classes still present after Task 17b's Tailwind source restriction (extra) | PASS | Chrome CSS-R38 (`classcheck.mjs`): every `className` token in the four components has a rule in `dist/_astro/*.css`, 0 real misses; the ternary classes `text-skin-accent`, `text-skin-base/60` and `hover:text-skin-base` were grepped separately and are present. Computed styles match v2 (3.7). PW V2-compare: 912/912 measured keys (carousel geometry, opacity, step deltas, snap, light/dark colours and contrast, search hrefs, tag order, TOC links, P0 structure, console totals) are identical between v2 (`63efd08`) and v3 run 1, and between v2 and v3 run 2. |

No GIF was produced for Step 3. Exporting from `gif_creator` requires `download: true`, a browser file download that needs the user's approval; the 3 recorded frames were cleared. The per-step `scrollLeft` traces above, the PNG screenshots in `chrome-islands/` and `playwright/screenshots/`, and PW P4b's per-frame theme sampling (§2.4) are the substitute evidence.

#### 2.2 `Search` (`client:load`, `/search/`)

| Island | Page | Check | Result | Evidence |
|---|---|---|---|---|
| Search | `/search/` | 4.1 Typing `hiring` lists results | PASS | Chrome S4-1: a trusted click, then real typing produced 6 trusted `insertText` events h → … → hiring, and the page shows "Found 5 results for 'hiring'" (ems-the-people-system, the-emotional-roller-coaster-of-hiring, two-books-which-influenced-my-hiring-pipeline, ems-why-systems-not-processes, dad-ops-playbook). PW P2: real `keyboard.type('hiring')` gives the same 5 results. |
| Search | `/search/` | 4.2 `location.search` contains `q=hiring` | PASS | Chrome S4-2 and PW P2: `location.search === '?q=hiring'`. |
| Search | `/search/` | 4.3 Reload keeps the input and results | PASS | Chrome S4-3: a real reload (cmd+r; navigation type `reload`, response 200, the window marker gone) shows input `hiring` and the same 5 results. The input has `autocomplete=off`, so the value is not browser form restoration. Screenshot `chrome-islands/05-search-q-hiring-after-real-reload.png`. PW P2: after `page.reload()`, the same 5 hrefs in the same order. |
| Search | `/search/` | 4.4 Clicking the first result opens `/posts/...` with 200 | PASS | Chrome S4-4: a trusted click on "The People System" navigates through ClientRouter to `/posts/ems-the-people-system`, h1 "The People System", fetch 200 with no redirect; `curl` with and without the trailing slash → 200. PW P2: the same, client-side, GET 200. |
| Search | `/search/` | 4.5 No console errors | PASS (via PW) | Chrome S4-5 logged the R20 SW TypeError plus one `InvalidStateError` from the ClientRouter navigation in the hidden document (§10 item 18); a fresh `/search/` load in tab 2 logged only the SW TypeError. PW P2 logged 0 console errors, including the result click. |
| Search | `/search/` | No-match query (extra) | PASS | PW P2: `zzzzqqq` gives "Found 0 results", 0 items, 0 errors. |

#### 2.3 `TagsList` (`client:load`, `/tags/`)

| Island | Page | Check | Result | Evidence |
|---|---|---|---|---|
| TagsList | `/tags/` | 5.1 Typing `engin` narrows the list and includes engineering-management | PASS | Chrome S5-1 (5 trusted `insertText` events) and PW P3: 68 → 5 (engineering-management 15, engineering-leadership 11, engineering-culture 2, senior-software-engineer 1, software-engineering 1); counter "5 of 68 tags matching "engin"". Screenshot `chrome-islands/06-tags-filter-engin-count-order-light.png`. |
| TagsList | `/tags/` | 5.2 Sort alpha vs count | PASS | Chrome S5-2: the default count order verified pairwise over all 68 (count descending, ties alphabetical); a→z sets `aria-pressed` and the filtered list is alphabetical; "Clear filter" gives all 68 alphabetically (first `3d-printing`, last `wsl2`); "count" restores count order (engineering-management 15, engineering-leadership 11, leadership 11, …). PW P3: a→z is alphabetical by `localeCompare`; the cleared list is alphabetical and verified *not* count-sorted; count order is non-increasing with alphabetical ties. |
| TagsList | `/tags/` | 5.3 Clicking a tag opens `/tags/<tag>/` | PASS | Chrome S5-3 and PW P3: a real click reaches `/tags/engineering-management/` through ClientRouter ("Tag: engineering management \| Novi Fyx"), 200, 5 posts. |
| TagsList | `/tags/` | 5.4 No console errors | PASS (via PW) | Chrome S5-4: the R20 SW TypeError plus one hidden-window `InvalidStateError` (see 4.5). PW P3 and both full runs: 0 console errors. |

#### 2.4 `ClientRouter` (home → carousel post → header `/search/` → header `/tags/`)

| Island | Page | Check | Result | Evidence |
|---|---|---|---|---|
| ClientRouter | `/` → octoprint post | 6.1 Navigation happens client-side and the carousel works afterwards | PASS (via PW) | Chrome S6-1: a trusted click on the OctoPrint link kept the same document (the window marker survived); 7 carousels hydrated at the start state; a trusted Next on carousel 0 reached 734 = `clientWidth` on screenshot-forced frames, with Next disabled at the end (real-input part delegated). PW P4 (8/8): route `/` → post → header `/search/` → header `/tags/` with no `goto`; the marker survived, 0 `load` and 0 DOMContentLoaded events after the first load, `astro:page-load` 1 → 2 → 3, islands 7/1/1 with 0 `[ssr]`; carousel Next 0 → 734 after the navigation. |
| ClientRouter | header → `/search/` | 6.2 Search works after navigation | PASS | Chrome S6-2 (trusted click on the header search icon, marker survived, 6 trusted typing events) and PW P4: typing `hiring` gives 5 results and `?q=hiring`. |
| ClientRouter | header → `/tags/` | 6.3 TagsList works after navigation | PASS | Chrome S6-3 and PW P4: same document; `engin` narrows 68 → 5, including engineering-management. Chrome continued with a tag click to `/tags/engineering-management/` and the header logo to `/`; the marker survived all 5 navigations. Screenshot `chrome-islands/07-S6-tags-filter-engin-dark-after-clientrouter.png`. |
| ClientRouter | `/` dark → navigations | 6.4 The theme persists with no light flash | PASS | PW P4b: an rAF sampler saw **82 frames, 0 not dark** across 2 client navigations; `data-theme` is restored 1-3 ms after the swap; the toggle still works afterwards (dark → light → dark). Chrome S6-4: dark set on `/` by a trusted click; at all 25 `astro:*` events (5 navigations × 5 events) `data-theme=dark`, `localStorage.theme=dark`, body `rgb(33,39,55)`. A MutationObserver shows `data-theme` → null (router swap) then → dark on each navigation, and a `setTimeout(0)` scheduled at the removal had not run when dark was set again (5/5), so both happen in the same task and no frame can render in between. `public/toggle-theme.js` is unchanged from main. |
| ClientRouter / theme | `/posts/`, `/tags/`, `/about/`, `/posts/audio-vs-paper-books/` | Theme on full loads, no FOUC (extra) | PASS | PW P5 (6/6): after the toggle on `/`, all 4 `page.goto` loads were already dark with `rgb(33, 39, 55)` at DOMContentLoaded (13-18 ms) and at the first rAF (11-14 ms); a reload and a new `/tips/` tab were dark from DOMContentLoaded. |
| ClientRouter | all navigations above | 6.5 No hydration or runtime errors on any page (spec §5.2) | PASS | PW P7: 0 `astro-island[ssr]` left over 34 visits and 46 islands; 0 hydration or React #418/419/422/423/425 messages from any source. PW console: 0 errors, 0 warnings, 0 `pageerror` on both runs. PW P8 re-ran v1's failing flow (`/` → post → `/search/`) at 0.5/3/10 s dwell, 2 reps each: 0 console errors and 0 aborted `proxytown` XHRs in 6/6 runs. |

#### 2.5 SSR React components and hydration

| Island | Page | Check | Result | Evidence |
|---|---|---|---|---|
| SSR React (`Card`, `Datetime`, `Thread`, `ThreadCard`, `TipCard`) | `/`, `/posts`, `/tips`, `/threads` | Render identically to the pre-upgrade build; children pass through | PASS | Visual lane: main-vs-branch captures are byte-identical (0 px) on all four routes in both themes, with equal element counts and `innerText` hashes (§4.1); computed styles are equal at 4 widths (§4.3). |
| All islands | 34 visits (goto, reload, client navigation) | P7 hydration sanity | PASS | 0 `astro-island[ssr]` remained on 46 islands; 0 console, `pageerror`, frame, worker or SW messages matched `hydrat`, React #418-425, `did not match` or `server rendered HTML`. |

#### 2.6 Cross-browser smoke (P9; Playwright 1.44.1)

| Engine | Check | Result | Evidence |
|---|---|---|---|
| WebKit 17.4 | Capture control, 10 soft navigations with an island check after navigation, Partytown sandbox, slider, search, tags, console | PASS | 14/14 (`xb-webkit.json`). The capture control passed (page, main-frame worker, sandbox-iframe worker, worker uncaught, `pageerror`). 10/10 soft navigations; carousel 0 → 734, search 5 results, tags 68 → 5 after navigation. Sandbox parent `HTML` ×1 on 12/12 snapshots, 1 iframe load, 1 sandbox-html request, 0 detached, same element 10/10; gtag.js requested once; 1 worker, 0 closed; 0 failed `proxytown`; in-worker hook buffer `[]`. P1 octoprint: 7 carousels, every Next Δ 734, Next disabled at the end, all images loaded. P2 and P3 pass. Console: 36 errors, all exempt as proxy-refused analytics (`kCFErrorDomainCFNetwork error 310`, exactly 2× the blocked `g/collect` `requestfailed` count per label; the proxy refused only `www.google-analytics.com` ×10 and `www.google.com` ×10); 0 page errors, 0 warnings, 0 non-analytics failures. |
| Firefox 125.0.1 | Same | PASS | 14/14 (`xb-firefox.json`). Same navigation, island, sandbox, gtag, worker, `proxytown` and in-worker hook results as WebKit; P1 7 carousels with Next Δ 734; P2 and P3 pass. **0 console errors**, 0 page errors, 0 non-analytics failures. 61 warnings, none of them errors (§10 item 16). |

#### 2.7 Console summary (spec criterion 6: "with no console errors")

| Check | Result | Evidence |
|---|---|---|
| Chrome CON: no console errors other than the R20 SW TypeError (user profile, hidden window) | PASS (via PW) | Chrome PT-4: 12 full loads and 7 ClientRouter navigations; 10 loads read directly and the 2 unread URLs reloaded fresh and read. Every read shows only the R20 SW TypeError; the only other entry is one `InvalidStateError` per client navigation (7/7), the hidden-window view-transition artifact (§10 item 18); PW's visible document records none. 0 `proxytown` requests or errors (trivially, since Partytown runs in main-thread fallback in this profile; P0 is the authority, §3). |
| No console errors at all, clean profile (spec §1 criterion 6; §5.2; Steps 3.8, 4.5, 5.4) | PASS | PW C-console: Chrome runs 1 and 2 (34 visits each) and the P0 repeats ×3: **0 errors, 0 warnings and 0 `pageerror`** from page, frames, dedicated workers and the service worker. The only `requestfailed` events were the 64 DNS-blocked GA collect requests, which log nothing in Chrome. `pt-repro`: 0 other console errors, 0 page errors. Firefox: 0. WebKit: 0 apart from the harness-induced blocked-analytics network errors (§2.6). |
| Harness positive controls (the zero is not vacuous) | PASS | PW H-control: Chrome `H.capture-control` captured an injected page `console.error`, a worker `console.error`, a `pageerror` and a 404. The v3 SW probe delivered `console.error` and `console.warn` injected into the real `partytown-sw.js` through the harness's `ctx.on('serviceworker')` → `sw.on('console')` wiring, not the page channel. The WebKit and Firefox controls passed, including a worker created inside the Partytown sandbox iframe. |

---

### 3. Partytown fix evidence (Task 14, `80a9626`)

**Root cause and fix** (spec §7.2; unchanged since v2 §3): `@astrojs/partytown`'s `astro:before-swap` hook moved the Partytown sandbox iframe out of the live `<body>` on every ClientRouter navigation, which destroyed the sandbox and the worker running gtag, aborted in-flight synchronous XHRs to `/~partytown/proxytown`, and re-ran gtag.js. The fix is `sandboxParent: 'html'` in `astro.config.mjs` plus `transition:persist="gtag-src"` / `"gtag-init"` on the two gtag scripts in `src/layouts/Layout.astro` (R28). Neither file changed after `80a9626`; this run re-verifies the fix on the final tree.

Evidence is from this run's lane reports. The "before" side is v1's measurement at `55a6530` and on main.

| Aspect | Before (v1 run; main `3df6160`) | After (v3, `9eb1ec3`) | Source | Result |
|---|---|---|---|---|
| `proxytown` console errors on ClientRouter navigation | v1: 21 page-level NetworkErrors on the branch, 21 on main, 6 in production | **0.** P0 run 1: 183 `proxytown` sync XHRs over 10 real-click navigations (dwell alternating 0.5 s / 3 s), 0 failed or aborted, 0 `proxytown` console messages; the same result in 5/5 independent runs (178 XHRs in the others). P8 (v1's flow): 0 in 6/6 runs. `pt-repro --strict`: `proxytownErrors 0` (139 and 321 requests, 0 failed). P9: 0 failed on WebKit and Firefox. | `lane-playwright-e2e.md` P0/P8/P9, `playwright/pt-repro.json`, `playwright/p0-repeats/` | PASS |
| Sandbox placement | main: the library default (`sandboxParent\|\|"body"`); `<html>` children `[HEAD, BODY]` | P0: parent `HTML` ×1 on 12/12 snapshots, the iframe is `<html>`'s last child. Visual VR6: `<html>` children `[HEAD, BODY, IFRAME]` on all 28 shots; the iframe is `visibility: hidden`, 0×0, and heights and element counts equal main. W5a: all 127 Layout pages carry `sandboxParent:"html"`. | P0.2, `lane-visual-regression.md` §3.1, `lane-site-wide.md` W5a | PASS |
| Sandbox survives navigation (no reload) | the swap destroyed and recreated it on every navigation | P0: iframe DOM `load` events 1, sandbox-html requests 1, `framenavigated` 1, `framedetached` 0, mutation removals 0, the same element after 10/10 navigations; Partytown workers 1 created, 0 closed. `pt-repro`: `softNavsWithSandboxReload 0` of 28 soft navigations. P9: the same on WebKit and Firefox. | P0.2, P0.3, P9 | PASS |
| gtag.js runs once per visit | re-fetched and re-run after each recreation | P0: gtag.js requested exactly once; `gtag-src` and `gtag-init` are the same persisted elements after every navigation (`text/partytown-x`), 0 pending. `pt-repro`: 1 gtag.js served per dwell pass. Chrome PT-3 (below). | P0.2, P0.3 | PASS |
| Analytics page views per navigation | v1 did not measure it | P0: 6 `page_view` + 1 `scroll` collect attempts, 2 of them after the last navigation (the initial `/` plus the 5 pages viewed for 3 s), in 5/5 runs. `pt-repro`: 14/14 soft-navigation `page_view`s at 3 s dwell; 1/14 at 0.5 s. No real hit reached GA: the collect hosts were NXDOMAINed (Chrome) or refused by a proxy (P9). | P0.2, P0.3 | PASS (at ≥3 s dwell; short-dwell loss is informational, §10 item 14) |
| Deterministic repro (`pt-repro.mjs --strict`, the Task 14 RED/GREEN tool) | RED on `4d323d5`: 28/28 sandbox reloads and 10 `proxytown` errors (ledger, Task 14) | Run 19:03:44Z → 19:04:55Z, **exit 0**, stderr empty. Verdict `{proxytownErrors: 0, softNavigations: 28, softNavsWithSandboxReload: 0, strict: true, otherConsoleErrors: 0, pageErrors: 0, vacuousOrLeaky: false, exitCode: 0}`. 0.5 s dwell: 14 soft navigations, 0 reloads, `proxytown` 139/0 failed, 1 worker, 1 sandbox load. 3 s dwell: 14 soft navigations, 0 reloads, 321/0 failed, 1 worker, 1 sandbox load, 14/14 `page_view`s. | `playwright/pt-repro.json`, `pt-repro-run.txt` | PASS |
| PT-1: on `/` the sandbox iframe is a child of `<html>`, after `<body>` | — | Chrome lane: **not verifiable in the user's profile** (0 iframes; recorded as §10 item 13). Graded on the clean-profile authority (R35): P0 shows parent `HTML` ×1 and the iframe as `<html>`'s last child on 12/12 snapshots in 5/5 runs; VR6 shows `[HEAD, BODY, IFRAME]` on all 28 routes; P9 shows the same on WebKit and Firefox. | `lane-chrome-islands.md` PT-1, P0.2, VR6, P9 | PASS (via PW) |
| PT-2: the same sandbox element after 3 ClientRouter navigations; iframe count 1 | — | Chrome lane: not verifiable in the user's profile (0 iframes, same cause; §10 item 13). Graded on P0 (R35): count 1 and the same element after each of 10/10 navigations, 1 load, 0 detaches, in 5/5 runs; P9 the same on both engines. | `lane-chrome-islands.md` PT-2, P0.2, P9 | PASS (via PW) |
| PT-3: the `transition:persist` gtag scripts are the same elements after ClientRouter navigations (user profile) | — | The two `script[data-astro-transition-persist]` elements are `===` the saved references after 5 client navigations; markers intact, `isConnected` true; gtag.js resource entries 1 before and after, so it was not re-fetched. This half of the fix is observable even with Partytown in main-thread fallback. | `lane-chrome-islands.md` PT-3 | PASS |
| Served config | — | 127/127 Layout pages: exactly one `{lib:"/~partytown/",sandboxParent:"html",debug:!1}` with `forward ["dataLayer.push"]`; the `src` gtag script has `data-astro-transition-persist="gtag-src"` and the inline one `"gtag-init"`, each once per page. The corrected checker fails all 127 main pages (negative control). Chrome PT-0 found the same in the served snippet. | `lane-site-wide.md` W5a, `lane-chrome-islands.md` PT-0 | PASS |

---

### 4. Visual comparison (spec §1 criterion 7; plan Step 7)

Source: the visual-regression lane (`lane-visual-regression.md`, `lane-visual-regression.json`, scripts in `visual-regression-scripts/`).

Method:
- The upgraded site on :4321 (HEAD's `dist/`; the served `/`, octoprint post and `Footer.BnrdipP9.css` are byte-identical to `dist/`) against main `3df6160` on :4331 (Astro 6.2.1). Both dists contain the same 129 HTML pages (the extra branch file is the Partytown sandbox asset), and `innerText` hashes, heights and element counts are equal on all 28 shots.
- Headless Chrome 153.0.8010.53 through Playwright 1.63.0, 1280×1800, device scale factor 1, `reducedMotion: 'reduce'`, theme set through `localStorage.theme` (the theme assertion held on 84/84 captures), `networkidle` reached on 28/28 per server, IBM Plex Mono loaded on every shot, 0 broken images.
- Diff: pixelmatch 7.2.0 at threshold 0.1 as specified, plus decoded-buffer equality and an exact any-channel pixel count. "0 px" below means exact equality.

#### 4.1 Upgraded branch vs pre-upgrade main (same content)

| # | Route | Screenshots (branch) | Light: mismatch / exact px | Dark: mismatch / exact px | Parity notes | Result |
|---|---|---|---|---|---|---|
| 01 | `/` | `01-home.png`, `01-home-dark.png` | 0.0000% / 0 | 0.0000% / 0 | byte-identical; height 1800/1800; 196/196 elements; TopTags `#tag` rows included | PASS |
| 02 | `/posts` | `02-posts-index.png`, `02-posts-index-dark.png` | 0.0000% / 0 | 0.0000% / 0 | byte-identical; 156/156 elements; breadcrumb and pager match | PASS |
| 03 | `/posts/ems-connecting-the-systems` | `03-post-with-images.png`, `03-post-with-images-dark.png` | 0.0000% / 0 | 0.0000% / 0 | byte-identical; height 14586/14586 | PASS |
| 04 | `/posts/flutter-google-maps-embedded-map` | `04-post-with-carousel.png`, `04-post-with-carousel-dark.png` | 0.0000% / 0 | 0.0000% / 0 | byte-identical; 7/7 images, 5 slides; the round Prev/Next buttons (`rounded-full`, `-translate-y-1/2`) match | PASS |
| 05 | `/tips` | `05-tips-index.png`, `05-tips-index-dark.png` | 0.0000% / 0 | 0.0000% / 0 | byte-identical | PASS |
| 06 | `/tags` | `06-tags-index.png`, `06-tags-index-dark.png` | 0.0000% / 0 | 0.0000% / 0 | byte-identical; height 3029/3029 | PASS |
| 07 | `/tags/engineering-management/` | `07-tag-detail.png`, `07-tag-detail-dark.png` | 0.0000% / 0 | 0.0000% / 0 | byte-identical; the inline related-`#tag` rows and breadcrumb, where a `compressHTML` spacing change would show, match | PASS |
| 08 | `/threads` | `08-threads-index.png`, `08-threads-index-dark.png` | 0.0000% / 0 | 0.0000% / 0 | byte-identical | PASS |
| 09 | `/about` | `09-about.png`, `09-about-dark.png` | 0.0000% / 0 | 0.0000% / 0 | byte-identical | PASS |
| 10 | `/this-route-doesnt-exist` | `10-404.png`, `10-404-dark.png` | 0.0000% / 0 | 0.0000% / 0 | byte-identical; HTTP 404 on both builds (expected) | PASS |
| 11 | `/posts/octoprint-prusa-core-one-raspberry-pi/` | `11-octoprint.png`, `11-octoprint-dark.png` | 0.0000% / 0 | 0.0000% / 0 | byte-identical; height 39002/39002; 24 images; 16 slides; 3961/3961 elements | PASS |
| 12 | `/search/?q=hiring` | `12-search.png`, `12-search-dark.png` | 0.0000% / 0 | 0.0000% / 0 | byte-identical; "Found 5 results for 'hiring'" on both | PASS |
| fp | `/` (full page) | `fp-home.png`, `fp-home-dark.png` | 0.0000% / 0 | 0.0000% / 0 | 1280×1800 on both; the page is exactly the viewport height | PASS |
| fp | `/posts/ems-the-delivery-system/` (full page) | `fp-ems-the-delivery-system.png`, `fp-ems-the-delivery-system-dark.png` | 0.0000% / 0 | 0.0000% / 0 | 1280×7977 on both after a lazy-load pre-walk; all images complete | PASS |

28 of 28 main-vs-branch pairs are byte-identical after decoding, so no main-vs-branch diff PNGs were written (0 pairs above 0.1%).

#### 4.2 Supporting pixel checks

| Check | Result | Evidence |
|---|---|---|
| Noise floor (a second capture of the upgraded site, up-B) | PASS | up-A vs up-B: 28/28 byte-identical. |
| v3 vs v2 (the committed `qa-runs/T-39-2026-09-v2/*.png`, verified at `63efd08`, before Tasks 17 and 17b) | PASS | **28/28 byte-identical.** The og:image meta fix, the Tailwind source restriction and the CLAUDE.md note changed no rendered pixel. |
| Below the fold: 1800-px scroll segments of 03, 04, 06 and 11 in both themes (84 pairs) | PASS | Same sizes and `scrollY` on both builds, every visible image loaded, 83/84 byte-identical. `seg-11-octoprint-18` (light) had 17 exact px (0 at threshold 0.1) in a 1-px column of the downscaled `temperature-graph-cancel.webp`. Captured 4× more on each server, all 8 equal the original main capture, so it was a one-off rasterisation, not a build difference. |
| DOM and metadata parity (all 28 shots) | PASS | Status, URL, title, theme, colours, fonts, `scrollHeight`, `scrollWidth`, element count, image count, slide count (5 on 04, 16 on 11), `innerText` hash, console and bad responses are all equal. The only differing key is `htmlChildren`: `[HEAD, BODY, IFRAME]` on the branch vs `[HEAD, BODY]` on main, which is Task 14's sandbox move (§3); the iframe is `visibility: hidden` with a 0×0 rect. |
| Console and network parity (clean profile) | PASS | 0 page errors on either build; the only console error is the expected document 404 on `/this-route-doesnt-exist` (2 per build); the only failed requests are GA beacons aborted when each context closes, on both builds; no 4xx/5xx subresources. |

#### 4.3 Task 17b CSS reduction: computed styles, forced states and rule sets

Task 17b removed about 400 unused utility rules from the Footer bundle, which every page loads. Screenshots cover one width and the resting state, so the lane also compared the two servers in memory.

| ID | Check | Result | Evidence |
|---|---|---|---|
| VR7 | Computed-style comparison (`cstyle.mjs static`): 21 page types × widths 1280/800/700/375 × 2 themes, plus interactive states (menu open at 375, carousel at the end so the `disabled:` variants apply, every `<details>` open, tags filter + a→z, "Expand all", search with no results) | PASS | **266 page states, 221,564 element comparisons**, covering 477 computed longhands, custom properties, `::before`/`::after`/`::marker`/`::placeholder` and layout rects. Differences: standard longhands 0, pseudo-elements 0, rects 0, one-sided elements 0. The only custom-property difference outside `:root` is `--tw-translate-y` `-50%` (main) vs `calc(calc(1 / 2 * 100%) * -1)` (branch) on `-translate-y-1/2` elements; the consuming `translate` longhand and the rects are equal. On `:root`, 118 unused theme variables are gone and 2 line-height variables are re-serialised to equal values. Theme and hydration correct on 266/266 on both sides. |
| VR8 | Forced `:hover` / `:focus` states (CDP `CSS.forcePseudoState`; hover forced on the target and its ancestors; transitions disabled; `matchMedia('(hover: hover)')` true on all runs) | PASS | **84 runs (21 page types × 2 themes × hover/focus), 9,996 targets, 332,108 element comparisons.** Forcing changed styles on the same 6,714 targets on both builds, with 0 disagreements about whether a state had an effect. Summed from the full per-target difference arrays: std 0, pseudo-element std 0, rect 0, one-sided 0. The 174 custom-property differences are all the `--tw-translate-y` serialisation; the 12 elements beyond the 8-per-target detail cap (`article.prose` on 11, light and dark) were re-inspected uncapped against a re-served main build and have the same single signature. |
| VR9 | Site-wide CSS rule-set diff: the removed rules are dead | PASS | Every same-origin rule applied on all 129 pages × 2 themes plus the interactive states (300 visits per build), each tested by a superset selector (state pseudo-classes stripped) against the live DOM of every visit. Main has 1981 distinct rules, the branch 1566. The 428 main-only rules are: **402 that match 0 elements on any visit**, whose 399 class tokens appear in **0** DOMs of either build; 12 `@property`/`@keyframes spin` rules used only by the removed utilities; 14 with a same-effect counterpart after merging or re-serialisation (e.g. `.rounded-full` computes to `3.35544e+07px` on both builds). `--ease-in-out` is the only removed variable still referenced, and its single use carries the identical fallback `cubic-bezier(.4, 0, .2, 1)`. 0 selectors became unparseable. |
| VR10 | Comparator controls (positive and negative) | PASS | 7/7. C1: forced hover changes the header "Posts" link `rgb(40,39,40)` → `rgb(0,108,172)` on both builds. C2: deleting the used `.text-skin-accent` rule takes the static comparator from std 0 to 11. C3: deleting the nav-link `:hover` rule is flagged by the forced pass. C4: the unmutated case is clean. C0: `article.prose` is forced as an anchor candidate. C5: deleting the anchor-only Expressive Code `.frame:hover .copy button` rule is flagged (opacity 0.75 vs 0). C6: the unmutated anchor case is clean. |

#### 4.4 April baseline (`baseline/*.png`) vs upgraded branch

The lane Read all 10 April/upgraded pairs. For attribution it re-captured the upgraded site at a 1268-px layout width: April's capture painted a 12-px scrollbar gutter (`html { overflow-y: scroll }`), while Playwright passes `--hide-scrollbars`, which shifts the centred column by +6 px. The April baseline was also captured on `astro dev`, so its dev-toolbar pill is visible. The 10 aligned captures are byte-identical to v2's and give identical pixel counts, so v2's per-route attribution against the April-end build `bdb9350` carries over unchanged. **main is byte-identical to the branch (§4.1), so none of these differences come from T-39.**

| # | Route | Mismatch unaligned / aligned 1268 | Explanation | Result |
|---|---|---|---|---|
| 01 | `/` | 1.8783% / 1.6402% | Content added on main since April: 2 new posts (`3df6160`, `33f6bde`) and the Top tags section (`13deae2`). Plus the +6 px shift, the dev toolbar and the April-era nav offset (already in T-30). | PASS |
| 02 | `/posts` | 1.8611% / 1.6116% | 2 new posts at the top; still 5 per page, "1 / 6". The active "Posts" wavy underline renders slightly differently in Chrome 153; its classes are unchanged since `d8bf57e`. | PASS |
| 03 | `/posts/ems-connecting-the-systems` | 4.4359% / 0.1706% | Text, line breaks and spacing identical. Aligned, only the header nav band and the dev toolbar differ; the unaligned figure is the +6 px shift on dense text. | PASS |
| 04 | `/posts/flutter-google-maps-embedded-map` | 2.3411% / 0.6891% | Expected: the pure-CSS scroll-snap carousel with the round Prev/Next buttons (T-36, `0ce59e8`). Chrome 153 renders the dashed underline, the TOC summary width and code-line offset slightly differently, as on April-end code. | PASS |
| 05 | `/tips` | 1.5100% / 1.3299% | The Tips listing redesign on main (`465cc8c`, 2026-05-07): NOTE numbering, status bar, "Expand all", inline pager. | PASS |
| 06 | `/tags` | 1.5041% / 0.7013% | 63 → 68 tags and changed counts reorder rows; the filter, the sort toggle, the bars and the `#`-to-name spacing are unchanged. | PASS |
| 07 | `/tags/engineering-management/` | 2.1164% / 1.5333% | 14 → 15 articles; `#hiring` moved into the first related-tags row. Inline `#tag` spacing matches April. | PASS |
| 08 | `/threads` | 1.7342% / 0.2395% | Content identical. Shift, dev toolbar, nav offset, Chrome 153 placing headings 1 px higher (the same on April-end code). | PASS |
| 09 | `/about` | 2.9787% / 0.1792% | Content identical. Chrome 153 renders the list bullets and the fallback-font kaomoji differently (the same on April-end code). | PASS |
| 10 | `/this-route-doesnt-exist` | 0.5484% / 0.1873% | The "Go back home" dashed underline has longer dashes in Chrome 153; April-end code in Chrome 153 gives the identical 383 px. | PASS |

Aligned diff PNGs are in `diff/april/NN-*-april-vs-up-aligned1268.png`. The April/T-30/now evidence crops were not regenerated; they are in `qa-runs/T-39-2026-09-v2/diff/april/crops/`.

---

### 5. Site-wide (spec §5.2 "Site-wide"; plan Step 8)

Sources: the site-wide lane (`lane-site-wide.md`), which crawls the branch `dist/` and the preview with a case-exact resolver (GitHub Pages is case-sensitive) and compares with its own fresh main build; PW P6 for the TOC in a browser.

| ID | Area / check | Result | Evidence |
|---|---|---|---|
| W1 | RSS, sitemaps, OG, robots: status, content types, `xmllint`, RSS items, every `<loc>` → 200 | PASS | `/rss.xml` 200 text/xml (14458 B); `/sitemap-index.xml` 200 text/xml; `/og.png` 200 image/png; `/posts/audio-vs-paper-books/index.png` 200 image/png; `/robots.txt` 200 text/plain; every served body `cmp`-equal to `dist/`. `xmllint --noout` ok on the RSS feed (`rss-ok`), the index (`sitemap-ok`) and all 5 referenced sitemaps (pages 7, posts 28, tips 7, threads 3, tags 69 locs). 114/114 `<loc>` → 200 with 0 redirects. RSS has 35 items: `src/pages/rss.xml.ts` returns `[...postItems, ...tipItems]` by design, so the literal "item count = published posts" (28) does not apply; the 28 post items are set-equal to the posts derived from frontmatter (29 files − 1 draft `come-back-later` − 0 scheduled, with the code's 15-min margin giving the same 28) and the 7 tip items to the 7 tips; no duplicates, the draft absent (§10 item 33). `rss.xml`, `robots.txt` and the 5 sitemaps are byte-identical to main; the index differs only in `<lastmod>`. |
| W2 | Internal link integrity (`/`-rooted refs, case-exact) and in-page `#fragment`s | PASS | 130 HTML files, 3622 `/`-rooted and same-site refs, 0 broken, including 2175 `a[href]` (187 unique), 127 `link[rel=icon]` and 127 `link[rel=sitemap]`. 347 in-page fragment links: 0 unmatched, 0 empty. 0 cross-page fragments, 0 duplicate ids, 0 links to redirect stubs. The only unresolved same-site absolute URLs are the 3 on `/404.html` (`canonical`, `og:url`, `twitter:url` = `https://www.novifyx.com/404/`), identical on main (§10 item 2); the branch-only broken set is empty, and main has 56 more (the post `og`/`twitter` images Task 17 fixed). |
| W3 | Redirects `/posts/1/` → `/posts`, `/tips/1/` → `/tips`; custom 404 | PASS | `astro.config.mjs:20-23`; both stubs carry `<meta http-equiv="refresh" content="0;url=/posts">` (or `/tips`), byte-identical to main; `/posts/1/`, `/posts/1`, `/tips/1/`, `/tips/1` → 200 (meta refresh) and the targets → 200. `/this-route-doesnt-exist` (with and without the slash) → 404 text/html, body `cmp`-identical to `dist/404.html` ("404 ¡Ay, caramba! Page Not Found Go back home"), same as main. |
| W4 | An OG image for every eligible post; valid 1200×630 PNG | PASS | The route's filter (`!draft && !ogImage`, `src/pages/posts/[slug]/index.png.ts`) expects 28; 28 `dist/posts/*/index.png` are present, set-equal, and the draft has none. sharp 0.35.4 / libvips 8.18.6 decodes all 29 (28 + `og.png`): PNG signature, 1200×630, full raw decode. The 28 post PNGs are byte-identical to main. |
| W5a | Partytown config: `sandboxParent:"html"` and the gtag persist attributes | PASS | 127/127 Layout pages (130 HTML − 2 redirect stubs − the Partytown sandbox asset): exactly one config script in `<head>` containing `{lib:"/~partytown/",sandboxParent:"html",debug:!1}` and `forward ["dataLayer.push"]`, with exactly one `sandboxParent:` key; the gtag `src` script has `data-astro-transition-persist="gtag-src"` and the inline one `"gtag-init"`, each exactly once per page (127 each site-wide, no other persist values). The checker was tightened once during the run (Partytown's own reader `querySelector(a.sandboxParent\|\|"body")` is a second token); the corrected checker fails all 127 main pages as a negative control. |
| W5 | Partytown assets and GA `text/partytown` blocks with forwarded `dataLayer.push` | PASS | All 5 files in `dist/~partytown` → 200 and `cmp`-equal: `partytown.js` 3198, `partytown-sw.js` 47177, `partytown-sandbox-sw.html` 45949, `partytown-atomics.js` 46049, `partytown-media.js` 8800. `@qwik.dev/partytown` 0.14.4. 127/127 pages have exactly 2 `type="text/partytown"` blocks and `forward ["dataLayer.push"]`. Run in Node, the inline gtag body gives `dataLayer=[["js",<Date>],["config","G-QQMCTBW5TH"]]`, the same as main. |
| W6 | Asset references resolve (script, stylesheet, img, srcset, island URLs) | PASS | Case-exact, 0 broken in every category: `script[src]` 262, stylesheets 145, `img[src]` 41, srcset candidates 74, `component-url` 17, `renderer-url` 17, URL strings in island props 35. 333/333 unique internal paths → 200 from the preview. JS module graph: 9 files, 8 import specifiers, 0 unresolved. CSS `url()`: 0 non-data refs. Per-category counts equal main. |
| W7 | `<head>` sanity on `/`, a post, a tip, `/tags/`, `/about/` vs main, **including "og:image resolves"** | PASS | Pages: `/`, `/posts/audio-vs-paper-books/`, `/tips/motivation-is-a-trap/`, `/tags/`, `/about/`. Title, description, canonical (200), `og:url` and `theme-color` equal main on 5/5. **og:image resolves on 5/5**: on the post it is now `https://www.novifyx.com/posts/audio-vs-paper-books/index.png` → 200 image/png (main: `…/audio-vs-paper-books.png` → 404). Site-wide, 28/28 posts point `og:image` and `twitter:image` at their own `/posts/<slug>/index.png`, and all 254 `og`/`twitter` image URLs (29 unique) return 200. Head tag multisets are equal on 5/5 (36/44/41/36/36 elements). Attribute deltas, all explained: generator Astro v6.2.1 → v7.3.5; the two Task 14 persist attributes; the post image URL (Task 17); hashed chunk renames; `/` stylesheet `index@_@astro.XXiaa8fH.css` → `index.C0tC3-oh.css` (Vite 8 naming, 200). The CSS selector comparison finds 412 main-only selector leaves, all unused on the branch (0 of their 399 classes appear in branch `dist` class attributes or island JS strings), plus `.shrink-0`/`.grow` surviving as the used halves of main's split selector lists. |
| W8 | Built page sets vs the pre-upgrade build | PASS | Equal sets, not just counts: posts 28, post pagination 6, tips 7, tip pagination 2, tags 68, tag pagination 8, threads 2, other pages 8. Both builds report 127 pages; the extra `.html` on the branch (130 vs 129) is the Partytown sandbox asset. |
| W9 | OG baseline hashes (`shasum -a 256`) | PASS | `dist/posts/audio-vs-paper-books/index.png` = `951f184b268e003e34c26b90e7109b07c988969269b38a0e3892e668c5838660`, equal to `baseline/2026-09/og/sha256.txt`. `dist/og.png` = `ae6c9aa406da0d27944d155e4e9ec5fe8a92116b2f78d9897fe14697749e8902`, equal to Task 6's accepted value (the fresh main build's `og.png` is the pre-satori `5eb52b44…`), so no visual fallback was needed. The report writer re-hashed both at 20:32Z with the same result. |
| W10 | TOC `<details>` counts in `dist` (.md and .mdx) | PASS | `grep -o '<details' \| wc -l`: `audio-vs-paper-books` (.md) 1, `ems-the-delivery-system` (.md) 1, `dad-ops-playbook` (.mdx) 1, equal to `baseline/2026-09/toc-counts.txt` (1/1/1). One `<summary>Open Table of contents</summary>` each; 8/10/7 TOC links, all to in-page ids; each TOC block byte-identical to main. |
| P6 | TOC collapse in a browser, .md `audio-vs-paper-books` and .mdx `dad-ops-playbook` | PASS | PW P6 (6/6): exactly 1 `<details>` per page with summary "Open Table of contents", closed initially with the links not visible; a real click on the summary opens it; anchors exist for 8/8 and 7/7; two real link clicks per post set the hash and scroll the target into view. |
| W11 | Toolchain and config (Phase 2) | PASS | `@astrojs/sitemap` absent from `package.json` and `pnpm-lock.yaml` (R23). `packageManager` `pnpm@10.34.5` = registry max `^10` (R25). lint-staged simulated with lint-staged 17.5.1's own `generateTasks` on 1121 paths: `*.{js,mjs,cjs,jsx,ts,tsx,astro}` → eslint --fix then prettier; `*.{md,mdx,json,css,yml,yaml}` and `.prettierrc` → prettier; 0 overlaps, 0 tracked files of a covered extension unmatched (R22). `.prettierrc` `astroCompressHTML: true` matches `astro.config.mjs:88` `compressHTML: true`. `ci.yml`: `actions/checkout@v7`, `pnpm/action-setup@v6` with no `version:` (reads `packageManager`), `setup-node@v7` with `.nvmrc` and `cache: pnpm`, then install, check, lint, **format:check**, build, `audit --prod`; no `corepack` under `.github/` (R24). `dependabot.yml`: the prod-minor and dev-minor `exclude-patterns` are each set-equal to the 17-pattern union of the named groups. Audit and outdated: §9, §10 item 30. |

---

### 6. devToolbar decision (spec §5.2; plan Step 9)

| Check | Result | Evidence |
|---|---|---|
| T8b: devToolbar workaround removed | PASS (carried from Task 8b; not re-run at `9eb1ec3`) | v1's devtoolbar lane decided to remove the T-38 workaround after 9/9 toolbar-on cold starts were clean on Astro 7.3.4 / Vite 8.3.0 (v1 §5). Commit `58f9565` (Task 8b) removed `devToolbar: { enabled: false }`; `astro.config.mjs` at `9eb1ec3` has no `devToolbar` key (it is unchanged since `80a9626`). Since v2, `package.json` and `pnpm-lock.yaml` are unchanged (astro 7.3.5, vite 8.3.0), so nothing that affects the dev toolbar moved. The toolbar is dev-only; the production checks above are unaffected. |

---

### 7. What changed since v2 (`63efd08..9eb1ec3`)

`git diff --stat 251172b..9eb1ec3` touches three files: `CLAUDE.md` (+1 line), `src/layouts/PostDetails.astro` and `src/styles/base.css`. `package.json`, `pnpm-lock.yaml`, `astro.config.mjs`, `src/content/` and `public/` are unchanged.

| Commit | Task | Change | Verified in v3 by |
|---|---|---|---|
| `251172b` | 8 (v2) | The v2 report, `qa-runs/T-39-2026-09-v2/` and backlog (documentation only). Its artifact text is what exposed the Tailwind scanning problem below. | — |
| `20d335f` | 17 (R36) | `src/layouts/PostDetails.astro`: the fallback `og:image`/`twitter:image` URL changed from `` `/posts/${post.id}.png` `` to `` `/posts/${post.id}/index.png` ``, the path the OG route `src/pages/posts/[slug]/index.png.ts` actually emits. Fixes v2's W7 failure (pre-existing on main and in production). | W7 (254/254 image URLs → 200), W2 (branch-only broken set empty), W4, W9; the build lane's check that the 28 posts point at `/posts/<slug>/index.png` and all 29 distinct post-page `og:image` URLs return 200 |
| `5723bef` | 17b (R37) | `src/styles/base.css` line 1: `@import 'tailwindcss'` → `@import 'tailwindcss' source('..')`. Tailwind v4's automatic source detection scanned every tracked file, so words in `docs/`, `CLAUDE.md` and other Markdown generated unused utilities, and a doc edit could rename the CSS bundle (Task 17 r0 found the word "isolate" in the v2 QA artifact adding `.isolate{}` and renaming the Footer CSS). Tailwind now scans only `src/` (including `src/content/`). | §4.2, §4.3 (VR7-VR10), W7 selector comparison, Chrome CSS-R38, PW V2-compare (912/912) |
| `9eb1ec3` | 17c (and 17d, squashed into this one docs commit per the ledger) | `CLAUDE.md`: a note that Tailwind scans only `src/` and that a class used only outside `src/` (e.g. a future `public/` script) needs an explicit `@source` line. | Documentation only. Because `CLAUDE.md` is no longer scanned, it has no effect on `dist/` (Footer CSS is the same 63291 B as after `5723bef`). |

**Task 17b CSS size change:** `dist/_astro/Footer.*.css` went from 98690 B (v2's `63efd08` build) to **63291 B** (`Footer.BnrdipP9.css`), −35399 B (about −36%). jampack's input total went from 49.01 MB to 48.97 MB. The other CSS assets are unchanged: `ec.s4b1i.css` 24428 B, `index.C0tC3-oh.css` 8921 B, `Tips.i4aH78fP.css` 13295 B. Main's Footer bundle (`Footer.CKIJxfJt.css`) is about 96 KiB, so the branch now ships about a third less CSS than main.

**Proof that no rule the site uses was removed.** The counts below come from different methods, so they are listed separately:
- **Rule liveness (VR9):** of the 428 rules only in main's CSS, 402 match 0 elements in any of 300 visits (all 129 pages × 2 themes plus interactive states), and 0 of their 399 class tokens appear in any DOM of either build; 12 are `@property`/`@keyframes` used only by those removed utilities; 14 have a same-effect counterpart on the branch.
- **Rendered result:** 0 differing standard longhands, pseudo-elements or rects over 221,564 element comparisons at 4 widths × 2 themes (VR7) and 332,108 comparisons under forced `:hover`/`:focus` (VR8); 7/7 comparator controls (VR10); the 28 v3 screenshots are byte-identical to v2's and to main's (§4.1, §4.2).
- **Selector leaves (site-wide W7):** 412 main-only selector leaves; 0 of their 399 classes appear in branch `dist` class attributes or island JS strings.
- **Islands:** every class used by `ImageSliderClient`, `Search`, `TagsList` and `Card` has a rule in `dist` (CSS-R38), and 912/912 measured island values equal v2 (V2-compare).
- **Classes from outside `src/` markup:** `astro.config.mjs` plugins inject no classes, Expressive Code's CSS is a separate bundle byte-identical on both builds, `public/toggle-theme.js` makes no `classList` calls, and every runtime class mutation in `src/` (menu, "Expand all", reading progress, heading links) was exercised; none of the 399 removed tokens occurs in any visited DOM.
- **Ledger at Task 17b** (for reference, a third method): 412 rules removed, 0 of 397 classes used in `dist`, 0 rules added.

Measured differences from v2: install `+719` both; pages 127, files 362, HTML 130, jampack files 308 and the 9 MODULE_LEVEL_DIRECTIVE warnings unchanged; jampack `48.97 → 46.13 MB` (v2 `49.01 → 46.16 MB`); Footer CSS −35399 B; post `og:image` URLs 28 × 404 → 28 × 200; clean-profile console errors 0 → 0; every screenshot byte-identical to v2's.

---

### 8. Peer warnings (R11 criterion; R13: transitive peer warnings are recorded here)

Source: `qa-runs/T-39-2026-09-v3/peers.txt`. `pnpm install --resolution-only` on a `mktemp -d` scratch copy exited 0, and the scratch lockfile sha256 `cb7f0f70…d8d6aea1` was unchanged and equal to the repo lockfile. The lane pipeline was also run verbatim in a fixed scratch directory, with identical output apart from the "Done in" timing.

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
| `@divriots/jampack 0.34.1 > quicklink 2.3.0 > react/react-dom@^16.8.0` (found 19.3.0) | SAME. Transitive and upstream-locked: jampack 0.34.1 is the registry latest and declares `quicklink ^2.3.0`; quicklink 2.3.0 is the newest 2.x; only quicklink 3.x (latest 3.0.2) accepts React 19. | PASS (informational under R11/R13) |
| `astro 6.2.1 > tsconfck 3.1.6 > typescript@^5.0.0` | GONE (0 `tsconfck` entries in the lockfile) | PASS |
| `astro-eslint-parser 3.0.0 > … > @napi-rs/wasm-runtime 1.2.0 > @emnapi/runtime@^2.0.0-alpha.3` | GONE (`@napi-rs/wasm-runtime` 1.2.4 peers `^1.7.1 \|\| ^2.0.0-alpha.4`) | PASS |
| `eslint-plugin-jsx-a11y 6.10.2 > eslint@^3..^9` | GONE (replaced by `eslint-plugin-jsx-a11y-x`) | PASS |
| NEW unmet peer under a direct-dependency parent | none | PASS |

Deprecated subdependencies: 4 in the baseline, **1** now: `whatwg-encoding@2.0.0`, via jampack 0.34.1 > `@divriots/cheerio@1.0.0-rc.12` > `encoding-sniffer@0.0.2` (`^2.0.0`); 2.0.0 is the only 2.x ever published, so it is not fixable within the declared ranges. No direct dependency is deprecated.

---

### 9. Outdated packages and caps

Source: `qa-runs/T-39-2026-09-v3/outdated.txt` (captured 18:54:45Z; registry cross-check 18:55:08Z, fresh).

| Check | Result | Evidence |
|---|---|---|
| `pnpm outdated` lists only the capped packages | PASS | Exactly two rows: `@types/node (dev) 22.20.4 → 26.6.2` and `typescript (dev) 6.0.3 → 7.0.2`; the JSON gives `wanted` = `current` for both, `isDeprecated false`. Exit 1, which `pnpm outdated` returns whenever it lists anything. |
| All other direct dependencies at registry latest | PASS | Independent registry cross-check: 38/40 direct dependencies at `dist-tags.latest`; the other 2 are exactly the two caps; 0 deprecated (installed or latest). No registry drift for direct dependencies since v2: today's modified timestamps on typescript-eslint (canary 8.70.2-alpha.7) and typescript (nightly 7.1.0-dev.20260924.1) come from prerelease publishes only. |
| TypeScript cap is justified | PASS | Stable 6.x releases are 6.0.2 and 6.0.3, so 6.0.3 is the highest. `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser` and `typescript-eslint` @latest 8.70.1 (and the canary) all peer `typescript ">=4.8.4 <6.1.0"`; `@astrojs/check@latest` 0.9.10 peers `"^5.0.0 \|\| ^6.0.0"`. `semver.satisfies`: 7.0.2 fails both, 6.0.3 passes all. |
| `@types/node` cap is ruled | PASS (R27) | R27 pins `@types/node` exactly to the latest 22.x to match the Node 22 runtime; `semver.maxSatisfying(all 2373 published, '^22')` = 22.20.4 = installed. No peer range forbids 26.x (the only declared peer is vite 8.3.0's optional `^20.19.0 \|\| >=22.12.0`), so this cap rests on R27 and the runtime, not on peer ranges. Dependabot ignores its majors (W11). |

Toolchain: Node v22.23.3 is the latest v22 LTS. pnpm 10.34.5 is the latest 10.x; R25 keeps the major at 10.

---

### 10. Observations and pre-existing issues (not failures of T-39)

**Pre-existing site defects found but not fixed** (identical on main; outside T-39's "no content or design changes" scope; follow-ups for the user):
1. **Four relative links in three flutter .mdx posts 404 on the canonical trailing-slash URLs:** `flutter-google-maps-static-map.mdx:27` `./flutter-google-maps-address-manipulation`; `flutter-google-maps-address-manipulation.mdx:27` `./flutter-google-maps-embedded-map` and `:477` `./flutter-google-maps-setup`; `flutter-google-maps-embedded-map.mdx:27` `./flutter-google-maps-setup`. From `/posts/<slug>/` they resolve to `/posts/<slug>/<other-slug>`, e.g. `/posts/flutter-google-maps-static-map/flutter-google-maps-address-manipulation` → 404; they work (200) only from the non-slash URL. The list is identical on main. Outside W2's `/`-rooted scope. Suggested fix: absolute `/posts/<slug>/` links.
2. **`dist/404.html` canonical URLs** (`canonical`, `og:url`, `twitter:url`) point at `https://www.novifyx.com/404/`, which does not exist (the file is `/404.html`). Identical on main.
3. **Search caret race** (`src/components/Search.tsx:52-55`, unchanged from main: `git diff main..HEAD -- src/components/Search.tsx` is empty): a 50 ms post-mount `setTimeout` resets the caret, so typing that starts inside that window can be reordered (`hiring` → `iringh`). v2 measured it on main too (7/10 in WebKit and in Firefox with immediate typing). It did not reproduce in v3: every typed query arrived intact in all 3 engines.
4. **Duplicate sitemap entries:** `/tags/` and `/threads/` each appear in two sitemaps (114 locs, 112 unique). Harmless; the sitemaps are byte-identical to main.
5. **`<html class="false">`** from `src/layouts/Layout.astro:41` (`` class={`${scrollSmooth && 'scroll-smooth'}`} ``, the same line on main). No visual effect.
6. **Search result links have no trailing slash** (`/posts/ems-the-people-system`); the preview serves both forms 200 without a redirect. `Card.tsx` and `Search.tsx` are unchanged from main.
7. **Carousel `<img>` `!my-0` loses** to the base-layer `prose-img:my-2!` (`src/styles/base.css:126`) under cascade-layer `!important` ordering, so the computed margin is 8 px. `base.css` equals main except the Task 17b `@import` line.
8. **The global `svg` rule** (`fill-skin-base … h-6 w-6`, `src/styles/base.css:119-121`) overrides `fill=none`/`width=14` on the TagsList filter icon, which renders as a filled 24-px glyph (the same in v2's screenshot).
9. **TagsList filter is `type=search`**, so when it is focused and non-empty Chrome shows its native cancel × next to the app's own "Clear filter" ×. `TagsList.tsx` is unchanged from main.
10. **`hover:prose-a:text-skin-accent`** (`src/styles/base.css:126`) never takes effect, because `prose-a:!text-skin-base` (`!important`) in the same `@apply` overrides it. Identical on both builds (visual control C0).
11. **Tips footer sits mid-viewport** on `/tips` at 1800 px, from the Tips redesign `465cc8c`; identical on main.
12. **`baseline/SCREENSHOTS.md` misnames route 03** as a "post with multiple inline images"; it has 0 `<img>` on every build. Images are covered by 04 (7) and 11 (24 images, 16 slides).

**Partytown and analytics:**
13. **PT-1/PT-2 were not verifiable in the user's Chrome profile (R35).** The chrome-islands lane found 0 `iframe[src*='/~partytown/']` on `/`, also after 3 s and after each of 5 client navigations, with `<html>` children `HEAD,BODY`. From the page, `fetch('/~partytown/partytown-sw.js')` fails ("TypeError: Failed to fetch") while `curl` returns 200 text/javascript and the sibling `~partytown` assets fetch 200 from the same page. The SW is blocked client-side (uBlock Origin Lite, R20), `serviceWorker.register` rejects, and Partytown 0.14.4 runs the scripts on the main thread (`text/partytown-x`) without creating the sandbox iframe. The lane reported FAIL on both rows; no file is suspected (the served config is correct, PT-0, and the `transition:persist` half of the fix is verified in this profile, PT-3). **Authoritative clean-profile result: playwright-e2e P0, PASS** (the iframe under `<html>` on 12/12 snapshots, the same element after 10/10 navigations, 1 load, in 5/5 runs; §3), with VR6 and P9 in support.
14. **Short-dwell page views.** GA4 records a soft-navigation `page_view` only for pages that stay open long enough (all 3 s pages; 1 of 14 at 0.5 s in `pt-repro`). This depends on GA4's "Page changes based on browser history events" setting, which must stay on (CLAUDE.md, spec §7.2).
15. **The user's Chrome profile** also has a leftover service worker at `/~partytown/debug/` from an earlier dev session; it controls no page.
16. **Firefox warnings** (61, not errors; v2 had 59): Partytown sandbox property-enumeration deprecation notices (`InstallTrigger`, `onmozfullscreen*`, `SVGGraphicsElement.*ViewportElement`, `MouseEvent.moz*`) and gtag `_ga`/`_ga_QQMCTBW5TH` cookie SameSite notices. The +2 is in the timing-dependent cookie count. Chrome and WebKit logged 0 warnings.

**Environment and harness notes:**
17. **Hidden Chrome window** (§1.1): the slider's smooth scroll advances only on screenshot-forced frames, `resize_window` did not change the viewport, and the `computer` scroll action produces no DOM `wheel` events. The affected real-input checks were graded on Playwright.
18. **`InvalidStateError: Transition was aborted because of invalid state`**: 1 per ClientRouter navigation in the hidden document (7/7). Hidden-window artifact; 0 in PW's visible document.
19. **WebKit console attribution:** WebKit logs refused proxy connections as `kCFErrorDomainCFNetwork error 310` with no URL. All 36 are attributed to the harness-blocked analytics hosts: the proxy refused only `www.google-analytics.com` and `www.google.com`, and each label has exactly 2 errors per refused `g/collect`.
20. **`pt-repro` route mode** logged 10 `g/collect` POSTs ending `net::ERR_ABORTED` against its local fake Google. Not `proxytown` requests or console errors; excluded by its verdict; v2 saw the same.
21. **Scope limits:** real Safari was not verified (WebKit 17.4 only). P9 uses Playwright 1.44.1 because only its browser builds are cached. The devToolbar cold-start test (§6) was not re-run.
22. **Preview listens on IPv6 only** (`localhost` → `::1`, shown by `lsof` as `localhost:rwhois`, the `/etc/services` name for 4321); `http://127.0.0.1:4321/` is refused. Astro's default on macOS.
23. **Lane process notes:** main's Astro 6.2.1 preview runs in the foreground with no `stop` subcommand, so the visual lane stopped it (PID 19801, and later PID 15115 after a rebuild for the detail-cap re-inspection) by SIGTERM after checking each process's cwd with `lsof`; the :4321 daemon stayed up. The site-wide lane built and removed its own main worktree. A Claude Code safety check blocked the build lane's second, verbatim peer run (`rm -rf` of a `mktemp -d` variable in one command) before it executed; it was re-run in a fixed scratch directory with identical output. Every scratch worktree is gone (B12).
24. **No GIF** was produced (§2.1).

**Visual and build notes:**
25. **Serialisation-only CSS changes** from the branch toolchain (Astro 7 / Vite 8 CSS pipeline, lightningcss 1.33.0): `-translate-y-1/2` `-50%` → `calc(calc(1 / 2 * 100%) * -1)`, `rounded-full` `3.40282e38px` → `2147483647px`, line-heights `1.5`/`1.2` → `calc(…)`, `min-width` → range syntax, duplicate selectors and `@layer properties` blocks merged. All equal by computed value and pixels (§4.3); build-output drift from Tasks 4, 7 and 13, not Task 17b.
26. **`--ease-in-out`** was dropped from `:root` by Task 17b, but its only remaining use (the Header `.menu-icon line` transition) carries the identical fallback `cubic-bezier(.4, 0, .2, 1)`. If a future `src/` edit uses the `ease-in-out` utility, Tailwind emits the variable again.
27. **Forced-state 404 re-emission:** the second document-404 console error per run on `/this-route-doesnt-exist` in the forced-state pass is the same 404 re-emitted after `addStyleTag` plus CDP `CSS.enable` (`e404-probe.mjs`); identical on both builds.
28. **Carousel border colour** computes to a light grey `oklch(0.928 0.006 264.531)` in both themes; unchanged from v2 and main.
29. **CSS moved to the shared bundle:** Astro's view-transition `@keyframes` and the reduced-motion rule moved from per-page inline `<style>` into `Footer.css`, so `/` and `/about/` load them too. On `/about/` the breadcrumb `<style>`, the `Footer.css` link and the Partytown bootstrap moved to the end of `<head>`, matching the other pages; the cascade is unaffected. Same as v1/v2.
30. **Audit:** `pnpm audit --prod` = 1 moderate, `fflate@0.7.3` via satori's exact pin (GHSA-px8p-9vwx-vf98). Full `pnpm audit` = 17 (2 low, 10 moderate, 5 high, 0 critical), all in the build-time jampack tree (undici 12, sharp 2, esbuild 1, file-type 1) plus fflate; none fixable within the declared ranges.
31. **Build warnings:** the 9 Vite `[MODULE_LEVEL_DIRECTIVE] "use astro:head-inject"` warnings (one per .mdx post) are the known item parked in Task 4 (upstream Astro 7 + Rolldown). No other warning types.

**Check wording and process notes:**
32. **B9 vs the lane template:** the lane text names only `typescript` as an allowed outdated package, but binding ruling R27 pins `@types/node` to the latest 22.x; recorded as PASS citing R27, as in v2. "Every command exited 0" cannot apply to `pnpm outdated`, which exits 1 whenever it lists anything; all gate commands, `pnpm list`, the peer run and the preview start exited 0.
33. **W1 wording:** the literal "RSS item count equals the number of blog posts" is 35 ≠ 28 because `rss.xml.ts` merges the 7 tips by design (second run in a row). The site-wide lane recommends rewording it to "post items = published posts; tip items = published tips".
34. **Task 9 Step 1 grep:** the plan's `grep -ciE '\bFAIL\b'` on this file counts v1's and v2's history rows and the "as reported" lane verdicts in §12. It cannot reach 0 while v1 and v2 are kept here; how to apply that gate is a controller decision.

---

### 11. Defects

| ID | Description | Regression? | Status |
|---|---|---|---|
| (none open) | — | — | No open defect. No T-39 regression was found in any lane, so no `defects/T-39-D<n>.md` was needed. |
| v2 open item | **Post `og:image`/`twitter:image` URLs returned 404** (v2 W7). `PostDetails.astro:34` pointed at `/posts/<slug>.png`; the image is generated at `/posts/<slug>/index.png`. | No (pre-existing on main `3df6160` and in production). | **Fixed** in `20d335f` (Task 17, ruling R36); W7 PASS in v3 (§5): 254/254 image URLs → 200. |
| Task 17 r0 side finding | **Tailwind v4 automatic source detection scanned tracked `docs/` and Markdown**, so QA-artifact text could add CSS rules and rename the CSS bundle. | No (the same scanning applied on main; it surfaced when Task 17 compared `dist` with the v2 build). | **Fixed** in `5723bef` (Task 17b, ruling R37); documented in `CLAUDE.md` by `9eb1ec3`. No used rule removed: VR7-VR10 PASS (§4.3, §7). |
| v1 open item | **ClientRouter navigation logged a Partytown `proxytown` NetworkError** (v1 §9). | No (pre-existing on main and in production). | **Fixed** in `80a9626` (Task 14); still 0 in v3: §2.7 and §3 PASS. |

---

### 12. Overall verdict

| Lane | Lane verdict (as reported) | After grading in this report |
|---|---|---|
| build | PASS | PASS (§1, §8, §9) |
| chrome-islands | FAIL (PT-1 and PT-2: not verifiable in the user's profile, because an extension blocks the Partytown service worker and Partytown never creates its sandbox) | PASS. Under R35, PT-1 and PT-2 are graded on the clean-profile authority, playwright-e2e P0, which verifies both assertions directly, with VR6 and P9 in support (§3); the chrome finding is recorded as §10 item 13. The real-input slider checks are graded on PW (plan Step 2); every other chrome check passed. |
| playwright-e2e | PASS | PASS (§2, §3) |
| visual-regression | PASS | PASS (§4) |
| site-wide | PASS | PASS (§5); W7, v2's only failure, now passes |
| devtoolbar | PASS (carried from Task 8b) | PASS (§6); not re-run at `9eb1ec3` |

**FAIL rows:** none.

**Overall: PASS**

Carried forward by v4 above (Phase 3 delta proof).

No failure is open under R8 and spec §5.3, so the Task 8 condition for Task 9 (push and PR) is met on `9eb1ec3`. v2's W7 failure is resolved by the fix in `20d335f`, and every lane was re-run on the final tree (R38).

---

## v2 (2026-09-24, commit 63efd08)

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

Superseded by v3 above: og:image fixed in 20d335f (Task 17); Tailwind source detection limited to src/ in 5723bef (Task 17b).

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
