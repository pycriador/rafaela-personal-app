# Application

> Language: EN | [Português (pt-BR)](../../pt-BR/application/README.md)
>
> Status: ACCEPTED
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

Category for application component documentation of the Rafaela Personal App.

## Objective

Describe application components, responsibilities, interfaces, configuration, and operational considerations.

## Guidance

- One component document per meaningful logical unit.
- Separate responsibilities from non-responsibilities.
- Link contracts instead of duplicating them.
- Keep claims classified (Confirmed/Inferred/Unknown/Proposed).

## Components

| Component | Responsibility | Doc |
| --- | --- | --- |
| personal-portal | Trainer UX (11 routes) | [personal-portal.md](personal-portal.md) |
| student-portal | Student UX (8 routes) | [student-portal.md](student-portal.md) |
| repositories | Hybrid data access (10 repositories) | [repositories.md](repositories.md) |
| exercise-catalog | 302-exercise catalog + frames | [exercise-catalog.md](exercise-catalog.md) |
| auth | Mock auth + route guards | [auth.md](auth.md) |
| exercise-frame-player | Animated frames + rest timer | [exercise-frame-player.md](exercise-frame-player.md) |
| workout-templates | Template sets + versioning | [workout-templates.md](workout-templates.md) |
| student-chat | Trainer↔student messages | [student-chat.md](student-chat.md) |

## Related

- [../architecture/overview.md](../architecture/overview.md)
- [../contracts/README.md](../contracts/README.md)