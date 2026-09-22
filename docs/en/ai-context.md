---
title: "Rafaela Personal App — AI context"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# AI Context

> Language: EN | [Português (pt-BR)](../pt-BR/ai-context.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

**Primary AI entry point** for this repository. Agents and humans preparing AI prompts should start here, then follow links — do not load the whole corpus blindly.

This page is intentionally short. Details live in linked documents.

## Start

1. Read this file.
2. Read [project-overview.md](project-overview.md) for scope.
3. Load only the depth required by the question.
4. Follow [knowledge-gaps.md](knowledge-gaps.md) to avoid inventing facts.

## Model Chain

```text
Question → Scope → Context → Knowledge → Evidence → Constraints → Answer
```

## Level Hierarchy (0–5)

| Level | Focus | Load when |
| --- | --- | --- |
| **0** | This entry + project-overview | Always for AI work on this repo |
| **1** | System context | “How do the portals and data layer fit together?” |
| **2** | Components & architecture | Structure, responsibilities, data flow |
| **3** | Contracts | Data interfaces (Supabase REST, localStorage) |
| **4** | Operations & security | Run, fail, recover, protect |
| **5** | Decisions & gaps | Why decisions were made; unknowns |

## Core Rule Pointers

| Need | Document |
| --- | --- |
| What the app is | [project-overview.md](project-overview.md) |
| Structure and boundaries | [architecture/overview.md](architecture/overview.md), [architecture/system-context.md](architecture/system-context.md) |
| Component responsibilities | [application/README.md](application/README.md) |
| Data interfaces | [contracts/README.md](contracts/README.md) |
| Auth & security posture | [security/overview.md](security/overview.md) |
| Operate & recover | [operations/README.md](operations/README.md) |
| Why decisions were made | [decisions/README.md](decisions/README.md) |
| Don't invent facts | [knowledge-gaps.md](knowledge-gaps.md) |

## Answering Rules (for agents)

- Do not invent accounts, tables, endpoints, metrics, or capabilities not evidenced in this repository.
- Distinguish Confirmed (evidence in code/config) from Inferred/Proposed.
- The repository uses mock auth: the password is **ignored**; login is an email lookup (`src/context/AuthContext.tsx`). Password-reset UI generates credentials but does not change login behavior.
- "Test as student" simulation writes go to a `sessionStorage` sandbox (`sim_sandbox_*`); Supabase writes are skipped while simulating (see [contracts/local-storage.md](contracts/local-storage.md)).
- `student_messages` and `workout_templates` are referenced by repositories but are **not in the migration SQL** — treat their Supabase paths as Proposed (localStorage is the working source).
- Data access is hybrid: Supabase when configured, otherwise localStorage (see [contracts/supabase-rest.md](contracts/supabase-rest.md) and [contracts/local-storage.md](contracts/local-storage.md)).
- Never document secret values. Reference `.env` variables by name only.

## Non-Goals

No RAG, embeddings, vector DB, MCP, search engine, or chatbot specification lives in this repository.

## Related Documents

- [manifest.yaml](manifest.yaml)
- [knowledge-gaps.md](knowledge-gaps.md)
- [README.md](README.md)