---
title: "ADR-005 — Local simulation sandbox"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# ADR-005 — Local simulation sandbox

> Language: EN | [Português (pt-BR)](../../pt-BR/decisions/adr-005-simulation-sandbox.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

## Status

Accepted (decision). Document lifecycle remains REVIEW.

## Date

2026-09-22 (documented; behavior present in `src/context/AuthContext.tsx` and `src/repositories/storage.ts`)

## Context

The trainer needs to preview the app exactly as a student experiences it, without polluting real data or locking into a fixed demo account.

## Problem

How to let the trainer "test as student" (any student, switchable) without writing anything permanent to Supabase or the student's localStorage?

## Decision

Implement a **local simulation sandbox**:

- `enterStudentSimulation(studentId)` builds an in-memory/session user and flips simulation mode on (`rafaela_simulation_mode`).
- `getItem`/`setItem` route through sessionStorage keys `sim_sandbox_<storageKey>` while active — permanent localStorage is never mutated.
- Repositories gate their Supabase writes on `isSimulationModeActive()` (never write to Supabase while simulating).
- `exitStudentSimulation()` clears every `sim_sandbox_*` key and the simulation flags, then restores the trainer session (`quickLogin('user-rafaela')`).

## Alternatives Considered

| Alternative | Pros | Cons | Why not chosen |
| --- | --- | --- | --- |
| Simulation as a real student account | No special casing | Writes real data; needs cleanup account | Rejected: "sem gravação" is a stated goal |
| Route-level demo `?demo=` param | Simple | Only cosmetic; still writes | Rejected: needs real isolation |
| Separate test Supabase project | Full isolation | Extra infra per demo | Rejected for MVP |

## Consequences

| Positive | Negative | Neutral |
| --- | --- | --- |
| Zero-risk trainer demo of the student app | Session-only data (lost on tab close) | Extra storage/sessionStorage keys |
| Switchable simulated student at runtime | Repositories got simulation awareness | — |
| No Supabase writes in demo path | Writes gated per-repository (must stay consistent) | — |

## Risks

| Risk | Mitigation | Classification |
| --- | --- | --- |
| A repository forgets the sim gate and writes through | Shadow write layer in `storage.ts` covers localStorage; Supabase gate duplicated per repo | Inferred |
| Sandbox keys leak after exit | `setSimulationMode(false)` removes `sim_sandbox_*` iteratively | Confirmed |

## Affected Components

| Component | Impact | Documentation |
| --- | --- | --- |
| auth | Simulation entry/exit | [../application/auth.md](../application/auth.md) |
| repositories | Sandbox reads/writes + write gating | [../application/repositories.md](../application/repositories.md) |
| student-portal | Simulation banner/switch | [../application/student-portal.md](../application/student-portal.md) |

## Affected Contracts

| Contract | Impact | Documentation |
| --- | --- | --- |
| local-storage | `sim_sandbox_*` shadow semantics | [../contracts/local-storage.md](../contracts/local-storage.md) |
| supabase-rest | Supabase writes skipped in simulation | [../contracts/supabase-rest.md](../contracts/supabase-rest.md) |

## Related Decisions

| ADR | Relationship |
| --- | --- |
| ADR-002 | Related (mock auth makes simulated switching trivial) |

## References

| Reference | Location |
| --- | --- |
| Simulation flag + sandbox helpers | `src/repositories/storage.ts` |
| Simulation session handlers | `src/context/AuthContext.tsx` |
| Training-page launcher | `src/layouts/PersonalLayout.tsx` |
| Student banner + switch | `src/layouts/StudentLayout.tsx` |