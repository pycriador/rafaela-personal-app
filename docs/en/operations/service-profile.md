---
title: "Operations — service profile"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# service-profile

> Language: EN | [Português (pt-BR)](../../pt-BR/operations/service-profile.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

## At a glance

| Field | Value | Classification |
| --- | --- | --- |
| Service | Rafaela Personal App (trainer + student portal SPA) | Confirmed |
| Hosting | GitHub Pages (project Pages, Actions artifact) | Confirmed |
| Delivery | Static assets via CDN edge | Inferred |
| Backend | Supabase (hosted PostgreSQL + REST), optional | Confirmed |
| Auth | Mock (client-side) | Confirmed |
| Language/Framework | React 19 + TS, Vite 8, Tailwind 3 | Confirmed |

## Deployment

| Item | Detail | Classification |
| --- | --- | --- |
| Trigger | Push to `main` | Confirmed |
| Workflow | `.github/workflows/deploy.yml` | Confirmed |
| Runner | `ubuntu-24.04`, Node 24 | Confirmed |
| Build | `npm ci` + `npm run build` (tsc + vite) | Confirmed |
| Base URL | `/rafaela-personal-app/` (gated by `GITHUB_PAGES=true`) | Confirmed |
| Artifact | `actions/upload-pages-artifact` → `deploy-pages` | Confirmed |

## Runtimes \& processes

| Process | Runs when | Notes | Classification |
| --- | --- | --- | --- |
| Browser app | User opens the site | No server runtime | Confirmed |
| `db:seed` (`node scripts/seed-supabase.cjs`) | Manual, on demand | Seeds Supabase from `.env` | Confirmed |
| CI `build+deploy` | Every `main` push | Also runs `npm run lint` | Confirmed |

## Recurring operations

| Operation | When | Runbook |
| --- | --- | --- |
| Rebuild + redeploy site | On demand / after failed deploy | [runbooks/rb-deploy-github-pages.md](runbooks/rb-deploy-github-pages.md) |
| Handle Supabase outage | On outage symptom | [runbooks/rb-supabase-unavailable.md](runbooks/rb-supabase-unavailable.md) |
| Seed remote DB | Fresh Supabase project | `db:seed` (deployment docs) |

## Environment variables

| Variable | Required | Used in build | Used at runtime |
| --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | No (opt-in) | Yes (inlined) | Yes (REST base) |
| `VITE_SUPABASE_ANON_KEY` | No (with URL) | Yes (inlined) | Yes (anon role) |
| `SUPABASE_SECRET_KEY` | For seed | No | Seed only |

## Related

- [../operations/README.md](README.md)
- [../decisions/adr-003-github-pages-spa.md](../decisions/adr-003-github-pages-spa.md)