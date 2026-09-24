# T-39 Task 8 v2: QA lane "build" (final local verification)

- **Verdict: PASS.** Every gate command exited 0. The shared preview is up and answers `200` on `http://localhost:4321/`, and the page it serves is byte-identical to the `dist/index.html` just built.
- **Repo / HEAD:** `/Users/ap/development/other/eliotik.github.io` @ `63efd0867a0ba7fa14759fe98cfe0d1b363ce7a5` (branch `upgrade/2026-09`).
- **Toolchain:** Node `v22.23.3` (from `.nvmrc`, via `nvm use --silent`), pnpm `10.34.5` (from `packageManager`).
- **Run window:** 2026-09-24, about 16:27–16:37 UTC.
- **Output capture:** every command ran through `rtk proxy` so the output is raw. Exit codes were read with `cmd > log 2>&1; echo $?`, with no pipes in between.
- **Files touched:** no tracked file was modified. `pnpm-lock.yaml` has sha256 `cb7f0f70…d6aea1` both before and after the whole lane. `git status --porcelain` shows only `?? .claude/`, `?? .serena/` and `?? docs/library-packages-upgrade/qa-runs/T-39-2026-09-v2/`, and `git diff --stat` is empty.

## Artifacts

| File | Content |
|---|---|
| `qa-runs/T-39-2026-09-v2/build.log` | Full `pnpm build` output (1014 lines) |
| `qa-runs/T-39-2026-09-v2/stack.txt` | `node -v`, `pnpm -v`, `pnpm list --depth 0` |
| `qa-runs/T-39-2026-09-v2/peers.txt` | The `--resolution-only` peer block (sed extract, verbatim) and its comparison with the baseline |
| `qa-runs/T-39-2026-09-v2/outdated.txt` | `pnpm outdated` as a table and as JSON, the TS-cap evidence, the `@types/node` R27 evidence, and a registry cross-check of all 40 direct dependencies |
| `qa-runs/T-39-2026-09-v2/lane-build.md` | This report |

Scratch logs, not in the repo, are in `/private/tmp/claude-501/-Users-ap-development-other-eliotik-github-io/917b6b41-1b79-43b6-8c59-b21d1efcf946/scratchpad/t8v2/build-lane/`:
- `daemon-status-before.log`, `install.log`, `check.log`, `lint.log`, `format.log`, `eslint.json`, `prettier-listdiff.txt`
- `peers-full.log`, `peers-block.txt`
- `outdated-raw.log`, `outdated.json`, `ts-cap.txt`, `types-node-cap.txt`, `types-node-peers.txt`, `types-node-versions.json`, `direct.tsv`, `registry-crosscheck.tsv`
- `preview-start.log`, `preview-smoke.txt`, `lock-sha-before.txt`

## Checks

| # | Check | Result | Evidence |
|---|---|---|---|
| B0 | Ports 4321-4340 free, no stray daemons | PASS | `lsof -iTCP:4321-4340 -sTCP:LISTEN` exited 1 with no output, both at the start and again just before the preview started. `pnpm astro preview status` reported "No preview server is running." and `pnpm astro dev status` reported "No dev server is running." (both exit 0). No `stop` was needed. |
| B1 | Clean tree | PASS | After `rm -rf node_modules .astro dist`, `ls -d node_modules .astro dist` reports "No such file or directory" for all three. |
| B2 | `pnpm install --frozen-lockfile` | PASS (exit 0) | Output: "Lockfile is up to date, resolution step is skipped", `Packages: +719`, "Done in 2.2s using pnpm v10.34.5". `grep -iE 'warn\|peer\|deprecat\|error\|ignored\|build script'` finds nothing (exit 1). The 40 listed direct versions match `stack.txt`. |
| B3 | `pnpm astro check` | PASS (exit 0) | `Result (77 files): - 0 errors - 0 warnings - 0 hints` |
| B4 | `pnpm lint` (`eslint .`) | PASS (exit 0) | No diagnostics; the output is only the script banner. Coverage: `pnpm exec eslint . -f json` exits 0 and linted **74 files** (34 `.astro`, 27 `.ts`, 11 `.tsx`, 1 `.js`, 1 `.mjs`) with **0 errors, 0 warnings, 0 fatal, and 0 deprecated-rule usages**. |
| B5 | `pnpm format:check` (`prettier --check .`) | PASS (exit 0) | "All matched files use Prettier code style!" `prettier . --list-different` prints 0 lines (exit 0). Under R22, all 34 tracked `.astro` files are within Prettier's scope: `prettier --file-info` reports none of them as ignored. |
| B6 | `pnpm build` (`astro check && astro build && jampack ./dist`) | PASS (exit 0, 24 s) | See "Build detail" below. |
| B7 | Stack snapshot | PASS | `stack.txt` records node v22.23.3, pnpm 10.34.5, and 40 direct packages (19 dependencies, 21 devDependencies). Each resolved version matches its `package.json` spec. `pnpm list` exited 0. |
| B8 | Peer check (R11) | PASS | `pnpm install --resolution-only` on a `mktemp -d` scratch copy exited 0. The scratch lockfile sha256 was `cb7f0f70…d6aea1` before and after, the same as the repo lockfile. The scratch dir was removed afterwards. **No new unmet peer.** See "Peers" below. |
| B9 | `pnpm outdated`: at latest except for the caps | PASS | It lists exactly two packages: `typescript (dev) 6.0.3 → 7.0.2` (the peer-range cap, proven below) and `@types/node (dev) 22.20.4 → 26.6.2` (the **R27** cap, not a peer-range cap; see below). `pnpm outdated` exits 1 **by design** whenever it lists anything, and the TS cap means it always lists something. The lane judges this step by what it lists. An independent registry cross-check found **38/40 direct dependencies at registry latest**, and the other 2 are exactly these two. **0 deprecated** (installed or latest). |
| B10 | Shared preview up on 4321 | PASS | `pnpm astro preview --port 4321` exited 0 with "Preview server running at http://localhost:4321 (pid 18132)". The first poll of `curl http://localhost:4321/` returned `200` (remote_ip `::1`). `astro preview status` reports "running … (pid 18132, … background)". The served `/` has sha256 `d838393d…216389`, identical to `dist/index.html`, and carries `<meta name="generator" content="Astro v7.3.5">`. `astro preview logs` contains only "astro v7.3.5 ready in 4 ms". The preview is **left running** for the other lanes. |

### Build detail (B6)

- The embedded `astro check` reports `Result (77 files): - 0 errors - 0 warnings - 0 hints` (build.log lines 9–12).
- The build log shows `[build] output: "static"`, then `[build] 127 page(s) built in 13.04s` and `[build] Complete!` (lines 331–332).
- jampack PASS 1 took 3.041 s. PASS 2 ended with `✔ 308 files | 49.01 MB → 46.16 MB | -2.85 MB`, and the summary ends with `✔ No issues` (line 1014). The file count of 308 matches v1 and the Task 2 ledger note.
- `dist/` holds 362 files, 130 of them `.html` (same as v1).
  - `dist/~partytown/` contains `partytown.js`, `partytown-sw.js`, `partytown-sandbox-sw.html`, `partytown-atomics.js` and `partytown-media.js`.
  - The custom sitemap endpoints are present: `sitemap-index.xml` plus 5 sub-sitemaps.
  - `rss.xml` is present.
- **Warnings:** there are exactly 9 `[WARN]` lines. All 9 are `[vite] [MODULE_LEVEL_DIRECTIVE] … "use astro:head-inject" in "src/content/blog/<slug>.mdx?astroPropagatedAssets"`, one per `.mdx` post; `ls src/content/blog/*.mdx` counts 9. This is the known, parked Task 4 item (Astro 7 + Rolldown upstream) and is unchanged from v1. **No other warning or error types appear.** `grep -niE 'warn|error|✘|✕|fail|deprecat'` matches only these 9 lines plus the "0 errors / 0 warnings" lines from check.

### Peers (B8), compared with the baseline block at the top of `baseline/2026-09/gate.txt`

| Baseline item | Now | Class |
|---|---|---|
| `@divriots/jampack 0.34.1 > quicklink 2.3.0 > react/react-dom@^16.8.0` (found 19.2.8) | Same path, found 19.3.0 | SAME: transitive and predates the branch. It is locked upstream: jampack 0.34.1 is the registry latest and declares `quicklink ^2.3.0`, and quicklink 2.3.0 is the newest 2.x. Only quicklink 3.x (latest 3.0.2, peers `react ^16.8.0 \|\| ^17 \|\| ^18 \|\| ^19`) accepts React 19. |
| `astro 6.2.1 > tsconfck 3.1.6 > typescript@^5.0.0` | absent | GONE: `tsconfck` has 0 matches in `pnpm-lock.yaml`. |
| `astro-eslint-parser 3.0.0 > … > @napi-rs/wasm-runtime 1.2.0 > @emnapi/runtime@^2.0.0-alpha.3` | absent | GONE: wasm-runtime is now 1.2.4, whose peers are `^1.7.1 \|\| ^2.0.0-alpha.4`. |
| `eslint-plugin-jsx-a11y 6.10.2 > eslint@^3..^9` | absent | GONE: the package was replaced by `eslint-plugin-jsx-a11y-x`, and there are 0 `eslint-plugin-jsx-a11y@` entries in the lockfile. |
| (none) | (none) | **NEW: none** |

Deprecated packages dropped from 4 in the baseline to **1**:
- Baseline: `@types/github-slugger@2.0.0` (direct), plus `@ungap/structured-clone@1.2.0`, `tsconfck@3.1.6` and `whatwg-encoding@2.0.0` (transitive).
- Now: only `whatwg-encoding@2.0.0` (transitive). `pnpm why` traces it through jampack > `@divriots/cheerio@1.0.0-rc.12` > `encoding-sniffer@0.0.2`, which declares `^2.0.0`, so it can't be fixed within the declared ranges. `@ungap/structured-clone`, flagged in v1, is no longer deprecated in the tree; Task 13's refresh took care of it.

### TypeScript cap (B9), checked against the registry

| Fact | Value |
|---|---|
| `typescript` dist-tags | `latest=7.0.2`, `rc=7.0.1-rc`, `next=7.1.0-dev.20260924.1` |
| Stable 6.x published | `6.0.2`, `6.0.3`. The installed 6.0.3 is the highest; no 6.0.4+ or 6.1.x exists. |
| `@typescript-eslint/eslint-plugin@latest` (8.70.1 = installed) | `peerDependencies.typescript = ">=4.8.4 <6.1.0"` |
| `@typescript-eslint/parser@latest` (8.70.1 = installed) | `peerDependencies.typescript = ">=4.8.4 <6.1.0"` |
| `typescript-eslint@latest` (8.70.1) | `peerDependencies.typescript = ">=4.8.4 <6.1.0"`. The `canary` 8.70.2-alpha.7 has the same range. |
| `@astrojs/check@latest` (0.9.10 = installed) | `peerDependencies.typescript = "^5.0.0 \|\| ^6.0.0"` |
| `semver.satisfies` | 7.0.2 → false for both ranges; 6.0.3 → true for both. |

TS 7.0.2 violates both ranges even at the latest registry versions. So 6.0.3 is the highest allowed version, and the cap is valid.

### `@types/node` cap (B9): a ruled exception (R27), not a peer-range cap

| Fact | Value |
|---|---|
| Ruling | **R27** in `global-constraints.md` (Phase 2 rulings, binding, and they supersede earlier rulings): "Add explicit devDependency `@types/node` pinned exactly to the latest 22.x (matches the Node 22 runtime)." `.github/dependabot.yml:81-83` ignores semver-major updates of `@types/node` for the same reason. |
| Installed / spec | `22.20.4` / `22.20.4` (exact) |
| Latest 22.x | `semver.maxSatisfying(all published, '^22')` = **22.20.4**, so the pin is exactly the latest 22.x and R27 is satisfied. |
| Registry latest | 26.6.2 |
| Runtime | `engines.node` 22.23.3, `.nvmrc` 22.23.3, `node -v` v22.23.3 (the latest v22 LTS per `nvm ls-remote v22`). |
| Peer declarations on `@types/node` in the installed tree | Only `vite@8.3.0`: `^20.19.0 \|\| >=22.12.0` (optional). |

To be precise: **no peer range forbids `@types/node` 26.x.** Vite's optional range accepts 26.6.2. The cap is a runtime-typing decision (types for the Node 22 runtime, not Node 26), and R27 is what rules it in. The lane's Step 5 text names only typescript as an exception. Because R27 is binding under the lane's own Environment section, and R16 exists so that QA does not re-fail ruled items, this is recorded as PASS with the ruling cited rather than as a FAIL. See observation 1.

## Observations (not failures)

1. **The lane text and the rulings don't match on `@types/node`.** Step 5 says "EVERY package must be at registry latest except typescript". R27 separately pins `@types/node` to the latest 22.x, and the Task 13b ledger already recorded "outdated = typescript (cap) + @types/node (22.x cap) only". The branch follows R27 exactly (22.20.4 = max ^22). The controller may want to add R27 to the lane template so later runs don't need this reconciliation.
2. **The preview binds only to IPv6 loopback, as it did in v1.** lsof shows `node 18132 … IPv6 … TCP localhost:4321 (LISTEN)`.
   - `http://localhost:4321/` and `http://[::1]:4321/` return 200.
   - `http://127.0.0.1:4321/` fails with curl exit 7 (connection refused).
   - **Other lanes must use `localhost`, not `127.0.0.1`.** This is Astro's default `host: localhost` on macOS, not a defect.
3. **Preview smoke test.** These all return 200 with the expected content type:
   - Pages: `/`, `/posts/`, both carousel posts, `/search/`, `/tags/`, `/tips/`, `/threads/`, `/about/`
   - Feeds and images: `/rss.xml` (text/xml), `/sitemap-index.xml` (text/xml), `/og.png` (image/png), `/posts/audio-vs-paper-books/index.png` (image/png)
   - Partytown assets: `/~partytown/partytown.js`, `/~partytown/partytown-sw.js`, `/~partytown/partytown-sandbox-sw.html`

   An unknown route returns 404.
4. **OG hashes on this build (input for Step 8, owned by another lane).**
   - `dist/og.png` has sha256 `ae6c9aa406da0d27944d155e4e9ec5fe8a92116b2f78d9897fe14697749e8902`, the value Task 6 accepted.
   - `dist/posts/audio-vs-paper-books/index.png` has sha256 `951f184b268e003e34c26b90e7109b07c988969269b38a0e3892e668c5838660`, which matches `baseline/2026-09/og/sha256.txt`.
5. **The Phase 2 Partytown invariants (R28) are present in the served build.** `dist/posts/octoprint-prusa-core-one-raspberry-pi/index.html` contains `sandboxParent:"html"` and `data-astro-transition-persist="gtag-src"` / `"gtag-init"`. This lane only checked that they are present; behaviour is verified by other lanes. `@astrojs/sitemap` appears 0 times in `package.json`, as expected under R23.
6. **Compared with v1 (55a6530):**
   - Install went from `+721` to `+719` packages.
   - jampack totals went from 49.06→46.23 MB to 49.01→46.16 MB.
   - Page, file and warning counts are unchanged: 127 pages, 362 files, 130 html, 9 MODULE_LEVEL_DIRECTIVE warnings.
   - These deltas are consistent with Tasks 13–16: the dev-tooling refresh, `@astrojs/sitemap` removal, Astro 7.3.5, and the Partytown fix.
7. **Toolchain.** pnpm 10.34.5 equals the registry `latest-10` (overall `latest` is 12.6.0), matching R25's "latest pnpm 10.x". Node v22.23.3 is the latest v22 LTS.
8. **Method notes.**
   - Step 4 used the lane's exact `mktemp -d` command, which created the scratch copy under `$TMPDIR`; it was removed afterwards (`ls` confirms). The full unfiltered output was also kept as `peers-full.log` so that the deprecation line above the sed range is on record.
   - `pnpm outdated` exits 1 by design whenever it lists anything; see B9. That is the only non-zero exit in this lane. Every gate command (install, check, lint, format:check, build) and the preview start exited 0.
9. **Preview lifecycle.** The daemon (pid 18132) was started from `/Users/ap/development/other/eliotik.github.io`. The controller should stop it with `pnpm astro preview stop` from that directory; `pkill -f` does not match it.
