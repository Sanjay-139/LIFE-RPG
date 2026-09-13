import { Response, NextFunction } from 'express';
import { questService } from '../services/quest.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export async function getQuests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { status, category, difficulty } = req.query as Record<string, string>;
    const quests = await questService.getQuests(userId, { status, category, difficulty });
    res.json({
      success: true,
      data: quests
    });
  } catch (err) {
    next(err);
  }
}

export async function getQuestById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const quest = await questService.getQuestById(userId, req.params.id);
    res.json({
      success: true,
      data: quest
    });
  } catch (err) {
    next(err);
  }
}

export async function createQuest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const quest = await questService.createQuest(userId, req.body);
    res.status(201).json({
      success: true,
      data: quest
    });
  } catch (err) {
    next(err);
  }
}

export async function updateQuest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const quest = await questService.updateQuest(userId, req.params.id, req.body);
    res.json({
      success: true,
      data: quest
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteQuest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    await questService.deleteQuest(userId, req.params.id);
    res.json({
      success: true,
      data: true,
      message: 'Quest decommissioned'
    });
  } catch (err) {
    next(err);
  }
}

export async function completeQuest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const timezone = req.headers['x-timezone'] as string | undefined;
    const result = await questService.completeQuest(userId, req.params.id, timezone);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const history = await questService.getCompletionHistory(userId);
    res.json({
      success: true,
      data: history
    });
  } catch (err) {
    next(err);
  }
}
