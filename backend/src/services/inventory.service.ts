import { rpgStore } from '../database/rpgStore.js';
import { RewardItem } from '../types/index.js';
import { AppError } from '../middleware/error.middleware.js';

export class InventoryService {
  async getInventory(userId: string): Promise<RewardItem[]> {
    const items = await rpgStore.getInventory(userId);
    const rewards = await rpgStore.getRewards();
    return items.map(inv => {
      const rew = rewards.find(r => r.id === inv.rewardId) || inv.reward;
      return {
        ...(rew || {
          id: inv.rewardId,
          name: 'Equipped Item',
          description: '',
          category: 'gear',
          price: 0,
          icon: 'inventory_2'
        }),
        id: inv.rewardId,
        owned: true,
        equipped: inv.equipped
      } as RewardItem;
    });
  }

  async equipItem(userId: string, itemId: string): Promise<RewardItem> {
    const inventory = await rpgStore.getInventory(userId);
    const item = inventory.find(i => i.id === itemId || i.rewardId === itemId);
    if (!item) {
      throw new AppError('Item not found in your inventory', 404, 'NOT_FOUND');
    }

    await rpgStore.equipInventoryItem(userId, item.rewardId);

    const rewards = await rpgStore.getRewards();
    const rew = rewards.find(r => r.id === item.rewardId) || item.reward;

    const equipped: RewardItem = {
      ...(rew || {
        id: item.rewardId,
        name: 'Item',
        description: '',
        category: 'gear',
        price: 0,
        icon: 'inventory_2'
      }),
      id: item.rewardId,
      owned: true,
      equipped: true
    } as RewardItem;

    await rpgStore.logActivity({
      id: `act-${Date.now()}`,
      userId,
      actionType: 'ITEM_EQUIPPED',
      title: `🛡️ Equipped Gear: ${equipped.name}`,
      description: `Equipped ${equipped.name} into ${equipped.equipSlot || 'gear'} slot.`,
      createdAt: new Date().toISOString()
    });

    return equipped;
  }

  async unequipItem(userId: string, itemId: string): Promise<RewardItem> {
    const inventory = await rpgStore.getInventory(userId);
    const item = inventory.find(i => i.id === itemId || i.rewardId === itemId);
    if (!item) {
      throw new AppError('Item not found in your inventory', 404, 'NOT_FOUND');
    }

    await rpgStore.unequipInventoryItem(userId, item.rewardId);

    const rewards = await rpgStore.getRewards();
    const rew = rewards.find(r => r.id === item.rewardId) || item.reward;

    const unequipped: RewardItem = {
      ...(rew || {
        id: item.rewardId,
        name: 'Item',
        description: '',
        category: 'gear',
        price: 0,
        icon: 'inventory_2'
      }),
      id: item.rewardId,
      owned: true,
      equipped: false
    } as RewardItem;

    await rpgStore.logActivity({
      id: `act-${Date.now()}`,
      userId,
      actionType: 'ITEM_UNEQUIPPED',
      title: `Unequipped: ${unequipped.name}`,
      description: `Unequipped ${unequipped.name}.`,
      createdAt: new Date().toISOString()
    });

    return unequipped;
  }
}

export const inventoryService = new InventoryService();
