import { FormVersion, FormField } from '../types';
import { initialFormVersions } from '../data/anamnesis/formVersions';
import { initialFormFields } from '../data/anamnesis/formFields';
import { STORAGE_KEYS, getItem, setItem } from './storage';

export const formVersionRepository = {
  async getAll(): Promise<FormVersion[]> {
    return getItem<FormVersion[]>(STORAGE_KEYS.FORM_VERSIONS, initialFormVersions);
  },

  async getById(id: string): Promise<FormVersion | null> {
    const list = await this.getAll();
    return list.find((v) => v.id === id) || null;
  },

  async getByFormId(formId: string): Promise<FormVersion[]> {
    const list = await this.getAll();
    return list.filter((v) => v.formId === formId).sort((a, b) => b.version - a.version);
  },

  async save(version: FormVersion): Promise<FormVersion> {
    const list = await this.getAll();
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
    return getItem<FormField[]>(STORAGE_KEYS.FORM_FIELDS, initialFormFields);
  },

  async getFieldsByVersionId(versionId: string): Promise<FormField[]> {
    const fields = await this.getAllFields();
    return fields.filter((f) => f.versionId === versionId && f.active).sort((a, b) => a.order - b.order);
  },

  async saveField(field: FormField): Promise<FormField> {
    const fields = await this.getAllFields();
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
    const fields = await this.getAllFields();
    const filtered = fields.filter((f) => f.id !== fieldId);
    setItem(STORAGE_KEYS.FORM_FIELDS, filtered);
    return true;
  },

  async saveFieldsBatch(newFields: FormField[]): Promise<void> {
    const existing = await this.getAllFields();
    const map = new Map<string, FormField>();
    existing.forEach((f) => map.set(f.id, f));
    newFields.forEach((f) => map.set(f.id, f));
    setItem(STORAGE_KEYS.FORM_FIELDS, Array.from(map.values()));
  },
};
