---
title: "Component — workout-templates"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
id: "CMP-007"
type: "Component"
---

# workout-templates

> Language: EN | [Português (pt-BR)](../../pt-BR/application/workout-templates.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

## Purpose

Reusable workout routine sets ("Séries Prontas") with full customization, versioning, and archive — consumed by the work-out builder and the student detail page.

## Responsibilities

| Responsibility | Evidence | Classification |
| --- | --- | --- |
| Template list/grid with category/level/muscle filters | `src/pages/personal/WorkoutTemplatesPage.tsx` | Confirmed |
| Template CRUD with exercise picker | `WorkoutTemplatesPage.tsx` + `WorkoutTemplatesModal.tsx` | Confirmed |
| Versioning: duplicate as next version, tag, archive previous | `workoutTemplateRepository.duplicateVersion` | Confirmed |
| Toggle active / archived | `workoutTemplateRepository.toggleStatus` | Confirmed |
| URL pagination (6/page) | `WorkoutTemplatesPage.tsx` (search params) | Confirmed |
| Reuse inside workout builder and student detail | `WorkoutTemplatesModal` in `WorkoutBuilderPage`/`StudentDetailPage` | Confirmed |
| Persistence (Supabase best-effort + localStorage) | `workoutTemplateRepository` (`workout_templates`, `rafaela_app_workout_templates_v1`) | Confirmed |

## Data model highlights

| Field | Notes | Classification |
| --- | --- | --- |
| `version`, `versionTag` | e.g. `v1.0`, `v2.0`; defaults applied on load | Confirmed |
| `parentId` | origin template id of a version clone | Confirmed |
| `isActive` | Default true; `toggleStatus` flips it | Confirmed |
| `estimatedMinutes`, `level`, `muscleFocus` | Card metadata | Confirmed |
| `exercises` | `WorkoutExercise[]` with per-exercise permissions (same shape as workout plans) | Confirmed |

## Technology

| Field | Value | Classification |
| --- | --- | --- |
| Page | React 19 + react-router-dom 7 | Confirmed |
| Repo | `workoutTemplateRepository` | Confirmed |
| Storage key | `rafaela_app_workout_templates_v1` | Confirmed |
| Supabase table | `workout_templates` (best-effort; **not in migration SQL**) | Confirmed |

## Non-Responsibilities

- Does not prescribe plans to a student (workout plans do, via the builder).
- Does not authorize access; inherits role guard from the personal portal.

## Related

- [../application/personal-portal.md](personal-portal.md)
- [../application/repositories.md](repositories.md)
- [../contracts/local-storage.md](../contracts/local-storage.md)
- [../contracts/supabase-rest.md](../contracts/supabase-rest.md)