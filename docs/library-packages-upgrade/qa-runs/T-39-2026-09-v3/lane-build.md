# T-39 Task 8 v3: QA lane "build" (final local verification)

- **Verdict: PASS.** Every gate command exited 0. The shared preview is up and answers `200` on `http://localhost:4321/`, and the page it serves is byte-identical to the `dist/index.html` just built.
- **Repo / HEAD:** `/Users/ap/development/other/eliotik.github.io` @ `9eb1ec391aedca5a7ad615f37d53568f0a0f2aa0` (branch `upgrade/2026-09`). This tree includes Task 17 (post og:image fix), Task 17b (Tailwind `source('..')`) and Task 17c (CLAUDE.md note).
- **Toolchain:** Node `v22.23.3` (from `.nvmrc`, via `nvm use --silent`), pnpm `10.34.5` (from `packageManager`).
- **Run window:** 2026-09-24, about 18:48–18:58 UTC.
- **Measured fresh:** every value in this report was measured in this run, including the registry queries (18:55Z). Nothing was carried over from v2.
- **Output capture:** gate commands ran through `rtk proxy` with output sent to a file. Exit codes were read with `cmd > log 2>&1; echo "exit=$?"`, with no pipe in between (the shell is zsh).
- **Files touched:** no tracked file was modified.
  - `pnpm-lock.yaml` has sha256 `cb7f0f7010ac…d8d6aea1` both before and after the whole lane.
  - `git status --porcelain` shows only `?? .claude/`, `?? .serena/` and `?? docs/library-packages-upgrade/qa-runs/T-39-2026-09-v3/`.
  - `git diff --stat` is empty.
  - No worktrees were created (`git worktree list` shows only the main checkout).

## Artifacts

| File | Content |
|---|---|
| `qa-runs/T-39-2026-09-v3/build.log` | Full `pnpm build` output (1014 lines) |
| `qa-runs/T-39-2026-09-v3/stack.txt` | `node -v`, `pnpm -v`, `pnpm list --depth 0` |
| `qa-runs/T-39-2026-09-v3/peers.txt` | The `--resolution-only` peer block (sed extract, verbatim) and its comparison with the baseline |
| `qa-runs/T-39-2026-09-v3/outdated.txt` | `pnpm outdated` as a table and as JSON, the TS-cap evidence, the `@types/node` R27 evidence, and a fresh registry cross-check of all 40 direct dependencies |
| `qa-runs/T-39-2026-09-v3/lane-build.md` | This report |

Scratch logs, not in the repo, are in `/private/tmp/claude-501/-Users-ap-development-other-eliotik-github-io/917b6b41-1b79-43b6-8c59-b21d1efcf946/scratchpad/t8v3/build-lane/`:
- Gate and lint: `daemon-status-before.log`, `clean-check.txt`, `install.log`, `check.log`, `lint.log`, `format.log`, `eslint.json`, `prettier-listdiff.txt`
- Peers: `peers-full.log`, `peers-block.txt`, `peers-verbatim.txt`, `peers-lock-sha.txt`, `peers-context.txt`
- Outdated and registry: `outdated-raw.log`, `outdated.json`, `registry-crosscheck.mjs`, `registry-crosscheck.txt` (with dist-tags), `ts-cap.txt`, `ts-peer-scan.txt`, `peer-scan.cjs`, `types-node-cap.txt`, `types-node-peers.txt`, `types-node-versions.json`
- Preview and sanity checks: `preview-start.log`, `preview-smoke.txt`, `og-sha.txt`, `og-urls.txt`, `og-image-check.txt`, `lock-sha-before.txt`

## Checks

| # | Check | Result | Evidence |
|---|---|---|---|
| B0 | Ports 4321-4340 free, no stray daemons | PASS | `lsof -iTCP:4321-4340 -sTCP:LISTEN` exited 1 with no output at the start (18:48:34Z) and again just before the preview started (18:56:46Z). `pnpm astro preview status` reported "No preview server is running." and `pnpm astro dev status` reported "No dev server is running." (both exit 0). No `stop` was needed. |
| B1 | Clean tree | PASS | After `rm -rf node_modules .astro dist`, `ls -d node_modules .astro dist` reports "No such file or directory" for all three. |
| B2 | `pnpm install --frozen-lockfile` | PASS (exit 0) | Output: "Lockfile is up to date, resolution step is skipped", `Packages: +719`, "Done in 2.1s using pnpm v10.34.5". `grep -iE 'warn\|peer\|deprecat\|error\|ignored\|build script'` finds nothing (exit 1). The 40 listed direct versions match `package.json` and `stack.txt`. |
| B3 | `pnpm astro check` | PASS (exit 0) | `Result (77 files): - 0 errors - 0 warnings - 0 hints` |
| B4 | `pnpm lint` (`eslint .`) | PASS (exit 0) | No diagnostics; the output is only the script banner. Coverage: `pnpm exec eslint . -f json` exits 0 and linted **74 files** (34 `.astro`, 27 `.ts`, 11 `.tsx`, 1 `.js`, 1 `.mjs`) with **0 errors, 0 warnings, 0 fatal, and 0 deprecated-rule usages**. |
| B5 | `pnpm format:check` (`prettier --check .`) | PASS (exit 0) | "All matched files use Prettier code style!" `prettier . --list-different` prints 0 lines (exit 0). Under R22, all 34 tracked `.astro` files are within Prettier's scope: `prettier --file-info` reports none of them as ignored. |
| B6 | `pnpm build` (`astro check && astro build && jampack ./dist`) | PASS (exit 0, 23 s) | See "Build detail" below. |
| B7 | Stack snapshot | PASS | `stack.txt` records node v22.23.3, pnpm 10.34.5, and 40 direct packages (19 dependencies, 21 devDependencies). Each resolved version matches its `package.json` spec: exact pins are exact, and the 7 caret specs resolve to registry latest. `pnpm list` exited 0. |
| B8 | Peer check (R11) | PASS | `pnpm install --resolution-only` on a `mktemp -d` scratch copy exited 0. The lane pipeline was also run verbatim, and its output was identical apart from the "Done in" timing. The scratch lockfile sha256 was `cb7f0f70…d8d6aea1` before and after, the same as the repo lockfile. Both scratch dirs were removed. **No new unmet peer.** See "Peers" below. |
| B9 | `pnpm outdated`: at latest except for the caps | PASS | It lists exactly two packages: `@types/node (dev) 22.20.4 → 26.6.2` (the **R27** cap) and `typescript (dev) 6.0.3 → 7.0.2` (the peer-range cap). Both caps were re-proven today; see below. `pnpm outdated` exits 1 **by design** whenever it lists anything, and the TS cap means it always lists something. The lane judges this step by what it lists. A fresh, independent registry cross-check (npm registry JSON, 18:55:08Z) found **38/40 direct dependencies at registry `latest`**, and the other 2 are exactly these two. **0 deprecated** (installed or latest). |
| B10 | Shared preview up on 4321 | PASS | `pnpm astro preview --port 4321` exited 0 with "Preview server running at http://localhost:4321 (pid 3520)". The first poll of `curl http://localhost:4321/` returned `200` (remote_ip `::1`). `astro preview status` reports "running … (pid 3520, … background)" (exit 0). The served `/` has sha256 `cccfac2e…015421b5`, identical to `dist/index.html`, and carries `<meta name="generator" content="Astro v7.3.5">`. `astro preview logs` contains only "astro v7.3.5 ready in 4 ms". The preview is **left running** for the other lanes. |

### Build detail (B6)

- The embedded `astro check` reports `Result (77 files): - 0 errors - 0 warnings - 0 hints` (build.log lines 9–12).
- The build log shows `[build] output: "static"`, then `[build] 127 page(s) built in 12.65s` and `[build] Complete!` (lines 17, 331–332).
- jampack PASS 2 ended with `✔ 308 files | 48.97 MB → 46.13 MB | -2.85 MB` (line 992), and the summary ends with `✔ No issues` (line 1014).
- `dist/` holds 362 files, 130 of them `.html`. This is the same as v1 and v2.
  - `dist/~partytown/` contains `partytown.js`, `partytown-sw.js`, `partytown-sandbox-sw.html`, `partytown-atomics.js` and `partytown-media.js`.
  - The custom sitemap endpoints are present: `sitemap-index.xml` plus 5 sub-sitemaps (pages, posts, tags, threads, tips).
  - `rss.xml` and `robots.txt` are present.
- **The Task 17b Tailwind restriction is in the shipped CSS.**
  - `src/styles/base.css` line 1 (the only file in `src/styles/`) is `@import 'tailwindcss' source('..');`.
  - `dist/_astro/Footer.BnrdipP9.css` is **63291 B**, exactly the post-17b size in the ledger (it was 98690 B before 17b).
  - The other CSS assets are `ec.s4b1i.css` 24428 B, `index.C0tC3-oh.css` 8921 B and `Tips.i4aH78fP.css` 13295 B.
- **Warnings:** there are exactly 9 `[WARN]` lines. All 9 are `[vite] [MODULE_LEVEL_DIRECTIVE] … "use astro:head-inject" in "src/content/blog/<slug>.mdx?astroPropagatedAssets"`, one per `.mdx` post; `ls src/content/blog/*.mdx` counts 9. This is the known, parked Task 4 item (Astro 7 + Rolldown upstream) and is unchanged from v1/v2. **No other warning or error types appear.** `grep -niE 'warn|error|✘|✕|fail|deprecat'` matches only these 9 lines plus the "0 errors / 0 warnings" lines from check.

### Peers (B8), compared with the baseline block at the top of `baseline/2026-09/gate.txt`

| Baseline item | Now | Class |
|---|---|---|
| `@divriots/jampack 0.34.1 > quicklink 2.3.0 > react/react-dom@^16.8.0` (found 19.2.8) | Same path, found 19.3.0 | SAME: transitive and predates the branch. It is locked upstream, as re-checked in the registry today: jampack latest is 0.34.1 and declares `quicklink ^2.3.0`, and quicklink 2.3.0 is the newest 2.x (peers `^16.8.0`). Only quicklink 3.x (latest 3.0.2, peers `^16.8.0 \|\| ^17 \|\| ^18 \|\| ^19`) accepts React 19. |
| `astro 6.2.1 > tsconfck 3.1.6 > typescript@^5.0.0` | absent | GONE: `tsconfck` has 0 matches in `pnpm-lock.yaml`. |
| `astro-eslint-parser 3.0.0 > … > @napi-rs/wasm-runtime 1.2.0 > @emnapi/runtime@^2.0.0-alpha.3` | absent | GONE: the lockfile has only `@napi-rs/wasm-runtime@1.2.4`, whose peers are `^1.7.1 \|\| ^2.0.0-alpha.4`. |
| `eslint-plugin-jsx-a11y 6.10.2 > eslint@^3..^9` | absent | GONE: the package was replaced by `eslint-plugin-jsx-a11y-x`, and there are 0 `eslint-plugin-jsx-a11y@` entries in the lockfile. |
| (none) | (none) | **NEW: none** |

Deprecated packages dropped from 4 in the baseline to **1**:
- Now: only `whatwg-encoding@2.0.0` (transitive).
- `pnpm why` traces it through jampack 0.34.1 > `@divriots/cheerio@1.0.0-rc.12` > `encoding-sniffer@0.0.2`, which declares `^2.0.0`.
- 2.0.0 is the only 2.x ever published; the next release is 3.0.0. So it can't be fixed within the declared ranges.

### TypeScript cap (B9), re-checked against the registry today

| Fact | Value |
|---|---|
| `typescript` dist-tags | `latest=7.0.2`, `rc=7.0.1-rc`, `next=7.1.0-dev.20260924.1` |
| Stable releases | The 6.x line has `6.0.2` and `6.0.3`; the installed 6.0.3 is the highest, and no 6.0.4 or 6.1.x exists. The only 7.x stable is `7.0.2`. |
| `@typescript-eslint/eslint-plugin@latest` (8.70.1 = installed) | `peerDependencies.typescript = ">=4.8.4 <6.1.0"` |
| `@typescript-eslint/parser@latest` (8.70.1 = installed) | `peerDependencies.typescript = ">=4.8.4 <6.1.0"` |
| `typescript-eslint@latest` (8.70.1) | `">=4.8.4 <6.1.0"`. The `canary` 8.70.2-alpha.7, published today at 07:2xZ, has the same range for all three packages. |
| `@astrojs/check@latest` (0.9.10 = installed) | `peerDependencies.typescript = "^5.0.0 \|\| ^6.0.0"` |
| Every `peerDependencies.typescript` in the installed tree | 7 `@typescript-eslint/*@8.70.1` packages declare `>=4.8.4 <6.1.0`, `@astrojs/check@0.9.10` declares `^5.0.0 \|\| ^6.0.0`, `@volar/kit@2.4.28` declares `*` and `ts-api-utils@2.5.0` declares `>=4.8.4`. |
| `semver.satisfies` (semver 7.8.5) | 7.0.2 is false for the two tight ranges; 6.0.3 is true for all of them. |

TS 7.0.2 violates both tight ranges even at the latest (and canary) registry versions. So 6.0.3 is the highest allowed version, and the cap is valid.

### `@types/node` cap (B9): a ruled exception (R27), not a peer-range cap

| Fact | Value |
|---|---|
| Ruling | **R27** in `global-constraints.md` (Phase 2 rulings, binding, and they supersede earlier rulings): "Add explicit devDependency `@types/node` pinned exactly to the latest 22.x (matches the Node 22 runtime)." `.github/dependabot.yml:81-83` ignores semver-major updates of `@types/node` for the same reason. |
| Installed / spec | `22.20.4` / `22.20.4` (exact) |
| Latest 22.x, re-checked today | `semver.maxSatisfying(all 2373 published, '^22')` = **22.20.4** (published 2026-09-19). No 22.20.5 exists. The registry also tags 22.20.4 as `old-version`. The pin is exactly the latest 22.x, so R27 is satisfied. |
| Registry latest | 26.6.2. The newest 24.x is 24.13.6 and the newest 25.x is 25.9.8. |
| Runtime | `engines.node` 22.23.3, `.nvmrc` 22.23.3, `node -v` v22.23.3. `nvm ls-remote v22` marks v22.23.3 as "Latest LTS: Jod". |
| Peer declarations on `@types/node` in the installed tree | Only `vite@8.3.0`: `^20.19.0 \|\| >=22.12.0` (optional). It accepts both 26.6.2 and 22.20.4. |

To be precise: **no peer range forbids `@types/node` 26.x.** The cap is a runtime-typing decision (types for the Node 22 runtime), and R27 is what rules it in. The lane's Step 5 text names only typescript as an exception. Because R27 is binding under the lane's own Environment section, and R16 exists so that QA does not re-fail ruled items, this is recorded as PASS with the ruling cited, as in v2. See observation 1.

## Observations (not failures)

1. **The lane text and the rulings still don't match on `@types/node`.** Step 5 says "EVERY package must be at registry latest except typescript". R27 separately pins `@types/node` to the latest 22.x.
   - The branch follows R27 exactly: 22.20.4 is the max of `^22`, re-verified at 18:55Z.
   - v2 raised the same point; the lane template still omits R27.
2. **"Every command exited 0" has to be read in scope.** `pnpm outdated` exits 1 whenever it lists anything, and the lane itself requires typescript to be listed, so a 0 exit is impossible there. The exit-0 criterion therefore applies to:
   - the gate commands: install, check, lint, format:check, build
   - `pnpm list`
   - the `--resolution-only` peer run
   - the preview start

   All of these exited 0. `pnpm outdated` is judged by what it lists (B9).
3. **Registry drift since v2 (16:34Z) is none for direct dependencies.** Four registry entries were modified today; none of the changes adds a stable release this branch lacks:
   - astro 7.3.5 (09:15Z) and astro-eslint-parser 3.2.0 (13:19Z) are both already installed.
   - The `@typescript-eslint/*` "modified" timestamps (07:2xZ) come only from the canary `8.70.2-alpha.7`.
   - The typescript timestamp (08:17Z) comes only from the nightly `7.1.0-dev.20260924.1`.
4. **The preview binds only to IPv6 loopback, as it did in v1 and v2.** lsof shows `node 3520 ap 17u IPv6 … TCP localhost:rwhois (LISTEN)`. `rwhois` is the `/etc/services` name for port 4321 (`rwhois 4321/tcp`).
   - `http://localhost:4321/` and `http://[::1]:4321/` return 200.
   - `http://127.0.0.1:4321/` fails with curl exit 7 (connection refused).
   - **Other lanes must use `localhost`, not `127.0.0.1`.** This is Astro's default `host: localhost` on macOS, not a defect.
5. **Preview smoke test.** These all return 200 with the expected content type:
   - Pages: `/`, `/posts/`, both carousel posts, `/search/`, `/tags/`, `/tags/engineering-management/`, `/tips/`, `/threads/`, `/about/`
   - Feeds and images: `/rss.xml` (text/xml), `/sitemap-index.xml` (text/xml), `/robots.txt` (text/plain), `/og.png` (image/png), `/posts/audio-vs-paper-books/index.png` (image/png)
   - Partytown assets: `/~partytown/partytown.js`, `/~partytown/partytown-sw.js`, `/~partytown/partytown-sandbox-sw.html`

   An unknown route returns 404.
6. **OG hashes on this build (input for Step 8, owned by another lane).**
   - `dist/og.png` has sha256 `ae6c9aa406da0d27944d155e4e9ec5fe8a92116b2f78d9897fe14697749e8902`, the value Task 6 accepted.
   - `dist/posts/audio-vs-paper-books/index.png` has sha256 `951f184b268e003e34c26b90e7109b07c988969269b38a0e3892e668c5838660`, which matches `baseline/2026-09/og/sha256.txt`.
7. **The Task 17 og:image fix is present (sanity only; the site-wide lane owns it).** The `dist/posts/*/index.html` files have 29 distinct `og:image` URLs:
   - 28 are `…/posts/<slug>/index.png`, one per post.
   - The other is the site default `novifyx-og.jpg`, used by the pagination pages.
   - All 29 return 200 on the preview.
8. **The Phase 2 invariants are present in the served build.**
   - R28: `dist/posts/octoprint-prusa-core-one-raspberry-pi/index.html` contains `sandboxParent:"html"` and `data-astro-transition-persist="gtag-src"` / `"gtag-init"`. This lane only checked that they are present; behaviour is verified by other lanes.
   - R23: `sitemap` appears 0 times in `package.json`.
9. **Compared with v2 (63efd08):**
   - Install is unchanged at `+719` packages.
   - Page, file and warning counts are unchanged: 127 pages, 362 files, 130 html, 308 jampack files, 9 MODULE_LEVEL_DIRECTIVE warnings.
   - jampack totals went from 49.01→46.16 MB to 48.97→46.13 MB (about −40 KB input). This matches Task 17b removing about 35 KB of unused Footer CSS.
10. **Method notes.**
    - Step 4's `mktemp -d` run removed its dir itself; `ls -d` confirms it is gone.
    - A second, verbatim rerun of the lane pipeline was blocked before it ran. A Claude Code safety check refuses `rm -rf "$D"` when `D` comes from `$(mktemp -d)` in the same command. Because that command never executed, it created nothing and left nothing behind. The rerun was done in a fixed scratch dir under the session scratchpad instead, and that dir was removed by its literal path. The output was identical to the first run's sed extract.
    - The full unfiltered peer output is kept in `peers-full.log`, so the deprecation line above the sed range is on record.
11. **Preview lifecycle.** The daemon (pid 3520) was started from `/Users/ap/development/other/eliotik.github.io`. The controller should stop it with `pnpm astro preview stop` from that directory; `pkill -f` does not match it.
