import { FormResponse } from '../../types';
import { initialFormAnswers } from './formAnswers';
import { initialConsents } from './consents';

export const initialFormResponses: FormResponse[] = [
  // Mariana Silva - Resposta da v1 (03/08/2026)
  {
    id: 'resp-mariana-v1',
    applicationId: 'app-mariana-init-v1',
    formId: 'form-anamnese-inicial',
    formVersionId: 'ver-init-v1',
    studentId: 'student-mariana',
    status: 'reviewed',
    answers: initialFormAnswers.filter((a) => a.responseId === 'resp-mariana-v1'),
    consentRecord: initialConsents.find((c) => c.responseId === 'resp-mariana-v1'),
    startedAt: '2026-08-03T18:20:00.000Z',
    submittedAt: '2026-08-03T18:45:10.000Z',
    submittedBy: 'student-mariana',
    notes: 'Avaliado pela Rafaela na montagem do ciclo 1.',
  },

  // Mariana Silva - Resposta da v2 (16/09/2026)
  {
    id: 'resp-mariana-v2',
    applicationId: 'app-mariana-init-v2',
    formId: 'form-anamnese-inicial',
    formVersionId: 'ver-init-v2',
    studentId: 'student-mariana',
    status: 'submitted',
    answers: initialFormAnswers.filter((a) => a.responseId === 'resp-mariana-v2'),
    consentRecord: initialConsents.find((c) => c.responseId === 'resp-mariana-v2'),
    startedAt: '2026-09-16T20:10:00.000Z',
    submittedAt: '2026-09-16T20:30:15.000Z',
    submittedBy: 'student-mariana',
    notes: 'Nova resposta com suplementação informada.',
  },

  // Ana Souza - Avaliação de Treino
  {
    id: 'resp-ana-eval',
    applicationId: 'app-ana-eval',
    formId: 'form-avaliacao-treino',
    formVersionId: 'ver-eval-v1',
    studentId: 'student-ana',
    status: 'submitted',
    answers: initialFormAnswers.filter((a) => a.responseId === 'resp-ana-eval'),
    consentRecord: initialConsents.find((c) => c.responseId === 'resp-ana-eval'),
    startedAt: '2026-09-12T13:55:00.000Z',
    submittedAt: '2026-09-12T14:10:00.000Z',
    submittedBy: 'student-ana',
  },

  // João Pedro Santos - Resposta da Anamnese Inicial
  {
    id: 'resp-joao-init',
    applicationId: 'app-joao-init-v1',
    formId: 'form-anamnese-inicial',
    formVersionId: 'ver-init-v1',
    studentId: 'student-joao',
    status: 'reviewed',
    answers: initialFormAnswers.filter((a) => a.responseId === 'resp-joao-init'),
    consentRecord: initialConsents.find((c) => c.responseId === 'resp-joao-init'),
    startedAt: '2026-08-10T14:00:00.000Z',
    submittedAt: '2026-08-10T14:25:00.000Z',
    submittedBy: 'student-joao',
    notes: 'Avaliado pela Rafaela na montagem do ciclo 1.',
  },

  // Carlos Pereira - Anamnese Inicial
  {
    id: 'resp-carlos-init',
    applicationId: 'app-carlos-init',
    formId: 'form-anamnese-inicial',
    formVersionId: 'ver-init-v1',
    studentId: 'student-carlos',
    status: 'reviewed',
    answers: initialFormAnswers.filter((a) => a.responseId === 'resp-carlos-init'),
    consentRecord: initialConsents.find((c) => c.responseId === 'resp-carlos-init'),
    startedAt: '2026-08-06T11:00:00.000Z',
    submittedAt: '2026-08-06T11:35:00.000Z',
    submittedBy: 'student-carlos',
    notes: 'Avaliado pela Rafaela na montagem do ciclo de treino.',
  },

  // Mariana Silva - Check-in Mensal Agosto
  {
    id: 'resp-mariana-checkin-ago',
    applicationId: 'app-mariana-checkin-ago',
    formId: 'form-checkin-mensal',
    formVersionId: 'ver-checkin-v1',
    studentId: 'student-mariana',
    status: 'reviewed',
    answers: initialFormAnswers.filter((a) => a.responseId === 'resp-mariana-checkin-ago'),
    consentRecord: initialConsents.find((c) => c.responseId === 'resp-mariana-checkin-ago'),
    startedAt: '2026-08-28T09:10:00.000Z',
    submittedAt: '2026-08-28T09:20:00.000Z',
    submittedBy: 'student-mariana',
    notes: 'Adesão consistente mantida no mês.',
  },
];
