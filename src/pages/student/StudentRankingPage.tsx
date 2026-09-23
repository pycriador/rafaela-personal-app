import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Flame,
  Medal,
  Award,
  Sparkles,
  Calendar,
  Users,
  CheckCircle2,
  TrendingUp,
  Target,
  Dumbbell,
  Check,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { rankingRepository, RANKING_METRIC_CONFIGS } from '../../repositories/rankingRepository';
import { RankingGroup, StudentLeaderboardEntry } from '../../types';

export const StudentRankingPage: React.FC = () => {
  const { studentProfile } = useAuth();
  const [myGroups, setMyGroups] = useState<RankingGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<RankingGroup | null>(null);
  const [leaderboard, setLeaderboard] = useState<StudentLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!studentProfile) return;
      try {
        const groups = await rankingRepository.getGroupsByStudentId(studentProfile.id);
        setMyGroups(groups);
        if (groups.length > 0) {
          setSelectedGroup(groups[0]);
          const board = await rankingRepository.getGroupLeaderboard(groups[0].id);
          setLeaderboard(board);
        }
      } catch (err) {
        console.error('Erro ao carregar desafios do aluno:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentProfile]);

  const handleSelectGroup = async (g: RankingGroup) => {
    setSelectedGroup(g);
    try {
      const board = await rankingRepository.getGroupLeaderboard(g.id);
      setLeaderboard(board);
    } catch (err) {
      console.error('Erro ao carregar leaderboard:', err);
    }
  };

  const myEntry = leaderboard.find((e) => e.studentId === studentProfile?.id);

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (myGroups.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Nenhum desafio ativo no momento
        </h2>
        <p className="text-xs text-slate-500 dark:text-dark-muted max-w-md mx-auto">
          A Rafaela cria grupos temáticos e desafios de consistência periodicamente. Fique atento às notificações para participar da próxima turma!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Banner / Header */}
      <div className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-white/[0.08] shadow-xs rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="brand" size="sm">Competição Saudável</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            Desafios & Ranking de Treinos
          </h1>
          <p className="text-sm text-slate-500 dark:text-dark-muted mt-1 font-normal">
            Acompanhe sua pontuação, sequência sem faltar e dispute o topo do pódio com sua turma.
          </p>
        </div>

        {/* Group Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {myGroups.map((g) => (
            <button
              key={g.id}
              onClick={() => handleSelectGroup(g)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                selectedGroup?.id === g.id
                  ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-2xs'
                  : 'bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {selectedGroup && (
        <>
          {/* My Current Status Highlight Card */}
          {myEntry && (
            <div className="space-y-3">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xl flex items-center justify-center shrink-0 shadow-sm">
                    #{myEntry.rank}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                      Sua Posição Atual
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {myEntry.rank === 1 ? '👑 Você está liderando o desafio!' : `Você está em ${myEntry.rank}º lugar`}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
                      {myEntry.workoutsCompleted} treinos concluídos • {myEntry.adherencePercentage}% adesão
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-dark-card border border-slate-200/60 dark:border-white/[0.08] text-center">
                    <span className="text-[10px] text-slate-400 block">SEQUÊNCIA</span>
                    <span className="text-sm font-bold text-amber-500 flex items-center justify-center gap-1 font-mono">
                      <Flame className="w-3.5 h-3.5 fill-amber-500" />
                      {myEntry.currentStreak} dias
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-dark-card border border-slate-200/60 dark:border-white/[0.08] text-center">
                    <span className="text-[10px] text-slate-400 block">PONTOS</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {myEntry.score} pts
                    </span>
                  </div>
                </div>
              </div>

              {/* My Metric Breakdown */}
              <div className="flex flex-wrap items-center gap-2 px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Seu Desempenho:
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium">
                  🏋️ {myEntry.workoutsCompleted} treinos
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium">
                  📈 {myEntry.weightProgressionsCount ?? 0}x subiu carga
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium">
                  ✅ {myEntry.completedExercisesCount ?? 0} exercícios
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium">
                  ⚡ {(myEntry.totalTonnageKg ?? 0).toLocaleString()} kg volume
                </span>
              </div>
            </div>
          )}

        {/* Scoring Criteria & Rules configured by Personal */}
        <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Como Pontuar Neste Desafio (Critérios Definidos pela Rafaela)
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {(selectedGroup.metrics?.length || 5)} critérios ativos
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {(selectedGroup.metrics || (['scheduled_workouts', 'weight_progression', 'completed_exercises', 'streak_days', 'total_tonnage'] as const)).map((m) => {
              const conf = RANKING_METRIC_CONFIGS[m];
              if (!conf) return null;
              return (
                <div
                  key={m}
                  className="p-3 rounded-xl bg-slate-50/70 dark:bg-dark-cardElevated/70 border border-slate-200/60 dark:border-white/[0.06] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      {conf.shortLabel}
                    </span>
                    <Badge variant="brand" size="sm" className="font-mono text-[10px]">
                      {conf.pointsRule.split(' ')[0]} {conf.pointsRule.split(' ')[1]}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-dark-muted font-normal">
                    {conf.pointsRule}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

          {/* Group Details & Reward */}
          {selectedGroup.reward && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Premiação do Desafio:</strong> {selectedGroup.reward} (Vence em{' '}
                {new Date(selectedGroup.endDate).toLocaleDateString()})
              </span>
            </div>
          )}

          {/* Podium (Top 3) */}
          {leaderboard.length >= 3 && (
            <div className="grid grid-cols-3 gap-3 items-end pt-4 pb-2">
              {/* 2nd Place */}
              <div className="text-center p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-cardElevated border border-slate-200/70 dark:border-white/[0.08] flex flex-col items-center">
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

              {/* 1st Place */}
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
              <div className="text-center p-3.5 rounded-2xl bg-slate-50 dark:bg-dark-cardElevated border border-slate-200/70 dark:border-white/[0.08] flex flex-col items-center">
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

          {/* Full Leaderboard List */}
          <Card className="p-5 space-y-3">
            <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between border-b border-slate-100 dark:border-white/[0.06]">
              <CardTitle className="text-sm font-semibold">Tabela de Classificação</CardTitle>
              <span className="text-xs text-slate-400 font-mono">
                {leaderboard.length} competidores
              </span>
            </CardHeader>

            <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {leaderboard.map((entry) => {
                const isMe = entry.studentId === studentProfile?.id;
                return (
                  <div
                    key={entry.studentId}
                    className={`py-3 px-2 flex items-center justify-between gap-3 rounded-xl transition-colors ${
                      isMe ? 'bg-emerald-500/10 font-medium' : ''
                    }`}
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
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/[0.08] shrink-0"
                      />

                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                          {entry.studentName}
                          {isMe && <Badge variant="brand" size="sm">Você</Badge>}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-400 font-mono mt-0.5">
                          <span>{entry.workoutsCompleted} treinos</span>
                          <span>•</span>
                          <span className="text-amber-500 flex items-center gap-0.5">
                            <Flame className="w-3 h-3 fill-amber-500" />
                            {entry.currentStreak}d sequência
                          </span>
                          {(entry.weightProgressionsCount ?? 0) > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-500">
                                +{entry.weightProgressionsCount}x carga
                              </span>
                            </>
                          )}
                          {(entry.totalTonnageKg ?? 0) > 0 && (
                            <>
                              <span>•</span>
                              <span>{(entry.totalTonnageKg ?? 0).toLocaleString()} kg vol</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black font-mono text-slate-900 dark:text-white">
                        {entry.score}
                      </span>
                      <span className="text-[10px] text-slate-400 block">pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
