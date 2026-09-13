import { rpgStore } from '../database/rpgStore.js';
import { RewardItem } from '../types/index.js';
import { AppError } from '../middleware/error.middleware.js';

export interface PurchaseResult {
  reward: RewardItem;
  remainingGold: number;
}

export class RewardService {
  async getRewards(userId: string): Promise<RewardItem[]> {
    return rpgStore.getRewards(userId);
  }

  async purchaseReward(userId: string, rewardId: string): Promise<PurchaseResult> {
    const reward = await rpgStore.getRewardById(rewardId);
    if (!reward) {
      throw new AppError('Item not found in Virtual Bazaar', 404, 'NOT_FOUND');
    }

    const sheet = await rpgStore.getCharacterSheet(userId);

    // 1. Check Level Requirement
    if (reward.requiredLevel && sheet.level < reward.requiredLevel) {
      throw new AppError(
        `Character Level ${reward.requiredLevel} required to purchase this item. You are Level ${sheet.level}.`,
        400,
        'LEVEL_REQUIREMENT_NOT_MET'
      );
    }

    // 2. Check if already owned
    const inventory = await rpgStore.getInventory(userId);
    if (inventory.some(item => item.rewardId === rewardId || item.id === rewardId)) {
      throw new AppError('You already own this item.', 409, 'ALREADY_OWNED');
    }

    // 3. Check Gold Balance
    if (sheet.gold < reward.price) {
      throw new AppError(
        `Insufficient Gold balance. Item requires ${reward.price} Gold, but you have ${sheet.gold} Gold.`,
        400,
        'INSUFFICIENT_GOLD'
      );
    }

    // 4. Atomic Deduct Gold & Add to Inventory
    const remainingGold = sheet.gold - reward.price;
    await rpgStore.updateCharacterSheet(userId, { gold: remainingGold });
    await rpgStore.addInventoryItem(userId, rewardId);

    // 5. Record Gold Transaction
    await rpgStore.addGoldTransaction({
      id: `gt-${Date.now()}`,
      userId,
      amount: -reward.price,
      transactionType: 'REWARD_PURCHASE',
      sourceId: rewardId,
      balanceAfter: remainingGold,
      description: `Purchased item: ${reward.name}`,
      createdAt: new Date().toISOString()
    });

    // 6. Log Activity & Notification
    await rpgStore.logActivity({
      id: `act-${Date.now()}`,
      userId,
      actionType: 'REWARD_PURCHASED',
      title: `🛍️ Acquired Item: ${reward.name}`,
      description: `Spent ${reward.price} Gold at the Virtual Bazaar.`,
      goldEarned: -reward.price,
      createdAt: new Date().toISOString()
    });

    await rpgStore.addNotification({
      id: `notif-${Date.now()}`,
      userId,
      title: `🛍️ Item Acquired: ${reward.name}`,
      message: `You purchased ${reward.name}! Head to the Vault / Inventory to equip it.`,
      type: 'reward_purchased',
      read: false,
      timestamp: new Date().toISOString()
    });

    return {
      reward: { ...reward, owned: true, equipped: false },
      remainingGold
    };
  }
}

export const rewardService = new RewardService();
