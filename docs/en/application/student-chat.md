---
title: "Component — student-chat"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
id: "CMP-008"
type: "Component"
---

# student-chat

> Language: EN | [Português (pt-BR)](../../pt-BR/application/student-chat.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (structure reference — content is original)

## Purpose

Categorized trainer↔student conversation thread ("bate-papo exclusivo") attached to each student, with seeded demo history and per-message metadata (exercise change, weight change, session link).

## Responsibilities

| Responsibility | Evidence | Classification |
| --- | --- | --- |
| Conversation UI (trainer side) | `src/components/chat/StudentTrainerChatSection.tsx` | Confirmed |
| Categorized messages (assessment, motivation, etc.) | `StudentMessage.category` | Confirmed |
| Message metadata for rich cards | `StudentMessage.metadata` (exercise, weights, sessionId) | Confirmed |
| Read-marking for the other role | `messageRepository.markAsRead` | Confirmed |
| Message delete | `messageRepository.deleteMessage` | Confirmed |
| Persistence (Supabase best-effort + localStorage) | `messageRepository` (`student_messages`, `rafaela_app_student_messages_v1`) | Confirmed |

## Message categories

| Category | Purpose | Classification |
| --- | --- | --- |
| `general` | Generic conversation | Confirmed |
| `weight_change` | Load progression notice | Confirmed |
| `exercise_change` | Substitution/swapped exercise | Confirmed |
| `question` | Student question | Confirmed |
| `assessment` | Trainer evaluation/guidance | Confirmed |
| `motivation` | Encouragement | Confirmed |

## UI location

| View | Section | Classification |
| --- | --- | --- |
| Trainer student detail | `StudentTrainerChatSection` | Confirmed |
| Student portal | No composer today; messages are part of the seeded data used in trainer UI | Confirmed |

## Technology

| Field | Value | Classification |
| --- | --- | --- |
| Repo | `messageRepository` | Confirmed |
| Storage key | `rafaela_app_student_messages_v1` | Confirmed |
| Supabase table | `student_messages` (best-effort; **not in migration SQL**) | Confirmed |
| Initial data | `initialStudentMessages` (Mariana's conversation) | Confirmed |

## Non-Responsibilities

- Not a realtime chat (no subscriptions; fetches on load).
- No read receipts to the sender on the student side today.

## Related

- [../application/repositories.md](repositories.md)
- [../application/personal-portal.md](personal-portal.md)
- [../contracts/local-storage.md](../contracts/local-storage.md)
- [../contracts/supabase-rest.md](../contracts/supabase-rest.md)