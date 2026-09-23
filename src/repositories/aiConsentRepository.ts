import { AIStudentConsent } from '../types';
import { getItem, setItem, STORAGE_KEYS, isSimulationModeActive } from './storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

function mapRowToConsent(row: any): AIStudentConsent {
  return {
    studentId: row.student_id,
    allowed: row.allowed ?? row.consented ?? true,
    updatedAt: row.updated_at || new Date().toISOString(),
    updatedBy: row.updated_by || 'user-rafaela',
    termsVersion: row.terms_version || '1.0',
  };
}

export const aiConsentRepository = {
  async getAll(): Promise<AIStudentConsent[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('ai_student_consents')
          .select('*');

        if (!error && data && data.length > 0) {
          const list = data.map(mapRowToConsent);
          setItem(STORAGE_KEYS.AI_STUDENT_CONSENTS, list);
          return list;
        }
      } catch (err) {
        console.warn('[aiConsentRepository] Erro ao ler consentimentos do Supabase:', err);
      }
    }
    return getItem<AIStudentConsent[]>(STORAGE_KEYS.AI_STUDENT_CONSENTS, []);
  },

  async getByStudentId(studentId: string): Promise<AIStudentConsent | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('ai_student_consents')
          .select('*')
          .eq('student_id', studentId)
          .single();

        if (!error && data) {
          return mapRowToConsent(data);
        }
      } catch (err) {
        // Not found or error
      }
    }
    const list = await this.getAll();
    return list.find((c) => c.studentId === studentId) || null;
  },

  async setConsent(
    studentId: string,
    allowed: boolean,
    updatedBy: string = 'user-rafaela'
  ): Promise<AIStudentConsent> {
    const record: AIStudentConsent = {
      studentId,
      allowed,
      updatedAt: new Date().toISOString(),
      updatedBy,
      termsVersion: '1.0',
    };

    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        await supabase.from('ai_student_consents').upsert({
          id: `consent-${studentId}`,
          student_id: studentId,
          allowed,
          consented: allowed,
          updated_by: updatedBy,
          terms_version: '1.0',
          updated_at: record.updatedAt,
        });
      } catch (err) {
        console.warn('[aiConsentRepository] Erro ao atualizar consentimento no Supabase:', err);
      }
    }

    const list = await this.getAll();
    const index = list.findIndex((c) => c.studentId === studentId);
    if (index >= 0) {
      list[index] = record;
    } else {
      list.push(record);
    }

    setItem(STORAGE_KEYS.AI_STUDENT_CONSENTS, list);
    return record;
  },

  async isAllowed(studentId: string): Promise<boolean> {
    const consent = await this.getByStudentId(studentId);
    // Por padrão no app, se não registrado, consideramos permitido caso o aluno tenha termo geral aceito
    return consent ? consent.allowed : true;
  },
};
