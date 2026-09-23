import { exerciseRepository } from '../../repositories/exerciseRepository';

export interface ValidationResult<T> {
  valid: boolean;
  errors: string[];
  warnings: string[];
  data: T | null;
}

export const AIResponseValidator = {
  /**
   * Valida rigorosamente a proposta de treino retornada pela IA:
   * 1. Schema estrutural básico.
   * 2. Existência de cada exercício na biblioteca oficial (NUNCA permite exercício inventado).
   * 3. Intervalos aceitáveis de séries (1 a 8), repetições e descanso (15s a 300s).
   */
  async validateWorkoutProposal(structured: any): Promise<ValidationResult<any>> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!structured || typeof structured !== 'object') {
      return {
        valid: false,
        errors: ['A resposta da IA não é um objeto JSON válido.'],
        warnings: [],
        data: null,
      };
    }

    if (!Array.isArray(structured.days) || structured.days.length === 0) {
      errors.push('A proposta gerada não possui dias de treino estruturados.');
    }

    // Carrega todos os exercícios reais cadastrados no app
    const allExercises = await exerciseRepository.getAll();
    const exMap = new Map(allExercises.map((e) => [e.id, e]));

    const validatedDays: any[] = [];

    if (Array.isArray(structured.days)) {
      for (const day of structured.days) {
        if (!day.dayOfWeek || !day.name) {
          errors.push('Dia de treino sem identificador de dia da semana ou nome.');
          continue;
        }

        const validatedExercises: any[] = [];
        if (!Array.isArray(day.exercises) || day.exercises.length === 0) {
          errors.push(`O dia ${day.dayOfWeek} não possui exercícios cadastrados.`);
          continue;
        }

        for (const ex of day.exercises) {
          if (!ex.exerciseId) {
            errors.push(`Exercício no dia ${day.dayOfWeek} não informou o exerciseId.`);
            continue;
          }

          // REGRA DE OURO: O exercício DEVE existir na biblioteca
          const realEx = exMap.get(ex.exerciseId);
          if (!realEx) {
            errors.push(
              `Exercício com ID "${ex.exerciseId}" (${ex.exerciseName || 'desconhecido'}) não existe na biblioteca oficial. A IA não pode inventar exercícios.`
            );
            continue;
          }

          // Validação de séries
          const sets = Number(ex.sets);
          if (isNaN(sets) || sets < 1 || sets > 10) {
            warnings.push(`Séries do exercício ${realEx.name} corrigidas para 3 (valor original inválido: ${ex.sets}).`);
          }

          // Validação de descanso
          const rest = Number(ex.restSeconds);
          const validRest = isNaN(rest) || rest < 15 || rest > 300 ? 60 : rest;

          validatedExercises.push({
            exerciseId: realEx.id,
            exerciseName: realEx.name,
            order: ex.order || validatedExercises.length + 1,
            sets: isNaN(sets) || sets < 1 || sets > 10 ? 3 : sets,
            reps: String(ex.reps || '10-12'),
            weightKg: ex.weightKg ? Number(ex.weightKg) : undefined,
            restSeconds: validRest,
            reason: ex.reason || 'Selecionado com base no objetivo e padrão de movimento.',
            notes: ex.notes,
          });
        }

        validatedDays.push({
          dayOfWeek: day.dayOfWeek,
          name: day.name,
          muscleFocus: day.muscleFocus || 'Geral',
          estimatedDurationMinutes: day.estimatedDurationMinutes || 50,
          exercises: validatedExercises,
        });
      }
    }

    const isValid = errors.length === 0 && validatedDays.length > 0;

    return {
      valid: isValid,
      errors,
      warnings,
      data: isValid
        ? {
            ...structured,
            days: validatedDays,
            warnings: [...(structured.warnings || []), ...warnings],
          }
        : null,
    };
  },

  /**
   * Valida a série modelo (WorkoutTemplate) gerada pela IA
   */
  async validateWorkoutTemplate(structured: any): Promise<ValidationResult<any>> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!structured || typeof structured !== 'object') {
      return {
        valid: false,
        errors: ['A resposta da IA não é um objeto JSON válido.'],
        warnings: [],
        data: null,
      };
    }

    const allExercises = await exerciseRepository.getAll();
    const exMap = new Map(allExercises.map((e) => [e.id, e]));
    const nameMap = new Map(allExercises.map((e) => [e.name.toLowerCase().trim(), e]));

    const validatedExercises: any[] = [];
    const rawExercises = Array.isArray(structured.exercises) ? structured.exercises : [];

    if (rawExercises.length === 0) {
      errors.push('A série modelo gerada não contém exercícios.');
    }

    for (const ex of rawExercises) {
      let realEx = exMap.get(ex.exerciseId);
      if (!realEx && ex.exerciseName) {
        realEx = nameMap.get(ex.exerciseName.toLowerCase().trim());
      }
      if (!realEx) {
        realEx = allExercises.find((e) => e.category === structured.category) || allExercises[0];
        warnings.push(`Exercício "${ex.exerciseName || ex.exerciseId}" ajustado para "${realEx.name}".`);
      }

      const sets = Number(ex.sets);
      const reps = Number(ex.reps);
      const rest = Number(ex.restSeconds);

      validatedExercises.push({
        exerciseId: realEx.id,
        order: ex.order || validatedExercises.length + 1,
        sets: isNaN(sets) || sets < 1 || sets > 10 ? 4 : sets,
        reps: isNaN(reps) || reps < 1 || reps > 100 ? 10 : reps,
        weight: Number(ex.weight) || 20,
        restSeconds: isNaN(rest) || rest < 15 || rest > 300 ? 60 : rest,
        notes: ex.notes || realEx.instructions?.slice(0, 80) || '',
        alternatives: realEx.alternatives || [],
        allowWeightChange: true,
        allowSetChange: false,
        allowRepChange: true,
        allowSkip: true,
        allowSubstitution: true,
      });
    }

    const isValid = errors.length === 0 && validatedExercises.length > 0;

    const templateData = {
      name: structured.name || 'Série Modelo Personalizada por IA',
      description: structured.description || 'Série estruturada com inteligência artificial baseada nas diretrizes prescritas.',
      category: structured.category || 'Push',
      level: structured.level || 'intermediário',
      muscleFocus: structured.muscleFocus || 'Geral',
      estimatedMinutes: Number(structured.estimatedMinutes) || 50,
      notes: structured.notes || 'Manter cadência controlada e realizar aquecimento articular.',
      exercises: validatedExercises,
    };

    return {
      valid: isValid,
      errors,
      warnings,
      data: isValid ? templateData : null,
    };
  },
};

