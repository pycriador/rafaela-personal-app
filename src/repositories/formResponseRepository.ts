import { FormResponse } from '../types';
import { initialFormResponses } from '../data/anamnesis/formResponses';
import { STORAGE_KEYS, getItem, setItem } from './storage';

export const formResponseRepository = {
  async getAll(): Promise<FormResponse[]> {
    return getItem<FormResponse[]>(STORAGE_KEYS.FORM_RESPONSES, initialFormResponses);
  },

  async getById(id: string): Promise<FormResponse | null> {
    const list = await this.getAll();
    return list.find((r) => r.id === id) || null;
  },

  async getByApplicationId(applicationId: string): Promise<FormResponse | null> {
    const list = await this.getAll();
    return list.find((r) => r.applicationId === applicationId) || null;
  },

  async getByStudentId(studentId: string): Promise<FormResponse[]> {
    const list = await this.getAll();
    return list
      .filter((r) => r.studentId === studentId)
      .sort((a, b) => new Date(b.submittedAt || b.startedAt || 0).getTime() - new Date(a.submittedAt || a.startedAt || 0).getTime());
  },

  async save(response: FormResponse): Promise<FormResponse> {
    const list = await this.getAll();
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
