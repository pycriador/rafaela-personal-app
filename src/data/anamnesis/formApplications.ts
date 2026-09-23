import { FormApplication } from '../../types';

export const initialFormApplications: FormApplication[] = [
  // Mariana Silva - Respondeu a v1 no início de agosto
  {
    id: 'app-mariana-init-v1',
    formId: 'form-anamnese-inicial',
    formVersionId: 'ver-init-v1',
    studentId: 'student-mariana',
    status: 'completed',
    assignedBy: 'user-rafaela',
    assignedAt: '2026-08-01T10:00:00.000Z',
    dueAt: '2026-08-10T23:59:59.000Z',
    message: 'Olá Mariana! Por favor, preencha sua anamnese completa para estruturarmos seu primeiro ciclo.',
    isMandatory: true,
  },
  // Mariana Silva - Reaplicação da v2 em setembro
  {
    id: 'app-mariana-init-v2',
    formId: 'form-anamnese-inicial',
    formVersionId: 'ver-init-v2',
    studentId: 'student-mariana',
    status: 'completed',
    assignedBy: 'user-rafaela',
    assignedAt: '2026-09-15T15:00:00.000Z',
    dueAt: '2026-09-22T23:59:59.000Z',
    message: 'Mariana, atualizamos algumas perguntas sobre suplementação na anamnese.',
    isMandatory: true,
  },
  // Mariana Silva - Check-in do mês atual pendente
  {
    id: 'app-mariana-checkin',
    formId: 'form-checkin-mensal',
    formVersionId: 'ver-checkin-v1',
    studentId: 'student-mariana',
    status: 'pending',
    assignedBy: 'user-rafaela',
    assignedAt: '2026-09-20T10:00:00.000Z',
    dueAt: '2026-09-30T23:59:59.000Z',
    message: 'Hora do nosso check-in de setembro! Me conte como foi sua consistência de hábitos.',
    isMandatory: false,
  },

  // João Santos - Anamnese Inicial v1 Concluída
  {
    id: 'app-joao-init-v1',
    formId: 'form-anamnese-inicial',
    formVersionId: 'ver-init-v1',
    studentId: 'student-joao',
    status: 'completed',
    assignedBy: 'user-rafaela',
    assignedAt: '2026-08-01T10:00:00.000Z',
    dueAt: '2026-08-15T23:59:59.000Z',
    message: 'João, preencha sua anamnese inicial para estruturarmos seu primeiro treino.',
    isMandatory: true,
  },

  // João Santos - Anamnese Inicial pendente
  {
    id: 'app-joao-init-v2',
    formId: 'form-anamnese-inicial',
    formVersionId: 'ver-init-v2',
    studentId: 'student-joao',
    status: 'pending',
    assignedBy: 'user-rafaela',
    assignedAt: '2026-09-18T11:00:00.000Z',
    dueAt: '2026-09-25T23:59:59.000Z',
    message: 'João, preencha sua anamnese para calibrarmos as cargas das suas séries.',
    isMandatory: true,
  },

  // Carlos Pereira - Atualização de saúde pendente
  {
    id: 'app-carlos-health',
    formId: 'form-atualizacao-saude',
    formVersionId: 'ver-health-v1',
    studentId: 'student-carlos',
    status: 'pending',
    assignedBy: 'user-rafaela',
    assignedAt: '2026-09-19T14:30:00.000Z',
    dueAt: '2026-09-26T23:59:59.000Z',
    message: 'Carlos, favor atualizar se a dor lombar persistiu esta semana.',
    isMandatory: true,
  },

  // Ana Souza - Avaliação de treino respondida
  {
    id: 'app-ana-eval',
    formId: 'form-avaliacao-treino',
    formVersionId: 'ver-eval-v1',
    studentId: 'student-ana',
    status: 'completed',
    assignedBy: 'user-rafaela',
    assignedAt: '2026-09-10T09:00:00.000Z',
    dueAt: '2026-09-15T23:59:59.000Z',
    message: 'Ana, me dê um retorno sobre como sentiu a sobrecarga deste novo bloco.',
    isMandatory: false,
  },

  // Fernanda Lima - Anamnese inicial pendente
  {
    id: 'app-fernanda-init',
    formId: 'form-anamnese-inicial',
    formVersionId: 'ver-init-v2',
    studentId: 'student-fernanda',
    status: 'pending',
    assignedBy: 'user-rafaela',
    assignedAt: '2026-09-21T08:00:00.000Z',
    dueAt: '2026-09-28T23:59:59.000Z',
    message: 'Seja bem-vinda Fernanda! Por gentileza, responda o formulário de anamnese.',
    isMandatory: true,
  },
];
