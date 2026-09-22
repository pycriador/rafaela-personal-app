import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'Mariana Silva',
      role: 'Aluna há 8 meses • Plano Performance Pro',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      adherence: 96,
      result: '+4kg de massa magra • Zero dores no ombro',
      quote:
        'Eu vivia com dores no ombro ao treinar peito. A Rafaela ajustou minha pegada e me deu orientações biomecânicas que nenhum instrutor de sala me deu. Poder trocar o exercício ocupado pelo app sem perder tempo me salvou na rotina corrida!',
    },
    {
      name: 'João Pedro Santos',
      role: 'Aluno há 5 meses • Plano Total Fit (Treino + Nutri)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      adherence: 94,
      result: '-8.5kg de gordura • +35% de força geral',
      quote:
        'O combo de treino com a dieta ajustada pela nutricionista parceira foi a virada de chave. Eu achava que precisava passar fome para secar. As calorias e os macros no app facilitam demais as compras da semana.',
    },
    {
      name: 'Camila Oliveira',
      role: 'Aluna há 1 ano • Plano Elite VIP 1-on-1',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      adherence: 98,
      result: 'Definição abdominal e glúteos • Autonomia',
      quote:
        'As ilustrações animadas em 3 fases me deram a segurança que eu precisava para fazer agachamento livre e levantamento terra sem medo de lesionar a coluna. O suporte da Rafaela no WhatsApp é rápido e humano.',
    },
  ];

  return (
    <section id="depoimentos" className="py-16 sm:py-24 bg-slate-50/50 dark:bg-dark-card/30 border-y border-slate-200/80 dark:border-dark-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <Badge variant="brand" size="sm">
            Histórias de Transformação
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Resultados reais de quem treina com consistência e método.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-dark-muted">
            Veja o depoimento de alunos reais cadastrados no app e acompanhados de perto pela consultoria.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <Card
              key={idx}
              className="p-6 rounded-3xl bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border shadow-xs hover:border-emerald-500/50 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Rating stars & Quote Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-emerald-500/30" />
                </div>

                {/* Quote Text */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Result Pill */}
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{t.result}</span>
                </div>
              </div>

              {/* Student Bio Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-dark-border/60 flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-dark-border shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {t.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    {t.role}
                  </p>
                  <span className="text-[10px] font-mono font-bold text-emerald-500">
                    {t.adherence}% de assiduidade
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
