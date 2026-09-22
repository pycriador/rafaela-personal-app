import React from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Star, Users, Flame, Dumbbell } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ExerciseFramePlayer } from '../ui/ExerciseFramePlayer';

export const HeroSection: React.FC = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24">
      {/* Background Glows & Patterns */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 dark:bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Metodologia Biomecânica de Elite • CREF Ativo</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
              Treinamento personalizado com a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500">
                ciência e precisão
              </span>{' '}
              que seu corpo merece.
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-dark-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Chega de fichas genéricas de gaveta. Tenha periodização individualizada, mais de 300 movimentos animados com instruções posturais em alta resolução, liberdade monitorada para troca de exercícios e acompanhamento nutricional esportivo de verdade.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => scrollTo('planos')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto text-sm font-bold shadow-lg shadow-emerald-500/25 px-8"
              >
                Conhecer os Planos & Começar
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => scrollTo('demonstracao')}
                className="w-full sm:w-auto text-sm font-bold"
              >
                Testar Exercício ao Vivo
              </Button>
            </div>

            {/* Trust Points */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-500 dark:text-dark-muted font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Prescrição 100% Individual
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Suporte Direto com a Rafaela
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Sem Multa de Fidelidade
              </span>
            </div>
          </div>

          {/* Right Interactive Mockup Column */}
          <div className="lg:col-span-5 relative">
            {/* Decorative Floating Cards */}
            <div className="relative mx-auto max-w-sm sm:max-w-md">
              {/* Outer Phone/App Container */}
              <div className="relative rounded-3xl bg-slate-950 p-4 shadow-2xl border border-slate-800 shadow-emerald-500/10">
                {/* Header inside phone mockup */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-white tracking-wide">
                      Treino A • Em Execução
                    </span>
                  </div>
                  <Badge variant="brand" size="sm">
                    Mariana Silva
                  </Badge>
                </div>

                {/* Real Vector Frame Player (Bench Press) */}
                <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 mb-3">
                  <ExerciseFramePlayer
                    compact
                    frames={[
                      '/exercises/frames/bench-press/frame-1.png',
                      '/exercises/frames/bench-press/frame-2.png',
                      '/exercises/frames/bench-press/frame-3.png',
                    ]}
                    fallbackImage="/exercises/frames/bench-press/frame-1.png"
                    title="Supino Reto com Barra"
                    autoPlay={true}
                    className="h-48 sm:h-52 w-full"
                  />
                  <div className="p-3 bg-slate-900/90 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase">
                        Supino Reto com Barra
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Peitoral Maior • Tríceps • Deltoides
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      4x10 @ 32kg
                    </span>
                  </div>
                </div>

                {/* Active Prescribed Feedback & Load Adjustment Pill */}
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white block text-[11px]">
                        Liberdade de Carga Autorizada
                      </span>
                      <span className="text-[10px] text-emerald-200">
                        Carga aumentada de 30kg para 32kg (+2kg)
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-black uppercase">
                    Salvo
                  </span>
                </div>
              </div>

              {/* Floating Badge Bottom-Right */}
              <div className="absolute -bottom-4 -right-4 sm:-right-6 p-3 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-xl flex items-center gap-3 backdrop-blur-md">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-black text-slate-900 dark:text-white">4.9 / 5.0</span>
                    <span className="text-[10px] text-slate-400">(+120 avaliações)</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-dark-muted">
                    96% de assiduidade nos treinos
                  </span>
                </div>
              </div>

              {/* Floating Badge Top-Left */}
              <div className="absolute -top-4 -left-4 sm:-left-6 p-3 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-xl flex items-center gap-2.5 backdrop-blur-md">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    302 Exercícios
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Animações quadro a quadro
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Social Proof Bar */}
        <div className="mt-16 pt-8 border-t border-slate-200/80 dark:border-dark-border/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              +500
            </span>
            <p className="text-xs text-slate-500 dark:text-dark-muted font-medium mt-1">
              Alunas e alunos orientados
            </p>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              302
            </span>
            <p className="text-xs text-slate-500 dark:text-dark-muted font-medium mt-1">
              Exercícios animados no catálogo
            </p>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              96%
            </span>
            <p className="text-xs text-slate-500 dark:text-dark-muted font-medium mt-1">
              Taxa média de adesão aos treinos
            </p>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              100%
            </span>
            <p className="text-xs text-slate-500 dark:text-dark-muted font-medium mt-1">
              Conformidade ética CREF & CFN
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
