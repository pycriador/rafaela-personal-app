---
title: "ADR-003 — GitHub Pages SPA deployment"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# ADR-003 — GitHub Pages SPA deployment

> Language: EN | [Português (pt-BR)](../../pt-BR/decisions/adr-003-github-pages-spa.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

## Status

Accepted (decision). Document lifecycle remains REVIEW.

## Date

2026-09-22 (documented; workflow present at `.github/workflows/deploy.yml`)

## Context

The app is a Vite SPA and needed free static hosting with automatic deployment from `main`.

## Problem

How to host a client-side React app with automatic deploys and SPA-friendly URLs at zero infrastructure cost?

## Decision

Deploy to **GitHub Pages** via a GitHub Actions workflow:

- Trigger: push to `main`.
- Build on `ubuntu-24.04` with Node 24 and locked `node_modules` (`actions/setup-node` cache).
- Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) provided as repo secrets.
- Vite `base: '/rafaela-personal-app/'`, `GITHUB_PAGES=true` gating the base URL at runtime.
- Workflow sets Pages branch artifacting + deploys from **Actions** artifact.
- 404 redirect HTML (`404.html`) replicating SPA fallback was introduced for deep-link handling.

## Alternatives Considered

| Alternative | Pros | Cons | Why not chosen |
| --- | --- | --- | --- |
| Netlify/Vercel | Streaming/native SPA rewrite | Extra account + config | Rejected: GitHub-only hosting preferred |
| Self-hosted VPS | Full control | Operations burden | Rejected for MVP |
| GitHub Pages only static root | Simple | No route fallback for deep links | Rejected: SPA routes need fallback (404.html) |

## Consequences

| Positive | Negative | Neutral |
| --- | --- | --- |
| Zero-cost hosting + TLS via GitHub | No custom domain config yet | Routes live under a repo sub-path |
| CDN-backed static delivery | Static hosting rebuilt on monorepo changes | — |
| Deploy on every `main` push | Full rebuild per deploy | — |

## Risks

| Risk | Mitigation | Classification |
| --- | --- | --- |
| Deep links 404 | `404.html` SPA fallback | Confirmed |
| Env secrets exposed in bundle | Using anon key only, never service role | Confirmed |
| Build fat-fingers breaking deploy | CI runs `npm run build` + lint on each push | Inferred |

## Affected Components

| Component | Impact | Documentation |
| --- | --- | --- |
| Build/CI | Deploy pipeline | [../operations/runbooks/rb-deploy-github-pages.md](../operations/runbooks/rb-deploy-github-pages.md) |

## Affected Contracts

| Contract | Impact | Documentation |
| --- | --- | --- |
| supabase-rest | Project URL/site uses repo sub-path base URL | [../contracts/supabase-rest.md](../contracts/supabase-rest.md) |

## Related Decisions

| ADR | Relationship |
| --- | --- |
| ADR-002 | Related (static hosting without auth infra) |
| ADR-001 | Related (config-driven `VITE_SUPABASE_URL`) |

## References

| Reference | Location |
| --- | --- |
| Deploy workflow | `.github/workflows/deploy.yml` |
| Build config | `vite.config.ts` |
| Runtime base URL | `src/utils/assets.ts` (`getAssetUrl`) |