import { Router } from 'express';
import * as questController from '../controllers/quest.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { createQuestSchema, updateQuestSchema } from '../schemas/index.js';

const router = Router();

router.use(requireAuth);

router.get('/', questController.getQuests);
router.post('/', validate(createQuestSchema), questController.createQuest);
router.get('/history', questController.getHistory);
router.get('/:id', questController.getQuestById);
router.patch('/:id', validate(updateQuestSchema), questController.updateQuest);
router.delete('/:id', questController.deleteQuest);
router.post('/:id/complete', questController.completeQuest);

export default router;
