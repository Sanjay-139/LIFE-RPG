import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { RewardCard } from '../components/rewards/RewardCard';
import { RewardCategory } from '../types';

export const RewardsPage: React.FC = () => {
  const { character, rewards } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const categories: { key: string; label: string; icon: string }[] = [
    { key: 'all', label: 'All Items', icon: 'storefront' },
    { key: 'avatar_item', label: 'Character Items', icon: 'shield' },
    { key: 'theme', label: 'Themes', icon: 'palette' },
    { key: 'profile_frame', label: 'Frames', icon: 'crop_square' },
    { key: 'title', label: 'Titles', icon: 'military_tech' },
    { key: 'cosmetic', label: 'Cosmetics', icon: 'auto_fix_high' },
  ];

  const filteredRewards = rewards
    .filter((r) => selectedCategory === 'all' || r.category === selectedCategory)
    .sort((a, b) => (sortOrder === 'asc' ? a.price - b.price : b.price - a.price));

  return (
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto flex flex-col gap-6">
      {/*  */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="text-xs text-outline uppercase font-bold tracking-wider">
              Virtual Economy
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mt-0.5">
            Rewards Bazaar
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Exchange your earned gold bullion for gear, aesthetic themes, titles, and artifacts.
          </p>
        </div>

        {/*  */}
        <div className="flex items-center gap-3 shrink-0 tabular-nums">
          <div className="p-3.5 rounded-xl bg-secondary-fixed text-on-secondary-fixed border border-secondary/20 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-secondary text-on-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">monetization_on</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-on-secondary-fixed-variant">
                Available Gold Balance
              </span>
              <span className="text-xl font-black text-on-secondary-fixed">
                {character.gold.toLocaleString()} G
              </span>
            </div>
          </div>
        </div>
      </div>

      {/*  */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat.key
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface text-xs font-bold shrink-0 hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">swap_vert</span>
          <span>Price: {sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
        </button>
      </div>

      {/*  */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRewards.map((item) => (
          <RewardCard
            key={item.id}
            item={item}
            currentGold={character.gold}
            characterLevel={character.level}
          />
        ))}
      </div>
    </div>
  );
};
