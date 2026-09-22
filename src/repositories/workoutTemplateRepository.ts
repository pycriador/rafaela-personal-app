import { WorkoutTemplate, WorkoutExercise } from '../types';
import { getItem, setItem, STORAGE_KEYS } from './storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const initialWorkoutTemplates: WorkoutTemplate[] = [
  {
    id: 'template-peito-triceps',
    name: 'Série A - Peito, Tríceps & Ombro (Hipertrofia)',
    description: 'Rotina clássica de empurrar com foco no peitoral e tríceps com boa cadência.',
    category: 'Push',
    level: 'intermediário',
    muscleFocus: 'Peitoral, Tríceps e Deltoide Anterior',
    estimatedMinutes: 50,
    exercises: [
      {
        exerciseId: 'exercise-peito-01', // Supino Máquina
        order: 1,
        sets: 4,
        reps: 10,
        weight: 30,
        restSeconds: 60,
        notes: 'Cadência 2-0-2. Manter escápulas retraídas.',
        alternatives: ['exercise-peito-03'],
        allowWeightChange: true,
        allowSetChange: false,
        allowRepChange: true,
        allowSkip: false,
        allowSubstitution: true,
      },
      {
        exerciseId: 'exercise-peito-02', // Supino Inclinado com Halteres
        order: 2,
        sets: 3,
        reps: 12,
        weight: 14,
        restSeconds: 60,
        notes: 'Foco na porção clavicular. Não bater os halteres no topo.',
        alternatives: ['exercise-peito-01'],
        allowWeightChange: true,
        allowSetChange: false,
        allowRepChange: true,
        allowSkip: true,
        allowSubstitution: true,
      },
      {
        exerciseId: 'exercise-triceps-01', // Tríceps Corda
        order: 3,
        sets: 4,
        reps: 12,
        weight: 18,
        restSeconds: 45,
        notes: 'Abrir a corda no final da extensão.',
        alternatives: ['exercise-triceps-02'],
        allowWeightChange: true,
        allowSetChange: false,
        allowRepChange: true,
        allowSkip: false,
        allowSubstitution: true,
      },
      {
        exerciseId: 'exercise-ombros-01', // Elevação Lateral
        order: 4,
        sets: 4,
        reps: 15,
        weight: 6,
        restSeconds: 45,
        notes: 'Sem balanço de tronco.',
        alternatives: [],
        allowWeightChange: true,
        allowSetChange: false,
        allowRepChange: true,
        allowSkip: true,
        allowSubstitution: true,
      },
    ],
    createdAt: '2026-01-10',
    updatedAt: '2026-03-01',
  },
  {
    id: 'template-costas-biceps',
    name: 'Série B - Costas, Bíceps & Trapézio (Densidade)',
    description: 'Rotina de puxar para alargamento dorsal e desenvolvimento de braços.',
    category: 'Pull',
    level: 'intermediário',
    muscleFocus: 'Dorsal, Bíceps e Trapézio',
    estimatedMinutes: 50,
    exercises: [
      {
        exerciseId: 'exercise-costas-01', // Puxada Frontal
        order: 1,
        sets: 4,
        reps: 10,
        weight: 35,
        restSeconds: 60,
        notes: 'Puxar até a altura do queixo cotovelos apontando para baixo.',
        alternatives: ['exercise-costas-02'],
        allowWeightChange: true,
        allowSetChange: false,
        allowRepChange: true,
        allowSkip: false,
        allowSubstitution: true,
      },
      {
        exerciseId: 'exercise-costas-02', // Remada Baixa
        order: 2,
        sets: 4,
        reps: 10,
        weight: 32,
        restSeconds: 60,
        notes: 'Coluna alinhada, contrair 1 segundo no pico.',
        alternatives: [],
        allowWeightChange: true,
        allowSetChange: false,
        allowRepChange: true,
        allowSkip: false,
        allowSubstitution: true,
      },
      {
        exerciseId: 'exercise-biceps-01', // Rosca Direta com Barra W
        order: 3,
        sets: 3,
        reps: 12,
        weight: 16,
        restSeconds: 50,
        notes: 'Cotovelos colados no tronco.',
        alternatives: ['exercise-biceps-02'],
        allowWeightChange: true,
        allowSetChange: false,
        allowRepChange: true,
        allowSkip: true,
        allowSubstitution: true,
      },
    ],
    createdAt: '2026-01-10',
    updatedAt: '2026-03-01',
  },
  {
    id: 'template-pernas-gluteos',
    name: 'Série C - Pernas Completo (Foco Quadríceps & Glúteos)',
    description: 'Treino inferior potente com agachamentos, leg press e isoladores de glúteo.',
    category: 'Legs',
    level: 'avançado',
    muscleFocus: 'Quadríceps, Glúteos e Posteriores',
    estimatedMinutes: 55,
    exercises: [
      {
        exerciseId: 'exercise-pernas-01', // Leg Press 45
        order: 1,
        sets: 4,
        reps: 12,
        weight: 120,
        restSeconds: 90,
        notes: 'Pés na largura dos ombros. Amplitude máxima segura.',
        alternatives: ['exercise-pernas-02'],
        allowWeightChange: true,
        allowSetChange: false,
        allowRepChange: true,
        allowSkip: false,
        allowSubstitution: true,
      },
      {
        exerciseId: 'exercise-pernas-02', // Cadeira Extensora
        order: 2,
        sets: 4,
        reps: 12,
        weight: 40,
        restSeconds: 60,
        notes: 'Pausa isométrica de 1s na contração máxima.',
        alternatives: [],
        allowWeightChange: true,
        allowSetChange: false,
        allowRepChange: true,
        allowSkip: false,
        allowSubstitution: true,
      },
      {
        exerciseId: 'exercise-pernas-03', // Mesa Flexora
        order: 3,
        sets: 3,
        reps: 12,
        weight: 30,
        restSeconds: 60,
        notes: 'Quadril apoiado durante todo o movimento.',
        alternatives: [],
        allowWeightChange: true,
        allowSetChange: false,
        allowRepChange: true,
        allowSkip: true,
        allowSubstitution: true,
      },
    ],
    createdAt: '2026-01-10',
    updatedAt: '2026-03-01',
  },
  {
    id: 'template-iniciante-fullbody',
    name: 'Série D - Adaptação Geral & Postura (Iniciante)',
    description: 'Treino de condicionamento geral e fortalecimento neuromuscular seguro.',
    category: 'Full Body',
    level: 'iniciante',
    muscleFocus: 'Corpo Inteiro e Core',
    estimatedMinutes: 40,
    exercises: [
      {
        exerciseId: 'exercise-peito-01', // Supino Máquina
        order: 1,
        sets: 3,
        reps: 12,
        weight: 20,
        restSeconds: 60,
        notes: 'Execução suave e controlada.',
        alternatives: [],
        allowWeightChange: true,
        allowSetChange: true,
        allowRepChange: true,
        allowSkip: true,
        allowSubstitution: true,
      },
      {
        exerciseId: 'exercise-costas-01', // Puxada Frontal
        order: 2,
        sets: 3,
        reps: 12,
        weight: 25,
        restSeconds: 60,
        notes: 'Mantenha peito aberto.',
        alternatives: [],
        allowWeightChange: true,
        allowSetChange: true,
        allowRepChange: true,
        allowSkip: true,
        allowSubstitution: true,
      },
      {
        exerciseId: 'exercise-pernas-02', // Cadeira Extensora
        order: 3,
        sets: 3,
        reps: 12,
        weight: 25,
        restSeconds: 60,
        notes: 'Sem trancos nos joelhos.',
        alternatives: [],
        allowWeightChange: true,
        allowSetChange: true,
        allowRepChange: true,
        allowSkip: true,
        allowSubstitution: true,
      },
    ],
    createdAt: '2026-01-15',
    updatedAt: '2026-03-01',
  },
];

export interface IWorkoutTemplateRepository {
  getAll(): Promise<WorkoutTemplate[]>;
  getById(id: string): Promise<WorkoutTemplate | null>;
  save(template: WorkoutTemplate): Promise<WorkoutTemplate>;
  delete(id: string): Promise<boolean>;
}

export class SupabaseWorkoutTemplateRepository implements IWorkoutTemplateRepository {
  async getAll(): Promise<WorkoutTemplate[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('workout_templates').select('*');
        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            name: d.name,
            description: d.description,
            category: d.category,
            level: d.level,
            muscleFocus: d.muscle_focus || d.muscleFocus,
            estimatedMinutes: d.estimated_minutes || d.estimatedMinutes,
            exercises: Array.isArray(d.exercises) ? d.exercises : JSON.parse(d.exercises || '[]'),
            createdAt: d.created_at || d.createdAt,
            updatedAt: d.updated_at || d.updatedAt,
          }));
        }
      } catch (err) {
        // fallback
      }
    }
    return getItem<WorkoutTemplate[]>(STORAGE_KEYS.WORKOUT_TEMPLATES, initialWorkoutTemplates);
  }

  async getById(id: string): Promise<WorkoutTemplate | null> {
    const list = await this.getAll();
    return list.find((t) => t.id === id) || null;
  }

  async save(template: WorkoutTemplate): Promise<WorkoutTemplate> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('workout_templates').upsert({
          id: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          level: template.level,
          muscle_focus: template.muscleFocus,
          estimated_minutes: template.estimatedMinutes,
          exercises: template.exercises,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Supabase save template error:', err);
      }
    }

    const list = await this.getAll();
    const idx = list.findIndex((t) => t.id === template.id);
    if (idx === -1) {
      list.unshift(template);
    } else {
      list[idx] = { ...template, updatedAt: new Date().toISOString().split('T')[0] };
    }
    setItem(STORAGE_KEYS.WORKOUT_TEMPLATES, list);
    return template;
  }

  async delete(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('workout_templates').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase delete template error:', err);
      }
    }
    const list = await this.getAll();
    const filtered = list.filter((t) => t.id !== id);
    setItem(STORAGE_KEYS.WORKOUT_TEMPLATES, filtered);
    return true;
  }
}

export const workoutTemplateRepository = new SupabaseWorkoutTemplateRepository();
