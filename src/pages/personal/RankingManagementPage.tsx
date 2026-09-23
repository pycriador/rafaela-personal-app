import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Users,
  Plus,
  Calendar,
  Flame,
  Medal,
  Award,
  ChevronRight,
  Check,
  Trash2,
  Edit,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
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

  // Modal create/edit group
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

  const loadData = async () => {
    try {
      const [allGroups, allStudents] = await Promise.all([
        rankingRepository.getGroups(),
        studentRepository.getAll(),
      ]);
      setGroups(allGroups);
      setStudents(allStudents);
      if (allGroups.length > 0) {
        setSelectedGroup(allGroups[0]);
        loadLeaderboard(allGroups[0].id);
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

  const handleOpenCreateModal = () => {
    setEditingGroupId(null);
    setGroupName('');
    setGroupDesc('');
    setGroupStartDate(new Date().toISOString().split('T')[0]);
    setGroupEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setGroupReward('');
    // Select all active students by default
    setSelectedStudentIds(students.filter((s) => s.status === 'Ativo').map((s) => s.id));
    setModalOpen(true);
  };

  const handleOpenEditModal = (g: RankingGroup) => {
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
        await rankingRepository.createGroup({
          name: groupName.trim(),
          description: groupDesc.trim(),
          startDate: groupStartDate,
          endDate: groupEndDate,
          reward: groupReward.trim() || undefined,
          studentIds: selectedStudentIds,
          active: true,
        });
        success('Grupo de desafio criado com sucesso!');
      }

      setModalOpen(false);
      await loadData();
    } catch {
      toastError('Erro ao salvar grupo de ranking.');
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este grupo de desafio?')) return;
    try {
      await rankingRepository.deleteGroup(id);
      success('Grupo removido com sucesso.');
      loadData();
    } catch {
      toastError('Erro ao excluir grupo.');
    }
  };

  const toggleStudentSelection = (stId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(stId) ? prev.filter((id) => id !== stId) : [...prev, stId]
    );
  };

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
            Crie grupos temáticos, defina períodos e selecione quais alunos competirão pelo topo do pódio.
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Groups List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Grupos Criados ({groups.length})
            </h2>
            <span className="text-xs text-slate-400 font-mono">Selecione para auditar</span>
          </div>

          <div className="space-y-2.5">
            {groups.map((group) => {
              const isSelected = selectedGroup?.id === group.id;
              return (
                <Card
                  key={group.id}
                  className={`p-4 transition-all cursor-pointer border ${
                    isSelected
                      ? 'border-emerald-500 ring-1 ring-emerald-500/40 bg-emerald-500/5'
                      : 'border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300'
                  }`}
                  onClick={() => handleSelectGroup(group)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {group.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-dark-muted flex items-center gap-1 mt-0.5">
                          <Users className="w-3 h-3" />
                          {group.studentIds.length} alunos participantes
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(group);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Editar grupo"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(group.id);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-500"
                        title="Excluir grupo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-dark-muted mt-2.5 line-clamp-2">
                    {group.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(group.startDate).toLocaleDateString()} a {new Date(group.endDate).toLocaleDateString()}
                    </span>
                    <Badge variant={group.active ? 'brand' : 'neutral'} size="sm">
                      {group.active ? 'Ativo' : 'Finalizado'}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Column: Leaderboard of Selected Group */}
        <div className="lg:col-span-8 space-y-4">
          {selectedGroup ? (
            <Card className="p-6 space-y-6">
              {/* Group Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {selectedGroup.name}
                    </h2>
                    <Badge variant="brand" size="sm">
                      {selectedGroup.studentIds.length} Alunos
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-dark-muted mt-1">
                    {selectedGroup.description}
                  </p>
                  {selectedGroup.reward && (
                    <div className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-200/60 dark:border-amber-500/20 w-fit">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Premiação: <strong>{selectedGroup.reward}</strong></span>
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-400 block font-mono">Período do Desafio</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono">
                    {new Date(selectedGroup.startDate).toLocaleDateString()} até {new Date(selectedGroup.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Podium Visual (Top 3) */}
              {leaderboard.length >= 3 && (
                <div className="grid grid-cols-3 gap-3 items-end pt-3 pb-4">
                  {/* 2nd Place */}
                  <div className="text-center p-3 rounded-2xl bg-slate-50 dark:bg-dark-cardElevated border border-slate-200/70 dark:border-white/[0.08] flex flex-col items-center">
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
                  <div className="text-center p-4 rounded-2xl bg-gradient-to-b from-amber-500/10 to-amber-500/5 border-2 border-amber-400/60 dark:border-amber-500/40 shadow-xs flex flex-col items-center scale-105">
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
                  <div className="text-center p-3 rounded-2xl bg-slate-50 dark:bg-dark-cardElevated border border-slate-200/70 dark:border-white/[0.08] flex flex-col items-center">
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
                  Classificação Geral dos Alunos
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
            </Card>
          ) : (
            <Card className="p-12 text-center text-xs text-slate-400">
              Nenhum grupo de desafio selecionado.
            </Card>
          )}
        </div>
      </div>

      {/* MODAL: Criar / Editar Grupo de Desafio */}
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
                className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
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
    </div>
  );
};
