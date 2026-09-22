# Decisions

> Language: EN | [Português (pt-BR)](../../pt-BR/decisions/README.md)
>
> Status: ACCEPTED
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

Category for Architecture Decision Records (ADRs) of the Rafaela Personal App.

## Objective

Record *why* the system is shaped as it is. ADRs explain decisions; architecture docs describe what exists today.

## ADRs

| ADR | Title | Status | Summary |
| --- | --- | --- | --- |
| [adr-001-hybrid-repository.md](adr-001-hybrid-repository.md) | Hybrid repository pattern | Accepted | Supabase primary + localStorage fallback |
| [adr-002-mock-auth.md](adr-002-mock-auth.md) | Mock authentication | Accepted | Email lookup, password ignored; JWT next step |
| [adr-003-github-pages-spa.md](adr-003-github-pages-spa.md) | GitHub Pages SPA deployment | Accepted | Static SPA + 404 redirect fallback |
| [adr-004-local-video-frames.md](adr-004-local-video-frames.md) | Local exercise video frames | Accepted | Local vector frames instead of streaming |

## Guidance

- Keep ADRs concise and decision-focused.
- Reference evidence (files/config) instead of copying it.
- Update ADRs when decisions change; never rewrite history silently.

## Related

- [../architecture/overview.md](../architecture/overview.md)
- [../contracts/README.md](../contracts/README.md)