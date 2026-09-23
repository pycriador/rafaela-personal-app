import { Form } from '../types';
import { initialForms } from '../data/anamnesis/forms';
import { STORAGE_KEYS, getItem, setItem, isSimulationModeActive } from './storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

function mapFromDb(row: any): Form {
  return {
    id: row.id,
    name: row.title || row.name || 'Formulário Sem Título',
    description: row.description || '',
    status: row.status,
    currentVersionId: row.current_version_id || row.currentVersionId || '',
    createdBy: row.created_by || 'user-rafaela',
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt,
  };
}

export const formRepository = {
  async getAll(): Promise<Form[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('forms').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(mapFromDb);
        }
      } catch (err) {
        // fallback
      }
    }
    return getItem<Form[]>(STORAGE_KEYS.FORMS, initialForms);
  },

  async getById(id: string): Promise<Form | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('forms').select('*').eq('id', id).maybeSingle();
        if (!error && data) {
          return mapFromDb(data);
        }
      } catch (err) {
        // fallback
      }
    }
    const list = await this.getAll();
    return list.find((f) => f.id === id) || null;
  },

  async save(form: Form): Promise<Form> {
    const toSave: Form = {
      ...form,
      createdAt: form.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        await supabase.from('forms').upsert({
          id: toSave.id,
          title: toSave.name,
          description: toSave.description || null,
          category: 'anamnese',
          status: toSave.status,
          current_version_id: toSave.currentVersionId || null,
          created_at: toSave.createdAt,
          updated_at: toSave.updatedAt,
        });
      } catch (err) {
        // fallback
      }
    }

    const list = getItem<Form[]>(STORAGE_KEYS.FORMS, initialForms);
    const index = list.findIndex((f) => f.id === toSave.id);
    let updated: Form[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = toSave;
    } else {
      updated = [toSave, ...list];
    }
    setItem(STORAGE_KEYS.FORMS, updated);
    return toSave;
  },

  async archive(id: string): Promise<Form | null> {
    const form = await this.getById(id);
    if (!form) return null;
    form.status = 'archived';
    return this.save(form);
  },

  async delete(id: string): Promise<boolean> {
    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        await supabase.from('forms').delete().eq('id', id);
      } catch (err) {
        // fallback
      }
    }

    const list = getItem<Form[]>(STORAGE_KEYS.FORMS, initialForms);
    const filtered = list.filter((f) => f.id !== id);
    setItem(STORAGE_KEYS.FORMS, filtered);
    return true;
  },
};
