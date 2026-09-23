import { AIConfig, AIModelInfo } from '../types';
import { getItem, setItem, STORAGE_KEYS } from './storage';
import { initialAIConfig } from '../data/ai/aiDefaultConfig';
import { initialAIModels } from '../data/ai/aiModels';

export const aiConfigRepository = {
  async getConfig(): Promise<AIConfig> {
    return getItem<AIConfig>(STORAGE_KEYS.AI_CONFIG, initialAIConfig);
  },

  async updateConfig(updates: Partial<AIConfig>): Promise<AIConfig> {
    const current = await this.getConfig();
    const updated: AIConfig = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.AI_CONFIG, updated);
    return updated;
  },

  async getModels(): Promise<AIModelInfo[]> {
    return getItem<AIModelInfo[]>(STORAGE_KEYS.AI_MODELS, initialAIModels);
  },

  async saveModels(models: AIModelInfo[]): Promise<AIModelInfo[]> {
    setItem(STORAGE_KEYS.AI_MODELS, models);
    return models;
  },
};
