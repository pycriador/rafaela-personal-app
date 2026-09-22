---
title: "ADR-001 — Padrão repositório híbrido"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# ADR-001 — Padrão repositório híbrido

> Language: pt-BR | [English](../../en/decisions/adr-001-hybrid-repository.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

## Status

Accepted (decisão). Ciclo de vida do documento permanece REVIEW.

## Data

2026-09-22 (documentado; padrão presente no commit da release inicial `47f85da`)

## Contexto

A plataforma nasceu como MVP e precisa funcionar offline/demo sem backend configurado, além de poder usar um banco hospedado real quando configurado.

## Problema

Como suportar um PostgreSQL hospedado (Supabase) e um modo demo somente no cliente sem duplicar o código de acesso a dados?

## Decisão

Usar o **repository pattern** com fonte de dados híbrida:

- Cada domínio tem uma interface de repositório.
- Quando `isSupabaseConfigured` é true, leituras/escritas vão para o Supabase REST (com localStorage espelhado como cache).
- Em erro ou quando não configurado, os repositórios caem transparentemente para localStorage.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não escolhida |
| --- | --- | --- | --- |
| Acesso somente Supabase | Mais simples | Sem modo offline/demo | Rejeitada: demo importa |
| Somente localStorage | Sem requisições de backend | Sem banco real | Rejeitada: limita crescimento de dados |
| Camada full de API backend | Contrato limpo | Infra extra + complexidade de deploy | Rejeitada para escopo MVP |

## Consequências

| Positiva | Negativa | Neutra |
| --- | --- | --- |
| Offline/demo funciona de imediato | Complexidade de caminho de escrita duplo | Versionamento de chaves no localStorage |
| Escala para DB real quando configurado | Possível divergência entre fontes | Abstração de repositório onde quer que dados sejam lidos |
| Sem backend para operar | Frescor do cache depende da lógica do repositório | — |

## Riscos

| Risco | Mitigação | Classification |
| --- | --- | --- |
| Divergência entre Supabase e localStorage | Cache espelhado em leituras com sucesso | Inferred |
| Fallback silencioso esconde falhas de backend | Erros logados via `console.error` | Inferred |
| Cache localStorage obsoleto | Fontes somente quando a consulta retorna nada | Inferred |

## Componentes afetados

| Componente | Impacto | Documentação |
| --- | --- | --- |
| repositories | Padrão implementado | [../application/repositories.md](../application/repositories.md) |

## Contratos afetados

| Contrato | Impacto | Documentação |
| --- | --- | --- |
| supabase-rest | Caminho primário de leitura/escrita | [../contracts/supabase-rest.md](../contracts/supabase-rest.md) |
| local-storage | Caminho de fallback/cache | [../contracts/local-storage.md](../contracts/local-storage.md) |

## Decisões relacionadas

| ADR | Relação |
| --- | --- |
| ADR-002 | Relacionada (auth mock também evita dependência de backend) |

## Referências

| Referência | Localização |
| --- | --- |
| Helper de storage | `src/repositories/storage.ts` |
| Detecção de config | `src/lib/supabase.ts` |
| Exemplo de repositório | `src/repositories/studentRepository.ts` |