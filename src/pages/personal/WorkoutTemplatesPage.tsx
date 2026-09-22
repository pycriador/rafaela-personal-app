import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Layers,
  Search,
  Plus,
  Dumbbell,
  Clock,
  Trash2,
  Edit3,
  GitFork,
  Power,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUp,
  ArrowDown,
  Sliders,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { WorkoutTemplate, WorkoutExercise, Exercise, ExerciseCategory } from '../../types';
import { workoutTemplateRepository } from '../../repositories/workoutTemplateRepository';
import { exerciseRepository } from '../../repositories/exerciseRepository';
import { useToast } from '../../context/ToastContext';
import { getAssetUrl } from '../../utils/assets';

export const WorkoutTemplatesPage: React.FC = () => {
  const { success, error: toastError, info } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  // Screen limit detector for dynamic responsive pagination
  const [screenLimit, setScreenLimit] = useState(6);
  useEffect(() => {
    const updateLimit = () => {
      if (window.innerWidth >= 1280) {
        setScreenLimit(8);
      } else {
        setScreenLimit(6);
      }
    };
    updateLimit();
    window.addEventListener('resize', updateLimit);
    return () => window.removeEventListener('resize', updateLimit);
  }, []);

  // URL parameters for pagination, filters and sorting
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const rawLimitParam = searchParams.get('limit');
  const limitPerPage = rawLimitParam && rawLimitParam !== 'auto'
    ? parseInt(rawLimitParam, 10) || 6
    : screenLimit;

  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || 'all';
  const currentLevel = searchParams.get('level') || 'all';
  const currentStatus = (searchParams.get('status') as 'all' | 'active' | 'inactive') || 'all';
  const currentSort = (searchParams.get('sort') as 'recent' | 'name' | 'exercises') || 'recent';

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    setSearchParams(next);
  };

  // Debounce search input to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== currentSearch) {
        updateParams({ search: searchInput.trim() ? searchInput.trim() : null, page: '1' });
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Expanded cards tracker
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Edit / Create Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<ExerciseCategory | 'Full Body' | 'Push' | 'Pull' | 'Legs' | 'Core & Cardio'>('Push');
  const [formLevel, setFormLevel] = useState<'iniciante' | 'intermediário' | 'avançado'>('intermediário');
  const [formMuscleFocus, setFormMuscleFocus] = useState('');
  const [formEstimatedMinutes, setFormEstimatedMinutes] = useState(50);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formVersionTag, setFormVersionTag] = useState('v1.0');
  const [formNotes, setFormNotes] = useState('');
  const [formExercises, setFormExercises] = useState<WorkoutExercise[]>([]);

  // Exercise picker inside modal
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [exercisePickerSearch, setExercisePickerSearch] = useState('');
  const [exercisePickerCategory, setExercisePickerCategory] = useState('all');

  // Versioning Modal state
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [targetVersionTemplate, setTargetVersionTemplate] = useState<WorkoutTemplate | null>(null);
  const [versionNewName, setVersionNewName] = useState('');
  const [versionNewTag, setVersionNewTag] = useState('');
  const [versionArchivePrevious, setVersionArchivePrevious] = useState(true);

  // Delete Confirm Modal state
  const [templateToDelete, setTemplateToDelete] = useState<WorkoutTemplate | null>(null);

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const [temps, exercises] = await Promise.all([
        workoutTemplateRepository.getAll(),
        exerciseRepository.getAll(),
      ]);
      setTemplates(temps);
      setAllExercises(exercises);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      toastError('Não foi possível carregar as séries prontas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick exercise lookup map
  const exercisesMap = useMemo(() => {
    const map: Record<string, Exercise> = {};
    allExercises.forEach((e) => {
      map[e.id] = e;
    });
    return map;
  }, [allExercises]);

  // Filtered and sorted templates based on URL parameters
  const filteredTemplates = useMemo(() => {
    const q = currentSearch.toLowerCase().trim();
    return templates
      .filter((t) => {
        const matchesSearch =
          !q ||
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.muscleFocus.toLowerCase().includes(q) ||
          t.exercises.some((item) => {
            const ex = exercisesMap[item.exerciseId];
            return ex && ex.name.toLowerCase().includes(q);
          });

        const matchesCat = currentCategory === 'all' || t.category === currentCategory;
        const matchesLvl = currentLevel === 'all' || t.level === currentLevel;
        const matchesStat =
          currentStatus === 'all' ||
          (currentStatus === 'active' && t.isActive !== false) ||
          (currentStatus === 'inactive' && t.isActive === false);

        return matchesSearch && matchesCat && matchesLvl && matchesStat;
      })
      .sort((a, b) => {
        if (currentSort === 'name') return a.name.localeCompare(b.name);
        if (currentSort === 'exercises') return b.exercises.length - a.exercises.length;
        // Default: recent
        return (b.updatedAt || '').localeCompare(a.updatedAt || '');
      });
  }, [templates, currentSearch, currentCategory, currentLevel, currentStatus, currentSort, exercisesMap]);

  // Pagination calculation
  const totalItems = filteredTemplates.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limitPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * limitPerPage;
  const endIndex = Math.min(startIndex + limitPerPage, totalItems);
  const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex);

  const hasActiveFilters = Boolean(
    currentSearch ||
    (currentCategory && currentCategory !== 'all') ||
    (currentLevel && currentLevel !== 'all') ||
    (currentStatus && currentStatus !== 'all')
  );

  const handleClearFilters = () => {
    setSearchInput('');
    const next = new URLSearchParams({ page: '1' });
    if (rawLimitParam && rawLimitParam !== 'auto') {
      next.set('limit', rawLimitParam);
    }
    setSearchParams(next);
  };

  // Statistics
  const stats = useMemo(() => {
    const total = templates.length;
    const active = templates.filter((t) => t.isActive !== false).length;
    const inactive = total - active;
    const versioned = templates.filter((t) => (t.version && t.version > 1) || !!t.parentId).length;
    return { total, active, inactive, versioned };
  }, [templates]);

  // Toggle card expansion
  const toggleCard = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Toggle template active status
  const handleToggleStatus = async (template: WorkoutTemplate) => {
    try {
      const updated = await workoutTemplateRepository.toggleStatus(template.id);
      if (updated) {
        setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        if (updated.isActive) {
          success(`Série "${template.name}" agora está ATIVA e visível para vincular a alunos.`);
        } else {
          info(`Série "${template.name}" foi DESATIVADA (mantida em histórico).`);
        }
      }
    } catch {
      toastError('Erro ao alternar status da série.');
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingTemplate(null);
    setFormName('');
    setFormDescription('');
    setFormCategory('Push');
    setFormLevel('intermediário');
    setFormMuscleFocus('Peitoral e Tríceps');
    setFormEstimatedMinutes(50);
    setFormIsActive(true);
    setFormVersionTag('v1.0');
    setFormNotes('');
    setFormExercises([]);
    setIsEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (template: WorkoutTemplate) => {
    setEditingTemplate(template);
    setFormName(template.name);
    setFormDescription(template.description);
    setFormCategory(template.category);
    setFormLevel(template.level);
    setFormMuscleFocus(template.muscleFocus);
    setFormEstimatedMinutes(template.estimatedMinutes);
    setFormIsActive(template.isActive !== false);
    setFormVersionTag(template.versionTag || `v${template.version || 1}.0`);
    setFormNotes(template.notes || '');
    setFormExercises(JSON.parse(JSON.stringify(template.exercises)));
    setIsEditModalOpen(true);
  };

  // Save template (Create or Update)
  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      toastError('Informe o nome da série.');
      return;
    }

    if (formExercises.length === 0) {
      toastError('Adicione ao menos 1 exercício na série pronta.');
      return;
    }

    const templateToSave: WorkoutTemplate = {
      id: editingTemplate ? editingTemplate.id : `template-${Date.now()}`,
      name: formName.trim(),
      description: formDescription.trim(),
      category: formCategory,
      level: formLevel,
      muscleFocus: formMuscleFocus.trim() || 'Geral',
      estimatedMinutes: Number(formEstimatedMinutes) || 45,
      isActive: formIsActive,
      version: editingTemplate?.version || 1,
      versionTag: formVersionTag.trim() || 'v1.0',
      parentId: editingTemplate?.parentId,
      notes: formNotes.trim(),
      exercises: formExercises.map((ex, idx) => ({ ...ex, order: idx + 1 })),
      createdAt: editingTemplate ? editingTemplate.createdAt : new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    try {
      const saved = await workoutTemplateRepository.save(templateToSave);
      setTemplates((prev) => {
        const idx = prev.findIndex((t) => t.id === saved.id);
        if (idx === -1) {
          return [saved, ...prev];
        }
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      });

      success(
        editingTemplate
          ? `Série "${saved.name}" atualizada com sucesso!`
          : `Nova série pronta "${saved.name}" criada com sucesso!`
      );
      setIsEditModalOpen(false);
    } catch {
      toastError('Erro ao salvar série pronta.');
    }
  };

  // Add exercise to template form
  const handleAddExerciseToForm = (exercise: Exercise) => {
    const exists = formExercises.some((e) => e.exerciseId === exercise.id);
    if (exists) {
      info(`O exercício "${exercise.name}" já está na lista da série.`);
      return;
    }

    const newWorkoutEx: WorkoutExercise = {
      exerciseId: exercise.id,
      order: formExercises.length + 1,
      sets: 4,
      reps: 10,
      weight: 20,
      restSeconds: 60,
      notes: exercise.instructions ? `Dica: ${exercise.instructions.slice(0, 70)}...` : '',
      alternatives: exercise.alternatives || [],
      allowWeightChange: true,
      allowSetChange: false,
      allowRepChange: true,
      allowSkip: true,
      allowSubstitution: true,
    };

    setFormExercises((prev) => [...prev, newWorkoutEx]);
    success(`"${exercise.name}" adicionado à série!`);
  };

  // Remove exercise from template form
  const handleRemoveExerciseFromForm = (exerciseId: string) => {
    setFormExercises((prev) => prev.filter((e) => e.exerciseId !== exerciseId));
  };

  // Move exercise up/down
  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === formExercises.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const copy = [...formExercises];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    setFormExercises(copy);
  };

  // Update specific exercise field in form
  const handleUpdateExerciseField = (
    index: number,
    field: keyof WorkoutExercise,
    value: any
  ) => {
    setFormExercises((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Open Versioning Modal
  const handleOpenVersionModal = (template: WorkoutTemplate) => {
    setTargetVersionTemplate(template);
    const nextVer = (template.version || 1) + 1;
    setVersionNewTag(`v${nextVer}.0`);
    setVersionNewName(`${template.name.replace(/\(v.*?\)/g, '').trim()} (v${nextVer}.0)`);
    setVersionArchivePrevious(true);
    setIsVersionModalOpen(true);
  };

  // Execute version duplication
  const handleConfirmVersion = async () => {
    if (!targetVersionTemplate) return;
    try {
      const newVersion = await workoutTemplateRepository.duplicateVersion(
        targetVersionTemplate.id,
        {
          newName: versionNewName,
          versionTag: versionNewTag,
          archivePrevious: versionArchivePrevious,
        }
      );
      await loadData();
      success(`Nova versão "${newVersion.versionTag}" criada com sucesso!`);
      setIsVersionModalOpen(false);
    } catch (err: any) {
      toastError(err.message || 'Erro ao gerar nova versão da série.');
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!templateToDelete) return;
    try {
      await workoutTemplateRepository.delete(templateToDelete.id);
      setTemplates((prev) => prev.filter((t) => t.id !== templateToDelete.id));
      success(`Série "${templateToDelete.name}" excluída.`);
      setTemplateToDelete(null);
    } catch {
      toastError('Erro ao excluir série.');
    }
  };

  // Filtered exercises for picker modal
  const filteredPickerExercises = useMemo(() => {
    const q = exercisePickerSearch.toLowerCase().trim();
    return allExercises.filter((ex) => {
      const matchesSearch =
        !q ||
        ex.name.toLowerCase().includes(q) ||
        ex.category.toLowerCase().includes(q) ||
        ex.muscleGroups.some((m) => m.toLowerCase().includes(q));
      const matchesCat = exercisePickerCategory === 'all' || ex.category === exercisePickerCategory;
      return matchesSearch && matchesCat;
    });
  }, [allExercises, exercisePickerSearch, exercisePickerCategory]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Gestão de Séries Prontas
            </span>
            <span className="text-xs text-slate-400">• Personalização & Versionamento</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Modelos & Séries Prontas
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Cadastre rotinas técnicas padronizadas para vincular aos seus alunos com 1 clique.
            Personalize exercícios, regule permissões de execução, crie versões e controle quais séries estão ativas.
          </p>
        </div>

        <div className="z-10 flex items-center gap-3 shrink-0">
          <Button
            variant="secondary"
            size="md"
            onClick={loadData}
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            className="text-xs"
          >
            Atualizar
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenCreateModal}
            leftIcon={<Plus className="w-4 h-4" />}
            className="text-xs shadow-lg shadow-emerald-500/25"
          >
            Nova Série Modelo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-xs">
          <span className="text-xs text-slate-500 dark:text-dark-muted font-medium block">
            Total de Séries
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block font-mono">
            {stats.total}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-xs">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium block flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Séries Ativas
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block font-mono">
            {stats.active}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-xs">
          <span className="text-xs text-slate-500 dark:text-dark-muted font-medium block flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            Inativas / Arquivadas
          </span>
          <span className="text-2xl font-black text-slate-500 dark:text-slate-400 mt-1 block font-mono">
            {stats.inactive}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-xs">
          <span className="text-xs text-cyan-600 dark:text-cyan-400 font-medium block flex items-center gap-1">
            <GitFork className="w-3.5 h-3.5" />
            Versões Geradas
          </span>
          <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1 block font-mono">
            {stats.versioned}
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="sm:col-span-4">
              <Input
                placeholder="Buscar por nome, foco ou exercício..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                className="text-xs"
              />
            </div>

            {/* Category Filter */}
            <div className="sm:col-span-3">
              <Select
                value={currentCategory}
                onChange={(e) => updateParams({ category: e.target.value, page: '1' })}
                options={[
                  { value: 'all', label: 'Todas as Categorias' },
                  { value: 'Push', label: 'Push (Empurrar)' },
                  { value: 'Pull', label: 'Pull (Puxar)' },
                  { value: 'Legs', label: 'Legs (Pernas)' },
                  { value: 'Full Body', label: 'Full Body (Corpo Inteiro)' },
                  { value: 'Core & Cardio', label: 'Core & Cardio' },
                ]}
                className="text-xs"
              />
            </div>

            {/* Level Filter */}
            <div className="sm:col-span-2">
              <Select
                value={currentLevel}
                onChange={(e) => updateParams({ level: e.target.value, page: '1' })}
                options={[
                  { value: 'all', label: 'Todos Níveis' },
                  { value: 'iniciante', label: 'Iniciante' },
                  { value: 'intermediário', label: 'Intermediário' },
                  { value: 'avançado', label: 'Avançado' },
                ]}
                className="text-xs"
              />
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-3">
              <Select
                value={currentStatus}
                onChange={(e) => updateParams({ status: e.target.value, page: '1' })}
                options={[
                  { value: 'all', label: 'Todos os Status' },
                  { value: 'active', label: 'Apenas Ativas' },
                  { value: 'inactive', label: 'Apenas Inativas / Arquivadas' },
                ]}
                className="text-xs"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-dark-border/60 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>
                Total de <strong>{filteredTemplates.length}</strong> séries encontradas
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-emerald-500 hover:text-emerald-600 font-semibold cursor-pointer underline text-[11px]"
                >
                  Limpar filtros
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-400">Ordenar por:</span>
              <select
                value={currentSort}
                onChange={(e) => updateParams({ sort: e.target.value, page: '1' })}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-dark-card border border-slate-200 dark:border-dark-border text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer"
              >
                <option value="recent">Mais Recentes</option>
                <option value="name">Nome (A - Z)</option>
                <option value="exercises">Qtd. Exercícios</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates List Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-mono">Carregando séries e rotinas...</span>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-dark-cardElevated mx-auto flex items-center justify-center text-slate-400">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Nenhuma série encontrada
              </h3>
              <p className="text-xs text-slate-500 dark:text-dark-muted mt-1 max-w-sm mx-auto">
                Tente ajustar os filtros acima ou crie sua primeira série personalizada para seus alunos.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleOpenCreateModal}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Criar Nova Série Modelo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {paginatedTemplates.map((template) => {
              const isExpanded = !!expandedCards[template.id];
              const isActive = template.isActive !== false;

              return (
                <div
                  key={template.id}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-4 text-left relative ${
                    isActive
                      ? 'bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border hover:border-emerald-500/40 hover:shadow-lg'
                      : 'bg-slate-50/80 dark:bg-dark-card/50 border-dashed border-slate-300 dark:border-slate-800 opacity-80'
                  }`}
                >
                  <div>
                    {/* Card Header Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="brand" size="sm">
                          {template.category}
                        </Badge>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-mono font-bold text-slate-600 dark:text-slate-300">
                          {template.level}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-bold flex items-center gap-1">
                          <GitFork className="w-3 h-3" />
                          {template.versionTag || `v${template.version || 1}.0`}
                        </span>
                      </div>

                      {/* Status Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(template)}
                        title={isActive ? 'Clique para desativar esta série' : 'Clique para ativar esta série'}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-300'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{isActive ? 'Ativa' : 'Inativa'}</span>
                      </button>
                    </div>

                    {/* Title & Description */}
                    <div className="mt-3">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {template.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-dark-muted mt-1 leading-relaxed line-clamp-2">
                        {template.description}
                      </p>
                    </div>

                    {/* Muscle focus and duration */}
                    <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-dark-border/60 text-xs">
                      <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                        <Dumbbell className="w-4 h-4 text-emerald-500" />
                        {template.exercises.length} exercícios
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="w-4 h-4 text-cyan-500" />
                        ~{template.estimatedMinutes} min
                      </span>
                      <span className="text-slate-400 font-mono text-[11px] truncate max-w-xs">
                        Foco: {template.muscleFocus}
                      </span>
                    </div>

                    {/* Prescribed Exercises Preview (Collapsible) */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-dark-border/60">
                      <div
                        onClick={() => toggleCard(template.id)}
                        className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer hover:text-emerald-500 transition-colors select-none"
                      >
                        <span>
                          Exercícios Prescritos ({template.exercises.length})
                        </span>
                        <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                          <span>{isExpanded ? 'Ocultar detalhes' : 'Ver todos'}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>

                      <div className="mt-2.5 space-y-2">
                        {(isExpanded ? template.exercises : template.exercises.slice(0, 3)).map((item, idx) => {
                          const ex = exercisesMap[item.exerciseId];
                          return (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-slate-50 dark:bg-dark-cardElevated border border-slate-200/70 dark:border-dark-border flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <div className="truncate">
                                  <span className="font-bold text-slate-800 dark:text-white block truncate">
                                    {ex ? ex.name : item.exerciseId}
                                  </span>
                                  {item.notes && (
                                    <span className="text-[10px] text-slate-400 block truncate">
                                      {item.notes}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                                  {item.sets}×{item.reps} @ {item.weight}kg
                                </span>
                                <span className="text-[10px] text-slate-400 block">
                                  {item.restSeconds}s descanso
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {!isExpanded && template.exercises.length > 3 && (
                          <div
                            onClick={() => toggleCard(template.id)}
                            className="text-center py-1 text-[11px] text-emerald-500 font-semibold cursor-pointer hover:underline"
                          >
                            + {template.exercises.length - 3} outros exercícios na série...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-dark-border/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenEditModal(template)}
                        leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                        className="text-xs"
                      >
                        Editar Série
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenVersionModal(template)}
                        leftIcon={<GitFork className="w-3.5 h-3.5 text-cyan-500" />}
                        className="text-xs"
                      >
                        Nova Versão
                      </Button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setTemplateToDelete(template)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Excluir série"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalItems > 0 && (
            <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs shadow-xs">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <span className="text-slate-500 dark:text-dark-muted font-medium">
                  Exibindo <strong>{totalItems === 0 ? 0 : startIndex + 1}</strong> a <strong>{endIndex}</strong> de <strong>{totalItems}</strong> séries
                </span>

                {/* Items per Page Selector */}
                <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                  <span className="text-[11px] text-slate-400 font-semibold">Exibir:</span>
                  <select
                    value={rawLimitParam || 'auto'}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateParams({ limit: val === 'auto' ? null : val, page: '1' });
                    }}
                    className="text-xs font-bold bg-slate-50 dark:bg-dark-cardElevated border border-slate-200 dark:border-dark-border rounded-xl px-2.5 py-1 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="auto">Tela ({screenLimit} por página)</option>
                    <option value="6">6 por página (Padrão)</option>
                    <option value="8">8 por página</option>
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
                  onClick={() => updateParams({ page: '1' })}
                  disabled={safePage <= 1}
                  className="px-2"
                  title="Primeira Página"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>

                {/* Previous Page */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => updateParams({ page: String(safePage - 1) })}
                  disabled={safePage <= 1}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Anterior
                </Button>

                {/* Direct Page Numbers */}
                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    if (totalPages > 7) {
                      if (
                        p !== 1 &&
                        p !== totalPages &&
                        Math.abs(p - safePage) > 1
                      ) {
                        if (p === 2 || p === totalPages - 1) {
                          return (
                            <span key={p} className="text-xs text-slate-400 px-1">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }
                    }

                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => updateParams({ page: String(p) })}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          safePage === p
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-500/30'
                            : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                {/* Next Page */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => updateParams({ page: String(safePage + 1) })}
                  disabled={safePage >= totalPages}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Próxima
                </Button>

                {/* Last Page */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => updateParams({ page: String(totalPages) })}
                  disabled={safePage >= totalPages}
                  className="px-2"
                  title="Última Página"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: EDITAR / CRIAR SÉRIE COMPLETA (FULLSCREEN) */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={editingTemplate ? `Editar Série: ${editingTemplate.name}` : 'Criar Nova Série Pronta'}
        description="Configure os dados da série, sequência de exercícios, séries, repetições, descanso e permissões de execução"
        size="fullscreen"
      >
        <form onSubmit={handleSaveTemplate} className="space-y-6 flex flex-col flex-1">
          {/* Section 1: General Details */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-cardElevated border border-slate-200 dark:border-dark-border space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-500" />
              Informações Gerais do Modelo
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <Input
                  label="Nome da Série Modelo *"
                  placeholder="Ex: Série A - Hipertrofia Peitoral & Tríceps"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <Select
                  label="Categoria *"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  options={[
                    { value: 'Push', label: 'Push (Empurrar)' },
                    { value: 'Pull', label: 'Pull (Puxar)' },
                    { value: 'Legs', label: 'Legs (Pernas)' },
                    { value: 'Full Body', label: 'Full Body (Geral)' },
                    { value: 'Core & Cardio', label: 'Core & Cardio' },
                  ]}
                />
              </div>

              <div className="sm:col-span-3">
                <Select
                  label="Nível Recomendado *"
                  value={formLevel}
                  onChange={(e) => setFormLevel(e.target.value as any)}
                  options={[
                    { value: 'iniciante', label: 'Iniciante' },
                    { value: 'intermediário', label: 'Intermediário' },
                    { value: 'avançado', label: 'Avançado' },
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5">
                <Input
                  label="Foco Muscular Principal"
                  placeholder="Ex: Peitoral Maior, Deltoide Anterior e Tríceps"
                  value={formMuscleFocus}
                  onChange={(e) => setFormMuscleFocus(e.target.value)}
                />
              </div>

              <div className="sm:col-span-3">
                <Input
                  type="number"
                  label="Tempo Estimado (min)"
                  value={formEstimatedMinutes}
                  onChange={(e) => setFormEstimatedMinutes(Number(e.target.value))}
                  min={10}
                  max={180}
                />
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="Tag de Versão"
                  value={formVersionTag}
                  onChange={(e) => setFormVersionTag(e.target.value)}
                  placeholder="v1.0"
                />
              </div>

              <div className="sm:col-span-2 flex flex-col justify-end">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                  Status da Série
                </label>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    formIsActive
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{formIsActive ? 'Ativa no App' : 'Inativa'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Descrição & Orientações Técnicas Gerais
              </label>
              <textarea
                rows={2}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Descreva a metodologia da série, volume de séries de trabalho, objetivo neuromuscular e intervalo..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Section 2: Prescribed Exercises Builder */}
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-emerald-500" />
                  Exercícios da Série ({formExercises.length})
                </h4>
                <p className="text-xs text-slate-500">
                  Adicione os exercícios na ordem exata de execução e ajuste cargas, repetições e notas.
                </p>
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsExercisePickerOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
                className="text-xs"
              >
                Adicionar Exercício da Biblioteca
              </Button>
            </div>

            {formExercises.length === 0 ? (
              <div className="p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3 bg-slate-50/50 dark:bg-dark-cardElevated/30">
                <Dumbbell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <div>
                  <h5 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Nenhum exercício adicionado a esta série
                  </h5>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Clique no botão acima para escolher os exercícios da biblioteca completa e montar a rotina.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsExercisePickerOpen(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Abrir Biblioteca de Exercícios
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {formExercises.map((item, index) => {
                  const ex = exercisesMap[item.exerciseId];
                  const imgSrc = ex?.imageUrl || `/exercises/frames/${ex?.id.replace('exercise-', '')}/frame-1.png`;

                  return (
                    <div
                      key={item.exerciseId}
                      className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* Reorder Buttons */}
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMoveExercise(index, 'up')}
                              className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                              title="Subir ordem"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={index === formExercises.length - 1}
                              onClick={() => handleMoveExercise(index, 'down')}
                              className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                              title="Descer ordem"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Exercise Thumbnail */}
                          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1 overflow-hidden shrink-0">
                            <img
                              src={getAssetUrl(imgSrc)}
                              alt={ex?.name || item.exerciseId}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                Ordem #{index + 1}
                              </span>
                              <Badge variant="neutral" size="sm">
                                {ex?.category || 'Geral'}
                              </Badge>
                            </div>
                            <h5 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                              {ex ? ex.name : item.exerciseId}
                            </h5>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveExerciseFromForm(item.exerciseId)}
                          className="self-end sm:self-auto p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Remover exercício da série"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Config Inputs: Sets, Reps, Weight, Rest */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 dark:border-dark-border/60">
                        <div>
                          <label className="text-[10px] text-slate-500 font-semibold block mb-1">
                            Séries
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={item.sets}
                            onChange={(e) =>
                              handleUpdateExerciseField(index, 'sets', Number(e.target.value))
                            }
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-dark-cardElevated border border-slate-200 dark:border-dark-border font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-semibold block mb-1">
                            Repetições
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={item.reps}
                            onChange={(e) =>
                              handleUpdateExerciseField(index, 'reps', Number(e.target.value))
                            }
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-dark-cardElevated border border-slate-200 dark:border-dark-border font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-semibold block mb-1">
                            Carga Sugerida (kg)
                          </label>
                          <input
                            type="number"
                            min={0}
                            step={0.5}
                            value={item.weight}
                            onChange={(e) =>
                              handleUpdateExerciseField(index, 'weight', Number(e.target.value))
                            }
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-dark-cardElevated border border-slate-200 dark:border-dark-border font-mono font-bold text-emerald-600 dark:text-emerald-400"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-semibold block mb-1">
                            Descanso (segundos)
                          </label>
                          <input
                            type="number"
                            min={15}
                            step={5}
                            value={item.restSeconds}
                            onChange={(e) =>
                              handleUpdateExerciseField(index, 'restSeconds', Number(e.target.value))
                            }
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-dark-cardElevated border border-slate-200 dark:border-dark-border font-mono"
                          />
                        </div>
                      </div>

                      {/* Technical Notes & Execution Tips */}
                      <div>
                        <label className="text-[10px] text-slate-500 font-semibold block mb-1">
                          Notas & Dicas de Execução para este Exercício
                        </label>
                        <input
                          type="text"
                          value={item.notes || ''}
                          onChange={(e) =>
                            handleUpdateExerciseField(index, 'notes', e.target.value)
                          }
                          placeholder="Ex: Cadência 2-0-2, manter escápulas travadas, foco na contração no pico..."
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-dark-cardElevated border border-slate-200 dark:border-dark-border text-slate-800 dark:text-slate-200"
                        />
                      </div>

                      {/* Flexibility Permissions Checkboxes */}
                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.allowWeightChange !== false}
                            onChange={(e) =>
                              handleUpdateExerciseField(index, 'allowWeightChange', e.target.checked)
                            }
                            className="rounded-xs accent-emerald-500"
                          />
                          <span>Aluno pode alterar carga</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.allowSubstitution !== false}
                            onChange={(e) =>
                              handleUpdateExerciseField(index, 'allowSubstitution', e.target.checked)
                            }
                            className="rounded-xs accent-emerald-500"
                          />
                          <span>Permitir substituição</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.allowSkip !== false}
                            onChange={(e) =>
                              handleUpdateExerciseField(index, 'allowSkip', e.target.checked)
                            }
                            className="rounded-xs accent-emerald-500"
                          />
                          <span>Permitir pular</span>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal Actions Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-dark-border/60">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Check className="w-4 h-4" />}
            >
              {editingTemplate ? 'Salvar Alterações da Série' : 'Criar Série Modelo'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL AUXILIAR: PICKER DE EXERCÍCIOS */}
      <Modal
        isOpen={isExercisePickerOpen}
        onClose={() => setIsExercisePickerOpen(false)}
        title="Selecionar Exercício da Biblioteca"
        description="Escolha exercícios para incluir na sua série pronta"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome ou músculo..."
                value={exercisePickerSearch}
                onChange={(e) => setExercisePickerSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                className="text-xs"
              />
            </div>
            <select
              value={exercisePickerCategory}
              onChange={(e) => setExercisePickerCategory(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-dark-cardElevated border border-slate-200 dark:border-dark-border text-slate-800 dark:text-white"
            >
              <option value="all">Todas as Categorias</option>
              <option value="Peito">Peito</option>
              <option value="Costas">Costas</option>
              <option value="Pernas">Pernas</option>
              <option value="Ombros">Ombros</option>
              <option value="Bíceps">Bíceps</option>
              <option value="Tríceps">Tríceps</option>
              <option value="Core">Core</option>
              <option value="Cardio">Cardio</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
            {filteredPickerExercises.map((ex) => {
              const isAlreadyAdded = formExercises.some((e) => e.exerciseId === ex.id);
              const imgSrc = ex.imageUrl || `/exercises/frames/${ex.id.replace('exercise-', '')}/frame-1.png`;

              return (
                <div
                  key={ex.id}
                  onClick={() => !isAlreadyAdded && handleAddExerciseToForm(ex)}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 text-left ${
                    isAlreadyAdded
                      ? 'bg-emerald-500/10 border-emerald-500/30 opacity-70 cursor-not-allowed'
                      : 'bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border hover:border-emerald-500 hover:shadow-sm cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      <img
                        src={getAssetUrl(imgSrc)}
                        alt={ex.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="truncate">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {ex.name}
                      </h5>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {ex.category} • {ex.equipment}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isAlreadyAdded ? (
                      <span className="text-[10px] font-mono text-emerald-500 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Adicionado
                      </span>
                    ) : (
                      <Button variant="secondary" size="sm" className="text-xs py-1 px-2.5">
                        <Plus className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-dark-border/60">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsExercisePickerOpen(false)}
            >
              Concluir Seleção
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: VERSIONAMENTO & CLONAGEM DE SÉRIE */}
      <Modal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        title="Gerar Nova Versão da Série"
        description="Crie uma nova versão incremental preservando a série anterior no histórico"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-900 text-white text-xs space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Série Base:
            </span>
            <span className="text-sm font-bold block text-emerald-400">
              {targetVersionTemplate?.name}
            </span>
            <span className="text-slate-400 font-mono text-[11px] block">
              Versão atual: {targetVersionTemplate?.versionTag || `v${targetVersionTemplate?.version || 1}.0`} • {targetVersionTemplate?.exercises.length} exercícios
            </span>
          </div>

          <div>
            <Input
              label="Nome da Nova Versão *"
              value={versionNewName}
              onChange={(e) => setVersionNewName(e.target.value)}
              placeholder="Ex: Série A (v2.0 - Ênfase em Cargas)"
            />
          </div>

          <div>
            <Input
              label="Tag da Versão *"
              value={versionNewTag}
              onChange={(e) => setVersionNewTag(e.target.value)}
              placeholder="Ex: v2.0"
            />
          </div>

          <label className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={versionArchivePrevious}
              onChange={(e) => setVersionArchivePrevious(e.target.checked)}
              className="mt-0.5 rounded-xs accent-emerald-500"
            />
            <div>
              <span className="font-semibold block">
                Arquivar a versão anterior como inativa
              </span>
              <span className="text-[11px] text-slate-500 block">
                Garante que novos treinos usem apenas a versão mais recente, preservando o histórico da versão anterior intacto.
              </span>
            </div>
          </label>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-dark-border/60">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsVersionModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmVersion}
              leftIcon={<GitFork className="w-3.5 h-3.5" />}
            >
              Gerar Versão
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: CONFIRMAR EXCLUSÃO */}
      <Modal
        isOpen={!!templateToDelete}
        onClose={() => setTemplateToDelete(null)}
        title="Excluir Série Pronta?"
        description="Esta ação removerá o modelo de série permanentemente da sua biblioteca."
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Tem certeza de que deseja excluir a série{' '}
            <strong>"{templateToDelete?.name}"</strong>?
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-dark-border/60">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setTemplateToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
