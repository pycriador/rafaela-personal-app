---
title: "Visão geral de segurança"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# Segurança — Visão geral

> Language: pt-BR | [English](../../en/security/overview.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

## Propósito

Retrato honesto da postura de segurança do MVP do Rafaela Personal App: o que impõe, o que não impõe, e onde estão as fronteiras reais.

## Papéis e modelo de privilégios

| Papel | Privilégios hoje | Enforcement real | Classification |
| --- | --- | --- | --- |
| personal | Portal da treinadora + portal do aluno | Guard de rota por papel (client-side) | Confirmed |
| student | Somente portal do aluno | Guard de rota por papel (client-side) | Confirmed |

- As checagens de papel acontecem no navegador (`<ProtectedRoute>`); não há decisão de autorização no servidor.

## Fronteiras de confiança

| Fronteira | Descrição | Classification |
| --- | --- | --- |
| Sessão no navegador (localStorage) | A sessão é um id de usuário salvo; editável pelo usuário | Confirmed |
| Supabase REST (anon) | Políticas RLS abertas (`USING (true)` / `WITH CHECK (true)`) | Confirmed |
| Imagens de referência externas | URLs remotas carregadas pelo cliente em runtime | Confirmed |

## Lacunas conhecidas e perfil

> Este é um perfil de MVP/demo. Trate o seguinte como *intencional para demo*, não pronto para produção:

| Lacuna | Detalhe | Classification |
| --- | --- | --- |
| Auth mock (senha ignorada) | Login é apenas busca por e-mail | Confirmed |
| Sem sessão emitida por servidor | Sessão em localStorage, mutável no cliente | Confirmed |
| Políticas Supabase abertas | Anon key lê/grava todas as linhas | Confirmed |
| Inserts sem restrição | Cliente pode gravar linhas arbitrárias como anon | Confirmed |
| URLs de imagem de referência | Remotas, sem allowlist | Confirmed |

## Tratamento de chaves do Supabase

| Item | Prática | Classification |
| --- | --- | --- |
| `VITE_SUPABASE_ANON_KEY` | Agrupada pelo Vite no build; pública por design | Confirmed |
| Chave de seed (`SUPABASE_SECRET_KEY`) | Lida por `scripts/seed-supabase.cjs` do `.env` em runtime; NÃO commitada | Confirmed |
| Secrets do repo no CI | Env fornecida via `env:` no workflow de deploy | Confirmed |

> Nunca commite a chave de seed no repositório. `scripts/seed-supabase.cjs` espera `SUPABASE_SECRET_KEY` (ou `SUPABASE_PUBLISHABLE_KEY`) de um `.env` local, nunca um valor versionado.

## Endurecimento recomendado (futuro)

| Item | Status | Declarado como |
| --- | --- | --- |
| Auth real (JWT) | Próximo passo planejado | Proposed |
| RLS restritivo por papel | Planejado | Proposed |
| Validação no servidor | Planejado | Proposed |
| Allowlist/CDN para imagens de referência | Considerado | Proposed |

## Relacionados

- [../application/auth.md](../application/auth.md)
- [../contracts/supabase-rest.md](../contracts/supabase-rest.md)
- [../decisions/adr-002-mock-auth.md](../decisions/adr-002-mock-auth.md)