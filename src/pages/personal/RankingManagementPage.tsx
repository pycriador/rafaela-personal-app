import React, { useEffect, useState, useMemo } from 'react';
import {
  Trophy,
  Users,
  Plus,
  Calendar,
  Flame,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Check,
  Trash2,
  Edit,
  Sparkles,
  AlertTriangle,
  Power,
  Search,
  Eye,
  X,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { rankingRepository } from '../../repositories/rankingRepository';
import { studentRepository } from '../../repositories/studentRepository';
import { RankingGroup, StudentLeaderboardEntry, Student } from '../../types';

export const RankingManagementPage: React.FC = () => {
  const { success, warning, error: toastError } = useToast();

  const [groups, setGroups] = useState<RankingGroup[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<RankingGroup | null>(null);
  const [leaderboard, setLeaderboard] = useState<StudentLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Pagination & Filtering for Groups List (Bottom section)
  const [groupSearch, setGroupSearch] = useState('');
  const [groupStatusFilter, setGroupStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [groupPage, setGroupPage] = useState(1);
  const groupsPerPage = 4;

  // Modal Create / Edit Group
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupStartDate, setGroupStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [groupEndDate, setGroupEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [groupReward, setGroupReward] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Modal Delete Confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<RankingGroup | null>(null);

  const loadData = async () => {
    try {
      const [allGroups, allStudents] = await Promise.all([
        rankingRepository.getGroups(),
        studentRepository.getAll(),
      ]);
      setGroups(allGroups);
      setStudents(allStudents);
      if (allGroups.length > 0) {
        // Keep current selected group if still existing, else fallback to first
        const currentId = selectedGroup?.id;
        const stillExists = currentId ? allGroups.find((g) => g.id === currentId) : null;
        const target = stillExists || allGroups[0];
        setSelectedGroup(target);
        loadLeaderboard(target.id);
      } else {
        setSelectedGroup(null);
        setLeaderboard([]);
      }
    } catch (err) {
      console.error('Erro ao carregar grupos de ranking:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async (groupId: string) => {
    setLoadingLeaderboard(true);
    try {
      const board = await rankingRepository.getGroupLeaderboard(groupId);
      setLeaderboard(board);
    } catch (err) {
      console.error('Erro ao carregar classificação:', err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectGroup = (g: RankingGroup) => {
    setSelectedGroup(g);
    loadLeaderboard(g.id);
  };

  // Toggle group active / inactive
  const handleToggleGroupActive = async (group: RankingGroup, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const updated: RankingGroup = {
        ...group,
        active: !group.active,
      };
      await rankingRepository.updateGroup(updated);
      setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      if (selectedGroup?.id === group.id) {
        setSelectedGroup(updated);
      }
      success(
        updated.active
          ? `Grupo "${updated.name}" ativado com sucesso!`
          : `Grupo "${updated.name}" pausado/desativado.`
      );
    } catch {
      toastError('Erro ao alterar status do grupo.');
    }
  };

  // Delete group flow with Modal Confirmation
  const handlePromptDelete = (group: RankingGroup, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setGroupToDelete(group);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!groupToDelete) return;
    try {
      await rankingRepository.deleteGroup(groupToDelete.id);
      success(`Grupo "${groupToDelete.name}" excluído com sucesso.`);
      setDeleteModalOpen(false);
      setGroupToDelete(null);

      const remaining = groups.filter((g) => g.id !== groupToDelete.id);
      setGroups(remaining);
      if (selectedGroup?.id === groupToDelete.id) {
        if (remaining.length > 0) {
          setSelectedGroup(remaining[0]);
          loadLeaderboard(remaining[0].id);
        } else {
          setSelectedGroup(null);
          setLeaderboard([]);
        }
      }
    } catch {
      toastError('Erro ao excluir grupo.');
    }
  };

  const handleOpenCreateModal = () => {
    setEditingGroupId(null);
    setGroupName('');
    setGroupDesc('');
    setGroupStartDate(new Date().toISOString().split('T')[0]);
    setGroupEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setGroupReward('');
    setSelectedStudentIds(students.filter((s) => s.status === 'Ativo').map((s) => s.id));
    setModalOpen(true);
  };

  const handleOpenEditModal = (g: RankingGroup, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingGroupId(g.id);
    setGroupName(g.name);
    setGroupDesc(g.description);
    setGroupStartDate(g.startDate);
    setGroupEndDate(g.endDate);
    setGroupReward(g.reward || '');
    setSelectedStudentIds([...g.studentIds]);
    setModalOpen(true);
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      warning('Informe o nome do grupo.');
      return;
    }
    if (selectedStudentIds.length === 0) {
      warning('Selecione pelo menos um aluno para o grupo.');
      return;
    }

    try {
      if (editingGroupId) {
        const existing = groups.find((g) => g.id === editingGroupId);
        if (existing) {
          const updated: RankingGroup = {
            ...existing,
            name: groupName.trim(),
            description: groupDesc.trim(),
            startDate: groupStartDate,
            endDate: groupEndDate,
            reward: groupReward.trim() || undefined,
            studentIds: selectedStudentIds,
          };
          await rankingRepository.updateGroup(updated);
          success('Grupo atualizado com sucesso!');
        }
      } else {
        const created = await rankingRepository.createGroup({
          name: groupName.trim(),
          description: groupDesc.trim(),
          startDate: groupStartDate,
          endDate: groupEndDate,
          reward: groupReward.trim() || undefined,
          studentIds: selectedStudentIds,
          active: true,
        });
        success('Grupo de desafio criado com sucesso!');
        setSelectedGroup(created);
        loadLeaderboard(created.id);
      }

      setModalOpen(false);
      await loadData();
    } catch {
      toastError('Erro ao salvar grupo de ranking.');
    }
  };

  const toggleStudentSelection = (stId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(stId) ? prev.filter((id) => id !== stId) : [...prev, stId]
    );
  };

  // Filtered & Paginated Groups
  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      if (groupSearch.trim()) {
        const q = groupSearch.toLowerCase();
        if (!g.name.toLowerCase().includes(q) && !g.description.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (groupStatusFilter === 'active' && !g.active) return false;
      if (groupStatusFilter === 'inactive' && g.active) return false;
      return true;
    });
  }, [groups, groupSearch, groupStatusFilter]);

  const totalGroupPages = Math.max(1, Math.ceil(filteredGroups.length / groupsPerPage));
  const safeGroupPage = Math.min(groupPage, totalGroupPages);
  const paginatedGroups = useMemo(() => {
    const start = (safeGroupPage - 1) * groupsPerPage;
    return filteredGroups.slice(start, start + groupsPerPage);
  }, [filteredGroups, safeGroupPage, groupsPerPage]);

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-white/[0.08] shadow-xs rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="brand" size="sm">Gamificação & Consistência</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            Grupos de Desafio & Ranking
          </h1>
          <p className="text-sm text-slate-500 dark:text-dark-muted mt-1 font-normal">
            Acompanhe o pódio e a pontuação dos alunos em tempo real. Gerencie os grupos de desafio logo abaixo.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Novo Grupo de Desafio
        </Button>
      </div>

      {/* TOP SECTION: RANKING & PÓDIO DO GRUPO SELECIONADO */}
      <Card className="p-6 space-y-6">
        {/* Selector Bar of Groups for Instant Auditing */}
        <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Selecione o Grupo para Visualizar no Ranking:
              </span>
              <p className="text-xs text-slate-500 dark:text-dark-muted">
                Alterne dinamicamente entre os desafios cadastrados
              </p>
            </div>
            {selectedGroup && (
              <Badge variant={selectedGroup.active ? 'success' : 'warning'} size="sm">
                {selectedGroup.active ? 'Grupo Ativo' : 'Grupo Pausado / Inativo'}
              </Badge>
            )}
          </div>

          {/* Dynamic Tabs Ribbon */}
          {groups.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] text-center text-xs text-slate-400">
              Nenhum grupo de desafio cadastrado ainda. Clique em &ldquo;Novo Grupo de Desafio&rdquo; para iniciar.
            </div>
          ) : (
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5">
              {groups.map((g) => {
                const isSelected = selectedGroup?.id === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleSelectGroup(g)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs font-bold'
                        : 'bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{g.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? 'bg-black/20 text-white dark:bg-black/10 dark:text-slate-900'
                          : 'bg-slate-200 dark:bg-white/[0.08] text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {g.studentIds.length} alunos
                    </span>
                    {!g.active && (
                      <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-500 dark:text-amber-400 font-bold">
                        Pausado
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selectedGroup ? (
          <div className="space-y-6">
            {/* Selected Group Details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedGroup.name}
                  </h2>
                  <Badge variant="brand" size="sm">
                    {selectedGroup.studentIds.length} Alunos Inscritos
                  </Badge>
                  <Badge variant={selectedGroup.active ? 'success' : 'neutral'} size="sm">
                    {selectedGroup.active ? 'Competição Ativa' : 'Desativado'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-dark-muted mt-1 max-w-2xl">
                  {selectedGroup.description || 'Sem descrição cadastrada.'}
                </p>
                {selectedGroup.reward && (
                  <div className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-200/60 dark:border-amber-500/20 w-fit">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      Premiação:{' '}
                      <strong className="text-amber-800 dark:text-amber-300">{selectedGroup.reward}</strong>
                    </span>
                  </div>
                )}
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-[11px] text-slate-400 block font-mono">Período de Validade</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  {new Date(selectedGroup.startDate).toLocaleDateString()} até{' '}
                  {new Date(selectedGroup.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Podium Visual (Top 3) */}
            {leaderboard.length >= 3 && (
              <div className="grid grid-cols-3 gap-3 items-end pt-2 pb-3">
                {/* 2nd Place */}
                <div className="text-center p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-dark-cardElevated border border-slate-200/70 dark:border-white/[0.08] flex flex-col items-center">
                  <span className="text-2xl mb-1">🥈</span>
                  <img
                    src={leaderboard[1].avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={leaderboard[1].studentName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-300 dark:ring-slate-600 mb-1.5"
                  />
                  <strong className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-full">
                    {leaderboard[1].studentName}
                  </strong>
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                    {leaderboard[1].score} pts
                  </span>
                  <span className="text-[10px] text-slate-400">2º Lugar</span>
                </div>

                {/* 1st Place (Winner) */}
                <div className="text-center p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-amber-500/10 to-amber-500/5 border-2 border-amber-400/60 dark:border-amber-500/40 shadow-xs flex flex-col items-center scale-105">
                  <span className="text-3xl mb-1">👑</span>
                  <img
                    src={leaderboard[0].avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={leaderboard[0].studentName}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-amber-400 mb-1.5 shadow-sm"
                  />
                  <strong className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-full">
                    {leaderboard[0].studentName}
                  </strong>
                  <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-black mt-0.5">
                    {leaderboard[0].score} pts
                  </span>
                  <Badge variant="warning" size="sm" className="mt-1">
                    1º Lugar
                  </Badge>
                </div>

                {/* 3rd Place */}
                <div className="text-center p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-dark-cardElevated border border-slate-200/70 dark:border-white/[0.08] flex flex-col items-center">
                  <span className="text-2xl mb-1">🥉</span>
                  <img
                    src={leaderboard[2].avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={leaderboard[2].studentName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-700/40 dark:ring-amber-700/60 mb-1.5"
                  />
                  <strong className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-full">
                    {leaderboard[2].studentName}
                  </strong>
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                    {leaderboard[2].score} pts
                  </span>
                  <span className="text-[10px] text-slate-400">3º Lugar</span>
                </div>
              </div>
            )}

            {/* Full Leaderboard Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-dark-muted">
                Classificação Geral dos Alunos no Grupo ({leaderboard.length})
              </h3>

              {loadingLeaderboard ? (
                <div className="py-8 flex justify-center">
                  <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                </div>
              ) : leaderboard.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-white/[0.06] border border-slate-200/70 dark:border-white/[0.08] rounded-xl overflow-hidden">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.studentId}
                      className="p-3.5 flex items-center justify-between gap-3 bg-white dark:bg-dark-card hover:bg-slate-50/80 dark:hover:bg-dark-cardElevated/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold font-mono text-xs shrink-0 ${
                            entry.rank === 1
                              ? 'bg-amber-400 text-slate-950 font-black'
                              : entry.rank === 2
                              ? 'bg-slate-300 text-slate-900'
                              : entry.rank === 3
                              ? 'bg-amber-700 text-white'
                              : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {entry.rank}
                        </span>

                        <img
                          src={entry.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={entry.studentName}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/[0.08] shrink-0"
                        />

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {entry.studentName}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                            <span>{entry.workoutsCompleted} treinos feitos</span>
                            <span>•</span>
                            <span>{entry.adherencePercentage}% adesão</span>
                            <span>•</span>
                            <span className="text-amber-500 flex items-center gap-0.5">
                              <Flame className="w-3 h-3 fill-amber-500" />
                              {entry.currentStreak} dias sem falhar
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-black font-mono text-slate-900 dark:text-white">
                          {entry.score}
                        </span>
                        <span className="text-[10px] text-slate-400 block">pontos</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Nenhum aluno registrado neste grupo.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            Nenhum grupo de desafio selecionado.
          </div>
        )}
      </Card>

      {/* BOTTOM SECTION: GESTÃO DOS GRUPOS CRIADOS COM PAGINAÇÃO */}
      <Card className="p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              <span>Grupos de Desafio Cadastrados ({filteredGroups.length})</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
              Clique em um grupo para carregá-lo no ranking acima. Ative, pause, edite ou exclua conforme necessário.
            </p>
          </div>

          {/* Quick Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="w-full sm:w-60">
              <Input
                placeholder="Buscar grupo..."
                value={groupSearch}
                onChange={(e) => {
                  setGroupSearch(e.target.value);
                  setGroupPage(1);
                }}
                leftIcon={<Search className="w-3.5 h-3.5" />}
                rightIcon={
                  groupSearch ? (
                    <button
                      type="button"
                      onClick={() => {
                        setGroupSearch('');
                        setGroupPage(1);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  ) : undefined
                }
                className="h-9 text-xs"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.05] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setGroupStatusFilter('all');
                  setGroupPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  groupStatusFilter === 'all'
                    ? 'bg-white dark:bg-dark-card text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => {
                  setGroupStatusFilter('active');
                  setGroupPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  groupStatusFilter === 'active'
                    ? 'bg-white dark:bg-dark-card text-emerald-600 dark:text-emerald-400 shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Ativos
              </button>
              <button
                type="button"
                onClick={() => {
                  setGroupStatusFilter('inactive');
                  setGroupPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  groupStatusFilter === 'inactive'
                    ? 'bg-white dark:bg-dark-card text-amber-600 dark:text-amber-400 shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Inativos
              </button>
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        {paginatedGroups.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Nenhum grupo encontrado com os filtros atuais.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedGroups.map((group) => {
              const isSelected = selectedGroup?.id === group.id;
              return (
                <div
                  key={group.id}
                  onClick={() => handleSelectGroup(group)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 group/card ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05]'
                      : 'border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-dark-card hover:border-slate-300 dark:hover:border-white/[0.16]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          <Trophy className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {group.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-dark-muted flex items-center gap-1.5">
                            <Users className="w-3 h-3 text-slate-400" />
                            <span>{group.studentIds.length} alunos inscritos</span>
                          </p>
                        </div>
                      </div>

                      {/* Header Badges */}
                      <div className="flex items-center gap-1 shrink-0">
                        {isSelected && (
                          <Badge variant="brand" size="sm">
                            Em Exibição
                          </Badge>
                        )}
                        <Badge variant={group.active ? 'success' : 'neutral'} size="sm">
                          {group.active ? 'Ativo' : 'Pausado'}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-dark-muted line-clamp-2">
                      {group.description || 'Sem descrição.'}
                    </p>

                    {group.reward && (
                      <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-500/20 w-fit truncate">
                        <Sparkles className="w-3 h-3 shrink-0" />
                        <span className="truncate">Prêmio: {group.reward}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Period & Controls */}
                  <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(group.startDate).toLocaleDateString()} a{' '}
                      {new Date(group.endDate).toLocaleDateString()}
                    </span>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      {/* Select in Ranking Button */}
                      {!isSelected && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectGroup(group);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-500/20 text-slate-700 dark:text-slate-300 font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                          title="Carregar este grupo no ranking acima"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Auditar</span>
                        </button>
                      )}

                      {/* Activate / Deactivate Toggle Button */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleGroupActive(group, e)}
                        className={`px-2.5 py-1 rounded-lg font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer ${
                          group.active
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                            : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                        }`}
                        title={group.active ? 'Pausar/Desativar grupo' : 'Ativar grupo de desafio'}
                      >
                        <Power className="w-3 h-3" />
                        <span>{group.active ? 'Ativo' : 'Ativar'}</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditModal(group, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                        title="Editar grupo de desafio"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button (Triggers Confirmation Modal) */}
                      <button
                        type="button"
                        onClick={(e) => handlePromptDelete(group, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                        title="Excluir grupo de desafio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Groups Pagination Controls */}
        {filteredGroups.length > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-dark-muted">
            <div>
              Exibindo{' '}
              <strong className="text-slate-900 dark:text-white font-medium">
                {(safeGroupPage - 1) * groupsPerPage + 1}
              </strong>{' '}
              a{' '}
              <strong className="text-slate-900 dark:text-white font-medium">
                {Math.min(safeGroupPage * groupsPerPage, filteredGroups.length)}
              </strong>{' '}
              de{' '}
              <strong className="text-slate-900 dark:text-white font-medium">
                {filteredGroups.length}
              </strong>{' '}
              grupos
              <span className="ml-1 text-slate-400">
                (Página {safeGroupPage} de {totalGroupPages})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setGroupPage(1)}
                disabled={safeGroupPage <= 1}
                className="px-2"
                title="Primeira Página"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setGroupPage((p) => Math.max(1, p - 1))}
                disabled={safeGroupPage <= 1}
                className="px-2"
                title="Página Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {safeGroupPage} / {totalGroupPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setGroupPage((p) => Math.min(totalGroupPages, p + 1))}
                disabled={safeGroupPage >= totalGroupPages}
                className="px-2"
                title="Próxima Página"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setGroupPage(totalGroupPages)}
                disabled={safeGroupPage >= totalGroupPages}
                className="px-2"
                title="Última Página"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* MODAL: CRIAR / EDITAR GRUPO */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingGroupId ? 'Editar Grupo de Desafio' : 'Novo Grupo de Desafio & Ranking'}
        description="Defina as regras, datas e selecione os alunos que participarão deste ranking."
        size="lg"
      >
        <form onSubmit={handleSaveGroup} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Nome do Grupo *
            </label>
            <input
              type="text"
              required
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Ex: Desafio 30 Dias Seca & Consistência"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-dark-card text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Descrição e Regras
            </label>
            <textarea
              rows={2}
              value={groupDesc}
              onChange={(e) => setGroupDesc(e.target.value)}
              placeholder="Explique o objetivo e como os alunos pontuam..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-dark-card text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Data de Início
              </label>
              <input
                type="date"
                required
                value={groupStartDate}
                onChange={(e) => setGroupStartDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-dark-card text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Data de Término
              </label>
              <input
                type="date"
                required
                value={groupEndDate}
                onChange={(e) => setGroupEndDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-dark-card text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Premiação / Reconhecimento (Opcional)
            </label>
            <input
              type="text"
              value={groupReward}
              onChange={(e) => setGroupReward(e.target.value)}
              placeholder="Ex: 1 Mês de Consultoria Grátis + Kit de Faixas Elásticas"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-dark-card text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Selecionar Alunos Participantes */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Alunos Participantes ({selectedStudentIds.length} selecionados)
              </label>
              <button
                type="button"
                onClick={() => {
                  if (selectedStudentIds.length === students.length) {
                    setSelectedStudentIds([]);
                  } else {
                    setSelectedStudentIds(students.map((s) => s.id));
                  }
                }}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium hover:underline cursor-pointer"
              >
                {selectedStudentIds.length === students.length ? 'Desmarcar todos' : 'Selecionar todos'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
              {students.map((st) => {
                const isChecked = selectedStudentIds.includes(st.id);
                return (
                  <div
                    key={st.id}
                    onClick={() => toggleStudentSelection(st.id)}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                      isChecked
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={st.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={st.name}
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                      />
                      <span className="truncate font-medium">{st.name}</span>
                    </div>
                    {isChecked && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 pt-3">
            <Button variant="ghost" fullWidth onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" fullWidth type="submit">
              {editingGroupId ? 'Salvar Alterações' : 'Criar Grupo'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CONFIRMAR EXCLUSÃO DE GRUPO */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setGroupToDelete(null);
        }}
        title="Excluir Grupo de Desafio"
        description="Confirme se realmente deseja excluir este grupo do sistema."
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold">Ação Permanente</p>
              <p>
                Tem certeza que deseja excluir o grupo{' '}
                <strong className="font-semibold text-rose-900 dark:text-rose-100">
                  &ldquo;{groupToDelete?.name}&rdquo;
                </strong>
                ? Esta ação removerá a pontuação e histórico dos alunos vinculados a este desafio.
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="ghost"
              fullWidth
              onClick={() => {
                setDeleteModalOpen(false);
                setGroupToDelete(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleConfirmDelete}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Excluir Grupo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
