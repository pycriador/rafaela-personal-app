# Documentation Index

> Language: EN | [Português (pt-BR)](../pt-BR/README.md)
>
> Status: ACCEPTED
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original for this repo)

Central index for the **Rafaela Personal App** documentation.

This repository defines **how** this project works and is operated: architecture, components, contracts, decisions, security, and operations. It follows the structure and format of the Engineering Documentation Standard (aiops-documentation) without copying its content.

Progressive chain: **Context → System → Components → Interfaces → Operations → Recovery**. Primary AI entry: [ai-context.md](ai-context.md).

## Start Here

| Document | Purpose |
| --- | --- |
| [project-overview.md](project-overview.md) | What this app is, scope, stack, non-goals |
| [ai-context.md](ai-context.md) | **Primary AI entry** — progressive context and navigation |
| [knowledge-gaps.md](knowledge-gaps.md) | Explicit gaps and unknowns |
| [architecture/README.md](architecture/README.md) | Architecture category hub |
| [application/README.md](application/README.md) | Application components |
| [contracts/README.md](contracts/README.md) | Interfaces and data contracts |
| [decisions/README.md](decisions/README.md) | Architecture Decision Records |
| [security/README.md](security/README.md) | Security overview |
| [operations/README.md](operations/README.md) | Operations, service profile, runbooks |

## Lifecycle and metadata

All substantive documents carry YAML frontmatter (`title`, `status`, `owner`, `created`, `updated`, `review_date`, `version`) and status tokens `DRAFT / REVIEW / ACCEPTED / DEPRECATED / ARCHIVED`. Classification tokens `Confirmed / Inferred / Unknown / Proposed` mark the confidence of each material statement.

| Status | Meaning |
| --- | --- |
| `DRAFT` | Work in progress; may be incomplete |
| `REVIEW` | Ready for or under review |
| `ACCEPTED` | Approved as current guidance or description |
| `DEPRECATED` | Still visible, but superseded or no longer primary |
| `ARCHIVED` | Retained for history; not active guidance |

## Categories

| Category | Path | Objective |
| --- | --- | --- |
| Architecture | [architecture/](architecture/) | Structure, boundaries, context |
| Application | [application/](application/) | Application components and responsibilities |
| Contracts | [contracts/](contracts/) | Data interfaces (Supabase REST, localStorage) |
| Decisions | [decisions/](decisions/) | Architecture Decision Records |
| Security | [security/](security/) | Auth model, trust boundaries, controls |
| Operations | [operations/](operations/) | Service profile, observability, runbooks |

## Recommended Reading Order

1. [project-overview.md](project-overview.md)
2. [architecture/overview.md](architecture/overview.md)
3. [architecture/system-context.md](architecture/system-context.md)
4. [application/README.md](application/README.md) — components
5. [contracts/README.md](contracts/README.md)
6. [security/overview.md](security/overview.md)
7. [operations/service-profile.md](operations/service-profile.md)
8. [decisions/README.md](decisions/README.md) for material decisions

## Completion Rule

A relevant technical change is not complete until required documentation is updated.

## Related

- [ai-context.md](ai-context.md)
- [knowledge-gaps.md](knowledge-gaps.md)
- [manifest.yaml](manifest.yaml)