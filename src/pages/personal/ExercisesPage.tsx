import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Library,
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  Dumbbell,
  Check,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  Image as ImageIcon,
  Info,
  Film,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ExerciseFramePlayer } from '../../components/ui/ExerciseFramePlayer';
import { exerciseRepository } from '../../repositories/exerciseRepository';
import { useToast } from '../../context/ToastContext';
import { Exercise, ExerciseCategory, ExerciseType } from '../../types';

// Accent-agnostic normalization helper
const normalizeText = (text: string): string => {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

export const ExercisesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error: toastError } = useToast();

  // Read URL search params
  const currentPage = Math.max(1, Number(searchParams.get('page')) || 1);
  const currentLimit = Math.max(1, Number(searchParams.get('limit')) || 9);
  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || 'all';
  const currentType = searchParams.get('type') || 'all';
  const currentDifficulty = searchParams.get('difficulty') || 'all';

  // Search input local state for smooth typing without losing focus or dropping keystrokes
  const [searchInput, setSearchInput] = useState(currentSearch);

  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  // Modal View Image Detail
  const [viewImageModal, setViewImageModal] = useState<Exercise | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExerciseCategory>('Peito');
  const [type, setType] = useState<ExerciseType>('máquina');
  const [muscleGroupsStr, setMuscleGroupsStr] = useState('');
  const [equipment, setEquipment] = useState('');
  const [difficulty, setDifficulty] = useState<'iniciante' | 'intermediário' | 'avançado'>('iniciante');
  const [instructions, setInstructions] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedAlternatives, setSelectedAlternatives] = useState<string[]>([]);

  // Load all exercises once
  const loadExercises = async () => {
    setLoading(true);
    const data = await exerciseRepository.getAll();
    setAllExercises(data);
    setLoading(false);
  };

  useEffect(() => {
    loadExercises();
  }, []);

  // Helper to update URL search params
  const updateParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '' || (key !== 'page' && val === 'all')) {
        newParams.delete(key);
      } else {
        newParams.set(key, val);
      }
    });
    setSearchParams(newParams);
  };

  // Ensure ?page=1 is synced in the URL if missing
  useEffect(() => {
    if (!searchParams.get('page')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', '1');
      setSearchParams(newParams, { replace: true });
    }
  }, []);

  // Synchronize local search input if URL changes externally (e.g. browser back/forward or clear)
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Debounced search sync to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== currentSearch) {
        updateParams({
          search: searchInput.trim() ? searchInput.trim() : null,
          page: '1', // Reset to page 1 on new search
        });
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Accent-insensitive and multi-field filter
  const filteredExercises = useMemo(() => {
    const q = normalizeText(currentSearch);
    const normCategory = normalizeText(currentCategory);
    const normType = normalizeText(currentType);
    const normDifficulty = normalizeText(currentDifficulty);

    return allExercises.filter((ex) => {
      // Search across name, category, equipment, type, muscles, difficulty, instructions
      if (q) {
        const matchesName = normalizeText(ex.name).includes(q);
        const matchesCategory = normalizeText(ex.category).includes(q);
        const matchesEquip = normalizeText(ex.equipment).includes(q);
        const matchesType = normalizeText(ex.type).includes(q);
        const matchesMuscles = ex.muscleGroups.some((m) => normalizeText(m).includes(q));
        const matchesDifficulty = normalizeText(ex.difficulty).includes(q);
        const matchesInstructions = normalizeText(ex.instructions).includes(q);

        if (
          !matchesName &&
          !matchesCategory &&
          !matchesEquip &&
          !matchesType &&
          !matchesMuscles &&
          !matchesDifficulty &&
          !matchesInstructions
        ) {
          return false;
        }
      }

      // Category filter
      if (normCategory !== 'all' && normalizeText(ex.category) !== normCategory) {
        return false;
      }

      // Type filter
      if (normType !== 'all' && normalizeText(ex.type) !== normType) {
        return false;
      }

      // Difficulty filter
      if (normDifficulty !== 'all' && normalizeText(ex.difficulty) !== normDifficulty) {
        return false;
      }

      return true;
    });
  }, [allExercises, currentSearch, currentCategory, currentType, currentDifficulty]);

  // Paginate
  const totalItems = filteredExercises.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / currentLimit));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  // If URL page is greater than totalPages, adjust it
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      updateParams({ page: String(totalPages) });
    }
  }, [totalPages, currentPage]);

  const paginatedExercises = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * currentLimit;
    return filteredExercises.slice(startIndex, startIndex + currentLimit);
  }, [filteredExercises, validCurrentPage, currentLimit]);

  const handlePageChange = (newPage: number) => {
    const p = Math.max(1, Math.min(newPage, totalPages));
    updateParams({ page: String(p) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (key: string, value: string) => {
    updateParams({
      [key]: value,
      page: '1', // always reset to page 1 on filter change
    });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    updateParams({ search: null, page: '1' });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    const newParams = new URLSearchParams();
    newParams.set('page', '1');
    if (currentLimit !== 9) newParams.set('limit', String(currentLimit));
    setSearchParams(newParams);
  };

  const hasActiveFilters =
    currentSearch !== '' ||
    currentCategory !== 'all' ||
    currentType !== 'all' ||
    currentDifficulty !== 'all';

  // Modal handlers
  const handleOpenCreate = () => {
    setEditingExercise(null);
    setName('');
    setCategory('Peito');
    setType('máquina');
    setMuscleGroupsStr('');
    setEquipment('');
    setDifficulty('iniciante');
    setInstructions('');
    setImageUrl('/exercises/exercise-peito-01.png');
    setSelectedAlternatives([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ex: Exercise) => {
    setEditingExercise(ex);
    setName(ex.name);
    setCategory(ex.category);
    setType(ex.type);
    setMuscleGroupsStr(ex.muscleGroups.join(', '));
    setEquipment(ex.equipment);
    setDifficulty(ex.difficulty);
    setInstructions(ex.instructions);
    setImageUrl(ex.imageUrl || '');
    setSelectedAlternatives(ex.alternatives || []);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toastError('Informe o nome do exercício.');
      return;
    }

    const muscleGroups = muscleGroupsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (editingExercise) {
        await exerciseRepository.update(editingExercise.id, {
          name,
          category,
          type,
          muscleGroups,
          equipment,
          difficulty,
          instructions,
          imageUrl: imageUrl.trim() || undefined,
          alternatives: selectedAlternatives,
        });
        success('Exercício atualizado com sucesso!');
      } else {
        await exerciseRepository.create({
          name,
          category,
          type,
          muscleGroups: muscleGroups.length > 0 ? muscleGroups : [category],
          equipment: equipment || 'Geral',
          difficulty,
          instructions,
          imageUrl: imageUrl.trim() || '/exercises/exercise-peito-01.png',
          alternatives: selectedAlternatives,
        });
        success('Novo exercício adicionado à biblioteca!');
      }
      setIsModalOpen(false);
      loadExercises();
    } catch (err) {
      toastError('Erro ao salvar exercício.');
    }
  };

  const toggleAlternative = (altId: string) => {
    setSelectedAlternatives((prev) =>
      prev.includes(altId) ? prev.filter((id) => id !== altId) : [...prev, altId]
    );
  };

  const categoryOptions = [
    { value: 'all', label: 'Todas as Categorias' },
    { value: 'Peito', label: 'Peito' },
    { value: 'Costas', label: 'Costas' },
    { value: 'Pernas', label: 'Pernas' },
    { value: 'Ombros', label: 'Ombros' },
    { value: 'Bíceps', label: 'Bíceps' },
    { value: 'Tríceps', label: 'Tríceps' },
    { value: 'Core', label: 'Core / Abdômen' },
  ];

  const typeOptions = [
    { value: 'all', label: 'Todos os Tipos' },
    { value: 'máquina', label: 'Máquina' },
    { value: 'halteres', label: 'Halteres' },
    { value: 'barra', label: 'Barra' },
    { value: 'cabo', label: 'Cabo / Polia' },
    { value: 'peso corporal', label: 'Peso Corporal' },
    { value: 'livre', label: 'Livre' },
  ];

  const difficultyOptions = [
    { value: 'all', label: 'Todas as Dificuldades' },
    { value: 'iniciante', label: 'Iniciante' },
    { value: 'intermediário', label: 'Intermediário' },
    { value: 'avançado', label: 'Avançado' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Library className="w-7 h-7 text-emerald-500" />
            Biblioteca de Exercícios
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted mt-0.5">
            {allExercises.length} exercícios com fotos cartoon padronizadas e domínio público
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Novo Exercício
          </Button>
        </div>
      </div>

      {/* Reference Banner for future exercises */}
      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
          <div>
            <strong className="block font-bold">Ilustrações Cartoon Padronizadas (Open-Source):</strong>
            Todos os exercícios utilizam ilustrações vetoriais no mesmo estilo cartoon/monocromático de alta resolução (base Everkinetic / Workout Guide, Licença Livre CC-BY-SA 4.0).
          </div>
        </div>
        <a
          href="https://bryllim.github.io/workout-guide/"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <span>Guia Visual (300+ Ilustrações)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Main Filters Bar (Synced with URL) */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input with Instant Responsiveness & Accent Agnostic Search */}
          <div className="relative">
            <Input
              placeholder="Buscar por nome, equipamento, músculo..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              rightIcon={
                searchInput ? (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    title="Limpar busca"
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-200/60 dark:hover:bg-dark-cardElevated transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : undefined
              }
            />
          </div>

          <Select
            value={currentCategory}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            options={categoryOptions}
          />

          <Select
            value={currentType}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            options={typeOptions}
          />

          <Select
            value={currentDifficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            options={difficultyOptions}
          />
        </div>

        {/* Active Filters Summary, URL Indicators & Quick Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-dark-border/40">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-dark-muted">
              Encontrados <strong className="text-slate-900 dark:text-white">{totalItems}</strong> de {allExercises.length} exercícios
            </span>

            {/* Individual filter badges */}
            {currentSearch && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-lg text-[11px] border border-emerald-200 dark:border-emerald-800/50">
                Busca: "{currentSearch}"
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="hover:text-rose-500 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {currentCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-lg text-[11px] border border-blue-200 dark:border-blue-800/50">
                Categoria: {currentCategory}
                <button
                  type="button"
                  onClick={() => handleFilterChange('category', 'all')}
                  className="hover:text-rose-500 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {currentType !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold px-2 py-0.5 rounded-lg text-[11px] border border-purple-200 dark:border-purple-800/50">
                Tipo: {currentType}
                <button
                  type="button"
                  onClick={() => handleFilterChange('type', 'all')}
                  className="hover:text-rose-500 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {currentDifficulty !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold px-2 py-0.5 rounded-lg text-[11px] border border-amber-200 dark:border-amber-800/50">
                Dificuldade: {currentDifficulty}
                <button
                  type="button"
                  onClick={() => handleFilterChange('difficulty', 'all')}
                  className="hover:text-rose-500 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 py-1 h-8"
              >
                Limpar Filtros
              </Button>
            )}

            {/* Items per page selector */}
            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 dark:text-dark-muted">
              <span>Por página:</span>
              {[6, 9, 12, 18].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    updateParams({ limit: String(size), page: '1' });
                  }}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all ${
                    currentLimit === size
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Exercises Grid */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : paginatedExercises.length === 0 ? (
        <Card className="py-12 text-center space-y-3">
          <Dumbbell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <div>
            <p className="text-base font-bold text-slate-800 dark:text-slate-200">
              Nenhum exercício encontrado
            </p>
            <p className="text-xs text-slate-500 dark:text-dark-muted mt-1 max-w-md mx-auto">
              Nenhum resultado corresponde aos filtros selecionados na URL. Experimente buscar sem acentos ou limpar os filtros.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleClearFilters} className="mt-2">
            Limpar Filtros e Ver Todos ({allExercises.length})
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedExercises.map((ex) => (
            <Card
              key={ex.id}
              className="overflow-hidden p-0 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 group bg-white dark:bg-dark-card"
            >
              <div>
                {/* Exercise Cartoon Illustration Container & Mini Video Player */}
                <div className="relative border-b border-slate-100 dark:border-dark-border/40">
                  <ExerciseFramePlayer
                    compact
                    frames={ex.videoFrames}
                    fallbackImage={ex.imageUrl}
                    title={ex.name}
                    className="h-48 sm:h-52 w-full"
                  />

                  {/* Top-right badges: Difficulty on top, Category directly below */}
                  <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1.5 pointer-events-none z-10">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-800/80 text-white backdrop-blur-md uppercase tracking-wider border border-white/10 shadow-xs">
                      {ex.difficulty}
                    </span>
                    <Badge variant="brand" size="sm" className="shadow-xs backdrop-blur-md">
                      {ex.category}
                    </Badge>
                  </div>

                </div>

                {/* Content Details */}
                <div className="p-4 space-y-2.5">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                      {ex.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-dark-muted font-medium mt-0.5">
                      {ex.equipment} • {ex.type}
                    </p>
                  </div>

                  {/* Muscles */}
                  <div className="flex flex-wrap gap-1">
                    {ex.muscleGroups.map((m) => (
                      <span
                        key={m}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-dark-cardElevated text-slate-700 dark:text-slate-300"
                      >
                        {m}
                      </span>
                    ))}
                  </div>

                  {/* Instructions */}
                  <p className="text-xs text-slate-600 dark:text-dark-muted line-clamp-2 leading-relaxed">
                    {ex.instructions}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 pt-0 border-t border-slate-100 dark:border-dark-border/60 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  {ex.alternatives.length} alternativa{ex.alternatives.length !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewImageModal(ex)}
                    leftIcon={<Film className="w-3.5 h-3.5 text-emerald-500" />}
                    className="text-xs text-emerald-600 dark:text-emerald-400"
                  >
                    Ver Vídeo
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(ex)}
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                    className="text-xs"
                  >
                    Editar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* URL-based Pagination Controls (Section: Paginação na URL) */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-500 dark:text-dark-muted text-center sm:text-left">
          Exibindo{' '}
          <strong className="text-slate-900 dark:text-white">
            {totalItems > 0 ? (validCurrentPage - 1) * currentLimit + 1 : 0}
          </strong>{' '}
          a{' '}
          <strong className="text-slate-900 dark:text-white">
            {Math.min(validCurrentPage * currentLimit, totalItems)}
          </strong>{' '}
          de <strong className="text-slate-900 dark:text-white">{totalItems}</strong> exercícios
          {totalPages > 1 && (
            <span className="ml-1 text-slate-400">
              (Página {validCurrentPage} de {totalPages})
            </span>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            {/* First Page */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={validCurrentPage <= 1}
              className="px-2"
              title="Primeira Página"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>

            {/* Previous Page */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(validCurrentPage - 1)}
              disabled={validCurrentPage <= 1}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Anterior
            </Button>

            {/* Direct Page Numbers */}
            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                // Show at most 5 page buttons around current page
                if (totalPages > 7) {
                  if (
                    p !== 1 &&
                    p !== totalPages &&
                    Math.abs(p - validCurrentPage) > 1
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
                    onClick={() => handlePageChange(p)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                      validCurrentPage === p
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
              onClick={() => handlePageChange(validCurrentPage + 1)}
              disabled={validCurrentPage >= totalPages}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Próxima
            </Button>

            {/* Last Page */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={validCurrentPage >= totalPages}
              className="px-2"
              title="Última Página"
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </Card>

      {/* Modal: View Expanded Image */}
      {viewImageModal && (
        <Modal
          isOpen={!!viewImageModal}
          onClose={() => setViewImageModal(null)}
          title={viewImageModal.name}
          description={`${viewImageModal.category} • ${viewImageModal.equipment} • Mini Vídeo Animado (Workout Guide)`}
          size="lg"
        >
          <div className="space-y-4">
            <ExerciseFramePlayer
              frames={viewImageModal.videoFrames}
              fallbackImage={viewImageModal.imageUrl}
              title={viewImageModal.name}
              autoPlay={true}
              className="w-full"
            />
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-900 dark:text-white block">
                Instruções de Postura & Execução:
              </span>
              <p className="text-slate-600 dark:text-dark-muted leading-relaxed">
                {viewImageModal.instructions}
              </p>
            </div>
            <div className="text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-100 dark:border-dark-border/60 truncate">
              URL da imagem: {viewImageModal.imageUrl}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Create / Edit Exercise */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExercise ? 'Editar Exercício' : 'Novo Exercício'}
        description="Configure nome, categoria, imagem demonstrativa e alternativas autorizadas"
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Nome do Exercício *"
            placeholder="Ex: Supino Máquina Articulada"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Categoria"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              options={[
                { value: 'Peito', label: 'Peito' },
                { value: 'Costas', label: 'Costas' },
                { value: 'Pernas', label: 'Pernas' },
                { value: 'Ombros', label: 'Ombros' },
                { value: 'Bíceps', label: 'Bíceps' },
                { value: 'Tríceps', label: 'Tríceps' },
                { value: 'Core', label: 'Core / Abdômen' },
              ]}
            />
            <Select
              label="Tipo de Execução"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              options={[
                { value: 'máquina', label: 'Máquina' },
                { value: 'halteres', label: 'Halteres' },
                { value: 'barra', label: 'Barra' },
                { value: 'cabo', label: 'Cabo / Polia' },
                { value: 'peso corporal', label: 'Peso Corporal' },
                { value: 'livre', label: 'Livre' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Equipamento"
              placeholder="Ex: Máquina Articulada, Banco Reto..."
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
            />
            <Select
              label="Dificuldade"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              options={[
                { value: 'iniciante', label: 'Iniciante' },
                { value: 'intermediário', label: 'Intermediário' },
                { value: 'avançado', label: 'Avançado' },
              ]}
            />
          </div>

          <Input
            label="URL da Imagem Demonstrativa (Public Domain / Unsplash)"
            placeholder="https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/.../0.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            helperText="Dica: Utilize o catálogo https://yuhonas.github.io/free-exercise-db/ para encontrar novas fotos padronizadas."
          />

          <Input
            label="Grupos Musculares (separados por vírgula)"
            placeholder="Ex: Peitoral Maior, Tríceps, Deltoide Anterior"
            value={muscleGroupsStr}
            onChange={(e) => setMuscleGroupsStr(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Instruções de Execução Técnica
            </label>
            <textarea
              rows={3}
              placeholder="Descreva postura, posicionamento das escápulas, pegada e cadência..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full bg-slate-50 dark:bg-dark-cardElevated/80 border border-slate-200 dark:border-dark-border rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Alternatives picker */}
          <div className="pt-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Exercícios Alternativos Autorizados
            </label>
            <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-dark-border rounded-xl p-2 space-y-1">
              {allExercises
                .filter((ex) => !editingExercise || ex.id !== editingExercise.id)
                .map((ex) => {
                  const isChecked = selectedAlternatives.includes(ex.id);
                  return (
                    <div
                      key={ex.id}
                      onClick={() => toggleAlternative(ex.id)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                        isChecked
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-dark-cardElevated text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>
                        {ex.name} ({ex.category})
                      </span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Salvar Exercício
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
