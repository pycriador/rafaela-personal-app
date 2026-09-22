---
title: "ADR-004 — Frames locais de vídeo de exercícios"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# ADR-004 — Frames locais de vídeo de exercícios

> Language: pt-BR | [English](../../en/decisions/adr-004-local-video-frames.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

## Status

Accepted (decisão). Ciclo de vida do documento permanece REVIEW.

## Data

2026-09-22 (documentado; assets presentes em `public/exercises/frames/`)

## Contexto

Exercícios precisam de guia visual durante os treinos. Vídeos completos por exercício são pesados para uma SPA estática gratuita no GitHub Pages, e mídia externa deveria ser minimizada.

## Problema

Como mostrar o movimento de exercícios de forma barata numa SPA estática, sem streaming de vídeo nem dependência de CDNs de terceiros?

## Decisão

Usar **frames de animação locais** em vez de vídeo:

- Cada exercício traz um pequeno conjunto de frames locais (tipicamente `frame-1..3` por pose, SVG preferencial; PNG como fallback).
- Frames ficam em `public/exercises/frames/` e são detectados em tempo de sync pelo script do catálogo.
- `ExerciseFramePlayer` os anima (`1→2→3→2→1`) em velocidade selecionável.
- Um padrão de fallback `404` (`fallbackImage`) cobre a ausência de assets de frame.
- `getAssetUrl` resolve o caminho base em runtime para a hospedagem em sub-caminho (GitHub Pages).
- Fotos de referência permanecem URLs externas (Free Exercise DB), apenas como referência estática.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não escolhida |
| --- | --- | --- | --- |
| Vídeo completo por exercício | Movimento realista | Bandwidth/storage pesado para hospedagem estática | Rejeitada para MVP |
| Embed de vídeo externo (YouTube etc.) | Zero file size | Dependência de rede + ruído de licenciamento | Rejeitada: meta offline/demo |
| Biblioteca de animação genérica | Movimento consistente | Não cobre 302 exercícios | Rejeitada |

## Consequências

| Positiva | Negativa | Neutra |
| --- | --- | --- |
| Funciona offline; payload pequeno | Frames são simplificados, não vídeo | Contagem de assets cresce com o catálogo |
| Sem dependência de streaming/CDN | Qualidade de frames varia entre SVG e PNG | — |
| Amigável a static-on-Pages | Sync precisa re-rodar quando o catálogo cresce | — |

## Riscos

| Risco | Mitigação | Classification |
| --- | --- | --- |
| Arquivos de frame ausentes | `fallbackImage` + detecção de frames determinística | Confirmed |
| URL de asset quebra em sub-caminho | `getAssetUrl` resolve `BASE_URL` | Confirmed |

## Componentes afetados

| Componente | Impacto | Documentação |
| --- | --- | --- |
| exercise-frame-player | Reprodução de frames locais | [../application/exercise-frame-player.md](../application/exercise-frame-player.md) |
| exercise-catalog | Detecção de frames e assets | [../application/exercise-catalog.md](../application/exercise-catalog.md) |

## Decisões relacionadas

| ADR | Relação |
| --- | --- |
| ADR-003 | Relacionada (orçamento de hospedagem estática direciona a abordagem de frames) |

## Referências

| Referência | Localização |
| --- | --- |
| Script de sync | `scripts/sync-all-exercises.cjs` |
| Diretório de frames | `public/exercises/frames/` |
| Guia de origem de imagens | [../../../src/data/EXERCISE_IMAGE_SOURCE.md](../../../src/data/EXERCISE_IMAGE_SOURCE.md) |