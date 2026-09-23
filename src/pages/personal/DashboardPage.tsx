import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Dumbbell,
  ArrowUpRight,
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { studentRepository } from '../../repositories/studentRepository';
import { activityRepository } from '../../repositories/activityRepository';
import { workoutRepository } from '../../repositories/workoutRepository';
import { formApplicationRepository } from '../../repositories/formApplicationRepository';
import { formResponseRepository } from '../../repositories/formResponseRepository';
import { Student, ActivityLog, WorkoutModification, WorkoutSession } from '../../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [modifications, setModifications] = useState<WorkoutModification[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [pendingAnamnesisCount, setPendingAnamnesisCount] = useState(0);
  const [recentResponsesCount, setRecentResponsesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const pageParam = parseInt(searchParams.get('page') || searchParams.get('activityPage') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const pageSize = 5;

  useEffect(() => {
    async function loadData() {
      try {
        const [allStudents, allActivities, allMods, allSessions, allApps, allResps] = await Promise.all([
          studentRepository.getAll(),
          activityRepository.getAll(100),
          workoutRepository.getModifications(),
          workoutRepository.getSessions(),
          formApplicationRepository.getAll(),
          formResponseRepository.getAll(),
        ]);
        setStudents(allStudents);
        setActivities(allActivities);
        setModifications(allMods);
        setSessions(allSessions);
        setPendingAnamnesisCount(
          allApps.filter((a) => a.status === 'pending' || a.status === 'in_progress').length
        );
        setRecentResponsesCount(allResps.length);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'Ativo').length;
  const attentionStudents = students.filter(
    (s) => s.status === 'Atenção' || (s.adherencePercentage != null && s.adherencePercentage < 80)
  );

  // Live session metrics
  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const todayDateStr = new Date().toISOString().split('T')[0];
  const completedToday = sessions.filter((s) => s.status === 'completed' && s.date === todayDateStr).length;

  const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const todayName = daysOfWeek[new Date().getDay()];
  const scheduledToday = students.filter((s) => s.status === 'Ativo' && s.availableDays.includes(todayName as any)).length;
  const pendingCount = scheduledToday > completedToday
    ? scheduledToday - completedToday
    : (activeStudents > completedToday ? Math.max(0, activeStudents - completedToday) : 0);

  // Live modifications that need attention
  const attentionItems = modifications.slice(0, 3);

  // Pagination for Central de Atividades
  const totalActivities = activities.length;
  const totalPages = Math.max(1, Math.ceil(totalActivities / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const pagedActivities = activities.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-white/[0.08] shadow-xs rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Olá, Rafaela
          </h1>
          <p className="text-sm text-slate-500 dark:text-dark-muted mt-1 font-normal">
            Aqui está o resumo dos seus alunos, execuções e alterações em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/personal/workouts/new')}
            leftIcon={<Dumbbell className="w-4 h-4" />}
          >
            Criar Treino
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/personal/students')}
            leftIcon={<Users className="w-4 h-4" />}
          >
            Alunos
          </Button>
        </div>
      </div>

      {/* 4 Metric Cards (Section 5) - Real & Live Data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Alunos Ativos"
          value={activeStudents}
          subtitle={`de ${totalStudents} alunos cadastrados`}
          icon={<Users className="w-6 h-6 text-emerald-500" />}
          onClick={() => navigate('/personal/students')}
        />
        <StatCard
          title="Treinos Concluídos"
          value={completedSessions.length}
          subtitle={completedToday > 0 ? `${completedToday} hoje` : `${sessions.length} no histórico`}
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />}
        />
        <StatCard
          title="Treinos Pendentes"
          value={pendingCount}
          subtitle="Aguardando execução"
          icon={<Clock className="w-6 h-6 text-amber-500" />}
        />
        <StatCard
          title="Precisam de Atenção"
          value={attentionStudents.length}
          subtitle="Adesão ou alterações"
          highlight={attentionStudents.length > 0}
          icon={<AlertTriangle className="w-6 h-6 text-rose-500" />}
        />
      </div>

      {/* Widget / Banner Anamnese & Saúde */}
      <Card className="p-4 sm:p-5 border-slate-200/80 dark:border-white/[0.08] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                Anamnese, Saúde & Formulários
                {pendingAnamnesisCount > 0 && (
                  <Badge variant="warning" size="sm">
                    {pendingAnamnesisCount} pendentes
                  </Badge>
                )}
              </h4>
              <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
                {recentResponsesCount} respostas registradas • Acompanhe histórico clínico e aplique formulários aos alunos
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/personal/anamnesis')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="shrink-0"
          >
            Acessar Módulo
          </Button>
        </div>
      </Card>

      {/* Section: Precisa da Sua Atenção (Section 5) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
              Precisa da sua atenção
            </h2>
          </div>
          <span className="text-xs text-slate-400 dark:text-dark-muted font-normal">
            Alertas em tempo real
          </span>
        </div>

        {attentionItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {attentionItems.map((mod) => (
              <Card
                key={mod.id}
                className="border border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.16] shadow-xs transition-colors cursor-pointer p-4"
                onClick={() => navigate(`/personal/students/${mod.studentId}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <Badge
                    variant={
                      mod.action === 'EXERCISE_SKIPPED'
                        ? 'danger'
                        : mod.action === 'EXERCISE_SUBSTITUTED'
                        ? 'info'
                        : 'warning'
                    }
                    size="sm"
                  >
                    {mod.action === 'WEIGHT_CHANGED' && 'Carga Alterada'}
                    {mod.action === 'EXERCISE_SKIPPED' && 'Exercício Pulado'}
                    {mod.action === 'EXERCISE_SUBSTITUTED' && 'Substituição'}
                    {mod.action === 'DIFFICULTY_REPORTED' && 'Dificuldade'}
                  </Badge>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(mod.timestamp).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-2.5">
                  {mod.studentName}
                </h4>
                <p className="text-xs text-slate-600 dark:text-dark-muted mt-0.5">
                  Exercício: <strong className="text-slate-800 dark:text-slate-200 font-medium">{mod.exerciseName}</strong>
                </p>

                {mod.action === 'WEIGHT_CHANGED' && (
                  <div className="mt-2.5 text-xs bg-slate-50 dark:bg-dark-cardElevated border border-slate-200/60 dark:border-white/[0.06] p-2 rounded-lg font-mono flex items-center justify-between">
                    <span className="text-slate-500">Prescrito: {mod.before}kg</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">→ Fez: {mod.after}kg ({mod.difference})</span>
                  </div>
                )}

                {mod.reason && (
                  <p className="mt-2 text-xs text-amber-600 dark:text-amber-400/90 italic">
                    &ldquo;{mod.reason}&rdquo;
                  </p>
                )}

                <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  <span>Ver perfil do aluno</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center text-xs text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            Nenhum alerta crítico no momento. Todos os alunos estão cumprindo os treinos normalmente.
          </Card>
        )}
    </div>

      {/* Grid: Atividade Recente (Timeline) & Alunos Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Atividade Recente (Section 36 & Section 5) */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Central de Atividades</CardTitle>
                <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
                  Linha do tempo de execuções, alterações e eventos dos alunos
                </p>
              </div>
              <Activity className="w-5 h-5 text-emerald-500" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="divide-y divide-slate-100 dark:divide-dark-border/60">
                {pagedActivities.length > 0 ? (
                  pagedActivities.map((act) => (
                    <div key={act.id} className="py-3.5 flex items-start gap-3 text-left">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-dark-cardElevated flex items-center justify-center text-slate-700 dark:text-emerald-400 shrink-0 mt-0.5">
                        {act.iconType === 'dumbbell' && <Dumbbell className="w-4 h-4 text-emerald-500" />}
                        {act.iconType === 'skip' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                        {act.iconType === 'check' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {act.iconType === 'swap' && <ArrowUpRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
                        {!act.iconType && <Activity className="w-4 h-4 text-slate-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {act.action}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {new Date(act.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-dark-muted mt-0.5 leading-relaxed">
                          {act.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Nenhuma atividade registrada nesta página.
                  </div>
                )}
              </div>

              {/* URL Pagination Footer */}
              {totalPages > 1 && (
                <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 dark:text-dark-muted font-mono">
                    Exibindo <strong>{totalActivities > 0 ? startIndex + 1 : 0}</strong> a{' '}
                    <strong>{Math.min(startIndex + pageSize, totalActivities)}</strong> de{' '}
                    <strong>{totalActivities}</strong> atividades
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={validCurrentPage <= 1}
                      onClick={() => handlePageChange(validCurrentPage - 1)}
                      leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                    >
                      Anterior
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold font-mono transition-all ${
                          p === validCurrentPage
                            ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-cardElevated'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={validCurrentPage >= totalPages}
                      onClick={() => handlePageChange(validCurrentPage + 1)}
                      rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                    >
                      Próximo
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Alunos em Destaque */}
        <div>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Meus Alunos</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/personal/students')}
                className="text-xs"
              >
                Ver todos
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {students.slice(0, 5).map((st) => (
                <div
                  key={st.id}
                  onClick={() => navigate(`/personal/students/${st.id}`)}
                  className="p-3 rounded-xl bg-slate-50/70 dark:bg-dark-cardElevated/40 hover:bg-slate-100/90 dark:hover:bg-dark-cardElevated transition-all cursor-pointer flex items-center justify-between border border-transparent hover:border-slate-200/60 dark:hover:border-white/[0.06]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={st.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={st.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200/80 dark:ring-white/[0.08]"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {st.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-dark-muted truncate">
                        {st.goals.join(', ')} • {st.availableDays.length}x/sem
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                      {st.adherencePercentage}%
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-dark-muted block">adesão</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
