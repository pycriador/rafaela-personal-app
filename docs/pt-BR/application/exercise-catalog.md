---
title: "Componente — exercise-catalog"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
id: "CMP-004"
type: "Component"
---

# exercise-catalog

> Language: pt-BR | [English](../../en/application/exercise-catalog.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

## Propósito

Catálogo de exercícios usado na montagem de treinos e na execução do aluno: 302 exercícios, categorizados, com frames locais de animação e imagens de referência.

## Responsabilidades

| Responsabilidade | Evidência | Classification |
| --- | --- | --- |
| Fornecer catálogo em nível de módulo (`src/data/exercises.ts`) | 302 exercícios gerados | Confirmed |
| Preservar IDs legados dos 32 exercícios originais | mapeamento `slugToLegacyId` | Confirmed |
| Gerar alternativas automaticamente por categoria | `scripts/sync-all-exercises.cjs` | Confirmed |
| Detectar automaticamente frames locais SVG vs PNG | detecção de frames no script de sync | Confirmed |
| Assets locais de frames em `public/exercises/frames/` | 1.002 arquivos (frame-1..3) | Confirmed |
| Mapas de tradução de categoria/músculo/equipamento | traduções no script de sync | Confirmed |

## Fonte de dados

| Campo | Valor | Classification |
| --- | --- | --- |
| Pacote | `@bryllim/workout-guide` (manifest.json) | Confirmed |
| Imagens de referência | Free Exercise DB (yuhonas) — The Unlicense | Confirmed |
| Estilo de frames | Frames vetoriais/cartoon adaptados localmente | Confirmed |

## Não-responsabilidades

- Não é responsável pela lógica de prescrição de treino (o workout builder faz).
- Não serve imagens pela rede a partir de seu próprio servidor (frames são assets estáticos locais; imagens de referência são URLs externas).

## Relacionados

- [../application/exercise-frame-player.md](exercise-frame-player.md)
- Guia de origem de imagens (arquivo original no repo): [../../../src/data/EXERCISE_IMAGE_SOURCE.md](../../../src/data/EXERCISE_IMAGE_SOURCE.md)