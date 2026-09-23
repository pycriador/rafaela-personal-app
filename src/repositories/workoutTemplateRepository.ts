import { WorkoutTemplate, WorkoutExercise } from '../types';
import { getItem, setItem, STORAGE_KEYS, isSimulationModeActive } from './storage';
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
  toggleStatus(id: string): Promise<WorkoutTemplate | null>;
  duplicateVersion(
    id: string,
    options: { newName?: string; versionTag: string; archivePrevious?: boolean }
  ): Promise<WorkoutTemplate>;
}

export class SupabaseWorkoutTemplateRepository implements IWorkoutTemplateRepository {
  async getAll(): Promise<WorkoutTemplate[]> {
    let rawList: WorkoutTemplate[] = [];

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('workout_templates').select('*');
        if (!error && data && data.length > 0) {
          rawList = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            description: d.description,
            category: d.category,
            level: d.level,
            muscleFocus: d.muscle_focus || d.muscleFocus,
            estimatedMinutes: d.estimated_minutes || d.estimatedMinutes,
            exercises: Array.isArray(d.exercises) ? d.exercises : JSON.parse(d.exercises || '[]'),
            isActive: d.is_active ?? d.isActive ?? true,
            version: d.version || 1,
            versionTag: d.version_tag || d.versionTag || 'v1.0',
            parentId: d.parent_id || d.parentId,
            notes: d.notes,
            createdAt: d.created_at || d.createdAt,
            updatedAt: d.updated_at || d.updatedAt,
          }));
        }
      } catch (err) {
        // fallback
      }
    }

    if (rawList.length === 0) {
      rawList = getItem<WorkoutTemplate[]>(STORAGE_KEYS.WORKOUT_TEMPLATES, initialWorkoutTemplates);
    }

    // Ensure backwards compatibility with defaults
    return rawList.map((t) => ({
      ...t,
      isActive: t.isActive !== false,
      version: t.version || 1,
      versionTag: t.versionTag || 'v1.0',
    }));
  }

  async getById(id: string): Promise<WorkoutTemplate | null> {
    const list = await this.getAll();
    return list.find((t) => t.id === id) || null;
  }

  async save(template: WorkoutTemplate): Promise<WorkoutTemplate> {
    const enriched: WorkoutTemplate = {
      ...template,
      isActive: template.isActive !== false,
      version: template.version || 1,
      versionTag: template.versionTag || 'v1.0',
      updatedAt: new Date().toISOString().split('T')[0],
      createdAt: template.createdAt || new Date().toISOString().split('T')[0],
    };

    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        await supabase.from('workout_templates').upsert({
          id: enriched.id,
          name: enriched.name,
          description: enriched.description,
          category: enriched.category,
          level: enriched.level,
          muscle_focus: enriched.muscleFocus,
          estimated_minutes: enriched.estimatedMinutes,
          exercises: enriched.exercises,
          is_active: enriched.isActive,
          version: enriched.version,
          version_tag: enriched.versionTag,
          parent_id: enriched.parentId,
          notes: enriched.notes,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Supabase save template error:', err);
      }
    }

    const list = await this.getAll();
    const idx = list.findIndex((t) => t.id === enriched.id);
    if (idx === -1) {
      list.unshift(enriched);
    } else {
      list[idx] = enriched;
    }
    setItem(STORAGE_KEYS.WORKOUT_TEMPLATES, list);
    return enriched;
  }

  async toggleStatus(id: string): Promise<WorkoutTemplate | null> {
    const list = await this.getAll();
    const idx = list.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const current = list[idx];
    const updated: WorkoutTemplate = {
      ...current,
      isActive: current.isActive === false ? true : false,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    return this.save(updated);
  }

  async duplicateVersion(
    id: string,
    options: { newName?: string; versionTag: string; archivePrevious?: boolean }
  ): Promise<WorkoutTemplate> {
    const original = await this.getById(id);
    if (!original) {
      throw new Error('Série modelo não encontrada para versionamento.');
    }

    // Calculate next version number
    const currentVer = original.version || 1;
    const nextVer = currentVer + 1;

    // Archive previous version if requested
    if (options.archivePrevious) {
      await this.save({
        ...original,
        isActive: false,
        name: original.name.includes('(v')
          ? original.name
          : `${original.name} (${original.versionTag || `v${currentVer}.0`}) [Arquivada]`,
      });
    }

    const newId = `template-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const clonedExercises = JSON.parse(JSON.stringify(original.exercises));

    const newVersionTemplate: WorkoutTemplate = {
      ...original,
      id: newId,
      parentId: original.id,
      name: options.newName?.trim() || `${original.name} (${options.versionTag || `v${nextVer}.0`})`,
      version: nextVer,
      versionTag: options.versionTag || `v${nextVer}.0`,
      isActive: true,
      exercises: clonedExercises,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    return this.save(newVersionTemplate);
  }

  async delete(id: string): Promise<boolean> {
    if (isSupabaseConfigured && !isSimulationModeActive()) {
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

