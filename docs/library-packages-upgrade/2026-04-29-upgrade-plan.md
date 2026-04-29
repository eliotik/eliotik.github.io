# Library Packages Upgrade — Implementation Plan

> **For agentic workers:** Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement. The Orchestrator dispatches Dev and QA agents per task; see `agent-prompts/orchestrator.md`. State is tracked in `backlog.yaml`. Steps within a task use `- [ ]` checkboxes — the agent checks them off as they go.

**Goal:** Upgrade the blog from Astro 4 / React 18 / Tailwind 3 / ESLint 8 / Node 18 / Yarn 1 to Astro 5 / React 19 / Tailwind 4 / ESLint 9 / Node 22 / pnpm, replace flowbite with native CSS, and tighten the CI/CD gate. Each upgrade ships as one commit on its own branch, validated by a QA agent before merge.

**Architecture:** Worktree-per-task with two parallelism lanes (L1 = code-only / parallel; L2 = lockfile-touching / serialized). The Dev → QA → defect → Dev loop iterates per task until QA approves. The Orchestrator merges approved branches in dependency order.

**Tech Stack:** Astro 5, React 19, Tailwind CSS 4 (via `@tailwindcss/vite`), ESLint 9 (flat config), TypeScript 5.x, pnpm via Corepack, Node 22 LTS, GitHub Pages via `withastro/action`.

---

## 1. Workflow Rules

### 1.1 Roles

- **Dev Agent** — implements one task. Procedure: `agent-prompts/dev-agent.md`.
- **QA Agent** — validates one task. Procedure: `agent-prompts/qa-agent.md`.
- **Orchestrator** — dispatches Dev/QA, merges approved branches. Procedure: `agent-prompts/orchestrator.md`.

### 1.2 State machine (per task in `backlog.yaml`)

```
backlog ──▶ in-progress ──▶ qa-pending ──▶ qa-in-progress ──▶ done
                ▲                                  │
                └──────────────── defect ◀─────────┘

blocked  — set when depends_on is unmet (orchestrator only).
```

Mutation rules:
- Only the agent owning a task (`worker` for Dev / `qa_worker` for QA) writes to its row.
- Always commit `backlog.yaml` in the same commit as the work it records.
- Never edit a task other than your own.

### 1.3 Lanes

- `preflight` — strictly sequential, blocks everything until done.
- `L1` — code-only changes (no `package.json` mutations beyond the `lint-staged` block in T-14). Multiple L1 tasks may run in parallel worktrees.
- `L2` — touches `package.json` and/or the lockfile. Strictly serialized in dependency order.
- `validation` — final E2E and deploy. Sequential.

### 1.4 Per-task contract

Every L1 / L2 / preflight task produces exactly **two commits** on its branch:
1. **Work commit** — code change, justification file, `backlog.yaml` set to `qa-pending`.
2. **Hand-off commit** — only the QA hand-off bookkeeping (already in commit 1's status update; this commit pushes the `branch:` and `commit_sha:` fields). In practice agents may combine into one commit if they prefer; the QA agent must accept either pattern.

Validation tasks (T-30/T-31) are non-coding; they produce a verification report and don't follow the QA loop.

### 1.5 Defect loop

QA can reject a task and file a defect at `defects/<task-id>-D<n>.md`. The Dev Agent fixes on the same branch, updates the justification ("Defect resolutions" section), and re-hands-off to QA. Repeat until QA approves.

The Orchestrator runs this loop via the `/loop` skill (self-paced) — see `agent-prompts/orchestrator.md`.

---

## 2. Verification Protocol (canonical)

Every task must pass this protocol before its Dev commit. The QA Agent re-runs it independently.

| # | Command | Expected | Notes |
|---|---|---|---|
| 1 | `pnpm install --frozen-lockfile` | exit 0 | Skipped on T-00, T-01, T-02 (pre-pnpm). |
| 2 | `pnpm astro check` | 0 errors, 0 warnings about your changes | Skipped on T-00, T-01, T-13, T-14. |
| 3 | `pnpm lint` | exit 0 | Skipped on T-00, T-01, T-02. After T-23, uses flat config. |
| 4 | `pnpm build` | exit 0; `dist/` populated | Skipped on T-00, T-12, T-13. |
| 5 | `pnpm dev` smoke (background, `curl -fs http://localhost:4321/` returns 200, kill server) | 200 OK | Skipped on T-00, T-01, T-02, T-12, T-13, T-14. |
| 6 | `pnpm audit --prod`; diff against `baseline/audit-baseline.txt` | No new High/Critical | Skipped on T-00, T-01. |

For tasks where pnpm doesn't exist yet (pre-T-03), substitute `yarn` for `pnpm` and skip step 1.

For tasks with `visual_smoke_required: true`, also walk the 9 routes from the design §1 and capture screenshots.

**Audit baseline file** (`baseline/audit-baseline.txt`) is captured during T-00 (using yarn) and refreshed by T-03 (using pnpm).

---

## 3. File Structure

### 3.1 Operational files (created by writing-plans, present already)

- `docs/library-packages-upgrade/2026-04-29-upgrade-design.md` — spec
- `docs/library-packages-upgrade/2026-04-29-upgrade-plan.md` — this plan
- `docs/library-packages-upgrade/backlog.yaml` — task state
- `docs/library-packages-upgrade/agent-prompts/dev-agent.md`
- `docs/library-packages-upgrade/agent-prompts/qa-agent.md`
- `docs/library-packages-upgrade/agent-prompts/orchestrator.md`
- `docs/library-packages-upgrade/justifications/_TEMPLATE.md`
- `docs/library-packages-upgrade/defects/_TEMPLATE.md`

### 3.2 Files created during execution

- `docs/library-packages-upgrade/baseline/<route>.png` × 10 (T-00)
- `docs/library-packages-upgrade/baseline/audit-baseline.txt` (T-00, refreshed T-03)
- `docs/library-packages-upgrade/justifications/T-XX.md` (one per task that reaches `done`)
- `docs/library-packages-upgrade/qa-runs/T-XX-<timestamp>/` (one per QA invocation)
- `docs/library-packages-upgrade/defects/T-XX-D<n>.md` (one per defect)
- `.github/workflows/ci.yml` (T-01)
- `.github/dependabot.yml` (T-13)
- `eslint.config.js` (T-12)

### 3.3 Files modified

- `.nvmrc` (T-02)
- `package.json` (T-02 engines; T-03 packageManager + scripts; T-14 lint-staged; T-20+ deps)
- `deploy.yml`, `ci.yml` (T-02 node-version)
- `astro.config.mjs` (T-20 integrations; T-22 Tailwind plugin; T-24 optimizeDeps)
- `src/components/ImageSliderClient.tsx` (T-10)
- `src/layouts/Layout.astro` (T-11)
- `src/styles/base.css` (T-22)
- `src/content/config.ts` (T-20)
- `tsconfig.json` (T-25 if needed)
- `CLAUDE.md` (T-03 commands)
- `.husky/pre-commit` (T-03 + T-14)

### 3.4 Files deleted

- `yarn.lock` (T-03)
- `tailwind.config.cjs` (T-22)
- `.eslintrc.cjs` (T-23)

---

## 4. Tasks

> Each task starts with a metadata block, then bite-sized steps. Steps use `- [ ]` so the Dev Agent can check them off in their working notes. The first task per task-section is **always** "Verify preconditions in backlog.yaml". The last is **always** "Hand off to QA".

---

### Task T-00 — Operational infrastructure & baseline capture {#task-t-00}

**Lane:** preflight · **Depends on:** none · **Visual smoke:** N/A (this task creates the baseline)

**Goal:** Confirm operational infrastructure is in place; capture build & visual baseline of the current site so later tasks can diff against it.

**Files:**
- Create: `docs/library-packages-upgrade/baseline/audit-baseline.txt`
- Create: `docs/library-packages-upgrade/baseline/<route>.png` × 10
- Create: `docs/library-packages-upgrade/baseline/SCREENSHOTS.md` (index)
- Create: `docs/library-packages-upgrade/justifications/T-00.md`

**Steps:**

- [ ] **1. Verify preconditions.** Read `backlog.yaml`. Confirm T-00 is `backlog`. Confirm these files exist:
  - `docs/library-packages-upgrade/2026-04-29-upgrade-design.md`
  - `docs/library-packages-upgrade/2026-04-29-upgrade-plan.md`
  - `docs/library-packages-upgrade/backlog.yaml`
  - `docs/library-packages-upgrade/agent-prompts/{dev-agent,qa-agent,orchestrator}.md`
  - `docs/library-packages-upgrade/justifications/_TEMPLATE.md`
  - `docs/library-packages-upgrade/defects/_TEMPLATE.md`

- [ ] **2. Claim the task.** Set `T-00.status: in-progress`, `worker`, `started_at`.

- [ ] **3. Create worktree.** Branch: `upgrade/T-00-baseline`.

- [ ] **4. Capture audit baseline.**

  ```bash
  yarn install --frozen-lockfile
  yarn npm audit --json > docs/library-packages-upgrade/baseline/audit-baseline.txt 2>&1 || true
  ```

  (Yarn 1's audit syntax differs; if `yarn npm audit` fails, fall back to `npx better-npm-audit audit > docs/library-packages-upgrade/baseline/audit-baseline.txt 2>&1` or just `npm audit --json` after generating a temporary `package-lock.json`. The point is to record the current vulnerability surface; the file is human-readable text.)

- [ ] **5. Build current `main` and start dev server.**

  ```bash
  yarn build
  yarn dev &
  DEV_PID=$!
  sleep 8
  ```

- [ ] **6. Capture screenshots.** Use Chrome headless (or the `superpowers-chrome:browsing` skill). Capture each route at viewport 1280×800 and save with the listed filename:

  | Route | Filename |
  |---|---|
  | `/` | `01-home.png` |
  | `/posts` | `02-posts-index.png` |
  | `/posts/connecting-the-systems` (or any post w/ images) | `03-post-with-images.png` |
  | `/posts/audio-vs-paper-books` (or any post w/ ImageSlider) | `04-post-with-carousel.png` |
  | `/tips` | `05-tips-index.png` |
  | `/tags` | `06-tags-index.png` |
  | `/tags/<first tag>` | `07-tag-detail.png` |
  | `/threads` | `08-threads-index.png` |
  | `/about` | `09-about.png` |
  | `/this-route-doesnt-exist` | `10-404.png` |

  If the carousel post slug differs in this repo, identify by grepping for `<ImageSlider` and pick the first hit. Record the slug used in `SCREENSHOTS.md`.

- [ ] **7. Stop dev server.** `kill $DEV_PID`.

- [ ] **8. Write SCREENSHOTS.md index** listing each PNG with route, slug, viewport, and current `astro --version` output.

- [ ] **9. Write justification.** Use template. This task's justification §5 (Verification) only requires step 4 (build) and step 5 (dev smoke succeeded).

- [ ] **10. Commit.**

  ```
  chore(T-00): capture baseline screenshots and audit log

  Captures pre-upgrade build, screenshot baseline of 10 routes, and
  the current vulnerability audit so subsequent upgrade tasks can
  visually diff and security-diff against this point in time.

  Refs: docs/library-packages-upgrade/2026-04-29-upgrade-plan.md (Task T-00)

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  ```

- [ ] **11. Hand off.** Set `T-00.status: qa-pending`, `finished_at`, `branch`, `commit_sha`, `justification_file`. Commit the status update.

**QA-specific notes for T-00:** QA verifies all 10 screenshots exist, are non-empty, and match the routes listed. QA also verifies the audit baseline file is non-empty.

---

### Task T-01 — PR validation workflow (CI gate) {#task-t-01}

**Lane:** L1 · **Depends on:** T-00 · **Visual smoke:** no

**Goal:** Add a workflow that runs on every pull_request and blocks merge on failure. Becomes the gate for every later upgrade task.

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `docs/library-packages-upgrade/justifications/T-01.md`

**Steps:**

- [ ] **1. Verify preconditions.** T-00 done.
- [ ] **2. Claim.** `T-01.status: in-progress`.
- [ ] **3. Worktree.** `upgrade/T-01-ci-gate`.

- [ ] **4. Create `.github/workflows/ci.yml`:**

  ```yaml
  name: CI
  on:
    pull_request:
      branches: [main]
    workflow_dispatch:

  permissions:
    contents: read

  jobs:
    validate:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4

        - name: Set up Node
          uses: actions/setup-node@v4
          with:
            node-version-file: '.nvmrc'

        - name: Enable Corepack & pnpm
          run: |
            corepack enable
            corepack prepare pnpm@latest --activate

        - name: Install
          run: pnpm install --frozen-lockfile

        - name: Astro check
          run: pnpm astro check

        - name: Lint
          run: pnpm lint

        - name: Build
          run: pnpm build

        - name: Audit (production)
          run: pnpm audit --prod
          continue-on-error: true   # report vulns, don't block (Dependabot owns blocking)
  ```

  Note: This workflow assumes pnpm exists. It will fail on PRs that branched off T-01 but predate T-03's pnpm migration — that's intentional. T-02 and T-03 are the only tasks expected to run before pnpm exists, and they'll bypass the CI gate by being merged via the workflow_dispatch path or by allowing admin merge.

- [ ] **5. Verify the YAML parses:** `cat .github/workflows/ci.yml | python3 -c "import yaml, sys; yaml.safe_load(sys.stdin)"`. Expected: no error.

- [ ] **6. Justification.** Per template. §5 (verification): only the YAML parse check applies pre-pnpm.

- [ ] **7. Commit.**

  ```
  feat(T-01): add PR validation workflow

  Adds .github/workflows/ci.yml that runs install, astro check, lint,
  build, and pnpm audit on every pull_request. Becomes the CI gate
  for the upgrade campaign.

  Refs: docs/library-packages-upgrade/2026-04-29-upgrade-plan.md (Task T-01)

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  ```

- [ ] **8. Hand off.**

**QA notes:** QA verifies the YAML parses, the workflow is correctly scoped (`pull_request` trigger), and the steps match the design's CI/CD remediation §2 item 1 + 4.

---

### Task T-02 — Bump Node to 22 LTS {#task-t-02}

**Lane:** L2 · **Depends on:** T-01 · **Visual smoke:** no

**Goal:** Switch every Node version pin (.nvmrc, package.json engines, deploy.yml, ci.yml) from 18.19.0 to the current 22 LTS minor.

**Note on version selection:** Pick the latest 22.x.y published on nodejs.org as of the day the task runs. Record the chosen version in the justification. Use the same version everywhere — no mismatches.

**Files:**
- Modify: `.nvmrc`
- Modify: `package.json` (`engines.node` only)
- Modify: `.github/workflows/deploy.yml`
- Modify: `.github/workflows/ci.yml`
- Create: `docs/library-packages-upgrade/justifications/T-02.md`

**Steps:**

- [ ] **1. Preconditions.** T-00, T-01 done.
- [ ] **2. Claim.** `T-02.status: in-progress`.
- [ ] **3. Worktree.** `upgrade/T-02-node-22`.

- [ ] **4. Determine target.** Run `corepack enable` to make sure corepack is available. Choose Node 22 LTS latest (e.g. `22.x.y`). Record the chosen version: it goes in all 4 files identically.

- [ ] **5. Update `.nvmrc`:**

  ```
  22.x.y
  ```

- [ ] **6. Update `package.json` `engines`:**

  ```json
  "engines": {
      "node": "22.x.y"
  }
  ```

  No other changes to `package.json` in this task.

- [ ] **7. Update `.github/workflows/deploy.yml`** — change the explicit `node-version: 18.19.0` line to `22.x.y`.

- [ ] **8. Update `.github/workflows/ci.yml`** — already uses `node-version-file: '.nvmrc'` from T-01, so no edit needed unless that's missing; in that case, add the same.

- [ ] **9. Verify locally:**

  ```bash
  nvm install
  nvm use
  node --version   # should print v22.x.y
  yarn install --frozen-lockfile
  yarn build
  ```

  Expected: build succeeds on Node 22. If a dependency breaks under Node 22, file a defect-style note in the justification "Risks introduced" — likely candidates are sharp@0.32.6 (pinned) and node-gyp deps. If sharp fails to build under Node 22, document the workaround (Node 22 ships a prebuilt sharp binary — usually `yarn install` resolves it; if not, add `node_modules/.cache` to ignore and retry).

- [ ] **10. Justification.** Verification §5.4 (build under new Node) is the key evidence.

- [ ] **11. Commit.**

  ```
  build(T-02): bump Node to 22 LTS (was 18.19.0)

  - .nvmrc, package.json engines, deploy.yml, ci.yml all to 22.x.y
  - Validates yarn install + build succeed on Node 22

  Refs: docs/library-packages-upgrade/2026-04-29-upgrade-plan.md (Task T-02)

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  ```

- [ ] **12. Hand off.**

**QA notes:** QA reproduces with `nvm install && yarn build`. QA confirms all 4 files are in sync.

---

### Task T-03 — Migrate yarn 1 → pnpm via Corepack {#task-t-03}

**Lane:** L2 · **Depends on:** T-02 · **Visual smoke:** no · **Largest task in Phase 0.**

**Goal:** Replace yarn 1 (unmaintained) with pnpm pinned via Corepack.

**Files:**
- Create: `pnpm-lock.yaml`
- Modify: `package.json` (add `packageManager`, scripts unchanged)
- Modify: `.husky/pre-commit`
- Modify: `.github/workflows/deploy.yml`
- Delete: `yarn.lock`
- Modify: `CLAUDE.md` (commands section)
- Refresh: `docs/library-packages-upgrade/baseline/audit-baseline.txt` (now pnpm-format)

**Steps:**

- [ ] **1. Preconditions.** T-02 done.
- [ ] **2. Claim.**
- [ ] **3. Worktree.** `upgrade/T-03-pnpm`.

- [ ] **4. Enable Corepack and pin pnpm.**

  ```bash
  corepack enable
  corepack prepare pnpm@latest --activate
  pnpm --version   # record this; goes into package.json
  ```

- [ ] **5. Add `packageManager` to `package.json` (top-level field, not under deps):**

  ```json
  {
      "name": "eliotik.github.io",
      "packageManager": "pnpm@<version>",
      "...": "..."
  }
  ```

- [ ] **6. Generate the pnpm lockfile.**

  ```bash
  rm yarn.lock
  pnpm import   # imports yarn.lock if it still exists; if removed, this is a no-op
  pnpm install
  ```

  If `pnpm import` is needed (it converts a yarn.lock to a pnpm-lock.yaml in-place), run it BEFORE deleting yarn.lock. Adjusted order:

  ```bash
  pnpm import        # reads yarn.lock, generates pnpm-lock.yaml
  rm yarn.lock
  pnpm install --frozen-lockfile   # confirms the new lockfile is sufficient
  ```

- [ ] **7. Verify the install resolved every dependency.**

  ```bash
  pnpm install --frozen-lockfile
  ```

  Expected: exit 0, no "needs to be re-resolved" errors.

  If pnpm complains about peer-dep mismatches that yarn was silently ignoring, document each one in the justification's "Risks introduced" section. Typical offenders here: `flowbite-react` peers, `@astrojs/tailwind` peers. **Do NOT bump these — that's Phase 2's job.** For now, configure pnpm to be permissive:

  Add to `package.json`:

  ```json
  "pnpm": {
      "peerDependencyRules": {
          "allowedVersions": {
              "react": "18",
              "react-dom": "18"
          }
      }
  }
  ```

- [ ] **8. Update `.husky/pre-commit`.** Replace `npx lint-staged` with `pnpm exec lint-staged` and drop the legacy shim:

  ```bash
  pnpm exec lint-staged
  ```

  (Husky modernization continues in T-14.)

- [ ] **9. Update `.github/workflows/deploy.yml`.** Add explicit pnpm setup step:

  ```yaml
  - name: Enable Corepack & pnpm
    run: |
      corepack enable
      corepack prepare pnpm@latest --activate
  ```

  before the `withastro/action` step. Also pass `package-manager: pnpm@latest` to the action's `with:` block:

  ```yaml
  - uses: withastro/action@v4
    with:
      node-version: 22.x.y
      package-manager: pnpm@latest
  ```

  Same change to `.github/workflows/ci.yml` if it doesn't already do this from T-01 (it should).

- [ ] **10. Update `CLAUDE.md` commands section** — replace every `yarn <cmd>` with `pnpm <cmd>`:

  ```markdown
  ## Development Commands

  - `pnpm dev` - Start development server
  - `pnpm build` - Build for production (runs Astro check, builds, and optimizes with jampack)
  - `pnpm preview` - Preview production build
  - `pnpm format` - Format code with Prettier
  - `pnpm format:check` - Check code formatting
  - `pnpm lint` - Run ESLint
  - `pnpm sync` - Sync Astro content collections
  ```

- [ ] **11. Refresh audit baseline:**

  ```bash
  pnpm audit --prod > docs/library-packages-upgrade/baseline/audit-baseline.txt 2>&1 || true
  ```

- [ ] **12. Run full verification protocol** (all 6 steps; this is the first task where all 6 apply).

- [ ] **13. Justification.** Particularly important here: list any peer-dep warnings, the chosen pnpm version, and whether `pnpm import` was needed.

- [ ] **14. Commit.**

  ```
  build(T-03): migrate from yarn 1 to pnpm via Corepack

  - Adds packageManager: pnpm@<version>
  - Generates pnpm-lock.yaml, deletes yarn.lock
  - Updates Husky pre-commit, GitHub Actions, CLAUDE.md
  - Refreshes audit baseline in pnpm format

  Refs: docs/library-packages-upgrade/2026-04-29-upgrade-plan.md (Task T-03)

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  ```

- [ ] **15. Hand off.**

**QA notes:** QA runs the full verification protocol and confirms `yarn.lock` is absent and `pnpm-lock.yaml` is present.

---

### Task T-10 — Replace flowbite Carousel with CSS scroll-snap {#task-t-10}

**Lane:** L1 · **Depends on:** T-03 · **Visual smoke:** yes

**Goal:** Rewrite `ImageSliderClient.tsx` to render a pure CSS scroll-snap horizontal scroller. Same external API. Do NOT remove the dep — that's T-24.

**Files:**
- Modify: `src/components/ImageSliderClient.tsx`

**Steps:**

- [ ] **1. Preconditions.** T-03 done.
- [ ] **2. Claim.**
- [ ] **3. Worktree.** `upgrade/T-10-css-carousel`.

- [ ] **4. Replace file contents:**

  ```tsx
  interface ImageData {
      src: string;
      alt: string;
  }

  export interface Props {
      images: ImageData[];
  }

  export default function ImageSliderClient({ images }: Props) {
      return (
          <div
              className="
                  relative h-96 w-full
                  flex snap-x snap-mandatory
                  overflow-x-auto overflow-y-hidden
                  scroll-smooth rounded-lg border
                  scrollbar-thin
              "
              role="region"
              aria-roledescription="carousel"
              aria-label="Image slider"
              tabIndex={0}
          >
              {images.map((image, index) => (
                  <a
                      key={index}
                      target="_blank"
                      href={image.src}
                      rel="noreferrer"
                      className="
                          flex-none w-full snap-center snap-always
                          flex items-center justify-center
                      "
                      aria-roledescription="slide"
                      aria-label={`Slide ${index + 1} of ${images.length}`}
                  >
                      <img
                          src={image.src}
                          alt={image.alt}
                          className="!my-0 h-80 border-none object-contain"
                          loading="lazy"
                          decoding="async"
                      />
                  </a>
              ))}
          </div>
      );
  }
  ```

  Note: `client:load` (or whichever directive `ImageSlider.astro` uses) keeps this hydrated; verify in the parent file. The component remains a React component because the parent wires it as such — switching it to a `.astro` would be out of scope.

- [ ] **5. Verify the parent `ImageSlider.astro` still compiles.** No edits needed.

- [ ] **6. Run verification protocol.** Particular attention to:
  - `pnpm astro check` — no missing-prop errors.
  - `pnpm dev` smoke: open `/posts/<post-with-carousel>` and confirm horizontal scroll works, snapping centers each image, click opens image in a new tab, keyboard arrow keys scroll the container (because `tabIndex=0`).

- [ ] **7. Visual smoke.** Required. Compare to `baseline/04-post-with-carousel.png`. Aspect ratio and image proportions must match.

- [ ] **8. Justification.** Document that flowbite imports are still in `package.json` (intentional; T-24 removes them).

- [ ] **9. Commit.**

  ```
  refactor(T-10): replace flowbite Carousel with CSS scroll-snap

  Pure-CSS horizontal scroller with snap points and accessible
  semantics. Same external props as before so ImageSlider.astro is
  unchanged. flowbite-react import removed; flowbite + flowbite-react
  remain in package.json until T-24.

  Refs: docs/library-packages-upgrade/2026-04-29-upgrade-plan.md (Task T-10)

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  ```

- [ ] **10. Hand off.**

---

### Task T-11 — Inline theme-mode pre-paint script {#task-t-11}

**Lane:** L1 · **Depends on:** T-03 · **Visual smoke:** yes

**Goal:** Remove `import { ThemeModeScript } from "flowbite-react"` and the `<ThemeModeScript />` element from `Layout.astro`. Replace with a pre-paint inline `<script is:inline>` that mirrors flowbite's behavior: read `localStorage.theme` (or `prefers-color-scheme`) and set `document.documentElement.classList.add('dark')` accordingly, before the body renders.

**Files:**
- Modify: `src/layouts/Layout.astro`

**Steps:**

- [ ] **1. Preconditions.** T-03 done.
- [ ] **2. Claim.**
- [ ] **3. Worktree.** `upgrade/T-11-inline-theme`.

- [ ] **4. Edit `Layout.astro`.**
  - Remove line 5: `import { ThemeModeScript } from "flowbite-react";`
  - Remove line 143: `<ThemeModeScript />`
  - Insert this `<script is:inline>` block in `<head>`, **before** `<ViewTransitions />` (keep it before any visible markup):

  ```astro
  <script is:inline>
    (function () {
      try {
        const stored = localStorage.getItem('theme');
        const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = stored ? stored : (prefers ? 'dark' : 'light');
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (_) {
        // localStorage unavailable (private mode, etc.) — fall back to system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
        }
      }
    })();
  </script>
  ```

- [ ] **5. Verify `public/toggle-theme.js`** still works in concert (it likely toggles the same class on user action; do not modify it unless it conflicts).

- [ ] **6. Verification protocol.** During `pnpm dev` smoke:
  - Load `/` with system preference dark — page paints dark immediately, no flash.
  - Toggle theme via the existing toggle button — switches class.
  - Reload — theme persists.
  - Open private window with `localStorage` disabled — falls back to system preference without erroring.

- [ ] **7. Visual smoke.** Required. The 9 routes must match baseline (no FOUC).

- [ ] **8. Justification.**

- [ ] **9. Commit.**

  ```
  refactor(T-11): inline theme pre-paint script (drop ThemeModeScript)

  Removes flowbite-react ThemeModeScript usage; replaces it with an
  is:inline pre-paint script that reads localStorage / prefers-color-scheme
  and sets the .dark class on <html> before first paint. No FOUC.

  Refs: docs/library-packages-upgrade/2026-04-29-upgrade-plan.md (Task T-11)

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  ```

- [ ] **10. Hand off.**

---

### Task T-12 — Draft eslint.config.js (flat config) alongside legacy {#task-t-12}

**Lane:** L1 · **Depends on:** T-03 · **Visual smoke:** no

**Goal:** Author the new flat config but leave `.eslintrc.cjs` in place. Confirm the new config validates without errors — activation happens in T-23.

**Files:**
- Create: `eslint.config.js`

**Steps:**

- [ ] **1. Preconditions.** T-03 done. **Read the current `.eslintrc.cjs`** to capture every rule, plugin, parser config, and override that must port to flat config. The current ESLint version is 8.57; flat config support is opt-in via `--config` flag.

- [ ] **2. Claim.**
- [ ] **3. Worktree.** `upgrade/T-12-eslint-flat`.

- [ ] **4. Create `eslint.config.js`.** This is a starting template — adjust to match the rules currently in `.eslintrc.cjs`:

  ```js
  // @ts-check
  import js from '@eslint/js';
  import tsParser from '@typescript-eslint/parser';
  import tsPlugin from '@typescript-eslint/eslint-plugin';
  import astroPlugin from 'eslint-plugin-astro';
  import astroParser from 'astro-eslint-parser';
  import jsxA11y from 'eslint-plugin-jsx-a11y';

  export default [
      js.configs.recommended,
      {
          files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
          languageOptions: {
              parser: tsParser,
              parserOptions: {
                  ecmaVersion: 2022,
                  sourceType: 'module',
                  ecmaFeatures: { jsx: true },
              },
          },
          plugins: {
              '@typescript-eslint': tsPlugin,
              'jsx-a11y': jsxA11y,
          },
          rules: {
              // PORT every rule from .eslintrc.cjs here.
              // If .eslintrc.cjs only had `extends`, expand each into the
              // corresponding plugin's recommended rules.
          },
      },
      {
          files: ['**/*.astro'],
          languageOptions: {
              parser: astroParser,
              parserOptions: {
                  parser: tsParser,
                  extraFileExtensions: ['.astro'],
              },
          },
          plugins: { astro: astroPlugin },
          rules: {
              ...astroPlugin.configs.recommended.rules,
          },
      },
      {
          ignores: ['dist/', '.astro/', 'node_modules/', 'docs/library-packages-upgrade/baseline/'],
      },
  ];
  ```

- [ ] **5. Validate without activating.** ESLint 8.57 supports flat config behind an env var:

  ```bash
  ESLINT_USE_FLAT_CONFIG=true npx eslint --config eslint.config.js .
  ```

  Expected: ESLint runs without crashing on config-load. There may be lint errors in the codebase (those will be fixed in T-23 after activation). The success bar here is **the config itself loads and parses files** — not "zero violations".

  If ESLint crashes with "module not found" for any plugin, do NOT add the missing plugin as a dependency in this task (that's T-23). Instead, simplify the config (remove the failing block) and document the deferral in the justification.

- [ ] **6. Verification protocol.** Steps 1, 2, 4, 5, 6 still apply (this task does not change install or build). Step 3 (`pnpm lint`) **continues to use the legacy `.eslintrc.cjs`** — that's the expected outcome.

- [ ] **7. Justification.** List which rules from `.eslintrc.cjs` ported, which deferred to T-23, and why.

- [ ] **8. Commit.**

  ```
  chore(T-12): draft eslint.config.js for flat-config migration

  Adds eslint.config.js alongside .eslintrc.cjs. Validated by loading
  with ESLINT_USE_FLAT_CONFIG=true. Activation (delete legacy + bump
  ESLint to 9) happens in T-23.

  Refs: docs/library-packages-upgrade/2026-04-29-upgrade-plan.md (Task T-12)

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  ```

- [ ] **9. Hand off.**

---

### Task T-13 — Add Dependabot configuration {#task-t-13}

**Lane:** L1 · **Depends on:** T-03 · **Visual smoke:** no

**Goal:** Configure Dependabot for weekly grouped updates. Major bumps separated from minor/patch.

**Files:**
- Create: `.github/dependabot.yml`

**Steps:**

- [ ] **1. Preconditions.** T-03 done.
- [ ] **2. Claim.**
- [ ] **3. Worktree.** `upgrade/T-13-dependabot`.

- [ ] **4. Create `.github/dependabot.yml`:**

  ```yaml
  version: 2
  updates:
    - package-ecosystem: npm
      directory: "/"
      schedule:
        interval: weekly
        day: monday
        time: "09:00"
        timezone: "UTC"
      open-pull-requests-limit: 5
      groups:
        astro:
          patterns:
            - "astro"
            - "@astrojs/*"
            - "astro-*"
        react:
          patterns:
            - "react"
            - "react-dom"
            - "@types/react"
            - "@types/react-dom"
        eslint:
          patterns:
            - "eslint"
            - "eslint-*"
            - "@typescript-eslint/*"
            - "astro-eslint-parser"
        tailwind:
          patterns:
            - "tailwindcss"
            - "@tailwindcss/*"
            - "prettier-plugin-tailwindcss"
        prod-minor:
          dependency-type: production
          update-types: ["minor", "patch"]
        dev-minor:
          dependency-type: development
          update-types: ["minor", "patch"]
      labels:
        - "dependencies"

    - package-ecosystem: github-actions
      directory: "/"
      schedule:
        interval: weekly
        day: monday
      labels:
        - "dependencies"
        - "github-actions"
  ```

- [ ] **5. Validate YAML parses:**

  ```bash
  python3 -c "import yaml; yaml.safe_load(open('.github/dependabot.yml'))"
  ```

- [ ] **6. Verification protocol.** Only step 6 (audit) substantively applies — and that should be unchanged.

- [ ] **7. Justification.**

- [ ] **8. Commit.**

  ```
  chore(T-13): add Dependabot configuration

  Weekly grouped updates for npm + GH Actions. Major bumps land as
  separate PRs from minor/patch. Designed to surface drift early
  without flooding the PR queue.

  Refs: docs/library-packages-upgrade/2026-04-29-upgrade-plan.md (Task T-13)

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  ```

- [ ] **9. Hand off.**

---

### Task T-14 — Modernize Husky + add ESLint to lint-staged {#task-t-14}

**Lane:** L1 · **Depends on:** T-03 · **Visual smoke:** no

**Goal:** Replace the legacy `_/husky.sh` shim with Husky v9 minimal format. Add ESLint to lint-staged so committed code is linted, not just formatted.

**Files:**
- Modify: `.husky/pre-commit`
- Modify: `package.json` (`lint-staged` block only — no version bumps)
- Optionally delete: `.husky/_/` (legacy shim directory)

**Steps:**

- [ ] **1. Preconditions.** T-03 done.
- [ ] **2. Claim.**
- [ ] **3. Worktree.** `upgrade/T-14-husky-modernize`.

- [ ] **4. Replace `.husky/pre-commit` contents** with the v9 minimal one-liner:

  ```sh
  pnpm exec lint-staged
  ```

  No shebang, no `. "$(dirname -- "$0")/_/husky.sh"`. Husky v9 reads this directly.

- [ ] **5. Update `package.json` `lint-staged` block:**

  ```json
  "lint-staged": {
      "*.{js,jsx,ts,tsx,md,mdx,json}": [
          "prettier --plugin-search-dir=. --write"
      ],
      "*.{js,jsx,ts,tsx,astro}": [
          "eslint --fix"
      ]
  }
  ```

  Use the legacy `.eslintrc.cjs` (T-23 swaps this).

- [ ] **6. Test locally:**

  ```bash
  echo "  const x = 1   ; " > /tmp/test.ts
  cp /tmp/test.ts ./scratch-test.ts
  git add scratch-test.ts
  git commit -m "test pre-commit"     # expected: prettier+eslint run, file is fixed and committed
  git reset --hard HEAD~1
  rm -f scratch-test.ts /tmp/test.ts
  ```

  Expected: pre-commit hook runs both prettier and eslint, fixes formatting, lets the commit succeed.

- [ ] **7. Optionally delete `.husky/_/`** if Husky v9 no longer references it. Verify `husky install` (run by the `prepare` script during `pnpm install`) regenerates only what's needed.

- [ ] **8. Verification protocol.** Steps 1, 4 mainly. Smoke (step 5) optional — you've already exercised the pre-commit.

- [ ] **9. Justification.**

- [ ] **10. Commit.**

  ```
  chore(T-14): modernize Husky + lint ESLint on pre-commit

  - Drops legacy _/husky.sh shim, switches to Husky v9 minimal format
  - Adds eslint --fix to lint-staged for *.{js,jsx,ts,tsx,astro}
  - Verifies pre-commit hook runs end-to-end on a scratch file

  Refs: docs/library-packages-upgrade/2026-04-29-upgrade-plan.md (Task T-14)

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  ```

- [ ] **11. Hand off.**

---

### Task T-20 — Astro 4 → 5 {#task-t-20}

**Lane:** L2 · **Depends on:** T-03, T-10, T-11, T-12, T-13, T-14 · **Visual smoke:** yes · **Largest task in Phase 2.**

**Goal:** Bump Astro and all `@astrojs/*` integrations to 5.x. Migrate content collections to the Content Layer API. Switch `<ViewTransitions />` to `<ClientRouter />`. Re-evaluate the sharp pin.

**Files:**
- Modify: `package.json` (deps)
- Modify: `astro.config.mjs`
- Modify: `src/content/config.ts`
- Modify: `src/layouts/Layout.astro` (ViewTransitions import)
- Possibly modify: `src/pages/**` (any usage of getStaticPaths with old getCollection signature)

**Steps:**

- [ ] **1. Preconditions.** T-03, T-10, T-11, T-12, T-13, T-14 all `done`.
- [ ] **2. Claim.**
- [ ] **3. Worktree.** `upgrade/T-20-astro-5`. After creating, `git pull --rebase origin main`.

- [ ] **4. Run the official Astro 5 codemod** (this auto-fixes most breaking changes):

  ```bash
  pnpm dlx @astrojs/upgrade
  ```

  Review the diff. Do not auto-accept; understand what changed.

- [ ] **5. Bump versions in `package.json`** to current stable `5.x` for these:
  - `astro`
  - `@astrojs/check`
  - `@astrojs/mdx`
  - `@astrojs/partytown`
  - `@astrojs/react`
  - `@astrojs/rss`
  - `@astrojs/sitemap`
  - `@astrojs/tailwind` — **NOTE:** if Astro 5 has dropped support for `@astrojs/tailwind`, leave it for now; T-22 removes it.
  - `@astrojs/ts-plugin`
  - `astro-expressive-code`
  - `@expressive-code/plugin-collapsible-sections`
  - `@expressive-code/plugin-line-numbers`

- [ ] **6. Reinstall.**

  ```bash
  pnpm install
  ```

- [ ] **7. Migrate `src/content/config.ts` to Content Layer API.**

  Astro 5 deprecates `type: 'content'` collections in favor of `loader` functions. Rewrite:

  ```ts
  import { SITE } from '@config';
  import { defineCollection, reference, z } from 'astro:content';
  import { glob } from 'astro/loaders';

  const blog = defineCollection({
      loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
      schema: ({ image }) =>
          z.object({
              author: z.string().default(SITE.author),
              pubDatetime: z.date(),
              modDatetime: z.date().optional().nullable(),
              title: z.string(),
              featured: z.boolean().optional(),
              draft: z.boolean().optional(),
              tags: z.array(z.string()).default(['others']),
              ogImage: image()
                  .refine(img => img.width >= 1200 && img.height >= 630, {
                      message: 'OpenGraph image must be at least 1200 X 630 pixels!',
                  })
                  .or(z.string())
                  .optional(),
              description: z.string(),
              thread: z.string().optional(),
              canonicalURL: z.string().optional(),
              relatedPosts: z.array(reference('blog')).optional(),
          }),
  });

  const tips = defineCollection({
      loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/tips' }),
      schema: () =>
          z.object({
              author: z.string().default(SITE.author),
              pubDatetime: z.date(),
              modDatetime: z.date().optional().nullable(),
              title: z.string(),
              customSlug: z.string(),
              draft: z.boolean().optional(),
          }),
  });

  export const collections = { blog, tips };
  ```

- [ ] **8. Verify `getCollection` callers still work.** In Astro 5 the entry shape changed: `entry.slug` may be `entry.id`. Run `pnpm astro check` and fix every error. Likely call sites:
  - `src/utils/getSortedCollection.ts`
  - `src/utils/collectionFilter.ts`
  - `src/utils/getPostsByTag.ts`
  - `src/pages/posts/[...slug].astro` (or similar)
  - `src/pages/tips/[...slug].astro`

  The pattern: replace `entry.slug` with `entry.id` (or the new computed slug field). Check Astro 5 release notes for the canonical migration.

- [ ] **9. Update `Layout.astro`** — replace:

  ```astro
  import { ViewTransitions } from "astro:transitions";
  ...
  <ViewTransitions />
  ```

  with:

  ```astro
  import { ClientRouter } from "astro:transitions";
  ...
  <ClientRouter />
  ```

- [ ] **10. Re-evaluate the sharp pin.** Open `package.json` `resolutions`. Try removing the `"sharp": "0.32.6"` resolution and `"sharp": "0.32.6"` from dependencies. Keep `sharp` as a dependency (Astro requires it) but unpinned (use `^0.34` or whatever is current stable). Run `pnpm install && pnpm build`. If image processing breaks, restore the pin and document.

- [ ] **11. Verify `astro.config.mjs`.** The codemod may have already updated paths. Confirm:
  - `image:` config (if any) uses the new service shape if Astro 5 changed it
  - `markdown.shikiConfig` is still valid (or moved under `markdown.syntaxHighlight`)
  - `vite.optimizeDeps.include` still references `flowbite-react` — leave this until T-24

- [ ] **12. Run full verification protocol.** Expect step 4 (build) to surface anything missed.

- [ ] **13. Visual smoke.** Required. All 9 routes plus 404. Watch carefully for:
  - Image rendering (sharp pin removed)
  - Page transitions (ClientRouter)
  - Content rendering (content layer)
  - RSS feed (`/rss.xml`)
  - Sitemap (`/sitemap-index.xml`)

- [ ] **14. Justification.** This is the most consequential task — be thorough. List every codemod change, every manual fix, and every deferred item.

- [ ] **15. Commit.**

  ```
  feat(T-20): upgrade Astro 4.4.9 → 5.x

  - Bumps astro and all @astrojs/* integrations to 5.x stable
  - Migrates content collections to Content Layer API (glob loader)
  - Switches ViewTransitions → ClientRouter
  - Unpins sharp (was 0.32.6)
  - Updates getCollection call sites for entry.id (was entry.slug)

  Refs: docs/library-packages-upgrade/2026-04-29-upgrade-plan.md (Task T-20)

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  ```

- [ ] **16. Hand off.**

**QA notes:** This task touches many files; the visual smoke comparison must be careful. Check OG image generation (`src/utils/generateOgImages.tsx`) builds without error.

---

### Task T-21 — React 18 → 19 {#task-t-21}

**Lane:** L2 · **Depends on:** T-20 · **Visual smoke:** yes

**Goal:** Bump React, react-dom, @types/react, and @astrojs/react. Audit every `.tsx` for React 19 breaking changes (refs as props, no defaultProps on function components, JSX runtime, error boundaries).

**Files:**
- Modify: `package.json` (deps)
- Possibly modify: every file in `src/components/*.tsx`

**Steps:**

- [ ] **1. Preconditions.** T-20 done.
- [ ] **2. Claim.**
- [ ] **3. Worktree.** `upgrade/T-21-react-19`. `git pull --rebase origin main`.

- [ ] **4. Bump versions:**

  ```bash
  pnpm add react@^19 react-dom@^19
  pnpm add -D @types/react@^19 @types/react-dom@^19
  pnpm add @astrojs/react@<version compatible with React 19>
  ```

- [ ] **5. Run the React 19 codemods** (best-effort; review before accepting):

  ```bash
  pnpm dlx codemod react/19/migration-recipe
  ```

  If unavailable, run individual codemods listed in the React 19 migration guide.

- [ ] **6. Audit each `.tsx`** in `src/components/` for:

  - `forwardRef` usage — React 19 makes refs a regular prop on function components. If any component uses `forwardRef` purely to accept a ref, simplify it.
  - `defaultProps` on function components — removed in React 19. Convert to default parameter values.
  - `propTypes` — removed in React 19. We're TS-only so this is unlikely to apply.
  - `useFormState` → `useActionState` — likely not used here.
  - Element-cloning patterns or `Children.map` — review.

  Files to audit: `Card.tsx`, `Datetime.tsx`, `ImageSliderClient.tsx`, `Search.tsx`, `TagsList.tsx`, `Thread.tsx`, `ThreadCard.tsx`, `TipCard.tsx`.

- [ ] **7. Update `astro.config.mjs`** if `@astrojs/react` shape changed. The `experimentalReactChildren: true` flag may have been removed or stabilized in newer versions — check release notes.

- [ ] **8. Update `tsconfig.json`** if React 19 requires `"jsx": "react-jsx"` to remain (it does) and any new `"types": ["react/canary"]` direction (unlikely needed).

- [ ] **9. Run full verification protocol.** `pnpm astro check` is the most important.

- [ ] **10. Visual smoke.** Required. Particular attention:
  - Search functionality (`Search.tsx` with Fuse.js)
  - TagsList interactivity
  - Carousel / image slider (already CSS-only since T-10)

- [ ] **11. Justification.** List every component touched and the React 19 change applied (or "no changes — already compatible").

- [ ] **12. Commit.**

  ```
  feat(T-21): upgrade React 18 → 19

  - Bumps react, react-dom, @types/react/{,-dom} to ^19
  - Bumps @astrojs/react to compatible version
  - Audits all .tsx components: <list of changes>

  Refs: docs/library-packages-upgrade/2026-04-29-upgrade-plan.md (Task T-21)

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  ```

- [ ] **13. Hand off.**

---

### Task T-22 — Tailwind 3 → 4 {#task-t-22}

**Lane:** L2 · **Depends on:** T-21 · **Visual smoke:** yes · **Highest visual-regression risk task.**

**Goal:** Migrate from Tailwind 3 (JS config + `@astrojs/tailwind` integration) to Tailwind 4 (CSS-first config + `@tailwindcss/vite` plugin).

**Files:**
- Modify: `package.json` (replace `tailwindcss`, `@astrojs/tailwind`, `prettier-plugin-tailwindcss`)
- Modify: `astro.config.mjs` (drop `tailwind()` integration, add Vite plugin)
- Modify: `src/styles/base.css` (add `@import "tailwindcss"` + `@theme` block)
- Delete: `tailwind.config.cjs`

**Steps:**

- [ ] **1. Preconditions.** T-21 done.
- [ ] **2. Claim.**
- [ ] **3. Worktree.** `upgrade/T-22-tailwind-4`. `git pull --rebase origin main`.

- [ ] **4. Capture current `tailwind.config.cjs` contents** — you'll need every theme token, plugin reference, dark-mode strategy, and content glob to port to CSS.

- [ ] **5. Run the official upgrade codemod:**

  ```bash
  pnpm dlx @tailwindcss/upgrade@latest
  ```

  Review the diff. The codemod handles most class renames (e.g. `shadow-sm` → `shadow-xs`) and migrates the config.

- [ ] **6. Adjust `package.json`:**

  ```bash
  pnpm remove tailwindcss @astrojs/tailwind
  pnpm add -D tailwindcss@^4 @tailwindcss/vite@^4
  ```

  Also bump `@tailwindcss/typography` to its v4-compatible release if available; otherwise keep it and document the gap.

- [ ] **7. Update `astro.config.mjs`:** drop the `tailwind()` import + integration. Add Vite plugin instead:

  ```js
  import tailwindcss from '@tailwindcss/vite';

  export default defineConfig({
      // ...
      vite: {
          plugins: [tailwindcss()],
          // ... existing vite config
      },
  });
  ```

- [ ] **8. Rewrite `src/styles/base.css`:**

  ```css
  @import "tailwindcss";

  @theme {
      /* Port every token from tailwind.config.cjs `theme.extend` here. */
      /* Example:
      --color-skin-base: hsl(var(--color-fill) / <alpha-value>);
      --font-mono: 'IBM Plex Mono', monospace;
      */
  }

  /* Custom variant for class-based dark mode (Tailwind 4 default is media-based) */
  @custom-variant dark (&:where(.dark, .dark *));

  /* If @tailwindcss/typography is included via @plugin: */
  @plugin "@tailwindcss/typography";

  /* Existing custom CSS rules below */
  ```

  The exact `@theme` token names follow Tailwind 4's CSS variable convention (`--color-*`, `--font-*`, `--spacing-*`, etc.) — see the Tailwind 4 migration guide.

- [ ] **9. Delete `tailwind.config.cjs`.**

- [ ] **10. Replace any `@tailwindcss/typography` JS plugin reference** with the CSS-side `@plugin` directive.

- [ ] **11. Run full verification.** Build will fail if the `@theme` tokens don't match what components expect — fix iteratively.

- [ ] **12. Visual smoke.** **Critical.** All 9 routes plus 404. Pay particular attention to:
  - Typography spacing on blog posts
  - Dark mode color tokens
  - Code blocks (Expressive Code uses Tailwind)
  - Header / footer / Card components
  - Image slider container border + radius

  Acceptable diffs: minor spacing changes from Tailwind 4's revised reset. Unacceptable: missing colors, broken typography, layout breaks.

- [ ] **13. Justification.** Document every theme token migrated, every class rename the codemod applied, and any visual diff that remains.

- [ ] **14. Commit.**

  ```
  feat(T-22): upgrade Tailwind 3 → 4 (CSS-first, drop @astrojs/tailwind)

  - Replaces tailwindcss@3 + @astrojs/tailwind with tailwindcss@4
    + @tailwindcss/vite
  - Migrates theme tokens from tailwind.config.cjs to @theme in base.css
  - Adds @custom-variant dark for class-based dark mode
  - Deletes tailwind.config.cjs
  - Visual smoke: <pass with N small diffs>

  Refs: docs/library-packages-upgrade/2026-04-29-upgrade-plan.md (Task T-22)

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  ```

- [ ] **15. Hand off.**

---

### Task T-23 — ESLint 8 → 9 {#task-t-23}

**Lane:** L2 · **Depends on:** T-12, T-22 · **Visual smoke:** no

**Goal:** Bump ESLint to 9 and all related plugins. Activate the flat config drafted in T-12. Delete `.eslintrc.cjs`.

**Files:**
- Modify: `package.json` (deps)
- Modify: `eslint.config.js` (finalize)
- Delete: `.eslintrc.cjs`

**Steps:**

- [ ] **1. Preconditions.** T-12, T-22 done.
- [ ] **2. Claim.**
- [ ] **3. Worktree.** `upgrade/T-23-eslint-9`. `git pull --rebase origin main`.

- [ ] **4. Bump versions.**

  ```bash
  pnpm add -D \
      eslint@^9 \
      @typescript-eslint/eslint-plugin@^8 \
      @typescript-eslint/parser@^8 \
      eslint-plugin-astro@^1 \
      eslint-plugin-jsx-a11y@^6 \
      astro-eslint-parser@^1 \
      @eslint/js@^9
  ```

  (Use the exact latest stable for each at the time of execution; record in justification.)

- [ ] **5. Finalize `eslint.config.js`** — port any rules deferred in T-12, validate with the new ESLint 9.

- [ ] **6. Delete `.eslintrc.cjs`.**

- [ ] **7. Run lint with auto-fix:**

  ```bash
  pnpm lint --fix
  ```

  Stage and commit any auto-fixes as part of this task's commit (not a separate one). Manually fix anything the auto-fixer can't.

- [ ] **8. Run full verification.** `pnpm lint` must exit 0.

- [ ] **9. Justification.** List every rule that auto-fixed, every manual fix, every deferred lint warning (if any) with rationale.

- [ ] **10. Commit.**

  ```
  feat(T-23): upgrade ESLint 8 → 9 (activate flat config)

  - Bumps eslint to ^9, @typescript-eslint/* to ^8, eslint-plugin-astro
    to ^1 (flat-config compatible), astro-eslint-parser to ^1
  - Activates eslint.config.js drafted in T-12
  - Deletes .eslintrc.cjs
  - Runs lint --fix; X files auto-fixed, Y manual fixes

  Refs: docs/library-packages-upgrade/2026-04-29-upgrade-plan.md (Task T-23)

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  ```

- [ ] **11. Hand off.**

---

### Task T-24 — Remove flowbite + flowbite-react {#task-t-24}

**Lane:** L2 · **Depends on:** T-10, T-11, T-23 · **Visual smoke:** no (T-10 + T-11 already covered visual)

**Goal:** Strip the now-unused flowbite dependencies and the `optimizeDeps.include` reference.

**Files:**
- Modify: `package.json`
- Modify: `astro.config.mjs`

**Steps:**

- [ ] **1. Preconditions.** T-10, T-11, T-23 done.
- [ ] **2. Claim.**
- [ ] **3. Worktree.** `upgrade/T-24-remove-flowbite`. `git pull --rebase origin main`.

- [ ] **4. Confirm no imports remain:**

  ```bash
  grep -rn "flowbite" --include="*.ts" --include="*.tsx" --include="*.astro" --include="*.js" --include="*.mjs" --include="*.css" src/
  # Expected: zero hits.
  ```

- [ ] **5. Remove the deps:**

  ```bash
  pnpm remove flowbite flowbite-react
  ```

- [ ] **6. Edit `astro.config.mjs`** — remove `flowbite-react` from `vite.optimizeDeps.include`:

  ```js
  // Before:
  include: ["flowbite-react", "fuse.js", "react", "react-dom"]
  // After:
  include: ["fuse.js", "react", "react-dom"]
  ```

- [ ] **7. Remove the pnpm peerDependencyRules block** added during T-03 (now unnecessary):

  ```json
  // Remove from package.json:
  "pnpm": {
      "peerDependencyRules": {
          "allowedVersions": {
              "react": "18",
              "react-dom": "18"
          }
      }
  }
  ```

- [ ] **8. Full verification protocol.** `pnpm install` should be clean (no peer warnings related to flowbite).

- [ ] **9. Justification.**

- [ ] **10. Commit.**

  ```
  chore(T-24): remove flowbite + flowbite-react dependencies

  All imports were already migrated in T-10 (Carousel → CSS scroll-snap)
  and T-11 (ThemeModeScript → inline pre-paint). This task removes the
  unused packages, drops the optimizeDeps reference, and cleans up the
  pnpm peer rules workaround from T-03.

  Refs: docs/library-packages-upgrade/2026-04-29-upgrade-plan.md (Task T-24)

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  ```

- [ ] **11. Hand off.**

---

### Task T-25 — Bump TypeScript toolchain {#task-t-25}

**Lane:** L2 · **Depends on:** T-24 · **Visual smoke:** no

**Goal:** Bump TS, prettier, prettier plugins, husky, lint-staged.

**Files:**
- Modify: `package.json`

**Steps:**

- [ ] **1. Preconditions.** T-24 done.
- [ ] **2. Claim.**
- [ ] **3. Worktree.** `upgrade/T-25-ts-toolchain`. `git pull --rebase origin main`.

- [ ] **4. Bump:**

  ```bash
  pnpm add -D \
      typescript@latest \
      prettier@latest \
      prettier-plugin-astro@latest \
      prettier-plugin-tailwindcss@latest \
      husky@latest \
      lint-staged@latest
  ```

- [ ] **5. Run formatter pass:**

  ```bash
  pnpm format
  ```

  Stage and include any auto-format diffs in this task's commit.

- [ ] **6. Verify `tsconfig.json` still parses with the new TS:**

  ```bash
  pnpm astro check
  ```

  If TS' new strictness flags an existing issue, decide: fix it now, or document the deferral.

- [ ] **7. Full verification protocol.**

- [ ] **8. Justification.**

- [ ] **9. Commit.**

  ```
  build(T-25): bump TypeScript toolchain (TS, prettier, husky, lint-staged)

  - typescript@latest, prettier@latest, prettier plugins, husky, lint-staged
  - Re-formats codebase with new prettier defaults
  - astro check passes under new TS

  Refs: docs/library-packages-upgrade/2026-04-29-upgrade-plan.md (Task T-25)

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  ```

- [ ] **10. Hand off.**

---

### Task T-26 — Bump content/build deps {#task-t-26}

**Lane:** L2 · **Depends on:** T-25 · **Visual smoke:** no (covered by T-30)

**Goal:** Bring remaining build/content deps to current stable.

**Files:**
- Modify: `package.json`

**Targets:**
- `satori`
- `@resvg/resvg-js`
- `fuse.js`
- `github-slugger`
- `@types/github-slugger`
- `remark-toc`
- `remark-collapse`
- `sharp` (re-evaluate; T-20 may have already unpinned)
- `@divriots/jampack`

**Steps:**

- [ ] **1. Preconditions.** T-25 done.
- [ ] **2. Claim.**
- [ ] **3. Worktree.** `upgrade/T-26-content-deps`. `git pull --rebase origin main`.

- [ ] **4. Bump in groups, validating after each:**

  ```bash
  # OG image generation chain
  pnpm add satori@latest @resvg/resvg-js@latest
  pnpm build   # validate generateOgImages.tsx still works

  # Site search
  pnpm add fuse.js@latest
  pnpm build && pnpm dev   # validate Search component

  # Slug generation
  pnpm add github-slugger@latest
  pnpm add -D @types/github-slugger@latest
  pnpm build

  # Markdown plugins
  pnpm add remark-toc@latest remark-collapse@latest
  pnpm build   # validate ToC + collapse rendering on a post

  # Sharp — only if not already current after T-20
  pnpm add sharp@latest
  pnpm build   # critical: image processing

  # Build optimizer
  pnpm add -D @divriots/jampack@latest
  pnpm build   # validate dist optimization runs without error
  ```

- [ ] **5. Full verification protocol** at the end.

- [ ] **6. Justification.** List each dep, the version bump (X.Y → X'.Y'), and whether the build had to be tweaked.

- [ ] **7. Commit.**

  ```
  build(T-26): bump content/build dependencies to current stable

  - satori, @resvg/resvg-js, fuse.js, github-slugger, remark-toc,
    remark-collapse, sharp, @divriots/jampack
  - All validated via pnpm build (OG image gen, search, ToC, image
    processing, dist optimization)

  Refs: docs/library-packages-upgrade/2026-04-29-upgrade-plan.md (Task T-26)

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  ```

- [ ] **8. Hand off.**

---

### Task T-27 — Bump GitHub Actions versions {#task-t-27}

**Lane:** L2 · **Depends on:** T-26 · **Visual smoke:** no (deploy validates in T-31)

**Goal:** Bump pinned GitHub Action versions and verify the workflow still parses.

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Modify: `.github/workflows/ci.yml`

**Steps:**

- [ ] **1. Preconditions.** T-26 done.
- [ ] **2. Claim.**
- [ ] **3. Worktree.** `upgrade/T-27-actions`. `git pull --rebase origin main`.

- [ ] **4. Check for newer major versions:**
  - `actions/checkout` (currently `@v4`)
  - `actions/setup-node` (`@v4`)
  - `actions/deploy-pages` (`@v4`)
  - `withastro/action` (`@v4`)

  Pin to whichever is current latest stable. Do NOT pin to a SHA unless the user has previously requested SHA-pinning.

- [ ] **5. Verify YAML still parses:**

  ```bash
  python3 -c "import yaml; [yaml.safe_load(open(f)) for f in ['.github/workflows/deploy.yml', '.github/workflows/ci.yml']]"
  ```

- [ ] **6. Full verification protocol.** No deploy here — T-31 owns deploy validation.

- [ ] **7. Justification.**

- [ ] **8. Commit.**

  ```
  build(T-27): bump GitHub Actions to current stable

  - actions/checkout, actions/setup-node, actions/deploy-pages, withastro/action

  Refs: docs/library-packages-upgrade/2026-04-29-upgrade-plan.md (Task T-27)

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  ```

- [ ] **9. Hand off.**

---

### Task T-30 — End-to-end verification & visual diff {#task-t-30}

**Lane:** validation · **Depends on:** T-27 · **Visual smoke:** yes

**Goal:** Confirm the integrated state of `main` (after all approved branches are merged) still meets every success criterion. Produce a verification report.

**This task does not normally produce a code commit.** It produces `docs/library-packages-upgrade/verification-report.md`. If verification fails, file defects against the relevant prior task and pause Phase 3 until those are fixed.

**Steps:**

- [ ] **1. Preconditions.** T-27 done. All previous tasks `done`. Local `main` is up-to-date with origin.
- [ ] **2. Claim.** This task doesn't strictly need a worktree (the report is the only artifact), but if the agent wants safety, use `upgrade/T-30-final-verification`.

- [ ] **3. Run the full verification protocol on `main`** — capture output.

- [ ] **4. Visual smoke.** Walk all 9 routes plus 404. Capture screenshots at the same viewport (1280×800) as T-00. Compare each to `baseline/<route>.png`.

  Compose findings in `docs/library-packages-upgrade/verification-report.md`:

  ```markdown
  # End-to-End Verification Report

  **Date:** <UTC>
  **Operator:** <agent>
  **Commit verified:** <main SHA>

  ## Verification protocol results
  ... (paste outputs)

  ## Visual diff summary
  | Route | Baseline | Current | Status | Notes |
  |---|---|---|---|---|
  | / | 01-home.png | qa-runs/T-30-.../01-home.png | match / minor diff / regression | ... |

  ## Success criteria check (design §1)
  - [ ] 1. pnpm install --frozen-lockfile succeeds
  - [ ] 2. pnpm astro check 0 errors
  - ...

  ## Risks accepted
  ## Open follow-ups
  ```

- [ ] **5. If any criterion fails:** STOP. File defects against the responsible prior task (e.g. `T-22-D2`). Do not proceed to T-31.

- [ ] **6. If all pass:** commit only the verification report. Set `T-30.status: done`.

  ```
  chore(T-30): end-to-end verification report

  All 8 success criteria pass on commit <SHA>. Visual smoke: all 10
  routes match baseline within tolerance. Audit: <X new findings vs
  baseline / no new findings>.

  Refs: docs/library-packages-upgrade/2026-04-29-upgrade-plan.md (Task T-30)

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  ```

- [ ] **7. Hand off to T-31.**

---

### Task T-31 — Deploy & live smoke {#task-t-31}

**Lane:** validation · **Depends on:** T-30 · **Visual smoke:** yes

**Goal:** Watch the deploy workflow succeed; smoke-test the live site.

**Steps:**

- [ ] **1. Preconditions.** T-30 done.

- [ ] **2. Trigger deploy.** Either: the merge to `main` already triggered `deploy.yml`; or run `gh workflow run deploy.yml` manually.

- [ ] **3. Watch the workflow:** `gh run watch` until it completes. Expected: green.

- [ ] **4. Live smoke.** Once deployed, fetch each route from production (`https://eliotik.github.io/...`) and check 200 status. Manually visit and visually verify in a browser.

  ```bash
  for path in "/" "/posts" "/tips" "/tags" "/threads" "/about" "/rss.xml" "/sitemap-index.xml"; do
    code=$(curl -s -o /dev/null -w "%{http_code}" "https://eliotik.github.io${path}")
    echo "${path}: ${code}"
  done
  # Expected: 200 for all.
  ```

- [ ] **5. Update the verification report** to note successful deploy and timestamp.

- [ ] **6. Set `T-31.status: done`.** No code commit; only `backlog.yaml` change.

  ```
  chore(T-31): deploy & live smoke

  Deploy workflow run #<n> succeeded. All 8 routes return 200 from
  production. Theme toggle, search, image slider, RSS, sitemap all
  verified live.

  Refs: docs/library-packages-upgrade/2026-04-29-upgrade-plan.md (Task T-31)

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  ```

- [ ] **7. Report:** "Upgrade campaign complete. All 19 tasks `done`. Production verified."

---

## 5. Self-Review (run after writing this plan)

**Spec coverage check (against design §1, §2, §4):**
- Astro 4 → 5 → covered by T-20.
- React 18 → 19 → T-21.
- Tailwind 3 → 4 → T-22.
- ESLint 8 → 9 (flat config) → T-12 + T-23.
- Node 18 → 22 → T-02.
- Yarn 1 → pnpm → T-03.
- Replace flowbite → T-10 (Carousel), T-11 (ThemeModeScript), T-24 (deps removed).
- Other deps to current → T-25 (TS toolchain), T-26 (content/build deps), T-27 (Actions).
- PR validation gate → T-01.
- Dependabot → T-13.
- Husky modernization → T-14 + T-03 (pnpm exec).
- Audit step → folded into T-01 (CI step) + T-00 (baseline).

**Placeholder scan:**
- One intentional `<task-id>` template fragment in `_TEMPLATE.md` files — that's the placeholder in a template; correct.
- One intentional `<version>` in T-03 step 5 — agent fills in at runtime; acceptable.
- T-26 step 4 lists "or whatever is current stable" — acceptable for content/build minor bumps where exact versions move continuously; agents resolve via `pnpm add @latest`.

**Type / signature consistency:**
- `entry.slug` → `entry.id` rename appears once in T-20 step 8; I noted this is the migration direction. Future tasks don't reuse the old name.
- "ImageSliderClient" component signature unchanged across T-10 / T-21 / T-22.
- `getCollection` calling convention referenced consistently in T-20.

**Workflow consistency:**
- Every task includes the same 11-step skeleton (preconditions → claim → worktree → work → verify → smoke → justification → commit → hand-off).
- Every commit message uses Conventional Commits with `(<task-id>)` scope.
- Every task references this plan + its task ID in the commit body.

**Issues found and fixed inline:** none. (Self-review pass complete.)

---

## 6. Execution

Two options:

**1. Subagent-Driven (recommended).** Use `superpowers:subagent-driven-development`. The Orchestrator (per `agent-prompts/orchestrator.md`) dispatches Dev → QA per task; runs as a self-paced `/loop` until backlog drains. Defects automatically reroute to Dev.

**2. Inline.** Use `superpowers:executing-plans`. The user/agent walks tasks one at a time in this session, invoking Dev and QA agents manually.

For an upgrade of this scope, **option 1** is strongly recommended.
