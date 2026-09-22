---
title: "ADR-003 — Deploy SPA no GitHub Pages"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# ADR-003 — Deploy SPA no GitHub Pages

> Language: pt-BR | [English](../../en/decisions/adr-003-github-pages-spa.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

## Status

Accepted (decisão). Ciclo de vida do documento permanece REVIEW.

## Data

2026-09-22 (documentado; workflow presente em `.github/workflows/deploy.yml`)

## Contexto

O app é uma SPA Vite e precisava de hospedagem estática gratuita com deploy automático a partir da `main`.

## Problema

Como hospedar um app React client-side com deploys automáticos e URLs amigáveis a SPA, a custo zero de infraestrutura?

## Decisão

Deploy no **GitHub Pages** via workflow do GitHub Actions:

- Trigger: push na `main`.
- Build em `ubuntu-24.04` com Node 24 e `node_modules` em cache (`actions/setup-node` cache).
- Variáveis de ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) fornecidas como secrets do repo.
- Vite `base: '/rafaela-personal-app/'`, com `GITHUB_PAGES=true` controlando a base URL em runtime.
- Workflow configura Pages branch artifacting e deploy a partir do **artifact** de Actions.
- HTML de redirect 404 (`404.html`) replicando o fallback SPA foi introduzido para deep links.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não escolhida |
| --- | --- | --- | --- |
| Netlify/Vercel | Stream/native SPA rewrite | Conta + config extra | Rejeitada: hospedagem GitHub-only preferida |
| VPS auto-hospedado | Controle total | Carga operacional | Rejeitada para MVP |
| GitHub Pages somente root estático | Simples | Sem fallback de rota para deep links | Rejeitada: rotas SPA precisam de fallback (404.html) |

## Consequências

| Positiva | Negativa | Neutra |
| --- | --- | --- |
| Hospedagem + TLS grátis via GitHub | Sem config de domínio custom ainda | Rotas vivem sob sub-caminho do repo |
| Entrega estática via CDN | Hosting estático re-construído em cada mudança no monorepo | — |
| Deploy em todo push na `main` | Rebuild completo por deploy | — |

## Riscos

| Risco | Mitigação | Classification |
| --- | --- | --- |
| Deep links 404 | Fallback SPA via `404.html` | Confirmed |
| Secrets de env expostos no bundle | Uso de anon key apenas, nunca service role | Confirmed |
| Build quebrado derruba deploy | CI roda `npm run build` + lint a cada push | Inferred |

## Componentes afetados

| Componente | Impacto | Documentação |
| --- | --- | --- |
| Build/CI | Pipeline de deploy | [../operations/runbooks/rb-deploy-github-pages.md](../operations/runbooks/rb-deploy-github-pages.md) |

## Contratos afetados

| Contrato | Impacto | Documentação |
| --- | --- | --- |
| supabase-rest | Project URL/site usa base URL de sub-caminho do repo | [../contracts/supabase-rest.md](../contracts/supabase-rest.md) |

## Decisões relacionadas

| ADR | Relação |
| --- | --- |
| ADR-002 | Relacionada (hospedagem estática sem infra de auth) |
| ADR-001 | Relacionada (config-driven `VITE_SUPABASE_URL`) |

## Referências

| Referência | Localização |
| --- | --- |
| Workflow de deploy | `.github/workflows/deploy.yml` |
| Config de build | `vite.config.ts` |
| Base URL em runtime | `src/utils/assets.ts` (`getAssetUrl`) |