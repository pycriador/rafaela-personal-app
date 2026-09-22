import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { workoutRepository } from '../../repositories/workoutRepository';
import { WorkoutPlan, WorkoutDay, WorkoutSession, DayOfWeek } from '../../types';
import {
  Play,
  Flame,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Dumbbell,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const { user, studentProfile } = useAuth();
  const navigate = useNavigate();

  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Determine current day of week in Portuguese
  const daysMap: Record<number, DayOfWeek> = {
    0: 'Domingo',
    1: 'Segunda',
    2: 'Terça',
    3: 'Quarta',
    4: 'Quinta',
    5: 'Sexta',
    6: 'Sábado',
  };
  const todayDayOfWeek = daysMap[new Date().getDay()] || 'Segunda';

  useEffect(() => {
    async function load() {
      if (!studentProfile) return;
      const [plan, sess] = await Promise.all([
        workoutRepository.getPlanByStudentId(studentProfile.id),
        workoutRepository.getSessions(studentProfile.id),
      ]);
      setWorkoutPlan(plan);
      setSessions(sess);
      setLoading(false);
    }
    load();
  }, [studentProfile]);

  if (loading || !studentProfile) {
    return (
      <div className="py-12 flex justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Find today's workout or fallback to first available
  const todayWorkout: WorkoutDay | undefined =
    workoutPlan?.days.find((d) => d.dayOfWeek === todayDayOfWeek) ||
    workoutPlan?.days[0];

  const daysOfWeekOrder: DayOfWeek[] = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  return (
    <div className="space-y-6 pb-8">
      {/* Greeting Header (Section 27) */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Olá, {studentProfile.name.split(' ')[0]}! 👋
          </h1>
          <span className="text-xl">🔥</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-dark-muted">
          Meta ativa: <strong className="text-emerald-500">{studentProfile.goals.join(', ')}</strong>
        </p>
      </div>

      {/* Hero Card: Treino de Hoje (Section 19 & 27) */}
      {todayWorkout ? (
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white border-emerald-500/30 p-6 shadow-xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 font-extrabold text-xs tracking-wider uppercase border border-emerald-500/30">
                Treino de Hoje • {todayWorkout.dayOfWeek}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {todayWorkout.exercises.length} exercícios
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">
                {todayWorkout.name}
              </h2>
              <p className="text-xs text-emerald-300 font-medium mt-1">
                Foco muscular: {todayWorkout.muscleFocus}
              </p>
            </div>

            {/* Quick overview of exercises */}
            <div className="py-2 flex flex-wrap gap-1.5">
              {todayWorkout.exercises.slice(0, 4).map((ex, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-semibold bg-white/10 px-2.5 py-1 rounded-lg text-slate-200"
                >
                  {idx + 1}. {ex.sets}x{ex.reps} ({ex.weight}kg)
                </span>
              ))}
              {todayWorkout.exercises.length > 4 && (
                <span className="text-[11px] text-slate-400 self-center">
                  +{todayWorkout.exercises.length - 4} mais
                </span>
              )}
            </div>

            <Button
              variant="primary"
              size="xl"
              fullWidth
              onClick={() => navigate(`/student/workout/active/${todayWorkout.id}`)}
              leftIcon={<Play className="w-5 h-5 fill-current" />}
              className="text-base font-extrabold shadow-lg shadow-emerald-500/30 active:scale-[0.98]"
            >
              Começar Treino
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-6 text-center text-slate-400 text-xs">
          Nenhum treino programado para hoje. Aproveite para descansar ou revisar sua alimentação!
        </Card>
      )}

      {/* Calendário Semanal (Section 28) */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Semana de Treinos
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Frequência: {studentProfile.availableDays.length}x/semana
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {daysOfWeekOrder.map((d) => {
            const hasWorkout = workoutPlan?.days.some((wd) => wd.dayOfWeek === d);
            const isToday = d === todayDayOfWeek;
            return (
              <div
                key={d}
                className={`py-3 px-1 rounded-2xl flex flex-col items-center justify-between transition-all ${
                  isToday
                    ? 'ring-2 ring-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/30'
                    : hasWorkout
                    ? 'bg-slate-100 dark:bg-dark-cardElevated/80'
                    : 'bg-slate-50 dark:bg-dark-card/30 opacity-60'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {d.slice(0, 3)}
                </span>
                <div className="my-1.5">
                  {hasWorkout ? (
                    <Dumbbell className={`w-4 h-4 ${isToday ? 'text-emerald-500 animate-bounce' : 'text-slate-600 dark:text-slate-300'}`} />
                  ) : (
                    <span className="text-[10px] text-slate-400">•</span>
                  )}
                </div>
                <span className={`text-[9px] font-bold ${isToday ? 'text-emerald-500' : 'text-slate-500'}`}>
                  {hasWorkout ? 'Treino' : 'Descanso'}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Metrics Row (Section 27) */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Adesão Geral</span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
              {studentProfile.adherencePercentage}%
            </span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Sequência Atual</span>
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
              4 Semanas
            </span>
          </div>
        </Card>
      </div>

      {/* Quick Navigation to Evolution & Nutrition */}
      <div className="space-y-2">
        <button
          onClick={() => navigate('/student/evolution')}
          className="w-full p-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border flex items-center justify-between text-left hover:border-emerald-500/40 transition-colors shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-dark-cardElevated text-emerald-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Minha Evolução de Cargas
              </h4>
              <p className="text-xs text-slate-500">
                Veja o histórico do seu aumento de força
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
