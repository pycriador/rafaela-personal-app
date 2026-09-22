---
title: "Component — auth"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
id: "CMP-005"
type: "Component"
---

# auth

> Language: EN | [Português (pt-BR)](../../pt-BR/application/auth.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

## Purpose

Client-side session management with **mock authentication**: login is an email lookup, the password is ignored, and role-based route protection redirects users to their own portal.

## Responsibilities

| Responsibility | Evidence | Classification |
| --- | --- | --- |
| Session state (user, student profile, loading) | `src/context/AuthContext.tsx` | Confirmed |
| `login(email)` → finds user by email, **ignores password** | AuthContext `login` | Confirmed |
| `quickLogin(userId)` one-click demo switch | AuthContext `quickLogin` | Confirmed |
| Session persistence in localStorage | `rafaela_app_current_user_v1` | Confirmed |
| Role-based route guard | `src/components/ProtectedRoute.tsx` | Confirmed |
| Student profile loading for student sessions | AuthContext on login/init | Confirmed |
| `enterStudentSimulation(studentId)` — sandboxed student switch | AuthContext (`setSimulationMode`, `rafaela_sim_user`) | Confirmed |
| `exitStudentSimulation()` — restore trainer session | AuthContext (`rafaela_original_trainer_id`) | Confirmed |
| Password-reset UI (credential generator) | `StudentManagerSection.tsx` (sets name only; password not stored) | Confirmed |

## Threat-relevant facts

| Fact | Notes | Classification |
| --- | --- | --- |
| Password is never validated | `_pass` parameter unused in `login` | Confirmed |
| Login requires a known email in `users` | `getByEmail` | Confirmed |
| Session stored client-side | localStorage, readable by JS | Confirmed |
| No server-issued token | Supabase Auth not used | Confirmed |

> See [../security/overview.md](../security/overview.md) for implications.

## Technology

| Field | Value | Classification |
| --- | --- | --- |
| State | React Context | Confirmed |
| Persistence | localStorage (`rafaela_app_current_user_v1`) | Confirmed |
| Routing guard | react-router-dom `<ProtectedRoute>` | Confirmed |

## Related

- [../security/overview.md](../security/overview.md)
- [../decisions/adr-002-mock-auth.md](../decisions/adr-002-mock-auth.md)
- [../application/repositories.md](repositories.md)