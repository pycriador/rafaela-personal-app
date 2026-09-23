import { Form } from '../../types';

export const initialForms: Form[] = [
  {
    id: 'form-anamnese-inicial',
    name: 'Anamnese Inicial',
    description: 'Questionário completo para coleta de informações gerais, histórico clínico, restrições e objetivos de treino.',
    status: 'active',
    currentVersionId: 'ver-init-v2',
    createdBy: 'user-rafaela',
    createdAt: '2026-08-01T09:30:00.000Z',
    updatedAt: '2026-09-15T14:00:00.000Z',
  },
  {
    id: 'form-atualizacao-saude',
    name: 'Atualização de Saúde',
    description: 'Checagem periódica rápida sobre alterações no estado de saúde, novas lesões ou novos medicamentos.',
    status: 'active',
    currentVersionId: 'ver-health-v1',
    createdBy: 'user-rafaela',
    createdAt: '2026-08-10T09:00:00.000Z',
    updatedAt: '2026-08-10T10:00:00.000Z',
  },
  {
    id: 'form-avaliacao-treino',
    name: 'Avaliação de Treino',
    description: 'Coleta da percepção do aluno sobre intensidade, recuperação e desconfortos nas séries executadas.',
    status: 'active',
    currentVersionId: 'ver-eval-v1',
    createdBy: 'user-rafaela',
    createdAt: '2026-08-15T09:00:00.000Z',
    updatedAt: '2026-08-15T10:00:00.000Z',
  },
  {
    id: 'form-checkin-mensal',
    name: 'Check-in Mensal',
    description: 'Acompanhamento longitudinal de hábitos, peso em jejum e aderência geral do mês.',
    status: 'active',
    currentVersionId: 'ver-checkin-v1',
    createdBy: 'user-rafaela',
    createdAt: '2026-09-01T09:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
];
