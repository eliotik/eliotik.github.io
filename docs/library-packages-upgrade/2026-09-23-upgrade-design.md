# Upgrade Design — Astro 7, ESLint 10, Node 22 latest LTS (September 2026)

**Date:** 2026-09-23
**Owner:** @eliotik
**Status:** Approved in brainstorming, pending spec review
**Predecessor:** [2026-04-29-upgrade-design.md](./2026-04-29-upgrade-design.md) (Astro 4→6, React 19, Tailwind 4, ESLint 9, pnpm)

## 1. Goals & Success Criteria

### Goals
- Bring every dependency to the **latest version compatible with the rest of the stack**.
- **Astro** 6.2.1 → latest 7.x (7.3.4 at time of writing), with `@astrojs/mdx` 5 → 8 and `@astrojs/react` 5 → 7.
- **ESLint stack** aligned on ESLint 10 (fixes a peer conflict already on `main`).
- **Node** 22.22.2 → latest 22.x LTS (≥ 22.22.3, required by `eslint-plugin-astro@3` / `astro-eslint-parser@3`).
- **prettier-plugin-astro** 0.14 → 1.x, **satori** 0.29 → 0.33, plus all minor/patch bumps.
- Remove deprecated packages; refresh stale docs.

### Success criteria
1. `pnpm install --frozen-lockfile` succeeds with no unmet peer warnings for direct dependencies.
2. `pnpm astro check` reports zero errors.
3. `pnpm lint` passes.
4. `pnpm format:check` passes.
5. `pnpm build` (check + build + jampack) succeeds.
6. All React islands work in the production build (§5.2), with no console errors.
7. The 10 baseline routes match `baseline/*.png` (no unintended visual changes).
8. "Table of contents" collapse still renders in `.md` and `.mdx` posts.
9. `/rss.xml` and `/sitemap-index.xml` are generated; OG images are generated and legible.
10. The PR's CI (`ci.yml`) and, after merge, `deploy.yml` succeed.

### Non-goals
- No content or design changes.
- No switch to the Sätteri Markdown processor (a possible follow-up).
- No adoption of `compressHTML: 'jsx'` or the React Compiler (possible follow-ups).

## 2. Version Targets

"Latest compatible" was decided from registry peer ranges on 2026-09-23, not from memory. **Re-verify them with `pnpm view <pkg>@latest peerDependencies engines` when execution starts**; if newer versions have appeared, use the newest version that still satisfies every peer range.

### 2.1 Constrained / exceptional

| Package | Target | Reason |
|---|---|---|
| typescript | **6.0.x** (not 7.x) | `@typescript-eslint/*@8.70.1` (and its canary) peer `typescript <6.1.0`; `@astrojs/check@0.9.10` peers `^5 \|\| ^6`. No package in the stack requires TS 7. **Rule:** TypeScript tracks the highest version allowed by the tightest peer range. If any package later *requires* a newer TS, upgrade TS in the same commit; if typescript-eslint and @astrojs/check allow 7, move to 7. |
| eslint-plugin-jsx-a11y | **replace** with `eslint-plugin-jsx-a11y-x` | 6.10.2 is the final release and peers `eslint ≤ 9`. `eslint-plugin-astro@3.2` supports `-x`, which peers `eslint ^9 \|\| ^10`. |
| @types/github-slugger | **remove** | Deprecated; `github-slugger@2` ships `index.d.ts`. |
| @astrojs/markdown-remark | **add** `7.3.1` (exact pin) | Needed to keep remark plugins under Astro 7 (see §3.2). |
| Node | latest 22.x LTS | Stay on the 22 line (Astro 7 needs ≥22.12; eslint-plugin-astro 3 needs ≥22.22.3). |

### 2.2 Majors

| Package | From | To |
|---|---|---|
| astro | 6.2.1 | 7.x latest |
| @astrojs/mdx | 5.0.4 | 8.x |
| @astrojs/react | 5.0.4 | 7.x |
| @eslint/js | 9.39.4 | 10.x |
| eslint-plugin-astro | 1.7.0 | 3.x |
| prettier-plugin-astro | 0.14.1 | 1.x |
| satori | 0.29.0 | 0.33.x (0.x minors treated as breaking) |

### 2.3 Minor / patch
eslint 10.x latest, astro-eslint-parser 3.1.x, @typescript-eslint/* 8.70.x, tailwindcss + @tailwindcss/vite 4.3.x, @tailwindcss/typography, sharp 0.35.x, react / react-dom / @types/react / @types/react-dom 19.3.x, prettier 3.9.x, prettier-plugin-tailwindcss, lint-staged 17.x, astro-expressive-code + plugins 0.44.x, @astrojs/sitemap, @astrojs/partytown, @astrojs/ts-plugin, @astrojs/rss, @astrojs/check, fuse.js, @resvg/resvg-js, husky, jampack — each to its latest compatible version.

## 3. Breaking Changes & Migration

### 3.1 Node 22.22.2 → 22.x latest
- Update `.nvmrc`, `package.json` `engines`, and `.github/workflows/deploy.yml` (`node-version`). `ci.yml` reads `.nvmrc`.

### 3.2 Astro 7 (+ mdx 8, react 7)

| Change | Impact here | Migration |
|---|---|---|
| **Sätteri is the default Markdown processor**; remark/rehype plugins are ignored unless unified is used; `@astrojs/markdown-remark` is no longer installed by default. | `remark-toc` and `remark-collapse` power "Table of contents" in posts. | Add `@astrojs/markdown-remark`; in `astro.config.mjs` set `markdown: { processor: unified({ remarkPlugins: [remarkToc, [remarkCollapse, { test: 'Table of contents' }]] }), shikiConfig: … }` and drop the deprecated `markdown.remarkPlugins`. MDX inherits `markdown.processor` by default (mdx 8). If the `shikiConfig` location changes under the processor API, follow the Astro 7 docs. |
| **mdx 8** delegates MDX processing to the processor. | Uses the processor above. | No extra config; make sure there are no "plugins ignored" warnings. |
| **Rust compiler** errors on unclosed non-void tags and no longer fixes invalid nesting. | Unknown until the build runs. | Fix each reported template error in source (`.astro`, and `.mdx` content if flagged). Markup-only fixes. |
| **`compressHTML` default → `'jsx'`** drops whitespace between inline elements. | Visual regression risk (spacing between inline links/tags). | Set `compressHTML: true` explicitly to keep current output. |
| **Vite 8**. | Custom `vite.optimizeDeps`, `server.watch`, `preTransformRequests`, `clearScreen`; `@tailwindcss/vite` plugin. | Keep the settings if they are valid in Vite 8; remove any that Vite 8 rejects or ignores. Re-test whether the `devToolbar: { enabled: false }` workaround (T-38) is still needed; keep it unless a cold `pnpm dev` start has no 504s without it. |
| **react 7**: Oxc replaces Babel; `babel` option removed; optional `compiler`. | `babel` not used; `experimentalReactChildren: true` is used. | No config change expected. Verify `experimentalReactChildren` still passes children to SSR components; leave `compiler` off. |
| `astro:transitions` internal constants removed. | Only `ClientRouter` is used. | None. |
| `src/fetch.ts` reserved. | File doesn't exist. | None. |
| Experimental flags promoted. | None in use. | None. |

### 3.3 ESLint 10 stack
- `eslint-plugin-astro` 2.0 is ESM-only, requires ESLint ≥10 and Node ≥22.22.3, and changed configs (#477). 3.0 deprecated `no-omitted-end-tags` and `valid-compile` (removed from `recommended`) and switched `astro-eslint-parser` 3 to `@astrojs/compiler-rs`.
- Migration: check the plugin README for current preset names (`flat/recommended`, `flat/jsx-a11y-recommended`, or renamed ones) and update `eslint.config.js` to match. Replace `eslint-plugin-jsx-a11y` with `eslint-plugin-jsx-a11y-x`. Refresh the version header comment. Fix any new lint findings in source; don't disable rules unless there's a documented justification.

### 3.4 prettier-plugin-astro 1.0
- Rewritten on the Rust compiler; Node ≥22.12; `.astro` output will change.
- Add `"astroCompressHTML": true` to `.prettierrc` (must match `compressHTML`).
- Remove the obsolete `--plugin-search-dir=.` flag from the `format` / `format:check` scripts and from lint-staged.
- Put the `pnpm format` output in the same commit (formatting-only diff).

### 3.5 satori 0.29 → 0.33
- 0.33.0 added HarfBuzz text shaping, so glyph layout may change. 0.29.1 has a stricter SSRF guard, which doesn't matter here because fonts are fetched by our code and passed as buffers. 0.33.5 hardens SVG serialization.
- Migration: no API changes expected in `src/utils/generateOgImages.tsx`. Compare generated OG PNGs with the baseline: small anti-aliasing or kerning differences are acceptable; clipped, overflowing or missing text is not.

### 3.6 Cleanup
- Remove `@types/github-slugger`.
- `CLAUDE.md`: Node 22.x, sharp 0.35, `src/content.config.ts`, remove the stale "sharp pinned to 0.32.6" note, and document the unified Markdown processor.
- `DEV-TROUBLESHOOTING.md`: `yarn` → `pnpm`.

## 4. Execution Strategy

A single local branch, **`upgrade/2026-09`**, with one commit per logical group. After every commit the repo must pass the per-commit gate (§5.1), so `git bisect` stays useful. No worktrees or sub-agent lanes.

| # | Commit | Notes |
|---|---|---|
| 0 | **Baseline** — switch to Node 22.22.2, `pnpm install --frozen-lockfile`, record `astro check` / `lint` / `build` results and OG PNG hashes in `baseline/2026-09/`. | Commit baseline artifacts. If `main` is already broken (e.g. the ESLint peer conflict fails lint), record that here; commit 3 fixes it. |
| 1 | **Node 22.x latest LTS** in `.nvmrc`, `engines`, `deploy.yml`. | |
| 2 | **Minor/patch bumps** (§2.3, except the ESLint-stack packages). | |
| 3 | **ESLint 10 stack** (§3.3). | |
| 4 | **Astro 7 + mdx 8 + react 7** (§3.2). | The core commit. Also run the TOC check and a quick island smoke test before committing. |
| 5 | **prettier-plugin-astro 1.0** (§3.4). | Formatting-only diff. |
| 6 | **satori 0.33** (§3.5). | OG image comparison before committing. |
| 7 | **Cleanup & docs** (§3.6). | |

If a commit can't pass the gate and the root cause isn't clear, stop, record the problem in `defects/T-39-*.md` (same template as April), and report back instead of forcing the change through.

## 5. Verification

### 5.1 Per-commit gate
```
pnpm install --frozen-lockfile
pnpm astro check      # 0 errors
pnpm lint
pnpm format:check
pnpm build            # includes jampack
```

### 5.2 Final local verification (before any push)
Run against `pnpm preview` of the production `dist/`, in a real browser (Claude in Chrome), with the console open. **No hydration or runtime errors on any page.**

**React islands**

| Island | Page(s) | Checks |
|---|---|---|
| `ImageSliderClient` (`client:only="react"`) | `/posts/octoprint-prusa-core-one-raspberry-pi/` plus the April "post with carousel" baseline page | All slides render with images loading (jampack-rewritten paths). Prev is disabled at the start and Next at the end. Next/Prev each move exactly one slide. Scroll-snap aligns after scrolling with trackpad or wheel. Slide ARIA labels read "Slide n of N". Works in light and dark themes. |
| `Search` (`client:load`) | `/search` | Typing shows fuse.js results; `?q=` updates in the URL; reloading with `?q=` restores the input and results; clicking a result opens the post. |
| `TagsList` (`client:load`) | `/tags` | The filter narrows the list; sort toggles count/alpha; tag links navigate. |
| SSR React (`Card`, `Datetime`, `Thread`, `ThreadCard`, `TipCard`) | `/`, `/posts`, `/tips`, `/threads` | Render identically to the baseline; children pass through (`experimentalReactChildren`). |
| `ClientRouter` | Navigate home → post with slider → `/search` → `/tags` without a full reload | Islands hydrate after client-side navigation; the theme persists with no FOUC. |

**Site-wide**
- Screenshots of the 10 April routes compared with `baseline/*.png`.
- "Table of contents" collapse in at least one `.md` post (e.g. `audio-vs-paper-books`) and one `.mdx` post.
- `/rss.xml`, `/sitemap-index.xml` are present and valid.
- OG images: `/og.png` and one post OG image compared with the baseline.
- A cold `pnpm dev` start loads with no 504s (decides whether the `devToolbar` workaround stays).

Results are written to `docs/library-packages-upgrade/verification-report-2026-09.md`.

### 5.3 Release gate
Push `upgrade/2026-09` and open a PR to `main` **only after §5.2 passes completely**. Any failure is fixed on the branch, and then the whole of §5.2 runs again. The PR description summarizes the version changes, breaking-change migrations and the verification report. Merge happens after `ci.yml` is green; `deploy.yml` success on `main` is the final criterion.

## 6. Risks

| Risk | Mitigation |
|---|---|
| `remark-collapse` (last published 2022) misbehaves under markdown-remark 7.3. | TOC check in commit 4. Fallback: a small local remark plugin that does the same wrapping. |
| The Rust compiler rejects many templates. | Markup-only fixes; check visually against the baseline. |
| New eslint-plugin-astro presets flag many issues. | Fix in source; only disable a rule with a written justification in `justifications/`. |
| Vite 8 reintroduces dev-server cold-start races. | Keep the `devToolbar` workaround unless it's proven unnecessary. |
| Registry state changes between spec and execution. | Re-verify peer ranges at commit 0 (§2). |
