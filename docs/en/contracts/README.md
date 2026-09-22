# Contracts

> Language: EN | [Português (pt-BR)](../../pt-BR/contracts/README.md)
>
> Status: ACCEPTED
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

Category for data interfaces and contracts of the Rafaela Personal App.

## Objective

Document the verifiable data boundaries between the application and its data sources: Supabase REST (hosted PostgreSQL) and localStorage (browser fallback/cache).

## Guidance

- Prefer links over re-stating schema details in multiple docs.
- Mark classifications honestly (Confirmed/Inferred/Unknown/Proposed).
- Never embed secret values.

## Contracts

| Contract | Kind | Purpose |
| --- | --- | --- |
| [supabase-rest.md](supabase-rest.md) | Data (REST) | 10 tables, operations, snake_case mapping |
| [local-storage.md](local-storage.md) | Storage (browser) | Keys, JSON serialization, seeding |

## Related

- [../application/repositories.md](../application/repositories.md)
- [../architecture/overview.md](../architecture/overview.md)