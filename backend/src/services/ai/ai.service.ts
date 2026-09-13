import { QuestCategory, QuestDifficulty, AttributeKey } from '../../types/index.js';

export interface SuggestedQuest {
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  targetAttribute: AttributeKey;
  estimatedDuration: number;
}

export class LifeRpgAIService {
  /**
   * Generates grounded RPG quest suggestions tailored to character goals.
   * Note: The AI only suggests data. The authoritative RPG engine decides progression.
   */
  async suggestQuest(userContext?: { focusAttribute?: AttributeKey; category?: QuestCategory }): Promise<SuggestedQuest> {
    const attribute = userContext?.focusAttribute || 'discipline';
    const category = userContext?.category || 'personal';

    return {
      title: 'Deep Focus Block: 60m Targeted Sprint',
      description: 'Engage in 60 minutes of uninterrupted disciplined execution with zero context switching.',
      category,
      difficulty: 'medium',
      targetAttribute: attribute,
      estimatedDuration: 60
    };
  }

  async suggestDailyMissions(): Promise<string[]> {
    return [
      'Complete 45 minutes of algorithmic practice',
      'Hydrate with 2.5L and complete 30m physical workout',
      'Read 25 pages of deep engineering or tactical literature'
    ];
  }

  async analyzeProgress(): Promise<{ insight: string; recommendation: string }> {
    return {
      insight: 'Discipline and Intellect attributes are advancing rapidly with an active 27-day streak cadence.',
      recommendation: 'Incorporate 1 heavy Vitality or Strength compound session to maintain holistic attribute balance.'
    };
  }
}

export const lifeRpgAIService = new LifeRpgAIService();
