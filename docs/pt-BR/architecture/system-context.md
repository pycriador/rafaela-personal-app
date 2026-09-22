---
title: "Rafaela Personal App — Contexto do sistema"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# Contexto do sistema

> Language: pt-BR | [English](../../en/architecture/system-context.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

## Propósito

Posicionar o Rafaela Personal App no ecossistema: quem o usa, do que depende e o que fica fora da fronteira.

## Sistema

| Campo | Valor |
| --- | --- |
| Nome | Rafaela Personal App |
| Propósito | Plataforma de treino e nutrição com portais de treinadora e alunos |
| Owner | rafaela-app |
| Resumo da fronteira | SPA + dados hospedados no Supabase + fallback localStorage |

## Usuários

| Usuário | Necessidade | Interação |
| --- | --- | --- |
| Personal trainer (Rafaela) | Prescrever treinos/nutrição, auditar execução, acompanhar evolução | Browser → `/personal/*` |
| Alunos (Mariana, João, Carlos, Ana, Fernanda e outros) | Executar treinos, registrar séries, ver histórico/evolução | Browser → `/student/*` |

## Consumidores

| Consumidor | O que consomem | Contrato |
| --- | --- | --- |
| Portal da treinadora | Mesma camada híbrida de dados | [../contracts/supabase-rest.md](../contracts/supabase-rest.md) |
| Portal do aluno | Mesma camada híbrida de dados | fallback localStorage |
| Scripts de seed/backup | Supabase REST diretamente (server-side) | `scripts/seed-supabase.cjs` |

## Sistemas externos

| Sistema | Papel | Direção | Classification |
| --- | --- | --- | --- |
| Projeto Supabase | Hospedagem PostgreSQL + REST | outbound | Confirmed |
| GitHub Pages | Hospedagem estática da SPA | outbound | Confirmed |
| @bryllim/workout-guide | Pacote de catálogo de exercícios | build-time | Confirmed |
| Free Exercise DB (yuhonas) | Imagens de referência de exercícios | dados (URLs referenciadas) | Confirmed |

## Dependências

| Dependência | Tipo | Propósito | Classification |
| --- | --- | --- | --- |
| Supabase REST | runtime | Leituras/escritas (10 tabelas) | Confirmed |
| localStorage | runtime | Fallback + cache + sessão + tema | Confirmed |
| Build Vite | build | Bundle com base path | Confirmed |
| GitHub Actions | CI/CD | Build + deploy em push para `main` | Confirmed |

## Entradas / Saídas

| Direção | Descrição |
| --- | --- |
| Entrada | Interações da treinadora/alunos (HTTP via SPA hospedada) |
| Saída | Escritas no Supabase (sessões, modificações, atividade), exportações CSV/JSON, escritas em localStorage |

## Fronteiras de confiança

| Fronteira | Dentro | Fora |
| --- | --- | --- |
| Browser | Sessão em localStorage, chave anon, frames | Chaves de servidor/secret nunca expostas |
| Supabase | Políticas RLS "Allow all" (abertas) | — |
| CI | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` secrets | nunca no repo |

## Relacionados

- [overview.md](overview.md)
- [../application/README.md](../application/README.md)
- [../contracts/supabase-rest.md](../contracts/supabase-rest.md)
- [../contracts/local-storage.md](../contracts/local-storage.md)