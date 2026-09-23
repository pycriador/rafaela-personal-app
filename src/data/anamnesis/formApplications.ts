import { FormApplication } from '../../types';

export const initialFormApplications: FormApplication[] = [
  // Lucas Ferreira (student-1) - Anamnese Inicial Concluída
  {
    id: 'app-student-1-init-v1',
    formId: 'form-anamnese-inicial',
    formVersionId: 'ver-init-v1',
    studentId: 'student-1',
    status: 'completed',
    assignedBy: 'user-rafaela',
    assignedAt: '2026-08-01T10:00:00.000Z',
    dueAt: '2026-08-10T23:59:59.000Z',
    message: 'Olá Lucas! Por favor, preencha sua anamnese completa para estruturarmos seu primeiro ciclo.',
    isMandatory: true,
  },
  // Lucas Ferreira (student-1) - Anamnese v2 Reaplicada Concluída
  {
    id: 'app-student-1-init-v2',
    formId: 'form-anamnese-inicial',
    formVersionId: 'ver-init-v2',
    studentId: 'student-1',
    status: 'completed',
    assignedBy: 'user-rafaela',
    assignedAt: '2026-09-15T15:00:00.000Z',
    dueAt: '2026-09-22T23:59:59.000Z',
    message: 'Lucas, atualizamos algumas perguntas sobre suplementação na anamnese.',
    isMandatory: true,
  },
  // Lucas Ferreira (student-1) - Check-in mensal pendente
  {
    id: 'app-student-1-checkin',
    formId: 'form-checkin-mensal',
    formVersionId: 'ver-checkin-v1',
    studentId: 'student-1',
    status: 'pending',
    assignedBy: 'user-rafaela',
    assignedAt: '2026-09-20T10:00:00.000Z',
    dueAt: '2026-09-30T23:59:59.000Z',
    message: 'Hora do nosso check-in de setembro! Me conte como foi sua consistência de hábitos.',
    isMandatory: false,
  },

  // Camila Rocha (student-2) - Anamnese Inicial Concluída
  {
    id: 'app-student-2-init-v1',
    formId: 'form-anamnese-inicial',
    formVersionId: 'ver-init-v1',
    studentId: 'student-2',
    status: 'completed',
    assignedBy: 'user-rafaela',
    assignedAt: '2026-08-01T10:00:00.000Z',
    dueAt: '2026-08-15T23:59:59.000Z',
    message: 'Camila, preencha sua anamnese inicial para estruturarmos seu primeiro treino.',
    isMandatory: true,
  },
  // Camila Rocha (student-2) - Anamnese Inicial v2 Pendente
  {
    id: 'app-student-2-init-v2',
    formId: 'form-anamnese-inicial',
    formVersionId: 'ver-init-v2',
    studentId: 'student-2',
    status: 'pending',
    assignedBy: 'user-rafaela',
    assignedAt: '2026-09-18T11:00:00.000Z',
    dueAt: '2026-09-25T23:59:59.000Z',
    message: 'Camila, preencha sua anamnese para calibrarmos as cargas das suas séries.',
    isMandatory: true,
  },

  // Matheus Oliveira (student-3) - Atualização de saúde pendente
  {
    id: 'app-student-3-health',
    formId: 'form-atualizacao-saude',
    formVersionId: 'ver-health-v1',
    studentId: 'student-3',
    status: 'pending',
    assignedBy: 'user-rafaela',
    assignedAt: '2026-09-19T14:30:00.000Z',
    dueAt: '2026-09-26T23:59:59.000Z',
    message: 'Matheus, favor atualizar se a dor no ombro direito persistiu esta semana.',
    isMandatory: true,
  },

  // Juliana Barbosa (student-4) - Avaliação de treino respondida
  {
    id: 'app-student-4-eval',
    formId: 'form-avaliacao-treino',
    formVersionId: 'ver-eval-v1',
    studentId: 'student-4',
    status: 'completed',
    assignedBy: 'user-rafaela',
    assignedAt: '2026-09-10T09:00:00.000Z',
    dueAt: '2026-09-15T23:59:59.000Z',
    message: 'Juliana, me dê um retorno sobre como sentiu a sobrecarga deste novo bloco.',
    isMandatory: false,
  },

  // Gabriel Monteiro (student-5) - Anamnese inicial pendente
  {
    id: 'app-student-5-init',
    formId: 'form-anamnese-inicial',
    formVersionId: 'ver-init-v2',
    studentId: 'student-5',
    status: 'pending',
    assignedBy: 'user-rafaela',
    assignedAt: '2026-09-21T08:00:00.000Z',
    dueAt: '2026-09-28T23:59:59.000Z',
    message: 'Seja bem-vindo Gabriel! Por gentileza, responda o formulário de anamnese.',
    isMandatory: true,
  },

  // Renata Albuquerque (student-6) - Anamnese Inicial Concluída
  {
    id: 'app-student-6-init',
    formId: 'form-anamnese-inicial',
    formVersionId: 'ver-init-v1',
    studentId: 'student-6',
    status: 'completed',
    assignedBy: 'user-rafaela',
    assignedAt: '2026-08-05T09:00:00.000Z',
    dueAt: '2026-08-15T23:59:59.000Z',
    message: 'Renata, preencha sua anamnese completa para adaptarmos seus treinos.',
    isMandatory: true,
  },

  // Lucas Ferreira (student-1) - Check-in Mensal Agosto Concluído
  {
    id: 'app-student-1-checkin-ago',
    formId: 'form-checkin-mensal',
    formVersionId: 'ver-checkin-v1',
    studentId: 'student-1',
    status: 'completed',
    assignedBy: 'user-rafaela',
    assignedAt: '2026-08-25T10:00:00.000Z',
    dueAt: '2026-09-02T23:59:59.000Z',
    message: 'Lucas, check-in do mês de agosto para avaliação.',
    isMandatory: true,
  },
];
