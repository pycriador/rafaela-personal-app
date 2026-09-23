import { FormAnswer } from '../../types';

export const initialFormAnswers: FormAnswer[] = [
  // Mariana - Anamnese v1
  { id: 'ans-m1-1', responseId: 'resp-mariana-v1', fieldId: 'f-init-1', value: 'Mariana Silva' },
  { id: 'ans-m1-2', responseId: 'resp-mariana-v1', fieldId: 'f-init-2', value: '1996-05-14' },
  { id: 'ans-m1-3', responseId: 'resp-mariana-v1', fieldId: 'f-init-3', value: '(11) 98765-4321' },
  { id: 'ans-m1-4', responseId: 'resp-mariana-v1', fieldId: 'f-init-4', value: 'mariana.silva@email.com' },
  { id: 'ans-m1-5', responseId: 'resp-mariana-v1', fieldId: 'f-init-5', value: 'Hipertrofia' },
  { id: 'ans-m1-6', responseId: 'resp-mariana-v1', fieldId: 'f-init-6', value: ['Energia', 'Redução de Estresse'] },
  { id: 'ans-m1-7', responseId: 'resp-mariana-v1', fieldId: 'f-init-7', value: 4 },
  { id: 'ans-m1-8', responseId: 'resp-mariana-v1', fieldId: 'f-init-8', value: true },
  { id: 'ans-m1-9', responseId: 'resp-mariana-v1', fieldId: 'f-init-9', value: '1 ano contínuo' },
  { id: 'ans-m1-10', responseId: 'resp-mariana-v1', fieldId: 'f-init-10', value: false },
  { id: 'ans-m1-11', responseId: 'resp-mariana-v1', fieldId: 'f-init-11', value: false },
  { id: 'ans-m1-13', responseId: 'resp-mariana-v1', fieldId: 'f-init-13', value: true },
  { id: 'ans-m1-14', responseId: 'resp-mariana-v1', fieldId: 'f-init-14', value: 'Entorse leve de tornozelo direito em 2023, recuperado.' },
  { id: 'ans-m1-15', responseId: 'resp-mariana-v1', fieldId: 'f-init-15', value: 'Nenhuma limitação ativa.' },
  { id: 'ans-m1-16', responseId: 'resp-mariana-v1', fieldId: 'f-init-16', value: false },
  { id: 'ans-m1-18', responseId: 'resp-mariana-v1', fieldId: 'f-init-18', value: 7 },
  { id: 'ans-m1-19', responseId: 'resp-mariana-v1', fieldId: 'f-init-19', value: 3 },
  { id: 'ans-m1-20', responseId: 'resp-mariana-v1', fieldId: 'f-init-20', value: '2L - 3L' },
  { id: 'ans-m1-21', responseId: 'resp-mariana-v1', fieldId: 'f-init-21', value: 'Prefiro treinos intensos com descanso controlado.' },
  { id: 'ans-m1-22', responseId: 'resp-mariana-v1', fieldId: 'f-init-22', value: true },

  // Mariana - Anamnese v2 (atualização com pergunta de suplemento respondida)
  { id: 'ans-m2-1', responseId: 'resp-mariana-v2', fieldId: 'f-init-v2-1', value: 'Mariana Silva' },
  { id: 'ans-m2-2', responseId: 'resp-mariana-v2', fieldId: 'f-init-v2-2', value: '1996-05-14' },
  { id: 'ans-m2-3', responseId: 'resp-mariana-v2', fieldId: 'f-init-v2-3', value: '(11) 98765-4321' },
  { id: 'ans-m2-4', responseId: 'resp-mariana-v2', fieldId: 'f-init-v2-4', value: 'mariana.silva@email.com' },
  { id: 'ans-m2-5', responseId: 'resp-mariana-v2', fieldId: 'f-init-v2-5', value: 'Hipertrofia' },
  { id: 'ans-m2-6', responseId: 'resp-mariana-v2', fieldId: 'f-init-v2-6', value: 4 },
  { id: 'ans-m2-7', responseId: 'resp-mariana-v2', fieldId: 'f-init-v2-7', value: true },
  { id: 'ans-m2-8', responseId: 'resp-mariana-v2', fieldId: 'f-init-v2-8', value: false },
  { id: 'ans-m2-extra', responseId: 'resp-mariana-v2', fieldId: 'f-init-v2-extra', value: 'Creatina monohidratada 5g/dia e Whey Protein 30g pós-treino.' },
  { id: 'ans-m2-10', responseId: 'resp-mariana-v2', fieldId: 'f-init-v2-10', value: true },

  // Ana Souza - Avaliação de Treino
  { id: 'ans-ana-1', responseId: 'resp-ana-eval', fieldId: 'f-eval-1', value: 4 },
  { id: 'ans-ana-2', responseId: 'resp-ana-eval', fieldId: 'f-eval-2', value: 4 },
  { id: 'ans-ana-3', responseId: 'resp-ana-eval', fieldId: 'f-eval-3', value: 'Tudo ótimo, apenas um leve cansaço nos ombros no dia seguinte.' },
];
