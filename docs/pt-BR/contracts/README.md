# Contratos

> Language: pt-BR | [English](../../en/contracts/README.md)
>
> Status: ACCEPTED
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

Categoria para interfaces de dados e contratos do Rafaela Personal App.

## Objetivo

Documentar as fronteiras de dados verificáveis entre a aplicação e suas fontes: Supabase REST (PostgreSQL hospedado) e localStorage (fallback/cache do navegador).

## Orientação

- Prefira links a reafirmar detalhes de schema em múltiplos documentos.
- Marque classificações honestamente (Confirmed/Inferred/Unknown/Proposed).
- Nunca incorpore valores de segredos.

## Contratos

| Contrato | Tipo | Propósito |
| --- | --- | --- |
| [supabase-rest.md](supabase-rest.md) | Dados (REST) | 10 tabelas, operações, mapeamento snake_case |
| [local-storage.md](local-storage.md) | Storage (browser) | Chaves, serialização JSON, seeding |

## Relacionados

- [../application/repositories.md](../application/repositories.md)
- [../architecture/overview.md](../architecture/overview.md)