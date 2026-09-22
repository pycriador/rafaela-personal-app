---
title: "Operations — observability"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# observability

> Language: EN | [Português (pt-BR)](../../pt-BR/operations/observability.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

## Purpose

Describe what is observable about the Rafaela Personal App today, honestly — including what is **not** observable. No structured logging, metrics, or tracing exists; everything below is browser console or CI output.

## Observable signals today

| Signal | Source | Value | Classification |
| --- | --- | --- | --- |
| Supabase write failures | `console.error('Supabase ... error:', err)` in repositories | Error text + exception | Confirmed |
| Supabase config status | `src/lib/supabase.ts` (boolean) + `.env` presence | Is Supabase on? | Confirmed |
| localStorage read/write failures | `console.error` in `storage.ts` | Key + error | Confirmed |
| Dashboard/report data load errors | `console.error` in personal/student pages | Error text | Confirmed |
| Seed script progress | `scripts/seed-supabase.cjs` stdout/stderr | Counts, per-table | Confirmed |
| CI build+deploy | GitHub Actions logs | Step output | Confirmed |
| HTTP API reachability | Supabase client errors surfaced at call sites | Per-request error | Inferred |

## NOT observable today

| Signal | Gap | Classification |
| --- | --- | --- |
| Real user traffic | No analytics/tracing | Confirmed |
| Runtime errors aggregated | No error-reporting service | Confirmed |
| Supabase dashboard | External, operator-view only (not wired) | Inferred |
| Performance metrics | None | Confirmed |
| Uptime/SLO | None (static hosting; GitHub status is source) | Inferred |

## Where findings surface

| Path | For | Notes |
| --- | --- | --- |
| Browser DevTools console | Local/app runtime errors | Primary today |
| GitHub Actions job logs | Deploy + lint | `.github/workflows/deploy.yml` |
| Supabase Dashboard | DB health/usage | Manual |

## Recommended evolution (future)

| Item | Status | Stated as |
| --- | --- | --- |
| Error reporting (e.g. Sentry) | Planned | Proposed |
| Structured console logging | Considered | Proposed |
| Uptime/monitoring on Pages | Considered | Proposed |

## Related

- [../operations/README.md](README.md)
- [../operations/service-profile.md](service-profile.md)
- [../contracts/local-storage.md](../contracts/local-storage.md)