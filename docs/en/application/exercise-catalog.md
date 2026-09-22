---
title: "Component — exercise-catalog"
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

> Language: EN | [Português (pt-BR)](../../pt-BR/application/exercise-catalog.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

## Purpose

Exercise catalog used by workout building and student execution: 302 exercises, categorized, with local animation frames and reference images.

## Responsibilities

| Responsibility | Evidence | Classification |
| --- | --- | --- |
| Provide a module-level catalog (`src/data/exercises.ts`) | 302 exercises generated | Confirmed |
| Preserve legacy IDs for the original 32 exercises | `slugToLegacyId` mapping | Confirmed |
| Auto-generate alternatives by category | `scripts/sync-all-exercises.cjs` | Confirmed |
| Auto-detect SVG vs PNG local frames | sync script frame detection | Confirmed |
| Local frame assets under `public/exercises/frames/` | 1,002 files (frame-1..3) | Confirmed |
| Category/muscle/equipment translation maps | sync script translations | Confirmed |
| Per-exercise media assignment (image/upload/URL) | `ExerciseMediaModal.tsx` (library, upload, custom, url) | Confirmed |
| Custom media gallery persisted locally | `rafaela_app_custom_media_v1` (Data URLs) | Confirmed |
| URL-paginated exercise grid (6/page) | `ExercisesPage.tsx` (URL search params) | Confirmed |

## Data source

| Field | Value | Classification |
| --- | --- | --- |
| Package | `@bryllim/workout-guide` (manifest.json) | Confirmed |
| Reference images | Free Exercise DB (yuhonas) — The Unlicense | Confirmed |
| Frame style | Vector/cartoon frames adapted locally | Confirmed |

## Non-Responsibilities

- Not responsible for workout prescription logic (workout builder does).
- Does not serve images over network from its own server (frames are local static assets; reference images are external URLs).

## Related

- [../application/exercise-frame-player.md](exercise-frame-player.md)
- Image sourcing guide (original file in repo): [../../../src/data/EXERCISE_IMAGE_SOURCE.md](../../../src/data/EXERCISE_IMAGE_SOURCE.md)