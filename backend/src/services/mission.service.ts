import { rpgStore } from '../database/rpgStore.js';
import { DailyMission } from '../types/index.js';

export class MissionService {
  async getTodayMissions(userId: string): Promise<DailyMission[]> {
    return rpgStore.getDailyMissions(userId);
  }
}

export const missionService = new MissionService();
