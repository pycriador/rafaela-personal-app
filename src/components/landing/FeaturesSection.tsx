import React from 'react';
import {
  Film,
  Shuffle,
  Activity,
  LineChart,
  Apple,
  Smartphone,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <Film className="w-6 h-6 text-emerald-500" />,
      tag: 'Biblioteca Própria',
      title: '302 Exercícios em Mini Vídeos Locais',
      description:
        'Chega de abrir o YouTube na academia e esperar o anúncio acabar. Todas as ilustrações rodam em alta definição offline no app com visão em 3 fases (início, transição e pico de contração).',
    },
    {
      icon: <Shuffle className="w-6 h-6 text-emerald-500" />,
      tag: 'Inovação Exclusiva',
      title: 'Liberdade Monitorada & Trocas Seguras',
      description:
        'Aparelho ocupado na hora do pico? O app sugere apenas as variações biomecânicas pré-autorizadas pela Rafaela para o mesmo grupo muscular, mantendo o estímulo intacto.',
    },
    {
      icon: <Activity className="w-6 h-6 text-emerald-500" />,
      tag: 'Auditoria Profissional',
      title: 'Prescrito vs. Executado em Tempo Real',
      description:
        'A Rafaela acompanha no dashboard administrativo tudo o que você fez: se aumentou 2kg no supino, se pulou uma série por falta de tempo ou substituiu um halter.',
    },
    {
      icon: <LineChart className="w-6 h-6 text-emerald-500" />,
      tag: 'Resultados Visíveis',
      title: 'Evolução de Cargas & Bioimpedância',
      description:
        'Gráficos de sobrecarga progressiva, evolução de medidas corporais, registro fotográfico privativo e cálculo automático de aderência semanal aos treinos.',
    },
    {
      icon: <Apple className="w-6 h-6 text-emerald-500" />,
      tag: 'Integração CFN',
      title: 'Planos Alimentares com Nutricionista Esportiva',
      description:
        'Planos alimentares calculados sob medida por nutricionista credenciada, com distribuição de macros, calorias e tabela de substituições de alimentos do dia a dia.',
    },
    {
      icon: <Smartphone className="w-6 h-6 text-emerald-500" />,
      tag: 'Experiência Fluida',
      title: 'Feito para a Prática na Academia',
      description:
        'Bip de descanso entre séries, botões grandes e acessíveis com as mãos suadas, modo escuro de alto contraste para economizar bateria e sem poluição visual.',
    },
  ];

  return (
    <section id="recursos" className="py-16 sm:py-24 bg-slate-50/50 dark:bg-dark-card/30 border-y border-slate-200/80 dark:border-dark-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <Badge variant="brand" size="sm">
            Recursos do Aplicativo
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Tecnologia que coloca a Personal Trainer do seu lado em cada série.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-dark-muted leading-relaxed">
            Desenvolvido sob medida para solucionar as maiores frustrações de quem treina: dúvidas na postura, aparelhos ocupados e falta de acompanhamento próximo.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => (
            <Card
              key={idx}
              className="p-6 rounded-2xl hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 bg-white dark:bg-dark-card flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-400">
                    {item.tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-dark-border/40 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Disponível em todos os planos</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
