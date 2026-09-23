import { FormApplication } from '../types';
import { initialFormApplications } from '../data/anamnesis/formApplications';
import { STORAGE_KEYS, getItem, setItem } from './storage';

export const formApplicationRepository = {
  async getAll(): Promise<FormApplication[]> {
    return getItem<FormApplication[]>(STORAGE_KEYS.FORM_APPLICATIONS, initialFormApplications);
  },

  async getById(id: string): Promise<FormApplication | null> {
    const list = await this.getAll();
    return list.find((a) => a.id === id) || null;
  },

  async getByStudentId(studentId: string): Promise<FormApplication[]> {
    const list = await this.getAll();
    return list.filter((a) => a.studentId === studentId);
  },

  async getByFormId(formId: string): Promise<FormApplication[]> {
    const list = await this.getAll();
    return list.filter((a) => a.formId === formId);
  },

  async save(application: FormApplication): Promise<FormApplication> {
    const list = await this.getAll();
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
    const list = await this.getAll();
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
