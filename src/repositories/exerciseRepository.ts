import { Exercise, ExerciseCategory, ExerciseType } from '../types';
import { getItem, setItem, STORAGE_KEYS } from './storage';
import { initialExercises } from '../data/exercises';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface ExerciseFilters {
  search?: string;
  category?: ExerciseCategory | string;
  type?: ExerciseType | string;
  difficulty?: string;
  equipment?: string;
}

export interface IExerciseRepository {
  getAll(filters?: ExerciseFilters): Promise<Exercise[]>;
  getById(id: string): Promise<Exercise | null>;
  getAlternatives(exerciseId: string): Promise<Exercise[]>;
  create(exercise: Omit<Exercise, 'id'>): Promise<Exercise>;
  update(id: string, updates: Partial<Exercise>): Promise<Exercise | null>;
  delete(id: string): Promise<boolean>;
}

function mapFromDb(row: any): Exercise {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    type: row.type,
    muscleGroups: Array.isArray(row.muscle_groups)
      ? row.muscle_groups
      : Array.isArray(row.muscleGroups)
      ? row.muscleGroups
      : JSON.parse(row.muscle_groups || '[]'),
    equipment: row.equipment,
    difficulty: row.difficulty,
    instructions: row.instructions,
    videoUrl: row.video_url || row.videoUrl,
    imageUrl: row.image_url || row.imageUrl,
    videoFrames: Array.isArray(row.video_frames)
      ? row.video_frames
      : Array.isArray(row.videoFrames)
      ? row.videoFrames
      : row.video_frames
      ? JSON.parse(row.video_frames)
      : undefined,
    alternatives: Array.isArray(row.alternatives)
      ? row.alternatives
      : JSON.parse(row.alternatives || '[]'),
  };
}

function mapToDb(exercise: Partial<Exercise>): any {
  const row: any = { ...exercise };
  if (exercise.muscleGroups !== undefined) {
    row.muscle_groups = exercise.muscleGroups;
    delete row.muscleGroups;
  }
  if (exercise.videoUrl !== undefined) {
    row.video_url = exercise.videoUrl;
    delete row.videoUrl;
  }
  if (exercise.imageUrl !== undefined) {
    row.image_url = exercise.imageUrl;
    delete row.imageUrl;
  }
  if (exercise.videoFrames !== undefined) {
    row.video_frames = exercise.videoFrames;
    delete row.videoFrames;
  }
  return row;
}

export class SupabaseExerciseRepository implements IExerciseRepository {
  async getAll(filters?: ExerciseFilters): Promise<Exercise[]> {
    let exercises: Exercise[] = [];

    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('exercises').select('*').order('name');
        if (filters?.category && filters.category !== 'all') {
          query = query.eq('category', filters.category);
        }
        if (filters?.type && filters.type !== 'all') {
          query = query.eq('type', filters.type);
        }
        if (filters?.difficulty && filters.difficulty !== 'all') {
          query = query.eq('difficulty', filters.difficulty);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          exercises = data.map(mapFromDb);
          setItem(STORAGE_KEYS.EXERCISES, exercises);
        } else {
          exercises = getItem<Exercise[]>(STORAGE_KEYS.EXERCISES, initialExercises);
        }
      } catch (err) {
        exercises = getItem<Exercise[]>(STORAGE_KEYS.EXERCISES, initialExercises);
      }
    } else {
      exercises = getItem<Exercise[]>(STORAGE_KEYS.EXERCISES, initialExercises);
    }

    // Auto-enrich with local SVG videoFrames and updated imagery
    exercises = exercises.map((ex) => {
      const init = initialExercises.find((i) => i.id === ex.id);
      if (init) {
        return {
          ...ex,
          videoFrames: ex.videoFrames && ex.videoFrames.length > 0 ? ex.videoFrames : init.videoFrames,
          imageUrl: ex.imageUrl && ex.imageUrl.includes('/frames/') ? ex.imageUrl : init.imageUrl,
        };
      }
      return ex;
    });

    // If deadlift is in initialExercises but not in stored list, include it
    initialExercises.forEach((initEx) => {
      if (!exercises.some((e) => e.id === initEx.id)) {
        exercises.push(initEx);
      }
    });

    if (filters) {
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        exercises = exercises.filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.equipment.toLowerCase().includes(q) ||
            e.muscleGroups.some((m) => m.toLowerCase().includes(q))
        );
      }
      if (filters.category && filters.category !== 'all') {
        exercises = exercises.filter((e) => e.category === filters.category);
      }
      if (filters.type && filters.type !== 'all') {
        exercises = exercises.filter((e) => e.type === filters.type);
      }
      if (filters.difficulty && filters.difficulty !== 'all') {
        exercises = exercises.filter((e) => e.difficulty === filters.difficulty);
      }
    }

    return exercises;
  }

  async getById(id: string): Promise<Exercise | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('exercises').select('*').eq('id', id).single();
        if (!error && data) {
          return mapFromDb(data);
        }
      } catch (err) {
        // fallback
      }
    }
    const list = await this.getAll();
    return list.find((e) => e.id === id) || null;
  }

  async getAlternatives(exerciseId: string): Promise<Exercise[]> {
    const ex = await this.getById(exerciseId);
    if (!ex || !ex.alternatives || ex.alternatives.length === 0) return [];
    const all = await this.getAll();
    return all.filter((e) => ex.alternatives.includes(e.id));
  }

  async create(data: Omit<Exercise, 'id'>): Promise<Exercise> {
    const newExercise: Exercise = {
      ...data,
      id: `exercise-${Date.now()}`,
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('exercises').insert(mapToDb(newExercise));
      } catch (err) {
        console.error('Supabase create exercise error:', err);
      }
    }

    const localList = getItem<Exercise[]>(STORAGE_KEYS.EXERCISES, initialExercises);
    localList.unshift(newExercise);
    setItem(STORAGE_KEYS.EXERCISES, localList);
    return newExercise;
  }

  async update(id: string, updates: Partial<Exercise>): Promise<Exercise | null> {
    let updatedExercise: Exercise | null = null;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('exercises')
          .update(mapToDb(updates))
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          updatedExercise = mapFromDb(data);
        }
      } catch (err) {
        console.error('Supabase update exercise error:', err);
      }
    }

    const localList = getItem<Exercise[]>(STORAGE_KEYS.EXERCISES, initialExercises);
    const index = localList.findIndex((e) => e.id === id);
    if (index !== -1) {
      localList[index] = { ...localList[index], ...updates };
      setItem(STORAGE_KEYS.EXERCISES, localList);
      if (!updatedExercise) updatedExercise = localList[index];
    }

    return updatedExercise;
  }

  async delete(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('exercises').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase delete exercise error:', err);
      }
    }

    const localList = getItem<Exercise[]>(STORAGE_KEYS.EXERCISES, initialExercises);
    const filtered = localList.filter((e) => e.id !== id);
    setItem(STORAGE_KEYS.EXERCISES, filtered);
    return true;
  }
}

export const exerciseRepository = new SupabaseExerciseRepository();

