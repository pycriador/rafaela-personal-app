import { FormResponse, FormAnswer, ConsentRecord } from '../../types';
import { formResponseRepository } from '../../repositories/formResponseRepository';
import { formApplicationRepository } from '../../repositories/formApplicationRepository';
import { formRepository } from '../../repositories/formRepository';
import { studentRepository } from '../../repositories/studentRepository';
import { notificationRepository } from '../../repositories/notificationRepository';
import { activityRepository } from '../../repositories/activityRepository';
import { consentService } from './consentService';

export const formResponseService = {
  async getResponseById(id: string): Promise<FormResponse | null> {
    return formResponseRepository.getById(id);
  },

  async getResponsesByStudentId(studentId: string): Promise<FormResponse[]> {
    return formResponseRepository.getByStudentId(studentId);
  },

  async getResponseByApplicationId(applicationId: string): Promise<FormResponse | null> {
    return formResponseRepository.getByApplicationId(applicationId);
  },

  async saveDraft(data: {
    applicationId: string;
    formId: string;
    formVersionId: string;
    studentId: string;
    answers: FormAnswer[];
    notes?: string;
  }): Promise<FormResponse> {
    const existing = await formResponseRepository.getByApplicationId(data.applicationId);

    const draft: FormResponse = {
      id: existing?.id || `resp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      applicationId: data.applicationId,
      formId: data.formId,
      formVersionId: data.formVersionId,
      studentId: data.studentId,
      status: 'draft',
      answers: data.answers,
      startedAt: existing?.startedAt || new Date().toISOString(),
      notes: data.notes,
    };

    return formResponseRepository.save(draft);
  },

  async submitResponse(data: {
    applicationId: string;
    formId: string;
    formVersionId: string;
    studentId: string;
    answers: FormAnswer[];
    consentAccepted: boolean;
    termsVersion: string;
    formVersionNumber: number;
    termsStatement: string;
    notes?: string;
  }): Promise<FormResponse> {
    if (!data.consentAccepted) {
      throw new Error('Para enviar este formulário, confirme o aceite do termo.');
    }

    const form = await formRepository.getById(data.formId);
    const student = await studentRepository.getById(data.studentId);
    const existing = await formResponseRepository.getByApplicationId(data.applicationId);

    const responseId = existing?.id || `resp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Registra consentimento imutável
    const consent = await consentService.recordConsent({
      responseId,
      studentId: data.studentId,
      termsVersion: data.termsVersion,
      formVersion: data.formVersionNumber,
      statement: data.termsStatement,
    });

    const response: FormResponse = {
      id: responseId,
      applicationId: data.applicationId,
      formId: data.formId,
      formVersionId: data.formVersionId,
      studentId: data.studentId,
      status: 'submitted',
      answers: data.answers,
      consentRecord: consent,
      startedAt: existing?.startedAt || new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      submittedBy: data.studentId,
      notes: data.notes,
    };

    const savedResponse = await formResponseRepository.save(response);

    // Marca aplicação como completed
    await formApplicationRepository.markAsCompleted(data.applicationId);

    // Notificação segura para a Rafaela (SEM DADOS MÉDICOS SENSÍVEIS)
    await notificationRepository.create({
      recipientId: 'user-rafaela',
      recipientRole: 'personal',
      title: 'Nova Anamnese Recebida',
      message: `${student?.name || 'O aluno'} enviou o formulário "${form?.name || 'Anamnese'}".`,
      type: 'success',
      link: `/personal/anamnesis/responses/${savedResponse.id}`,
    });

    // Auditoria
    await activityRepository.log({
      actorId: student?.userId || data.studentId,
      actorName: student?.name || 'Aluno',
      actorRole: 'student',
      action: 'Formulário enviado',
      description: `${student?.name || 'O aluno'} enviou as respostas do formulário "${form?.name || 'Anamnese'}".`,
      studentId: data.studentId,
      iconType: 'check',
    });

    return savedResponse;
  },
};
