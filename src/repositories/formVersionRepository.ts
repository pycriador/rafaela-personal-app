import { FormVersion, FormField } from '../types';
import { initialFormVersions } from '../data/anamnesis/formVersions';
import { initialFormFields } from '../data/anamnesis/formFields';
import { STORAGE_KEYS, getItem, setItem, isSimulationModeActive } from './storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

function mapVersionFromDb(row: any): FormVersion {
  return {
    id: row.id,
    formId: row.form_id || row.formId,
    version: Number(row.version_number ?? row.version ?? 1),
    status: row.status,
    sections: Array.isArray(row.sections) ? row.sections : JSON.parse(row.sections || '[]'),
    termsVersion: row.terms_version || '1.0',
    publishedAt: row.published_at || row.created_at || row.createdAt,
    createdAt: row.created_at || row.createdAt,
  };
}

function mapFieldFromDb(row: any): FormField {
  const val = typeof row.validation === 'object' && row.validation !== null ? row.validation : {};
  return {
    id: row.id,
    versionId: row.version_id || row.versionId,
    sectionId: val.sectionId || row.section_id || row.sectionId || 'sec-default',
    label: row.label,
    description: val.description || row.description || '',
    placeholder: val.placeholder || row.placeholder || '',
    type: row.type,
    required: row.required ?? false,
    order: Number(row.order_index ?? row.order ?? 0),
    active: row.active ?? true,
    options: Array.isArray(row.options) ? row.options : row.options ? JSON.parse(row.options) : [],
    condition: val.condition,
  };
}

export const formVersionRepository = {
  async getAll(): Promise<FormVersion[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('form_versions').select('*').order('version_number', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(mapVersionFromDb);
        }
      } catch (err) {
        // fallback
      }
    }
    return getItem<FormVersion[]>(STORAGE_KEYS.FORM_VERSIONS, initialFormVersions);
  },

  async getById(id: string): Promise<FormVersion | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('form_versions').select('*').eq('id', id).maybeSingle();
        if (!error && data) {
          return mapVersionFromDb(data);
        }
      } catch (err) {
        // fallback
      }
    }
    const list = await this.getAll();
    return list.find((v) => v.id === id) || null;
  },

  async getByFormId(formId: string): Promise<FormVersion[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('form_versions')
          .select('*')
          .eq('form_id', formId)
          .order('version_number', { ascending: false });
        if (!error && data && data.length > 0) {
          return data.map(mapVersionFromDb);
        }
      } catch (err) {
        // fallback
      }
    }
    const list = await this.getAll();
    return list.filter((v) => v.formId === formId).sort((a, b) => b.version - a.version);
  },

  async save(version: FormVersion): Promise<FormVersion> {
    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        await supabase.from('form_versions').upsert({
          id: version.id,
          form_id: version.formId,
          version_number: version.version,
          status: version.status,
          sections: version.sections,
          created_at: version.createdAt || new Date().toISOString(),
        });
      } catch (err) {
        // fallback
      }
    }

    const list = getItem<FormVersion[]>(STORAGE_KEYS.FORM_VERSIONS, initialFormVersions);
    const index = list.findIndex((v) => v.id === version.id);
    let updated: FormVersion[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = version;
    } else {
      updated = [...list, version];
    }
    setItem(STORAGE_KEYS.FORM_VERSIONS, updated);
    return version;
  },

  // Campos associados às versões
  async getAllFields(): Promise<FormField[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('form_fields').select('*').order('order_index', { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map(mapFieldFromDb);
        }
      } catch (err) {
        // fallback
      }
    }
    return getItem<FormField[]>(STORAGE_KEYS.FORM_FIELDS, initialFormFields);
  },

  async getFieldsByVersionId(versionId: string): Promise<FormField[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('form_fields')
          .select('*')
          .eq('version_id', versionId)
          .order('order_index', { ascending: true });
        if (!error && data && data.length > 0) {
          return data.map(mapFieldFromDb);
        }
      } catch (err) {
        // fallback
      }
    }
    const fields = await this.getAllFields();
    return fields.filter((f) => f.versionId === versionId && f.active).sort((a, b) => a.order - b.order);
  },

  async saveField(field: FormField): Promise<FormField> {
    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        await supabase.from('form_fields').upsert({
          id: field.id,
          version_id: field.versionId,
          label: field.label,
          type: field.type,
          required: field.required ?? false,
          order_index: field.order,
          options: field.options || null,
          validation: {
            description: field.description || null,
            placeholder: field.placeholder || null,
            sectionId: field.sectionId,
            condition: field.condition || null,
          },
        });
      } catch (err) {
        // fallback
      }
    }

    const fields = getItem<FormField[]>(STORAGE_KEYS.FORM_FIELDS, initialFormFields);
    const index = fields.findIndex((f) => f.id === field.id);
    let updated: FormField[];
    if (index >= 0) {
      updated = [...fields];
      updated[index] = field;
    } else {
      updated = [...fields, field];
    }
    setItem(STORAGE_KEYS.FORM_FIELDS, updated);
    return field;
  },

  async deleteField(fieldId: string): Promise<boolean> {
    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        await supabase.from('form_fields').delete().eq('id', fieldId);
      } catch (err) {
        // fallback
      }
    }

    const fields = getItem<FormField[]>(STORAGE_KEYS.FORM_FIELDS, initialFormFields);
    const filtered = fields.filter((f) => f.id !== fieldId);
    setItem(STORAGE_KEYS.FORM_FIELDS, filtered);
    return true;
  },

  async saveFieldsBatch(newFields: FormField[]): Promise<void> {
    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        const rows = newFields.map((f) => ({
          id: f.id,
          version_id: f.versionId,
          label: f.label,
          type: f.type,
          required: f.required ?? false,
          order_index: f.order,
          options: f.options || null,
          validation: {
            description: f.description || null,
            placeholder: f.placeholder || null,
            sectionId: f.sectionId,
            condition: f.condition || null,
          },
        }));
        await supabase.from('form_fields').upsert(rows);
      } catch (err) {
        // fallback
      }
    }

    const existing = getItem<FormField[]>(STORAGE_KEYS.FORM_FIELDS, initialFormFields);
    const map = new Map<string, FormField>();
    existing.forEach((f) => map.set(f.id, f));
    newFields.forEach((f) => map.set(f.id, f));
    setItem(STORAGE_KEYS.FORM_FIELDS, Array.from(map.values()));
  },
};
