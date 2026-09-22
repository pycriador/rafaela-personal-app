import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Search,
  Plus,
  Clock,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { WorkoutTemplate, WorkoutExercise, Exercise, DayOfWeek } from '../../types';
import { workoutTemplateRepository } from '../../repositories/workoutTemplateRepository';
import { exerciseRepository } from '../../repositories/exerciseRepository';
import { useToast } from '../../context/ToastContext';

interface WorkoutTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: WorkoutTemplate) => void;
  title?: string;
  description?: string;
}

export const WorkoutTemplatesModal: React.FC<WorkoutTemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  title = 'Central de Séries & Modelos Pré-Cadastrados',
  description = 'Escolha uma série pronta elaborada tecnicamente para vincular ao treino com 1 clique',
}) => {
  const { success, error: toastError } = useToast();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [exercisesMap, setExercisesMap] = useState<Record<string, Exercise>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const [temps, allEx] = await Promise.all([
        workoutTemplateRepository.getAll(),
        exerciseRepository.getAll(),
      ]);
      setTemplates(temps);
      const map: Record<string, Exercise> = {};
      allEx.forEach((e) => {
        map[e.id] = e;
      });
      setExercisesMap(map);
    } catch (err) {
      console.error('Erro ao carregar modelos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.muscleFocus.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleApply = (template: WorkoutTemplate) => {
    onSelectTemplate(template);
    success(`Série "${template.name}" carregada com sucesso!`);
    onClose();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir esta série modelo?')) {
      await workoutTemplateRepository.delete(id);
      await loadData();
      success('Modelo excluído.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="xl"
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Buscar série por nome, foco muscular ou objetivo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'Push', 'Pull', 'Legs', 'Full Body'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-dark-card text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat === 'all' ? 'Todas' : cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Nenhum modelo encontrado para a busca informada.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between gap-3 text-left group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="brand" size="sm">
                          {template.category}
                        </Badge>
                        <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">
                          {template.level}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                        {template.name}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, template.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                      title="Excluir modelo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-dark-muted mt-1 leading-relaxed">
                    {template.description}
                  </p>

                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-mono font-bold text-slate-600 dark:text-slate-300">
                      <Dumbbell className="w-3.5 h-3.5 text-emerald-500" />
                      {template.exercises.length} exercícios
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-500" />
                      ~{template.estimatedMinutes} min
                    </span>
                  </div>

                  <div className="mt-2.5 p-2 rounded-xl bg-slate-50 dark:bg-dark-cardElevated border border-slate-100 dark:border-dark-border/40 space-y-1 text-[11px]">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Exercícios Prescritos:
                    </span>
                    {template.exercises.slice(0, 3).map((item, idx) => {
                      const ex = exercisesMap[item.exerciseId];
                      return (
                        <div key={idx} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                          <span className="truncate max-w-[200px]">
                            {idx + 1}. {ex ? ex.name : item.exerciseId}
                          </span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 shrink-0 font-bold">
                            {item.sets}×{item.reps} @ {item.weight}kg
                          </span>
                        </div>
                      );
                    })}
                    {template.exercises.length > 3 && (
                      <span className="text-[10px] text-slate-400 block italic">
                        + {template.exercises.length - 3} outros exercícios...
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-dark-border/60 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-slate-400 truncate">
                    Foco: {template.muscleFocus}
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleApply(template)}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    className="shrink-0 text-xs py-1.5 px-3"
                  >
                    Vincular Série
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-dark-border/60">
          <Button variant="ghost" onClick={onClose} size="sm">
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};