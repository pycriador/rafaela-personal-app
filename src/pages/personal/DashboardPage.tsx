import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Dumbbell,
  ArrowUpRight,
  Activity,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  ArrowLeftRight,
  FileEdit,
  Apple,
  MessageSquare,
  Search,
  Filter,
  X,
  Sparkles,
  UserCheck,
  AlertCircle,
  RotateCcw,
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
import { FormApplication } from '../../types/anamnesis';

// Unified Attention Item definition
export type AttentionCategory = 'all' | 'skipped' | 'substituted' | 'weight' | 'difficulty' | 'adherence' | 'forms';

export interface AttentionItem {
  id: string;
  category: AttentionCategory;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  title: string;
  subtitle: string;
  exerciseName?: string;
  reason?: string;
  before?: string | number;
  after?: string | number;
  difference?: string;
  badgeText: string;
  badgeVariant: 'danger' | 'warning' | 'info' | 'neutral';
  timestamp: string;
  actionUrl: string;
  actionLabel: string;
}

// Activity visual helper
function getActivityVisual(act: ActivityLog) {
  const actionLower = act.action.toLowerCase();
  const descLower = act.description.toLowerCase();
  const isPersonal = act.actorRole === 'personal';

  if (act.iconType === 'check' || actionLower.includes('conclu') || actionLower.includes('finaliz')) {
    return {
      icon: CheckCircle2,
      containerClass: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      badgeText: 'Treino Concluído',
      badgeVariant: 'brand' as const,
    };
  }
  if (act.iconType === 'skip' || actionLower.includes('pula')) {
    return {
      icon: AlertTriangle,
      containerClass: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200/60 dark:border-rose-500/20 text-rose-600 dark:text-rose-400',
      badgeText: 'Exercício Pulado',
      badgeVariant: 'danger' as const,
    };
  }
  if (act.iconType === 'swap' || actionLower.includes('substitu')) {
    return {
      icon: ArrowLeftRight,
      containerClass: 'bg-sky-50 dark:bg-sky-500/10 border-sky-200/60 dark:border-sky-500/20 text-sky-600 dark:text-sky-400',
      badgeText: 'Substituição',
      badgeVariant: 'info' as const,
    };
  }
  if (act.iconType === 'dumbbell' || actionLower.includes('carga') || actionLower.includes('peso')) {
    return {
      icon: Dumbbell,
      containerClass: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      badgeText: 'Carga Alterada',
      badgeVariant: 'brand' as const,
    };
  }
  if (act.iconType === 'form' || act.iconType === 'clipboard' || actionLower.includes('formul') || actionLower.includes('anamnese')) {
    return {
      icon: ClipboardList,
      containerClass: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200/60 dark:border-purple-500/20 text-purple-600 dark:text-purple-400',
      badgeText: actionLower.includes('respond') ? 'Formulário Respondido' : 'Formulário Atribuído',
      badgeVariant: 'neutral' as const,
    };
  }
  if (act.iconType === 'nutrition' || actionLower.includes('alimentar') || actionLower.includes('nutri') || actionLower.includes('dieta')) {
    return {
      icon: Apple,
      containerClass: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200/60 dark:border-amber-500/20 text-amber-600 dark:text-amber-400',
      badgeText: 'Nutrição',
      badgeVariant: 'warning' as const,
    };
  }
  if (act.iconType === 'edit' || actionLower.includes('atualiz') || actionLower.includes('prescrit') || actionLower.includes('treino')) {
    return {
      icon: FileEdit,
      containerClass: 'bg-slate-100 dark:bg-dark-cardElevated border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300',
      badgeText: isPersonal ? 'Prescrição' : 'Atualização',
      badgeVariant: 'neutral' as const,
    };
  }
  if (act.iconType === 'user' || actionLower.includes('aluno')) {
    return {
      icon: UserCheck,
      containerClass: 'bg-sky-50 dark:bg-sky-500/10 border-sky-200/60 dark:border-sky-500/20 text-sky-600 dark:text-sky-400',
      badgeText: 'Aluno',
      badgeVariant: 'info' as const,
    };
  }
  if (act.iconType === 'message' || actionLower.includes('mensag')) {
    return {
      icon: MessageSquare,
      containerClass: 'bg-slate-100 dark:bg-dark-cardElevated border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300',
      badgeText: 'Mensagem',
      badgeVariant: 'neutral' as const,
    };
  }
  if (act.iconType === 'sparkles' || actionLower.includes('ia') || actionLower.includes('copilot')) {
    return {
      icon: Sparkles,
      containerClass: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200/60 dark:border-purple-500/20 text-purple-600 dark:text-purple-400',
      badgeText: 'AI Copilot',
      badgeVariant: 'neutral' as const,
    };
  }

  return {
    icon: Activity,
    containerClass: 'bg-slate-100 dark:bg-dark-cardElevated border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400',
    badgeText: isPersonal ? 'Personal' : 'Atividade',
    badgeVariant: 'neutral' as const,
  };
}

// Format friendly relative/absolute dates
function formatFriendlyDate(timestampStr: string) {
  try {
    const date = new Date(timestampStr);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    if (isToday) {
      return `Hoje às ${hours}:${minutes}`;
    }
    if (isYesterday) {
      return `Ontem às ${hours}:${minutes}`;
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${date.getFullYear()} às ${hours}:${minutes}`;
  } catch {
    return timestampStr;
  }
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [students, setStudents] = useState<Student[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [modifications, setModifications] = useState<WorkoutModification[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [formApplications, setFormApplications] = useState<FormApplication[]>([]);
  const [pendingAnamnesisCount, setPendingAnamnesisCount] = useState(0);
  const [recentResponsesCount, setRecentResponsesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter & Pagination state: Precisa da sua atenção
  const [attentionCategory, setAttentionCategory] = useState<AttentionCategory>('all');
  const [attentionStudentFilter, setAttentionStudentFilter] = useState<string>('all');
  const [attentionPage, setAttentionPage] = useState<number>(1);
  const attentionPageSize = 3;

  // Filter & Pagination state: Central de Atividades
  const [activityOrigin, setActivityOrigin] = useState<'all' | 'student' | 'personal'>('all');
  const [activityCategory, setActivityCategory] = useState<'all' | 'workout' | 'forms' | 'prescription' | 'message'>('all');
  const [activityStudentFilter, setActivityStudentFilter] = useState<string>('all');
  const [activitySearchQuery, setActivitySearchQuery] = useState<string>('');
  
  const pageParam = parseInt(searchParams.get('page') || searchParams.get('activityPage') || '1', 10);
  const [activityPage, setActivityPage] = useState<number>(isNaN(pageParam) || pageParam < 1 ? 1 : pageParam);
  const activityPageSize = 6;

  useEffect(() => {
    async function loadData() {
      try {
        const [allStudents, allActivities, allMods, allSessions, allApps, allResps] = await Promise.all([
          studentRepository.getAll(),
          activityRepository.getAll(150),
          workoutRepository.getModifications(),
          workoutRepository.getSessions(),
          formApplicationRepository.getAll(),
          formResponseRepository.getAll(),
        ]);
        setStudents(allStudents);
        setActivities(allActivities);
        setModifications(allMods);
        setSessions(allSessions);
        setFormApplications(allApps);
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

  // Map students by ID for quick lookup
  const studentMap = useMemo(() => {
    const map = new Map<string, Student>();
    students.forEach((s) => map.set(s.id, s));
    return map;
  }, [students]);

  // Aggregate unified Attention Items
  const allAttentionItems = useMemo<AttentionItem[]>(() => {
    const items: AttentionItem[] = [];

    // 1. Items from Workout Modifications
    modifications.forEach((mod) => {
      const student = studentMap.get(mod.studentId);
      const studentName = mod.studentName || student?.name || 'Aluno';
      const studentAvatar = student?.avatarUrl;

      if (mod.action === 'EXERCISE_SKIPPED') {
        items.push({
          id: `att-mod-${mod.id}`,
          category: 'skipped',
          studentId: mod.studentId,
          studentName,
          studentAvatar,
          title: studentName,
          subtitle: `Exercício pulado: ${mod.exerciseName}`,
          exerciseName: mod.exerciseName,
          reason: mod.reason || 'Aluno optou por pular este exercício',
          badgeText: 'Exercício Pulado',
          badgeVariant: 'danger',
          timestamp: mod.timestamp,
          actionUrl: `/personal/students/${mod.studentId}`,
          actionLabel: 'Ver perfil do aluno',
        });
      } else if (mod.action === 'EXERCISE_SUBSTITUTED') {
        items.push({
          id: `att-mod-${mod.id}`,
          category: 'substituted',
          studentId: mod.studentId,
          studentName,
          studentAvatar,
          title: studentName,
          subtitle: `Substituição: ${mod.exerciseName}`,
          exerciseName: mod.exerciseName,
          before: mod.before,
          after: mod.after,
          reason: mod.reason || 'Exercício adaptado pelo aluno na execução',
          badgeText: 'Substituição',
          badgeVariant: 'info',
          timestamp: mod.timestamp,
          actionUrl: `/personal/students/${mod.studentId}`,
          actionLabel: 'Ver perfil do aluno',
        });
      } else if (mod.action === 'WEIGHT_CHANGED') {
        items.push({
          id: `att-mod-${mod.id}`,
          category: 'weight',
          studentId: mod.studentId,
          studentName,
          studentAvatar,
          title: studentName,
          subtitle: `Carga: ${mod.exerciseName}`,
          exerciseName: mod.exerciseName,
          before: mod.before != null ? `${mod.before} kg` : undefined,
          after: mod.after != null ? `${mod.after} kg` : undefined,
          difference: mod.difference,
          reason: mod.reason,
          badgeText: 'Carga Alterada',
          badgeVariant: 'warning',
          timestamp: mod.timestamp,
          actionUrl: `/personal/students/${mod.studentId}`,
          actionLabel: 'Ver perfil do aluno',
        });
      } else if (mod.action === 'DIFFICULTY_REPORTED') {
        items.push({
          id: `att-mod-${mod.id}`,
          category: 'difficulty',
          studentId: mod.studentId,
          studentName,
          studentAvatar,
          title: studentName,
          subtitle: `Dificuldade: ${mod.exerciseName}`,
          exerciseName: mod.exerciseName,
          before: mod.before,
          after: mod.after,
          difference: mod.difference,
          reason: mod.reason || 'Dificuldade motora ou desconforto relatado',
          badgeText: 'Dificuldade',
          badgeVariant: 'danger',
          timestamp: mod.timestamp,
          actionUrl: `/personal/students/${mod.studentId}`,
          actionLabel: 'Ver perfil do aluno',
        });
      }
    });

    // 2. Students with Low Adherence or Status "Atenção"
    students.forEach((st) => {
      const isCritical = st.status === 'Atenção' || (st.adherencePercentage != null && st.adherencePercentage < 80);
      if (isCritical) {
        items.push({
          id: `att-student-${st.id}`,
          category: 'adherence',
          studentId: st.id,
          studentName: st.name,
          studentAvatar: st.avatarUrl,
          title: st.name,
          subtitle: `Adesão de apenas ${st.adherencePercentage ?? 0}% aos treinos`,
          reason: 'Frequência abaixo da meta planejada. Risco de desmotivação ou interrupção do protocolo.',
          badgeText: 'Adesão Crítica',
          badgeVariant: 'danger',
          timestamp: st.createdAt ? new Date(st.createdAt).toISOString() : new Date().toISOString(),
          actionUrl: `/personal/students/${st.id}`,
          actionLabel: 'Ajustar plano do aluno',
        });
      }
    });

    // 3. Pending Anamnesis / Forms
    formApplications.forEach((app) => {
      if (app.status === 'pending' || app.status === 'in_progress') {
        const student = studentMap.get(app.studentId);
        const studentName = student?.name || 'Aluno';
        items.push({
          id: `att-app-${app.id}`,
          category: 'forms',
          studentId: app.studentId,
          studentName,
          studentAvatar: student?.avatarUrl,
          title: studentName,
          subtitle: 'Formulário de saúde aguardando preenchimento',
          reason: `Atribuído em ${new Date(app.assignedAt).toLocaleDateString()} e ainda sem retorno.`,
          badgeText: 'Anamnese Pendente',
          badgeVariant: 'warning',
          timestamp: app.assignedAt,
          actionUrl: '/personal/anamnesis',
          actionLabel: 'Acompanhar formulário',
        });
      }
    });

    // Sort descending by timestamp
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [modifications, students, formApplications, studentMap]);

  // Attention Items Counts by Category for Badges
  const attentionCounts = useMemo(() => {
    const counts = {
      all: allAttentionItems.length,
      skipped: 0,
      substituted: 0,
      weight: 0,
      difficulty: 0,
      adherence: 0,
      forms: 0,
    };
    allAttentionItems.forEach((item) => {
      if (item.category in counts) {
        counts[item.category as keyof typeof counts]++;
      }
    });
    return counts;
  }, [allAttentionItems]);

  // Filtered Attention Items
  const filteredAttentionItems = useMemo(() => {
    return allAttentionItems.filter((item) => {
      if (attentionCategory !== 'all' && item.category !== attentionCategory) {
        return false;
      }
      if (attentionStudentFilter !== 'all' && item.studentId !== attentionStudentFilter) {
        return false;
      }
      return true;
    });
  }, [allAttentionItems, attentionCategory, attentionStudentFilter]);

  // Pagination for Attention Items
  const totalAttentionPages = Math.max(1, Math.ceil(filteredAttentionItems.length / attentionPageSize));
  const validAttentionPage = Math.min(attentionPage, totalAttentionPages);
  const attentionStartIndex = (validAttentionPage - 1) * attentionPageSize;
  const pagedAttentionItems = filteredAttentionItems.slice(attentionStartIndex, attentionStartIndex + attentionPageSize);

  const handleAttentionCategoryChange = (cat: AttentionCategory) => {
    setAttentionCategory(cat);
    setAttentionPage(1);
  };

  const handleAttentionStudentChange = (stId: string) => {
    setAttentionStudentFilter(stId);
    setAttentionPage(1);
  };

  // --- Filter & Pagination for Central de Atividades ---
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      // 1. Origin filter
      if (activityOrigin === 'student' && act.actorRole !== 'student') return false;
      if (activityOrigin === 'personal' && act.actorRole !== 'personal') return false;

      // 2. Student filter
      if (activityStudentFilter !== 'all' && act.studentId !== activityStudentFilter) {
        return false;
      }

      // 3. Category filter
      if (activityCategory !== 'all') {
        const actionLow = act.action.toLowerCase();
        const descLow = act.description.toLowerCase();

        if (activityCategory === 'workout') {
          const isWorkout =
            act.iconType === 'dumbbell' ||
            act.iconType === 'check' ||
            act.iconType === 'skip' ||
            act.iconType === 'swap' ||
            actionLow.includes('treino') ||
            actionLow.includes('carga') ||
            actionLow.includes('exercício') ||
            actionLow.includes('peso');
          if (!isWorkout) return false;
        } else if (activityCategory === 'forms') {
          const isForm =
            act.iconType === 'form' ||
            act.iconType === 'clipboard' ||
            actionLow.includes('formul') ||
            actionLow.includes('anamnese') ||
            descLow.includes('questionário');
          if (!isForm) return false;
        } else if (activityCategory === 'prescription') {
          const isPrescription =
            act.iconType === 'edit' ||
            act.iconType === 'nutrition' ||
            actionLow.includes('prescrit') ||
            actionLow.includes('atualiz') ||
            actionLow.includes('meta') ||
            actionLow.includes('alimentar');
          if (!isPrescription) return false;
        } else if (activityCategory === 'message') {
          const isMessage =
            act.iconType === 'message' ||
            actionLow.includes('mensag') ||
            actionLow.includes('nota');
          if (!isMessage) return false;
        }
      }

      // 4. Text search
      if (activitySearchQuery.trim()) {
        const q = activitySearchQuery.toLowerCase().trim();
        const matchAction = act.action.toLowerCase().includes(q);
        const matchDesc = act.description.toLowerCase().includes(q);
        const matchActor = act.actorName.toLowerCase().includes(q);
        if (!matchAction && !matchDesc && !matchActor) return false;
      }

      return true;
    });
  }, [activities, activityOrigin, activityCategory, activityStudentFilter, activitySearchQuery]);

  // Pagination calculation for Central de Atividades
  const totalActivityPages = Math.max(1, Math.ceil(filteredActivities.length / activityPageSize));
  const validActivityPage = Math.min(activityPage, totalActivityPages);
  const activityStartIndex = (validActivityPage - 1) * activityPageSize;
  const pagedActivities = filteredActivities.slice(activityStartIndex, activityStartIndex + activityPageSize);

  const handleActivityPageChange = (newPage: number) => {
    setActivityPage(newPage);
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
  };

  const handleResetActivityFilters = () => {
    setActivityOrigin('all');
    setActivityCategory('all');
    setActivityStudentFilter('all');
    setActivitySearchQuery('');
    setActivityPage(1);
  };

  const isActivityFiltered =
    activityOrigin !== 'all' ||
    activityCategory !== 'all' ||
    activityStudentFilter !== 'all' ||
    activitySearchQuery.trim() !== '';

  // Header Metrics Calculations
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'Ativo').length;
  const attentionStudents = students.filter(
    (s) => s.status === 'Atenção' || (s.adherencePercentage != null && s.adherencePercentage < 80)
  );

  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const todayDateStr = new Date().toISOString().split('T')[0];
  const completedToday = sessions.filter((s) => s.status === 'completed' && s.date === todayDateStr).length;

  const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const todayName = daysOfWeek[new Date().getDay()];
  const scheduledToday = students.filter((s) => s.status === 'Ativo' && s.availableDays.includes(todayName as any)).length;
  const pendingCount = scheduledToday > completedToday
    ? scheduledToday - completedToday
    : (activeStudents > completedToday ? Math.max(0, activeStudents - completedToday) : 0);

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-slate-300 dark:border-white/[0.12] border-t-emerald-500 rounded-full animate-spin" />
        <span className="text-xs text-slate-400 dark:text-dark-muted font-medium">Carregando painel em tempo real...</span>
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

      {/* 4 Metric Cards */}
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
          value={allAttentionItems.length}
          subtitle={`${attentionCounts.skipped} pulos • ${attentionCounts.adherence} adesão`}
          highlight={allAttentionItems.length > 0}
          icon={<AlertTriangle className="w-6 h-6 text-rose-500" />}
        />
      </div>

      {/* Banner Anamnese & Saúde */}
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

      {/* ========================================================================= */}
      {/* SEÇÃO 1: PRECISA DA SUA ATENÇÃO (COM FILTROS & PAGINAÇÃO ANTI-POLUIÇÃO)   */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Precisa da sua atenção
              {allAttentionItems.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold font-mono bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                  {allAttentionItems.length}
                </span>
              )}
            </h2>
          </div>

          {/* Filtro por Aluno nos Alertas */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 dark:text-dark-muted hidden md:inline">Aluno:</span>
            <select
              value={attentionStudentFilter}
              onChange={(e) => handleAttentionStudentChange(e.target.value)}
              className="text-xs bg-white dark:bg-dark-card border border-slate-200/80 dark:border-white/[0.08] rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="all">Todos os alunos</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Pills for Attention Category */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => handleAttentionCategoryChange('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 ${
              attentionCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-2xs'
                : 'bg-white dark:bg-dark-card border border-slate-200/80 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            Todos
            <span className="text-[10px] font-mono opacity-80">({attentionCounts.all})</span>
          </button>

          {attentionCounts.skipped > 0 && (
            <button
              onClick={() => handleAttentionCategoryChange('skipped')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                attentionCategory === 'skipped'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-dark-card border border-slate-200/80 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              Exercícios Pulados
              <span className="text-[10px] font-mono opacity-80">({attentionCounts.skipped})</span>
            </button>
          )}

          {attentionCounts.substituted > 0 && (
            <button
              onClick={() => handleAttentionCategoryChange('substituted')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                attentionCategory === 'substituted'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-dark-card border border-slate-200/80 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              Substituições
              <span className="text-[10px] font-mono opacity-80">({attentionCounts.substituted})</span>
            </button>
          )}

          {attentionCounts.weight > 0 && (
            <button
              onClick={() => handleAttentionCategoryChange('weight')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                attentionCategory === 'weight'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-dark-card border border-slate-200/80 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              Cargas Alteradas
              <span className="text-[10px] font-mono opacity-80">({attentionCounts.weight})</span>
            </button>
          )}

          {attentionCounts.adherence > 0 && (
            <button
              onClick={() => handleAttentionCategoryChange('adherence')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                attentionCategory === 'adherence'
                  ? 'bg-rose-700 text-white shadow-2xs'
                  : 'bg-white dark:bg-dark-card border border-slate-200/80 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              Baixa Adesão
              <span className="text-[10px] font-mono opacity-80">({attentionCounts.adherence})</span>
            </button>
          )}

          {attentionCounts.forms > 0 && (
            <button
              onClick={() => handleAttentionCategoryChange('forms')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                attentionCategory === 'forms'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-dark-card border border-slate-200/80 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              Formulários Pendentes
              <span className="text-[10px] font-mono opacity-80">({attentionCounts.forms})</span>
            </button>
          )}
        </div>

        {/* Attention Cards Grid (Strict 3 items per page to prevent clutter) */}
        {pagedAttentionItems.length > 0 ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pagedAttentionItems.map((item) => (
                <Card
                  key={item.id}
                  className="border border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.16] shadow-xs transition-colors cursor-pointer p-4 flex flex-col justify-between"
                  onClick={() => navigate(item.actionUrl)}
                >
                  <div>
                    {/* Top Row: Badge & Timestamp */}
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant={item.badgeVariant} size="sm">
                        {item.badgeText}
                      </Badge>
                      <span className="text-[11px] text-slate-400 dark:text-dark-muted font-mono shrink-0">
                        {formatFriendlyDate(item.timestamp)}
                      </span>
                    </div>

                    {/* Student Info */}
                    <div className="flex items-center gap-2.5 mt-3">
                      <img
                        src={item.studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={item.studentName}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/[0.08] shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {item.studentName}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-dark-muted truncate">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Metric Comparison box for weight or substitution */}
                    {(item.before != null || item.after != null || item.difference) && (
                      <div className="mt-2.5 text-xs bg-slate-50 dark:bg-dark-cardElevated border border-slate-200/60 dark:border-white/[0.06] p-2 rounded-lg font-mono flex items-center justify-between">
                        {item.before != null && <span className="text-slate-500">De: {item.before}</span>}
                        {item.after != null && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            → Para: {item.after} {item.difference && `(${item.difference})`}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Reason / Feedback quote */}
                    {item.reason && (
                      <p className="mt-2 text-xs text-amber-700 dark:text-amber-400/90 italic bg-amber-50/50 dark:bg-amber-500/5 border-l-2 border-amber-400 dark:border-amber-500/40 pl-2 py-1 rounded-r">
                        &ldquo;{item.reason}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Card Action Footer */}
                  <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination Controls for Attention Section */}
            {totalAttentionPages > 1 && (
              <div className="flex items-center justify-between pt-1 px-1">
                <span className="text-xs text-slate-500 dark:text-dark-muted font-mono">
                  Página <strong>{validAttentionPage}</strong> de <strong>{totalAttentionPages}</strong> • ({filteredAttentionItems.length} alertas)
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={validAttentionPage <= 1}
                    onClick={() => setAttentionPage(validAttentionPage - 1)}
                    leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={validAttentionPage >= totalAttentionPages}
                    onClick={() => setAttentionPage(validAttentionPage + 1)}
                    rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card className="p-8 text-center border-slate-200/80 dark:border-white/[0.08] shadow-xs">
            <CheckCircle2 className="w-9 h-9 text-emerald-500 mx-auto mb-2 opacity-90" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Tudo em ordem!</h3>
            <p className="text-xs text-slate-500 dark:text-dark-muted mt-1 max-w-md mx-auto">
              Nenhum alerta pendente para a categoria selecionada. Seus alunos estão cumprindo o planejamento normalmente.
            </p>
            {attentionCategory !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAttentionCategory('all')}
                className="mt-3 text-xs"
              >
                Ver todos os alertas
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SEÇÃO 2: CENTRAL DE ATIVIDADES & ALUNOS OVERVIEW                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Central de Atividades (Timeline Rica com Ícones e Filtros) */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col justify-between">
            <div>
              {/* Header */}
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle>Central de Atividades</CardTitle>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold font-mono bg-slate-100 text-slate-700 dark:bg-dark-cardElevated dark:text-slate-300">
                      {filteredActivities.length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
                    Linha do tempo ao vivo de treinos, prescrições, anamneses e eventos
                  </p>
                </div>

                {/* Filtro de Origem: Todos / Alunos / Personal */}
                <div className="flex items-center bg-slate-100 dark:bg-dark-cardElevated p-0.5 rounded-lg border border-slate-200/80 dark:border-white/[0.08] text-xs self-start sm:self-auto">
                  <button
                    onClick={() => {
                      setActivityOrigin('all');
                      setActivityPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      activityOrigin === 'all'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => {
                      setActivityOrigin('student');
                      setActivityPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      activityOrigin === 'student'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Alunos
                  </button>
                  <button
                    onClick={() => {
                      setActivityOrigin('personal');
                      setActivityPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      activityOrigin === 'personal'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Personal
                  </button>
                </div>
              </CardHeader>

              {/* Filtros Secundários da Central de Atividades */}
              <div className="px-6 pb-3 pt-1 border-b border-slate-100 dark:border-white/[0.06] space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  {/* Categoria de Ação */}
                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
                    <button
                      onClick={() => {
                        setActivityCategory('all');
                        setActivityPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all shrink-0 ${
                        activityCategory === 'all'
                          ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950'
                          : 'bg-slate-50 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      Todas as Ações
                    </button>
                    <button
                      onClick={() => {
                        setActivityCategory('workout');
                        setActivityPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all shrink-0 ${
                        activityCategory === 'workout'
                          ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950'
                          : 'bg-slate-50 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      Treinos & Cargas
                    </button>
                    <button
                      onClick={() => {
                        setActivityCategory('forms');
                        setActivityPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all shrink-0 ${
                        activityCategory === 'forms'
                          ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950'
                          : 'bg-slate-50 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      Formulários
                    </button>
                    <button
                      onClick={() => {
                        setActivityCategory('prescription');
                        setActivityPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-md font-medium transition-all shrink-0 ${
                        activityCategory === 'prescription'
                          ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950'
                          : 'bg-slate-50 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      Prescrições & Ajustes
                    </button>
                  </div>

                  {/* Dropdown por Aluno & Limpar */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={activityStudentFilter}
                      onChange={(e) => {
                        setActivityStudentFilter(e.target.value);
                        setActivityPage(1);
                      }}
                      className="text-xs bg-slate-50 dark:bg-dark-cardElevated border border-slate-200/80 dark:border-white/[0.08] rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-200 focus:outline-none font-medium"
                    >
                      <option value="all">Todos os Alunos</option>
                      {students.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name}
                        </option>
                      ))}
                    </select>

                    {isActivityFiltered && (
                      <button
                        onClick={handleResetActivityFilters}
                        title="Limpar todos os filtros"
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Campo de Busca Rápida */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={activitySearchQuery}
                    onChange={(e) => {
                      setActivitySearchQuery(e.target.value);
                      setActivityPage(1);
                    }}
                    placeholder="Buscar por nome do aluno, exercício ou descrição..."
                    className="w-full text-xs pl-8 pr-7 py-1.5 rounded-lg bg-slate-50/70 dark:bg-dark-cardElevated/50 border border-slate-200/60 dark:border-white/[0.06] text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  {activitySearchQuery && (
                    <button
                      onClick={() => setActivitySearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Lista de Atividades com Ícones Semânticos */}
              <CardContent className="space-y-0 pt-2 pb-0">
                <div className="divide-y divide-slate-100 dark:divide-dark-border/60">
                  {pagedActivities.length > 0 ? (
                    pagedActivities.map((act) => {
                      const visual = getActivityVisual(act);
                      const IconComponent = visual.icon;
                      const isPersonal = act.actorRole === 'personal';

                      return (
                        <div
                          key={act.id}
                          onClick={() => {
                            if (act.studentId) {
                              navigate(`/personal/students/${act.studentId}`);
                            }
                          }}
                          className={`py-3.5 flex items-start gap-3.5 text-left transition-colors rounded-xl px-2.5 -mx-2.5 ${
                            act.studentId
                              ? 'cursor-pointer hover:bg-slate-50/80 dark:hover:bg-dark-cardElevated/40'
                              : ''
                          }`}
                        >
                          {/* Ícone Semântico */}
                          <div
                            className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${visual.containerClass}`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>

                          {/* Informações da Atividade */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                  {act.action}
                                </span>
                                <Badge variant={isPersonal ? 'brand' : 'neutral'} size="sm">
                                  {isPersonal ? 'Personal' : 'Aluno'}
                                </Badge>
                              </div>
                              <span className="text-[11px] text-slate-400 dark:text-dark-muted font-mono shrink-0">
                                {formatFriendlyDate(act.timestamp)}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-dark-muted mt-1 leading-relaxed">
                              {act.description}
                            </p>

                            {/* Link rápido se associado a aluno */}
                            {act.studentId && (
                              <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                <span>Ver detalhes do aluno</span>
                                <ArrowRight className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-400 dark:text-dark-muted space-y-2">
                      <Filter className="w-7 h-7 mx-auto text-slate-300 dark:text-slate-600 opacity-80" />
                      <p className="font-medium text-slate-600 dark:text-slate-300">
                        Nenhuma atividade encontrada com os filtros selecionados.
                      </p>
                      {isActivityFiltered && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleResetActivityFilters}
                          className="mt-2 text-xs"
                        >
                          Limpar Filtros
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </div>

            {/* Pagination Footer */}
            {totalActivityPages > 1 && (
              <div className="p-4 border-t border-slate-100 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 mt-2">
                <span className="text-xs text-slate-500 dark:text-dark-muted font-mono">
                  Exibindo <strong>{filteredActivities.length > 0 ? activityStartIndex + 1 : 0}</strong> a{' '}
                  <strong>{Math.min(activityStartIndex + activityPageSize, filteredActivities.length)}</strong> de{' '}
                  <strong>{filteredActivities.length}</strong> atividades
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={validActivityPage <= 1}
                    onClick={() => handleActivityPageChange(validActivityPage - 1)}
                    leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                  >
                    Anterior
                  </Button>
                  {Array.from({ length: totalActivityPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => handleActivityPageChange(p)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold font-mono transition-all ${
                        p === validActivityPage
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
                    disabled={validActivityPage >= totalActivityPages}
                    onClick={() => handleActivityPageChange(validActivityPage + 1)}
                    rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            )}
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
