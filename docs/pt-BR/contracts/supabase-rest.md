---
title: "Contrato — acesso a dados via Supabase REST"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
id: "CTR-001"
contract_type: "Data"
---

# supabase-rest

> Language: pt-BR | [English](../../en/contracts/supabase-rest.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

## Propósito

Contrato de dados síncrono entre a aplicação (e scripts) e o projeto Supabase hospedado via REST + PostgreSQL.

## Escopo

| No escopo | Fora do escopo |
| --- | --- |
| Leituras/escritas nas 10 tabelas do projeto via `supabase-js` | Fluxos de Supabase Auth/JWT |
| POSTs server-side de `scripts/seed-supabase.cjs` | Subscrições realtime (usadas apenas no feed do dashboard) |

## Participantes

| Participante | Papel | Classification |
| --- | --- | --- |
| `repositories` (cliente) | consumer | Confirmed |
| `scripts/seed-supabase.cjs` | consumer (server-side) | Confirmed |
| Projeto Supabase (PostgreSQL + REST) | producer | Confirmed |

## Tabelas

| Tabela | Propósito | Classification |
| --- | --- | --- |
| `users` | Usuários com papel (personal/student) | Confirmed |
| `students` | Perfis de alunos e status | Confirmed |
| `exercises` | Catálogo de exercícios | Confirmed |
| `workout_plans` | Planos prescritos com dias JSONB | Confirmed |
| `workout_sessions` | Sessões executadas | Confirmed |
| `workout_modifications` | Trilha de auditoria | Confirmed |
| `nutrition_plans` | Planos nutricionais com refeições JSONB | Confirmed |
| `activity_logs` | Feed de atividade | Confirmed |
| `notifications` | Notificações de usuário | Confirmed |
| `student_metrics` | Métricas de peso/corpo | Confirmed |

## Operações usadas

| Operação | Representação | Classification |
| --- | --- | --- |
| Leitura | `.select().eq()/.ilike()/.order()/.single()` | Confirmed |
| Criação | `.insert()` | Confirmed |
| Upsert (seed) | `Prefer: resolution=merge-duplicates` | Confirmed |
| Atualização | `.update().eq()` | Confirmed |
| Exclusão | `.delete().eq()` | Confirmed |

## Mapeamento

| Direção | Regra | Classification |
| --- | --- | --- |
| DB → app | snake_case → camelCase (`mapFromDb`) | Confirmed |
| App → DB | camelCase → snake_case (`mapToDb`) | Confirmed |

## Defaults e fallback

O contrato só é exercido quando `isSupabaseConfigured` é true (com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` presentes). Caso contrário, os repositórios leem/escrevem somente em localStorage.

## RLS / auth

- RLS habilitado nas 10 tabelas com políticas **"Allow all" abertas** (`USING (true) WITH CHECK (true)`). O cliente usa a chave anon.
- Sem enforcement de ownership por linha; segurança de estágio mock.

> Ver [../security/overview.md](../security/overview.md) para implicações.

## Relacionados

- [../application/repositories.md](../application/repositories.md)
- [local-storage.md](local-storage.md)
- [../decisions/adr-001-hybrid-repository.md](../decisions/adr-001-hybrid-repository.md)