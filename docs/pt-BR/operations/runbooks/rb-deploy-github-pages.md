---
title: "Runbook — Re-deploy no GitHub Pages"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# rb-deploy-github-pages

> Language: pt-BR | [English](../../../en/operations/runbooks/rb-deploy-github-pages.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

## Trigger

- Site ausente, desatualizado ou errado após push na `main`.
- Re-deploy manual solicitado (sem mudança de código).

## Resultado esperado

A `main` mais recente é compilada em `dist/` e publicada na URL do Pages como artifact do Pages.

## Pré-condições

- Push feito na `main` ou OK para dispatch manual.
- GitHub Pages configurado com fonte "Deploy from a branch? não — GitHub Actions" (o workflow faz o deploy, então o Pages precisa permitir deploys por artifact de Actions).

## Passos

1. Abra a aba Actions → selecione "Deploy to GitHub Pages".
2. Inspecione o último run:
   - Se for o commit mais recente e o job estiver verde: nada a fazer (Pages já atualizado).
   - Se falhou: abra os logs e leia o passo que falhou (geralmente Build Production Bundle: env secrets ausentes ou erro de TS/oxlint).
3. Se a falha foi ambiental (secrets): vá em Settings → Secrets and variables → Actions → confirme que `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` existem.
4. Se a falha foi de build: corrija na fonte, faça push na `main` → um novo run começa (o workflow também suporta `workflow_dispatch` para re-runs manuais).
5. Re-rodar um job falho: abra o run → "Re-run all jobs".
6. Verifique: abra a URL do Pages (URL do environment no job de deploy) e confirme que o app carrega e as rotas resolvem (deep links tratados via `404.html`).

## Duração esperada

>10 min. `npm ci` + build + propagação do Pages.

## Escalonamento

- Pages continua quebrado após um run verde: abra a página de Settings do Pages e confirme que a fonte de deploy é "GitHub Actions".
- Saúde do GitHub: https://www.githubstatus.com

## Relacionados

- [../service-profile.md](../service-profile.md)
- [../observability.md](../observability.md)
- [../../decisions/adr-003-github-pages-spa.md](../../decisions/adr-003-github-pages-spa.md)