---
title: "Componente — repositories"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
id: "CMP-003"
type: "Component"
---

# repositories

> Language: pt-BR | [English](../../en/application/repositories.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

## Propósito

Camada de acesso híbrido a dados que abstrai a fonte: Supabase (PostgreSQL REST) quando configurado, com fallback transparente para localStorage e cache.

## Responsabilidades

| Responsabilidade | Evidência | Classification |
| --- | --- | --- |
| CRUD + leituras filtradas para todos os domínios | `src/repositories/*.ts` (8 repositórios) | Confirmed |
| Fallback do Supabase para localStorage em erro/não configurado | `src/lib/supabase.ts` (`isSupabaseConfigured`) | Confirmed |
| Mapeamento snake_case ↔ camelCase | `mapFromDb`/`mapToDb` nos repositórios | Confirmed |
| Aplicação de filtros em memória após fetch (busca/status/etc.) | Implementações de `getAll` nos repositórios | Confirmed |
| Seed de localStorage com dados iniciais | `src/repositories/storage.ts` (`initStorage`) | Confirmed |

## Inventário de repositórios

| Repositório | Tabela de domínio | Chave de storage |
| --- | --- | --- |
| `userRepository` | `users` | `rafaela_app_users_v1` |
| `studentRepository` | `students` | `rafaela_app_students_v1` |
| `exerciseRepository` | `exercises` | `rafaela_app_exercises_v3` |
| `workoutRepository` | `workout_plans`, `workout_sessions`, `workout_modifications` | `rafaela_app_workout_plans_v1`, `rafaela_app_sessions_v1`, `rafaela_app_modifications_v1` |
| `nutritionRepository` | `nutrition_plans` | `rafaela_app_nutrition_v1` |
| `activityRepository` | `activity_logs` | `rafaela_app_activities_v1` |
| `notificationRepository` | `notifications` | `rafaela_app_notifications_v1` |
| `storage.ts` | — | seeds + helpers `getItem`/`setItem` |

## Comportamento

| Situação | Comportamento | Classification |
| --- | --- | --- |
| `isSupabaseConfigured` true e consulta com sucesso | Dados do Supabase, espelhados em cache localStorage | Confirmed |
| Consulta com erro ou sem resultados | Cai para a lista em localStorage | Confirmed |
| `isSupabaseConfigured` false | Somente localStorage | Confirmed |
| Escritas | Gravadas no Supabase (best-effort) E no localStorage | Confirmed |

## Tecnologia

| Campo | Valor | Classification |
| --- | --- | --- |
| Cliente | `@supabase/supabase-js` 2.x | Confirmed |
| Storage | `localStorage` (JSON) | Confirmed |
| Interfaces | Uma interface de repositório por domínio | Confirmed |

## Não-responsabilidades

- Não gerencia sessões de auth (ver `auth`).
- Não define garantias de consistência em nível de fonte entre Supabase e localStorage.

## Relacionados

- [../contracts/supabase-rest.md](../contracts/supabase-rest.md)
- [../contracts/local-storage.md](../contracts/local-storage.md)
- [../decisions/adr-001-hybrid-repository.md](../decisions/adr-001-hybrid-repository.md)
- [../application/auth.md](auth.md)