import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  fullName: z.string().min(1, 'Full name is required').optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  phone: z.string().optional()
}).refine(data => data.name || data.fullName, {
  message: 'Name or fullName is required',
  path: ['fullName']
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required').optional()
});

export const createQuestSchema = z.object({
  title: z.string().min(1, 'Quest title is required').max(500, 'Title too long'),
  description: z.string().optional(),
  category: z.enum(['coding', 'study', 'fitness', 'reading', 'health', 'career', 'personal', 'work', 'other']).optional(),
  difficulty: z.enum(['trivial', 'easy', 'medium', 'hard', 'epic']).optional(),
  estimatedDuration: z.number().int().positive().optional(),
  dueDate: z.string().optional(),
  targetAttribute: z.enum(['strength', 'intellect', 'vitality', 'discipline', 'charisma']).optional(),
  repeatSchedule: z.enum(['none', 'daily', 'weekly', 'weekdays']).optional(),
  subtasks: z.array(z.object({
    id: z.string(),
    title: z.string().min(1),
    completed: z.boolean()
  })).optional()
});

export const updateQuestSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  category: z.enum(['coding', 'study', 'fitness', 'reading', 'health', 'career', 'personal', 'work', 'other']).optional(),
  difficulty: z.enum(['trivial', 'easy', 'medium', 'hard', 'epic']).optional(),
  estimatedDuration: z.number().int().positive().optional(),
  dueDate: z.string().optional(),
  repeatSchedule: z.enum(['none', 'daily', 'weekly', 'weekdays']).optional(),
  progress: z.number().min(0).max(100).optional(),
  subtasks: z.array(z.object({
    id: z.string(),
    title: z.string().min(1),
    completed: z.boolean()
  })).optional()
});

export const allocateAttributeSchema = z.object({
  attribute: z.enum(['strength', 'intellect', 'vitality', 'discipline', 'charisma']),
  points: z.number().int().positive().default(1)
});

export const profileUpdateSchema = z.object({
  fullName: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatar: z.string().regex(/^avatar-\d{2,}$/, 'Avatar must be a valid identifier (e.g. avatar-01 to avatar-24)').optional(),
  classType: z.string().optional(),
  bio: z.string().optional(),
  timezone: z.string().optional(),
  preferences: z.record(z.any()).optional(),
  onboardingCompleted: z.boolean().optional()
});
