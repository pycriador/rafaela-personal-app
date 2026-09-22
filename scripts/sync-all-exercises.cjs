const fs = require('fs');
const path = require('path');

const manifest = require('../node_modules/@bryllim/workout-guide/manifest.json');
const manifestList = Array.isArray(manifest) ? manifest : Object.values(manifest);

const slugToLegacyId = {
  'machine-chest-press': 'exercise-peito-01',
  'bench-press': 'exercise-peito-02',
  'incline-dumbbell-press': 'exercise-peito-03',
  'dumbbell-fly': 'exercise-peito-04',
  'push-up': 'exercise-peito-05',
  'lat-pulldown': 'exercise-costas-01',
  'machine-row': 'exercise-costas-02',
  'barbell-row': 'exercise-costas-03',
  'one-arm-dumbbell-row': 'exercise-costas-04',
  'pull-up': 'exercise-costas-05',
  'deadlift': 'exercise-costas-06',
  'squat': 'exercise-pernas-01',
  'leg-press': 'exercise-pernas-02',
  'goblet-squat': 'exercise-pernas-03',
  'leg-extension': 'exercise-pernas-04',
  'lying-leg-curl': 'exercise-pernas-05',
  'romanian-deadlift': 'exercise-pernas-06',
  'walking-lunge': 'exercise-pernas-07',
  'machine-shoulder-press': 'exercise-ombros-01',
  'seated-dumbbell-press': 'exercise-ombros-02',
  'lateral-raise': 'exercise-ombros-03',
  'cable-front-raise': 'exercise-ombros-04',
  'ez-bar-curl': 'exercise-biceps-01',
  'bicep-curl': 'exercise-biceps-02',
  'hammer-curl': 'exercise-biceps-03',
  'rope-tricep-pushdown': 'exercise-triceps-01',
  'dumbbell-overhead-tricep-extension': 'exercise-triceps-02',
  'skull-crusher': 'exercise-triceps-03',
  'plank': 'exercise-core-01',
  'crunch': 'exercise-core-02',
  'hanging-leg-raise': 'exercise-core-03',
  'dead-bug': 'exercise-core-04',
};

const customDetails = {
  'exercise-peito-01': {
    name: 'Supino Máquina',
    category: 'Peito',
    type: 'máquina',
    muscleGroups: ['Peitoral Maior', 'Tríceps', 'Deltoide Anterior'],
    equipment: 'Máquina Convergente / Articulada',
    difficulty: 'iniciante',
    instructions: 'Ajuste o assento para que os pegadores fiquem na linha média do peito. Mantenha os pés firmes no chão, escápulas retraídas e empurre controlando a fase excêntrica.',
    alternatives: ['exercise-peito-02', 'exercise-peito-04', 'exercise-peito-05'],
  },
  'exercise-peito-02': {
    name: 'Supino Reto com Barra',
    category: 'Peito',
    type: 'barra',
    muscleGroups: ['Peitoral Maior', 'Tríceps', 'Deltoide Anterior'],
    equipment: 'Banco Reto e Barra Olímpica',
    difficulty: 'intermediário',
    instructions: 'Deite com os olhos alinhados à barra. Pegada ligeiramente mais larga que os ombros. Desça a barra controladamente até o terço médio do esterno e empurre.',
    alternatives: ['exercise-peito-01', 'exercise-peito-03'],
  },
  'exercise-peito-03': {
    name: 'Supino Inclinado com Halteres',
    category: 'Peito',
    type: 'halteres',
    muscleGroups: ['Peitoral Superior', 'Deltoide Anterior', 'Tríceps'],
    equipment: 'Banco Inclinado (30º-45º) e Halteres',
    difficulty: 'intermediário',
    instructions: 'Com o banco em inclinação de 30 a 45 graus, empurre os halteres para cima convergindo levemente no topo sem bater os pesos.',
    alternatives: ['exercise-peito-02', 'exercise-peito-04'],
  },
  'exercise-peito-04': {
    name: 'Crucifixo com Halteres',
    category: 'Peito',
    type: 'halteres',
    muscleGroups: ['Peitoral Maior (Fibras Esternocostais)'],
    equipment: 'Banco Reto e Par de Halteres',
    difficulty: 'intermediário',
    instructions: 'Abra os braços mantendo cotovelos levemente flexionados até sentir o alongamento do peitoral. Retorne contraindo o peito no topo.',
    alternatives: ['exercise-peito-01', 'exercise-peito-02'],
  },
  'exercise-peito-05': {
    name: 'Flexão de Braço',
    category: 'Peito',
    type: 'peso corporal',
    muscleGroups: ['Peitoral Maior', 'Tríceps', 'Core'],
    equipment: 'Peso Corporal (Chão)',
    difficulty: 'iniciante',
    instructions: 'Mantenha o corpo em linha reta e abdômen contraído. Desça o peito próximo ao solo mantendo cotovelos em aproximadamente 45º do tronco.',
    alternatives: ['exercise-peito-01', 'exercise-peito-02'],
  },
  'exercise-costas-01': {
    name: 'Puxada Frontal no Pulley',
    category: 'Costas',
    type: 'cabo',
    muscleGroups: ['Latíssimo do Dorso', 'Bíceps', 'Trapézio'],
    equipment: 'Polia Alta com Barra Longa',
    difficulty: 'iniciante',
    instructions: 'Pegada aberta pronada. Puxe a barra em direção à parte superior do peito projetando o esterno e deprimindo as escápulas.',
    alternatives: ['exercise-costas-02', 'exercise-costas-05'],
  },
  'exercise-costas-02': {
    name: 'Remada Máquina Sentada',
    category: 'Costas',
    type: 'máquina',
    muscleGroups: ['Rombóides', 'Trapézio Médio', 'Latíssimo do Dorso'],
    equipment: 'Máquina Articulada de Remada',
    difficulty: 'iniciante',
    instructions: 'Ajuste o apoio do peito. Puxe os pegadores retraindo as escápulas ao final e expire. Controle o retorno sem arredondar os ombros.',
    alternatives: ['exercise-costas-01', 'exercise-costas-03'],
  },
  'exercise-costas-03': {
    name: 'Remada Curvada com Barra',
    category: 'Costas',
    type: 'barra',
    muscleGroups: ['Latíssimo do Dorso', 'Eretores da Espinha', 'Trapézio'],
    equipment: 'Barra Olímpica e Anilhas',
    difficulty: 'avançado',
    instructions: 'Incline o tronco a cerca de 45º mantendo coluna neutra. Puxe a barra até a região do umbigo, contraindo as costas.',
    alternatives: ['exercise-costas-02', 'exercise-costas-04'],
  },
  'exercise-costas-04': {
    name: 'Remada Unilateral com Halter (Serrote)',
    category: 'Costas',
    type: 'halteres',
    muscleGroups: ['Latíssimo do Dorso', 'Rombóides', 'Bíceps'],
    equipment: 'Banco Plano e Halter',
    difficulty: 'intermediário',
    instructions: 'Apoie um joelho e mão no banco. Com o outro lado, puxe o halter em direção ao quadril mantendo as costas retas e cotovelo colado.',
    alternatives: ['exercise-costas-02', 'exercise-costas-03'],
  },
  'exercise-costas-05': {
    name: 'Barra Fixa Pronada (Pull-up)',
    category: 'Costas',
    type: 'peso corporal',
    muscleGroups: ['Latíssimo do Dorso', 'Bíceps', 'Core'],
    equipment: 'Barra Fixa',
    difficulty: 'avançado',
    instructions: 'Segure a barra com pegada pronada afastada. Puxe o corpo até que o queixo passe a barra, sem balançar o corpo.',
    alternatives: ['exercise-costas-01', 'exercise-costas-02'],
  },
  'exercise-costas-06': {
    name: 'Levantamento Terra Convencional',
    category: 'Costas',
    type: 'barra',
    muscleGroups: ['Isquiotibiais', 'Glúteos', 'Lombar', 'Trapézio', 'Dorsal'],
    equipment: 'Barra Olímpica e Anilhas',
    difficulty: 'avançado',
    instructions: 'Pés na largura do quadril, coluna neutra. Puxe a barra rente às canelas, estendendo quadril e joelhos sincronizadamente. Trave no topo sem hiperextender a lombar.',
    alternatives: ['exercise-pernas-06', 'exercise-costas-03'],
  },
  'exercise-pernas-01': {
    name: 'Agachamento Livre com Barra',
    category: 'Pernas',
    type: 'barra',
    muscleGroups: ['Quadríceps', 'Glúteo Máximo', 'Core'],
    equipment: 'Gaiola de Agachamento e Barra Olímpica',
    difficulty: 'avançado',
    instructions: 'Barra apoiada nos trapézios. Desça flexionando quadril e joelhos mantendo joelhos alinhados com a ponta dos pés até 90º ou mais.',
    alternatives: ['exercise-pernas-02', 'exercise-pernas-03'],
  },
  'exercise-pernas-02': {
    name: 'Leg Press 45º',
    category: 'Pernas',
    type: 'máquina',
    muscleGroups: ['Quadríceps', 'Glúteos', 'Isquiotibiais'],
    equipment: 'Máquina de Leg Press 45º',
    difficulty: 'iniciante',
    instructions: 'Apoie as costas completamente no encosto. Pés na largura dos ombros na plataforma. Destrave a máquina e desça até 90º sem descolar a lombar.',
    alternatives: ['exercise-pernas-01', 'exercise-pernas-04'],
  },
  'exercise-pernas-03': {
    name: 'Agachamento Goblet',
    category: 'Pernas',
    type: 'halteres',
    muscleGroups: ['Quadríceps', 'Glúteos', 'Core'],
    equipment: 'Halter ou Kettlebell',
    difficulty: 'iniciante',
    instructions: 'Segure o halter na altura do peito com ambas as mãos. Agache mantendo o tronco ereto e os cotovelos entre os joelhos no ponto baixo.',
    alternatives: ['exercise-pernas-01', 'exercise-pernas-02'],
  },
  'exercise-pernas-04': {
    name: 'Cadeira Extensora',
    category: 'Pernas',
    type: 'máquina',
    muscleGroups: ['Quadríceps (Reto Femoral e Vastos)'],
    equipment: 'Cadeira Extensora',
    difficulty: 'iniciante',
    instructions: 'Ajuste o encosto e o rolo no tornozelo. Estenda as pernas controlando o movimento e segure 1 segundo no topo antes de descer suavemente.',
    alternatives: ['exercise-pernas-01', 'exercise-pernas-02'],
  },
  'exercise-pernas-05': {
    name: 'Mesa Flexora',
    category: 'Pernas',
    type: 'máquina',
    muscleGroups: ['Isquiotibiais (Posterior da Coxa)'],
    equipment: 'Mesa Flexora Horizontal',
    difficulty: 'iniciante',
    instructions: 'Deitado de bruços, flexione as pernas aproximando os calcanhares dos glúteos. Mantenha a pelve pressionada contra o estofado.',
    alternatives: ['exercise-pernas-06', 'exercise-pernas-07'],
  },
  'exercise-pernas-06': {
    name: 'Stiff com Barra / Halteres',
    category: 'Pernas',
    type: 'barra',
    muscleGroups: ['Isquiotibiais', 'Glúteo Máximo', 'Lombar'],
    equipment: 'Barra ou Par de Halteres',
    difficulty: 'intermediário',
    instructions: 'Pés paralelos, joelhos semidobrados. Projete o quadril para trás mantendo as costas perfeitamente seladas até sentir o posterior alongar.',
    alternatives: ['exercise-pernas-05', 'exercise-costas-06'],
  },
  'exercise-pernas-07': {
    name: 'Afundo / Passada com Halteres',
    category: 'Pernas',
    type: 'halteres',
    muscleGroups: ['Quadríceps', 'Glúteos', 'Estabilizadores'],
    equipment: 'Par de Halteres',
    difficulty: 'intermediário',
    instructions: 'Dê um passo à frente flexionando ambos os joelhos até 90º. Mantenha o joelho da frente alinhado ao tornozelo e o tronco reto.',
    alternatives: ['exercise-pernas-01', 'exercise-pernas-03'],
  },
  'exercise-ombros-01': {
    name: 'Desenvolvimento Máquina',
    category: 'Ombros',
    type: 'máquina',
    muscleGroups: ['Deltoide Anterior e Lateral', 'Tríceps'],
    equipment: 'Máquina Articulada de Ombros',
    difficulty: 'iniciante',
    instructions: 'Ajuste a altura do banco para que os apoios fiquem no nível das orelhas. Empurre para cima sem travar bruscamente os cotovelos no topo.',
    alternatives: ['exercise-ombros-02', 'exercise-ombros-03'],
  },
  'exercise-ombros-02': {
    name: 'Desenvolvimento com Halteres',
    category: 'Ombros',
    type: 'halteres',
    muscleGroups: ['Deltoide Anterior', 'Deltoide Lateral', 'Trapézio'],
    equipment: 'Banco 80º-90º e Halteres',
    difficulty: 'intermediário',
    instructions: 'Sentado com as costas firmes no apoio. Eleve os halteres acima da cabeça em movimento controlado e desça até a linha das orelhas.',
    alternatives: ['exercise-ombros-01', 'exercise-ombros-03'],
  },
  'exercise-ombros-03': {
    name: 'Elevação Lateral com Halteres',
    category: 'Ombros',
    type: 'halteres',
    muscleGroups: ['Deltoide Lateral'],
    equipment: 'Halteres leves a moderados',
    difficulty: 'iniciante',
    instructions: 'Eleve os braços para os lados até a linha dos ombros, mantendo ligeira flexão de cotovelos e sem balanço do tronco.',
    alternatives: ['exercise-ombros-04', 'exercise-ombros-01'],
  },
  'exercise-ombros-04': {
    name: 'Elevação Frontal no Cabo',
    category: 'Ombros',
    type: 'cabo',
    muscleGroups: ['Deltoide Anterior'],
    equipment: 'Polia baixa e barra reta ou corda',
    difficulty: 'iniciante',
    instructions: 'Puxe o cabo à frente do corpo elevando os braços até a altura dos olhos com controle na descida.',
    alternatives: ['exercise-ombros-03', 'exercise-ombros-02'],
  },
  'exercise-biceps-01': {
    name: 'Rosca Direta com Barra W',
    category: 'Bíceps',
    type: 'barra',
    muscleGroups: ['Bíceps Braquial', 'Braquial'],
    equipment: 'Barra W e Anilhas',
    difficulty: 'iniciante',
    instructions: 'Cotovelos junto ao tronco, flexione os braços levantando a barra até contração máxima sem projetar o corpo.',
    alternatives: ['exercise-biceps-02', 'exercise-biceps-03'],
  },
  'exercise-biceps-02': {
    name: 'Rosca Alternada com Halteres',
    category: 'Bíceps',
    type: 'halteres',
    muscleGroups: ['Bíceps Braquial', 'Braquiorradial'],
    equipment: 'Par de halteres',
    difficulty: 'iniciante',
    instructions: 'Em pé ou sentado, flexione um braço por vez com supinação do punho na subida.',
    alternatives: ['exercise-biceps-01', 'exercise-biceps-03'],
  },
  'exercise-biceps-03': {
    name: 'Rosca Martelo com Halteres',
    category: 'Bíceps',
    type: 'halteres',
    muscleGroups: ['Braquiorradial', 'Braquial', 'Bíceps'],
    equipment: 'Par de halteres',
    difficulty: 'iniciante',
    instructions: 'Pegada neutra (palmas voltadas para dentro). Flexione os antebraços mantendo pegada firme durante todo o curso.',
    alternatives: ['exercise-biceps-01', 'exercise-biceps-02'],
  },
  'exercise-triceps-01': {
    name: 'Tríceps Pulley com Corda',
    category: 'Tríceps',
    type: 'cabo',
    muscleGroups: ['Tríceps (todas as cabeças)'],
    equipment: 'Polia alta com corda',
    difficulty: 'iniciante',
    instructions: 'Cotovelos firmes nas costelas. Estenda os braços para baixo abrindo as pontas da corda no final da contração.',
    alternatives: ['exercise-triceps-02', 'exercise-triceps-03'],
  },
  'exercise-triceps-02': {
    name: 'Tríceps Francês com Halter',
    category: 'Tríceps',
    type: 'halteres',
    muscleGroups: ['Tríceps (Cabeça Longa)'],
    equipment: 'Halter e banco',
    difficulty: 'intermediário',
    instructions: 'Segure o halter acima da cabeça com ambas as mãos. Flexione os cotovelos descendo o peso atrás da cabeça e retorne.',
    alternatives: ['exercise-triceps-01', 'exercise-triceps-03'],
  },
  'exercise-triceps-03': {
    name: 'Tríceps Testa com Barra W',
    category: 'Tríceps',
    type: 'barra',
    muscleGroups: ['Tríceps Braquial'],
    equipment: 'Banco plano e barra W',
    difficulty: 'intermediário',
    instructions: 'Deitado no banco, desça a barra suavemente em direção à testa mantendo os cotovelos fechados e verticais.',
    alternatives: ['exercise-triceps-01', 'exercise-triceps-02'],
  },
  'exercise-core-01': {
    name: 'Prancha Isométrica',
    category: 'Core',
    type: 'peso corporal',
    muscleGroups: ['Transverso Abdominal', 'Reto Abdominal', 'Lombar'],
    equipment: 'Colchonete',
    difficulty: 'iniciante',
    instructions: 'Apoie antebraços e pontas dos pés no solo. Mantenha linha reta da cabeça aos pés, contraindo glúteos e abdômen.',
    alternatives: ['exercise-core-02', 'exercise-core-04'],
  },
  'exercise-core-02': {
    name: 'Abdominal Supra no Solo',
    category: 'Core',
    type: 'peso corporal',
    muscleGroups: ['Reto Abdominal'],
    equipment: 'Colchonete',
    difficulty: 'iniciante',
    instructions: 'Joelhos flexionados, pés no chão. Flexione a coluna aproximando as costelas do quadril sem puxar o pescoço.',
    alternatives: ['exercise-core-01', 'exercise-core-03'],
  },
  'exercise-core-03': {
    name: 'Elevação de Pernas Suspenso',
    category: 'Core',
    type: 'peso corporal',
    muscleGroups: ['Reto Abdominal Inferior', 'Flexores do Quadril'],
    equipment: 'Barra fixa ou paralela',
    difficulty: 'avançado',
    instructions: 'Suspenso na barra, eleve os joelhos ou pernas estendidas em direção ao peito com controle e sem balançar.',
    alternatives: ['exercise-core-02', 'exercise-core-04'],
  },
  'exercise-core-04': {
    name: 'Dead Bug (Inseto Morto)',
    category: 'Core',
    type: 'peso corporal',
    muscleGroups: ['Core Profundo', 'Estabilidade Pélvica'],
    equipment: 'Colchonete',
    difficulty: 'iniciante',
    instructions: 'Deitado de barriga para cima com braços e joelhos elevados. Estenda braço oposto e perna oposta mantendo lombar colada ao chão.',
    alternatives: ['exercise-core-01', 'exercise-core-02'],
  },
};

const muscleTranslation = {
  'Chest': 'Peitoral Maior',
  'Shoulders': 'Deltoides',
  'Rear Delts': 'Deltoide Posterior',
  'Upper Back': 'Trapézio e Rombóides',
  'Posterior Chain': 'Cadeia Posterior',
  'Hamstrings': 'Isquiotibiais (Posterior)',
  'Back': 'Dorsal e Costas',
  'Lats': 'Grande Dorsal',
  'Biceps': 'Bíceps Braquial',
  'Quads': 'Quadríceps',
  'Glutes': 'Glúteos',
  'Calves': 'Panturrilhas',
  'Forearms': 'Antebraços',
  'Triceps': 'Tríceps Braquial',
  'Core': 'Abdômen e Core',
  'Legs': 'Membros Inferiores',
  'Lower Back': 'Lombar',
  'Adductors': 'Adutores da Coxa',
  'Mobility': 'Mobilidade Articular',
  'Hips': 'Flexores do Quadril'
};

const equipmentTranslation = {
  'Barbell': 'Barra Olímpica',
  'Dumbbell': 'Halteres',
  'Machine': 'Máquina Específica',
  'Cable': 'Polia / Cabo',
  'Bodyweight': 'Peso Corporal',
  'Cardio': 'Equipamento Cardio',
  'Plate': 'Anilha',
  'Kettlebell': 'Kettlebell',
  'Pull-up Bar': 'Barra Fixa',
  'Bench': 'Banco Livre',
  'Wall': 'Parede',
  'Chair': 'Cadeira / Apoio',
  'Doorway': 'Batente / Apoio',
  'Towel': 'Toalha / Elástico',
  'Box': 'Caixa / Plyo Box',
  'Stability Ball': 'Bola Suíça',
  'Resistance Band': 'Elástico Extensor'
};

function determineCategory(primaryMuscle, isStretch) {
  if (isStretch || primaryMuscle === 'Mobility') return 'Mobilidade';
  if (['Chest'].includes(primaryMuscle)) return 'Peito';
  if (['Back', 'Upper Back', 'Lats', 'Lower Back', 'Posterior Chain'].includes(primaryMuscle)) return 'Costas';
  if (['Quads', 'Hamstrings', 'Glutes', 'Calves', 'Legs', 'Adductors', 'Hips'].includes(primaryMuscle)) return 'Pernas';
  if (['Shoulders', 'Rear Delts'].includes(primaryMuscle)) return 'Ombros';
  if (['Biceps', 'Forearms'].includes(primaryMuscle)) return 'Bíceps';
  if (['Triceps'].includes(primaryMuscle)) return 'Tríceps';
  if (['Core'].includes(primaryMuscle)) return 'Core';
  return 'Mobilidade';
}

function determineType(equipment) {
  if (equipment === 'Barbell') return 'barra';
  if (equipment === 'Dumbbell') return 'halteres';
  if (equipment === 'Machine') return 'máquina';
  if (equipment === 'Cable') return 'cabo';
  if (['Bodyweight', 'Pull-up Bar', 'Wall', 'Chair', 'Doorway', 'Towel', 'Box'].includes(equipment)) return 'peso corporal';
  return 'livre';
}

function determineDifficulty(slug, equipment) {
  const advancedSlugs = ['deadlift', 'snatch', 'clean', 'muscle-up', 'typewriter', 'handstand', 'pistol', 'lever', 'dragon-flag'];
  const beginnerSlugs = ['crunch', 'plank', 'machine', 'push-up', 'curl', 'glute-bridge', 'wall', 'stretch', 'calf'];
  if (advancedSlugs.some(s => slug.includes(s))) return 'avançado';
  if (equipment === 'Machine' || beginnerSlugs.some(s => slug.includes(s))) return 'iniciante';
  return 'intermediário';
}

const framesDir = path.resolve(__dirname, '../public/exercises/frames');

const allMappedExercises = manifestList.map((item) => {
  const slug = item.slug;
  const legacyId = slugToLegacyId[slug];
  const custom = legacyId ? customDetails[legacyId] : null;

  const id = legacyId || `exercise-${slug}`;

  // Image & Video frames path: padronizado em PNG com traço suave e uniforme
  const ext = 'png';
  const imgUrl = `/exercises/frames/${slug}/frame-1.${ext}`;
  const videoFrames = [
    `/exercises/frames/${slug}/frame-1.${ext}`,
    `/exercises/frames/${slug}/frame-2.${ext}`,
    `/exercises/frames/${slug}/frame-3.${ext}`
  ];

  if (custom) {
    return {
      id,
      name: custom.name,
      category: custom.category,
      type: custom.type,
      muscleGroups: custom.muscleGroups,
      equipment: custom.equipment,
      difficulty: custom.difficulty,
      instructions: custom.instructions,
      imageUrl: imgUrl,
      videoFrames,
      alternatives: custom.alternatives
    };
  }

  const category = determineCategory(item.primaryMuscle, item.isStretch);
  const type = determineType(item.equipment);
  const difficulty = determineDifficulty(slug, item.equipment);

  const primaryPt = muscleTranslation[item.primaryMuscle] || item.primaryMuscle;
  const secPt = (item.secondaryMuscles || []).map(m => muscleTranslation[m] || m);
  const muscleGroups = [primaryPt, ...secPt].slice(0, 4);

  const equipPt = equipmentTranslation[item.equipment] || item.equipment;

  const instructions = `Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.`;

  return {
    id,
    name: item.name,
    category,
    type,
    muscleGroups,
    equipment: equipPt,
    difficulty,
    instructions,
    imageUrl: imgUrl,
    videoFrames,
    alternatives: []
  };
});

// Build alternatives for all exercises without alternatives
allMappedExercises.forEach((ex) => {
  if (!ex.alternatives || ex.alternatives.length === 0) {
    const sameCat = allMappedExercises.filter(o => o.id !== ex.id && o.category === ex.category);
    ex.alternatives = sameCat.slice(0, 3).map(o => o.id);
  }
});

console.log(`Generated ${allMappedExercises.length} exercises.`);

const fileContent = `import { Exercise } from '../types';

export const initialExercises: Exercise[] = ${JSON.stringify(allMappedExercises, null, 2)};
`;

fs.writeFileSync(path.resolve(__dirname, '../src/data/exercises.ts'), fileContent, 'utf8');
console.log('Successfully updated src/data/exercises.ts with all 302 exercises and preserved legacy IDs!');
