# September 2026 Dependency Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade every dependency to its latest compatible version (Astro 7, ESLint 10, Node 22 latest LTS), with no visual or behavioural regressions. Open the PR only after the full local verification passes.

**Architecture:** One local branch, `upgrade/2026-09`, with one commit per logical group. Every commit must pass the per-commit gate. After the last commit, a final browser check runs against the production build (React islands, especially the image slider), and only then is the PR opened.

**Tech Stack:** Astro 7, @astrojs/mdx 8, @astrojs/react 7, @astrojs/markdown-remark 7.3 (unified processor), React 19, Tailwind 4 (Vite plugin), ESLint 10 flat config, typescript-eslint 8, TypeScript 6.0, Prettier 3 + prettier-plugin-astro 1, satori + resvg, jampack, pnpm 10, Node 22.

**Spec:** `docs/library-packages-upgrade/2026-09-23-upgrade-design.md`

## Global Constraints

- Branch: `upgrade/2026-09` (already created; the spec is committed as `29b76f9`). Never push until Task 9.
- Node: the latest `v22.x` (v22.23.3 on 2026-09-23). The machine's default is Node 25, so **prefix every shell command with** `source ~/.nvm/nvm.sh >/dev/null && nvm use --silent &&`. `.nvmrc` selects the version: 22.22.2 until Task 1, 22.23.3 afterwards.
- TypeScript: the highest version allowed by the tightest peer range (`@typescript-eslint/*` and `@astrojs/check`), 6.0.x today. If any package *requires* a newer TS, bump TS in that same commit.
- Exact pins stay exact. Caret ranges stay caret (`@astrojs/partytown`, `sharp`, `@eslint/js`, `@tailwindcss/vite`, `@types/react*`, `eslint-plugin-jsx-a11y`).
- `compressHTML: true` in Astro and `"astroCompressHTML": true` in Prettier; both must match.
- No content or design changes. Markup fixes only where the Astro 7 compiler requires them.
- Don't disable a lint rule without a justification entry in `docs/library-packages-upgrade/justifications/T-39.md`.
- If the root cause of a failure isn't clear after one focused attempt: write `docs/library-packages-upgrade/defects/T-39-D<n>.md` (copy `defects/_TEMPLATE.md`), stop, and report to the user.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.

### Per-commit gate (run before every commit from Task 1 on)

```bash
source ~/.nvm/nvm.sh >/dev/null && nvm use --silent && \
  pnpm install --frozen-lockfile && \
  pnpm astro check && \
  pnpm lint && \
  pnpm format:check && \
  pnpm build
```
Expected: every command exits 0; `astro check` reports `0 errors`. `pnpm install` reports no unmet peer warnings for direct dependencies. Warnings from transitive dependencies are listed in the commit body.

---

## File Map

| File | Tasks | Responsibility |
|---|---|---|
| `.nvmrc`, `package.json#engines`, `.github/workflows/deploy.yml` | 1 | Node version |
| `package.json`, `pnpm-lock.yaml` | 2, 3, 4, 5, 6, 7 | Versions and scripts |
| `eslint.config.js` | 3 | Lint config for ESLint 10 and eslint-plugin-astro 3 |
| `astro.config.mjs` | 4 | Unified Markdown processor, `compressHTML`, Vite 8 settings |
| `src/**/*.astro` (only where the compiler fails) | 4 | Markup validity |
| `.prettierrc`, `src/**/*.astro` (formatting) | 5 | Prettier plugin 1.0 |
| `CLAUDE.md`, `DEV-TROUBLESHOOTING.md` | 7 | Docs |
| `docs/library-packages-upgrade/baseline/2026-09/*` | 0 | Pre-upgrade artifacts |
| `docs/library-packages-upgrade/verification-report-2026-09.md` | 8 | Final evidence |

---

### Task 0: Baseline on current `main` state

**Files:**
- Create: `docs/library-packages-upgrade/baseline/2026-09/gate.txt`
- Create: `docs/library-packages-upgrade/baseline/2026-09/og/og.png`, `og/audio-vs-paper-books.png`, `og/sha256.txt`
- Create: `docs/library-packages-upgrade/baseline/2026-09/peers.txt`

**Interfaces:**
- Produces: `baseline/2026-09/og/*` (compared in Task 6) and `gate.txt` (the pre-existing failures that Tasks 1–4 must resolve).

- [ ] **Step 1: Clean install on the pinned Node**

```bash
source ~/.nvm/nvm.sh >/dev/null && nvm use --silent && node -v && \
  rm -rf node_modules .astro dist node_modules/.vite && pnpm install --frozen-lockfile 2>&1 | tail -30
```
Expected: `v22.22.2`, install succeeds. Record any peer warnings (the expected one is `eslint-plugin-jsx-a11y` against `eslint@10`).

- [ ] **Step 2: Record the gate result without stopping at the first failure**

```bash
source ~/.nvm/nvm.sh >/dev/null && nvm use --silent && mkdir -p docs/library-packages-upgrade/baseline/2026-09 && \
  { for c in "pnpm astro check" "pnpm lint" "pnpm format:check" "pnpm build"; do
      echo "=== $c"; $c >/tmp/out.txt 2>&1; echo "exit=$?"; tail -15 /tmp/out.txt; done; } \
  > docs/library-packages-upgrade/baseline/2026-09/gate.txt; grep -n "===\|exit=" docs/library-packages-upgrade/baseline/2026-09/gate.txt
```
Expected: a list of exit codes. A non-zero `pnpm lint` counts as a finding (the ESLint peer conflict on `main`), not a blocker; Task 3 fixes it. If `pnpm build` fails, stop and report, because there would be no baseline to compare against.

- [ ] **Step 3: Save OG images and their hashes**

```bash
cd docs/library-packages-upgrade/baseline/2026-09 && mkdir -p og && \
  cp ../../../../dist/og.png og/og.png && \
  cp ../../../../dist/posts/audio-vs-paper-books/index.png og/audio-vs-paper-books.png && \
  shasum -a 256 og/*.png > og/sha256.txt && cat og/sha256.txt
```

- [ ] **Step 4: Re-check the peer ranges the spec relies on (spec §2)**

```bash
cd /tmp && for p in astro @astrojs/mdx @astrojs/react @astrojs/markdown-remark @astrojs/check \
  @typescript-eslint/parser eslint-plugin-astro astro-eslint-parser eslint-plugin-jsx-a11y-x \
  @eslint/js prettier-plugin-astro satori typescript; do
  echo "== $p@$(pnpm view $p version)"; pnpm view $p peerDependencies engines --json | tr -d '\n '; echo; done \
  > /Users/ap/development/other/eliotik.github.io/docs/library-packages-upgrade/baseline/2026-09/peers.txt; \
  cat /Users/ap/development/other/eliotik.github.io/docs/library-packages-upgrade/baseline/2026-09/peers.txt
```
Expected: `@typescript-eslint/parser` peer `typescript` is still `<6.1.0` and `@astrojs/check` is still `^5 || ^6`, so TS stays on 6.0.x. **If either now allows 7.x, do Task 2 with `typescript@latest` instead.**

- [ ] **Step 5: Commit**

```bash
git add docs/library-packages-upgrade/baseline/2026-09
git commit -m "chore(T-39): record pre-upgrade baseline (gate, OG images, peer ranges)

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 1: Node 22 latest LTS

**Files:**
- Modify: `.nvmrc` (`22.22.2` → `22.23.3`)
- Modify: `package.json` (`"engines": {"node": "22.23.3"}`)
- Modify: `.github/workflows/deploy.yml:31` (`node-version: 22.23.3`)

- [ ] **Step 1: Look up the newest 22.x and install it**

```bash
curl -s https://nodejs.org/dist/index.json | python3 -c "import json,sys;print([v['version'] for v in json.load(sys.stdin) if v['version'].startswith('v22.')][0])"
source ~/.nvm/nvm.sh && nvm install 22.23.3
```
Use the version the first command prints, if it's newer than 22.23.3, everywhere in this task.

- [ ] **Step 2: Edit the three files**

```bash
echo "22.23.3" > .nvmrc
sed -i '' 's/"node": "22.22.2"/"node": "22.23.3"/' package.json
sed -i '' 's/node-version: 22.22.2/node-version: 22.23.3/' .github/workflows/deploy.yml
git diff --stat
```
Expected: 3 files changed, one line each.

- [ ] **Step 3: Run the per-commit gate**

`pnpm lint` may still fail with the same result as the baseline (fixed in Task 3). Everything else must pass. A lint failure is only acceptable if it matches `gate.txt`.

- [ ] **Step 4: Commit**

```bash
git add .nvmrc package.json .github/workflows/deploy.yml
git commit -m "build(T-39): bump Node 22.22.2 -> 22.23.3 (required by eslint-plugin-astro 3)

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Minor and patch bumps

**Files:** `package.json`, `pnpm-lock.yaml`

- [ ] **Step 1: Bump runtime and tooling packages that don't change major version**

```bash
source ~/.nvm/nvm.sh >/dev/null && nvm use --silent && \
pnpm add -E @astrojs/check@latest @astrojs/rss@latest @astrojs/sitemap@latest @astrojs/ts-plugin@latest \
  @expressive-code/plugin-collapsible-sections@latest @expressive-code/plugin-line-numbers@latest \
  astro-expressive-code@latest fuse.js@latest tailwindcss@latest @resvg/resvg-js@latest && \
pnpm add @astrojs/partytown@latest sharp@latest && \
pnpm add -D -E @tailwindcss/typography@latest prettier@latest prettier-plugin-tailwindcss@latest \
  lint-staged@latest husky@latest react@latest react-dom@latest @divriots/jampack@latest typescript@~6.0 && \
pnpm add -D @tailwindcss/vite@latest @types/react@latest @types/react-dom@latest
```
Expected: installs with no new unmet peers. `typescript` resolves to the newest 6.0.x (or `@latest` if Task 0 Step 4 said so).

- [ ] **Step 2: Confirm nothing jumped a major version**

```bash
git diff package.json
```
Expected: only minor/patch changes. If any package jumped a major version, revert it to the previous major with `pnpm add -E <pkg>@<prev-major>` and mention it in the commit body.

- [ ] **Step 3: Run the per-commit gate** (the lint failure from the baseline is still allowed).

- [ ] **Step 4: Quick visual check of Tailwind 4.3 output**

```bash
source ~/.nvm/nvm.sh >/dev/null && nvm use --silent && (pnpm preview --port 4321 >/tmp/preview.log 2>&1 &) && sleep 3 && \
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/ && pkill -f "astro preview"
```
Expected: `200`. The full visual comparison happens in Task 8.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "build(T-39): bump minor/patch dependencies to latest compatible

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: ESLint 10 stack

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`
- Modify: `eslint.config.js` (full rewrite shown below)

**Interfaces:**
- Consumes: Node ≥22.22.3 (Task 1).
- Produces: `pnpm lint` passing on ESLint 10. Later tasks rely on this to lint Astro 7 templates.

- [ ] **Step 1: Swap and bump packages**

```bash
source ~/.nvm/nvm.sh >/dev/null && nvm use --silent && \
pnpm remove eslint-plugin-jsx-a11y && \
pnpm add -D -E eslint@latest eslint-plugin-astro@latest astro-eslint-parser@latest \
  @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest && \
pnpm add -D @eslint/js@latest eslint-plugin-jsx-a11y-x@latest
```
Expected: no unmet peers for `eslint-plugin-astro`, `@eslint/js` or typescript-eslint.

- [ ] **Step 2: Look up the preset names the installed plugin exports**

```bash
source ~/.nvm/nvm.sh >/dev/null && nvm use --silent && \
node -e "import('eslint-plugin-astro').then(m=>console.log(Object.keys((m.default??m).configs)))"
node -e "import('@typescript-eslint/eslint-plugin').then(m=>console.log(Object.keys((m.default??m).configs)))"
```
Expected, per the README: `base`, `recommended`, `all`, `jsx-a11y-recommended`, `jsx-a11y-strict`, possibly with `flat/*` aliases. Use `recommended` and `jsx-a11y-recommended`. If the names differ, use whatever the output lists as the recommended and jsx-a11y-recommended presets.

- [ ] **Step 3: Rewrite `eslint.config.js`**

Keep the ignores block and the comment style. Update the header and Block 3:

```js
// @ts-check
// ESLint flat config — activated in T-23 (ESLint 8 → 9), migrated in T-39 (ESLint 9 → 10).
// Plugins:
//   eslint                                  10.x
//   @eslint/js                              10.x
//   @typescript-eslint/eslint-plugin        8.x     (flat/recommended)
//   @typescript-eslint/parser               8.x
//   eslint-plugin-astro                     3.x     (recommended, jsx-a11y-recommended)
//   eslint-plugin-jsx-a11y-x                0.x     (used internally by astro a11y rules)
//   astro-eslint-parser                     3.x     (@astrojs/compiler-rs)
```
Replace the Block 3 comment and spreads with:
```js
  // -------------------------------------------------------------------------
  // Block 3 — Astro recommended + jsx-a11y-recommended
  //
  // eslint-plugin-astro v2+ is ESM-only and exposes unprefixed preset names.
  // v3 dropped astro/no-omitted-end-tags and astro/valid-compile from
  // recommended — the Rust compiler and `astro check` now cover both.
  // jsx-a11y rules resolve eslint-plugin-jsx-a11y-x (eslint-plugin-jsx-a11y
  // stops at ESLint 9).
  // -------------------------------------------------------------------------
  ...astroPlugin.configs.recommended,
  ...astroPlugin.configs['jsx-a11y-recommended'],
```
Keep the Blocks 1 and 2 code unchanged. If `tsPlugin.configs['flat/recommended']` is missing from the Step 2 output, switch to `configs['flat/recommended']` from the `typescript-eslint` package (after `pnpm add -D -E typescript-eslint@latest`) and update the Block 2 comment to match.

- [ ] **Step 4: Run lint**

```bash
source ~/.nvm/nvm.sh >/dev/null && nvm use --silent && pnpm lint
```
Expected: exit 0. Fix new findings in source. A rule may only be disabled with an entry in `justifications/T-39.md`.

- [ ] **Step 5: Confirm the a11y rules are active (this checks that the plugin swap actually worked)**

```bash
source ~/.nvm/nvm.sh >/dev/null && nvm use --silent && \
printf -- '---\n---\n<img src="/x.png" />\n' > src/pages/__a11y_probe.astro && \
pnpm eslint src/pages/__a11y_probe.astro; rm src/pages/__a11y_probe.astro
```
Expected: an `astro/jsx-a11y/alt-text` error. If there's no error, the a11y preset isn't wired up; fix that before committing.

- [ ] **Step 6: Run the per-commit gate.** Everything must pass now, lint included.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml eslint.config.js src
git commit -m "build(T-39): migrate lint stack to ESLint 10 + eslint-plugin-astro 3

Replaces eslint-plugin-jsx-a11y (ESLint <=9 only) with eslint-plugin-jsx-a11y-x.

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Astro 7 + mdx 8 + react 7

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`
- Modify: `astro.config.mjs`
- Modify: any `src/**/*.astro` / `src/content/**/*.mdx` the Rust compiler rejects

**Interfaces:**
- Produces: `markdown.processor = unified({ remarkPlugins })`, which MDX inherits, and `compressHTML: true`, which Task 5 mirrors in Prettier.

- [ ] **Step 1: Record the TOC output before changing anything (this is the check that must still pass afterwards)**

```bash
grep -c "<details" dist/posts/audio-vs-paper-books/index.html dist/posts/ems-the-delivery-system/index.html
rtk proxy grep -l "Table of contents" src/content/blog/*.mdx | head -1
```
Expected: `1` or more for each `.md` post. Note the `.mdx` post name, then run `grep -c "<details" dist/posts/<that-slug>/index.html` for it too. Keep these counts.

- [ ] **Step 2: Bump packages**

```bash
source ~/.nvm/nvm.sh >/dev/null && nvm use --silent && \
pnpm add -E astro@latest @astrojs/mdx@latest @astrojs/react@latest @astrojs/markdown-remark@latest && \
pnpm add -E astro-expressive-code@latest @expressive-code/plugin-line-numbers@latest @expressive-code/plugin-collapsible-sections@latest
```
Expected: astro 7.x, mdx 8.x, react 7.x, markdown-remark ≥7.3; no unmet peers.

- [ ] **Step 3: Update `astro.config.mjs`**

Add the import next to the other imports:
```js
import { unified } from '@astrojs/markdown-remark';
```
Replace the `markdown` block with:
```js
  markdown: {
    // Astro 7 defaults to the Sätteri processor, which ignores remark plugins.
    // Stay on unified so remark-toc / remark-collapse keep rendering the TOC.
    processor: unified({
      remarkPlugins: [remarkToc, [remarkCollapse, {
        test: "Table of contents"
      }]],
    }),
    shikiConfig: {
      theme: "one-dark-pro",
      wrap: true
    }
  },
```
Next to `scopedStyleStrategy` at the end of the config, add:
```js
  // Astro 7 defaults to 'jsx' whitespace rules; keep lossless compression so
  // inline spacing matches the pre-upgrade output. Mirror in .prettierrc.
  compressHTML: true,
```

- [ ] **Step 4: Build and fix compiler errors**

```bash
source ~/.nvm/nvm.sh >/dev/null && nvm use --silent && rm -rf .astro dist node_modules/.vite && pnpm astro check && pnpm build 2>&1 | tail -40
```
For each Rust-compiler error (an unclosed tag or invalid nesting), fix the markup at the file and line it reports. Examples: close a non-void element that was left open; change a `<p>` that wraps block content to a `<div>` with the same classes. Rebuild until the build passes. Also check the output for warnings like "remarkPlugins ignored" or "deprecated"; if any appear, the processor config isn't being picked up.

- [ ] **Step 5: Check the TOC**

```bash
grep -c "<details" dist/posts/audio-vs-paper-books/index.html dist/posts/ems-the-delivery-system/index.html dist/posts/<mdx-slug>/index.html
```
Expected: the same counts as Step 1. If `.md` passes but `.mdx` doesn't, add `mdx({ processor: unified({ remarkPlugins: [...] }) })` using the same plugin array. If neither passes and `remark-collapse` is the cause, record a defect (the spec §6 fallback is a local plugin) and stop.

- [ ] **Step 6: Check whether the Vite 8 settings and the devToolbar workaround still work**

```bash
source ~/.nvm/nvm.sh >/dev/null && nvm use --silent && ./clean-cache.sh; (pnpm dev --port 4322 >/tmp/dev.log 2>&1 &) && sleep 8 && \
  for u in / /posts/octoprint-prusa-core-one-raspberry-pi/ /search /tags; do curl -s -o /dev/null -w "$u %{http_code}\n" http://localhost:4322$u; done; \
  grep -iE "warn|error|deprecated|504" /tmp/dev.log | head -20; pkill -f "astro dev"
```
Expected: `200` for every route and no Vite config warnings. If Vite warns about an unknown or ignored option (`optimizeDeps`, `server.preTransformRequests`, etc.), remove that option. Keep `devToolbar: { enabled: false }`; the Task 8 check decides whether it stays.

- [ ] **Step 7: Smoke-test that the islands hydrate**

Run `pnpm preview --port 4321` in the background, open `/posts/octoprint-prusa-core-one-raspberry-pi/` in Claude in Chrome, and check that the slider renders and that clicking Next moves it. Then run `pkill -f "astro preview"`. (The full check is Task 8.)

- [ ] **Step 8: Run the per-commit gate**

- [ ] **Step 9: Commit**

```bash
git add package.json pnpm-lock.yaml astro.config.mjs src
git commit -m "build(T-39): upgrade Astro 6.2 -> 7.x (mdx 8, react 7)

- keep remark-toc/remark-collapse via @astrojs/markdown-remark unified() processor
- pin compressHTML: true to preserve pre-7 whitespace output
- markup fixes required by the Rust compiler (if any, list files)

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: prettier-plugin-astro 1.0

**Files:**
- Modify: `package.json` (dependency and scripts), `pnpm-lock.yaml`
- Modify: `.prettierrc`
- Modify: formatting-only changes in `src/**/*.astro` (and other files Prettier touches)

- [ ] **Step 1: Bump the plugin**

```bash
source ~/.nvm/nvm.sh >/dev/null && nvm use --silent && pnpm add -D -E prettier-plugin-astro@latest
```

- [ ] **Step 2: Remove the obsolete flag from scripts and lint-staged**

```bash
sed -i '' 's/prettier --plugin-search-dir=. /prettier /g' package.json && grep -n "prettier" package.json
```
Expected: `"format:check": "prettier --check ."`, `"format": "prettier --write ."`, and lint-staged `"prettier --write"`.

- [ ] **Step 3: Add the matching option to `.prettierrc`**

Add after `"endOfLine": "lf",`:
```json
    "astroCompressHTML": true,
```

- [ ] **Step 4: Reformat and check the diff is formatting only**

```bash
source ~/.nvm/nvm.sh >/dev/null && nvm use --silent && pnpm format && git diff --stat && pnpm build
```
Expected: build passes. Skim `git diff` to confirm only whitespace, wrapping and quote changes, no changes to text or attributes.

- [ ] **Step 5: Run the per-commit gate, then commit**

```bash
git add -A package.json pnpm-lock.yaml .prettierrc src
git commit -m "style(T-39): prettier-plugin-astro 1.0 (Rust compiler) + reformat

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: satori 0.33

**Files:** `package.json`, `pnpm-lock.yaml`; `src/utils/generateOgImages.tsx` only if the type check fails.

- [ ] **Step 1: Bump**

```bash
source ~/.nvm/nvm.sh >/dev/null && nvm use --silent && pnpm add -E satori@latest && pnpm astro check && pnpm build
```
Expected: passes. If there's a `SatoriOptions` type error, fix `generateOgImages.tsx` based on the current satori README and note the change in the commit body.

- [ ] **Step 2: Compare OG images with the baseline**

```bash
shasum -a 256 dist/og.png dist/posts/audio-vs-paper-books/index.png; cat docs/library-packages-upgrade/baseline/2026-09/og/sha256.txt
```
If the hashes differ (likely, because of HarfBuzz), open both old and new PNGs with the Read tool and compare them visually. Small kerning or anti-aliasing differences are fine. Clipped, overflowing, missing or wrong-font text counts as a defect.

- [ ] **Step 3: Run the per-commit gate, then commit**

```bash
git add package.json pnpm-lock.yaml src/utils
git commit -m "build(T-39): bump satori 0.29 -> 0.33 (OG images visually verified)

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Cleanup and docs

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml` (remove `@types/github-slugger`)
- Modify: `CLAUDE.md`, `DEV-TROUBLESHOOTING.md`

- [ ] **Step 1: Remove the deprecated types package**

```bash
source ~/.nvm/nvm.sh >/dev/null && nvm use --silent && pnpm remove @types/github-slugger && pnpm astro check
```
Expected: 0 errors (`github-slugger` ships its own `index.d.ts`).

- [ ] **Step 2: Update `CLAUDE.md`**

- `src/content/config.ts` → `src/content.config.ts` (the Content Collections section).
- The Tailwind integration line → "Tailwind 4 via `@tailwindcss/vite`". MDX/React/Sitemap/Partytown/Expressive Code stay. Add "Markdown uses the unified processor (`@astrojs/markdown-remark`) so remark-toc and remark-collapse keep working under Astro 7".
- Important Notes: `Node version: 22.23.3 (.nvmrc and package.json engines)`, replace "Images optimized with sharp (pinned to 0.32.6)" with "Images optimized with sharp", remove the separate "Markdown uses remark-toc…" bullet if it now duplicates the new line.
- Add: "`compressHTML: true` in `astro.config.mjs` must match `astroCompressHTML` in `.prettierrc`."
- Add: "TypeScript is capped by the `typescript-eslint` and `@astrojs/check` peer ranges (6.0.x as of 2026-09)."

- [ ] **Step 3: Update `DEV-TROUBLESHOOTING.md`**

```bash
sed -i '' 's/yarn clean/pnpm clean/g; s/yarn fresh/pnpm fresh/g; s/yarn dev/pnpm dev/g; s/yarn install/pnpm install/g' DEV-TROUBLESHOOTING.md && rtk proxy grep -n "yarn" DEV-TROUBLESHOOTING.md
```
Expected: no `yarn` left. Fix any remaining lines by hand.

- [ ] **Step 4: Run the per-commit gate, then commit**

```bash
git add package.json pnpm-lock.yaml CLAUDE.md DEV-TROUBLESHOOTING.md
git commit -m "chore(T-39): drop deprecated @types/github-slugger, refresh docs

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Final local verification (spec §5.2)

**Files:**
- Create: `docs/library-packages-upgrade/verification-report-2026-09.md`
- Create: `docs/library-packages-upgrade/qa-runs/T-39-2026-09/*.png` (screenshots)

- [ ] **Step 1: Clean production build and preview**

```bash
source ~/.nvm/nvm.sh >/dev/null && nvm use --silent && rm -rf node_modules .astro dist && \
  pnpm install --frozen-lockfile && pnpm astro check && pnpm lint && pnpm format:check && pnpm build && \
  (pnpm preview --port 4321 >/tmp/preview.log 2>&1 &) && sleep 3 && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/
```
Expected: every command exits 0; `200`.

- [ ] **Step 2: Open the browser**

Load the Chrome tools in one ToolSearch call (`tabs_context_mcp`, `tabs_create_mcp`, `navigate`, `computer`, `read_page`, `find`, `javascript_tool`, `read_console_messages`, `resize_window`, `gif_creator`). Create a new tab and resize the window to 1280×1800 to match the baseline.

- [ ] **Step 3: Check the image slider on both posts**

For `http://localhost:4321/posts/octoprint-prusa-core-one-raspberry-pi/` and `http://localhost:4321/posts/flutter-google-maps-embedded-map/`, record a GIF (`image_slider_<slug>.gif`) and check each of these:
1. The carousel (`[aria-roledescription="carousel"]`) is present and slide count = N. Check with `javascript_tool`: `document.querySelectorAll('[aria-roledescription="slide"]').length`.
2. Every slide `<img>` loaded: `[...document.querySelectorAll('[aria-roledescription="slide"] img')].every(i => i.complete && i.naturalWidth > 0)` returns `true`.
3. At the start, Prev (`[aria-label="Previous slide"]`) is disabled or hidden and Next is enabled.
4. Clicking Next increases `scrollLeft` by exactly one slide width (compare with `clientWidth`). Clicking Next N−1 times reaches the end, where Next is disabled. Clicking Prev once goes back one slide.
5. After a horizontal scroll (`computer` scroll action) of part of a slide, the carousel snaps to a slide edge (`scrollLeft % clientWidth` is within 1px of 0).
6. The labels read `Slide 1 of N` … `Slide N of N`.
7. Toggle the theme and repeat checks 1 and 3; both still pass and the carousel is readable.
8. `read_console_messages` with pattern `error|hydrat|warning` shows nothing new.

- [ ] **Step 4: Check Search at `/search`**

1. Type a known title word (e.g. `hiring`) into the input: results list at least one post.
2. The URL contains `?q=hiring` (`location.search`).
3. Reload: the input value is `hiring` and the results are there again.
4. Click the first result: it opens `/posts/...` and returns 200.
5. No console errors.

- [ ] **Step 5: Check TagsList at `/tags`**

1. Type `engin` into the filter: the list narrows and includes `engineering-management`.
2. Switch the sort to alphabetical: the first tag is alphabetically first. Switch back to count: order goes by count.
3. Click a tag: it opens `/tags/<tag>/`.
4. No console errors.

- [ ] **Step 6: Check ClientRouter navigation**

Starting from `/`, click through to the carousel post, use the header to go to `/search`, then to `/tags`, without typing any URLs. Check that each island works after navigation (repeat check 4 from Step 3, and check 1 from Steps 4 and 5). Toggle dark mode on `/`, navigate twice, and confirm the theme stays set with no light flash (watch the GIF frames).

- [ ] **Step 7: Take screenshots and compare with the baseline**

Capture the 10 routes from `baseline/SCREENSHOTS.md` at 1280×1800 into `qa-runs/T-39-2026-09/NN-name.png`. For each one, Read both the baseline and the new PNG and compare them: layout, images, spacing between inline links and tags (this is where a `compressHTML` problem would show), and theming. Carousel page 04 is expected to look like the post-April pure-CSS carousel, not flowbite. The `/tags/engineering-management/` count may differ because new posts were added.

- [ ] **Step 8: Check RSS, sitemap, OG and TOC**

```bash
for u in /rss.xml /sitemap-index.xml /og.png /posts/audio-vs-paper-books/index.png; do curl -s -o /dev/null -w "$u %{http_code} %{content_type}\n" http://localhost:4321$u; done
curl -s http://localhost:4321/rss.xml | xmllint --noout - && echo rss-ok
curl -s http://localhost:4321/sitemap-index.xml | xmllint --noout - && echo sitemap-ok
```
Expected: 200s with XML/PNG content types, `rss-ok`, `sitemap-ok`. In the browser, open `/posts/audio-vs-paper-books/` and confirm "Table of contents" is a collapsible `<details>` that expands on click.

- [ ] **Step 9: Decide whether the devToolbar workaround stays**

Temporarily set `devToolbar: { enabled: true }`, run `./clean-cache.sh`, and start `pnpm dev`. Load `/`, the carousel post and `/search` in the browser, and check `/tmp/dev.log` and the console for 504 or "Failed to fetch dynamically imported module". If it's clean after 3 cold starts, remove the `devToolbar` block and its T-38 comment and commit (`chore(T-39): drop T-38 devToolbar workaround, fixed on Vite 8`). Otherwise revert and note in the report that it stays.

- [ ] **Step 10: Write the report and commit**

Create `docs/library-packages-upgrade/verification-report-2026-09.md` using the April report's structure: the stack snapshot (`node -v`, `pnpm -v`, and versions from `pnpm list --depth 0`), the gate output tail, a table of island checks with pass/fail and evidence, a screenshot comparison table, RSS/sitemap/OG/TOC results, the devToolbar decision, and any defects. Stop the preview (`pkill -f "astro preview"`), then:
```bash
git add docs/library-packages-upgrade/verification-report-2026-09.md docs/library-packages-upgrade/qa-runs/T-39-2026-09
git commit -m "docs(T-39): final local verification report

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

**If any check in Steps 3–8 fails:** fix it on the branch (as a new commit), then redo Task 8 from Step 1. Don't go on to Task 9 with any open failure.

---

### Task 9: Push and open the PR (only if Task 8 fully passed)

- [ ] **Step 1: Confirm the branch is clean and every report item is marked pass**

```bash
git status --short && rtk proxy grep -ciE "\bFAIL\b" docs/library-packages-upgrade/verification-report-2026-09.md
```
Expected: no uncommitted changes; `0` FAIL rows.

- [ ] **Step 2: Push and open the PR**

```bash
git push -u origin upgrade/2026-09
gh pr create --base main --title "build: upgrade to Astro 7, ESLint 10, Node 22.23 (Sept 2026)" --body "$(cat <<'EOF'
## Summary
- Astro 6.2 → 7.x (mdx 8, react 7); remark plugins kept via `@astrojs/markdown-remark` unified processor; `compressHTML: true` pinned
- ESLint 10 stack: eslint-plugin-astro 3, astro-eslint-parser 3, `eslint-plugin-jsx-a11y` → `eslint-plugin-jsx-a11y-x`
- Node 22.22.2 → 22.23.3; prettier-plugin-astro 1.0 (reformat-only commit); satori 0.33; minor/patch bumps
- TypeScript held at 6.0.x (typescript-eslint / @astrojs/check peer ranges exclude 7)
- Removed deprecated `@types/github-slugger`; refreshed CLAUDE.md / DEV-TROUBLESHOOTING.md

Design: `docs/library-packages-upgrade/2026-09-23-upgrade-design.md`
Verification: `docs/library-packages-upgrade/verification-report-2026-09.md`

## Test plan
- [x] install --frozen-lockfile, astro check, lint, format:check, build (per commit)
- [x] Image slider, Search, TagsList verified in production preview (incl. ClientRouter navigation, light/dark)
- [x] 10-route screenshot comparison vs baseline
- [x] RSS, sitemap, OG images, TOC collapse
- [ ] CI green on this PR

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 3: Watch CI**

```bash
gh pr checks --watch
```
Expected: `validate` passes. If it fails, reproduce the failure locally on Node from `.nvmrc`, fix it on the branch, and push again.
