import { ConsentRecord } from '../types';
import { initialConsents } from '../data/anamnesis/consents';
import { STORAGE_KEYS, getItem, setItem, isSimulationModeActive } from './storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

function mapFromDb(row: any): ConsentRecord {
  return {
    id: row.id,
    responseId: row.form_id || row.response_id || row.id,
    studentId: row.student_id || row.studentId,
    accepted: row.accepted ?? true,
    acceptedAt: row.timestamp || row.accepted_at || new Date().toISOString(),
    termsVersion: row.terms_text || row.terms_version || '1.0',
    formVersion: Number(row.form_version ?? 1),
    statement: row.statement || 'Declaro que as informações fornecidas são autênticas e verdadeiras.',
  };
}

export const consentRepository = {
  async getAll(): Promise<ConsentRecord[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('consents').select('*').order('timestamp', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(mapFromDb);
        }
      } catch (err) {
        // fallback
      }
    }
    return getItem<ConsentRecord[]>(STORAGE_KEYS.CONSENTS, initialConsents);
  },

  async getByResponseId(responseId: string): Promise<ConsentRecord | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('consents').select('*').eq('form_id', responseId).maybeSingle();
        if (!error && data) {
          return mapFromDb(data);
        }
      } catch (err) {
        // fallback
      }
    }
    const list = await this.getAll();
    return list.find((c) => c.responseId === responseId) || null;
  },

  async getByStudentId(studentId: string): Promise<ConsentRecord[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('consents').select('*').eq('student_id', studentId).order('timestamp', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(mapFromDb);
        }
      } catch (err) {
        // fallback
      }
    }
    const list = await this.getAll();
    return list.filter((c) => c.studentId === studentId);
  },

  async save(record: ConsentRecord): Promise<ConsentRecord> {
    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        await supabase.from('consents').upsert({
          id: record.id,
          student_id: record.studentId,
          form_id: record.responseId,
          accepted: record.accepted ?? true,
          terms_text: record.termsVersion || null,
          timestamp: record.acceptedAt || new Date().toISOString(),
          ip_address: null,
        });
      } catch (err) {
        // fallback
      }
    }

    const list = getItem<ConsentRecord[]>(STORAGE_KEYS.CONSENTS, initialConsents);
    const index = list.findIndex((c) => c.id === record.id);
    let updated: ConsentRecord[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = record;
    } else {
      updated = [record, ...list];
    }
    setItem(STORAGE_KEYS.CONSENTS, updated);
    return record;
  },
};
