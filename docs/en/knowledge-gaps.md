---
title: "Rafaela Personal App — Knowledge gaps"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# Knowledge gaps

> Language: EN | [Português (pt-BR)](../pt-BR/knowledge-gaps.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

## Gaps

| Item | Status | Notes |
| --- | --- | --- |
| Real authentication (Supabase Auth / JWT) | Unknown | Mock auth only; LoginPage declares it as next step |
| SLIs / SLOs | Unknown / Not Defined | No numeric targets exist; do not invent |
| Formal threat model | Unknown | Security overview exists, no formal model |
| Observability platform integration | Not Documented | No metrics/tracing exporter configured |
| Formal disaster recovery / RPO / RTO | Not Defined | MVP stage |
| Real-time sync semantics | Partial | Realtime audit feed; write path details not exhaustively documented |
| Exercise count drift | Inferred | README states 32/96 while catalog ships 302/1,002 — docs should prefer current state above |
| Student experience edge-cases | Partial | Active workout UI behaviors partially documented only |

## Explicitly Not Applicable

| Item | Evidence |
| --- | --- |
| Message brokers / event bus | No queue infrastructure in repo |
| Server-side API framework | No backend runtime; Supabase hosted services only |
| CI for docs validation | No docs lint pipeline in this repo |

## About the framework

The `aiops-documentation` repository defines the **structure/format standard**. This repository is an adopting project: it mirrors the structure and conventions with **original content** lifted from this codebase. The standard itself remains authoritative for its own methodology.