import { ConsentRecord } from '../types';
import { initialConsents } from '../data/anamnesis/consents';
import { STORAGE_KEYS, getItem, setItem } from './storage';

export const consentRepository = {
  async getAll(): Promise<ConsentRecord[]> {
    return getItem<ConsentRecord[]>(STORAGE_KEYS.CONSENTS, initialConsents);
  },

  async getByResponseId(responseId: string): Promise<ConsentRecord | null> {
    const list = await this.getAll();
    return list.find((c) => c.responseId === responseId) || null;
  },

  async getByStudentId(studentId: string): Promise<ConsentRecord[]> {
    const list = await this.getAll();
    return list.filter((c) => c.studentId === studentId);
  },

  async save(record: ConsentRecord): Promise<ConsentRecord> {
    const list = await this.getAll();
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
