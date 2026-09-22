---
title: "Componente — student-chat"
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

> Language: pt-BR | [English](../../en/application/student-chat.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

## Propósito

Conversa categorizada treinadora↔aluno ("bate-papo exclusivo") anexada a cada aluno, com histórico inicial de demonstração e metadados por mensagem (mudança de exercício, variação de peso, link de sessão).

## Responsabilidades

| Responsabilidade | Evidência | Classification |
| --- | --- | --- |
| UI de conversa (lado treinadora) | `src/components/chat/StudentTrainerChatSection.tsx` | Confirmed |
| Mensagens categorizadas (assessment, motivation, etc.) | `StudentMessage.category` | Confirmed |
| Metadados de mensagem para cards ricos | `StudentMessage.metadata` (exercise, weights, sessionId) | Confirmed |
| Marcação de leitura para o outro papel | `messageRepository.markAsRead` | Confirmed |
| Exclusão de mensagem | `messageRepository.deleteMessage` | Confirmed |
| Persistência (Supabase best-effort + localStorage) | `messageRepository` (`student_messages`, `rafaela_app_student_messages_v1`) | Confirmed |

## Categorias de mensagem

| Categoria | Finalidade | Classification |
| --- | --- | --- |
| `general` | Conversa genérica | Confirmed |
| `weight_change` | Aviso de progressão de carga | Confirmed |
| `exercise_change` | Substituição/exercício trocado | Confirmed |
| `question` | Pergunta do aluno | Confirmed |
| `assessment` | Avaliação/orientação da treinadora | Confirmed |
| `motivation` | Incentivo | Confirmed |

## Localização na UI

| Visão | Seção | Classification |
| --- | --- | --- |
| Detalhe do aluno (treinadora) | `StudentTrainerChatSection` | Confirmed |
| Portal do aluno | Sem composer hoje; mensagens fazem parte dos dados seed usados na UI | Confirmed |

## Tecnologia

| Campo | Valor | Classification |
| --- | --- | --- |
| Repo | `messageRepository` | Confirmed |
| Storage key | `rafaela_app_student_messages_v1` | Confirmed |
| Tabela Supabase | `student_messages` (best-effort; **não na migration SQL**) | Confirmed |
| Dados iniciais | `initialStudentMessages` (conversa da Mariana) | Confirmed |

## Não-responsabilidades

- Não é chat em tempo real (sem subscriptions; fetch no load).
- Sem confirmação de leitura para o remetente no lado do aluno hoje.

## Relacionados

- [../application/repositories.md](repositories.md)
- [../application/personal-portal.md](personal-portal.md)
- [../contracts/local-storage.md](../contracts/local-storage.md)
- [../contracts/supabase-rest.md](../contracts/supabase-rest.md)