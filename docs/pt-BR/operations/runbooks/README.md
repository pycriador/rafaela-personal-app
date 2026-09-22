# Runbooks

> Language: pt-BR | [English](../../../en/operations/runbooks/README.md)
>
> Status: ACCEPTED
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

Índice da categoria de runbooks operacionais do Rafaela Personal App.

## Runbooks

| Runbook | Trigger | Nível |
| --- | --- | --- |
| [rb-deploy-github-pages.md](rb-deploy-github-pages.md) | Site ausente/desatualizado/incorreto após push na `main` | 3 (mudanças planejadas) |
| [rb-supabase-unavailable.md](rb-supabase-unavailable.md) | Supabase fora do ar, com erro ou mal configurado | 1-2 (reativo) |

## Orientação

- Siga os passos em ordem.
- Se um passo do runbook falhar, pare e reavalie em vez de improvisar sem anotar o desvio.

## Relacionados

- [../service-profile.md](../service-profile.md)
- [../observability.md](../observability.md)