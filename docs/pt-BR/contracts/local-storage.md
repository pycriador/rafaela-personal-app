---
title: "Contrato — armazenamento localStorage key-value"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
id: "CTR-002"
contract_type: "Storage"
---

# local-storage

> Language: pt-BR | [English](../../en/contracts/local-storage.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

## Propósito

Contrato de storage do navegador usado como fallback, cache, sessão e persistência de tema: valores serializados em JSON sob chaves com namespace.

## Participantes

| Participante | Papel | Classification |
| --- | --- | --- |
| `src/repositories/storage.ts` | producer (helpers de escrita/leitura) | Confirmed |
| `repositories` + `auth` + `theme` | consumer | Confirmed |

## Inventário de chaves

| Chave | Conteúdo | Versionamento |
| --- | --- | --- |
| `rafaela_app_users_v1` | users | v1 |
| `rafaela_app_students_v1` | students | v1 |
| `rafaela_app_exercises_v3` | exercises (frames cartoon) | v3 (bumped) |
| `rafaela_app_workout_plans_v1` | workout plans | v1 |
| `rafaela_app_sessions_v1` | workout sessions | v1 |
| `rafaela_app_modifications_v1` | modificações de auditoria | v1 |
| `rafaela_app_nutrition_v1` | nutrition plans | v1 |
| `rafaela_app_activities_v1` | activity logs | v1 |
| `rafaela_app_notifications_v1` | notifications | v1 |
| `rafaela_app_current_user_v1` | session user atual | v1 |
| `rafaela_app_theme_v1` | preferência de tema | v1 |
| `rafaela_app_custom_media_v1` | mídia custom de exercício (Data URLs) | v1 |
| `rafaela_app_student_messages_v1` | mensagens de chat por aluno | v1 |
| `rafaela_app_workout_templates_v1` | conjuntos de modelos de treino | v1 |

## Chaves de escopo de sessão (sandbox de simulação)

| Chave | Finalidade | Classification |
| --- | --- | --- |
| `rafaela_simulation_mode` | `'true'` durante a simulação | Confirmed |
| `rafaela_simulation_student_id` | id do aluno simulado | Confirmed |
| `rafaela_sim_user` | objeto de usuário simulado | Confirmed |
| `rafaela_original_trainer_id` | treinadora a restaurar na saída | Confirmed |
| `sim_sandbox_<storageKey>` | valor sombra para qualquer chave de storage durante a simulação | Confirmed |

## Serialização

| Detalhe | Valor | Classification |
| --- | --- | --- |
| Formato | JSON via `JSON.stringify`/`JSON.parse` | Confirmed |
| Seed | `initStorage()` grava datasets iniciais quando a chave não existe | Confirmed |
| Tratamento de erro | try/catch; `console.error` + fallback em falha | Confirmed |

## Comportamento

| Situação | Comportamento | Classification |
| --- | --- | --- |
| Chave ausente | `getItem` retorna fallback fornecido | Confirmed |
| JSON corrompido | `getItem` loga erro, retorna fallback | Confirmed |
| Falha de escrita (quota/private mode) | `setItem` loga erro, continua | Confirmed |
| Simulação ativa, chave tem valor sandbox | `getItem` retorna o valor sandbox primeiro | Confirmed |
| Simulação ativa, escrita | `setItem` grava `sim_sandbox_<key>` no sessionStorage apenas — localStorage nunca é mutado | Confirmed |
| Saída da simulação | Chaves sandbox (`sim_sandbox_*`, `rafaela_sim_user`, flags de simulação) removidas | Confirmed |

## Não-responsabilidades

- Não é fonte de verdade quando o Supabase está configurado (apenas cache/fallback).
- Não é adequado para binários grandes (quota do localStorage; mídia custom como Data URLs compartilha essa restrição).
- Sem compartilhamento entre origens.
- Escritas no sandbox não persistem após a sessão (por design).

## Relacionados

- [../application/repositories.md](../application/repositories.md)
- [supabase-rest.md](supabase-rest.md)
- [../decisions/adr-001-hybrid-repository.md](../decisions/adr-001-hybrid-repository.md)