import { ActivityLog } from '../types';
import { getItem, setItem, STORAGE_KEYS, isSimulationModeActive } from './storage';
import { initialActivities } from '../data/activities';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface IActivityRepository {
  getAll(limit?: number): Promise<ActivityLog[]>;
  getByStudentId(studentId: string): Promise<ActivityLog[]>;
  log(activity: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<ActivityLog>;
}

function mapFromDb(row: any): ActivityLog {
  return {
    id: row.id,
    actorId: row.actor_id || row.actorId,
    actorName: row.actor_name || row.actorName,
    actorRole: row.actor_role || row.actorRole,
    action: row.action,
    description: row.description,
    studentId: row.student_id || row.studentId,
    iconType: row.icon_type || row.iconType,
    timestamp: row.timestamp,
  };
}

function mapToDb(a: ActivityLog): any {
  return {
    id: a.id,
    actor_id: a.actorId,
    actor_name: a.actorName,
    actor_role: a.actorRole,
    action: a.action,
    description: a.description,
    student_id: a.studentId,
    icon_type: a.iconType,
    timestamp: a.timestamp,
  };
}

export class SupabaseActivityRepository implements IActivityRepository {
  async getAll(limit = 50): Promise<ActivityLog[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('activity_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(limit);
        if (!error && data && data.length > 0) {
          const list = data.map(mapFromDb);
          setItem(STORAGE_KEYS.ACTIVITIES, list);
          return list;
        }
      } catch (err) {
        // fallback
      }
    }
    const stored = getItem<ActivityLog[]>(STORAGE_KEYS.ACTIVITIES, initialActivities);
    const existingIds = new Set(stored.map((a) => a.id));
    const merged = [...stored];
    for (const initAct of initialActivities) {
      if (!existingIds.has(initAct.id)) {
        merged.push(initAct);
      }
    }
    merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return merged.slice(0, limit);
  }

  async getByStudentId(studentId: string): Promise<ActivityLog[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('student_id', studentId)
          .order('timestamp', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(mapFromDb);
        }
      } catch (err) {
        // fallback
      }
    }
    const list = await this.getAll();
    return list.filter((a) => a.studentId === studentId);
  }

  async log(data: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<ActivityLog> {
    const newLog: ActivityLog = {
      ...data,
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };

    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        await supabase.from('activity_logs').insert(mapToDb(newLog));
      } catch (err) {
        console.error('Supabase log activity error:', err);
      }
    }

    const list = getItem<ActivityLog[]>(STORAGE_KEYS.ACTIVITIES, initialActivities);
    list.unshift(newLog);
    setItem(STORAGE_KEYS.ACTIVITIES, list);
    return newLog;
  }
}

export const activityRepository = new SupabaseActivityRepository();

