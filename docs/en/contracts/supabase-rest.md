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
| Reads/writes to project tables via `supabase-js` | Supabase Auth/JWT flows |
| `scripts/seed-supabase.cjs` server-side POSTs | Realtime subscriptions (used in dashboard feed only) |
| **Storage bucket** `student-avatars` (avatar photos) | Supabase Storage for other media |

## Participants

| Participant | Role | Classification |
| --- | --- | --- |
| `repositories` (client) | consumer | Confirmed |
| `scripts/seed-supabase.cjs` | consumer (server-side) | Confirmed |
| Supabase project (PostgreSQL + REST) | producer | Confirmed |
| Supabase Storage bucket `student-avatars` | producer (photos) | Confirmed |

## Tables

| Table | Purpose | Classification |
| --- | --- | --- |
| `users` | Users with role (personal/student) | Confirmed |
| `students` | Student profiles and status | Confirmed |
| `exercises` | Exercise catalog | Confirmed |
| `workout_plans` | Prescribed plans with day JSONB; version fields (`version`, `cycle_name`, `valid_from`, `valid_until`, `notes`) mapped in code | Confirmed (columns: Proposed) |
| `workout_sessions` | Executed sessions; trainer-feedback fields (`trainer_feedback*`) mapped in code | Confirmed (columns: Proposed) |
| `workout_modifications` | Audit trail | Confirmed |
| `nutrition_plans` | Nutrition plans with meals JSONB | Confirmed |
| `activity_logs` | Activity feed | Confirmed |
| `notifications` | User notifications | Confirmed |
| `student_metrics` | Weight/body metrics | Confirmed |
| `student_messages` | Chat messages (referenced by `messageRepository`) | Proposed — **missing in migration SQL** |
| `workout_templates` | Template sets (referenced by `workoutTemplateRepository`) | Proposed — **missing in migration SQL** |

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

In **simulation mode**, repositories skip Supabase writes entirely (workout, message, and friends).

## Missing-tables fallback

`student_messages` and `workout_templates` (plus the version/feedback columns) are not created by `supabase/migrations/20260922_init_schema.sql`. Queries against a fresh project error and the repositories fall back to their localStorage lists. Treat these Supabase paths as `Proposed` until a migration creates them.

> See [../knowledge-gaps.md](../knowledge-gaps.md).

## Storage bucket

| Item | Value | Classification |
| --- | --- | --- |
| Bucket | `student-avatars` | Confirmed |
| Path pattern | `avatars/<student>-<epoch>.jpg` | Confirmed |
| Upload | `storage.from('student-avatars').upload(..., { upsert: true })` | Confirmed |
| Public URL | `storage.from('student-avatars').getPublicUrl(...)` | Confirmed |
| Fallback | Local Data URL when upload fails / unconfigured (`console.warn`) | Confirmed |

> The bucket is not created by the migration; a fresh project needs it provisioned manually.

## RLS / auth

- RLS enabled on all 10 tables in the migration with **"Allow all" open policies** (`USING (true) WITH CHECK (true)`). Client uses the anon key.
- No per-row ownership enforcement; mock-stage security.
- Tables created outside the migration (`student_messages`, `workout_templates`) would need equivalent policies manually.

> See [../security/overview.md](../security/overview.md) for implications.

## Related

- [../application/repositories.md](../application/repositories.md)
- [local-storage.md](local-storage.md)
- [../decisions/adr-001-hybrid-repository.md](../decisions/adr-001-hybrid-repository.md)