import { AIModelInfo } from '../../types';

export const initialAIModels: AIModelInfo[] = [
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'gemini',
    description: 'Modelo de última geração ultra-rápido do Google, com raciocínio multimodal de baixa latência e suporte a Structured Outputs.',
    inputTokenLimit: 1048576,
    outputTokenLimit: 8192,
    supportsThinking: true,
    status: 'disponivel',
    contextWindow: '1M tokens',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'gemini',
    description: 'Modelo avançado com raciocínio profundo e contexto estendido de 2 milhões de tokens, ideal para análises complexas de evolução histórica.',
    inputTokenLimit: 2097152,
    outputTokenLimit: 8192,
    supportsThinking: true,
    status: 'disponivel',
    contextWindow: '2M tokens',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'gemini',
    description: 'Modelo leve e ágil, com excelente custo-benefício para sugestão de substituições de exercícios e resumos operacionais.',
    inputTokenLimit: 1048576,
    outputTokenLimit: 8192,
    supportsThinking: false,
    status: 'disponivel',
    contextWindow: '1M tokens',
  },
];
