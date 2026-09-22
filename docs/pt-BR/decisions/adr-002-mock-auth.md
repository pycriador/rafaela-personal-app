---
title: "ADR-002 — Autenticação mock"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# ADR-002 — Autenticação mock

> Language: pt-BR | [English](../../en/decisions/adr-002-mock-auth.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

## Status

Accepted (decisão). Ciclo de vida do documento permanece REVIEW.

## Data

2026-09-22 (documentado; comportamento presente em `src/context/AuthContext.tsx`)

## Contexto

A plataforma precisava de um modelo de acesso pronto para demo enquanto a aplicação é um MVP mock, sem montar um provedor de identidade completo.

## Problema

Como deixar usuários (personal e alunos) acessarem o portal correto sem construir um backend de autenticação real?

## Decisão

Implementar **autenticação mock** no cliente:

- `login(email)` busca o usuário por e-mail no repositório `users` e **ignora a senha**.
- `quickLogin(userId)` fornece troca de conta demo em um clique.
- Sessão é persistida em localStorage (`rafaela_app_current_user_v1`).
- Rotas são protegidas por papel via `<ProtectedRoute>`.
- Autenticação real (Supabase Auth / JWT) é um passo seguinte declarado.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não escolhida |
| --- | --- | --- | --- |
| Supabase Auth / JWT agora | Segurança real | Config + fluxos de e-mail + redirect | Adiada para iteração futura |
| Acesso totalmente público | Mais simples | Sem UX de separação de papéis | Rejeitada: portal duplo precisa de papéis |
| Auth custom em servidor | Controle total | Infra de backend | Rejeitada para MVP |

## Consequências

| Positiva | Negativa | Neutra |
| --- | --- | --- |
| Demo instantânea no onboarding (switches de 1 clique) | Sem fronteira de segurança real | Sessão armazenada no cliente |
| Redirect por papel mostra os dois portais | Campo de senha é apenas decorativo | — |
| Sem backend para rodar | Qualquer um com e-mail conhecido loga | — |

## Riscos

| Risco | Mitigação | Classification |
| --- | --- | --- |
| Aparência enganosa de auth | Documentado como mock; mapeado no security overview | Confirmed |
| Acesso não autorizado com e-mails conhecidos | Aceitável em demo MVP; JWT é o próximo passo | Inferred |
| Adulteração de sessão em localStorage | Não há enforcement server-side | Inferred |

## Componentes afetados

| Componente | Impacto | Documentação |
| --- | --- | --- |
| auth | Implementa o fluxo mock | [../application/auth.md](../application/auth.md) |

## Contratos afetados

| Contrato | Impacto | Documentação |
| --- | --- | --- |
| local-storage | Persistência de sessão | [../contracts/local-storage.md](../contracts/local-storage.md) |

## Decisões relacionadas

| ADR | Relação |
| --- | --- |
| ADR-001 | Relacionada (evita dependência de backend) |
| ADR-003 | Relacionada (hospedagem estática sem infra de auth) |

## Referências

| Referência | Localização |
| --- | --- |
| Auth context | `src/context/AuthContext.tsx` |
| Guard de rotas | `src/components/ProtectedRoute.tsx` |
| Implicações de segurança | [../security/overview.md](../security/overview.md) |