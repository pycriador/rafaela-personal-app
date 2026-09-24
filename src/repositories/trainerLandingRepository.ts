import { TrainerLandingPageConfig } from '../types';
import { getItem, setItem } from './storage';

export const DEFAULT_TRAINER_LANDINGS: TrainerLandingPageConfig[] = [
  {
    id: 'landing-user-rafaela',
    trainerId: 'user-rafaela',
    trainerName: 'Rafaela Silva',
    slug: 'rafaela-silva',
    headline: 'Transforme Seu Físico com Método Científico e Acompanhamento 100% Personalizado',
    subheadline: 'Consultoria de alta performance focada em Hipertrofia Feminina, Biomecânica e Resultados Reais.',
    bio: 'Especialista em biomecânica aplicada e hipertrofia feminina com mais de 8 anos de experiência. Formada em Educação Física pela USP, CREF 028914-G/SP. Meu método combina periodização inteligente, ajustes finos de execução com feedback em vídeo e suporte diário via aplicativo exclusivo.',
    photoUrl: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=600&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80',
    specialties: ['Hipertrofia Feminina', 'Biomecânica Aplicada', 'Emagrecimento Saudável', 'Ajuste Postural'],
    cref: '028914-G/SP',
    whatsapp: '5511987654321',
    instagram: '@rafaelasilva.personal',
    experienceYears: 8,
    accentColor: 'emerald',
    featuredPlans: [
      {
        id: 'plan-rf-1',
        name: 'Trimestral Premium',
        price: 380,
        billing: 'R$ 380 / mês (cobrado trimestralmente)',
        description: 'Ideal para consolidação de hábitos e construção de massa magra sustentável com trocas periódicas.',
        highlight: true,
        features: [
          'Ficha 100% individualizada no App',
          'Feedback de execução por vídeo semanal',
          'Ajustes de carga e intensidade em tempo real',
          'Plano alimentar e cálculo de macronutrientes',
          'Chat direto comigo no WhatsApp e no App',
        ],
        checkoutUrl: 'https://pay.infinitypay.io/rafaela-personal/trimestral',
      },
      {
        id: 'plan-rf-2',
        name: 'Semestral Transformação VIP',
        price: 320,
        billing: 'R$ 320 / mês (cobrado semestralmente)',
        description: 'Nosso plano mais completo com máximo custo-benefício para quem busca uma mudança profunda no shape.',
        highlight: false,
        features: [
          'Tudo do Plano Trimestral',
          'Periodização avançada com deloads programados',
          'Acompanhamento de medidas e bioimpedância',
          'Acesso prioritário a vagas de consultoria presencial',
          'Desconto exclusivo de 20% em renovações',
        ],
        checkoutUrl: 'https://pay.infinitypay.io/rafaela-personal/semestral',
      },
      {
        id: 'plan-rf-3',
        name: 'Mensal Start',
        price: 450,
        billing: 'R$ 450 / mês (renovação mensal)',
        description: 'Perfeito para quem quer conhecer a metodologia e sentir a diferença de um acompanhamento de elite.',
        highlight: false,
        features: [
          'Prescrição completa no aplicativo',
          'Vídeos explicativos de cada movimento',
          'Suporte a dúvidas via chat',
          'Sem fidelidade ou carência',
        ],
        checkoutUrl: 'https://pagbank.com.br/checkout/rafaela-mensal',
      },
    ],
    testimonials: [
      {
        name: 'Camila Rocha',
        result: '-8kg e definição no glúteo',
        comment: 'Estava estagnada na academia havia 2 anos. Com a correção das posturas e o volume certo da Rafaela, meu corpo mudou em 90 dias!',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Juliana Costa',
        result: 'Constância sem lesões',
        comment: 'Nunca consegui manter rotina com treinos genéricos. O app é super prático e a Rafa responde tudo muito rápido com paciência e ciência.',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Beatriz Mendes',
        result: 'Força e postura alinhada',
        comment: 'Trabalho sentada o dia todo e sentia muitas dores. Hoje não sinto nada e minhas pernas estão muito mais fortes e desenhadas.',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
    ],
    isPublished: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'landing-user-carlos',
    trainerId: 'user-carlos',
    trainerName: 'Carlos Mendes',
    slug: 'carlos-mendes',
    headline: 'Consultoria Especializada em Força Máxima, Powerlifting e Hipertrofia Masculina',
    subheadline: 'Periodização de força, quebra de platôs e aumento expressivo de massa muscular com rigor técnico.',
    bio: 'Treinador de atletas de força e entusiastas do fisiculturismo com 10 anos de vivência prática e acadêmica. CREF 045920-G/SP. Meu foco é fazer você evoluir com segurança nas cargas, sem dor lombar ou articular, usando método comprovado de progressão linear e ondulatória.',
    photoUrl: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=600&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80',
    specialties: ['Powerlifting', 'Hipertrofia Masculina', 'Preparação de Força', 'Biomecânica de Cargas'],
    cref: '045920-G/SP',
    whatsapp: '5511971234567',
    instagram: '@carlosmendes.coach',
    experienceYears: 10,
    accentColor: 'blue',
    featuredPlans: [
      {
        id: 'plan-cm-1',
        name: 'Força & Carga Trimestral',
        price: 390,
        billing: 'R$ 390 / mês',
        description: 'Montagem de mesociclos de força com testes de RPE/RIR e análise de técnica nos movimentos básicos.',
        highlight: true,
        features: [
          'Periodização em blocos no app',
          'Análise de técnica de agachamento, supino e terra',
          'Gestão de fadiga e volume recuperável',
          'Suporte direto para dúvidas de treino',
        ],
        checkoutUrl: 'https://pay.infinitypay.io/carlos-mendes/forca',
      },
      {
        id: 'plan-cm-2',
        name: 'Semestral Hipertrofia Elite',
        price: 330,
        billing: 'R$ 330 / mês',
        description: 'Ciclo completo para maximizar ganhos de densidade e hipertrofia com progressão calculada.',
        highlight: false,
        features: [
          'Acompanhamento de 6 meses completo',
          'Planilhas e aplicativo integrado',
          'Estratégias de deload e transição de estímulos',
          'Suporte via WhatsApp com Carlos',
        ],
        checkoutUrl: 'https://pay.infinitypay.io/carlos-mendes/hipertrofia',
      },
    ],
    testimonials: [
      {
        name: 'Thiago Ramos',
        result: '+45kg no total de carga',
        comment: 'Com as correções de pegada e posicionamento do Carlos, meu agachamento subiu de 100kg para 145kg sem dor nas costas.',
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Felipe Guimarães',
        result: '+6kg de massa magra',
        comment: 'Treinamento de verdade. Saí do comodismo e os treinos são estruturados de forma cirúrgica.',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      },
    ],
    isPublished: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'landing-user-mariana',
    trainerId: 'user-mariana',
    trainerName: 'Mariana Duarte',
    slug: 'mariana-duarte',
    headline: 'Treinamento Funcional, Pilates & Reabilitação Postural para Sua Saúde Integral',
    subheadline: 'Corpo tonificado, alívio de dores posturais e mobilidade sem impactos ou agressões articulares.',
    bio: 'Educadora Física e especialista em Pilates Clínico e Movimento Funcional. CREF 038812-G/RJ. Atuo há mais de 7 anos ajudando pessoas a conquistarem um corpo forte, ágil e livre de tensões crônicas com respeito à biomecânica do corpo.',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&auto=format&fit=crop&q=80',
    specialties: ['Treinamento Funcional', 'Pilates Solo e Aparelhos', 'Reabilitação Postural', 'Mobilidade & Flexibilidade'],
    cref: '038812-G/RJ',
    whatsapp: '5521988776655',
    instagram: '@marianaduarte.fit',
    experienceYears: 7,
    accentColor: 'purple',
    featuredPlans: [
      {
        id: 'plan-md-1',
        name: 'Postura & Mobilidade Trimestral',
        price: 350,
        billing: 'R$ 350 / mês',
        description: 'Sequências de alinhamento postural, fortalecimento de core e tônus global sem dor.',
        highlight: true,
        features: [
          'Rotinas diárias de mobilidade e descompressão',
          'Séries de Pilates e funcional aplicadas no app',
          'Correção postural guiada por fotos e vídeos',
          'Acompanhamento carinhoso e próximo',
        ],
        checkoutUrl: 'https://pagbank.com.br/checkout/mariana-pilates',
      },
      {
        id: 'plan-md-2',
        name: 'Vitalidade Integral Semestral',
        price: 299,
        billing: 'R$ 299 / mês',
        description: 'Para quem busca rejuvenescimento articular, fôlego e corpo firme para o longo prazo.',
        highlight: false,
        features: [
          'Plano semestral com progressão suave',
          'Combinação de força com respiração e tônus',
          'Vídeos com instruções passo a passo detalhadas',
          'Suporte semanal via WhatsApp',
        ],
        checkoutUrl: 'https://pagbank.com.br/checkout/mariana-vitalidade',
      },
    ],
    testimonials: [
      {
        name: 'Isabela Fontes',
        result: 'Adeus às crises de coluna',
        comment: 'Eu não conseguia passar 1 hora no computador sem dor. O programa da Mari me devolveu a qualidade de vida.',
        avatarUrl: 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Vanessa Toledo',
        result: 'Mais fôlego e tônus muscular',
        comment: 'Treinos prazerosos e super eficientes. O aplicativo facilita muito para treinar em qualquer lugar.',
        avatarUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80',
      },
    ],
    isPublished: true,
    updatedAt: new Date().toISOString(),
  },
];

const TRAINER_LANDING_STORAGE_KEY = 'rafaela_trainer_landing_pages_v1';

export class TrainerLandingRepository {
  async getAll(): Promise<TrainerLandingPageConfig[]> {
    return getItem<TrainerLandingPageConfig[]>(TRAINER_LANDING_STORAGE_KEY, DEFAULT_TRAINER_LANDINGS);
  }

  async getByTrainerId(trainerId: string): Promise<TrainerLandingPageConfig | null> {
    const list = await this.getAll();
    const found = list.find((c) => c.trainerId === trainerId);
    if (found) return found;

    // Return a default new config if not found
    return {
      id: `landing-${trainerId}`,
      trainerId,
      trainerName: 'Personal Trainer',
      slug: `personal-${trainerId.replace('user-', '')}`,
      headline: 'Acompanhamento Personalizado com Foco em Resultados Reais',
      subheadline: 'Prescrição individualizada e suporte diário via aplicativo.',
      bio: 'Treinador certificado dedicado a ajudar alunos a superarem seus limites com segurança e consistência.',
      specialties: ['Musculação', 'Condicionamento', 'Saúde'],
      cref: '000000-G/SP',
      whatsapp: '5511999999999',
      experienceYears: 5,
      accentColor: 'emerald',
      featuredPlans: [
        {
          id: `plan-def-${trainerId}`,
          name: 'Consultoria Premium',
          price: 350,
          billing: 'R$ 350 / mês',
          description: 'Acompanhamento completo de treinos pelo aplicativo.',
          highlight: true,
          features: ['Ficha personalizada', 'Suporte no chat', 'Ajuste de cargas'],
        },
      ],
      testimonials: [],
      isPublished: true,
      updatedAt: new Date().toISOString(),
    };
  }

  async getBySlug(slug: string): Promise<TrainerLandingPageConfig | null> {
    const list = await this.getAll();
    const clean = slug.toLowerCase().trim();
    return list.find((c) => c.slug.toLowerCase().trim() === clean && c.isPublished) || null;
  }

  async save(config: TrainerLandingPageConfig): Promise<TrainerLandingPageConfig> {
    const list = await this.getAll();
    const index = list.findIndex((c) => c.trainerId === config.trainerId || c.id === config.id);
    const updated: TrainerLandingPageConfig = {
      ...config,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      list[index] = updated;
    } else {
      list.push(updated);
    }

    setItem(TRAINER_LANDING_STORAGE_KEY, list);
    window.dispatchEvent(new CustomEvent('rafaela_trainer_landing_updated', { detail: { trainerId: config.trainerId } }));
    return updated;
  }
}

export const trainerLandingRepository = new TrainerLandingRepository();
