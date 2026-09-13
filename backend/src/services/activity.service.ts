import { rpgStore } from '../database/rpgStore.js';
import { ActivityLog } from '../types/index.js';

export class ActivityService {
  async getActivity(userId: string, limit = 50): Promise<ActivityLog[]> {
    return rpgStore.getActivityLogs(userId, limit);
  }

  async log(userId: string, item: Omit<ActivityLog, 'id' | 'userId' | 'createdAt'>): Promise<void> {
    await rpgStore.logActivity({
      ...item,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      createdAt: new Date().toISOString()
    });
  }
}

export const activityService = new ActivityService();
