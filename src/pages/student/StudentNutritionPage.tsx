import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { nutritionRepository } from '../../repositories/nutritionRepository';
import { NutritionPlan } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Apple, Clock, AlertTriangle, ArrowRightLeft } from 'lucide-react';

export const StudentNutritionPage: React.FC = () => {
  const { studentProfile } = useAuth();
  const [nutrition, setNutrition] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!studentProfile) return;
      const nut = await nutritionRepository.getByStudentId(studentProfile.id);
      setNutrition(nut);
      setLoading(false);
    }
    load();
  }, [studentProfile]);

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Minha Alimentação
        </h1>
        <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
          {nutrition?.goal || 'Plano de apoio e orientações demonstrativas'}
        </p>
      </div>

      {/* Mandatory Disclaimer (Section 32 & 34) */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
        <div>
          <strong className="block font-bold">Conteúdo Demonstrativo:</strong>
          Orientações com foco em consistência e opções de substituição. Orientações individualizadas devem ser prescritas por nutricionista habilitado.
        </div>
      </div>

      {nutrition ? (
        <div className="space-y-4">
          {nutrition.meals.map((meal) => (
            <Card key={meal.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-dark-border/60">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {meal.name}
                  </h3>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-500 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{meal.time}</span>
                </div>
              </div>

              <div className="space-y-2">
                {meal.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-dark-cardElevated/50 text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center font-bold text-slate-800 dark:text-slate-200">
                      <span>{item.name}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-normal">
                        {item.quantity}
                      </span>
                    </div>

                    {item.substitutions && item.substitutions.length > 0 && (
                      <div className="flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-slate-900/40 p-1.5 rounded-lg">
                        <ArrowRightLeft className="w-3 h-3 text-cyan-500 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-cyan-600 dark:text-cyan-400">Substituir por:</strong>{' '}
                          {item.substitutions.join(' ou ')}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {meal.notes && (
                <p className="text-[11px] text-slate-500 italic">
                  Obs: {meal.notes}
                </p>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12 text-center text-xs text-slate-400">
          Nenhum plano alimentar cadastrado.
        </Card>
      )}
    </div>
  );
};
