import { AIRequest } from '../types';
import { getItem, setItem, STORAGE_KEYS } from './storage';
import { initialAIRequests } from '../data/ai/aiRequests';

export const aiRequestRepository = {
  async getAll(): Promise<AIRequest[]> {
    return getItem<AIRequest[]>(STORAGE_KEYS.AI_REQUESTS, initialAIRequests);
  },

  async getById(id: string): Promise<AIRequest | null> {
    const list = await this.getAll();
    return list.find((r) => r.id === id) || null;
  },

  async getByStudentId(studentId: string): Promise<AIRequest[]> {
    const list = await this.getAll();
    return list.filter((r) => r.studentId === studentId);
  },

  async create(req: Omit<AIRequest, 'id' | 'createdAt'>): Promise<AIRequest> {
    const list = await this.getAll();
    const newReq: AIRequest = {
      ...req,
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newReq);
    setItem(STORAGE_KEYS.AI_REQUESTS, list);
    return newReq;
  },

  async getStats(): Promise<{
    totalRequests: number;
    totalTokens: number;
    avgLatencyMs: number;
    successRate: number;
    estimatedCostUsd: number;
  }> {
    const list = await this.getAll();
    if (list.length === 0) {
      return {
        totalRequests: 0,
        totalTokens: 0,
        avgLatencyMs: 0,
        successRate: 100,
        estimatedCostUsd: 0,
      };
    }

    const totalRequests = list.length;
    const successfulRequests = list.filter((r) => r.status === 'success').length;
    const totalTokens = list.reduce((acc, r) => acc + (r.tokenUsage?.totalTokens || 0), 0);
    const avgLatencyMs = Math.round(list.reduce((acc, r) => acc + r.latencyMs, 0) / totalRequests);
    const successRate = Math.round((successfulRequests / totalRequests) * 100);

    // Estimativa de custo Gemini 2.0 Flash / 1.5 Flash (~$0.10 por 1M tokens)
    const estimatedCostUsd = parseFloat(((totalTokens / 1000000) * 0.15).toFixed(4));

    return {
      totalRequests,
      totalTokens,
      avgLatencyMs,
      successRate,
      estimatedCostUsd,
    };
  },
};
