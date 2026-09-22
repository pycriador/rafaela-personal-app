---
title: "Component — repositories"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
id: "CMP-003"
type: "Component"
---

# repositories

> Language: EN | [Português (pt-BR)](../../pt-BR/application/repositories.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

## Purpose

Hybrid data-access layer abstracting the data source: Supabase (PostgreSQL REST) when configured, with transparent localStorage fallback and cache.

## Responsibilities

| Responsibility | Evidence | Classification |
| --- | --- | --- |
| CRUD + filtered reads for all domains | `src/repositories/*.ts` (10 repositories) | Confirmed |
| Supabase fallback to localStorage on error/unconfigured | `src/lib/supabase.ts` (`isSupabaseConfigured`) | Confirmed |
| snake_case ↔ camelCase mapping | `mapFromDb`/`mapToDb` in repositories | Confirmed |
| In-memory filter application after fetch/search/status/etc. | Repository `getAll` implementations | Confirmed |
| localStorage seeding with initial data | `src/repositories/storage.ts` (`initStorage`) | Confirmed |
| Simulation sandbox read-through and shadow writes | `storage.ts` (`isSimulationModeActive`, `sim_sandbox_*`) | Confirmed |
| Skip Supabase writes while simulating | Repositories gate on `isSimulationModeActive()` | Confirmed |

## Repository inventory

| Repository | Domain table | Storage key |
| --- | --- | --- |
| `userRepository` | `users` | `rafaela_app_users_v1` |
| `studentRepository` | `students` | `rafaela_app_students_v1` |
| `exerciseRepository` | `exercises` | `rafaela_app_exercises_v3` |
| `workoutRepository` | `workout_plans`, `workout_sessions`, `workout_modifications` | `rafaela_app_workout_plans_v1`, `rafaela_app_sessions_v1`, `rafaela_app_modifications_v1` |
| `nutritionRepository` | `nutrition_plans` | `rafaela_app_nutrition_v1` |
| `activityRepository` | `activity_logs` | `rafaela_app_activities_v1` |
| `notificationRepository` | `notifications` | `rafaela_app_notifications_v1` |
| `messageRepository` | `student_messages` (best-effort) | `rafaela_app_student_messages_v1` |
| `workoutTemplateRepository` | `workout_templates` (best-effort) | `rafaela_app_workout_templates_v1` |
| `storage.ts` | — | seeds + `getItem`/`setItem` helpers + sandbox |

> `student_messages` and `workout_templates` are **not part of the migration SQL**. Queries against them fail in a fresh Supabase and transparently fall back to the localStorage lists (see [../contracts/supabase-rest.md](../contracts/supabase-rest.md)).

## Behavior

| Situation | Behavior | Classification |
| --- | --- | --- |
| `isSupabaseConfigured` true and query succeeds | Data from Supabase, mirrored to localStorage cache | Confirmed |
| Query errors or returns nothing | Falls back to localStorage list | Confirmed |
| `isSupabaseConfigured` false | localStorage only | Confirmed |
| Writes | Written to Supabase (best-effort) AND localStorage | Confirmed |
| Simulation active (`simulation mode`) | Supabase writes skipped; `getItem`/`setItem` route through `sim_sandbox_*` in sessionStorage | Confirmed |
| Supabase tables missing from migration | Best-effort queries fail silently; localStorage wins | Confirmed |

## Technology

| Field | Value | Classification |
| --- | --- | --- |
| Client | `@supabase/supabase-js` 2.x | Confirmed |
| Storage | `localStorage` (JSON) | Confirmed |
| Interfaces | One repository interface per domain | Confirmed |

## Non-Responsibilities

- Does not manage auth sessions (see `auth`).
- Does not define source-level consistency guarantees between Supabase and localStorage.

## Related

- [../contracts/supabase-rest.md](../contracts/supabase-rest.md)
- [../contracts/local-storage.md](../contracts/local-storage.md)
- [../decisions/adr-001-hybrid-repository.md](../decisions/adr-001-hybrid-repository.md)
- [../application/auth.md](auth.md)