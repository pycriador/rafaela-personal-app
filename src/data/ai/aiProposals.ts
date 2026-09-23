import { AIWorkoutProposal } from '../../types';

export const initialAIProposals: AIWorkoutProposal[] = [
  {
    id: 'prop-student-1-01',
    studentId: 'student-1',
    requestId: 'req-init-01',
    promptVersion: 'workout-generator-v1.0',
    model: 'gemini-2.0-flash',
    status: 'approved',
    workoutName: 'Treino A - Foco Hipertrofia & Core (Otimizado por IA)',
    goal: 'Hipertrofia',
    estimatedDurationMinutes: 50,
    days: [
      {
        dayOfWeek: 'Segunda',
        name: 'Treino A - Peito, Tríceps e Core',
        muscleFocus: 'Peitoral Maior, Tríceps Braquial e Abdômen',
        estimatedDurationMinutes: 50,
        exercises: [
          {
            exerciseId: 'exercise-peito-01',
            exerciseName: 'Supino Máquina',
            order: 1,
            sets: 4,
            reps: '10-12',
            weightKg: 30,
            restSeconds: 90,
            reason: 'Ativação controlada de peitoral minimizando estresse no ombro anterior.',
          },
          {
            exerciseId: 'exercise-triceps-01',
            exerciseName: 'Tríceps Polia com Corda',
            order: 2,
            sets: 3,
            reps: '12',
            weightKg: 20,
            restSeconds: 60,
            reason: 'Isolamento seguro de tríceps com pico de contração medial.',
          },
          {
            exerciseId: 'exercise-core-01',
            exerciseName: 'Prancha Isométrica',
            order: 3,
            sets: 3,
            reps: '45s',
            restSeconds: 45,
            reason: 'Fortalecimento estabilizador do core prevenindo sobrecarga lombar.',
          },
        ],
      },
    ],
    warnings: [
      'Aluno relatou leve desconforto cervical em posições estáticas na anamnese; manter pescoço neutro na prancha.',
    ],
    assumptions: [
      'Disponibilidade de máquina de supino e polia com corda na academia.',
    ],
    notesForTrainer: [
      'Volume semanal calculado em 14 séries para grupos musculares principais, compatível com nível intermediário.',
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000 + 300000).toISOString(),
    reviewedBy: 'user-rafaela',
    decisionNotes: 'Aprovado após ajustar intervalo de descanso no Supino.',
  },
];
