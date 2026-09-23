export type AIProviderType = 'gemini' | 'mock' | 'openai';

export type AIMode = 'mock' | 'gemini';

export type AIDetailLevel = 'baixo' | 'medio' | 'alto';

export type AITone = 'profissional' | 'motivador' | 'tecnico';

export interface AIModelInfo {
  id: string;
  name: string;
  provider: AIProviderType;
  description: string;
  inputTokenLimit: number;
  outputTokenLimit: number;
  supportsThinking?: boolean;
  status: 'disponivel' | 'beta' | 'indisponivel';
  contextWindow: string;
}

export interface AIConfig {
  provider: AIProviderType;
  mode: AIMode;
  apiKeyMasked?: string;
  isKeyConfigured: boolean;
  selectedModel: string;
  temperature: number;
  maxOutputTokens: number;
  thinkingEnabled: boolean;
  language: string;
  tone: AITone;
  detailLevel: AIDetailLevel;
  systemPrompt: string;
  updatedAt: string;
}

export type AITaskType =
  | 'workout_generation'
  | 'workout_review'
  | 'exercise_alternative'
  | 'progress_analysis'
  | 'adherence_analysis'
  | 'anamnesis_summary';

export type AIRequestStatus = 'success' | 'error' | 'validation_failed';

export interface AIRequest {
  id: string;
  trainerId: string;
  studentId?: string;
  task: AITaskType;
  model: string;
  promptVersion: string;
  contextVersion?: string;
  latencyMs: number;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  status: AIRequestStatus;
  error?: string;
  createdAt: string;
}

export interface AIResponse {
  id: string;
  requestId: string;
  rawResponse?: string;
  structuredResponse: any;
  validationStatus: 'passed' | 'failed' | 'modified';
  validationErrors?: string[];
  createdAt: string;
}

export type AIProposalStatus =
  | 'generated'
  | 'reviewed'
  | 'approved'
  | 'rejected'
  | 'modified';

export interface AIExerciseProposal {
  exerciseId: string;
  exerciseName?: string;
  order: number;
  sets: number;
  reps: string;
  weightKg?: number;
  restSeconds: number;
  notes?: string;
  reason?: string;
  alternativeOfExerciseId?: string;
}

export interface AIWorkoutDayProposal {
  dayOfWeek: string;
  name: string;
  muscleFocus: string;
  estimatedDurationMinutes: number;
  exercises: AIExerciseProposal[];
}

export interface AIWorkoutProposal {
  id: string;
  studentId: string;
  requestId: string;
  promptVersion: string;
  model: string;
  status: AIProposalStatus;
  workoutName: string;
  goal: string;
  estimatedDurationMinutes: number;
  days: AIWorkoutDayProposal[];
  warnings: string[];
  assumptions: string[];
  notesForTrainer: string[];
  approvedPlanId?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  decisionNotes?: string;
}

export interface AIStudentConsent {
  studentId: string;
  allowed: boolean;
  updatedAt: string;
  updatedBy: string;
  termsVersion: string;
}

export interface AIContextSelection {
  includeStudentProfile: boolean;
  includeGoals: boolean;
  includeFrequency: boolean;
  includeHistory: boolean;
  includeAnamnesis: boolean;
  includeNutrition: boolean;
  includeFeedback: boolean;
  includeTrainerInstructions: boolean;
}

export interface AIExerciseAlternativeSuggestion {
  originalExerciseId: string;
  originalExerciseName: string;
  suggestedExerciseId: string;
  suggestedExerciseName: string;
  equipmentType: 'livre' | 'maquina' | 'outro';
  reason: string;
  biomechanicalMatch: string;
}

export interface AIAdherenceAnalysisResult {
  summary: string;
  completionRate: number;
  totalSessionsAnalyzed: number;
  completedSessions: number;
  incompleteSessions: number;
  frequentlySkippedExercises: { name: string; count: number }[];
  frequentlySubstitutedExercises: { from: string; to: string; count: number }[];
  loadProgressionHighlights: string[];
  questionsForTrainer: string[];
  suggestedReviewAreas: string[];
}
