# Architecture

> Language: EN | [Português (pt-BR)](../../pt-BR/architecture/README.md)
>
> Status: ACCEPTED
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

Category for architecture documentation of the Rafaela Personal App.

## Objective

Describe the system structure, boundaries, context, main components, and data flows — current state only, with links to ADRs for decisions.

## Integration with other categories

```text
Context (system-context)
      │
      ▼
Components (application/)
      │
      ▼
Data interfaces (contracts/)
      │
      ▼
Operations & recovery (operations/)
```

## Guidance

- Prefer current state over desired state.
- Do not duplicate component descriptions here (they live in `application/`).
- Link contract docs instead of restating boundaries.
- Mark unknowns explicitly.

## Documents

| Document | Purpose |
| --- | --- |
| [overview.md](overview.md) | Architecture overview, main components, diagram |
| [system-context.md](system-context.md) | Actors, systems, dependencies, trust boundaries |

## Related

- [../application/README.md](../application/README.md)
- [../contracts/README.md](../contracts/README.md)
- [../decisions/README.md](../decisions/README.md)