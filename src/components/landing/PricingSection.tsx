import React, { useState } from 'react';
import { Check, Star, Sparkles, Apple, Dumbbell, ShieldCheck, ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { PlanItem } from './CheckoutModal';

interface PricingSectionProps {
  onSelectPlan: (plan: PlanItem) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  const [activeTab, setActiveTab] = useState<'treino' | 'combo'>('treino');
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'trimestral'>('mensal');

  const discount = billingCycle === 'trimestral' ? 0.85 : 1; // 15% discount for quarterly

  const workoutPlans: PlanItem[] = [
    {
      id: 'start-treino',
      name: 'Start Essencial',
      category: 'treino',
      price: Math.round(89 * discount),
      period: '/mês',
      description: 'Ideal para quem busca autonomia com uma ficha estruturada e postura correta.',
      features: [
        'Ficha de treino individualizada (mensal)',
        'Acesso total ao app com 302 exercícios animados',
        'Registro de cargas e histórico de treinos',
        'Instruções técnicas de execução da Rafaela',
        'Bip e temporizador de descanso automático',
        'Suporte via chat da plataforma a cada 15 dias',
      ],
    },
    {
      id: 'pro-treino',
      name: 'Performance Pro',
      category: 'treino',
      popular: true,
      tag: 'Mais Escolhido',
      price: Math.round(149 * discount),
      period: '/mês',
      description: 'O método completo para hipertrofia, definição e evolução de cargas contínua.',
      features: [
        'Tudo do Plano Start Essencial',
        'Periodização técnica atualizada a cada 4 semanas',
        'Liberdade monitorada: trocas autorizadas pelo app',
        'Análise de vídeos da sua execução postural por mensagem',
        'Suporte prioritário via WhatsApp direto com a Rafaela',
        'Módulo de evolução: dobras, peso e bioimpedância',
        'Ajustes de carga registrados e auditados em tempo real',
      ],
    },
    {
      id: 'elite-treino',
      name: 'Elite VIP 1-on-1',
      category: 'treino',
      tag: 'Exclusivo',
      price: Math.round(279 * discount),
      period: '/mês',
      description: 'Acompanhamento VIP com contato contínuo e ajustes em tempo real.',
      features: [
        'Tudo do Plano Performance Pro',
        'Ajustes ilimitados de treinos e rotinas',
        'Avaliação física mensal por videoconferência',
        'Análise profunda de mobilidade articular e encurtamentos',
        'Treinos adaptados para viagens, hotéis e feriados',
        'Linha direta de atendimento no mesmo dia',
      ],
    },
  ];

  const comboPlans: PlanItem[] = [
    {
      id: 'total-fit-combo',
      name: 'Total Fit (Treino + Nutri)',
      category: 'combo',
      popular: true,
      tag: 'Melhor Custo-Benefício',
      price: Math.round(249 * discount),
      period: '/mês',
      description: 'Treino de alta performance e nutrição esportiva caminhando juntos para resultados 3x mais rápidos.',
      features: [
        'Todo o Treino Performance Pro da Rafaela',
        'Plano alimentar sob medida com Nutricionista Esportiva (CFN)',
        'Cálculo de calorias e distribuição precisa de macronutrientes',
        'Tabela interativa de substituições de alimentos no app',
        'Consulta online mensal de 45 min com a nutricionista',
        'Ajuste das metas nutricionais de acordo com as fases do treino',
        'Suporte unificado via WhatsApp com ambas as profissionais',
      ],
    },
    {
      id: 'transformacao-360-combo',
      name: 'Transformação 360° VIP',
      category: 'combo',
      tag: 'Transformação Total',
      price: Math.round(399 * discount),
      period: '/mês',
      description: 'O mais completo ecossistema de saúde, performance estética e modulação metabólica.',
      features: [
        'Todo o Treino Elite VIP 1-on-1 da Rafaela',
        'Acompanhamento nutricional contínuo com a nutricionista parceira',
        'Reuniões quinzenais conjuntas (Rafaela + Nutricionista)',
        'Interpretação e acompanhamento de exames laboratoriais',
        'Prescrição orientada de suplementação e fitoterápicos',
        'Monitoramento semanal de medidas corporais e bioimpedância',
        'Atendimento prioritário diário em canal exclusivo',
      ],
    },
  ];

  const currentPlans = activeTab === 'treino' ? workoutPlans : comboPlans;

  return (
    <section id="planos" className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <Badge variant="brand" size="sm">
            Investimento Transparente
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Escolha o nível de acompanhamento ideal para você.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-dark-muted">
            Planos sem taxa de matrícula e sem fidelidade obrigatória. Cancele ou mude de plano quando desejar.
          </p>
        </div>

        {/* Tab Selector: Treino vs Treino + Nutri */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <div className="p-1 rounded-2xl bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border flex items-center">
            <button
              onClick={() => setActiveTab('treino')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'treino'
                  ? 'bg-white dark:bg-dark-cardElevated text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-dark-border'
                  : 'text-slate-500 dark:text-dark-muted hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Dumbbell className="w-4 h-4 text-emerald-500" />
              <span>Apenas Treinamento (3 Planos)</span>
            </button>
            <button
              onClick={() => setActiveTab('combo')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'combo'
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25 ring-1 ring-emerald-400'
                  : 'text-slate-500 dark:text-dark-muted hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Apple className="w-4 h-4" />
              <span>Treino + Nutricionista (2 Planos)</span>
              <span className="text-[10px] uppercase font-black px-1.5 py-0.2 rounded bg-white/20 ml-1">
                Combo
              </span>
            </button>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setBillingCycle('mensal')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                billingCycle === 'mensal'
                  ? 'bg-slate-200 dark:bg-dark-cardElevated text-slate-900 dark:text-white'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle('trimestral')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                billingCycle === 'trimestral'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>Trimestral</span>
              <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-emerald-500 text-white">
                -15% OFF
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div
          className={`grid gap-6 ${
            activeTab === 'treino'
              ? 'grid-cols-1 md:grid-cols-3'
              : 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
          }`}
        >
          {currentPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative p-6 sm:p-7 rounded-3xl flex flex-col justify-between transition-all duration-200 bg-white dark:bg-dark-card border ${
                plan.popular
                  ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Highlight Tag */}
              {plan.tag && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md shadow-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{plan.tag}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-dark-muted mt-1 leading-relaxed min-h-[36px]">
                    {plan.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="pt-2 pb-3 border-y border-slate-100 dark:border-dark-border/60">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-slate-400 font-semibold">R$</span>
                    <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {plan.period}
                    </span>
                  </div>
                  {billingCycle === 'trimestral' && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 block">
                      Cobrado trimestralmente com desconto
                    </span>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block uppercase tracking-wider text-[11px]">
                    O que está incluso:
                  </span>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-dark-border/60">
                <Button
                  variant={plan.popular ? 'primary' : 'secondary'}
                  className="w-full text-xs font-bold shadow-xs py-3"
                  onClick={() => onSelectPlan(plan)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Começar no {plan.name}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Security & Guarantee Footer */}
        <div className="mt-12 text-center text-xs text-slate-500 dark:text-dark-muted flex flex-wrap items-center justify-center gap-6">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Garantia incondicional de 7 dias
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Pagamento seguro via Pix ou Cartão
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Cancelamento sem burocracia
          </span>
        </div>
      </div>
    </section>
  );
};
