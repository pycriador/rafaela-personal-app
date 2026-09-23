import { FormResponse } from '../../types';
import { initialFormAnswers } from './formAnswers';
import { initialConsents } from './consents';

export const initialFormResponses: FormResponse[] = [
  // Lucas Ferreira (student-1) - Resposta da v1 (03/08/2026)
  {
    id: 'resp-student-1-v1',
    applicationId: 'app-student-1-init-v1',
    formId: 'form-anamnese-inicial',
    formVersionId: 'ver-init-v1',
    studentId: 'student-1',
    status: 'reviewed',
    answers: initialFormAnswers.filter((a) => a.responseId === 'resp-student-1-v1'),
    consentRecord: initialConsents.find((c) => c.responseId === 'resp-student-1-v1'),
    startedAt: '2026-08-03T18:20:00.000Z',
    submittedAt: '2026-08-03T18:45:10.000Z',
    submittedBy: 'student-1',
    notes: 'Avaliado pela Rafaela na montagem do ciclo 1.',
  },

  // Lucas Ferreira (student-1) - Resposta da v2 (16/09/2026)
  {
    id: 'resp-student-1-v2',
    applicationId: 'app-student-1-init-v2',
    formId: 'form-anamnese-inicial',
    formVersionId: 'ver-init-v2',
    studentId: 'student-1',
    status: 'submitted',
    answers: initialFormAnswers.filter((a) => a.responseId === 'resp-student-1-v2'),
    consentRecord: initialConsents.find((c) => c.responseId === 'resp-student-1-v2'),
    startedAt: '2026-09-16T20:10:00.000Z',
    submittedAt: '2026-09-16T20:30:15.000Z',
    submittedBy: 'student-1',
    notes: 'Nova resposta com suplementação informada.',
  },

  // Juliana Barbosa (student-4) - Avaliação de Treino
  {
    id: 'resp-student-4-eval',
    applicationId: 'app-student-4-eval',
    formId: 'form-avaliacao-treino',
    formVersionId: 'ver-eval-v1',
    studentId: 'student-4',
    status: 'submitted',
    answers: initialFormAnswers.filter((a) => a.responseId === 'resp-student-4-eval'),
    consentRecord: initialConsents.find((c) => c.responseId === 'resp-student-4-eval'),
    startedAt: '2026-09-12T13:55:00.000Z',
    submittedAt: '2026-09-12T14:10:00.000Z',
    submittedBy: 'student-4',
  },

  // Camila Rocha (student-2) - Resposta da Anamnese Inicial
  {
    id: 'resp-student-2-init',
    applicationId: 'app-student-2-init-v1',
    formId: 'form-anamnese-inicial',
    formVersionId: 'ver-init-v1',
    studentId: 'student-2',
    status: 'reviewed',
    answers: initialFormAnswers.filter((a) => a.responseId === 'resp-student-2-init'),
    consentRecord: initialConsents.find((c) => c.responseId === 'resp-student-2-init'),
    startedAt: '2026-08-10T14:00:00.000Z',
    submittedAt: '2026-08-10T14:25:00.000Z',
    submittedBy: 'student-2',
    notes: 'Avaliado pela Rafaela na montagem do ciclo 1.',
  },

  // Renata Albuquerque (student-6) - Anamnese Inicial
  {
    id: 'resp-student-6-init',
    applicationId: 'app-student-6-init',
    formId: 'form-anamnese-inicial',
    formVersionId: 'ver-init-v1',
    studentId: 'student-6',
    status: 'reviewed',
    answers: initialFormAnswers.filter((a) => a.responseId === 'resp-student-6-init'),
    consentRecord: initialConsents.find((c) => c.responseId === 'resp-student-6-init'),
    startedAt: '2026-08-06T11:00:00.000Z',
    submittedAt: '2026-08-06T11:35:00.000Z',
    submittedBy: 'student-6',
    notes: 'Avaliado pela Rafaela na montagem do ciclo de treino.',
  },

  // Lucas Ferreira (student-1) - Check-in Mensal Agosto
  {
    id: 'resp-student-1-checkin-ago',
    applicationId: 'app-student-1-checkin-ago',
    formId: 'form-checkin-mensal',
    formVersionId: 'ver-checkin-v1',
    studentId: 'student-1',
    status: 'reviewed',
    answers: initialFormAnswers.filter((a) => a.responseId === 'resp-student-1-checkin-ago'),
    consentRecord: initialConsents.find((c) => c.responseId === 'resp-student-1-checkin-ago'),
    startedAt: '2026-08-28T09:10:00.000Z',
    submittedAt: '2026-08-28T09:20:00.000Z',
    submittedBy: 'student-1',
    notes: 'Adesão consistente mantida no mês.',
  },
];
