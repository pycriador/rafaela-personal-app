---
title: "Contract — Supabase REST data access"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
id: "CTR-001"
contract_type: "Data"
---

# supabase-rest

> Language: EN | [Português (pt-BR)](../../pt-BR/contracts/supabase-rest.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

## Purpose

Synchronous data contract between the application (and scripts) and the hosted Supabase project via REST + PostgreSQL.

## Scope

| In scope | Out of scope |
| --- | --- |
| Reads/writes to the 10 project tables via `supabase-js` | Supabase Auth/JWT flows |
| `scripts/seed-supabase.cjs` server-side POSTs | Realtime subscriptions (used in dashboard feed only) |

## Participants

| Participant | Role | Classification |
| --- | --- | --- |
| `repositories` (client) | consumer | Confirmed |
| `scripts/seed-supabase.cjs` | consumer (server-side) | Confirmed |
| Supabase project (PostgreSQL + REST) | producer | Confirmed |

## Tables

| Table | Purpose | Classification |
| --- | --- | --- |
| `users` | Users with role (personal/student) | Confirmed |
| `students` | Student profiles and status | Confirmed |
| `exercises` | Exercise catalog | Confirmed |
| `workout_plans` | Prescribed plans with day JSONB | Confirmed |
| `workout_sessions` | Executed sessions | Confirmed |
| `workout_modifications` | Audit trail | Confirmed |
| `nutrition_plans` | Nutrition plans with meals JSONB | Confirmed |
| `activity_logs` | Activity feed | Confirmed |
| `notifications` | User notifications | Confirmed |
| `student_metrics` | Weight/body metrics | Confirmed |

## Operations used

| Operation | Representation | Classification |
| --- | --- | --- |
| Read | `.select().eq()/.ilike()/.order()/.single()` | Confirmed |
| Create | `.insert()` | Confirmed |
| Upsert (seed) | `Prefer: resolution=merge-duplicates` | Confirmed |
| Update | `.update().eq()` | Confirmed |
| Delete | `.delete().eq()` | Confirmed |

## Mapping

| Direction | Rule | Classification |
| --- | --- | --- |
| DB → app | snake_case → camelCase (`mapFromDb`) | Confirmed |
| App → DB | camelCase → snake_case (`mapToDb`) | Confirmed |

## Defaults and fallback

The contract is only exercised when `isSupabaseConfigured` is true (both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` present). Otherwise the repositories read/write localStorage only.

## RLS / auth

- RLS enabled on all 10 tables with **"Allow all" open policies** (`USING (true) WITH CHECK (true)`). Client uses the anon key.
- No per-row ownership enforcement; mock-stage security.

> See [../security/overview.md](../security/overview.md) for implications.

## Related

- [../application/repositories.md](../application/repositories.md)
- [local-storage.md](local-storage.md)
- [../decisions/adr-001-hybrid-repository.md](../decisions/adr-001-hybrid-repository.md)