---
title: "Componente — auth"
status: "REVIEW"
owner: "rafaela-app"
created: "2026-09-22"
updated: "2026-09-22"
review_date: "2026-10-22"
version: "1.0"
id: "CMP-005"
type: "Component"
---

# auth

> Language: pt-BR | [English](../../en/application/auth.md)
>
> Status: REVIEW
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

## Propósito

Gerenciamento de sessão no cliente com **autenticação mock**: o login é uma busca por e-mail, a senha é ignorada, e a proteção de rotas por papel redireciona usuários para seu próprio portal.

## Responsabilidades

| Responsabilidade | Evidência | Classification |
| --- | --- | --- |
| Estado de sessão (usuário, perfil de aluno, loading) | `src/context/AuthContext.tsx` | Confirmed |
| `login(email)` → busca usuário por e-mail, **ignora senha** | `login` do AuthContext | Confirmed |
| `quickLogin(userId)` troca de demonstração em 1 clique | `quickLogin` do AuthContext | Confirmed |
| Persistência de sessão em localStorage | `rafaela_app_current_user_v1` | Confirmed |
| Guard de rota por papel | `src/components/ProtectedRoute.tsx` | Confirmed |
| Carregamento de perfil de aluno para sessões de aluno | AuthContext em login/init | Confirmed |
| Entrar/sair da simulação "testar como aluno" | `enterStudentSimulation`/`exitStudentSimulation` do AuthContext | Confirmed |
| Expor `isSimulationMode`/`simulatedStudentId` para layouts | AuthContext | Confirmed |

## Fatos relevantes para segurança

| Fato | Notas | Classification |
| --- | --- | --- |
| Senha nunca é validada | Parâmetro `_pass` não usado em `login` | Confirmed |
| Login exige e-mail conhecido em `users` | `getByEmail` | Confirmed |
| Sessão armazenada no cliente | localStorage, legível por JS | Confirmed |
| Sem token emitido por servidor | Supabase Auth não usado | Confirmed |
| Reset de senha é cosmético | `StudentManagerSection` gera/mostra senha, mas `userRepository.update` só renomeia | Confirmed |
| Simulação isola escritas | `sim_sandbox_*` em sessionStorage; sai via `quickLogin('user-rafaela')` | Confirmed |

> Ver [../security/overview.md](../security/overview.md) para implicações.

## Tecnologia

| Campo | Valor | Classification |
| --- | --- | --- |
| Estado | React Context | Confirmed |
| Persistência | localStorage (`rafaela_app_current_user_v1`) | Confirmed |
| Persistência de simulação | sessionStorage (`rafaela_simulation_mode`, `rafaela_sim_user`, `rafaela_original_trainer_id`) | Confirmed |
| Guard de rota | react-router-dom `<ProtectedRoute>` | Confirmed |

## Relacionados

- [../security/overview.md](../security/overview.md)
- [../decisions/adr-002-mock-auth.md](../decisions/adr-002-mock-auth.md)
- [../decisions/adr-005-simulation-sandbox.md](../decisions/adr-005-simulation-sandbox.md)
- [../application/repositories.md](repositories.md)