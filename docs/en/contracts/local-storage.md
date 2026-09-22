---
title: "Contract — localStorage key-value store"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
id: "CTR-002"
contract_type: "Storage"
---

# local-storage

> Language: EN | [Português (pt-BR)](../../pt-BR/contracts/local-storage.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

## Purpose

Browser storage contract used as fallback, cache, session, and theme persistence: JSON-serialized values under namespaced keys.

## Participants

| Participant | Role | Classification |
| --- | --- | --- |
| `src/repositories/storage.ts` | producer (write/read helpers) | Confirmed |
| `repositories` + `auth` + `theme` | consumer | Confirmed |

## Key inventory

| Key | Content | Versioning |
| --- | --- | --- |
| `rafaela_app_users_v1` | users | v1 |
| `rafaela_app_students_v1` | students | v1 |
| `rafaela_app_exercises_v3` | exercises (cartoon frames) | v3 (bumped) |
| `rafaela_app_workout_plans_v1` | workout plans | v1 |
| `rafaela_app_sessions_v1` | workout sessions | v1 |
| `rafaela_app_modifications_v1` | audit modifications | v1 |
| `rafaela_app_nutrition_v1` | nutrition plans | v1 |
| `rafaela_app_activities_v1` | activity logs | v1 |
| `rafaela_app_notifications_v1` | notifications | v1 |
| `rafaela_app_current_user_v1` | current session user | v1 |
| `rafaela_app_theme_v1` | theme preference | v1 |

## Serialization

| Detail | Value | Classification |
| --- | --- | --- |
| Format | JSON via `JSON.stringify`/`JSON.parse` | Confirmed |
| Seed | `initStorage()` writes initial datasets when key absent | Confirmed |
| Error handling | try/catch; `console.error` + fallback on failure | Confirmed |

## Behavior

| Situation | Behavior | Classification |
| --- | --- | --- |
| Key absent | `getItem` returns provided fallback | Confirmed |
| Corrupt JSON | `getItem` logs error, returns fallback | Confirmed |
| Write failure (quota/private mode) | `setItem` logs error, continues | Confirmed |

## Non-Responsibilities

- Not a source of truth when Supabase is configured (cache/fallback only).
- Not suitable for large binaries (localStorage quota).
- No cross-origin sharing.

## Related

- [../application/repositories.md](../application/repositories.md)
- [supabase-rest.md](supabase-rest.md)
- [../decisions/adr-001-hybrid-repository.md](../decisions/adr-001-hybrid-repository.md)