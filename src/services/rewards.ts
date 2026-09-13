import { api } from './api';
import { ApiResponse, RewardItem } from '../types';

export interface PurchaseResult {
  reward: RewardItem;
  remainingGold: number;
}

export const rewardService = {
  async getRewards(): Promise<ApiResponse<RewardItem[]>> {
    return api.get<RewardItem[]>('/rewards');
  },

  async purchaseReward(id: string): Promise<ApiResponse<PurchaseResult>> {
    return api.post<PurchaseResult>(`/rewards/${id}/purchase`);
  },
};
