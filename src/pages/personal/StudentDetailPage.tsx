import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  Calendar,
  Dumbbell,
  Apple,
  TrendingUp,
  History,
  Settings,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Sparkles,
  Pause,
  Play,
  Archive,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Award,
  Star,
  Layers,
  FlaskConical,
  ClipboardList,
  FileText,
  Eye,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { StatCard } from '../../components/ui/StatCard';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { ExerciseFramePlayer } from '../../components/ui/ExerciseFramePlayer';
import { StudentTrainerChatSection } from '../../components/chat/StudentTrainerChatSection';
import { WorkoutTemplatesModal } from '../../components/workouts/WorkoutTemplatesModal';
import { FormStatusBadge } from '../../components/forms/FormStatusBadge';
import { FormApplicationModal } from '../../components/forms/FormApplicationModal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { getAssetUrl } from '../../utils/assets';
import { studentRepository } from '../../repositories/studentRepository';
import { workoutRepository, DAY_ORDER, sortWorkoutDays } from '../../repositories/workoutRepository';
import { nutritionRepository } from '../../repositories/nutritionRepository';
import { exerciseRepository } from '../../repositories/exerciseRepository';
import { activityRepository } from '../../repositories/activityRepository';
import { messageRepository } from '../../repositories/messageRepository';
import { formService } from '../../services/anamnesis/formService';
import { formApplicationService } from '../../services/anamnesis/formApplicationService';
import { formResponseService } from '../../services/anamnesis/formResponseService';
import { formVersionRepository } from '../../repositories/formVersionRepository';
import {
  Student,
  WorkoutPlan,
  WorkoutSession,
  WorkoutModification,
  NutritionPlan,
  Exercise,
  Meal,
  FoodItem,
  WorkoutTemplate,
  DayOfWeek,
  WorkoutDay,
  FormApplication,
  FormResponse,
  Form,
  FormVersion,
  AIWorkoutProposal,
  AIRequest,
} from '../../types';
import { AICopilotModal } from '../../components/ai/AICopilotModal';
import { AIProposalReviewDrawer } from '../../components/ai/AIProposalReviewDrawer';
import { AIExerciseAlternativeModal } from '../../components/ai/AIExerciseAlternativeModal';
import { AIConsentToggle } from '../../components/ai/AIConsentToggle';
import { aiProposalRepository } from '../../repositories/aiProposalRepository';
import { aiRequestRepository } from '../../repositories/aiRequestRepository';

const ALL_DAYS_OF_WEEK: DayOfWeek[] = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
];

export const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enterStudentSimulation } = useAuth();
  const { success, error: toastError, info } = useToast();

  const [searchParams, setSearchParams] = useSearchParams();

  const [student, setStudent] = useState<Student | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [allStudentPlans, setAllStudentPlans] = useState<WorkoutPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [modifications, setModifications] = useState<WorkoutModification[]>([]);
  const [nutrition, setNutrition] = useState<NutritionPlan | null>(null);
  const [exercisesMap, setExercisesMap] = useState<Record<string, Exercise>>({});
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  // Subtab for historico: 'sessoes' | 'chat'
  const [historicoSubTab, setHistoricoSubTab] = useState<'sessoes' | 'chat'>('sessoes');

  // Trainer Feedback modal states
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackSession, setFeedbackSession] = useState<WorkoutSession | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackTag, setFeedbackTag] = useState<WorkoutSession['trainerFeedbackTag']>('Excelente');
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [sendFeedbackToChat, setSendFeedbackToChat] = useState(true);

  // New Cycle / Version modal states
  const [isNewCycleModalOpen, setIsNewCycleModalOpen] = useState(false);
  const [newCycleName, setNewCycleName] = useState('');
  const [cloneCurrentCycle, setCloneCurrentCycle] = useState(true);

  // Template central modal states & day assignment
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [targetTemplateDay, setTargetTemplateDay] = useState<DayOfWeek | null>(null);
  const [selectedTemplateForAssignment, setSelectedTemplateForAssignment] = useState<WorkoutTemplate | null>(null);
  const [isAssignDayModalOpen, setIsAssignDayModalOpen] = useState(false);
  const [assignmentMode, setAssignmentMode] = useState<'existing' | 'new'>('existing');
  const [selectedExistingDayId, setSelectedExistingDayId] = useState<string>('');
  const [selectedNewDayOfWeek, setSelectedNewDayOfWeek] = useState<DayOfWeek>('Segunda');
  const [assignmentDayName, setAssignmentDayName] = useState<string>('');
  const [assignmentMuscleFocus, setAssignmentMuscleFocus] = useState<string>('');
  const [replaceOrAppend, setReplaceOrAppend] = useState<'replace' | 'append'>('replace');

  // Quick edit day title & subtitle modal state
  const [editingDayInfo, setEditingDayInfo] = useState<{ dayId: string; dayOfWeek: string; name: string; muscleFocus: string } | null>(null);

  // Tab and session pagination synced with URL
  const activeTab = searchParams.get('tab') || 'resumo';
  const setActiveTab = (newTab: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', newTab);
    setSearchParams(next);
  };

  const sessionPage = Math.max(1, parseInt(searchParams.get('sessionPage') || '1', 10));
  const sessionLimit = Math.max(1, parseInt(searchParams.get('sessionLimit') || '4', 10));

  // Meal modal states
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [mealName, setMealName] = useState('');
  const [mealTime, setMealTime] = useState('');
  const [mealNotes, setMealNotes] = useState('');

  // Food item modal states
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [targetMealId, setTargetMealId] = useState<string | null>(null);
  const [editingFoodItem, setEditingFoodItem] = useState<FoodItem | null>(null);
  const [foodName, setFoodName] = useState('');
  const [foodQuantity, setFoodQuantity] = useState('');
  const [foodSubstitutions, setFoodSubstitutions] = useState('');
  const [foodNotes, setFoodNotes] = useState('');

  // Archive modal state
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  // Anamnesis / Formulários state
  const [anamnesisApps, setAnamnesisApps] = useState<FormApplication[]>([]);
  const [anamnesisResponses, setAnamnesisResponses] = useState<FormResponse[]>([]);
  const [formsMap, setFormsMap] = useState<Record<string, Form>>({});
  const [formVersionsMap, setFormVersionsMap] = useState<Record<string, FormVersion>>({});
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const refreshAnamnesis = async (stId?: string, uId?: string) => {
    const targetStudentId = stId || student?.id;
    const targetUserId = uId || student?.userId;
    if (!targetStudentId) return;

    try {
      const [apps, resps, allForms, allVers] = await Promise.all([
        formApplicationService.getApplicationsByStudentId(targetStudentId).then(async (res) => {
          if (res && res.length > 0) return res;
          return targetUserId ? formApplicationService.getApplicationsByStudentId(targetUserId) : [];
        }),
        formResponseService.getResponsesByStudentId(targetStudentId).then(async (res) => {
          if (res && res.length > 0) return res;
          return targetUserId ? formResponseService.getResponsesByStudentId(targetUserId) : [];
        }),
        formService.getForms(),
        formVersionRepository.getAll(),
      ]);

      setAnamnesisApps(apps);
      setAnamnesisResponses(resps);

      const fMap: Record<string, Form> = {};
      allForms.forEach((f) => { fMap[f.id] = f; });
      setFormsMap(fMap);

      const vMap: Record<string, FormVersion> = {};
      allVers.forEach((v) => { vMap[v.id] = v; });
      setFormVersionsMap(vMap);
    } catch (e) {
      console.error('Error refreshing anamnesis:', e);
    }
  };

  // AI Copilot state
  const [isAICopilotOpen, setIsAICopilotOpen] = useState(false);
  const [reviewingProposal, setReviewingProposal] = useState<AIWorkoutProposal | null>(null);
  const [aiProposals, setAiProposals] = useState<AIWorkoutProposal[]>([]);
  const [aiStudentRequests, setAiStudentRequests] = useState<AIRequest[]>([]);
  const [selectedExerciseForAIAlt, setSelectedExerciseForAIAlt] = useState<{
    id: string;
    name: string;
    dayId?: string;
  } | null>(null);

  const refreshAiData = async (stId?: string) => {
    const targetStudentId = stId || student?.id;
    if (!targetStudentId) return;
    try {
      const [proposals, reqs] = await Promise.all([
        aiProposalRepository.getByStudentId(targetStudentId),
        aiRequestRepository.getByStudentId(targetStudentId),
      ]);
      setAiProposals(proposals);
      setAiStudentRequests(reqs);
    } catch (err) {
      console.error('Erro ao carregar dados de IA do aluno:', err);
    }
  };

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      const st = await studentRepository.getById(id);
      if (!st) {
        setStudent(null);
        setLoading(false);
        return;
      }

      setStudent(st);
      const studentId = st.id;
      const userId = st.userId;

      // Query workouts, sessions, modifications, and nutrition supporting both st.id and st.userId
      const [plan, plansList, sess, mods, nut, allEx] = await Promise.all([
        workoutRepository.getPlanByStudentId(studentId).then((res) => {
          if (res) return res;
          return userId ? workoutRepository.getPlanByStudentId(userId) : null;
        }),
        workoutRepository.getPlansByStudentId(studentId).then(async (res) => {
          if (res && res.length > 0) return res;
          return userId ? workoutRepository.getPlansByStudentId(userId) : [];
        }),
        workoutRepository.getSessions(studentId).then(async (res) => {
          if (res && res.length > 0) return res;
          return userId ? workoutRepository.getSessions(userId) : [];
        }),
        workoutRepository.getModifications(studentId).then(async (res) => {
          if (res && res.length > 0) return res;
          return userId ? workoutRepository.getModifications(userId) : [];
        }),
        nutritionRepository.getByStudentId(studentId).then((res) => {
          if (res) return res;
          return userId ? nutritionRepository.getByStudentId(userId) : null;
        }),
        exerciseRepository.getAll(),
      ]);

      setWorkoutPlan(plan);
      setAllStudentPlans(plansList);
      setSelectedPlanId(plan ? plan.id : (plansList[0]?.id || null));
      setSessions(sess);
      setModifications(mods);
      setNutrition(nut);

      const map: Record<string, Exercise> = {};
      allEx.forEach((e) => {
        map[e.id] = e;
      });
      setExercisesMap(map);

      await refreshAnamnesis(studentId, userId);
      await refreshAiData(studentId);
      setLoading(false);
    }
    loadData();
  }, [id]);

  const handleCancelApplication = async (appId: string) => {
    try {
      await formApplicationService.cancelApplication(appId);
      success('Aplicação cancelada.');
      if (student) await refreshAnamnesis(student.id, student.userId);
    } catch {
      toastError('Erro ao cancelar aplicação.');
    }
  };

  const handleRemindApplication = (app: FormApplication) => {
    const fName = formsMap[app.formId]?.name || 'formulário';
    info(`Lembrete para o preenchimento de "${fName}" enviado ao aluno.`);
  };

  // Normalização automática do parâmetro de rota para o ID do usuário no banco de dados (evita duplicidade de slugs de alunos)
  useEffect(() => {
    if (student && student.userId && id && id !== student.userId) {
      const currentQuery = searchParams.toString();
      navigate(
        {
          pathname: `/personal/students/${student.userId}`,
          search: currentQuery ? `?${currentQuery}` : '',
        },
        { replace: true }
      );
    }
  }, [student, id, searchParams, navigate]);

  // Workout Plan Versioning Handlers
  const handleActivatePlanVersion = async (planId: string) => {
    if (!student) return;
    try {
      const activated = await workoutRepository.activatePlanVersion(student.id, planId);
      if (activated) {
        setWorkoutPlan(activated);
        setSelectedPlanId(activated.id);
        const updatedList = await workoutRepository.getPlansByStudentId(student.id);
        setAllStudentPlans(updatedList);
        success(`Versão "${activated.name}" ativada como ciclo vigente!`);
      }
    } catch (err) {
      toastError('Erro ao ativar versão do treino.');
    }
  };

  const handleCreateNewCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !newCycleName.trim()) return;

    try {
      const currentActive = workoutPlan;
      const maxVersion = allStudentPlans.reduce((max, p) => Math.max(max, p.version || 1), 1);
      const nextVersion = maxVersion + 1;

      // Deactivate other plans
      const newPlan: WorkoutPlan = {
        id: `plan-${student.id}-v${nextVersion}-${Date.now()}`,
        studentId: student.id,
        trainerId: 'user-rafaela',
        name: newCycleName.trim(),
        version: nextVersion,
        cycleName: newCycleName.trim(),
        active: true,
        validFrom: new Date().toISOString().split('T')[0],
        days: sortWorkoutDays(
          cloneCurrentCycle && currentActive
            ? JSON.parse(JSON.stringify(currentActive.days))
            : [...student.availableDays]
                .sort((a, b) => (DAY_ORDER[a] || 99) - (DAY_ORDER[b] || 99))
                .map((d, i) => ({
                  id: `day-${Date.now()}-${i}`,
                  name: `Treino ${String.fromCharCode(65 + i)}`,
                  dayOfWeek: d,
                  muscleFocus: i === 0 ? 'Peito e Tríceps' : i === 1 ? 'Costas e Bíceps' : 'Pernas e Ombros',
                  exercises: [],
                }))
        ),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };

      await workoutRepository.savePlan(newPlan);
      await workoutRepository.activatePlanVersion(student.id, newPlan.id);

      const updatedList = await workoutRepository.getPlansByStudentId(student.id);
      setAllStudentPlans(updatedList);
      setWorkoutPlan(newPlan);
      setSelectedPlanId(newPlan.id);
      setIsNewCycleModalOpen(false);
      setNewCycleName('');

      await activityRepository.log({
        actorId: 'user-rafaela',
        actorName: 'Rafaela Personal',
        actorRole: 'personal',
        action: 'Novo ciclo de treino criado',
        description: `Rafaela criou a Versão V${nextVersion} (${newPlan.name}) para ${student.name}.`,
        studentId: student.id,
        iconType: 'dumbbell',
      });

      success(`Novo ciclo V${nextVersion} ("${newPlan.name}") criado e ativado!`);
    } catch (err) {
      toastError('Erro ao criar novo ciclo.');
    }
  };

  // Workout Template Handlers
  const handleSelectTemplate = (template: WorkoutTemplate) => {
    setSelectedTemplateForAssignment(template);
    setIsTemplateModalOpen(false);

    const currentPlan = allStudentPlans.find((p) => p.id === selectedPlanId) || workoutPlan;
    const existingDays = currentPlan?.days || [];

    if (targetTemplateDay) {
      const match = existingDays.find((d) => d.dayOfWeek === targetTemplateDay);
      if (match) {
        setAssignmentMode('existing');
        setSelectedExistingDayId(match.id);
        setSelectedNewDayOfWeek(targetTemplateDay);
      } else {
        setAssignmentMode('new');
        setSelectedNewDayOfWeek(targetTemplateDay);
        if (existingDays.length > 0) {
          setSelectedExistingDayId(existingDays[0].id);
        }
      }
    } else if (existingDays.length > 0) {
      setAssignmentMode('existing');
      setSelectedExistingDayId(existingDays[0].id);
      const usedDays = new Set(existingDays.map((d) => d.dayOfWeek));
      const firstFreeDay = ALL_DAYS_OF_WEEK.find((d) => !usedDays.has(d)) || 'Segunda';
      setSelectedNewDayOfWeek(firstFreeDay);
    } else {
      setAssignmentMode('new');
      setSelectedNewDayOfWeek('Segunda');
    }

    setAssignmentDayName(template.name.split(' - ')[0] || template.name);
    setAssignmentMuscleFocus(template.muscleFocus || template.category);
    setReplaceOrAppend('replace');
    setIsAssignDayModalOpen(true);
  };

  const handleConfirmAssignTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !selectedTemplateForAssignment) return;

    try {
      const currentPlan = allStudentPlans.find((p) => p.id === selectedPlanId) || workoutPlan;

      let basePlan: WorkoutPlan;
      if (currentPlan) {
        basePlan = { ...currentPlan };
      } else {
        basePlan = {
          id: `plan-${Date.now()}`,
          studentId: student.id,
          trainerId: 'user-rafaela',
          name: `Treino - ${student.name}`,
          active: true,
          version: 1,
          cycleName: 'Fase 1 - Inicial',
          validFrom: new Date().toISOString().split('T')[0],
          days: [],
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        };
      }

      let updatedDays = [...basePlan.days];
      let assignedDayNameResult = '';

      if (assignmentMode === 'existing') {
        const dayIdx = updatedDays.findIndex((d) => d.id === selectedExistingDayId);
        if (dayIdx >= 0) {
          const currentDay = updatedDays[dayIdx];
          assignedDayNameResult = `${currentDay.dayOfWeek} (${currentDay.name})`;

          if (replaceOrAppend === 'replace') {
            updatedDays[dayIdx] = {
              ...currentDay,
              name: assignmentDayName.trim() || selectedTemplateForAssignment.name,
              muscleFocus: assignmentMuscleFocus.trim() || selectedTemplateForAssignment.muscleFocus,
              exercises: [...selectedTemplateForAssignment.exercises],
            };
          } else {
            updatedDays[dayIdx] = {
              ...currentDay,
              exercises: [...currentDay.exercises, ...selectedTemplateForAssignment.exercises],
            };
          }
        }
      } else {
        // Mode: 'new'
        assignedDayNameResult = `${selectedNewDayOfWeek}`;
        const newDay: WorkoutDay = {
          id: `day-${Date.now()}`,
          name: assignmentDayName.trim() || selectedTemplateForAssignment.name,
          dayOfWeek: selectedNewDayOfWeek,
          muscleFocus: assignmentMuscleFocus.trim() || selectedTemplateForAssignment.muscleFocus,
          exercises: [...selectedTemplateForAssignment.exercises],
        };

        const existingWithSameDayIdx = updatedDays.findIndex((d) => d.dayOfWeek === selectedNewDayOfWeek);
        if (existingWithSameDayIdx >= 0) {
          if (replaceOrAppend === 'replace') {
            updatedDays[existingWithSameDayIdx] = newDay;
          } else {
            updatedDays[existingWithSameDayIdx] = {
              ...updatedDays[existingWithSameDayIdx],
              exercises: [...updatedDays[existingWithSameDayIdx].exercises, ...selectedTemplateForAssignment.exercises],
            };
          }
        } else {
          updatedDays.push(newDay);
        }
      }

      // Sort days of the week chronologically
      updatedDays = sortWorkoutDays(updatedDays);

      const updatedPlan: WorkoutPlan = {
        ...basePlan,
        days: updatedDays,
        updatedAt: new Date().toISOString().split('T')[0],
      };

      await workoutRepository.savePlan(updatedPlan);
      setWorkoutPlan(updatedPlan);
      const updatedList = await workoutRepository.getPlansByStudentId(student.id);
      setAllStudentPlans(updatedList);
      if (selectedPlanId && selectedPlanId === updatedPlan.id) {
        setSelectedPlanId(updatedPlan.id);
      }

      await activityRepository.log({
        actorId: 'user-rafaela',
        actorName: 'Rafaela Personal',
        actorRole: 'personal',
        action: 'Série modelo vinculada ao treino',
        description: `Rafaela adicionou o modelo "${selectedTemplateForAssignment.name}" para ${student.name} no treino de ${assignedDayNameResult}.`,
        studentId: student.id,
        iconType: 'dumbbell',
      });

      success(`Série "${selectedTemplateForAssignment.name}" vinculada com sucesso no treino de ${assignedDayNameResult}!`);
      setIsAssignDayModalOpen(false);
      setSelectedTemplateForAssignment(null);
      setTargetTemplateDay(null);
    } catch (err) {
      toastError('Erro ao vincular série modelo ao cronograma.');
    }
  };

  // Quick Edit Day Title & Subtitle Handler
  const handleSaveDayInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentPlan = allStudentPlans.find((p) => p.id === selectedPlanId) || workoutPlan;
    if (!editingDayInfo || !currentPlan) return;

    try {
      const updatedDays = currentPlan.days.map((d) => {
        if (d.id === editingDayInfo.dayId) {
          return {
            ...d,
            name: editingDayInfo.name.trim() || d.name,
            muscleFocus: editingDayInfo.muscleFocus.trim() || d.muscleFocus,
          };
        }
        return d;
      });

      const updatedPlan = {
        ...currentPlan,
        days: sortWorkoutDays(updatedDays),
        updatedAt: new Date().toISOString().split('T')[0],
      };

      await workoutRepository.savePlan(updatedPlan);
      setWorkoutPlan(updatedPlan);
      setAllStudentPlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
      if (student) {
        await activityRepository.log({
          actorId: 'user-rafaela',
          actorName: 'Rafaela Personal',
          actorRole: 'personal',
          action: 'Título do treino atualizado',
          description: `Rafaela atualizou o título do treino de ${editingDayInfo.dayOfWeek} para "${editingDayInfo.name.trim()}".`,
          studentId: student.id,
          iconType: 'dumbbell',
        });
      }
      setEditingDayInfo(null);
      success(`Título e subtítulo do treino de ${editingDayInfo.dayOfWeek} atualizados com sucesso!`);
    } catch (err) {
      toastError('Erro ao atualizar informações do treino.');
    }
  };

  // Trainer Feedback Handlers
  const handleOpenFeedback = (session: WorkoutSession) => {
    setFeedbackSession(session);
    setFeedbackText(session.trainerFeedback || '');
    setFeedbackTag(session.trainerFeedbackTag || 'Excelente');
    setFeedbackRating(session.trainerFeedbackRating || 5);
    setSendFeedbackToChat(true);
    setIsFeedbackModalOpen(true);
  };

  const handleSaveFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackSession || !student) return;

    try {
      const updated = await workoutRepository.updateSessionFeedback(
        feedbackSession.id,
        feedbackText.trim(),
        feedbackTag,
        feedbackRating
      );

      if (updated) {
        setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      }

      if (sendFeedbackToChat && feedbackText.trim()) {
        await messageRepository.sendMessage({
          studentId: student.id,
          senderId: 'user-rafaela',
          senderName: 'Rafaela Personal',
          senderRole: 'personal',
          category: 'assessment',
          content: `Avaliação do Treino (${feedbackSession.workoutDayName} - ${feedbackSession.date}): "${feedbackText.trim()}" [Classificação: ${feedbackTag}]`,
          metadata: {
            sessionId: feedbackSession.id,
          },
        });
      }

      setIsFeedbackModalOpen(false);
      success('Feedback técnico registrado com sucesso!');
    } catch (err) {
      toastError('Erro ao registrar feedback.');
    }
  };

  // Handlers for Student Status (Pausar e Arquivar)
  const handleTogglePause = async () => {
    if (!student) return;
    const newStatus = student.status === 'Pausado' ? 'Ativo' : 'Pausado';
    await studentRepository.updateStatus(student.id, newStatus);
    setStudent({ ...student, status: newStatus });

    await activityRepository.log({
      actorId: 'user-rafaela',
      actorName: 'Rafaela Personal',
      actorRole: 'personal',
      action: newStatus === 'Pausado' ? 'Aluno pausado' : 'Aluno reativado',
      description: `Rafaela alterou o status de ${student.name} para ${newStatus}.`,
      studentId: student.id,
      iconType: 'edit',
    });

    if (newStatus === 'Pausado') {
      info(`Acompanhamento de ${student.name} foi pausado.`);
    } else {
      success(`Acompanhamento de ${student.name} foi reativado com sucesso!`);
    }
  };

  const handleConfirmArchive = async () => {
    if (!student) return;
    await studentRepository.updateStatus(student.id, 'Arquivado');
    setStudent({ ...student, status: 'Arquivado' });
    setIsArchiveModalOpen(false);

    await activityRepository.log({
      actorId: 'user-rafaela',
      actorName: 'Rafaela Personal',
      actorRole: 'personal',
      action: 'Aluno arquivado',
      description: `Rafaela arquivou o aluno ${student.name}.`,
      studentId: student.id,
      iconType: 'edit',
    });

    success(`Aluno ${student.name} foi arquivado com sucesso.`);
  };

  const handleUnarchive = async () => {
    if (!student) return;
    await studentRepository.updateStatus(student.id, 'Ativo');
    setStudent({ ...student, status: 'Ativo' });

    await activityRepository.log({
      actorId: 'user-rafaela',
      actorName: 'Rafaela Personal',
      actorRole: 'personal',
      action: 'Aluno desarquivado',
      description: `Rafaela desarquivou o aluno ${student.name}.`,
      studentId: student.id,
      iconType: 'edit',
    });

    success(`Aluno ${student.name} foi reativado com sucesso.`);
  };

  // Handlers for Nutrition CRUD
  const handleOpenAddMeal = () => {
    setEditingMeal(null);
    setMealName('');
    setMealTime('08:00');
    setMealNotes('');
    setIsMealModalOpen(true);
  };

  const handleOpenEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setMealName(meal.name);
    setMealTime(meal.time);
    setMealNotes(meal.notes || '');
    setIsMealModalOpen(true);
  };

  const handleSaveMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !mealName.trim()) return;

    try {
      if (editingMeal) {
        const updated = await nutritionRepository.updateMeal(student.id, editingMeal.id, {
          name: mealName,
          time: mealTime,
          notes: mealNotes || undefined,
        });
        setNutrition(updated);
        success('Refeição atualizada!');
      } else {
        const updated = await nutritionRepository.addMeal(student.id, {
          name: mealName,
          time: mealTime,
          notes: mealNotes || undefined,
          items: [],
        });
        setNutrition(updated);
        success('Nova refeição adicionada ao plano!');
      }
      setIsMealModalOpen(false);
    } catch (err) {
      toastError('Erro ao salvar refeição.');
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!student) return;
    try {
      const updated = await nutritionRepository.deleteMeal(student.id, mealId);
      setNutrition(updated);
      success('Refeição removida com sucesso.');
    } catch (err) {
      toastError('Erro ao remover refeição.');
    }
  };

  const handleOpenAddFood = (mealId: string) => {
    setTargetMealId(mealId);
    setEditingFoodItem(null);
    setFoodName('');
    setFoodQuantity('');
    setFoodSubstitutions('');
    setFoodNotes('');
    setIsFoodModalOpen(true);
  };

  const handleOpenEditFood = (mealId: string, item: FoodItem) => {
    setTargetMealId(mealId);
    setEditingFoodItem(item);
    setFoodName(item.name);
    setFoodQuantity(item.quantity);
    setFoodSubstitutions(item.substitutions ? item.substitutions.join(', ') : '');
    setFoodNotes(item.notes || '');
    setIsFoodModalOpen(true);
  };

  const handleSaveFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !targetMealId || !foodName.trim()) return;

    const subs = foodSubstitutions
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (editingFoodItem) {
        const updated = await nutritionRepository.updateFoodItem(student.id, targetMealId, editingFoodItem.id, {
          name: foodName,
          quantity: foodQuantity,
          substitutions: subs,
          notes: foodNotes || undefined,
        });
        setNutrition(updated);
        success('Alimento atualizado!');
      } else {
        const updated = await nutritionRepository.addFoodItem(student.id, targetMealId, {
          name: foodName,
          quantity: foodQuantity,
          substitutions: subs,
          notes: foodNotes || undefined,
        });
        setNutrition(updated);
        success('Alimento adicionado à refeição!');
      }
      setIsFoodModalOpen(false);
    } catch (err) {
      toastError('Erro ao salvar alimento.');
    }
  };

  const handleDeleteFood = async (mealId: string, itemId: string) => {
    if (!student) return;
    try {
      const updated = await nutritionRepository.deleteFoodItem(student.id, mealId, itemId);
      setNutrition(updated);
      success('Alimento removido.');
    } catch (err) {
      toastError('Erro ao remover alimento.');
    }
  };

  const exerciseProgressions = React.useMemo(() => {
    const map: Record<string, { exerciseId: string; name: string; records: { date: string; weight: number; reps?: number }[] }> = {};
    sessions.forEach((s) => {
      s.setsCompleted?.forEach((set) => {
        if (set.actualWeight > 0) {
          const exerciseName = exercisesMap[set.exerciseId]?.name || 'Exercício';
          if (!map[set.exerciseId]) {
            map[set.exerciseId] = { exerciseId: set.exerciseId, name: exerciseName, records: [] };
          }
          map[set.exerciseId].records.push({
            date: s.date,
            weight: set.actualWeight,
            reps: set.actualReps,
          });
        }
      });
    });
    Object.values(map).forEach((item) => {
      item.records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });
    return Object.values(map);
  }, [sessions, exercisesMap]);

  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const incompleteSessions = sessions.filter((s) => s.status === 'incomplete' || s.status === 'skipped');

  // Informações do próximo treino em tempo real com base no calendário atual e plano ativo
  const nextWorkoutInfo = React.useMemo(() => {
    if (!student) {
      return {
        label: 'A definir',
        badge: 'Sem rotina',
        workoutName: 'Nenhum treino agendado',
        muscleFocus: '',
        dateStr: '',
        isToday: false,
      };
    }

    const today = new Date();
    // Dias da semana canônicos no JS: 0=Domingo, 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado
    const JS_TO_DAY_OF_WEEK: DayOfWeek[] = [
      'Domingo',
      'Segunda',
      'Terça',
      'Quarta',
      'Quinta',
      'Sexta',
      'Sábado',
    ];

    const todayDayName = JS_TO_DAY_OF_WEEK[today.getDay()];
    const todayISO = today.toISOString().split('T')[0];

    const activePlan = workoutPlan || allStudentPlans.find((p) => p.active) || allStudentPlans[0];
    const planDays = activePlan?.days || [];

    // Checar se o treino de hoje já foi concluído
    const completedToday = sessions.some(
      (s) => s.date === todayISO && s.status === 'completed'
    );

    // 1. Checar se hoje tem treino agendado e ainda não finalizado
    const todayWorkout = planDays.find((d) => d.dayOfWeek === todayDayName);
    const todayIsAvailable = student.availableDays.includes(todayDayName);

    if ((todayWorkout || todayIsAvailable) && !completedToday) {
      return {
        label: `Hoje (${todayDayName})`,
        badge: 'Treino de Hoje',
        workoutName: todayWorkout?.name || `Treino de ${todayDayName}`,
        muscleFocus: todayWorkout?.muscleFocus || 'Geral',
        dateStr: today.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        isToday: true,
      };
    }

    // 2. Procurar nos próximos 7 dias no calendário
    for (let offset = 1; offset <= 7; offset++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + offset);
      const targetDayName = JS_TO_DAY_OF_WEEK[targetDate.getDay()];

      const targetWorkout = planDays.find((d) => d.dayOfWeek === targetDayName);
      const targetIsAvailable = student.availableDays.includes(targetDayName);

      if (targetWorkout || targetIsAvailable) {
        const isTomorrow = offset === 1;
        const relativeLabel = isTomorrow
          ? `Amanhã (${targetDayName})`
          : `${targetDayName} (em ${offset} dias)`;

        return {
          label: relativeLabel,
          badge: isTomorrow ? 'Amanhã' : `${offset} dias`,
          workoutName: targetWorkout?.name || `Treino de ${targetDayName}`,
          muscleFocus: targetWorkout?.muscleFocus || 'Geral',
          dateStr: targetDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          isToday: false,
        };
      }
    }

    return {
      label: 'A definir',
      badge: 'Sem data',
      workoutName: 'Nenhum treino agendado',
      muscleFocus: 'Ajuste os dias na rotina do aluno',
      dateStr: '',
      isToday: false,
    };
  }, [student, workoutPlan, allStudentPlans, sessions]);

  const totalLoggedSessions = completedSessions.length + incompleteSessions.length;
  const calculatedAdherence = totalLoggedSessions > 0
    ? Math.round((completedSessions.length / totalLoggedSessions) * 100)
    : (student?.adherencePercentage ?? 90);

  // Grade da semana atual sincronizada com o calendário real (Segunda a Domingo)
  const currentWeekDays = React.useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Domingo, 1 = Segunda...
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday);

    const activePlan = workoutPlan || allStudentPlans.find((p) => p.active) || allStudentPlans[0];
    const planDays = activePlan?.days || [];

    return ALL_DAYS_OF_WEEK.map((dayName, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dateISO = d.toISOString().split('T')[0];
      const isToday = d.toDateString() === today.toDateString();

      const workout = planDays.find((wd) => wd.dayOfWeek === dayName);
      const isAvailable = student?.availableDays?.includes(dayName);
      const session = sessions.find((s) => s.date === dateISO);

      let status: 'completed' | 'today' | 'upcoming' | 'rest' = 'rest';
      if (session?.status === 'completed') {
        status = 'completed';
      } else if (isToday && (workout || isAvailable)) {
        status = 'today';
      } else if (workout || isAvailable) {
        status = 'upcoming';
      }

      return {
        dayName,
        dateFormatted: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        dateISO,
        isToday,
        workout,
        session,
        status,
      };
    });
  }, [student, workoutPlan, allStudentPlans, sessions]);

  if (loading || !student) {
    return (
      <div className="py-12 flex justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar with back button */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/personal/students')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Lista de Alunos
        </Button>
      </div>

      {/* Profile Header Banner */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 text-white border-none shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={student.name}
              className="w-20 h-20 rounded-3xl object-cover ring-4 ring-emerald-500/40 shadow-lg shadow-emerald-500/20 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight">{student.name}</h1>
                <Badge variant={student.status === 'Ativo' ? 'success' : 'warning'} size="sm">
                  {student.status}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-xs text-slate-400">{student.email} • {student.phone}</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/80 font-mono text-[11px] text-emerald-400 font-bold" title="ID do Usuário no Banco de Dados">
                  User ID: {student.userId || student.id}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-800/60 border border-slate-700/50 font-mono text-[10px] text-slate-400" title="Identificador Único do Perfil de Aluno">
                  Ref: {student.id}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {student.goals.map((g) => (
                  <span
                    key={g}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400"
                  >
                    {g}
                  </span>
                ))}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300">
                  Nível {student.level}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300">
                  {student.availableDays.length}x/semana
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={async () => {
                if (!student) return;
                const ok = await enterStudentSimulation(student.id);
                if (ok) {
                  success(`Modo simulação iniciado para ${student.name} (sem gravação de alterações).`);
                  navigate('/student/dashboard');
                } else {
                  toastError('Não foi possível iniciar o modo teste.');
                }
              }}
              leftIcon={<FlaskConical className="w-4 h-4 text-emerald-400" />}
              className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500 text-xs"
              title="Testar aplicativo com a visão deste aluno em sandbox isolado"
            >
              Testar como Aluno
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsAICopilotOpen(true)}
              leftIcon={<Sparkles className="w-4 h-4 text-amber-400" />}
              className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500 text-xs"
              title="Abrir o Copilot de IA para gerar propostas ou analisar o treino"
            >
              AI Copilot
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate(`/personal/workouts/new?studentId=${student.id}`)}
              leftIcon={<Dumbbell className="w-4 h-4" />}
            >
              Editar / Novo Treino
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs Navigation (Section 9) */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'resumo', label: 'Resumo', icon: <Users className="w-4 h-4" /> },
          { id: 'treinos', label: 'Treinos', icon: <Dumbbell className="w-4 h-4" /> },
          { id: 'anamnese', label: 'Anamnese', icon: <ClipboardList className="w-4 h-4" /> },
          { id: 'alimentacao', label: 'Alimentação', icon: <Apple className="w-4 h-4" /> },
          { id: 'evolucao', label: 'Evolução', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'historico', label: 'Histórico & Auditoria', icon: <History className="w-4 h-4" /> },
          { id: 'ia', label: 'IA Copilot', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
          { id: 'configuracoes', label: 'Configurações', icon: <Settings className="w-4 h-4" /> },
        ]}
      />

      {/* TAB 1: RESUMO (Section 10) */}
      {activeTab === 'resumo' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Adesão ao Treino"
              value={`${calculatedAdherence}%`}
              icon={<Flame className="w-6 h-6 text-emerald-500" />}
              subtitle={totalLoggedSessions > 0 ? `${completedSessions.length} de ${totalLoggedSessions} sessões concluídas` : 'Consistência nos treinos'}
            />
            <StatCard
              title="Treinos Realizados"
              value={completedSessions.length}
              icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />}
              subtitle="Sessões finalizadas no histórico"
            />
            <StatCard
              title="Treinos Incompletos / Pulados"
              value={incompleteSessions.length}
              icon={<AlertTriangle className="w-6 h-6 text-amber-500" />}
              subtitle="Sessões com pendências"
            />
            <StatCard
              title="Próximo Treino"
              value={nextWorkoutInfo.label}
              icon={<Calendar className="w-6 h-6 text-cyan-500" />}
              subtitle={`${nextWorkoutInfo.workoutName}${nextWorkoutInfo.dateStr ? ` • ${nextWorkoutInfo.dateStr}` : ''}`}
            />
          </div>

          {/* Cronograma da Semana Atual (Calendário Real) */}
          <Card className="overflow-hidden border border-slate-200/80 dark:border-dark-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  Cronograma Semanal do Aluno (Semana Atual)
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
                  Sincronizado com o calendário real e o plano de treino vigente de {student.name}
                </p>
              </div>
              <Badge variant="neutral" size="sm" className="font-mono text-[11px]">
                Hoje: {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
              </Badge>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                {currentWeekDays.map((col) => {
                  return (
                    <div
                      key={col.dayName}
                      className={`p-3 rounded-2xl border transition-all flex flex-col justify-between min-h-[110px] ${
                        col.isToday
                          ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20 shadow-sm'
                          : col.status === 'completed'
                          ? 'border-slate-200 dark:border-dark-border bg-emerald-50/40 dark:bg-emerald-950/10'
                          : col.workout
                          ? 'border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-cardElevated/50'
                          : 'border-slate-100 dark:border-dark-border/40 bg-slate-50/50 dark:bg-dark-card/20 opacity-70'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-black uppercase ${col.isToday ? 'text-emerald-700 dark:text-emerald-400 font-extrabold' : 'text-slate-700 dark:text-slate-300'}`}>
                            {col.dayName.slice(0, 3)}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {col.dateFormatted}
                          </span>
                        </div>
                        {col.isToday && (
                          <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white">
                            Hoje
                          </span>
                        )}
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-dark-border/40">
                        {col.workout ? (
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={col.workout.name}>
                              {col.workout.name}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-dark-muted truncate mt-0.5" title={col.workout.muscleFocus}>
                              {col.workout.muscleFocus}
                            </p>
                            <div className="mt-1.5 flex items-center gap-1">
                              {col.status === 'completed' ? (
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Concluído
                                </span>
                              ) : col.isToday ? (
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <Dumbbell className="w-3 h-3" /> Treino de Hoje
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" /> Agendado
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="py-1 text-center">
                            <span className="text-[11px] text-slate-400 italic">Descanso</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Últimas Alterações Feitas pelo Aluno (Section 2, 21, 22, 23, 24) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Últimas Modificações Registradas pelo Aluno</CardTitle>
                <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
                  Prescrito vs. Executado vs. Alterado (Regra Fundamental do Sistema)
                </p>
              </div>
              <Sparkles className="w-5 h-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              {modifications.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Nenhuma alteração registrada até o momento. O aluno seguiu 100% da prescrição.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-dark-border/60">
                  {modifications.map((mod) => (
                    <div key={mod.id} className="py-3.5 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
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
                            {mod.action === 'EXERCISE_SUBSTITUTED' && 'Exercício Substituído'}
                          </Badge>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {mod.exerciseName}
                          </span>
                        </div>

                        {mod.action === 'WEIGHT_CHANGED' && (
                          <div className="text-xs font-mono text-slate-600 dark:text-slate-300">
                            Prescrito pela Rafaela: <span className="font-bold">{mod.before} kg</span> | Executado pelo aluno: <span className="font-bold text-emerald-500">{mod.after} kg</span> ({mod.difference})
                          </div>
                        )}

                        {mod.action === 'EXERCISE_SKIPPED' && (
                          <div className="text-xs text-rose-500 font-medium">
                            Exercício pulado. Motivo informado: <strong>{mod.reason}</strong>
                          </div>
                        )}

                        {mod.action === 'EXERCISE_SUBSTITUTED' && (
                          <div className="text-xs text-cyan-500 font-medium">
                            Substituído por alternativa autorizada: <strong>{mod.after}</strong> (Motivo: {mod.reason})
                          </div>
                        )}
                      </div>

                      <span className="text-[11px] text-slate-400 font-mono shrink-0">
                        {new Date(mod.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dados do Perfil */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Rotina & Restrições</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                    Dias Disponíveis:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {student.availableDays.map((d) => (
                      <Badge key={d} variant="neutral" size="sm">
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                    Restrições Físicas:
                  </span>
                  <p className="text-slate-600 dark:text-dark-muted">
                    {student.restrictions || 'Nenhuma restrição informada.'}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                    Preferências:
                  </span>
                  <p className="text-slate-600 dark:text-dark-muted">
                    {student.preferences || 'Sem preferências adicionais.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notas da Personal (Rafaela)</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-600 dark:text-dark-muted leading-relaxed">
                {student.notes || 'Nenhuma observação cadastrada para este aluno.'}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: TREINOS (Planos Atuais & Versionamento) */}
      {activeTab === 'treinos' && (() => {
        const displayedPlan = allStudentPlans.find((p) => p.id === selectedPlanId) || workoutPlan;
        const isPlanActive = displayedPlan?.active ?? true;

        return (
          <div className="space-y-6">
            {/* Versioning & Header Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-dark-cardElevated/50 border border-slate-200/60 dark:border-dark-border/40">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {displayedPlan?.name || 'Sem plano configurado'}
                  </h3>
                  <Badge variant={isPlanActive ? 'success' : 'neutral'} size="sm">
                    {isPlanActive ? `Ativo • Versão V${displayedPlan?.version || 1}` : `Histórico • V${displayedPlan?.version || 1}`}
                  </Badge>
                  {displayedPlan?.cycleName && (
                    <span className="text-xs px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      {displayedPlan.cycleName}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-dark-muted">
                  {isPlanActive
                    ? 'Plano de treinamento atualmente vigente para o aluno'
                    : 'Ficha histórica arquivada. O histórico de execuções deste período está preservado.'}
                </p>
              </div>

              {/* Version selector and actions */}
              <div className="flex flex-wrap items-center gap-2">
                {allStudentPlans.length > 1 && (
                  <div className="flex items-center gap-1 bg-white dark:bg-dark-card p-1 rounded-xl border border-slate-200 dark:border-dark-border text-xs">
                    <span className="text-[11px] font-bold text-slate-400 px-2">Versões:</span>
                    {allStudentPlans.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPlanId(p.id)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                          p.id === (displayedPlan?.id)
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        V{p.version || 1} {p.active ? '(Ativo)' : ''}
                      </button>
                    ))}
                  </div>
                )}

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setTargetTemplateDay(null);
                    setIsTemplateModalOpen(true);
                  }}
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-emerald-500" />}
                  className="text-xs"
                >
                  Séries Prontas
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setNewCycleName(`Fase ${(allStudentPlans.length || 1) + 1} - `);
                    setIsNewCycleModalOpen(true);
                  }}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Novo Ciclo
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/personal/workouts/new?studentId=${student.id}`)}
                  leftIcon={<Edit className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  Editar no Construtor
                </Button>
              </div>
            </div>

            {/* Inactive Version Alert Banner */}
            {!isPlanActive && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-900 dark:text-amber-300 block">
                    Modo de Visualização Histórica (Versão V{displayedPlan?.version || 1})
                  </span>
                  <p className="text-amber-800 dark:text-amber-200">
                    Você está consultando a prescrição antiga deste ciclo. Para torná-la novamente o treino ativo de {student.name}, clique no botão ao lado.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleActivatePlanVersion(displayedPlan!.id)}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  className="shrink-0"
                >
                  Restaurar como Plano Ativo
                </Button>
              </div>
            )}

            {!displayedPlan || displayedPlan.days.length === 0 ? (
              <Card className="py-12 text-center">
                <Dumbbell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhum treino montado</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">Crie a prescrição de treinos ou carregue um modelo para este aluno.</p>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setTargetTemplateDay(null);
                      setIsTemplateModalOpen(true);
                    }}
                    leftIcon={<Sparkles className="w-3.5 h-3.5 text-emerald-500" />}
                  >
                    Carregar Série Pronta
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/personal/workouts/new?studentId=${student.id}`)}
                  >
                    Montar Treino Agora
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                {sortWorkoutDays(displayedPlan.days).map((day) => (
                <Card key={day.id} className="overflow-hidden">
                  <div className="bg-slate-100 dark:bg-dark-cardElevated p-4 flex items-center justify-between border-b border-slate-200/60 dark:border-dark-border">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase">
                        {day.dayOfWeek}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {day.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-dark-muted">
                          Foco: {day.muscleFocus} • {day.exercises.length} exercícios
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPlanActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingDayInfo({
                              dayId: day.id,
                              dayOfWeek: day.dayOfWeek,
                              name: day.name,
                              muscleFocus: day.muscleFocus,
                            });
                          }}
                          leftIcon={<Edit className="w-3.5 h-3.5 text-slate-500" />}
                          className="text-xs text-slate-600 dark:text-dark-muted hover:text-slate-900 dark:hover:text-white"
                          title={`Editar título e foco de ${day.dayOfWeek}`}
                        >
                          Editar Nome / Foco
                        </Button>
                      )}
                      {isPlanActive && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setTargetTemplateDay(day.dayOfWeek);
                            setIsTemplateModalOpen(true);
                          }}
                          leftIcon={<Sparkles className="w-3.5 h-3.5 text-emerald-500" />}
                          className="text-xs"
                          title={`Carregar uma série pronta para ${day.dayOfWeek}`}
                        >
                          Carregar Série Aqui
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="p-4 divide-y divide-slate-100 dark:divide-dark-border/60">
                    {day.exercises.map((item, idx) => {
                      const exercise = exercisesMap[item.exerciseId];
                      return (
                        <div key={item.exerciseId} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-dark-cardElevated text-slate-500 flex items-center justify-center text-xs font-bold font-mono shrink-0">
                              {idx + 1}
                            </span>
                            {exercise?.imageUrl && (
                              <button
                                type="button"
                                onClick={() => setPreviewExercise(exercise)}
                                className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 p-1 flex items-center justify-center shrink-0 overflow-hidden hover:ring-2 hover:ring-emerald-500 hover:scale-105 transition-all group"
                                title="Ver animação da execução"
                              >
                                <img
                                  src={getAssetUrl(exercise.imageUrl)}
                                  alt={exercise.name}
                                  className="w-full h-full object-contain"
                                />
                              </button>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                                  {exercise ? exercise.name : 'Exercício'}
                                </h5>
                                {exercise?.videoFrames && exercise.videoFrames.length > 1 && (
                                  <span
                                    onClick={() => setPreviewExercise(exercise)}
                                    className="cursor-pointer text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Vídeo
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-dark-muted">
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                  {item.sets} séries × {item.reps} reps
                                </span>
                                <span>•</span>
                                <span>Carga inicial: <strong>{item.weight} kg</strong></span>
                                <span>•</span>
                                <span>Descanso: <strong>{item.restSeconds}s</strong></span>
                              </div>
                              {item.notes && (
                                <p className="text-[11px] text-slate-500 italic mt-1">
                                  Obs: {item.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Flexibility Permissions Badges (Section 17 & 18) */}
                          <div className="flex flex-wrap items-center gap-1 sm:justify-end">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.allowWeightChange ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 line-through'}`}>
                              Alterar Carga
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.allowSubstitution ? 'bg-cyan-500/15 text-cyan-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 line-through'}`}>
                              Substituir
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.allowSkip ? 'bg-amber-500/15 text-amber-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 line-through'}`}>
                              Pular
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (exercise) {
                                  setSelectedExerciseForAIAlt({
                                    id: exercise.id,
                                    name: exercise.name,
                                    dayId: day.id,
                                  });
                                }
                              }}
                              className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-600 dark:text-purple-400 hover:bg-purple-500/25 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Solicitar sugestões inteligentes de substituição à IA"
                            >
                              <Sparkles className="w-3 h-3" />
                              IA: Alternativa
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
        );
      })()}

      {/* TAB: ANAMNESE & SAÚDE (Section 7, 65, 66, 67, 68) */}
      {activeTab === 'anamnese' && (
        <div className="space-y-6">
          {/* Header & Quick Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-500" />
                Fichas de Anamnese & Formulários de Saúde
              </h3>
              <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
                Histórico clínico, questionários de saúde e formulários personalizados aplicados para este aluno.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsApplyModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Aplicar Formulário
            </Button>
          </div>

          {/* Stat Cards */}
          {(() => {
            const pendingApps = anamnesisApps.filter(
              (a) => a.status === 'pending' || a.status === 'in_progress'
            );
            const completedApps = anamnesisApps.filter((a) => a.status === 'completed');
            const latestResponse = anamnesisResponses[0];

            return (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Formulários Aplicados"
                  value={anamnesisApps.length}
                  icon={<ClipboardList className="w-5 h-5 text-emerald-500" />}
                  subtitle="Total de envios gerados"
                />
                <StatCard
                  title="Pendentes de Preenchimento"
                  value={pendingApps.length}
                  icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
                  subtitle={pendingApps.length > 0 ? 'Aguardando envio do aluno' : 'Tudo em dia'}
                />
                <StatCard
                  title="Respostas Concluídas"
                  value={completedApps.length}
                  icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  subtitle="Questionários respondidos"
                />
                <StatCard
                  title="Último Envio"
                  value={
                    latestResponse?.submittedAt
                      ? new Date(latestResponse.submittedAt).toLocaleDateString('pt-BR')
                      : 'Nenhum'
                  }
                  icon={<History className="w-5 h-5 text-cyan-500" />}
                  subtitle={
                    latestResponse
                      ? formsMap[latestResponse.formId]?.name || 'Formulário'
                      : 'Sem preenchimentos'
                  }
                />
              </div>
            );
          })()}

          {/* Seção 1: Formulários Pendentes */}
          {(() => {
            const pendingApps = anamnesisApps.filter(
              (a) => a.status === 'pending' || a.status === 'in_progress'
            );

            if (pendingApps.length === 0) return null;

            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Formulários Aguardando Resposta ({pendingApps.length})
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingApps.map((app) => {
                    const form = formsMap[app.formId];
                    const version = formVersionsMap[app.formVersionId];
                    const isOverdue = app.dueAt && new Date(app.dueAt) < new Date();

                    return (
                      <Card
                        key={app.id}
                        className="p-5 border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                                  {form?.name || 'Formulário Personalizado'}
                                </h5>
                                {version && (
                                  <Badge variant="neutral" size="sm" className="font-mono text-[10px]">
                                    v{version.version}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {form?.description || 'Saúde & Treino'}
                              </p>
                            </div>
                            <FormStatusBadge status={app.status} />
                          </div>

                          {app.message && (
                            <p className="text-xs text-slate-600 dark:text-dark-muted bg-white/60 dark:bg-dark-card/60 p-2.5 rounded-xl border border-slate-100 dark:border-dark-border italic">
                              &ldquo;{app.message}&rdquo;
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-dark-muted pt-2 border-t border-slate-100 dark:border-dark-border/40">
                            <span>
                              Aplicado em:{' '}
                              <strong>{new Date(app.assignedAt).toLocaleDateString('pt-BR')}</strong>
                            </span>
                            {app.dueAt && (
                              <span className={isOverdue ? 'text-rose-500 font-bold' : ''}>
                                Prazo: <strong>{new Date(app.dueAt).toLocaleDateString('pt-BR')}</strong>
                                {isOverdue && ' (Atrasado)'}
                              </span>
                            )}
                            {app.isMandatory && (
                              <Badge variant="warning" size="sm" className="text-[10px]">
                                Obrigatório
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-slate-100 dark:border-dark-border/40">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-rose-500 hover:bg-rose-500/10"
                            onClick={() => handleCancelApplication(app.id)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs"
                            onClick={() => handleRemindApplication(app)}
                          >
                            Lembrar Aluno
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Seção 2: Histórico de Respostas */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Histórico de Respostas Concluídas ({anamnesisResponses.length})
            </h4>

            {anamnesisResponses.length === 0 ? (
              <Card className="py-12 text-center text-xs text-slate-400">
                <ClipboardList className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Nenhuma resposta concluída ainda
                </p>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Quando o aluno preencher um formulário, as respostas completas e o termo de consentimento aparecerão aqui.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsApplyModalOpen(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Aplicar Formulário Agora
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {anamnesisResponses.map((resp) => {
                  const form = formsMap[resp.formId];
                  const version = formVersionsMap[resp.formVersionId];

                  return (
                    <Card
                      key={resp.id}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-500/40 transition-all"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                            {form?.name || 'Formulário Personalizado'}
                          </h5>
                          {version && (
                            <Badge variant="neutral" size="sm" className="font-mono text-[10px]">
                              v{version.version}
                            </Badge>
                          )}
                          <FormStatusBadge status="completed" />
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-dark-muted font-mono">
                          <span>
                            Respondido em:{' '}
                            <strong className="text-slate-700 dark:text-slate-300">
                              {resp.submittedAt ? new Date(resp.submittedAt).toLocaleString('pt-BR', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              }) : 'Não enviado'}
                            </strong>
                          </span>
                          <span>•</span>
                          <span>
                            {resp.answers.length} respostas registradas
                          </span>
                          {resp.consentRecord && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                ✓ Consentimento LGPD Assinado
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/personal/anamnesis/responses/${resp.id}`)}
                          leftIcon={<Eye className="w-4 h-4 text-emerald-500" />}
                          className="text-xs"
                        >
                          Ver Respostas
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: HISTÓRICO & AUDITORIA (Section 2, 29, 41) */}
      {activeTab === 'historico' && (
        <div className="space-y-6">
          {/* Sub-tab Navigation: Sessões vs Bate-Papo */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-dark-border pb-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setHistoricoSubTab('sessoes')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                historicoSubTab === 'sessoes'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-card'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Sessões Executadas & Avaliações</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ml-1 ${
                  historicoSubTab === 'sessoes'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-dark-border text-slate-700 dark:text-slate-300'
                }`}
              >
                {sessions.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setHistoricoSubTab('chat')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                historicoSubTab === 'chat'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-card'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Bate-Papo & Alinhamento Técnico</span>
              <Badge variant="success" size="sm" className="ml-1">
                Ativo
              </Badge>
            </button>
          </div>

          {/* Subtab 1: Bate-Papo Exclusivo Aluno ↔ Treinadora */}
          {historicoSubTab === 'chat' && (
            <StudentTrainerChatSection student={student} />
          )}

          {/* Subtab 2: Histórico de Sessões e Avaliações */}
          {historicoSubTab === 'sessoes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Histórico de Sessões Executadas
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-dark-muted">
                    Consulte as cargas executadas, percepção de esforço e registre feedbacks técnicos
                  </p>
                </div>
                <span className="text-xs text-slate-500 dark:text-dark-muted font-mono">
                  {sessions.length} treinos registrados
                </span>
              </div>

              {sessions.length === 0 ? (
                <Card className="py-12 text-center text-slate-400 text-xs">
                  Nenhuma sessão de treino executada ainda.
                </Card>
              ) : (() => {
                const totalSessions = sessions.length;
                const totalPages = Math.max(1, Math.ceil(totalSessions / sessionLimit));
                const safePage = Math.min(sessionPage, totalPages);
                const start = (safePage - 1) * sessionLimit;
                const end = Math.min(start + sessionLimit, totalSessions);
                const paginatedSessions = sessions.slice(start, end);

                return (
                  <div className="space-y-4">
                    {paginatedSessions.map((s) => (
                      <Card key={s.id} className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-dark-border/60">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {s.workoutDayName}
                              </h4>
                              <Badge
                                variant={s.status === 'completed' ? 'success' : 'warning'}
                                size="sm"
                              >
                                {s.status === 'completed' ? 'Concluído' : 'Incompleto'}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">
                              Data: {s.date} • Duração: {s.durationMinutes || 45} min
                            </p>
                          </div>

                          <div className="flex items-center gap-3 text-xs">
                            {s.rating && (
                              <span className="font-bold text-amber-500">
                                Avaliação Aluno: {s.rating}/5 ⭐
                              </span>
                            )}
                            {s.rpe && (
                              <span className="font-bold text-slate-600 dark:text-slate-300">
                                RPE: {s.rpe}/10
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Summary of sets and volume */}
                        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 dark:bg-dark-cardElevated/50 p-2.5 rounded-xl font-mono">
                          <div>
                            <span className="text-slate-400 block text-[10px]">SÉRIES</span>
                            <strong className="text-slate-900 dark:text-white">{s.totalSets}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">CARGA TOTAL</span>
                            <strong className="text-emerald-500">{s.totalVolumeKg} kg</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">PULADOS</span>
                            <strong className={s.skippedExercises.length > 0 ? 'text-rose-500' : 'text-slate-500'}>
                              {s.skippedExercises.length}
                            </strong>
                          </div>
                        </div>

                        {s.notes && (
                          <div className="mt-3 text-xs italic text-slate-600 dark:text-dark-muted bg-slate-100/50 dark:bg-slate-800/30 p-2.5 rounded-xl">
                            <strong>Observação do aluno:</strong> &ldquo;{s.notes}&rdquo;
                          </div>
                        )}

                        {/* Trainer Feedback Section */}
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-dark-border/60">
                          {s.trainerFeedback ? (
                            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2 text-xs">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                                  <Award className="w-4 h-4 text-emerald-500" />
                                  <span>Feedback Oficial da Treinadora (Rafaela)</span>
                                  {s.trainerFeedbackTag && (
                                    <Badge variant="success" size="sm">
                                      {s.trainerFeedbackTag}
                                    </Badge>
                                  )}
                                  {s.trainerFeedbackRating && (
                                    <span className="text-amber-500 font-bold ml-1">
                                      {Array.from({ length: s.trainerFeedbackRating }).map((_, i) => '★').join('')}
                                    </span>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenFeedback(s)}
                                  leftIcon={<Edit className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                                  className="text-[11px] h-6 px-2.5 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15"
                                >
                                  Editar Feedback
                                </Button>
                              </div>
                              <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                                &ldquo;{s.trainerFeedback}&rdquo;
                              </p>
                              {s.trainerFeedbackAt && (
                                <span className="text-[10px] text-slate-400 block font-mono">
                                  Registrado em: {new Date(s.trainerFeedbackAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-dark-cardElevated/40 border border-dashed border-slate-200 dark:border-dark-border text-xs">
                              <span className="text-slate-400 italic">
                                Nenhum feedback técnico registrado para esta sessão de treino.
                              </span>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleOpenFeedback(s)}
                                leftIcon={<Award className="w-3.5 h-3.5 text-emerald-500" />}
                                className="text-xs shrink-0"
                              >
                                Avaliar Treino
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}

                    {totalPages > 1 && (
                      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-xs text-slate-500 font-mono">
                          Exibindo <strong>{start + 1}</strong> a <strong>{end}</strong> de{' '}
                          <strong>{totalSessions}</strong> treinos
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={safePage <= 1}
                            onClick={() => {
                              const next = new URLSearchParams(searchParams);
                              next.set('sessionPage', String(safePage - 1));
                              setSearchParams(next);
                            }}
                            leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                          >
                            Anterior
                          </Button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                              key={p}
                              onClick={() => {
                                const next = new URLSearchParams(searchParams);
                                next.set('sessionPage', String(p));
                                setSearchParams(next);
                              }}
                              className={`w-7 h-7 rounded-lg text-xs font-bold font-mono transition-colors ${
                                p === safePage
                                  ? 'bg-emerald-500 text-white shadow-sm'
                                  : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={safePage >= totalPages}
                            onClick={() => {
                              const next = new URLSearchParams(searchParams);
                              next.set('sessionPage', String(safePage + 1));
                              setSearchParams(next);
                            }}
                            rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                          >
                            Próximo
                          </Button>
                        </div>
                      </Card>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ALIMENTAÇÃO (Section 31 & 32) */}
      {activeTab === 'alimentacao' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <div>
              <strong className="block font-bold">Aviso Legal & Diretriz de Competência:</strong>
              {nutrition?.disclaimer || 'Conteúdo demonstrativo. A prescrição nutricional formal requer profissional habilitado.'}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {nutrition?.goal || 'Diretrizes Nutricionais'}
              </h3>
              <p className="text-xs text-slate-500">
                {nutrition?.dailyCalories ? `Aproximadamente ${nutrition.dailyCalories} kcal diárias` : 'Gerencie as refeições e alimentos recomendados'}
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAddMeal}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Nova Refeição
            </Button>
          </div>

          {nutrition && nutrition.meals && nutrition.meals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nutrition.meals.map((meal) => (
                <Card key={meal.id} className="p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-dark-border/60">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {meal.name}
                        </h4>
                        <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                          {meal.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                          onClick={() => handleOpenEditMeal(meal)}
                          title="Editar Refeição"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-rose-400 hover:text-rose-600 dark:hover:text-rose-300"
                          onClick={() => handleDeleteMeal(meal.id)}
                          title="Excluir Refeição"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {meal.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-2">
                        Obs: {meal.notes}
                      </p>
                    )}

                    <div className="mt-3 space-y-2 text-xs">
                      {meal.items && meal.items.length > 0 ? (
                        meal.items.map((it) => (
                          <div
                            key={it.id}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-dark-cardElevated/40 border border-slate-100 dark:border-dark-border/40 flex items-start justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                                <span>{it.name}</span>
                                <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400 font-mono">
                                  ({it.quantity})
                                </span>
                              </div>
                              {it.substitutions && it.substitutions.length > 0 && (
                                <div className="text-[11px] text-slate-500">
                                  ⇄ Substituições: <span className="text-slate-700 dark:text-slate-300">{it.substitutions.join(', ')}</span>
                                </div>
                              )}
                              {it.notes && (
                                <div className="text-[10px] text-slate-400 italic">
                                  {it.notes}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
                                onClick={() => handleOpenEditFood(meal.id, it)}
                                title="Editar Alimento"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-rose-400 hover:text-rose-600"
                                onClick={() => handleDeleteFood(meal.id, it.id)}
                                title="Excluir Alimento"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 py-2 italic text-center">
                          Nenhum alimento cadastrado nesta refeição.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-dark-border/40">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                      onClick={() => handleOpenAddFood(meal.id)}
                      leftIcon={<Plus className="w-3 h-3" />}
                    >
                      Adicionar Alimento
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="py-12 text-center text-xs text-slate-400">
              <Apple className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nenhuma refeição cadastrada</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">Adicione refeições para compor a orientação alimentar do aluno.</p>
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenAddMeal}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Criar Primeira Refeição
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* TAB 5: EVOLUÇÃO (Section 30 - Real History Progression) */}
      {activeTab === 'evolucao' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Treinos Concluídos"
              value={completedSessions.length}
              subtitle={`${sessions.length} total de registros`}
              icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
            />
            <StatCard
              title="Volume Total Levantado"
              value={`${completedSessions.reduce((acc, s) => acc + s.totalVolumeKg, 0).toLocaleString()} kg`}
              subtitle="Carga total somada"
              icon={<Dumbbell className="w-5 h-5 text-cyan-500" />}
            />
            <StatCard
              title="Exercícios Monitorados"
              value={exerciseProgressions.length}
              subtitle="Com registro de carga"
              icon={<Sparkles className="w-5 h-5 text-amber-500" />}
            />
          </div>

          <Card className="p-6">
            <CardTitle className="mb-1">Evolução de Cargas por Exercício</CardTitle>
            <p className="text-xs text-slate-500 dark:text-dark-muted mb-6">
              Acompanhamento de sobrecarga progressiva calculado diretamente das sessões executadas
            </p>

            {exerciseProgressions.length > 0 ? (
              <div className="space-y-4">
                {exerciseProgressions.map((prog) => {
                  const initialWeight = prog.records[0].weight;
                  const latestWeight = prog.records[prog.records.length - 1].weight;
                  const diff = latestWeight - initialWeight;
                  const isPositive = diff > 0;
                  const isNeutral = diff === 0;

                  return (
                    <div key={prog.exerciseId} className="p-4 rounded-xl bg-slate-50 dark:bg-dark-cardElevated/50 border border-slate-200/60 dark:border-dark-border/60">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {prog.name}
                        </span>
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          isPositive
                            ? 'bg-emerald-500/15 text-emerald-500'
                            : isNeutral
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                            : 'bg-rose-500/15 text-rose-500'
                        }`}>
                          {isPositive ? `+${diff} kg` : isNeutral ? 'Carga mantida' : `${diff} kg`}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
                        <span>Primeira carga: <strong className="text-slate-700 dark:text-slate-200">{initialWeight} kg</strong></span>
                        <span>→</span>
                        <span>Última carga: <strong className="text-emerald-500">{latestWeight} kg</strong></span>
                        <span>•</span>
                        <span className="text-[11px] text-slate-400">
                          {prog.records.length} {prog.records.length === 1 ? 'registro' : 'registros'} ({prog.records[prog.records.length - 1].date})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                <Dumbbell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                Nenhum registro de carga encontrado ainda nas sessões deste aluno.
                <p className="text-[11px] text-slate-500 mt-1">Conforme o aluno treinar e registrar repetições e cargas, as métricas de evolução aparecerão aqui em tempo real.</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 7: IA COPILOT (Histórico de Propostas, Auditoria de Inferências) */}
      {activeTab === 'ia' && (
        <div className="space-y-6">
          {/* Header & Quick Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Copilot de Treinos com IA & Histórico de Propostas
              </h3>
              <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
                Propostas estruturadas geradas por Inteligência Artificial, validação de regras e auditoria para {student.name}.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAICopilotOpen(true)}
              leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Nova Proposta com IA
            </Button>
          </div>

          {/* Banner de Conformidade e Supervisão Humana */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-950 dark:text-amber-200 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm space-y-1">
              <p className="font-bold">Supervisão Humana Obrigatória</p>
              <p className="text-slate-600 dark:text-amber-300/80 leading-relaxed text-xs">
                As propostas sugeridas pela IA não alteram o treino ativo do aluno até que a Rafaela faça a revisão clínica
                completa e clique em <strong>Aprovar Treino</strong>.
              </p>
            </div>
          </div>

          {/* Lista de Propostas */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-500" />
              Propostas Registradas ({aiProposals.length})
            </h4>

            {aiProposals.length === 0 ? (
              <Card className="p-8 text-center space-y-3 border-dashed">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h5 className="text-sm font-bold text-slate-800 dark:text-white">
                  Nenhuma proposta de IA gerada ainda para este aluno
                </h5>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Clique no botão abaixo para abrir o assistente e prescrever um novo ciclo de treinos com o Copilot.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAICopilotOpen(true)}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Abrir AI Copilot
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiProposals.map((proposal) => {
                  const totalExercises = proposal.days.reduce((acc, d) => acc + d.exercises.length, 0);
                  const isPending = proposal.status === 'generated';
                  const isApproved = proposal.status === 'approved';
                  const isRejected = proposal.status === 'rejected';

                  return (
                    <Card
                      key={proposal.id}
                      className={`p-5 space-y-4 transition-all ${
                        isPending ? 'border-amber-500/40 ring-1 ring-amber-500/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                              {proposal.workoutName}
                            </h5>
                            <Badge
                              variant={
                                isApproved
                                  ? 'success'
                                  : isRejected
                                  ? 'danger'
                                  : isPending
                                  ? 'warning'
                                  : 'brand'
                              }
                              size="sm"
                            >
                              {isApproved
                                ? 'Aprovada'
                                : isRejected
                                ? 'Rejeitada'
                                : isPending
                                ? 'Aguardando Revisão'
                                : 'Modificada'}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
                            Objetivo: {proposal.goal} • {proposal.days.length} dias • {totalExercises} exercícios
                          </p>
                        </div>
                      </div>

                      {/* Warnings & Notes */}
                      {proposal.warnings && proposal.warnings.length > 0 && (
                        <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300">
                          <strong>Alerta Clínico:</strong> {proposal.warnings[0]}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-dark-border">
                        <span className="font-mono text-[11px]">
                          {new Date(proposal.createdAt).toLocaleDateString('pt-BR')} • {proposal.model}
                        </span>
                        <Button
                          variant={isPending ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={() => setReviewingProposal(proposal)}
                          className="text-xs"
                        >
                          {isPending ? 'Revisar & Aprovar' : 'Visualizar Proposta'}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: CONFIGURAÇÕES (Status Real & Persistência) */}
      {activeTab === 'configuracoes' && (
        <Card className="p-6">
          <CardTitle className="mb-2">Configurações do Aluno</CardTitle>
          <p className="text-xs text-slate-500 mb-6">
            Gestão de status e preferências de acompanhamento com persistência no Supabase
          </p>

          <div className="space-y-4 max-w-xl">
            {/* LGPD AI Consent Section */}
            <AIConsentToggle studentId={student.id} studentName={student.name} />

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-cardElevated/50 border border-slate-200/60 dark:border-dark-border/60 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Status Atual: <span className={student.status === 'Ativo' ? 'text-emerald-500' : student.status === 'Pausado' ? 'text-amber-500' : 'text-slate-400'}>{student.status}</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {student.status === 'Pausado'
                    ? 'O acompanhamento do aluno está temporariamente pausado.'
                    : student.status === 'Arquivado'
                    ? 'Este aluno está arquivado e não aparece na listagem ativa.'
                    : 'O aluno está ativo e acessando os treinos normalmente.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {student.status === 'Arquivado' ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleUnarchive}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Desarquivar
                  </Button>
                ) : (
                  <Button
                    variant={student.status === 'Pausado' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={handleTogglePause}
                    leftIcon={student.status === 'Pausado' ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  >
                    {student.status === 'Pausado' ? 'Reativar Aluno' : 'Pausar Acompanhamento'}
                  </Button>
                )}
              </div>
            </div>

            {student.status !== 'Arquivado' && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                    Arquivar Aluno
                  </h4>
                  <p className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-0.5">
                    O aluno deixará de ter treinos ativos e será movido para o arquivo.
                  </p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setIsArchiveModalOpen(true)}
                  leftIcon={<Archive className="w-3.5 h-3.5" />}
                >
                  Arquivar
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Modal: Refeição (Nova ou Editar) */}
      <Modal
        isOpen={isMealModalOpen}
        onClose={() => setIsMealModalOpen(false)}
        title={editingMeal ? 'Editar Refeição' : 'Nova Refeição'}
      >
        <form onSubmit={handleSaveMeal} className="space-y-4">
          <Input
            label="Nome da Refeição"
            placeholder="Ex: Café da Manhã, Almoço, Pré-Treino..."
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            required
          />
          <Input
            label="Horário Recomendado"
            type="time"
            value={mealTime}
            onChange={(e) => setMealTime(e.target.value)}
            required
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Observações / Instruções
            </label>
            <textarea
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={2}
              placeholder="Ex: Consumir 40 minutos antes do treino com 300ml de água"
              value={mealNotes}
              onChange={(e) => setMealNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsMealModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Salvar Refeição
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Alimento (Adicionar ou Editar) */}
      <Modal
        isOpen={isFoodModalOpen}
        onClose={() => setIsFoodModalOpen(false)}
        title={editingFoodItem ? 'Editar Alimento' : 'Adicionar Alimento'}
      >
        <form onSubmit={handleSaveFood} className="space-y-4">
          <Input
            label="Nome do Alimento"
            placeholder="Ex: Ovos mexidos, Arroz integral, Filé de frango..."
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            required
          />
          <Input
            label="Quantidade / Porção"
            placeholder="Ex: 3 unidades, 150g, 1 colher de sopa..."
            value={foodQuantity}
            onChange={(e) => setFoodQuantity(e.target.value)}
            required
          />
          <Input
            label="Opções de Substituição (separadas por vírgula)"
            placeholder="Ex: 30g de Whey, 150g de iogurte grego"
            value={foodSubstitutions}
            onChange={(e) => setFoodSubstitutions(e.target.value)}
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notas adicionais
            </label>
            <textarea
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={2}
              placeholder="Ex: Pode substituir por tofu se preferir opção vegetal"
              value={foodNotes}
              onChange={(e) => setFoodNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsFoodModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Salvar Alimento
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirmar Arquivamento */}
      <Modal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        title="Arquivar Aluno"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Tem certeza de que deseja arquivar o aluno <strong>{student.name}</strong>?
          </p>
          <p className="text-xs text-slate-500 dark:text-dark-muted">
            O histórico de treinos e cargas será mantido intacto no banco de dados, mas ele não constará na listagem de alunos ativos.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsArchiveModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleConfirmArchive}
            >
              Confirmar Arquivamento
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Exercise Animation Preview */}
      {previewExercise && (
        <Modal
          isOpen={!!previewExercise}
          onClose={() => setPreviewExercise(null)}
          title={previewExercise.name}
          description={`${previewExercise.category} • ${previewExercise.equipment} • Mini Vídeo Animado`}
          size="lg"
        >
          <div className="space-y-4">
            <ExerciseFramePlayer
              frames={previewExercise.videoFrames}
              fallbackImage={previewExercise.imageUrl}
              title={previewExercise.name}
              autoPlay={true}
              className="w-full"
            />
            {previewExercise.instructions && (
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Instruções da Rafaela para este exercício:
                </span>
                <p className="text-slate-600 dark:text-dark-muted leading-relaxed">
                  {previewExercise.instructions}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Modal: Feedback Técnico da Treinadora (Rafaela) */}
      {isFeedbackModalOpen && feedbackSession && (
        <Modal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          title={`Avaliação & Feedback: ${feedbackSession.workoutDayName}`}
          description={`Sessão executada em ${feedbackSession.date} • Duração: ${feedbackSession.durationMinutes || 45} min`}
          size="md"
        >
          <form onSubmit={handleSaveFeedback} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Classificação Técnica / Selo
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    'Excelente',
                    'Carga Adequada',
                    'Ajuste Recomendado',
                    'Atenção à Postura',
                    'Consistência',
                  ] as WorkoutSession['trainerFeedbackTag'][]
                ).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setFeedbackTag(tag)}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all text-left cursor-pointer ${
                      feedbackTag === tag
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nota de Desempenho (1 a 5)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    className={`text-xl transition-all cursor-pointer ${
                      star <= feedbackRating ? 'text-amber-400 scale-110' : 'text-slate-300 dark:text-slate-700'
                    }`}
                  >
                    ★
                  </button>
                ))}
                <span className="text-xs font-mono font-bold text-slate-500 ml-2">
                  {feedbackRating} / 5 estrelas
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Orientação & Parecer da Treinadora
              </label>
              <textarea
                required
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
                placeholder="Ex: Excelente execução no supino com os 32kg! Mantenha a cadência de 2 segundos na descida e conserve os 60s de descanso..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={sendFeedbackToChat}
                onChange={(e) => setSendFeedbackToChat(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <span>Enviar este parecer diretamente no <strong>Bate-Papo</strong> com o aluno</span>
            </label>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-dark-border/60">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsFeedbackModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Salvar Feedback Oficial
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Criar Novo Ciclo / Versão de Treino */}
      {isNewCycleModalOpen && (
        <Modal
          isOpen={isNewCycleModalOpen}
          onClose={() => setIsNewCycleModalOpen(false)}
          title="Novo Ciclo de Treinamento (Nova Versão)"
          description="Crie uma nova versão do plano de treino preservando todo o histórico anterior intacto."
          size="md"
        >
          <form onSubmit={handleCreateNewCycle} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome do Novo Ciclo / Periodização
              </label>
              <Input
                required
                value={newCycleName}
                onChange={(e) => setNewCycleName(e.target.value)}
                placeholder="Ex: Fase 2 - Hipertrofia ABCD, Ciclo de Força Março/2026"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={cloneCurrentCycle}
                onChange={(e) => setCloneCurrentCycle(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <span>Duplicar exercícios e regras do ciclo atual como ponto de partida</span>
            </label>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-cardElevated border border-slate-200 dark:border-dark-border text-xs text-slate-500 space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">Versionamento Seguro:</span>
              <p>
                O plano atual será arquivado como versão histórica e o novo plano assumirá o status <strong>Ativo</strong> imediatamente.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-dark-border/60">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsNewCycleModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Criar e Ativar Ciclo
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Central de Séries Pré-Cadastradas (Modelos) */}
      <WorkoutTemplatesModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        title="Central de Séries Modelos Pré-Cadastradas"
        description={`Selecione uma série pré-montada para vincular a ${student.name}${targetTemplateDay ? ` no treino de ${targetTemplateDay}` : ''}.`}
      />

      {/* Modal: Escolha do Dia para Adicionar a Série (Novo ou Existente) */}
      {isAssignDayModalOpen && selectedTemplateForAssignment && (
        <Modal
          isOpen={isAssignDayModalOpen}
          onClose={() => {
            setIsAssignDayModalOpen(false);
            setSelectedTemplateForAssignment(null);
          }}
          title="Adicionar Série ao Treino do Aluno"
          description={`Defina onde e como adicionar "${selectedTemplateForAssignment.name}" no cronograma de ${student.name}.`}
          size="lg"
        >
          <form onSubmit={handleConfirmAssignTemplate} className="space-y-4">
            {/* Selected Template Summary Card */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                      Série Selecionada
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-white/10 font-mono text-slate-300">
                      {selectedTemplateForAssignment.category}
                    </span>
                    {selectedTemplateForAssignment.versionTag && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                        {selectedTemplateForAssignment.versionTag}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white mt-0.5 truncate">
                    {selectedTemplateForAssignment.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {selectedTemplateForAssignment.exercises.length} exercícios • {selectedTemplateForAssignment.estimatedMinutes || 50} min • Foco: {selectedTemplateForAssignment.muscleFocus}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsAssignDayModalOpen(false);
                  setIsTemplateModalOpen(true);
                }}
                className="text-xs shrink-0 bg-slate-800 hover:bg-slate-700 text-white border-white/10"
              >
                Trocar Série
              </Button>
            </div>

            {/* Mode Selector: Existing Day vs New Day */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Onde deseja incluir esta série no cronograma?
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: Existing Day */}
                <button
                  type="button"
                  disabled={!workoutPlan || workoutPlan.days.length === 0}
                  onClick={() => setAssignmentMode('existing')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    assignmentMode === 'existing'
                      ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30'
                      : 'border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-cardElevated hover:border-slate-300 dark:hover:border-slate-700'
                  } ${!workoutPlan || workoutPlan.days.length === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${assignmentMode === 'existing' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Substituir em Dia Existente
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-dark-muted block mt-0.5">
                      Atualiza os exercícios de um dia que já está na ficha do aluno
                    </span>
                  </div>
                </button>

                {/* Option 2: New Day */}
                <button
                  type="button"
                  onClick={() => setAssignmentMode('new')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    assignmentMode === 'new'
                      ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30'
                      : 'border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-cardElevated hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${assignmentMode === 'new' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    <Plus className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Criar um Novo Dia de Treino
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-dark-muted block mt-0.5">
                      Adiciona um novo dia na semana (ex: Terça, Quinta ou Sábado)
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Sub-section: Existing Day Options */}
            {assignmentMode === 'existing' && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-cardElevated border border-slate-200 dark:border-dark-border space-y-3 animate-fade-in">
                <label className="text-xs font-bold text-slate-800 dark:text-white block">
                  Selecione qual dia existente deseja atualizar:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {sortWorkoutDays((allStudentPlans.find((p) => p.id === selectedPlanId) || workoutPlan)?.days || []).map((day) => {
                    const isSelected = selectedExistingDayId === day.id;
                    return (
                      <div
                        key={day.id}
                        onClick={() => setSelectedExistingDayId(day.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-dark-border hover:bg-white dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-black uppercase">
                            {day.dayOfWeek}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {day.exercises.length} ex.
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 truncate">
                          {day.name}
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-dark-muted truncate">
                          {day.muscleFocus}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-dark-border/60">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Modo de Inserção dos Exercícios:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${replaceOrAppend === 'replace' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 font-semibold text-emerald-800 dark:text-emerald-300' : 'border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400'}`}>
                      <input
                        type="radio"
                        name="replaceOrAppend"
                        checked={replaceOrAppend === 'replace'}
                        onChange={() => setReplaceOrAppend('replace')}
                        className="text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>Substituir todo o treino deste dia</span>
                    </label>

                    <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${replaceOrAppend === 'append' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 font-semibold text-emerald-800 dark:text-emerald-300' : 'border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400'}`}>
                      <input
                        type="radio"
                        name="replaceOrAppend"
                        checked={replaceOrAppend === 'append'}
                        onChange={() => setReplaceOrAppend('append')}
                        className="text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>Acrescentar ao final dos exercícios atuais</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-section: New Day Options */}
            {assignmentMode === 'new' && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-cardElevated border border-slate-200 dark:border-dark-border space-y-3.5 animate-fade-in">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-white block mb-1.5">
                    Selecione o Dia da Semana:
                  </label>

                  {/* 7 Days of the week pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {ALL_DAYS_OF_WEEK.map((dayName) => {
                      const currentDays = (allStudentPlans.find((p) => p.id === selectedPlanId) || workoutPlan)?.days || [];
                      const existingDay = currentDays.find((d) => d.dayOfWeek === dayName);
                      const isSelected = selectedNewDayOfWeek === dayName;

                      return (
                        <button
                          key={dayName}
                          type="button"
                          onClick={() => setSelectedNewDayOfWeek(dayName)}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/20 font-bold'
                              : 'border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <span className="text-xs font-bold">{dayName}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : existingDay
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium'
                          }`}>
                            {existingDay ? 'Em uso' : 'Livre'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-dark-muted mb-1.5">
                      Nome do Treino *
                    </label>
                    <Input
                      placeholder="Ex: Treino D - Pernas e Glúteos"
                      value={assignmentDayName}
                      onChange={(e) => setAssignmentDayName(e.target.value)}
                      className="font-bold text-sm sm:text-base py-3 px-4 h-12 w-full rounded-xl shadow-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-dark-muted mb-1.5">
                      Foco Muscular *
                    </label>
                    <Input
                      placeholder="Ex: Quadríceps, Glúteos e Posterior"
                      value={assignmentMuscleFocus}
                      onChange={(e) => setAssignmentMuscleFocus(e.target.value)}
                      className="font-medium text-sm sm:text-base py-3 px-4 h-12 w-full rounded-xl shadow-xs"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-dark-border/60">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAssignDayModalOpen(false);
                  setSelectedTemplateForAssignment(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Confirmar e Adicionar Série
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: EDIÇÃO RÁPIDA DE TÍTULO E SUBTÍTULO DO TREINO */}
      {editingDayInfo && (
        <Modal
          isOpen={!!editingDayInfo}
          onClose={() => setEditingDayInfo(null)}
          title={`Editar Título e Subtítulo (${editingDayInfo.dayOfWeek})`}
          description="Altere o título principal do treino e o foco muscular para este dia com facilidade e visibilidade ampla"
        >
          <form onSubmit={handleSaveDayInfo} className="space-y-5 pt-2">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-dark-muted mb-2">
                  Título do Treino *
                </label>
                <Input
                  placeholder="Ex: Treino A - Peito, Ombros e Tríceps"
                  value={editingDayInfo.name}
                  onChange={(e) => setEditingDayInfo({ ...editingDayInfo, name: e.target.value })}
                  className="font-black text-base sm:text-lg py-3 px-4 h-12 w-full rounded-xl shadow-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-dark-muted mb-2">
                  Subtítulo / Foco Muscular *
                </label>
                <Input
                  placeholder="Ex: Peitoral Maior, Deltoide Anterior e Tríceps"
                  value={editingDayInfo.muscleFocus}
                  onChange={(e) => setEditingDayInfo({ ...editingDayInfo, muscleFocus: e.target.value })}
                  className="font-medium text-sm sm:text-base py-3 px-4 h-12 w-full rounded-xl shadow-xs"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-dark-border/60">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditingDayInfo(null)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Salvar Alterações
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Aplicar Formulário de Anamnese / Saúde */}
      {student && (
        <FormApplicationModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          targetStudentId={student.id}
          onApplied={() => {
            refreshAnamnesis(student.id, student.userId);
          }}
        />
      )}

      {/* MODAL 1: AI Copilot Assistant */}
      {student && (
        <AICopilotModal
          isOpen={isAICopilotOpen}
          onClose={() => setIsAICopilotOpen(false)}
          student={student}
          currentPlan={workoutPlan}
          onPlanApplied={(plan: WorkoutPlan) => {
            refreshAiData(student.id);
            setWorkoutPlan(plan);
            setActiveTab('treinos');
          }}
        />
      )}

      {/* DRAWER 2: AI Proposal Review & Approval */}
      {reviewingProposal && student && (
        <AIProposalReviewDrawer
          isOpen={!!reviewingProposal}
          onClose={() => setReviewingProposal(null)}
          proposal={reviewingProposal}
          currentPlan={workoutPlan}
          onApproved={(updatedPlan: WorkoutPlan) => {
            refreshAiData(student.id);
            setWorkoutPlan(updatedPlan);
            setReviewingProposal(null);
            setActiveTab('treinos');
          }}
        />
      )}

      {/* MODAL 3: AI Exercise Alternative Suggestion */}
      {selectedExerciseForAIAlt && student && (
        <AIExerciseAlternativeModal
          isOpen={!!selectedExerciseForAIAlt}
          onClose={() => setSelectedExerciseForAIAlt(null)}
          currentExercise={{
            id: selectedExerciseForAIAlt.id,
            name: selectedExerciseForAIAlt.name,
          }}
          onApplyAlternative={async (altExId: string, altExName: string) => {
            if (selectedExerciseForAIAlt.dayId && workoutPlan) {
              const updatedDays = workoutPlan.days.map((d) => {
                if (d.id === selectedExerciseForAIAlt.dayId) {
                  return {
                    ...d,
                    exercises: d.exercises.map((e) =>
                      e.exerciseId === selectedExerciseForAIAlt.id ? { ...e, exerciseId: altExId } : e
                    ),
                  };
                }
                return d;
              });
              const saved = await workoutRepository.savePlan({ ...workoutPlan, days: updatedDays });
              setWorkoutPlan(saved);
              success(`Exercício substituído por "${altExName}" com sucesso no treino!`);
            } else {
              info(`Alternativa "${altExName}" selecionada.`);
            }
            setSelectedExerciseForAIAlt(null);
          }}
        />
      )}
    </div>
  );
};
