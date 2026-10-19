# Core Defense — Implementation Plan

> **Project root:** `C:\wrk\tower-angular`
> **Plan root:** `C:\wrk\tower-angular\plan`
> **Results hub:** `C:\wrk\tower-angular\results`
> **Remote:** `https://github.com/developer006/tower-angular.git`
> **Status:** ready for TASK-000 (scaffold).

## Current repository state

| Item | State |
|---|---|
| Project folder | `C:\wrk\tower-angular` exists |
| Git | initialized on `main`, remote `origin` configured |
| Commits | `2db0cdb first commit` (README only) |
| Node / npm | Node 24.20.0, npm 11.19.0 |
| Angular workspace | **not scaffolded yet** — no `package.json`, no `src/` |
| Plan folder | this document + `plan/design.md` |
| Results hub | `results/README.md`, `results/INDEX.md`, `results/DECISIONS.md` |

TASK-000 is therefore the scaffold task. It works in a sibling directory (Angular CLI refuses non-empty targets), moves the generated files into this repo without overwriting `.git`, and commits.

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
- `npm run lint`
- `npm run build`

## Constraints
- Do not modify `plan/`, `results/INDEX.md`, or another task's result.
- Do not touch files outside the deliverables unless strictly necessary; note any exception.
- No new dependencies without orchestrator approval.
- Keep the game engine free of Angular imports.
- Do not spawn subagents.
- Commit your work.

## Handoff
Use the standard result template. Final chat reply <= 8 lines:
status, tests run, files changed, blockers.
```

### 0.6 Result template

Target **<= 120 lines**:

```markdown
# TASK-### Result

**Status:** done | partial | blocked
**Branch / commit:** task/TASK-###-slug @ abc1234

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
Anything the next agent or orchestrator must know.

## Open issues / risks
Known limitations, follow-ups, or "none".

## Handoff for next task
Exact files to read, interfaces to preserve, commands to run.
```

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

**Sequential (default):**
```powershell
git switch main
git switch -c task/TASK-###-slug
# subagent works, tests, commits
git switch main
git merge --no-ff task/TASK-###-slug
git push origin main
```

**Parallel (only approved independent tasks):**
```powershell
git worktree add C:\wrk\tower-angular-wt\TASK-### -b task/TASK-###-slug main
# subagent works in the worktree
git -C C:\wrk\tower-angular-wt\TASK-### add -A
git -C C:\wrk\tower-angular-wt\TASK-### commit -m "feat(TASK-###): ..."
# orchestrator merges one branch at a time
git switch main
git merge --no-ff task/TASK-###-slug
git push origin main
git worktree remove C:\wrk\tower-angular-wt\TASK-###
git branch -d task/TASK-###-slug
```

Rules:

- Commit convention: `feat(TASK-###): ...`, `test(TASK-###): ...`, `fix(TASK-###): ...`, `chore(TASK-###): ...`, `docs(TASK-###): ...`.
- The task subagent commits its code, tests, and its result file.
- The orchestrator merges only after acceptance checks pass.
- If a task fails, create a **new** fix task with a new ID and a fresh subagent.
- Tag completed phases: `phase-0`, `phase-1`, etc. Final tag: `v1.0.0`; push tags with `git push origin --tags`.
- If `git commit` fails because user identity is missing, stop and ask the human.

### 0.9 Orchestrator checklist per task

1. Confirm `main` is clean, green, and pushed.
2. Create `plan/tasks/TASK-###-slug.md` from the template.
3. Dispatch one `general` subagent with the brief path and previous result path.
4. Wait for completion; read `results/TASK-###-slug.md`.
5. Check `git status` and `git diff --stat main...HEAD`. Inspect only changed hunks.
6. Run the acceptance commands yourself:
   - targeted unit tests
   - targeted Playwright spec
   - `npm run lint`
   - `npm run build` for integration tasks
7. If accepted: merge, push, delete the branch/worktree, update `results/INDEX.md`, commit and push the index update.
8. If not accepted: write the failure details into a new fix task brief and dispatch a fresh subagent.
9. After each phase: dispatch a separate verifier subagent; do not proceed until `results/VERIFY-PHASE-#.md` says pass.

### 0.10 TASK-000 scaffold instructions (existing repo)

`ng new` refuses a non-empty target directory, so scaffold in a sibling and move the files in. Do not delete `.git`, do not overwrite the remote, and keep the project a blank shell.

```powershell
# 0. Preflight
node --version          # expect v24.x
npm --version           # expect 11.x

# 1. Scaffold in a sibling directory (empty)
New-Item -ItemType Directory -Path C:\wrk\tower-angular-scaffold -Force
Set-Location C:\wrk\tower-angular-scaffold
npx --yes @angular/cli@22 new tower-angular `
  --directory . `
  --style=css `
  --routing `
  --ssr=false `
  --skip-git `
  --package-manager=npm `
  --test-runner=vitest `
  --zoneless `
  --ai-config=none `
  --defaults

# If npm install fails with EALLOWSCRIPTS / "--allow-scripts is not allowed":
#   npm install --ignore-scripts

# 2. Move generated files into the existing repo (keep .git and README)
Get-ChildItem C:\wrk\tower-angular-scaffold -Force |
  Where-Object { $_.Name -ne 'README.md' } |
  Move-Item -Destination C:\wrk\tower-angular -Force

# 3. Install UI + test dependencies at the repo root
Set-Location C:\wrk\tower-angular
npm install "@angular/material@22" "@angular/cdk@22" "@angular/animations@22"
npm install -D "@playwright/test@1"
npx playwright install chromium

# 4. Prebuilt Material themes -> public/assets/themes (relative URLs for subpath builds)
node -e "const fs=require('node:fs');fs.mkdirSync('public/assets/themes',{recursive:true});for(const t of ['deeppurple-amber','purple-green'])fs.copyFileSync('node_modules/@angular/material/prebuilt-themes/'+t+'.css','public/assets/themes/'+t+'.css')"

# 5. Verify and commit
npm test
npm run build
git add -A
git commit -m "feat(TASK-000): scaffold Angular 22 workspace, Material, and Playwright"
```

Deviations from the blank-shell baseline, on purpose:

- `--routing` is enabled because the game needs `/` (menu) and `/play` routes.
- `provideNativeDateAdapter()` is omitted; no date components are used.
- `zone.js` must not be present (`--zoneless` + signals).
- Keep theme/favicon URLs relative (`assets/...`), never absolute.
- TASK-000 subagent should load the `angular-scaffold` skill before scaffolding.

For GitHub Pages builds, use `--base-href=/tower-angular/` and a `404.html` fallback for deep links (TASK-053).

---

## 1. Game rules

### 1.1 Core loop

1. Start with **150 gold**, **20 core integrity**, and an empty board.
2. Build or upgrade towers during the build phase.
3. Press **Deploy Wave**. Enemies spawn from the entry point and follow the fixed path.
4. Towers acquire targets, fire, and earn bounty gold for kills.
5. Leaked enemies reduce core integrity.
6. Clear the wave, collect a wave-clear bonus, invest, repeat.
7. Survive wave 10 and kill the boss to win. Reach 0 integrity to lose.

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
- Targeting modes: **First** (furthest along the path), **Strongest**, **Closest**. Default is First.
- Armor is flat reduction per hit with a minimum of 1 damage.
- Slow effects use "strongest wins, refresh duration"; they do not stack multiplicatively.

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
| 10 | Overlord, 10 Drones, 6 Runners, 4 Tanks |

Spawn intervals and group delays live in data, not code. These numbers are starting points for the balance simulator.

### 1.6 Economy, score, and end states

- Kill bounty per enemy, plus a wave-clear bonus of `25 + 5 x wave`.
- No interest, no randomized gameplay, no mid-run save.
- Score: `kills x 10 + wavesReached x 100 + remainingLives x 25`, awarded at victory or defeat.
- Best score, best wave, and settings persist in `localStorage` under `core-defense:v1`.
- Victory when wave 10 is cleared. Defeat immediately when integrity reaches 0.
- Results overlay shows waves survived, kills, remaining integrity, score, and best score, with **Retry** and **Main Menu**.

### 1.7 UX and accessibility

- HUD is DOM, not canvas: integrity, gold, wave, score, pause, speed, sound.
- Build pads and placed towers are **real transparent DOM buttons** positioned over the canvas. Stable Playwright selectors, keyboard access, focus rings, no pixel-coordinate tests.
- Keyboard shortcuts: `1/2/3` select tower, `Space` pause, `F` speed, `Esc` cancel build/selection, `Tab` cycles pads and towers.
- `aria-live` announcements for wave start, wave cleared, leak, victory, and defeat.
- Colorblind-safe palette with distinct shapes; reduced-motion option disables shake, particles, and glow pulses.

---

## 2. Engine and architecture

### 2.1 Fixed-timestep loop

Use a **60 Hz fixed simulation step** with an accumulator:

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
- Pause is simply "stop stepping"; 2x speed feeds the accumulator at double rate.
- Interpolation is optional at 60 Hz; v1 renders the latest state.

**Determinism rules:**

- Integer tick count; fixed `DT`.
- No `Date.now()`, `performance.now()`, `Math.random()`, network, or async work inside simulation systems.
- Gameplay wave composition is authored, not random. Cosmetic randomness uses a seeded PRNG (`mulberry32`) stored in state.
- Stable system order and stable array iteration.
- Simulation state is plain serializable data.

### 2.2 Simulation model

State includes: tick, phase, gold, integrity, wave index, score, towers, enemies, projectiles, effects, spawn queue, and cosmetic RNG state.

Commands are validated and applied at the start of a tick:

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
- Theme: prebuilt Material themes in `public/assets/themes/`, a `ThemeService` toggling `<link id="theme-link">` between `deeppurple-amber` (light) and `purple-green` (dark). Default is **dark**. Preferences persist with the game settings.
- `provideBrowserGlobalErrorListeners()` and `provideAnimationsAsync()` in `app.config.ts`. No date adapter (no date components).
- `GameEngine` has no Angular imports. It exposes `dispatch`, `step`, `getState`, and `getSnapshot`.
- `GameFacade` is an Angular service that owns the engine, loop, renderer, and command dispatch.
- HUD state is exposed through signals and refreshed at **10 Hz** or after commands, not every frame. Entity positions never go through change detection.
- `requestAnimationFrame` runs outside Angular's zone (zoneless + signals).
- `GameCanvasComponent` owns the canvas and renderer. `BoardOverlayComponent` owns the DOM buttons for pads/towers. `GamePageComponent` composes HUD, palette, inspector, wave preview, and results.
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
      render\      renderer.ts, background.ts, entities.ts, theme.ts
      testing\     e2e-harness.ts
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
    specs\*.spec.ts
    shell.spec.ts
  public\assets\themes\  deeppurple-amber.css, purple-green.css
  scripts\balance-sim.ts, copy-404.mjs
  plan\
  results\
  playwright.config.ts
  .github\workflows\ci.yml, deploy-pages.yml
```

Generated file naming follows Angular 22 conventions: `app.ts`, `app.html`, `app.css`, `app.config.ts`, `app.routes.ts`.

---

## 4. Playwright end-to-end strategy

### 4.1 Deterministic test harness

Add a separate Angular **`e2e` build configuration** with `environment.e2e.ts`. It installs a test-only `window.__TD__` API; the harness is dynamically imported and absent from production builds.

Harness methods:

- `getState()` — read-only UI snapshot.
- `getFullState()` — full simulation state for assertions.
- `stepTicks(n)` — fast-forward the simulation without real time.
- `setManualMode(enabled)` — stop/start the rAF loop.
- `dispatch(command)` — test setup and edge cases.
- `reset({ seed, lives, wave })` — create specific scenarios quickly.
- `getMap()` — pad IDs, path points, tile positions.

Use the harness for **setup, fast-forwarding, and state assertions**, but drive every user-facing behavior through real UI interactions at least once.

Playwright's clock also mocks `requestAnimationFrame` and `performance`:

```ts
await page.clock.install();
await page.goto('/play?e2e=1');
await page.clock.runFor(1000);
```

Manual stepping is the default for speed and exactness; `page.clock` is used for pause and speed-control tests.

### 4.2 E2E test matrix

| Spec | What it proves |
|---|---|
| `shell.spec.ts` | Shell loads, theme toggle works, no console errors |
| `smoke.spec.ts` | Game canvas and HUD visible, wave button enabled |
| `build.spec.ts` | Select tower, valid placement spends gold, invalid pad rejected, range preview, keyboard placement |
| `upgrade-sell.spec.ts` | Upgrade levels change stats and cost, sell refunds 70%, pad becomes available |
| `combat.spec.ts` | Wave starts, enemies spawn and move, towers fire and kill, bounty gold increases, wave clears |
| `leak-defeat.spec.ts` | Leak reduces integrity; zero integrity shows defeat overlay |
| `victory.spec.ts` | Starting near wave 10 via harness, boss spawns, final wave clears, victory overlay and score appear |
| `pause-speed.spec.ts` | Pause freezes tick count; resume advances; 2x speed advances roughly twice as far per real interval |
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

`playwright.config.ts` follows the Angular 22 baseline: `testDir: './e2e'`, `fullyParallel: true`, `forbidOnly` on CI, `retries: 2` on CI, `workers: 1` on CI, `reporter: 'list'`, `baseURL: 'http://localhost:4200'`, `trace: 'on-first-retry'`, Chromium project, and a `webServer` running `npm run start` with `reuseExistingServer: !process.env.CI` and a 120 s timeout.

```json
{
  "scripts": {
    "start": "ng serve",
    "build": "ng build",
    "build:pages": "ng build --base-href=/tower-angular/",
    "test": "ng test --no-watch",
    "test:watch": "ng test --watch",
    "lint": "ng lint",
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "e2e:serve": "ng build --configuration e2e && http-server dist/tower-angular/browser -p 4200 -c-1",
    "sim": "tsx scripts/balance-sim.ts",
    "copy404": "node scripts/copy-404.mjs"
  }
}
```

CI (`.github/workflows/ci.yml`): checkout, Node 24, `npm ci`, `npm run lint`, `npm test`, `npm run build`, `npx playwright install --with-deps chromium`, `npm run e2e`, upload traces/screenshots on failure. Start with Chromium only; add Firefox/WebKit after v1.

---

## 5. Task graph

Every row is a **separate subagent session**. The orchestrator creates the brief just-in-time.

| ID | Task | Depends on | Agent | Result file |
|---|---|---|---|---|
| TASK-000 | Scaffold Angular 22 + Material + Playwright; verify plan/results structure; commit | — | general | `results/TASK-000-scaffold.md` |
| TASK-001 | Playwright config, e2e build config, harness stub, shell/smoke specs | 000 | general | `results/TASK-001-playwright.md` |
| TASK-002 | Lint/format, npm scripts, CI workflow | 000 | general | `results/TASK-002-ci-lint.md` |
| TASK-010 | Domain types, content schemas, map data, path math + unit tests | 002 | general | `results/TASK-010-content-path.md` |
| TASK-011 | Fixed-step loop, engine API, command validation, seeded RNG + unit tests | 010 | general | `results/TASK-011-engine-loop.md` |
| TASK-012 | Canvas renderer, static map layer, game page shell, responsive canvas | 010, 011 | general | `results/TASK-012-renderer-shell.md` |
| TASK-013 | E2E harness integration, deterministic smoke tests | 012, 001 | general | `results/TASK-013-e2e-harness.md` |
| VERIFY-1 | Independent phase 1 verification | 013 | general (read-only) | `results/VERIFY-PHASE-1.md` |
| TASK-020 | DOM board overlay, pad/tower focus, build mode, keyboard | 013 | general | `results/TASK-020-board-overlay.md` |
| TASK-021 | Placement validation, economy, HUD, error messages | 020 | general | `results/TASK-021-placement-economy.md` |
| TASK-022 | Tower palette, range preview, inspector, upgrade/sell/targeting | 021 | general | `results/TASK-022-palette-inspector.md` |
| TASK-023 | Playwright specs: placement, invalid placement, upgrade/sell, keyboard | 022 | general | `results/TASK-023-build-e2e.md` |
| VERIFY-2 | Independent phase 2 verification | 023 | general (read-only) | `results/VERIFY-PHASE-2.md` |
| TASK-030 | Enemy content, spawn queue, path movement, leak detection | 022 | general | `results/TASK-030-enemy-movement.md` |
| TASK-031 | Targeting, firing, projectiles, armor/slow + unit tests | 030 | general | `results/TASK-031-combat.md` |
| TASK-032 | 10-wave data, wave state machine, victory/defeat, wave preview | 031 | general | `results/TASK-032-waves-endstates.md` |
| TASK-033 | Playwright specs: combat, leak, defeat, victory | 032 | general | `results/TASK-033-combat-e2e.md` |
| TASK-034 | Headless balance simulator, reference strategies, integration tests | 033 | general | `results/TASK-034-balance-sim.md` |
| TASK-035 | Balance pass and content tuning | 034 | general | `results/TASK-035-balance-tune.md` |
| VERIFY-3 | Independent phase 3 verification | 035 | general (read-only) | `results/VERIFY-PHASE-3.md` |
| TASK-040 | Router, main menu, results overlay, restart flow | 035 | general | `results/TASK-040-menu-results.md` |
| TASK-041 | Pause/speed, visibility handling, persistence, settings, corrupted storage fallback | 040 | general | `results/TASK-041-pause-persistence.md` |
| TASK-042 | Synth SFX, visual effects, reduced motion, colorblind palette | 041 | general | `results/TASK-042-audio-polish.md` |
| TASK-043 | Accessibility pass: aria-live, focus, keyboard, axe scan | 042 | general | `results/TASK-043-accessibility.md` |
| TASK-044 | Playwright specs: pause/speed, persistence, accessibility | 043 | general | `results/TASK-044-polish-e2e.md` |
| VERIFY-4 | Independent phase 4 verification | 044 | general (read-only) | `results/VERIFY-PHASE-4.md` |
| TASK-050 | Visual regression spec and CI baselines | 044 | general | `results/TASK-050-visual-regression.md` |
| TASK-051 | Docs, README, performance/flake/bundle checks, release checklist | 050 | general | `results/TASK-051-docs-release.md` |
| TASK-052 | Final independent verification and v1 acceptance report | 051 | general (read-only) | `results/VERIFY-FINAL.md` |
| TASK-053 | GitHub Pages deploy: base-href, 404 fallback, deploy workflow, smoke check | 052 | general | `results/TASK-053-github-pages.md` |

### Task rules

- One task per subagent.
- A fix is a **new** task ID (for example `TASK-021-FIX`) with a new subagent and a new result file.
- If blocked, status is `blocked` with the exact command/output and attempted fix.
- Do not pre-create all task briefs; create each after its dependencies are verified and merged.
- Sequential execution is the default. Parallel execution only for disjoint files with fixed interfaces; use git worktrees and merge one at a time.
- Subagents must not edit `plan/` or `results/INDEX.md`.

---

## 6. Phase acceptance criteria

### Phase 0 — Setup

- Angular 22.2.3 workspace scaffolded in `C:\wrk\tower-angular`; `npx ng version` confirms it.
- `npm test` passes with `--no-watch`; `npm run build` passes.
- Material 22 + CDK + animations installed; prebuilt themes in `public/assets/themes/`.
- `@playwright/test` installed; Chromium downloaded; shell spec passes.
- `package.json` has no `zone.js`, no Analog packages; all Angular packages on major 22.
- `plan/` and `results/` structure present; README updated; initial scaffold commit on `main` pushed to `origin`.

### Phase 1 — Engine foundation

- Map, path, content types, and fixed-step engine are unit-tested.
- A 10-second simulation with the same seed and commands produces a stable state snapshot.
- Canvas renders the map and scales with the viewport.
- The e2e harness exposes manual stepping and state snapshots.
- No Angular imports in `src/app/core/game/` or `src/app/core/systems/`.

### Phase 2 — Build and economy

- Mouse and keyboard placement work; invalid placement is rejected with a reason.
- Gold is spent and refunded exactly; upgrade levels change stats.
- HUD reflects integrity, gold, wave, and score.
- Playwright build specs pass.

### Phase 3 — Combat and waves

- A full 10-wave run is playable from start to victory or defeat.
- Movement, targeting, projectiles, armor, slow, bounties, leaks, and wave completion are unit-tested.
- Combat/leak/victory Playwright specs pass.
- Balance invariants hold: no-tower run loses by wave 2; single-tower strategy fails by wave 6-7; mixed reference build wins with 8-15 integrity.

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

---

## 8. Risks and mitigations

| Risk | Mitigation |
|---|---|
| `ng new` refuses the non-empty repo | Scaffold in `C:\wrk\tower-angular-scaffold` and move files; keep `.git` |
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
- Package manager: **npm**.
- `results/` is committed for traceability; `results/evidence/` is gitignored.
- Scaffold baseline: Angular 22.2.3, standalone, zoneless, native Vitest, Material 22, Playwright 1.x, Chromium.
- Routing enabled (menu + game routes), deviating from the blank-shell baseline.
- Dark Material theme by default; light theme toggle available.
- Deployment: GitHub Pages under `/tower-angular/` with a `404.html` fallback.
- Game title: **Core Defense**.
- Minimal synthesized WebAudio SFX with a mute toggle; no external audio files.

---

## 11. References

- `angular-scaffold` skill (Angular 22.2.3 baseline: zoneless, native Vitest, Material, Playwright, theming, subpath deployment).
- [Fix Your Timestep! — Glenn Fiedler](https://gafferongames.com/post/fix_your_timestep/)
- [Flow Field Pathfinding for Tower Defense — Red Blob Games](https://www.redblobgames.com/pathfinding/tower-defense/)
- [Balance in TD Games — Game Developer](https://www.gamedeveloper.com/design/balance-in-td-games)
- [Testing Canvas and Chart Elements in Playwright](https://scrolltest.com/playwright-canvas-chart-testing/)
- [Playwright Clock](https://playwright.dev/docs/clock)
- [Angular Testing Overview](https://angular.dev/guide/testing)
