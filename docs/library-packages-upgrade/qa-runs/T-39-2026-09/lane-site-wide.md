# T-39 Task 8: QA lane "site-wide" (artifact and route integrity)

- **Verdict: PASS.** All 10 checks (W1–W10) pass. There are no regressions against the pre-upgrade `main` build.
- **Needs a follow-up (pre-existing, not a regression, doesn't block):**
  - Every blog post's `og:image` and `twitter:image` point to `/posts/<slug>.png`.
  - That URL returns 404 in the branch build, in the `main` build and on the live site.
  - The real image is at `/posts/<slug>/index.png`.
  - Details are under "Observations" below.
- **Repo / HEAD:** `/Users/ap/development/other/eliotik.github.io` @ `55a65300a2dce56e7c225232ca8c4abb2c7bd5b4` (branch `upgrade/2026-09`).
- **What was tested:**
  - The build is `dist/`, produced by the build lane at 2026-09-24 03:04 UTC. It has 130 `.html` files, 362 files in total, and generator `Astro v7.3.4`.
  - It's served by the shared `astro preview` at `http://localhost:4321`. This lane did not start or stop it.
- **Pre-upgrade reference (for W7/W8, and as a regression cross-check for W1–W6/W9/W10):**
  - I did not do my own build. The visual lane had already built `main` (`3df6160`) in its worktree `…/scratchpad/t8/main-before`: clean `git status`, `astro check` 0 errors / 0 warnings / 0 hints, `astro build` "127 page(s) built", jampack "307 files", `exit=0` (log: `…/scratchpad/t8/visual-regression/main-build.log`).
  - Its `dist/` has 129 `.html` files and generator `Astro v6.2.1`.
  - I took a read-only snapshot with `rsync` to `…/scratchpad/t8/site-wide/main-dist/`. The Node version used for that build isn't recorded in its log.
  - Its `og.png` hash equals the committed baseline `5eb52b44…`, which suggests it matches the Task 0 baseline build.
  - I created my own worktree `…/scratchpad/t8/site-wide-main` before I found the visual lane's build. It was never built, and I removed it with `git worktree remove --force`. `git worktree list` no longer shows it.
  - I did not touch the visual lane's `main-before` worktree or its preview on port 4331.
- **Tooling:**
  - Node v22.23.3 (`nvm use` from `.nvmrc`).
  - `xmllint` (macOS system).
  - A Python 3 `html.parser` crawler.
  - sharp 0.35.4 / libvips 8.18.6, from the repo's `node_modules`.
- **Case sensitivity:** APFS (macOS) and the preview server are case-insensitive, but GitHub Pages is case-sensitive. So every dist resolution in W2, W6 and W1 was also re-run with a **case-exact** resolver that checks each path component against `os.listdir`. Results were identical.
- **Files touched:** this report only. `git status --porcelain` shows only `?? .claude/`, `?? .serena/` and `?? docs/library-packages-upgrade/qa-runs/T-39-2026-09/`.

## Summary

| ID | Check | Result | Key evidence |
|---|---|---|---|
| W1 | RSS, sitemaps, OG, robots: status, types, xmllint, item count, `<loc>` reachability | **PASS** | 5/5 → 200 with correct types. `xmllint` ok on rss plus 6 sitemaps. RSS 35 items = 28 posts (set-equal to the frontmatter-derived 28) + 7 tips (set-equal). 114/114 `<loc>` → 200, 0 redirects. Byte-identical to `main` apart from timestamps. |
| W2 | Internal link integrity plus in-page fragments | **PASS** | 130 pages. 2175 `a[href]` (187 unique) plus every other `/…` href/src: 0 broken, case-exact. 347 in-page `#fragment` links: 0 unmatched, 0 `#top` exemptions used. |
| W3 | Redirects and custom 404 | **PASS** | `dist/posts/1/index.html` has meta refresh `0;url=/posts`, and `dist/tips/1/index.html` has `0;url=/tips` (both byte-identical to `main`). `/this-route-doesnt-exist` → 404, and the body is byte-identical to `dist/404.html` ("404 ¡Ay, caramba! Page Not Found Go back home"). |
| W4 | OG images for every eligible post | **PASS** | 28 expected (non-draft, no `ogImage`) = 28 present (set-equal). All 29 PNGs (28 + `og.png`) have a valid signature, format png, are 1200×630 and fully decode. 28/28 post PNGs are byte-identical to `main`. |
| W5 | Partytown assets and GA blocks | **PASS** | 5/5 files in `dist/~partytown` → 200. 127/127 content pages have exactly 2 `text/partytown` blocks (gtag src plus the inline config) and the snippet with `forward` = `["dataLayer.push"]`, `lib:"/~partytown/"`. The inline GA body runs and yields `dataLayer = [["js",<Date>],["config","G-QQMCTBW5TH"]]`. |
| W6 | Asset references resolve | **PASS** | 262 `script[src]`, 145 stylesheet `link`, 41 `img[src]`, 74 srcset candidates, 17 `component-url`, 17 `renderer-url`, 127 icon, 127 sitemap `link`: 0 broken, case-exact. 299 unique internal paths → HTTP 200 from the preview. 8 JS import specifiers and 0 CSS `url()` refs in `_astro/`: 0 unresolved. |
| W7 | `<head>` sanity on 5 pages vs `main` | **PASS** (1 pre-existing defect, see Observations) | title, description and canonical match `main` on all 5 pages. `og:image` resolves on `/`, the tip, `/tags/` and `/about/`. On the **post** page it does NOT resolve (`/posts/audio-vs-paper-books.png` → 404, and the same on `main` and in production). Element counts and tag multisets are equal on all 5 pages. Every delta is explained below. |
| W8 | Content collection page counts vs `main` | **PASS** | posts detail 28/28, posts pagination 6/6 (incl. the `/posts/1/` stub), tips detail 7/7, tips pagination 2/2, tags 68/68, tag pagination 8/8, threads 2/2. The sets are equal, not just the counts. |
| W9 | OG hashes (brief Step 8) | **PASS** | `dist/og.png` = `ae6c9aa4…8902` (Task 6's accepted hash, exact). `dist/posts/audio-vs-paper-books/index.png` = `951f184b…0660` (baseline `sha256.txt`, exact). |
| W10 | TOC (brief Step 8) | **PASS** | `<details>` counts are 1/1/1, equal to `toc-counts.txt`. Each post has one `<summary>Open Table of contents</summary>`. There are 8/10/7 TOC links, all resolving to in-page ids. Each TOC block is byte-identical to `main`. |

## W1: RSS, sitemaps, OG, robots

HTTP (`curl -s -o /dev/null -w "%{http_code} %{content_type}"` against `http://localhost:4321`):

```
/rss.xml 200 text/xml 14458
/sitemap-index.xml 200 text/xml 772
/og.png 200 image/png 13366
/posts/audio-vs-paper-books/index.png 200 image/png 14919
/robots.txt 200 text/plain 167
```

`xmllint --noout`:

| File | Result |
|---|---|
| `rss.xml` | rss-ok |
| `sitemap-index.xml` | ok |

The sitemap index references 5 sitemaps. Each was fetched from the preview and checked with `xmllint`:

| Sitemap | HTTP | Content type | xmllint | `<loc>` count |
|---|---|---|---|---|
| `/sitemap-pages.xml` | 200 | text/xml | ok | 7 |
| `/sitemap-posts.xml` | 200 | text/xml | ok | 28 |
| `/sitemap-tips.xml` | 200 | text/xml | ok | 7 |
| `/sitemap-threads.xml` | 200 | text/xml | ok | 3 |
| `/sitemap-tags.xml` | 200 | text/xml | ok | 69 |

- **Every `<loc>` returns 200:**
  - All 114 `<loc>` values were fetched with `https://www.novifyx.com` mapped to the preview, using `curl -L`. Result: `114 × 200`, `num_redirects = 0` for all, all `text/html`.
  - A case-exact resolve against `dist/` also gave 0 unresolved (114 locs, 36 RSS `<link>`, 35 RSS `<guid>`, 5 index locs).
- **robots.txt** (`dist/robots.txt`, 9 lines):
  - `User-agent: Googlebot` / `Disallow: /nogooglebot/` / `Disallow: /~partytown/`
  - `User-agent: *` / `Allow: /` / `Disallow: /~partytown/`
  - `Sitemap: https://www.novifyx.com/sitemap-index.xml`
- **RSS item count:**
  - **Derived from frontmatter:** `src/content/blog` has 29 files: 1 draft (`come-back-later`, `draft: true`) and 0 scheduled. That leaves 28 published posts.
    - The code's rule (`collectionFilter.ts`: `now > pubDatetime − 15 min`) and the task's rule (`pubDatetime <= now`) both give 28, because no post has a future date.
    - The derivation ran at 2026-09-24T03:13Z, about 9 minutes after the build.
  - **Tips:** `src/content/tips` has 7 files, none draft or scheduled, so 7.
  - **Why the feed has 35 items, not 28:** `src/pages/rss.xml.ts` merges posts and tips by design. So the feed has **35 items**: 28 `/posts/` and 7 `/tips/`.
    - The literal check wording ("item count equals the number of blog posts") holds for the post subset.
    - The 28 post links are set-equal to the 28 derived slugs: missing ∅, extra ∅, and the draft is absent.
    - The 7 tip links are set-equal to the 7 `customSlug`s.
    - No duplicate links. Every item has title, link, guid, pubDate and description.
  - **Regression cross-check:** `dist/rss.xml` is **byte-identical** to `main`'s. Every sitemap is identical to `main`'s apart from `<lastmod>` build timestamps. `sitemap-posts` matches the published blog set, `sitemap-tips` the tip set, and `sitemap-tags` the 68 `dist/tags/*` directories.

## W2: Internal link integrity

- **Crawler:**
  - Every `.html` in `dist/` (130) is parsed with Python `html.parser`, which decodes entities.
  - It extracts every `href`, `src`, `srcset`/`imagesrcset` candidate, `component-url`, `renderer-url`, `before-hydration-url`, `poster`, `action`, `data-src` and `xlink:href` value that starts with `/` but not `//`. It also takes same-site absolute URLs (`https://www.novifyx.com/…`) from `href` and `meta content`.
  - External, `mailto:` and `tel:` values are ignored.
- **Resolver:**
  - Strip the query and fragment, then URL-decode.
  - Try, in order: a file, `dir/index.html`, or `path.html`. A path ending in `/` must have `index.html`.
  - Then require case-exact path components.
- **Results (branch):** 3622 references on 130 pages. **Every `/`-relative reference resolves (0 broken).**

| Category | Refs | Unique | Broken |
|---|---|---|---|
| `a[href]` | 2175 | 187 | 0 |
| `link[rel=icon]` | 127 | 1 | 0 |
| `link[rel=sitemap]` | 127 | 1 | 0 |
| (asset categories) | see W6 | | 0 |

- **In-page fragments:**
  - 347 `href="#…"` links across the site. **0 have no matching `id` (or `a[name]`) on the same page.**
  - 0 empty `#` links. The `#top` exemption was used 0 times.
  - There are 0 cross-page `/path#frag` links.
- **Links to redirect stubs:** 0. No page links to `/posts/1/` or `/tips/1/`.
- **Same-site absolute URLs** (`canonical`, `og:url`, `og:image`, `twitter:*`): 29 unresolved `(page, url)` pairs. The set is **identical on `main`** (29 on `main`, none branch-only, none main-only). All are pre-existing, see Observations 1–2:
  - 28 post pages have `og:image`/`twitter:image` → `/posts/<slug>.png`.
  - `404.html` has `canonical`/`og:url`/`twitter:url` → `/404/`.
- **`main` cross-check:** the same crawler on `main`'s dist gives the same 3622 references and identical per-category counts. 347 fragment links, 0 bad.

## W3: Redirects and 404

- **The redirect files exist and point to the right place.** Both are byte-identical to `main`'s.

`dist/posts/1/index.html`:
```html
<!doctype html><title>Redirecting to: /posts</title><meta http-equiv="refresh" content="0;url=/posts"><meta name="robots" content="noindex"><link rel="canonical" href="https://www.novifyx.com/posts"><body>	<a href="/posts">Redirecting from <code>/posts/1/</code> to <code>/posts</code></a></body>
```

`dist/tips/1/index.html` is the same, with `0;url=/tips`.

- **Through the preview:**

| Request | Status | Notes |
|---|---|---|
| `/posts/1/`, `/posts/1` | 200 | Body has `content="0;url=/posts"` |
| `/tips/1/`, `/tips/1` | 200 | `0;url=/tips` |
| `/posts` (redirect target) | 200 | 21512 B |
| `/tips` (redirect target) | 200 | 38946 B |
| `/this-route-doesnt-exist`, `/this-route-doesnt-exist/` | **404** text/html | Body is byte-identical to `dist/404.html` (`cmp`) |

- **404 content:** `<title>404 Not Found | Novi Fyx</title>`, and `<main>` reads "404 ¡Ay, caramba! Page Not Found Go back home". The home link has `href="/"` and the full LinkButton classes. The text and classes are identical to `main` except for the Astro scope class (`astro-ibpinaeu` here vs `astro-zetdm5md` on `main`).

## W4: OG images

- **Which posts should have one:** the route `src/pages/posts/[slug]/index.png.ts` generates PNGs for `!draft && !ogImage`.
- **Expected vs present:** from frontmatter, 28 expected (29 posts − 1 draft; none sets `ogImage`). `dist/posts/*/index.png` has 28 present. The sets are equal: missing `[]`, unexpected `[]`. The draft `come-back-later` correctly has none.
- **sharp checks:** sharp 0.35.4 (`node_modules/sharp`) checked all 28 post PNGs plus `og.png`:
  - PNG signature `89504e470d0a1a0a`
  - `metadata().format === 'png'`
  - 1200×630, 4 channels
  - A full raw decode succeeds
  - **29/29 OK, 0 invalid.**
- **vs `main`:** 28/28 post PNGs are **byte-identical** to `main`'s. Only `og.png` differs; see W9.

## W5: Partytown

Every file in `dist/~partytown`:

```
/~partytown/partytown-atomics.js 200 text/javascript 46049
/~partytown/partytown-media.js 200 text/javascript 8800
/~partytown/partytown-sandbox-sw.html 200 text/html;charset=utf-8 45949
/~partytown/partytown-sw.js 200 text/javascript 47177
/~partytown/partytown.js 200 text/javascript 3198
```

- **Scope:** 127 content pages were checked, out of 130 `.html` files. The 3 excluded are:
  - the 2 redirect stubs (`/posts/1/`, `/tips/1/`), which have no layout
  - `~partytown/partytown-sandbox-sw.html`, which is Partytown's own asset
- **What each page must have (127/127 OK):**
  - exactly 2 `<script type="text/partytown">`: one `src="https://www.googletagmanager.com/gtag/js?id=G-QQMCTBW5TH"` async, one inline GA config
  - the Partytown bootstrap snippet containing `lib:"/~partytown/"`, `debug:!1` and `.concat(["dataLayer.push"])` on the `forward` key
- **The snippet's file references all exist in `dist`:**
  - `partytown-sw`
  - `partytown-atomics`
  - `partytown-sandbox`
- **Inline GA body:**
  - It is the same on all pages (1 distinct body). Newlines are preserved, so the `// eslint-disable-next-line` comment can't swallow any code.
  - Run with `new Function` in Node, it produces `dataLayer = [["js",<Date>],["config","G-QQMCTBW5TH"]]`.
- **vs `main`:**
  - `main`'s GA body has the same statements in a different layout (Task 5 Prettier 1.0 reformat: `function gtag(){…}` expanded to multiple lines, and the eslint comment moved inside the function).
  - `main`'s snippet (partytown 0.13.2, 2567 chars) only references `partytown-sw`. The branch snippet is partytown 0.14.4, 3567 chars. Both forward `["dataLayer.push"]`.
  - The branch has one extra file, `partytown-sandbox-sw.html`, which is expected from 0.14.4 (Task 2 note).
- **Not covered here:** whether the service worker registers at runtime. That is Step 2a (Playwright lane).

## W6: Asset references

These come from the same crawl as W2, with the case-exact resolver:

| Category | Refs | Unique | Broken |
|---|---|---|---|
| `script[src]` (internal) | 262 | 3 | 0 |
| `link[rel=stylesheet]` (internal) | 145 | 4 | 0 |
| `img[src]` | 41 | 41 | 0 |
| `img[srcset]` candidates | 74 | 74 | 0 |
| `astro-island[component-url]` | 17 | 3 | 0 |
| `astro-island[renderer-url]` | 17 | 1 | 0 |
| `link[rel=icon]` | 127 | 1 | 0 |
| `link[rel=sitemap]` | 127 | 1 | 0 |

- **Scope:** there are no `<source srcset>`, `modulepreload`, `preload` or `before-hydration-url` values in the build. External scripts and stylesheets (googletagmanager, Google Fonts) are out of scope.
- **Over HTTP:** all 299 unique internal paths referenced by `href`/`src`/`srcset`/island attributes were requested from the preview.
  - Result: **299 × 200**.
  - Content types: 146 text/html, 107 image/webp, 22 image/png, 6 image/gif, 4 image/jpeg, 1 image/svg+xml, 4 text/css, 7 text/javascript, 2 text/xml.
- **Island module graph:** 8 relative `import` specifiers in `_astro/*.js` and root `*.js`, 0 unresolved.
- **CSS:** `url()` refs in `_astro/*.css`: 0 non-data refs, so nothing to resolve.
- **Site `og:image`:** `/novifyx-og.jpg` → 200 `image/jpeg` 140612 B.
- **vs `main`:** per-category ref, unique and broken counts are identical to `main`.

## W7: `<head>` sanity (5 pages) vs pre-upgrade `main`

Pages checked: `/`, `/posts/audio-vs-paper-books/`, `/tips/motivation-is-a-trap/`, `/tags/`, `/about/`.

| Page | title | description | canonical | og:image | resolves | theme-color |
|---|---|---|---|---|---|---|
| `/` | Novi Fyx | New Partial Derivative! | `https://www.novifyx.com/` | `/novifyx-og.jpg` | yes (200) | `""` |
| post | Audio vs Paper Books \| Novi Fyx | My experience so far with audio and paper books. Which one is better for me and why. | `…/posts/audio-vs-paper-books/` | `/posts/audio-vs-paper-books.png` | **no (404)**, pre-existing | `""` |
| tip | Motivation is a trap. Build a system instead. \| Novi Fyx | Motivation is a trap. Build a system instead. | `…/tips/motivation-is-a-trap/` | `/novifyx-og.jpg` | yes | `""` |
| `/tags/` | Tags \| Novi Fyx | New Partial Derivative! | `…/tags/` | `/novifyx-og.jpg` | yes | `""` |
| `/about/` | About \| Novi Fyx | New Partial Derivative! | `…/about/` | `/novifyx-og.jpg` | yes | `""` |

- **Same as `main`:** title, description, canonical, og:image, twitter:image and theme-color are all equal to `main` on all 5 pages.
- **Element counts** (branch = `main`): 36, 44, 41, 36, 36. The tag multisets are equal on every page, for example `/`: meta 18, link 9, script 6, style 1, title 1, noscript 1.
- **`theme-color` is empty at build time on both builds.** `public/toggle-theme.js` fills it at runtime (lines 44–46, `querySelector("meta[name='theme-color']")`), and `dist/toggle-theme.js` is byte-identical to `main`'s.
- **Post `og:image`:** it points to `/posts/<slug>.png`, which does not exist. The generated file is `/posts/<slug>/index.png`. This is the same on `main` and in production; see Observation 1.

Every difference between the branch and `main` (`<head>` elements diffed in order, with `/_astro/*.<hash>.{js,css}` normalized):

1. **`<meta name="generator">`** changes from `Astro v6.2.1` to `Astro v7.3.4`. This is the Astro 7 upgrade, as expected.
2. **Inline `text/partytown` GA script text:** it's the same code with a different layout, from the Task 5 prettier-plugin-astro 1.0 reformat. It was executed and the result checked in W5.
3. **Stylesheet chunk name on `/`:** `/_astro/index@_@astro.<hash>.css` is now `/_astro/index.<hash>.css`. This is Vite 8/Rolldown chunk naming. The file exists and returns 200.
4. **Partytown bootstrap `<script>`:** 2567 chars became 3567 chars. This is `@qwik.dev/partytown` 0.13.2 → 0.14.4 (Task 2). `lib` and `forward` are unchanged.
5. **Inline `<style>` blocks:** the same number of `<style>` elements per page, but CSS is split differently between the component style blocks. For example, the post page had 2544 + 2957 chars on `main` and has 838 + 4797 on the branch. Two things contribute:
   - a `/*! tailwindcss v4.3.3 | MIT License … */` comment that the new minifier keeps (65 chars per block)
   - Astro scope hashes renamed (e.g. `astro-ti6a3mbw` → `astro-eq54l3i4`), so Expressive Code and view-transition blocks keep the same length but differ in text
   - This is Astro 7 compiler, Vite 8 and lightningcss 1.33 (Task 4, Task 7).
   - I checked consistency: all 262 `data-astro-transition-scope` values used in page bodies have a matching CSS rule on the same page (130 pages on the branch, 129 on `main`, 0 missing on both).
   - Whether the pages look the same is the visual lane's job. This lane doesn't claim visual equivalence.
6. **`/about/` only: the head-injected block moved.** The block is the breadcrumb `<style>`, the `/_astro/Footer.<hash>.css` link and the Partytown bootstrap.
   - On `main` it sat right after the Google Fonts `media=print` stylesheet, at positions 23–25. On the branch it sits at the end of `<head>`, positions 33–35, which is where it already is on the other 4 pages on both builds.
   - It moves past these elements: `<noscript>` (Google Fonts), `theme-color`, the 2 GA partytown scripts, the inline theme script, the 2 view-transition metas, the ClientRouter module and `/toggle-theme.js`.
   - The only stylesheet whose order changes relative to site CSS is the Google Fonts CSS, which only declares `@font-face`. So the cascade is unchanged.
   - The likely cause is Astro 7's head-injection point for Markdown pages with a layout (`src/pages/about.md`).

Nothing else differs. No `<head>` tag was added or removed, and no attribute other than the ones above changed on any of the 5 pages.

## W8: Content collection page counts (branch vs `main`)

This compares the `.html` file sets of both builds, classified by path:

| Category | `main` | branch | Same set |
|---|---|---|---|
| `/posts/<slug>/` (detail) | 28 | 28 | yes |
| `/posts/<n>/` (pagination, incl. `/posts/1/` stub) | 6 | 6 | yes |
| `/tips/<slug>/` (detail) | 7 | 7 | yes |
| `/tips/<n>/` (pagination, incl. `/tips/1/` stub) | 2 | 2 | yes |
| `/tags/<tag>/` | 68 | 68 | yes |
| `/tags/<tag>/<n>/` (pagination) | 8 | 8 | yes |
| `/threads/<slug>/` | 2 | 2 | yes |
| Other pages (`/`, `/404.html`, `/about/`, `/posts/`, `/search/`, `/tags/`, `/threads/`, `/tips/`) | 8 | 8 | yes |

- **Why the totals differ (129 vs 130):** the branch's extra `.html` file is `~partytown/partytown-sandbox-sw.html`, a Partytown 0.14.4 asset, not a page. Astro reports "127 page(s) built" on both builds.
- **Other file differences:** across all 361 (`main`) vs 362 (branch) files, the only other differences are renamed `_astro` chunks (hash or name changes) and one new chunk `_astro/react.DJY1zw8Z.js` (Vite 8 splitting). `Search.*.js` and `TagsList.*.js` are still present.
- **Counts match content:** 28 = published blog posts, 7 = tips, 68 = unique tags (= `sitemap-tags` entries).

## W9: OG baseline comparison

```
$ shasum -a 256 dist/og.png dist/posts/audio-vs-paper-books/index.png
ae6c9aa406da0d27944d155e4e9ec5fe8a92116b2f78d9897fe14697749e8902  dist/og.png
951f184b268e003e34c26b90e7109b07c988969269b38a0e3892e668c5838660  dist/posts/audio-vs-paper-books/index.png
$ cat docs/library-packages-upgrade/baseline/2026-09/og/sha256.txt
951f184b268e003e34c26b90e7109b07c988969269b38a0e3892e668c5838660  og/audio-vs-paper-books.png
5eb52b447f426563e10bbac411f409a00bd3a078dd231673fef9eafc938ae991  og/og.png
```

- **`audio-vs-paper-books/index.png`** equals the baseline exactly.
- **`og.png`** equals Task 6's accepted hash `ae6c9aa4…8902` exactly. This hash equality is the binding criterion, and it holds, so no visual fallback was needed.
  - `main`'s build `og.png` = `5eb52b44…` = the baseline.
- **Extra evidence (not needed for the pass):**
  - I counted pixels that differ in any RGBA channel between `dist/og.png` and `baseline/2026-09/og/og.png`: 1626 px (0.215%).
  - They all fall inside a bounding box of x 818–1070, y 497–523. That box is the `www.novifyx.com` hostname line only.
  - This is a stricter measure than whatever produced Task 6's 0.184%, so it doesn't contradict that figure.
  - Magnified crops of that region (`og-branch-crop.png` and `og-baseline-crop.png`, scratch) show the same text shifted about 1–2 px. The full `dist/og.png` was also viewed: title, subtitle and hostname are all fully inside the card, with no clipping.

## W10: TOC

| Post | Source | `grep -o '<details' \| wc -l` | Baseline | `<summary>Open Table of contents</summary>` | TOC links (all resolve to in-page ids) | TOC block vs `main` |
|---|---|---|---|---|---|---|
| audio-vs-paper-books | `.md` | 1 | 1 | 1 | 8 | byte-identical (717 B) |
| ems-the-delivery-system | `.md` | 1 | 1 | 1 | 10 | byte-identical (1088 B) |
| dad-ops-playbook | `.mdx` | 1 | 1 | 1 | 7 | byte-identical (744 B) |

- **Structure:** matches the `toc-counts.txt` description in each case: `<h2 id="table-of-contents">Table of contents</h2>`, `<p></p><details><summary>Open Table of contents</summary><p></p>`, `<ul>…`.
- **About the "0" in my scratch output:** my first single-line wrapper grep returned 0 matches only because the build puts newlines between `</h2>` and `<p></p>`, and between `<p></p>` and `<ul>`. The block, newlines included, is byte-identical to `main`.
- **Not covered here:** expand-on-click is Playwright P6.

## Observations (non-blocking)

1. **Pre-existing defect: every post's `og:image`/`twitter:image` is a broken URL.**
   - `src/layouts/PostDetails.astro:34` builds ``new URL(ogImageUrl ?? `/posts/${post.id}.png`, …)``, but the route `src/pages/posts/[slug]/index.png.ts` writes `/posts/<slug>/index.png`.
   - All 28 post pages point social cards at a 404:
     - preview: `/posts/audio-vs-paper-books.png` → 404
     - production, read-only GET: `https://www.novifyx.com/posts/audio-vs-paper-books.png` → **404**, while `…/posts/audio-vs-paper-books/index.png` → 200
   - It's identical on the `main` build. The pattern goes back to `7e4b33e` (2024-01-17), and `c55b841` (April 2026) only renamed `post.slug` to `post.id`.
   - Not a regression of this upgrade, so it doesn't block T-39. Fixing it is a separate change and outside this spec's "no content/design changes" scope. Two possible fixes: point the URL at `/posts/${post.id}/index.png`, or move the route to `src/pages/posts/[slug].png.ts`. **Recommend a follow-up for the user.**
2. **Pre-existing:** `dist/404.html` has `canonical`, `og:url` and `twitter:url` = `https://www.novifyx.com/404/`, a URL that doesn't exist (the file is `/404.html`). The same is true on `main`. Low impact.
3. **Pre-existing:** `/tags/` and `/threads/` each appear in two sitemaps: `sitemap-pages.xml` plus `sitemap-tags.xml` or `sitemap-threads.xml`. The same is true on `main`. This is harmless for crawlers.
4. **Build-time `theme-color` is empty** (`content=""`) on both builds. `toggle-theme.js` fills it at runtime, and that file is unchanged.
5. **Case sensitivity:** all resolutions were repeated case-exact, because macOS and `astro preview` would hide case mismatches that GitHub Pages would 404. None found.
6. **Content types come from `astro preview`,** e.g. `text/xml` for RSS and sitemaps. GitHub Pages may send different types for `.xml`. This isn't a build property.

## Raw evidence (scratch, not committed)

`/private/tmp/claude-501/-Users-ap-development-other-eliotik-github-io/917b6b41-1b79-43b6-8c59-b21d1efcf946/scratchpad/t8/site-wide/`:

| File | Content |
|---|---|
| `frontmatter.py`, `frontmatter.json` | Blog/tip frontmatter derivation (draft, scheduled, ogImage) |
| `rss.xml`, `sitemap-*.xml` | Fetched from the preview. `locs.txt` / `locs-status.txt` hold the 114 locs and their HTTP status. |
| `crawl.py`, `crawl_exact.py`, `crawl-branch*.json`, `crawl-main*.json` | W2/W6 crawler and results (case-insensitive and case-exact, branch and `main`) |
| `uniq-paths.txt`, `uniq-status.txt` | 299 unique internal paths and their preview HTTP status |
| `og.cjs` | W4 sharp validation. `og-branch-crop.png` / `og-baseline-crop.png` are the W9 crops. |
| `pt.py` | W5 Partytown and GA checks |
| `head.py`, `headorder.py` | W7 head extraction and ordered diff |
| `counts.py`, `branch-pages.txt`, `main-pages.txt`, `branch-files.txt`, `main-files.txt` | W8 |
| `404-served.html` | W3 |
| `main-dist/` | Read-only snapshot of the visual lane's `main` (`3df6160`) dist |
