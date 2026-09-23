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
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Olá, {studentProfile.name.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-500 dark:text-dark-muted font-normal mt-0.5">
            Meta ativa: <strong className="text-slate-700 dark:text-slate-300 font-medium">{studentProfile.goals.join(', ')}</strong> • Frequência:{' '}
            <strong className="text-slate-700 dark:text-slate-300 font-medium">{studentProfile.availableDays.length}x na semana</strong>
          </p>
        </div>

        <Badge variant="outline" size="sm" className="self-start sm:self-auto font-mono text-[11px] py-1 px-2.5">
          Ficha: {workoutPlan?.name || 'Rotina Personalizada'}
        </Badge>
      </div>

      {/* Alerta de Formulário / Anamnese Pendente (Section 7, 72) */}
      {pendingApps.length > 0 && (
        <Card className="p-4 sm:p-5 border-amber-500/30 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/15 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100/80 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
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
              className="shrink-0"
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
              <Card className="relative overflow-hidden bg-slate-900 text-white border border-slate-800 shadow-md p-6 sm:p-7 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 font-medium text-xs border border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Treino de Hoje Concluído
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {todayWorkout.dayOfWeek} • {todayWorkout.name}
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white">Parabéns pelo treino de hoje!</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Sua frequência foi registrada com sucesso. Descanse, mantenha a hidratação e acompanhe sua evolução de cargas.
                  </p>
                </div>

                {nextWorkoutInfo && (
                  <div className="p-3.5 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium uppercase">Próximo Treino Agendado</span>
                      <span className="font-medium text-white">
                        {nextWorkoutInfo.dayName} ({nextWorkoutInfo.dateFormatted}) • {nextWorkoutInfo.name}
                      </span>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/student/workouts`)}
                      className="text-xs shrink-0 cursor-pointer"
                    >
                      Ver Ficha
                    </Button>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="relative overflow-hidden bg-slate-900 text-white border border-slate-800 shadow-md p-6 sm:p-7 rounded-2xl space-y-5">
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 font-medium text-xs border border-emerald-500/30">
                      Treino de Hoje • {todayWorkout.dayOfWeek}
                    </span>
                    <span className="text-xs text-slate-400 font-medium font-mono">
                      {todayWorkout.exercises.length} exercícios programados
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">{todayWorkout.name}</h2>
                    <p className="text-sm text-slate-300 font-normal mt-1">Foco muscular: {todayWorkout.muscleFocus}</p>
                  </div>

                  {/* Previa dos exercicios */}
                  <div className="py-1 flex flex-wrap gap-1.5">
                    {todayWorkout.exercises.slice(0, 5).map((ex, idx) => (
                      <span key={idx} className="text-xs font-mono font-medium bg-white/[0.08] px-2.5 py-1 rounded-md text-slate-200 border border-white/[0.06]">
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
                    size="lg"
                    fullWidth
                    onClick={() => navigate(`/student/workout/active/${todayWorkout.id}`)}
                    leftIcon={<Play className="w-4 h-4 fill-current" />}
                    className="font-semibold shadow-xs cursor-pointer"
                  >
                    Começar Treino de Hoje
                  </Button>
                </div>
              </Card>
            )
          ) : (
            <Card className="p-6 relative overflow-hidden bg-slate-900 text-white border border-slate-800 space-y-4 shadow-md rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-400 font-medium text-xs border border-amber-500/30 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5" />
                  Dia de Descanso & Recuperação
                </span>
                <span className="text-xs text-slate-400 font-mono">Hoje ({todayDayOfWeek})</span>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">Nenhum treino programado para hoje.</h2>
                <p className="text-xs text-slate-400 mt-1">
                  O descanso faz parte fundamental dos seus resultados de hipertrofia e queima de gordura.
                </p>
              </div>

              {nextWorkoutInfo && (
                <div className="p-3.5 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium uppercase">
                      Próximo Treino ({nextWorkoutInfo.dayName} • {nextWorkoutInfo.dateFormatted})
                    </span>
                    <span className="font-medium text-white">
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
          <Card className="p-5 space-y-3 shadow-xs border-slate-200/80 dark:border-white/[0.08]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Semana Atual de Treinos</h3>
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
                    className={`py-2.5 px-1 sm:px-2 rounded-xl flex flex-col items-center justify-between transition-all ${
                      d.isToday
                        ? 'ring-1 ring-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15'
                        : d.isCompleted
                        ? 'bg-emerald-500/10 border border-emerald-500/20'
                        : d.workout
                        ? 'bg-slate-100/70 dark:bg-dark-cardElevated/70'
                        : 'bg-slate-50/50 dark:bg-white/[0.02] opacity-60'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-medium text-slate-400 uppercase block">{d.dayName.slice(0, 3)}</span>
                      <span className="text-[10px] sm:text-xs font-mono text-slate-500 block">{d.dateFormatted}</span>
                    </div>

                    <div className="my-2">
                      {d.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                      ) : d.workout ? (
                        <Dumbbell className={`w-4 h-4 sm:w-5 sm:h-5 ${d.isToday ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'}`} />
                      ) : (
                        <span className="text-xs text-slate-400">•</span>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-medium ${
                        d.isCompleted
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : d.isToday
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : d.workout
                          ? 'text-slate-700 dark:text-slate-300'
                          : 'text-slate-400'
                      }`}
                    >
                      {d.isCompleted ? 'Feito' : d.isToday && d.workout ? 'Hoje' : d.workout ? 'Treino' : 'Descanso'}
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
          <Card className="p-5 border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1594381898411-846e7d193883?w=150&auto=format&fit=crop&q=80"
                    alt="Rafaela Personal"
                    className="w-11 h-11 rounded-full object-cover ring-1 ring-slate-200/80 dark:ring-white/[0.1] shrink-0"
                  />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 ring-2 ring-white dark:ring-dark-card" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Bate-Papo com a Rafaela</h3>
                    <Badge variant="success" size="sm" className="text-[10px] py-0 px-1.5 font-medium">
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
                className="shrink-0 cursor-pointer"
              >
                Conversar
              </Button>
            </div>

            {lastTrainerMessage && (
              <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-dark-cardElevated/40 border border-slate-200/60 dark:border-white/[0.06] text-xs flex items-center justify-between gap-3">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] font-medium text-slate-400 block uppercase">
                    Última orientação da Rafaela:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 truncate mt-0.5 font-medium">
                    "{lastTrainerMessage.content}"
                  </p>
                </div>
                <button
                  onClick={() => navigate('/student/chat')}
                  className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-0.5 shrink-0 cursor-pointer"
                >
                  <span>Ver conversa</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </Card>

          {/* Metrics Row: Adesão Real e Frequência */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 flex items-center gap-3 border-slate-200/80 dark:border-white/[0.08] shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 dark:text-dark-muted block font-normal">Adesão Real</span>
                <span className="text-xl font-semibold text-slate-900 dark:text-white font-mono">
                  {adherencePercentage}%
                </span>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-3 border-slate-200/80 dark:border-white/[0.08] shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 dark:text-dark-muted block font-normal">Treinos Feitos</span>
                <span className="text-xl font-semibold text-slate-900 dark:text-white font-mono">
                  {completedSessions.length} sessões
                </span>
              </div>
            </Card>
          </div>

          {/* Quick Navigation Cards */}
          <div className="space-y-2.5">
            <button
              onClick={() => navigate('/student/evolution')}
              className="w-full p-3.5 rounded-xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between text-left hover:border-slate-300 dark:hover:border-white/[0.16] transition-colors shadow-2xs cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100/80 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Minha Evolução de Cargas</h4>
                  <p className="text-xs text-slate-500 dark:text-dark-muted">Acompanhe seu ganho progressivo de força</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
            </button>

            <button
              onClick={() => navigate('/student/nutrition')}
              className="w-full p-3.5 rounded-xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between text-left hover:border-slate-300 dark:hover:border-white/[0.16] transition-colors shadow-2xs cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100/80 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Minha Alimentação</h4>
                  <p className="text-xs text-slate-500 dark:text-dark-muted">Consulte seu plano alimentar e opções de trocas</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
