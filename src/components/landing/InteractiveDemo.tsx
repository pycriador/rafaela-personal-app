import React, { useState } from 'react';
import { Play, Sparkles, Check, Info, ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ExerciseFramePlayer } from '../ui/ExerciseFramePlayer';

interface DemoExercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
  difficulty: string;
  muscles: string[];
  instructions: string;
  frames: string[];
  alternatives: string[];
}

export const InteractiveDemo: React.FC = () => {
  const sampleExercises: DemoExercise[] = [
    {
      id: 'bench-press',
      name: 'Supino Reto com Barra',
      category: 'Peito',
      equipment: 'Barra Olímpica e Banco Reto',
      difficulty: 'Intermediário',
      muscles: ['Peitoral Maior', 'Tríceps', 'Deltoide Anterior'],
      instructions:
        'Deite com os olhos alinhados à barra. Pegada ligeiramente mais larga que os ombros. Mantenha as escápulas aduzidas e os pés firmes no chão. Desça a barra de forma controlada até o terço médio do esterno.',
      frames: [
        '/exercises/frames/bench-press/frame-1.png',
        '/exercises/frames/bench-press/frame-2.png',
        '/exercises/frames/bench-press/frame-3.png',
      ],
      alternatives: ['Supino com Halteres', 'Supino Máquina Articulada'],
    },
    {
      id: 'squat',
      name: 'Agachamento Livre com Barra',
      category: 'Pernas',
      equipment: 'Barra Olímpica e Gaiola de Agachamento',
      difficulty: 'Avançado',
      muscles: ['Quadríceps', 'Glúteo Máximo', 'Isquiotibiais', 'Core'],
      instructions:
        'Apoie a barra sobre os trapézios (barra alta). Pés na largura dos ombros, pontas ligeiramente para fora. Inicie o movimento flexionando quadris e joelhos simultaneamente, descendo até que as coxas fiquem paralelas ao solo.',
      frames: [
        '/exercises/frames/squat/frame-1.png',
        '/exercises/frames/squat/frame-2.png',
        '/exercises/frames/squat/frame-3.png',
      ],
      alternatives: ['Leg Press 45°', 'Agachamento Hack'],
    },
    {
      id: 'lat-pulldown',
      name: 'Puxada Alta na Polia',
      category: 'Costas',
      equipment: 'Polia Alta com Barra Reta',
      difficulty: 'Iniciante',
      muscles: ['Latíssimo do Dorso', 'Redondo Maior', 'Bíceps Braquial'],
      instructions:
        'Segure a barra com pegada pronada aberta. Sente com as coxas bem travadas sob os rolos. Puxe a barra em direção ao peitoral superior sem inclinar o tronco excessivamente para trás.',
      frames: [
        '/exercises/frames/lat-pulldown/frame-1.png',
        '/exercises/frames/lat-pulldown/frame-2.png',
        '/exercises/frames/lat-pulldown/frame-3.png',
      ],
      alternatives: ['Remada Curvada', 'Remada Baixa no Triângulo'],
    },
    {
      id: 'lateral-raise',
      name: 'Elevação Lateral com Halteres',
      category: 'Ombros',
      equipment: 'Par de Halteres',
      difficulty: 'Iniciante',
      muscles: ['Deltoide Lateral'],
      instructions:
        'Fique em pé com os joelhos destravados e core ativo. Eleve os braços lateralmente com leve flexão nos cotovelos até a linha dos ombros, controlando rigorosamente a descida (fase excêntrica).',
      frames: [
        '/exercises/frames/lateral-raise/frame-1.png',
        '/exercises/frames/lateral-raise/frame-2.png',
        '/exercises/frames/lateral-raise/frame-3.png',
      ],
      alternatives: ['Elevação Lateral na Polia', 'Desenvolvimento Halteres'],
    },
    {
      id: 'overhead-triceps',
      name: 'Tríceps Francês com Halter',
      category: 'Tríceps',
      equipment: 'Halter Monomanual ou Bilateral',
      difficulty: 'Intermediário',
      muscles: ['Tríceps (Cabeça Longa)'],
      instructions:
        'Sentado ou em pé, mantenha o halter acima da cabeça com os cotovelos apontados para cima. Flexione os cotovelos descendo o peso atrás da nuca e estenda totalmente sem abrir os braços.',
      frames: [
        '/exercises/frames/overhead-tricep-extension/frame-1.png',
        '/exercises/frames/overhead-tricep-extension/frame-2.png',
        '/exercises/frames/overhead-tricep-extension/frame-3.png',
      ],
      alternatives: ['Tríceps Corda na Polia', 'Tríceps Testa'],
    },
  ];

  const [selectedId, setSelectedId] = useState(sampleExercises[0].id);
  const current = sampleExercises.find((e) => e.id === selectedId) || sampleExercises[0];

  const scrollToPlans = () => {
    document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="demonstracao" className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <Badge variant="brand" size="sm">
            Demonstração Interativa
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Experimente o catálogo animado do app agora mesmo.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-dark-muted">
            Selecione um dos exercícios abaixo para testar o player com controle de velocidade, fases de execução biomecânica e orientações técnicas da Rafaela.
          </p>
        </div>

        {/* Exercises Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {sampleExercises.map((ex) => (
            <button
              key={ex.id}
              onClick={() => setSelectedId(ex.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                selectedId === ex.id
                  ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-2xs font-semibold'
                  : 'bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/[0.15]'
              }`}
            >
              <span>{ex.name}</span>
              <span
                className={`text-[10px] uppercase px-1.5 py-0.2 rounded font-extrabold ${
                  selectedId === ex.id
                    ? 'bg-emerald-700/50 text-white'
                    : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-500'
                }`}
              >
                {ex.category}
              </span>
            </button>
          ))}
        </div>

        {/* Live Interactive Player Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Visual Player Left */}
          <div className="lg:col-span-7">
            <ExerciseFramePlayer
              frames={current.frames}
              fallbackImage={current.frames[0]}
              title={current.name}
              autoPlay={true}
              className="w-full h-full min-h-[380px]"
            />
          </div>

          {/* Biomechanical Details Card Right */}
          <Card className="lg:col-span-5 p-6 flex flex-col justify-between space-y-5 bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="brand" size="sm">
                  {current.category}
                </Badge>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-400">
                  Nível: {current.difficulty}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {current.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5 font-medium">
                  Equipamento: {current.equipment}
                </p>
              </div>

              {/* Muscles */}
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Músculos Alvo:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {current.muscles.map((m) => (
                    <span
                      key={m}
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Technical Instructions */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-dark-cardElevated/60 border border-slate-100 dark:border-dark-border/40 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  <Info className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Orientações de Postura (Rafaela):</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-dark-muted leading-relaxed">
                  &ldquo;{current.instructions}&rdquo;
                </p>
              </div>

              {/* Authorized Alternatives */}
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Substituições Autorizadas no App:
                </span>
                <div className="space-y-1">
                  {current.alternatives.map((alt) => (
                    <div
                      key={alt}
                      className="text-xs flex items-center gap-1.5 text-slate-600 dark:text-slate-300"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{alt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-dark-border/60">
              <Button
                variant="primary"
                className="w-full text-xs font-bold"
                onClick={scrollToPlans}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Quero treinar com essa metodologia
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
