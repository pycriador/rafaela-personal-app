# Decisões

> Language: pt-BR | [English](../../en/decisions/README.md)
>
> Status: ACCEPTED
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

Categoria para Architecture Decision Records (ADRs) do Rafaela Personal App.

## Objetivo

Registrar *por que* o sistema tem a forma atual. ADRs explicam decisões; documentos de arquitetura descrevem o que existe hoje.

## ADRs

| ADR | Título | Status | Resumo |
| --- | --- | --- | --- |
| [adr-001-hybrid-repository.md](adr-001-hybrid-repository.md) | Padrão repositório híbrido | Accepted | Supabase primário + fallback localStorage |
| [adr-002-mock-auth.md](adr-002-mock-auth.md) | Autenticação mock | Accepted | Busca por e-mail, senha ignorada; JWT como próximo passo |
| [adr-003-github-pages-spa.md](adr-003-github-pages-spa.md) | Deploy SPA no GitHub Pages | Accepted | SPA estática + redirect fallback 404 |
| [adr-004-local-video-frames.md](adr-004-local-video-frames.md) | Frames locais de exercício | Accepted | Frames vetoriais locais em vez de streaming |

## Orientação

- Mantenha ADRs concisos e focados na decisão.
- Referencie evidência (arquivos/config) em vez de copiá-la.
- Atualize ADRs quando decisões mudarem; nunca reescreva história silenciosamente.

## Relacionados

- [../architecture/overview.md](../architecture/overview.md)
- [../contracts/README.md](../contracts/README.md)