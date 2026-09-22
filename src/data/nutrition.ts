import { NutritionPlan } from '../types';

export const initialNutritionPlans: NutritionPlan[] = [
  {
    id: 'nutrition-mariana',
    studentId: 'student-mariana',
    goal: 'Hipertrofia Limpa & Recuperação Muscular',
    dailyCalories: 2250,
    disclaimer: 'Conteúdo demonstrativo. No produto real, a prescrição e adequação dietética individualizada são de competência exclusiva de nutricionista habilitado.',
    updatedAt: '2026-09-10',
    meals: [
      {
        id: 'meal-1',
        name: 'Café da Manhã',
        time: '07:30',
        items: [
          {
            id: 'item-1',
            name: 'Ovos mexidos',
            quantity: '3 unidades inteiras',
            substitutions: ['Tofu grelhado (150g)', 'Whey protein (30g) batido com água'],
          },
          {
            id: 'item-2',
            name: 'Pão 100% integral',
            quantity: '2 fatias (50g)',
            substitutions: ['Tapioca (60g)', 'Cuscuz de milho (100g)', 'Aveia em flocos (40g)'],
          },
          {
            id: 'item-3',
            name: 'Fruta fresca (Mamão ou Banana)',
            quantity: '1 porção média (120g)',
            substitutions: ['Morangos (180g)', 'Maçã (1 unidade média)'],
          },
        ],
        notes: 'Acompanhar com café puro sem açúcar ou chá verde.',
      },
      {
        id: 'meal-2',
        name: 'Lanche da Manhã',
        time: '10:30',
        items: [
          {
            id: 'item-4',
            name: 'Iogurte natural desnatado',
            quantity: '170g',
            substitutions: ['Kefir natural', 'Iogurte de soja proteico'],
          },
          {
            id: 'item-5',
            name: 'Castanhas do Pará ou Nozes',
            quantity: '15g (3 a 4 unidades)',
            substitutions: ['Pasta de amendoim integral (1 colher de sopa)', 'Sementes de abóbora tostadas (20g)'],
          },
        ],
      },
      {
        id: 'meal-3',
        name: 'Almoço',
        time: '13:00',
        items: [
          {
            id: 'item-6',
            name: 'Filé de peito de frango grelhado',
            quantity: '150g pesado pronto',
            substitutions: ['Filé de tilápia ou salmão (170g)', 'Patinho moído magro (140g)', 'Ovos cozidos (3 unidades) + claras'],
          },
          {
            id: 'item-7',
            name: 'Arroz branco ou integral',
            quantity: '140g cozido (4 colheres de sopa cheias)',
            substitutions: ['Batata doce cozida ou assada (160g)', 'Mandioca cozida (130g)', 'Macarrão grano duro (120g)'],
          },
          {
            id: 'item-8',
            name: 'Feijão carioca ou preto',
            quantity: '1 concha média (80g)',
            substitutions: ['Lentilha cozida (80g)', 'Grão de bico cozido (70g)'],
          },
          {
            id: 'item-9',
            name: 'Salada de folhas verdes à vontade + Azeite de oliva',
            quantity: '1 prato raso + 1 fio de azeite extra virgem (5ml)',
            substitutions: ['Legumes cozidos no vapor (cenoura, brócolis, abobrinha)'],
          },
        ],
      },
      {
        id: 'meal-4',
        name: 'Lanche da Tarde (Pré-Treino)',
        time: '16:30',
        items: [
          {
            id: 'item-10',
            name: 'Banana prata com aveia e canela',
            quantity: '1 unidade média + 30g de aveia',
            substitutions: ['Pão com pasta de amendoim (1 fatia)', 'Batata doce assada (100g)'],
          },
        ],
        notes: 'Consumir cerca de 60 a 90 minutos antes do treino.',
      },
      {
        id: 'meal-5',
        name: 'Jantar',
        time: '20:00',
        items: [
          {
            id: 'item-11',
            name: 'Sobrecoxa sem pele ou Patinho grelhado',
            quantity: '140g pronto',
            substitutions: ['Peixe branco grelhado (160g)', 'Omelete de 3 ovos com espinafre'],
          },
          {
            id: 'item-12',
            name: 'Purê de abóbora cabotiá ou Mandioquinha',
            quantity: '150g',
            substitutions: ['Arroz com legumes (120g)', 'Batata inglesa assada (150g)'],
          },
          {
            id: 'item-13',
            name: 'Mix de vegetais verdes escuros',
            quantity: 'À vontade',
            substitutions: ['Espinafre refogado', 'Couve-flor ao alho'],
          },
        ],
      },
      {
        id: 'meal-6',
        name: 'Ceia',
        time: '22:30',
        items: [
          {
            id: 'item-14',
            name: 'Chá calmante de camomila ou melissa',
            quantity: '1 xícara (200ml)',
            substitutions: ['Chá de maracujá', 'Água morna com própolis'],
          },
        ],
      },
    ],
  },
  {
    id: 'nutrition-joao',
    studentId: 'student-joao',
    goal: 'Déficit Calórico Orientado para Emagrecimento',
    dailyCalories: 1850,
    disclaimer: 'Conteúdo demonstrativo. No produto real, a prescrição e adequação dietética individualizada são de competência exclusiva de nutricionista habilitado.',
    updatedAt: '2026-09-08',
    meals: [
      {
        id: 'meal-j1',
        name: 'Café da Manhã',
        time: '08:00',
        items: [
          {
            id: 'item-j1',
            name: 'Ovos mexidos com tomate e orégano',
            quantity: '2 ovos inteiros',
            substitutions: ['1 ovo + 2 claras mexidas', 'Queijo minas frescal (50g)'],
          },
          {
            id: 'item-j2',
            name: 'Torrada integral multigrãos',
            quantity: '1 fatia (25g)',
            substitutions: ['Metade de uma fruta média (maçã ou kiwi)'],
          },
        ],
      },
      {
        id: 'meal-j2',
        name: 'Almoço',
        time: '12:30',
        items: [
          {
            id: 'item-j3',
            name: 'Peito de frango em tiras ou Alcatra magra',
            quantity: '130g pronto',
            substitutions: ['Atum sólido em água (1 lata)', 'Tilápia grelhada (150g)'],
          },
          {
            id: 'item-j4',
            name: 'Arroz integral',
            quantity: '80g cozido (2 colheres de sopa)',
            substitutions: ['Batata cozida (100g)', 'Quinoa cozida (80g)'],
          },
          {
            id: 'item-j5',
            name: 'Salada colorida crua variada',
            quantity: '1 prato fundo cheio com azeite moderado (3ml)',
            substitutions: ['Legumes grelhados (abobrinha e berinjela)'],
          },
        ],
      },
      {
        id: 'meal-j3',
        name: 'Jantar',
        time: '19:30',
        items: [
          {
            id: 'item-j6',
            name: 'Sopa cremosa de abóbora com frango desfiado',
            quantity: '1 tigela média (300ml)',
            substitutions: ['Salada completa com ovos cozidos e atum'],
          },
        ],
      },
    ],
  },
];
