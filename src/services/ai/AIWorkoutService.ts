import { AIProvider } from './AIProvider';
import { MockAIProvider } from './MockAIProvider';
import { GeminiAIProvider } from './GeminiAIProvider';
import { secretStore } from './secretStore';
import { aiConfigRepository } from '../../repositories/aiConfigRepository';
import { aiRequestRepository } from '../../repositories/aiRequestRepository';
import { aiProposalRepository } from '../../repositories/aiProposalRepository';
import { aiConsentRepository } from '../../repositories/aiConsentRepository';
import { workoutRepository } from '../../repositories/workoutRepository';
import { activityRepository } from '../../repositories/activityRepository';
import { AIContextBuilder } from './AIContextBuilder';
import { AIResponseValidator } from './AIResponseValidator';
import { AIPromptService } from './AIPromptService';
import {
  AIWorkoutProposal,
  AIContextSelection,
  AIExerciseAlternativeSuggestion,
  AIAdherenceAnalysisResult,
  WorkoutPlan,
  WorkoutDay,
  WorkoutExercise,
} from '../../types';

export const AIWorkoutService = {
  async getActiveProvider(): Promise<{ provider: AIProvider; model: string; mode: string }> {
    const config = await aiConfigRepository.getConfig();
    const hasKey = await secretStore.isConfigured();
    const useLocalEngine = config.mode === 'mock' || (!hasKey && config.mode === 'gemini');
    const provider: AIProvider = useLocalEngine ? new MockAIProvider() : new GeminiAIProvider();
    return {
      provider,
      model: config.selectedModel || 'gemini-2.0-flash',
      mode: config.mode,
    };
  },

  /**
   * 1. Gera proposta de treino utilizando IA com validação estrita e auditoria
   */
  async generateWorkoutProposal(input: {
    studentId: string;
    goal?: string;
    trainingDays?: string[];
    targetDurationMinutes?: number;
    equipmentAvailable?: string[];
    trainerInstructions?: string;
    selection: AIContextSelection;
  }): Promise<AIWorkoutProposal> {
    const consentGranted = await aiConsentRepository.isAllowed(input.studentId);
    if (!consentGranted) {
      throw new Error('O aluno possui restrição de uso de dados em ferramentas de inteligência artificial.');
    }

    const { provider, model } = await this.getActiveProvider();
    const config = await aiConfigRepository.getConfig();

    // 1. Constrói contexto minimizado e sanitizado
    const context = await AIContextBuilder.buildWorkoutGenerationContext(input);

    const systemInstruction = config.systemPrompt || AIPromptService.getSystemInstruction();
    const userPrompt = AIPromptService.getWorkoutGeneratorPrompt('1.0');

    let callResult;
    try {
      callResult = await provider.generateWorkoutProposal({
        context,
        prompt: userPrompt,
        model,
        systemInstruction,
        temperature: config.temperature,
        maxOutputTokens: config.maxOutputTokens,
      });
    } catch (err: any) {
      await aiRequestRepository.create({
        trainerId: 'user-rafaela',
        studentId: input.studentId,
        task: 'workout_generation',
        model,
        promptVersion: 'workout-generator-v1.0',
        latencyMs: 500,
        status: 'error',
        error: err.message || 'Falha na chamada do provedor de IA.',
      });
      throw err;
    }

    // 2. Validação estrita (rejeita exercícios inventados ou esquemas inválidos)
    const validation = await AIResponseValidator.validateWorkoutProposal(callResult.structured);
    if (!validation.valid) {
      await aiRequestRepository.create({
        trainerId: 'user-rafaela',
        studentId: input.studentId,
        task: 'workout_generation',
        model,
        promptVersion: 'workout-generator-v1.0',
        latencyMs: callResult.latencyMs,
        tokenUsage: callResult.tokenUsage,
        status: 'validation_failed',
        error: validation.errors.join('; '),
      });
      throw new Error(`A proposta da IA falhou nas regras de validação: ${validation.errors.join(' ')}`);
    }

    // 3. Registra requisição com sucesso na auditoria
    const requestLog = await aiRequestRepository.create({
      trainerId: 'user-rafaela',
      studentId: input.studentId,
      task: 'workout_generation',
      model,
      promptVersion: 'workout-generator-v1.0',
      latencyMs: callResult.latencyMs,
      tokenUsage: callResult.tokenUsage,
      status: 'success',
    });

    // 4. Cria e persiste proposta aguardando revisão da Personal
    const proposal: AIWorkoutProposal = {
      id: `prop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId: input.studentId,
      requestId: requestLog.id,
      promptVersion: 'workout-generator-v1.0',
      model,
      status: 'generated',
      workoutName: validation.data.workoutName || `Plano Sugerido por IA (${input.goal || 'Geral'})`,
      goal: validation.data.goal || input.goal || 'Hipertrofia',
      estimatedDurationMinutes: validation.data.estimatedDurationMinutes || 55,
      days: validation.data.days,
      warnings: validation.data.warnings || [],
      assumptions: validation.data.assumptions || [],
      notesForTrainer: validation.data.notesForTrainer || [],
      createdAt: new Date().toISOString(),
    };

    await aiProposalRepository.save(proposal);

    await activityRepository.log({
      actorId: 'user-rafaela',
      actorName: 'AI Copilot',
      actorRole: 'personal',
      action: 'Proposta de treino gerada',
      description: `AI Copilot gerou uma proposta de treino para revisão da Rafaela.`,
      studentId: input.studentId,
      iconType: 'edit',
    });

    return proposal;
  },

  /**
   * 2. Aprova a proposta e aplica como novo ciclo de treino do aluno
   */
  async approveProposal(
    proposalId: string,
    notes?: string,
    trainerId: string = 'user-rafaela'
  ): Promise<{ proposal: AIWorkoutProposal; plan: WorkoutPlan }> {
    const proposal = await aiProposalRepository.getById(proposalId);
    if (!proposal) throw new Error('Proposta não encontrada.');

    // Converte os dias da proposta da IA no modelo WorkoutPlan oficial do aplicativo
    const workoutDays: WorkoutDay[] = proposal.days.map((d, dIdx) => ({
      id: `day-${Date.now()}-${dIdx}`,
      dayOfWeek: d.dayOfWeek as any,
      name: d.name,
      muscleFocus: d.muscleFocus,
      exercises: d.exercises.map((e, eIdx) => ({
        exerciseId: e.exerciseId,
        order: e.order || eIdx + 1,
        sets: e.sets || 3,
        reps: parseInt(e.reps, 10) || 12,
        weight: e.weightKg || 20,
        restSeconds: e.restSeconds || 60,
        notes: e.notes || e.reason,
        alternatives: [],
        allowWeightChange: true,
        allowSetChange: true,
        allowRepChange: true,
        allowSkip: true,
        allowSubstitution: true,
      })),
    }));

    const newPlan: WorkoutPlan = {
      id: `plan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId: proposal.studentId,
      trainerId,
      name: proposal.workoutName,
      cycleName: proposal.goal,
      version: 1,
      active: true,
      days: workoutDays,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Salva o novo plano real e desativa versões anteriores
    const savedPlan = await workoutRepository.savePlan(newPlan);

    // Atualiza status da proposta para aprovada
    const updatedProposal = await aiProposalRepository.updateStatus(proposal.id, 'approved', {
      reviewedBy: trainerId,
      decisionNotes: notes,
      approvedPlanId: savedPlan.id,
    });

    // Registra evento no ActivityLog exigido pela especificação: AI_WORKOUT_APPROVED
    await activityRepository.log({
      actorId: trainerId,
      actorName: 'Rafaela Personal',
      actorRole: 'personal',
      action: 'AI_WORKOUT_APPROVED',
      description: `Rafaela revisou e aprovou o treino gerado pelo AI Copilot ("${proposal.workoutName}").`,
      studentId: proposal.studentId,
      iconType: 'check',
    });

    return { proposal: updatedProposal || proposal, plan: savedPlan };
  },

  /**
   * 3. Rejeita a proposta
   */
  async rejectProposal(proposalId: string, reason?: string): Promise<AIWorkoutProposal | null> {
    const updated = await aiProposalRepository.updateStatus(proposalId, 'rejected', {
      reviewedBy: 'user-rafaela',
      decisionNotes: reason,
    });

    if (updated) {
      await activityRepository.log({
        actorId: 'user-rafaela',
        actorName: 'Rafaela Personal',
        actorRole: 'personal',
        action: 'Proposta da IA descartada',
        description: `Rafaela rejeitou a proposta de treino sugerida pelo AI Copilot.`,
        studentId: updated.studentId,
        iconType: 'skip',
      });
    }

    return updated;
  },

  /**
   * 4. Salva modificações feitas pela Personal na proposta
   */
  async modifyProposal(proposal: AIWorkoutProposal): Promise<AIWorkoutProposal> {
    proposal.status = 'modified';
    proposal.reviewedAt = new Date().toISOString();
    return aiProposalRepository.save(proposal);
  },

  /**
   * 5. Sugere alternativa para um exercício individual (Livre <-> Máquina)
   */
  async suggestExerciseAlternative(
    exerciseId: string,
    constraints?: { preferFreeWeight?: boolean; preferMachine?: boolean }
  ): Promise<AIExerciseAlternativeSuggestion> {
    const { provider, model } = await this.getActiveProvider();
    const context = await AIContextBuilder.buildExerciseAlternativeContext(exerciseId, constraints);
    const prompt = AIPromptService.getAlternativePrompt();

    const callResult = await provider.suggestAlternatives({
      context,
      prompt,
      model,
    });

    const suggestion = callResult.structured?.suggestedAlternatives?.[0];
    if (!suggestion) {
      throw new Error('Nenhuma alternativa válida foi sugerida pela IA.');
    }

    await aiRequestRepository.create({
      trainerId: 'user-rafaela',
      task: 'exercise_alternative',
      model,
      promptVersion: 'exercise-copilot-v1.0',
      latencyMs: callResult.latencyMs,
      tokenUsage: callResult.tokenUsage,
      status: 'success',
    });

    return {
      originalExerciseId: callResult.structured.originalExerciseId,
      originalExerciseName: callResult.structured.originalExerciseName,
      suggestedExerciseId: suggestion.exerciseId,
      suggestedExerciseName: suggestion.exerciseName,
      equipmentType: suggestion.equipmentType,
      reason: suggestion.reason,
      biomechanicalMatch: suggestion.biomechanicalMatch,
    };
  },

  /**
   * 6. Revisa treino existente
   */
  async reviewWorkout(studentId: string, currentPlan: WorkoutPlan): Promise<any> {
    const { provider, model } = await this.getActiveProvider();
    const callResult = await provider.reviewWorkout({
      context: {
        workoutPlan: currentPlan,
        studentId,
      },
      prompt: AIPromptService.getReviewPrompt(),
      model,
    });

    await aiRequestRepository.create({
      trainerId: 'user-rafaela',
      studentId,
      task: 'workout_review',
      model,
      promptVersion: 'workout-review-v1.0',
      latencyMs: callResult.latencyMs,
      tokenUsage: callResult.tokenUsage,
      status: 'success',
    });

    return callResult.structured;
  },

  /**
   * 7. Analisa adesão e histórico de evolução
   */
  async analyzeProgress(studentId: string): Promise<AIAdherenceAnalysisResult> {
    const { provider, model } = await this.getActiveProvider();
    const sessions = await workoutRepository.getSessions(studentId);
    const mods = await workoutRepository.getModifications(studentId);

    const callResult = await provider.analyzeProgress({
      context: {
        studentId,
        sessionsCount: sessions.length,
        modificationsCount: mods.length,
      },
      prompt: AIPromptService.getProgressAnalysisPrompt(),
      model,
    });

    await aiRequestRepository.create({
      trainerId: 'user-rafaela',
      studentId,
      task: 'progress_analysis',
      model,
      promptVersion: 'progress-copilot-v1.0',
      latencyMs: callResult.latencyMs,
      tokenUsage: callResult.tokenUsage,
      status: 'success',
    });

    return callResult.structured;
  },
};
