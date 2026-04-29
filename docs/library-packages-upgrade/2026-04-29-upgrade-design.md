# Upgrade Design — Astro 5, React 19, Tailwind 4, ESLint 9, Node 22, pnpm

**Date:** 2026-04-29
**Owner:** @eliotik
**Status:** Draft (pending user review)

## 1. Goals & Success Criteria

### Goals
- **Astro** 4.4.9 → 5.x (latest stable)
- **React** 18.2.0 → 19.x
- **Tailwind** 3.4.1 → 4.x (CSS-first config)
- **ESLint** 8.57.0 → 9.x (flat config)
- **Node** 18.19.0 (EOL) → 22 LTS
- **Package manager** Yarn classic v1 (unmaintained) → **pnpm** (Corepack-managed)
- **Replace** `flowbite` + `flowbite-react` with pure CSS scroll-snap (Carousel) and an inline pre-paint script (`ThemeModeScript`)
- All other dependencies bumped to current stable
- A real PR validation gate established **before** any of the upgrades start
- Each upgrade ships as exactly **one commit** behind one PR-style merge

### Success criteria (the bar for "done")
1. `pnpm install --frozen-lockfile` succeeds
2. `pnpm astro check` reports zero errors
3. `pnpm lint` passes
4. `pnpm build` produces a `dist/` with no broken assets
5. Local dev server renders correctly on these routes:
   - `/`, `/posts`, `/posts/<one with images>`, `/posts/<one with carousel>`,
   - `/tips`, `/tags`, `/tags/<tag>`, `/threads`, `/about`, `/404`
6. Dark/light theme toggle works **without FOUC**
7. RSS feed (`/rss.xml`) and sitemap (`/sitemap-index.xml`) build successfully
8. GitHub Pages deploy succeeds on `main`

### Non-goals
- No content rewrites
- No design / visual changes (output should match baseline)
- No new features

---

## 2. CI/CD Audit & Remediation

| # | Finding | Severity | Resolved by |
|---|---|---|---|
| 1 | **No PR validation workflow.** `deploy.yml` only triggers on push to `main` — broken builds can land before being caught. | High | T-01 |
| 2 | Node pinned to `18.19.0` (EOL April 2025) in `.nvmrc`, `package.json` `engines`, `deploy.yml`. | High | T-02 |
| 3 | No Dependabot / Renovate. No automated security or stale-dep detection. | Medium | T-13 |
| 4 | No `npm audit` / `pnpm audit` step in CI. | Medium | T-01 (folded in) |
| 5 | `withastro/action@v4` not yet validated against Astro 5 + Node 22. | Low | T-27 |
| 6 | Pre-commit only runs Prettier; ESLint never runs locally before push. | Low | T-14 |
| 7 | Husky still uses the deprecated `_/husky.sh` shim — Husky v10 will reject it. | Low | T-14 |
| 8 | No staging/preview environment. (Acceptable for GH Pages, mitigated by item 1.) | Accepted | – |

---

## 3. Execution Strategy

**Approach:** worktree-per-task, with two parallelism lanes.

- **Lane 1 (L1) — code-only**: tasks that touch only `src/`, config files, or workflow files. They run concurrently in separate worktrees and merge in any order.
- **Lane 2 (L2) — lockfile-touching**: every `package.json` / `pnpm-lock.yaml` bump runs through a single serialized queue. Order is fixed by dependency direction.

Each task produces exactly **one commit** via `/commit`. Branch naming: `upgrade/<task-id>-<slug>` (e.g. `upgrade/t-20-astro-5`).

Verification per task is uniform — see §5.

---

## 4. Task Breakdown

### Phase 0 — Foundation (must complete in order, before anything else)

| ID | Lane | Task | Files touched |
|---|---|---|---|
| **T-00** | – | Capture baseline: build current `main`, save screenshots of the 9 routes from §1 to `docs/library-packages-upgrade/baseline/`. **No commit.** | local only |
| **T-01** | L1 | Add `.github/workflows/ci.yml`: triggers on `pull_request`, runs `pnpm install --frozen-lockfile`, `pnpm astro check`, `pnpm lint`, `pnpm build`, `pnpm audit --prod`. Becomes the gate for every later task. | `.github/workflows/ci.yml` |
| **T-02** | L2 | Bump Node to **22 LTS**: `.nvmrc`, `package.json` `engines`, `deploy.yml` `node-version`, `ci.yml` `node-version`. No package version changes. | `.nvmrc`, `package.json`, `deploy.yml`, `ci.yml` |
| **T-03** | L2 | Migrate yarn 1 → **pnpm** via Corepack: generate `pnpm-lock.yaml`, delete `yarn.lock`, update any `yarn`-prefixed scripts, update `.husky/pre-commit` to use pnpm/npx, update workflows to set `package-manager: pnpm@latest`, update CLAUDE.md commands. | `package.json`, `pnpm-lock.yaml`, `yarn.lock` (deleted), `.husky/pre-commit`, workflows, `CLAUDE.md` |

### Phase 1 — Code-only prep (all L1, fully parallel after Phase 0)

| ID | Lane | Task | Files touched |
|---|---|---|---|
| **T-10** | L1 | Replace `flowbite-react` Carousel with pure CSS scroll-snap in `ImageSliderClient.tsx`. Keep the component's external API identical so `ImageSlider.astro` doesn't change. **Do not yet remove the dep** — that's T-24. | `src/components/ImageSliderClient.tsx` |
| **T-11** | L1 | Inline the theme-mode pre-paint script directly into `Layout.astro` (before `<ViewTransitions />`), remove the `import { ThemeModeScript }` line, ensure no FOUC remains. | `src/layouts/Layout.astro`, `public/toggle-theme.js` |
| **T-12** | L1 | Draft `eslint.config.js` (flat config) **alongside** the existing `.eslintrc.cjs`. Wire it up but do not delete the legacy file yet — activated in T-23. Verify the new config validates with `eslint --config eslint.config.js --no-config-lookup .` | `eslint.config.js` (new) |
| **T-13** | L1 | Add `.github/dependabot.yml` for weekly grouped updates of GH Actions + npm deps (with major-version PRs separated from minor/patch). | `.github/dependabot.yml` |
| **T-14** | L1 | Modernize Husky pre-commit: drop `_/husky.sh` shim, switch to v9-minimal one-liner. Add ESLint to lint-staged for `*.{js,jsx,ts,tsx,astro}`. | `.husky/pre-commit`, `package.json` (lint-staged block only) |

### Phase 2 — Major bumps (all L2, strictly serialized in this order)

| ID | Lane | Task | Notes |
|---|---|---|---|
| **T-20** | L2 | **Astro 4 → 5.** Bump `astro`, all `@astrojs/*`, `astro-expressive-code` and its plugins. Run official codemod where available. **Critical migration items:** ① content collections → Content Layer API (rewrite `src/content/config.ts` using `glob()` loader); ② re-evaluate `sharp` pin (likely removable); ③ `<ViewTransitions />` → `<ClientRouter />`; ④ `astro:transitions` import path; ⑤ image service config. | Largest single task. |
| **T-21** | L2 | **React 18 → 19.** Bump `react`, `react-dom`, `@types/react`, `@astrojs/react`. Audit each `.tsx` for ref-as-prop changes, deprecated `forwardRef`, and the new JSX runtime. Validate `Card`, `Datetime`, `Search` (Fuse.js), `TagsList`, `Thread`, `ThreadCard`, `TipCard`, `ImageSliderClient` (now CSS-only). | – |
| **T-22** | L2 | **Tailwind 3 → 4.** Run `pnpm dlx @tailwindcss/upgrade@latest`. Migrate `tailwind.config.cjs` → CSS-first `@theme` block in `src/styles/base.css`. Switch `@astrojs/tailwind` → `@tailwindcss/vite`. Verify dark-mode strategy (`class` → `@variant dark`) and `@tailwindcss/typography` still work. | High-risk visual diff. |
| **T-23** | L2 | **ESLint 8 → 9.** Bump `eslint`, `@typescript-eslint/*` to v8, `eslint-plugin-astro`, `eslint-plugin-jsx-a11y`, `astro-eslint-parser`. Activate flat config from T-12, delete `.eslintrc.cjs`. Run `pnpm lint --fix` and commit auto-fixes as part of this task. | – |
| **T-24** | L2 | **Remove flowbite.** Delete `flowbite` and `flowbite-react` from `dependencies`. Remove their entries from `astro.config.mjs` `optimizeDeps.include`. T-10 and T-11 already removed all imports. | One-line dependency removal + verify build. |
| **T-25** | L2 | **Bump TS toolchain.** TypeScript 5.3 → latest 5.x, prettier, prettier-plugin-astro, prettier-plugin-tailwindcss, husky, lint-staged. Run `pnpm format` and commit. | – |
| **T-26** | L2 | **Bump content/build deps.** `satori`, `@resvg/resvg-js`, `fuse.js`, `github-slugger`, `remark-toc`, `remark-collapse`, `sharp` (unpinned), `@divriots/jampack`. Each touches different code paths so the agent verifies each individually. | – |
| **T-27** | L2 | **Bump GitHub Actions.** `withastro/action` → latest (re-validate Astro 5 + Node 22), `actions/checkout`, `actions/deploy-pages`. | – |

### Phase 3 — Validation & cutover (sequential)

| ID | Lane | Task | Notes |
|---|---|---|---|
| **T-30** | – | End-to-end verification: full build, run dev server, walk the 9 baseline routes, visually diff against T-00 screenshots. Record findings in `docs/library-packages-upgrade/verification-report.md`. | No commit unless fixes needed. |
| **T-31** | – | Deploy: merge to `main`, watch the GH Pages workflow, smoke-test the live site. | – |

**Total: 19 numbered tasks → 17 commits** (T-00 and T-30 produce reports, no commit unless fixes are required; T-31 is a deploy/observation task with no code commit).
- Phase 0: 4 tasks (T-00 no commit; T-01, T-02, T-03 each a commit) → 3 commits
- Phase 1: 5 parallel commits (T-10, T-11, T-12, T-13, T-14)
- Phase 2: 8 sequential commits (T-20 through T-27)
- Phase 3: 2 tasks, 0–1 commits depending on findings

---

## 5. Verification Protocol (uniform per task)

Every task in Lanes 1 and 2 must run **all** of these before being eligible for `/commit`:

| # | Check | Command | Expected |
|---|---|---|---|
| 1 | Lockfile installs cleanly | `pnpm install --frozen-lockfile` | exit 0 |
| 2 | TypeScript / Astro types | `pnpm astro check` | 0 errors |
| 3 | Lint | `pnpm lint` | 0 errors |
| 4 | Production build | `pnpm build` | exit 0, `dist/` populated |
| 5 | Dev server boots | `pnpm dev` (background, kill after 10s) | server responds 200 on `/` |
| 6 | No new audit findings | `pnpm audit --prod` | no new High/Critical vs. baseline |

**Visual smoke** (only required for tasks marked "high-risk visual diff" — T-10, T-11, T-20, T-21, T-22): walk the 9 routes from §1, compare to baseline screenshots from T-00, capture any deltas in the PR description.

**Per-task agent prompt template** lives at `docs/library-packages-upgrade/agent-prompt-template.md` (created during plan execution).

---

## 6. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Tailwind 4 breaks `@tailwindcss/typography` rendering of blog post bodies. | Medium | High (every post page) | Visual smoke required on T-22; rollback = revert single commit. |
| R2 | Astro 5 Content Layer migration changes how `defineCollection({ type: 'content' })` schemas resolve `image()` and `reference()`. | High | High (build-breaking) | T-20 must rewrite `src/content/config.ts` to `loader: glob({ pattern, base })` form per Astro 5 docs; verification step 4 catches regressions. |
| R3 | React 19 removes `defaultProps` on function components and changes ref handling — silent runtime breaks. | Medium | Medium | T-21 explicitly audits all 9 `.tsx` files; component-level smoke tests in `pnpm dev`. |
| R4 | `@astrojs/tailwind` is being deprecated in favor of `@tailwindcss/vite` — config shape differs from the integration-style we use today. | High | Medium | T-22 documented as "switch integration", not "bump version". |
| R5 | `flowbite-react` removal leaves a dangling `optimizeDeps.include` reference that breaks Vite warm-up. | Medium | Low | T-24 explicitly checks `astro.config.mjs` is updated. |
| R6 | pnpm migration breaks the `withastro/action` auto-detection. | Low | High (no deploy) | T-03 explicitly sets `package-manager: pnpm@latest` in the workflow rather than relying on detection. |
| R7 | Sharp pin removal causes image build to fail under newer Astro. | Low | Medium | T-20 unpins sharp and re-runs build; revert pin if necessary. |
| R8 | ESLint 9 + `astro-eslint-parser` drift; the parser may not have a flat-config-compatible release. | Medium | Low | T-12 verifies flat config draft works *before* T-23 deletes the legacy `.eslintrc`. |
| R9 | A long-running merge train means Phase 2 tasks rebase onto stale `main` mid-run. | Medium | Low | After each Phase 2 merge, the next agent does `git pull --rebase origin main` in its worktree before starting. |
| R10 | GH Pages cache serves a stale build after deploy. | Low | Low | Hard refresh + `/sitemap-index.xml` 200-check in T-31. |

---

## 7. Out-of-scope (intentionally deferred)

- Adding automated tests (Playwright / Vitest) — separate effort, large scope.
- CodeQL / SAST scanning — overkill for personal blog.
- Image optimization service swap — keep current sharp-based pipeline.
- Bun / Deno migration — pnpm is sufficient.
- Content rewrites or schema changes beyond what Astro 5 forces.

---

## 8. Open questions

_(none right now — to be filled in during execution if blockers surface)_
