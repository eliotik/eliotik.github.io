# Defect <task-id>-D<n>

> Append-only. Do not edit prior defect files; create a new one for each new finding on the same task.

**Reporter:** <QA agent identity>
**Date (UTC):** <YYYY-MM-DD>
**Task:** `<task-id>`
**Branch under test:** `upgrade/<task-id>-<slug>`
**Commit SHA under test:** `<sha>`
**Severity:** Blocker | High | Medium | Low

## Summary

One sentence describing the defect.

## Reproduction

Numbered steps. Must be runnable by the Dev Agent without further questions.

1. `git checkout <branch>`
2. `pnpm install --frozen-lockfile`
3. `<command that reveals the defect>`
4. ...

## Expected behavior

Cite the design section or success criterion that defines the expected behavior.

> e.g. "Per design §1 success criterion 6, theme toggle must work without FOUC."

## Actual behavior

What actually happens. Include screenshots or output paths in `qa-runs/<task-id>-<timestamp>/`.

## Verification command output

Paste the full output of the command that revealed the defect.

```
<paste>
```

## Files implicated

Best guess at which files are responsible.

- `<path>` — <reason>

## Suggested fix direction (optional)

If you have a hypothesis as a QA agent, state it briefly. Do NOT prescribe an implementation — that's the Dev Agent's job.

---

## Resolution (filled in by Dev Agent)

```yaml
resolved: false
resolved_at: null
resolution_commit_sha: null
notes: null
```

After fixing, replace with:

```yaml
resolved: true
resolved_at: 2026-04-29T18:00:00Z
resolution_commit_sha: <sha>
notes: |
  <2–3 sentences: what was wrong, what was changed.>
```
