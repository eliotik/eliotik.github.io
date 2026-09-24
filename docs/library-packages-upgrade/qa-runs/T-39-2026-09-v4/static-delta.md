# QA lane `static-delta`: T-39 Phase 3 whole-site delta (v4)

**Lane:** static-delta (Opus). **Date:** 2026-09-24, 21:46Z to 22:01Z (UTC).
**Under test:** `ab5c02d687e5266ad122db3a37de873ca385a991` (HEAD of `upgrade/2026-09`).
**Reference:** `9eb1ec391aedca5a7ad615f37d53568f0a0f2aa0`. This is the tree Task 8 v3 fully verified with an Overall PASS (report section "v3 — final" in `verification-report-2026-09.md`).
**Phase 3 code commits:** `1326205` (Task 18), `05c8894` (Task 19), `889a6cf` (Task 20) and `ab5c02d` (Task 21). `a6622c1` changes only `docs/`. `git diff --stat 9eb1ec3 ab5c02d -- ':!docs'` touches 6 files, all under `src/`: 3 Flutter `.mdx` files, `Layout.astro`, `404.astro` and `sitemap-pages.xml.ts`. `package.json` and `pnpm-lock.yaml` are unchanged; the lockfile sha256 is `cb7f0f7010ac…` in both worktrees.

## Verdict: **PASS**

The whole built site at `ab5c02d` differs from `9eb1ec3` **only** by the four intended Phase 3 deltas.
- 362 = 362 files, with identical file lists.
- All 230 non-HTML files other than the two sitemaps are byte-identical.
- 100 HTML hunks, every one classified: 4 are (a), 4 are (b) and 92 are (c). **0 unclassified.**
- `sitemap-pages.xml` loses exactly the `/tags/` and `/threads/` `<url>` blocks.
- `sitemap-index.xml` is equal once `<lastmod>` is stripped.

Every other v3 result therefore carries forward.

| ID | Check | Result | Key evidence |
|---|---|---|---|
| S1 | Gate at `ab5c02d` | **PASS** | install `--frozen-lockfile` 0; `astro check` 0 (Result (77 files): 0 errors, 0 warnings, 0 hints); `lint` 0; `format:check` 0 ("All matched files use Prettier code style!"); `build` 0 (127 page(s) built, jampack "✔ No issues", 246/308 files compressed, the same 9 known `MODULE_LEVEL_DIRECTIVE` warnings as v3) |
| S2 | Whole-site diff `9eb1ec3` → `ab5c02d` | **PASS** | 362/362 identical lists. 230/230 non-HTML byte-identical. `sitemap-pages.xml` −2 blocks (`/threads/`, `/tags/`), `sitemap-index.xml` lastmod-only. HTML: 33 raw-identical, 2 uid-only, 95 with hunks; 100 hunks = 4 (a) + 4 (b) + 92 (c), 0 unclassified |
| S3 | Link integrity at `ab5c02d` | **PASS** | 130 HTML, 4632 refs, 6195 resolutions (both bases), **0 unresolved**; 347 in-page fragments, 0 missing; 35 island-prop URLs, 0 broken. Negative control: `9eb1ec3` has 5 unresolved (the 4 Flutter relative hrefs plus the 404 canonical) |
| S4 | Sitemaps | **PASS** | `xmllint --noout` 0 on all 6 sitemaps and `rss.xml`. New total 112 = unique 112 (old 114 total / 112 unique). The unions are set-equal (only-old ∅, only-new ∅). 112/112 `<loc>` map to `…/index.html`. The index lists exactly the 5 `sitemap-*.xml` files |
| S5 | SEO heads | **PASS** | 380 canonical/og:url/twitter:url tags (128 + 126 + 126), 0 unresolved. `404.html` has none of them plus `<meta name="robots" content="noindex,follow">`. The noindex set is old (17) ∪ {`404.html`} = 18; tags are unchanged on all 17; no page has more than one robots meta |

## Method

- **Worktrees:** `…/scratchpad/p3v/static-delta-new` at `ab5c02d` and `…/scratchpad/p3v/static-delta-old` at `9eb1ec3`. Both were created with `git worktree add --detach` and are removed at the end.
- **Toolchain:** Node v22.23.3 (`nvm use`, `.nvmrc`) and pnpm 10.34.5.
- **Builds:** each tree ran `pnpm install --frozen-lockfile && pnpm build`, which includes `astro check` and jampack. The main checkout was neither built nor modified.
- **Copies:** both `dist/` trees were copied (`old-dist-run1`, `new-dist-run1`) and every comparison ran on the copies. `diff -r` of `new-dist-run1` against the worktree `dist/` was empty.
- **Case-exact resolution:** all path resolution uses a set built once from `os.walk(dist)`, never `os.path.exists`. macOS APFS is case-insensitive; GitHub Pages is not.
- **Archived evidence:** in `static-delta/` next to this report.
  - Scripts, saved as `.txt`: `gate.sh.txt`, `s2_diff.py.txt`, `s3_links.py.txt`, `s4_s5.py.txt`, `c_cat.py.txt`, `pin_v3.py.txt`.
  - Results: `s2.json`, `s3-new.json`, `s3-old.json`, `s4s5.json`, `c-pages.json`, `pin_v3-output.txt`.
  - Gate logs: `new-gate.txt`, `new-check.log`, `new-lint.log`, `new-format.log`, `new-build.log`, `old-gate.txt`, `*-build-warns.txt`.
  - sha256 manifests for both builds: `old-9eb1ec3-dist-manifest.txt`, `old-9eb1ec3-dist-manifest-run2.txt`, `new-ab5c02d-dist-manifest.txt`.

### Pinning the rebuilt reference to the v3-verified artifact

The v3 site-wide lane's sha256 manifest of the verified `dist/` is `…/scratchpad/t8v3/site-wide/dist-manifest-start.txt` (362 lines; `start` = `end`). Comparing the fresh `9eb1ec3` build against it:
- The file lists are identical (362).
- **356/362 files are byte-identical to the v3 artifact.**
- The 6 that differ (`old-vs-v3-differing.txt`):
  - `sitemap-index.xml`, whose `<lastmod>` is the build time (`new Date()` in `src/pages/sitemap-index.xml.ts`).
  - The 5 pages with `ImageSliderClient` islands (`client:only="react"`): `posts/flutter-google-maps-{address-manipulation,embedded-map,static-map}/`, `posts/from-skeptic-to-champion/` and `posts/octoprint-prusa-core-one-raspberry-pi/`.
- **Build noise:**
  - A second full `pnpm build` of `9eb1ec3` in the same worktree differs from the first **only** in `sitemap-index.xml`, so island uids are stable for a given checkout path.
  - Between the two worktrees, all 15 `ImageSliderClient` uids differ. The `Search` and `TagsList` uids are equal, and the per-page island order (component-url sequence) is identical.
  - Astro 7.3.5 computes `uid = shorthash("<!--export:componentUrl-->" + html + serializeProps(...))` (`astro/dist/runtime/server/render/component.js:271`).
- **Proof that the uid depends on the build path** (`pin_v3.py.txt` → `pin_v3-output.txt`; read-only, nothing was built in the main checkout).
  - The main checkout's existing `dist/` was built at the repo path, the same path v3 used. Its `index.html` mtime is 2026-09-24T17:42:51-04:00 (21:42Z), from before this lane started.
  - It has the same 362-file list as this lane's `ab5c02d` build. 356 files are raw-identical to it, the 5 `ImageSliderClient` pages are uid-only, and `sitemap-index.xml` differs. It is therefore an `ab5c02d`-equivalent build.
  - Its raw `posts/from-skeptic-to-champion/index.html` (`44638c68…`) and `posts/octoprint-prusa-core-one-raspberry-pi/index.html` (`9f10b770…`) are **byte-identical to the v3 manifest**. These two pages have no Phase 3 delta.
  - Its 3 Flutter pages, with **only** the 4 Task 18 hrefs reverted to `./<slug>`, also hash **exactly** to the v3 manifest (`f51a4321…`, `172c2c03…`, `387f0aec…`).
  - So a build at the v3 path reproduces v3's uids exactly. The uid differences between the scratch worktrees are purely path-induced.
- **Conclusion:** 356/362 files of the rebuilt reference are byte-identical to the v3-verified artifact. The 5 island pages are proven equal to v3 once the uid, which depends on the build path, is accounted for. The last file is `sitemap-index.xml`, which differs only by the build-time `<lastmod>`. S2 normalizes nothing else.

For completeness, the new build compared directly against the v3 manifest: **263/362** files byte-identical. The other 99 are the 95 HTML files with classified hunks, the 2 uid-only pages, `sitemap-pages.xml` and `sitemap-index.xml`.

## S1 Gate at `ab5c02d`

Source: `static-delta/new-gate.txt`.

```
node v22.23.3 pnpm 10.34.5 HEAD ab5c02d687e5266ad122db3a37de873ca385a991 start 2026-09-24T21:47:16Z
install exit 0
check exit 0
lint exit 0
format:check exit 0
build exit 0
end 2026-09-24T21:48:16Z
```

- **`astro check`:** `Result (77 files): - 0 errors - 0 warnings - 0 hints`, both standalone and inside `pnpm build`.
- **`eslint .`:** no output, exit 0.
- **`prettier --check .`:** "All matched files use Prettier code style!".
- **Build:** `127 page(s) built`, `[build] Complete!`, jampack table total `246 / 308` and `✔ No issues`.
- **Warnings:** the `WARN|ERROR|error` lines are identical between the old and new build logs, 10 lines each: 9 `[vite] [MODULE_LEVEL_DIRECTIVE] "use astro:head-inject"`, one per `.mdx` post, plus the check's "0 errors". This is the same 9 as v3's `build.log`, the parked Task 4 item.
- **Worktree state:** `git status --porcelain` is empty in both worktrees after the gate.

## S2 Whole-site diff (`s2_diff.py.txt` → `s2.json`)

### File lists and non-HTML files

- **File lists:** 362 files in each build, identical; `only_old` and `only_new` are both empty.
- **Non-HTML byte-identical (230/230)**, by extension:

  | Extension | Files |
  |---|---|
  | `.webp` | 123 |
  | `.png` | 67 (includes 28 OG PNGs and `og.png`) |
  | `.js` | 13 |
  | `.jpg` | 7 |
  | `.gif` | 6 |
  | `.css` | 4 (`Footer.BnrdipP9.css`, `index.C0tC3-oh.css`, `Tips.i4aH78fP.css`, `ec.s4b1i.css`) |
  | `.xml` | 5 (`rss.xml`, `sitemap-posts.xml`, `sitemap-tags.xml`, `sitemap-threads.xml`, `sitemap-tips.xml`) |
  | `.txt` | 1 (`robots.txt`) |
  | `.svg` | 1 |
  | `.json` | 1 (`.well-known/appspecific/com.chrome.devtools.json`) |
  | no extension | 2 (`CNAME`, `assets/.gitkeep`) |

  0 differ. Since the file lists and all JS/CSS are identical, every hashed `_astro` chunk name is unchanged.
- **Fonts:** `dist/` contains 0 font files (`.woff`, `.woff2`, `.ttf`, `.otf`) in either build. IBM Plex Mono loads from `fonts.googleapis.com`, so this category is empty, not skipped.
- **`sitemap-index.xml`:** differs raw, but is **equal after `<lastmod>` is stripped**. The lastmod values are `2026-09-24T21:47:39.973Z` (old) and `2026-09-24T21:47:47.643Z` (new).
- **`sitemap-pages.xml`:** diffed as `<url>` blocks.
  - Old has 7 locs: `/`, `/about/`, `/posts/`, `/tips/`, `/threads/`, `/tags/`, `/search/`.
  - New has 5 locs: `/`, `/about/`, `/posts/`, `/tips/`, `/search/`.
  - Removed: exactly `https://www.novifyx.com/threads/` (changefreq weekly, priority 0.6) and `https://www.novifyx.com/tags/` (weekly, 0.5). Added: none.
  - The remaining order is preserved, and the new file is byte-equal to the old file with those two blocks cut out.

### HTML (130 files)

- **Tokenizer and uid normalization:**
  - Only `<astro-island … uid="…">` is normalized, identically on both sides (`uid="UID"`).
  - The per-file uid count is equal on both sides in all files (`uid_count_mismatch: []`).
  - Tokens are tags or text (`<[^>]*>|[^<]+`), diffed with `difflib.SequenceMatcher(..., autojunk=False)`.
- **HTML file counts:**
  - 33 are raw-identical: 30 post/tip detail pages, the 2 redirect stubs and `~partytown/partytown-sandbox-sw.html`.
  - 2 differ only in island uid: `posts/from-skeptic-to-champion/` (1 island) and `posts/octoprint-prusa-core-one-raspberry-pi/` (7).
  - 95 have hunks: 92 (c) pages, including `404.html`, plus the 3 Flutter posts.
- **Hunks:** 100 in total, each classified as exactly one of (a), (b) or (c) by exact token rules: the token equals the old token with only the stated edit. **Unclassified: 0.**

**(a) Task 18: 4 hrefs in the 3 Flutter posts.** Each is a one-token `replace`; everything else in the `<a>` tag is identical. They match the source diff exactly (`a_matches_expected: true`).

| Page | Old token | New token |
|---|---|---|
| `posts/flutter-google-maps-address-manipulation/` | `<a href="./flutter-google-maps-embedded-map">` | `<a href="/posts/flutter-google-maps-embedded-map/">` |
| `posts/flutter-google-maps-address-manipulation/` | `<a href="./flutter-google-maps-setup">` | `<a href="/posts/flutter-google-maps-setup/">` |
| `posts/flutter-google-maps-embedded-map/` | `<a href="./flutter-google-maps-setup">` | `<a href="/posts/flutter-google-maps-setup/">` |
| `posts/flutter-google-maps-static-map/` | `<a href="./flutter-google-maps-address-manipulation">` | `<a href="/posts/flutter-google-maps-address-manipulation/">` |

**(b) Task 19: 4 head hunks in `404.html`.**

| Op | Token |
|---|---|
| delete | `<link rel="canonical" href="https://www.novifyx.com/404/">` |
| insert | `<meta name="robots" content="noindex,follow">` (after `meta name="author"`, before `link rel="sitemap"`) |
| delete | `<meta property="og:url" content="https://www.novifyx.com/404/">` |
| delete | `<meta property="twitter:url" content="https://www.novifyx.com/404/">` |

`404.html` also has one (c) hunk, counted under (c).

**(c) Task 21: 92 pages, `<html lang="en" class="false">` → `<html lang="en">`.**
- **Pages that lost `class="false"`:**
  - The old set of pages with `class="false"` (92) equals the set of (c) hunk pages (92, one hunk each).
  - In the new build, 92 pages have `<html lang="en">` with no class.
  - Breakdown:

    | Pages | Count |
    |---|---|
    | `/` | 1 |
    | `404.html` | 1 |
    | `/about/` | 1 |
    | `/search/` | 1 |
    | `/posts/` | 1 |
    | `/posts/<n>/` | 5 |
    | `/tips/` | 1 |
    | `/tips/<n>/` | 1 |
    | `/tags/` | 1 |
    | `/tags/<tag>/` | 68 |
    | `/tags/<tag>/<n>/` | 8 |
    | `/threads/` | 1 |
    | `/threads/<slug>/` | 2 |

  - This is v3 W8's 127 Layout pages minus 28 posts and 7 tips.
- **Pages that keep `class="scroll-smooth"`:** `<html lang="en" class="scroll-smooth">` is on 35 pages in both builds, and the two sets are equal. They are exactly the 28 post and 7 tip detail pages.
- **No bad class values remain.** The new build has 0 `class=""` or `class="false"` on `<html>`. Across all HTML, the new build has 0 occurrences of `class="false|undefined|null"`; the old build has 92.
- **New `<html>` tag inventory:**

  | `<html>` tag | Pages |
  |---|---|
  | `<html lang="en">` | 92 |
  | `<html lang="en" class="scroll-smooth">` | 35 |
  | `<html>` (the Partytown sandbox asset) | 1 |
  | none (the 2 redirect stubs) | 2 |

## S3 Link integrity at `ab5c02d` (`s3_links.py.txt` → `s3-new.json`)

**Scope:** all 130 `dist/**/*.html`. The script collects these references:
- `href` on `a`, `link`, `area`, `base` and SVG `use`/`image`.
- `src` on `img`, `script`, `iframe`, `source`, `video`, `audio`, `track`, `embed` and `input`.
- `video[poster]`, `object[data]` and `form[action]`.
- Every `srcset` and `imagesrcset` candidate.
- `astro-island` `component-url`, `renderer-url` and `before-hydration-url`.
- The meta-refresh `url=` target.
- Root-relative path strings inside island `props`.

**Resolution:**
- Each internal ref (root-relative, relative and same-site absolute) is resolved with `urljoin` against **both** the canonical page URL (for example `/posts/x/`) and the no-slash URL (`/posts/x`), then mapped case-exactly:
  - A path ending in `/` maps to `index.html` in that directory.
  - Otherwise, an exact file.
  - Otherwise, `<path>/index.html` (a GitHub Pages directory redirect).
  - Otherwise, `<path>.html`.
- The target's `id` and `name` attributes are checked for every `#fragment`.

| Metric | `ab5c02d` | `9eb1ec3` (control) |
|---|---|---|
| refs total | 4632 | 4633 |
| root-relative | 2991 | 2987 |
| relative (non-`/`, non-`#`) | **0** | 4 (the Flutter `./…` hrefs) |
| same-site absolute (`link rel=canonical`) | 128 | 129 |
| fragment-only | 347 (0 missing, 0 empty `#`) | 347 |
| external / `mailto:` (not resolved) | 1131 / 35 | 1131 / 35 |
| resolutions checked (both bases) | 6195 | — |
| by rule: file / dir-index / dir-redirect | 1941 / 3853 / 401 | 1941 / 3845 / 405 (+5 missing) |
| **unresolved** | **0** | **5** |
| cross-page fragments | 0 | 0 |
| island-prop URLs (broken) | 35 (0) | 35 (0) |
| duplicate ids | 0 pages | 0 pages |

- **The control run confirms the fix and the method:**
  - `9eb1ec3`'s 5 unresolved refs are the 4 Flutter `./…` hrefs resolved against the trailing-slash URL (for example `/posts/flutter-google-maps-address-manipulation/flutter-google-maps-embedded-map`), plus the 404 page's `canonical` → `/404/`.
  - Against the no-slash base, those 4 hrefs resolved through dir-redirect.
- **The rule deltas match Task 18 exactly:**
  - dir-index +8: 4 hrefs × 2 bases.
  - dir-redirect −4: the old relative hrefs, via the no-slash base.
  - root-relative +4 and relative −4.
  - same-site absolute −1: the 404 canonical, from Task 19.
- **`404.html` has 0 relative refs.** GitHub Pages serves it at any depth, so every ref on it resolves at any depth.
- **The 401 dir-redirect resolutions are pre-existing and unchanged.** They are root-relative links without a trailing slash, such as `/tags`, `/posts`, `/posts/2`, `/tags/<tag>` and `/posts/<slug>`. Each resolves to an existing `…/index.html` through GitHub Pages' `/x` → `/x/` redirect. They are not Phase 3 deltas: the HTML diff above has no such hunks.

## S4 Sitemaps (`s4_s5.py.txt` → `s4s5.json`)

| | `9eb1ec3` | `ab5c02d` |
|---|---|---|
| `xmllint --noout` (index, pages, posts, tags, threads, tips, `rss.xml`) | all exit 0, no stderr | all exit 0, no stderr |
| per-file `<loc>`: pages / posts / tips / threads / tags | 7 / 28 / 7 / 3 / 69 | **5** / 28 / 7 / 3 / 69 |
| total page `<loc>` | 114 | **112** |
| unique page `<loc>` | 112 | 112 |
| duplicates | `/tags/`, `/threads/` | **none** |
| union (as a set) | 112 | 112, **set-equal** (only-old ∅, only-new ∅) |
| `<loc>` → dist file (case-exact) | 112/112 (`dir-index`) | **112/112** (`dir-index`) |
| index lists | the 5 `sitemap-*.xml` | the 5 `sitemap-*.xml` = all `dist/sitemap-*.xml` except the index; 5/5 resolve |

The `/tags/` and `/threads/` locs now appear once each: in `sitemap-tags.xml` and `sitemap-threads.xml`, their own section sitemaps.

## S5 SEO heads (`s4_s5.py.txt` → `s4s5.json`)

- **Every canonical and URL tag resolves:** 128 `link[rel=canonical]`, 126 `og:url` and 126 `twitter:url` on `ab5c02d`, **0 unresolved** (all on `https://www.novifyx.com`).
  - 50 of each resolve through `dir-index`.
  - The rest resolve through `dir-redirect`:
    - 76 `og:url` and 76 `twitter:url`: the 68 `/tags/<tag>` and 8 `/tags/<tag>/<n>` pages, whose canonical has no trailing slash.
    - 78 canonicals: those 76 pages plus the 2 redirect stubs (`/posts`, `/tips`).
  - All of these are unchanged from `9eb1ec3`; see the observations.
  - As a bonus, all 127 `og:image` and 127 `twitter:image` values map to files.
- **Pages without a canonical:** only `404.html` (by design, Task 19) and the Partytown sandbox asset. No page has 2 or more canonicals.
- **`404.html`:** no canonical, `og:url` or `twitter:url`. Its only robots tag is `<meta name="robots" content="noindex,follow">` (old: none).
- **noindex set.** 17 pages in the old build; the new build has the same 17 plus `404.html`, 18 in total. The tag text is byte-identical on all 17 common pages (`noindex_tag_changed_on_common: []`).

  | Pages | Tag |
  |---|---|
  | `/posts/2–6/` | `noindex,follow` |
  | `/tips/2/` | `noindex,follow` |
  | 8 `/tags/<tag>/<n>/` | `noindex,follow` |
  | the redirect stubs `/posts/1/`, `/tips/1/` | `noindex` |
  | `~partytown/partytown-sandbox-sw.html` | `noindex` |

- **No page, old or new, has more than one robots meta.**

## Observations (not failures)

1. **Island uid.** It is the only per-build variation apart from `sitemap-index` `<lastmod>`. It is stable across two builds in the same worktree, differs between worktrees for `ImageSliderClient` (`client:only`) islands only, and is reproduced exactly by a build at the v3 path. S2 normalizes it, and nothing else, on both sides.
2. **Tag canonicals have no trailing slash (pre-existing, unchanged by Phase 3).** Tag pages (`/tags/<tag>/` and `/tags/<tag>/<n>/`, 76 pages) emit canonical, `og:url` and `twitter:url` without a trailing slash (for example `https://www.novifyx.com/tags/leadership`), while `sitemap-tags.xml` lists `/tags/<tag>/` with the slash. On GitHub Pages these resolve through a 301 to the slash form. The same holds for 401 root-relative `<a href>` resolutions without a trailing slash (`/tags`, `/posts`, `/posts/<n>`, `/posts/<slug>`). Both builds are identical here, so this is not a Phase 3 delta. It is a possible future SEO tidy-up (canonical ≠ sitemap URL form for tag pages).
3. **Worktrees and port.**
   - `static-delta-new` and `static-delta-old` were removed with `git worktree remove --force`, followed by `git worktree prune`, at 22:00Z. `git worktree list` no longer shows them; the `runtime-delta-*` worktrees belong to another lane and were not touched.
   - The `dist` copies stay in `…/scratchpad/p3v/static-delta-logs/`.
   - No server was started, so port 4401 was not used (no listener).
   - The main checkout's `git status --porcelain` shows only `.claude/`, `.serena/` and this `T-39-2026-09-v4/` directory. Nothing was committed.
   - Before the worktrees were removed, a copy of `T-39-2026-09-v4/` placed in the `ab5c02d` worktree passed `pnpm lint` (exit 0) and `pnpm format:check` (exit 0).
