---
title: "Security overview"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# Security — Overview

> Language: EN | [Português (pt-BR)](../../pt-BR/security/overview.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

## Purpose

Honest snapshot of the security posture of the Rafaela Personal App MVP: what it enforces, what it does not, and where the real boundaries are.

## Roles and privilege model

| Role | Privileges today | Real enforcement | Classification |
| --- | --- | --- | --- |
| personal | Trainer portal + student portal | Role-based route guard (client-side) | Confirmed |
| student | Student portal only | Role-based route guard (client-side) | Confirmed |

- Role checks happen in the browser (`<ProtectedRoute>`); there is no server-side authorization decision.

## Trust boundaries

| Boundary | Description | Classification |
| --- | --- | --- |
| Browser session (localStorage) | Session id is a saved user id; editable by the user | Confirmed |
| Browser simulation sandbox (sessionStorage) | Shadow writes during "Test as student"; gone on tab close | Confirmed |
| Supabase REST (anon) | Open RLS policies (`USING (true)` / `WITH CHECK (true)`) | Confirmed |
| Supabase Storage `student-avatars` | Public bucket URLs for student photos; Data-URL local fallback | Confirmed |
| External reference images | Remote URLs loaded by the client at runtime | Confirmed |

## Known gaps and profile

> This is an MVP-demo profile. Treat the following as *intentional for demo*, not production-ready:

| Gap | Detail | Classification |
| --- | --- | --- |
| Mock auth (password ignored) | Login is email lookup only | Confirmed |
| No server-issued session | localStorage session, client mutable | Confirmed |
| Open Supabase policies | Anon key reads/writes all rows | Confirmed |
| Unrestricted inserts | Client can write arbitrary rows as anon | Confirmed |
| Reference-image URLs | Remote, no allowlist | Confirmed |
| Custom media Data URLs | Stored in localStorage; exercise images may embed binary data | Confirmed |
| Public avatar bucket | `student-avatars` URLs guessable if filenames predictable | Inferred |
| Password reset is cosmetic | Generates/shows a password; login never validates it (see [auth](../application/auth.md)) | Confirmed |

## Supabase keys handling

| Item | Practice | Classification |
| --- | --- | --- |
| `VITE_SUPABASE_ANON_KEY` | Bundled by Vite at build time; public by design | Confirmed |
| Seed key (`SUPABASE_SECRET_KEY`) | Read by `scripts/seed-supabase.cjs` from `.env` at runtime; NOT committed | Confirmed |
| Repo secrets in CI | Env provided via `env:` in deploy workflow | Confirmed |

> Never commit the seed key into the repository. `scripts/seed-supabase.cjs` expects `SUPABASE_SECRET_KEY` (or `SUPABASE_PUBLISHABLE_KEY`) from a local `.env`, never a checked-in value.

## Recommended hardening (future)

| Item | Status | Stated as |
| --- | --- | --- |
| Real auth (JWT) | Planned next step | Proposed |
| Restrictive RLS per role | Planned | Proposed |
| Server-side validation | Planned | Proposed |
| Allowlist/CDN for reference images | Considered | Proposed |
| Private/signed URLs for avatar bucket | Considered | Proposed |

## Related

- [../application/auth.md](../application/auth.md)
- [../contracts/supabase-rest.md](../contracts/supabase-rest.md)
- [../decisions/adr-002-mock-auth.md](../decisions/adr-002-mock-auth.md)