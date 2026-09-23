import { AIRequest, AITaskType, AIRequestStatus } from '../types';
import { getItem, setItem, STORAGE_KEYS, isSimulationModeActive } from './storage';
import { initialAIRequests } from '../data/ai/aiRequests';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

function mapRowToRequest(row: any): AIRequest {
  const promptTokens = Number(row.prompt_tokens) || 0;
  const completionTokens = Number(row.completion_tokens) || 0;
  return {
    id: row.id,
    trainerId: 'user-rafaela',
    studentId: row.student_id || undefined,
    task: (row.task_type || 'workout_generation') as AITaskType,
    model: row.model || 'gemini-2.0-flash',
    promptVersion: 'workout-generator-v1.0',
    latencyMs: Number(row.latency_ms) || 0,
    tokenUsage: {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    },
    status: (row.status || 'success') as AIRequestStatus,
    error: row.error_message || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export const aiRequestRepository = {
  async getAll(): Promise<AIRequest[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('ai_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const list = data.map(mapRowToRequest);
          setItem(STORAGE_KEYS.AI_REQUESTS, list);
          return list;
        }
      } catch (err) {
        console.warn('[aiRequestRepository] Erro ao ler requests do Supabase:', err);
      }
    }
    return getItem<AIRequest[]>(STORAGE_KEYS.AI_REQUESTS, initialAIRequests);
  },

  async getById(id: string): Promise<AIRequest | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('ai_requests')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          return mapRowToRequest(data);
        }
      } catch (err) {
        console.warn('[aiRequestRepository] Erro ao obter request por id do Supabase:', err);
      }
    }
    const list = await this.getAll();
    return list.find((r) => r.id === id) || null;
  },

  async getByStudentId(studentId: string): Promise<AIRequest[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('ai_requests')
          .select('*')
          .eq('student_id', studentId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map(mapRowToRequest);
        }
      } catch (err) {
        console.warn('[aiRequestRepository] Erro ao obter requests por studentId:', err);
      }
    }
    const list = await this.getAll();
    return list.filter((r) => r.studentId === studentId);
  },

  async create(req: Omit<AIRequest, 'id' | 'createdAt'>): Promise<AIRequest> {
    const newReq: AIRequest = {
      ...req,
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        const { error } = await supabase.from('ai_requests').insert({
          id: newReq.id,
          student_id: newReq.studentId || null,
          task_type: newReq.task,
          model: newReq.model,
          prompt_tokens: newReq.tokenUsage?.promptTokens || 0,
          completion_tokens: newReq.tokenUsage?.completionTokens || 0,
          latency_ms: newReq.latencyMs || 0,
          status: newReq.status,
          error_message: newReq.error || null,
          created_at: newReq.createdAt,
        });

        if (error) {
          console.warn('[aiRequestRepository] Erro ao gravar telemetria no Supabase:', error);
        }
      } catch (err) {
        console.warn('[aiRequestRepository] Falha ao enviar telemetria ao Supabase:', err);
      }
    }

    const list = await this.getAll();
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

    // Estimativa de custo Gemini 2.0 Flash / 1.5 Flash (~$0.15 por 1M tokens)
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
