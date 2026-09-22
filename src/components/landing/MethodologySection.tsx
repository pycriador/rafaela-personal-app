import React from 'react';
import { Award, Target, Video, TrendingUp, CheckCircle, HeartPulse } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const MethodologySection: React.FC = () => {
  const steps = [
    {
      num: '01',
      icon: <Target className="w-5 h-5 text-emerald-500" />,
      title: 'Anamnese Completa & Mapeamento de Desvios',
      description:
        'Avaliamos suas restrições articulares, histórico de dores (coluna, joelhos, ombros) e rotina semanal antes de prescrever uma única repetição.',
    },
    {
      num: '02',
      icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
      title: 'Periodização Científica Sem Fichas Genéricas',
      description:
        'Seu treino é estruturado em blocos evolutivos. Alternamos estímulos tensionais e metabólicos para maximizar o ganho de massa magra sem lesões.',
    },
    {
      num: '03',
      icon: <Video className="w-5 h-5 text-emerald-500" />,
      title: 'Feedback Técnico de Postura por Vídeo',
      description:
        'Ficou em dúvida na execução do agachamento ou levantamento terra? Grave seu movimento e envie pelo canal exclusivo para correção de alinhamento articular.',
    },
    {
      num: '04',
      icon: <HeartPulse className="w-5 h-5 text-emerald-500" />,
      title: 'Ajustes Contínuos de Carga e Volume',
      description:
        'Conforme seu corpo responde e você registra seus treinos no app, os pesos e o volume de séries são refinados para garantir evolução constante.',
    },
  ];

  return (
    <section id="metodologia" className="py-16 sm:py-24 bg-slate-50/50 dark:bg-dark-card/30 border-y border-slate-200/80 dark:border-dark-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Rafaela Trainer Presentation */}
          <div className="lg:col-span-5 space-y-6">
            <Badge variant="brand" size="sm">
              Conheça a Treinadora
            </Badge>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Metodologia lapidada em biomecânica e anos de prática.
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-dark-muted leading-relaxed">
              Olá! Sou a <strong>Rafaela</strong>, Personal Trainer com registro profissional no <strong>CREF</strong> e pós-graduada em Fisiologia do Exercício e Biomecânica.
            </p>

            <p className="text-sm sm:text-base text-slate-600 dark:text-dark-muted leading-relaxed">
              Criei este ecossistema para entregar às minhas alunas o mesmo nível de cuidado e precisão que um atleta de alto rendimento recebe — com autonomia, clareza e tecnologia que realmente funciona na prática da academia.
            </p>

            <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-xs space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Award className="w-4 h-4 text-emerald-500" />
                <span>Credenciais & Garantias Éticas:</span>
              </div>
              <ul className="text-xs text-slate-600 dark:text-dark-muted space-y-1.5">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Profissional de Educação Física registrada no CREF</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Especialização em Hipertrofia e Biomecânica Aplicada</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Planos de alimentação validados por Nutricionista Esportiva (CFN)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: 4 Step Pillars Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {steps.map((st) => (
              <Card
                key={st.num}
                className="p-5 rounded-2xl bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      Passo {st.num}
                    </span>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-dark-cardElevated">
                      {st.icon}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {st.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-dark-muted leading-relaxed">
                    {st.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
