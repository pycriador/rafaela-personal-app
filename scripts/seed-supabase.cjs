const fs = require('fs');
const path = require('path');

// Read environment
const envPath = path.resolve(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('.env not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    env[match[1]] = (match[2] || '').trim();
  }
});

const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SECRET_KEY || env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in .env');
  process.exit(1);
}

console.log('--- SEED SUPABASE ---');
console.log('Connecting to:', SUPABASE_URL);

async function upsert(table, records) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify(records),
    });

    if (res.status === 404) {
      console.warn(`[WARN] Tabela "${table}" ainda não existe no Supabase.`);
      console.warn(`       Por favor, execute o arquivo "supabase/migrations/20260922_init_schema.sql" no SQL Editor do Supabase.`);
      return false;
    }

    if (!res.ok) {
      const err = await res.text();
      console.error(`[ERROR] Falha ao sincronizar "${table}":`, err);
      return false;
    }

    const data = await res.json();
    console.log(`[OK] Tabela "${table}": ${records.length} registro(s) sincronizados com sucesso.`);
    return true;
  } catch (err) {
    console.error(`[ERROR] Erro de rede ao sincronizar "${table}":`, err.message);
    return false;
  }
}

async function runSeed() {
  console.log('Iniciando migração de dados...');

  // Mock data definitions for initial seed
  const users = [
    {
      id: 'user-rafaela',
      name: 'Rafaela Personal',
      email: 'rafaela@personaltrainer.com',
      role: 'personal',
      phone: '(11) 98888-7777',
      avatar_url: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=150',
    },
    {
      id: 'user-mariana',
      name: 'Mariana Silva',
      email: 'mariana.silva@email.com',
      role: 'student',
      student_profile_id: 'student-mariana',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    {
      id: 'user-carlos',
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@email.com',
      role: 'student',
      student_profile_id: 'student-carlos',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    {
      id: 'user-fernanda',
      name: 'Fernanda Lima',
      email: 'fernanda.lima@email.com',
      role: 'student',
      student_profile_id: 'student-fernanda',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  ];

  const students = [
    {
      id: 'student-mariana',
      user_id: 'user-mariana',
      name: 'Mariana Silva',
      birth_date: '1995-04-12',
      gender: 'Feminino',
      phone: '(11) 99123-4567',
      email: 'mariana.silva@email.com',
      goals: ['Hipertrofia', 'Condicionamento'],
      available_days: ['Segunda', 'Quarta', 'Sexta'],
      level: 'Intermediário',
      experience: '2 anos de musculação',
      notes: 'Objetivo de fortalecimento para corrida de 10km.',
      restrictions: 'Leve desconforto no joelho direito em agachamentos profundos.',
      preferences: 'Prefere treinos dinâmicos com duração de até 50 minutos.',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status: 'Ativo',
      adherence_percentage: 95,
      last_active: 'Hoje, 09:30',
    },
    {
      id: 'student-carlos',
      user_id: 'user-carlos',
      name: 'Carlos Oliveira',
      birth_date: '1988-11-23',
      gender: 'Masculino',
      phone: '(11) 98765-4321',
      email: 'carlos.oliveira@email.com',
      goals: ['Emagrecimento', 'Saúde'],
      available_days: ['Terça', 'Quinta', 'Sábado'],
      level: 'Iniciante',
      experience: 'Sedentário há 3 anos',
      notes: 'Foco inicial em queima calórica e mobilidade articular.',
      restrictions: 'Hipertensão controlada por medicação.',
      preferences: 'Gosta de treinar pela manhã.',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      status: 'Ativo',
      adherence_percentage: 88,
      last_active: 'Ontem, 18:45',
    },
    {
      id: 'student-fernanda',
      user_id: 'user-fernanda',
      name: 'Fernanda Lima',
      birth_date: '1992-08-30',
      gender: 'Feminino',
      phone: '(11) 97654-3210',
      email: 'fernanda.lima@email.com',
      goals: ['Hipertrofia', 'Força'],
      available_days: ['Segunda', 'Terça', 'Quarta', 'Sexta'],
      level: 'Avançado',
      experience: '5 anos de musculação',
      notes: 'Preparação para teste de aptidão física.',
      restrictions: 'Nenhuma',
      preferences: 'Gosta de cargas altas com controle técnico rigoroso.',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      status: 'Ativo',
      adherence_percentage: 100,
      last_active: 'Hoje, 07:15',
    },
  ];

  // 31 Cartoon exercises from public/exercises
  const exercises = [
    {
      id: 'exercise-peito-01',
      name: 'Supino Máquina',
      category: 'Peito',
      type: 'máquina',
      muscle_groups: ['Peitoral Maior', 'Tríceps', 'Deltoide Anterior'],
      equipment: 'Máquina Convergente / Articulada',
      difficulty: 'iniciante',
      instructions: 'Ajuste o assento para que os pegadores fiquem na linha média do peito. Mantenha os pés firmes no chão, escápulas retraídas e empurre controlando a fase excêntrica.',
      image_url: '/exercises/exercise-peito-01.png',
      alternatives: ['exercise-peito-02', 'exercise-peito-04', 'exercise-peito-05'],
    },
    {
      id: 'exercise-peito-02',
      name: 'Supino Reto com Barra',
      category: 'Peito',
      type: 'barra',
      muscle_groups: ['Peitoral Maior', 'Tríceps', 'Deltoide Anterior'],
      equipment: 'Banco Reto e Barra Olímpica',
      difficulty: 'intermediário',
      instructions: 'Deite com os olhos alinhados à barra. Pegada ligeiramente mais larga que os ombros. Desça a barra controladamente até o terço médio do esterno e empurre.',
      image_url: '/exercises/exercise-peito-02.png',
      alternatives: ['exercise-peito-01', 'exercise-peito-03'],
    },
    {
      id: 'exercise-peito-03',
      name: 'Supino Inclinado com Halteres',
      category: 'Peito',
      type: 'halteres',
      muscle_groups: ['Peitoral Superior', 'Deltoide Anterior', 'Tríceps'],
      equipment: 'Banco Inclinado (30º-45º) e Halteres',
      difficulty: 'intermediário',
      instructions: 'Com o banco em inclinação de 30 a 45 graus, empurre os halteres para cima convergindo levemente no topo sem bater os pesos.',
      image_url: '/exercises/exercise-peito-03.png',
      alternatives: ['exercise-peito-01', 'exercise-peito-02'],
    },
    {
      id: 'exercise-peito-04',
      name: 'Crucifixo com Halteres',
      category: 'Peito',
      type: 'halteres',
      muscle_groups: ['Peitoral Maior'],
      equipment: 'Banco Reto e Halteres',
      difficulty: 'intermediário',
      instructions: 'Com leve flexão nos cotovelos, abra os braços em arco até sentir o alongamento peitoral seguro. Retorne contraindo o peitoral.',
      image_url: '/exercises/exercise-peito-04.png',
      alternatives: ['exercise-peito-01', 'exercise-peito-05'],
    },
    {
      id: 'exercise-peito-05',
      name: 'Flexão de Braço',
      category: 'Peito',
      type: 'peso corporal',
      muscle_groups: ['Peitoral', 'Tríceps', 'Core'],
      equipment: 'Peso corporal',
      difficulty: 'iniciante',
      instructions: 'Mãos no chão afastadas na largura dos ombros, corpo alinhado da cabeça aos calcanhares. Desça o peito próximo ao solo mantendo o abdômen contraído.',
      image_url: '/exercises/exercise-peito-05.png',
      alternatives: ['exercise-peito-01', 'exercise-peito-02'],
    },
    {
      id: 'exercise-costas-01',
      name: 'Puxada Frontal no Pulley',
      category: 'Costas',
      type: 'cabo',
      muscle_groups: ['Grande Dorsal', 'Redondo Maior', 'Bíceps'],
      equipment: 'Pulley com Barra Longa',
      difficulty: 'iniciante',
      instructions: 'Pegada pronada aberta. Puxe a barra em direção à clavícula superior, estufando o peito e aproximando as escápulas.',
      image_url: '/exercises/exercise-costas-01.png',
      alternatives: ['exercise-costas-02', 'exercise-costas-05'],
    },
    {
      id: 'exercise-costas-02',
      name: 'Remada Máquina',
      category: 'Costas',
      type: 'máquina',
      muscle_groups: ['Grande Dorsal', 'Romboides', 'Trapézio Médio'],
      equipment: 'Máquina de Remada',
      difficulty: 'iniciante',
      instructions: 'Apoie o peito no acolchoado, ajuste a pegada e puxe cotovelos para trás mantendo os ombros longe das orelhas.',
      image_url: '/exercises/exercise-costas-02.png',
      alternatives: ['exercise-costas-03', 'exercise-costas-04'],
    },
    {
      id: 'exercise-costas-03',
      name: 'Remada Curvada com Barra',
      category: 'Costas',
      type: 'barra',
      muscle_groups: ['Grande Dorsal', 'Trapézio', 'Eretores da Espinha'],
      equipment: 'Barra Olímpica e Anilhas',
      difficulty: 'avançado',
      instructions: 'Tronco inclinado a aproximadamente 45 graus, coluna neutra. Puxe a barra em direção ao umbigo mantendo estabilidade.',
      image_url: '/exercises/exercise-costas-03.png',
      alternatives: ['exercise-costas-02', 'exercise-costas-04'],
    },
    {
      id: 'exercise-costas-04',
      name: 'Remada Unilateral com Halter (Serrote)',
      category: 'Costas',
      type: 'halteres',
      muscle_groups: ['Grande Dorsal', 'Romboides'],
      equipment: 'Banco Plano e Halter',
      difficulty: 'intermediário',
      instructions: 'Apoie um joelho e mão no banco. Puxe o halter trazendo o cotovelo para cima e rente ao tronco.',
      image_url: '/exercises/exercise-costas-04.png',
      alternatives: ['exercise-costas-02', 'exercise-costas-03'],
    },
    {
      id: 'exercise-costas-05',
      name: 'Barra Fixa (Pull-up)',
      category: 'Costas',
      type: 'peso corporal',
      muscle_groups: ['Grande Dorsal', 'Bíceps', 'Core'],
      equipment: 'Barra Fixa',
      difficulty: 'avançado',
      instructions: 'Pegada pronada aberta. Puxe o corpo até o queixo ultrapassar a linha da barra, controlando a descida.',
      image_url: '/exercises/exercise-costas-05.png',
      alternatives: ['exercise-costas-01', 'exercise-costas-02'],
    },
    {
      id: 'exercise-pernas-01',
      name: 'Leg Press 45º',
      category: 'Pernas',
      type: 'máquina',
      muscle_groups: ['Quadríceps', 'Glúteos', 'Isquiotibiais'],
      equipment: 'Aparelho Leg Press 45º',
      difficulty: 'iniciante',
      instructions: 'Pés na largura dos ombros na plataforma. Destrave a máquina e flexione os joelhos a 90 graus sem descolar o quadril do banco.',
      image_url: '/exercises/exercise-pernas-01.png',
      alternatives: ['exercise-pernas-02', 'exercise-pernas-03'],
    },
    {
      id: 'exercise-pernas-02',
      name: 'Agachamento Livre com Barra',
      category: 'Pernas',
      type: 'barra',
      muscle_groups: ['Quadríceps', 'Glúteos', 'Core', 'Eretores'],
      equipment: 'Gaiola de Agachamento e Barra Olímpica',
      difficulty: 'avançado',
      instructions: 'Barra apoiada no trapézio superior. Desça jogando o quadril para trás até as coxas ficarem paralelas ao chão.',
      image_url: '/exercises/exercise-pernas-02.png',
      alternatives: ['exercise-pernas-01', 'exercise-pernas-03'],
    },
    {
      id: 'exercise-pernas-03',
      name: 'Cadeira Extensora',
      category: 'Pernas',
      type: 'máquina',
      muscle_groups: ['Quadríceps'],
      equipment: 'Cadeira Extensora',
      difficulty: 'iniciante',
      instructions: 'Ajuste o encosto para o joelho coincidir com o eixo da máquina. Estenda as pernas controlando o movimento sem hiperestender bruscamente.',
      image_url: '/exercises/exercise-pernas-03.png',
      alternatives: ['exercise-pernas-01'],
    },
    {
      id: 'exercise-pernas-04',
      name: 'Mesa Flexora',
      category: 'Pernas',
      type: 'máquina',
      muscle_groups: ['Isquiotibiais'],
      equipment: 'Mesa Flexora Deitada',
      difficulty: 'iniciante',
      instructions: 'Deitado de bruços, almofada logo acima dos calcanhares. Flexione os joelhos puxando os calcanhares em direção aos glúteos.',
      image_url: '/exercises/exercise-pernas-04.png',
      alternatives: ['exercise-pernas-05'],
    },
    {
      id: 'exercise-pernas-05',
      name: 'Stiff com Halteres',
      category: 'Pernas',
      type: 'halteres',
      muscle_groups: ['Isquiotibiais', 'Glúteos', 'Lombar'],
      equipment: 'Par de Halteres',
      difficulty: 'intermediário',
      instructions: 'Pés na largura do quadril, joelhos semi-flexionados fixos. Incline o tronco à frente mantendo a coluna alinhada.',
      image_url: '/exercises/exercise-pernas-05.png',
      alternatives: ['exercise-pernas-04'],
    },
    {
      id: 'exercise-ombros-01',
      name: 'Desenvolvimento Máquina',
      category: 'Ombros',
      type: 'máquina',
      muscle_groups: ['Deltoide Anterior', 'Deltoide Médio', 'Tríceps'],
      equipment: 'Máquina Articulada de Ombros',
      difficulty: 'iniciante',
      instructions: 'Ajuste o assento para os pegadores ficarem na altura das orelhas. Empurre para cima com movimento fluído e desça sem bater os pesos.',
      image_url: '/exercises/exercise-ombros-01.png',
      alternatives: ['exercise-ombros-02', 'exercise-ombros-03'],
    },
    {
      id: 'exercise-ombros-02',
      name: 'Desenvolvimento com Halteres',
      category: 'Ombros',
      type: 'halteres',
      muscle_groups: ['Deltoide Anterior', 'Deltoide Médio', 'Tríceps'],
      equipment: 'Banco 90º e Halteres',
      difficulty: 'intermediário',
      instructions: 'Sentado com as costas apoiadas, empurre os halteres para cima acima da cabeça controlando o equilíbrio.',
      image_url: '/exercises/exercise-ombros-02.png',
      alternatives: ['exercise-ombros-01', 'exercise-ombros-03'],
    },
    {
      id: 'exercise-ombros-03',
      name: 'Elevação Lateral com Halteres',
      category: 'Ombros',
      type: 'halteres',
      muscle_groups: ['Deltoide Lateral'],
      equipment: 'Par de Halteres',
      difficulty: 'iniciante',
      instructions: 'Em pé, leve flexão nos cotovelos. Eleve os braços lateralmente até a altura dos ombros com os cotovelos liderando o movimento.',
      image_url: '/exercises/exercise-ombros-03.png',
      alternatives: ['exercise-ombros-04'],
    },
    {
      id: 'exercise-ombros-04',
      name: 'Elevação Lateral no Cabo (Polia)',
      category: 'Ombros',
      type: 'cabo',
      muscle_groups: ['Deltoide Lateral'],
      equipment: 'Crossover com Polia Baixa',
      difficulty: 'intermediário',
      instructions: 'Com a polia na altura do tornozelo, puxe a manopla lateralmente mantendo tensão contínua em todo o arco.',
      image_url: '/exercises/exercise-ombros-04.png',
      alternatives: ['exercise-ombros-03'],
    },
    {
      id: 'exercise-biceps-01',
      name: 'Rosca Direta com Barra W',
      category: 'Bíceps',
      type: 'barra',
      muscle_groups: ['Bíceps Braquial', 'Braquial'],
      equipment: 'Barra W e Anilhas',
      difficulty: 'iniciante',
      instructions: 'Em pé, coluna ereta e cotovelos colados ao tronco. Flexione os cotovelos erguendo a barra até a altura do peito sem balançar o corpo.',
      image_url: '/exercises/exercise-biceps-01.png',
      alternatives: ['exercise-biceps-02', 'exercise-biceps-03'],
    },
    {
      id: 'exercise-biceps-02',
      name: 'Rosca Alternada com Halteres',
      category: 'Bíceps',
      type: 'halteres',
      muscle_groups: ['Bíceps Braquial', 'Braquiorradial'],
      equipment: 'Par de Halteres',
      difficulty: 'iniciante',
      instructions: 'Sentado ou em pé, flexione um braço de cada vez realizando a supinação (palma virada para cima) durante a subida.',
      image_url: '/exercises/exercise-biceps-02.png',
      alternatives: ['exercise-biceps-01', 'exercise-biceps-03'],
    },
    {
      id: 'exercise-biceps-03',
      name: 'Rosca Martelo com Halteres',
      category: 'Bíceps',
      type: 'halteres',
      muscle_groups: ['Braquial', 'Braquiorradial', 'Bíceps'],
      equipment: 'Par de Halteres',
      difficulty: 'iniciante',
      instructions: 'Pegada neutra (palmas voltadas uma para a outra). Flexione os cotovelos mantendo os polegares apontados para cima.',
      image_url: '/exercises/exercise-biceps-03.png',
      alternatives: ['exercise-biceps-01', 'exercise-biceps-02'],
    },
    {
      id: 'exercise-triceps-01',
      name: 'Tríceps Pulley com Barra Reta',
      category: 'Tríceps',
      type: 'cabo',
      muscle_groups: ['Tríceps Braquial (Cabeça Lateral e Medial)'],
      equipment: 'Polia Alta e Barra Reta Curta',
      difficulty: 'iniciante',
      instructions: 'Cotovelos fixos ao lado do corpo. Empurre a barra para baixo estendendo os cotovelos totalmente e segure 1 segundo em contração.',
      image_url: '/exercises/exercise-triceps-01.png',
      alternatives: ['exercise-triceps-02', 'exercise-triceps-03'],
    },
    {
      id: 'exercise-triceps-02',
      name: 'Tríceps Corda no Pulley',
      category: 'Tríceps',
      type: 'cabo',
      muscle_groups: ['Tríceps Braquial'],
      equipment: 'Polia Alta e Corda Tríceps',
      difficulty: 'iniciante',
      instructions: 'Empurre a corda para baixo abrindo as pontas no final do movimento para contração máxima da cabeça lateral do tríceps.',
      image_url: '/exercises/exercise-triceps-02.png',
      alternatives: ['exercise-triceps-01', 'exercise-triceps-03'],
    },
    {
      id: 'exercise-triceps-03',
      name: 'Tríceps Testa com Barra W',
      category: 'Tríceps',
      type: 'barra',
      muscle_groups: ['Tríceps Braquial (Cabeça Longa)'],
      equipment: 'Banco Plano e Barra W',
      difficulty: 'intermediário',
      instructions: 'Deitado no banco, braços estendidos verticalmente. Flexione os cotovelos levando a barra em direção à testa e estenda.',
      image_url: '/exercises/exercise-triceps-03.png',
      alternatives: ['exercise-triceps-01', 'exercise-triceps-04'],
    },
    {
      id: 'exercise-triceps-04',
      name: 'Tríceps Francês com Halter',
      category: 'Tríceps',
      type: 'halteres',
      muscle_groups: ['Tríceps Braquial (Cabeça Longa)'],
      equipment: 'Banco e Halter Único',
      difficulty: 'intermediário',
      instructions: 'Sentado, segure um halter com ambas as mãos atrás da cabeça. Estenda os braços para cima mantendo os cotovelos fechados.',
      image_url: '/exercises/exercise-triceps-04.png',
      alternatives: ['exercise-triceps-01', 'exercise-triceps-03'],
    },
    {
      id: 'exercise-core-01',
      name: 'Prancha Isométrica',
      category: 'Core',
      type: 'peso corporal',
      muscle_groups: ['Transverso Abdominal', 'Reto Abdominal', 'Lombar'],
      equipment: 'Colchonete',
      difficulty: 'iniciante',
      instructions: 'Apoie os antebraços e pontas dos pés no chão. Mantenha o corpo em linha reta da cabeça aos calcanhares sem elevar ou curvar o quadril.',
      image_url: '/exercises/exercise-core-01.png',
      alternatives: ['exercise-core-02', 'exercise-core-03'],
    },
    {
      id: 'exercise-core-02',
      name: 'Abdominal Crunch no Solo',
      category: 'Core',
      type: 'peso corporal',
      muscle_groups: ['Reto Abdominal'],
      equipment: 'Colchonete',
      difficulty: 'iniciante',
      instructions: 'Deitado com joelhos flexionados e pés no chão. Eleve as escápulas do chão contraindo o abdômen sem puxar o pescoço.',
      image_url: '/exercises/exercise-core-02.png',
      alternatives: ['exercise-core-01', 'exercise-core-03'],
    },
    {
      id: 'exercise-core-03',
      name: 'Abdominal na Polia (Crunch ajoelhado)',
      category: 'Core',
      type: 'cabo',
      muscle_groups: ['Reto Abdominal', 'Oblíquos'],
      equipment: 'Polia Alta e Corda',
      difficulty: 'intermediário',
      instructions: 'Ajoelhado de frente ou de costas para a máquina, segure a corda próxima às têmporas e flexione a coluna em direção ao solo.',
      image_url: '/exercises/exercise-core-03.png',
      alternatives: ['exercise-core-01', 'exercise-core-02'],
    },
    {
      id: 'exercise-core-04',
      name: 'Elevação de Pernas Suspenso',
      category: 'Core',
      type: 'peso corporal',
      muscle_groups: ['Reto Abdominal Inferior', 'Flexores do Quadril'],
      equipment: 'Barra Fixa ou Paralela com Apoio',
      difficulty: 'avançado',
      instructions: 'Suspenso pela barra, eleve as pernas retas ou dobradas até a linha do quadril sem balançar o corpo com impulso.',
      image_url: '/exercises/exercise-core-04.png',
      alternatives: ['exercise-core-01', 'exercise-core-02'],
    },
    {
      id: 'exercise-core-05',
      name: 'Russian Twist (Giro Russo)',
      category: 'Core',
      type: 'peso corporal',
      muscle_groups: ['Oblíquos', 'Core'],
      equipment: 'Colchonete e Anilha/Medicine Ball opcional',
      difficulty: 'intermediário',
      instructions: 'Sentado com tronco inclinado para trás e pés elevados. Gire o tronco de um lado para o outro de forma controlada.',
      image_url: '/exercises/exercise-core-05.png',
      alternatives: ['exercise-core-01', 'exercise-core-03'],
    },
  ];

  await upsert('users', users);
  await upsert('students', students);
  await upsert('exercises', exercises);

  console.log('--- SEED CONCLUÍDO ---');
}

runSeed();
