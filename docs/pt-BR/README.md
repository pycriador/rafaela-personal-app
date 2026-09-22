# Índice da Documentação

> Language: pt-BR | [English](../en/README.md)
>
> Status: ACCEPTED
>
> Owner: rafaela-app
>
> Documentation Standard v1.0 (referência de estrutura — conteúdo original deste repositório)

Índice central da documentação do **Rafaela Personal App**.

Este repositório define **como** este projeto funciona e é operado: arquitetura, componentes, contratos, decisões, segurança e operações. Segue a estrutura e o formato do Engineering Documentation Standard (aiops-documentation) sem copiar o conteúdo dele.

Cadeia progressiva: **Contexto → Sistema → Componentes → Interfaces → Operações → Recuperação**. Entrada primária para IA: [ai-context.md](ai-context.md).

## Comece por aqui

| Documento | Propósito |
| --- | --- |
| [project-overview.md](project-overview.md) | O que é o app, escopo, stack, não-objetivos |
| [ai-context.md](ai-context.md) | **Entrada primária para IA** — contexto progressivo e navegação |
| [knowledge-gaps.md](knowledge-gaps.md) | Lacunas e desconhecidos explícitos |
| [architecture/README.md](architecture/README.md) | Hub da categoria arquitetura |
| [application/README.md](application/README.md) | Componentes da aplicação |
| [contracts/README.md](contracts/README.md) | Interfaces e contratos de dados |
| [decisions/README.md](decisions/README.md) | Architecture Decision Records |
| [security/README.md](security/README.md) | Visão geral de segurança |
| [operations/README.md](operations/README.md) | Operações, perfil de serviço, runbooks |

## Ciclo de vida e metadados

Todos os documentos substantivos têm frontmatter YAML (`title`, `status`, `owner`, `created`, `updated`, `review_date`, `version`) e tokens de status `DRAFT / REVIEW / ACCEPTED / DEPRECATED / ARCHIVED`. Os tokens de classificação `Confirmed / Inferred / Unknown / Proposed` marcam a confiança de cada afirmação material.

| Status | Significado |
| --- | --- |
| `DRAFT` | Em andamento; pode estar incompleto |
| `REVIEW` | Pronto para ou sob revisão |
| `ACCEPTED` | Aprovado como descrição ou orientação atual |
| `DEPRECATED` | Ainda visível, mas superado ou não primário |
| `ARCHIVED` | Mantido para histórico; não é orientação ativa |

## Categorias

| Categoria | Caminho | Objetivo |
| --- | --- | --- |
| Arquitetura | [architecture/](architecture/) | Estrutura, fronteiras, contexto |
| Aplicação | [application/](application/) | Componentes e responsabilidades |
| Contratos | [contracts/](contracts/) | Interfaces de dados (Supabase REST, localStorage) |
| Decisões | [decisions/](decisions/) | Architecture Decision Records |
| Segurança | [security/](security/) | Modelo de auth, fronteiras de confiança, controles |
| Operações | [operations/](operations/) | Perfil de serviço, observabilidade, runbooks |

## Ordem de leitura recomendada

1. [project-overview.md](project-overview.md)
2. [architecture/overview.md](architecture/overview.md)
3. [architecture/system-context.md](architecture/system-context.md)
4. [application/README.md](application/README.md) — componentes
5. [contracts/README.md](contracts/README.md)
6. [security/overview.md](security/overview.md)
7. [operations/service-profile.md](operations/service-profile.md)
8. [decisions/README.md](decisions/README.md) para decisões materiais

## Regra de conclusão

Uma mudança técnica relevante só está concluída quando a documentação necessária for atualizada.

## Relacionados

- [ai-context.md](ai-context.md)
- [knowledge-gaps.md](knowledge-gaps.md)
- [manifest.yaml](manifest.yaml)