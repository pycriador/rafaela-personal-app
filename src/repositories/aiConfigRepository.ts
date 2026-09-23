import { AIConfig, AIModelInfo } from '../types';
import { getItem, setItem, STORAGE_KEYS, isSimulationModeActive } from './storage';
import { initialAIConfig } from '../data/ai/aiDefaultConfig';
import { initialAIModels } from '../data/ai/aiModels';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

function mapConfigFromDb(row: any, current: AIConfig): AIConfig {
  return {
    ...current,
    selectedModel: row.active_model || current.selectedModel,
    temperature: Number(row.temperature ?? current.temperature),
    maxOutputTokens: Number(row.max_tokens ?? current.maxOutputTokens),
    systemPrompt: row.system_instructions ?? current.systemPrompt,
    mode: (row.api_mode || current.mode) as any,
    updatedAt: row.updated_at || current.updatedAt,
  };
}

function mapModelFromDb(row: any): AIModelInfo {
  const existing = initialAIModels.find((m) => m.id === row.id);
  if (existing) {
    return {
      ...existing,
      name: row.name || existing.name,
      provider: row.provider || existing.provider,
    };
  }

  return {
    id: row.id,
    name: row.name,
    provider: row.provider || 'gemini',
    description: row.description || 'Modelo de IA integrado.',
    inputTokenLimit: Number(row.context_window) || 1048576,
    outputTokenLimit: 8192,
    supportsThinking: true,
    status: 'disponivel',
    contextWindow: typeof row.context_window === 'number' ? `${Math.round(row.context_window / 1000000)}M tokens` : String(row.context_window || '1M tokens'),
  };
}

export const aiConfigRepository = {
  async getConfig(): Promise<AIConfig> {
    const current = getItem<AIConfig>(STORAGE_KEYS.AI_CONFIG, initialAIConfig);
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('ai_config').select('*').limit(1).maybeSingle();
        if (!error && data) {
          const mapped = mapConfigFromDb(data, current);
          setItem(STORAGE_KEYS.AI_CONFIG, mapped);
          return mapped;
        }
      } catch (err) {
        // fallback
      }
    }
    return current;
  },

  async updateConfig(updates: Partial<AIConfig>): Promise<AIConfig> {
    const current = await this.getConfig();
    const updated: AIConfig = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        await supabase.from('ai_config').upsert({
          id: 'default-ai-config',
          active_model: updated.selectedModel,
          temperature: updated.temperature,
          max_tokens: updated.maxOutputTokens,
          system_instructions: updated.systemPrompt || null,
          api_mode: updated.mode,
          updated_at: updated.updatedAt,
        });
      } catch (err) {
        // fallback
      }
    }

    setItem(STORAGE_KEYS.AI_CONFIG, updated);
    return updated;
  },

  async getModels(): Promise<AIModelInfo[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('ai_models').select('*');
        if (!error && data && data.length > 0) {
          return data.map(mapModelFromDb);
        }
      } catch (err) {
        // fallback
      }
    }
    return getItem<AIModelInfo[]>(STORAGE_KEYS.AI_MODELS, initialAIModels);
  },

  async saveModels(models: AIModelInfo[]): Promise<AIModelInfo[]> {
    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        const rows = models.map((m) => ({
          id: m.id,
          name: m.name,
          provider: m.provider,
          context_window: m.inputTokenLimit || 1048576,
          is_active: m.status !== 'indisponivel',
          pricing: {},
        }));
        await supabase.from('ai_models').upsert(rows);
      } catch (err) {
        // fallback
      }
    }

    setItem(STORAGE_KEYS.AI_MODELS, models);
    return models;
  },
};
