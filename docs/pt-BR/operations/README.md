# Operações

> Language: pt-BR | [English](../../en/operations/README.md)
>
> Status: ACCEPTED
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

Categoria para como o Rafaela Personal App é deployado, executado e observado.

## Objetivo

Capturar a realidade operacional de um MVP de infraestrutura zero: hospedagem estática, Supabase como backend gerenciado, e runbooks para os modos de falha comuns.

## Guias e Runbooks

| Guia | Propósito | Tipo |
| --- | --- | --- |
| [service-profile.md](service-profile.md) | Hospedagem, triggers de deploy, runtimes, env vars | Perfil de serviço |
| [observability.md](observability.md) | O que é observável hoje e onde | Observabilidade |
| [runbooks/rb-deploy-github-pages.md](runbooks/rb-deploy-github-pages.md) | Reentregar o site no GitHub Pages | Runbook |
| [runbooks/rb-supabase-unavailable.md](runbooks/rb-supabase-unavailable.md) | Lidar com uma indisponibilidade do Supabase | Runbook |

## Variáveis de ambiente

Referenciadas (nunca valores aqui):

| Variável | Usada por | Notas |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | App + scripts | REQUERIDA para habilitar o caminho Supabase |
| `VITE_SUPABASE_ANON_KEY` | App | Pública por design |
| `SUPABASE_SECRET_KEY` | `db:seed` apenas | Nunca commitada |

> Veja [security/overview.md](../security/overview.md) para regras de tratamento de chaves.

## Relacionados

- [../architecture/overview.md](../architecture/overview.md)
- [../decisions/adr-003-github-pages-spa.md](../decisions/adr-003-github-pages-spa.md)