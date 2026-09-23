import { RankingGroup } from '../types';

export const initialRankingGroups: RankingGroup[] = [
  {
    id: 'group-1',
    name: 'Desafio 30 Dias Seca & Consistência',
    description: 'Competição de frequência e disciplina diária. Ganha pontos quem concluir os treinos prescritos sem falhar!',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    active: true,
    studentIds: ['student-mariana', 'student-joao', 'student-carlos', 'student-fernanda'],
    reward: '1 Mês de Consultoria Grátis + Kit Biomecânico',
    createdAt: '2026-08-30T10:00:00Z',
  },
  {
    id: 'group-2',
    name: 'Turma Hipertrofia & Força Máxima',
    description: 'Foco em progressão de carga e execução biomecânica impecável para atletas e avançados.',
    startDate: '2026-09-10',
    endDate: '2026-10-10',
    active: true,
    studentIds: ['student-mariana', 'student-fernanda', 'student-carlos'],
    reward: 'Troféu Digital + Avaliação 3D Presencial',
    createdAt: '2026-09-08T14:30:00Z',
  },
  {
    id: 'group-3',
    name: 'Clube de Corrida & Core Saudável',
    description: 'Grupo focado em estabilidade de quadril, joelho e quilometragem sem dor articular.',
    startDate: '2026-09-15',
    endDate: '2026-10-15',
    active: true,
    studentIds: ['student-ana', 'student-carlos', 'student-joao'],
    reward: 'Planilha Especial de Periodização de Corrida',
    createdAt: '2026-09-14T09:00:00Z',
  },
];
