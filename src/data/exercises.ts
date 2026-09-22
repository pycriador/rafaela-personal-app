import { Exercise } from '../types';

export const initialExercises: Exercise[] = [
  {
    "id": "exercise-peito-02",
    "name": "Supino Reto com Barra",
    "category": "Peito",
    "type": "barra",
    "muscleGroups": [
      "Peitoral Maior",
      "Tríceps",
      "Deltoide Anterior"
    ],
    "equipment": "Banco Reto e Barra Olímpica",
    "difficulty": "intermediário",
    "instructions": "Deite com os olhos alinhados à barra. Pegada ligeiramente mais larga que os ombros. Desça a barra controladamente até o terço médio do esterno e empurre.",
    "imageUrl": "/exercises/frames/bench-press/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/bench-press/frame-1.svg",
      "/exercises/frames/bench-press/frame-2.svg",
      "/exercises/frames/bench-press/frame-3.svg"
    ],
    "alternatives": [
      "exercise-peito-01",
      "exercise-peito-03"
    ]
  },
  {
    "id": "exercise-incline-bench-press",
    "name": "Incline Bench Press",
    "category": "Peito",
    "type": "barra",
    "muscleGroups": [
      "Peitoral Maior",
      "Deltoides",
      "Tríceps Braquial"
    ],
    "equipment": "Barra Olímpica",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/incline-bench-press/frame-1.png",
    "videoFrames": [
      "/exercises/frames/incline-bench-press/frame-1.png",
      "/exercises/frames/incline-bench-press/frame-2.png",
      "/exercises/frames/incline-bench-press/frame-3.png"
    ],
    "alternatives": [
      "exercise-peito-02",
      "exercise-peito-03",
      "exercise-dumbbell-bench-press"
    ]
  },
  {
    "id": "exercise-peito-03",
    "name": "Supino Inclinado com Halteres",
    "category": "Peito",
    "type": "halteres",
    "muscleGroups": [
      "Peitoral Superior",
      "Deltoide Anterior",
      "Tríceps"
    ],
    "equipment": "Banco Inclinado (30º-45º) e Halteres",
    "difficulty": "intermediário",
    "instructions": "Com o banco em inclinação de 30 a 45 graus, empurre os halteres para cima convergindo levemente no topo sem bater os pesos.",
    "imageUrl": "/exercises/frames/incline-dumbbell-press/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/incline-dumbbell-press/frame-1.svg",
      "/exercises/frames/incline-dumbbell-press/frame-2.svg",
      "/exercises/frames/incline-dumbbell-press/frame-3.svg"
    ],
    "alternatives": [
      "exercise-peito-02",
      "exercise-peito-04"
    ]
  },
  {
    "id": "exercise-dumbbell-bench-press",
    "name": "Dumbbell Bench Press",
    "category": "Peito",
    "type": "halteres",
    "muscleGroups": [
      "Peitoral Maior",
      "Tríceps Braquial",
      "Deltoides"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/dumbbell-bench-press/frame-1.png",
    "videoFrames": [
      "/exercises/frames/dumbbell-bench-press/frame-1.png",
      "/exercises/frames/dumbbell-bench-press/frame-2.png",
      "/exercises/frames/dumbbell-bench-press/frame-3.png"
    ],
    "alternatives": [
      "exercise-peito-02",
      "exercise-incline-bench-press",
      "exercise-peito-03"
    ]
  },
  {
    "id": "exercise-decline-bench-press",
    "name": "Decline Bench Press",
    "category": "Peito",
    "type": "barra",
    "muscleGroups": [
      "Peitoral Maior",
      "Tríceps Braquial",
      "Deltoides"
    ],
    "equipment": "Barra Olímpica",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/decline-bench-press/frame-1.png",
    "videoFrames": [
      "/exercises/frames/decline-bench-press/frame-1.png",
      "/exercises/frames/decline-bench-press/frame-2.png",
      "/exercises/frames/decline-bench-press/frame-3.png"
    ],
    "alternatives": [
      "exercise-peito-02",
      "exercise-incline-bench-press",
      "exercise-peito-03"
    ]
  },
  {
    "id": "exercise-peito-01",
    "name": "Supino Máquina",
    "category": "Peito",
    "type": "máquina",
    "muscleGroups": [
      "Peitoral Maior",
      "Tríceps",
      "Deltoide Anterior"
    ],
    "equipment": "Máquina Convergente / Articulada",
    "difficulty": "iniciante",
    "instructions": "Ajuste o assento para que os pegadores fiquem na linha média do peito. Mantenha os pés firmes no chão, escápulas retraídas e empurre controlando a fase excêntrica.",
    "imageUrl": "/exercises/frames/machine-chest-press/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/machine-chest-press/frame-1.svg",
      "/exercises/frames/machine-chest-press/frame-2.svg",
      "/exercises/frames/machine-chest-press/frame-3.svg"
    ],
    "alternatives": [
      "exercise-peito-02",
      "exercise-peito-04",
      "exercise-peito-05"
    ]
  },
  {
    "id": "exercise-pec-deck",
    "name": "Pec Deck",
    "category": "Peito",
    "type": "máquina",
    "muscleGroups": [
      "Peitoral Maior",
      "Deltoides"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/pec-deck/frame-1.png",
    "videoFrames": [
      "/exercises/frames/pec-deck/frame-1.png",
      "/exercises/frames/pec-deck/frame-2.png",
      "/exercises/frames/pec-deck/frame-3.png"
    ],
    "alternatives": [
      "exercise-peito-02",
      "exercise-incline-bench-press",
      "exercise-peito-03"
    ]
  },
  {
    "id": "exercise-cable-fly",
    "name": "Cable Fly",
    "category": "Peito",
    "type": "cabo",
    "muscleGroups": [
      "Peitoral Maior",
      "Deltoides"
    ],
    "equipment": "Polia / Cabo",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/cable-fly/frame-1.png",
    "videoFrames": [
      "/exercises/frames/cable-fly/frame-1.png",
      "/exercises/frames/cable-fly/frame-2.png",
      "/exercises/frames/cable-fly/frame-3.png"
    ],
    "alternatives": [
      "exercise-peito-02",
      "exercise-incline-bench-press",
      "exercise-peito-03"
    ]
  },
  {
    "id": "exercise-peito-05",
    "name": "Flexão de Braço",
    "category": "Peito",
    "type": "peso corporal",
    "muscleGroups": [
      "Peitoral Maior",
      "Tríceps",
      "Core"
    ],
    "equipment": "Peso Corporal (Chão)",
    "difficulty": "iniciante",
    "instructions": "Mantenha o corpo em linha reta e abdômen contraído. Desça o peito próximo ao solo mantendo cotovelos em aproximadamente 45º do tronco.",
    "imageUrl": "/exercises/frames/push-up/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/push-up/frame-1.svg",
      "/exercises/frames/push-up/frame-2.svg",
      "/exercises/frames/push-up/frame-3.svg"
    ],
    "alternatives": [
      "exercise-peito-01",
      "exercise-peito-02"
    ]
  },
  {
    "id": "exercise-weighted-push-up",
    "name": "Weighted Push-up",
    "category": "Peito",
    "type": "peso corporal",
    "muscleGroups": [
      "Peitoral Maior",
      "Tríceps Braquial",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/weighted-push-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/weighted-push-up/frame-1.png",
      "/exercises/frames/weighted-push-up/frame-2.png",
      "/exercises/frames/weighted-push-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-peito-02",
      "exercise-incline-bench-press",
      "exercise-peito-03"
    ]
  },
  {
    "id": "exercise-overhead-press",
    "name": "Overhead Press",
    "category": "Ombros",
    "type": "barra",
    "muscleGroups": [
      "Deltoides",
      "Tríceps Braquial"
    ],
    "equipment": "Barra Olímpica",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/overhead-press/frame-1.png",
    "videoFrames": [
      "/exercises/frames/overhead-press/frame-1.png",
      "/exercises/frames/overhead-press/frame-2.png",
      "/exercises/frames/overhead-press/frame-3.png"
    ],
    "alternatives": [
      "exercise-ombros-02",
      "exercise-arnold-press",
      "exercise-ombros-03"
    ]
  },
  {
    "id": "exercise-ombros-02",
    "name": "Desenvolvimento com Halteres",
    "category": "Ombros",
    "type": "halteres",
    "muscleGroups": [
      "Deltoide Anterior",
      "Deltoide Lateral",
      "Trapézio"
    ],
    "equipment": "Banco 80º-90º e Halteres",
    "difficulty": "intermediário",
    "instructions": "Sentado com as costas firmes no apoio. Eleve os halteres acima da cabeça em movimento controlado e desça até a linha das orelhas.",
    "imageUrl": "/exercises/frames/seated-dumbbell-press/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/seated-dumbbell-press/frame-1.svg",
      "/exercises/frames/seated-dumbbell-press/frame-2.svg",
      "/exercises/frames/seated-dumbbell-press/frame-3.svg"
    ],
    "alternatives": [
      "exercise-ombros-01",
      "exercise-ombros-03"
    ]
  },
  {
    "id": "exercise-arnold-press",
    "name": "Arnold Press",
    "category": "Ombros",
    "type": "halteres",
    "muscleGroups": [
      "Deltoides",
      "Tríceps Braquial"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/arnold-press/frame-1.png",
    "videoFrames": [
      "/exercises/frames/arnold-press/frame-1.png",
      "/exercises/frames/arnold-press/frame-2.png",
      "/exercises/frames/arnold-press/frame-3.png"
    ],
    "alternatives": [
      "exercise-overhead-press",
      "exercise-ombros-02",
      "exercise-ombros-03"
    ]
  },
  {
    "id": "exercise-ombros-03",
    "name": "Elevação Lateral com Halteres",
    "category": "Ombros",
    "type": "halteres",
    "muscleGroups": [
      "Deltoide Lateral"
    ],
    "equipment": "Halteres leves a moderados",
    "difficulty": "iniciante",
    "instructions": "Eleve os braços para os lados até a linha dos ombros, mantendo ligeira flexão de cotovelos e sem balanço do tronco.",
    "imageUrl": "/exercises/frames/lateral-raise/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/lateral-raise/frame-1.svg",
      "/exercises/frames/lateral-raise/frame-2.svg",
      "/exercises/frames/lateral-raise/frame-3.svg"
    ],
    "alternatives": [
      "exercise-ombros-04",
      "exercise-ombros-01"
    ]
  },
  {
    "id": "exercise-cable-lateral-raise",
    "name": "Cable Lateral Raise",
    "category": "Ombros",
    "type": "cabo",
    "muscleGroups": [
      "Deltoides",
      "Trapézio e Rombóides"
    ],
    "equipment": "Polia / Cabo",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/cable-lateral-raise/frame-1.png",
    "videoFrames": [
      "/exercises/frames/cable-lateral-raise/frame-1.png",
      "/exercises/frames/cable-lateral-raise/frame-2.png",
      "/exercises/frames/cable-lateral-raise/frame-3.png"
    ],
    "alternatives": [
      "exercise-overhead-press",
      "exercise-ombros-02",
      "exercise-arnold-press"
    ]
  },
  {
    "id": "exercise-front-raise",
    "name": "Front Raise",
    "category": "Ombros",
    "type": "halteres",
    "muscleGroups": [
      "Deltoides",
      "Peitoral Maior"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/front-raise/frame-1.png",
    "videoFrames": [
      "/exercises/frames/front-raise/frame-1.png",
      "/exercises/frames/front-raise/frame-2.png",
      "/exercises/frames/front-raise/frame-3.png"
    ],
    "alternatives": [
      "exercise-overhead-press",
      "exercise-ombros-02",
      "exercise-arnold-press"
    ]
  },
  {
    "id": "exercise-rear-delt-fly",
    "name": "Rear Delt Fly",
    "category": "Ombros",
    "type": "halteres",
    "muscleGroups": [
      "Deltoide Posterior",
      "Trapézio e Rombóides"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/rear-delt-fly/frame-1.png",
    "videoFrames": [
      "/exercises/frames/rear-delt-fly/frame-1.png",
      "/exercises/frames/rear-delt-fly/frame-2.png",
      "/exercises/frames/rear-delt-fly/frame-3.png"
    ],
    "alternatives": [
      "exercise-overhead-press",
      "exercise-ombros-02",
      "exercise-arnold-press"
    ]
  },
  {
    "id": "exercise-reverse-pec-deck",
    "name": "Reverse Pec Deck",
    "category": "Ombros",
    "type": "máquina",
    "muscleGroups": [
      "Deltoide Posterior",
      "Trapézio e Rombóides"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/reverse-pec-deck/frame-1.png",
    "videoFrames": [
      "/exercises/frames/reverse-pec-deck/frame-1.png",
      "/exercises/frames/reverse-pec-deck/frame-2.png",
      "/exercises/frames/reverse-pec-deck/frame-3.png"
    ],
    "alternatives": [
      "exercise-overhead-press",
      "exercise-ombros-02",
      "exercise-arnold-press"
    ]
  },
  {
    "id": "exercise-face-pull",
    "name": "Face Pull",
    "category": "Costas",
    "type": "cabo",
    "muscleGroups": [
      "Trapézio e Rombóides",
      "Deltoide Posterior",
      "Deltoides"
    ],
    "equipment": "Polia / Cabo",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/face-pull/frame-1.png",
    "videoFrames": [
      "/exercises/frames/face-pull/frame-1.png",
      "/exercises/frames/face-pull/frame-2.png",
      "/exercises/frames/face-pull/frame-3.png"
    ],
    "alternatives": [
      "exercise-costas-06",
      "exercise-costas-03",
      "exercise-t-bar-row"
    ]
  },
  {
    "id": "exercise-upright-row",
    "name": "Upright Row",
    "category": "Ombros",
    "type": "barra",
    "muscleGroups": [
      "Deltoides",
      "Trapézio e Rombóides",
      "Bíceps Braquial"
    ],
    "equipment": "Barra Olímpica",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/upright-row/frame-1.png",
    "videoFrames": [
      "/exercises/frames/upright-row/frame-1.png",
      "/exercises/frames/upright-row/frame-2.png",
      "/exercises/frames/upright-row/frame-3.png"
    ],
    "alternatives": [
      "exercise-overhead-press",
      "exercise-ombros-02",
      "exercise-arnold-press"
    ]
  },
  {
    "id": "exercise-costas-06",
    "name": "Levantamento Terra Convencional",
    "category": "Costas",
    "type": "barra",
    "muscleGroups": [
      "Isquiotibiais",
      "Glúteos",
      "Lombar",
      "Trapézio",
      "Dorsal"
    ],
    "equipment": "Barra Olímpica e Anilhas",
    "difficulty": "avançado",
    "instructions": "Pés na largura do quadril, coluna neutra. Puxe a barra rente às canelas, estendendo quadril e joelhos sincronizadamente. Trave no topo sem hiperextender a lombar.",
    "imageUrl": "/exercises/frames/deadlift/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/deadlift/frame-1.svg",
      "/exercises/frames/deadlift/frame-2.svg",
      "/exercises/frames/deadlift/frame-3.svg"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-pernas-06",
    "name": "Stiff com Barra / Halteres",
    "category": "Pernas",
    "type": "barra",
    "muscleGroups": [
      "Isquiotibiais",
      "Glúteo Máximo",
      "Lombar"
    ],
    "equipment": "Barra ou Par de Halteres",
    "difficulty": "intermediário",
    "instructions": "Pés paralelos, joelhos semidobrados. Projete o quadril para trás mantendo as costas perfeitamente seladas até sentir o posterior alongar.",
    "imageUrl": "/exercises/frames/romanian-deadlift/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/romanian-deadlift/frame-1.svg",
      "/exercises/frames/romanian-deadlift/frame-2.svg",
      "/exercises/frames/romanian-deadlift/frame-3.svg"
    ],
    "alternatives": [
      "exercise-pernas-05",
      "exercise-costas-06"
    ]
  },
  {
    "id": "exercise-costas-03",
    "name": "Remada Curvada com Barra",
    "category": "Costas",
    "type": "barra",
    "muscleGroups": [
      "Latíssimo do Dorso",
      "Eretores da Espinha",
      "Trapézio"
    ],
    "equipment": "Barra Olímpica e Anilhas",
    "difficulty": "avançado",
    "instructions": "Incline o tronco a cerca de 45º mantendo coluna neutra. Puxe a barra até a região do umbigo, contraindo as costas.",
    "imageUrl": "/exercises/frames/barbell-row/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/barbell-row/frame-1.svg",
      "/exercises/frames/barbell-row/frame-2.svg",
      "/exercises/frames/barbell-row/frame-3.svg"
    ],
    "alternatives": [
      "exercise-costas-02",
      "exercise-costas-04"
    ]
  },
  {
    "id": "exercise-t-bar-row",
    "name": "T-Bar Row",
    "category": "Costas",
    "type": "máquina",
    "muscleGroups": [
      "Dorsal e Costas",
      "Bíceps Braquial",
      "Deltoide Posterior"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/t-bar-row/frame-1.png",
    "videoFrames": [
      "/exercises/frames/t-bar-row/frame-1.png",
      "/exercises/frames/t-bar-row/frame-2.png",
      "/exercises/frames/t-bar-row/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-dumbbell-bent-over-row",
    "name": "Dumbbell Bent Over Row",
    "category": "Costas",
    "type": "halteres",
    "muscleGroups": [
      "Dorsal e Costas",
      "Bíceps Braquial",
      "Deltoide Posterior"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/dumbbell-bent-over-row/frame-1.png",
    "videoFrames": [
      "/exercises/frames/dumbbell-bent-over-row/frame-1.png",
      "/exercises/frames/dumbbell-bent-over-row/frame-2.png",
      "/exercises/frames/dumbbell-bent-over-row/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-costas-04",
    "name": "Remada Unilateral com Halter (Serrote)",
    "category": "Costas",
    "type": "halteres",
    "muscleGroups": [
      "Latíssimo do Dorso",
      "Rombóides",
      "Bíceps"
    ],
    "equipment": "Banco Plano e Halter",
    "difficulty": "intermediário",
    "instructions": "Apoie um joelho e mão no banco. Com o outro lado, puxe o halter em direção ao quadril mantendo as costas retas e cotovelo colado.",
    "imageUrl": "/exercises/frames/one-arm-dumbbell-row/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/one-arm-dumbbell-row/frame-1.svg",
      "/exercises/frames/one-arm-dumbbell-row/frame-2.svg",
      "/exercises/frames/one-arm-dumbbell-row/frame-3.svg"
    ],
    "alternatives": [
      "exercise-costas-02",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-chest-supported-row",
    "name": "Chest Supported Row",
    "category": "Costas",
    "type": "máquina",
    "muscleGroups": [
      "Dorsal e Costas",
      "Bíceps Braquial",
      "Deltoide Posterior"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/chest-supported-row/frame-1.png",
    "videoFrames": [
      "/exercises/frames/chest-supported-row/frame-1.png",
      "/exercises/frames/chest-supported-row/frame-2.png",
      "/exercises/frames/chest-supported-row/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-seated-row",
    "name": "Seated Cable Row",
    "category": "Costas",
    "type": "cabo",
    "muscleGroups": [
      "Dorsal e Costas",
      "Bíceps Braquial",
      "Deltoide Posterior"
    ],
    "equipment": "Polia / Cabo",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/seated-row/frame-1.png",
    "videoFrames": [
      "/exercises/frames/seated-row/frame-1.png",
      "/exercises/frames/seated-row/frame-2.png",
      "/exercises/frames/seated-row/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-costas-02",
    "name": "Remada Máquina Sentada",
    "category": "Costas",
    "type": "máquina",
    "muscleGroups": [
      "Rombóides",
      "Trapézio Médio",
      "Latíssimo do Dorso"
    ],
    "equipment": "Máquina Articulada de Remada",
    "difficulty": "iniciante",
    "instructions": "Ajuste o apoio do peito. Puxe os pegadores retraindo as escápulas ao final e expire. Controle o retorno sem arredondar os ombros.",
    "imageUrl": "/exercises/frames/machine-row/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/machine-row/frame-1.svg",
      "/exercises/frames/machine-row/frame-2.svg",
      "/exercises/frames/machine-row/frame-3.svg"
    ],
    "alternatives": [
      "exercise-costas-01",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-costas-01",
    "name": "Puxada Frontal no Pulley",
    "category": "Costas",
    "type": "cabo",
    "muscleGroups": [
      "Latíssimo do Dorso",
      "Bíceps",
      "Trapézio"
    ],
    "equipment": "Polia Alta com Barra Longa",
    "difficulty": "iniciante",
    "instructions": "Pegada aberta pronada. Puxe a barra em direção à parte superior do peito projetando o esterno e deprimindo as escápulas.",
    "imageUrl": "/exercises/frames/lat-pulldown/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/lat-pulldown/frame-1.svg",
      "/exercises/frames/lat-pulldown/frame-2.svg",
      "/exercises/frames/lat-pulldown/frame-3.svg"
    ],
    "alternatives": [
      "exercise-costas-02",
      "exercise-costas-05"
    ]
  },
  {
    "id": "exercise-close-grip-lat-pulldown",
    "name": "Close-Grip Lat Pulldown",
    "category": "Costas",
    "type": "cabo",
    "muscleGroups": [
      "Grande Dorsal",
      "Bíceps Braquial"
    ],
    "equipment": "Polia / Cabo",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/close-grip-lat-pulldown/frame-1.png",
    "videoFrames": [
      "/exercises/frames/close-grip-lat-pulldown/frame-1.png",
      "/exercises/frames/close-grip-lat-pulldown/frame-2.png",
      "/exercises/frames/close-grip-lat-pulldown/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-straight-arm-pulldown",
    "name": "Straight-Arm Pulldown",
    "category": "Costas",
    "type": "cabo",
    "muscleGroups": [
      "Grande Dorsal",
      "Abdômen e Core"
    ],
    "equipment": "Polia / Cabo",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/straight-arm-pulldown/frame-1.png",
    "videoFrames": [
      "/exercises/frames/straight-arm-pulldown/frame-1.png",
      "/exercises/frames/straight-arm-pulldown/frame-2.png",
      "/exercises/frames/straight-arm-pulldown/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-costas-05",
    "name": "Barra Fixa Pronada (Pull-up)",
    "category": "Costas",
    "type": "peso corporal",
    "muscleGroups": [
      "Latíssimo do Dorso",
      "Bíceps",
      "Core"
    ],
    "equipment": "Barra Fixa",
    "difficulty": "avançado",
    "instructions": "Segure a barra com pegada pronada afastada. Puxe o corpo até que o queixo passe a barra, sem balançar o corpo.",
    "imageUrl": "/exercises/frames/pull-up/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/pull-up/frame-1.svg",
      "/exercises/frames/pull-up/frame-2.svg",
      "/exercises/frames/pull-up/frame-3.svg"
    ],
    "alternatives": [
      "exercise-costas-01",
      "exercise-costas-02"
    ]
  },
  {
    "id": "exercise-assisted-pull-up",
    "name": "Assisted Pull-up",
    "category": "Costas",
    "type": "máquina",
    "muscleGroups": [
      "Grande Dorsal",
      "Bíceps Braquial"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/assisted-pull-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/assisted-pull-up/frame-1.png",
      "/exercises/frames/assisted-pull-up/frame-2.png",
      "/exercises/frames/assisted-pull-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-weighted-pull-up",
    "name": "Weighted Pull-up",
    "category": "Costas",
    "type": "peso corporal",
    "muscleGroups": [
      "Grande Dorsal",
      "Bíceps Braquial"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/weighted-pull-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/weighted-pull-up/frame-1.png",
      "/exercises/frames/weighted-pull-up/frame-2.png",
      "/exercises/frames/weighted-pull-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-chin-up",
    "name": "Chin-up",
    "category": "Bíceps",
    "type": "peso corporal",
    "muscleGroups": [
      "Bíceps Braquial",
      "Grande Dorsal"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/chin-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/chin-up/frame-1.png",
      "/exercises/frames/chin-up/frame-2.png",
      "/exercises/frames/chin-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-biceps-02",
      "exercise-biceps-03",
      "exercise-preacher-curl"
    ]
  },
  {
    "id": "exercise-shrug",
    "name": "Barbell Shrug",
    "category": "Costas",
    "type": "barra",
    "muscleGroups": [
      "Trapézio e Rombóides",
      "Antebraços"
    ],
    "equipment": "Barra Olímpica",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/shrug/frame-1.png",
    "videoFrames": [
      "/exercises/frames/shrug/frame-1.png",
      "/exercises/frames/shrug/frame-2.png",
      "/exercises/frames/shrug/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-pernas-01",
    "name": "Agachamento Livre com Barra",
    "category": "Pernas",
    "type": "barra",
    "muscleGroups": [
      "Quadríceps",
      "Glúteo Máximo",
      "Core"
    ],
    "equipment": "Gaiola de Agachamento e Barra Olímpica",
    "difficulty": "avançado",
    "instructions": "Barra apoiada nos trapézios. Desça flexionando quadril e joelhos mantendo joelhos alinhados com a ponta dos pés até 90º ou mais.",
    "imageUrl": "/exercises/frames/squat/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/squat/frame-1.svg",
      "/exercises/frames/squat/frame-2.svg",
      "/exercises/frames/squat/frame-3.svg"
    ],
    "alternatives": [
      "exercise-pernas-02",
      "exercise-pernas-03"
    ]
  },
  {
    "id": "exercise-front-squat",
    "name": "Front Squat",
    "category": "Pernas",
    "type": "barra",
    "muscleGroups": [
      "Quadríceps",
      "Abdômen e Core",
      "Glúteos"
    ],
    "equipment": "Barra Olímpica",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/front-squat/frame-1.png",
    "videoFrames": [
      "/exercises/frames/front-squat/frame-1.png",
      "/exercises/frames/front-squat/frame-2.png",
      "/exercises/frames/front-squat/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-hack-squat"
    ]
  },
  {
    "id": "exercise-hack-squat",
    "name": "Hack Squat",
    "category": "Pernas",
    "type": "máquina",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/hack-squat/frame-1.png",
    "videoFrames": [
      "/exercises/frames/hack-squat/frame-1.png",
      "/exercises/frames/hack-squat/frame-2.png",
      "/exercises/frames/hack-squat/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-pernas-02",
    "name": "Leg Press 45º",
    "category": "Pernas",
    "type": "máquina",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos",
      "Isquiotibiais"
    ],
    "equipment": "Máquina de Leg Press 45º",
    "difficulty": "iniciante",
    "instructions": "Apoie as costas completamente no encosto. Pés na largura dos ombros na plataforma. Destrave a máquina e desça até 90º sem descolar a lombar.",
    "imageUrl": "/exercises/frames/leg-press/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/leg-press/frame-1.svg",
      "/exercises/frames/leg-press/frame-2.svg",
      "/exercises/frames/leg-press/frame-3.svg"
    ],
    "alternatives": [
      "exercise-pernas-01",
      "exercise-pernas-04"
    ]
  },
  {
    "id": "exercise-bulgarian-split-squat",
    "name": "Bulgarian Split Squat",
    "category": "Pernas",
    "type": "halteres",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos",
      "Abdômen e Core"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/bulgarian-split-squat/frame-1.png",
    "videoFrames": [
      "/exercises/frames/bulgarian-split-squat/frame-1.png",
      "/exercises/frames/bulgarian-split-squat/frame-2.png",
      "/exercises/frames/bulgarian-split-squat/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-pernas-07",
    "name": "Afundo / Passada com Halteres",
    "category": "Pernas",
    "type": "halteres",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos",
      "Estabilizadores"
    ],
    "equipment": "Par de Halteres",
    "difficulty": "intermediário",
    "instructions": "Dê um passo à frente flexionando ambos os joelhos até 90º. Mantenha o joelho da frente alinhado ao tornozelo e o tronco reto.",
    "imageUrl": "/exercises/frames/walking-lunge/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/walking-lunge/frame-1.svg",
      "/exercises/frames/walking-lunge/frame-2.svg",
      "/exercises/frames/walking-lunge/frame-3.svg"
    ],
    "alternatives": [
      "exercise-pernas-01",
      "exercise-pernas-03"
    ]
  },
  {
    "id": "exercise-step-up",
    "name": "Step-Up",
    "category": "Pernas",
    "type": "halteres",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/step-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/step-up/frame-1.png",
      "/exercises/frames/step-up/frame-2.png",
      "/exercises/frames/step-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-pernas-04",
    "name": "Cadeira Extensora",
    "category": "Pernas",
    "type": "máquina",
    "muscleGroups": [
      "Quadríceps (Reto Femoral e Vastos)"
    ],
    "equipment": "Cadeira Extensora",
    "difficulty": "iniciante",
    "instructions": "Ajuste o encosto e o rolo no tornozelo. Estenda as pernas controlando o movimento e segure 1 segundo no topo antes de descer suavemente.",
    "imageUrl": "/exercises/frames/leg-extension/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/leg-extension/frame-1.svg",
      "/exercises/frames/leg-extension/frame-2.svg",
      "/exercises/frames/leg-extension/frame-3.svg"
    ],
    "alternatives": [
      "exercise-pernas-01",
      "exercise-pernas-02"
    ]
  },
  {
    "id": "exercise-leg-curl",
    "name": "Leg Curl",
    "category": "Pernas",
    "type": "máquina",
    "muscleGroups": [
      "Isquiotibiais (Posterior)",
      "Panturrilhas"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/leg-curl/frame-1.png",
    "videoFrames": [
      "/exercises/frames/leg-curl/frame-1.png",
      "/exercises/frames/leg-curl/frame-2.png",
      "/exercises/frames/leg-curl/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-seated-leg-curl",
    "name": "Seated Leg Curl",
    "category": "Pernas",
    "type": "máquina",
    "muscleGroups": [
      "Isquiotibiais (Posterior)",
      "Panturrilhas"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/seated-leg-curl/frame-1.png",
    "videoFrames": [
      "/exercises/frames/seated-leg-curl/frame-1.png",
      "/exercises/frames/seated-leg-curl/frame-2.png",
      "/exercises/frames/seated-leg-curl/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-hip-thrust",
    "name": "Hip Thrust",
    "category": "Pernas",
    "type": "barra",
    "muscleGroups": [
      "Glúteos",
      "Isquiotibiais (Posterior)"
    ],
    "equipment": "Barra Olímpica",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/hip-thrust/frame-1.png",
    "videoFrames": [
      "/exercises/frames/hip-thrust/frame-1.png",
      "/exercises/frames/hip-thrust/frame-2.png",
      "/exercises/frames/hip-thrust/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-glute-bridge",
    "name": "Glute Bridge",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Glúteos",
      "Isquiotibiais (Posterior)"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/glute-bridge/frame-1.png",
    "videoFrames": [
      "/exercises/frames/glute-bridge/frame-1.png",
      "/exercises/frames/glute-bridge/frame-2.png",
      "/exercises/frames/glute-bridge/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-good-morning",
    "name": "Good Morning",
    "category": "Pernas",
    "type": "barra",
    "muscleGroups": [
      "Isquiotibiais (Posterior)",
      "Glúteos",
      "Lombar"
    ],
    "equipment": "Barra Olímpica",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/good-morning/frame-1.png",
    "videoFrames": [
      "/exercises/frames/good-morning/frame-1.png",
      "/exercises/frames/good-morning/frame-2.png",
      "/exercises/frames/good-morning/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-standing-calf-raise",
    "name": "Standing Calf Raise",
    "category": "Pernas",
    "type": "máquina",
    "muscleGroups": [
      "Panturrilhas"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/standing-calf-raise/frame-1.png",
    "videoFrames": [
      "/exercises/frames/standing-calf-raise/frame-1.png",
      "/exercises/frames/standing-calf-raise/frame-2.png",
      "/exercises/frames/standing-calf-raise/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-seated-calf-raise",
    "name": "Seated Calf Raise",
    "category": "Pernas",
    "type": "máquina",
    "muscleGroups": [
      "Panturrilhas"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/seated-calf-raise/frame-1.png",
    "videoFrames": [
      "/exercises/frames/seated-calf-raise/frame-1.png",
      "/exercises/frames/seated-calf-raise/frame-2.png",
      "/exercises/frames/seated-calf-raise/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-biceps-02",
    "name": "Rosca Alternada com Halteres",
    "category": "Bíceps",
    "type": "halteres",
    "muscleGroups": [
      "Bíceps Braquial",
      "Braquiorradial"
    ],
    "equipment": "Par de halteres",
    "difficulty": "iniciante",
    "instructions": "Em pé ou sentado, flexione um braço por vez com supinação do punho na subida.",
    "imageUrl": "/exercises/frames/bicep-curl/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/bicep-curl/frame-1.svg",
      "/exercises/frames/bicep-curl/frame-2.svg",
      "/exercises/frames/bicep-curl/frame-3.svg"
    ],
    "alternatives": [
      "exercise-biceps-01",
      "exercise-biceps-03"
    ]
  },
  {
    "id": "exercise-biceps-03",
    "name": "Rosca Martelo com Halteres",
    "category": "Bíceps",
    "type": "halteres",
    "muscleGroups": [
      "Braquiorradial",
      "Braquial",
      "Bíceps"
    ],
    "equipment": "Par de halteres",
    "difficulty": "iniciante",
    "instructions": "Pegada neutra (palmas voltadas para dentro). Flexione os antebraços mantendo pegada firme durante todo o curso.",
    "imageUrl": "/exercises/frames/hammer-curl/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/hammer-curl/frame-1.svg",
      "/exercises/frames/hammer-curl/frame-2.svg",
      "/exercises/frames/hammer-curl/frame-3.svg"
    ],
    "alternatives": [
      "exercise-biceps-01",
      "exercise-biceps-02"
    ]
  },
  {
    "id": "exercise-preacher-curl",
    "name": "Preacher Curl",
    "category": "Bíceps",
    "type": "máquina",
    "muscleGroups": [
      "Bíceps Braquial",
      "Antebraços"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/preacher-curl/frame-1.png",
    "videoFrames": [
      "/exercises/frames/preacher-curl/frame-1.png",
      "/exercises/frames/preacher-curl/frame-2.png",
      "/exercises/frames/preacher-curl/frame-3.png"
    ],
    "alternatives": [
      "exercise-chin-up",
      "exercise-biceps-02",
      "exercise-biceps-03"
    ]
  },
  {
    "id": "exercise-cable-curl",
    "name": "Cable Curl",
    "category": "Bíceps",
    "type": "cabo",
    "muscleGroups": [
      "Bíceps Braquial",
      "Antebraços"
    ],
    "equipment": "Polia / Cabo",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/cable-curl/frame-1.png",
    "videoFrames": [
      "/exercises/frames/cable-curl/frame-1.png",
      "/exercises/frames/cable-curl/frame-2.png",
      "/exercises/frames/cable-curl/frame-3.png"
    ],
    "alternatives": [
      "exercise-chin-up",
      "exercise-biceps-02",
      "exercise-biceps-03"
    ]
  },
  {
    "id": "exercise-reverse-curl",
    "name": "Reverse Curl",
    "category": "Bíceps",
    "type": "barra",
    "muscleGroups": [
      "Antebraços",
      "Bíceps Braquial"
    ],
    "equipment": "Barra Olímpica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/reverse-curl/frame-1.png",
    "videoFrames": [
      "/exercises/frames/reverse-curl/frame-1.png",
      "/exercises/frames/reverse-curl/frame-2.png",
      "/exercises/frames/reverse-curl/frame-3.png"
    ],
    "alternatives": [
      "exercise-chin-up",
      "exercise-biceps-02",
      "exercise-biceps-03"
    ]
  },
  {
    "id": "exercise-wrist-curl",
    "name": "Wrist Curl",
    "category": "Bíceps",
    "type": "barra",
    "muscleGroups": [
      "Antebraços"
    ],
    "equipment": "Barra Olímpica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/wrist-curl/frame-1.png",
    "videoFrames": [
      "/exercises/frames/wrist-curl/frame-1.png",
      "/exercises/frames/wrist-curl/frame-2.png",
      "/exercises/frames/wrist-curl/frame-3.png"
    ],
    "alternatives": [
      "exercise-chin-up",
      "exercise-biceps-02",
      "exercise-biceps-03"
    ]
  },
  {
    "id": "exercise-tricep-pushdown",
    "name": "Tricep Pushdown",
    "category": "Tríceps",
    "type": "cabo",
    "muscleGroups": [
      "Tríceps Braquial",
      "Deltoides"
    ],
    "equipment": "Polia / Cabo",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/tricep-pushdown/frame-1.png",
    "videoFrames": [
      "/exercises/frames/tricep-pushdown/frame-1.png",
      "/exercises/frames/tricep-pushdown/frame-2.png",
      "/exercises/frames/tricep-pushdown/frame-3.png"
    ],
    "alternatives": [
      "exercise-overhead-tricep-extension",
      "exercise-triceps-03",
      "exercise-close-grip-bench-press"
    ]
  },
  {
    "id": "exercise-overhead-tricep-extension",
    "name": "Overhead Tricep Extension",
    "category": "Tríceps",
    "type": "cabo",
    "muscleGroups": [
      "Tríceps Braquial",
      "Deltoides"
    ],
    "equipment": "Polia / Cabo",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/overhead-tricep-extension/frame-1.png",
    "videoFrames": [
      "/exercises/frames/overhead-tricep-extension/frame-1.png",
      "/exercises/frames/overhead-tricep-extension/frame-2.png",
      "/exercises/frames/overhead-tricep-extension/frame-3.png"
    ],
    "alternatives": [
      "exercise-tricep-pushdown",
      "exercise-triceps-03",
      "exercise-close-grip-bench-press"
    ]
  },
  {
    "id": "exercise-triceps-03",
    "name": "Tríceps Testa com Barra W",
    "category": "Tríceps",
    "type": "barra",
    "muscleGroups": [
      "Tríceps Braquial"
    ],
    "equipment": "Banco plano e barra W",
    "difficulty": "intermediário",
    "instructions": "Deitado no banco, desça a barra suavemente em direção à testa mantendo os cotovelos fechados e verticais.",
    "imageUrl": "/exercises/frames/skull-crusher/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/skull-crusher/frame-1.svg",
      "/exercises/frames/skull-crusher/frame-2.svg",
      "/exercises/frames/skull-crusher/frame-3.svg"
    ],
    "alternatives": [
      "exercise-triceps-01",
      "exercise-triceps-02"
    ]
  },
  {
    "id": "exercise-close-grip-bench-press",
    "name": "Close-Grip Bench Press",
    "category": "Tríceps",
    "type": "barra",
    "muscleGroups": [
      "Tríceps Braquial",
      "Peitoral Maior",
      "Deltoides"
    ],
    "equipment": "Barra Olímpica",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/close-grip-bench-press/frame-1.png",
    "videoFrames": [
      "/exercises/frames/close-grip-bench-press/frame-1.png",
      "/exercises/frames/close-grip-bench-press/frame-2.png",
      "/exercises/frames/close-grip-bench-press/frame-3.png"
    ],
    "alternatives": [
      "exercise-tricep-pushdown",
      "exercise-overhead-tricep-extension",
      "exercise-triceps-03"
    ]
  },
  {
    "id": "exercise-dip",
    "name": "Dip",
    "category": "Tríceps",
    "type": "peso corporal",
    "muscleGroups": [
      "Tríceps Braquial",
      "Peitoral Maior",
      "Deltoides"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/dip/frame-1.png",
    "videoFrames": [
      "/exercises/frames/dip/frame-1.png",
      "/exercises/frames/dip/frame-2.png",
      "/exercises/frames/dip/frame-3.png"
    ],
    "alternatives": [
      "exercise-tricep-pushdown",
      "exercise-overhead-tricep-extension",
      "exercise-triceps-03"
    ]
  },
  {
    "id": "exercise-assisted-dip",
    "name": "Assisted Dip",
    "category": "Tríceps",
    "type": "máquina",
    "muscleGroups": [
      "Tríceps Braquial",
      "Peitoral Maior"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/assisted-dip/frame-1.png",
    "videoFrames": [
      "/exercises/frames/assisted-dip/frame-1.png",
      "/exercises/frames/assisted-dip/frame-2.png",
      "/exercises/frames/assisted-dip/frame-3.png"
    ],
    "alternatives": [
      "exercise-tricep-pushdown",
      "exercise-overhead-tricep-extension",
      "exercise-triceps-03"
    ]
  },
  {
    "id": "exercise-core-01",
    "name": "Prancha Isométrica",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Transverso Abdominal",
      "Reto Abdominal",
      "Lombar"
    ],
    "equipment": "Colchonete",
    "difficulty": "iniciante",
    "instructions": "Apoie antebraços e pontas dos pés no solo. Mantenha linha reta da cabeça aos pés, contraindo glúteos e abdômen.",
    "imageUrl": "/exercises/frames/plank/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/plank/frame-1.svg",
      "/exercises/frames/plank/frame-2.svg",
      "/exercises/frames/plank/frame-3.svg"
    ],
    "alternatives": [
      "exercise-core-02",
      "exercise-core-04"
    ]
  },
  {
    "id": "exercise-side-plank",
    "name": "Side Plank",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core",
      "Deltoides"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/side-plank/frame-1.png",
    "videoFrames": [
      "/exercises/frames/side-plank/frame-1.png",
      "/exercises/frames/side-plank/frame-2.png",
      "/exercises/frames/side-plank/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-core-03",
      "exercise-cable-crunch"
    ]
  },
  {
    "id": "exercise-core-03",
    "name": "Elevação de Pernas Suspenso",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Reto Abdominal Inferior",
      "Flexores do Quadril"
    ],
    "equipment": "Barra fixa ou paralela",
    "difficulty": "avançado",
    "instructions": "Suspenso na barra, eleve os joelhos ou pernas estendidas em direção ao peito com controle e sem balançar.",
    "imageUrl": "/exercises/frames/hanging-leg-raise/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/hanging-leg-raise/frame-1.svg",
      "/exercises/frames/hanging-leg-raise/frame-2.svg",
      "/exercises/frames/hanging-leg-raise/frame-3.svg"
    ],
    "alternatives": [
      "exercise-core-02",
      "exercise-core-04"
    ]
  },
  {
    "id": "exercise-cable-crunch",
    "name": "Cable Crunch",
    "category": "Core",
    "type": "cabo",
    "muscleGroups": [
      "Abdômen e Core"
    ],
    "equipment": "Polia / Cabo",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/cable-crunch/frame-1.png",
    "videoFrames": [
      "/exercises/frames/cable-crunch/frame-1.png",
      "/exercises/frames/cable-crunch/frame-2.png",
      "/exercises/frames/cable-crunch/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-ab-wheel",
    "name": "Ab Wheel Rollout",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core",
      "Deltoides"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/ab-wheel/frame-1.png",
    "videoFrames": [
      "/exercises/frames/ab-wheel/frame-1.png",
      "/exercises/frames/ab-wheel/frame-2.png",
      "/exercises/frames/ab-wheel/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-running",
    "name": "Running",
    "category": "Pernas",
    "type": "livre",
    "muscleGroups": [
      "Membros Inferiores",
      "Cardio"
    ],
    "equipment": "Equipamento Cardio",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/running/frame-1.png",
    "videoFrames": [
      "/exercises/frames/running/frame-1.png",
      "/exercises/frames/running/frame-2.png",
      "/exercises/frames/running/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-walking",
    "name": "Walking",
    "category": "Pernas",
    "type": "livre",
    "muscleGroups": [
      "Membros Inferiores",
      "Cardio"
    ],
    "equipment": "Equipamento Cardio",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/walking/frame-1.png",
    "videoFrames": [
      "/exercises/frames/walking/frame-1.png",
      "/exercises/frames/walking/frame-2.png",
      "/exercises/frames/walking/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-cycling",
    "name": "Cycling",
    "category": "Pernas",
    "type": "livre",
    "muscleGroups": [
      "Membros Inferiores",
      "Cardio"
    ],
    "equipment": "Equipamento Cardio",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/cycling/frame-1.png",
    "videoFrames": [
      "/exercises/frames/cycling/frame-1.png",
      "/exercises/frames/cycling/frame-2.png",
      "/exercises/frames/cycling/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-rowing",
    "name": "Rowing",
    "category": "Costas",
    "type": "livre",
    "muscleGroups": [
      "Dorsal e Costas",
      "Membros Inferiores",
      "Cardio"
    ],
    "equipment": "Equipamento Cardio",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/rowing/frame-1.png",
    "videoFrames": [
      "/exercises/frames/rowing/frame-1.png",
      "/exercises/frames/rowing/frame-2.png",
      "/exercises/frames/rowing/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-stair-climber",
    "name": "Stair Climber",
    "category": "Pernas",
    "type": "livre",
    "muscleGroups": [
      "Membros Inferiores",
      "Cardio"
    ],
    "equipment": "Equipamento Cardio",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/stair-climber/frame-1.png",
    "videoFrames": [
      "/exercises/frames/stair-climber/frame-1.png",
      "/exercises/frames/stair-climber/frame-2.png",
      "/exercises/frames/stair-climber/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-peito-04",
    "name": "Crucifixo com Halteres",
    "category": "Peito",
    "type": "halteres",
    "muscleGroups": [
      "Peitoral Maior (Fibras Esternocostais)"
    ],
    "equipment": "Banco Reto e Par de Halteres",
    "difficulty": "intermediário",
    "instructions": "Abra os braços mantendo cotovelos levemente flexionados até sentir o alongamento do peitoral. Retorne contraindo o peito no topo.",
    "imageUrl": "/exercises/frames/dumbbell-fly/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/dumbbell-fly/frame-1.svg",
      "/exercises/frames/dumbbell-fly/frame-2.svg",
      "/exercises/frames/dumbbell-fly/frame-3.svg"
    ],
    "alternatives": [
      "exercise-peito-01",
      "exercise-peito-02"
    ]
  },
  {
    "id": "exercise-incline-cable-fly",
    "name": "Incline Cable Fly",
    "category": "Peito",
    "type": "cabo",
    "muscleGroups": [
      "Peitoral Maior",
      "Deltoides"
    ],
    "equipment": "Polia / Cabo",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/incline-cable-fly/frame-1.png",
    "videoFrames": [
      "/exercises/frames/incline-cable-fly/frame-1.png",
      "/exercises/frames/incline-cable-fly/frame-2.png",
      "/exercises/frames/incline-cable-fly/frame-3.png"
    ],
    "alternatives": [
      "exercise-peito-02",
      "exercise-incline-bench-press",
      "exercise-peito-03"
    ]
  },
  {
    "id": "exercise-decline-dumbbell-press",
    "name": "Decline Dumbbell Press",
    "category": "Peito",
    "type": "halteres",
    "muscleGroups": [
      "Peitoral Maior",
      "Tríceps Braquial",
      "Deltoides"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/decline-dumbbell-press/frame-1.png",
    "videoFrames": [
      "/exercises/frames/decline-dumbbell-press/frame-1.png",
      "/exercises/frames/decline-dumbbell-press/frame-2.png",
      "/exercises/frames/decline-dumbbell-press/frame-3.png"
    ],
    "alternatives": [
      "exercise-peito-02",
      "exercise-incline-bench-press",
      "exercise-peito-03"
    ]
  },
  {
    "id": "exercise-smith-machine-bench-press",
    "name": "Smith Machine Bench Press",
    "category": "Peito",
    "type": "máquina",
    "muscleGroups": [
      "Peitoral Maior",
      "Tríceps Braquial",
      "Deltoides"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/smith-machine-bench-press/frame-1.png",
    "videoFrames": [
      "/exercises/frames/smith-machine-bench-press/frame-1.png",
      "/exercises/frames/smith-machine-bench-press/frame-2.png",
      "/exercises/frames/smith-machine-bench-press/frame-3.png"
    ],
    "alternatives": [
      "exercise-peito-02",
      "exercise-incline-bench-press",
      "exercise-peito-03"
    ]
  },
  {
    "id": "exercise-landmine-press",
    "name": "Landmine Press",
    "category": "Ombros",
    "type": "barra",
    "muscleGroups": [
      "Deltoides",
      "Peitoral Maior",
      "Tríceps Braquial"
    ],
    "equipment": "Barra Olímpica",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/landmine-press/frame-1.png",
    "videoFrames": [
      "/exercises/frames/landmine-press/frame-1.png",
      "/exercises/frames/landmine-press/frame-2.png",
      "/exercises/frames/landmine-press/frame-3.png"
    ],
    "alternatives": [
      "exercise-overhead-press",
      "exercise-ombros-02",
      "exercise-arnold-press"
    ]
  },
  {
    "id": "exercise-chest-dip",
    "name": "Chest Dip",
    "category": "Peito",
    "type": "peso corporal",
    "muscleGroups": [
      "Peitoral Maior",
      "Tríceps Braquial",
      "Deltoides"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/chest-dip/frame-1.png",
    "videoFrames": [
      "/exercises/frames/chest-dip/frame-1.png",
      "/exercises/frames/chest-dip/frame-2.png",
      "/exercises/frames/chest-dip/frame-3.png"
    ],
    "alternatives": [
      "exercise-peito-02",
      "exercise-incline-bench-press",
      "exercise-peito-03"
    ]
  },
  {
    "id": "exercise-weighted-dip",
    "name": "Weighted Dip",
    "category": "Tríceps",
    "type": "peso corporal",
    "muscleGroups": [
      "Tríceps Braquial",
      "Peitoral Maior",
      "Deltoides"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/weighted-dip/frame-1.png",
    "videoFrames": [
      "/exercises/frames/weighted-dip/frame-1.png",
      "/exercises/frames/weighted-dip/frame-2.png",
      "/exercises/frames/weighted-dip/frame-3.png"
    ],
    "alternatives": [
      "exercise-tricep-pushdown",
      "exercise-overhead-tricep-extension",
      "exercise-triceps-03"
    ]
  },
  {
    "id": "exercise-ombros-01",
    "name": "Desenvolvimento Máquina",
    "category": "Ombros",
    "type": "máquina",
    "muscleGroups": [
      "Deltoide Anterior e Lateral",
      "Tríceps"
    ],
    "equipment": "Máquina Articulada de Ombros",
    "difficulty": "iniciante",
    "instructions": "Ajuste a altura do banco para que os apoios fiquem no nível das orelhas. Empurre para cima sem travar bruscamente os cotovelos no topo.",
    "imageUrl": "/exercises/frames/machine-shoulder-press/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/machine-shoulder-press/frame-1.svg",
      "/exercises/frames/machine-shoulder-press/frame-2.svg",
      "/exercises/frames/machine-shoulder-press/frame-3.svg"
    ],
    "alternatives": [
      "exercise-ombros-02",
      "exercise-ombros-03"
    ]
  },
  {
    "id": "exercise-standing-dumbbell-press",
    "name": "Standing Dumbbell Press",
    "category": "Ombros",
    "type": "halteres",
    "muscleGroups": [
      "Deltoides",
      "Tríceps Braquial",
      "Abdômen e Core"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/standing-dumbbell-press/frame-1.png",
    "videoFrames": [
      "/exercises/frames/standing-dumbbell-press/frame-1.png",
      "/exercises/frames/standing-dumbbell-press/frame-2.png",
      "/exercises/frames/standing-dumbbell-press/frame-3.png"
    ],
    "alternatives": [
      "exercise-overhead-press",
      "exercise-ombros-02",
      "exercise-arnold-press"
    ]
  },
  {
    "id": "exercise-push-press",
    "name": "Push Press",
    "category": "Ombros",
    "type": "barra",
    "muscleGroups": [
      "Deltoides",
      "Tríceps Braquial",
      "Quadríceps"
    ],
    "equipment": "Barra Olímpica",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/push-press/frame-1.png",
    "videoFrames": [
      "/exercises/frames/push-press/frame-1.png",
      "/exercises/frames/push-press/frame-2.png",
      "/exercises/frames/push-press/frame-3.png"
    ],
    "alternatives": [
      "exercise-overhead-press",
      "exercise-ombros-02",
      "exercise-arnold-press"
    ]
  },
  {
    "id": "exercise-machine-lateral-raise",
    "name": "Machine Lateral Raise",
    "category": "Ombros",
    "type": "máquina",
    "muscleGroups": [
      "Deltoides",
      "Trapézio e Rombóides"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/machine-lateral-raise/frame-1.png",
    "videoFrames": [
      "/exercises/frames/machine-lateral-raise/frame-1.png",
      "/exercises/frames/machine-lateral-raise/frame-2.png",
      "/exercises/frames/machine-lateral-raise/frame-3.png"
    ],
    "alternatives": [
      "exercise-overhead-press",
      "exercise-ombros-02",
      "exercise-arnold-press"
    ]
  },
  {
    "id": "exercise-ombros-04",
    "name": "Elevação Frontal no Cabo",
    "category": "Ombros",
    "type": "cabo",
    "muscleGroups": [
      "Deltoide Anterior"
    ],
    "equipment": "Polia baixa e barra reta ou corda",
    "difficulty": "iniciante",
    "instructions": "Puxe o cabo à frente do corpo elevando os braços até a altura dos olhos com controle na descida.",
    "imageUrl": "/exercises/frames/cable-front-raise/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/cable-front-raise/frame-1.svg",
      "/exercises/frames/cable-front-raise/frame-2.svg",
      "/exercises/frames/cable-front-raise/frame-3.svg"
    ],
    "alternatives": [
      "exercise-ombros-03",
      "exercise-ombros-02"
    ]
  },
  {
    "id": "exercise-plate-front-raise",
    "name": "Plate Front Raise",
    "category": "Ombros",
    "type": "livre",
    "muscleGroups": [
      "Deltoides",
      "Peitoral Maior"
    ],
    "equipment": "Anilha",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/plate-front-raise/frame-1.png",
    "videoFrames": [
      "/exercises/frames/plate-front-raise/frame-1.png",
      "/exercises/frames/plate-front-raise/frame-2.png",
      "/exercises/frames/plate-front-raise/frame-3.png"
    ],
    "alternatives": [
      "exercise-overhead-press",
      "exercise-ombros-02",
      "exercise-arnold-press"
    ]
  },
  {
    "id": "exercise-bent-over-rear-delt-raise",
    "name": "Bent-Over Rear Delt Raise",
    "category": "Ombros",
    "type": "halteres",
    "muscleGroups": [
      "Deltoide Posterior",
      "Trapézio e Rombóides"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/bent-over-rear-delt-raise/frame-1.png",
    "videoFrames": [
      "/exercises/frames/bent-over-rear-delt-raise/frame-1.png",
      "/exercises/frames/bent-over-rear-delt-raise/frame-2.png",
      "/exercises/frames/bent-over-rear-delt-raise/frame-3.png"
    ],
    "alternatives": [
      "exercise-overhead-press",
      "exercise-ombros-02",
      "exercise-arnold-press"
    ]
  },
  {
    "id": "exercise-cable-rear-delt-fly",
    "name": "Cable Rear Delt Fly",
    "category": "Ombros",
    "type": "cabo",
    "muscleGroups": [
      "Deltoide Posterior",
      "Trapézio e Rombóides"
    ],
    "equipment": "Polia / Cabo",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/cable-rear-delt-fly/frame-1.png",
    "videoFrames": [
      "/exercises/frames/cable-rear-delt-fly/frame-1.png",
      "/exercises/frames/cable-rear-delt-fly/frame-2.png",
      "/exercises/frames/cable-rear-delt-fly/frame-3.png"
    ],
    "alternatives": [
      "exercise-overhead-press",
      "exercise-ombros-02",
      "exercise-arnold-press"
    ]
  },
  {
    "id": "exercise-pendlay-row",
    "name": "Pendlay Row",
    "category": "Costas",
    "type": "barra",
    "muscleGroups": [
      "Dorsal e Costas",
      "Bíceps Braquial",
      "Deltoide Posterior"
    ],
    "equipment": "Barra Olímpica",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/pendlay-row/frame-1.png",
    "videoFrames": [
      "/exercises/frames/pendlay-row/frame-1.png",
      "/exercises/frames/pendlay-row/frame-2.png",
      "/exercises/frames/pendlay-row/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-inverted-row",
    "name": "Inverted Row",
    "category": "Costas",
    "type": "peso corporal",
    "muscleGroups": [
      "Dorsal e Costas",
      "Bíceps Braquial",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/inverted-row/frame-1.png",
    "videoFrames": [
      "/exercises/frames/inverted-row/frame-1.png",
      "/exercises/frames/inverted-row/frame-2.png",
      "/exercises/frames/inverted-row/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-meadows-row",
    "name": "Meadows Row",
    "category": "Costas",
    "type": "barra",
    "muscleGroups": [
      "Dorsal e Costas",
      "Bíceps Braquial",
      "Deltoide Posterior"
    ],
    "equipment": "Barra Olímpica",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/meadows-row/frame-1.png",
    "videoFrames": [
      "/exercises/frames/meadows-row/frame-1.png",
      "/exercises/frames/meadows-row/frame-2.png",
      "/exercises/frames/meadows-row/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-single-arm-cable-row",
    "name": "Single-Arm Cable Row",
    "category": "Costas",
    "type": "cabo",
    "muscleGroups": [
      "Dorsal e Costas",
      "Bíceps Braquial",
      "Deltoide Posterior"
    ],
    "equipment": "Polia / Cabo",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/single-arm-cable-row/frame-1.png",
    "videoFrames": [
      "/exercises/frames/single-arm-cable-row/frame-1.png",
      "/exercises/frames/single-arm-cable-row/frame-2.png",
      "/exercises/frames/single-arm-cable-row/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-wide-grip-lat-pulldown",
    "name": "Wide-Grip Lat Pulldown",
    "category": "Costas",
    "type": "cabo",
    "muscleGroups": [
      "Grande Dorsal",
      "Bíceps Braquial"
    ],
    "equipment": "Polia / Cabo",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/wide-grip-lat-pulldown/frame-1.png",
    "videoFrames": [
      "/exercises/frames/wide-grip-lat-pulldown/frame-1.png",
      "/exercises/frames/wide-grip-lat-pulldown/frame-2.png",
      "/exercises/frames/wide-grip-lat-pulldown/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-neutral-grip-pull-up",
    "name": "Neutral-Grip Pull-up",
    "category": "Costas",
    "type": "peso corporal",
    "muscleGroups": [
      "Grande Dorsal",
      "Bíceps Braquial",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/neutral-grip-pull-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/neutral-grip-pull-up/frame-1.png",
      "/exercises/frames/neutral-grip-pull-up/frame-2.png",
      "/exercises/frames/neutral-grip-pull-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-assisted-chin-up",
    "name": "Assisted Chin-up",
    "category": "Bíceps",
    "type": "máquina",
    "muscleGroups": [
      "Bíceps Braquial",
      "Grande Dorsal"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/assisted-chin-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/assisted-chin-up/frame-1.png",
      "/exercises/frames/assisted-chin-up/frame-2.png",
      "/exercises/frames/assisted-chin-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-chin-up",
      "exercise-biceps-02",
      "exercise-biceps-03"
    ]
  },
  {
    "id": "exercise-weighted-chin-up",
    "name": "Weighted Chin-up",
    "category": "Bíceps",
    "type": "peso corporal",
    "muscleGroups": [
      "Bíceps Braquial",
      "Grande Dorsal"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/weighted-chin-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/weighted-chin-up/frame-1.png",
      "/exercises/frames/weighted-chin-up/frame-2.png",
      "/exercises/frames/weighted-chin-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-chin-up",
      "exercise-biceps-02",
      "exercise-biceps-03"
    ]
  },
  {
    "id": "exercise-rack-pull",
    "name": "Rack Pull",
    "category": "Costas",
    "type": "barra",
    "muscleGroups": [
      "Dorsal e Costas",
      "Glúteos",
      "Isquiotibiais (Posterior)"
    ],
    "equipment": "Barra Olímpica",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/rack-pull/frame-1.png",
    "videoFrames": [
      "/exercises/frames/rack-pull/frame-1.png",
      "/exercises/frames/rack-pull/frame-2.png",
      "/exercises/frames/rack-pull/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-back-extension",
    "name": "Back Extension",
    "category": "Costas",
    "type": "peso corporal",
    "muscleGroups": [
      "Lombar",
      "Glúteos",
      "Isquiotibiais (Posterior)"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/back-extension/frame-1.png",
    "videoFrames": [
      "/exercises/frames/back-extension/frame-1.png",
      "/exercises/frames/back-extension/frame-2.png",
      "/exercises/frames/back-extension/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-dumbbell-shrug",
    "name": "Dumbbell Shrug",
    "category": "Costas",
    "type": "halteres",
    "muscleGroups": [
      "Trapézio e Rombóides",
      "Antebraços"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/dumbbell-shrug/frame-1.png",
    "videoFrames": [
      "/exercises/frames/dumbbell-shrug/frame-1.png",
      "/exercises/frames/dumbbell-shrug/frame-2.png",
      "/exercises/frames/dumbbell-shrug/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-pernas-03",
    "name": "Agachamento Goblet",
    "category": "Pernas",
    "type": "halteres",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos",
      "Core"
    ],
    "equipment": "Halter ou Kettlebell",
    "difficulty": "iniciante",
    "instructions": "Segure o halter na altura do peito com ambas as mãos. Agache mantendo o tronco ereto e os cotovelos entre os joelhos no ponto baixo.",
    "imageUrl": "/exercises/frames/goblet-squat/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/goblet-squat/frame-1.svg",
      "/exercises/frames/goblet-squat/frame-2.svg",
      "/exercises/frames/goblet-squat/frame-3.svg"
    ],
    "alternatives": [
      "exercise-pernas-01",
      "exercise-pernas-02"
    ]
  },
  {
    "id": "exercise-smith-machine-squat",
    "name": "Smith Machine Squat",
    "category": "Pernas",
    "type": "máquina",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos",
      "Abdômen e Core"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/smith-machine-squat/frame-1.png",
    "videoFrames": [
      "/exercises/frames/smith-machine-squat/frame-1.png",
      "/exercises/frames/smith-machine-squat/frame-2.png",
      "/exercises/frames/smith-machine-squat/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-belt-squat",
    "name": "Belt Squat",
    "category": "Pernas",
    "type": "máquina",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/belt-squat/frame-1.png",
    "videoFrames": [
      "/exercises/frames/belt-squat/frame-1.png",
      "/exercises/frames/belt-squat/frame-2.png",
      "/exercises/frames/belt-squat/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-sumo-deadlift",
    "name": "Sumo Deadlift",
    "category": "Costas",
    "type": "barra",
    "muscleGroups": [
      "Cadeia Posterior",
      "Glúteos",
      "Quadríceps"
    ],
    "equipment": "Barra Olímpica",
    "difficulty": "avançado",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/sumo-deadlift/frame-1.png",
    "videoFrames": [
      "/exercises/frames/sumo-deadlift/frame-1.png",
      "/exercises/frames/sumo-deadlift/frame-2.png",
      "/exercises/frames/sumo-deadlift/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-trap-bar-deadlift",
    "name": "Trap Bar Deadlift",
    "category": "Costas",
    "type": "barra",
    "muscleGroups": [
      "Cadeia Posterior",
      "Quadríceps",
      "Grip"
    ],
    "equipment": "Barra Olímpica",
    "difficulty": "avançado",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/trap-bar-deadlift/frame-1.png",
    "videoFrames": [
      "/exercises/frames/trap-bar-deadlift/frame-1.png",
      "/exercises/frames/trap-bar-deadlift/frame-2.png",
      "/exercises/frames/trap-bar-deadlift/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-pernas-05",
    "name": "Mesa Flexora",
    "category": "Pernas",
    "type": "máquina",
    "muscleGroups": [
      "Isquiotibiais (Posterior da Coxa)"
    ],
    "equipment": "Mesa Flexora Horizontal",
    "difficulty": "iniciante",
    "instructions": "Deitado de bruços, flexione as pernas aproximando os calcanhares dos glúteos. Mantenha a pelve pressionada contra o estofado.",
    "imageUrl": "/exercises/frames/lying-leg-curl/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/lying-leg-curl/frame-1.svg",
      "/exercises/frames/lying-leg-curl/frame-2.svg",
      "/exercises/frames/lying-leg-curl/frame-3.svg"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-07"
    ]
  },
  {
    "id": "exercise-nordic-hamstring-curl",
    "name": "Nordic Hamstring Curl",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Isquiotibiais (Posterior)",
      "Glúteos",
      "Panturrilhas"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/nordic-hamstring-curl/frame-1.png",
    "videoFrames": [
      "/exercises/frames/nordic-hamstring-curl/frame-1.png",
      "/exercises/frames/nordic-hamstring-curl/frame-2.png",
      "/exercises/frames/nordic-hamstring-curl/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-single-leg-romanian-deadlift",
    "name": "Single-Leg Romanian Deadlift",
    "category": "Pernas",
    "type": "halteres",
    "muscleGroups": [
      "Isquiotibiais (Posterior)",
      "Glúteos",
      "Abdômen e Core"
    ],
    "equipment": "Halteres",
    "difficulty": "avançado",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/single-leg-romanian-deadlift/frame-1.png",
    "videoFrames": [
      "/exercises/frames/single-leg-romanian-deadlift/frame-1.png",
      "/exercises/frames/single-leg-romanian-deadlift/frame-2.png",
      "/exercises/frames/single-leg-romanian-deadlift/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-reverse-lunge",
    "name": "Reverse Lunge",
    "category": "Pernas",
    "type": "halteres",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos",
      "Isquiotibiais (Posterior)"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/reverse-lunge/frame-1.png",
    "videoFrames": [
      "/exercises/frames/reverse-lunge/frame-1.png",
      "/exercises/frames/reverse-lunge/frame-2.png",
      "/exercises/frames/reverse-lunge/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-split-squat",
    "name": "Split Squat",
    "category": "Pernas",
    "type": "halteres",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos",
      "Abdômen e Core"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/split-squat/frame-1.png",
    "videoFrames": [
      "/exercises/frames/split-squat/frame-1.png",
      "/exercises/frames/split-squat/frame-2.png",
      "/exercises/frames/split-squat/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-cable-kickback",
    "name": "Cable Kickback",
    "category": "Pernas",
    "type": "cabo",
    "muscleGroups": [
      "Glúteos",
      "Isquiotibiais (Posterior)"
    ],
    "equipment": "Polia / Cabo",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/cable-kickback/frame-1.png",
    "videoFrames": [
      "/exercises/frames/cable-kickback/frame-1.png",
      "/exercises/frames/cable-kickback/frame-2.png",
      "/exercises/frames/cable-kickback/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-hip-abduction-machine",
    "name": "Hip Abduction Machine",
    "category": "Pernas",
    "type": "máquina",
    "muscleGroups": [
      "Glúteos",
      "Abdômen e Core"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/hip-abduction-machine/frame-1.png",
    "videoFrames": [
      "/exercises/frames/hip-abduction-machine/frame-1.png",
      "/exercises/frames/hip-abduction-machine/frame-2.png",
      "/exercises/frames/hip-abduction-machine/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-single-leg-glute-bridge",
    "name": "Single-Leg Glute Bridge",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Glúteos",
      "Isquiotibiais (Posterior)"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/single-leg-glute-bridge/frame-1.png",
    "videoFrames": [
      "/exercises/frames/single-leg-glute-bridge/frame-1.png",
      "/exercises/frames/single-leg-glute-bridge/frame-2.png",
      "/exercises/frames/single-leg-glute-bridge/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-barbell-glute-bridge",
    "name": "Barbell Glute Bridge",
    "category": "Pernas",
    "type": "barra",
    "muscleGroups": [
      "Glúteos",
      "Isquiotibiais (Posterior)",
      "Abdômen e Core"
    ],
    "equipment": "Barra Olímpica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/barbell-glute-bridge/frame-1.png",
    "videoFrames": [
      "/exercises/frames/barbell-glute-bridge/frame-1.png",
      "/exercises/frames/barbell-glute-bridge/frame-2.png",
      "/exercises/frames/barbell-glute-bridge/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-dumbbell-glute-bridge",
    "name": "Dumbbell Glute Bridge",
    "category": "Pernas",
    "type": "halteres",
    "muscleGroups": [
      "Glúteos",
      "Isquiotibiais (Posterior)",
      "Abdômen e Core"
    ],
    "equipment": "Halteres",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/dumbbell-glute-bridge/frame-1.png",
    "videoFrames": [
      "/exercises/frames/dumbbell-glute-bridge/frame-1.png",
      "/exercises/frames/dumbbell-glute-bridge/frame-2.png",
      "/exercises/frames/dumbbell-glute-bridge/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-dumbbell-hip-thrust",
    "name": "Dumbbell Hip Thrust",
    "category": "Pernas",
    "type": "halteres",
    "muscleGroups": [
      "Glúteos",
      "Isquiotibiais (Posterior)"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/dumbbell-hip-thrust/frame-1.png",
    "videoFrames": [
      "/exercises/frames/dumbbell-hip-thrust/frame-1.png",
      "/exercises/frames/dumbbell-hip-thrust/frame-2.png",
      "/exercises/frames/dumbbell-hip-thrust/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-smith-machine-hip-thrust",
    "name": "Smith Machine Hip Thrust",
    "category": "Pernas",
    "type": "máquina",
    "muscleGroups": [
      "Glúteos",
      "Isquiotibiais (Posterior)",
      "Abdômen e Core"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/smith-machine-hip-thrust/frame-1.png",
    "videoFrames": [
      "/exercises/frames/smith-machine-hip-thrust/frame-1.png",
      "/exercises/frames/smith-machine-hip-thrust/frame-2.png",
      "/exercises/frames/smith-machine-hip-thrust/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-smith-machine-romanian-deadlift",
    "name": "Smith Machine Romanian Deadlift",
    "category": "Pernas",
    "type": "máquina",
    "muscleGroups": [
      "Isquiotibiais (Posterior)",
      "Glúteos",
      "Lombar"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "avançado",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/smith-machine-romanian-deadlift/frame-1.png",
    "videoFrames": [
      "/exercises/frames/smith-machine-romanian-deadlift/frame-1.png",
      "/exercises/frames/smith-machine-romanian-deadlift/frame-2.png",
      "/exercises/frames/smith-machine-romanian-deadlift/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-dumbbell-romanian-deadlift",
    "name": "Dumbbell Romanian Deadlift",
    "category": "Pernas",
    "type": "halteres",
    "muscleGroups": [
      "Isquiotibiais (Posterior)",
      "Glúteos",
      "Lombar"
    ],
    "equipment": "Halteres",
    "difficulty": "avançado",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/dumbbell-romanian-deadlift/frame-1.png",
    "videoFrames": [
      "/exercises/frames/dumbbell-romanian-deadlift/frame-1.png",
      "/exercises/frames/dumbbell-romanian-deadlift/frame-2.png",
      "/exercises/frames/dumbbell-romanian-deadlift/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-kettlebell-romanian-deadlift",
    "name": "Kettlebell Romanian Deadlift",
    "category": "Pernas",
    "type": "livre",
    "muscleGroups": [
      "Isquiotibiais (Posterior)",
      "Glúteos",
      "Lombar"
    ],
    "equipment": "Kettlebell",
    "difficulty": "avançado",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/kettlebell-romanian-deadlift/frame-1.png",
    "videoFrames": [
      "/exercises/frames/kettlebell-romanian-deadlift/frame-1.png",
      "/exercises/frames/kettlebell-romanian-deadlift/frame-2.png",
      "/exercises/frames/kettlebell-romanian-deadlift/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-cable-pull-through",
    "name": "Cable Pull-Through",
    "category": "Pernas",
    "type": "cabo",
    "muscleGroups": [
      "Glúteos",
      "Isquiotibiais (Posterior)",
      "Lombar"
    ],
    "equipment": "Polia / Cabo",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/cable-pull-through/frame-1.png",
    "videoFrames": [
      "/exercises/frames/cable-pull-through/frame-1.png",
      "/exercises/frames/cable-pull-through/frame-2.png",
      "/exercises/frames/cable-pull-through/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-machine-glute-kickback",
    "name": "Machine Glute Kickback",
    "category": "Pernas",
    "type": "máquina",
    "muscleGroups": [
      "Glúteos",
      "Isquiotibiais (Posterior)"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/machine-glute-kickback/frame-1.png",
    "videoFrames": [
      "/exercises/frames/machine-glute-kickback/frame-1.png",
      "/exercises/frames/machine-glute-kickback/frame-2.png",
      "/exercises/frames/machine-glute-kickback/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-cable-standing-hip-abduction",
    "name": "Cable Standing Hip Abduction",
    "category": "Pernas",
    "type": "cabo",
    "muscleGroups": [
      "Glúteos",
      "Abdômen e Core"
    ],
    "equipment": "Polia / Cabo",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/cable-standing-hip-abduction/frame-1.png",
    "videoFrames": [
      "/exercises/frames/cable-standing-hip-abduction/frame-1.png",
      "/exercises/frames/cable-standing-hip-abduction/frame-2.png",
      "/exercises/frames/cable-standing-hip-abduction/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-cable-standing-hip-adduction",
    "name": "Cable Standing Hip Adduction",
    "category": "Pernas",
    "type": "cabo",
    "muscleGroups": [
      "Adutores da Coxa",
      "Abdômen e Core",
      "Glúteos"
    ],
    "equipment": "Polia / Cabo",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/cable-standing-hip-adduction/frame-1.png",
    "videoFrames": [
      "/exercises/frames/cable-standing-hip-adduction/frame-1.png",
      "/exercises/frames/cable-standing-hip-adduction/frame-2.png",
      "/exercises/frames/cable-standing-hip-adduction/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-hip-adduction-machine",
    "name": "Hip Adduction Machine",
    "category": "Pernas",
    "type": "máquina",
    "muscleGroups": [
      "Adutores da Coxa",
      "Abdômen e Core"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/hip-adduction-machine/frame-1.png",
    "videoFrames": [
      "/exercises/frames/hip-adduction-machine/frame-1.png",
      "/exercises/frames/hip-adduction-machine/frame-2.png",
      "/exercises/frames/hip-adduction-machine/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-smith-machine-bulgarian-split-squat",
    "name": "Smith Machine Bulgarian Split Squat",
    "category": "Pernas",
    "type": "máquina",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos",
      "Abdômen e Core"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/smith-machine-bulgarian-split-squat/frame-1.png",
    "videoFrames": [
      "/exercises/frames/smith-machine-bulgarian-split-squat/frame-1.png",
      "/exercises/frames/smith-machine-bulgarian-split-squat/frame-2.png",
      "/exercises/frames/smith-machine-bulgarian-split-squat/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-smith-machine-reverse-lunge",
    "name": "Smith Machine Reverse Lunge",
    "category": "Pernas",
    "type": "máquina",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos",
      "Isquiotibiais (Posterior)",
      "Abdômen e Core"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/smith-machine-reverse-lunge/frame-1.png",
    "videoFrames": [
      "/exercises/frames/smith-machine-reverse-lunge/frame-1.png",
      "/exercises/frames/smith-machine-reverse-lunge/frame-2.png",
      "/exercises/frames/smith-machine-reverse-lunge/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-smith-machine-split-squat",
    "name": "Smith Machine Split Squat",
    "category": "Pernas",
    "type": "máquina",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos",
      "Abdômen e Core"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/smith-machine-split-squat/frame-1.png",
    "videoFrames": [
      "/exercises/frames/smith-machine-split-squat/frame-1.png",
      "/exercises/frames/smith-machine-split-squat/frame-2.png",
      "/exercises/frames/smith-machine-split-squat/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-heel-elevated-goblet-squat",
    "name": "Heel-Elevated Goblet Squat",
    "category": "Pernas",
    "type": "halteres",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos",
      "Abdômen e Core"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/heel-elevated-goblet-squat/frame-1.png",
    "videoFrames": [
      "/exercises/frames/heel-elevated-goblet-squat/frame-1.png",
      "/exercises/frames/heel-elevated-goblet-squat/frame-2.png",
      "/exercises/frames/heel-elevated-goblet-squat/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-dumbbell-sumo-squat",
    "name": "Dumbbell Sumo Squat",
    "category": "Pernas",
    "type": "halteres",
    "muscleGroups": [
      "Glúteos",
      "Quadríceps",
      "Adutores da Coxa",
      "Isquiotibiais (Posterior)"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/dumbbell-sumo-squat/frame-1.png",
    "videoFrames": [
      "/exercises/frames/dumbbell-sumo-squat/frame-1.png",
      "/exercises/frames/dumbbell-sumo-squat/frame-2.png",
      "/exercises/frames/dumbbell-sumo-squat/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-dumbbell-sumo-deadlift",
    "name": "Dumbbell Sumo Deadlift",
    "category": "Costas",
    "type": "halteres",
    "muscleGroups": [
      "Cadeia Posterior",
      "Glúteos",
      "Quadríceps",
      "Adutores da Coxa"
    ],
    "equipment": "Halteres",
    "difficulty": "avançado",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/dumbbell-sumo-deadlift/frame-1.png",
    "videoFrames": [
      "/exercises/frames/dumbbell-sumo-deadlift/frame-1.png",
      "/exercises/frames/dumbbell-sumo-deadlift/frame-2.png",
      "/exercises/frames/dumbbell-sumo-deadlift/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-front-foot-elevated-split-squat",
    "name": "Front-Foot Elevated Split Squat",
    "category": "Pernas",
    "type": "halteres",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos",
      "Abdômen e Core"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/front-foot-elevated-split-squat/frame-1.png",
    "videoFrames": [
      "/exercises/frames/front-foot-elevated-split-squat/frame-1.png",
      "/exercises/frames/front-foot-elevated-split-squat/frame-2.png",
      "/exercises/frames/front-foot-elevated-split-squat/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-deficit-reverse-lunge",
    "name": "Deficit Reverse Lunge",
    "category": "Pernas",
    "type": "halteres",
    "muscleGroups": [
      "Glúteos",
      "Quadríceps",
      "Isquiotibiais (Posterior)",
      "Abdômen e Core"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/deficit-reverse-lunge/frame-1.png",
    "videoFrames": [
      "/exercises/frames/deficit-reverse-lunge/frame-1.png",
      "/exercises/frames/deficit-reverse-lunge/frame-2.png",
      "/exercises/frames/deficit-reverse-lunge/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-dumbbell-lateral-lunge",
    "name": "Dumbbell Lateral Lunge",
    "category": "Pernas",
    "type": "halteres",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos",
      "Adutores da Coxa",
      "Isquiotibiais (Posterior)"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/dumbbell-lateral-lunge/frame-1.png",
    "videoFrames": [
      "/exercises/frames/dumbbell-lateral-lunge/frame-1.png",
      "/exercises/frames/dumbbell-lateral-lunge/frame-2.png",
      "/exercises/frames/dumbbell-lateral-lunge/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-dumbbell-curtsy-lunge",
    "name": "Dumbbell Curtsy Lunge",
    "category": "Pernas",
    "type": "halteres",
    "muscleGroups": [
      "Glúteos",
      "Quadríceps",
      "Isquiotibiais (Posterior)",
      "Abdômen e Core"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/dumbbell-curtsy-lunge/frame-1.png",
    "videoFrames": [
      "/exercises/frames/dumbbell-curtsy-lunge/frame-1.png",
      "/exercises/frames/dumbbell-curtsy-lunge/frame-2.png",
      "/exercises/frames/dumbbell-curtsy-lunge/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-landmine-squat",
    "name": "Landmine Squat",
    "category": "Pernas",
    "type": "barra",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos",
      "Abdômen e Core"
    ],
    "equipment": "Barra Olímpica",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/landmine-squat/frame-1.png",
    "videoFrames": [
      "/exercises/frames/landmine-squat/frame-1.png",
      "/exercises/frames/landmine-squat/frame-2.png",
      "/exercises/frames/landmine-squat/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-landmine-romanian-deadlift",
    "name": "Landmine Romanian Deadlift",
    "category": "Pernas",
    "type": "barra",
    "muscleGroups": [
      "Isquiotibiais (Posterior)",
      "Glúteos",
      "Lombar"
    ],
    "equipment": "Barra Olímpica",
    "difficulty": "avançado",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/landmine-romanian-deadlift/frame-1.png",
    "videoFrames": [
      "/exercises/frames/landmine-romanian-deadlift/frame-1.png",
      "/exercises/frames/landmine-romanian-deadlift/frame-2.png",
      "/exercises/frames/landmine-romanian-deadlift/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-kettlebell-swing",
    "name": "Kettlebell Swing",
    "category": "Pernas",
    "type": "livre",
    "muscleGroups": [
      "Glúteos",
      "Isquiotibiais (Posterior)",
      "Abdômen e Core",
      "Cardio"
    ],
    "equipment": "Kettlebell",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/kettlebell-swing/frame-1.png",
    "videoFrames": [
      "/exercises/frames/kettlebell-swing/frame-1.png",
      "/exercises/frames/kettlebell-swing/frame-2.png",
      "/exercises/frames/kettlebell-swing/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-glute-focused-back-extension",
    "name": "Glute-Focused Back Extension",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Glúteos",
      "Isquiotibiais (Posterior)",
      "Lombar"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/glute-focused-back-extension/frame-1.png",
    "videoFrames": [
      "/exercises/frames/glute-focused-back-extension/frame-1.png",
      "/exercises/frames/glute-focused-back-extension/frame-2.png",
      "/exercises/frames/glute-focused-back-extension/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-reverse-hyperextension",
    "name": "Reverse Hyperextension",
    "category": "Pernas",
    "type": "máquina",
    "muscleGroups": [
      "Glúteos",
      "Isquiotibiais (Posterior)",
      "Lombar"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/reverse-hyperextension/frame-1.png",
    "videoFrames": [
      "/exercises/frames/reverse-hyperextension/frame-1.png",
      "/exercises/frames/reverse-hyperextension/frame-2.png",
      "/exercises/frames/reverse-hyperextension/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-donkey-calf-raise",
    "name": "Donkey Calf Raise",
    "category": "Pernas",
    "type": "máquina",
    "muscleGroups": [
      "Panturrilhas"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/donkey-calf-raise/frame-1.png",
    "videoFrames": [
      "/exercises/frames/donkey-calf-raise/frame-1.png",
      "/exercises/frames/donkey-calf-raise/frame-2.png",
      "/exercises/frames/donkey-calf-raise/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-leg-press-calf-raise",
    "name": "Leg Press Calf Raise",
    "category": "Pernas",
    "type": "máquina",
    "muscleGroups": [
      "Panturrilhas"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/leg-press-calf-raise/frame-1.png",
    "videoFrames": [
      "/exercises/frames/leg-press-calf-raise/frame-1.png",
      "/exercises/frames/leg-press-calf-raise/frame-2.png",
      "/exercises/frames/leg-press-calf-raise/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-wall-sit",
    "name": "Wall Sit",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/wall-sit/frame-1.png",
    "videoFrames": [
      "/exercises/frames/wall-sit/frame-1.png",
      "/exercises/frames/wall-sit/frame-2.png",
      "/exercises/frames/wall-sit/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-jump-squat",
    "name": "Jump Squat",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos",
      "Panturrilhas"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/jump-squat/frame-1.png",
    "videoFrames": [
      "/exercises/frames/jump-squat/frame-1.png",
      "/exercises/frames/jump-squat/frame-2.png",
      "/exercises/frames/jump-squat/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-incline-dumbbell-curl",
    "name": "Incline Dumbbell Curl",
    "category": "Bíceps",
    "type": "halteres",
    "muscleGroups": [
      "Bíceps Braquial",
      "Antebraços"
    ],
    "equipment": "Halteres",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/incline-dumbbell-curl/frame-1.png",
    "videoFrames": [
      "/exercises/frames/incline-dumbbell-curl/frame-1.png",
      "/exercises/frames/incline-dumbbell-curl/frame-2.png",
      "/exercises/frames/incline-dumbbell-curl/frame-3.png"
    ],
    "alternatives": [
      "exercise-chin-up",
      "exercise-biceps-02",
      "exercise-biceps-03"
    ]
  },
  {
    "id": "exercise-concentration-curl",
    "name": "Concentration Curl",
    "category": "Bíceps",
    "type": "halteres",
    "muscleGroups": [
      "Bíceps Braquial",
      "Antebraços"
    ],
    "equipment": "Halteres",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/concentration-curl/frame-1.png",
    "videoFrames": [
      "/exercises/frames/concentration-curl/frame-1.png",
      "/exercises/frames/concentration-curl/frame-2.png",
      "/exercises/frames/concentration-curl/frame-3.png"
    ],
    "alternatives": [
      "exercise-chin-up",
      "exercise-biceps-02",
      "exercise-biceps-03"
    ]
  },
  {
    "id": "exercise-biceps-01",
    "name": "Rosca Direta com Barra W",
    "category": "Bíceps",
    "type": "barra",
    "muscleGroups": [
      "Bíceps Braquial",
      "Braquial"
    ],
    "equipment": "Barra W e Anilhas",
    "difficulty": "iniciante",
    "instructions": "Cotovelos junto ao tronco, flexione os braços levantando a barra até contração máxima sem projetar o corpo.",
    "imageUrl": "/exercises/frames/ez-bar-curl/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/ez-bar-curl/frame-1.svg",
      "/exercises/frames/ez-bar-curl/frame-2.svg",
      "/exercises/frames/ez-bar-curl/frame-3.svg"
    ],
    "alternatives": [
      "exercise-biceps-02",
      "exercise-biceps-03"
    ]
  },
  {
    "id": "exercise-spider-curl",
    "name": "Spider Curl",
    "category": "Bíceps",
    "type": "halteres",
    "muscleGroups": [
      "Bíceps Braquial",
      "Antebraços"
    ],
    "equipment": "Halteres",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/spider-curl/frame-1.png",
    "videoFrames": [
      "/exercises/frames/spider-curl/frame-1.png",
      "/exercises/frames/spider-curl/frame-2.png",
      "/exercises/frames/spider-curl/frame-3.png"
    ],
    "alternatives": [
      "exercise-chin-up",
      "exercise-biceps-02",
      "exercise-biceps-03"
    ]
  },
  {
    "id": "exercise-rope-hammer-curl",
    "name": "Rope Hammer Curl",
    "category": "Bíceps",
    "type": "cabo",
    "muscleGroups": [
      "Bíceps Braquial",
      "Antebraços"
    ],
    "equipment": "Polia / Cabo",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/rope-hammer-curl/frame-1.png",
    "videoFrames": [
      "/exercises/frames/rope-hammer-curl/frame-1.png",
      "/exercises/frames/rope-hammer-curl/frame-2.png",
      "/exercises/frames/rope-hammer-curl/frame-3.png"
    ],
    "alternatives": [
      "exercise-chin-up",
      "exercise-biceps-02",
      "exercise-biceps-03"
    ]
  },
  {
    "id": "exercise-drag-curl",
    "name": "Drag Curl",
    "category": "Bíceps",
    "type": "barra",
    "muscleGroups": [
      "Bíceps Braquial",
      "Antebraços"
    ],
    "equipment": "Barra Olímpica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/drag-curl/frame-1.png",
    "videoFrames": [
      "/exercises/frames/drag-curl/frame-1.png",
      "/exercises/frames/drag-curl/frame-2.png",
      "/exercises/frames/drag-curl/frame-3.png"
    ],
    "alternatives": [
      "exercise-chin-up",
      "exercise-biceps-02",
      "exercise-biceps-03"
    ]
  },
  {
    "id": "exercise-triceps-01",
    "name": "Tríceps Pulley com Corda",
    "category": "Tríceps",
    "type": "cabo",
    "muscleGroups": [
      "Tríceps (todas as cabeças)"
    ],
    "equipment": "Polia alta com corda",
    "difficulty": "iniciante",
    "instructions": "Cotovelos firmes nas costelas. Estenda os braços para baixo abrindo as pontas da corda no final da contração.",
    "imageUrl": "/exercises/frames/rope-tricep-pushdown/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/rope-tricep-pushdown/frame-1.svg",
      "/exercises/frames/rope-tricep-pushdown/frame-2.svg",
      "/exercises/frames/rope-tricep-pushdown/frame-3.svg"
    ],
    "alternatives": [
      "exercise-triceps-02",
      "exercise-triceps-03"
    ]
  },
  {
    "id": "exercise-dumbbell-skull-crusher",
    "name": "Two Dumbbell Skullcrusher",
    "category": "Tríceps",
    "type": "halteres",
    "muscleGroups": [
      "Tríceps Braquial",
      "Deltoides"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/dumbbell-skull-crusher/frame-1.png",
    "videoFrames": [
      "/exercises/frames/dumbbell-skull-crusher/frame-1.png",
      "/exercises/frames/dumbbell-skull-crusher/frame-2.png",
      "/exercises/frames/dumbbell-skull-crusher/frame-3.png"
    ],
    "alternatives": [
      "exercise-tricep-pushdown",
      "exercise-overhead-tricep-extension",
      "exercise-triceps-03"
    ]
  },
  {
    "id": "exercise-single-dumbbell-skullcrusher",
    "name": "Single Dumbbell Skullcrusher",
    "category": "Tríceps",
    "type": "halteres",
    "muscleGroups": [
      "Tríceps Braquial",
      "Deltoides"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/single-dumbbell-skullcrusher/frame-1.png",
    "videoFrames": [
      "/exercises/frames/single-dumbbell-skullcrusher/frame-1.png",
      "/exercises/frames/single-dumbbell-skullcrusher/frame-2.png",
      "/exercises/frames/single-dumbbell-skullcrusher/frame-3.png"
    ],
    "alternatives": [
      "exercise-tricep-pushdown",
      "exercise-overhead-tricep-extension",
      "exercise-triceps-03"
    ]
  },
  {
    "id": "exercise-triceps-02",
    "name": "Tríceps Francês com Halter",
    "category": "Tríceps",
    "type": "halteres",
    "muscleGroups": [
      "Tríceps (Cabeça Longa)"
    ],
    "equipment": "Halter e banco",
    "difficulty": "intermediário",
    "instructions": "Segure o halter acima da cabeça com ambas as mãos. Flexione os cotovelos descendo o peso atrás da cabeça e retorne.",
    "imageUrl": "/exercises/frames/dumbbell-overhead-tricep-extension/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/dumbbell-overhead-tricep-extension/frame-1.svg",
      "/exercises/frames/dumbbell-overhead-tricep-extension/frame-2.svg",
      "/exercises/frames/dumbbell-overhead-tricep-extension/frame-3.svg"
    ],
    "alternatives": [
      "exercise-triceps-01",
      "exercise-triceps-03"
    ]
  },
  {
    "id": "exercise-single-arm-dumbbell-tricep-extension",
    "name": "Single Arm Dumbbell Tricep Extension",
    "category": "Tríceps",
    "type": "halteres",
    "muscleGroups": [
      "Tríceps Braquial",
      "Deltoides"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/single-arm-dumbbell-tricep-extension/frame-1.png",
    "videoFrames": [
      "/exercises/frames/single-arm-dumbbell-tricep-extension/frame-1.png",
      "/exercises/frames/single-arm-dumbbell-tricep-extension/frame-2.png",
      "/exercises/frames/single-arm-dumbbell-tricep-extension/frame-3.png"
    ],
    "alternatives": [
      "exercise-tricep-pushdown",
      "exercise-overhead-tricep-extension",
      "exercise-triceps-03"
    ]
  },
  {
    "id": "exercise-bench-dip",
    "name": "Bench Dip",
    "category": "Tríceps",
    "type": "peso corporal",
    "muscleGroups": [
      "Tríceps Braquial",
      "Peitoral Maior",
      "Deltoides"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/bench-dip/frame-1.png",
    "videoFrames": [
      "/exercises/frames/bench-dip/frame-1.png",
      "/exercises/frames/bench-dip/frame-2.png",
      "/exercises/frames/bench-dip/frame-3.png"
    ],
    "alternatives": [
      "exercise-tricep-pushdown",
      "exercise-overhead-tricep-extension",
      "exercise-triceps-03"
    ]
  },
  {
    "id": "exercise-tricep-kickback",
    "name": "Tricep Kickback",
    "category": "Tríceps",
    "type": "halteres",
    "muscleGroups": [
      "Tríceps Braquial",
      "Deltoides"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/tricep-kickback/frame-1.png",
    "videoFrames": [
      "/exercises/frames/tricep-kickback/frame-1.png",
      "/exercises/frames/tricep-kickback/frame-2.png",
      "/exercises/frames/tricep-kickback/frame-3.png"
    ],
    "alternatives": [
      "exercise-tricep-pushdown",
      "exercise-overhead-tricep-extension",
      "exercise-triceps-03"
    ]
  },
  {
    "id": "exercise-wrist-extension",
    "name": "Wrist Extension",
    "category": "Bíceps",
    "type": "halteres",
    "muscleGroups": [
      "Antebraços"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/wrist-extension/frame-1.png",
    "videoFrames": [
      "/exercises/frames/wrist-extension/frame-1.png",
      "/exercises/frames/wrist-extension/frame-2.png",
      "/exercises/frames/wrist-extension/frame-3.png"
    ],
    "alternatives": [
      "exercise-chin-up",
      "exercise-biceps-02",
      "exercise-biceps-03"
    ]
  },
  {
    "id": "exercise-farmer-carry",
    "name": "Farmer Carry",
    "category": "Bíceps",
    "type": "halteres",
    "muscleGroups": [
      "Antebraços",
      "Trapézio e Rombóides",
      "Abdômen e Core"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/farmer-carry/frame-1.png",
    "videoFrames": [
      "/exercises/frames/farmer-carry/frame-1.png",
      "/exercises/frames/farmer-carry/frame-2.png",
      "/exercises/frames/farmer-carry/frame-3.png"
    ],
    "alternatives": [
      "exercise-chin-up",
      "exercise-biceps-02",
      "exercise-biceps-03"
    ]
  },
  {
    "id": "exercise-core-02",
    "name": "Abdominal Supra no Solo",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Reto Abdominal"
    ],
    "equipment": "Colchonete",
    "difficulty": "iniciante",
    "instructions": "Joelhos flexionados, pés no chão. Flexione a coluna aproximando as costelas do quadril sem puxar o pescoço.",
    "imageUrl": "/exercises/frames/crunch/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/crunch/frame-1.svg",
      "/exercises/frames/crunch/frame-2.svg",
      "/exercises/frames/crunch/frame-3.svg"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-reverse-crunch",
    "name": "Reverse Crunch",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/reverse-crunch/frame-1.png",
    "videoFrames": [
      "/exercises/frames/reverse-crunch/frame-1.png",
      "/exercises/frames/reverse-crunch/frame-2.png",
      "/exercises/frames/reverse-crunch/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-russian-twist",
    "name": "Russian Twist",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core",
      "Deltoides"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/russian-twist/frame-1.png",
    "videoFrames": [
      "/exercises/frames/russian-twist/frame-1.png",
      "/exercises/frames/russian-twist/frame-2.png",
      "/exercises/frames/russian-twist/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-bicycle-crunch",
    "name": "Bicycle Crunch",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core",
      "Membros Inferiores"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/bicycle-crunch/frame-1.png",
    "videoFrames": [
      "/exercises/frames/bicycle-crunch/frame-1.png",
      "/exercises/frames/bicycle-crunch/frame-2.png",
      "/exercises/frames/bicycle-crunch/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-mountain-climber",
    "name": "Mountain Climber",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core",
      "Deltoides",
      "Membros Inferiores"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/mountain-climber/frame-1.png",
    "videoFrames": [
      "/exercises/frames/mountain-climber/frame-1.png",
      "/exercises/frames/mountain-climber/frame-2.png",
      "/exercises/frames/mountain-climber/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-core-04",
    "name": "Dead Bug (Inseto Morto)",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Core Profundo",
      "Estabilidade Pélvica"
    ],
    "equipment": "Colchonete",
    "difficulty": "iniciante",
    "instructions": "Deitado de barriga para cima com braços e joelhos elevados. Estenda braço oposto e perna oposta mantendo lombar colada ao chão.",
    "imageUrl": "/exercises/frames/dead-bug/frame-1.svg",
    "videoFrames": [
      "/exercises/frames/dead-bug/frame-1.svg",
      "/exercises/frames/dead-bug/frame-2.svg",
      "/exercises/frames/dead-bug/frame-3.svg"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-core-02"
    ]
  },
  {
    "id": "exercise-bird-dog",
    "name": "Bird Dog",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core",
      "Glúteos",
      "Deltoides"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/bird-dog/frame-1.png",
    "videoFrames": [
      "/exercises/frames/bird-dog/frame-1.png",
      "/exercises/frames/bird-dog/frame-2.png",
      "/exercises/frames/bird-dog/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-pallof-press",
    "name": "Pallof Press",
    "category": "Core",
    "type": "cabo",
    "muscleGroups": [
      "Abdômen e Core",
      "Deltoides"
    ],
    "equipment": "Polia / Cabo",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/pallof-press/frame-1.png",
    "videoFrames": [
      "/exercises/frames/pallof-press/frame-1.png",
      "/exercises/frames/pallof-press/frame-2.png",
      "/exercises/frames/pallof-press/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-cable-woodchop",
    "name": "Cable Woodchop",
    "category": "Core",
    "type": "cabo",
    "muscleGroups": [
      "Abdômen e Core",
      "Deltoides"
    ],
    "equipment": "Polia / Cabo",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/cable-woodchop/frame-1.png",
    "videoFrames": [
      "/exercises/frames/cable-woodchop/frame-1.png",
      "/exercises/frames/cable-woodchop/frame-2.png",
      "/exercises/frames/cable-woodchop/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-half-kneeling-pallof-press",
    "name": "Half-Kneeling Pallof Press",
    "category": "Core",
    "type": "cabo",
    "muscleGroups": [
      "Abdômen e Core",
      "Glúteos",
      "Deltoides"
    ],
    "equipment": "Polia / Cabo",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/half-kneeling-pallof-press/frame-1.png",
    "videoFrames": [
      "/exercises/frames/half-kneeling-pallof-press/frame-1.png",
      "/exercises/frames/half-kneeling-pallof-press/frame-2.png",
      "/exercises/frames/half-kneeling-pallof-press/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-cable-pallof-hold",
    "name": "Cable Pallof Hold",
    "category": "Core",
    "type": "cabo",
    "muscleGroups": [
      "Abdômen e Core",
      "Glúteos",
      "Deltoides"
    ],
    "equipment": "Polia / Cabo",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/cable-pallof-hold/frame-1.png",
    "videoFrames": [
      "/exercises/frames/cable-pallof-hold/frame-1.png",
      "/exercises/frames/cable-pallof-hold/frame-2.png",
      "/exercises/frames/cable-pallof-hold/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-hanging-knee-raise",
    "name": "Hanging Knee Raise",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core",
      "Grip"
    ],
    "equipment": "Barra Fixa",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/hanging-knee-raise/frame-1.png",
    "videoFrames": [
      "/exercises/frames/hanging-knee-raise/frame-1.png",
      "/exercises/frames/hanging-knee-raise/frame-2.png",
      "/exercises/frames/hanging-knee-raise/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-captains-chair-knee-raise",
    "name": "Captain's Chair Knee Raise",
    "category": "Core",
    "type": "máquina",
    "muscleGroups": [
      "Abdômen e Core",
      "Deltoides"
    ],
    "equipment": "Máquina Específica",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/captains-chair-knee-raise/frame-1.png",
    "videoFrames": [
      "/exercises/frames/captains-chair-knee-raise/frame-1.png",
      "/exercises/frames/captains-chair-knee-raise/frame-2.png",
      "/exercises/frames/captains-chair-knee-raise/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-decline-sit-up",
    "name": "Decline Sit-Up",
    "category": "Core",
    "type": "livre",
    "muscleGroups": [
      "Abdômen e Core",
      "Quadríceps"
    ],
    "equipment": "Banco Livre",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/decline-sit-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/decline-sit-up/frame-1.png",
      "/exercises/frames/decline-sit-up/frame-2.png",
      "/exercises/frames/decline-sit-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-weighted-crunch",
    "name": "Weighted Crunch",
    "category": "Core",
    "type": "livre",
    "muscleGroups": [
      "Abdômen e Core"
    ],
    "equipment": "Anilha",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/weighted-crunch/frame-1.png",
    "videoFrames": [
      "/exercises/frames/weighted-crunch/frame-1.png",
      "/exercises/frames/weighted-crunch/frame-2.png",
      "/exercises/frames/weighted-crunch/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-weighted-russian-twist",
    "name": "Weighted Russian Twist",
    "category": "Core",
    "type": "halteres",
    "muscleGroups": [
      "Abdômen e Core",
      "Deltoides"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/weighted-russian-twist/frame-1.png",
    "videoFrames": [
      "/exercises/frames/weighted-russian-twist/frame-1.png",
      "/exercises/frames/weighted-russian-twist/frame-2.png",
      "/exercises/frames/weighted-russian-twist/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-dumbbell-side-bend",
    "name": "Dumbbell Side Bend",
    "category": "Core",
    "type": "halteres",
    "muscleGroups": [
      "Abdômen e Core",
      "Grip"
    ],
    "equipment": "Halteres",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/dumbbell-side-bend/frame-1.png",
    "videoFrames": [
      "/exercises/frames/dumbbell-side-bend/frame-1.png",
      "/exercises/frames/dumbbell-side-bend/frame-2.png",
      "/exercises/frames/dumbbell-side-bend/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-elliptical",
    "name": "Elliptical",
    "category": "Pernas",
    "type": "livre",
    "muscleGroups": [
      "Membros Inferiores",
      "Cardio"
    ],
    "equipment": "Equipamento Cardio",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/elliptical/frame-1.png",
    "videoFrames": [
      "/exercises/frames/elliptical/frame-1.png",
      "/exercises/frames/elliptical/frame-2.png",
      "/exercises/frames/elliptical/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-swimming",
    "name": "Swimming",
    "category": "Costas",
    "type": "livre",
    "muscleGroups": [
      "Dorsal e Costas",
      "Deltoides",
      "Cardio"
    ],
    "equipment": "Equipamento Cardio",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/swimming/frame-1.png",
    "videoFrames": [
      "/exercises/frames/swimming/frame-1.png",
      "/exercises/frames/swimming/frame-2.png",
      "/exercises/frames/swimming/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-jump-rope",
    "name": "Jump Rope",
    "category": "Pernas",
    "type": "livre",
    "muscleGroups": [
      "Panturrilhas",
      "Cardio",
      "Deltoides"
    ],
    "equipment": "Equipamento Cardio",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/jump-rope/frame-1.png",
    "videoFrames": [
      "/exercises/frames/jump-rope/frame-1.png",
      "/exercises/frames/jump-rope/frame-2.png",
      "/exercises/frames/jump-rope/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-assault-bike",
    "name": "Assault Bike",
    "category": "Pernas",
    "type": "livre",
    "muscleGroups": [
      "Membros Inferiores",
      "Cardio",
      "Deltoides"
    ],
    "equipment": "Equipamento Cardio",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/assault-bike/frame-1.png",
    "videoFrames": [
      "/exercises/frames/assault-bike/frame-1.png",
      "/exercises/frames/assault-bike/frame-2.png",
      "/exercises/frames/assault-bike/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-skierg",
    "name": "SkiErg",
    "category": "Costas",
    "type": "livre",
    "muscleGroups": [
      "Dorsal e Costas",
      "Tríceps Braquial",
      "Abdômen e Core",
      "Cardio"
    ],
    "equipment": "Equipamento Cardio",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/skierg/frame-1.png",
    "videoFrames": [
      "/exercises/frames/skierg/frame-1.png",
      "/exercises/frames/skierg/frame-2.png",
      "/exercises/frames/skierg/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-hiking",
    "name": "Hiking",
    "category": "Pernas",
    "type": "livre",
    "muscleGroups": [
      "Membros Inferiores",
      "Glúteos",
      "Cardio"
    ],
    "equipment": "Equipamento Cardio",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/hiking/frame-1.png",
    "videoFrames": [
      "/exercises/frames/hiking/frame-1.png",
      "/exercises/frames/hiking/frame-2.png",
      "/exercises/frames/hiking/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-treadmill-incline-walk",
    "name": "Treadmill Incline Walk",
    "category": "Pernas",
    "type": "livre",
    "muscleGroups": [
      "Membros Inferiores",
      "Glúteos",
      "Cardio"
    ],
    "equipment": "Equipamento Cardio",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/treadmill-incline-walk/frame-1.png",
    "videoFrames": [
      "/exercises/frames/treadmill-incline-walk/frame-1.png",
      "/exercises/frames/treadmill-incline-walk/frame-2.png",
      "/exercises/frames/treadmill-incline-walk/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-battle-ropes",
    "name": "Battle Ropes",
    "category": "Ombros",
    "type": "livre",
    "muscleGroups": [
      "Deltoides",
      "Abdômen e Core",
      "Cardio"
    ],
    "equipment": "Equipamento Cardio",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/battle-ropes/frame-1.png",
    "videoFrames": [
      "/exercises/frames/battle-ropes/frame-1.png",
      "/exercises/frames/battle-ropes/frame-2.png",
      "/exercises/frames/battle-ropes/frame-3.png"
    ],
    "alternatives": [
      "exercise-overhead-press",
      "exercise-ombros-02",
      "exercise-arnold-press"
    ]
  },
  {
    "id": "exercise-incline-push-up",
    "name": "Incline Push-up",
    "category": "Peito",
    "type": "peso corporal",
    "muscleGroups": [
      "Peitoral Maior",
      "Tríceps Braquial",
      "Deltoides",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/incline-push-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/incline-push-up/frame-1.png",
      "/exercises/frames/incline-push-up/frame-2.png",
      "/exercises/frames/incline-push-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-peito-02",
      "exercise-incline-bench-press",
      "exercise-peito-03"
    ]
  },
  {
    "id": "exercise-knee-push-up",
    "name": "Knee Push-up",
    "category": "Peito",
    "type": "peso corporal",
    "muscleGroups": [
      "Peitoral Maior",
      "Tríceps Braquial",
      "Deltoides",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/knee-push-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/knee-push-up/frame-1.png",
      "/exercises/frames/knee-push-up/frame-2.png",
      "/exercises/frames/knee-push-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-peito-02",
      "exercise-incline-bench-press",
      "exercise-peito-03"
    ]
  },
  {
    "id": "exercise-wide-push-up",
    "name": "Wide Push-up",
    "category": "Peito",
    "type": "peso corporal",
    "muscleGroups": [
      "Peitoral Maior",
      "Deltoides",
      "Tríceps Braquial",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/wide-push-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/wide-push-up/frame-1.png",
      "/exercises/frames/wide-push-up/frame-2.png",
      "/exercises/frames/wide-push-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-peito-02",
      "exercise-incline-bench-press",
      "exercise-peito-03"
    ]
  },
  {
    "id": "exercise-diamond-push-up",
    "name": "Diamond Push-up",
    "category": "Tríceps",
    "type": "peso corporal",
    "muscleGroups": [
      "Tríceps Braquial",
      "Peitoral Maior",
      "Deltoides",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/diamond-push-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/diamond-push-up/frame-1.png",
      "/exercises/frames/diamond-push-up/frame-2.png",
      "/exercises/frames/diamond-push-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-tricep-pushdown",
      "exercise-overhead-tricep-extension",
      "exercise-triceps-03"
    ]
  },
  {
    "id": "exercise-decline-push-up",
    "name": "Decline Push-up",
    "category": "Peito",
    "type": "peso corporal",
    "muscleGroups": [
      "Peitoral Maior",
      "Deltoides",
      "Tríceps Braquial",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/decline-push-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/decline-push-up/frame-1.png",
      "/exercises/frames/decline-push-up/frame-2.png",
      "/exercises/frames/decline-push-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-peito-02",
      "exercise-incline-bench-press",
      "exercise-peito-03"
    ]
  },
  {
    "id": "exercise-pike-push-up",
    "name": "Pike Push-up",
    "category": "Ombros",
    "type": "peso corporal",
    "muscleGroups": [
      "Deltoides",
      "Tríceps Braquial",
      "Peitoral Maior",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/pike-push-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/pike-push-up/frame-1.png",
      "/exercises/frames/pike-push-up/frame-2.png",
      "/exercises/frames/pike-push-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-overhead-press",
      "exercise-ombros-02",
      "exercise-arnold-press"
    ]
  },
  {
    "id": "exercise-feet-elevated-pike-push-up",
    "name": "Feet-Elevated Pike Push-up",
    "category": "Ombros",
    "type": "peso corporal",
    "muscleGroups": [
      "Deltoides",
      "Tríceps Braquial",
      "Peitoral Maior",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/feet-elevated-pike-push-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/feet-elevated-pike-push-up/frame-1.png",
      "/exercises/frames/feet-elevated-pike-push-up/frame-2.png",
      "/exercises/frames/feet-elevated-pike-push-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-overhead-press",
      "exercise-ombros-02",
      "exercise-arnold-press"
    ]
  },
  {
    "id": "exercise-archer-push-up",
    "name": "Archer Push-up",
    "category": "Peito",
    "type": "peso corporal",
    "muscleGroups": [
      "Peitoral Maior",
      "Tríceps Braquial",
      "Deltoides",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/archer-push-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/archer-push-up/frame-1.png",
      "/exercises/frames/archer-push-up/frame-2.png",
      "/exercises/frames/archer-push-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-peito-02",
      "exercise-incline-bench-press",
      "exercise-peito-03"
    ]
  },
  {
    "id": "exercise-typewriter-push-up",
    "name": "Typewriter Push-up",
    "category": "Peito",
    "type": "peso corporal",
    "muscleGroups": [
      "Peitoral Maior",
      "Tríceps Braquial",
      "Deltoides",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "avançado",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/typewriter-push-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/typewriter-push-up/frame-1.png",
      "/exercises/frames/typewriter-push-up/frame-2.png",
      "/exercises/frames/typewriter-push-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-peito-02",
      "exercise-incline-bench-press",
      "exercise-peito-03"
    ]
  },
  {
    "id": "exercise-explosive-push-up",
    "name": "Explosive Push-up",
    "category": "Peito",
    "type": "peso corporal",
    "muscleGroups": [
      "Peitoral Maior",
      "Tríceps Braquial",
      "Deltoides",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/explosive-push-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/explosive-push-up/frame-1.png",
      "/exercises/frames/explosive-push-up/frame-2.png",
      "/exercises/frames/explosive-push-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-peito-02",
      "exercise-incline-bench-press",
      "exercise-peito-03"
    ]
  },
  {
    "id": "exercise-hindu-push-up",
    "name": "Hindu Push-up",
    "category": "Peito",
    "type": "peso corporal",
    "muscleGroups": [
      "Peitoral Maior",
      "Deltoides",
      "Tríceps Braquial",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/hindu-push-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/hindu-push-up/frame-1.png",
      "/exercises/frames/hindu-push-up/frame-2.png",
      "/exercises/frames/hindu-push-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-peito-02",
      "exercise-incline-bench-press",
      "exercise-peito-03"
    ]
  },
  {
    "id": "exercise-scapular-push-up",
    "name": "Scapular Push-up",
    "category": "Costas",
    "type": "peso corporal",
    "muscleGroups": [
      "Trapézio e Rombóides",
      "Peitoral Maior",
      "Deltoides",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/scapular-push-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/scapular-push-up/frame-1.png",
      "/exercises/frames/scapular-push-up/frame-2.png",
      "/exercises/frames/scapular-push-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-push-up-shoulder-tap",
    "name": "Push-up Shoulder Tap",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core",
      "Peitoral Maior",
      "Deltoides",
      "Tríceps Braquial"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/push-up-shoulder-tap/frame-1.png",
    "videoFrames": [
      "/exercises/frames/push-up-shoulder-tap/frame-1.png",
      "/exercises/frames/push-up-shoulder-tap/frame-2.png",
      "/exercises/frames/push-up-shoulder-tap/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-wall-push-up",
    "name": "Wall Push-up",
    "category": "Peito",
    "type": "peso corporal",
    "muscleGroups": [
      "Peitoral Maior",
      "Tríceps Braquial",
      "Deltoides"
    ],
    "equipment": "Parede",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/wall-push-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/wall-push-up/frame-1.png",
      "/exercises/frames/wall-push-up/frame-2.png",
      "/exercises/frames/wall-push-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-peito-02",
      "exercise-incline-bench-press",
      "exercise-peito-03"
    ]
  },
  {
    "id": "exercise-wall-walk",
    "name": "Wall Walk",
    "category": "Ombros",
    "type": "peso corporal",
    "muscleGroups": [
      "Deltoides",
      "Abdômen e Core",
      "Peitoral Maior",
      "Tríceps Braquial"
    ],
    "equipment": "Parede",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/wall-walk/frame-1.png",
    "videoFrames": [
      "/exercises/frames/wall-walk/frame-1.png",
      "/exercises/frames/wall-walk/frame-2.png",
      "/exercises/frames/wall-walk/frame-3.png"
    ],
    "alternatives": [
      "exercise-overhead-press",
      "exercise-ombros-02",
      "exercise-arnold-press"
    ]
  },
  {
    "id": "exercise-wall-handstand-push-up",
    "name": "Wall Handstand Push-up",
    "category": "Ombros",
    "type": "peso corporal",
    "muscleGroups": [
      "Deltoides",
      "Tríceps Braquial",
      "Abdômen e Core",
      "Peitoral Maior"
    ],
    "equipment": "Parede",
    "difficulty": "avançado",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/wall-handstand-push-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/wall-handstand-push-up/frame-1.png",
      "/exercises/frames/wall-handstand-push-up/frame-2.png",
      "/exercises/frames/wall-handstand-push-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-overhead-press",
      "exercise-ombros-02",
      "exercise-arnold-press"
    ]
  },
  {
    "id": "exercise-handstand-push-up",
    "name": "Handstand Push-up",
    "category": "Ombros",
    "type": "peso corporal",
    "muscleGroups": [
      "Deltoides",
      "Tríceps Braquial",
      "Abdômen e Core",
      "Peitoral Maior"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "avançado",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/handstand-push-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/handstand-push-up/frame-1.png",
      "/exercises/frames/handstand-push-up/frame-2.png",
      "/exercises/frames/handstand-push-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-overhead-press",
      "exercise-ombros-02",
      "exercise-arnold-press"
    ]
  },
  {
    "id": "exercise-chair-dip",
    "name": "Chair Dip",
    "category": "Tríceps",
    "type": "peso corporal",
    "muscleGroups": [
      "Tríceps Braquial",
      "Peitoral Maior",
      "Deltoides"
    ],
    "equipment": "Cadeira / Apoio",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/chair-dip/frame-1.png",
    "videoFrames": [
      "/exercises/frames/chair-dip/frame-1.png",
      "/exercises/frames/chair-dip/frame-2.png",
      "/exercises/frames/chair-dip/frame-3.png"
    ],
    "alternatives": [
      "exercise-tricep-pushdown",
      "exercise-overhead-tricep-extension",
      "exercise-triceps-03"
    ]
  },
  {
    "id": "exercise-doorway-row",
    "name": "Doorway Row",
    "category": "Costas",
    "type": "peso corporal",
    "muscleGroups": [
      "Dorsal e Costas",
      "Bíceps Braquial",
      "Trapézio e Rombóides",
      "Abdômen e Core"
    ],
    "equipment": "Batente / Apoio",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/doorway-row/frame-1.png",
    "videoFrames": [
      "/exercises/frames/doorway-row/frame-1.png",
      "/exercises/frames/doorway-row/frame-2.png",
      "/exercises/frames/doorway-row/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-towel-row",
    "name": "Towel Row",
    "category": "Costas",
    "type": "peso corporal",
    "muscleGroups": [
      "Dorsal e Costas",
      "Bíceps Braquial",
      "Trapézio e Rombóides",
      "Abdômen e Core"
    ],
    "equipment": "Toalha / Elástico",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/towel-row/frame-1.png",
    "videoFrames": [
      "/exercises/frames/towel-row/frame-1.png",
      "/exercises/frames/towel-row/frame-2.png",
      "/exercises/frames/towel-row/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-prone-y-raise",
    "name": "Prone Y Raise",
    "category": "Costas",
    "type": "peso corporal",
    "muscleGroups": [
      "Trapézio e Rombóides",
      "Deltoide Posterior",
      "Deltoides"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/prone-y-raise/frame-1.png",
    "videoFrames": [
      "/exercises/frames/prone-y-raise/frame-1.png",
      "/exercises/frames/prone-y-raise/frame-2.png",
      "/exercises/frames/prone-y-raise/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-prone-t-raise",
    "name": "Prone T Raise",
    "category": "Costas",
    "type": "peso corporal",
    "muscleGroups": [
      "Trapézio e Rombóides",
      "Deltoide Posterior",
      "Deltoides"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/prone-t-raise/frame-1.png",
    "videoFrames": [
      "/exercises/frames/prone-t-raise/frame-1.png",
      "/exercises/frames/prone-t-raise/frame-2.png",
      "/exercises/frames/prone-t-raise/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-superman",
    "name": "Superman",
    "category": "Costas",
    "type": "peso corporal",
    "muscleGroups": [
      "Lombar",
      "Glúteos",
      "Trapézio e Rombóides",
      "Isquiotibiais (Posterior)"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/superman/frame-1.png",
    "videoFrames": [
      "/exercises/frames/superman/frame-1.png",
      "/exercises/frames/superman/frame-2.png",
      "/exercises/frames/superman/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-superman-hold",
    "name": "Superman Hold",
    "category": "Costas",
    "type": "peso corporal",
    "muscleGroups": [
      "Lombar",
      "Glúteos",
      "Trapézio e Rombóides",
      "Isquiotibiais (Posterior)"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/superman-hold/frame-1.png",
    "videoFrames": [
      "/exercises/frames/superman-hold/frame-1.png",
      "/exercises/frames/superman-hold/frame-2.png",
      "/exercises/frames/superman-hold/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-reverse-snow-angel",
    "name": "Reverse Snow Angel",
    "category": "Costas",
    "type": "peso corporal",
    "muscleGroups": [
      "Trapézio e Rombóides",
      "Deltoide Posterior",
      "Lombar",
      "Deltoides"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/reverse-snow-angel/frame-1.png",
    "videoFrames": [
      "/exercises/frames/reverse-snow-angel/frame-1.png",
      "/exercises/frames/reverse-snow-angel/frame-2.png",
      "/exercises/frames/reverse-snow-angel/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-dead-hang",
    "name": "Dead Hang",
    "category": "Bíceps",
    "type": "peso corporal",
    "muscleGroups": [
      "Antebraços",
      "Grande Dorsal",
      "Deltoides",
      "Abdômen e Core"
    ],
    "equipment": "Barra Fixa",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/dead-hang/frame-1.png",
    "videoFrames": [
      "/exercises/frames/dead-hang/frame-1.png",
      "/exercises/frames/dead-hang/frame-2.png",
      "/exercises/frames/dead-hang/frame-3.png"
    ],
    "alternatives": [
      "exercise-chin-up",
      "exercise-biceps-02",
      "exercise-biceps-03"
    ]
  },
  {
    "id": "exercise-active-hang",
    "name": "Active Hang",
    "category": "Costas",
    "type": "peso corporal",
    "muscleGroups": [
      "Grande Dorsal",
      "Trapézio e Rombóides",
      "Antebraços",
      "Abdômen e Core"
    ],
    "equipment": "Barra Fixa",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/active-hang/frame-1.png",
    "videoFrames": [
      "/exercises/frames/active-hang/frame-1.png",
      "/exercises/frames/active-hang/frame-2.png",
      "/exercises/frames/active-hang/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-scapular-pull-up",
    "name": "Scapular Pull-up",
    "category": "Costas",
    "type": "peso corporal",
    "muscleGroups": [
      "Grande Dorsal",
      "Trapézio e Rombóides",
      "Antebraços",
      "Abdômen e Core"
    ],
    "equipment": "Barra Fixa",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/scapular-pull-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/scapular-pull-up/frame-1.png",
      "/exercises/frames/scapular-pull-up/frame-2.png",
      "/exercises/frames/scapular-pull-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-negative-pull-up",
    "name": "Negative Pull-up",
    "category": "Costas",
    "type": "peso corporal",
    "muscleGroups": [
      "Grande Dorsal",
      "Bíceps Braquial",
      "Trapézio e Rombóides",
      "Antebraços"
    ],
    "equipment": "Barra Fixa",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/negative-pull-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/negative-pull-up/frame-1.png",
      "/exercises/frames/negative-pull-up/frame-2.png",
      "/exercises/frames/negative-pull-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-commando-pull-up",
    "name": "Commando Pull-up",
    "category": "Costas",
    "type": "peso corporal",
    "muscleGroups": [
      "Grande Dorsal",
      "Bíceps Braquial",
      "Trapézio e Rombóides",
      "Abdômen e Core"
    ],
    "equipment": "Barra Fixa",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/commando-pull-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/commando-pull-up/frame-1.png",
      "/exercises/frames/commando-pull-up/frame-2.png",
      "/exercises/frames/commando-pull-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-l-sit-pull-up",
    "name": "L-Sit Pull-up",
    "category": "Costas",
    "type": "peso corporal",
    "muscleGroups": [
      "Grande Dorsal",
      "Bíceps Braquial",
      "Abdômen e Core",
      "Antebraços"
    ],
    "equipment": "Barra Fixa",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/l-sit-pull-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/l-sit-pull-up/frame-1.png",
      "/exercises/frames/l-sit-pull-up/frame-2.png",
      "/exercises/frames/l-sit-pull-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-towel-pull-up",
    "name": "Towel Pull-up",
    "category": "Costas",
    "type": "peso corporal",
    "muscleGroups": [
      "Grande Dorsal",
      "Bíceps Braquial",
      "Antebraços",
      "Trapézio e Rombóides"
    ],
    "equipment": "Toalha / Elástico",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/towel-pull-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/towel-pull-up/frame-1.png",
      "/exercises/frames/towel-pull-up/frame-2.png",
      "/exercises/frames/towel-pull-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-bodyweight-squat",
    "name": "Bodyweight Squat",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos",
      "Isquiotibiais (Posterior)",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/bodyweight-squat/frame-1.png",
    "videoFrames": [
      "/exercises/frames/bodyweight-squat/frame-1.png",
      "/exercises/frames/bodyweight-squat/frame-2.png",
      "/exercises/frames/bodyweight-squat/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-pistol-squat",
    "name": "Pistol Squat",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos",
      "Isquiotibiais (Posterior)",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "avançado",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/pistol-squat/frame-1.png",
    "videoFrames": [
      "/exercises/frames/pistol-squat/frame-1.png",
      "/exercises/frames/pistol-squat/frame-2.png",
      "/exercises/frames/pistol-squat/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-assisted-pistol-squat",
    "name": "Assisted Pistol Squat",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos",
      "Isquiotibiais (Posterior)",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "avançado",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/assisted-pistol-squat/frame-1.png",
    "videoFrames": [
      "/exercises/frames/assisted-pistol-squat/frame-1.png",
      "/exercises/frames/assisted-pistol-squat/frame-2.png",
      "/exercises/frames/assisted-pistol-squat/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-shrimp-squat",
    "name": "Shrimp Squat",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos",
      "Isquiotibiais (Posterior)",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/shrimp-squat/frame-1.png",
    "videoFrames": [
      "/exercises/frames/shrimp-squat/frame-1.png",
      "/exercises/frames/shrimp-squat/frame-2.png",
      "/exercises/frames/shrimp-squat/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-cossack-squat",
    "name": "Cossack Squat",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos",
      "Isquiotibiais (Posterior)",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/cossack-squat/frame-1.png",
    "videoFrames": [
      "/exercises/frames/cossack-squat/frame-1.png",
      "/exercises/frames/cossack-squat/frame-2.png",
      "/exercises/frames/cossack-squat/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-sissy-squat",
    "name": "Sissy Squat",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Quadríceps",
      "Abdômen e Core",
      "Panturrilhas"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/sissy-squat/frame-1.png",
    "videoFrames": [
      "/exercises/frames/sissy-squat/frame-1.png",
      "/exercises/frames/sissy-squat/frame-2.png",
      "/exercises/frames/sissy-squat/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-forward-lunge",
    "name": "Forward Lunge",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos",
      "Isquiotibiais (Posterior)",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/forward-lunge/frame-1.png",
    "videoFrames": [
      "/exercises/frames/forward-lunge/frame-1.png",
      "/exercises/frames/forward-lunge/frame-2.png",
      "/exercises/frames/forward-lunge/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-lateral-lunge",
    "name": "Lateral Lunge",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos",
      "Isquiotibiais (Posterior)",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/lateral-lunge/frame-1.png",
    "videoFrames": [
      "/exercises/frames/lateral-lunge/frame-1.png",
      "/exercises/frames/lateral-lunge/frame-2.png",
      "/exercises/frames/lateral-lunge/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-curtsy-lunge",
    "name": "Curtsy Lunge",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Glúteos",
      "Quadríceps",
      "Isquiotibiais (Posterior)",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/curtsy-lunge/frame-1.png",
    "videoFrames": [
      "/exercises/frames/curtsy-lunge/frame-1.png",
      "/exercises/frames/curtsy-lunge/frame-2.png",
      "/exercises/frames/curtsy-lunge/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-skater-squat",
    "name": "Skater Squat",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos",
      "Isquiotibiais (Posterior)",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/skater-squat/frame-1.png",
    "videoFrames": [
      "/exercises/frames/skater-squat/frame-1.png",
      "/exercises/frames/skater-squat/frame-2.png",
      "/exercises/frames/skater-squat/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-single-leg-box-squat",
    "name": "Single-Leg Box Squat",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos",
      "Isquiotibiais (Posterior)",
      "Abdômen e Core"
    ],
    "equipment": "Caixa / Plyo Box",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/single-leg-box-squat/frame-1.png",
    "videoFrames": [
      "/exercises/frames/single-leg-box-squat/frame-1.png",
      "/exercises/frames/single-leg-box-squat/frame-2.png",
      "/exercises/frames/single-leg-box-squat/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-step-down",
    "name": "Step-Down",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos",
      "Isquiotibiais (Posterior)",
      "Panturrilhas"
    ],
    "equipment": "Caixa / Plyo Box",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/step-down/frame-1.png",
    "videoFrames": [
      "/exercises/frames/step-down/frame-1.png",
      "/exercises/frames/step-down/frame-2.png",
      "/exercises/frames/step-down/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-calf-raise",
    "name": "Calf Raise",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Panturrilhas"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/calf-raise/frame-1.png",
    "videoFrames": [
      "/exercises/frames/calf-raise/frame-1.png",
      "/exercises/frames/calf-raise/frame-2.png",
      "/exercises/frames/calf-raise/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-single-leg-calf-raise",
    "name": "Single-Leg Calf Raise",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Panturrilhas",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/single-leg-calf-raise/frame-1.png",
    "videoFrames": [
      "/exercises/frames/single-leg-calf-raise/frame-1.png",
      "/exercises/frames/single-leg-calf-raise/frame-2.png",
      "/exercises/frames/single-leg-calf-raise/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-glute-bridge-march",
    "name": "Glute Bridge March",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Glúteos",
      "Isquiotibiais (Posterior)",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/glute-bridge-march/frame-1.png",
    "videoFrames": [
      "/exercises/frames/glute-bridge-march/frame-1.png",
      "/exercises/frames/glute-bridge-march/frame-2.png",
      "/exercises/frames/glute-bridge-march/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-frog-pump",
    "name": "Frog Pump",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Glúteos",
      "Isquiotibiais (Posterior)"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/frog-pump/frame-1.png",
    "videoFrames": [
      "/exercises/frames/frog-pump/frame-1.png",
      "/exercises/frames/frog-pump/frame-2.png",
      "/exercises/frames/frog-pump/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-donkey-kick",
    "name": "Donkey Kick",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Glúteos",
      "Isquiotibiais (Posterior)",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/donkey-kick/frame-1.png",
    "videoFrames": [
      "/exercises/frames/donkey-kick/frame-1.png",
      "/exercises/frames/donkey-kick/frame-2.png",
      "/exercises/frames/donkey-kick/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-fire-hydrant",
    "name": "Fire Hydrant",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Glúteos",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/fire-hydrant/frame-1.png",
    "videoFrames": [
      "/exercises/frames/fire-hydrant/frame-1.png",
      "/exercises/frames/fire-hydrant/frame-2.png",
      "/exercises/frames/fire-hydrant/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-clamshell",
    "name": "Clamshell",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Glúteos",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/clamshell/frame-1.png",
    "videoFrames": [
      "/exercises/frames/clamshell/frame-1.png",
      "/exercises/frames/clamshell/frame-2.png",
      "/exercises/frames/clamshell/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-hip-airplane",
    "name": "Hip Airplane",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Glúteos",
      "Isquiotibiais (Posterior)",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/hip-airplane/frame-1.png",
    "videoFrames": [
      "/exercises/frames/hip-airplane/frame-1.png",
      "/exercises/frames/hip-airplane/frame-2.png",
      "/exercises/frames/hip-airplane/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-side-lying-hip-abduction",
    "name": "Side-Lying Hip Abduction",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Glúteos",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/side-lying-hip-abduction/frame-1.png",
    "videoFrames": [
      "/exercises/frames/side-lying-hip-abduction/frame-1.png",
      "/exercises/frames/side-lying-hip-abduction/frame-2.png",
      "/exercises/frames/side-lying-hip-abduction/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-side-lying-leg-raise",
    "name": "Side-Lying Leg Raise",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Glúteos",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/side-lying-leg-raise/frame-1.png",
    "videoFrames": [
      "/exercises/frames/side-lying-leg-raise/frame-1.png",
      "/exercises/frames/side-lying-leg-raise/frame-2.png",
      "/exercises/frames/side-lying-leg-raise/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-lying-hamstring-walkout",
    "name": "Lying Hamstring Walkout",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Isquiotibiais (Posterior)",
      "Glúteos",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/lying-hamstring-walkout/frame-1.png",
    "videoFrames": [
      "/exercises/frames/lying-hamstring-walkout/frame-1.png",
      "/exercises/frames/lying-hamstring-walkout/frame-2.png",
      "/exercises/frames/lying-hamstring-walkout/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-towel-hamstring-curl",
    "name": "Towel Hamstring Curl",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Isquiotibiais (Posterior)",
      "Glúteos",
      "Abdômen e Core"
    ],
    "equipment": "Toalha / Elástico",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/towel-hamstring-curl/frame-1.png",
    "videoFrames": [
      "/exercises/frames/towel-hamstring-curl/frame-1.png",
      "/exercises/frames/towel-hamstring-curl/frame-2.png",
      "/exercises/frames/towel-hamstring-curl/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-stability-ball-hamstring-curl",
    "name": "Stability Ball Hamstring Curl",
    "category": "Pernas",
    "type": "livre",
    "muscleGroups": [
      "Isquiotibiais (Posterior)",
      "Glúteos",
      "Abdômen e Core"
    ],
    "equipment": "Bola Suíça",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/stability-ball-hamstring-curl/frame-1.png",
    "videoFrames": [
      "/exercises/frames/stability-ball-hamstring-curl/frame-1.png",
      "/exercises/frames/stability-ball-hamstring-curl/frame-2.png",
      "/exercises/frames/stability-ball-hamstring-curl/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-banded-glute-bridge",
    "name": "Banded Glute Bridge",
    "category": "Pernas",
    "type": "livre",
    "muscleGroups": [
      "Glúteos",
      "Isquiotibiais (Posterior)",
      "Abdômen e Core"
    ],
    "equipment": "Elástico Extensor",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/banded-glute-bridge/frame-1.png",
    "videoFrames": [
      "/exercises/frames/banded-glute-bridge/frame-1.png",
      "/exercises/frames/banded-glute-bridge/frame-2.png",
      "/exercises/frames/banded-glute-bridge/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-banded-hip-thrust",
    "name": "Banded Hip Thrust",
    "category": "Pernas",
    "type": "livre",
    "muscleGroups": [
      "Glúteos",
      "Isquiotibiais (Posterior)",
      "Abdômen e Core"
    ],
    "equipment": "Elástico Extensor",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/banded-hip-thrust/frame-1.png",
    "videoFrames": [
      "/exercises/frames/banded-hip-thrust/frame-1.png",
      "/exercises/frames/banded-hip-thrust/frame-2.png",
      "/exercises/frames/banded-hip-thrust/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-banded-frog-pump",
    "name": "Banded Frog Pump",
    "category": "Pernas",
    "type": "livre",
    "muscleGroups": [
      "Glúteos",
      "Isquiotibiais (Posterior)"
    ],
    "equipment": "Elástico Extensor",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/banded-frog-pump/frame-1.png",
    "videoFrames": [
      "/exercises/frames/banded-frog-pump/frame-1.png",
      "/exercises/frames/banded-frog-pump/frame-2.png",
      "/exercises/frames/banded-frog-pump/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-banded-clamshell",
    "name": "Banded Clamshell",
    "category": "Pernas",
    "type": "livre",
    "muscleGroups": [
      "Glúteos",
      "Abdômen e Core"
    ],
    "equipment": "Elástico Extensor",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/banded-clamshell/frame-1.png",
    "videoFrames": [
      "/exercises/frames/banded-clamshell/frame-1.png",
      "/exercises/frames/banded-clamshell/frame-2.png",
      "/exercises/frames/banded-clamshell/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-banded-lateral-walk",
    "name": "Banded Lateral Walk",
    "category": "Pernas",
    "type": "livre",
    "muscleGroups": [
      "Glúteos",
      "Quadríceps",
      "Abdômen e Core"
    ],
    "equipment": "Elástico Extensor",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/banded-lateral-walk/frame-1.png",
    "videoFrames": [
      "/exercises/frames/banded-lateral-walk/frame-1.png",
      "/exercises/frames/banded-lateral-walk/frame-2.png",
      "/exercises/frames/banded-lateral-walk/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-banded-monster-walk",
    "name": "Banded Monster Walk",
    "category": "Pernas",
    "type": "livre",
    "muscleGroups": [
      "Glúteos",
      "Quadríceps",
      "Isquiotibiais (Posterior)",
      "Abdômen e Core"
    ],
    "equipment": "Elástico Extensor",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/banded-monster-walk/frame-1.png",
    "videoFrames": [
      "/exercises/frames/banded-monster-walk/frame-1.png",
      "/exercises/frames/banded-monster-walk/frame-2.png",
      "/exercises/frames/banded-monster-walk/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-banded-squat",
    "name": "Banded Squat",
    "category": "Pernas",
    "type": "livre",
    "muscleGroups": [
      "Quadríceps",
      "Glúteos",
      "Isquiotibiais (Posterior)",
      "Abdômen e Core"
    ],
    "equipment": "Elástico Extensor",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/banded-squat/frame-1.png",
    "videoFrames": [
      "/exercises/frames/banded-squat/frame-1.png",
      "/exercises/frames/banded-squat/frame-2.png",
      "/exercises/frames/banded-squat/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-banded-donkey-kick",
    "name": "Banded Donkey Kick",
    "category": "Pernas",
    "type": "livre",
    "muscleGroups": [
      "Glúteos",
      "Isquiotibiais (Posterior)",
      "Abdômen e Core"
    ],
    "equipment": "Elástico Extensor",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/banded-donkey-kick/frame-1.png",
    "videoFrames": [
      "/exercises/frames/banded-donkey-kick/frame-1.png",
      "/exercises/frames/banded-donkey-kick/frame-2.png",
      "/exercises/frames/banded-donkey-kick/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-banded-fire-hydrant",
    "name": "Banded Fire Hydrant",
    "category": "Pernas",
    "type": "livre",
    "muscleGroups": [
      "Glúteos",
      "Abdômen e Core"
    ],
    "equipment": "Elástico Extensor",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/banded-fire-hydrant/frame-1.png",
    "videoFrames": [
      "/exercises/frames/banded-fire-hydrant/frame-1.png",
      "/exercises/frames/banded-fire-hydrant/frame-2.png",
      "/exercises/frames/banded-fire-hydrant/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-banded-kickback",
    "name": "Banded Kickback",
    "category": "Pernas",
    "type": "livre",
    "muscleGroups": [
      "Glúteos",
      "Isquiotibiais (Posterior)",
      "Abdômen e Core"
    ],
    "equipment": "Elástico Extensor",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/banded-kickback/frame-1.png",
    "videoFrames": [
      "/exercises/frames/banded-kickback/frame-1.png",
      "/exercises/frames/banded-kickback/frame-2.png",
      "/exercises/frames/banded-kickback/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-banded-standing-hip-abduction",
    "name": "Banded Standing Hip Abduction",
    "category": "Pernas",
    "type": "livre",
    "muscleGroups": [
      "Glúteos",
      "Abdômen e Core"
    ],
    "equipment": "Elástico Extensor",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/banded-standing-hip-abduction/frame-1.png",
    "videoFrames": [
      "/exercises/frames/banded-standing-hip-abduction/frame-1.png",
      "/exercises/frames/banded-standing-hip-abduction/frame-2.png",
      "/exercises/frames/banded-standing-hip-abduction/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-banded-seated-hip-abduction",
    "name": "Banded Seated Hip Abduction",
    "category": "Pernas",
    "type": "livre",
    "muscleGroups": [
      "Glúteos",
      "Abdômen e Core"
    ],
    "equipment": "Elástico Extensor",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/banded-seated-hip-abduction/frame-1.png",
    "videoFrames": [
      "/exercises/frames/banded-seated-hip-abduction/frame-1.png",
      "/exercises/frames/banded-seated-hip-abduction/frame-2.png",
      "/exercises/frames/banded-seated-hip-abduction/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-band-pull-apart",
    "name": "Band Pull-Apart",
    "category": "Costas",
    "type": "livre",
    "muscleGroups": [
      "Trapézio e Rombóides",
      "Deltoide Posterior",
      "Deltoides"
    ],
    "equipment": "Elástico Extensor",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/band-pull-apart/frame-1.png",
    "videoFrames": [
      "/exercises/frames/band-pull-apart/frame-1.png",
      "/exercises/frames/band-pull-apart/frame-2.png",
      "/exercises/frames/band-pull-apart/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-banded-face-pull",
    "name": "Banded Face Pull",
    "category": "Costas",
    "type": "livre",
    "muscleGroups": [
      "Trapézio e Rombóides",
      "Deltoide Posterior",
      "Deltoides"
    ],
    "equipment": "Elástico Extensor",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/banded-face-pull/frame-1.png",
    "videoFrames": [
      "/exercises/frames/banded-face-pull/frame-1.png",
      "/exercises/frames/banded-face-pull/frame-2.png",
      "/exercises/frames/banded-face-pull/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-banded-row",
    "name": "Banded Row",
    "category": "Costas",
    "type": "livre",
    "muscleGroups": [
      "Dorsal e Costas",
      "Bíceps Braquial",
      "Trapézio e Rombóides"
    ],
    "equipment": "Elástico Extensor",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/banded-row/frame-1.png",
    "videoFrames": [
      "/exercises/frames/banded-row/frame-1.png",
      "/exercises/frames/banded-row/frame-2.png",
      "/exercises/frames/banded-row/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-banded-lat-pulldown",
    "name": "Banded Lat Pulldown",
    "category": "Costas",
    "type": "livre",
    "muscleGroups": [
      "Grande Dorsal",
      "Bíceps Braquial",
      "Abdômen e Core"
    ],
    "equipment": "Elástico Extensor",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/banded-lat-pulldown/frame-1.png",
    "videoFrames": [
      "/exercises/frames/banded-lat-pulldown/frame-1.png",
      "/exercises/frames/banded-lat-pulldown/frame-2.png",
      "/exercises/frames/banded-lat-pulldown/frame-3.png"
    ],
    "alternatives": [
      "exercise-face-pull",
      "exercise-costas-06",
      "exercise-costas-03"
    ]
  },
  {
    "id": "exercise-banded-pallof-press",
    "name": "Banded Pallof Press",
    "category": "Core",
    "type": "livre",
    "muscleGroups": [
      "Abdômen e Core",
      "Glúteos",
      "Deltoides"
    ],
    "equipment": "Elástico Extensor",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/banded-pallof-press/frame-1.png",
    "videoFrames": [
      "/exercises/frames/banded-pallof-press/frame-1.png",
      "/exercises/frames/banded-pallof-press/frame-2.png",
      "/exercises/frames/banded-pallof-press/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-banded-woodchop",
    "name": "Banded Woodchop",
    "category": "Core",
    "type": "livre",
    "muscleGroups": [
      "Abdômen e Core",
      "Deltoides",
      "Glúteos"
    ],
    "equipment": "Elástico Extensor",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/banded-woodchop/frame-1.png",
    "videoFrames": [
      "/exercises/frames/banded-woodchop/frame-1.png",
      "/exercises/frames/banded-woodchop/frame-2.png",
      "/exercises/frames/banded-woodchop/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-banded-dead-bug",
    "name": "Banded Dead Bug",
    "category": "Core",
    "type": "livre",
    "muscleGroups": [
      "Abdômen e Core",
      "Glúteos",
      "Deltoides"
    ],
    "equipment": "Elástico Extensor",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/banded-dead-bug/frame-1.png",
    "videoFrames": [
      "/exercises/frames/banded-dead-bug/frame-1.png",
      "/exercises/frames/banded-dead-bug/frame-2.png",
      "/exercises/frames/banded-dead-bug/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-hollow-body-hold",
    "name": "Hollow Body Hold",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core",
      "Quadríceps"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/hollow-body-hold/frame-1.png",
    "videoFrames": [
      "/exercises/frames/hollow-body-hold/frame-1.png",
      "/exercises/frames/hollow-body-hold/frame-2.png",
      "/exercises/frames/hollow-body-hold/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-hollow-rock",
    "name": "Hollow Rock",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core",
      "Quadríceps"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/hollow-rock/frame-1.png",
    "videoFrames": [
      "/exercises/frames/hollow-rock/frame-1.png",
      "/exercises/frames/hollow-rock/frame-2.png",
      "/exercises/frames/hollow-rock/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-v-up",
    "name": "V-Up",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core",
      "Quadríceps"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/v-up/frame-1.png",
    "videoFrames": [
      "/exercises/frames/v-up/frame-1.png",
      "/exercises/frames/v-up/frame-2.png",
      "/exercises/frames/v-up/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-flutter-kick",
    "name": "Flutter Kick",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core",
      "Quadríceps"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/flutter-kick/frame-1.png",
    "videoFrames": [
      "/exercises/frames/flutter-kick/frame-1.png",
      "/exercises/frames/flutter-kick/frame-2.png",
      "/exercises/frames/flutter-kick/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-lying-leg-raise",
    "name": "Lying Leg Raise",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core",
      "Quadríceps"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/lying-leg-raise/frame-1.png",
    "videoFrames": [
      "/exercises/frames/lying-leg-raise/frame-1.png",
      "/exercises/frames/lying-leg-raise/frame-2.png",
      "/exercises/frames/lying-leg-raise/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-toe-touch",
    "name": "Toe Touch",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/toe-touch/frame-1.png",
    "videoFrames": [
      "/exercises/frames/toe-touch/frame-1.png",
      "/exercises/frames/toe-touch/frame-2.png",
      "/exercises/frames/toe-touch/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-heel-tap",
    "name": "Heel Tap",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/heel-tap/frame-1.png",
    "videoFrames": [
      "/exercises/frames/heel-tap/frame-1.png",
      "/exercises/frames/heel-tap/frame-2.png",
      "/exercises/frames/heel-tap/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-plank-shoulder-tap",
    "name": "Plank Shoulder Tap",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core",
      "Deltoides",
      "Peitoral Maior"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/plank-shoulder-tap/frame-1.png",
    "videoFrames": [
      "/exercises/frames/plank-shoulder-tap/frame-1.png",
      "/exercises/frames/plank-shoulder-tap/frame-2.png",
      "/exercises/frames/plank-shoulder-tap/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-plank-jack",
    "name": "Plank Jack",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core",
      "Deltoides",
      "Cardio"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/plank-jack/frame-1.png",
    "videoFrames": [
      "/exercises/frames/plank-jack/frame-1.png",
      "/exercises/frames/plank-jack/frame-2.png",
      "/exercises/frames/plank-jack/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-bear-plank",
    "name": "Bear Plank",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core",
      "Quadríceps",
      "Deltoides"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/bear-plank/frame-1.png",
    "videoFrames": [
      "/exercises/frames/bear-plank/frame-1.png",
      "/exercises/frames/bear-plank/frame-2.png",
      "/exercises/frames/bear-plank/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-bear-crawl",
    "name": "Bear Crawl",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core",
      "Deltoides",
      "Quadríceps",
      "Cardio"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/bear-crawl/frame-1.png",
    "videoFrames": [
      "/exercises/frames/bear-crawl/frame-1.png",
      "/exercises/frames/bear-crawl/frame-2.png",
      "/exercises/frames/bear-crawl/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-crab-walk",
    "name": "Crab Walk",
    "category": "Tríceps",
    "type": "peso corporal",
    "muscleGroups": [
      "Tríceps Braquial",
      "Glúteos",
      "Abdômen e Core",
      "Deltoides"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/crab-walk/frame-1.png",
    "videoFrames": [
      "/exercises/frames/crab-walk/frame-1.png",
      "/exercises/frames/crab-walk/frame-2.png",
      "/exercises/frames/crab-walk/frame-3.png"
    ],
    "alternatives": [
      "exercise-tricep-pushdown",
      "exercise-overhead-tricep-extension",
      "exercise-triceps-03"
    ]
  },
  {
    "id": "exercise-inchworm",
    "name": "Inchworm",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core",
      "Deltoides",
      "Isquiotibiais (Posterior)",
      "Peitoral Maior"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/inchworm/frame-1.png",
    "videoFrames": [
      "/exercises/frames/inchworm/frame-1.png",
      "/exercises/frames/inchworm/frame-2.png",
      "/exercises/frames/inchworm/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-l-sit-hold",
    "name": "L-Sit Hold",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core",
      "Tríceps Braquial",
      "Quadríceps",
      "Deltoides"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/l-sit-hold/frame-1.png",
    "videoFrames": [
      "/exercises/frames/l-sit-hold/frame-1.png",
      "/exercises/frames/l-sit-hold/frame-2.png",
      "/exercises/frames/l-sit-hold/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-seated-knee-tuck",
    "name": "Seated Knee Tuck",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core",
      "Quadríceps"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/seated-knee-tuck/frame-1.png",
    "videoFrames": [
      "/exercises/frames/seated-knee-tuck/frame-1.png",
      "/exercises/frames/seated-knee-tuck/frame-2.png",
      "/exercises/frames/seated-knee-tuck/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-side-plank-hip-dip",
    "name": "Side Plank Hip Dip",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core",
      "Deltoides",
      "Glúteos"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/side-plank-hip-dip/frame-1.png",
    "videoFrames": [
      "/exercises/frames/side-plank-hip-dip/frame-1.png",
      "/exercises/frames/side-plank-hip-dip/frame-2.png",
      "/exercises/frames/side-plank-hip-dip/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-copenhagen-plank",
    "name": "Copenhagen Plank",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core",
      "Quadríceps",
      "Glúteos"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/copenhagen-plank/frame-1.png",
    "videoFrames": [
      "/exercises/frames/copenhagen-plank/frame-1.png",
      "/exercises/frames/copenhagen-plank/frame-2.png",
      "/exercises/frames/copenhagen-plank/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-dragon-flag",
    "name": "Dragon Flag",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core",
      "Grande Dorsal",
      "Quadríceps"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "avançado",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/dragon-flag/frame-1.png",
    "videoFrames": [
      "/exercises/frames/dragon-flag/frame-1.png",
      "/exercises/frames/dragon-flag/frame-2.png",
      "/exercises/frames/dragon-flag/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-burpee",
    "name": "Burpee",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Membros Inferiores",
      "Peitoral Maior",
      "Deltoides",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/burpee/frame-1.png",
    "videoFrames": [
      "/exercises/frames/burpee/frame-1.png",
      "/exercises/frames/burpee/frame-2.png",
      "/exercises/frames/burpee/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-half-burpee",
    "name": "Half Burpee",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core",
      "Membros Inferiores",
      "Deltoides",
      "Cardio"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/half-burpee/frame-1.png",
    "videoFrames": [
      "/exercises/frames/half-burpee/frame-1.png",
      "/exercises/frames/half-burpee/frame-2.png",
      "/exercises/frames/half-burpee/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-squat-thrust",
    "name": "Squat Thrust",
    "category": "Core",
    "type": "peso corporal",
    "muscleGroups": [
      "Abdômen e Core",
      "Membros Inferiores",
      "Deltoides",
      "Cardio"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/squat-thrust/frame-1.png",
    "videoFrames": [
      "/exercises/frames/squat-thrust/frame-1.png",
      "/exercises/frames/squat-thrust/frame-2.png",
      "/exercises/frames/squat-thrust/frame-3.png"
    ],
    "alternatives": [
      "exercise-core-01",
      "exercise-side-plank",
      "exercise-core-03"
    ]
  },
  {
    "id": "exercise-high-knees",
    "name": "High Knees",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Membros Inferiores",
      "Abdômen e Core",
      "Cardio"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/high-knees/frame-1.png",
    "videoFrames": [
      "/exercises/frames/high-knees/frame-1.png",
      "/exercises/frames/high-knees/frame-2.png",
      "/exercises/frames/high-knees/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-jumping-jack",
    "name": "Jumping Jack",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Membros Inferiores",
      "Deltoides",
      "Panturrilhas",
      "Cardio"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/jumping-jack/frame-1.png",
    "videoFrames": [
      "/exercises/frames/jumping-jack/frame-1.png",
      "/exercises/frames/jumping-jack/frame-2.png",
      "/exercises/frames/jumping-jack/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-skater-hop",
    "name": "Skater Hop",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Membros Inferiores",
      "Glúteos",
      "Panturrilhas",
      "Cardio"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/skater-hop/frame-1.png",
    "videoFrames": [
      "/exercises/frames/skater-hop/frame-1.png",
      "/exercises/frames/skater-hop/frame-2.png",
      "/exercises/frames/skater-hop/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-lateral-shuffle",
    "name": "Lateral Shuffle",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Membros Inferiores",
      "Glúteos",
      "Panturrilhas",
      "Cardio"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/lateral-shuffle/frame-1.png",
    "videoFrames": [
      "/exercises/frames/lateral-shuffle/frame-1.png",
      "/exercises/frames/lateral-shuffle/frame-2.png",
      "/exercises/frames/lateral-shuffle/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-fast-feet",
    "name": "Fast Feet",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Panturrilhas",
      "Membros Inferiores",
      "Cardio"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/fast-feet/frame-1.png",
    "videoFrames": [
      "/exercises/frames/fast-feet/frame-1.png",
      "/exercises/frames/fast-feet/frame-2.png",
      "/exercises/frames/fast-feet/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-sprawl",
    "name": "Sprawl",
    "category": "Pernas",
    "type": "peso corporal",
    "muscleGroups": [
      "Membros Inferiores",
      "Abdômen e Core",
      "Deltoides",
      "Cardio"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/sprawl/frame-1.png",
    "videoFrames": [
      "/exercises/frames/sprawl/frame-1.png",
      "/exercises/frames/sprawl/frame-2.png",
      "/exercises/frames/sprawl/frame-3.png"
    ],
    "alternatives": [
      "exercise-pernas-06",
      "exercise-pernas-01",
      "exercise-front-squat"
    ]
  },
  {
    "id": "exercise-seal-jack",
    "name": "Seal Jack",
    "category": "Peito",
    "type": "peso corporal",
    "muscleGroups": [
      "Peitoral Maior",
      "Deltoides",
      "Membros Inferiores",
      "Cardio"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/seal-jack/frame-1.png",
    "videoFrames": [
      "/exercises/frames/seal-jack/frame-1.png",
      "/exercises/frames/seal-jack/frame-2.png",
      "/exercises/frames/seal-jack/frame-3.png"
    ],
    "alternatives": [
      "exercise-peito-02",
      "exercise-incline-bench-press",
      "exercise-peito-03"
    ]
  },
  {
    "id": "exercise-cat-cow-stretch",
    "name": "Cat-Cow Stretch",
    "category": "Mobilidade",
    "type": "peso corporal",
    "muscleGroups": [
      "Mobilidade Articular",
      "Dorsal e Costas",
      "Abdômen e Core"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/cat-cow-stretch/frame-1.png",
    "videoFrames": [
      "/exercises/frames/cat-cow-stretch/frame-1.png",
      "/exercises/frames/cat-cow-stretch/frame-2.png",
      "/exercises/frames/cat-cow-stretch/frame-3.png"
    ],
    "alternatives": [
      "exercise-arm-circles",
      "exercise-worlds-greatest-stretch",
      "exercise-leg-swings-stretch"
    ]
  },
  {
    "id": "exercise-arm-circles",
    "name": "Arm Circles",
    "category": "Mobilidade",
    "type": "peso corporal",
    "muscleGroups": [
      "Deltoides",
      "Peitoral Maior",
      "Trapézio e Rombóides",
      "Mobilidade Articular"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/arm-circles/frame-1.png",
    "videoFrames": [
      "/exercises/frames/arm-circles/frame-1.png",
      "/exercises/frames/arm-circles/frame-2.png",
      "/exercises/frames/arm-circles/frame-3.png"
    ],
    "alternatives": [
      "exercise-cat-cow-stretch",
      "exercise-worlds-greatest-stretch",
      "exercise-leg-swings-stretch"
    ]
  },
  {
    "id": "exercise-worlds-greatest-stretch",
    "name": "World's Greatest Stretch",
    "category": "Mobilidade",
    "type": "peso corporal",
    "muscleGroups": [
      "Mobilidade Articular",
      "Flexores do Quadril",
      "Isquiotibiais (Posterior)",
      "Trapézio e Rombóides"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/worlds-greatest-stretch/frame-1.png",
    "videoFrames": [
      "/exercises/frames/worlds-greatest-stretch/frame-1.png",
      "/exercises/frames/worlds-greatest-stretch/frame-2.png",
      "/exercises/frames/worlds-greatest-stretch/frame-3.png"
    ],
    "alternatives": [
      "exercise-cat-cow-stretch",
      "exercise-arm-circles",
      "exercise-leg-swings-stretch"
    ]
  },
  {
    "id": "exercise-leg-swings-stretch",
    "name": "Leg Swings",
    "category": "Mobilidade",
    "type": "peso corporal",
    "muscleGroups": [
      "Mobilidade Articular",
      "Flexores do Quadril",
      "Isquiotibiais (Posterior)",
      "Quadríceps"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/leg-swings-stretch/frame-1.png",
    "videoFrames": [
      "/exercises/frames/leg-swings-stretch/frame-1.png",
      "/exercises/frames/leg-swings-stretch/frame-2.png",
      "/exercises/frames/leg-swings-stretch/frame-3.png"
    ],
    "alternatives": [
      "exercise-cat-cow-stretch",
      "exercise-arm-circles",
      "exercise-worlds-greatest-stretch"
    ]
  },
  {
    "id": "exercise-torso-twist-stretch",
    "name": "Torso Twists",
    "category": "Mobilidade",
    "type": "peso corporal",
    "muscleGroups": [
      "Mobilidade Articular",
      "Abdômen e Core",
      "Dorsal e Costas"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/torso-twist-stretch/frame-1.png",
    "videoFrames": [
      "/exercises/frames/torso-twist-stretch/frame-1.png",
      "/exercises/frames/torso-twist-stretch/frame-2.png",
      "/exercises/frames/torso-twist-stretch/frame-3.png"
    ],
    "alternatives": [
      "exercise-cat-cow-stretch",
      "exercise-arm-circles",
      "exercise-worlds-greatest-stretch"
    ]
  },
  {
    "id": "exercise-doorway-chest-stretch",
    "name": "Doorway Chest Stretch",
    "category": "Mobilidade",
    "type": "peso corporal",
    "muscleGroups": [
      "Peitoral Maior",
      "Deltoides",
      "Mobilidade Articular"
    ],
    "equipment": "Batente / Apoio",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/doorway-chest-stretch/frame-1.png",
    "videoFrames": [
      "/exercises/frames/doorway-chest-stretch/frame-1.png",
      "/exercises/frames/doorway-chest-stretch/frame-2.png",
      "/exercises/frames/doorway-chest-stretch/frame-3.png"
    ],
    "alternatives": [
      "exercise-cat-cow-stretch",
      "exercise-arm-circles",
      "exercise-worlds-greatest-stretch"
    ]
  },
  {
    "id": "exercise-childs-pose",
    "name": "Child's Pose",
    "category": "Mobilidade",
    "type": "peso corporal",
    "muscleGroups": [
      "Dorsal e Costas",
      "Deltoides",
      "Flexores do Quadril",
      "Mobilidade Articular"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "intermediário",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/childs-pose/frame-1.png",
    "videoFrames": [
      "/exercises/frames/childs-pose/frame-1.png",
      "/exercises/frames/childs-pose/frame-2.png",
      "/exercises/frames/childs-pose/frame-3.png"
    ],
    "alternatives": [
      "exercise-cat-cow-stretch",
      "exercise-arm-circles",
      "exercise-worlds-greatest-stretch"
    ]
  },
  {
    "id": "exercise-kneeling-hip-flexor-stretch",
    "name": "Kneeling Hip Flexor Stretch",
    "category": "Mobilidade",
    "type": "peso corporal",
    "muscleGroups": [
      "Flexores do Quadril",
      "Quadríceps",
      "Mobilidade Articular"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/kneeling-hip-flexor-stretch/frame-1.png",
    "videoFrames": [
      "/exercises/frames/kneeling-hip-flexor-stretch/frame-1.png",
      "/exercises/frames/kneeling-hip-flexor-stretch/frame-2.png",
      "/exercises/frames/kneeling-hip-flexor-stretch/frame-3.png"
    ],
    "alternatives": [
      "exercise-cat-cow-stretch",
      "exercise-arm-circles",
      "exercise-worlds-greatest-stretch"
    ]
  },
  {
    "id": "exercise-hamstring-stretch",
    "name": "Hamstring Stretch",
    "category": "Mobilidade",
    "type": "peso corporal",
    "muscleGroups": [
      "Isquiotibiais (Posterior)",
      "Panturrilhas",
      "Mobilidade Articular"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/hamstring-stretch/frame-1.png",
    "videoFrames": [
      "/exercises/frames/hamstring-stretch/frame-1.png",
      "/exercises/frames/hamstring-stretch/frame-2.png",
      "/exercises/frames/hamstring-stretch/frame-3.png"
    ],
    "alternatives": [
      "exercise-cat-cow-stretch",
      "exercise-arm-circles",
      "exercise-worlds-greatest-stretch"
    ]
  },
  {
    "id": "exercise-standing-quad-stretch",
    "name": "Standing Quad Stretch",
    "category": "Mobilidade",
    "type": "peso corporal",
    "muscleGroups": [
      "Quadríceps",
      "Flexores do Quadril",
      "Mobilidade Articular"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/standing-quad-stretch/frame-1.png",
    "videoFrames": [
      "/exercises/frames/standing-quad-stretch/frame-1.png",
      "/exercises/frames/standing-quad-stretch/frame-2.png",
      "/exercises/frames/standing-quad-stretch/frame-3.png"
    ],
    "alternatives": [
      "exercise-cat-cow-stretch",
      "exercise-arm-circles",
      "exercise-worlds-greatest-stretch"
    ]
  },
  {
    "id": "exercise-seated-forward-fold-stretch",
    "name": "Seated Forward Fold",
    "category": "Mobilidade",
    "type": "peso corporal",
    "muscleGroups": [
      "Isquiotibiais (Posterior)",
      "Dorsal e Costas",
      "Panturrilhas",
      "Mobilidade Articular"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/seated-forward-fold-stretch/frame-1.png",
    "videoFrames": [
      "/exercises/frames/seated-forward-fold-stretch/frame-1.png",
      "/exercises/frames/seated-forward-fold-stretch/frame-2.png",
      "/exercises/frames/seated-forward-fold-stretch/frame-3.png"
    ],
    "alternatives": [
      "exercise-cat-cow-stretch",
      "exercise-arm-circles",
      "exercise-worlds-greatest-stretch"
    ]
  },
  {
    "id": "exercise-cross-body-shoulder-stretch",
    "name": "Cross-Body Shoulder Stretch",
    "category": "Mobilidade",
    "type": "peso corporal",
    "muscleGroups": [
      "Deltoides",
      "Trapézio e Rombóides",
      "Mobilidade Articular"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/cross-body-shoulder-stretch/frame-1.png",
    "videoFrames": [
      "/exercises/frames/cross-body-shoulder-stretch/frame-1.png",
      "/exercises/frames/cross-body-shoulder-stretch/frame-2.png",
      "/exercises/frames/cross-body-shoulder-stretch/frame-3.png"
    ],
    "alternatives": [
      "exercise-cat-cow-stretch",
      "exercise-arm-circles",
      "exercise-worlds-greatest-stretch"
    ]
  },
  {
    "id": "exercise-wall-calf-stretch",
    "name": "Wall Calf Stretch",
    "category": "Mobilidade",
    "type": "peso corporal",
    "muscleGroups": [
      "Panturrilhas",
      "Mobilidade Articular"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/wall-calf-stretch/frame-1.png",
    "videoFrames": [
      "/exercises/frames/wall-calf-stretch/frame-1.png",
      "/exercises/frames/wall-calf-stretch/frame-2.png",
      "/exercises/frames/wall-calf-stretch/frame-3.png"
    ],
    "alternatives": [
      "exercise-cat-cow-stretch",
      "exercise-arm-circles",
      "exercise-worlds-greatest-stretch"
    ]
  },
  {
    "id": "exercise-butterfly-stretch",
    "name": "Butterfly Stretch",
    "category": "Mobilidade",
    "type": "peso corporal",
    "muscleGroups": [
      "Flexores do Quadril",
      "Groin",
      "Mobilidade Articular"
    ],
    "equipment": "Peso Corporal",
    "difficulty": "iniciante",
    "instructions": "Orientações da Rafaela: Mantenha postura ereta, core ativado e estabilidade articular em todo o arco de movimento. Execute com respiração rítmica e cadência controlada nas fases concêntrica e excêntrica.",
    "imageUrl": "/exercises/frames/butterfly-stretch/frame-1.png",
    "videoFrames": [
      "/exercises/frames/butterfly-stretch/frame-1.png",
      "/exercises/frames/butterfly-stretch/frame-2.png",
      "/exercises/frames/butterfly-stretch/frame-3.png"
    ],
    "alternatives": [
      "exercise-cat-cow-stretch",
      "exercise-arm-circles",
      "exercise-worlds-greatest-stretch"
    ]
  }
];
