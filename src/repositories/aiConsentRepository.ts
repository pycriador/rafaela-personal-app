import { AIStudentConsent } from '../types';
import { getItem, setItem, STORAGE_KEYS } from './storage';

export const aiConsentRepository = {
  async getAll(): Promise<AIStudentConsent[]> {
    return getItem<AIStudentConsent[]>(STORAGE_KEYS.AI_STUDENT_CONSENTS, []);
  },

  async getByStudentId(studentId: string): Promise<AIStudentConsent | null> {
    const list = await this.getAll();
    return list.find((c) => c.studentId === studentId) || null;
  },

  async setConsent(
    studentId: string,
    allowed: boolean,
    updatedBy: string = 'user-rafaela'
  ): Promise<AIStudentConsent> {
    const list = await this.getAll();
    const index = list.findIndex((c) => c.studentId === studentId);
    const record: AIStudentConsent = {
      studentId,
      allowed,
      updatedAt: new Date().toISOString(),
      updatedBy,
      termsVersion: '1.0',
    };

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
