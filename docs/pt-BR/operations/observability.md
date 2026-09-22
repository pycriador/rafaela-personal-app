---
title: "Operações — observabilidade"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# observability

> Language: pt-BR | [English](../../en/operations/observability.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

## Propósito

Descrever o que é observável no Rafaela Personal App hoje, com honestidade — incluindo o que **não** é observável. Não existe logging estruturado, métricas ou tracing; tudo abaixo é console do navegador ou saída de CI.

## Sinais observáveis hoje

| Sinal | Fonte | Valor | Classification |
| --- | --- | --- | --- |
| Falhas de escrita no Supabase | `console.error('Supabase ... error:', err)` nos repositórios | Texto de erro + exceção | Confirmed |
| Status de config do Supabase | `src/lib/supabase.ts` (boolean) + presença de `.env` | Supabase está ligado? | Confirmed |
| Falhas de leitura/escrita em localStorage | `console.error` em `storage.ts` | Chave + erro | Confirmed |
| Fallback de upload no Supabase Storage | `console.warn('Supabase storage fallback...')` em `StudentManagerSection` | Texto do aviso | Confirmed |
| Estado do modo simulação | flag de sessionStorage (`rafaela_simulation_mode`) | On/off + aluno id | Confirmed |
| Erros de load de dashboard/relatórios | `console.error` em páginas personal/student | Texto de erro | Confirmed |
| Progresso do script de seed | stdout/stderr de `scripts/seed-supabase.cjs` | Contagens, por tabela | Confirmed |
| CI build+deploy | GitHub Actions logs | Saída de cada passo | Confirmed |
| Atingibilidade da API HTTP | Erros do cliente Supabase nos call sites | Erro por requisição | Inferred |

## NÃO observável hoje

| Sinal | Lacuna | Classification |
| --- | --- | --- |
| Tráfego real de usuários | Sem analytics/tracing | Confirmed |
| Erros de runtime agregados | Sem serviço de error-reporting | Confirmed |
| Dashboard Supabase | Externo, só operator-view (não conectado) | Inferred |
| Métricas de performance | Nenhuma | Confirmed |
| Uptime/SLO | Nenhum (hospedagem estática; status do GitHub é a fonte) | Inferred |

## Onde os achados aparecem

| Caminho | Para | Notas |
| --- | --- | --- |
| Console do DevTools | Erros locais de runtime do app | Principal hoje |
| Logs de job do GitHub Actions | Deploy + lint | `.github/workflows/deploy.yml` |
| Supabase Dashboard | Saúde/uso do DB | Manual |

## Evolução recomendada (futuro)

| Item | Status | Declarado como |
| --- | --- | --- |
| Error reporting (ex.: Sentry) | Planejado | Proposed |
| Logging estruturado | Considerado | Proposed |
| Monitoramento de uptime do Pages | Considerado | Proposed |

## Relacionados

- [../operations/README.md](README.md)
- [../operations/service-profile.md](service-profile.md)
- [../contracts/local-storage.md](../contracts/local-storage.md)