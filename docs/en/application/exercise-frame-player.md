---
title: "Component — exercise-frame-player"
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

> Language: EN | [Português (pt-BR)](../../pt-BR/application/exercise-frame-player.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

## Purpose

Local "mini-video" player that animates exercise frames (`1 → 2 → 3 → 2 → 1`) with play/cycle controls, speed selection, and phase scrubbing, plus a rest timer for workout execution.

## Responsibilities

| Responsibility | Evidence | Classification |
| --- | --- | --- |
| Interval-based frame loop with direction flip | `src/components/ui/ExerciseFramePlayer.tsx` | Confirmed |
| Preload frames for flicker-free playback | `useEffect` preloading `Image` | Confirmed |
| Speed control (0.5x/1x/1.5x) | `SPEED_MAP` | Confirmed |
| Phase scrubber (Início/Transição/Pico) | component phase state | Confirmed |
| Base-URL asset resolution for GitHub Pages | `src/utils/assets.ts` (`getAssetUrl`) | Confirmed |
| Rest timer with Web Audio beep and ±15s | `src/components/ui/RestTimer.tsx` | Confirmed |

## Behavior

| Behavior | Details | Classification |
| --- | --- | --- |
| Single frame | Falls back to `fallbackImage` (static) | Confirmed |
| Arrow cycle | `1→2→3→2→1` via direction state | Confirmed |
| Asset paths | `getAssetUrl` prepends `import.meta.env.BASE_URL` | Confirmed |
| Rest timer | Countdown, progress bar, beep on zero | Confirmed |

## Technology

| Field | Value | Classification |
| --- | --- | --- |
| Runner | React 19 (hooks + interval) | Confirmed |
| Audio | Web Audio API (A5-note beep) | Confirmed |
| Frames | Local SVG/PNG under `public/exercises/frames/` | Confirmed |

## Related

- [../application/exercise-catalog.md](exercise-catalog.md)
- [../application/student-portal.md](student-portal.md)