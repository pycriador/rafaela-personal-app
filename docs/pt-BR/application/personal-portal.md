---
title: "Componente — personal-portal"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
id: "CMP-001"
type: "Component"
---

# personal-portal

> Language: pt-BR | [English](../../en/application/personal-portal.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

## Propósito

Experiência do lado da treinadora no Rafaela Personal App: gerenciar alunos, exercícios, treinos, nutrição, evolução, relatórios e configurações.

## Responsabilidades

| Responsabilidade | Evidência | Classification |
| --- | --- | --- |
| Dashboard da treinadora com KPIs ao vivo e feed de auditoria | `src/pages/personal/DashboardPage.tsx` | Confirmed |
| Lista/detalhe de alunos com abas e paginação na URL | `StudentsListPage.tsx`, `StudentDetailPage.tsx` | Confirmed |
| Cadastro/edição de alunos | `StudentCreateEditPage.tsx` | Confirmed |
| Montagem de treinos com permissões granulares | `WorkoutBuilderPage.tsx` | Confirmed |
| Catálogo de exercícios CRUD + player de frames | `ExercisesPage.tsx` | Confirmed |
| Gerenciamento de nutrição CRUD | `NutritionManagementPage.tsx` | Confirmed |
| Visão de evolução (gráficos de peso/carga) | `EvolutionOverviewPage.tsx` | Confirmed |
| Relatórios + exportações CSV + backup JSON | `ReportsPage.tsx`, `SettingsPage.tsx` | Confirmed |
| Configurações: tema, contadores do DB, backup com senhas com hash | `SettingsPage.tsx` | Confirmed |
| Modelos/gabaritos de treino com versionamento | `WorkoutTemplatesPage.tsx` | Confirmed |
| Bate-papo com aluno + feedback de sessão + ativação de versão de plano | `StudentDetailPage.tsx` (`StudentTrainerChatSection`, `updateSessionFeedback`, `activatePlanVersion`) | Confirmed |
| Central de aluno (CRUD + fotos no Supabase Storage + reset de senha) | `StudentManagerSection.tsx` | Confirmed |
| Lançador da simulação "testar como aluno" | `PersonalLayout.tsx` (dropdown "Iniciar Simulação") | Confirmed |

## Não-responsabilidades

- Não é responsável por executar treinos (lado do aluno).
- Não implementa autenticação real.

## Rotas

| Rota | Página |
| --- | --- |
| `/personal/dashboard` | Dashboard |
| `/personal/students` | Lista de alunos |
| `/personal/students/new` | Criar aluno |
| `/personal/students/:id` | Detalhe do aluno |
| `/personal/exercises` | Catálogo de exercícios |
| `/personal/workouts/new` | Montagem de treino |
| `/personal/nutrition` | Gerenciamento de nutrição |
| `/personal/evolution` | Visão de evolução |
| `/personal/reports` | Relatórios |
| `/personal/templates` | Modelos/gabaritos de treino |
| `/personal/settings` | Configurações |

## Tecnologia

| Campo | Valor | Classification |
| --- | --- | --- |
| Framework | React 19 + react-router-dom 7 | Confirmed |
| Layout | `PersonalLayout` (sidebar) | Confirmed |
| Gráficos | Recharts 3 | Confirmed |
| Ícones | lucide-react | Confirmed |

## Dependências

| Dependência | Propósito | Classification |
| --- | --- | --- |
| `repositories` | Todo o acesso a dados | Confirmed |
| `auth` | Sessão + guard de papel | Confirmed |
| `exercise-frame-player` | Pré-visualização de animação de exercício | Confirmed |

## Relacionados

- [../application/repositories.md](repositories.md)
- [../application/auth.md](auth.md)
- [../application/exercise-frame-player.md](exercise-frame-player.md)
- [../contracts/supabase-rest.md](../contracts/supabase-rest.md)