---
title: "Rafaela Personal App — System context"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# System context

> Language: EN | [Português (pt-BR)](../../pt-BR/architecture/system-context.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

## Purpose

Position the Rafaela Personal App in its ecosystem: who uses it, what it depends on, and what stays outside the boundary.

## System

| Field | Value |
| --- | --- |
| Name | Rafaela Personal App |
| Purpose | Workout & nutrition platform with trainer and student portals |
| Owner | rafaela-app |
| Boundary summary | SPA + Supabase hosted data + localStorage fallback |

## Users

| User | Need | Interaction |
| --- | --- | --- |
| Personal trainer (Rafaela) | Prescribe workouts/nutrition, audit execution, track evolution | Browser → `/personal/*` |
| Students (Mariana, João, Carlos, Ana, Fernanda and others) | Execute workouts, log sets, view history/evolution | Browser → `/student/*` |

## Consumers

| Consumer | What they consume | Contract |
| --- | --- | --- |
| Trainer portal | Same hybrid data layer | [../contracts/supabase-rest.md](../contracts/supabase-rest.md) |
| Student portal | Same hybrid data layer | localStorage fallback |
| Seed/backup scripts | Supabase REST directly (server-side) | `scripts/seed-supabase.cjs` |

## External systems

| System | Role | Direction | Classification |
| --- | --- | --- | --- |
| Supabase project | PostgreSQL + REST hosting | outbound | Confirmed |
| GitHub Pages | Static hosting of the SPA | outbound | Confirmed |
| @bryllim/workout-guide | Exercise catalog package | build-time | Confirmed |
| Free Exercise DB (yuhonas) | Reference exercise images | data (referenced URLs) | Confirmed |

## Dependencies

| Dependency | Type | Purpose | Classification |
| --- | --- | --- | --- |
| Supabase REST | runtime | Data reads/writes (10 tables) | Confirmed |
| localStorage | runtime | Fallback + cache + session + theme | Confirmed |
| Vite build | build | Bundle with base path | Confirmed |
| GitHub Actions | CI/CD | Build + deploy on push to `main` | Confirmed |

## Inputs / Outputs

| Direction | Description |
| --- | --- |
| Input | Trainer/student interactions (HTTP via hosted SPA) |
| Output | Supabase writes (sessions, modifications, activity), CSV/JSON exports, localStorage writes |

## Trust boundaries

| Boundary | Inside | Outside |
| --- | --- | --- |
| Browser | Session in localStorage, anon key, frame assets | Server/secret keys never exposed |
| Supabase | RLS "Allow all" policies (open) | — |
| CI | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` secrets | never in repo |

## Related

- [overview.md](overview.md)
- [../application/README.md](../application/README.md)
- [../contracts/supabase-rest.md](../contracts/supabase-rest.md)
- [../contracts/local-storage.md](../contracts/local-storage.md)