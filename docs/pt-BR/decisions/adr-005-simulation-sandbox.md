---
title: "ADR-005 — Sandbox de simulação local"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# ADR-005 — Sandbox de simulação local

> Language: pt-BR | [English](../../en/decisions/adr-005-simulation-sandbox.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

## Status

Aceita (decisão). O ciclo de vida do documento permanece REVIEW.

## Data

2026-09-22 (documentado; comportamento presente em `src/context/AuthContext.tsx` e `src/repositories/storage.ts`)

## Contexto

A treinadora precisa pré-visualizar o app exatamente como o aluno o experimenta, sem poluir dados reais nem travar em uma conta demo fixa.

## Problema

Como permitir que a treinadora "teste como aluno" (qualquer aluno, alternável) sem escrever nada permanente no Supabase nem no localStorage do aluno?

## Decisão

Implementar um **sandbox de simulação local**:

- `enterStudentSimulation(studentId)` constrói um usuário em memória/sessão e liga o modo simulação (`rafaela_simulation_mode`).
- `getItem`/`setItem` roteiam por chaves do sessionStorage `sim_sandbox_<storageKey>` enquanto ativo — o localStorage permanente nunca é mutado.
- Os repositórios bloqueiam escritas no Supabase com `isSimulationModeActive()` (nunca gravam no Supabase durante a simulação).
- `exitStudentSimulation()` limpa toda chave `sim_sandbox_*` e as flags de simulação, depois restaura a sessão da treinadora (`quickLogin('user-rafaela')`).

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não foi escolhida |
| --- | --- | --- | --- |
| Simulação como conta real de aluno | Sem casos especiais | Grava dados reais; precisa de conta de limpeza | Rejeitada: "sem gravação" é objetivo declarado |
| Parâmetro de demo `?demo=` em nível de rota | Simples | Apenas cosmético; ainda grava | Rejeitada: precisa de isolamento real |
| Projeto Supabase de teste separado | Isolamento total | Infra extra por demo | Rejeitada para o MVP |

## Consequências

| Positivas | Negativas | Neutras |
| --- | --- | --- |
| Demo da treinadora do app do aluno sem risco | Dados só de sessão (perdidos ao fechar a aba) | Chaves extras de storage/sessionStorage |
| Aluno simulado alternável em runtime | Repositórios ganharam ciência de simulação | — |
| Sem escritas no Supabase no caminho demo | Escritas são bloqueadas por repositório (precisa manter consistente) | — |

## Riscos

| Risco | Mitigação | Classification |
| --- | --- | --- |
| Um repositório esquecer o bloqueio de simulação e gravar | Camada de escrita sombra em `storage.ts` cobre o localStorage; bloqueio Supabase duplicado por repositório | Inferred |
| Chaves sandbox vazarem após a saída | `setSimulationMode(false)` remove `sim_sandbox_*` iterativamente | Confirmed |

## Componentes afetados

| Componente | Impacto | Documentação |
| --- | --- | --- |
| auth | Entrada/saída de simulação | [../application/auth.md](../application/auth.md) |
| repositories | Leituras/escritas sandbox + bloqueio de escrita | [../application/repositories.md](../application/repositories.md) |
| student-portal | Banner/troca de simulação | [../application/student-portal.md](../application/student-portal.md) |

## Contratos afetados

| Contrato | Impacto | Documentação |
| --- | --- | --- |
| local-storage | Semântica de sombra `sim_sandbox_*` | [../contracts/local-storage.md](../contracts/local-storage.md) |
| supabase-rest | Escritas Supabase puladas na simulação | [../contracts/supabase-rest.md](../contracts/supabase-rest.md) |

## Decisões relacionadas

| ADR | Relação |
| --- | --- |
| ADR-002 | Relacionada (auth mock torna a troca simulada trivial) |

## Referências

| Referência | Local |
| --- | --- |
| Flag de simulação + helpers de sandbox | `src/repositories/storage.ts` |
| Handlers de sessão de simulação | `src/context/AuthContext.tsx` |
| Lançador na página de treinadora | `src/layouts/PersonalLayout.tsx` |
| Banner + troca do aluno | `src/layouts/StudentLayout.tsx` |