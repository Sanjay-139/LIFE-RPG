import { api } from './api';
import { ApiResponse, Quest } from '../types';

export interface QuestCompleteResult {
  quest: Quest;
  xpEarned: number;
  goldEarned: number;
  attributeGained: {
    attribute: string;
    amount: number;
  };
  streak: number;
  levelUp: boolean;
  newLevel?: number;
  unlockedReward?: string;
  unlockedAchievements?: string[];
}

export const questService = {
  async getQuests(filters?: { status?: string; category?: string; difficulty?: string }): Promise<ApiResponse<Quest[]>> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters?.difficulty && filters.difficulty !== 'all') params.append('difficulty', filters.difficulty);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<Quest[]>(`/quests${query}`);
  },

  async getQuestById(id: string): Promise<ApiResponse<Quest>> {
    return api.get<Quest>(`/quests/${id}`);
  },

  async createQuest(payload: Omit<Quest, 'id' | 'status' | 'progress'>): Promise<ApiResponse<Quest>> {
    return api.post<Quest>('/quests', payload);
  },

  async updateQuest(id: string, updates: Partial<Quest>): Promise<ApiResponse<Quest>> {
    return api.patch<Quest>(`/quests/${id}`, updates);
  },

  async deleteQuest(id: string): Promise<ApiResponse<boolean>> {
    return api.delete<boolean>(`/quests/${id}`);
  },

  async completeQuest(id: string): Promise<ApiResponse<QuestCompleteResult>> {
    return api.post<QuestCompleteResult>(`/quests/${id}/complete`);
  },
};
