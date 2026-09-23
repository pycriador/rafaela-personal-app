import { studentRepository } from '../../repositories/studentRepository';
import { workoutRepository } from '../../repositories/workoutRepository';
import { exerciseRepository } from '../../repositories/exerciseRepository';
import { formResponseRepository } from '../../repositories/formResponseRepository';
import { nutritionRepository } from '../../repositories/nutritionRepository';
import { AIContextSelection } from '../../types';

export const AIContextBuilder = {
  /**
   * Constrói o contexto minimizado e sanitizado para geração de propostas de treino.
   * Aplica data minimization rigoroso e isola textos livres como UNTRUSTED_STUDENT_DATA.
   */
  async buildWorkoutGenerationContext(input: {
    studentId: string;
    goal?: string;
    trainingDays?: string[];
    targetDurationMinutes?: number;
    equipmentAvailable?: string[];
    trainerInstructions?: string;
    selection: AIContextSelection;
  }): Promise<any> {
    const student = await studentRepository.getById(input.studentId);
    if (!student) throw new Error('Aluno não encontrado para geração de contexto.');

    // 1. Perfil minimizado (SEM telefone, email, endereço, dados cadastrais sensíveis)
    const studentProfile = input.selection.includeStudentProfile
      ? {
          name: student.name.split(' ')[0], // Apenas primeiro nome
          level: student.level,
          experience: student.experience,
          restrictionsRecorded: student.restrictions
            ? `[UNTRUSTED_STUDENT_DATA: ${student.restrictions}]`
            : 'Nenhuma limitação articular cadastrada.',
          preferencesRecorded: student.preferences
            ? `[UNTRUSTED_STUDENT_DATA: ${student.preferences}]`
            : undefined,
        }
      : { name: student.name.split(' ')[0], level: student.level };

    // 2. Metas e Frequência
    const goal = input.goal || (student.goals && student.goals.length > 0 ? student.goals[0] : 'Hipertrofia');
    const trainingDays = input.trainingDays || (student.availableDays && student.availableDays.length > 0 ? student.availableDays : ['Segunda', 'Quarta', 'Sexta']);

    // 3. Anamnese (resumo de fatores relevantes sem dados clínicos brutos)
    let anamnesisContext = undefined;
    if (input.selection.includeAnamnesis) {
      const responses = await formResponseRepository.getByStudentId(student.id);
      const latestResp = responses[0];
      if (latestResp && latestResp.answers) {
        anamnesisContext = {
          hasAnamnesisCompleted: true,
          submittedAt: latestResp.submittedAt,
          relevantFactors: latestResp.answers.slice(0, 8).map((ans) => ({
            fieldId: ans.fieldId,
            userResponse: `[UNTRUSTED_STUDENT_DATA: ${String(ans.value)}]`,
          })),
        };
      }
    }

    // 4. Histórico de Treinos e Adesão
    let historyContext = undefined;
    if (input.selection.includeHistory) {
      const sessions = await workoutRepository.getSessions(student.id);
      const mods = await workoutRepository.getModifications(student.id);
      const completed = sessions.filter((s) => s.status === 'completed');

      historyContext = {
        totalSessionsCompleted: completed.length,
        recentSessionsCount: Math.min(sessions.length, 5),
        averageVolumeKg: completed.length > 0
          ? Math.round(completed.reduce((acc, s) => acc + s.totalVolumeKg, 0) / completed.length)
          : 0,
        recentSkippedCount: completed.reduce((acc, s) => acc + s.skippedExercises.length, 0),
        recentModificationsSample: mods.slice(0, 3).map((m) => ({
          action: m.action,
          exercise: m.exerciseName,
          difference: m.difference,
        })),
      };
    }

    // 5. Alimentação (Apenas contexto de rotina, sem dieta clínica)
    let nutritionContext = undefined;
    if (input.selection.includeNutrition) {
      const nutPlan = await nutritionRepository.getByStudentId(student.id);
      if (nutPlan) {
        nutritionContext = {
          generalGoal: nutPlan.goal,
          dailyCaloriesApprox: nutPlan.dailyCalories,
          mealsSchedule: nutPlan.meals.map((m) => ({ name: m.name, time: m.time })),
          notice: 'Contexto meramente informativo para harmonização de horários de treino.',
        };
      }
    }

    // 6. Biblioteca de Exercícios Ativos (IDs reais disponíveis para seleção)
    const allExercises = await exerciseRepository.getAll();
    const availableExercises = allExercises.map((e) => ({
      id: e.id,
      name: e.name,
      category: e.category,
      equipment: e.equipment,
      difficulty: e.difficulty,
    }));

    return {
      student: {
        ...studentProfile,
        goal,
        trainingDays,
      },
      targetDurationMinutes: input.targetDurationMinutes || 55,
      equipmentAvailable: input.equipmentAvailable || ['academia_completa'],
      trainerInstructions: input.selection.includeTrainerInstructions && input.trainerInstructions
        ? input.trainerInstructions
        : 'Priorizar boa execução biomecânica, equilíbrio de volume e segurança.',
      anamnesis: anamnesisContext,
      history: historyContext,
      nutrition: nutritionContext,
      availableExerciseLibrary: availableExercises,
    };
  },

  /**
   * Constrói o contexto para sugestão de substituição de exercício individual.
   */
  async buildExerciseAlternativeContext(exerciseId: string, constraints?: { preferFreeWeight?: boolean; preferMachine?: boolean }): Promise<any> {
    const exercise = await exerciseRepository.getById(exerciseId);
    if (!exercise) throw new Error('Exercício base não encontrado.');

    const allExercises = await exerciseRepository.getAll();
    const candidates = allExercises.filter((e) => e.id !== exercise.id && e.category === exercise.category);

    return {
      originalExercise: {
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        equipment: exercise.equipment,
        muscleGroups: exercise.muscleGroups,
      },
      constraints: constraints || {},
      candidateExercises: candidates.map((c) => ({
        id: c.id,
        name: c.name,
        equipment: c.equipment,
        muscleGroups: c.muscleGroups,
      })),
    };
  },
};
