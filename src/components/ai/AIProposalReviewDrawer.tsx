import React, { useState } from 'react';
import { AIWorkoutProposal, AIWorkoutDayProposal, AIExerciseProposal, WorkoutPlan } from '../../types';
import { AIWorkoutService } from '../../services/ai/AIWorkoutService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Edit2,
  Trash2,
  Clock,
  Dumbbell,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface AIProposalReviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: AIWorkoutProposal;
  currentPlan?: WorkoutPlan | null;
  onApproved: (updatedPlan: WorkoutPlan) => void;
  onRegenerateRequest?: (instructions: string) => void;
}

export const AIProposalReviewDrawer: React.FC<AIProposalReviewDrawerProps> = ({
  isOpen,
  onClose,
  proposal: initialProposal,
  currentPlan,
  onApproved,
  onRegenerateRequest,
}) => {
  const { success, error: toastError } = useToast();
  const [proposal, setProposal] = useState<AIWorkoutProposal>(initialProposal);
  const [editingExercise, setEditingExercise] = useState<{
    dayIndex: number;
    exerciseIndex: number;
    exercise: AIExerciseProposal;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [decisionNotes, setDecisionNotes] = useState('');

  // Sincroniza se a prop mudar
  React.useEffect(() => {
    setProposal(initialProposal);
  }, [initialProposal]);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const result = await AIWorkoutService.approveProposal(proposal.id, decisionNotes);
      success(`Treino "${result.plan.name}" aprovado e aplicado com sucesso ao aluno!`);
      onApproved(result.plan);
      onClose();
    } catch (err: any) {
      toastError(err.message || 'Erro ao aprovar proposta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await AIWorkoutService.rejectProposal(proposal.id, decisionNotes || 'Rejeitado pela Personal');
      success('Proposta da IA descartada.');
      onClose();
    } catch (err: any) {
      toastError(err.message || 'Erro ao descartar proposta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExercise = (dayIdx: number, exIdx: number) => {
    const updatedDays = [...proposal.days];
    updatedDays[dayIdx].exercises.splice(exIdx, 1);
    setProposal({ ...proposal, days: updatedDays });
  };

  const handleSaveExerciseEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExercise) return;
    const { dayIndex, exerciseIndex, exercise } = editingExercise;
    const updatedDays = [...proposal.days];
    updatedDays[dayIndex].exercises[exerciseIndex] = exercise;
    setProposal({ ...proposal, days: updatedDays });
    setEditingExercise(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Revisão de Treino Sugerido por IA: ${proposal.workoutName}`}
      description="Compare com a rotina atual, edite exercícios se desejar e decida a aplicação."
      size="xl"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* Warning Banner Obrigatório (Seção 2) */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200">
            <strong className="block font-bold mb-0.5 text-sm">
              Sugestão gerada por IA — revise antes de aplicar.
            </strong>
            A Inteligência Artificial atua como assistente técnica. A responsabilidade da prescrição e adaptação fisiológica é exclusiva da Personal Trainer Rafaela.
          </div>
        </div>

        {/* Metadados da Proposta */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-dark-card border border-slate-200/60 dark:border-dark-border text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Modelo: <strong className="text-emerald-500 font-mono">{proposal.model}</strong>
            </span>
            <span>•</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Meta: <strong className="text-slate-900 dark:text-white">{proposal.goal}</strong>
            </span>
            <span>•</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Duração est.: <strong>{proposal.estimatedDurationMinutes} min</strong>
            </span>
          </div>
          <Badge variant="warning" size="sm">
            Status: Aguardando Revisão
          </Badge>
        </div>

        {/* Comparação: Treino Atual vs. Proposta da IA */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Estrutura da Proposta ({proposal.days.length} dias de treino)
          </h3>

          <div className="space-y-4">
            {proposal.days.map((day, dayIdx) => (
              <Card key={dayIdx} className="p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-dark-border/60">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {day.dayOfWeek}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {day.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Foco: {day.muscleFocus} • Duração: {day.estimatedDurationMinutes} min
                    </p>
                  </div>
                  <Badge variant="neutral" size="sm" className="font-mono text-[10px]">
                    {day.exercises.length} exercícios
                  </Badge>
                </div>

                {/* Lista de Exercícios com edição rápida */}
                <div className="space-y-2">
                  {day.exercises.map((ex, exIdx) => (
                    <div
                      key={exIdx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-dark-cardElevated/50 border border-slate-200/50 dark:border-dark-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-dark-border flex items-center justify-center font-bold text-[10px]">
                            {ex.order || exIdx + 1}
                          </span>
                          <strong className="text-slate-900 dark:text-white text-sm">
                            {ex.exerciseName || ex.exerciseId}
                          </strong>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-slate-500 dark:text-dark-muted font-mono pt-1">
                          <span>{ex.sets} séries</span>
                          <span>•</span>
                          <span>{ex.reps} reps</span>
                          {ex.weightKg && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-500 font-bold">{ex.weightKg} kg</span>
                            </>
                          )}
                          <span>•</span>
                          <span>Descanso: {ex.restSeconds}s</span>
                        </div>
                        {ex.reason && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 italic pt-1">
                            Motivo IA: &ldquo;{ex.reason}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          onClick={() => setEditingExercise({ dayIndex: dayIdx, exerciseIndex: exIdx, exercise: { ...ex } })}
                          title="Editar séries e repetições"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-rose-400 hover:text-rose-600"
                          onClick={() => handleDeleteExercise(dayIdx, exIdx)}
                          title="Remover exercício da proposta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Avisos e Notas da IA */}
        {(proposal.warnings?.length > 0 || proposal.notesForTrainer?.length > 0) && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-card border border-slate-200/60 dark:border-dark-border text-xs space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-500" />
              Observações Técnicas da IA para a Personal
            </h4>
            {proposal.warnings?.map((w, idx) => (
              <p key={idx} className="text-amber-600 dark:text-amber-400">
                ⚠ {w}
              </p>
            ))}
            {proposal.notesForTrainer?.map((n, idx) => (
              <p key={idx} className="text-slate-600 dark:text-slate-300">
                ℹ {n}
              </p>
            ))}
          </div>
        )}

        {/* Campo opcional de anotações da Personal para auditoria */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Anotações de Revisão da Personal (opcional para o histórico)
          </label>
          <input
            type="text"
            value={decisionNotes}
            onChange={(e) => setDecisionNotes(e.target.value)}
            placeholder="Ex: Treino aprovado com pequenos ajustes de volume para recuperação lombar."
            className="w-full text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-2.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
          />
        </div>

        {/* Ações de Decisão Humana */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200/60 dark:border-dark-border/60">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="danger"
              size="sm"
              onClick={handleReject}
              disabled={isSubmitting}
              leftIcon={<XCircle className="w-4 h-4" />}
            >
              Rejeitar Proposta
            </Button>
            {onRegenerateRequest && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onRegenerateRequest(decisionNotes)}
                disabled={isSubmitting}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Regenerar
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              Fechar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApprove}
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Aprovar e Aplicar Treino
            </Button>
          </div>
        </div>
      </div>

      {/* Sub-modal: Edição Rápida de Exercício */}
      {editingExercise && (
        <Modal
          isOpen={true}
          onClose={() => setEditingExercise(null)}
          title={`Ajustar Exercício: ${editingExercise.exercise.exerciseName || 'Exercício'}`}
          size="sm"
        >
          <form onSubmit={handleSaveExerciseEdit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold block mb-1">Séries</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editingExercise.exercise.sets}
                  onChange={(e) =>
                    setEditingExercise({
                      ...editingExercise,
                      exercise: { ...editingExercise.exercise, sets: parseInt(e.target.value, 10) || 3 },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-2 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Repetições</label>
                <input
                  type="text"
                  value={editingExercise.exercise.reps}
                  onChange={(e) =>
                    setEditingExercise({
                      ...editingExercise,
                      exercise: { ...editingExercise.exercise, reps: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-2 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Carga Sugerida (kg)</label>
                <input
                  type="number"
                  min="0"
                  value={editingExercise.exercise.weightKg || ''}
                  onChange={(e) =>
                    setEditingExercise({
                      ...editingExercise,
                      exercise: {
                        ...editingExercise.exercise,
                        weightKg: e.target.value ? parseFloat(e.target.value) : undefined,
                      },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-2 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Descanso (segundos)</label>
                <input
                  type="number"
                  min="15"
                  max="300"
                  step="15"
                  value={editingExercise.exercise.restSeconds}
                  onChange={(e) =>
                    setEditingExercise({
                      ...editingExercise,
                      exercise: {
                        ...editingExercise.exercise,
                        restSeconds: parseInt(e.target.value, 10) || 60,
                      },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-2 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditingExercise(null)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Salvar Alteração
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </Modal>
  );
};
