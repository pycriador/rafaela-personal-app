---
title: "Componente — exercise-frame-player"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
id: "CMP-006"
type: "Component"
---

# exercise-frame-player

> Language: pt-BR | [English](../../en/application/exercise-frame-player.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

## Propósito

Player local de "mini-vídeo" que anima frames de exercício (`1 → 2 → 3 → 2 → 1`) com controles de reprodução/ciclo, seleção de velocidade e seletor de fase, além de um timer de descanso para a execução do treino.

## Responsabilidades

| Responsabilidade | Evidência | Classification |
| --- | --- | --- |
| Loop de frames baseado em intervalo com inversão de direção | `src/components/ui/ExerciseFramePlayer.tsx` | Confirmed |
| Preload de frames para reprodução sem flicker | `useEffect` pré-carregando `Image` | Confirmed |
| Controle de velocidade (0.5x/1x/1.5x) | `SPEED_MAP` | Confirmed |
| Seletor de fase (Início/Transição/Pico) | estado de fase do componente | Confirmed |
| Resolução de assets com base URL para GitHub Pages | `src/utils/assets.ts` (`getAssetUrl`) | Confirmed |
| Timer de descanso com beep via Web Audio e ±15s | `src/components/ui/RestTimer.tsx` | Confirmed |

## Comportamento

| Comportamento | Detalhes | Classification |
| --- | --- | --- |
| Frame único | Cai para `fallbackImage` (estático) | Confirmed |
| Ciclo de seta | `1→2→3→2→1` via estado de direção | Confirmed |
| Caminhos de assets | `getAssetUrl` prefixa `import.meta.env.BASE_URL` | Confirmed |
| Timer de descanso | Contagem regressiva, barra de progresso, beep no zero | Confirmed |

## Tecnologia

| Campo | Valor | Classification |
| --- | --- | --- |
| Runner | React 19 (hooks + interval) | Confirmed |
| Áudio | Web Audio API (beep nota A5) | Confirmed |
| Frames | SVG/PNG locais em `public/exercises/frames/` | Confirmed |

## Relacionados

- [../application/exercise-catalog.md](exercise-catalog.md)
- [../application/student-portal.md](student-portal.md)