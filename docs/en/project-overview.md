---
title: "Rafaela Personal App — Project overview"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# Rafaela Personal App

> Language: EN | [Português (pt-BR)](../pt-BR/project-overview.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

## Purpose

Mobile-first web platform for the personal trainer **Rafaela** to manage students, prescribe workout plans with controlled flexibility, guide nutrition plans, track physical evolution, and audit — in real time — how each prescribed set is executed.

## Problem

A personal trainer needs to prescribe structured training, allow students to log real execution (weights, sets, skips, substitutions), and keep an auditable trail of Prescribed vs. Executed vs. Changed — without spreadsheets or fragmented tools.

## Scope

| In scope | Notes | Classification |
| --- | --- | --- |
| Trainer portal (`/personal/*`) | Dashboard, students, exercises, workout templates, workouts, nutrition, evolution, reports, settings | Confirmed |
| Student portal (`/student/*`) | Dashboard, workouts, active execution, history, evolution, nutrition, profile, trainer-message thread | Confirmed |
| Hybrid repository pattern | Supabase (PostgreSQL) primary with transparent localStorage fallback | Confirmed |
| Local exercise animation frames | 302 exercises, 1,002 local frame files (SVG/PNG) | Confirmed |
| Auditable workout modifications | Audit trail of weight/sets/reps/skips/substitutions | Confirmed |
| Backup and export | Full JSON backup with hashed passwords + per-table CSV exports | Confirmed |
| Mock authentication | Email lookup without real password validation | Confirmed |
| Workout template sets ("Séries Prontas") | Reusable routine templates with versioning and archive | Confirmed |
| Trainer↔student message thread | Categorized chat per student with seeded conversation | Confirmed |
| Plan versioning + session feedback | Cycle versions per student; trainer feedback with tag/rating | Confirmed |
| "Test as student" simulation | Session-scoped sandbox; no permanent writes | Confirmed |
| Custom exercise media | Per-exercise image gallery/upload/URL (local Data URLs; optional Supabase Storage) | Confirmed |

## Non-Goals

| Non-goal | Justification |
| --- | --- |
| Real authentication (Supabase Auth / JWT) | Declared next step; not implemented on the current tip | Unknown |
| Multi-user concurrent collaboration | App operated by a single trainer | Inferred |
| SLIs / SLOs with numeric targets | No production SLOs defined yet | Unknown |
| Formal disaster recovery | Not defined for this MVP stage | Unknown |
| Native mobile app | Web (PWA-styled), not native | Inferred |

## Stack

| Layer | Choice | Classification |
| --- | --- | --- |
| Frontend | React 19, TypeScript, Vite 8 | Confirmed |
| Styling | Tailwind CSS 3 (class-based dark mode), lucide-react icons | Confirmed |
| Charts | Recharts 3 | Confirmed |
| Effects | canvas-confetti | Confirmed |
| Data backend | Supabase (PostgreSQL + REST API) | Confirmed |
| Local fallback | localStorage (hybrid repository) | Confirmed |
| Exercise source | @bryllim/workout-guide (vector frames), Free Exercise DB for images | Confirmed |
| Linter | oxlint | Confirmed |

## Architecture

- Details: [architecture/overview.md](architecture/overview.md)
- Context: [architecture/system-context.md](architecture/system-context.md)
- Decisions: [decisions/README.md](decisions/README.md)

## Components

| Component | Responsibility | Doc |
| --- | --- | --- |
| personal-portal | Trainer UX: students, workouts, exercises, reports | [application/personal-portal.md](application/personal-portal.md) |
| student-portal | Student UX: execute workouts, history, evolution | [application/student-portal.md](application/student-portal.md) |
| repositories | Hybrid data access (Supabase + localStorage) | [application/repositories.md](application/repositories.md) |
| exercise-catalog | 302-exercise catalog and frame assets | [application/exercise-catalog.md](application/exercise-catalog.md) |
| auth | Mock auth + role-based route protection | [application/auth.md](application/auth.md) |
| exercise-frame-player | Animated local exercise frames + rest timer | [application/exercise-frame-player.md](application/exercise-frame-player.md) |
| workout-templates | Template sets CRUD, versioning, archive | [application/workout-templates.md](application/workout-templates.md) |
| student-chat | Trainer↔student message thread | [application/student-chat.md](application/student-chat.md) |

## Security / Ops / Gaps

- [security/overview.md](security/overview.md)
- [operations/service-profile.md](operations/service-profile.md)
- [knowledge-gaps.md](knowledge-gaps.md)