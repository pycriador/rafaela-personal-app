# Arquitetura

> Language: pt-BR | [English](../../en/architecture/README.md)
>
> Status: ACCEPTED
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original)

Categoria para documentação de arquitetura do Rafaela Personal App.

## Objetivo

Descrever a estrutura do sistema, fronteiras, contexto, principais componentes e fluxos de dados — apenas estado atual, com links para ADRs nas decisões.

## Integração com outras categorias

```text
Contexto (system-context)
      │
      ▼
Componentes (application/)
      │
      ▼
Interfaces de dados (contracts/)
      │
      ▼
Operações & recuperação (operations/)
```

## Orientação

- Prefira estado atual sobre estado desejado.
- Não duplique descrições de componentes (elas vivem em `application/`).
- Vincule documentos de contrato em vez de reafirmar fronteiras.
- Marque desconhecidos explicitamente.

## Documentos

| Documento | Propósito |
| --- | --- |
| [overview.md](overview.md) | Visão geral da arquitetura, componentes principais, diagrama |
| [system-context.md](system-context.md) | Atores, sistemas, dependências, fronteiras de confiança |

## Relacionados

- [../application/README.md](../application/README.md)
- [../contracts/README.md](../contracts/README.md)
- [../decisions/README.md](../decisions/README.md)