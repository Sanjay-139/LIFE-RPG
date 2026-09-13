import React from 'react';
import { CharacterSheet, UserProfile } from '../../types';
import { NavLink } from 'react-router-dom';
import { getAvatarAsset } from '../../data/avatars';

interface WelcomeHeroProps {
  character: CharacterSheet;
  user: UserProfile | null;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({ character, user }) => {
  const xpTarget = character.xpToNextLevel > 0 ? character.xpToNextLevel : 100;
  const xpPercentage = Math.min(
    100,
    Math.round((character.currentXp / xpTarget) * 100)
  );
  const xpRemaining = Math.max(0, xpTarget - character.currentXp);

  return (
    <div className="w-full bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-card flex flex-col lg:flex-row items-stretch justify-between gap-6">
      {/* Character Profile Overview */}
      <div className="flex items-center gap-5 min-w-0">
        <div className="relative shrink-0">
          <img
            src={getAvatarAsset(user?.avatar || character.avatar)}
            alt={user?.fullName || character.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-primary-container shadow-md bg-surface-container"
          />
          <span className="absolute -bottom-1 -right-1 bg-primary-container text-on-primary px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm">
            LVL {character.level}
          </span>
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight truncate">
              Welcome back, {user?.fullName || character.name}!
            </h1>
            <span className="bg-surface-container text-primary font-semibold text-xs px-2.5 py-0.5 rounded">
              {character.rank}
            </span>
          </div>

          <p className="text-sm text-on-surface-variant">
            {character.level === 0 && character.completedQuestsCount === 0
              ? 'Level 0 Baseline • Complete your first quest to begin your legacy'
              : `Level ${character.level} Adventurer • ${character.completedQuestsCount} Quests Conquered`}
          </p>

          {/*  */}
          <div className="flex items-center gap-4 mt-3 flex-wrap text-xs text-on-surface-variant">
            <NavLink
              to="/rewards"
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-secondary text-[18px]">
                monetization_on
              </span>
              <span className="font-bold text-on-surface tabular-nums">
                {character.gold.toLocaleString()}
              </span>{' '}
              Gold Available
            </NavLink>

            <div className="w-1 h-1 rounded-full bg-outline-variant" />

            <NavLink
              to="/streaks"
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-error text-[18px]">
                local_fire_department
              </span>
              <span className="font-bold text-on-surface tabular-nums">
                {character.streak} Days
              </span>{' '}
              Current Streak
            </NavLink>

            <div className="w-1 h-1 rounded-full bg-outline-variant" />

            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary-container text-[18px]">
                emoji_events
              </span>
              <span>
                Record: <strong className="text-on-surface tabular-nums">{character.bestStreak} Days</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/*  */}
      <div className="w-full lg:w-96 bg-surface-container-low rounded-xl p-4 border border-outline-variant/30 flex flex-col justify-between self-stretch">
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-1.5 text-primary">
            <span className="material-symbols-outlined text-[18px]">auto_graph</span>
            <span className="uppercase tracking-wider">Tier Progression</span>
          </div>
          <span className="text-primary tabular-nums">
            {character.currentXp.toLocaleString()} / {character.xpToNextLevel.toLocaleString()} XP
          </span>
        </div>

        <div className="my-2.5">
          <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-primary-container rounded-full transition-all duration-500"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1.5 text-xs text-outline tabular-nums">
            <span>Level {character.level} (Current)</span>
            <span className="font-semibold text-on-surface-variant">
              {xpRemaining.toLocaleString()} XP to Level {character.level + 1}
            </span>
          </div>
        </div>

        <div className="pt-2 bg-surface-container-lowest/80 rounded-lg px-2.5 py-1.5 text-[11px] text-on-surface-variant flex items-center justify-between">
          <span className="font-medium text-outline">Non-linear scaling:</span>
          <span className="font-semibold text-on-surface">
            Lvl 15 (15k XP) • Lvl 16 (22.5k XP)
          </span>
        </div>
      </div>
    </div>
  );
};
