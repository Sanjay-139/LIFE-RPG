import { initDatabase, pool, isPostgresConnected, query } from '../../config/database.js';
import { rpgStore } from '../rpgStore.js';
import { SEED_REWARDS, SEED_ACHIEVEMENTS } from './rpg.data.js';

export async function seedDatabase() {
  console.log('🌱 Starting LIFE RPG database seeding...');
  await initDatabase();

  // 1. Seed static rewards into Postgres if connected
  if (pool && isPostgresConnected) {
    console.log('🐘 Seeding PostgreSQL reference rewards & achievements...');
    for (const reward of SEED_REWARDS) {
      await query(
        `INSERT INTO rewards (id, name, description, category, price, icon, image_url, attribute_buff, equip_slot, required_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           price = EXCLUDED.price,
           icon = EXCLUDED.icon,
           image_url = EXCLUDED.image_url,
           attribute_buff = EXCLUDED.attribute_buff,
           equip_slot = EXCLUDED.equip_slot,
           required_level = EXCLUDED.required_level`,
        [
          reward.id,
          reward.name,
          reward.description,
          reward.category,
          reward.price,
          reward.icon,
          reward.imageUrl,
          reward.attributeBuff ? JSON.stringify(reward.attributeBuff) : null,
          reward.equipSlot,
          reward.requiredLevel || 1
        ]
      );
    }

    // 2. Seed static achievements into Postgres if connected
    for (const ach of SEED_ACHIEVEMENTS) {
      await query(
        `INSERT INTO achievements (id, title, description, category, icon, max_progress, xp_reward, gold_reward, badge_title)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           category = EXCLUDED.category,
           icon = EXCLUDED.icon,
           max_progress = EXCLUDED.max_progress,
           xp_reward = EXCLUDED.xp_reward,
           gold_reward = EXCLUDED.gold_reward,
           badge_title = EXCLUDED.badge_title`,
        [
          ach.id,
          ach.title,
          ach.description,
          ach.category,
          ach.icon,
          ach.maxProgress,
          ach.xpReward,
          ach.goldReward,
          ach.badgeTitle
        ]
      );
    }
  }

  // Ensure local memory store has fresh reference definitions
  rpgStore.seedStaticData();
  rpgStore.saveToDiskImmediate();

  console.log('🎉 Seeding completed successfully! Reference rewards and achievements initialized.');
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}
