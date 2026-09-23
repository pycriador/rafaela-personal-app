import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { workoutRepository } from '../../repositories/workoutRepository';
import { exerciseRepository } from '../../repositories/exerciseRepository';
import { activityRepository } from '../../repositories/activityRepository';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { RestTimer } from '../../components/ui/RestTimer';
import { ExerciseFramePlayer } from '../../components/ui/ExerciseFramePlayer';
import { StudentTrainerChatSection } from '../../components/chat/StudentTrainerChatSection';
import {
  WorkoutPlan,
  WorkoutDay,
  WorkoutExercise,
  Exercise,
  ExecutedSet,
  SkippedExercise,
  SubstitutedExercise,
  WorkoutSession,
} from '../../types';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dumbbell,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRightLeft,
  Volume2,
  HeartPulse,
  MessageSquare,
  HelpCircle,
  Play,
  Pause,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

export const StudentActiveWorkoutPage: React.FC = () => {
  const { dayId } = useParams<{ dayId: string }>();
  const navigate = useNavigate();
  const { studentProfile } = useAuth();
  const { success, warning, error: toastError } = useToast();

  const [workoutDay, setWorkoutDay] = useState<WorkoutDay | null>(null);
  const [exercisesList, setExercisesList] = useState<WorkoutExercise[]>([]);
  const [exercisesMap, setExercisesMap] = useState<Record<string, Exercise>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Completed sets in this active session
  const [completedSets, setCompletedSets] = useState<ExecutedSet[]>([]);
  const [skippedExercises, setSkippedExercises] = useState<SkippedExercise[]>([]);
  const [substitutedExercises, setSubstitutedExercises] = useState<SubstitutedExercise[]>([]);

  // Current inputs for the active set
  const [currentWeight, setCurrentWeight] = useState<number>(30);
  const [currentReps, setCurrentReps] = useState<number>(10);

  // Rest Timer state
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);

  // Modal 1: Alterar Carga (Section 21)
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [tempWeightInput, setTempWeightInput] = useState<number>(30);

  // Modal 2: Pular Exercício (Section 23)
  const [skipModalOpen, setSkipModalOpen] = useState(false);
  const [skipReason, setSkipReason] = useState<
    'Sem equipamento' | 'Dor/desconforto' | 'Falta de tempo' | 'Não quero realizar' | 'Outro'
  >('Sem equipamento');
  const [skipNotes, setSkipNotes] = useState('');

  // Modal 3: Substituir Exercício (Section 24)
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [selectedAlternativeId, setSelectedAlternativeId] = useState<string>('');
  const [subReason, setSubReason] = useState('Equipamento ocupado');

  // Modal 4: Finalizar Treino (Section 26)
  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [perceivedRating, setPerceivedRating] = useState(4); // 1-5
  const [rpe, setRpe] = useState(7); // 1-10
  const [energyLevel, setEnergyLevel] = useState(4); // 1-5
  const [sessionNotes, setSessionNotes] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);

  // Modal 5: Bate-Papo & Dúvidas Técnicas do Treino
  const [chatModalOpen, setChatModalOpen] = useState(false);

  // Track start time & live chronometer
  const [startTime] = useState<string>(() => new Date().toISOString());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [autoSwapsCount, setAutoSwapsCount] = useState<number>(0);
  const [exercisePreferences, setExercisePreferences] = useState<Record<string, 'liked' | 'disliked'>>({});

  // Chronometer effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatChronometer = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  useEffect(() => {
    async function load() {
      if (!studentProfile) return;
      const [plan, allEx] = await Promise.all([
        workoutRepository.getPlanByStudentId(studentProfile.id),
        exerciseRepository.getAll(),
      ]);

      const map: Record<string, Exercise> = {};
      allEx.forEach((e) => {
        map[e.id] = e;
      });
      setExercisesMap(map);

      if (plan) {
        const foundDay = plan.days.find((d) => d.id === dayId) || plan.days[0];
        if (foundDay) {
          setWorkoutDay(foundDay);
          setExercisesList([...foundDay.exercises]);
          if (foundDay.exercises.length > 0) {
            setCurrentWeight(foundDay.exercises[0].weight);
            setCurrentReps(foundDay.exercises[0].reps);
            setTimerSeconds(foundDay.exercises[0].restSeconds);
          }
        }
      }
      setLoading(false);
    }
    load();
  }, [studentProfile, dayId]);

  const currentWorkoutExercise = exercisesList[currentIndex];
  const currentExerciseData = currentWorkoutExercise
    ? exercisesMap[currentWorkoutExercise.exerciseId]
    : null;

  // Sets already recorded for this current exercise
  const currentExerciseSets = useMemo(() => {
    if (!currentWorkoutExercise) return [];
    return completedSets.filter((s) => s.exerciseId === currentWorkoutExercise.exerciseId);
  }, [completedSets, currentWorkoutExercise]);

  const isCurrentExerciseSkipped = useMemo(() => {
    if (!currentWorkoutExercise) return false;
    return skippedExercises.some((s) => s.exerciseId === currentWorkoutExercise.exerciseId);
  }, [skippedExercises, currentWorkoutExercise]);

  // Update input values when changing exercise
  useEffect(() => {
    if (currentWorkoutExercise) {
      setCurrentWeight(currentWorkoutExercise.weight);
      setCurrentReps(currentWorkoutExercise.reps);
      setTimerSeconds(currentWorkoutExercise.restSeconds);
    }
  }, [currentIndex, currentWorkoutExercise]);

  // Handle Log Set (Section 20)
  const handleLogSet = () => {
    if (!currentWorkoutExercise) return;

    const nextSetIndex = currentExerciseSets.length + 1;
    const newSet: ExecutedSet = {
      exerciseId: currentWorkoutExercise.exerciseId,
      setIndex: nextSetIndex,
      prescribedWeight: currentWorkoutExercise.weight,
      prescribedReps: currentWorkoutExercise.reps,
      actualWeight: currentWeight,
      actualReps: currentReps,
      completedAt: new Date().toISOString(),
    };

    setCompletedSets((prev) => [...prev, newSet]);
    success(`Série ${nextSetIndex} registrada: ${currentWeight} kg × ${currentReps} reps!`);

    // Launch rest timer if there are more sets to do
    if (nextSetIndex < currentWorkoutExercise.sets) {
      setIsTimerOpen(true);
    } else {
      // Completed all prescribed sets for this exercise
      if (currentIndex < exercisesList.length - 1) {
        success('Exercício concluído! Avançando para o próximo...');
        setTimeout(() => setCurrentIndex((prev) => prev + 1), 600);
      } else {
        setFinishModalOpen(true);
      }
    }
  };

  // Handle Weight Change (Section 21)
  const handleConfirmWeightChange = async () => {
    if (!currentWorkoutExercise || !currentExerciseData) return;
    const diff = tempWeightInput - currentWorkoutExercise.weight;
    const sign = diff >= 0 ? `+${diff}` : `${diff}`;

    setCurrentWeight(tempWeightInput);
    setWeightModalOpen(false);

    // Save audit modification immediately
    await workoutRepository.saveModification({
      studentId: studentProfile!.id,
      studentName: studentProfile!.name,
      exerciseName: currentExerciseData.name,
      action: 'WEIGHT_CHANGED',
      before: currentWorkoutExercise.weight,
      after: tempWeightInput,
      difference: `${sign} kg`,
      reason: 'Ajuste de carga efetuado pelo aluno durante o treino',
    });

    await activityRepository.log({
      actorId: studentProfile!.userId,
      actorName: studentProfile!.name,
      actorRole: 'student',
      action: 'Carga alterada',
      description: `${studentProfile!.name} alterou a carga do ${currentExerciseData.name} de ${currentWorkoutExercise.weight} kg para ${tempWeightInput} kg (${sign} kg).`,
      studentId: studentProfile!.id,
      iconType: 'dumbbell',
    });

    success(`Carga alterada para ${tempWeightInput} kg (${sign} kg registrado para a Rafaela)`);
  };

  // Handle Skip Exercise (Section 23)
  const handleConfirmSkip = async () => {
    if (!currentWorkoutExercise || !currentExerciseData) return;

    const skipRecord: SkippedExercise = {
      exerciseId: currentWorkoutExercise.exerciseId,
      exerciseName: currentExerciseData.name,
      reason: skipReason,
      notes: skipNotes,
      timestamp: new Date().toISOString(),
    };

    setSkippedExercises((prev) => [...prev, skipRecord]);
    setSkipModalOpen(false);

    // Audit modification
    await workoutRepository.saveModification({
      studentId: studentProfile!.id,
      studentName: studentProfile!.name,
      exerciseName: currentExerciseData.name,
      action: 'EXERCISE_SKIPPED',
      before: `Prescrito: ${currentWorkoutExercise.sets}x${currentWorkoutExercise.reps}`,
      after: 'Pulado',
      reason: `${skipReason}${skipNotes ? ` - ${skipNotes}` : ''}`,
    });

    await activityRepository.log({
      actorId: studentProfile!.userId,
      actorName: studentProfile!.name,
      actorRole: 'student',
      action: 'Exercício pulado',
      description: `${studentProfile!.name} pulou o exercício ${currentExerciseData.name} (Motivo: ${skipReason}).`,
      studentId: studentProfile!.id,
      iconType: 'skip',
    });

    warning(`Exercício pulado (${skipReason}). Registrado para a Rafaela.`);

    // Advance to next exercise
    if (currentIndex < exercisesList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setFinishModalOpen(true);
    }
  };

  // Handle Substitute Exercise (Section 24)
  const handleConfirmSubstitution = async () => {
    if (!currentWorkoutExercise || !currentExerciseData || !selectedAlternativeId) return;

    const substitutedData = exercisesMap[selectedAlternativeId];
    if (!substitutedData) return;

    const subRecord: SubstitutedExercise = {
      originalExerciseId: currentWorkoutExercise.exerciseId,
      originalExerciseName: currentExerciseData.name,
      substitutedExerciseId: selectedAlternativeId,
      substitutedExerciseName: substitutedData.name,
      reason: subReason,
      timestamp: new Date().toISOString(),
    };

    setSubstitutedExercises((prev) => [...prev, subRecord]);

    // Replace in current workout exercise list
    const updatedExercisesList = [...exercisesList];
    updatedExercisesList[currentIndex] = {
      ...currentWorkoutExercise,
      exerciseId: selectedAlternativeId,
    };
    setExercisesList(updatedExercisesList);
    setSubModalOpen(false);

    // Audit modification
    await workoutRepository.saveModification({
      studentId: studentProfile!.id,
      studentName: studentProfile!.name,
      exerciseName: currentExerciseData.name,
      action: 'EXERCISE_SUBSTITUTED',
      before: currentExerciseData.name,
      after: substitutedData.name,
      reason: subReason,
    });

    await activityRepository.log({
      actorId: studentProfile!.userId,
      actorName: studentProfile!.name,
      actorRole: 'student',
      action: 'Exercício substituído',
      description: `${studentProfile!.name} substituiu ${currentExerciseData.name} por ${substitutedData.name} (Motivo: ${subReason}).`,
      studentId: studentProfile!.id,
      iconType: 'swap',
    });

    success(`Exercício substituído por ${substitutedData.name}!`);
  };

  // Handle Automatic Substitution on "Não gostei" (Item 3: max 2x)
  const handleAutoSubstitute = async () => {
    if (autoSwapsCount >= 2) {
      toastError('Limite atingido: você já realizou 2 trocas automáticas nesta sessão. Se precisar de ajustes adicionais, tire sua dúvida com a Rafaela.');
      return;
    }

    if (!currentWorkoutExercise || !currentExerciseData) return;

    const existingExerciseIds = new Set(exercisesList.map((e) => e.exerciseId));

    // 1. Try allowed alternatives first
    let chosenAlternative = allowedAlternatives.find(
      (alt) => alt.id !== currentWorkoutExercise.exerciseId && !existingExerciseIds.has(alt.id)
    );

    // 2. Fallback to same muscle group or category
    if (!chosenAlternative) {
      const allExList = Object.values(exercisesMap);
      chosenAlternative = allExList.find(
        (e) =>
          e.id !== currentWorkoutExercise.exerciseId &&
          !existingExerciseIds.has(e.id) &&
          (e.category === currentExerciseData.category ||
            e.muscleGroups.some((m) => currentExerciseData.muscleGroups?.includes(m)))
      );
    }

    if (!chosenAlternative) {
      toastError('Nenhum exercício substituto equivalente disponível no momento.');
      return;
    }

    const oldName = currentExerciseData.name;
    const newName = chosenAlternative.name;
    const nextSwapCount = autoSwapsCount + 1;
    setAutoSwapsCount(nextSwapCount);

    const updatedList = [...exercisesList];
    updatedList[currentIndex] = {
      ...currentWorkoutExercise,
      exerciseId: chosenAlternative.id,
    };
    setExercisesList(updatedList);

    await workoutRepository.saveModification({
      studentId: studentProfile!.id,
      studentName: studentProfile!.name,
      exerciseName: oldName,
      action: 'EXERCISE_SUBSTITUTED',
      before: oldName,
      after: newName,
      reason: `Não gostei do exercício (troca automática pelo app - ${nextSwapCount}/2)`,
    });

    await activityRepository.log({
      actorId: studentProfile!.userId,
      actorName: studentProfile!.name,
      actorRole: 'student',
      action: 'Exercício substituído',
      description: `${studentProfile!.name} trocou automaticamente ${oldName} por ${newName} (motivo: não gostou).`,
      studentId: studentProfile!.id,
      iconType: 'swap',
    });

    const remaining = 2 - nextSwapCount;
    success(
      `Exercício trocado automaticamente por ${newName}! ${
        remaining > 0 ? `(${remaining} troca automática restante)` : '(Limite de trocas automáticas atingido)'
      }`
    );
  };

  // Handle Finish Workout (Section 26)
  const handleFinishWorkout = async () => {
    setIsFinishing(true);

    const totalVolume = completedSets.reduce((acc, s) => acc + s.actualWeight * s.actualReps, 0);
    // Real duration in minutes from the live chronometer
    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

    const session: WorkoutSession = {
      id: `session-${Date.now()}`,
      studentId: studentProfile!.id,
      workoutPlanId: `plan-${studentProfile!.id}`,
      workoutDayId: workoutDay?.id || 'day-1',
      workoutDayName: workoutDay?.name || 'Treino do Dia',
      date: new Date().toISOString().split('T')[0],
      status: skippedExercises.length > 0 ? 'incomplete' : 'completed',
      startTime,
      endTime: new Date().toISOString(),
      durationMinutes,
      rating: perceivedRating,
      rpe,
      energyLevel,
      notes: sessionNotes,
      setsCompleted: completedSets,
      skippedExercises,
      substitutedExercises,
      totalVolumeKg: totalVolume,
      totalSets: completedSets.length,
      totalExercises: exercisesList.length,
    };

    await workoutRepository.saveSession(session);

    // Log completion in activity
    await activityRepository.log({
      actorId: studentProfile!.userId,
      actorName: studentProfile!.name,
      actorRole: 'student',
      action: 'Treino finalizado',
      description: `${studentProfile!.name} concluiu o ${workoutDay?.name} (${completedSets.length} séries, ${totalVolume} kg levantados).`,
      studentId: studentProfile!.id,
      iconType: 'check',
    });

    // Celebration fireworks
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // fail safe
    }

    setIsFinishing(false);
    setFinishModalOpen(false);
    success('Parabéns! Treino finalizado e salvo com sucesso!');
    navigate('/student/dashboard');
  };

  if (loading || !workoutDay || !currentWorkoutExercise || !currentExerciseData) {
    return (
      <div className="py-12 flex justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Authorized alternatives for this exercise (Section 15 & 24)
  const allowedAlternatives = currentWorkoutExercise.alternatives
    .map((altId) => exercisesMap[altId])
    .filter(Boolean);

  const totalExercisesCount = exercisesList.length;

  return (
    <div className="space-y-5 max-w-6xl xl:max-w-7xl mx-auto w-full">
      {/* Top Bar: Progress & Exercise Step (Section 20) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-dark-card p-3 rounded-2xl border border-slate-200/80 dark:border-dark-border shadow-xs">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/student/dashboard')}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
            className="text-xs font-bold cursor-pointer"
          >
            Sair
          </Button>

          <span className="text-xs font-black px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-500 uppercase tracking-wider">
            {currentIndex + 1} de {totalExercisesCount}
          </span>
          <span className="hidden sm:inline text-xs font-bold text-slate-500 dark:text-dark-muted">
            • {workoutDay.name}
          </span>
        </div>

        {/* Live Workout Chronometer (Item 1) */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-dark-cardElevated border border-slate-200/80 dark:border-white/[0.08] font-mono shadow-2xs">
          <button
            type="button"
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={isTimerRunning ? 'Pausar cronômetro' : 'Retomar treino'}
          >
            {isTimerRunning ? (
              <Pause className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            ) : (
              <Play className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
            )}
          </button>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {formatChronometer(elapsedSeconds)}
            </span>
            <span className="text-[10px] text-slate-400 font-sans hidden md:inline">
              (Alvo: {workoutDay.estimatedMinutes || 45}m)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setChatModalOpen(true)}
            leftIcon={<MessageSquare className="w-3.5 h-3.5 text-amber-500" />}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer"
            title="Tirar dúvida sobre este treino com a Rafaela"
          >
            Dúvida
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFinishModalOpen(true)}
            className="text-xs font-bold cursor-pointer"
          >
            Finalizar Treino
          </Button>
        </div>
      </div>

      {/* Main Responsive Grid: 2 columns on desktop (Media on left, controls on right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Player, Video, Details and Flexibility Options */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-5 overflow-hidden space-y-4 shadow-lg border-emerald-500/30">
            {/* Exercise Mini Video Player & Cartoon Animation */}
            <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner">
              <ExerciseFramePlayer
                compact
                frames={currentExerciseData.videoFrames}
                fallbackImage={currentExerciseData.imageUrl}
                title={currentExerciseData.name}
                className="h-56 sm:h-72 w-full"
              />
              <div className="p-3.5 bg-slate-950/80 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="brand" size="sm">
                      {currentExerciseData.category}
                    </Badge>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-slate-300 capitalize">
                      {currentExerciseData.equipment}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white leading-tight uppercase tracking-tight">
                    {currentExerciseData.name}
                  </h2>
                </div>
                {currentExerciseData.instructions && (
                  <p className="text-xs text-slate-400 max-w-xs sm:text-right italic">
                    &ldquo;{currentExerciseData.instructions}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Avaliação do Exercício e Troca Automática (Item 3: máx 2x) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-dark-cardElevated border border-slate-200/80 dark:border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Gostou deste exercício?
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  (máx. 2 trocas automáticas)
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setExercisePreferences((prev) => ({ ...prev, [currentWorkoutExercise.exerciseId]: 'liked' }));
                    success('Gosto registrado! Esse feedback ajuda a Rafaela a aprimorar seus treinos.');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    exercisePreferences[currentWorkoutExercise.exerciseId] === 'liked'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-dark-card border border-slate-200 dark:border-white/[0.1] text-slate-700 dark:text-slate-300 hover:border-emerald-500'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Gostei</span>
                </button>
                <button
                  type="button"
                  onClick={handleAutoSubstitute}
                  disabled={autoSwapsCount >= 2}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    autoSwapsCount >= 2
                      ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-dark-card border border-slate-200 text-slate-400'
                      : 'bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100'
                  }`}
                  title={autoSwapsCount >= 2 ? 'Limite de 2 trocas atingido' : 'Substituir exercício automaticamente'}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>Não gostei</span>
                  <span className="text-[10px] font-mono px-1 rounded bg-rose-200/60 dark:bg-rose-500/20">
                    {2 - autoSwapsCount} rest.
                  </span>
                </button>
              </div>
            </div>

            {/* Flexibility Actions Buttons (Section 17, 21, 23, 24) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {currentWorkoutExercise.allowWeightChange && (
                <button
                  type="button"
                  onClick={() => {
                    setTempWeightInput(currentWeight);
                    setWeightModalOpen(true);
                  }}
                  className="p-3 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-cardElevated hover:border-emerald-500 text-slate-800 dark:text-slate-200 text-xs font-bold flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Dumbbell className="w-4 h-4 text-emerald-500" />
                  <span>Alterar Carga</span>
                </button>
              )}

              {currentWorkoutExercise.allowSubstitution && (
                <button
                  type="button"
                  onClick={() => {
                    if (allowedAlternatives.length === 0) {
                      toastError('Nenhuma alternativa autorizada cadastrada para este exercício.');
                      return;
                    }
                    setSelectedAlternativeId(allowedAlternatives[0].id);
                    setSubModalOpen(true);
                  }}
                  className="p-3 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-cardElevated hover:border-slate-400 dark:hover:border-white/[0.2] text-slate-800 dark:text-slate-200 text-xs font-bold flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowRightLeft className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Substituir</span>
                </button>
              )}

              {currentWorkoutExercise.allowSkip && (
                <button
                  type="button"
                  onClick={() => setSkipModalOpen(true)}
                  className="p-3 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-cardElevated hover:border-rose-500 text-slate-800 dark:text-slate-200 text-xs font-bold flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>Pular</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setChatModalOpen(true)}
                className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:border-amber-500 text-amber-700 dark:text-amber-300 text-xs font-bold flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
                title="Tirar dúvida técnica com a Rafaela sobre este exercício"
              >
                <HelpCircle className="w-4 h-4 text-amber-500" />
                <span>Tirar Dúvida</span>
              </button>
            </div>
          </Card>
        </div>

        {/* Right Column: Prescrição, Registro de Carga/Reps e Navegação */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-5 overflow-hidden space-y-4 shadow-lg border-emerald-500/20">
            {/* Prescrição da Rafaela (Section 2: Prescrição em Destaque) */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                  Prescrito pela Rafaela
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {currentWorkoutExercise.sets} séries × {currentWorkoutExercise.reps} reps
                  </span>
                  <span className="text-sm font-mono font-bold text-emerald-500">
                    {currentWorkoutExercise.weight} kg
                  </span>
                </div>
                {currentWorkoutExercise.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-0.5">
                    &ldquo;{currentWorkoutExercise.notes}&rdquo;
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 block font-bold">DESCANSO</span>
                <span className="text-base font-black text-slate-700 dark:text-slate-200 font-mono">
                  {currentWorkoutExercise.restSeconds}s
                </span>
              </div>
            </div>

            {/* Interactive Set Logger (Section 20: Números Grandes, Registro Rápido) */}
            {!isCurrentExerciseSkipped ? (
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-dark-border/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Série {currentExerciseSets.length + 1} de {currentWorkoutExercise.sets}
                  </span>
                  <button
                    onClick={() => setIsTimerOpen(true)}
                    className="flex items-center gap-1 text-xs text-emerald-500 font-bold cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Cronômetro
                  </button>
                </div>

                {/* Big inputs for Weight and Reps */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-dark-cardElevated text-center space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Carga (kg)
                    </span>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setCurrentWeight((prev) => Math.max(0, prev - 2))}
                        className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-bold text-lg cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                        {currentWeight}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentWeight((prev) => prev + 2)}
                        className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-bold text-lg cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-dark-cardElevated text-center space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Repetições
                    </span>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setCurrentReps((prev) => Math.max(1, prev - 1))}
                        className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-bold text-lg cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                        {currentReps}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentReps((prev) => prev + 1)}
                        className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-bold text-lg cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Big Action Button (Section 20) */}
                <Button
                  variant="primary"
                  size="xl"
                  fullWidth
                  onClick={handleLogSet}
                  leftIcon={<Check className="w-6 h-6 stroke-[3]" />}
                  className="text-base font-black py-4 shadow-xs cursor-pointer"
                >
                  Registrar Série {currentExerciseSets.length + 1}
                </Button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-center space-y-1">
                <span className="text-xs font-bold text-rose-500 uppercase">
                  Exercício Pulado
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Você optou por pular este exercício.
                </p>
              </div>
            )}

            {/* Recorded Sets List (Section 20: Série 1, Série 2, etc.) */}
            {currentExerciseSets.length > 0 && (
              <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-dark-border/60">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Séries Registradas nesta sessão:
                </span>
                <div className="space-y-1 font-mono text-xs">
                  {currentExerciseSets.map((s) => (
                    <div
                      key={s.setIndex}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-dark-cardElevated/50"
                    >
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Série {s.setIndex}
                      </span>
                      <span className="text-emerald-500 font-bold">
                        {s.actualWeight} kg × {s.actualReps} reps
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(s.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Navigation between exercises */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
              className="flex-1 cursor-pointer"
            >
              Anterior
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={() => setCurrentIndex((prev) => Math.min(exercisesList.length - 1, prev + 1))}
              disabled={currentIndex === exercisesList.length - 1}
              rightIcon={<ChevronRight className="w-4 h-4" />}
              className="flex-1 cursor-pointer"
            >
              Próximo
            </Button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Alterar Carga (Section 21) */}
      <Modal
        isOpen={weightModalOpen}
        onClose={() => setWeightModalOpen(false)}
        title="Alterar Carga do Exercício"
        description="Ajuste o peso caso esteja fácil ou pesado. A Rafaela será notificada dessa alteração."
        size="sm"
      >
        <div className="space-y-4 text-center">
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-dark-cardElevated text-xs font-mono">
            <span className="text-slate-500">Prescrito original:</span>{' '}
            <strong>{currentWorkoutExercise.weight} kg</strong>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setTempWeightInput((w) => Math.max(0, w - 2))}
              className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-dark-cardElevated font-bold text-2xl"
            >
              -
            </button>
            <div className="w-28 text-4xl font-black font-mono text-emerald-500">
              {tempWeightInput} kg
            </div>
            <button
              onClick={() => setTempWeightInput((w) => w + 2)}
              className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-dark-cardElevated font-bold text-2xl"
            >
              +
            </button>
          </div>

          <div className="text-xs font-bold text-emerald-500 font-mono">
            Variação:{' '}
            {tempWeightInput - currentWorkoutExercise.weight >= 0 ? '+' : ''}
            {tempWeightInput - currentWorkoutExercise.weight} kg
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setWeightModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleConfirmWeightChange}
            >
              Confirmar Alteração
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: Pular Exercício (Section 23) */}
      <Modal
        isOpen={skipModalOpen}
        onClose={() => setSkipModalOpen(false)}
        title="Por que você deseja pular?"
        description="Selecione o motivo para que a Rafaela possa entender o que aconteceu"
        size="sm"
      >
        <div className="space-y-3">
          {(
            [
              'Sem equipamento',
              'Dor/desconforto',
              'Falta de tempo',
              'Não quero realizar',
              'Outro',
            ] as const
          ).map((reason) => (
            <button
              key={reason}
              type="button"
              onClick={() => setSkipReason(reason)}
              className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                skipReason === reason
                  ? 'border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-400'
                  : 'border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300'
              }`}
            >
              {reason}
            </button>
          ))}

          <textarea
            rows={2}
            placeholder="Observação adicional (opcional)..."
            value={skipNotes}
            onChange={(e) => setSkipNotes(e.target.value)}
            className="w-full bg-slate-50 dark:bg-dark-cardElevated/80 border border-slate-200 dark:border-dark-border rounded-xl p-2.5 text-xs focus:outline-none focus:border-rose-500"
          />

          <div className="flex gap-2 pt-2">
            <Button variant="ghost" fullWidth onClick={() => setSkipModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" fullWidth onClick={handleConfirmSkip}>
              Confirmar e Pular
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: Substituir Exercício (Section 24) */}
      <Modal
        isOpen={subModalOpen}
        onClose={() => setSubModalOpen(false)}
        title="Substituir Exercício"
        description="Selecione uma das alternativas pré-autorizadas pela Rafaela"
        size="sm"
      >
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Alternativas Autorizadas:
          </label>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {allowedAlternatives.map((alt) => (
              <button
                key={alt.id}
                type="button"
                onClick={() => setSelectedAlternativeId(alt.id)}
                className={`w-full p-3 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition-all ${
                  selectedAlternativeId === alt.id
                    ? 'border-emerald-600/70 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <p>{alt.name}</p>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {alt.equipment} • {alt.type}
                  </span>
                </div>
                {selectedAlternativeId === alt.id && (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                )}
              </button>
            ))}
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Motivo da Substituição:
            </label>
            <input
              value={subReason}
              onChange={(e) => setSubReason(e.target.value)}
              placeholder="Ex: Equipamento ocupado, dor..."
              className="w-full bg-slate-50 dark:bg-dark-cardElevated/80 border border-slate-200 dark:border-dark-border rounded-xl p-2.5 text-xs"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="ghost" fullWidth onClick={() => setSubModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" fullWidth onClick={handleConfirmSubstitution}>
              Confirmar Substituição
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 4: Finalizar Treino (Section 26) */}
      <Modal
        isOpen={finishModalOpen}
        onClose={() => setFinishModalOpen(false)}
        title="Finalização do Treino"
        description="Parabéns pelo esforço! Avalie sua percepção do treino de hoje"
        size="md"
      >
        <div className="space-y-4">
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center p-3 rounded-2xl bg-slate-100 dark:bg-dark-cardElevated font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">DURAÇÃO</span>
              <strong className="text-slate-900 dark:text-white text-base">
                {Math.max(1, Math.round(elapsedSeconds / 60))} min
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">SÉRIES</span>
              <strong className="text-slate-900 dark:text-white text-base">
                {completedSets.length}
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">VOLUME</span>
              <strong className="text-emerald-500 text-base">
                {completedSets.reduce((acc, s) => acc + s.actualWeight * s.actualReps, 0)} kg
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">PULADOS</span>
              <strong className={skippedExercises.length > 0 ? 'text-rose-500 text-base' : 'text-slate-500 text-base'}>
                {skippedExercises.length}
              </strong>
            </div>
          </div>

          {/* Comparativo de Duração com o Alvo Prescrito (Item 1) */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-dark-card border border-slate-200/60 dark:border-white/[0.06] text-xs flex items-center justify-between">
            <span className="text-slate-500 dark:text-dark-muted">
              Alvo Prescrito: <strong>{workoutDay.estimatedMinutes || 45} min</strong>
            </span>
            {Math.round(elapsedSeconds / 60) <= (workoutDay.estimatedMinutes || 45) + 10 &&
            Math.round(elapsedSeconds / 60) >= (workoutDay.estimatedMinutes || 45) - 10 ? (
              <Badge variant="brand" size="sm">Dentro do tempo ideal</Badge>
            ) : Math.round(elapsedSeconds / 60) < (workoutDay.estimatedMinutes || 45) - 10 ? (
              <Badge variant="warning" size="sm">Treino acelerado</Badge>
            ) : (
              <Badge variant="neutral" size="sm">Acima do previsto</Badge>
            )}
          </div>

          {/* Question: Como foi o treino? (1 a 5) */}
          <div className="space-y-2 text-center">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Como foi o treino de hoje?
            </span>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setPerceivedRating(val)}
                  className={`w-10 h-10 rounded-2xl font-bold text-sm transition-all ${
                    perceivedRating === val
                      ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-2xs scale-105'
                      : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {val === 1 ? '😫' : val === 2 ? '😣' : val === 3 ? '😐' : val === 4 ? '💪' : '🚀'}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-400 font-medium block">
              {perceivedRating === 1 && '1 — Muito Difícil / Exaustivo'}
              {perceivedRating === 2 && '2 — Difícil'}
              {perceivedRating === 3 && '3 — Moderado'}
              {perceivedRating === 4 && '4 — Bom / Confortável'}
              {perceivedRating === 5 && '5 — Muito Fácil'}
            </span>
          </div>

          {/* RPE & Energia */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Esforço (RPE 1-10): {rpe}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={rpe}
                onChange={(e) => setRpe(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Energia (1-5): {energyLevel}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          {/* Observação */}
          <textarea
            rows={2}
            placeholder="Algum comentário para a Rafaela? (ex: senti leve cansaço no ombro...)"
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            className="w-full bg-slate-50 dark:bg-dark-cardElevated/80 border border-slate-200 dark:border-dark-border rounded-xl p-2.5 text-xs"
          />

          <div className="flex gap-2 pt-2">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setFinishModalOpen(false)}
            >
              Voltar ao Treino
            </Button>
            <Button
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isFinishing}
              onClick={handleFinishWorkout}
            >
              Concluir e Salvar
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 5: Bate-Papo & Dúvidas Técnicas com a Treinadora */}
      <Modal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        title="Tirar Dúvida com a Rafaela"
        description={`Tire dúvidas técnicas sobre ${currentExerciseData?.name || 'este exercício'} ou sobre o treino atual`}
        size="lg"
      >
        <div className="py-1">
          {studentProfile && (
            <StudentTrainerChatSection
              student={studentProfile}
              currentUserId={studentProfile.userId || studentProfile.id}
              currentUserRole="student"
            />
          )}
        </div>
      </Modal>

      {/* Floating Rest Timer (Section 45) */}
      <RestTimer
        isOpen={isTimerOpen}
        initialSeconds={timerSeconds}
        onClose={() => setIsTimerOpen(false)}
        onComplete={() => {
          setIsTimerOpen(false);
          success('Tempo de descanso concluído! Pronto para a próxima série!');
        }}
      />
    </div>
  );
};
