# T-39 Task 8 v2: QA lane "site-wide" (artifact and route integrity)

- **Verdict: FAIL, on one absolute criterion that was already failing before the upgrade. There are 0 regressions.**
  - 11 of 12 checks pass (W1–W6, W5a, W8–W11).
  - **W7 FAILS** on its literal sub-criterion "og:image resolves". The post page's `og:image`/`twitter:image` is `/posts/<slug>.png`, which is 404:
    - in this build
    - in the pre-upgrade `main` build
    - in production
  - The generated image is at `/posts/<slug>/index.png`. This affects all 28 posts, with an identical set on `main`.
  - Cause: `src/layouts/PostDetails.astro:34`.
  - Fixing it would be a content/markup change outside this spec's "no content or design changes" scope. So it needs a controller or user ruling (waiver plus follow-up), like v1's pre-existing console-error criterion.
  - Everything else in W7 matches `main`: title, description, canonical, theme-color and the head tag set.
- **Other pre-existing items that don't fail a check:**
  1. **W1 wording:**
     - The feed has 35 items, not 28. By design, `src/pages/rss.xml.ts` merges tips into the feed.
     - The post subset is set-equal to the 28 derived published posts.
     - The feed is byte-identical to `main`.
     - The controller may want to reword the check.
  2. **Four relative `./flutter-…` links in three `.mdx` posts are broken** on the canonical trailing-slash URLs, both in the preview and in production. W2 doesn't cover them because it's scoped to `/` links. Details are in Observations.
- **Repo / HEAD:** `/Users/ap/development/other/eliotik.github.io` @ `63efd0867a0ba7fa14759fe98cfe0d1b363ce7a5` (branch `upgrade/2026-09`).
- **What was tested:**
  - `dist/` built by the build lane. `dist/index.html` mtime is 2026-09-24T16:29:02Z. It has 130 `.html` files, 362 files in total, and generator `Astro v7.3.5`.
  - It's served by the shared `astro preview` at `http://localhost:4321` (pid 18132). This lane did not start or stop it.
- **`dist/` did not change during the lane:**
  - I took a sha256 manifest of all 362 files at 16:39Z (`dist-manifest-start.txt`) and again at 16:48Z (`dist-manifest-end.txt`).
  - The two are byte-identical.
- **Pre-upgrade reference (W7/W8, and cross-check for W1–W6/W9/W10):**
  - I did not do my own build. The visual lane was already building `main` (`3df6160`) in its worktree `…/scratchpad/t8v2/main-before`.
  - I created my own worktree `…/t8v2/site-wide-main` before I noticed that. I removed it **unbuilt** with `git worktree remove --force`, and `git worktree list` no longer shows it.
  - The visual lane's build log is `…/t8v2/visual-regression/main-build.log`:
    - pnpm v10.33.2
    - `astro check` 0 errors / 0 warnings / 0 hints
    - `[build] 127 page(s) built`
    - jampack `307 files`, "No issues"
    - worktree `git status` clean
    - `.nvmrc` = 22.22.2 (the log doesn't echo the Node version)
  - I took a read-only snapshot with `rsync` to `…/t8v2/site-wide/main-dist/`: 129 `.html` files, 361 files, generator `Astro v6.2.1`, `og.png` = baseline `5eb52b44…`.
  - I did not touch the visual lane's worktree or its preview on :4331.
- **Tooling:**
  - Node v22.23.3 and pnpm 10.34.5 (`nvm use` from `.nvmrc`).
  - macOS `xmllint`.
  - Python 3 `html.parser` crawler.
  - sharp 0.35.4 / libvips 8.18.6 from the repo's `node_modules`.
  - lightningcss 1.33.0 from the repo's `node_modules`, used for CSS normalisation in W7.
  - lint-staged 17.5.1's own `generateTasks` for W11.
  - `gh api` for GitHub Action tags and README.
- **Case sensitivity:** APFS and `astro preview` are case-insensitive, but GitHub Pages is case-sensitive. So every dist resolution in W1, W2 and W6 uses a **case-exact** resolver that checks each path component against `os.listdir`.
- **Files touched:** this report only. `git status --porcelain` shows only `?? .claude/`, `?? .serena/` and `?? docs/library-packages-upgrade/qa-runs/T-39-2026-09-v2/`.

## Summary

| ID | Check | Result | Key evidence |
|---|---|---|---|
| W1 | RSS, sitemaps, OG, robots: status, types, xmllint, item count, `<loc>` reachability | **PASS** (see the wording note on item count) | **Literal item count: 35 items ≠ 28 posts**, because the feed merges tips by design (`rss.xml.ts`). The feed is byte-identical to `main`. 5/5 → 200 with correct types. `xmllint` ok on rss, the index and all 5 referenced sitemaps. RSS: 35 items = 28 posts (set-equal to the 28 derived from frontmatter) + 7 tips (set-equal to the 7 derived). 114/114 `<loc>` → 200 with 0 redirects. rss, robots and the 5 sitemaps are byte-identical to `main`; the index differs only in `<lastmod>`. |
| W2 | Internal link integrity plus in-page fragments | **PASS** | 130 pages, 3622 `/` and same-site refs. 2175 `a[href]` (187 unique) → 0 broken, case-exact. 347 in-page `#fragment` links → 0 unmatched. 0 `#top` exemptions. 0 cross-page fragments. 0 links to redirect stubs. |
| W3 | Redirects and custom 404 | **PASS** | `dist/posts/1/index.html` → meta refresh `0;url=/posts`, `dist/tips/1/index.html` → `0;url=/tips` (both byte-identical to `main`). `/this-route-doesnt-exist` → **404**, and the body is byte-identical to `dist/404.html`. |
| W4 | OG images for every eligible post | **PASS** | 28 expected (`!draft && !ogImage`, the route's own filter) = 28 present, set-equal. 29/29 PNGs (28 + `og.png`) have a valid signature, are 1200×630 with 4 channels, and fully decode. 28/28 post PNGs are byte-identical to `main`. |
| W5a | Partytown config in the output | **PASS** | 127/127 Layout pages have exactly one config with `lib:"/~partytown/",sandboxParent:"html",debug:!1` and forward `["dataLayer.push"]`. The `src=` gtag script has `data-astro-transition-persist="gtag-src"` and the inline one has `"gtag-init"`. Each id appears exactly once per page and never appears elsewhere (127 + 127 site-wide). |
| W5 | Partytown assets and GA blocks | **PASS** | 5/5 files in `dist/~partytown` → 200, with the served size equal to the dist size. 127/127 pages have exactly 2 `text/partytown` blocks. The inline GA body runs to `dataLayer=[["js",<Date>],["config","G-QQMCTBW5TH"]]`. |
| W6 | Asset references resolve | **PASS** | 262 `script[src]`, 145 stylesheets, 41 `img[src]`, 74 srcset candidates, 17 `component-url` and 17 `renderer-url`: 0 broken, case-exact. 299/299 unique internal paths → HTTP 200. 8 JS import specifiers resolve, and there are 0 CSS `url()` refs. |
| W7 | `<head>` sanity on 5 pages vs `main` | **FAIL** (pre-existing, not a regression) | **og:image resolves on 4/5. On the post page `/posts/audio-vs-paper-books.png` → 404,** and the same is true on `main` and in production (all 28 posts, `PostDetails.astro:34`). title, description, canonical, og:image and theme-color are equal to `main` on 5/5. Tag multisets and element counts are equal on 5/5. The attribute-set deltas are only: generator, the two new `data-astro-transition-persist` attributes, and the CSS chunk rename on `/`. All are explained below. |
| W8 | Content-collection page counts vs `main` | **PASS** | posts 28/28, post pagination 6/6, tips 7/7, tip pagination 2/2, tags 68/68, tag pagination 8/8, threads 2/2. The sets are equal, not just the counts. |
| W9 | OG hashes (brief Step 8) | **PASS** | `dist/og.png` = `ae6c9aa4…8902` (Task 6's accepted hash, exact). `dist/posts/audio-vs-paper-books/index.png` = `951f184b…0660` (baseline `sha256.txt`, exact). |
| W10 | TOC (brief Step 8) | **PASS** | `<details>` 1/1/1 = `toc-counts.txt`. One `<summary>Open Table of contents</summary>` each. 8/10/7 TOC links, all resolving to in-page ids. Each TOC block is byte-identical to `main`. |
| W11 | Toolchain and config | **PASS** | No `@astrojs/sitemap` in `package.json` or the lockfile. `pnpm@10.34.5` = latest 10.x. lint-staged globs verified with lint-staged's own matcher. CI has `format:check` and uses `pnpm/action-setup@v6` with no `version:`. Dependabot `exclude-patterns` equal the 17-pattern named-group union exactly, in both generic groups. `audit --prod` = only fflate/satori. Full audit = 17 (2 low / 10 moderate / 5 high). `outdated` = only typescript and @types/node, both at their cap. |

## W1: RSS, sitemaps, OG, robots

HTTP (`curl -s -o /dev/null -w "%{http_code} %{content_type} %{size_download}"` against `http://localhost:4321`):

```
/rss.xml 200 text/xml 14458
/sitemap-index.xml 200 text/xml 772
/og.png 200 image/png 13366
/posts/audio-vs-paper-books/index.png 200 image/png 14919
/robots.txt 200 text/plain 167
```

- **`xmllint --noout`:**
  - `rss.xml` → `rss-ok`
  - `sitemap-index.xml` → `sitemap-ok`
  - The served bytes equal `dist/` (`cmp`).
- **The index references 5 sitemaps.** `dist/` has exactly these 5 `sitemap-*.xml` plus the index, so there are no orphaned sitemaps:

| Sitemap | HTTP | Content type | xmllint | `<loc>` | vs `main` |
|---|---|---|---|---|---|
| `/sitemap-pages.xml` | 200 | text/xml | ok | 7 | byte-identical |
| `/sitemap-posts.xml` | 200 | text/xml | ok | 28 | byte-identical |
| `/sitemap-tips.xml` | 200 | text/xml | ok | 7 | byte-identical |
| `/sitemap-threads.xml` | 200 | text/xml | ok | 3 | byte-identical |
| `/sitemap-tags.xml` | 200 | text/xml | ok | 69 | byte-identical |

- **The index itself:** identical to `main` apart from `<lastmod>` (the build timestamp).
- **Every `<loc>` returns 200:**
  - All 114 `<loc>` values (112 unique) were fetched with `https://www.novifyx.com` mapped to the preview, using `curl -L`.
  - Result: `114 × "200 0 text/html"` (status, `num_redirects`, type). No off-site locs.
  - The 2 duplicates are `/tags/` and `/threads/`. Each is listed in both `sitemap-pages.xml` and its own sitemap. This is pre-existing (identical on `main`).
- **Set checks:**
  - `sitemap-posts` (28) = the 28 derived published posts.
  - `sitemap-tips` (7) = the 7 derived tips.
  - `sitemap-tags` has 68 tag locs (plus `/tags/`), equal to the 68 `dist/tags/*` directories.
- **`robots.txt`:** `User-agent: Googlebot` / `Disallow: /nogooglebot/` / `Disallow: /~partytown/`, then `User-agent: *` / `Allow: /` / `Disallow: /~partytown/`, then `Sitemap: https://www.novifyx.com/sitemap-index.xml`. Byte-identical to `main`.
- **RSS item count:**
  - **Frontmatter derivation** (`fm-build.json`):
    - "now" is the build time, 2026-09-24T16:29:02Z (`dist/index.html` mtime). A second run at 16:39Z gave the same result.
    - `src/content/blog` has 29 files: 1 `draft: true` (`come-back-later`) and 0 with `pubDatetime > now`, so **28 published**.
    - The task's rule (`pubDatetime <= now`) and the code's rule (`collectionFilter.ts`: `now > pubDatetime − SITE.scheduledPostMargin`, 15 min) give the same 28. The newest post is 2026-09-23T15:00Z, about 25 h before the build, so the margin doesn't come into play.
    - Every blog `slug:` frontmatter value equals its filename, which is how the glob loader forms the id.
    - `src/content/tips` has 7 files, none draft or scheduled, so **7**.
  - **Feed: 35 `<item>`.** `src/pages/rss.xml.ts` builds `postItems` and `tipItems` and returns `[...postItems, ...tipItems].sort(...)`. So the literal "item count equals the number of blog posts" (28) does not hold, **by design**:
    - The 28 `/posts/` links are set-equal to the derived 28 (missing ∅, extra ∅). The draft is absent.
    - The 7 `/tips/` links are set-equal to the 7 `customSlug`s.
    - No other links and no duplicates. `link == guid` for every item. Every item has title, link, guid, pubDate and description. Items are sorted by pubDate, descending.
    - `dist/rss.xml` is **byte-identical to `main`'s**.

## W2: Internal link integrity

- **Crawler** (`crawl_exact.py`):
  - Every `.html` in `dist/` (130) is parsed with Python `html.parser`, which decodes entities.
  - It extracts `href`, `src`, `srcset`/`imagesrcset` candidates, `component-url`, `renderer-url`, `before-hydration-url`, `poster`, `action`, `data-src`, `xlink:href` and `meta content`.
  - It keeps values that start with `/` (not `//`), plus same-site absolute URLs (`https://www.novifyx.com/…`).
  - External, `mailto:` and `tel:` values are ignored.
- **Resolver:**
  - Strip the query and fragment, then URL-decode.
  - Try a file, then `dir/index.html`, then `path.html`. A path ending in `/` requires `index.html`.
  - Then require case-exact components.
- **Results (branch): 3622 references on 130 pages. Every `/`-relative reference resolves (0 broken).**

| Category | Refs | Unique | Broken |
|---|---|---|---|
| `a[href]` | 2175 | 187 | 0 |
| `link[rel=icon]` | 127 | 1 | 0 |
| `link[rel=sitemap]` | 127 | 1 | 0 |
| asset categories | see W6 | | 0 |

- **In-page fragments:**
  - 347 `href="#…"` links site-wide. **0 have no matching `id` (or `a[name]`) on the same page.**
  - 0 empty `#`. The `#top` exemption was used 0 times.
  - 0 cross-page `/path#frag` links.
- **Links to redirect stubs:** 0.
- **Same-site absolute URLs in `<head>`:** 59 unresolved refs, which are 29 unique (page, URL) pairs. The same 29 are on `main` (branch-only ∅, main-only ∅), so all are pre-existing:
  - 28 post pages: `og:image`/`twitter:image` → `/posts/<slug>.png`. See Observation 1.
  - `404.html`: `canonical`/`og:url`/`twitter:url` → `/404/`. See Observation 3.
- **`main` cross-check:** the same crawler on `main` gives 3622 refs with identical per-category counts, 347 fragment links and 0 bad.
- **Outside the check's `/` scope:**
  - The crawler also records hrefs that are neither `/`-rooted nor have a scheme. There are 4, all `./flutter-google-maps-*` in 3 `.mdx` posts.
  - They 404 on the canonical `/posts/<slug>/` URLs, in the preview and in production. The list is identical on `main`. See Observation 2.

## W3: Redirects and 404

The astro config has `redirects: { '/posts/1/': '/posts', '/tips/1/': '/tips' }`. Both redirect files exist and are **byte-identical to `main`'s**.

`dist/posts/1/index.html`:
```html
<!doctype html><title>Redirecting to: /posts</title><meta http-equiv="refresh" content="0;url=/posts"><meta name="robots" content="noindex"><link rel="canonical" href="https://www.novifyx.com/posts"><body>	<a href="/posts">Redirecting from <code>/posts/1/</code> to <code>/posts</code></a></body>
```
`dist/tips/1/index.html` is the same, with `/tips`.

| Request (preview) | Status | Notes |
|---|---|---|
| `/posts/1/`, `/posts/1` | 200 (296 B) | `content="0;url=/posts"` |
| `/tips/1/`, `/tips/1` | 200 (290 B) | `content="0;url=/tips"` |
| `/posts`, `/posts/` (target) | 200 (20911 B) | listing page |
| `/tips`, `/tips/` (target) | 200 (38377 B) | listing page |
| `/this-route-doesnt-exist`, `/this-route-doesnt-exist/` | **404** text/html (15347 B) | body `cmp`-identical to `dist/404.html` |

- **404 content:** `<title>404 Not Found | Novi Fyx</title>`. The `<main>` text reads "404 ¡Ay, caramba! Page Not Found Go back home", which is text-identical to `main`. The only link is `href="/"`.
- **The only markup delta vs `main`** (after normalising the Astro scope class) is whitespace inside the inline-block `<a>`:
  - `main`: `>\nGo back home\n</a>`
  - branch: `> \nGo back home\n </a>`
  - Both are collapsible leading and trailing whitespace. The visual lane owns pixel equality.

## W4: OG images

- **Which posts should have one:** the route `src/pages/posts/[slug]/index.png.ts` generates PNGs for `!data.draft && !data.ogImage`. It has no schedule filter.
- **Expected vs present:** from frontmatter, 28 expected (29 − 1 draft; no post sets `ogImage`). `dist/posts/*/index.png` has 28 present.
  - The sets are equal: missing `[]`, unexpected `[]`.
  - The draft `come-back-later` correctly has none.
- **sharp 0.35.4 (`og.cjs`) checked each of the 28 post PNGs plus `og.png`:**
  - PNG signature `89504e470d0a1a0a`
  - `metadata().format === 'png'`
  - 1200×630, 4 channels
  - A full `raw()` decode is 1200×630
  - **29/29 OK, 0 invalid.**
- **vs `main`:** 28/28 post PNGs are **byte-identical** to `main`'s. Only `og.png` differs; see W9.

## W5a: Partytown config in the output (the Task 14 invariant)

- **Scope:**
  - 130 `.html` files − 2 redirect stubs (`posts/1/`, `tips/1/`, which have no layout) − `~partytown/partytown-sandbox-sw.html` (Partytown's own asset) = **127 Layout pages**.
  - No page was dropped for lacking the snippet: all 127 have it.
- **Checks per page** (`pt2.py`; **127/127 OK, 0 bad**):
  - Exactly one config matching `{lib:"/~partytown/",sandboxParent:"html",debug:!1}),v[u]=(v[u]||[]).concat(["dataLayer.push"]))})(window,"partytown","forward")`.
  - `sandboxParent` appears exactly once, with value `"html"`.
  - Exactly 2 `type="text/partytown"` scripts:
    - the one with `src="https://www.googletagmanager.com/gtag/js?id=G-QQMCTBW5TH"` has `data-astro-transition-persist="gtag-src"`
    - the inline one has `data-astro-transition-persist="gtag-init"`
  - Each persist id appears exactly once per page.
  - The config and both scripts are inside `<head>`.
- **Site-wide:**
  - persist ids are `{gtag-src: 127, gtag-init: 127}`, with no other `data-astro-transition-persist` value anywhere.
  - There is 1 distinct bootstrap snippet (3588 chars, on all 127 pages) and 1 distinct gtag-init body (on all 127).
- **Source:**
  - `astro.config.mjs`: `partytown({ config: { forward: ['dataLayer.push'], sandboxParent: 'html' } })`
  - `src/layouts/Layout.astro:129`: `transition:persist="gtag-src"`
  - `src/layouts/Layout.astro:137`: `transition:persist="gtag-init"`
- **vs `main`:**
  - `main`'s config is `lib:"/~partytown/",debug:!1}`, with no `sandboxParent`.
  - `main` has 0 persist attributes.
  - So both are branch additions, as Task 14 intended.

## W5: Partytown assets and GA blocks

Every file in `dist/~partytown`, fetched from the preview:

```
/~partytown/partytown-atomics.js 200 text/javascript 46049 dist-bytes=46049
/~partytown/partytown-media.js 200 text/javascript 8800 dist-bytes=8800
/~partytown/partytown-sandbox-sw.html 200 text/html;charset=utf-8 45949 dist-bytes=45949
/~partytown/partytown-sw.js 200 text/javascript 47177 dist-bytes=47177
/~partytown/partytown.js 200 text/javascript 3198 dist-bytes=3198
```

- **The bootstrap snippet's file references** (`partytown-sw`, `partytown-atomics`, `partytown-sandbox-sw`) all exist in `dist/`. `@qwik.dev/partytown` is 0.14.4.
- **`main` has 4 files.** `partytown-sandbox-sw.html` is new, from 0.14.4 (Task 2).
- **127/127 pages have exactly 2 `text/partytown` blocks:** the gtag src and the inline init. The forward list is `["dataLayer.push"]` (W5a).
- **Inline GA body:**
  - `window.dataLayer = window.dataLayer || []; function gtag() { // eslint-disable-next-line prefer-rest-params \n window.dataLayer.push(arguments); } gtag('js', new Date()); gtag('config', 'G-QQMCTBW5TH');`
  - Newlines are preserved, so the line comment can't swallow any code.
  - Run with `new Function` in Node, it produces `dataLayer = [["js","<Date>"],["config","G-QQMCTBW5TH"]]`. `main`'s body produces the identical result.
  - The code is equal to `main`'s once whitespace and comments are stripped. The layout comes from the Task 5 Prettier reformat.
- **Not covered here:** runtime service-worker registration and navigation behaviour belong to the Playwright lane.

## W6: Asset references

Same crawl as W2, case-exact:

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

- **Unique internal assets:**
  - Scripts: `ClientRouter.astro_astro_type_script_index_0_lang.CYDbzu1r.js` ×127, `/toggle-theme.js` ×127, `ec.0vx5m.js` ×8.
  - Stylesheets: `Footer.DfYI7f51.css` ×127, `Tips.i4aH78fP.css` ×9, `ec.s4b1i.css` ×8, `index.C0tC3-oh.css` ×1.
  - Islands: `ImageSliderClient.CgCc8xoX.js` ×15, `Search.5bjErYsM.js` ×1, `TagsList.C8dn6EDy.js` ×1. The renderer is `client.CLhIxG29.js` ×17.
- **Not present in the build:** `<source srcset>`, `modulepreload`, `preload` and `before-hydration-url`.
- **Out of scope:** external googletagmanager and Google Fonts.
- **Over HTTP:** all 299 unique internal paths referenced by `href`/`src`/`srcset`/island attributes were requested from the preview.
  - Result: **299 × 200**.
  - Content types: 146 text/html, 107 image/webp, 22 image/png, 6 image/gif, 4 image/jpeg, 1 image/svg+xml, 4 text/css, 7 text/javascript, 2 text/xml.
- **Module graph:** 9 JS files in `_astro/` and the root, with 8 relative or absolute `import` specifiers, **0 unresolved**. Inline `<script>` import specifiers: 0.
- **CSS:** `url()` refs in `_astro/*.css` (4 files): 0 non-data refs.
- **vs `main`:** per-category ref, unique and broken counts are identical.

## W7: `<head>` sanity on 5 pages vs pre-upgrade `main`

**Result: FAIL.**
- The absolute sub-criterion "og:image resolves" is not met on the post page.
- The failure is pre-existing: the same broken URL is on `main` and in production, for all 28 posts. It is not a regression.
- Everything else in W7 matches `main`.

Pages: `/`, `/posts/audio-vs-paper-books/`, `/tips/motivation-is-a-trap/`, `/tags/`, `/about/` (`head.py`, `headorder.py`).

| Page | title | description | canonical | og:image | resolves | theme-color |
|---|---|---|---|---|---|---|
| `/` | Novi Fyx | New Partial Derivative! | `https://www.novifyx.com/` | `/novifyx-og.jpg` | yes | `""` |
| post | Audio vs Paper Books \| Novi Fyx | My experience so far with audio and paper books. Which one is better for me and why. | `…/posts/audio-vs-paper-books/` | `/posts/audio-vs-paper-books.png` | **no (404)**, pre-existing | `""` |
| tip | Motivation is a trap. Build a system instead. \| Novi Fyx | Motivation is a trap. Build a system instead. | `…/tips/motivation-is-a-trap/` | `/novifyx-og.jpg` | yes | `""` |
| `/tags/` | Tags \| Novi Fyx | New Partial Derivative! | `…/tags/` | `/novifyx-og.jpg` | yes | `""` |
| `/about/` | About \| Novi Fyx | New Partial Derivative! | `…/about/` | `/novifyx-og.jpg` | yes | `""` |

- **Same as `main`:** title, description, canonical, og:image, twitter:image and theme-color are all equal to `main` on all 5 pages.
- **`theme-color`:** it is `content=""` at build time on both builds. `toggle-theme.js` sets it at runtime from the body background, and that file is byte-identical to `main`'s.
- **The post `og:image` 404** is pre-existing. The code is identical on `main`, and production serves the same broken URL. See Observation 1.
- **Element counts and tag multisets are equal to `main` on all 5 pages:**
  - `/`: 36 (meta 18, link 9, script 6, style 1, title 1, noscript 1)
  - post: 44
  - tip: 41
  - `/tags/`: 36
  - `/about/`: 36
- **Tag and attribute set diff** (hash-normalised `/_astro/*.<hash>.{js,css}`). These are the only elements whose attribute sets differ:
  1. `<meta name="generator">`: `Astro v6.2.1` → `Astro v7.3.5`. This is the upgrade (Task 4 / 13b).
  2. The gtag `src` script gains `data-astro-transition-persist="gtag-src"`, and the inline gtag script gains `data-astro-transition-persist="gtag-init"`. This is Task 14 (see W5a). They appear on all 5 pages.
  3. `/` only: the stylesheet `/_astro/index@_@astro.<hash>.css` is now `/_astro/index.<hash>.css`. This is Vite 8/Rolldown chunk naming. The file exists and returns 200.
- **Inline text deltas** (no tag or attribute change):
  - **GA init body:** the same code with a different layout (Task 5). Execution is equal; see W5.
  - **Partytown bootstrap `<script>`:** 2567 → 3588 chars. This is `@qwik.dev/partytown` 0.13.2 → 0.14.4 (Task 2) plus `sandboxParent:"html"` (Task 14).
  - **Inline `<style>` blocks:** same number per page, but the CSS text differs:
    - A `/*! tailwindcss v4.3.3 … */` banner is kept.
    - Astro scope hashes are renamed.
    - Astro's view-transition `@keyframes astro*` and the `prefers-reduced-motion` rule moved from an inline `<style>` on each page into the shared `/_astro/Footer.<hash>.css`, which is linked on all 127 Layout pages. For example, on `/tags/` block 1 is 2543 → 1924 chars.
    - lightningcss / browserslist output changed (Tasks 4, 7, 13). Example: `line-height: …,1.2` became `calc(2.25 / 1.875)`, which is the same value.
  - **Selector-set check** (`prelude2.cjs`, output in `prelude2.txt`):
    - Method:
      - Each page's full CSS (inline `<style>` plus linked same-origin sheets) is re-minified with one lightningcss (1.33.0).
      - Astro scope hashes are normalised.
      - The CSS is flattened to leaf preludes: the selector or at-rule, together with its enclosing `@layer`/`@media`/`@supports` context.
      - The results are compared as multisets.
      - Whitespace after commas inside at-rule conditions is normalised. Without that, the only other delta is `@supports (color:color-mix(in lab,red,red))` vs `(in lab, red, red)`.
    - Results:

      | Scope | Branch | `main` | Only branch | Only `main` |
      |---|---|---|---|---|
      | `Footer.css` | 1087 | 1079 | 8 | 0 |
      | `/` | 1129 | 1121 | 8 | 0 |
      | post | 1159 | 1159 | 0 | 0 |
      | tip | 1179 | 1179 | 0 | 0 |
      | `/tags/` | 1098 | 1098 | 0 | 0 |
      | `/about/` | 1093 | 1085 | 8 | 0 |

    - **The same 8 extra preludes appear every time:** Astro's 7 `@keyframes astro*` plus `@media (prefers-reduced-motion) > ::view-transition-group(*),…,[data-astro-transition-scope]`.
      - On `main` they were only inlined on pages that have `transition:` directives.
      - On the branch they live in the shared `Footer.css`, so `/` and `/about/` now load them too.
      - Keyframes only take effect when referenced. The reduced-motion rule now also disables view-transition animation on `/` and `/about/` for users with reduced motion.
    - **No selector is missing on the branch on any of the 5 pages.**
    - **Declaration text does differ.** I sampled 4 rules; the differences were whitespace inside functions and equivalent forms:
      - `color-mix(in srgb, rgb(…) 35%, transparent)` vs `color-mix(in srgb,rgb(…) 35%,transparent)`
      - `box-shadow:var(a), var(b)` vs `var(a),var(b)`
      - `z-index:calc(10 * -1)` vs `-10`
      - `line-height:calc(2.25 / 1.875)` vs `1.2`
      
      This is consistent with the Task 13 browserslist/lightningcss refresh. I did not prove every declaration is equivalent.
    - Whether the pages look the same is the visual lane's job. This lane doesn't claim visual equivalence.
- **Order (`headorder.py`):**
  - On `/`, the post, the tip and `/tags/`, the order is unchanged.
  - On `/about/` (a Markdown page with a layout), one block moved: the breadcrumb `<style>`, the `Footer.<hash>.css` link and the Partytown bootstrap. On `main` it sits at positions 24–26, right after the Google Fonts `media=print` link. On the branch it's at the end of `<head>`, which is where the other 4 pages have it on both builds.
  - This is the same move v1 found. Astro 7 injects head content for `.md` pages with a layout at a different point.
  - The only stylesheet that changes order relative to site CSS is Google Fonts, which only declares `@font-face`. So the cascade is unaffected.

No `<head>` tag was added or removed on any of the 5 pages.

## W8: Content-collection page counts (branch vs `main`, the W7 build)

This classifies the `.html` file sets of both builds (`counts.py`):

| Category | `main` | branch | Same set |
|---|---|---|---|
| `/posts/<slug>/` (detail) | 28 | 28 | yes |
| `/posts/<n>/` (pagination, incl. the `/posts/1/` stub) | 6 | 6 | yes |
| `/tips/<slug>/` (detail) | 7 | 7 | yes |
| `/tips/<n>/` (pagination, incl. the `/tips/1/` stub) | 2 | 2 | yes |
| `/tags/<tag>/` | 68 | 68 | yes |
| `/tags/<tag>/<n>/` (pagination) | 8 | 8 | yes |
| `/threads/<slug>/` | 2 | 2 | yes |
| Other pages (`/`, `/404.html`, `/about/`, `/posts/`, `/search/`, `/tags/`, `/threads/`, `/tips/`) | 8 | 8 | yes |

- **Why the totals differ (129 vs 130 html):** the branch's extra file is `~partytown/partytown-sandbox-sw.html`, a Partytown 0.14.4 asset, not a page. Both builds report "127 page(s) built".
- **Other file differences** (361 vs 362 files):
  - Renamed `_astro` chunks: client, ClientRouter, Footer.css, ImageSliderClient, index css, jsx-runtime, Search, TagsList, Tips.css.
  - `main`'s `_astro/index.elwlu7WY.js` is gone, and the branch has a new `_astro/react.DJY1zw8Z.js` (Vite 8 splitting).
- **Content differences:** of the 351 common files, 132 differ:
  - 127 html
  - 3 `~partytown` js (0.14.4)
  - `og.png` (W9)
  - `sitemap-index.xml` (only `<lastmod>`)
  - 2 html are identical: the redirect stubs.
- **Counts match content:** 28 = published posts, 7 = tips, 68 = the `sitemap-tags` entries and the `dist/tags/*` directories.

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
- **`og.png`** equals Task 6's accepted hash `ae6c9aa4…8902` exactly. That's the binding criterion, so no visual fallback was needed.
  - The committed baseline PNG files hash to the values in `sha256.txt`.
  - `main`'s fresh build `og.png` = `5eb52b44…` = the baseline, so the `og.png` delta comes only from satori 0.33.5 (Task 6).

## W10: TOC

| Post | Source | `grep -o '<details' \| wc -l` | Baseline | `<summary>Open Table of contents</summary>` | TOC links (all resolve to in-page ids) | TOC block vs `main` |
|---|---|---|---|---|---|---|
| audio-vs-paper-books | `.md` | 1 | 1 | 1 | 8 | byte-identical |
| ems-the-delivery-system | `.md` | 1 | 1 | 1 | 10 | byte-identical |
| dad-ops-playbook | `.mdx` | 1 | 1 | 1 | 7 | byte-identical |

- **Structure:** checked with a multi-line regex, because the build puts newlines inside the wrapper. It matches `toc-counts.txt`: `<h2 id="table-of-contents">Table of contents</h2>`, `<p></p>`, `<details><summary>Open Table of contents</summary>`, `<p></p>`, `<ul>…`.
- **Not covered here:** expand-on-click is Playwright P6.

## W11: Toolchain and config

- **`@astrojs/sitemap` (R23):**
  - Absent from `package.json` dependencies and devDependencies.
  - `grep -c '@astrojs/sitemap' pnpm-lock.yaml` = 0 (and `grep -c sitemap` = 0).
  - The sitemaps are the custom endpoints `src/pages/sitemap-*.xml.ts` (W1).
- **`packageManager`:**
  - It is `"pnpm@10.34.5"`. The registry's latest 10.x is 10.34.5; the latest overall is 12.6.0, but R25 keeps the major at 10.
  - `lockfileVersion: '9.0'`.
  - Local `pnpm -v` = 10.34.5.
- **lint-staged** (`package.json`). I simulated it with lint-staged 17.5.1's own `generateTasks` / `picomatch` matcher (`lsmatch.mjs`):
  - `*.{js,mjs,cjs,jsx,ts,tsx,astro}` → `["eslint --fix","prettier --write"]`. Matches: `a.js`, `src/x.mjs`, `x.cjs`, `eslint.config.js`, `astro.config.mjs`, `.jsx`, `.ts`, `.tsx` and `src/layouts/Layout.astro`.
  - `*.{md,mdx,json,css,yml,yaml}` → `["prettier --write"]`. Matches: `README.md`, `.mdx`, `package.json`, `tsconfig.json`, `.css`, `.github/workflows/ci.yml`, `.github/dependabot.yml` and `.yaml`.
  - `.prettierrc` → `["prettier --write"]`. It matches `.prettierrc`.
  - **0 files match more than one glob**, so the globs don't overlap.
  - Unmatched files: `.nvmrc`, `clean-cache.sh`, `.prettierignore`.
- **Prettier and Astro:** `.prettierrc` has `"astroCompressHTML": true` and `astro.config.mjs:88` has `compressHTML: true`, so they match (global constraint).
- **`ci.yml`:**
  - Steps: `actions/checkout@v7`, then `pnpm/action-setup@v6` **with no `with:`/`version:`**, then `actions/setup-node@v7` (`node-version-file: '.nvmrc'`, `cache: pnpm`, after pnpm setup).
  - Then `pnpm install --frozen-lockfile`, `pnpm astro check`, `pnpm lint`, **`pnpm format:check`** and `pnpm build`.
  - Then `pnpm audit --prod` (`continue-on-error`).
  - `pnpm/action-setup@v6` `action.yml`: `version` is `required: false`, and `package_json_file` defaults to `package.json` "to read packageManager". The v6 README says version is "**Optional** when there is a `packageManager` … field", and that `pnpm/action-setup` "remains the action to use for installing pnpm v10 and older".
  - The tags `pnpm/action-setup v6`, `actions/checkout v7`, `actions/setup-node v7`, `withastro/action v6` and `actions/deploy-pages v5` all exist (`gh api …/tags`).
  - No `corepack` string remains anywhere under `.github/`.
  - `deploy.yml` lost its `corepack enable / prepare pnpm@latest` step (R24), and its `node-version: 22.23.3` matches `.nvmrc`.
- **`dependabot.yml`** (parsed with PyYAML, `DBSET`):
  - **Named groups** (no `dependency-type`): `astro`, `react`, `eslint`, `tailwind`. Their pattern union is **17 unique patterns**.
  - **`prod-minor`** (`dependency-type: production`, `['minor','patch']`) `exclude-patterns`: 17 unique. named − excluded = ∅, excluded − named = ∅. **Equal.**
  - **`dev-minor`** (`development`, `['minor','patch']`) `exclude-patterns`: 17 unique, equal in both directions. It is also identical to `prod-minor`'s list, in the same order.
  - **Direct-dependency mapping (`DBMAP`):** 24 direct dependencies fall in a named group and are excluded from the generic group; 16 go to `prod-minor`/`dev-minor`. This matches T12b's dependabot-core result of 24.
  - **One overlap:** `astro-eslint-parser` matches both `astro-*` (the astro group) and the literal `astro-eslint-parser` (the eslint group). T12b verified with dependabot-core that the more specific pattern wins.
  - **`ignore`:** `@types/node` `version-update:semver-major`, and `typescript` `>= 6.1.0` (R32/R34).
- **`pnpm audit --prod`** (exit 1, as happens whenever anything is listed): **1 moderate**, `fflate@0.7.3` via `.>satori>fflate`, GHSA-px8p-9vwx-vf98 (vulnerable `>=0.7.0 <0.7.5`). That is the expected fflate/satori advisory only.
- **`pnpm audit` (full):** **17 vulnerabilities, 2 low / 10 moderate / 5 high / 0 critical.** This equals Task 13's recorded post-refresh count, so there is no registry drift. All are in the build-time jampack tree plus fflate:
  - `sharp@0.33.5` (jampack's bundled copy): 2 high
  - `undici@5.29.0` (via `@divriots/cheerio`): 12 advisories
  - `esbuild@0.20.2` (jampack): 1 moderate
  - `file-type@19.6.0` (jampack): 1 moderate
  - `fflate`: 1 moderate
- **`pnpm outdated`** (exit 1 = something is listed):
  - `@types/node (dev) 22.20.4 → latest 26.6.2`. The registry's latest 22.x is **22.20.4**, so it's at the cap (R27).
  - `typescript (dev) 6.0.3 → latest 7.0.2`. The registry's latest 6.0.x is **6.0.3**, so it's at the cap (typescript-eslint `<6.1.0`).
  - Nothing else is listed. The JSON form agrees.

## Observations (non-blocking)

1. **Pre-existing defect: every post's `og:image`/`twitter:image` is a broken URL. This is the cause of the W7 FAIL.**
   - `src/layouts/PostDetails.astro:34` builds ``new URL(ogImageUrl ?? `/posts/${post.id}.png`, Astro.url.origin)``. That line is identical on `main`.
   - The route `src/pages/posts/[slug]/index.png.ts` writes `/posts/<slug>/index.png`.
   - Current evidence:
     - preview: `/posts/audio-vs-paper-books.png` → 404
     - production (read-only GET): `https://www.novifyx.com/posts/audio-vs-paper-books.png` → **404**, while `…/posts/audio-vs-paper-books/index.png` → 200
     - production's HTML carries the same broken `og:image`
   - The 28-page set is identical on `main`.
   - Not a regression. A fix is a separate change, outside this spec's "no content/design changes" scope. Two options: `/posts/${post.id}/index.png`, or move the route to `src/pages/posts/[slug].png.ts`. **Recommend a follow-up.**
2. **Pre-existing content defect: 4 relative links 404.**
   - The links:
     - `src/content/blog/flutter-google-maps-static-map.mdx:27` `./flutter-google-maps-address-manipulation`
     - `flutter-google-maps-address-manipulation.mdx:27` `./flutter-google-maps-embedded-map`
     - `flutter-google-maps-address-manipulation.mdx:477` `./flutter-google-maps-setup`
     - `flutter-google-maps-embedded-map.mdx:27` `./flutter-google-maps-setup`
   - On the canonical trailing-slash URL they resolve under the current post, e.g. `/posts/flutter-google-maps-static-map/flutter-google-maps-address-manipulation`. That gives 404 in the preview and 404 in production (`num_redirects=0`).
   - Production 301s `/posts/<slug>` to `/posts/<slug>/`, so the links are broken for every visitor there.
   - They are outside W2's `/`-only scope, and the list is identical on `main`.
   - A content fix is out of scope. **Recommend a follow-up:** use `/posts/<slug>/` absolute links.
3. **Pre-existing:** `dist/404.html` has `canonical`/`og:url`/`twitter:url` = `https://www.novifyx.com/404/`, a URL that doesn't exist (the file is `/404.html`). The same is true on `main`.
4. **Pre-existing:** `/tags/` and `/threads/` each appear in two sitemaps. This is harmless.
5. **The W1 wording** "RSS item count equals the number of blog posts" doesn't match the feed's by-design posts + tips merge. The substantive checks (post and tip subset set-equality, and byte-identity with `main`) pass.
6. **CSS text changed** between `main` and the branch. The head tags are unchanged.
   - **Selector sets** (leaf preludes) are identical on all 5 W7 pages, except for 8 Astro view-transition rules: 7 `@keyframes astro*` plus the `prefers-reduced-motion` `::view-transition-*` rule. These moved from per-page inline `<style>` into the shared `Footer.css`, so `/` and `/about/` now also carry them.
   - **Declaration text** differs in whitespace and equivalent `calc()` forms, based on a sample of 4 rules (Tasks 4/7/13).
   - This lane doesn't assert visual equivalence; that is the visual lane's job.
7. **`/about/` `<head>` order:** the breadcrumb `<style>`, the `Footer.css` link and the Partytown bootstrap moved from positions 24–26 (`main`) to the end of `<head>`. That matches the other 4 pages on both builds. The same move was found in v1. The cascade is unaffected, because only the Google Fonts `@font-face` sheet changes relative order.
8. **Content types come from `astro preview`,** e.g. `text/xml` for RSS and sitemaps. GitHub Pages may send different headers. This isn't a build property.

## Raw evidence (scratch, not committed)

`/private/tmp/claude-501/-Users-ap-development-other-eliotik-github-io/917b6b41-1b79-43b6-8c59-b21d1efcf946/scratchpad/t8v2/site-wide/`:

| File | Content |
|---|---|
| `dist-manifest-start.txt`, `dist-manifest-end.txt`, `main-dist-manifest.txt` | sha256 of every file (branch at start and end, `main` snapshot) |
| `frontmatter.py`, `fm-build.json`, `fm-now.json` | Frontmatter derivation at build time and at run time |
| `w1-http.txt`, `rss.xml`, `sitemap-*.xml`, `robots.txt`, `locs.txt`, `locs-status.txt`, `rsscheck.py` | W1 |
| `crawl_exact.py`, `crawl-branch.json`, `crawl-main.json` | W2/W6 crawler and results |
| `uniq.py`, `uniq-paths.txt`, `uniq-status.txt`, `jsgraph.py` | W6 HTTP and module graph |
| `404-served.html` | W3 |
| `og.cjs` | W4 |
| `pt2.py`, `pt2-dist.json` | W5/W5a. On `main`, the checks were run inline, so there is no JSON. |
| `head.py`, `headorder.py`, `cssrules.cjs`, `layerdiff.cjs`, `prelude.cjs`, `prelude2.cjs`, `prelude.txt`, `prelude2.txt` | W7 |
| `counts.py`, `branch-pages.txt`, `main-pages.txt`, `branch-files.txt`, `main-files.txt` | W8 |
| `lsmatch.mjs`, `audit-prod.{txt,json}`, `audit-full.{txt,json}`, `outdated.{txt,json}` | W11 |
| `main-dist/` | Read-only snapshot of the visual lane's `main` (`3df6160`) dist |
