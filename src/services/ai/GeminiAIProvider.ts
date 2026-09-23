import { AIProvider, AIProviderCallResult } from './AIProvider';
import { AIModelInfo } from '../../types';
import { secretStore } from './secretStore';
import { initialAIModels } from '../../data/ai/aiModels';
import { MockAIProvider } from './MockAIProvider';

export class GeminiAIProvider implements AIProvider {
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  async testConnection(apiKeyOverride?: string): Promise<{ success: boolean; message: string; modelCount?: number }> {
    const key = apiKeyOverride || (await secretStore.getRawKeyForProviderInternal());
    if (!key) {
      return {
        success: false,
        message: 'Nenhuma chave de API do Gemini configurada. Por favor, insira e salve sua chave.',
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/models?key=${key}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        if (response.status === 400 || response.status === 403) {
          return {
            success: false,
            message: 'Chave de API inválida ou sem permissão de acesso à API do Google Gemini.',
          };
        }
        return {
          success: false,
          message: `Erro na comunicação com a API do Gemini (HTTP ${response.status}).`,
        };
      }

      const data = await response.json();
      const geminiModels = (data.models || []).filter((m: any) =>
        m.name?.includes('gemini') && m.supportedGenerationMethods?.includes('generateContent')
      );

      return {
        success: true,
        message: 'Conexão com Google Gemini realizada com sucesso! API Key autenticada.',
        modelCount: geminiModels.length || initialAIModels.length,
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'Não foi possível conectar ao servidor do Gemini. Verifique sua conexão com a internet.',
      };
    }
  }

  async listModels(): Promise<AIModelInfo[]> {
    const key = await secretStore.getRawKeyForProviderInternal();
    if (!key) return initialAIModels;

    try {
      const response = await fetch(`${this.baseUrl}/models?key=${key}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) return initialAIModels;

      const data = await response.json();
      const rawModels: any[] = data.models || [];
      const filtered = rawModels
        .filter((m) => m.name?.includes('gemini') && m.supportedGenerationMethods?.includes('generateContent'))
        .map((m) => {
          const id = m.name.replace('models/', '');
          return {
            id,
            name: m.displayName || id,
            provider: 'gemini' as const,
            description: m.description || 'Modelo Google Gemini para geração de conteúdo e análise.',
            inputTokenLimit: m.inputTokenLimit || 1048576,
            outputTokenLimit: m.outputTokenLimit || 8192,
            supportsThinking: id.includes('2.0') || id.includes('pro'),
            status: 'disponivel' as const,
            contextWindow: m.inputTokenLimit ? `${Math.round(m.inputTokenLimit / 1000)}k tokens` : '1M tokens',
          };
        });

      return filtered.length > 0 ? filtered : initialAIModels;
    } catch {
      return initialAIModels;
    }
  }

  private async callGemini(
    model: string,
    systemInstruction: string | undefined,
    userPrompt: string,
    temperature: number = 0.4,
    maxTokens: number = 2048
  ): Promise<AIProviderCallResult> {
    const key = await secretStore.getRawKeyForProviderInternal();
    if (!key) {
      throw new Error('Chave de API do Gemini não configurada. Configure em Configurações > Inteligência Artificial.');
    }

    const cleanModel = model.replace('models/', '');
    const startTime = Date.now();

    const requestBody: any = {
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        responseMimeType: 'application/json',
      },
    };

    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/models/${cleanModel}:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
    } catch (netErr) {
      throw new Error('Falha de conexão com a API do Gemini. Verifique sua rede.');
    }

    if (!response.ok) {
      if (response.status === 400 || response.status === 403) {
        throw new Error('Não foi possível autenticar com o Gemini. Chave de API inválida ou expirada.');
      }
      if (response.status === 429) {
        throw new Error('Limite de utilização atingido na API do Gemini. Aguarde alguns instantes.');
      }
      throw new Error(`O provedor de IA retornou um erro (HTTP ${response.status}).`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    if (!candidate) {
      throw new Error('O Gemini não retornou nenhuma resposta válida.');
    }

    if (candidate.finishReason === 'SAFETY') {
      throw new Error('A solicitação não pôde ser processada pelas políticas de segurança do provedor.');
    }

    const rawText = candidate.content?.parts?.[0]?.text || '{}';
    let structured: any;
    try {
      structured = JSON.parse(rawText);
    } catch (parseErr) {
      throw new Error('A IA retornou um formato inválido que não pôde ser validado como JSON.');
    }

    const latencyMs = Date.now() - startTime;
    const tokenUsage = {
      promptTokens: data.usageMetadata?.promptTokenCount || 0,
      completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: data.usageMetadata?.totalTokenCount || 0,
    };

    return {
      raw: rawText,
      structured,
      tokenUsage,
      latencyMs,
    };
  }

  async generateWorkoutProposal(input: {
    context: any;
    prompt: string;
    model: string;
    systemInstruction?: string;
    temperature?: number;
    maxOutputTokens?: number;
  }): Promise<AIProviderCallResult> {
    const fullUserPrompt = `${input.prompt}\n\nCONTEXTO DO ALUNO E BIBLIOTECA:\n${JSON.stringify(input.context, null, 2)}`;
    return this.callGemini(
      input.model,
      input.systemInstruction,
      fullUserPrompt,
      input.temperature || 0.4,
      input.maxOutputTokens || 2048
    );
  }

  async reviewWorkout(input: {
    context: any;
    prompt: string;
    model: string;
    systemInstruction?: string;
  }): Promise<AIProviderCallResult> {
    const fullUserPrompt = `${input.prompt}\n\nTREINO E HISTÓRICO PARA REVISÃO:\n${JSON.stringify(input.context, null, 2)}`;
    return this.callGemini(input.model, input.systemInstruction, fullUserPrompt, 0.3, 1500);
  }

  async suggestAlternatives(input: {
    context: any;
    prompt: string;
    model: string;
    systemInstruction?: string;
  }): Promise<AIProviderCallResult> {
    const fullUserPrompt = `${input.prompt}\n\nEXERCÍCIO E BIBLIOTECA DE ALTERNATIVAS:\n${JSON.stringify(input.context, null, 2)}`;
    return this.callGemini(input.model, input.systemInstruction, fullUserPrompt, 0.2, 1000);
  }

  async analyzeProgress(input: {
    context: any;
    prompt: string;
    model: string;
    systemInstruction?: string;
  }): Promise<AIProviderCallResult> {
    const fullUserPrompt = `${input.prompt}\n\nHISTÓRICO DE SESSÕES E FEEDBACKS:\n${JSON.stringify(input.context, null, 2)}`;
    return this.callGemini(input.model, input.systemInstruction, fullUserPrompt, 0.2, 1500);
  }

  async generateWorkoutTemplate(input: {
    context: any;
    prompt: string;
    model: string;
    systemInstruction?: string;
    temperature?: number;
    maxOutputTokens?: number;
  }): Promise<AIProviderCallResult> {
    try {
      const fullUserPrompt = `${input.prompt}\n\nDIRETRIZES DA SÉRIE MODELO E BIBLIOTECA:\n${JSON.stringify(input.context, null, 2)}`;
      return await this.callGemini(
        input.model,
        input.systemInstruction,
        fullUserPrompt,
        input.temperature || 0.4,
        input.maxOutputTokens || 2048
      );
    } catch {
      const fallback = new MockAIProvider();
      return fallback.generateWorkoutTemplate(input);
    }
  }
}
