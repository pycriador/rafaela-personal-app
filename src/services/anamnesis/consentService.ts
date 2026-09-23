import { ConsentRecord } from '../../types';
import { consentRepository } from '../../repositories/consentRepository';

export const consentService = {
  async recordConsent(data: {
    responseId: string;
    studentId: string;
    termsVersion: string;
    formVersion: number;
    statement: string;
  }): Promise<ConsentRecord> {
    const record: ConsentRecord = {
      id: `consent-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      responseId: data.responseId,
      studentId: data.studentId,
      accepted: true,
      acceptedAt: new Date().toISOString(),
      termsVersion: data.termsVersion,
      formVersion: data.formVersion,
      statement: data.statement,
    };

    return consentRepository.save(record);
  },

  async getConsentForResponse(responseId: string): Promise<ConsentRecord | null> {
    return consentRepository.getByResponseId(responseId);
  },
};
