status: pass
commit: pending
verify: npm test && npm run lint && npm run build:pages
verify_exit: 0
files:
- package.json
- scripts/copy-404.mjs
- .github/workflows/deploy-pages.yml
- README.md
- results/TASK-052-github-pages.md
notes:
- The base href is `/tower-angular/`.
- `404.html` is the deep-link fallback.
- `PROD_ABSENT` was checked on the pages output.

# TASK-052 Result

**Status:** pass
**Branch:** task/TASK-052-github-pages
**Commit:** pending

## Summary

- `npm run build:pages` runs `ng build --base-href=/tower-angular/` and then `scripts/copy-404.mjs`.
- `ng build` wrote `dist/tower-angular`; the browser files are in `dist/tower-angular/browser`. The copy used that fresh `index.html`. It did not copy a stale file.
- `index.html` and `404.html` both contain `<base href="/tower-angular/">`. Neither file has an asset URL that starts with `/` but not `/tower-angular/`.
- A local server that returns `404.html` for an unknown path answered `GET /play` with 200, that base href, and the `404.html` body. The server was stopped before the commit.
- The pages output contains neither `__TD__` nor `harness-loader.e2e` (`PROD_ABSENT`).
- The deploy workflow uses `actions/upload-pages-artifact` and `actions/deploy-pages`. This result does not claim the site is already deployed.

## Files changed

- `package.json` — `build:pages` and `copy404`
- `scripts/copy-404.mjs` — copies the built `index.html` to `404.html` in `dist/tower-angular/browser`
- `.github/workflows/deploy-pages.yml` — Pages deploy on push to `main` and `workflow_dispatch`
- `README.md` — command list includes `build:pages` and `copy404`
- `results/TASK-052-github-pages.md` — this report

## Tests and evidence

- `npm test` -> exit 0; 19 files, 105 tests passed
- `npm run lint` -> exit 0; All files pass linting
- `npm run build:pages` -> exit 0; output `dist/tower-angular`; `copy-404: wrote dist/tower-angular/browser/404.html`
- `index.html` and `404.html` are identical and contain `<base href="/tower-angular/">`
- Asset URL check on both files: no URL starts with `/` except `/tower-angular/`
- `GET /play` -> 200; body is `404.html`; base href present; server exited
- Pages output grep: neither `__TD__` nor `harness-loader.e2e` (`PROD_ABSENT`)

## Acceptance criteria

- [x] TASK-051 result starts with status: pass
- [x] `build:pages` and `copy404` are the only new scripts
- [x] `404.html` is copied from the built `index.html` in `dist/tower-angular/browser`
- [x] Deploy workflow uses the official Pages actions, Node 26, and the required permissions
- [x] Base href, 404 fallback, deep-link GET /play 200, and PROD_ABSENT are proven on this build
- [x] README lists the two commands and does not claim the site is deployed

## Decisions / assumptions

- `status: pass` because the required commands exited 0 and the pages smoke checks passed on this build.
- `commit` stays `pending`. No hash written. No amend.
- `ng build` reports `Output location: dist/tower-angular`. Browser files, including `index.html`, are in `dist/tower-angular/browser`, which is the path the existing serve script uses.
- The local deep-link server returned `404.html` with status 200 for `/play`, then exited. No live Pages URL is required.

## Handoff for next task

- Do not start TASK-053 from this branch.
- Do not merge or push.
- Do not reverse fileReplacements.
