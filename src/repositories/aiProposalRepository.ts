import { AIWorkoutProposal, AIProposalStatus } from '../types';
import { getItem, setItem, STORAGE_KEYS } from './storage';
import { initialAIProposals } from '../data/ai/aiProposals';

export const aiProposalRepository = {
  async getAll(): Promise<AIWorkoutProposal[]> {
    return getItem<AIWorkoutProposal[]>(STORAGE_KEYS.AI_PROPOSALS, initialAIProposals);
  },

  async getById(id: string): Promise<AIWorkoutProposal | null> {
    const list = await this.getAll();
    return list.find((p) => p.id === id) || null;
  },

  async getByStudentId(studentId: string): Promise<AIWorkoutProposal[]> {
    const list = await this.getAll();
    return list.filter((p) => p.studentId === studentId);
  },

  async save(proposal: AIWorkoutProposal): Promise<AIWorkoutProposal> {
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
