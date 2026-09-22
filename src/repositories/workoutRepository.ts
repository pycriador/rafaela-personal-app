import { WorkoutPlan, WorkoutSession, WorkoutModification } from '../types';
import { getItem, setItem, STORAGE_KEYS, isSimulationModeActive } from './storage';
import { initialWorkoutPlans, initialSessions, initialModifications } from '../data/workouts';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface IWorkoutRepository {
  getPlans(): Promise<WorkoutPlan[]>;
  getPlanById(id: string): Promise<WorkoutPlan | null>;
  getPlanByStudentId(studentId: string): Promise<WorkoutPlan | null>;
  savePlan(plan: WorkoutPlan): Promise<WorkoutPlan>;
  deletePlan(id: string): Promise<boolean>;

  getSessions(studentId?: string): Promise<WorkoutSession[]>;
  getSessionById(id: string): Promise<WorkoutSession | null>;
  saveSession(session: WorkoutSession): Promise<WorkoutSession>;
  updateSessionFeedback(
    sessionId: string,
    feedback: string,
    tag?: WorkoutSession['trainerFeedbackTag'],
    rating?: number
  ): Promise<WorkoutSession | null>;

  getModifications(studentId?: string): Promise<WorkoutModification[]>;
  saveModification(mod: Omit<WorkoutModification, 'id' | 'timestamp'>): Promise<WorkoutModification>;

  getPlansByStudentId(studentId: string): Promise<WorkoutPlan[]>;
  activatePlanVersion(studentId: string, planId: string): Promise<WorkoutPlan | null>;
}

function mapPlanFromDb(row: any): WorkoutPlan {
  return {
    id: row.id,
    studentId: row.student_id || row.studentId,
    trainerId: row.trainer_id || row.trainerId,
    name: row.name,
    version: row.version ? Number(row.version) : 1,
    cycleName: row.cycle_name || row.cycleName,
    active: row.active ?? true,
    validFrom: row.valid_from || row.validFrom,
    validUntil: row.valid_until || row.validUntil,
    notes: row.notes,
    days: Array.isArray(row.days) ? row.days : JSON.parse(row.days || '[]'),
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
  };
}

function mapPlanToDb(plan: WorkoutPlan): any {
  return {
    id: plan.id,
    student_id: plan.studentId,
    trainer_id: plan.trainerId,
    name: plan.name,
    version: plan.version ?? 1,
    cycle_name: plan.cycleName,
    active: plan.active,
    valid_from: plan.validFrom,
    valid_until: plan.validUntil,
    notes: plan.notes,
    days: plan.days,
    updated_at: new Date().toISOString(),
  };
}

function mapSessionFromDb(row: any): WorkoutSession {
  return {
    id: row.id,
    studentId: row.student_id || row.studentId,
    workoutPlanId: row.workout_plan_id || row.workoutPlanId,
    workoutDayId: row.workout_day_id || row.workoutDayId,
    workoutDayName: row.workout_day_name || row.workoutDayName,
    date: row.date,
    status: row.status,
    startTime: row.start_time || row.startTime,
    endTime: row.end_time || row.endTime,
    durationMinutes: Number(row.duration_minutes ?? row.durationMinutes ?? 0),
    rating: row.rating ? Number(row.rating) : undefined,
    rpe: row.rpe ? Number(row.rpe) : undefined,
    energyLevel: row.energy_level ? Number(row.energy_level) : undefined,
    notes: row.notes,
    setsCompleted: Array.isArray(row.sets_completed)
      ? row.sets_completed
      : JSON.parse(row.sets_completed || '[]'),
    skippedExercises: Array.isArray(row.skipped_exercises)
      ? row.skipped_exercises
      : JSON.parse(row.skipped_exercises || '[]'),
    substitutedExercises: Array.isArray(row.substituted_exercises)
      ? row.substituted_exercises
      : JSON.parse(row.substituted_exercises || '[]'),
    totalVolumeKg: Number(row.total_volume_kg ?? row.totalVolumeKg ?? 0),
    totalSets: Number(row.total_sets ?? row.totalSets ?? 0),
    totalExercises: Number(row.total_exercises ?? row.totalExercises ?? 0),
    trainerFeedback: row.trainer_feedback || row.trainerFeedback,
    trainerFeedbackRating: row.trainer_feedback_rating ? Number(row.trainer_feedback_rating) : row.trainerFeedbackRating,
    trainerFeedbackTag: row.trainer_feedback_tag || row.trainerFeedbackTag,
    trainerFeedbackAt: row.trainer_feedback_at || row.trainerFeedbackAt,
  };
}

function mapSessionToDb(s: WorkoutSession): any {
  return {
    id: s.id,
    student_id: s.studentId,
    workout_plan_id: s.workoutPlanId,
    workout_day_id: s.workoutDayId,
    workout_day_name: s.workoutDayName,
    date: s.date,
    status: s.status,
    start_time: s.startTime,
    end_time: s.endTime,
    duration_minutes: s.durationMinutes,
    rating: s.rating,
    rpe: s.rpe,
    energy_level: s.energyLevel,
    notes: s.notes,
    sets_completed: s.setsCompleted,
    skipped_exercises: s.skippedExercises,
    substituted_exercises: s.substitutedExercises,
    total_volume_kg: s.totalVolumeKg,
    total_sets: s.totalSets,
    total_exercises: s.totalExercises,
    trainer_feedback: s.trainerFeedback,
    trainer_feedback_rating: s.trainerFeedbackRating,
    trainer_feedback_tag: s.trainerFeedbackTag,
    trainer_feedback_at: s.trainerFeedbackAt,
  };
}

function mapModFromDb(row: any): WorkoutModification {
  return {
    id: row.id,
    studentId: row.student_id || row.studentId,
    studentName: row.student_name || row.studentName,
    sessionId: row.session_id || row.sessionId,
    exerciseName: row.exercise_name || row.exerciseName,
    action: row.action,
    before: row.before_value !== undefined ? row.before_value : row.before,
    after: row.after_value !== undefined ? row.after_value : row.after,
    difference: row.difference,
    reason: row.reason,
    timestamp: row.timestamp,
  };
}

function mapModToDb(m: WorkoutModification): any {
  return {
    id: m.id,
    student_id: m.studentId,
    student_name: m.studentName,
    session_id: m.sessionId,
    exercise_name: m.exerciseName,
    action: m.action,
    before_value: m.before,
    after_value: m.after,
    difference: m.difference,
    reason: m.reason,
    timestamp: m.timestamp,
  };
}

export class SupabaseWorkoutRepository implements IWorkoutRepository {
  async getPlans(): Promise<WorkoutPlan[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('workout_plans').select('*');
        if (!error && data && data.length > 0) {
          const plans = data.map(mapPlanFromDb);
          setItem(STORAGE_KEYS.WORKOUT_PLANS, plans);
          return plans;
        }
      } catch (err) {
        // fallback
      }
    }
    return getItem<WorkoutPlan[]>(STORAGE_KEYS.WORKOUT_PLANS, initialWorkoutPlans);
  }

  async getPlanById(id: string): Promise<WorkoutPlan | null> {
    const plans = await this.getPlans();
    return plans.find((p) => p.id === id) || null;
  }

  async getPlanByStudentId(studentId: string): Promise<WorkoutPlan | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('workout_plans')
          .select('*')
          .eq('student_id', studentId)
          .order('active', { ascending: false });
        if (!error && data && data.length > 0) {
          return mapPlanFromDb(data[0]);
        }
      } catch (err) {
        // fallback
      }
    }
    const plans = await this.getPlans();
    return (
      plans.find((p) => p.studentId === studentId && p.active) ||
      plans.find((p) => p.studentId === studentId) ||
      null
    );
  }

  async savePlan(plan: WorkoutPlan): Promise<WorkoutPlan> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('workout_plans').upsert(mapPlanToDb(plan));
      } catch (err) {
        console.error('Supabase save plan error:', err);
      }
    }

    const plans = await this.getPlans();
    const index = plans.findIndex((p) => p.id === plan.id);
    if (index === -1) {
      plans.unshift(plan);
    } else {
      plans[index] = { ...plan, updatedAt: new Date().toISOString().split('T')[0] };
    }
    setItem(STORAGE_KEYS.WORKOUT_PLANS, plans);
    return plan;
  }

  async deletePlan(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('workout_plans').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase delete plan error:', err);
      }
    }
    const plans = await this.getPlans();
    const filtered = plans.filter((p) => p.id !== id);
    setItem(STORAGE_KEYS.WORKOUT_PLANS, filtered);
    return true;
  }

  async getSessions(studentId?: string): Promise<WorkoutSession[]> {
    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        let query = supabase.from('workout_sessions').select('*').order('date', { ascending: false });
        if (studentId) {
          query = query.eq('student_id', studentId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const sessions = data.map(mapSessionFromDb);
          if (!studentId) setItem(STORAGE_KEYS.SESSIONS, sessions);
          return sessions;
        }
      } catch (err) {
        // fallback
      }
    }

    const sessions = getItem<WorkoutSession[]>(STORAGE_KEYS.SESSIONS, initialSessions);
    if (studentId) {
      return sessions.filter((s) => s.studentId === studentId);
    }
    return sessions;
  }

  async getSessionById(id: string): Promise<WorkoutSession | null> {
    const sessions = await this.getSessions();
    return sessions.find((s) => s.id === id) || null;
  }

  async saveSession(session: WorkoutSession): Promise<WorkoutSession> {
    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        await supabase.from('workout_sessions').upsert(mapSessionToDb(session));
      } catch (err) {
        console.error('Supabase save session error:', err);
      }
    }

    const sessions = await this.getSessions();
    const index = sessions.findIndex((s) => s.id === session.id);
    if (index === -1) {
      sessions.unshift(session);
    } else {
      sessions[index] = session;
    }
    setItem(STORAGE_KEYS.SESSIONS, sessions);
    return session;
  }

  async getModifications(studentId?: string): Promise<WorkoutModification[]> {
    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        let query = supabase
          .from('workout_modifications')
          .select('*')
          .order('timestamp', { ascending: false });
        if (studentId) {
          query = query.eq('student_id', studentId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const mods = data.map(mapModFromDb);
          if (!studentId) setItem(STORAGE_KEYS.MODIFICATIONS, mods);
          return mods;
        }
      } catch (err) {
        // fallback
      }
    }

    const mods = getItem<WorkoutModification[]>(STORAGE_KEYS.MODIFICATIONS, initialModifications);
    if (studentId) {
      return mods.filter((m) => m.studentId === studentId);
    }
    return mods;
  }

  async saveModification(
    modData: Omit<WorkoutModification, 'id' | 'timestamp'>
  ): Promise<WorkoutModification> {
    const newMod: WorkoutModification = {
      ...modData,
      id: `mod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };

    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        await supabase.from('workout_modifications').insert(mapModToDb(newMod));
      } catch (err) {
        console.error('Supabase save modification error:', err);
      }
    }

    const mods = await this.getModifications();
    mods.unshift(newMod);
    setItem(STORAGE_KEYS.MODIFICATIONS, mods);
    return newMod;
  }

  async getPlansByStudentId(studentId: string): Promise<WorkoutPlan[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('workout_plans')
          .select('*')
          .eq('student_id', studentId)
          .order('active', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(mapPlanFromDb);
        }
      } catch (err) {
        // fallback
      }
    }
    const plans = await this.getPlans();
    return plans
      .filter((p) => p.studentId === studentId)
      .sort((a, b) => {
        if (a.active && !b.active) return -1;
        if (!a.active && b.active) return 1;
        return (b.version ?? 1) - (a.version ?? 1);
      });
  }

  async activatePlanVersion(studentId: string, planId: string): Promise<WorkoutPlan | null> {
    const plans = await this.getPlans();
    let target: WorkoutPlan | null = null;

    plans.forEach((p) => {
      if (p.studentId === studentId) {
        if (p.id === planId) {
          p.active = true;
          p.updatedAt = new Date().toISOString().split('T')[0];
          target = p;
        } else {
          p.active = false;
        }
      }
    });

    if (target) {
      if (isSupabaseConfigured) {
        try {
          await supabase.from('workout_plans').update({ active: false }).eq('student_id', studentId);
          await supabase.from('workout_plans').update({ active: true, updated_at: new Date().toISOString() }).eq('id', planId);
        } catch (err) {
          console.error('Supabase activate plan error:', err);
        }
      }
      setItem(STORAGE_KEYS.WORKOUT_PLANS, plans);
    }

    return target;
  }

  async updateSessionFeedback(
    sessionId: string,
    feedback: string,
    tag?: WorkoutSession['trainerFeedbackTag'],
    rating?: number
  ): Promise<WorkoutSession | null> {
    const sessions = await this.getSessions();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return null;

    session.trainerFeedback = feedback;
    session.trainerFeedbackTag = tag;
    session.trainerFeedbackRating = rating;
    session.trainerFeedbackAt = new Date().toISOString();

    await this.saveSession(session);
    return session;
  }
}

export const workoutRepository = new SupabaseWorkoutRepository();

