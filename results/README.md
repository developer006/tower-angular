# Results hub — agent communication protocol

This folder is the **only handoff channel** between the orchestrator and task subagents. Chat replies are short status summaries; these files are authoritative.

## Ownership

| File | Owner | Purpose |
|---|---|---|
| `INDEX.md` | orchestrator only | Task board and status |
| `DECISIONS.md` | orchestrator only | Cross-cutting decisions and assumptions |
| `TASK-###-slug.md` | the subagent that ran that task | One result file per task |
| `VERIFY-*.md` | the verifier subagent | Independent verification report |
| `evidence/TASK-###/` | any task | Screenshots, logs, traces; gitignored |

Subagents must not edit another task's result, `INDEX.md`, or `DECISIONS.md`.

## Naming

- One task = one result file: `results/TASK-###-slug.md`, matching the task brief in `plan/tasks/`.
- A fix gets a new ID: `TASK-021-FIX`, `TASK-021-FIX2`, and its own result file.
- Never reuse or overwrite a result file.

## Result template

Target <= 120 lines. Include:

1. **Status** — the first line is `status: pass` or `status: blocked`. Do not write `done`.
2. **Commit** — `commit: pending`. The file is inside the commit, so the hash does not exist yet. Do not amend.
3. **Verify** — the command the orchestrator re-runs, and `verify_exit: 0` when it passed.
4. **Summary** — 3-6 bullets: what changed and why.
5. **Files changed** — path plus one-line purpose.
6. **Tests and evidence** — exact commands and pass/fail counts; link to `evidence/` files instead of pasting logs.
7. **Acceptance criteria** — checklist, with reasons for unmet items.
8. **Decisions / assumptions** — anything the orchestrator or next task must know.
9. **Open issues / risks** — known limitations or "none".
10. **Handoff for next task** — exact files to read, interfaces to preserve, commands to run.

## Blocked tasks

If blocked:

- Set status `blocked`.
- Include the exact command and output that failed.
- List what was attempted.
- Leave the working tree in a state the orchestrator can inspect; do not discard changes silently.
- The orchestrator creates a new fix task and a fresh subagent.

## Context-bloat rules

1. One task per subagent session; never reuse a session for another task.
2. The orchestrator prompt contains paths, not code: brief path, previous result path, short mission.
3. Subagents read only the files listed in their brief; use `rg` for targeted searches.
4. Keep result files short; link to evidence.
5. The orchestrator reads the result plus `git diff --stat` and targeted hunks, not whole files.
6. No recursive delegation: subagents must not spawn subagents.
