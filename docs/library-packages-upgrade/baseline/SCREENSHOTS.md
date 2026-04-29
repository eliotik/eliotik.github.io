# Baseline Screenshots — T-00

Pre-upgrade visual baseline of the live site as of branch `upgrade/T-00-baseline`
(parent commit `d8bf57e`). Captured with the `superpowers-chrome` MCP tool driving a
Chromium instance via the Chrome DevTools Protocol; full-page screenshots captured at
viewport **1280×800** with `deviceScaleFactor: 1`.

Subsequent upgrade tasks (notably T-10, T-11, T-20, T-21, T-22, T-30) use these PNGs
as the visual diff baseline. Differences are evaluated **approximately** — minor
sub-pixel changes from font hinting or anti-aliasing are acceptable; layout shifts,
missing images, broken theming, or missing components are not.

## Toolchain at capture time

| Tool | Version |
|---|---|
| `node --version` | `v18.19.0` |
| `yarn --version` | `1.22.22` |
| `npx astro --version` | `astro v4.4.9` |
| OS | Darwin 25.3.0 (arm64) |
| Viewport | 1280 × 800, scale 1, full page |

## Screenshots

| # | Route | Filename | Notes |
|---|---|---|---|
| 1 | `/` | `01-home.png` | Home page (post list, hero, theme toggle) |
| 2 | `/posts` | `02-posts-index.png` | Paginated post listing |
| 3 | `/posts/ems-connecting-the-systems` | `03-post-with-images.png` | Long-form post with multiple inline images |
| 4 | `/posts/flutter-google-maps-embedded-map` | `04-post-with-carousel.png` | Post containing the `<ImageSlider>` (flowbite-react Carousel) component — the high-risk visual element |
| 5 | `/tips` | `05-tips-index.png` | Tips index |
| 6 | `/tags` | `06-tags-index.png` | All-tags listing |
| 7 | `/tags/engineering-management/` | `07-tag-detail.png` | First tag from `/tags`, slug `engineering-management` (14 posts) |
| 8 | `/threads` | `08-threads-index.png` | Threads index |
| 9 | `/about` | `09-about.png` | About page |
| 10 | `/this-route-doesnt-exist` | `10-404.png` | 404 fallback page |

## Slug selection notes

- **Screenshot 4 (carousel post):** chosen by grepping `src/content/blog/` for files
  using the `<ImageSlider` component. `flutter-google-maps-embedded-map.mdx` is one of
  several hits; it is the slug listed in the orchestrator's task instructions for T-00
  and exercises the carousel client component. Other carousel posts include
  `flutter-google-maps-address-manipulation`, `flutter-google-maps-static-map`, and
  `from-skeptic-to-champion`.
- **Screenshot 7 (first tag):** determined at capture time by visiting `/tags` and
  reading the first `<a href="/tags/...">` element under `main`. The first tag is
  `#engineering-management` (14 posts).

## Audit baseline

`audit-baseline.txt` is the JSON output of `yarn audit --json` (yarn 1.22.22) at the
same commit. It is the security-diff reference for every Phase 2 task that touches
`package.json`. The file is human-readable JSON-lines text (one advisory per line
followed by a summary record); subsequent agents will compare High/Critical entries
against this snapshot.
