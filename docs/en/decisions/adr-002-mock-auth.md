---
title: "ADR-002 — Mock authentication"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# ADR-002 — Mock authentication

> Language: EN | [Português (pt-BR)](../../pt-BR/decisions/adr-002-mock-auth.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

## Status

Accepted (decision). Document lifecycle remains REVIEW.

## Date

2026-09-22 (documented; behavior present in `src/context/AuthContext.tsx`)

## Context

The platform needed a demo-ready access model while the application is an MVP mock, without standing up a full identity provider.

## Problem

How to let users (trainer and students) access the right portal without building a real authentication backend?

## Decision

Implement **mock authentication** client-side:

- `login(email)` looks up the user by email in the `users` repository and **ignores the password**.
- `quickLogin(userId)` provides a one-click demo account switch.
- Session is persisted in localStorage (`rafaela_app_current_user_v1`).
- Routes are protected by role via `<ProtectedRoute>`.
- Real authentication (Supabase Auth / JWT) is a declared next step.

## Alternatives Considered

| Alternative | Pros | Cons | Why not chosen |
| --- | --- | --- | --- |
| Supabase Auth / JWT now | Real security | Config + email flows + redirect work | Deferred to a later iteration |
| Fully public access | Simplest | No role separation UX | Rejected: dual-portal needs roles |
| Custom server auth | Full control | Backend infra | Rejected for MVP |

## Consequences

| Positive | Negative | Neutral |
| --- | --- | --- |
| Instant demo on boarding (1-click switches) | No real security boundary | Session stored client-side |
| Role-based redirect shows dual portals | Password field is decorative only | — |
| No backend to run | Anyone with a known email can log in | — |

## Risks

| Risk | Mitigation | Classification |
| --- | --- | --- |
| Misleading appearance of auth | Documented as mock; maps to security overview | Confirmed |
| Unauthorized access with known emails | Acceptable in MVP demo; JWT is next step | Inferred |
| Session tampering in localStorage | No server-side enforcement exists | Inferred |

## Affected Components

| Component | Impact | Documentation |
| --- | --- | --- |
| auth | Implements the mock flow | [../application/auth.md](../application/auth.md) |

## Affected Contracts

| Contract | Impact | Documentation |
| --- | --- | --- |
| local-storage | Session persistence | [../contracts/local-storage.md](../contracts/local-storage.md) |

## Related Decisions

| ADR | Relationship |
| --- | --- |
| ADR-001 | Related (avoids backend dependency) |
| ADR-003 | Related (static hosting without auth infra) |

## References

| Reference | Location |
| --- | --- |
| Auth context | `src/context/AuthContext.tsx` |
| Route guard | `src/components/ProtectedRoute.tsx` |
| Security implications | [../security/overview.md](../security/overview.md) |