# Task <task-id> — Justification

> Replace every `<placeholder>` and every "N/A — explain why" stub. Do not leave empty sections.

**Author:** <agent identity>
**Date (UTC):** <YYYY-MM-DD>
**Branch:** `upgrade/<task-id>-<slug>`
**Work commit SHA:** `<sha>`
**Hand-off commit SHA:** `<sha>`

---

## 1. Goal recap

One sentence describing what this task achieved.

## 2. What changed

Bullet list. Each item: file or area + 1-line summary of the change.

## 3. Why this approach

3–5 sentences. Cover:
- Which spec section(s) this implements.
- Alternatives considered and rejected (with one-line reason).
- Any risk register entry from design §6 that this task touches.

## 4. Files

### Created
- `<path>` (n lines)

### Modified
- `<path>` (+x / -y lines)

### Deleted
- `<path>`

If a category is empty: write "None".

## 5. Verification — commands & outputs

Paste the **full** stdout of each command, not a summary.

### 5.1 `pnpm install --frozen-lockfile`
```
<paste>
```
**Result:** ✅ PASS / ❌ FAIL with reason.

### 5.2 `pnpm astro check`
```
<paste>
```
**Result:** ✅ PASS / ❌ FAIL with reason.

### 5.3 `pnpm lint`
```
<paste>
```
**Result:** ✅ PASS / ❌ FAIL with reason.

### 5.4 `pnpm build`
```
<paste>
```
**Result:** ✅ PASS / ❌ FAIL with reason.

### 5.5 `pnpm dev` smoke
```
<paste curl http://localhost:4321/ output>
```
**Result:** ✅ PASS / ❌ FAIL with reason.

### 5.6 `pnpm audit --prod`
```
<paste>
```
**Diff vs baseline (`baseline/audit-baseline.txt`):** <none / list new findings>.
**Result:** ✅ PASS / ❌ FAIL with reason.

## 6. Visual smoke (if `visual_smoke_required: true`)

For each of the 9 routes (design §1):
- `/` — <pass / diff description>
- `/posts` — ...
- ... (all 9 + /404)

If `visual_smoke_required: false` for this task: write "N/A — task does not affect rendered output."

## 7. Risks introduced or accepted

List anything that should be on the team's radar:
- New dependencies and why
- Deferred items (must not be in the design's "Out-of-scope" if introduced here)
- Accepted technical debt with rationale

If none: write "None — change is scoped to this task's mandate."

## 8. Out-of-scope changes

If you made changes the plan didn't ask for: list them and explain why they were unavoidable.

If none: write "None."

## 9. Defect resolutions (only if this task came back from QA)

For each defect resolved:

### D<n>: <one-line title>
- Defect file: `defects/<task-id>-D<n>.md`
- Root cause: <1–2 sentences>
- Fix: <1–2 sentences>
- Resolution commit: `<sha>`
- Re-verification command output (the one that originally failed):
  ```
  <paste>
  ```

If no defects: omit this section entirely.
