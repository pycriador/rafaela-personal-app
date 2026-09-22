---
title: "Runbook — Re-deploy to GitHub Pages"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# rb-deploy-github-pages

> Language: EN | [Português (pt-BR)](../../../pt-BR/operations/runbooks/rb-deploy-github-pages.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

## Trigger

- Site missing, stale, or wrong after a `main` push.
- Manual re-deploy requested (no code change).

## Outcome

Latest `main` is compiled into `dist/` and published to the Pages URL as a Pages artifact.

## Preconditions

- Pushed to `main` or OK to dispatch manually.
- GitHub Pages configured for "Deploy from a branch? no — GitHub Actions" (workflow deploys, so Pages must allow Actions artifact deploys).

## Steps

1. Open the Actions tab → select "Deploy to GitHub Pages".
2. Inspect the latest run:
   - If it is **latest commit** and job is green: nothing else to do (Pages already updated).
   - If it failed: open logs and read the failing step (often Build Production Bundle: missing env secrets or TS/oxlint error).
3. If the failure was environmental (secrets): go to Settings → Secrets and variables → Actions → verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` exist.
4. If the failure was a build error: fix at source, push to `main` → a new run starts (the workflow also supports `workflow_dispatch` for manual re-runs).
5. Re-run a failed job: open the run → "Re-run all jobs".
6. Verify: open the Pages URL (environment URL on the deploy job) and confirm the app loads and routes resolve (deep links handled via `404.html`).

## Expected Duration

>10 min. `npm ci` + build + Pages propagation.

## Escalation

- Pages stays broken after a green run: open the repo Pages settings page to confirm the deployment source is "GitHub Actions".
- Health of GitHub: https://www.githubstatus.com

## Related

- [../service-profile.md](../service-profile.md)
- [../observability.md](../observability.md)
- [../../decisions/adr-003-github-pages-spa.md](../../decisions/adr-003-github-pages-spa.md)