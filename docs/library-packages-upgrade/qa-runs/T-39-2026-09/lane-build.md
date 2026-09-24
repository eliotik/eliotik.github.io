# T-39 Task 8: QA lane "build" (final local verification)

- **Verdict: PASS.** Every gate command exited 0, and the shared preview answers `200` on `http://localhost:4321/`.
- **Repo / HEAD:** `/Users/ap/development/other/eliotik.github.io` @ `55a65300a2dce56e7c225232ca8c4abb2c7bd5b4` (branch `upgrade/2026-09`).
- **Toolchain:** Node `v22.23.3` (from `.nvmrc`, via `nvm use --silent`), pnpm `10.33.2`.
- **Run window:** 2026-09-24 ~03:03–03:10 UTC.
- **Output capture:** every command ran through `rtk proxy` to get raw output. Exit codes were read directly with `cmd > log 2>&1; echo $?`, with no pipes.
- **Files touched:** no tracked files were modified. `git status --porcelain` shows only `?? .claude/`, `?? .serena/` and `?? docs/library-packages-upgrade/qa-runs/T-39-2026-09/`.

## Artifacts

| File | Content |
|---|---|
| `qa-runs/T-39-2026-09/build.log` | Full `pnpm build` output (1014 lines) |
| `qa-runs/T-39-2026-09/stack.txt` | `node -v`, `pnpm -v`, `pnpm list --depth 0` |
| `qa-runs/T-39-2026-09/peers.txt` | `--resolution-only` peer block, verbatim, plus a comparison with the baseline |
| `qa-runs/T-39-2026-09/outdated.txt` | `pnpm outdated` (table and JSON), TS-cap evidence, and a cross-check of all 40 direct dependencies against the registry |
| `qa-runs/T-39-2026-09/lane-build.md` | This report |

Scratch logs (not in the repo) are in `/private/tmp/claude-501/-Users-ap-development-other-eliotik-github-io/917b6b41-1b79-43b6-8c59-b21d1efcf946/scratchpad/t8/build-lane/`:
- `install.log`, `check.log`, `lint.log`, `format.log`
- `peers-full.log`
- `outdated-raw.log`, `outdated.json`
- `registry-crosscheck.txt`
- `audit-prod.log`, `audit-all.log`, `audit-all.json`
- `preview-start.log`

## Checks

| # | Check | Result | Evidence |
|---|---|---|---|
| B0 | Ports 4321-4340 free before start | PASS | `lsof -iTCP:4321-4340 -sTCP:LISTEN` returned exit 1 with no output (before the gate and again just before the preview started). No stray astro daemons, so no `preview stop`/`dev stop` was needed. |
| B1 | Clean tree | PASS | `rm -rf node_modules .astro dist`, then `ls -d node_modules .astro dist` reports "No such file or directory" for all three. |
| B2 | `pnpm install --frozen-lockfile` | PASS (exit 0) | "Lockfile is up to date, resolution step is skipped"; `Packages: +721`; "Done in 2.1s using pnpm v10.33.2". `grep -iE 'warn\|peer\|deprecat\|error'` finds no matches. The listed direct versions match `stack.txt`. |
| B3 | `pnpm astro check` | PASS (exit 0) | `Result (77 files): - 0 errors - 0 warnings - 0 hints` |
| B4 | `pnpm lint` (`eslint .`) | PASS (exit 0) | No diagnostics (output is only the npm script banner). Coverage proof: `pnpm exec eslint . -f json` linted **74 files** (34 `.astro`, 27 `.ts`, 11 `.tsx`, 1 `.js`, 1 `.mjs`) with **0 problems**. |
| B5 | `pnpm format:check` (`prettier --check .`) | PASS (exit 0) | "All matched files use Prettier code style!" |
| B6 | `pnpm build` (`astro check && astro build && jampack ./dist`) | PASS (exit 0, 23 s) | See "Build detail" below. |
| B7 | Stack snapshot | PASS | `stack.txt`: node v22.23.3, pnpm 10.33.2, and 40 direct packages (20 deps, 20 devDeps), all matching the `package.json` specs. `pnpm list` exit 0. |
| B8 | Peer check (R11) | PASS | `pnpm install --resolution-only` on a scratch copy exited 0. The scratch lockfile sha256 was `f2e6d155…6cdd` before and after, the same as the repo lockfile. See "Peers" below. |
| B9 | `pnpm outdated`: all at latest except the TS cap | PASS | Only `typescript (dev) 6.0.3 → 7.0.2` is listed. `pnpm outdated` exits 1 **by design**, as it does whenever it lists anything; typescript alone causes that. Step 5 judges this command by what it lists, so exit 1 is not a gate failure. Likewise, the two `pnpm audit` runs (exit 1) are extra informational probes, not lane commands. The cap is proven below. An independent cross-check found 39/40 direct dependencies at registry latest and 0 deprecated. |
| B10 | Shared preview up on 4321 | PASS | `pnpm astro preview --port 4321` exited 0 and printed "Preview server running at http://localhost:4321 (pid 46521)". `curl http://localhost:4321/` returned `200` (remote_ip `::1`). `astro preview status` reports "running … (pid 46521, … background)". After the smoke requests, `astro preview logs` holds only the "astro v7.3.4 ready in 4 ms" line and no errors. The preview is **left running** for the other lanes. |

### Build detail (B6)

- The embedded `astro check` reports `Result (77 files): - 0 errors - 0 warnings - 0 hints` (build.log lines 9–12).
- `[build] 127 page(s) built in 13.17s`, then `[build] Complete!` (lines 331–332).
- jampack PASS 2 shows `✔ 308 files | 49.06 MB → 46.23 MB`. The summary ends with `✔ No issues` (line 1014). The file count of 308 matches the Task 2 ledger note.
- `dist/` holds 362 files, 130 of them `.html`. The `~partytown/` directory exists.
- Warnings: exactly 9 `[WARN]` lines, all `[vite] [MODULE_LEVEL_DIRECTIVE] … "use astro:head-inject" in "src/content/blog/<slug>.mdx?astroPropagatedAssets"`, one per `.mdx` post (there are 9 `.mdx` files in `src/content/blog/`). This is the known, parked Task 4 item (Astro 7 + Rolldown upstream). **No other warning or error types appear.** `grep -niE 'warn|error|✘|✕|fail|deprecat'` finds only these 9 lines plus the "0 errors / 0 warnings" check lines.

### Peers (B8), compared with the baseline block at the top of `baseline/2026-09/gate.txt`

| Baseline item | Now | Class |
|---|---|---|
| `@divriots/jampack 0.34.1 > quicklink 2.3.0 > react/react-dom@^16.8.0` (found 19.2.8) | Same path, found 19.3.0 | SAME (transitive; predates the branch). Upstream-locked: jampack 0.34.1 is latest and declares `quicklink ^2.3.0`; quicklink 2.3.0 is the newest 2.x; only quicklink 3.x (`react ^16.8.0\|\|^17\|\|^18\|\|^19`) accepts React 19. |
| `astro 6.2.1 > tsconfck 3.1.6 > typescript@^5.0.0` | absent | GONE. tsconfck has 0 matches in `pnpm-lock.yaml`. |
| `astro-eslint-parser 3.0.0 > … > @emnapi/runtime@^2.0.0-alpha.3` | absent | GONE |
| `eslint-plugin-jsx-a11y 6.10.2 > eslint@^3..^9` | absent | GONE (replaced by `eslint-plugin-jsx-a11y-x`) |
| (none) | (none) | **NEW: none** |

Deprecated packages went from 4 in the baseline (3 transitive plus the direct `@types/github-slugger`) to 2 transitive now: `@ungap/structured-clone@1.2.0` and `whatwg-encoding@2.0.0`. No direct dependency is deprecated.

### TypeScript cap (B9), checked against the registry

| Fact | Value |
|---|---|
| `typescript` dist-tags | `latest=7.0.2`, `rc=7.0.1-rc`, `next=7.1.0-dev.20260923.1` |
| Stable 6.x published | `6.0.2`, `6.0.3`. Installed 6.0.3 is the highest; no 6.0.4+ or 6.1.x exists. |
| `@typescript-eslint/eslint-plugin@latest` (8.70.1 = installed) | `peerDependencies.typescript = ">=4.8.4 <6.1.0"` |
| `@typescript-eslint/parser@latest` (8.70.1 = installed) | `peerDependencies.typescript = ">=4.8.4 <6.1.0"` |
| `typescript-eslint@latest` (8.70.1) | `peerDependencies.typescript = ">=4.8.4 <6.1.0"` |
| `@astrojs/check@latest` (0.9.10 = installed) | `peerDependencies.typescript = "^5.0.0 \|\| ^6.0.0"` |

TS 7.0.2 violates both ranges even at the latest registry versions, so 6.0.3 is the highest allowed version and the cap is valid. Every other direct dependency is exactly at registry latest (full table in `outdated.txt`).

## Observations (not failures)

1. **The preview binds only to IPv6 loopback.** lsof shows `node 46521 … IPv6 … TCP localhost:4321 (LISTEN)`. `http://localhost:4321/` and `http://[::1]:4321/` return 200, but `http://127.0.0.1:4321/` fails with curl exit 7 (connection refused). Other lanes must use `localhost`, not `127.0.0.1`. This is Astro's default `host: localhost` on Node ≥17 under macOS, not an upgrade defect.
2. **Preview smoke test.** All of these return 200 with the expected content type: `/posts/`, both carousel posts, `/search/`, `/tags/`, `/rss.xml` (text/xml), `/sitemap-index.xml` (text/xml), `/og.png` (image/png), and the three Partytown assets `/~partytown/partytown.js`, `/~partytown/partytown-sw.js` and `/~partytown/partytown-sandbox-sw.html`. An unknown route returns 404.
3. **OG hashes on this build (Step 8 input for another lane).** `dist/og.png` has sha256 `ae6c9aa406da0d27944d155e4e9ec5fe8a92116b2f78d9897fe14697749e8902`, the Task 6 accepted value. `dist/posts/audio-vs-paper-books/index.png` has `951f184b268e003e34c26b90e7109b07c988969269b38a0e3892e668c5838660`, which matches `baseline/2026-09/og/sha256.txt`.
4. **Deprecated transitive `@ungap/structured-clone@1.2.0` (pre-existing, in the baseline): "Potential CWE-502 - Update to 1.3.1 or higher".** Its parents are `hast-util-raw@9.0.2` and `mdast-util-to-hast@13.2.1`, both declaring `^1.0.0`, and the registry latest is 1.4.0. The declared ranges permit 1.4.0, so a lockfile-only refresh (for example `pnpm update --depth Infinity @ungap/structured-clone`) should be possible. **This was not attempted, since it is outside this lane's scope.** `pnpm audit` does not report it as an advisory. Recommended for controller triage, in the spirit of R19's transitive refresh.
5. **Deprecated transitive `whatwg-encoding@2.0.0`** (via jampack > `@divriots/cheerio` > `encoding-sniffer@0.0.2`, which declares `^2.0.0`) cannot be fixed within the declared ranges. It is informational only.
6. **Audit.** `pnpm audit --prod` exits 1 with **1 moderate** finding (`fflate@0.7.3` via satori), the known item that the final review marked unreachable. `pnpm audit`, which includes devDependencies, finds 37 (8 low, 17 moderate, 12 high, 0 critical), all build- or lint-time tooling. For several of them, the parent's declared range already permits a patched version. That was checked by reading ranges with `pnpm view`; **no refresh was attempted**, since it is outside this lane's scope. R19 scoped the refresh to prod advisories, so these are flagged for the controller rather than failed:

   | Package | Now | Declared range | Fix version | Pulled in by |
   |---|---|---|---|---|
   | `brace-expansion` (high) | 5.0.8 | `^5.0.8` | 5.0.12 | minimatch 10.2.6, from `@typescript-eslint/eslint-plugin` |
   | `svgo` (high/moderate) | 3.2.0 | `^3.2.0` | 3.3.5 | jampack |
   | `browserslist` (high) | 4.28.2 | `^4.23.0` | 4.29.0 | jampack |
   | `baseline-browser-mapping` (moderate) | 2.10.24 | `^2.10.12` (declared by browserslist@4.28.2; 4.29.0 declares `^2.11.23`) | 2.11.25 | browserslist |
   | `undici` | 6.25.0 | `^6.13.0` | 6.28.1 | jampack |
   | `undici` | 5.28.3 | `^5.22.1` | 5.29.0 | `@divriots/cheerio` |
   | `postcss-selector-parser` (low) | 7.1.1 | `^7.1.0` | 7.1.6 | eslint-plugin-astro |

   Not fixable within jampack 0.34.1's ranges: `esbuild` 0.20.2 (`^0.20.2`), `file-type` 19.6.0 (`^19.0.0`), `sharp` 0.33.5 (`^0.33.3`).
7. **Toolchain versions.** Node v22.23.3 is the latest v22 LTS (`nvm ls-remote v22`). pnpm 10.33.2 (`packageManager`) trails registry `latest-10` = 10.34.5 and `latest` = 12.6.0. Per R19, the pnpm/packageManager bump is a user follow-up and out of scope.
8. **Method deviation (harmless).** The peer-check scratch dir was created with `mktemp -d` under the session scratchpad rather than `$TMPDIR`. The command is otherwise identical, including `nvm use --silent $(cat .nvmrc)`, and the directory was removed afterwards.
9. **Preview lifecycle.** The daemon (pid 46521) was started from `/Users/ap/development/other/eliotik.github.io`. Stop it later with `pnpm astro preview stop` from that directory.
