import { LevelMilestone } from '../types';

export const LEVEL_MILESTONES: LevelMilestone[] = [
  { level: 0, title: 'Novice Initiate', xpRequired: 0, perks: ['Archetype Avatar Selection', 'Starter Quest Board'] },
  { level: 1, title: 'Novice Wanderer', xpRequired: 100, perks: ['Basic Quest Board', 'Daily Streak Tracking'] },
  { level: 2, title: 'Apprentice Seeker', xpRequired: 150, perks: ['Attribute Breakdown', 'Subtask Decomposition'] },
  { level: 3, title: 'Disciplined Initiate', xpRequired: 225, perks: ['Economy Bazaar Unlocked', 'Custom Reminders'] },
  { level: 4, title: 'Questing Scholar', xpRequired: 340, perks: ['Equipment Slots', 'Daily Mission Multipliers'] },
  { level: 5, title: 'Tactical Adventurer', xpRequired: 510, perks: ['Quest Chains', 'Synergy Radar Graphs'] },
  { level: 10, title: 'Veteran Pioneer', xpRequired: 2500, perks: ['Custom Badges', 'Title Grants', 'Streak Aegis'] },
  { level: 15, title: 'Ascended Grandmaster', xpRequired: 10000, perks: ['Mastery Aura', 'Infinite Compounding Multiplier'] },
];
