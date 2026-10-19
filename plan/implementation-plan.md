# Core Defense — Implementation Plan

> **Project root:** `C:\wrk\tower-angular`
> **Plan root:** `C:\wrk\tower-angular\plan`
> **Results hub:** `C:\wrk\tower-angular\results`
> **Remote:** `https://github.com/developer006/tower-angular.git`
> **Status:** Phase 0 tagged `phase-0` (`8fefaab`). Next brief: `plan/tasks/TASK-010-content-path.md`. Do not re-scaffold. Do not reverse the harness `fileReplacements`.

## Current repository state

Verified 2026-10-19 on this host, not copied from an earlier draft:

| Item | State |
|---|---|
| Project folder | `C:\wrk\tower-angular` exists |
| Git | initialized on `main`, remote `origin` configured, nothing pushed |
| Commits | `2db0cdb`, `9a11d6e`, `5645376`, plus this review-fix commit. Nothing pushed. |
| Working tree | clean after the review-fix commit. Before TASK-000, `git status --short` must be empty. Do not describe this commit as unpushed-and-dirty. |
| Node / npm | **v26.7.0**, npm 11.19.0. Angular 22 engines are `^22.22.3 \|\| ^24.15.0 \|\| ^26.0.0`. A preflight that expects v24.x is wrong on this host. |
| Shell | Hermes `terminal` is **git-bash**, not PowerShell. Task briefs use bash. Native tools (`node`, `npm`, `npx`, `git`) get `C:/` paths; do not pass `/c/...` to them. |
| Angular workspace | scaffolded and pushed in `7185020`. Do not run `ng new` again. |
| Plan folder | this document, `plan/design.md`, `plan/tasks/TASK-000-scaffold.md` |
| Results hub | `results/README.md`, `results/INDEX.md`, `results/DECISIONS.md` |
| `angular-scaffold` skill | **not installed** in this profile. Do not load it and do not install it during a task. The scaffold contract is in §0.10 and `plan/tasks/TASK-000-scaffold.md`. |

TASK-000 is the scaffold task. `ng new` refuses this non-empty repo. Scaffold in a sibling whose name is a **relative** `--directory`, with cwd = `C:/wrk`. Do not pass an absolute `--directory` and do not pre-create that directory and pass `--directory .`. Copy with `cp -a` (a `*` glob skips `.gitignore`), then install at the repo root.

---

## 0. Delivery model: one task, one subagent, one result file

### 0.1 Goal

Keep the orchestrator's context small and make every unit of work independently verifiable. The main agent plans, dispatches, verifies, and merges. It does **not** implement feature tasks itself. Every implementation task gets a fresh subagent session.

### 0.2 Roles

| Role | Agent | Responsibilities |
|---|---|---|
| **Orchestrator** | main agent | Owns the plan, creates task briefs, dispatches one task at a time, runs acceptance checks, reviews diffs, merges, pushes, updates the results index, resolves blockers. Does not implement feature code. |
| **Task implementer** | `general` subagent | One task only. Reads its brief and the previous result, changes only allowed files, runs targeted tests, commits on its task branch, writes one result file. |
| **Reconnaissance** | `explore` subagent | Read-only searches and narrow questions. Never modifies code. |
| **Verifier** | `general` subagent, read-only policy | Independent phase verification. Runs commands, checks acceptance criteria, writes `results/VERIFY-*.md`, does not modify source code. |

### 0.3 Communication flow

```text
Orchestrator
  |  creates plan/tasks/TASK-###-slug.md
  v
Task subagent (fresh session)
  |  reads brief + previous result + listed files
  |  implements, tests, commits
  v
results/TASK-###-slug.md
  |  canonical handoff
  v
Orchestrator
  |  reads result + git diff --stat + targeted diff
  |  runs acceptance commands
  v
merge to main -> push -> update results/INDEX.md -> next task
```

The results folder is the **only handoff channel**. Chat replies from subagents are only short status summaries; the result file is authoritative.

### 0.4 Folder contract

```text
C:\wrk\tower-angular\
  plan\
    design.md
    implementation-plan.md
    tasks\
      TASK-000-scaffold.md
  results\
    README.md
    INDEX.md
    DECISIONS.md
    TASK-000-scaffold.md
    VERIFY-PHASE-1.md
    VERIFY-FINAL.md
    evidence\
      TASK-###\
  src\
  e2e\
  public\
    assets\themes\
  scripts\
  .github\workflows\
  .gitignore
  .gitattributes
  README.md
```

Rules:

- `plan/` is owned by the orchestrator and the human. Subagents read their brief but never edit `plan/`.
- `results/INDEX.md` and `results/DECISIONS.md` are owned by the orchestrator. Subagents must not edit them.
- Each subagent writes exactly **one** result file: `results/TASK-###-slug.md`.
- Verification subagents write exactly **one** report: `results/VERIFY-*.md`.
- Committed result files are durable project history. Large evidence goes in `results/evidence/` and is referenced by path, not pasted.
- `results/` is committed to git (see `DECISIONS.md`).

### 0.5 Task brief template

```markdown
# TASK-###: Title

**Phase / dependencies:**
**Subagent:** general
**Git branch:** task/TASK-###-slug (or direct-to-main for TASK-000)
**Result file:** results/TASK-###-slug.md

## Goal
One paragraph. What must exist when this task is done?

## Read first — only these
- plan/design.md § relevant section
- plan/implementation-plan.md § relevant section
- results/TASK-###-previous.md
- specific source paths that already exist

Do not read the entire repository or the entire plan.

## Deliverables
- [ ] File(s) to create or modify
- [ ] Tests to add
- [ ] Result file

## Acceptance criteria
- [ ] Observable behavior 1
- [ ] Observable behavior 2
- [ ] Targeted tests pass
- [ ] Lint/build pass (if applicable)

## Commands to run
- `npm test`
- `npx playwright test e2e/specs/....spec.ts`
- `npm run lint` (only from TASK-002 onward, once the script exists)
- `npm run build`

## Constraints
- Do not modify `plan/`, `results/INDEX.md`, or another task's result.
- Do not touch files outside the deliverables unless strictly necessary; note any exception.
- No new dependencies without orchestrator approval.
- Keep the game engine free of Angular imports.
- Do not spawn subagents.
- Commit your work.

## Handoff
Read every existing `results/TASK-*.md` and `results/VERIFY-*.md` first. If any `status` line is not `pass`, stop. Do not re-derive an API a previous result already listed.

Use the standard result template. Write `commit: pending`. The result file is inside the commit, so the hash does not exist yet. Do not amend to fill it in.

Stage only the paths in this brief's `git add` line. `git add -A` is not a stage instruction.

Final chat reply <= 8 lines: status, tests run, files changed, blockers.
```

### 0.6 Result template

Target **<= 120 lines**:

```markdown
status: pass
commit: pending
verify: <command the orchestrator re-runs>
verify_exit: 0
files:
- path that actually shipped
api:
- signature that actually shipped
deviations:
- none
notes:
- what the next agent must not redo

# TASK-### Result

**Status:** pass | blocked
**Branch:** task/TASK-###-slug
**Commit:** pending

## Summary
What changed and why, in 3-6 bullets.

## Files changed
- `path` — one-line purpose

## Tests and evidence
- `command` -> pass/fail (counts)
- Playwright: n passed / n failed
- Screenshot/log paths under `results/evidence/TASK-###/`

## Acceptance criteria
- [x] criterion
- [ ] criterion (reason if not met)

## Decisions / assumptions
Anything the next agent or orchestrator must know. If this task published ids, seeds, or strings, list the concrete values. The next task copies them; it does not branch on "if index N is in the solution".

## Open issues / risks
Known limitations, follow-ups, or "none".

## Handoff for next task
Exact files to read, interfaces to preserve, commands to run.
```

`status: pass` is the machine-readable gate. `blocked` stops the next task. Do not write `done`. Do not write a commit hash in this file. The orchestrator records `git log -1` after the commit.

### 0.7 Context-bloat controls

1. **One task per subagent session.** Never reuse a session for a second task. Never give one prompt two unrelated tasks.
2. **Pass paths, not code.** The prompt contains the task brief path, previous result path, and a short mission statement. Do not paste source files or long logs.
3. **Read only what the brief lists.** Use `rg` to locate symbols and read targeted ranges. Do not read the whole repository.
4. **The result file is compressed context.** Keep it short. Link to evidence instead of pasting full logs.
5. **Orchestrator reads the result and the diff, not the whole codebase.** Start with `git diff --stat`, then inspect changed hunks. Read a full file only when a failure requires it.
6. **Use `explore` for reconnaissance.** Ask narrow questions. Do not ask an implementer to explore broadly.
7. **Split oversized tasks before dispatch.** If a brief exceeds roughly one page or touches more than ~10 files, split it into multiple task IDs.
8. **Verification is separate.** A task subagent does not verify its own work.
9. **No recursive delegation.** Subagents must not spawn their own subagents.
10. **Do not let a subagent update the plan.** Only the orchestrator or human edits `plan/` and `results/INDEX.md`.

### 0.8 Git workflow

`main` is always green. Implementation happens on short-lived branches.

- **Remote:** `origin` already points at GitHub. Push `main` after every verified merge.
- **Bootstrap exception:** TASK-000 commits directly to `main`, because the scaffold is the project baseline.

**Sequential (default), git-bash:**
```bash
git -C C:/wrk/tower-angular switch main
git -C C:/wrk/tower-angular switch -c task/TASK-###-slug
# subagent works, tests, commits using the brief's git add paths
git -C C:/wrk/tower-angular switch main
git -C C:/wrk/tower-angular merge --no-ff task/TASK-###-slug
git -C C:/wrk/tower-angular push origin main
```

**Parallel (only approved independent tasks):**
```bash
git -C C:/wrk/tower-angular worktree add C:/wrk/tower-angular-wt/TASK-### -b task/TASK-###-slug main
# subagent works in the worktree and stages the brief's paths, not -A
git -C C:/wrk/tower-angular-wt/TASK-### add path1 path2
git -C C:/wrk/tower-angular-wt/TASK-### commit -m "feat(TASK-###): ..."
git -C C:/wrk/tower-angular switch main
git -C C:/wrk/tower-angular merge --no-ff task/TASK-###-slug
git -C C:/wrk/tower-angular push origin main
git -C C:/wrk/tower-angular worktree remove C:/wrk/tower-angular-wt/TASK-###
git -C C:/wrk/tower-angular branch -d task/TASK-###-slug
```

Rules:

- Commit convention: `feat(TASK-###): ...`, `test(TASK-###): ...`, `fix(TASK-###): ...`, `chore(TASK-###): ...`, `docs(TASK-###): ...`.
- The task subagent commits its code, tests, and its result file.
- The orchestrator merges only after acceptance checks pass.
- If a task fails, create a **new** fix task with a new ID and a fresh subagent.
- Tag completed phases: `phase-0`, `phase-1`, etc. Final tag: `v1.0.0`; push tags with `git push origin --tags`.
- If `git commit` fails because user identity is missing, stop and ask the human.

### 0.9 Orchestrator checklist per task

1. Before TASK-000, and before every later task, `git status --short` is empty. Do not tell an agent the tree is dirty if status is empty. The review-fix commit is already on `main`.
2. Create `plan/tasks/TASK-###-slug.md` from the template. Paste that task's `git add` paths into the brief. Include the stop-unless-`status: pass` line.
3. Dispatch one `general` subagent with the brief path and previous result path.
4. Wait for completion; read `results/TASK-###-slug.md`.
5. Check `git status` and `git diff --stat main...HEAD`. Inspect only changed hunks.
6. Run the acceptance commands yourself. A child summary that says tests passed is not evidence. A green suite is not enough when this plan names a call or a string: grep that call or string before the next dispatch. For the harness, grep the production build for `__TD__` (must be absent) and confirm the e2e build contains it. A side-script dump is not provenance.
   - targeted unit tests
   - targeted Playwright spec
   - `npm run lint` (TASK-002 onward; the script does not exist before then)
   - `npm run build` for integration tasks
7. If accepted: merge, push, delete the branch/worktree, update `results/INDEX.md`, commit and push the index update. Record `git log -1 --oneline` in the index note. Do not amend the task commit to write the hash into the result file.
8. If not accepted: write the failure details into a new fix task brief and dispatch a fresh subagent.
9. After each phase: dispatch a separate verifier subagent; do not proceed until `results/VERIFY-PHASE-#.md` has `status: pass`.

### 0.10 TASK-000 scaffold instructions (existing repo)

`ng new` refuses a non-empty target. Scaffold in a sibling, then copy. Do not delete `.git`, do not overwrite the remote, and keep the app a blank shell.

The Hermes terminal is git-bash. These commands are bash. `Set-Location`, `Test-Path`, and PowerShell backticks will fail. `node`, `npm`, `npx`, and `git` are native: pass `C:/` paths, never `/c/...`.

On this host, `ng new --directory` with an absolute path is joined onto cwd (`path.join` does not reset). cwd must be `C:/wrk`. `--directory` must be the relative name `tower-angular-scaffold`. Do not pre-create that directory and pass `--directory .`. Pin `@angular/cli@22.2.3`; a floating `@22` can move past the version this plan locks.

```bash
node --version   # expect v26.7.0 (v26.x). Do not abort because it is not v24.
npm --version    # expect 11.x

cd /c/wrk
rm -rf tower-angular-scaffold
npx --yes @angular/cli@22.2.3 new tower-angular \
  --directory tower-angular-scaffold \
  --style=css \
  --routing=true \
  --ssr=false \
  --skip-git \
  --skip-install \
  --package-manager=npm \
  --test-runner=vitest \
  --zoneless \
  --ai-config=none \
  --defaults \
  --interactive=false

# Copy dotfiles. A * glob skips .gitignore. Skip README.md; rewrite it in the repo.
find /c/wrk/tower-angular-scaffold -mindepth 1 -maxdepth 1 \
  ! -name README.md ! -name node_modules \
  -exec cp -a {} /c/wrk/tower-angular/ \;
rm -rf /c/wrk/tower-angular-scaffold

cd /c/wrk/tower-angular
npm install
# If npm fails with EALLOWSCRIPTS: npm install --ignore-scripts
npm install @angular/material@22.2.3 @angular/cdk@22.2.3 @angular/animations@22.2.3
npm install -D @playwright/test@1
npx playwright install chromium

node -e "const fs=require('node:fs');fs.mkdirSync('public/assets/themes',{recursive:true});for(const t of ['deeppurple-amber','purple-green'])fs.copyFileSync('node_modules/@angular/material/prebuilt-themes/'+t+'.css','public/assets/themes/'+t+'.css')"
printf '* text=auto\n' > .gitattributes
```

Then apply the shell contract in `plan/tasks/TASK-000-scaffold.md` (theme service, specs, Playwright, README, `test` script). Do not load `angular-scaffold`.

Theme rules that a missing skill would otherwise get wrong:

- The only theme source is `<link id="theme-link" data-beasties-skip href="assets/themes/purple-green.css">`. `angular.json` `styles` stays `src/styles.css` only. `styles.css` must not `@import` a prebuilt theme. Do not run `ng add @angular/material`; that injects a second theme and the toggle looks broken.
- `ThemeService` calls `load()` from its constructor. Only the exact string `deeppurple-amber` selects light. Missing, corrupt, or any other value selects `purple-green` and rewrites the link. Do not read `matchMedia`.
- Keep the generated `provideZonelessChangeDetection()`. Add `provideBrowserGlobalErrorListeners()` and `provideAnimationsAsync()` from `@angular/platform-browser/animations/async`. Do not add `provideNativeDateAdapter()`, `zone.js`, or `provideExperimentalZonelessChangeDetection`.
- The `test` script is `ng test --watch=false`. In a TTY, `ng test` defaults to watch and the acceptance command hangs.
- File names follow the 2025 style guide (`app.ts`, not `app.component.ts`). Do not pass `--file-name-style-guide=2016`.

Verify, then stage the allowlist. Do not `git add -A`.

```bash
npm test
npm run build
npm run e2e
git add \
  .gitattributes .gitignore angular.json package.json package-lock.json \
  tsconfig.json tsconfig.app.json tsconfig.spec.json playwright.config.ts \
  README.md public src e2e plan results
git status --short
# Stop if a path outside that list is untracked, or if node_modules, dist,
# .angular, test-results, playwright-report, blob-report, or results/evidence is staged.
git commit -m "feat(TASK-000): scaffold Angular 22 workspace, Material, and Playwright"
git push origin main
```

If `git status --short` after that add shows an expected CLI file the allowlist missed (`.editorconfig`, `.vscode/`), add that path explicitly and say so in the result. Do not widen the add to `-A`.

Deviations from a blank shell, on purpose:

- `--routing=true` because the game needs `/` (menu) and `/play`.
- Default theme is purple-green (dark). Initial `href` and `dark-mode` class are dark.
- `.gitignore` also covers `results/evidence/` and `blob-report/`.
- TASK-000 creates `playwright.config.ts` and `e2e/specs/shell.spec.ts` against `npm run start`. TASK-001 adds the `e2e` build and serve configurations and switches `webServer` to `npm run start:e2e`. The game smoke spec is TASK-013, not TASK-001.

GitHub Pages (`--base-href=/tower-angular/`, `scripts/copy-404.mjs`) is TASK-052. Do not add it here.

---

## 1. Game rules

### 1.1 Core loop

1. Start with **150 gold**, **20 core integrity**, and an empty board.
2. Build or upgrade towers during the build phase.
3. Press **Deploy Wave**. Enemies spawn from the entry point and follow the fixed path.
4. Towers acquire targets, fire, and earn bounty gold for kills.
5. Leaked enemies reduce core integrity.
6. Clear the wave, collect a wave-clear bonus, invest, repeat.
7. Clear wave 10 (the Overlord is the final spawn) with integrity above 0 to win. Reach 0 integrity to lose.

Building is allowed during a wave. Pausing freezes the simulation but leaves the build UI usable.

### 1.2 Map and placement

- Logical grid: **20 x 12 tiles**, 48 px per tile, 960 x 576 canvas.
- One entry point, one core, one authored polyline path with several turns.
- **14 fixed build pads** adjacent to the path.
- Towers cannot be placed on path tiles, occupied pads, or non-pad tiles.
- Selecting a tower highlights valid pads and shows a range preview. Invalid placements produce a reason message and never spend gold.
- Clicking an existing tower opens an inspector for upgrade, sell, and targeting mode.
- Sell refunds **70%** of total invested gold.

### 1.3 Towers — starting values

| Tower | Cost | Damage | Rate | Range | Role |
|---|---:|---:|---:|---:|---|
| **Pulse** | 70 | 12 | 1.8/s | 3.2 tiles | Cheap single-target damage |
| **Mortar** | 110 | 45 splash | 0.55/s | 4.0 tiles | Anti-clump, strong against armor |
| **Cryo** | 90 | 5 | 1.2/s | 3.0 tiles | 40% slow for 1.5 s; control |

- Each tower has **3 levels**. Upgrades improve damage, rate, and range; Mortar gains splash radius; Cryo gains slow strength and duration.
- Targeting modes: **First** (furthest along the path), **Strongest** (highest current HP), **Closest** (smallest distance to the tower). Default is First. Ties break by furthest along the path, then by stable enemy ID.
- Armor is flat reduction per hit with a minimum of 1 damage.
- Slow effects use "strongest wins, refresh duration"; they do not stack multiplicatively. Boss slow resistance halves slow strength only, never duration.
- Mortar splash deals full damage to every enemy inside its radius (no falloff for v1). Projectiles home to their locked target; if the target dies before impact, the projectile expires without damage.
- Base Mortar splash radius: 1.0 tile.

**Upgrade starting values** (content data; tuned in TASK-035):

| Tower | L2 cost | L3 cost | Damage (L2/L3) | Rate (L2/L3) | Range (L2/L3) | Extra |
|---|---:|---:|---|---|---|---|
| Pulse | 50 | 70 | x1.30 / x1.60 | x1.10 / x1.20 | x1.08 / x1.16 | — |
| Mortar | 75 | 110 | x1.30 / x1.60 | x1.10 / x1.20 | x1.08 / x1.16 | splash radius 1.0 -> 1.15 -> 1.30 tiles |
| Cryo | 65 | 90 | x1.30 / x1.60 | x1.10 / x1.20 | x1.08 / x1.16 | slow 40% -> 45% -> 50%; duration 1.5 -> 1.7 -> 1.9 s |

Upgrade costs are 70% (L2) and 100% (L3) of the base cost, rounded to the nearest 5. The table is the oracle; do not re-round it in code. Sell refunds 70% of total invested gold, rounded down (`Math.floor`). Oracle: Pulse L1 invested 70 refunds 49; Pulse L1+L2 invested 120 refunds 84. A nearest-5 refund (50 or 85) is wrong.

### 1.4 Enemies — starting values

| Enemy | HP | Speed | Armor | Bounty | Leak damage |
|---|---:|---:|---:|---:|---:|
| **Drone** | 55 | 1.0 tile/s | 0 | 6 | 1 |
| **Runner** | 40 | 1.7 tile/s | 0 | 8 | 1 |
| **Tank** | 300 | 0.55 tile/s | 4 | 18 | 2 |
| **Swarm** | 22 | 1.15 tile/s | 0 | 3 | 1 |
| **Overlord** (boss) | 2200 | 0.45 tile/s | 6 | 150 | 10 |

The boss has **50% slow resistance** and appears in wave 10.

### 1.5 Waves — initial composition

| Wave | Composition |
|---:|---|
| 1 | 8 Drones |
| 2 | 10 Drones, 4 Runners |
| 3 | 16 Swarm, 6 Drones |
| 4 | 4 Tanks, 8 Drones |
| 5 | 10 Runners, 8 Swarm |
| 6 | 6 Tanks, 10 Drones, 6 Runners |
| 7 | 20 Swarm, 4 Tanks |
| 8 | 12 Runners, 8 Drones, 4 Tanks |
| 9 | 8 Tanks, 20 Swarm, 10 Runners |
| 10 | 10 Drones, 6 Runners, 4 Tanks, Overlord |

Spawn intervals and group delays live in data, not code. These numbers are starting points for the balance simulator.

Table order is spawn order. Each comma-separated run is one group. Wave 10 is four groups, and the Overlord group is last. Default timing, tuned in TASK-035, lives in `core/content/waves.ts`: 0.8 s between enemies inside a group, 4 s between groups. Do not encode the old row that listed the Overlord first.

### 1.6 Economy, score, and end states

- Kill bounty per enemy, plus a wave-clear bonus of `25 + 5 x wave`. Award that bonus only when the wave fully clears with integrity still above 0. A defeat mid-wave pays no bonus.
- No interest, no randomized gameplay, no mid-run save.
- Score: `kills x 10 + wavesCleared x 100 + remainingIntegrity x 25`, computed once at victory or defeat, not as a live HUD number. The HUD score stays 0 until that overlay. `wavesCleared` counts fully cleared waves only, so a defeat during wave N scores N-1. Integrity never goes below 0; the leak that crosses 0 sets it to 0 and ends the run before later enemies in that tick leak.
- `bestWave` is the highest 1-based wave the player started, which can be one ahead of `wavesCleared`. A defeat on wave 4 records `bestWave` 4 and scores 3 cleared waves.
- Best score, best wave, and settings persist in `localStorage` under `core-defense:v1` as `{ bestScore, bestWave, soundMuted, reducedMotion, colorblind }`. Defaults are all zeros / false. The theme key `theme` is separate and is not inside this object. `SettingsStore` calls `load()` from its constructor. A missing key, corrupt JSON, or a wrong type falls back to the defaults and does not throw. Persist `bestScore` when the new score is greater than the stored one.
- Player-started runs call `reset(1)`. Tests pass an explicit seed. Do not use `Date.now()` as a gameplay seed.
- Victory when wave 10 is cleared (all spawned enemies killed or leaked) and integrity is above 0. A leaked Overlord counts as a normal leak and can still end in victory if integrity remains. Defeat immediately when integrity reaches 0. The wave-state system opens the results overlay on both paths. Wiring only a click handler leaves a leak-victory silent.
- Results overlay shows waves cleared, kills, remaining integrity, score, and best score, with **Retry** (TASK-032) and **Main Menu** (TASK-040). TASK-033 asserts Retry is present. It must not assert that Main Menu is absent; TASK-040 adds that control and must move, not delete, any end-of-overlay assertion.

### 1.7 UX and accessibility

- HUD is DOM, not canvas: integrity, gold, wave, score, pause, speed, sound.
- Build pads and placed towers are **real transparent DOM buttons** positioned over the canvas. Stable Playwright selectors, keyboard access, focus rings, no pixel-coordinate tests.
- Keyboard shortcuts: `1/2/3` select tower, `Space` pause, `F` speed, `Esc` cancel build/selection, `Tab` cycles pads and towers.
- Deploy Wave is disabled while paused; build, upgrade, sell, and targeting controls stay enabled.
- `aria-live` announcements are the live region's whole text, not joined with other status. Exact sentences: `Wave {n} deployed.` / `Wave {n} cleared.` / `Core hit. Integrity {n}.` / `Victory. The core holds.` / `Defeat. The core is lost.`
- Colorblind-safe palette with distinct shapes; reduced-motion option disables shake, particles, and glow pulses.

---

## 2. Engine and architecture

### 2.1 Fixed-timestep loop

Use a **60 Hz fixed simulation step**. `DT` is exactly `1 / 60`, not `0.016` and not `16`. Accumulator:

```ts
accumulator += Math.min(frameDelta, 0.25) * speedMultiplier;
let steps = 0;
while (accumulator >= DT && steps < 10) {
  engine.step();
  accumulator -= DT;
  steps++;
}
renderer.render(engine.getState());
```

Why:

- Behavior does not change with monitor refresh rate.
- The same command sequence plus the same seed produces the same simulation.
- Clamping frame delta and capping catch-up steps prevents the "spiral of death."
- Pause stops stepping and does not add `frameDelta` to the accumulator, so resume does not fast-forward. `F` toggles speed between 1 and 2 only; it may change the multiplier while paused, but paused frames are discarded. Build/economy/targeting commands still apply immediately (see §2.2).
- A hidden tab discards frame time the same way and does not flip the user's pause flag. On visible, step again only if the user had not paused (TASK-041).
- Interpolation is optional at 60 Hz; v1 renders the latest state.
- The 10 Hz HUD timer starts when the game page is active and is cleared in `ngOnDestroy`. Add `OnDestroy`; do not replace `OnInit`. Every test destroys every fixture, including a second fixture created inside one test. A leftover `setInterval` hangs `ng test`.

**Determinism rules:**

- Integer tick count; fixed `DT`.
- No `Date.now()`, `performance.now()`, `Math.random()`, network, or async work inside simulation systems.
- Gameplay wave composition is authored, not random. Cosmetic randomness uses a seeded PRNG (`mulberry32`) stored in state.
- Stable system order and stable array iteration.
- Simulation state is plain serializable data.

### 2.2 Simulation model

State includes: tick, phase, gold, integrity, wave index, score, towers, enemies, projectiles, effects, spawn queue, and cosmetic RNG state.

Commands are validated and applied at the start of a tick. A rejected command leaves gold, towers, tick, integrity, and history unchanged. Clear nothing before the attempt. While paused, build, sell, upgrade, and targeting commands are applied immediately without advancing simulation systems, so the build UI stays responsive; `startWave` is ignored while paused, and `reset` always applies (test harness).

- `placeTower(type, padId)`
- `upgradeTower(towerId)`
- `sellTower(towerId)`
- `setTargeting(towerId, mode)`
- `startWave()`
- `reset(seed)`

System order per tick:

1. Process commands.
2. Spawn due enemies.
3. Tick slow effects.
4. Move enemies along the path; handle leaks.
5. Acquire/validate targets.
6. Fire towers and spawn projectiles.
7. Move projectiles; resolve hits and splash.
8. Apply damage, deaths, bounties, score.
9. Advance wave state and detect victory.
10. Tick cosmetic effects.

Path following uses precomputed segment lengths and cumulative distance. An enemy stores `distanceAlongPath`; `samplePath(distance)` returns position and tangent. No pathfinding is needed for v1.

Targeting is `towers x enemies` distance-squared checks each tick. With 20 towers and 150 enemies this is about 3,000 checks per tick; a spatial hash is not justified yet.

### 2.3 Rendering

- Canvas 2D with a cached static layer: grid, path, build pads, core.
- Dynamic layer: range preview, towers, enemies, projectiles, effects, sorted by y for depth.
- DPR-aware sizing, capped at 2x for performance.
- All text and HUD elements live in DOM for accessibility and stable screenshots.
- No `shadowBlur` on every entity; cache the glow-heavy background and use cheap primitives for moving objects.

### 2.4 Angular integration

- Angular 22.2.3, standalone components, **zoneless**, native Vitest via `@angular/build:unit-test`.
- Angular Material 22 + CDK + animations for UI chrome: toolbar, buttons, dialogs, sliders, tooltips, snackbar.
- Canvas remains custom; Material does not render the board.
- Theme: the only theme source is the runtime `<link id="theme-link" data-beasties-skip>`. Files are `public/assets/themes/deeppurple-amber.css` (light) and `purple-green.css` (dark). Default is dark. `ThemeService.load()` runs from the constructor. Only `localStorage.theme === 'deeppurple-amber'` selects light; any other value rewrites the link to dark. Game settings persist under `core-defense:v1`, not under `theme`. Do not also list a prebuilt theme in `angular.json` styles or `@import` one in `styles.css`.
- `provideBrowserGlobalErrorListeners()` and `provideAnimationsAsync()` in `app.config.ts`. No date adapter (no date components).
- `GameEngine` has no Angular imports. It exposes `dispatch`, `step`, `getState`, and `getSnapshot`.
- `GameFacade` is an Angular service that owns the engine, loop, command dispatch, and HUD signals. `GameCanvasComponent` owns the canvas and renderer and registers its render callback with the loop.
- HUD state is exposed through signals and refreshed at **10 Hz** or after commands, not every frame. Templates call the signal: `theme.isDark()`, not `theme.isDark`. An uncalled signal is always truthy. Do not `.subscribe()` a signal. Entity positions never go through change detection.
- Every standalone component's `imports` array lists every directive and component used in its template (`MatButton`, `RouterOutlet`, and later `MatCheckbox` / `MatFormField`). A `data-testid` on a Material select goes on the wrapping `mat-form-field`, not only the inner host. Coerce a `selectionChange` value with `Number()` and reject non-integers.
- `requestAnimationFrame` runs outside Angular's zone (zoneless + signals).
- `BoardOverlayComponent` owns the DOM buttons for pads and towers. `GamePageComponent` composes HUD, palette, inspector, wave preview, and results.
- Relative asset URLs everywhere so `--base-href=/tower-angular/` works for GitHub Pages.

### 2.5 Architecture alternatives considered

| Option | Trade-off |
|---|---|
| **Pure TS engine + Canvas + Angular signals + Material chrome** (chosen) | Best determinism, fastest tests, framework-independent engine, accessible UI components. Requires a small integration layer. |
| Angular services/RxJS as the game state | Idiomatic Angular, but streams and change detection complicate fixed-step determinism and testing. |
| DOM/SVG board | Easy to inspect and accessible by default, but poor fit for hundreds of moving entities and projectile effects. Canvas plus a DOM interaction overlay gets both benefits. |

---

## 3. Code layout

```text
C:\wrk\tower-angular\
  src\app\
    core\
      game\        engine.ts, loop.ts, state.ts, commands.ts, rng.ts,
                   path.ts, math.ts
      content\     towers.ts, enemies.ts, waves.ts, map-01.ts
      systems\     spawn, movement, targeting, firing, projectiles,
                   damage, economy, wave, effects
      render\      renderer.ts, background.ts, entities.ts, palette.ts
      testing\     e2e-harness.ts, harness-loader.ts, harness-loader.e2e.ts
      theme.service.ts
    features\
      game\        game-page, game-canvas, board-overlay, hud,
                   tower-palette, tower-inspector, wave-preview,
                   results-overlay
      menu\        main-menu
    state\         game-facade.ts, settings-store.ts
    app.routes.ts
    app.config.ts
  e2e\
    fixtures\game.fixture.ts
    pages\game.page.ts
    specs\  shell.spec.ts, smoke.spec.ts, *.spec.ts
  public\assets\themes\  deeppurple-amber.css, purple-green.css
  scripts\balance-sim.ts, copy-404.mjs
  plan\
  results\
  playwright.config.ts
  .gitattributes
  .github\workflows\ci.yml, deploy-pages.yml
```

Generated file naming follows Angular 22 conventions: `app.ts`, `app.html`, `app.css`, `app.config.ts`, `app.routes.ts`.

---

## 4. Playwright end-to-end strategy

### 4.1 Deterministic test harness

Add a separate Angular **`e2e` build configuration** that replaces `src/app/core/testing/harness-loader.ts` with `harness-loader.e2e.ts` via `fileReplacements`, plus a matching `serve` configuration that points at it, so both `ng build --configuration e2e` and `ng serve --configuration e2e` resolve the same replacement. `GamePageComponent` calls `installHarness(facade)` once; production builds use the no-op loader, so the harness module is never referenced by the production bundle and `window.__TD__` cannot appear there.

Harness methods:

- `getState()` — read-only UI snapshot.
- `getFullState()` — deep-cloned simulation state (`structuredClone`) for assertions.
- `stepTicks(n)` — step the engine `n` fixed ticks and render synchronously.
- `setManualMode(enabled)` — when enabled, rAF callbacks are no-ops; tests drive time explicitly.
- `dispatch(command)` — test setup and edge cases; returns the command result.
- `reset({ seed, integrity, wave, gold })` — test-only scenario setup; `wave` is the 1-based next wave.
- `getMap()` — pad IDs, path points, tile positions.
- `ready` — true once the game page has initialized and the harness is installed.

Use the harness for **setup, fast-forwarding, and state assertions**, but drive every user-facing behavior through real UI interactions at least once.

Playwright's clock also mocks `requestAnimationFrame` and `performance`:

```ts
await page.clock.install();
await page.goto('/play');
await page.waitForFunction(() => window.__TD__?.ready === true);
await page.clock.runFor(1000);
```

Manual stepping is the default for speed and exactness; `page.clock` is used for pause and speed-control tests.

### 4.2 E2E test matrix

The matrix is **11 specs**. Do not add a twelfth, and do not drop one when a later task grows the overlay.

| Spec | What it proves |
|---|---|
| `shell.spec.ts` | Shell loads, theme toggle works, no console errors |
| `smoke.spec.ts` | Game canvas and HUD visible, wave button enabled |
| `build.spec.ts` | Select tower, valid placement spends gold, invalid pad rejected, range preview, keyboard placement |
| `upgrade-sell.spec.ts` | Upgrade levels change stats and cost, sell refunds 70%, pad becomes available |
| `combat.spec.ts` | Wave starts, enemies spawn and move, towers fire and kill, bounty gold increases, wave clears |
| `leak-defeat.spec.ts` | Leak reduces integrity; zero integrity shows defeat overlay |
| `victory.spec.ts` | Starting near wave 10 via harness, boss spawns, final wave clears, victory overlay and score appear |
| `pause-speed.spec.ts` | Pause freezes tick count and does not dump the accumulator on resume; 2x advances about twice as far. Drive this with `page.clock` in small slices (about 16 ms) so the 10-step cap does not bind. Manual mode must be off for this spec. |
| `persistence.spec.ts` | Best score and settings survive reload; corrupted `localStorage` falls back safely |
| `accessibility.spec.ts` | Tab/Enter builds a tower, focus ring visible, live region announces wave and leak events |
| `visual.spec.ts` | Three deterministic screenshots: build phase, mid-combat, victory overlay |

### 4.3 Visual regression rules

- Seed the simulation and step to an exact tick before capturing.
- Screenshot the canvas only; HUD is separate.
- Disable CSS transitions and respect reduced motion.
- Run visual baselines in CI/Docker, not on the Windows dev machine, to avoid font/antialiasing drift.
- Use `maxDiffPixelRatio: 0.01` and mask any genuinely dynamic region.
- Reserve screenshots for the three scenes above.

### 4.4 Playwright config and scripts

`playwright.config.ts` follows the Angular 22 baseline: `testDir: './e2e'`, `fullyParallel: true`, `forbidOnly` on CI, `retries: 2` on CI, `workers: 1` on CI, `reporter: 'list'`, `baseURL: 'http://localhost:4200'`, `trace: 'on-first-retry'`, Chromium project, and a `webServer` with `reuseExistingServer: !process.env.CI` and a 120 s timeout. TASK-000 creates the config against the default `npm run start`; TASK-001 adds the matching `e2e` serve configuration and switches the command to `npm run start:e2e` when the harness loader replacement lands.

```json
{
  "scripts": {
    "start": "ng serve",
    "start:e2e": "ng serve --configuration e2e",
    "build": "ng build",
    "build:pages": "ng build --base-href=/tower-angular/ && node scripts/copy-404.mjs",
    "test": "ng test --watch=false",
    "test:watch": "ng test --watch",
    "lint": "ng lint",
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "e2e:serve": "ng build --configuration e2e && http-server dist/tower-angular/browser -p 4200 -c-1 --proxy http://localhost:4200?",
    "sim": "tsx scripts/balance-sim.ts",
    "copy404": "node scripts/copy-404.mjs"
  }
}
```

Scripts land progressively; the block above is the final state. TASK-000 adds `start`, `build`, `test` (`ng test --watch=false`), `test:watch`, `e2e`, `e2e:ui`; TASK-001 adds `start:e2e`, `e2e:serve`; TASK-002 adds `lint`; TASK-034 adds `sim`; TASK-052 adds `build:pages`, `copy404`. Do not run `npm run lint` before TASK-002. `npm test` without `--watch=false` hangs in this TTY.

Dependency ownership for scripts:

- `@playwright/test` — TASK-000.
- `http-server` — TASK-001 (used by `e2e:serve` in TASK-051/052 smoke checks; the `--proxy http://localhost:4200?` fallback makes deep links serve `index.html` locally).
- `angular-eslint@22` + `prettier` + `eslint-config-prettier` — TASK-002 (`ng add angular-eslint@22 --skip-confirmation`, verified to ship a schematics collection).
- `tsx` — TASK-034 (balance simulator).
- `@axe-core/playwright` — TASK-043 (axe scan in the accessibility task).

CI (`.github/workflows/ci.yml`): checkout, `node-version: 26` (this host is v26.7.0; Angular 22 also accepts `^24.15.0`, but do not pin an unqualified `24` that can resolve below 24.15), `npm ci`, `npm run lint`, `npm test`, `npm run build`, `npx playwright install --with-deps chromium`, `npm run e2e`, upload traces/screenshots on failure. Start with Chromium only; add Firefox/WebKit after v1.

---

## 5. Task graph

Every row is a **separate subagent session**. The orchestrator creates the brief just-in-time.

| ID | Task | Depends on | Agent | Result file |
|---|---|---|---|---|
| TASK-000 | Scaffold Angular 22 + Material + Playwright config/shell spec; confirm plan/results; commit | — | general | `results/TASK-000-scaffold.md` |
| TASK-001 | E2E build + serve configuration, harness loader replacement, `start:e2e`, `http-server`; keep the shell spec green | 000 | general | `results/TASK-001-playwright.md` |
| TASK-002 | Lint/format (`ng add angular-eslint@22`), npm scripts, CI workflow | 001 | general | `results/TASK-002-ci-lint.md` |
| TASK-010 | Domain types, content schemas, map data, path math + unit tests | 002 | general | `results/TASK-010-content-path.md` |
| TASK-011 | Fixed-step loop, engine API, command validation, seeded RNG + unit tests | 010 | general | `results/TASK-011-engine-loop.md` |
| TASK-012 | Canvas renderer, static map layer, `/play` game page shell, responsive canvas | 010, 011 | general | `results/TASK-012-renderer-shell.md` |
| TASK-013 | E2E harness integration, deterministic smoke tests | 012, 001 | general | `results/TASK-013-e2e-harness.md` |
| VERIFY-1 | Independent phase 1 verification | 013 | general (read-only) | `results/VERIFY-PHASE-1.md` |
| TASK-020 | DOM board overlay, pad/tower focus, build mode, keyboard | VERIFY-1 | general | `results/TASK-020-board-overlay.md` |
| TASK-021 | Placement validation, economy, HUD, error messages | 020 | general | `results/TASK-021-placement-economy.md` |
| TASK-022 | Tower palette, range preview, inspector, upgrade/sell/targeting | 021 | general | `results/TASK-022-palette-inspector.md` |
| TASK-023 | Playwright specs: placement, invalid placement, upgrade/sell, keyboard | 022 | general | `results/TASK-023-build-e2e.md` |
| VERIFY-2 | Independent phase 2 verification | 023 | general (read-only) | `results/VERIFY-PHASE-2.md` |
| TASK-030 | Enemy content, spawn queue, path movement, leak detection | VERIFY-2 | general | `results/TASK-030-enemy-movement.md` |
| TASK-031 | Targeting, firing, projectiles, armor/slow + unit tests | 030 | general | `results/TASK-031-combat.md` |
| TASK-032 | 10-wave data, wave state machine, victory/defeat, results overlay (score + Retry), wave preview | 031 | general | `results/TASK-032-waves-endstates.md` |
| TASK-033 | Playwright specs: combat, leak, defeat, victory | 032 | general | `results/TASK-033-combat-e2e.md` |
| TASK-034 | Headless balance simulator, reference strategies, integration tests | 033 | general | `results/TASK-034-balance-sim.md` |
| TASK-035 | Balance pass and content tuning | 034 | general | `results/TASK-035-balance-tune.md` |
| VERIFY-3 | Independent phase 3 verification | 035 | general (read-only) | `results/VERIFY-PHASE-3.md` |
| TASK-040 | Router, `/` main menu, results-to-menu flow, restart | VERIFY-3 | general | `results/TASK-040-menu-results.md` |
| TASK-041 | Pause/speed, visibility handling, persistence, settings, corrupted storage fallback, best score in results | 040 | general | `results/TASK-041-pause-persistence.md` |
| TASK-042 | Synth SFX, visual effects, reduced motion, colorblind palette | 041 | general | `results/TASK-042-audio-polish.md` |
| TASK-043 | Accessibility pass: aria-live, focus, keyboard, axe scan (`@axe-core/playwright`) | 042 | general | `results/TASK-043-accessibility.md` |
| TASK-044 | Playwright specs: pause/speed, persistence, accessibility | 043 | general | `results/TASK-044-polish-e2e.md` |
| VERIFY-4 | Independent phase 4 verification | 044 | general (read-only) | `results/VERIFY-PHASE-4.md` |
| TASK-050 | Visual regression spec and CI baselines | VERIFY-4 | general | `results/TASK-050-visual-regression.md` |
| TASK-051 | Docs, README, performance/flake/bundle checks, release checklist | 050 | general | `results/TASK-051-docs-release.md` |
| TASK-052 | GitHub Pages deploy: base-href, 404 fallback, deploy workflow, smoke check | 051 | general | `results/TASK-052-github-pages.md` |
| TASK-053 | Final independent verification and v1 acceptance report | 052 | general (read-only) | `results/VERIFY-FINAL.md` |

### Task rules

- One task per subagent.
- A fix is a **new** task ID (for example `TASK-021-FIX`) with a new subagent and a new result file.
- If blocked, status is `blocked` with the exact command/output and attempted fix.
- Do not pre-create all task briefs; create each after its dependencies are verified and merged.
- Sequential execution is the default. Parallel execution only for disjoint files with fixed interfaces; use git worktrees and merge one at a time.
- Subagents must not edit `plan/` or `results/INDEX.md`.
- TASK-002 depends on TASK-001 because both edit `package.json`; they must never run in parallel.
- Phase N+1 tasks depend on `VERIFY-N`; do not dispatch them until that file has `status: pass`.
- Briefs are bash. Do not paste PowerShell.
- Each brief pastes its `git add` paths. The result file says `commit: pending` and `status: pass`.
- Templates call signals. Component `imports` include every Material directive the template uses.
- A balance search cap is a hang guard. If it misses, call the same function with a higher cap and later seeds. Do not hand-author the artifact. Run that search in the foreground. A background PTY node process exits at once with `stdin is not a tty`.

---

## 6. Phase acceptance criteria

### Phase 0 — Setup

- Angular 22.2.3 workspace scaffolded in `C:\wrk\tower-angular`; `npx ng version` confirms it.
- `npm test` passes with `--no-watch` (shell + theme service specs); `npm run build` passes; `npm run e2e` passes the shell spec in `e2e/specs/shell.spec.ts`.
- Material 22 + CDK + animations installed; prebuilt themes in `public/assets/themes/`; theme defaults to dark, toggles to light, and persists the choice.
- `@playwright/test` installed; Chromium downloaded.
- `package.json` has no `zone.js`, no Analog packages; all Angular packages on major 22.
- `.gitattributes` exists; `.gitignore` covers build output, Playwright artifacts (`test-results/`, `playwright-report/`, `blob-report/`), and `results/evidence/`.
- `plan/` and `results/` structure present; README is valid Markdown with setup commands; initial scaffold commit pushed to `origin`.

### Phase 1 — Engine foundation

- Map, path, content types, and fixed-step engine are unit-tested.
- A 10-second simulation with the same seed and commands produces a stable state snapshot.
- Canvas renders the map and scales with the viewport.
- The e2e harness exposes manual stepping and state snapshots.
- No Angular imports in `src/app/core/game/` or `src/app/core/systems/`.

### Phase 2 — Build and economy

- Mouse and keyboard placement work; invalid placement is rejected with a reason.
- Gold is spent and refunded exactly; upgrade levels change stats.
- HUD reflects integrity, gold, and wave; the score field is present and shows 0 until Phase 3 scoring lands.
- Playwright build specs pass.

### Phase 3 — Combat and waves

- A full 10-wave run is playable from start to victory or defeat, with a working results overlay and Retry.
- Movement, targeting, projectiles, armor, slow, bounties, leaks, and wave completion are unit-tested.
- Combat/leak/defeat/victory Playwright specs pass.
- Balance invariants hold: no-tower run loses by wave 2; any single-tower-type strategy (Pulse-only, Mortar-only, or Cryo-only) fails by wave 6-7; mixed reference build wins with 8-15 integrity.

### Phase 4 — Shell and polish

- Menu -> game -> results -> retry works.
- Pause freezes the simulation; 2x speed advances roughly twice as far.
- Best score/settings persist; corrupted storage falls back safely.
- Keyboard-only build/start/pause/restart works; live regions announce key events.
- Pause/speed/persistence/accessibility Playwright specs pass.

### Phase 5 — Hardening and deployment

- Three deterministic visual baselines pass in CI.
- Suite is stable across three consecutive runs.
- Performance: 60 fps with ~100 enemies and 20 towers on a mid-range desktop; average simulation step under 4 ms.
- Production build does not expose `window.__TD__`.
- `npm run build:pages` produces a subpath-safe build; GitHub Pages deploy workflow works; deep links resolve.
- README documents setup, commands, architecture, and test strategy.
- Final verifier signs off in `results/VERIFY-FINAL.md`.

---

## 7. Balance plan

Use the engine itself as a headless simulator:

- Reference strategies: no towers, Pulse-only, Mortar-only, Cryo-only, mixed.
- Output per wave: leaks, gold curve, kills, time-to-clear.
- Invariants:
  - No towers -> defeat by wave 2.
  - Single-tower strategy -> fails by wave 6-7.
  - Mixed reference build -> wins with 8-15 integrity remaining.
  - Each wave's income funds roughly one meaningful purchase.
- DPS sanity check: `effectiveDps = max(1, damage - armor) x rate`; `damagePerPass = effectiveDps x timeInRange`; a basic Pulse should kill a basic Drone in one pass.
- Keep all tunable values in `core/content/`; balance changes never touch engine logic.
- Run `npm run sim` in the foreground. If the attempt cap misses, raise the cap and continue the same function. Do not write the reference output by hand and claim the simulator produced it.

---

## 8. Risks and mitigations

| Risk | Mitigation |
|---|---|
| `ng new` refuses the non-empty repo | Scaffold from `C:/wrk` with relative `--directory tower-angular-scaffold`. Do not pre-create it and pass `--directory .`. Copy with `cp -a`, not a `*` glob. Keep `.git` |
| Canvas tests become flaky | DOM overlay for interactions; assert simulation/HUD state; 3 visual snapshots |
| Balance takes too long | Headless simulator, centralized content, reference invariants |
| Angular change detection hurts frame rate | Zoneless + signals + 10 Hz HUD snapshots + rAF outside change detection |
| Determinism drift | Fixed step, integer tick, seeded cosmetic RNG, no wall-clock in simulation |
| Visual baselines differ by OS | Generate and run baselines in CI/Docker |
| Context bloat across tasks | One task per subagent; result files as compressed handoff; no full-repo reads |
| Subagent conflicts | Sequential default; worktrees only for disjoint parallel tasks; merge one at a time |
| Material theme clashes with neon canvas | Material for chrome only; canvas has its own palette and theme tokens |
| Subpath deployment breaks assets/deep links | Relative URLs, `--base-href=/tower-angular/`, `404.html` fallback |
| Scope creep | Feature freeze: no maze-building, multiple maps, endless mode, flying enemies, backend |

---

## 9. Definition of done for v1

- All implementation tasks merged; all phase verifications passed.
- `npm run lint`, `npm test`, `npm run build`, and `npm run e2e` pass on `main`.
- Complete 10-wave playthrough works from menu to victory and from menu to defeat.
- Deterministic reference run is reproducible; balance invariants pass.
- Production build does not expose the e2e harness.
- `npm run build:pages` deploys cleanly to GitHub Pages with working deep links.
- README and plan/results folders are complete and committed.
- `main` is clean and tagged `v1.0.0`.

---

## 10. Decisions and defaults

Recorded in `results/DECISIONS.md`:

- Project folder: `C:\wrk\tower-angular`; remote `origin` on GitHub; branch `main`.
- Package manager: **npm**. Host Node is v26.7.0. CI uses `node-version: 26`.
- Hermes terminal is git-bash. Briefs are bash. Native tools get `C:/` paths.
- `results/` is committed for traceability; `results/evidence/` is gitignored.
- Scaffold baseline: Angular CLI / Material / CDK / animations **22.2.3**, standalone, zoneless, native Vitest, angular-eslint 22 + Prettier, Playwright 1.x, Chromium. The `angular-scaffold` skill is not installed; do not load it.
- Result files use `status: pass` and `commit: pending`. The orchestrator records the hash. Do not amend.
- Routing enabled (menu + game routes), deviating from the blank-shell baseline.
- Theme: `ThemeService` persists the theme under `theme`; game settings persist under `core-defense:v1`. Dark Material theme by default; light theme toggle available. A missing or corrupt `theme` value falls back to dark.
- Victory/score: wave 10 clears when every spawned enemy is killed or leaked; victory requires integrity above 0. Score uses `wavesCleared` and `remainingIntegrity`.
- Upgrade economy: base costs, L2/L3 costs, stat multipliers, splash growth, and slow growth are content data starting in §1.3 and tuned by TASK-035.
- Harness safety: `harness-loader.ts` is the no-op. The `e2e` build and serve configurations replace that file with `harness-loader.e2e.ts`. Production does not apply that replacement, so `window.__TD__` cannot appear in the production bundle. Do not reverse this.
- Deployment: GitHub Pages under `/tower-angular/`; `build:pages` includes `scripts/copy-404.mjs`, and `404.html` provides the deep-link fallback.
- Game title: **Core Defense**.
- Minimal synthesized WebAudio SFX with a mute toggle; no external audio files.
- Plan/results docs from review fix 3 are committed on `main` and not pushed. TASK-000 pushes them with the scaffold commit. Do not amend that commit to write its hash into a result file.

---

## 11. References

- `plan/tasks/TASK-000-scaffold.md` is the copy-paste scaffold contract. Do not load `angular-scaffold`; it is not installed in this profile.
- [Fix Your Timestep! — Glenn Fiedler](https://gafferongames.com/post/fix_your_timestep/)
- [Flow Field Pathfinding for Tower Defense — Red Blob Games](https://www.redblobgames.com/pathfinding/tower-defense/)
- [Balance in TD Games — Game Developer](https://www.gamedeveloper.com/design/balance-in-td-games)
- [Testing Canvas and Chart Elements in Playwright](https://scrolltest.com/playwright-canvas-chart-testing/)
- [Playwright Clock](https://playwright.dev/docs/clock)
- [Angular Testing Overview](https://angular.dev/guide/testing)
