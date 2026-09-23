import React, { useState } from 'react';
import { Student, WorkoutPlan, AIContextSelection, AIWorkoutProposal } from '../../types';
import { AIWorkoutService } from '../../services/ai/AIWorkoutService';
import { TRAINER_INSTRUCTION_PRESETS } from '../../services/ai/AIPromptService';
import { AIProposalReviewDrawer } from './AIProposalReviewDrawer';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import {
  Sparkles,
  Dumbbell,
  Search,
  TrendingUp,
  RefreshCw,
  Clock,
  Shield,
  CheckSquare,
  Square,
  AlertTriangle,
  FileText,
  Sliders,
  Eye,
  ArrowRight,
} from 'lucide-react';

interface AICopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  currentPlan?: WorkoutPlan | null;
  onPlanApplied: (plan: WorkoutPlan) => void;
}

type CopilotTab = 'generate' | 'review' | 'progress' | 'anamnesis';

export const AICopilotModal: React.FC<AICopilotModalProps> = ({
  isOpen,
  onClose,
  student,
  currentPlan,
  onPlanApplied,
}) => {
  const { success, error: toastError, info } = useToast();

  const [activeTab, setActiveTab] = useState<CopilotTab>('generate');

  // Geração de Treino state
  const [selectedGoal, setSelectedGoal] = useState<string>(
    student.goals && student.goals.length > 0 ? student.goals[0] : 'Hipertrofia'
  );
  const [selectedDays, setSelectedDays] = useState<string[]>(
    student.availableDays && student.availableDays.length > 0 ? student.availableDays : ['Segunda', 'Quarta', 'Sexta']
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('hipertrofia');
  const [trainerInstructions, setTrainerInstructions] = useState<string>(
    TRAINER_INSTRUCTION_PRESETS[0].instructions
  );

  // Seleção de contexto minimizado (Seção 38)
  const [contextSelection, setContextSelection] = useState<AIContextSelection>({
    includeStudentProfile: true,
    includeGoals: true,
    includeFrequency: true,
    includeHistory: true,
    includeAnamnesis: true,
    includeNutrition: true,
    includeFeedback: true,
    includeTrainerInstructions: true,
  });

  const [isPreviewContextOpen, setIsPreviewContextOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Proposta gerada para revisão
  const [reviewedProposal, setReviewedProposal] = useState<AIWorkoutProposal | null>(null);

  // Análise / Revisão state
  const [reviewResult, setReviewResult] = useState<any>(null);
  const [progressResult, setProgressResult] = useState<any>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const found = TRAINER_INSTRUCTION_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setTrainerInstructions(found.instructions);
    }
  };

  const handleToggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleGenerateProposal = async () => {
    if (selectedDays.length === 0) {
      toastError('Selecione ao menos um dia da semana para o treino.');
      return;
    }

    setIsGenerating(true);
    try {
      const proposal = await AIWorkoutService.generateWorkoutProposal({
        studentId: student.id,
        goal: selectedGoal,
        trainingDays: selectedDays,
        targetDurationMinutes: durationMinutes,
        trainerInstructions,
        selection: contextSelection,
      });

      success('Proposta de treino gerada com sucesso pela IA!');
      setReviewedProposal(proposal);
    } catch (err: any) {
      toastError(err.message || 'Erro ao gerar proposta de treino com IA.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRunReview = async () => {
    if (!currentPlan) {
      info('O aluno não possui um treino ativo cadastrado para revisão.');
      return;
    }
    setIsLoadingAnalysis(true);
    try {
      const res = await AIWorkoutService.reviewWorkout(student.id, currentPlan);
      setReviewResult(res);
      success('Revisão do treino atual concluída pela IA!');
    } catch (err: any) {
      toastError(err.message || 'Erro ao revisar treino.');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleRunProgressAnalysis = async () => {
    setIsLoadingAnalysis(true);
    try {
      const res = await AIWorkoutService.analyzeProgress(student.id);
      setProgressResult(res);
      success('Análise de evolução e adesão concluída!');
    } catch (err: any) {
      toastError(err.message || 'Erro ao analisar evolução.');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="AI Copilot — Assistente de Treinamento"
        description={`Auxílio inteligente para o planejamento de ${student.name} (Rafaela Training App)`}
        size="lg"
      >
        <div className="space-y-5">
          {/* Navegação entre modos do AI Copilot */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-dark-cardElevated rounded-xl border border-slate-200/60 dark:border-dark-border text-xs overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('generate')}
              className={`flex items-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === 'generate'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" />
              Montar Treino com IA
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('review');
                if (!reviewResult) handleRunReview();
              }}
              className={`flex items-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === 'review'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Revisar Treino Atual
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('progress');
                if (!progressResult) handleRunProgressAnalysis();
              }}
              className={`flex items-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === 'progress'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Análise de Adesão & Cargas
            </button>
          </div>

          {/* TAB 1: MONTAR TREINO COM IA */}
          {activeTab === 'generate' && (
            <div className="space-y-4 text-xs">
              {/* Objetivo e Dias */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Objetivo Principal do Ciclo
                  </label>
                  <select
                    value={selectedGoal}
                    onChange={(e) => setSelectedGoal(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-2.5 text-slate-800 dark:text-slate-200"
                  >
                    <option value="Hipertrofia">Hipertrofia</option>
                    <option value="Emagrecimento">Emagrecimento</option>
                    <option value="Condicionamento">Condicionamento Físico</option>
                    <option value="Força">Desenvolvimento de Força</option>
                    <option value="Definição">Definição Muscular</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Duração Alvo por Sessão
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                    className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-2.5 text-slate-800 dark:text-slate-200"
                  >
                    <option value={35}>Express (35 min)</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos (Padrão)</option>
                    <option value={75}>75 minutos</option>
                    <option value={90}>90 minutos</option>
                  </select>
                </div>
              </div>

              {/* Dias da Semana */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Dias de Treino Disponíveis ({selectedDays.length} selecionados)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((day) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleToggleDay(day)}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all text-xs ${
                          isSelected
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Presets de Instruções da Personal */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Preset de Metodologia da Personal
                  </label>
                  <span className="text-[10px] text-slate-400">Modelos prontos</span>
                </div>
                <select
                  value={selectedPresetId}
                  onChange={(e) => handleSelectPreset(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-2.5 text-slate-800 dark:text-slate-200"
                >
                  {TRAINER_INSTRUCTION_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Textarea: Orientações Específicas da Rafaela */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Orientações Específicas para esta Geração (Contexto da Personal)
                </label>
                <textarea
                  rows={3}
                  value={trainerInstructions}
                  onChange={(e) => setTrainerInstructions(e.target.value)}
                  placeholder="Ex: Priorizar exercícios livres. Evitar agachamento profundo. Foco em técnica e segurança articular..."
                  className="w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                />
              </div>

              {/* Resumo e Seleção de Contexto Utilizado (Seção 38) */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-dark-card border border-slate-200/60 dark:border-dark-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    Contexto e Minimização de Dados (LGPD)
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsPreviewContextOpen(!isPreviewContextOpen)}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    {isPreviewContextOpen ? 'Ocultar dados enviados' : 'Ver dados enviados'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contextSelection.includeGoals}
                      onChange={(e) => setContextSelection({ ...contextSelection, includeGoals: e.target.checked })}
                      className="rounded text-emerald-500"
                    />
                    <span>Objetivo</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contextSelection.includeHistory}
                      onChange={(e) => setContextSelection({ ...contextSelection, includeHistory: e.target.checked })}
                      className="rounded text-emerald-500"
                    />
                    <span>Histórico de Treino</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contextSelection.includeAnamnesis}
                      onChange={(e) => setContextSelection({ ...contextSelection, includeAnamnesis: e.target.checked })}
                      className="rounded text-emerald-500"
                    />
                    <span>Anamnese & Dores</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contextSelection.includeNutrition}
                      onChange={(e) => setContextSelection({ ...contextSelection, includeNutrition: e.target.checked })}
                      className="rounded text-emerald-500"
                    />
                    <span>Alimentação</span>
                  </label>
                </div>

                {isPreviewContextOpen && (
                  <div className="mt-2 p-2.5 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[10px] overflow-x-auto max-h-36">
                    <p className="text-slate-400 mb-1">// Dados sanitizados enviados para a IA:</p>
                    <pre>
                      {JSON.stringify(
                        {
                          aluno: student.name.split(' ')[0],
                          nivel: student.level,
                          meta: selectedGoal,
                          dias: selectedDays,
                          duracaoMin: durationMinutes,
                          instrucoesPersonal: trainerInstructions,
                          dadosSensiveisRemovidos: ['telefone', 'email', 'cpf', 'endereco'],
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}
              </div>

              {/* Botão de Ação: Gerar */}
              <div className="pt-2 flex justify-end">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleGenerateProposal}
                  isLoading={isGenerating}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Gerar Proposta Estruturada
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: REVISAR TREINO ATUAL */}
          {activeTab === 'review' && (
            <div className="space-y-4 text-xs">
              {isLoadingAnalysis ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
                  <span>Analisando coerência biomecânica e volume com IA...</span>
                </div>
              ) : reviewResult ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-card border border-slate-200/60 dark:border-dark-border space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      Diagnóstico Geral da Estrutura
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {reviewResult.overallAssessment}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 pt-1 font-mono text-[11px]">
                      • {reviewResult.volumeObservations}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                    <h4 className="font-bold text-amber-900 dark:text-amber-200">
                      Oportunidades de Ajuste Identificadas
                    </h4>
                    {reviewResult.possibleAdjustments?.map((adj: string, idx: number) => (
                      <p key={idx} className="text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                        <span>→</span>
                        <span>{adj}</span>
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">
                  Clique para iniciar a revisão técnica do treino.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ANÁLISE DE ADESÃO & CARGAS */}
          {activeTab === 'progress' && (
            <div className="space-y-4 text-xs">
              {isLoadingAnalysis ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
                  <span>Compilando dados de sessões, cargas e feedbacks...</span>
                </div>
              ) : progressResult ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        Resumo de Consistência
                      </h4>
                      <Badge variant="success" size="sm">
                        Adesão: {progressResult.completionRate}%
                      </Badge>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">
                      {progressResult.summary}
                    </p>
                  </div>

                  {progressResult.loadProgressionHighlights?.length > 0 && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-card border border-slate-200/60 dark:border-dark-border space-y-1.5">
                      <h4 className="font-bold text-slate-900 dark:text-white">
                        Destaques de Sobrecarga Progressiva
                      </h4>
                      {progressResult.loadProgressionHighlights.map((prog: string, idx: number) => (
                        <p key={idx} className="text-emerald-600 dark:text-emerald-400 font-mono">
                          ✓ {prog}
                        </p>
                      ))}
                    </div>
                  )}

                  {progressResult.frequentlySkippedExercises?.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-1">
                      <h4 className="font-bold text-rose-900 dark:text-rose-200">
                        Exercícios Frequentemente Pulados ou Substituídos
                      </h4>
                      {progressResult.frequentlySkippedExercises.map((sk: any, idx: number) => (
                        <p key={idx} className="text-rose-800 dark:text-rose-300">
                          • {sk.name} ({sk.count} ocorrência)
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400">
                  Clique para compilar a análise factual de adesão.
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Drawer de Revisão e Aprovação Humana Obrigatória */}
      {reviewedProposal && (
        <AIProposalReviewDrawer
          isOpen={true}
          onClose={() => setReviewedProposal(null)}
          proposal={reviewedProposal}
          currentPlan={currentPlan}
          onApproved={(appliedPlan) => {
            onPlanApplied(appliedPlan);
            setReviewedProposal(null);
            onClose();
          }}
          onRegenerateRequest={(extraInstructions) => {
            setTrainerInstructions((prev) => `${prev}\nObservações adicionais: ${extraInstructions}`);
            setReviewedProposal(null);
            handleGenerateProposal();
          }}
        />
      )}
    </>
  );
};
