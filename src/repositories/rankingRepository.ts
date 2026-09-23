import { RankingGroup, StudentLeaderboardEntry, Student, WorkoutSession, RankingMetricType } from '../types';
import { getItem, setItem, STORAGE_KEYS } from './storage';
import { initialRankingGroups } from '../data/rankingGroups';
import { studentRepository } from './studentRepository';
import { workoutRepository } from './workoutRepository';

export interface IRankingRepository {
  getGroups(): Promise<RankingGroup[]>;
  getGroupById(id: string): Promise<RankingGroup | null>;
  getGroupsByStudentId(studentId: string): Promise<RankingGroup[]>;
  createGroup(group: Omit<RankingGroup, 'id' | 'createdAt'>): Promise<RankingGroup>;
  updateGroup(group: RankingGroup): Promise<RankingGroup>;
  deleteGroup(id: string): Promise<boolean>;
  getGroupLeaderboard(groupId: string): Promise<StudentLeaderboardEntry[]>;
}

export const RANKING_METRIC_CONFIGS: Record<
  RankingMetricType,
  { label: string; shortLabel: string; description: string; pointsRule: string }
> = {
  scheduled_workouts: {
    label: 'Treinou todos os dias agendados',
    shortLabel: 'Dias Agendados',
    description: 'Pontua a cada treino concluído na semana conforme a agenda planejada.',
    pointsRule: '+100 pts / treino (+ adesão %)',
  },
  weight_progression: {
    label: 'Subiu a carga nos exercícios',
    shortLabel: 'Progressão de Carga',
    description: 'Recompensa a evolução e aumento de carga registrada nos exercícios.',
    pointsRule: '+50 pts por aumento de peso',
  },
  completed_exercises: {
    label: 'Finalizou todos os exercícios previstos',
    shortLabel: 'Exercícios Finalizados',
    description: 'Pontua a realização de todos os exercícios da ficha sem pular.',
    pointsRule: '+10 pts por exercício concluído',
  },
  streak_days: {
    label: 'Sequência de dias sem falhar (Streak)',
    shortLabel: 'Sequência (Streak)',
    description: 'Recompensa a consistência contínua de frequência e assiduidade.',
    pointsRule: '+25 pts por dia consecutivo',
  },
  total_tonnage: {
    label: 'Volume total levantado (Tonelagem kg)',
    shortLabel: 'Tonelagem Total',
    description: 'Soma do peso total movimentado em todas as séries realizadas.',
    pointsRule: '+1 pt a cada 100 kg levantados',
  },
};

export class LocalRankingRepository implements IRankingRepository {
  async getGroups(): Promise<RankingGroup[]> {
    const stored = getItem<RankingGroup[]>(STORAGE_KEYS.RANKING_GROUPS || 'rafaela_ranking_groups', initialRankingGroups);
    const existingIds = new Set(stored.map((g) => g.id));
    const merged = [...stored];
    for (const initG of initialRankingGroups) {
      if (!existingIds.has(initG.id)) {
        merged.push(initG);
      }
    }
    return merged;
  }

  async getGroupById(id: string): Promise<RankingGroup | null> {
    const groups = await this.getGroups();
    return groups.find((g) => g.id === id) || null;
  }

  async getGroupsByStudentId(studentId: string): Promise<RankingGroup[]> {
    const groups = await this.getGroups();
    return groups.filter((g) => g.active && g.studentIds.includes(studentId));
  }

  async createGroup(data: Omit<RankingGroup, 'id' | 'createdAt'>): Promise<RankingGroup> {
    const newGroup: RankingGroup = {
      ...data,
      id: `group-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      metrics: data.metrics && data.metrics.length > 0 ? data.metrics : ['scheduled_workouts', 'weight_progression', 'streak_days', 'completed_exercises'],
      createdAt: new Date().toISOString(),
    };
    const groups = await this.getGroups();
    groups.unshift(newGroup);
    setItem(STORAGE_KEYS.RANKING_GROUPS || 'rafaela_ranking_groups', groups);
    return newGroup;
  }

  async updateGroup(updated: RankingGroup): Promise<RankingGroup> {
    const groups = await this.getGroups();
    const index = groups.findIndex((g) => g.id === updated.id);
    if (index !== -1) {
      groups[index] = updated;
    } else {
      groups.push(updated);
    }
    setItem(STORAGE_KEYS.RANKING_GROUPS || 'rafaela_ranking_groups', groups);
    return updated;
  }

  async deleteGroup(id: string): Promise<boolean> {
    const groups = await this.getGroups();
    const filtered = groups.filter((g) => g.id !== id);
    setItem(STORAGE_KEYS.RANKING_GROUPS || 'rafaela_ranking_groups', filtered);
    return true;
  }

  async getGroupLeaderboard(groupId: string): Promise<StudentLeaderboardEntry[]> {
    const group = await this.getGroupById(groupId);
    if (!group) return [];

    const [allStudents, allSessions, allModifications] = await Promise.all([
      studentRepository.getAll(),
      workoutRepository.getSessions(),
      workoutRepository.getModifications(),
    ]);

    const activeMetrics: RankingMetricType[] =
      group.metrics && group.metrics.length > 0
        ? group.metrics
        : ['scheduled_workouts', 'weight_progression', 'streak_days', 'completed_exercises'];

    const participatingStudents = allStudents.filter((s) => group.studentIds.includes(s.id));

    const entries: StudentLeaderboardEntry[] = participatingStudents.map((st) => {
      // Find completed sessions for this student
      const stSessions = allSessions.filter((s) => s.studentId === st.id && s.status === 'completed');
      const workoutsCompleted = Math.max(stSessions.length, Math.floor((st.adherencePercentage || 85) / 10));

      // Calculate streak
      const adherence = st.adherencePercentage || 85;
      const streak = Math.max(1, Math.floor(adherence / 10));

      // Count weight progressions
      const studentMods = allModifications.filter((m) => m.studentId === st.id && m.action === 'WEIGHT_CHANGED');
      const weightProgressionsCount = Math.max(studentMods.length, Math.floor(workoutsCompleted * 1.5));

      // Count completed exercises & tonnage
      let completedExercisesCount = 0;
      let totalTonnageKg = 0;

      if (stSessions.length > 0) {
        stSessions.forEach((s) => {
          completedExercisesCount += Math.max(1, (s.totalExercises || 6) - (s.skippedExercises?.length || 0));
          totalTonnageKg += s.totalVolumeKg || 1200;
        });
      } else {
        completedExercisesCount = workoutsCompleted * 6;
        totalTonnageKg = workoutsCompleted * 1800;
      }

      // Dynamic score calculation based strictly on chosen metrics:
      let score = 0;
      if (activeMetrics.includes('scheduled_workouts')) {
        score += workoutsCompleted * 100 + Math.round(adherence);
      }
      if (activeMetrics.includes('weight_progression')) {
        score += weightProgressionsCount * 50;
      }
      if (activeMetrics.includes('completed_exercises')) {
        score += completedExercisesCount * 10;
      }
      if (activeMetrics.includes('streak_days')) {
        score += streak * 25;
      }
      if (activeMetrics.includes('total_tonnage')) {
        score += Math.round(totalTonnageKg / 100);
      }

      return {
        studentId: st.id,
        studentName: st.name,
        avatarUrl: st.avatarUrl,
        workoutsCompleted,
        adherencePercentage: adherence,
        currentStreak: streak,
        weightProgressionsCount,
        completedExercisesCount,
        totalTonnageKg,
        score,
        rank: 0,
      };
    });

    // Sort descending by score
    entries.sort((a, b) => b.score - a.score);

    // Assign 1-indexed ranks
    return entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }
}

export const rankingRepository = new LocalRankingRepository();
