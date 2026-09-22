---
title: "Rafaela Personal App — Contexto para IA"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# Contexto para IA

> Language: pt-BR | [English](../en/ai-context.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

**Entrada primária para IA** deste repositório. Agentes e humanos que preparam prompts de IA devem começar aqui e seguir os links — não carreguem o corpus inteiro às cegas.

Esta página é intencionalmente curta. Os detalhes vivem nos documentos vinculados.

## Comece

1. Leia este arquivo.
2. Leia [project-overview.md](project-overview.md) para o escopo.
3. Carregue apenas a profundidade exigida pela pergunta.
4. Siga [knowledge-gaps.md](knowledge-gaps.md) para não inventar fatos.

## Cadeia recomendada

```text
Pergunta → Escopo → Contexto → Conhecimento → Evidência → Restrições → Resposta
```

## Hierarquia de níveis (0–5)

| Nível | Foco | Carregar quando |
| --- | --- | --- |
| **0** | Esta entrada + visão geral | Sempre para trabalho de IA neste repo |
| **1** | Contexto do sistema | “Como portais e camada de dados se conectam?” |
| **2** | Componentes e arquitetura | Estrutura, responsabilidades, fluxo de dados |
| **3** | Contratos | Interfaces de dados (Supabase REST, localStorage) |
| **4** | Operações e segurança | Operar, falhar, recuperar, proteger |
| **5** | Decisões e lacunas | Por que as decisões foram tomadas; desconhecidos |

## Ponteiros de regras principais

| Necessidade | Documento |
| --- | --- |
| O que é o app | [project-overview.md](project-overview.md) |
| Estrutura e fronteiras | [architecture/overview.md](architecture/overview.md), [architecture/system-context.md](architecture/system-context.md) |
| Responsabilidades dos componentes | [application/README.md](application/README.md) |
| Interfaces de dados | [contracts/README.md](contracts/README.md) |
| Postura de auth e segurança | [security/overview.md](security/overview.md) |
| Operar e recuperar | [operations/README.md](operations/README.md) |
| Por que as decisões foram tomadas | [decisions/README.md](decisions/README.md) |
| Não inventar fatos | [knowledge-gaps.md](knowledge-gaps.md) |

## Regras de resposta (para agentes)

- Não invente contas, tabelas, endpoints, métricas ou capacidades sem evidência neste repositório.
- Diferencie Confirmed (evidência em código/config) de Inferred/Proposed.
- O repositório usa auth mock: a senha é **ignorada**; o login é uma busca por e-mail (`src/context/AuthContext.tsx`). A UI de reset de senha gera credenciais, mas não muda o comportamento do login.
- Escritas da simulação "testar como aluno" vão para um sandbox de `sessionStorage` (`sim_sandbox_*`); escritas no Supabase são puladas durante a simulação (ver [contracts/local-storage.md](contracts/local-storage.md)).
- `student_messages` e `workout_templates` são referenciadas por repositórios mas **não estão na migration SQL** — trate os caminhos Supabase como Proposed (o localStorage é a fonte que funciona).
- O acesso a dados é híbrido: Supabase quando configurado, senão localStorage (ver [contracts/supabase-rest.md](contracts/supabase-rest.md) e [contracts/local-storage.md](contracts/local-storage.md)).
- Nunca documente valores de segredos. Referencie variáveis de `.env` apenas pelo nome.

## Não-objetivos

Nenhuma especificação de RAG, embeddings, vector DB, MCP, buscador ou chatbot vive neste repositório.

## Documentos relacionados

- [manifest.yaml](manifest.yaml)
- [knowledge-gaps.md](knowledge-gaps.md)
- [README.md](README.md)