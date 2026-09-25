import { Form } from '../types';
import { initialForms } from '../data/anamnesis/forms';
import { STORAGE_KEYS, getItem, setItem, isSimulationModeActive } from './storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const DELETED_FORMS_KEY = 'rafaela_app_deleted_forms_v1';

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
    const deletedIds = new Set(getItem<string[]>(DELETED_FORMS_KEY, []));

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('forms').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const loaded = data.map(mapFromDb).filter((f) => !deletedIds.has(f.id));
          const existingIds = new Set(loaded.map((f) => f.id));
          const missing = initialForms.filter((f) => !existingIds.has(f.id) && !deletedIds.has(f.id));
          if (missing.length > 0) {
            for (const f of missing) {
              await supabase.from('forms').upsert({
                id: f.id,
                title: f.name,
                description: f.description || null,
                category: 'anamnese',
                status: f.status,
                current_version_id: f.currentVersionId || null,
                created_at: f.createdAt,
                updated_at: f.updatedAt,
              });
            }
            return [...loaded, ...missing];
          }
          return loaded;
        }
      } catch (err) {
        // fallback
      }
    }
    const list = getItem<Form[]>(STORAGE_KEYS.FORMS, initialForms).filter((f) => !deletedIds.has(f.id));
    const existingIds = new Set(list.map((f) => f.id));
    const missing = initialForms.filter((f) => !existingIds.has(f.id) && !deletedIds.has(f.id));
    if (missing.length > 0) {
      const merged = [...list, ...missing];
      setItem(STORAGE_KEYS.FORMS, merged);
      return merged;
    }
    return list;
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

    const deletedIds = getItem<string[]>(DELETED_FORMS_KEY, []);
    if (!deletedIds.includes(id)) {
      setItem(DELETED_FORMS_KEY, [...deletedIds, id]);
    }

    const list = getItem<Form[]>(STORAGE_KEYS.FORMS, initialForms);
    const filtered = list.filter((f) => f.id !== id);
    setItem(STORAGE_KEYS.FORMS, filtered);
    return true;
  },
};
