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

  // PAR-Q+
  {
    id: 'sec-parq-1',
    versionId: 'ver-parq-v1',
    title: 'Estratificação Cardiovascular & Prontidão',
    description: 'Triagem de sintomas cardíacos, dores no peito, tonturas e pressão arterial.',
    order: 1,
  },
  {
    id: 'sec-parq-2',
    versionId: 'ver-parq-v1',
    title: 'Saúde Óssea, Articular & Sintomas',
    description: 'Verificação de limitações físicas que possam se agravar com o esforço.',
    order: 2,
  },
  {
    id: 'sec-parq-3',
    versionId: 'ver-parq-v1',
    title: 'Declaração de Ciência & Responsabilidade',
    description: 'Compromisso com a veracidade dos dados de prontidão.',
    order: 3,
  },

  // Avaliação Postural & Queixas Biomecânicas
  {
    id: 'sec-postural-1',
    versionId: 'ver-postural-v1',
    title: 'Desvios Posturais & Coluna',
    description: 'Histórico de escoliose, cifose, hiperlordose e dores na coluna vertebral.',
    order: 1,
  },
  {
    id: 'sec-postural-2',
    versionId: 'ver-postural-v1',
    title: 'Sintomas em Movimentos Fundamentais',
    description: 'Sensações articulares durante agachamentos, empurradas e puxadas.',
    order: 2,
  },
  {
    id: 'sec-postural-3',
    versionId: 'ver-postural-v1',
    title: 'Histórico Ortopédico & Tratamentos',
    description: 'Cirurgias prévias, fisioterapia e restrições prescritas por ortopedista.',
    order: 3,
  },

  // Recordatório Nutricional
  {
    id: 'sec-nutri-1',
    versionId: 'ver-nutri-v1',
    title: 'Hidratação & Rotina de Refeições',
    description: 'Consumo diário de água e frequência de refeições no dia a dia.',
    order: 1,
  },
  {
    id: 'sec-nutri-2',
    versionId: 'ver-nutri-v1',
    title: 'Alimentação Pré e Pós-Treino',
    description: 'Timing de refeições, treino em jejum ou alimentado e opções habituais.',
    order: 2,
  },
  {
    id: 'sec-nutri-3',
    versionId: 'ver-nutri-v1',
    title: 'Suplementação, Restrições & Hábitos',
    description: 'Uso de suplementos, intolerâncias alimentares e hábitos de fim de semana.',
    order: 3,
  },

  // Sono, Estresse & Recuperação
  {
    id: 'sec-recovery-1',
    versionId: 'ver-recovery-v1',
    title: 'Qualidade e Ritmo do Sono',
    description: 'Média de horas dormidas, insônia e nível de restauração ao acordar.',
    order: 1,
  },
  {
    id: 'sec-recovery-2',
    versionId: 'ver-recovery-v1',
    title: 'Nível de Estresse & Sobrecarga',
    description: 'Carga mental, estresse ocupacional e cansaço crônico.',
    order: 2,
  },
  {
    id: 'sec-recovery-3',
    versionId: 'ver-recovery-v1',
    title: 'Recuperação Muscular & Técnicas',
    description: 'Dores musculares tardias (DOMS) e hábitos de recuperação ativa.',
    order: 3,
  },

  // Preferências de Treino
  {
    id: 'sec-prefs-1',
    versionId: 'ver-prefs-v1',
    title: 'Disponibilidade e Frequência Semanal',
    description: 'Tempo disponível por treino, turnos e dias da semana prioritários.',
    order: 1,
  },
  {
    id: 'sec-prefs-2',
    versionId: 'ver-prefs-v1',
    title: 'Grupamentos Musculares & Metodologia',
    description: 'Músculos prioritários e modalidades de treino com maior aderência.',
    order: 2,
  },
  {
    id: 'sec-prefs-3',
    versionId: 'ver-prefs-v1',
    title: 'Exercícios Favoritos e Desfavoráveis',
    description: 'Movimentos que você gosta de executar e os que prefere evitar.',
    order: 3,
  },

  // Termo de Consentimento & Compromisso
  {
    id: 'sec-termo-1',
    versionId: 'ver-termo-v1',
    title: 'Aptidão Física & Responsabilidade Médica',
    description: 'Atestado médico e ciência dos esforços exigidos na consultoria.',
    order: 1,
  },
  {
    id: 'sec-termo-2',
    versionId: 'ver-termo-v1',
    title: 'Compromisso de Assiduidade & Regras',
    description: 'Políticas de pontualidade, cancelamento de sessões e relato de dores.',
    order: 2,
  },
  {
    id: 'sec-termo-3',
    versionId: 'ver-termo-v1',
    title: 'Privacidade & Uso de Imagem',
    description: 'Autorização para fotos de acompanhamento e comparativo corporal.',
    order: 3,
  },

  // Protocolo de Retorno aos Treinos
  {
    id: 'sec-retorno-1',
    versionId: 'ver-retorno-v1',
    title: 'Período de Afastamento & Atividades',
    description: 'Tempo sem treinar regularmente e nível de atividade mantido na pausa.',
    order: 1,
  },
  {
    id: 'sec-retorno-2',
    versionId: 'ver-retorno-v1',
    title: 'Condição Atual & Readaptação',
    description: 'Percepção de força, possíveis dores e ritmo desejado para as 2 primeiras semanas.',
    order: 2,
  },
];
