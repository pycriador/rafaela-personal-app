import { RankingGroup, StudentLeaderboardEntry, Student, WorkoutSession } from '../types';
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

    const [allStudents, allSessions] = await Promise.all([
      studentRepository.getAll(),
      workoutRepository.getSessions(),
    ]);

    const participatingStudents = allStudents.filter((s) => group.studentIds.includes(s.id));

    const entries: StudentLeaderboardEntry[] = participatingStudents.map((st) => {
      // Find completed sessions for this student within or relevant to group period
      const stSessions = allSessions.filter((s) => s.studentId === st.id && s.status === 'completed');
      const workoutsCompleted = stSessions.length;

      // Calculate streak: simulated or derived from completed session frequency
      const adherence = st.adherencePercentage || 85;
      const streak = Math.max(1, Math.floor(adherence / 10));

      // Scoring formula: (Workouts * 100) + (Streak * 25) + (Adherence)
      const score = workoutsCompleted * 100 + streak * 25 + adherence;

      return {
        studentId: st.id,
        studentName: st.name,
        avatarUrl: st.avatarUrl,
        workoutsCompleted,
        adherencePercentage: adherence,
        currentStreak: streak,
        score,
        rank: 0, // will be ranked below
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
