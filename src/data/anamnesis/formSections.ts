import { FormSection } from '../../types';

export const initialFormSections: FormSection[] = [
  // Anamnese Inicial - Versão 1
  {
    id: 'section-init-1',
    versionId: 'ver-init-v1',
    title: 'Dados Pessoais',
    description: 'Informações cadastrais e de contato do aluno.',
    order: 1,
  },
  {
    id: 'section-init-2',
    versionId: 'ver-init-v1',
    title: 'Objetivos & Metas',
    description: 'Foco pretendido para a prescrição dos treinos.',
    order: 2,
  },
  {
    id: 'section-init-3',
    versionId: 'ver-init-v1',
    title: 'Histórico de Atividade Física',
    description: 'Experiência prévia e frequência com exercícios.',
    order: 3,
  },
  {
    id: 'section-init-4',
    versionId: 'ver-init-v1',
    title: 'Saúde & Restrições',
    description: 'Histórico de lesões, condições e medicações de rotina.',
    order: 4,
  },
  {
    id: 'section-init-5',
    versionId: 'ver-init-v1',
    title: 'Rotina & Hábitos',
    description: 'Sono, hidratação e nível de estresse diário.',
    order: 5,
  },
  {
    id: 'section-init-6',
    versionId: 'ver-init-v1',
    title: 'Termo de Aceite & Ciência',
    description: 'Declaração e autorização para registro de dados na plataforma.',
    order: 6,
  },

  // Anamnese Inicial - Versão 2 (com as mesmas seções)
  {
    id: 'section-init-v2-1',
    versionId: 'ver-init-v2',
    title: 'Dados Pessoais',
    description: 'Informações cadastrais e de contato do aluno.',
    order: 1,
  },
  {
    id: 'section-init-v2-2',
    versionId: 'ver-init-v2',
    title: 'Objetivos & Metas',
    description: 'Foco pretendido para a prescrição dos treinos.',
    order: 2,
  },
  {
    id: 'section-init-v2-3',
    versionId: 'ver-init-v2',
    title: 'Histórico de Atividade Física',
    description: 'Experiência prévia e frequência com exercícios.',
    order: 3,
  },
  {
    id: 'section-init-v2-4',
    versionId: 'ver-init-v2',
    title: 'Saúde & Restrições',
    description: 'Histórico de lesões, condições e medicações de rotina.',
    order: 4,
  },
  {
    id: 'section-init-v2-5',
    versionId: 'ver-init-v2',
    title: 'Rotina & Hábitos',
    description: 'Sono, hidratação e nível de estresse diário.',
    order: 5,
  },
  {
    id: 'section-init-v2-6',
    versionId: 'ver-init-v2',
    title: 'Termo de Aceite & Ciência',
    description: 'Declaração e autorização para registro de dados na plataforma.',
    order: 6,
  },

  // Atualização de Saúde
  {
    id: 'section-health-1',
    versionId: 'ver-health-v1',
    title: 'Atualização Clínica',
    description: 'Verificação de alterações no quadro de saúde desde a última avaliação.',
    order: 1,
  },
  {
    id: 'section-health-2',
    versionId: 'ver-health-v1',
    title: 'Aceite de Atualização',
    description: 'Confirmação da veracidade das informações.',
    order: 2,
  },

  // Avaliação de Treino
  {
    id: 'section-eval-1',
    versionId: 'ver-eval-v1',
    title: 'Percepção de Esforço & Recuperação',
    description: 'Como seu corpo tem reagido aos treinos atuais.',
    order: 1,
  },

  // Check-in Mensal
  {
    id: 'section-checkin-1',
    versionId: 'ver-checkin-v1',
    title: 'Acompanhamento do Mês',
    description: 'Consistência, peso atual e ajustes necessários.',
    order: 1,
  },
];
