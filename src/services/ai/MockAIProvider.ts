import { AIProvider, AIProviderCallResult } from './AIProvider';
import { AIModelInfo } from '../../types';
import { initialAIModels } from '../../data/ai/aiModels';
import { exerciseRepository } from '../../repositories/exerciseRepository';

export class MockAIProvider implements AIProvider {
  async testConnection(apiKey?: string): Promise<{ success: boolean; message: string; modelCount?: number }> {
    // Simula validação de conexão em ~300ms
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      message: 'Conexão simulada com o Google Gemini realizada com sucesso. Modelos disponíveis e operacionais.',
      modelCount: initialAIModels.length,
    };
  }

  async listModels(): Promise<AIModelInfo[]> {
    return initialAIModels;
  }

  async generateWorkoutProposal(input: {
    context: any;
    prompt: string;
    model: string;
    systemInstruction?: string;
    temperature?: number;
    maxOutputTokens?: number;
  }): Promise<AIProviderCallResult> {
    const startTime = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 600)); // Latência realista

    const allExercises = await exerciseRepository.getAll();
    const exMap = new Map(allExercises.map((e) => [e.id, e]));

    const goal = input.context?.student?.goal || 'Hipertrofia';
    const trainingDays: string[] = input.context?.student?.trainingDays?.length > 0
      ? input.context.student.trainingDays
      : ['Segunda', 'Quarta', 'Sexta'];

    // Mapeamento dinâmico de exercícios reais existentes na biblioteca
    const peitoEx = allExercises.find((e) => e.category === 'Peito') || allExercises[0];
    const costasEx = allExercises.find((e) => e.category === 'Costas') || allExercises[1];
    const pernasEx = allExercises.find((e) => e.category === 'Pernas') || allExercises[2];
    const ombroEx = allExercises.find((e) => e.category === 'Ombros') || allExercises[3];
    const tricepsEx = allExercises.find((e) => e.category === 'Tríceps') || allExercises[4];
    const bicepsEx = allExercises.find((e) => e.category === 'Bíceps') || allExercises[5];
    const coreEx = allExercises.find((e) => e.category === 'Core') || allExercises[6] || allExercises[0];

    const days = trainingDays.map((dayName, idx) => {
      if (idx % 2 === 0) {
        return {
          dayOfWeek: dayName,
          name: `Treino ${String.fromCharCode(65 + idx)} - Membros Superiores & Core`,
          muscleFocus: 'Peitoral, Costas, Ombros e Estabilizadores',
          estimatedDurationMinutes: input.context?.targetDurationMinutes || 55,
          exercises: [
            {
              exerciseId: peitoEx.id,
              exerciseName: peitoEx.name,
              order: 1,
              sets: 4,
              reps: '10-12',
              weightKg: 30,
              restSeconds: 90,
              reason: 'Movimento composto multiarticular com padrão horizontal seguro.',
            },
            {
              exerciseId: costasEx.id,
              exerciseName: costasEx.name,
              order: 2,
              sets: 4,
              reps: '10-12',
              weightKg: 40,
              restSeconds: 90,
              reason: 'Equilíbrio agonista/antagonista com foco em densidade dorsal.',
            },
            {
              exerciseId: ombroEx.id,
              exerciseName: ombroEx.name,
              order: 3,
              sets: 3,
              reps: '12',
              weightKg: 14,
              restSeconds: 60,
              reason: 'Desenvolvimento de deltóides com estabilidade articular.',
            },
            {
              exerciseId: coreEx.id,
              exerciseName: coreEx.name,
              order: 4,
              sets: 3,
              reps: '45s',
              restSeconds: 45,
              reason: 'Manutenção de estabilidade central para proteção lombar.',
            },
          ],
        };
      } else {
        return {
          dayOfWeek: dayName,
          name: `Treino ${String.fromCharCode(65 + idx)} - Membros Inferiores & Braços`,
          muscleFocus: 'Quadríceps, Isquiotibiais, Glúteos e Braços',
          estimatedDurationMinutes: input.context?.targetDurationMinutes || 55,
          exercises: [
            {
              exerciseId: pernasEx.id,
              exerciseName: pernasEx.name,
              order: 1,
              sets: 4,
              reps: '10-12',
              weightKg: 80,
              restSeconds: 90,
              reason: 'Volume mecânico principal para cadeia anterior e extensora.',
            },
            {
              exerciseId: tricepsEx.id,
              exerciseName: tricepsEx.name,
              order: 2,
              sets: 3,
              reps: '12',
              weightKg: 20,
              restSeconds: 60,
              reason: 'Isolamento de tríceps em cadeia aberta.',
            },
            {
              exerciseId: bicepsEx.id,
              exerciseName: bicepsEx.name,
              order: 3,
              sets: 3,
              reps: '10-12',
              weightKg: 12,
              restSeconds: 60,
              reason: 'Trabalho de flexão de cotovelos com foco em pico de contração.',
            },
          ],
        };
      }
    });

    const structured = {
      workoutName: `Ciclo Proposto — ${goal} (${trainingDays.length}x/semana)`,
      goal,
      estimatedDurationMinutes: input.context?.targetDurationMinutes || 55,
      days,
      warnings: [
        'Respeite a progressão gradual de cargas indicada para cada exercício.',
        'Caso haja queixa de desconforto articular, utilize as alternativas cadastradas.',
      ],
      assumptions: [
        'Aluno com boa tolerância geral a exercícios multiarticulares.',
        'Acesso aos equipamentos básicos selecionados na biblioteca.',
      ],
      notesForTrainer: [
        'A proposta foi estruturada com foco em técnica e preservação articular, priorizando exercícios da biblioteca ativa.',
        'Volume total semanal adequado ao nível do aluno.',
      ],
    };

    const latencyMs = Date.now() - startTime;
    return {
      raw: JSON.stringify(structured, null, 2),
      structured,
      tokenUsage: {
        promptTokens: 1120,
        completionTokens: 530,
        totalTokens: 1650,
      },
      latencyMs,
    };
  }

  async reviewWorkout(input: {
    context: any;
    prompt: string;
    model: string;
    systemInstruction?: string;
  }): Promise<AIProviderCallResult> {
    const startTime = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 500));

    const structured = {
      overallAssessment: 'A estrutura do treino atual apresenta excelente distribuição muscular e coerência com a meta.',
      volumeObservations: 'Volume total de 16 séries semanais para grupos musculares grandes, bem dimensionado para a frequência declarada.',
      balanceCheck: 'Equilíbrio satisfatório entre movimentos de empurrar e puxar.',
      possibleAdjustments: [
        'Considerar aumento de intervalo de descanso de 60s para 90s nas primeiras séries dos exercícios mais pesados.',
        'Avaliar inclusão de uma série de aquecimento específica antes do primeiro composto do dia.',
      ],
      suggestedExerciseAlternatives: [
        {
          currentExercise: 'Leg Press 45',
          alternativeSuggestion: 'Agachamento Goblet',
          rationale: 'Opção livre que estimula maior estabilização de tronco e mobilidade de tornozelos.',
        },
      ],
      notesForTrainer: [
        'Lembre-se de validar a percepção de esforço (RPE) nas próximas 2 semanas.',
      ],
    };

    return {
      raw: JSON.stringify(structured, null, 2),
      structured,
      tokenUsage: {
        promptTokens: 890,
        completionTokens: 380,
        totalTokens: 1270,
      },
      latencyMs: Date.now() - startTime,
    };
  }

  async suggestAlternatives(input: {
    context: any;
    prompt: string;
    model: string;
    systemInstruction?: string;
  }): Promise<AIProviderCallResult> {
    const startTime = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 400));

    const allExercises = await exerciseRepository.getAll();
    const originalId = input.context?.exerciseId || 'exercise-pernas-01';
    const original = allExercises.find((e) => e.id === originalId) || allExercises[0];

    // Busca alternativas cadastradas na biblioteca ou da mesma categoria
    const alternatives = allExercises.filter(
      (e) => e.id !== original.id && e.category === original.category
    );
    const selectedAlt = alternatives[0] || allExercises[1];

    const structured = {
      originalExerciseId: original.id,
      originalExerciseName: original.name,
      suggestedAlternatives: [
        {
          exerciseId: selectedAlt.id,
          exerciseName: selectedAlt.name,
          equipmentType: selectedAlt.equipment.toLowerCase().includes('máquina') ? 'maquina' : 'livre',
          reason: `Alternativa com padrão de movimento compatível (${selectedAlt.category}) e menor impacto axial.`,
          biomechanicalMatch: 'Aciona os mesmos grupos musculares prioritários com ajuste no padrão de carga.',
        },
      ],
    };

    return {
      raw: JSON.stringify(structured, null, 2),
      structured,
      tokenUsage: {
        promptTokens: 640,
        completionTokens: 240,
        totalTokens: 880,
      },
      latencyMs: Date.now() - startTime,
    };
  }

  async analyzeProgress(input: {
    context: any;
    prompt: string;
    model: string;
    systemInstruction?: string;
  }): Promise<AIProviderCallResult> {
    const startTime = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 500));

    const studentName = input.context?.student?.name || 'Aluno';
    const structured = {
      summary: `${studentName} demonstra boa regularidade, com adesão calculada em 90% das sessões programadas.`,
      completionRate: 90,
      totalSessionsAnalyzed: 10,
      completedSessions: 9,
      incompleteSessions: 1,
      frequentlySkippedExercises: [
        { name: 'Crucifixo com Halteres', count: 1 },
      ],
      frequentlySubstitutedExercises: [
        { from: 'Tríceps Testa', to: 'Tríceps Francês', count: 1 },
      ],
      loadProgressionHighlights: [
        'Supino Máquina: carga evoluiu de 30 kg para 32 kg mantendo a faixa de repetições prescrita.',
      ],
      questionsForTrainer: [
        'A aluna demonstrou excelente recuperação pós-treino; verificar viabilidade de sobrecarga progressiva nos membros inferiores.',
      ],
      suggestedReviewAreas: [
        'Revisar se o exercício pulado ocorreu por limitação de equipamento ou fadiga muscular ao final da sessão.',
      ],
    };

    return {
      raw: JSON.stringify(structured, null, 2),
      structured,
      tokenUsage: {
        promptTokens: 920,
        completionTokens: 410,
        totalTokens: 1330,
      },
      latencyMs: Date.now() - startTime,
    };
  }

  async generateWorkoutTemplate(input: {
    context: any;
    prompt: string;
    model: string;
    systemInstruction?: string;
  }): Promise<AIProviderCallResult> {
    const startTime = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 550));

    const allExercises = await exerciseRepository.getAll();
    const desc = (input.context?.description || '').toLowerCase();

    let category: 'Push' | 'Pull' | 'Legs' | 'Full Body' | 'Core & Cardio' = 'Push';
    let muscleFocus = 'Peitoral, Tríceps & Deltoides';
    let suggestedName = 'Série Modelo - Push Hipertrofia';

    if (
      desc.includes('glúteo') ||
      desc.includes('gluteo') ||
      desc.includes('posterior') ||
      desc.includes('isquiotibial') ||
      desc.includes('pélvica')
    ) {
      category = 'Legs';
      muscleFocus = 'Glúteo Máximo, Médio e Isquiotibiais';
      suggestedName = 'Série Modelo - Glúteos & Isquiotibiais (Foco Pélvico)';
    } else if (
      desc.includes('costas') ||
      desc.includes('dorsal') ||
      desc.includes('bíceps') ||
      desc.includes('biceps') ||
      desc.includes('pull') ||
      desc.includes('puxar')
    ) {
      category = 'Pull';
      muscleFocus = 'Dorsais, Trapézio, Romboides e Bíceps';
      suggestedName = 'Série Modelo - Pull & Densidade Dorsal';
    } else if (
      desc.includes('perna') ||
      desc.includes('quadríceps') ||
      desc.includes('quadriceps') ||
      desc.includes('legs')
    ) {
      category = 'Legs';
      muscleFocus = 'Quadríceps, Glúteos e Panturrilhas';
      suggestedName = 'Série Modelo - Pernas Completo (Foco Quadríceps)';
    } else if (
      desc.includes('full body') ||
      desc.includes('corpo inteiro') ||
      desc.includes('express')
    ) {
      category = 'Full Body';
      muscleFocus = 'Cadeia Anterior, Posterior e Estabilizadores';
      suggestedName = 'Série Modelo - Full Body Express';
    } else if (
      desc.includes('core') ||
      desc.includes('abdômen') ||
      desc.includes('cardio') ||
      desc.includes('hiit')
    ) {
      category = 'Core & Cardio';
      muscleFocus = 'Core, Oblíquos e Resistência Cardiovascular';
      suggestedName = 'Série Modelo - Core & Conditioning';
    } else if (input.context?.category && input.context.category !== 'all') {
      category = input.context.category;
    }

    let level: 'iniciante' | 'intermediário' | 'avançado' = 'intermediário';
    if (desc.includes('iniciante') || desc.includes('adaptação') || desc.includes('leve')) {
      level = 'iniciante';
    } else if (desc.includes('avançado') || desc.includes('pesado') || desc.includes('intenso') || desc.includes('força')) {
      level = 'avançado';
    } else if (input.context?.level && input.context.level !== 'all') {
      level = input.context.level;
    }

    // Filtra exercícios relevantes da biblioteca com base no grupamento
    let matching = allExercises.filter((e) => {
      if (category === 'Push') return e.category === 'Peito' || e.category === 'Tríceps' || e.category === 'Ombros';
      if (category === 'Pull') return e.category === 'Costas' || e.category === 'Bíceps' || e.category === 'Ombros';
      if (category === 'Legs') return e.category === 'Pernas';
      if (category === 'Core & Cardio') return e.category === 'Core' || e.category === 'Cardio';
      return true;
    });

    if (matching.length < 4) {
      matching = allExercises;
    }

    const selectedExercises = matching.slice(0, 5).map((ex, idx) => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      order: idx + 1,
      sets: level === 'iniciante' ? 3 : 4,
      reps: level === 'avançado' ? 8 : 10,
      weight: level === 'iniciante' ? 12 : 20,
      restSeconds: level === 'avançado' ? 75 : 60,
      notes: ex.instructions ? `Foco biomecânico: ${ex.instructions.slice(0, 65)}...` : 'Cadência 2-0-2.',
    }));

    const structured = {
      name: suggestedName,
      description: input.context?.description
        ? `Rotina estruturada por IA com foco em: ${input.context.description.slice(0, 120)}`
        : `Rotina padronizada de ${category} para nível ${level}.`,
      category,
      level,
      muscleFocus,
      estimatedMinutes: input.context?.targetMinutes || (category === 'Full Body' ? 40 : 50),
      notes: 'Aquecimento articular recomendado antes das séries principais. Respeite os intervalos de descanso.',
      exercises: selectedExercises,
    };

    return {
      raw: JSON.stringify(structured, null, 2),
      structured,
      tokenUsage: {
        promptTokens: 850,
        completionTokens: 420,
        totalTokens: 1270,
      },
      latencyMs: Date.now() - startTime,
    };
  }
}

