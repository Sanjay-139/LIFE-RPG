import { api } from './api';
import { ApiResponse, RewardItem } from '../types';

export const inventoryService = {
  async getInventory(): Promise<ApiResponse<RewardItem[]>> {
    return api.get<RewardItem[]>('/inventory');
  },

  async equipItem(id: string): Promise<ApiResponse<RewardItem>> {
    return api.post<RewardItem>(`/inventory/${id}/equip`);
  },

  async unequipItem(id: string): Promise<ApiResponse<RewardItem>> {
    return api.post<RewardItem>(`/inventory/${id}/unequip`);
  },
};
