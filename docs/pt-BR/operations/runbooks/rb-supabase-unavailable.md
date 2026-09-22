---
title: "Runbook — Supabase indisponível"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# rb-supabase-unavailable

> Language: pt-BR | [English](../../../en/operations/runbooks/rb-supabase-unavailable.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

## Trigger

- `console.error('Supabase ... error:', ...)` em escritas, ou leituras retornando vazio apesar dos dados existirem.
- Relato de usuário de que mudanças de dados não estão persistindo.

## Resultado esperado

O serviço continua funcionando a partir do cache/fallback localStorage; a causa raiz (misconfig, outage ou mudança de política) é identificada e resolvida.

## Pré-condições

- Acesso às credenciais do Supabase Dashboard.
- Um cache de navegador atual é aceitável como conjunto de trabalho (ver [contracts/local-storage.md](../../contracts/local-storage.md)).

## Passos

1. Confirme o sinal de indisponibilidade: DevTools → Console numa sessão ativa; procure linhas `Supabase ... error` ou falhas de REST.
2. Determine qual caso se aplica:
   - **Não configurado por design**: `.env` ausente/não definido → o app está intencionalmente em modo only-localStorage. Nenhuma ação.
   - **Mal configurado**: `.env` com `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` erradas → corrija o `.env`, re-deploy (ou re-rodar `npm run dev`), push na `main`.
   - **Problema de Internet/DNS**: erros de `getItem` em `storage.ts` por período transitório → geralmente se resolve sozinho; o fallback carrega a sessão.
   - **Outage do Supabase / mudança de RLS**: checar status em `https://status.supabase.com`; verificar se as políticas seguem "allow all" conforme o contrato do app.
3. Durante o problema: leituras continuam pelo localStorage; novas escritas também persistem no localStorage. O app nunca falha duro com Supabase fora do ar.
4. Na recuperação: reinicie uma sessão para que os repositórios re-sincronizem do Supabase; note que o cache pode permanecer obsoleto até a próxima leitura/escrita com sucesso.

## Duração esperada

Variável; o modo localStorage remove a dependência bloqueante, então investigação de >10-15 min por padrão.

## Escalonamento

- Misconfig persistente: confira requisitos de env de `scripts/seed-supabase.cjs` vs o que está definido.
- Outage persistente: acompanhe a página de status do Supabase e o dashboard.

## Relacionados

- [../service-profile.md](../service-profile.md)
- [../observability.md](../observability.md)
- [../../contracts/supabase-rest.md](../../contracts/supabase-rest.md)
- [../../decisions/adr-001-hybrid-repository.md](../../decisions/adr-001-hybrid-repository.md)