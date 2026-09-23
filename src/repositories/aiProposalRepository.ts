import { AIWorkoutProposal, AIProposalStatus } from '../types';
import { getItem, setItem, STORAGE_KEYS, isSimulationModeActive } from './storage';
import { initialAIProposals } from '../data/ai/aiProposals';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

function mapRowToProposal(row: any): AIWorkoutProposal {
  if (row.data && typeof row.data === 'object' && row.data.workoutName) {
    return {
      ...row.data,
      id: row.id || row.data.id,
      studentId: row.student_id || row.data.studentId,
      status: (row.status || row.data.status) as AIProposalStatus,
    };
  }

  return {
    id: row.id,
    studentId: row.student_id,
    requestId: row.data?.requestId || 'req-unknown',
    promptVersion: row.data?.promptVersion || 'workout-generator-v1.0',
    model: row.data?.model || 'gemini-2.0-flash',
    status: row.status as AIProposalStatus,
    workoutName: row.title || 'Treino Sugerido',
    goal: row.data?.goal || 'Geral',
    estimatedDurationMinutes: row.data?.estimatedDurationMinutes || 50,
    days: row.data?.days || [],
    warnings: row.clinical_notes ? [row.clinical_notes] : (row.data?.warnings || []),
    assumptions: row.data?.assumptions || [],
    notesForTrainer: row.data?.notesForTrainer || [],
    approvedPlanId: row.data?.approvedPlanId,
    createdAt: row.created_at || new Date().toISOString(),
    reviewedAt: row.data?.reviewedAt,
    reviewedBy: row.data?.reviewedBy,
    decisionNotes: row.data?.decisionNotes,
  };
}

export const aiProposalRepository = {
  async getAll(): Promise<AIWorkoutProposal[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('ai_proposals')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const list = data.map(mapRowToProposal);
          setItem(STORAGE_KEYS.AI_PROPOSALS, list);
          return list;
        }
      } catch (err) {
        console.warn('[aiProposalRepository] Erro ao buscar propostas do Supabase:', err);
      }
    }
    return getItem<AIWorkoutProposal[]>(STORAGE_KEYS.AI_PROPOSALS, initialAIProposals);
  },

  async getById(id: string): Promise<AIWorkoutProposal | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('ai_proposals')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          return mapRowToProposal(data);
        }
      } catch (err) {
        console.warn('[aiProposalRepository] Erro ao buscar proposta por id do Supabase:', err);
      }
    }
    const list = await this.getAll();
    return list.find((p) => p.id === id) || null;
  },

  async getByStudentId(studentId: string): Promise<AIWorkoutProposal[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('ai_proposals')
          .select('*')
          .eq('student_id', studentId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map(mapRowToProposal);
        }
      } catch (err) {
        console.warn('[aiProposalRepository] Erro ao buscar propostas por studentId:', err);
      }
    }
    const list = await this.getAll();
    return list.filter((p) => p.studentId === studentId);
  },

  async save(proposal: AIWorkoutProposal): Promise<AIWorkoutProposal> {
    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        const payload = {
          id: proposal.id,
          student_id: proposal.studentId,
          title: proposal.workoutName || 'Treino Sugerido',
          status: proposal.status,
          data: proposal,
          clinical_notes: proposal.warnings?.join('; ') || null,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from('ai_proposals').upsert(payload);
        if (error) {
          console.warn('[aiProposalRepository] Erro ao salvar proposta no Supabase:', error);
        }
      } catch (err) {
        console.warn('[aiProposalRepository] Falha na sincronização com Supabase:', err);
      }
    }

    const list = await this.getAll();
    const index = list.findIndex((p) => p.id === proposal.id);
    if (index >= 0) {
      list[index] = proposal;
    } else {
      list.unshift(proposal);
    }
    setItem(STORAGE_KEYS.AI_PROPOSALS, list);
    return proposal;
  },

  async updateStatus(
    id: string,
    status: AIProposalStatus,
    meta?: { reviewedBy?: string; decisionNotes?: string; approvedPlanId?: string }
  ): Promise<AIWorkoutProposal | null> {
    const proposal = await this.getById(id);
    if (!proposal) return null;

    proposal.status = status;
    proposal.reviewedAt = new Date().toISOString();
    if (meta?.reviewedBy) proposal.reviewedBy = meta.reviewedBy;
    if (meta?.decisionNotes) proposal.decisionNotes = meta.decisionNotes;
    if (meta?.approvedPlanId) proposal.approvedPlanId = meta.approvedPlanId;

    return this.save(proposal);
  },
};
