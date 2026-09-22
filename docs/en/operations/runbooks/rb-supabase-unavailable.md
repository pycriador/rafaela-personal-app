---
title: "Runbook — Supabase unavailable"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# rb-supabase-unavailable

> Language: EN | [Português (pt-BR)](../../../pt-BR/operations/runbooks/rb-supabase-unavailable.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

## Trigger

- `console.error('Supabase ... error:', ...)` on writes, or reads returning nothing despite data.
- Report from a user that data changes are not persisting.

## Outcome

Service keeps working from the localStorage cache/fallback; the root cause (misconfig, outage, or policy change) is identified and resolved.

## Preconditions

- Access to the Supabase Dashboard credentials.
- A current browser cache is acceptable as the working set (see [contracts/local-storage.md](../../contracts/local-storage.md)).

## Steps

1. Confirm sign of outage: DevTools → Console in a running session; look for `Supabase ... error` lines or REST failures.
2. Determine which case applies:
   - **Unconfigured by design**: `.env` absent / not set → app is intentionally in localStorage-only mode. No action.
   - **Misconfigured**: `.env` has wrong `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` → fix `.env`, redeploy (or re-run `npm run dev`), push to `main`.
   - **Internet/DNS issue**: `getItem` on `storage.ts` console errors for a transient period → usually resolves itself; fallback carries the session.
   - **Supabase outage / RLS change**: check status on `https://status.supabase.com`; verify policies are still "allow all" per app contract.
3. During the issue: reads continue from localStorage; new writes also persist to localStorage. The app never hard-fails on Supabase down.
4. On recovery: restart a session so repositories re-sync from Supabase; note the cache may remain stale until the next successful read/write.

## Expected Duration

Varies; localStorage mode removes the blocking dependency, so >10-15 min investigative by default.

## Escalation

- Persistent misconfig: check `scripts/seed-supabase.cjs` env requirements vs what is set.
- Persistent outage: follow-up in the Supabase status page and dashboard.

## Related

- [../service-profile.md](../service-profile.md)
- [../observability.md](../observability.md)
- [../../contracts/supabase-rest.md](../../contracts/supabase-rest.md)
- [../../decisions/adr-001-hybrid-repository.md](../../decisions/adr-001-hybrid-repository.md)