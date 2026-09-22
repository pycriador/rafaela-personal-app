# Aplicação

> Language: pt-BR | [English](../../en/application/README.md)
>
> Status: ACCEPTED
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

Categoria para documentação de componentes da aplicação do Rafaela Personal App.

## Objetivo

Descrever componentes da aplicação, responsabilidades, interfaces, configuração e considerações operacionais.

## Orientação

- Um documento de componente por unidade lógica significativa.
- Separe responsabilidades de não-responsabilidades.
- Vincule contratos em vez de duplicá-los.
- Mantenha as afirmações classificadas (Confirmed/Inferred/Unknown/Proposed).

## Componentes

| Componente | Responsabilidade | Doc |
| --- | --- | --- |
| personal-portal | UX da treinadora (11 rotas) | [personal-portal.md](personal-portal.md) |
| student-portal | UX do aluno (8 rotas) | [student-portal.md](student-portal.md) |
| repositories | Acesso híbrido a dados (10 repositórios) | [repositories.md](repositories.md) |
| exercise-catalog | Catálogo de 302 exercícios + frames | [exercise-catalog.md](exercise-catalog.md) |
| auth | Auth mock + guards de rota | [auth.md](auth.md) |
| exercise-frame-player | Frames animados + timer de descanso | [exercise-frame-player.md](exercise-frame-player.md) |
| workout-templates | Séries prontas + versionamento | [workout-templates.md](workout-templates.md) |
| student-chat | Bate-papo treinadora↔aluno | [student-chat.md](student-chat.md) |

## Relacionados

- [../architecture/overview.md](../architecture/overview.md)
- [../contracts/README.md](../contracts/README.md)