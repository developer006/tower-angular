# TASK-052: GitHub Pages deploy

**Phase / dependencies:** Phase 5. Depends on TASK-051 (`status: pass`).
**Subagent:** general
**Git branch:** `task/TASK-052-github-pages` (already created from `main`; stay on it)
**Result file:** `results/TASK-052-github-pages.md`

## Goal

Add a subpath production build, a `404.html` deep-link fallback, and a Pages deploy workflow. Prove the build locally. Do not require a live Pages URL.

## Read first — only these

- `results/TASK-051-docs-release.md`
- `plan/implementation-plan.md` §4.4 scripts and the deployment line in §10
- `package.json`
- `README.md`

If the TASK-051 result does not start with `status: pass`, stop.

Do not edit `loop.ts`. Do not reverse `fileReplacements`. Do not commit a PNG. Do not run `--update-snapshots`.

Hermes terminal is git-bash. Native tools get `C:/` paths. Workspace is `C:/wrk/tower-angular`. Stay on `task/TASK-052-github-pages`. Do not switch, merge, or push.

## Locked scripts

Add these scripts and no others:

```json
"build:pages": "ng build --base-href=/tower-angular/ && node scripts/copy-404.mjs",
"copy404": "node scripts/copy-404.mjs"
```

`scripts/copy-404.mjs` copies the built `index.html` to `404.html` in the same output directory. The existing serve script uses `dist/tower-angular/browser`. If that directory is not what `ng build` writes, stop and report the real path. Do not copy a stale file.

## Workflow

Add `.github/workflows/deploy-pages.yml`. It runs on push to `main` and `workflow_dispatch`, on `ubuntu-latest`, Node 26. It runs `npm ci` and `npm run build:pages`, uploads `dist/tower-angular/browser` with `actions/upload-pages-artifact`, and deploys with `actions/deploy-pages`. Permissions are `contents: read`, `pages: write`, and `id-token: write`. Do not force-push. Do not add a third-party deploy action.

## Smoke

Run `npm run build:pages`. Then confirm, from that output:

- `index.html` contains `<base href="/tower-angular/">`
- `404.html` exists and contains the same base href
- Neither file contains an asset URL that starts with `/` but not `/tower-angular/`
- A local server that returns `404.html` for an unknown path answers `GET /play` with 200 and that base href. Stop the server before you commit.
- The pages output contains neither `__TD__` nor `harness-loader.e2e`. Record `PROD_ABSENT` only if both are absent.

Add the two new commands to the README command list. Do not claim the site is already deployed.

## Commands

```bash
npm test
npm run lint
npm run build:pages
```

## Constraints

- Do not modify `plan/`, `results/INDEX.md`, or another task result.
- Do not add dependencies. Do not spawn subagents. Do not `git add -A`.
- No `@angular` imports under `src/app/core/game/` or `src/app/core/systems/`.

## Handoff

Write the result file before the commit. First lines:

```text
status: pass
commit: pending
verify: npm test && npm run lint && npm run build:pages
verify_exit: 0
```

`notes:` must say the base href is `/tower-angular/`, `404.html` is the deep-link fallback, and `PROD_ABSENT` was checked on the pages output.

```bash
git add \
  package.json \
  scripts/copy-404.mjs \
  .github/workflows/deploy-pages.yml \
  README.md \
  results/TASK-052-github-pages.md
git status --short
git commit -m "feat(TASK-052): add the GitHub Pages build and 404 fallback"
```

Stop if an unexpected path is untracked.

Final chat reply <= 8 lines.
