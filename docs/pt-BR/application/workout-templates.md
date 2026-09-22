---
title: "Componente — workout-templates"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
id: "CMP-007"
type: "Component"
---

# workout-templates

> Language: pt-BR | [English](../../en/application/workout-templates.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

## Propósito

Conjuntos de rotinas de treino reutilizáveis ("Séries Prontas") com personalização completa, versionamento e arquivamento — consumidos pelo builder de treino e pela página de detalhe do aluno.

## Responsabilidades

| Responsabilidade | Evidência | Classification |
| --- | --- | --- |
| Lista/grid com filtros de categoria/nível/músculo | `src/pages/personal/WorkoutTemplatesPage.tsx` | Confirmed |
| CRUD de template com seletor de exercícios | `WorkoutTemplatesPage.tsx` + `WorkoutTemplatesModal.tsx` | Confirmed |
| Versionamento: duplicar como próxima versão, tag, arquivar anterior | `workoutTemplateRepository.duplicateVersion` | Confirmed |
| Alternar ativo / arquivado | `workoutTemplateRepository.toggleStatus` | Confirmed |
| Paginação via URL (6/página) | `WorkoutTemplatesPage.tsx` (search params) | Confirmed |
| Reuso no builder de treino e no detalhe do aluno | `WorkoutTemplatesModal` em `WorkoutBuilderPage`/`StudentDetailPage` | Confirmed |
| Persistência (Supabase best-effort + localStorage) | `workoutTemplateRepository` (`workout_templates`, `rafaela_app_workout_templates_v1`) | Confirmed |

## Destaques do modelo de dados

| Campo | Notas | Classification |
| --- | --- | --- |
| `version`, `versionTag` | ex. `v1.0`, `v2.0`; defaults aplicados no load | Confirmed |
| `parentId` | id do template de origem de um clone de versão | Confirmed |
| `isActive` | Default true; `toggleStatus` alterna | Confirmed |
| `estimatedMinutes`, `level`, `muscleFocus` | Metadados de card | Confirmed |
| `exercises` | `WorkoutExercise[]` com permissões por exercício (mesma forma dos workout plans) | Confirmed |

## Tecnologia

| Campo | Valor | Classification |
| --- | --- | --- |
| Página | React 19 + react-router-dom 7 | Confirmed |
| Repo | `workoutTemplateRepository` | Confirmed |
| Storage key | `rafaela_app_workout_templates_v1` | Confirmed |
| Tabela Supabase | `workout_templates` (best-effort; **não na migration SQL**) | Confirmed |

## Não-responsabilidades

- Não prescreve planos a um aluno (quem faz são os workout plans, via builder).
- Não autoriza acesso; herda o guard de papel do portal personal.

## Relacionados

- [../application/personal-portal.md](personal-portal.md)
- [../application/repositories.md](repositories.md)
- [../contracts/local-storage.md](../contracts/local-storage.md)
- [../contracts/supabase-rest.md](../contracts/supabase-rest.md)