import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Trash2,
  ArrowLeft,
  Check,
  Search,
  Settings2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Sparkles,
  Layers,
  BarChart2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { WorkoutTemplatesModal } from '../../components/workouts/WorkoutTemplatesModal';
import { studentRepository } from '../../repositories/studentRepository';
import { exerciseRepository } from '../../repositories/exerciseRepository';
import { workoutRepository, DAY_ORDER, sortWorkoutDays } from '../../repositories/workoutRepository';
import { activityRepository } from '../../repositories/activityRepository';
import { notificationRepository } from '../../repositories/notificationRepository';
import { useToast } from '../../context/ToastContext';
import { getAssetUrl } from '../../utils/assets';
import {
  Student,
  Exercise,
  WorkoutPlan,
  WorkoutDay,
  WorkoutExercise,
  DayOfWeek,
  WorkoutTemplate,
} from '../../types';

export const WorkoutBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const preselectedStudentId = searchParams.get('studentId');
  const studentPage = Math.max(1, Number(searchParams.get('studentPage') || searchParams.get('page')) || 1);
  const rawStudentLimit = searchParams.get('studentLimit') || searchParams.get('limit');
  const studentSearch = searchParams.get('studentSearch') || '';
  const studentGoal = searchParams.get('studentGoal') || 'all';
  const studentStatus = searchParams.get('studentStatus') || 'all';
  const { success, error: toastError } = useToast();

  // Screen-responsive default page size:
  // - default: 6 items (fits 1, 2, and 3 columns perfectly)
  // - on ultra-wide screens (>= 1536px / 2xl with 4 columns): 8 items (2 rows of 4)
  const getResponsiveDefaultLimit = () => {
    if (typeof window === 'undefined') return 6;
    const width = window.innerWidth;
    if (width >= 1536) return 8;
    return 6;
  };

  const [screenLimit, setScreenLimit] = useState<number>(getResponsiveDefaultLimit);

  useEffect(() => {
    const handleResize = () => {
      setScreenLimit(getResponsiveDefaultLimit());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);
  const [saveAsNewVersion, setSaveAsNewVersion] = useState(false);


  const [students, setStudents] = useState<Student[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  // Step state (1: Select Student, 2: Select Days, 3: Configure Workouts)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(preselectedStudentId ? 3 : 1);

  // Plan data
  const [selectedStudentId, setSelectedStudentId] = useState<string>(preselectedStudentId || '');
  const [planName, setPlanName] = useState('Novo Plano de Treino');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(['Segunda', 'Quarta', 'Sexta']);
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Exercise Picker Modal
  const [pickerModalOpen, setPickerModalOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState('all');

  // Exercise Edit/Config Modal (Section 16, 17, 18)
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configuringExercise, setConfiguringExercise] = useState<WorkoutExercise | null>(null);
  const [configuringIdx, setConfiguringIdx] = useState<number>(-1);

  const availableWeekDays: DayOfWeek[] = [
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado',
    'Domingo',
  ];

  useEffect(() => {
    async function init() {
      const [sts, exs] = await Promise.all([
        studentRepository.getAll(),
        exerciseRepository.getAll(),
      ]);
      setStudents(sts);
      setAllExercises(exs);

      if (preselectedStudentId) {
        const student = sts.find((s) => s.id === preselectedStudentId || s.userId === preselectedStudentId);
        if (student) {
          setSelectedStudentId(student.id);
          const sortedAvail = [...student.availableDays].sort((a, b) => (DAY_ORDER[a] || 99) - (DAY_ORDER[b] || 99));
          setSelectedDays(sortedAvail);
          setPlanName(`Treino Personalizado - ${student.name}`);

          // Load existing plan if available
          const existingPlan = await workoutRepository.getPlanByStudentId(student.id);
          if (existingPlan && existingPlan.days.length > 0) {
            const sortedExisting = sortWorkoutDays(existingPlan.days);
            setWorkoutDays(sortedExisting);
            setSelectedDays(sortedExisting.map((d) => d.dayOfWeek));
          } else {
            // Initialize empty days based on student's available days
            const initDays: WorkoutDay[] = sortedAvail.map((d, i) => ({
              id: `day-${Date.now()}-${i}`,
              name: `Treino ${String.fromCharCode(65 + i)}`,
              dayOfWeek: d,
              muscleFocus: i === 0 ? 'Peito e Tríceps' : i === 1 ? 'Costas e Bíceps' : 'Pernas e Ombros',
              exercises: [],
            }));
            setWorkoutDays(initDays);
          }
        }
      }
      setLoading(false);
    }
    init();
  }, [preselectedStudentId]);

  // URL-based student filters and pagination
  const updateStudentParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null || v === '' || v === 'all') {
        newParams.delete(k);
      } else {
        newParams.set(k, v);
      }
    });
    setSearchParams(newParams);
  };

  const filteredStudents = useMemo(() => {
    const q = studentSearch.toLowerCase().trim();
    return students.filter((s) => {
      if (q) {
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesEmail = s.email.toLowerCase().includes(q);
        const matchesPhone = s.phone.includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone) return false;
      }
      if (studentGoal !== 'all' && !s.goals.includes(studentGoal as any)) return false;
      if (studentStatus !== 'all' && s.status !== studentStatus) return false;
      return true;
    });
  }, [students, studentSearch, studentGoal, studentStatus]);

  const studentsPerPage = rawStudentLimit && rawStudentLimit !== 'auto'
    ? Math.max(1, parseInt(rawStudentLimit, 10))
    : screenLimit;
  const totalStudentPages = Math.max(1, Math.ceil(filteredStudents.length / studentsPerPage));
  const validStudentPage = Math.min(Math.max(1, studentPage), totalStudentPages);


  const paginatedStudents = useMemo(() => {
    const start = (validStudentPage - 1) * studentsPerPage;
    return filteredStudents.slice(start, start + studentsPerPage);
  }, [filteredStudents, validStudentPage]);

  const handleStudentSelect = async (stId: string) => {
    setSelectedStudentId(stId);
    const st = students.find((s) => s.id === stId);
    if (st) {
      const sortedAvail = [...st.availableDays].sort((a, b) => (DAY_ORDER[a] || 99) - (DAY_ORDER[b] || 99));
      setSelectedDays(sortedAvail);
      setPlanName(`Treino Personalizado - ${st.name}`);

      const existingPlan = await workoutRepository.getPlanByStudentId(st.id);
      if (existingPlan && existingPlan.days.length > 0) {
        const sortedExisting = sortWorkoutDays(existingPlan.days);
        setWorkoutDays(sortedExisting);
        setSelectedDays(sortedExisting.map((d) => d.dayOfWeek));
      } else {
        const initDays: WorkoutDay[] = sortedAvail.map((d, i) => ({
          id: `day-${Date.now()}-${i}`,
          name: `Treino ${String.fromCharCode(65 + i)}`,
          dayOfWeek: d,
          muscleFocus: i === 0 ? 'Peito e Tríceps' : i === 1 ? 'Costas e Bíceps' : 'Pernas',
          exercises: [],
        }));
        setWorkoutDays(initDays);
      }
    }
    setCurrentStep(2);
  };

  const handleToggleDay = (day: DayOfWeek) => {
    let updated: DayOfWeek[];
    if (selectedDays.includes(day)) {
      if (selectedDays.length <= 1) {
        toastError('Selecione pelo menos um dia de treino.');
        return;
      }
      updated = selectedDays.filter((d) => d !== day);
    } else {
      updated = [...selectedDays, day];
    }
    const sortedUpdated = [...updated].sort((a, b) => (DAY_ORDER[a] || 99) - (DAY_ORDER[b] || 99));
    setSelectedDays(sortedUpdated);

    // Sync workout days
    const currentDays = [...workoutDays];
    const newDays: WorkoutDay[] = sortedUpdated.map((d, i) => {
      const existing = currentDays.find((cd) => cd.dayOfWeek === d);
      if (existing) return existing;
      return {
        id: `day-${Date.now()}-${i}`,
        name: `Treino ${String.fromCharCode(65 + i)}`,
        dayOfWeek: d,
        muscleFocus: 'Geral',
        exercises: [],
      };
    });
    setWorkoutDays(sortWorkoutDays(newDays));
  };

  const handleAddExerciseToCurrentDay = (ex: Exercise) => {
    const currentDay = workoutDays[activeDayIndex];
    if (!currentDay) return;

    const newWorkoutEx: WorkoutExercise = {
      exerciseId: ex.id,
      order: currentDay.exercises.length + 1,
      sets: 4,
      reps: 10,
      weight: 30, // default initial load
      restSeconds: 90,
      notes: '',
      alternatives: ex.alternatives || [],
      allowWeightChange: true,
      allowSetChange: false,
      allowRepChange: true,
      allowSkip: true,
      allowSubstitution: true,
    };

    const updatedExercises = [...currentDay.exercises, newWorkoutEx];
    const updatedDays = [...workoutDays];
    updatedDays[activeDayIndex] = { ...currentDay, exercises: updatedExercises };
    setWorkoutDays(updatedDays);
    setPickerModalOpen(false);
    success(`${ex.name} adicionado ao treino!`);
  };

  const handleRemoveExercise = (idx: number) => {
    const currentDay = workoutDays[activeDayIndex];
    if (!currentDay) return;

    const updatedExercises = currentDay.exercises.filter((_, i) => i !== idx);
    const updatedDays = [...workoutDays];
    updatedDays[activeDayIndex] = { ...currentDay, exercises: updatedExercises };
    setWorkoutDays(updatedDays);
  };

  const handleOpenConfig = (exItem: WorkoutExercise, idx: number) => {
    setConfiguringExercise({ ...exItem });
    setConfiguringIdx(idx);
    setConfigModalOpen(true);
  };

  const handleSaveConfig = () => {
    if (!configuringExercise || configuringIdx === -1) return;
    const currentDay = workoutDays[activeDayIndex];
    if (!currentDay) return;

    const updatedExercises = [...currentDay.exercises];
    updatedExercises[configuringIdx] = configuringExercise;
    const updatedDays = [...workoutDays];
    updatedDays[activeDayIndex] = { ...currentDay, exercises: updatedExercises };
    setWorkoutDays(updatedDays);
    setConfigModalOpen(false);
    success('Parâmetros e permissões atualizados!');
  };

  const handleSelectTemplate = (template: WorkoutTemplate) => {
    const updated = [...workoutDays];
    if (!updated[activeDayIndex]) return;

    updated[activeDayIndex] = {
      ...updated[activeDayIndex],
      name: template.name.split(' - ')[0] || updated[activeDayIndex].name,
      muscleFocus: template.muscleFocus || updated[activeDayIndex].muscleFocus,
      exercises: [...template.exercises],
    };
    setWorkoutDays(updated);
    success(`Série modelo "${template.name}" carregada no ${updated[activeDayIndex].dayOfWeek}!`);
  };

  const handleSaveFullPlan = async () => {
    if (!selectedStudentId) {
      toastError('Selecione um aluno para o treino.');
      return;
    }

    const totalEx = workoutDays.reduce((acc, d) => acc + d.exercises.length, 0);
    if (totalEx === 0) {
      toastError('Adicione pelo menos um exercício ao treino.');
      return;
    }

    try {
      const student = students.find((s) => s.id === selectedStudentId);
      const existingPlans = await workoutRepository.getPlansByStudentId(selectedStudentId);

      let planId: string;
      let versionNum: number = 1;

      if (saveAsNewVersion && existingPlans.length > 0) {
        const maxVersion = existingPlans.reduce((max, p) => Math.max(max, p.version || 1), 1);
        versionNum = maxVersion + 1;
        planId = `plan-${selectedStudentId}-v${versionNum}-${Date.now()}`;
      } else {
        const existingActive = existingPlans.find((p) => p.active) || existingPlans[0];
        planId = existingActive ? existingActive.id : `plan-${selectedStudentId}`;
        versionNum = existingActive?.version || 1;
      }

      const plan: WorkoutPlan = {
        id: planId,
        studentId: selectedStudentId,
        trainerId: 'user-rafaela',
        name: planName,
        version: versionNum,
        cycleName: planName,
        active: true,
        days: sortWorkoutDays(workoutDays),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };

      await workoutRepository.savePlan(plan);
      if (saveAsNewVersion) {
        await workoutRepository.activatePlanVersion(selectedStudentId, plan.id);
      }

      await activityRepository.log({
        actorId: 'user-rafaela',
        actorName: 'Rafaela Personal',
        actorRole: 'personal',
        action: saveAsNewVersion ? 'Nova versão de treino prescrita' : 'Treino montado/atualizado',
        description: `Rafaela salvou ${saveAsNewVersion ? `a Versão V${versionNum}` : 'o plano'} para ${student?.name} (${workoutDays.length} dias configurados).`,
        studentId: selectedStudentId,
        iconType: 'edit',
      });

      // Send in-app notification to the student (Item 7)
      if (student?.userId) {
        await notificationRepository.create({
          recipientId: student.userId,
          recipientRole: 'student',
          title: 'Nova Ficha de Treino Publicada 🏋️',
          message: `Rafaela liberou sua nova ficha de treino (${planName}). Confira seus exercícios e comece com foco total!`,
          type: 'success',
          link: '/student/workouts',
        });
      }

      success(`Plano de treino (V${versionNum}) salvo com sucesso!`);
      const targetStudent = students.find((s) => s.id === selectedStudentId);
      navigate(targetStudent?.userId ? `/personal/students/${targetStudent.userId}` : `/personal/students/${selectedStudentId}`);
    } catch (err) {
      toastError('Erro ao salvar o plano de treino.');
    }
  };

  // Real-time weekly volume counter by muscle group (Item 6)
  const weeklyMuscleVolume = useMemo(() => {
    const volumeMap: Record<string, number> = {
      'Peitoral': 0,
      'Costas': 0,
      'Quadríceps': 0,
      'Posteriores / Glúteos': 0,
      'Ombros': 0,
      'Bíceps': 0,
      'Tríceps': 0,
      'Abdômen / Core': 0,
    };

    workoutDays.forEach((day) => {
      day.exercises.forEach((item) => {
        const ex = allExercises.find((e) => e.id === item.exerciseId);
        if (!ex) return;
        const sets = Number(item.sets) || 0;
        const cat = (ex.category || '').toLowerCase();
        const muscles = (ex.muscleGroups || []).map((m) => m.toLowerCase()).join(' ');

        if (cat.includes('peito') || muscles.includes('peitor')) {
          volumeMap['Peitoral'] += sets;
        }
        if (cat.includes('costas') || muscles.includes('dorsal') || muscles.includes('latíssimo') || muscles.includes('trape')) {
          volumeMap['Costas'] += sets;
        }
        if (muscles.includes('quadríceps') || muscles.includes('quadriceps') || (cat.includes('pernas') && !muscles.includes('isquio') && !muscles.includes('posterior') && !muscles.includes('glúteo'))) {
          volumeMap['Quadríceps'] += sets;
        }
        if (muscles.includes('isquiotibiais') || muscles.includes('posterior') || muscles.includes('glúteo') || cat.includes('glúteos')) {
          volumeMap['Posteriores / Glúteos'] += sets;
        }
        if (cat.includes('ombro') || muscles.includes('deltoide')) {
          volumeMap['Ombros'] += sets;
        }
        if (muscles.includes('bíceps') || muscles.includes('biceps') || (cat.includes('braços') && muscles.includes('braquial'))) {
          volumeMap['Bíceps'] += sets;
        }
        if (muscles.includes('tríceps') || muscles.includes('triceps')) {
          volumeMap['Tríceps'] += sets;
        }
        if (cat.includes('abdômen') || cat.includes('abdomen') || cat.includes('core') || muscles.includes('abdom')) {
          volumeMap['Abdômen / Core'] += sets;
        }
      });
    });

    return volumeMap;
  }, [workoutDays, allExercises]);

  const totalWeeklySets = useMemo(() => {
    return Object.values(weeklyMuscleVolume).reduce((acc, v) => acc + v, 0);
  }, [weeklyMuscleVolume]);

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const activeDay = workoutDays[activeDayIndex] || workoutDays[0];
  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const filteredPickerExercises = allExercises.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      ex.muscleGroups.some((m) => m.toLowerCase().includes(pickerSearch.toLowerCase()));
    const matchesCategory = pickerCategory === 'all' || ex.category === pickerCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(selectedStudent?.userId ? `/personal/students/${selectedStudent.userId}` : selectedStudentId ? `/personal/students/${selectedStudentId}` : '/personal/dashboard')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Criador de Treinos Personalizados
            </h1>
            <p className="text-xs text-slate-500 dark:text-dark-muted">
              Prescrição técnica com liberdade controlada para o aluno
            </p>
          </div>
        </div>

        {currentStep === 3 && (
          <Button
            variant="primary"
            size="lg"
            onClick={handleSaveFullPlan}
            leftIcon={<Check className="w-5 h-5" />}
          >
            Salvar Prescrição Completa
          </Button>
        )}
      </div>

      {/* Stepper Indicator (Section 11) */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setCurrentStep(1)}
          className={`p-3 rounded-2xl border text-left transition-all ${
            currentStep === 1
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-slate-200 dark:border-dark-border text-slate-500'
          }`}
        >
          <span className="text-[10px] font-bold block uppercase tracking-wider">Passo 1</span>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {selectedStudent ? selectedStudent.name : 'Selecionar Aluno'}
          </span>
        </button>

        <button
          onClick={() => selectedStudentId && setCurrentStep(2)}
          disabled={!selectedStudentId}
          className={`p-3 rounded-2xl border text-left transition-all ${
            currentStep === 2
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-slate-200 dark:border-dark-border text-slate-500'
          }`}
        >
          <span className="text-[10px] font-bold block uppercase tracking-wider">Passo 2</span>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {selectedDays.length} Dias de Treino
          </span>
        </button>

        <button
          onClick={() => selectedStudentId && setCurrentStep(3)}
          disabled={!selectedStudentId}
          className={`p-3 rounded-2xl border text-left transition-all ${
            currentStep === 3
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-slate-200 dark:border-dark-border text-slate-500'
          }`}
        >
          <span className="text-[10px] font-bold block uppercase tracking-wider">Passo 3</span>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            Montar Exercícios & Regras
          </span>
        </button>
      </div>

      {/* STEP 1: Selecionar Aluno (com Filtros e Paginação na URL) */}
      {currentStep === 1 && (
        <Card className="p-6 space-y-4">
          <CardHeader className="p-0">
            <CardTitle>Passo 1: Selecione o Aluno</CardTitle>
            <p className="text-xs text-slate-500">
              Escolha para qual aluno este plano de treinamento será prescrito. Os dias de treino disponíveis cadastrados serão carregados automaticamente.
            </p>
          </CardHeader>

          {/* Filters Bar for Students */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <Input
              placeholder="Buscar aluno por nome, e-mail..."
              value={studentSearch}
              onChange={(e) => updateStudentParams({ studentSearch: e.target.value, studentPage: '1' })}
              leftIcon={<Search className="w-4 h-4" />}
              rightIcon={
                studentSearch ? (
                  <button
                    type="button"
                    onClick={() => updateStudentParams({ studentSearch: null, studentPage: '1' })}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : undefined
              }
            />

            <Select
              value={studentGoal}
              onChange={(e) => updateStudentParams({ studentGoal: e.target.value, studentPage: '1' })}
              options={[
                { value: 'all', label: 'Todos os Objetivos' },
                { value: 'Hipertrofia', label: 'Hipertrofia' },
                { value: 'Emagrecimento', label: 'Emagrecimento' },
                { value: 'Condicionamento', label: 'Condicionamento' },
                { value: 'Força', label: 'Força' },
                { value: 'Saúde', label: 'Saúde' },
              ]}
            />

            <Select
              value={studentStatus}
              onChange={(e) => updateStudentParams({ studentStatus: e.target.value, studentPage: '1' })}
              options={[
                { value: 'all', label: 'Todos os Status' },
                { value: 'Ativo', label: 'Ativo' },
                { value: 'Atenção', label: 'Precisa de Atenção' },
                { value: 'Pausado', label: 'Pausado' },
                { value: 'Arquivado', label: 'Arquivado' },
                { value: 'Inativo', label: 'Inativo' },
              ]}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-dark-muted pt-1">
            <span>
              Encontrados <strong className="text-slate-900 dark:text-white">{filteredStudents.length}</strong> alunos
            </span>
            {(studentSearch || studentGoal !== 'all' || studentStatus !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateStudentParams({ studentSearch: null, studentGoal: null, studentStatus: null, studentPage: '1' })}
                className="text-xs text-rose-500 hover:text-rose-600 h-7 px-2"
              >
                Limpar Filtros
              </Button>
            )}
          </div>

          {paginatedStudents.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Nenhum aluno encontrado para os filtros selecionados.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
              {paginatedStudents.map((st) => {
                const isSelected = st.id === selectedStudentId;
                return (
                  <div
                    key={st.id}
                    onClick={() => handleStudentSelect(st.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-sm ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-dark-border hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-dark-cardElevated'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={st.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={st.name}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {st.name}
                          </h4>
                          <Badge
                            variant={st.status === 'Ativo' ? 'success' : st.status === 'Pausado' ? 'warning' : 'neutral'}
                            size="sm"
                          >
                            {st.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {st.email}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                          {st.level} • {st.goals.join(', ')}
                        </p>
                      </div>
                    </div>

                    {/* Available Training Days Registered */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-dark-cardElevated/60 border border-slate-100 dark:border-dark-border/40 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>Dias Cadastrados ({st.availableDays.length}):</span>
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 font-semibold block mt-0.5">
                        {st.availableDays.length > 0 ? st.availableDays.join(', ') : 'Nenhum dia cadastrado'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* URL Pagination Controls for Students (Estilo ExercisesPage) */}
          <div className="pt-4 border-t border-slate-100 dark:border-dark-border/60 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-slate-500 dark:text-dark-muted text-center sm:text-left">
              <div>
                Exibindo{' '}
                <strong className="text-slate-900 dark:text-white">
                  {filteredStudents.length > 0 ? (validStudentPage - 1) * studentsPerPage + 1 : 0}
                </strong>{' '}
                a{' '}
                <strong className="text-slate-900 dark:text-white">
                  {Math.min(validStudentPage * studentsPerPage, filteredStudents.length)}
                </strong>{' '}
                de <strong className="text-slate-900 dark:text-white">{filteredStudents.length}</strong> alunos
                <span className="ml-1 text-slate-400">
                  (Página {validStudentPage} de {totalStudentPages})
                </span>
              </div>

              {/* Items per Page Selector */}
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                <span className="text-[11px] text-slate-400 font-semibold">Exibir:</span>
                <select
                  value={rawStudentLimit || 'auto'}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateStudentParams({ studentLimit: val === 'auto' ? null : val, limit: null, studentPage: '1', page: '1' });
                  }}
                  className="text-xs font-bold bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl px-2.5 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="auto">Tela ({screenLimit} por página)</option>
                  <option value="6">6 por página (Padrão)</option>
                  <option value="8">8 por página</option>
                  <option value="9">9 por página</option>
                  <option value="12">12 por página</option>
                  <option value="18">18 por página</option>
                  <option value="24">24 por página</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* First Page */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateStudentParams({ studentPage: '1', page: '1' })}
                disabled={validStudentPage <= 1}
                className="px-2"
                title="Primeira Página"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>

              {/* Previous Page */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateStudentParams({ studentPage: String(validStudentPage - 1), page: String(validStudentPage - 1) })}
                disabled={validStudentPage <= 1}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Anterior
              </Button>

              {/* Direct Page Numbers */}
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalStudentPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateStudentParams({ studentPage: String(p), page: String(p) })}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                      validStudentPage === p
                        ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-2xs font-semibold'
                        : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Next Page */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateStudentParams({ studentPage: String(validStudentPage + 1), page: String(validStudentPage + 1) })}
                disabled={validStudentPage >= totalStudentPages}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Próxima
              </Button>

              {/* Last Page */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateStudentParams({ studentPage: String(totalStudentPages), page: String(totalStudentPages) })}
                disabled={validStudentPage >= totalStudentPages}
                className="px-2"
                title="Última Página"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}


      {/* STEP 2: Selecionar Dias */}
      {currentStep === 2 && (
        <Card className="p-6 space-y-6">
          <CardHeader>
            <CardTitle>Passo 2: Defina os Dias de Treino</CardTitle>
            <p className="text-xs text-slate-500">
              Selecione os dias da semana em que {selectedStudent?.name} irá treinar
            </p>
          </CardHeader>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {availableWeekDays.map((day) => {
              const isSelected = selectedDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleToggleDay(day)}
                  className={`p-4 rounded-2xl border text-center font-bold text-xs sm:text-sm transition-all flex flex-col items-center gap-2 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-cardElevated text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                  <span>{day}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setCurrentStep(1)}>
              Voltar
            </Button>
            <Button variant="primary" onClick={() => setCurrentStep(3)}>
              Avançar para Montagem dos Exercícios
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: Montar Exercícios por Dia (Section 11, 16, 17, 18) */}
      {currentStep === 3 && activeDay && (
        <div className="space-y-6">
          {/* Plan Name & Versioning Options */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-dark-cardElevated/50 border border-slate-200/60 dark:border-dark-border/40 shadow-xs">
            <div className="flex-1 max-w-xl">
              <Input
                label="Nome da Ficha / Ciclo de Treino *"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Ex: Treino Hipertrofia ABCD, Fase 2 - Força"
                className="font-bold text-sm sm:text-base py-3 px-4 h-12 rounded-xl shadow-xs"
              />
            </div>
            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer pt-2 sm:pt-0 font-medium">
              <input
                type="checkbox"
                checked={saveAsNewVersion}
                onChange={(e) => setSaveAsNewVersion(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
              <span>Salvar como <strong>Nova Versão / Novo Ciclo</strong> (preserva rotina anterior)</span>
            </label>
          </div>

          {/* Live Weekly Sets Volume Counter by Muscle Group (Item 6) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-white/[0.06] shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-white/[0.04]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    Volume Semanal Prescrito por Grupamento
                    <span className="text-[11px] font-normal text-slate-400 dark:text-dark-muted hidden sm:inline">
                      • Referência hipertrófica (10 a 20 séries/semana)
                    </span>
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-dark-muted font-medium">Total Semanal:</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono">
                  {totalWeeklySets} séries
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              {Object.entries(weeklyMuscleVolume).map(([muscle, sets]) => {
                const isOptimal = sets >= 10 && sets <= 22;
                const isHigh = sets > 22;
                const isLow = sets > 0 && sets < 10;
                const isEmpty = sets === 0;

                return (
                  <div
                    key={muscle}
                    className={`p-2.5 rounded-xl border transition-all text-center flex flex-col justify-between ${
                      isEmpty
                        ? 'border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.01] opacity-60'
                        : isOptimal
                        ? 'border-emerald-500/30 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06]'
                        : isHigh
                        ? 'border-sky-500/30 bg-sky-500/[0.04] dark:bg-sky-500/[0.06]'
                        : 'border-amber-500/30 bg-amber-500/[0.04] dark:bg-amber-500/[0.06]'
                    }`}
                  >
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate" title={muscle}>
                      {muscle}
                    </span>
                    <div className="my-1.5 flex items-baseline justify-center gap-1">
                      <span
                        className={`text-base font-bold font-mono ${
                          isEmpty
                            ? 'text-slate-400'
                            : isOptimal
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isHigh
                            ? 'text-sky-600 dark:text-sky-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {sets}
                      </span>
                      <span className="text-[10px] text-slate-400">séries</span>
                    </div>
                    <span
                      className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
                        isEmpty
                          ? 'text-slate-400 bg-slate-100 dark:bg-white/[0.04]'
                          : isOptimal
                          ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10'
                          : isHigh
                          ? 'text-sky-700 dark:text-sky-300 bg-sky-500/10'
                          : 'text-amber-700 dark:text-amber-300 bg-amber-500/10'
                      }`}
                    >
                      {isEmpty ? '0 séries' : isOptimal ? 'Volume Ótimo' : isHigh ? 'Especialização' : 'Manutenção'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {workoutDays.map((day, idx) => (
              <button
                key={day.id}
                onClick={() => setActiveDayIndex(idx)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  activeDayIndex === idx
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-2xs'
                    : 'bg-white dark:bg-dark-card text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-dark-border'
                }`}
              >
                <span>{day.dayOfWeek}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/15 text-white">
                  {day.exercises.length}
                </span>
              </button>
            ))}
          </div>

          {/* Active Day Card */}
          <Card className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-dark-border/60">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-xs">
                  {activeDay.dayOfWeek}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-dark-muted">
                  Configuração Geral deste Dia
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setTemplatesModalOpen(true)}
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-emerald-500" />}
                  className="text-xs font-bold"
                >
                  Séries Prontas
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setPickerSearch('');
                    setPickerModalOpen(true);
                  }}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="text-xs font-bold"
                >
                  Adicionar Exercício
                </Button>
              </div>
            </div>

            {/* Caixas de Edição Maiores para Título e Subtítulo do Treino */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-dark-cardElevated/40 border border-slate-200/70 dark:border-dark-border/50">
              <div className="md:col-span-7">
                <Input
                  label="Título do Treino *"
                  value={activeDay.name}
                  onChange={(e) => {
                    const updated = [...workoutDays];
                    updated[activeDayIndex].name = e.target.value;
                    setWorkoutDays(updated);
                  }}
                  className="font-black text-base sm:text-lg py-3 px-4 h-12 w-full rounded-xl shadow-xs"
                  placeholder="Ex: Treino A - Peito, Tríceps e Core"
                  required
                />
              </div>

              <div className="md:col-span-5">
                <Input
                  label="Subtítulo / Foco Muscular *"
                  value={activeDay.muscleFocus}
                  onChange={(e) => {
                    const updated = [...workoutDays];
                    updated[activeDayIndex].muscleFocus = e.target.value;
                    setWorkoutDays(updated);
                  }}
                  className="font-medium text-sm sm:text-base py-3 px-4 h-12 w-full rounded-xl shadow-xs"
                  placeholder="Ex: Peitoral, Tríceps e Deltoide Anterior"
                  required
                />
              </div>
            </div>

            {/* Exercises List for this day */}
            <div className="divide-y divide-slate-100 dark:divide-dark-border/60 mt-4">
              {activeDay.exercises.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Nenhum exercício adicionado para {activeDay.dayOfWeek}. Clique em &ldquo;Adicionar Exercício&rdquo;.
                </div>
              ) : (
                activeDay.exercises.map((item, idx) => {
                  const exDetails = allExercises.find((e) => e.id === item.exerciseId);
                  return (
                    <div
                      key={item.exerciseId + idx}
                      className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-300 font-bold font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        {exDetails?.imageUrl && (
                          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                            <img
                              src={getAssetUrl(exDetails.imageUrl)}
                              alt={exDetails.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">
                              {exDetails?.name || 'Exercício'}
                            </h4>
                            <Badge variant="brand" size="sm">
                              {exDetails?.category || 'Geral'}
                            </Badge>
                          </div>

                          {/* Prescription details pills */}
                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg">
                              {item.sets} séries × {item.reps} reps
                            </span>
                            <span className="font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-dark-cardElevated px-2.5 py-0.5 rounded-lg font-mono">
                              {item.weight} kg
                            </span>
                            <span className="text-slate-500 dark:text-dark-muted">
                              Descanso: {item.restSeconds}s
                            </span>
                          </div>

                          {item.notes && (
                            <p className="text-[11px] text-slate-500 italic mt-1">
                              Obs: {item.notes}
                            </p>
                          )}

                          {/* Permissions summary */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.allowWeightChange ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 line-through'}`}>
                              Alterar Carga
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.allowSetChange ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 line-through'}`}>
                              Alterar Séries
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.allowSubstitution ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 line-through'}`}>
                              Substituir ({item.alternatives.length})
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.allowSkip ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 line-through'}`}>
                              Pular
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center gap-2 self-end md:self-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenConfig(item, idx)}
                          leftIcon={<Settings2 className="w-3.5 h-3.5" />}
                          className="text-xs"
                        >
                          Configurar Regras
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveExercise(idx)}
                          className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Modal 1: Exercise Picker from Library (Section 14) */}
      <Modal
        isOpen={pickerModalOpen}
        onClose={() => setPickerModalOpen(false)}
        title="Selecionar Exercício da Biblioteca"
        description="Escolha um exercício para incluir no treino"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Buscar exercício..."
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
            <Select
              value={pickerCategory}
              onChange={(e) => setPickerCategory(e.target.value)}
              options={[
                { value: 'all', label: 'Todas as Categorias' },
                { value: 'Peito', label: 'Peito' },
                { value: 'Costas', label: 'Costas' },
                { value: 'Pernas', label: 'Pernas' },
                { value: 'Ombros', label: 'Ombros' },
                { value: 'Bíceps', label: 'Bíceps' },
                { value: 'Tríceps', label: 'Tríceps' },
                { value: 'Core', label: 'Core / Abdômen' },
                { value: 'Cardio', label: 'Cardio' },
                { value: 'Mobilidade', label: 'Mobilidade / Alongamento' },
              ]}

            />
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-dark-border/60">
            {filteredPickerExercises.map((ex) => (
              <div
                key={ex.id}
                onClick={() => handleAddExerciseToCurrentDay(ex)}
                className="py-3 px-3 flex items-center justify-between hover:bg-emerald-500/10 rounded-2xl cursor-pointer transition-colors group gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Exercise Cartoon Illustration Preview Thumbnail */}
                  <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1 overflow-hidden shrink-0">
                    <img
                      src={getAssetUrl(ex.imageUrl || '/exercises/exercise-peito-01.png')}
                      alt={ex.name}
                      className="max-h-full max-w-full object-contain filter drop-shadow-xs group-hover:scale-110 transition-transform duration-200"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors truncate">
                        {ex.name}
                      </h5>
                      <Badge variant="brand" size="sm" className="shrink-0">
                        {ex.category}
                      </Badge>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-400 uppercase">
                        {ex.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5 truncate">
                      {ex.equipment} • {ex.type} • {ex.alternatives.length} alternativas
                    </p>
                  </div>
                </div>

                <Button variant="primary" size="sm" className="shrink-0 pointer-events-none">
                  Adicionar
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Modal 2: Configure Exercise Prescription & Flexibility (Section 16, 17, 18) */}
      <Modal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        title="Prescrição & Flexibilidade do Exercício"
        description="Defina séries, repetições, carga inicial e as permissões que o aluno terá ao executar"
        size="md"
      >
        {configuringExercise && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Input
                label="Séries"
                type="number"
                value={configuringExercise.sets}
                onChange={(e) =>
                  setConfiguringExercise({
                    ...configuringExercise,
                    sets: Math.max(1, Number(e.target.value)),
                  })
                }
              />
              <Input
                label="Repetições"
                type="number"
                value={configuringExercise.reps}
                onChange={(e) =>
                  setConfiguringExercise({
                    ...configuringExercise,
                    reps: Math.max(1, Number(e.target.value)),
                  })
                }
              />
              <Input
                label="Carga (kg)"
                type="number"
                value={configuringExercise.weight}
                onChange={(e) =>
                  setConfiguringExercise({
                    ...configuringExercise,
                    weight: Math.max(0, Number(e.target.value)),
                  })
                }
              />
              <Input
                label="Descanso (s)"
                type="number"
                value={configuringExercise.restSeconds}
                onChange={(e) =>
                  setConfiguringExercise({
                    ...configuringExercise,
                    restSeconds: Math.max(10, Number(e.target.value)),
                  })
                }
              />
            </div>

            <Input
              label="Observação Técnica para o Aluno"
              placeholder="Ex: Controle a descida, pausa de 1s no pico..."
              value={configuringExercise.notes || ''}
              onChange={(e) =>
                setConfiguringExercise({
                  ...configuringExercise,
                  notes: e.target.value,
                })
              }
            />

            {/* Flexibility Permissions Toggles (Section 17 & 18) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-cardElevated/50 border border-slate-200 dark:border-dark-border space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Permissões de Flexibilidade do Aluno
              </h5>

              <label className="flex items-center justify-between text-xs font-semibold cursor-pointer">
                <span className="text-slate-800 dark:text-slate-200">Permitir alteração de carga</span>
                <input
                  type="checkbox"
                  checked={configuringExercise.allowWeightChange}
                  onChange={(e) =>
                    setConfiguringExercise({
                      ...configuringExercise,
                      allowWeightChange: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between text-xs font-semibold cursor-pointer">
                <span className="text-slate-800 dark:text-slate-200">Permitir alteração de repetições</span>
                <input
                  type="checkbox"
                  checked={configuringExercise.allowRepChange}
                  onChange={(e) =>
                    setConfiguringExercise({
                      ...configuringExercise,
                      allowRepChange: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between text-xs font-semibold cursor-pointer">
                <span className="text-slate-800 dark:text-slate-200">Permitir alteração da quantidade de séries</span>
                <input
                  type="checkbox"
                  checked={configuringExercise.allowSetChange}
                  onChange={(e) =>
                    setConfiguringExercise({
                      ...configuringExercise,
                      allowSetChange: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between text-xs font-semibold cursor-pointer">
                <span className="text-slate-800 dark:text-slate-200">Permitir pular este exercício</span>
                <input
                  type="checkbox"
                  checked={configuringExercise.allowSkip}
                  onChange={(e) =>
                    setConfiguringExercise({
                      ...configuringExercise,
                      allowSkip: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between text-xs font-semibold cursor-pointer">
                <span className="text-slate-800 dark:text-slate-200">Permitir substituir por alternativas</span>
                <input
                  type="checkbox"
                  checked={configuringExercise.allowSubstitution}
                  onChange={(e) =>
                    setConfiguringExercise({
                      ...configuringExercise,
                      allowSubstitution: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setConfigModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSaveConfig}>
                Aplicar Configurações
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Central de Séries Pré-Cadastradas (Modelos) */}
      <WorkoutTemplatesModal
        isOpen={templatesModalOpen}
        onClose={() => setTemplatesModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        title="Central de Séries Modelos Pré-Cadastradas"
        description={`Carregue uma série pronta para o treino de ${activeDay?.dayOfWeek || 'hoje'}.`}
      />
    </div>
  );
};
