import React, { useState } from 'react';
import { Exercise, AIExerciseAlternativeSuggestion } from '../../types';
import { AIWorkoutService } from '../../services/ai/AIWorkoutService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Sparkles, ArrowRight, RefreshCw, CheckCircle2, Dumbbell } from 'lucide-react';

interface AIExerciseAlternativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentExercise: {
    id: string;
    name: string;
    category?: string;
  };
  onApplyAlternative: (newExerciseId: string, newExerciseName: string) => void;
}

export const AIExerciseAlternativeModal: React.FC<AIExerciseAlternativeModalProps> = ({
  isOpen,
  onClose,
  currentExercise,
  onApplyAlternative,
}) => {
  const { success, error: toastError } = useToast();
  const [suggestion, setSuggestion] = useState<AIExerciseAlternativeSuggestion | null>(null);
  const [preferFreeWeight, setPreferFreeWeight] = useState(false);
  const [preferMachine, setPreferMachine] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFetchAlternative = async () => {
    setLoading(true);
    try {
      const res = await AIWorkoutService.suggestExerciseAlternative(currentExercise.id, {
        preferFreeWeight,
        preferMachine,
      });
      setSuggestion(res);
    } catch (err: any) {
      toastError(err.message || 'Erro ao buscar alternativa de exercício.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      setSuggestion(null);
      handleFetchAlternative();
    }
  }, [isOpen, currentExercise.id, preferFreeWeight, preferMachine]);

  const handleApply = () => {
    if (!suggestion) return;
    onApplyAlternative(suggestion.suggestedExerciseId, suggestion.suggestedExerciseName);
    success(`Exercício substituído por "${suggestion.suggestedExerciseName}"!`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="IA: Sugerir Alternativa de Exercício"
      description="Encontre exercícios equivalentes na biblioteca mantendo o padrão de movimento."
      size="md"
    >
      <div className="space-y-4 text-xs">
        {/* Exercício Atual */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-dark-card border border-slate-200/60 dark:border-dark-border flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Exercício Selecionado
            </span>
            <strong className="text-sm text-slate-900 dark:text-white">
              {currentExercise.name}
            </strong>
          </div>
          <Badge variant="neutral" size="sm">
            {currentExercise.category || 'Ativo'}
          </Badge>
        </div>

        {/* Filtros Rápidos (Máquina <-> Livre) */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={preferFreeWeight ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
              setPreferFreeWeight(!preferFreeWeight);
              if (!preferFreeWeight) setPreferMachine(false);
            }}
            className="text-xs"
          >
            Priorizar Peso Livre
          </Button>
          <Button
            type="button"
            variant={preferMachine ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
              setPreferMachine(!preferMachine);
              if (!preferMachine) setPreferFreeWeight(false);
            }}
            className="text-xs"
          >
            Priorizar Máquina Guiada
          </Button>
        </div>

        {/* Resultado da Sugestão da IA */}
        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
            <span>Consultando biblioteca e biomecânica com IA...</span>
          </div>
        ) : suggestion ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Alternativa Sugerida
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {suggestion.suggestedExerciseName}
                </h4>
              </div>
              <Badge variant="success" size="sm" className="capitalize">
                {suggestion.equipmentType}
              </Badge>
            </div>

            <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
              <p>
                <strong>Justificativa:</strong> {suggestion.reason}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-dark-muted font-mono">
                <strong>Equivalência:</strong> {suggestion.biomechanicalMatch}
              </p>
            </div>

            <div className="pt-2 border-t border-emerald-500/20 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={handleFetchAlternative} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                Outra Opção
              </Button>
              <Button variant="primary" size="sm" onClick={handleApply} leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                Substituir no Treino
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400">
            Nenhuma alternativa encontrada para os critérios selecionados.
          </div>
        )}
      </div>
    </Modal>
  );
};
