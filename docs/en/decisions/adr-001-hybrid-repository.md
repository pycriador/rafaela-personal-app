---
title: "ADR-001 — Hybrid repository pattern"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# ADR-001 — Hybrid repository pattern

> Language: EN | [Português (pt-BR)](../../pt-BR/decisions/adr-001-hybrid-repository.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

## Status

Accepted (decision). Document lifecycle remains REVIEW.

## Date

2026-09-22 (documented; pattern present in initial release commit `47f85da`)

## Context

The platform launched as an MVP and must work offline/demo without a configured backend, while remaining able to use a real hosted database when configured.

## Problem

How to support both a hosted PostgreSQL (Supabase) and a client-only demo mode without duplicating the data-access code?

## Decision

Use the **repository pattern** with a hybrid data source:

- Each domain has a repository interface.
- When `isSupabaseConfigured` is true, reads/writes hit Supabase REST (with localStorage mirrored as cache).
- On error or when unconfigured, repositories transparently fall back to localStorage.

## Alternatives Considered

| Alternative | Pros | Cons | Why not chosen |
| --- | --- | --- | --- |
| Single Supabase-only access | Simplest | No offline/demo mode | Rejected: demo matters |
| localStorage-only | No backend requests | No real database | Rejected: limits data growth |
| Full backend API layer | Clean contract | Extra infra + deploy complexity | Rejected for MVP scope |

## Consequences

| Positive | Negative | Neutral |
| --- | --- | --- |
| Offline/demo works out of the box | Dual write path complexity | Key versioning in localStorage |
| Scales to real DB when configured | Possible divergence between sources | Repository abstraction wherever data is read |
| No backend to operate | Cache freshness depends on repository logic | — |

## Risks

| Risk | Mitigation | Classification |
| --- | --- | --- |
| Divergence between Supabase and localStorage | Cache mirrored on successful reads | Inferred |
| Silent fallback hides backend outages | Errors logged via `console.error` | Inferred |
| Stale localStorage cache | Sources only when query returns nothing | Inferred |

## Affected Components

| Component | Impact | Documentation |
| --- | --- | --- |
| repositories | Implemented pattern | [../application/repositories.md](../application/repositories.md) |

## Affected Contracts

| Contract | Impact | Documentation |
| --- | --- | --- |
| supabase-rest | Primary read/write path | [../contracts/supabase-rest.md](../contracts/supabase-rest.md) |
| local-storage | Fallback/cache path | [../contracts/local-storage.md](../contracts/local-storage.md) |

## Related Decisions

| ADR | Relationship |
| --- | --- |
| ADR-002 | Related (mock auth also avoids backend dependency) |

## References

| Reference | Location |
| --- | --- |
| Storage helper | `src/repositories/storage.ts` |
| Config detection | `src/lib/supabase.ts` |
| Example repository | `src/repositories/studentRepository.ts` |