import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { workoutRepository } from '../../repositories/workoutRepository';
import { messageRepository } from '../../repositories/messageRepository';
import { WorkoutPlan, WorkoutDay, WorkoutSession, DayOfWeek, StudentMessage, FormApplication, Form } from '../../types';
import { formApplicationService } from '../../services/anamnesis/formApplicationService';
import { formService } from '../../services/anamnesis/formService';
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
  MessageSquare,
  Sparkles,
  HelpCircle,
  Moon,
  ChevronRight,
  ClipboardList,
} from 'lucide-react';

const DAYS_MAP: Record<number, DayOfWeek> = {
  0: 'Domingo',
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sábado',
};

const DAYS_OF_WEEK_ORDER: DayOfWeek[] = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export const StudentDashboardPage: React.FC = () => {
  const { user, studentProfile } = useAuth();
  const navigate = useNavigate();

  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [messages, setMessages] = useState<StudentMessage[]>([]);
  const [pendingApps, setPendingApps] = useState<FormApplication[]>([]);
  const [formsMap, setFormsMap] = useState<Record<string, Form>>({});
  const [loading, setLoading] = useState(true);

  const todayDayOfWeek = DAYS_MAP[new Date().getDay()] || 'Segunda';

  useEffect(() => {
    async function load() {
      if (!studentProfile) return;
      const targetId = studentProfile.userId || studentProfile.id;
      const [plan, sess, msgs, apps, allForms] = await Promise.all([
        workoutRepository.getPlanByStudentId(targetId),
        workoutRepository.getSessions(targetId),
        messageRepository.getMessagesByStudentId(targetId),
        formApplicationService.getApplicationsByStudentId(targetId).then(async (res) => {
          if (res && res.length > 0) return res;
          return studentProfile.id ? formApplicationService.getApplicationsByStudentId(studentProfile.id) : [];
        }),
        formService.getForms(),
      ]);
      setWorkoutPlan(plan);
      setSessions(sess);
      setMessages(msgs);
      setPendingApps(apps.filter((a: FormApplication) => a.status === 'pending' || a.status === 'in_progress'));
      const fMap: Record<string, Form> = {};
      allForms.forEach((f: Form) => {
        fMap[f.id] = f;
      });
      setFormsMap(fMap);
      setLoading(false);
    }
    load();
  }, [studentProfile]);

  // Completed & Incomplete sessions
  const completedSessions = useMemo(() => sessions.filter((s) => s.status === 'completed'), [sessions]);

  // Real adherence calculation
  const adherencePercentage = useMemo(() => {
    if (sessions.length === 0) return 100;
    return Math.round((completedSessions.length / sessions.length) * 100);
  }, [sessions, completedSessions]);

  // Check if today has a scheduled workout in active plan
  const todayWorkout: WorkoutDay | undefined = useMemo(() => {
    return workoutPlan?.days.find((d) => d.dayOfWeek === todayDayOfWeek);
  }, [workoutPlan, todayDayOfWeek]);

  // Check if today's workout has already been completed today
  const isTodayCompleted = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return sessions.some((s) => {
      const sDate = s.date?.split('T')[0];
      return (sDate === todayStr || (todayWorkout && s.workoutDayName === todayWorkout.name)) && s.status === 'completed';
    });
  }, [sessions, todayWorkout]);

  // Compute next workout if today is rest or already completed
  const nextWorkoutInfo = useMemo(() => {
    if (!workoutPlan || workoutPlan.days.length === 0) return null;
    const now = new Date();

    for (let i = 1; i <= 7; i++) {
      const target = new Date(now);
      target.setDate(now.getDate() + i);
      const dayName = DAYS_MAP[target.getDay()];
      const scheduled = workoutPlan.days.find((d) => d.dayOfWeek === dayName);
      if (scheduled) {
        const dateFormatted = target.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        return {
          dayName,
          name: scheduled.name,
          muscleFocus: scheduled.muscleFocus,
          exerciseCount: scheduled.exercises.length,
          dateFormatted,
          inDays: i,
          workoutDayId: scheduled.id,
        };
      }
    }
    return null;
  }, [workoutPlan]);

  // Current calendar week (Monday to Sunday) with real calendar dates
  const currentWeekDays = useMemo(() => {
    const now = new Date();
    const currentDayIndex = (now.getDay() + 6) % 7; // Segunda = 0
    const monday = new Date(now);
    monday.setDate(now.getDate() - currentDayIndex);

    return DAYS_OF_WEEK_ORDER.map((dayName, idx) => {
      const curDate = new Date(monday);
      curDate.setDate(monday.getDate() + idx);
      const dateFormatted = curDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const curDateStr = curDate.toISOString().split('T')[0];
      const isToday = dayName === todayDayOfWeek;
      const workout = workoutPlan?.days.find((wd) => wd.dayOfWeek === dayName);

      const isCompleted = sessions.some((s) => {
        const sDate = s.date?.split('T')[0];
        return (sDate === curDateStr || (workout && s.workoutDayName === workout.name)) && s.status === 'completed';
      });

      return {
        dayName,
        dateFormatted,
        isToday,
        workout,
        isCompleted,
      };
    });
  }, [workoutPlan, sessions, todayDayOfWeek]);

  // Last message from trainer or count of unread
  const lastTrainerMessage = useMemo(() => {
    return [...messages].reverse().find((m) => m.senderRole === 'personal');
  }, [messages]);

  if (loading || !studentProfile) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Carregando seu painel de treinos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Olá, {studentProfile.name.split(' ')[0]}! 👋
            </h1>
            <span className="text-xl">🔥</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
            Meta ativa: <strong className="text-emerald-500">{studentProfile.goals.join(', ')}</strong> • Frequência:{' '}
            <strong>{studentProfile.availableDays.length}x na semana</strong>
          </p>
        </div>

        <Badge variant="success" size="sm" className="self-start sm:self-auto font-mono text-[11px] py-1 px-2.5">
          Ficha: {workoutPlan?.name || 'Rotina Personalizada'}
        </Badge>
      </div>

      {/* Alerta de Formulário / Anamnese Pendente (Section 7, 72) */}
      {pendingApps.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-orange-500/15 border-amber-500/40 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {pendingApps.length === 1
                      ? 'Formulário de Saúde Pendente'
                      : `${pendingApps.length} Formulários Pendentes`}
                  </h4>
                  <Badge variant="warning" size="sm">
                    {pendingApps[0].isMandatory ? 'Obrigatório' : 'Pendente'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-dark-muted mt-0.5">
                  {formsMap[pendingApps[0].formId]?.name || 'Anamnese'} • Preencha para que a sua treinadora oriente seus treinos com máxima segurança.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/student/anamnesis/fill/${pendingApps[0].id}`)}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-none shrink-0"
            >
              Responder Agora
            </Button>
          </div>
        </Card>
      )}

      {/* Responsive Multi-column Grid for Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Main Column: Treino de Hoje + Calendário Semanal */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Hero Card: Treino de Hoje OU Dia de Descanso */}
          {todayWorkout ? (
            isTodayCompleted ? (
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white border-emerald-500/30 p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/30 text-emerald-300 font-extrabold text-xs tracking-wider uppercase border border-emerald-500/40 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Treino de Hoje Concluído! 🎉
                  </span>
                  <span className="text-xs text-emerald-200/80 font-mono">
                    {todayWorkout.dayOfWeek} • {todayWorkout.name}
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-black text-white">Parabéns pelo treino de hoje!</h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Sua frequência foi registrada com sucesso. Descanse, mantenha a hidratação e acompanhe sua evolução de cargas.
                  </p>
                </div>

                {nextWorkoutInfo && (
                  <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Próximo Treino Agendado</span>
                      <span className="font-bold text-white">
                        {nextWorkoutInfo.dayName} ({nextWorkoutInfo.dateFormatted}) • {nextWorkoutInfo.name}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/student/workouts`)}
                      className="bg-white/15 hover:bg-white/25 text-white border-white/20 text-xs shrink-0 cursor-pointer"
                    >
                      Ver Ficha
                    </Button>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white border-emerald-500/30 p-6 shadow-xl space-y-5">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 font-extrabold text-xs tracking-wider uppercase border border-emerald-500/30">
                      Treino de Hoje • {todayWorkout.dayOfWeek}
                    </span>
                    <span className="text-xs text-slate-400 font-medium font-mono">
                      {todayWorkout.exercises.length} exercícios programados
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{todayWorkout.name}</h2>
                    <p className="text-xs sm:text-sm text-emerald-300 font-medium mt-1">Foco muscular: {todayWorkout.muscleFocus}</p>
                  </div>

                  {/* Previa dos exercicios */}
                  <div className="py-1 flex flex-wrap gap-1.5">
                    {todayWorkout.exercises.slice(0, 5).map((ex, idx) => (
                      <span key={idx} className="text-xs font-semibold bg-white/10 px-3 py-1.5 rounded-lg text-slate-200">
                        {idx + 1}. {ex.sets}x{ex.reps} ({ex.weight}kg)
                      </span>
                    ))}
                    {todayWorkout.exercises.length > 5 && (
                      <span className="text-xs text-slate-400 self-center">
                        +{todayWorkout.exercises.length - 5} mais
                      </span>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    size="xl"
                    fullWidth
                    onClick={() => navigate(`/student/workout/active/${todayWorkout.id}`)}
                    leftIcon={<Play className="w-5 h-5 fill-current" />}
                    className="text-base font-extrabold shadow-lg shadow-emerald-500/30 active:scale-[0.98] cursor-pointer"
                  >
                    Começar Treino de Hoje
                  </Button>
                </div>
              </Card>
            )
          ) : (
            <Card className="p-6 relative overflow-hidden bg-slate-900 text-white border-slate-800 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-400 font-extrabold text-xs tracking-wider uppercase border border-amber-500/30 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5" />
                  Dia de Descanso & Recuperação
                </span>
                <span className="text-xs text-slate-400 font-mono">Hoje ({todayDayOfWeek})</span>
              </div>

              <div>
                <h2 className="text-lg font-black text-white">Nenhum treino programado para hoje.</h2>
                <p className="text-xs text-slate-400 mt-1">
                  O descanso faz parte fundamental dos seus resultados de hipertrofia e queima de gordura.
                </p>
              </div>

              {nextWorkoutInfo && (
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Próximo Treino ({nextWorkoutInfo.dayName} • {nextWorkoutInfo.dateFormatted})
                    </span>
                    <span className="font-bold text-white">
                      {nextWorkoutInfo.name} ({nextWorkoutInfo.muscleFocus})
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/student/workout/active/${nextWorkoutInfo.workoutDayId}`)}
                    className="text-xs shrink-0 cursor-pointer"
                  >
                    Antecipar Treino
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Calendário Semanal Real (Segunda a Domingo com datas) */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Semana Atual de Treinos</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {completedSessions.length} sessões concluídas no total
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
              {currentWeekDays.map((d) => {
                return (
                  <div
                    key={d.dayName}
                    className={`py-3 px-1 sm:px-2 rounded-2xl flex flex-col items-center justify-between transition-all ${
                      d.isToday
                        ? 'ring-2 ring-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/30'
                        : d.isCompleted
                        ? 'bg-emerald-500/15 border border-emerald-500/30'
                        : d.workout
                        ? 'bg-slate-100 dark:bg-dark-cardElevated/80'
                        : 'bg-slate-50 dark:bg-dark-card/30 opacity-60'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">{d.dayName.slice(0, 3)}</span>
                      <span className="text-[10px] sm:text-xs font-mono text-slate-500 block">{d.dateFormatted}</span>
                    </div>

                    <div className="my-2">
                      {d.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                      ) : d.workout ? (
                        <Dumbbell className={`w-4 h-4 sm:w-5 sm:h-5 ${d.isToday ? 'text-emerald-500 animate-bounce' : 'text-slate-600 dark:text-slate-300'}`} />
                      ) : (
                        <span className="text-xs text-slate-400">•</span>
                      )}
                    </div>

                    <span
                      className={`text-[9px] sm:text-[10px] font-bold ${
                        d.isCompleted
                          ? 'text-emerald-500'
                          : d.isToday
                          ? 'text-emerald-500'
                          : d.workout
                          ? 'text-slate-700 dark:text-slate-300'
                          : 'text-slate-400'
                      }`}
                    >
                      {d.isCompleted ? 'Feito ✅' : d.isToday && d.workout ? 'Hoje 🏋️' : d.workout ? 'Treino' : 'Descanso'}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right / Side Column: Chat com a Treinadora + Métricas + Links Rápidos */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Card de Destaque: Bate-Papo com a Treinadora Rafaela */}
          <Card className="p-5 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1594381898411-846e7d193883?w=150&auto=format&fit=crop&q=80"
                    alt="Rafaela Personal"
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/30 shrink-0"
                  />
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-2 ring-white dark:ring-dark-card" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Bate-Papo com a Rafaela</h3>
                    <Badge variant="success" size="sm" className="text-[9px] py-0 px-1.5">
                      Online
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-dark-muted">
                    Canal direto para dúvidas, trocas e orientação técnica.
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/student/chat')}
                leftIcon={<MessageSquare className="w-4 h-4" />}
                className="shrink-0 font-bold cursor-pointer"
              >
                Conversar
              </Button>
            </div>

            {lastTrainerMessage && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-cardElevated/70 border border-slate-200/60 dark:border-dark-border/60 text-xs flex items-center justify-between gap-3">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block uppercase">
                    Última orientação da Rafaela:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 truncate mt-0.5 font-medium">
                    "{lastTrainerMessage.content}"
                  </p>
                </div>
                <button
                  onClick={() => navigate('/student/chat')}
                  className="text-xs font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-0.5 shrink-0 cursor-pointer"
                >
                  <span>Ver conversa</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </Card>

          {/* Metrics Row: Adesão Real e Frequência */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Adesão Real</span>
                <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  {adherencePercentage}%
                </span>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Treinos Feitos</span>
                <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  {completedSessions.length} sessões
                </span>
              </div>
            </Card>
          </div>

          {/* Quick Navigation Cards */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/student/evolution')}
              className="w-full p-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border flex items-center justify-between text-left hover:border-emerald-500/40 transition-colors shadow-xs cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-dark-cardElevated text-emerald-500 group-hover:bg-emerald-500/15 transition-colors">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Minha Evolução de Cargas</h4>
                  <p className="text-xs text-slate-500 dark:text-dark-muted">Acompanhe seu ganho progressivo de força</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </button>

            <button
              onClick={() => navigate('/student/nutrition')}
              className="w-full p-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border flex items-center justify-between text-left hover:border-emerald-500/40 transition-colors shadow-xs cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-dark-cardElevated text-cyan-500 group-hover:bg-cyan-500/15 transition-colors">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Minha Alimentação</h4>
                  <p className="text-xs text-slate-500 dark:text-dark-muted">Consulte seu plano alimentar e opções de trocas</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
