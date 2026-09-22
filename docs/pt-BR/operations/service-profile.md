---
title: "Operações — perfil de serviço"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# service-profile

> Language: pt-BR | [English](../../en/operations/service-profile.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

## De relance

| Campo | Valor | Classification |
| --- | --- | --- |
| Serviço | Rafaela Personal App (SPA de portal da treinadora + aluno) | Confirmed |
| Hospedagem | GitHub Pages (project Pages, artifact de Actions) | Confirmed |
| Entrega | Assets estáticos via edge da CDN | Inferred |
| Backend | Supabase (PostgreSQL hospedado + REST), opcional | Confirmed |
| Auth | Mock (client-side) | Confirmed |
| Linguagem/Framework | React 19 + TS, Vite 8, Tailwind 3 | Confirmed |

## Deploy

| Item | Detalhe | Classification |
| --- | --- | --- |
| Trigger | Push na `main` | Confirmed |
| Workflow | `.github/workflows/deploy.yml` | Confirmed |
| Runner | `ubuntu-24.04`, Node 24 | Confirmed |
| Build | `npm ci` + `npm run build` (tsc + vite) | Confirmed |
| Base URL | `/rafaela-personal-app/` (controlado por `GITHUB_PAGES=true`) | Confirmed |
| Artifact | `actions/upload-pages-artifact` → `deploy-pages` | Confirmed |

## Runtimes e processos

| Processo | Roda quando | Notas | Classification |
| --- | --- | --- | --- |
| App no navegador | Usuário abre o site | Sem runtime de servidor | Confirmed |
| `db:seed` (`node scripts/seed-supabase.cjs`) | Manual, sob demanda | Faz seed no Supabase a partir do `.env` | Confirmed |
| CI `build+deploy` | Todo push na `main` | Também roda `npm run lint` | Confirmed |

## Operações recorrentes

| Operação | Quando | Runbook |
| --- | --- | --- |
| Rebuild + redeploy do site | Sob demanda / após deploy falho | [runbooks/rb-deploy-github-pages.md](runbooks/rb-deploy-github-pages.md) |
| Lidar com indisponibilidade do Supabase | Em sintoma de outage | [runbooks/rb-supabase-unavailable.md](runbooks/rb-supabase-unavailable.md) |
| Seed no DB remoto | Projeto Supabase novo | `db:seed` (docs de deploy) |

## Variáveis de ambiente

| Variável | Requerida | Usada no build | Usada em runtime |
| --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | Não (opt-in) | Sim (inlined) | Sim (base REST) |
| `VITE_SUPABASE_ANON_KEY` | Não (com a URL) | Sim (inlined) | Sim (papel anon) |
| `SUPABASE_SECRET_KEY` | Para o seed | Não | Apenas no seed |

## Relacionados

- [../operations/README.md](README.md)
- [../decisions/adr-003-github-pages-spa.md](../decisions/adr-003-github-pages-spa.md)