---
title: "ADR-004 — Local exercise video frames"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# ADR-004 — Local exercise video frames

> Language: EN | [Português (pt-BR)](../../pt-BR/decisions/adr-004-local-video-frames.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

## Status

Accepted (decision). Document lifecycle remains REVIEW.

## Date

2026-09-22 (documented; assets present under `public/exercises/frames/`)

## Context

Exercises need visual guidance during workouts. Full per-exercise videos are heavy for a free static SPA on GitHub Pages, and external media was to be minimized.

## Problem

How to show exercise motion affordably in a static SPA without streaming videos or depending on third-party CDNs?

## Decision

Use **locally bundled animation frames** instead of video:

- Each exercise ships a small set of local frames (typically `frame-1..3` per pose, SVG preferred; PNG fallback).
- Frames live under `public/exercises/frames/` and are detected at sync time by the catalog script.
- `ExerciseFramePlayer` animates them (`1→2→3→2→1`) at selectable speed.
- A `404` fallback pattern (`fallbackImage`) covers the case of missing frame assets.
- `getAssetUrl` resolves the base path at runtime for the sub-path hosting (GitHub Pages).
- Reference photos remain external URLs (Free Exercise DB), only as static reference.

## Alternatives Considered

| Alternative | Pros | Cons | Why not chosen |
| --- | --- | --- | --- |
| Full video per exercise | Realistic motion | Heavy bandwidth/storage for static hosting | Rejected for MVP |
| External video embed (YouTube etc.) | Zero file size | Network dependency + licensing noise | Rejected: offline/demo goal |
| Generic animation library | Consistent motion | Does not match 302 exercises | Rejected |

## Consequences

| Positive | Negative | Neutral |
| --- | --- | --- |
| Works offline; tiny payload | Frames are simplified, not video | Asset count grows with catalog |
| No streaming/CDN dependency | Frame quality varies SVGs vs PNGs | — |
| Static-on-Pages friendly | Sync must re-run when catalog grows | — |

## Risks

| Risk | Mitigation | Classification |
| --- | --- | --- |
| Missing frame files | `fallbackImage` + deterministic frame detection | Confirmed |
| Asset URL breaks on sub-path | `getAssetUrl` resolves `BASE_URL` | Confirmed |

## Affected Components

| Component | Impact | Documentation |
| --- | --- | --- |
| exercise-frame-player | Playback of local frames | [../application/exercise-frame-player.md](../application/exercise-frame-player.md) |
| exercise-catalog | Frame detection and assets | [../application/exercise-catalog.md](../application/exercise-catalog.md) |

## Related Decisions

| ADR | Relationship |
| --- | --- |
| ADR-003 | Related (static hosting budget drives frame approach) |

## References

| Reference | Location |
| --- | --- |
| Sync script | `scripts/sync-all-exercises.cjs` |
| Frames directory | `public/exercises/frames/` |
| Image sourcing guide | [../../../src/data/EXERCISE_IMAGE_SOURCE.md](../../../src/data/EXERCISE_IMAGE_SOURCE.md) |