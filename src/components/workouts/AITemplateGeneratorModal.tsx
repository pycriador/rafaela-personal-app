import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Clock,
  Target,
  Shield,
  Layers,
  CheckCircle2,
  Trash2,
  Edit2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { WorkoutTemplate, WorkoutExercise, Exercise, ExerciseCategory } from '../../types';
import { AIWorkoutService } from '../../services/ai/AIWorkoutService';
import { exerciseRepository } from '../../repositories/exerciseRepository';
import { useToast } from '../../context/ToastContext';
import { getAssetUrl } from '../../utils/assets';

interface AITemplateGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTemplate: (template: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  allExercises: Exercise[];
}

interface TemplatePromptExample {
  title: string;
  category: ExerciseCategory | 'Full Body' | 'Push' | 'Pull' | 'Legs' | 'Core & Cardio';
  level: 'iniciante' | 'intermediário' | 'avançado';
  minutes: number;
  prompt: string;
}

const TEMPLATE_EXAMPLES: TemplatePromptExample[] = [
  {
    title: '🍑 Glúteo & Posterior Avançado (Pico de Contração)',
    category: 'Legs',
    level: 'avançado',
    minutes: 55,
    prompt:
      'Série avançada com foco máximo em Glúteos e Posterior de Coxa. Iniciar com pré-ativação de glúteo médio, progredir para elevação pélvica pesada com pico de contração de 2 segundos, incluir agachamento búlgaro com foco no glúteo e cadeira flexora com cadência 3-1-2. Descanso de 60 a 90 segundos. Duração 55 minutos.',
  },
  {
    title: '🛡️ Push / Peito & Deltoides (Proteção de Manguito)',
    category: 'Push',
    level: 'intermediário',
    minutes: 50,
    prompt:
      'Série intermediária de Push (Empurrar). Foco na porção clavicular do peitoral e deltoide lateral. Evitar sobrecarga no manguito rotador. Começar com supino inclinado com halteres, voador máquina com boa amplitude, elevação lateral na polia e tríceps corda. 4 séries por exercício, 10 a 12 reps.',
  },
  {
    title: '🚀 Full Body Express 40min (Halteres & Polia)',
    category: 'Full Body',
    level: 'intermediário',
    minutes: 40,
    prompt:
      'Treino Full Body dinâmico de 40 minutos para rotina corrida. Apenas exercícios eficientes com halteres e polia: agachamento taça (goblet), supino reto com halteres, puxada frontal, desenvolvimento com halteres e prancha isométrica. 3 séries de 10-12 repetições, 45 segundos de descanso.',
  },
  {
    title: '🏹 Pull / Costas & Bíceps (Largura & Densidade)',
    category: 'Pull',
    level: 'avançado',
    minutes: 55,
    prompt:
      'Série de puxar para alargamento dorsal e densidade muscular. Puxada frontal aberta na polia, remada curvada apoiada para proteger a lombar, crucifixo inverso para deltoide posterior e rosca direta alternada com halteres. Intervalos de 60 segundos com boa carga.',
  },
  {
    title: '🧘 Deload Regenerativo & Recuperação Articular',
    category: 'Full Body',
    level: 'intermediário',
    minutes: 45,
    prompt:
      'Série regenerativa de deload para semana de alívio de estresse neural e articular. Movimentos guiados em máquinas, 12 a 15 repetições leves (RPE 6), foco em controle de movimento, circulação sanguínea e amplitude articular sem falha concêntrica.',
  },
  {
    title: '🔥 Pernas Foco Quadríceps (Adaptação para Iniciante)',
    category: 'Legs',
    level: 'iniciante',
    minutes: 45,
    prompt:
      'Série de adaptação de membros inferiores para aluno iniciante. Foco em quadríceps com segurança mecânica em máquinas guiadas: leg press 45 com pés médios, cadeira extensora, agachamento guiado no smith e panturrilha sentado. 3 séries de 12 repetições, descanso de 60 segundos.',
  },
];

export const AITemplateGeneratorModal: React.FC<AITemplateGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSaveTemplate,
  allExercises,
}) => {
  const { error: toastError, success: toastSuccess } = useToast();

  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [targetMinutes, setTargetMinutes] = useState<number>(50);

  const [isTipsExpanded, setIsTipsExpanded] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Generated Result Review State
  const [generatedTemplate, setGeneratedTemplate] = useState<Omit<
    WorkoutTemplate,
    'id' | 'createdAt' | 'updatedAt'
  > | null>(null);

  const handleSelectExample = (ex: TemplatePromptExample) => {
    setDescription(ex.prompt);
    setSelectedCategory(ex.category);
    setSelectedLevel(ex.level);
    setTargetMinutes(ex.minutes);
  };

  const handleGenerate = async () => {
    if (!description.trim()) {
      toastError('Por favor, informe a descrição ou selecione um exemplo para a série.');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await AIWorkoutService.generateWorkoutTemplate({
        description: description.trim(),
        category: selectedCategory as any,
        level: selectedLevel as any,
        targetMinutes,
      });

      setGeneratedTemplate(result);
      toastSuccess('Série modelo gerada com sucesso pela Inteligência Artificial!');
    } catch (err: any) {
      console.error('Erro ao gerar série com IA:', err);
      toastError(err.message || 'Falha ao gerar série com IA. Tente refinar a descrição.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedTemplate) return;
    setIsSaving(true);
    try {
      await onSaveTemplate(generatedTemplate);
      toastSuccess(`Série "${generatedTemplate.name}" salva com sucesso na biblioteca!`);
      handleClose();
    } catch (err: any) {
      toastError(err.message || 'Erro ao salvar série.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setDescription('');
    setGeneratedTemplate(null);
    onClose();
  };

  const handleRemoveExercise = (idx: number) => {
    if (!generatedTemplate) return;
    const updatedEx = generatedTemplate.exercises.filter((_, i) => i !== idx);
    setGeneratedTemplate({ ...generatedTemplate, exercises: updatedEx });
  };

  const handleUpdateExercise = (idx: number, updates: Partial<WorkoutExercise>) => {
    if (!generatedTemplate) return;
    const updatedEx = [...generatedTemplate.exercises];
    updatedEx[idx] = { ...updatedEx[idx], ...updates };
    setGeneratedTemplate({ ...generatedTemplate, exercises: updatedEx });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title=""
      size="xl"
    >
      <div className="space-y-6">
        {/* Header Branding */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> AI Copilot Prescritivo
                </span>
                <span className="text-xs text-slate-400">• Biblioteca Oficial</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Gerar Série Modelo com IA
              </h2>
            </div>
          </div>
          <Badge variant="brand" size="md">
            302 Exercícios Catalogados
          </Badge>
        </div>

        {/* STEP 1: PROMPT & CRITERIA (Visible when no template is generated yet) */}
        {!generatedTemplate ? (
          <div className="space-y-5">
            {/* O Que Considerar (Interactive Educational Accordion) */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/10 overflow-hidden">
              <button
                type="button"
                onClick={() => setIsTipsExpanded(!isTipsExpanded)}
                className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100/40 dark:hover:bg-emerald-950/20 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>O que colocar e considerar para a criação da série:</span>
                </span>
                {isTipsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {isTipsExpanded && (
                <div className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-300 border-t border-emerald-500/10">
                  <div className="space-y-1 p-2.5 rounded-xl bg-white/60 dark:bg-dark-card/60 border border-emerald-500/10">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" /> 1. Objetivo & Estímulo
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-dark-muted">
                      Hipertrofia tensional vs metabólica, força pura, queima/densidade calórica, deload regenerativo ou reabilitação.
                    </p>
                  </div>

                  <div className="space-y-1 p-2.5 rounded-xl bg-white/60 dark:bg-dark-card/60 border border-emerald-500/10">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" /> 2. Grupamento & Divisão
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-dark-muted">
                      Push (Peito/Tríceps/Ombros), Pull (Costas/Bíceps), Pernas (Quadríceps ou Glúteos/Posterior), Full Body ou Core.
                    </p>
                  </div>

                  <div className="space-y-1 p-2.5 rounded-xl bg-white/60 dark:bg-dark-card/60 border border-emerald-500/10">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <Dumbbell className="w-3.5 h-3.5" /> 3. Nível do Aluno
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-dark-muted">
                      Iniciante (trajetórias guiadas, 12-15 reps), Intermediário (misto máquinas e pesos livres, 8-12 reps), ou Avançado.
                    </p>
                  </div>

                  <div className="space-y-1 p-2.5 rounded-xl bg-white/60 dark:bg-dark-card/60 border border-emerald-500/10">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> 4. Duração & Volume
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-dark-muted">
                      Express 35-40min (4 a 5 exercícios eficientes) ou Padrão 50-60min (6 a 8 exercícios com descansos adequados).
                    </p>
                  </div>

                  <div className="space-y-1 p-2.5 rounded-xl bg-white/60 dark:bg-dark-card/60 border border-emerald-500/10">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" /> 5. Cuidados Biomecânicos
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-dark-muted">
                      Indique restrições: evitar compressão lombar axial, poupar manguito rotador, cadência lenta (3s excêntrica) ou pico de contração.
                    </p>
                  </div>

                  <div className="space-y-1 p-2.5 rounded-xl bg-white/60 dark:bg-dark-card/60 border border-emerald-500/10">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" /> 6. Equipamentos Disponíveis
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-dark-muted">
                      Academia completa, condomínio (halteres + banco), apenas polia/cabos ou peso corporal / elásticos.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Chips de Exemplos Inspiradores */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Exemplos Prontos (Clique para Preencher Automaticamente):
              </span>
              <div className="flex flex-wrap gap-2">
                {TEMPLATE_EXAMPLES.map((ex) => (
                  <button
                    key={ex.title}
                    type="button"
                    onClick={() => handleSelectExample(ex)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-emerald-50 dark:bg-dark-cardElevated dark:hover:bg-emerald-950/30 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-dark-border hover:border-emerald-500/40 transition-all text-left shadow-2xs"
                  >
                    {ex.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Descreva a Série Desejada *
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {description.length} caracteres
                </span>
              </div>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Monte uma série de pernas com ênfase em glúteo e posterior de coxa. Iniciar com pré-ativação, usar elevação pélvica pesada com pico de contração, búlgaro e cadeira flexora. 4 séries, 10 a 12 reps, descanso de 60s..."
                className="w-full rounded-2xl p-3.5 text-xs sm:text-sm bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-hidden transition-all placeholder:text-slate-400 text-slate-900 dark:text-white"
              />
            </div>

            {/* Ajustes Opcionais */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Categoria Sugerida
                </label>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  options={[
                    { value: 'all', label: 'Auto-detectar com IA' },
                    { value: 'Push', label: 'Push (Empurrar)' },
                    { value: 'Pull', label: 'Pull (Puxar)' },
                    { value: 'Legs', label: 'Legs (Pernas)' },
                    { value: 'Full Body', label: 'Full Body (Corpo Inteiro)' },
                    { value: 'Core & Cardio', label: 'Core & Cardio' },
                  ]}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nível Sugerido
                </label>
                <Select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  options={[
                    { value: 'all', label: 'Auto-detectar com IA' },
                    { value: 'iniciante', label: 'Iniciante' },
                    { value: 'intermediário', label: 'Intermediário' },
                    { value: 'avançado', label: 'Avançado' },
                  ]}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Duração Estimada
                </label>
                <Select
                  value={String(targetMinutes)}
                  onChange={(e) => setTargetMinutes(parseInt(e.target.value, 10))}
                  options={[
                    { value: '35', label: 'Express (35 min)' },
                    { value: '45', label: 'Rápido (45 min)' },
                    { value: '50', label: 'Padrão (50 min)' },
                    { value: '60', label: 'Completo (60 min)' },
                    { value: '75', label: 'Avançado (75 min)' },
                  ]}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" size="md" onClick={handleClose} disabled={isGenerating}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleGenerate}
                isLoading={isGenerating}
                leftIcon={<Sparkles className="w-4 h-4 text-emerald-200" />}
                className="shadow-2xs font-semibold"
              >
                {isGenerating ? 'IA Estruturando Série...' : 'Gerar Série com IA'}
              </Button>
            </div>
          </div>
        ) : (
          /* STEP 2: REVIEW & EDIT GENERATED TEMPLATE */
          <div className="space-y-6">
            {/* Template Header Overview */}
            <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border space-y-3 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="brand" size="md">
                    {generatedTemplate.category}
                  </Badge>
                  <Badge variant="neutral" size="md">
                    Nível {generatedTemplate.level}
                  </Badge>
                  <Badge variant="neutral" size="md" className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-emerald-500" />
                    {generatedTemplate.estimatedMinutes} min
                  </Badge>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Proposta Estruturada
                </span>
              </div>

              <div>
                <input
                  type="text"
                  value={generatedTemplate.name}
                  onChange={(e) => setGeneratedTemplate({ ...generatedTemplate, name: e.target.value })}
                  className="text-lg sm:text-xl font-black text-slate-900 dark:text-white bg-transparent border-b border-dashed border-slate-300 dark:border-dark-border focus:border-emerald-500 outline-hidden w-full pb-1"
                  placeholder="Nome da Série Modelo"
                />
                <p className="text-xs text-slate-500 dark:text-dark-muted mt-1.5">
                  {generatedTemplate.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300 pt-1">
                <span>
                  <strong>Foco Muscular:</strong> {generatedTemplate.muscleFocus}
                </span>
                {generatedTemplate.notes && (
                  <span>
                    <strong>Orientações:</strong> {generatedTemplate.notes}
                  </span>
                )}
              </div>
            </div>

            {/* Exercise List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-emerald-500" />
                  Exercícios Selecionados ({generatedTemplate.exercises.length})
                </h3>
                <span className="text-xs text-slate-500">
                  Validados rigorosamente contra a biblioteca oficial
                </span>
              </div>

              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {generatedTemplate.exercises.map((item, idx) => {
                  const exerciseInfo = allExercises.find((e) => e.id === item.exerciseId);

                  return (
                    <Card
                      key={`${item.exerciseId}-${idx}`}
                      className="p-3.5 border-slate-200 dark:border-dark-border hover:border-emerald-500/40 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          {exerciseInfo?.imageUrl && (
                            <img
                              src={getAssetUrl(exerciseInfo.imageUrl)}
                              alt={exerciseInfo.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-dark-border shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                              {exerciseInfo?.name || item.exerciseId}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-dark-muted block truncate">
                              {item.notes || exerciseInfo?.category || 'Cadência 2-0-2'}
                            </span>
                          </div>
                        </div>

                        {/* Exercise Metrics Inputs */}
                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          <div className="flex items-center gap-1 bg-slate-100 dark:bg-dark-cardElevated px-2 py-1 rounded-lg">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Séries:</span>
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={item.sets}
                              onChange={(e) =>
                                handleUpdateExercise(idx, { sets: parseInt(e.target.value, 10) || 3 })
                              }
                              className="w-9 text-xs font-bold text-center bg-transparent border-0 outline-hidden font-mono text-slate-900 dark:text-white"
                            />
                          </div>

                          <div className="flex items-center gap-1 bg-slate-100 dark:bg-dark-cardElevated px-2 py-1 rounded-lg">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Reps:</span>
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={item.reps}
                              onChange={(e) =>
                                handleUpdateExercise(idx, { reps: parseInt(e.target.value, 10) || 10 })
                              }
                              className="w-10 text-xs font-bold text-center bg-transparent border-0 outline-hidden font-mono text-slate-900 dark:text-white"
                            />
                          </div>

                          <div className="flex items-center gap-1 bg-slate-100 dark:bg-dark-cardElevated px-2 py-1 rounded-lg">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Carga:</span>
                            <input
                              type="number"
                              min={0}
                              value={item.weight}
                              onChange={(e) =>
                                handleUpdateExercise(idx, { weight: parseFloat(e.target.value) || 0 })
                              }
                              className="w-10 text-xs font-bold text-center bg-transparent border-0 outline-hidden font-mono text-slate-900 dark:text-white"
                            />
                            <span className="text-[10px] text-slate-400">kg</span>
                          </div>

                          <div className="flex items-center gap-1 bg-slate-100 dark:bg-dark-cardElevated px-2 py-1 rounded-lg">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Descanso:</span>
                            <input
                              type="number"
                              min={15}
                              step={5}
                              value={item.restSeconds}
                              onChange={(e) =>
                                handleUpdateExercise(idx, {
                                  restSeconds: parseInt(e.target.value, 10) || 60,
                                })
                              }
                              className="w-11 text-xs font-bold text-center bg-transparent border-0 outline-hidden font-mono text-slate-900 dark:text-white"
                            />
                            <span className="text-[10px] text-slate-400">s</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveExercise(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Remover exercício da série"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Step 2 Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-dark-border">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setGeneratedTemplate(null)}
                leftIcon={<RefreshCw className="w-4 h-4" />}
                className="text-xs w-full sm:w-auto"
              >
                Voltar e Ajustar Descrição
              </Button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button variant="ghost" size="md" onClick={handleClose} disabled={isSaving}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSave}
                  isLoading={isSaving}
                  leftIcon={<CheckCircle2 className="w-4 h-4 text-white" />}
                  className="shadow-2xs font-semibold w-full sm:w-auto"
                >
                  Salvar como Série Modelo
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
