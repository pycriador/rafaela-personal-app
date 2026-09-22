---
title: "Rafaela Personal App — Lacunas de conhecimento"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
---

# Lacunas de conhecimento

> Language: pt-BR | [English](../en/knowledge-gaps.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

## Lacunas

| Item | Status | Notas |
| --- | --- | --- |
| Autenticação real (Supabase Auth / JWT) | Unknown | Apenas auth mock; LoginPage declara como próximo passo |
| SLIs / SLOs | Unknown / Not Defined | Não há alvos numéricos; não inventar |
| Threat model formal | Unknown | Existe overview de segurança, mas sem modelo formal |
| Integração com plataforma de observabilidade | Not Documented | Nenhum exportador de métricas/tracing configurado |
| Recovery formal de desastres / RPO / RTO | Not Defined | Estágio de MVP |
| Semântica de sync em tempo real | Partial | Feed de auditoria realtime; caminho de escrita não documentado exaustivamente |
| Drift na contagem de exercícios | Inferred | README diz 32/96 enquanto o catálogo entrega 302/1.002 — a documentação deve preferir o estado atual acima |
| Casos de borda da experiência do aluno | Partial | Comportamentos da UI de treino ativo apenas parcialmente documentados |
| Tabelas `student_messages` / `workout_templates` | Fora da migration | Queries com erro em Supabase limpo → fallback localStorage; lacuna de paridade |
| Colunas de versão/feedback em `workout_plans`/`workout_sessions` | Fora da migration | Mapeadas apenas em código; risco de drift de schema |
| Provisionamento do bucket `student-avatars` | Não automatizado | Supabase novo precisa criar o bucket manualmente |
| Semântica do reset de senha | Cosmético confirmado | Gera uma senha, mas `login` a ignora (mock) |
| Superfície de chat no lado do aluno | Unknown | UI de chat existe no detalhe da treinadora; consumo pelo aluno não está claramente conectado |

## Explicitamente não aplicável

| Item | Evidência |
| --- | --- |
| Brokers de mensagens / barramento de eventos | Sem infraestrutura de filas no repo |
| Framework de API server-side | Sem runtime backend; apenas serviços hospedados do Supabase |
| CI de validação de docs | Sem pipeline de lint de docs neste repo |

## Sobre o framework

O repositório `aiops-documentation` define o **padrão de estrutura/formato**. Este repositório é um projeto adotante: espelha a estrutura e convenções com **conteúdo original** levantado deste código. O padrão permanece autoritativo para a própria metodologia.