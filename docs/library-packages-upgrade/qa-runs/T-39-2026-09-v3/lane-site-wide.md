# T-39 Task 8 v3: QA lane "site-wide" (artifact and route integrity)

- **Verdict: PASS.** All 12 checks pass (W1–W11, W5a). **W7 now passes:** the Task 17 fix is in the build.
  - On every post, `og:image`/`twitter:image` is `https://www.novifyx.com/posts/<slug>/index.png`.
  - 28/28 post pages point at their own PNG.
  - All 254 og/twitter image URLs on the site (29 unique) return `200` from the preview.
  - `main` has 28 broken ones (56 attributes).
- **Findings:** no regressions and no new defects.
  - One check's wording doesn't match the code. W1 "RSS item count equals the number of blog posts" is 35 ≠ 28, because the feed merges tips by design.
  - Four items were already present on `main`. They are listed under Observations.
- **Repo / HEAD:** `/Users/ap/development/other/eliotik.github.io` @ `9eb1ec391aedca5a7ad615f37d53568f0a0f2aa0` (branch `upgrade/2026-09`).
- **Run window:** 2026-09-24, 19:01Z–19:22Z (the last `date -u` was 19:22:29Z). Every value below was measured in this run. Where a v2 number is quoted, it is only a cross-check.
- **What was tested:**
  - `dist/` built by the v3 build lane:
    - `dist/index.html` mtime 2026-09-24T18:50:54Z
    - 130 `.html`, 362 files
    - generator `Astro v7.3.5`
  - It's served by the shared `astro preview` at `http://localhost:4321` (pid 3520, IPv6 loopback). This lane did not start or stop it.
- **`dist/` did not change during the lane:**
  - I took a sha256 manifest of all 362 files at 19:01Z (`dist-manifest-start.txt`). I took it again at 19:22Z (`dist-manifest-end.txt`), after the last preview request of the lane.
  - `cmp` shows the two are identical.
- **Pre-upgrade reference (W7/W8, plus cross-checks elsewhere):**
  - At 19:01Z, `t8v3/` had only `build-lane/`, `chrome-islands/` and `playwright-e2e/`, and `git worktree list` showed only the main checkout. So no visual-lane `main` build existed yet, and this lane built its own.
  - Worktree: `git worktree add --detach …/scratchpad/t8v3/site-wide-main 3df6160` (= local `main`, the branch point).
  - `pnpm install --frozen-lockfile && pnpm build` ran with Node **v22.22.2** (from `main`'s `.nvmrc`) and pnpm **10.33.2** (`main`'s `packageManager`; pnpm 10.34.5 switched itself to it).
  - Results:
    - install exit 0
    - `astro check` 0 errors / 0 warnings / 0 hints
    - `[build] 127 page(s) built`
    - jampack `307 files`, "No issues"
    - build exit 0
    - worktree `git status --porcelain` empty
  - Output: 361 files, 129 `.html`, generator `Astro v6.2.1`, `og.png` = baseline `5eb52b44…`.
  - Reproducibility: this build equals v2's `main` snapshot, apart from the random `astro-island uid` values on 5 carousel pages and the `sitemap-index.xml` `<lastmod>`.
  - I `rsync`ed the dist to `…/t8v3/site-wide/main-dist/` as evidence. Then I removed the worktree (`git worktree remove --force` + `prune`), and `ls -d` returns "No such file or directory".
  - Later in the run, the visual lane created its own worktree `…/t8v3/main-before` and a preview on :4331. There was no collision: different paths, and neither was touched by this lane.
- **Tooling:**
  - Node v22.23.3 and pnpm 10.34.5 (`nvm use` from `.nvmrc`)
  - macOS `xmllint` (libxml 20913)
  - Python 3.11 `html.parser` crawler (`crawl.py`)
  - sharp 0.35.4 / libvips 8.18.6 from the repo's `node_modules`
  - lightningcss (repo `node_modules`) for the W7 CSS selector comparison
  - lint-staged 17.5.1's own `generateTasks` for W11
  - `gh api` for GitHub Action `action.yml`, README and tags
- **Scripts:**
  - Written fresh for this run: `fm.py`, `crawl.py`, `rsscheck.py`, `og.cjs`, `pt.py`, `head.py`, `counts.py`, `lsmatch.mjs`.
  - `prelude.cjs` is v2's `prelude2.cjs` with only the `main` path changed.
- **Case sensitivity:** GitHub Pages is case-sensitive, and APFS and `astro preview` are not. So every dist resolution in W1, W2 and W6 checks each path component case-exactly against `os.listdir`.
- **Files touched:** this report only. `git status --porcelain` shows only `?? .claude/`, `?? .serena/` and `?? docs/library-packages-upgrade/qa-runs/T-39-2026-09-v3/`. Nothing was staged or committed.

## Summary

| ID | Check | Result | Key evidence |
|---|---|---|---|
| W1 | RSS, sitemaps, OG, robots: status, types, xmllint, item count, `<loc>` reachability | **PASS** (see the wording note on the item count) | 5/5 → 200: rss `text/xml`, sitemap-index `text/xml`, og.png `image/png`, post PNG `image/png`, robots `text/plain`. Served bytes equal `dist/`. `xmllint --noout` ok on rss, the index and all 5 referenced sitemaps. 114/114 `<loc>` → 200 with 0 redirects. **Literal count: the feed has 35 `<item>`s, not 28.** `src/pages/rss.xml.ts` merges tips by design. The 28 post items are set-equal to the 28 published posts derived from frontmatter, and the 7 tip items to the 7 derived tips. rss, robots and all 5 sitemaps are byte-identical to `main`. |
| W2 | Internal link integrity and in-page fragments | **PASS** | 130 pages, 3622 `/`-rooted and same-site refs. Every `/`-rooted ref resolves case-exactly (0 broken), including 2175 `a[href]` (187 unique). 347 in-page `#fragment` links → 0 unmatched, 0 empty, 0 `#top` exemptions. 0 cross-page fragments. 0 duplicate ids. 0 links to the redirect stubs. |
| W3 | Redirects and custom 404 | **PASS** | `dist/posts/1/index.html` → `<meta http-equiv="refresh" content="0;url=/posts">`, and `/tips/1/` → `0;url=/tips`, as in `astro.config.mjs:20-23`. Both are byte-identical to `main`. `/this-route-doesnt-exist` (with or without `/`) → **404** `text/html`, and the body is `cmp`-identical to `dist/404.html` ("404 ¡Ay, caramba! Page Not Found Go back home"). |
| W4 | OG images for every eligible post | **PASS** | 28 expected (`!draft && !ogImage`, the filter in `src/pages/posts/[slug]/index.png.ts`) = 28 present, set-equal. The draft `come-back-later` has none. sharp checked all 29 PNGs (28 + `og.png`): valid signature, format png, 1200×630, full raw decode. **29/29 valid.** 28/28 post PNGs are byte-identical to `main`. |
| W5a | Partytown config in the output | **PASS** | 127/127 Layout pages have exactly one config `{lib:"/~partytown/",sandboxParent:"html",debug:!1}` plus forward `["dataLayer.push"]`, inside `<head>`. The gtag `src` script has `data-astro-transition-persist="gtag-src"` and the inline one `"gtag-init"`, each exactly once per page. Site-wide: `gtag-src` ×127, `gtag-init` ×127, no other persist ids. The same checker fails 127/127 on `main`, which proves it tells the builds apart. |
| W5 | Partytown assets and GA blocks | **PASS** | All 5 files in `dist/~partytown` → 200, and each served body is `cmp`-equal to `dist/`. The snippet's references (`partytown-sw.js`, `partytown-atomics.js`, `partytown-sandbox-sw.html`) all exist. 127/127 pages have exactly 2 `type="text/partytown"` blocks. Run in Node, the inline body yields `dataLayer=[["js",<Date>],["config","G-QQMCTBW5TH"]]` via `window.dataLayer.push(arguments)`, the same as `main`. |
| W6 | Asset references resolve | **PASS** | `script[src]` 262, stylesheets 145, `img[src]` 41, srcset candidates 74, `component-url` 17, `renderer-url` 17, island-prop URL strings 35: **0 broken**, case-exact. 333/333 unique internal paths → HTTP 200. JS module graph: 9 files, 8 import specifiers, 0 unresolved. CSS `url()`: 0 non-data refs. |
| W7 | `<head>` sanity on 5 pages vs pre-upgrade `main` | **PASS** | title, description, canonical, og:url and theme-color equal `main` on 5/5. **og:image resolves on 5/5.** On the post it is now `…/posts/audio-vs-paper-books/index.png` → `200 image/png` (on `main` it was the 404 URL `…/audio-vs-paper-books.png`). Head tag multisets are equal on 5/5. Every attribute delta is explained below: generator, 2 persist attributes, the post og/twitter image, and hash or chunk renames. |
| W8 | Content-collection page counts vs `main` | **PASS** | posts 28/28, post pagination 6/6, tips 7/7, tip pagination 2/2, tags 68/68, tag pagination 8/8, threads 2/2, other 8/8. **The sets are equal, not just the counts.** Both builds report `127 page(s) built`. |
| W9 | OG hashes (brief Step 8) | **PASS** | `dist/og.png` = `ae6c9aa4…8902`, Task 6's accepted hash, exactly. `dist/posts/audio-vs-paper-books/index.png` = `951f184b…8660`, the `sha256.txt` baseline, exactly. |
| W10 | TOC (brief Step 8) | **PASS** | `grep -o '<details' \| wc -l` = 1/1/1, matching `toc-counts.txt`. One `<summary>Open Table of contents</summary>` each. 8/10/7 TOC links, all resolving to in-page ids. Each TOC block is byte-identical to `main`. |
| W11 | Toolchain and config | **PASS** | No `@astrojs/sitemap` in `package.json` or the lockfile. `packageManager` `pnpm@10.34.5` = registry max `^10`. lint-staged tested on 1121 paths: 0 overlaps and 0 tracked files of a covered type left unmatched. CI runs `format:check`, and `pnpm/action-setup@v6` has no `version:`, so it reads `packageManager`. Dependabot: both generic groups' `exclude-patterns` equal the 17-pattern union of the named groups. `audit --prod` = only fflate via satori. Full audit = **17** (2 low / 10 moderate / 5 high / 0 critical). `outdated` = only typescript and `@types/node`, each at its cap. |

## W1: RSS, sitemaps, OG, robots

HTTP (`curl -s -o <file> -w "%{http_code} %{content_type} %{size_download}"` against `http://localhost:4321`):

```
/rss.xml 200 text/xml 14458
/sitemap-index.xml 200 text/xml 772
/og.png 200 image/png 13366
/posts/audio-vs-paper-books/index.png 200 image/png 14919
/robots.txt 200 text/plain 167
```

- Each served body is `cmp`-identical to its `dist/` file.
- `xmllint --noout` passes on the saved file and on the brief's own pipe (`curl … | xmllint --noout -`): `rss-ok`, `sitemap-ok`.

**Sitemaps.** `sitemap-index.xml` references 5 sitemaps. `dist/` has exactly these 5 plus the index, so there are no orphans.

| Sitemap | HTTP | Type | xmllint | Root | `<loc>` | served = dist | vs `main` |
|---|---|---|---|---|---|---|---|
| `/sitemap-pages.xml` | 200 | text/xml | ok | urlset | 7 | yes | byte-identical |
| `/sitemap-posts.xml` | 200 | text/xml | ok | urlset | 28 | yes | byte-identical |
| `/sitemap-tips.xml` | 200 | text/xml | ok | urlset | 7 | yes | byte-identical |
| `/sitemap-threads.xml` | 200 | text/xml | ok | urlset | 3 | yes | byte-identical |
| `/sitemap-tags.xml` | 200 | text/xml | ok | urlset | 69 | yes | byte-identical |

- The index differs from `main` only in `<lastmod>`, which is the build time (`2026-09-24T18:50:46.158Z` vs `19:01:56.751Z`).
- **Every `<loc>` returns 200:**
  - All 114 locs (112 unique) were fetched with `https://www.novifyx.com` mapped to the preview, using `curl -L`.
  - Result: `114 × "200 0 text/html"` (status, `num_redirects`, type). There are no off-site locs.
  - The 2 duplicates are `/tags/` and `/threads/`. Each is in `sitemap-pages.xml` and in its own sitemap. This is pre-existing (byte-identical to `main`).
- **Set checks (`rsscheck.py`):**
  - `sitemap-posts` (28) = the 28 derived published posts.
  - `sitemap-tips` (7) = the 7 derived tips.
  - `sitemap-tags` has 68 tag locs plus `/tags/`, equal to the 68 `dist/tags/*` directories.
- **`robots.txt`:** `User-agent: Googlebot` / `Disallow: /nogooglebot/` / `Disallow: /~partytown/`, then `User-agent: *` / `Allow: /` / `Disallow: /~partytown/`, then `Sitemap: https://www.novifyx.com/sitemap-index.xml`. Byte-identical to `main`.

**RSS item count.**
- **Frontmatter derivation** (`fm.py`, which follows the loader pattern `**/[^_]*.{md,mdx}`):
  - "now" is the build time, 2026-09-24T18:50:54Z (`dist/index.html` mtime). A second run at 19:02Z gave the same result.
  - `src/content/blog` has 29 files (20 `.md`, 9 `.mdx`): 1 `draft: true` (`come-back-later`) and 0 with `pubDatetime > now`, so **28 published**.
  - The task's rule (`pubDatetime <= now`) and the code's rule (`collectionFilter.ts`: `Date.now() > pubDatetime − SITE.scheduledPostMargin`, 15 min per `src/config.ts:11`) give the same 28. The newest post is 2026-09-23T15:00Z.
  - All 29 blog `slug:` values equal their filenames, which is how the glob loader forms the id.
  - `src/content/tips` has 7 files, none draft or scheduled, so **7**.
- **Feed: 35 `<item>`.** `src/pages/rss.xml.ts` returns `[...postItems, ...tipItems].sort(...)`. So the literal criterion "item count equals the number of blog posts" (28) **does not hold, by design**:
  - The 28 `/posts/` items are set-equal to the derived 28 (missing ∅, extra ∅, 0 duplicates). The draft is absent.
  - The 7 `/tips/` items are set-equal to the 7 derived `customSlug`s. No other links.
  - Every item has title, link, guid, pubDate and description, with `link == guid`. Items are sorted by pubDate, descending.
  - `dist/rss.xml` is **byte-identical to `main`'s**.
  - Recorded as PASS because what the check exists to verify holds: exactly the published, non-draft, non-scheduled posts are in the feed. The mismatch is in the wording (see Observation 1).

## W2: Internal link integrity

- **Crawler (`crawl.py`):**
  - It parses all 130 `.html` in `dist/` with Python `html.parser`, which decodes entities.
  - It extracts `href`, `src`, `srcset`/`imagesrcset` candidates, `component-url`, `renderer-url`, `before-hydration-url`, `poster`, `action`, `data-src`, `xlink:href`, `data`, `meta[content]`, and URL strings inside `astro-island[props]`.
  - It keeps values that start with `/` (not `//`), plus same-site absolute URLs (`https://www.novifyx.com/…`). `mailto:`, `tel:` and other schemes are ignored.
- **Resolver:**
  - Strip the query and fragment, then URL-decode.
  - A path ending in `/` must have `index.html`. Otherwise try the file, then `dir/index.html`, then `path.html`.
  - Every component must match case-exactly.

| Category | Refs | Unique | Broken |
|---|---|---|---|
| `a[href]` | 2175 | 187 | 0 |
| `link[rel=icon]` | 127 | 1 | 0 |
| `link[rel=sitemap]` | 127 | 1 | 0 |
| asset categories | see W6 | | 0 |
| `link[rel=canonical]` (absolute same-site) | 129 | 129 | 1, pre-existing (see below) |
| `meta[og:url]` / `meta[twitter:url]` (absolute same-site) | 127 / 127 | 127 / 127 | 1 / 1, pre-existing (see below) |
| `meta[og:image]` / `meta[twitter:image]` (absolute same-site) | 127 / 127 | 29 / 29 | **0 / 0** (`main`: 28 / 28) |

- **Every `/`-rooted reference resolves: 0 broken.** That is the check's scope.
- **The only unresolved values are same-site absolute URLs, 3 in total**, all on `/404.html`: `canonical`, `og:url` and `twitter:url` = `https://www.novifyx.com/404/`. That URL doesn't exist, since the file is `/404.html`. The same 3 are on `main`, and the branch-only set is ∅. See Observation 3.
- **In-page fragments:**
  - 347 `href="#…"` links site-wide. **0 have no matching `id` (or `a[name]`) on the same page.**
  - 0 empty `#`. The `#top` exemption was used 0 times.
  - 0 cross-page `/path#frag` refs.
  - 0 duplicate `id`s on any page.
- **Links to the redirect stubs:** 0. No page links `/posts/1/` or `/tips/1/`.
- **`main` cross-check:**
  - The same crawler on `main` gives 3622 refs and identical per-category counts, except og:image and twitter:image, which have 28 broken each on `main`.
  - It also gives 347 fragment links with 0 unmatched and the same 4 relative refs.
  - Broken branch-only: ∅. Broken `main`-only: the 56 post og/twitter image refs that Task 17 fixed.
- **Outside the check's scope:** 4 relative hrefs (`./flutter-google-maps-*`) in 3 `.mdx` posts. They 404 on the canonical trailing-slash URLs. This was measured in this run and the list is identical on `main`. See Observation 2.

## W3: Redirects and 404

`astro.config.mjs:20-23` has `redirects: { '/posts/1/': '/posts', '/tips/1/': '/tips' }`. Both stub files exist and are **byte-identical to `main`'s**.

`dist/posts/1/index.html`:
```html
<!doctype html><title>Redirecting to: /posts</title><meta http-equiv="refresh" content="0;url=/posts"><meta name="robots" content="noindex"><link rel="canonical" href="https://www.novifyx.com/posts"><body>	<a href="/posts">Redirecting from <code>/posts/1/</code> to <code>/posts</code></a></body>
```
`dist/tips/1/index.html` is the same, with `/tips`.

| Request (preview) | Status / redirects / type / bytes | Notes |
|---|---|---|
| `/posts/1/`, `/posts/1` | 200 / 0 / text/html / 296 | `content="0;url=/posts"`. The served body is `cmp`-equal to the dist stub. |
| `/tips/1/`, `/tips/1` | 200 / 0 / text/html / 290 | `content="0;url=/tips"` |
| `/posts`, `/posts/` (target) | 200 / 0 / text/html / 20911 | listing page |
| `/tips`, `/tips/` (target) | 200 / 0 / text/html / 38377 | listing page |
| `/this-route-doesnt-exist`, `/this-route-doesnt-exist/` | **404** / 0 / text/html / 15347 | body `cmp`-identical to `dist/404.html` |

**404 content:**
- `<title>404 Not Found | Novi Fyx</title>`.
- The `<main>` text is "404 ¡Ay, caramba! Page Not Found Go back home", and its only link is `/`.
- Both are identical on `main`.

## W4: OG images

- **Which posts should have one:** `src/pages/posts/[slug]/index.png.ts` `getStaticPaths` filters `!data.draft && !data.ogImage`. It has no schedule filter.
- **Expected vs present:**
  - From frontmatter: 29 − 1 draft = **28 expected**. No post sets `ogImage`.
  - `dist/posts/*/index.png`: **28 present**. missing `[]`, extra `[]`.
  - `dist/posts/come-back-later/` doesn't exist.
- **Validity** (`og.cjs`: sharp 0.35.4 / libvips 8.18.6 from the repo's `node_modules`). All 28 post PNGs plus `og.png` were checked for:
  - PNG signature `89504e470d0a1a0a`
  - `metadata().format === 'png'`
  - 1200×630
  - A full `raw()` decode that returns 1200×630
  - **Result: 29/29 valid, 0 invalid.**
- **vs `main`:** 28/28 post PNGs are byte-identical. Only `og.png` differs; see W9.

## W5a: Partytown config in the output (the Task 14 / R28 invariant)

- **Scope:** 130 `.html` − 2 redirect stubs (no layout) − `~partytown/partytown-sandbox-sw.html` (a Partytown asset) = **127 Layout pages**. All 127 carry the snippet.
- **Checks per page (`pt.py`): 127/127 OK, 0 bad.**
  - Exactly one inline `<script>` with the Partytown config. It contains exactly one copy of the literal `{lib:"/~partytown/",sandboxParent:"html",debug:!1}),v[u]=(v[u]||[]).concat(["dataLayer.push"]))})(window,"partytown","forward")` and sits inside `<head>`.
  - Exactly one `sandboxParent:` key per page, and its value is `"html"`.
  - Partytown 0.14.4's own reader, `querySelector(a.sandboxParent||"body")`, is present. It is the only other `sandboxParent` token.
  - Exactly 2 `type="text/partytown"` scripts, both in `<head>`:
    - the one with `src="https://www.googletagmanager.com/gtag/js?id=G-QQMCTBW5TH"` has `data-astro-transition-persist="gtag-src"`
    - the inline one has `data-astro-transition-persist="gtag-init"`
  - Each persist id appears exactly once per page.
- **Site-wide:**
  - `grep -rho 'data-astro-transition-persist="[^"]*"' dist | sort | uniq -c` → `127 gtag-init`, `127 gtag-src`, and no other values.
  - 1 distinct bootstrap snippet (3588 chars) and 1 distinct gtag-init body.
- **Checker correction (disclosed):**
  - My first rule required `sandboxParent` to appear exactly once per page. It failed 127/127.
  - Inspection showed the second occurrence is Partytown 0.14.4's reader, `n.querySelector(a.sandboxParent||"body").appendChild(c)`, not a second config.
  - The rule was tightened to: one `sandboxParent:` key, plus the reader, 2 tokens in total.
  - As a negative control, the corrected checker fails all 127 `main` pages. `main`'s config is `{lib:"/~partytown/",debug:!1}` with 0 persist attributes.
- **Source:**
  - `astro.config.mjs:33-35`: `partytown({ config: { forward: ['dataLayer.push'], sandboxParent: 'html' } })`
  - `src/layouts/Layout.astro:129`: `transition:persist="gtag-src"`
  - `src/layouts/Layout.astro:137`: `transition:persist="gtag-init"`

## W5: Partytown assets and GA blocks

Every file in `dist/~partytown`, fetched from the preview:

```
/~partytown/partytown-atomics.js 200 text/javascript 46049 dist-bytes=46049 served==dist
/~partytown/partytown-media.js 200 text/javascript 8800 dist-bytes=8800 served==dist
/~partytown/partytown-sandbox-sw.html 200 text/html;charset=utf-8 45949 dist-bytes=45949 served==dist
/~partytown/partytown-sw.js 200 text/javascript 47177 dist-bytes=47177 served==dist
/~partytown/partytown.js 200 text/javascript 3198 dist-bytes=3198 served==dist
```

- **Bootstrap snippet:** the files it references (`partytown-atomics.js`, `partytown-sandbox-sw.html`, `partytown-sw.js`) all exist in `dist/~partytown/`. `@qwik.dev/partytown` is 0.14.4.
- **`main` has 4 files.** `partytown-sandbox-sw.html` is new, from 0.14.4 (Task 2).
- **127/127 pages have exactly 2 `text/partytown` blocks** (W5a). The forward list is `["dataLayer.push"]`.
- **Inline GA body:**
  - Branch: `window.dataLayer = window.dataLayer || []; function gtag() { // eslint-disable-next-line prefer-rest-params \n window.dataLayer.push(arguments); } gtag('js', new Date()); gtag('config', 'G-QQMCTBW5TH');`. Newlines are preserved, so the `//` comment can't swallow any code.
  - Run with `new Function('window', body)` in Node, the branch body produces `[["js","<Date>"],["config","G-QQMCTBW5TH"]]`, and `main`'s body produces the same.
  - The layout differs only by the Task 5 Prettier reformat.
- **Not covered here:** runtime service-worker behaviour and navigation are owned by the Playwright lane.

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
| URL strings in `astro-island[props]` (carousel images) | 35 | 34 | 0 |
| `link[rel=icon]` / `link[rel=sitemap]` | 127 / 127 | 1 / 1 | 0 |

- **Unique internal assets:**
  - Scripts: `/_astro/ClientRouter.astro_astro_type_script_index_0_lang.CYDbzu1r.js`, `/toggle-theme.js`, `/_astro/ec.0vx5m.js`.
  - Stylesheets: `/_astro/Footer.BnrdipP9.css`, `Tips.i4aH78fP.css`, `ec.s4b1i.css`, `index.C0tC3-oh.css`.
  - Islands: `ImageSliderClient.CgCc8xoX.js`, `Search.5bjErYsM.js`, `TagsList.C8dn6EDy.js`. The renderer is `client.CLhIxG29.js`.
- **Not present in the build:** `<source srcset>`, `modulepreload`, `preload` and `before-hydration-url`.
- **Out of scope:** external googletagmanager and Google Fonts.
- **Over HTTP:** all 333 unique internal paths (every `href`/`src`/srcset/island URL plus island-prop URLs) were requested from the preview.
  - Result: **333 × 200**.
  - Content types: 146 text/html, 123 image/webp, 38 image/png, 6 image/jpeg, 6 image/gif, 1 image/svg+xml, 4 text/css, 7 text/javascript, 2 text/xml.
- **JS module graph:** 9 JS files (`_astro/*.js` and `/toggle-theme.js`) with 8 static or dynamic import specifiers: **0 unresolved**. Inline `<script>` import specifiers: 0.
- **CSS:** `url()` refs in `_astro/*.css` (4 files): 0 non-data refs. Inline `<style>`: 0.
- **vs `main`:** the per-category ref, unique and broken counts are identical.

## W7: `<head>` sanity on 5 pages vs pre-upgrade `main`

**Result: PASS.** Pages: `/`, `/posts/audio-vs-paper-books/`, `/tips/motivation-is-a-trap/`, `/tags/`, `/about/` (`head.py`; output in `head.json`).

| Page | title | description | canonical | og:image | og:image HTTP | theme-color |
|---|---|---|---|---|---|---|
| `/` | Novi Fyx | New Partial Derivative! | `https://www.novifyx.com/` | `…/novifyx-og.jpg` | 200 image/jpeg | `""` |
| post | Audio vs Paper Books \| Novi Fyx | My experience so far with audio and paper books. Which one is better for me and why. | `…/posts/audio-vs-paper-books/` | **`…/posts/audio-vs-paper-books/index.png`** | **200 image/png** | `""` |
| tip | Motivation is a trap. Build a system instead. \| Novi Fyx | Motivation is a trap. Build a system instead. | `…/tips/motivation-is-a-trap/` | `…/novifyx-og.jpg` | 200 image/jpeg | `""` |
| `/tags/` | Tags \| Novi Fyx | New Partial Derivative! | `…/tags/` | `…/novifyx-og.jpg` | 200 image/jpeg | `""` |
| `/about/` | About \| Novi Fyx | New Partial Derivative! | `…/about/` | `…/novifyx-og.jpg` | 200 image/jpeg | `""` |

- **Same as `main`:** title, description, canonical, og:url and theme-color are all equal to `main` on 5/5 pages. The canonical of each page also returns 200.
- **og:image and twitter:image** are equal to `main` on 4/5. On the post they now point at the generated PNG (Task 17, `src/layouts/PostDetails.astro:35`).
  - `main` has `…/posts/audio-vs-paper-books.png`, which returns 404.
  - Across the site, all 28 post pages carry exactly `https://www.novifyx.com/posts/<own-slug>/index.png` for both og and twitter: 28/28.
- **`theme-color`** is `content=""` at build time on both builds. `toggle-theme.js` sets it at runtime, and that file is byte-identical to `main`'s.
- **Head element counts and tag multisets are equal to `main` on all 5 pages:**
  - `/`: 36 (meta 18, link 9, script 6, style 1, title 1, noscript 1)
  - post: 44 (meta 20, link 8, style 8, script 6, title 1, noscript 1)
  - tip: 41
  - `/tags/`: 36
  - `/about/`: 36
- **No `<head>` element was added or removed on any page.**
- **Attribute-set deltas** (full attribute/value multiset diff after hash normalisation):

  | # | Element | `main` | Branch | Pages | Cause |
  |---|---|---|---|---|---|
  | 1 | `meta[name=generator]` | `Astro v6.2.1` | `Astro v7.3.5` | 5/5 | The upgrade (Tasks 4 / 13b) |
  | 2 | gtag `src` script | no persist attribute | `+ data-astro-transition-persist="gtag-src"` | 5/5 | Task 14 (R28), see W5a |
  | 3 | inline gtag script | no persist attribute | `+ data-astro-transition-persist="gtag-init"` | 5/5 | Task 14 (R28) |
  | 4 | `meta[property=og:image]`, `meta[property=twitter:image]` | `…/audio-vs-paper-books.png` (404) | `…/audio-vs-paper-books/index.png` (200) | post | Task 17 fix |
  | 5 | `/_astro/*` hashed names | e.g. `ClientRouter…j56hQv-j.js`, `Footer.CKIJxfJt.css` | `ClientRouter…CYDbzu1r.js`, `Footer.BnrdipP9.css` | 5/5 | Content hash only. Every file exists and returns 200 (W6). |
  | 6 | `/` page stylesheet | `/_astro/index@_@astro.XXiaa8fH.css` | `/_astro/index.C0tC3-oh.css` | `/` | Vite 8 / Rolldown chunk naming. The file exists and returns 200. |

  Attribute *name* sets differ only in #2 and #3.
- **Inline text deltas** (no tag or attribute change):
  - GA init body: the Task 5 reformat. It runs identically (W5).
  - Partytown bootstrap: 2566 → 3587 chars (whitespace-normalised). This is `@qwik.dev/partytown` 0.13.2 → 0.14.4 (Task 2) plus `sandboxParent:"html"` (Task 14).
  - Inline `<style>` blocks: the count per page is unchanged (1/8/4/2/2). Blocks were matched by content, after whitespace and `astro-<cid>` normalisation:
    - **`/`:** its single block (jampack's `img[jampack-sized]` rule, 74 chars) is identical.
    - **Post, tip and `/tags/`:** the breadcrumb block went from 2542 to 1924 chars.
      - `main`'s block contains Astro's 7 `@keyframes astro*` and the `prefers-reduced-motion` view-transition rule. The branch's has 0 of each: they moved to the shared `Footer.<hash>.css`.
      - The branch block gains the `/*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */` banner (65 chars, plus one separating space).
    - **The post's and the tip's page-specific blocks** grew by 66 chars (2957→3023 and 1534→1600). That is the same banner plus its space.
    - **The post's 5 `[data-astro-transition-scope]` blocks** are identical once the cid is normalised.
    - **`/about/`:** the breadcrumb block went from 771 to 838 chars, which is the banner plus minifier differences. It has no keyframes on either build.
    - What these blocks contain is covered by the selector-set check below. Declaration text also differs by the Tasks 4/7/13 lightningcss/browserslist output.
- **Selector-set check** (`prelude.cjs`; output in `prelude.txt`). Method: each page's full CSS (inline `<style>` plus linked sheets) is re-minified with one lightningcss, scope hashes are normalised, and the result is flattened to leaf preludes and compared as a multiset.

  | Scope | Branch | `main` | Only branch | Only `main` |
  |---|---|---|---|---|
  | `Footer.css` | 677 | 1079 | 10 | 412 |
  | `/` | 719 | 1121 | 10 | 412 |
  | post | 749 | 1159 | 2 | 412 |
  | tip | 769 | 1179 | 2 | 412 |
  | `/tags/` | 688 | 1098 | 2 | 412 |
  | `/about/` | 683 | 1085 | 10 | 412 |

  - **Only branch:** 8 are Astro's 7 `@keyframes astro*` plus the reduced-motion `::view-transition-*` rule, now in the shared `Footer.css`. The other 2 are `.shrink-0` and `.grow`, and they are **selector-list split artifacts**, not new rules:
    - `main` has `.flex-shrink-0,.shrink-0{flex-shrink:0}` and `.flex-grow,.grow{flex-grow:1}`.
    - The branch has `.shrink-0{flex-shrink:0}` and `.grow{flex-grow:1}`.
    - The same declarations are kept; only the unused aliases `flex-shrink-0` and `flex-grow` were dropped.
  - **Only `main`:** 412 leaves. This is Task 17b's `source('..')` restriction; `main`'s Tailwind also scanned `docs/`.
    - They hold 399 distinct classes. **0 of them appear in any branch `dist` HTML `class` attribute or island JS string literal.** The one exception is `shrink-0`, via the split `.flex-shrink-0,.shrink-0` leaf, and it is still defined on the branch.
    - The other 12 leaves are 11 `@property --tw-*` registrations plus `@keyframes spin`. They cover the gradient, `space-y-reverse` and `divide-x-reverse` vars. No utility that sets those vars remains.
    - `--tw-gradient-*` now appears only in `transition-property` lists, and `spin` only in the `::-webkit-*-spin-button` preflight.
  - Pixel equivalence belongs to the visual lane. This lane doesn't claim it.
- **Order:**
  - `/`, the post, the tip and `/tags/` have identical `<head>` order to `main`.
  - `/about/` (a Markdown page with a layout) has one block moved. The breadcrumb `<style>`, the `Footer.<hash>.css` link and the Partytown bootstrap `<script>` were at positions 23–25 on `main`, right after the Google Fonts `media=print` link. On the branch they are at positions 33–35, the end of `<head>`, which is where the other 4 pages have them on both builds.
    - The bootstrap now comes after the two `text/partytown` scripts, as on the other 4 pages (and on those pages in `main`).
    - Relative to site CSS, only Google Fonts changes order, and it only declares `@font-face`, so the cascade is unaffected.
    - This is the same move v1/v2 found: Astro 7 head injection for `.md` layouts.

## W8: Content-collection page counts (branch vs `main`, the W7 build)

The `.html` file sets of both builds were classified with `counts.py`; the lists are in `branch-pages.json` and `main-pages.json`.

| Category | `main` | Branch | Same set |
|---|---|---|---|
| `/posts/<slug>/` (detail) | 28 | 28 | yes |
| `/posts/<n>/` (pagination, incl. the `/posts/1/` stub) | 6 | 6 | yes |
| `/tips/<slug>/` (detail) | 7 | 7 | yes |
| `/tips/<n>/` (pagination, incl. the `/tips/1/` stub) | 2 | 2 | yes |
| `/tags/<tag>/` | 68 | 68 | yes |
| `/tags/<tag>/<n>/` (pagination) | 8 | 8 | yes |
| `/threads/<slug>/` | 2 | 2 | yes |
| Other pages (`/`, `/404.html`, `/about/`, `/posts/`, `/search/`, `/tags/`, `/threads/`, `/tips/`) | 8 | 8 | yes |

- **Total `.html` is 130 on the branch and 129 on `main`.** The only extra file is `~partytown/partytown-sandbox-sw.html`, a Partytown 0.14.4 asset and not a page. Both builds log `127 page(s) built`.
- **Whole-dist file comparison** (sha256 manifests):
  - Branch has 362 files and `main` 361, with 351 in common.
  - Only on the branch: 11 files, the 10 renamed `_astro` chunks plus `partytown-sandbox-sw.html`.
  - Only on `main`: 10 files, the renamed `_astro` chunks, including `index@_@astro.*.css` and `main`'s `index.elwlu7WY.js`. The branch has `react.DJY1zw8Z.js` instead (Vite 8 splitting).
  - Common but different: 132 files, which are 127 html, 3 `~partytown` js (0.14.4), `og.png` (W9) and `sitemap-index.xml` (`<lastmod>` only).
  - Identical html: the 2 redirect stubs.
- **Counts match content:** 28 = published posts, 7 = tips, 68 = the tag entries in `sitemap-tags` and the `dist/tags/*` directories.

## W9: OG baseline comparison

```
$ shasum -a 256 dist/og.png dist/posts/audio-vs-paper-books/index.png
ae6c9aa406da0d27944d155e4e9ec5fe8a92116b2f78d9897fe14697749e8902  dist/og.png
951f184b268e003e34c26b90e7109b07c988969269b38a0e3892e668c5838660  dist/posts/audio-vs-paper-books/index.png
$ cat docs/library-packages-upgrade/baseline/2026-09/og/sha256.txt
951f184b268e003e34c26b90e7109b07c988969269b38a0e3892e668c5838660  og/audio-vs-paper-books.png
5eb52b447f426563e10bbac411f409a00bd3a078dd231673fef9eafc938ae991  og/og.png
```

- **`posts/audio-vs-paper-books/index.png`** equals the baseline exactly.
- **`og.png`** equals Task 6's accepted hash `ae6c9aa406da0d27944d155e4e9ec5fe8a92116b2f78d9897fe14697749e8902` exactly. So the visual fallback was not needed.
- **Cross-checks:**
  - The committed baseline PNGs hash to the values in `sha256.txt`.
  - This run's fresh `main` build has `og.png` = `5eb52b44…ae991` (the baseline) and the post PNG = `951f184b…8660`.
  - So the only `og.png` delta is satori 0.33.5 (Task 6).

## W10: TOC

| Post | Source | `grep -o '<details' \| wc -l` | `toc-counts.txt` | `<summary>Open Table of contents</summary>` | TOC links (all resolve to in-page ids) | TOC block vs `main` |
|---|---|---|---|---|---|---|
| audio-vs-paper-books | `.md` | 1 | 1 | 1 | 8 | byte-identical |
| ems-the-delivery-system | `.md` | 1 | 1 | 1 | 10 | byte-identical |
| dad-ops-playbook | `.mdx` | 1 | 1 | 1 | 7 | byte-identical |

- **Structure:** a multi-line regex matches the `toc-counts.txt` wrapper: `<h2 id="table-of-contents">Table of contents</h2>`, `<p></p>`, `<details>`, `<summary>Open Table of contents</summary>`, `<p></p>`, `<ul>…</details>`.
- **`main`:** also 1 `<details>` per post.
- **Not covered here:** expand-on-click is Playwright P6.

## W11: Toolchain and config

- **`@astrojs/sitemap` (R23):**
  - `grep -c sitemap package.json` = 0 and `grep -c '@astrojs/sitemap' pnpm-lock.yaml` = 0.
  - The sitemaps come from the custom endpoints `src/pages/sitemap-*.xml.ts` (W1).
- **`packageManager`:**
  - It is `"pnpm@10.34.5"`. `npm view 'pnpm@^10' version | tail -1` = `10.34.5`, so it's the latest 10.x (R25 keeps the major at 10).
  - `lockfileVersion: '9.0'`. Local `pnpm -v` = 10.34.5.
- **lint-staged** (`package.json`), checked with lint-staged 17.5.1's own `generateTasks` (`lsmatch.mjs`). It was run on 18 sample paths plus all 1115 `git ls-files` paths, 1121 unique in total (12 of the samples are tracked files):
  - `*.{js,mjs,cjs,jsx,ts,tsx,astro}` → `["eslint --fix","prettier --write"]`. Samples: `a.js`, `src/x.mjs`, `x.cjs`, `.jsx`, `.ts`, `.tsx`, `src/layouts/Layout.astro`, `eslint.config.js`, `astro.config.mjs`.
  - `*.{md,mdx,json,css,yml,yaml}` → `["prettier --write"]`. Samples: `README.md`, `.mdx`, `package.json`, `tsconfig.json`, `.css`, `.github/workflows/ci.yml`, `.github/dependabot.yml`, `a.yaml`.
  - `.prettierrc` → `["prettier --write"]`.
  - **0 overlaps**: no file matches two globs.
  - **0 tracked files of a covered extension left without a task.** Tracked matches: js 2, mjs 1, ts 28, tsx 11, astro 34, md 89, mdx 9, json 86, css 1, yml 3, yaml 2.
  - Unmatched tracked files are only non-code: images, `.txt`/`.log`/`.html` QA artifacts, `.nvmrc`, `.prettierignore`, `.gitignore`, `.npmrc`, `.nojekyll`, `*.sh`, and the husky hook.
- **Prettier and Astro:** `.prettierrc` has `"astroCompressHTML":true` and `astro.config.mjs:88` has `compressHTML: true`, so they match (global constraint).
- **`ci.yml`:**
  - Steps: `actions/checkout@v7`, then `pnpm/action-setup@v6` **with no `with:`/`version:`**, then `actions/setup-node@v7` (`node-version-file: '.nvmrc'`, `cache: pnpm`, after pnpm setup).
  - Then `pnpm install --frozen-lockfile`, `pnpm astro check`, `pnpm lint`, **`pnpm format:check`** and `pnpm build`.
  - Then `pnpm audit --prod` (`continue-on-error`).
- **`pnpm/action-setup@v6`** (`gh api …/contents/action.yml?ref=v6`; tag sha `f520ecea…`):
  - `version` is `required: false`. `package_json_file` defaults to `package.json` with the description "to read "packageManager" configuration".
  - The v6 README's Inputs section says `version` is "**Optional** when there is a `packageManager` … field". It also says `pnpm/action-setup` "remains the action to use for installing pnpm v10 and older".
  - The README's "omit only for v11+" sentence applies to the successor `pnpm/setup`, not to this action.
- **Action tags exist** (`gh api …/git/ref/tags/…`): `actions/checkout v7`, `actions/setup-node v7`, `withastro/action v6`, `actions/deploy-pages v5`.
- **`deploy.yml`:** no `corepack` string anywhere under `.github/`, and `node-version: 22.23.3` matches `.nvmrc`.
- **`dependabot.yml`** (parsed with PyYAML):
  - **Named groups** (no `dependency-type`): `astro`, `react`, `eslint`, `tailwind`. Their pattern union is **17 unique patterns**, with no duplicates.
  - **`prod-minor`** (`dependency-type: production`, `['minor','patch']`) `exclude-patterns`: 17 unique. named − excluded = ∅, excluded − named = ∅. **Equal.**
  - **`dev-minor`** (`development`, `['minor','patch']`) `exclude-patterns`: 17 unique, equal in both directions.
  - **`ignore`:** `@types/node` `version-update:semver-major`, and `typescript` `>= 6.1.0`.
- **`pnpm audit --prod`** (exit 1, as happens whenever anything is listed): **1 moderate**, `fflate@0.7.3` via `.>satori>fflate`, GHSA-px8p-9vwx-vf98 (vulnerable `>=0.7.0 <0.7.5`). That is only the expected fflate/satori advisory.
- **`pnpm audit` (full):** **17 vulnerabilities, 2 low / 10 moderate / 5 high / 0 critical.** This matches Task 13 and v2, so there is no drift. All are in the build-time jampack tree, plus fflate:
  - `undici@5.29.0` via `@divriots/jampack > @divriots/cheerio`: 12 advisories
  - `sharp@0.33.5` (jampack's copy): 2 high
  - `esbuild@0.20.2` (jampack): 1 moderate
  - `file-type@19.6.0` (jampack): 1 moderate
  - `fflate@0.7.3` (satori): 1 moderate
- **`pnpm outdated`** (exit 1 = something is listed). The table and `--format json` agree:
  - `@types/node (dev)`: current 22.20.4, wanted 22.20.4, latest 26.6.2. `npm view '@types/node@^22' version | tail -1` = **22.20.4**, so it's at the R27 cap.
  - `typescript (dev)`: current 6.0.3, wanted 6.0.3, latest 7.0.2. `npm view 'typescript@~6.0'` lists 6.0.2 and **6.0.3**, so it's at the cap. `@typescript-eslint/{parser,eslint-plugin}` peer `typescript: ">=4.8.4 <6.1.0"`.
  - Nothing else is listed.

## Observations (non-blocking)

1. **W1 wording vs code (second run in a row).** "RSS item count equals the number of non-draft, non-scheduled blog posts" is literally 35 ≠ 28.
   - `src/pages/rss.xml.ts` intentionally merges 7 tips into the feed.
   - Both subsets (28 posts, 7 tips) are set-equal to the frontmatter derivation, and the feed is byte-identical to `main`.
   - **Recommend the controller rewords the check** to "post items = published posts; tip items = published tips".
2. **Pre-existing content defect: 4 relative links 404.** This was measured in this run (`relrefs-status.txt`), and the list is identical on `main`. Links and their canonical-URL targets:
   - `flutter-google-maps-static-map.mdx:27` `./flutter-google-maps-address-manipulation`, resolved on `/posts/flutter-google-maps-static-map/` → `/posts/flutter-google-maps-static-map/flutter-google-maps-address-manipulation` → **404**
   - `flutter-google-maps-address-manipulation.mdx:27` `./flutter-google-maps-embedded-map` → **404**
   - `flutter-google-maps-address-manipulation.mdx:477` `./flutter-google-maps-setup` → **404**
   - `flutter-google-maps-embedded-map.mdx:27` `./flutter-google-maps-setup` → **404**

   Details:
   - Without the trailing slash, all 4 resolve and return 200.
   - The site's own links reach these posts mostly with the trailing slash (for example, 10 of 11 links to `address-manipulation` use it), and the canonical URL has it.
   - This is outside W2's `/`-only scope and outside this spec's "no content changes" rule. **Follow-up:** use absolute `/posts/<slug>/` links.
3. **Pre-existing:** `dist/404.html` has `canonical`, `og:url` and `twitter:url` = `https://www.novifyx.com/404/`, a URL that doesn't exist (the file is `/404.html`). The same is true on `main`.
4. **Pre-existing:** `/tags/` and `/threads/` each appear in 2 sitemaps. This is harmless, and the sitemaps are byte-identical to `main`.
5. **CSS vs `main`:** 412 unused selector leaves were removed (Task 17b, R37). 0 of 399 classes are used in the branch dist. `.shrink-0` and `.grow` survive as the used halves of `main`'s split selector lists. Astro's view-transition keyframes and reduced-motion rule are now in the shared `Footer.css`, so `/` and `/about/` also load them. Declaration text differs in whitespace and in equivalent forms (Tasks 4/7/13). This lane doesn't assert visual equivalence; that's the visual lane's job.
6. **`/about/` `<head>` order:** the style, `Footer.css` link and Partytown bootstrap block moved to the end of `<head>`, where the other 4 pages have it on both builds. The cascade is unaffected.
7. **Content types come from `astro preview`,** e.g. `text/xml` for RSS and sitemaps. GitHub Pages sets its own headers. This isn't a build property.
8. **The W5a checker was tightened once during the run** (details in W5a). The corrected rule is stricter, not looser. It pins the exact config literal and allows only Partytown's own reader token, and it fails `main` 127/127 as a negative control.
9. **The pre-upgrade build is reproducible:** this run's `main` build equals v2's `main` snapshot apart from random `astro-island uid`s and `<lastmod>`. So v1, v2 and v3 all compare against the same reference.
10. **Environment:** the visual lane's worktree `…/t8v3/main-before` and its preview on :4331 appeared after this lane's 19:01Z check. They were not touched. The shared preview on :4321 (pid 3520) was still listening at the end of the lane.

## Raw evidence (scratch, not committed)

`/private/tmp/claude-501/-Users-ap-development-other-eliotik-github-io/917b6b41-1b79-43b6-8c59-b21d1efcf946/scratchpad/t8v3/site-wide/`:

| File | Content |
|---|---|
| `dist-manifest-start.txt`, `dist-manifest-end.txt`, `main-dist-manifest.txt` | sha256 of every file (branch at start and end, `main` build) |
| `main-build.log`, `main-dist/` | `main` (3df6160) install and build log, and a read-only copy of its dist (the worktree was removed) |
| `fm.py`, `fm-build.json`, `fm-now.json` | Frontmatter derivation at build time and at run time |
| `w1-http.txt`, `w1_*`, `sitemaps.txt`, `sm_*.xml`, `locs.txt`, `locs-status.txt`, `rsscheck.py` | W1 |
| `crawl.py`, `crawl-branch.json`, `crawl-main.json`, `relrefs-status.txt` | W2/W6 crawler, results, and the relative-link measurement |
| `uniq-paths.txt`, `uniq-status.txt`, `og-urls.txt`, `og-urls-status.txt` | W6 HTTP sweep and the og/twitter image URL sweep |
| `w3_*.html` | W3 served bodies |
| `og.cjs` | W4 |
| `pt.py`, `pt-branch.json`, `pt-main.json`, `gtag-init.js`, `gtag-init-main.js` | W5/W5a |
| `head.py`, `head.json`, `prelude.cjs`, `prelude.txt` | W7 |
| `counts.py`, `branch-pages.json`, `main-pages.json` | W8 |
| `w9-sha.txt` | W9 |
| `lsmatch.mjs`, `audit-prod.{txt,json}`, `audit-full.{txt,json}`, `outdated.{txt,json}` | W11 |
