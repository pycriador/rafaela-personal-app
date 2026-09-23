import { FormApplication } from '../types';
import { initialFormApplications } from '../data/anamnesis/formApplications';
import { STORAGE_KEYS, getItem, setItem, isSimulationModeActive } from './storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

function mapFromDb(row: any): FormApplication {
  return {
    id: row.id,
    formId: row.form_id || row.formId,
    formVersionId: row.form_version_id || row.formVersionId,
    studentId: row.student_id || row.studentId,
    status: row.status,
    assignedBy: row.assigned_by || 'user-rafaela',
    assignedAt: row.applied_at || row.assigned_at || row.assignedAt || new Date().toISOString(),
    dueAt: row.due_at || null,
    message: row.message || undefined,
    notes: row.notes || undefined,
    isMandatory: row.is_mandatory ?? true,
  };
}

export const formApplicationRepository = {
  async getAll(): Promise<FormApplication[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('form_applications').select('*').order('applied_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(mapFromDb);
        }
      } catch (err) {
        // fallback
      }
    }
    return getItem<FormApplication[]>(STORAGE_KEYS.FORM_APPLICATIONS, initialFormApplications);
  },

  async getById(id: string): Promise<FormApplication | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('form_applications').select('*').eq('id', id).maybeSingle();
        if (!error && data) {
          return mapFromDb(data);
        }
      } catch (err) {
        // fallback
      }
    }
    const list = await this.getAll();
    return list.find((a) => a.id === id) || null;
  },

  async getByStudentId(studentId: string): Promise<FormApplication[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('form_applications')
          .select('*')
          .eq('student_id', studentId)
          .order('applied_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(mapFromDb);
        }
      } catch (err) {
        // fallback
      }
    }
    const list = await this.getAll();
    return list.filter((a) => a.studentId === studentId);
  },

  async getByFormId(formId: string): Promise<FormApplication[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('form_applications')
          .select('*')
          .eq('form_id', formId)
          .order('applied_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(mapFromDb);
        }
      } catch (err) {
        // fallback
      }
    }
    const list = await this.getAll();
    return list.filter((a) => a.formId === formId);
  },

  async save(application: FormApplication): Promise<FormApplication> {
    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        await supabase.from('form_applications').upsert({
          id: application.id,
          form_id: application.formId,
          form_version_id: application.formVersionId,
          student_id: application.studentId,
          status: application.status,
          applied_at: application.assignedAt || new Date().toISOString(),
          completed_at: application.status === 'completed' ? new Date().toISOString() : null,
          allow_progress_save: true,
          notes: application.notes || application.message || null,
        });
      } catch (err) {
        // fallback
      }
    }

    const list = getItem<FormApplication[]>(STORAGE_KEYS.FORM_APPLICATIONS, initialFormApplications);
    const index = list.findIndex((a) => a.id === application.id);
    let updated: FormApplication[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = application;
    } else {
      updated = [application, ...list];
    }
    setItem(STORAGE_KEYS.FORM_APPLICATIONS, updated);
    return application;
  },

  async saveBatch(applications: FormApplication[]): Promise<FormApplication[]> {
    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        const rows = applications.map((app) => ({
          id: app.id,
          form_id: app.formId,
          form_version_id: app.formVersionId,
          student_id: app.studentId,
          status: app.status,
          applied_at: app.assignedAt || new Date().toISOString(),
          completed_at: app.status === 'completed' ? new Date().toISOString() : null,
          allow_progress_save: true,
          notes: app.notes || app.message || null,
        }));
        await supabase.from('form_applications').upsert(rows);
      } catch (err) {
        // fallback
      }
    }

    const list = getItem<FormApplication[]>(STORAGE_KEYS.FORM_APPLICATIONS, initialFormApplications);
    const updated = [...applications, ...list];
    setItem(STORAGE_KEYS.FORM_APPLICATIONS, updated);
    return applications;
  },

  async cancel(id: string): Promise<FormApplication | null> {
    const app = await this.getById(id);
    if (!app) return null;
    app.status = 'cancelled';
    return this.save(app);
  },

  async markAsCompleted(id: string): Promise<FormApplication | null> {
    const app = await this.getById(id);
    if (!app) return null;
    app.status = 'completed';
    return this.save(app);
  },
};
