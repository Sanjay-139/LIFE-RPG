import { rpgStore } from '../database/rpgStore.js';
import { CharacterSheet, AttributeKey, AttributeStat } from '../types/index.js';
import { AppError } from '../middleware/error.middleware.js';

export class CharacterService {
  async getCharacter(userId: string): Promise<CharacterSheet> {
    return rpgStore.getCharacterSheet(userId);
  }

  async getAttributes(userId: string): Promise<Record<AttributeKey, AttributeStat>> {
    return rpgStore.getAttributes(userId);
  }

  async updateCharacter(userId: string, updates: Partial<CharacterSheet>): Promise<CharacterSheet> {
    // Only safe profile/display fields can be updated directly
    const safeUpdates: Partial<CharacterSheet> = {};
    if (updates.name) safeUpdates.name = updates.name.trim();
    if (updates.title) safeUpdates.title = updates.title.trim();
    if (updates.avatar) safeUpdates.avatar = updates.avatar;

    await rpgStore.updateCharacterSheet(userId, safeUpdates);
    return rpgStore.getCharacterSheet(userId);
  }

  async allocateAttributePoint(userId: string, attribute: AttributeKey, points = 1): Promise<CharacterSheet> {
    const sheet = await rpgStore.getCharacterSheet(userId);

    if (sheet.attributePoints < points) {
      throw new AppError(
        `Insufficient attribute points available. You have ${sheet.attributePoints} points.`,
        400,
        'INSUFFICIENT_POINTS'
      );
    }

    // Spend points
    await rpgStore.updateCharacterSheet(userId, {
      attributePoints: sheet.attributePoints - points
    });

    // Boost target attribute
    const boost = points * 2;
    await rpgStore.increaseAttribute(userId, attribute, boost);

    await rpgStore.logActivity({
      id: `act-${Date.now()}`,
      userId,
      actionType: 'ATTRIBUTE_INCREASED',
      title: `⚡ Allocated Points: +${boost} ${attribute.toUpperCase()}`,
      description: `Spent ${points} attribute point(s) to augment ${attribute}.`,
      createdAt: new Date().toISOString()
    });

    return rpgStore.getCharacterSheet(userId);
  }
}

export const characterService = new CharacterService();
