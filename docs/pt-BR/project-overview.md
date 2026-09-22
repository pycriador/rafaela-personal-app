---
title: "Rafaela Personal App — Visão geral do projeto"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# Rafaela Personal App

> Language: pt-BR | [English](../en/project-overview.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

## Propósito

Plataforma web mobile-first para a personal trainer **Rafaela** gerenciar alunos, prescrever planos de treino com flexibilidade controlada, orientar planos nutricionais, acompanhar a evolução física e auditar, em tempo real, a execução de cada série prescrita.

## Problema

Uma personal trainer precisa prescrever treinos estruturados, permitir que os alunos registrem a execução real (cargas, séries, pulos, substituições) e manter uma trilha auditável de Prescrito vs. Executado vs. Alterado — sem planilhas ou ferramentas fragmentadas.

## Escopo

| No escopo | Notas | Classification |
| --- | --- | --- |
| Portal da personal (`/personal/*`) | Dashboard, alunos, exercícios, treinos, nutrição, evolução, relatórios, configurações | Confirmed |
| Portal do aluno (`/student/*`) | Dashboard, treinos, execução ativa, histórico, evolução, nutrição, perfil | Confirmed |
| Padrão repositório híbrido | Supabase (PostgreSQL) primário com fallback transparente para localStorage | Confirmed |
| Frames locais de animação | 302 exercícios, 1.002 arquivos locais de frames (SVG/PNG) | Confirmed |
| Modificações auditáveis de treino | Trilha de auditoria de cargas/séries/reps/pulos/substituições | Confirmed |
| Backup e exportação | Backup JSON completo com senhas com hash + exportações CSV por tabela | Confirmed |
| Autenticação mock | Busca por e-mail sem validação real de senha | Confirmed |

## Não-objetivos

| Não-objetivo | Justificativa |
| --- | --- |
| Autenticação real (Supabase Auth / JWT) | Próximo passo declarado; não implementado no head atual | Unknown |
| Colaboração concorrente multi-usuária | App operado por uma única treinadora | Inferred |
| SLIs / SLOs com alvos numéricos | Nenhum SLO de produção definido ainda | Unknown |
| Recovery formal de desastres | Não definido para este estágio de MVP | Unknown |
| App móvel nativo | Web (estilo PWA), não nativo | Inferred |

## Stack

| Camada | Escolha | Classification |
| --- | --- | --- |
| Frontend | React 19, TypeScript, Vite 8 | Confirmed |
| Estilização | Tailwind CSS 3 (dark mode por classe), ícones lucide-react | Confirmed |
| Gráficos | Recharts 3 | Confirmed |
| Efeitos | canvas-confetti | Confirmed |
| Backend de dados | Supabase (PostgreSQL + REST API) | Confirmed |
| Fallback local | localStorage (repositório híbrido) | Confirmed |
| Fonte de exercícios | @bryllim/workout-guide (frames vetoriais), Free Exercise DB para imagens | Confirmed |
| Linter | oxlint | Confirmed |

## Arquitetura

- Detalhes: [architecture/overview.md](architecture/overview.md)
- Contexto: [architecture/system-context.md](architecture/system-context.md)
- Decisões: [decisions/README.md](decisions/README.md)

## Componentes

| Componente | Responsabilidade | Doc |
| --- | --- | --- |
| personal-portal | UX da treinadora: alunos, treinos, exercícios, relatórios | [application/personal-portal.md](application/personal-portal.md) |
| student-portal | UX do aluno: executar treinos, histórico, evolução | [application/student-portal.md](application/student-portal.md) |
| repositories | Acesso híbrido a dados (Supabase + localStorage) | [application/repositories.md](application/repositories.md) |
| exercise-catalog | Catálogo de 302 exercícios e frames | [application/exercise-catalog.md](application/exercise-catalog.md) |
| auth | Auth mock + proteção de rotas por papel | [application/auth.md](application/auth.md) |
| exercise-frame-player | Frames locais animados de exercício + timer de descanso | [application/exercise-frame-player.md](application/exercise-frame-player.md) |

## Segurança / Ops / Lacunas

- [security/overview.md](security/overview.md)
- [operations/service-profile.md](operations/service-profile.md)
- [knowledge-gaps.md](knowledge-gaps.md)