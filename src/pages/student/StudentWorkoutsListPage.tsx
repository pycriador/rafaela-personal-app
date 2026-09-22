import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { workoutRepository } from '../../repositories/workoutRepository';
import { exerciseRepository } from '../../repositories/exerciseRepository';
import { WorkoutPlan, Exercise } from '../../types';
import { Dumbbell, Play, Clock, Sparkles } from 'lucide-react';

export const StudentWorkoutsListPage: React.FC = () => {
  const { studentProfile } = useAuth();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [exercisesMap, setExercisesMap] = useState<Record<string, Exercise>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!studentProfile) return;
      const [p, exs] = await Promise.all([
        workoutRepository.getPlanByStudentId(studentProfile.id),
        exerciseRepository.getAll(),
      ]);
      setPlan(p);
      const map: Record<string, Exercise> = {};
      exs.forEach((e) => {
        map[e.id] = e;
      });
      setExercisesMap(map);
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

  if (!plan || plan.days.length === 0) {
    return (
      <Card className="py-12 text-center text-xs text-slate-400">
        Nenhum plano de treino atribuído no momento.
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Meus Treinos
        </h1>
        <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
          {plan.name} • Prescrito por Rafaela Personal
        </p>
      </div>

      <div className="space-y-4">
        {plan.days.map((day) => (
          <Card key={day.id} className="overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500 text-white font-black text-xs uppercase">
                  {day.dayOfWeek}
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {day.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-dark-muted">
                    {day.muscleFocus}
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/student/workout/active/${day.id}`)}
                leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
              >
                Iniciar
              </Button>
            </div>

            {/* List of exercises in this day */}
            <div className="divide-y divide-slate-100 dark:divide-dark-border/60 bg-slate-50 dark:bg-dark-cardElevated/40 rounded-2xl p-3">
              {day.exercises.map((item, idx) => {
                const ex = exercisesMap[item.exerciseId];
                return (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="font-mono font-bold text-slate-400">{idx + 1}.</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {ex?.name || 'Exercício'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-mono">
                      <span className="font-semibold text-emerald-500">
                        {item.sets} × {item.reps}
                      </span>
                      <span className="text-slate-400">({item.weight} kg)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
