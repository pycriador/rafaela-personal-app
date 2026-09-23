import { FormResponse } from '../types';
import { initialFormResponses } from '../data/anamnesis/formResponses';
import { STORAGE_KEYS, getItem, setItem, isSimulationModeActive } from './storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

function mapFromDb(row: any): FormResponse {
  let answersList: any[] = [];
  if (Array.isArray(row.answers)) {
    answersList = row.answers;
  } else if (typeof row.answers === 'object' && row.answers !== null) {
    answersList = Object.entries(row.answers).map(([fieldId, value]) => ({
      id: `ans-${row.id}-${fieldId}`,
      responseId: row.id,
      fieldId,
      value,
    }));
  }

  const status: FormResponse['status'] = row.is_draft
    ? 'draft'
    : row.review_status === 'reviewed'
    ? 'reviewed'
    : 'submitted';

  return {
    id: row.id,
    applicationId: row.application_id || row.applicationId,
    formId: row.form_id || row.formId,
    formVersionId: row.form_version_id || row.formVersionId,
    studentId: row.student_id || row.studentId,
    status,
    answers: answersList,
    submittedAt: row.submitted_at || row.submittedAt,
    startedAt: row.started_at,
  };
}

export const formResponseRepository = {
  async getAll(): Promise<FormResponse[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('form_responses').select('*').order('submitted_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(mapFromDb);
        }
      } catch (err) {
        // fallback
      }
    }
    const stored = getItem<FormResponse[]>(STORAGE_KEYS.FORM_RESPONSES, initialFormResponses);
    const missing = initialFormResponses.filter((init) => !stored.some((s) => s.id === init.id));
    if (missing.length > 0) {
      return [...stored, ...missing];
    }
    return stored;
  },

  async getById(id: string): Promise<FormResponse | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('form_responses').select('*').eq('id', id).maybeSingle();
        if (!error && data) {
          return mapFromDb(data);
        }
      } catch (err) {
        // fallback
      }
    }
    const list = await this.getAll();
    return list.find((r) => r.id === id) || null;
  },

  async getByApplicationId(applicationId: string): Promise<FormResponse | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('form_responses').select('*').eq('application_id', applicationId).maybeSingle();
        if (!error && data) {
          return mapFromDb(data);
        }
      } catch (err) {
        // fallback
      }
    }
    const list = await this.getAll();
    return list.find((r) => r.applicationId === applicationId) || null;
  },

  async getByStudentId(studentId: string): Promise<FormResponse[]> {
    const isJoao = studentId === 'student-joao' || studentId === 'user-joao';
    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('form_responses').select('*');
        if (isJoao) {
          query = query.or('student_id.eq.student-joao,student_id.eq.user-joao');
        } else {
          query = query.eq('student_id', studentId);
        }
        const { data, error } = await query.order('submitted_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(mapFromDb);
        }
      } catch (err) {
        // fallback
      }
    }
    const list = await this.getAll();
    return list
      .filter((r) => r.studentId === studentId || (isJoao && (r.studentId === 'student-joao' || r.studentId === 'user-joao')))
      .sort((a, b) => new Date(b.submittedAt || b.startedAt || 0).getTime() - new Date(a.submittedAt || a.startedAt || 0).getTime());
  },

  async save(response: FormResponse): Promise<FormResponse> {
    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        await supabase.from('form_responses').upsert({
          id: response.id,
          application_id: response.applicationId,
          form_id: response.formId,
          form_version_id: response.formVersionId,
          student_id: response.studentId,
          answers: response.answers || [],
          submitted_at: response.submittedAt || new Date().toISOString(),
          is_draft: response.status === 'draft',
          review_status: response.status === 'reviewed' ? 'reviewed' : 'pending',
          reviewer_notes: null,
        });
      } catch (err) {
        // fallback
      }
    }

    const list = getItem<FormResponse[]>(STORAGE_KEYS.FORM_RESPONSES, initialFormResponses);
    const index = list.findIndex((r) => r.id === response.id);
    let updated: FormResponse[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = response;
    } else {
      updated = [response, ...list];
    }
    setItem(STORAGE_KEYS.FORM_RESPONSES, updated);
    return response;
  },
};
