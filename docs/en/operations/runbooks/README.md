# Runbooks

> Language: EN | [Português (pt-BR)](../../../pt-BR/operations/runbooks/README.md)
>
> Status: ACCEPTED
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

Category index for operational runbooks of the Rafaela Personal App.

## Runbooks

| Runbook | Trigger | Level |
| --- | --- | --- |
| [rb-deploy-github-pages.md](rb-deploy-github-pages.md) | Site missing/stale/incorrect after a `main` push | 3 (planned changes) |
| [rb-supabase-unavailable.md](rb-supabase-unavailable.md) | Supabase down, errored, or misconfigured | 1-2 (reactive) |

## Guidance

- Follow the steps in order.
- If a runbook step fails, stop and reassess rather than improvising without noting the deviation.

## Related

- [../service-profile.md](../service-profile.md)
- [../observability.md](../observability.md)