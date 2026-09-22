---
title: "Component — personal-portal"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
id: "CMP-001"
type: "Component"
---

# personal-portal

> Language: EN | [Português (pt-BR)](../../pt-BR/application/personal-portal.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

## Purpose

Trainer-side experience of the Rafaela Personal App: manage students, exercises, workouts, nutrition, evolution, reports, and settings.

## Responsibilities

| Responsibility | Evidence | Classification |
| --- | --- | --- |
| Trainer dashboard with live KPIs and audit feed | `src/pages/personal/DashboardPage.tsx` | Confirmed |
| Student list/detail with tabs and URL pagination | `StudentsListPage.tsx`, `StudentDetailPage.tsx` | Confirmed |
| Student create/edit intake | `StudentCreateEditPage.tsx` | Confirmed |
| Workout builder with granular permissions | `WorkoutBuilderPage.tsx` | Confirmed |
| Workout template sets (CRUD, versioning, archive) | `WorkoutTemplatesPage.tsx` + `WorkoutTemplatesModal.tsx` | Confirmed |
| Exercise catalog CRUD + frame player + media assignment | `ExercisesPage.tsx`, `ExerciseMediaModal.tsx` | Confirmed |
| Nutrition management CRUD | `NutritionManagementPage.tsx` | Confirmed |
| Evolution overview (weight/load charts) | `EvolutionOverviewPage.tsx` | Confirmed |
| Reports + CSV + JSON backup exports | `ReportsPage.tsx`, `SettingsPage.tsx` | Confirmed |
| Settings: theme, DB counters, backup with hashed passwords | `SettingsPage.tsx` | Confirmed |
| Student full management: photos (Supabase Storage), password reset, archive/delete | `StudentManagerSection.tsx` | Confirmed |
| Trainer↔student message thread | `StudentTrainerChatSection.tsx` in `StudentDetailPage` | Confirmed |
| Session feedback (text, tag, rating) | `StudentDetailPage.tsx` (`updateSessionFeedback`) | Confirmed |
| Plan cycle versioning + activate version | `StudentDetailPage.tsx` (`activatePlanVersion`) | Confirmed |
| "Test as student" simulation launcher | `PersonalLayout.tsx` (`enterStudentSimulation`) | Confirmed |

## Non-Responsibilities

- Not responsible for executing workouts (student side).
- Does not implement real authentication.

## Routes

| Route | Page |
| --- | --- |
| `/personal/dashboard` | Dashboard |
| `/personal/students` | Student list |
| `/personal/students/new` | Create student |
| `/personal/students/:id` | Student detail |
| `/personal/exercises` | Exercise catalog + media |
| `/personal/templates` | Workout template sets |
| `/personal/workouts/new` | Workout builder |
| `/personal/nutrition` | Nutrition management |
| `/personal/evolution` | Evolution overview |
| `/personal/reports` | Reports |
| `/personal/settings` | Settings |

## Technology

| Field | Value | Classification |
| --- | --- | --- |
| Framework | React 19 + react-router-dom 7 | Confirmed |
| Layout | `PersonalLayout` (sidebar) | Confirmed |
| Charts | Recharts 3 | Confirmed |
| Icons | lucide-react | Confirmed |

## Dependencies

| Dependency | Purpose | Classification |
| --- | --- | --- |
| `repositories` | All data access | Confirmed |
| `auth` | Session + role guard | Confirmed |
| `exercise-frame-player` | Exercise animation preview | Confirmed |

## Related

- [../application/repositories.md](repositories.md)
- [../application/auth.md](auth.md)
- [../application/exercise-frame-player.md](exercise-frame-player.md)
- [../contracts/supabase-rest.md](../contracts/supabase-rest.md)