export type UserRole = 'personal' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  studentProfileId?: string;
}

export type StudentGoal =
  | 'Emagrecimento'
  | 'Hipertrofia'
  | 'Definição'
  | 'Condicionamento'
  | 'Força'
  | 'Saúde'
  | 'Mobilidade'
  | 'Performance'
  | 'Manutenção';

export type DayOfWeek =
  | 'Segunda'
  | 'Terça'
  | 'Quarta'
  | 'Quinta'
  | 'Sexta'
  | 'Sábado'
  | 'Domingo';

export interface Student {
  id: string;
  userId: string;
  name: string;
  birthDate: string;
  gender: 'Feminino' | 'Masculino' | 'Outro';
  phone: string;
  email: string;
  goals: StudentGoal[];
  availableDays: DayOfWeek[];
  level: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Atleta';
  experience: string;
  notes?: string;
  restrictions?: string;
  preferences?: string;
  avatarUrl?: string;
  createdAt: string;
  lastActive: string;
  status: 'Ativo' | 'Inativo' | 'Atenção' | 'Pausado' | 'Arquivado';
  adherencePercentage: number; // e.g. 92%
}

export type ExerciseCategory =
  | 'Peito'
  | 'Costas'
  | 'Pernas'
  | 'Ombros'
  | 'Bíceps'
  | 'Tríceps'
  | 'Core'
  | 'Cardio'
  | 'Mobilidade';


export type ExerciseType =
  | 'máquina'
  | 'livre'
  | 'peso corporal'
  | 'cabo'
  | 'halteres'
  | 'barra';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  type: ExerciseType;
  muscleGroups: string[];
  equipment: string;
  difficulty: 'iniciante' | 'intermediário' | 'avançado';
  instructions: string;
  videoUrl?: string;
  imageUrl?: string;
  videoFrames?: string[];
  alternatives: string[]; // Exercise IDs
}

export interface WorkoutExercise {
  exerciseId: string;
  order: number;
  sets: number;
  reps: number;
  weight: number; // in kg
  restSeconds: number;
  notes?: string;
  alternatives: string[]; // Allowed alternative Exercise IDs
  allowWeightChange: boolean;
  allowSetChange: boolean;
  allowRepChange: boolean;
  allowSkip: boolean;
  allowSubstitution: boolean;
}

export interface WorkoutDay {
  id: string;
  name: string; // e.g. "Treino A - Peito e Tríceps"
  dayOfWeek: DayOfWeek;
  muscleFocus: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutPlan {
  id: string;
  studentId: string;
  trainerId: string;
  name: string;
  version?: number; // 1, 2, 3...
  cycleName?: string; // e.g., "Fase 1 - Adaptação", "Fase 2 - Hipertrofia Acentuada"
  active: boolean;
  validFrom?: string;
  validUntil?: string;
  notes?: string;
  days: WorkoutDay[];
  createdAt: string;
  updatedAt: string;
}

export interface ExecutedSet {
  exerciseId: string;
  setIndex: number; // 1-based
  prescribedWeight: number;
  prescribedReps: number;
  actualWeight: number;
  actualReps: number;
  completedAt: string;
}

export interface SkippedExercise {
  exerciseId: string;
  exerciseName: string;
  reason: 'Sem equipamento' | 'Dor/desconforto' | 'Falta de tempo' | 'Não quero realizar' | 'Outro';
  notes?: string;
  timestamp: string;
}

export interface SubstitutedExercise {
  originalExerciseId: string;
  originalExerciseName: string;
  substitutedExerciseId: string;
  substitutedExerciseName: string;
  reason: string;
  timestamp: string;
}

export interface WorkoutSession {
  id: string;
  studentId: string;
  workoutPlanId: string;
  workoutDayId: string;
  workoutDayName: string;
  date: string; // YYYY-MM-DD
  status: 'completed' | 'incomplete' | 'skipped' | 'in_progress';
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  rating?: number; // 1 - 5
  rpe?: number; // 1 - 10
  energyLevel?: number; // 1 - 5
  notes?: string;
  setsCompleted: ExecutedSet[];
  skippedExercises: SkippedExercise[];
  substitutedExercises: SubstitutedExercise[];
  totalVolumeKg: number;
  totalSets: number;
  totalExercises: number;
  trainerFeedback?: string;
  trainerFeedbackRating?: number;
  trainerFeedbackTag?: 'Excelente' | 'Ajuste Recomendado' | 'Atenção à Postura' | 'Carga Adequada' | 'Consistência';
  trainerFeedbackAt?: string;
}

export type ModificationAction =
  | 'WEIGHT_CHANGED'
  | 'SET_COUNT_CHANGED'
  | 'REP_COUNT_CHANGED'
  | 'EXERCISE_SKIPPED'
  | 'EXERCISE_SUBSTITUTED'
  | 'WORKOUT_COMPLETED'
  | 'WORKOUT_CREATED'
  | 'WORKOUT_UPDATED'
  | 'DIFFICULTY_REPORTED';

export interface WorkoutModification {
  id: string;
  studentId: string;
  studentName: string;
  sessionId?: string;
  exerciseName: string;
  action: ModificationAction;
  before: any;
  after: any;
  difference?: string;
  reason?: string;
  timestamp: string;
}

export interface FoodItem {
  id: string;
  name: string;
  quantity: string;
  substitutions: string[];
  notes?: string;
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  items: FoodItem[];
  notes?: string;
}

export interface NutritionPlan {
  id: string;
  studentId: string;
  goal: string;
  dailyCalories?: number;
  disclaimer: string;
  meals: Meal[];
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  description: string;
  studentId?: string;
  timestamp: string;
  iconType?: 'dumbbell' | 'alert' | 'check' | 'swap' | 'skip' | 'edit';
}

export interface Notification {
  id: string;
  recipientId: string;
  recipientRole: UserRole;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  link?: string;
}

export type MessageCategory =
  | 'general'
  | 'weight_change'
  | 'exercise_change'
  | 'question'
  | 'assessment'
  | 'motivation';

export interface StudentMessage {
  id: string;
  studentId: string;
  senderId: string;
  senderName: string;
  senderRole: 'personal' | 'student';
  content: string;
  category?: MessageCategory;
  replyTo?: {
    messageId: string;
    senderName: string;
    content: string;
  };
  metadata?: {
    exerciseName?: string;
    weightBefore?: number;
    weightAfter?: number;
    sessionId?: string;
    replyToId?: string;
    replyToSender?: string;
    replyToContent?: string;
  };
  timestamp: string;
  read: boolean;
}

export interface WorkoutTemplate {
  id: string;
  name: string; // e.g. "Série A - Peito e Tríceps Hipertrofia"
  description: string;
  category: ExerciseCategory | 'Full Body' | 'Push' | 'Pull' | 'Legs' | 'Core & Cardio';
  level: 'iniciante' | 'intermediário' | 'avançado';
  muscleFocus: string;
  estimatedMinutes: number;
  exercises: WorkoutExercise[];
  isActive?: boolean;
  version?: number;
  versionTag?: string;
  parentId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export * from './anamnesis';
export * from './ai';
