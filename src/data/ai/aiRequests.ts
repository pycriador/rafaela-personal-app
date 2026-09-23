import { AIRequest } from '../../types';

export const initialAIRequests: AIRequest[] = [
  {
    id: 'req-init-01',
    trainerId: 'user-rafaela',
    studentId: 'student-mariana',
    task: 'workout_generation',
    model: 'gemini-2.0-flash',
    promptVersion: 'workout-generator-v1.0',
    latencyMs: 1420,
    tokenUsage: {
      promptTokens: 1150,
      completionTokens: 480,
      totalTokens: 1630,
    },
    status: 'success',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'req-init-02',
    trainerId: 'user-rafaela',
    studentId: 'student-joao',
    task: 'exercise_alternative',
    model: 'gemini-2.0-flash',
    promptVersion: 'exercise-copilot-v1.0',
    latencyMs: 780,
    tokenUsage: {
      promptTokens: 620,
      completionTokens: 210,
      totalTokens: 830,
    },
    status: 'success',
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
];
