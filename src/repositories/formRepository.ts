import { Form } from '../types';
import { initialForms } from '../data/anamnesis/forms';
import { STORAGE_KEYS, getItem, setItem } from './storage';

export const formRepository = {
  async getAll(): Promise<Form[]> {
    return getItem<Form[]>(STORAGE_KEYS.FORMS, initialForms);
  },

  async getById(id: string): Promise<Form | null> {
    const list = await this.getAll();
    return list.find((f) => f.id === id) || null;
  },

  async save(form: Form): Promise<Form> {
    const list = await this.getAll();
    const index = list.findIndex((f) => f.id === form.id);
    let updated: Form[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...form, updatedAt: new Date().toISOString() };
    } else {
      updated = [
        ...list,
        {
          ...form,
          createdAt: form.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }
    setItem(STORAGE_KEYS.FORMS, updated);
    return index >= 0 ? updated[index] : updated[updated.length - 1];
  },

  async archive(id: string): Promise<Form | null> {
    const form = await this.getById(id);
    if (!form) return null;
    form.status = 'archived';
    return this.save(form);
  },

  async delete(id: string): Promise<boolean> {
    const list = await this.getAll();
    const filtered = list.filter((f) => f.id !== id);
    setItem(STORAGE_KEYS.FORMS, filtered);
    return true;
  },
};
