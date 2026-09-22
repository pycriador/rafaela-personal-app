# Operations

> Language: EN | [Português (pt-BR)](../../pt-BR/operations/README.md)
>
> Status: ACCEPTED
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

Category for how the Rafaela Personal App is deployed, run, and observed.

## Objective

Capture the operational reality of a zero-infrastructure MVP: static hosting, Supabase as managed backend, and runbooks for the common failure modes.

## Guides \& Runbooks

| Guide | Purpose | Type |
| --- | --- | --- |
| [service-profile.md](service-profile.md) | Hosting, deploy triggers, runtimes, env vars | Service profile |
| [observability.md](observability.md) | What is observable today and where | Observability |
| [runbooks/rb-deploy-github-pages.md](runbooks/rb-deploy-github-pages.md) | Redeliver the site on GitHub Pages | Runbook |
| [runbooks/rb-supabase-unavailable.md](runbooks/rb-supabase-unavailable.md) | Handle a Supabase outage | Runbook |

## Environment variables

Referenced (never values here):

| Variable | Used by | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | App + scripts | REQUIRED to enable Supabase path |
| `VITE_SUPABASE_ANON_KEY` | App | Public by design |
| `SUPABASE_SECRET_KEY` | `db:seed` only | Never committed |

> See [security/overview.md](../security/overview.md) for key-handling rules.

## Related

- [../architecture/overview.md](../architecture/overview.md)
- [../decisions/adr-003-github-pages-spa.md](../decisions/adr-003-github-pages-spa.md)