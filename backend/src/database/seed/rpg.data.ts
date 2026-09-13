import { RewardItem, Achievement, Quest } from '../../types/index.js';

export const SEED_REWARDS: RewardItem[] = [
  {
    id: 'item_apprentice_amulet',
    name: 'Apprentice Amulet',
    description: 'A modest copper amulet that helps focus novice mental clarity. +2 Intellect.',
    category: 'gear',
    price: 80,
    icon: 'token',
    attributeBuff: { attribute: 'intellect', value: 2 },
    equipSlot: 'accessory',
    requiredLevel: 1
  },
  {
    id: 'item_leather_bracers',
    name: 'Leather Work Bracers',
    description: 'Sturdy stitched wristguards for persistent effort. +3 Discipline.',
    category: 'gear',
    price: 150,
    icon: 'sports_kabaddi',
    attributeBuff: { attribute: 'discipline', value: 3 },
    equipSlot: 'hands',
    requiredLevel: 1
  },
  {
    id: 'item_armor',
    name: 'Knight Armor Vest',
    description: '+5 Strength bonus on workout days. Sleek reinforced tunic designed for sustained physical discipline.',
    category: 'gear',
    price: 500,
    icon: 'shield',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDE5BaKSBmgTLAjJRHVbMYtMbz-KXZyvlTb2iKS2R-yPxZOkMGc8x4oByWigO4SKf4C2j1RnnjUl1g2j6DT3BlKKVO6XBJhmSyLHyuJx-Bx7a9xuRmZpjtn9WBJhMZjb_q9s3tLHIcemUqd625kkdqJqWtUxH3e9qpEBV7OwxuAu9WPjV06VIldYijOtC8R6XsooBsUbn2YNwXuGSZ1q9QA18JO9VmVO-ThxBuMM8UXqDJWnXnavPgY',
    attributeBuff: { attribute: 'strength', value: 5 },
    equipSlot: 'torso',
    requiredLevel: 5
  },
  {
    id: 'item_chronometer',
    name: 'Chronometer of Focus',
    description: '+10% Discipline buff on deep work sessions. Amplifies focus telemetry tracking accuracy.',
    category: 'gear',
    price: 350,
    icon: 'timer',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1yJB_D49MQXH7d_Ru82X0FAzAyvEGh3wm2EcoCPCsj08NRXgsgtQwCPvCPngI8q6rB2cuJnDHYeFcKrGz1J1J8pGUDmNdcZuhUB7BwXWj3Q0FsN7XwOBEdC_xdBMAWRTBDx0H6xVQA-qTxLklUpVdCPTN-SVmqA19n2CXw8g3HGW6nkalfUYMz0vhM69nndceY8wlfzRY0uFgOEHoCywHV3qTlyKn41DLljHVgnhgdl3jwWozopxE',
    attributeBuff: { attribute: 'discipline', value: 8 },
    equipSlot: 'head',
    requiredLevel: 4
  },
  {
    id: 'item_terminal_theme',
    name: 'Cyberpunk Terminal Theme',
    description: 'Executive dark emerald luminescence HUD inspired by retro hacker workstations.',
    category: 'theme',
    price: 400,
    icon: 'terminal',
    equipSlot: 'theme',
    requiredLevel: 8
  },
  {
    id: 'item_hero_frame',
    name: 'Titanium Vanguard Frame',
    description: 'Solid brushed metal border with gold corner accents for the character badge.',
    category: 'profile_frame',
    price: 600,
    icon: 'crop_square',
    equipSlot: 'frame',
    requiredLevel: 10
  },
  {
    id: 'item_algorithmic_knight',
    name: 'Title: Algorithmic Knight',
    description: 'Exclusive honorific bestowed upon adventurers who solved over 100 algorithmic challenges.',
    category: 'title',
    price: 300,
    icon: 'military_tech',
    equipSlot: 'badge',
    requiredLevel: 10
  },
  {
    id: 'item_streak_shield',
    name: 'Streak Aegis Shield',
    description: 'Automatically preserves your streak if an unavoidable emergency prevents completing daily quests.',
    category: 'cosmetic',
    price: 450,
    icon: 'security',
    requiredLevel: 6
  }
];

export const SEED_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    title: 'FIRST QUEST',
    description: 'Began your journey by successfully completing your initial real-world quest.',
    icon: 'flag',
    category: 'Beginning',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    xpReward: 50,
    goldReward: 25,
    badgeTitle: 'Novice Adventurer'
  },
  {
    id: 'ach-2',
    title: '7 DAY STREAK',
    description: 'Maintained unbroken quest completion discipline for 7 consecutive solar days.',
    icon: 'local_fire_department',
    category: 'Discipline',
    progress: 0,
    maxProgress: 7,
    unlocked: false,
    xpReward: 150,
    goldReward: 50,
    badgeTitle: 'Flame Keeper'
  },
  {
    id: 'ach-3',
    title: '30 DAY STREAK',
    description: 'Locked in supreme life discipline for an entire calendar month without relapse.',
    icon: 'whatshot',
    category: 'Discipline',
    progress: 0,
    maxProgress: 30,
    unlocked: false,
    xpReward: 500,
    goldReward: 200,
    badgeTitle: 'Iron Will'
  },
  {
    id: 'ach-4',
    title: 'CODE WARRIOR',
    description: 'Accumulated over 2,000 XP in software engineering and algorithmic quests.',
    icon: 'code',
    category: 'Mastery',
    progress: 0,
    maxProgress: 2000,
    unlocked: false,
    xpReward: 300,
    goldReward: 100,
    badgeTitle: 'Byte Slayer'
  },
  {
    id: 'ach-5',
    title: 'KNOWLEDGE SEEKER',
    description: 'Completed 20 deep reading and theoretical literature quests.',
    icon: 'menu_book',
    category: 'Intellect',
    progress: 0,
    maxProgress: 20,
    unlocked: false,
    xpReward: 200,
    goldReward: 80,
    badgeTitle: 'Archivist'
  },
  {
    id: 'ach-6',
    title: 'FITNESS WARRIOR',
    description: 'Completed 30 high-intensity strength or cardio conditioning sessions.',
    icon: 'fitness_center',
    category: 'Vitality',
    progress: 0,
    maxProgress: 30,
    unlocked: false,
    xpReward: 250,
    goldReward: 90,
    badgeTitle: 'Iron Body'
  },
  {
    id: 'ach-7',
    title: 'LEVEL 10 REACHED',
    description: 'Surpassed the double-digit threshold into intermediate character tier.',
    icon: 'military_tech',
    category: 'Progression',
    progress: 0,
    maxProgress: 10,
    unlocked: false,
    xpReward: 400,
    goldReward: 150,
    badgeTitle: 'Grand Pioneer'
  }
];

export const STARTER_QUESTS: Omit<Quest, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Study DSA: Binary Trees & Dynamic Programming',
    description: 'Solve 3 Hard LeetCode Dynamic Programming challenges and write algorithmic complexity proofs.',
    category: 'coding',
    difficulty: 'hard',
    xpReward: 120,
    goldReward: 60,
    targetAttribute: 'intellect',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    estimatedDuration: 60,
    status: 'in_progress',
    progress: 40,
    repeatSchedule: 'daily',
    subtasks: [
      { id: 'st-1', title: 'Review Tree Memoization notes', completed: true },
      { id: 'st-2', title: 'Solve LC 124 (Binary Tree Max Path Sum)', completed: true },
      { id: 'st-3', title: 'Solve DP on Trees challenge', completed: false }
    ]
  },
  {
    title: 'Gym Workout: 45m Heavy Compound Circuit',
    description: 'Barbell squats (4x8), Romanian deadlifts (3x10), overhead military press (3x8).',
    category: 'fitness',
    difficulty: 'medium',
    xpReward: 70,
    goldReward: 35,
    targetAttribute: 'strength',
    dueDate: new Date(Date.now() + 43200000).toISOString(),
    estimatedDuration: 45,
    status: 'not_started',
    progress: 0,
    repeatSchedule: 'weekdays'
  },
  {
    title: 'Morning Deep Work: 90-Minute Focus Block',
    description: 'Zero notifications, phone in airplane mode, execute primary architecture roadmap deliverables.',
    category: 'reading',
    difficulty: 'medium',
    xpReward: 70,
    goldReward: 35,
    targetAttribute: 'discipline',
    dueDate: new Date(Date.now() + 21600000).toISOString(),
    estimatedDuration: 90,
    status: 'not_started',
    progress: 0,
    repeatSchedule: 'daily'
  }
];
