import React from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { CharacterRadarChart } from '../components/character/CharacterRadarChart';
import { AttributeCard } from '../components/character/AttributeCard';
import { EquipmentSlots } from '../components/character/EquipmentSlots';
import { NavLink } from 'react-router-dom';
import { getAvatarAsset } from '../data/avatars';

export const CharacterPage: React.FC = () => {
  const { character, rewards, unallocatedPoints, allocateAttributePoint } = useGame();
  const { user } = useAuth();

  const equippedRewards = rewards.filter((r) => r.equipped);
  const xpPercentage = Math.min(
    100,
    Math.round((character.currentXp / character.xpToNextLevel) * 100)
  );

  return (
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto flex flex-col gap-6">
      {/*  */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-outline-variant/40 shadow-card flex flex-col lg:flex-row items-stretch justify-between gap-6">
        <div className="flex items-center gap-5 min-w-0">
          <div className="relative shrink-0">
            <img
              src={getAvatarAsset(user?.avatar || character.avatar)}
              alt={character.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-primary-container shadow-md"
            />
            <span className="absolute -bottom-2 -right-2 bg-primary-container text-on-primary px-3 py-0.5 rounded-full text-xs font-black shadow">
              LVL {character.level}
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight truncate">
                {user?.fullName || character.name}
              </h1>
              <span className="bg-primary-fixed text-on-primary-fixed-variant text-xs font-bold px-2.5 py-0.5 rounded">
                {character.rank}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
              {user?.classType || 'Grand Sage & Code Architect'} • Master of Disciplined Agency
            </p>

            <div className="flex items-center gap-4 mt-3 flex-wrap text-xs text-on-surface-variant tabular-nums">
              <span className="flex items-center gap-1 text-secondary font-bold">
                <span className="material-symbols-outlined text-[18px]">monetization_on</span>
                <span>{character.gold.toLocaleString()} Gold</span>
              </span>
              <div className="w-1 h-1 rounded-full bg-outline-variant" />
              <span className="flex items-center gap-1 text-error font-bold">
                <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
                <span>{character.streak} Day Streak</span>
              </span>
              <div className="w-1 h-1 rounded-full bg-outline-variant" />
              <span className="flex items-center gap-1 text-primary font-bold">
                <span className="material-symbols-outlined text-[18px]">checklist</span>
                <span>{character.completedQuestsCount} Quests Cleared</span>
              </span>
            </div>
          </div>
        </div>

        {/*  */}
        <div className="w-full lg:w-80 bg-surface-container-low rounded-xl p-4 border border-outline-variant/30 flex flex-col justify-between self-stretch">
          <div className="flex items-center justify-between text-xs font-bold tabular-nums">
            <span className="text-outline uppercase tracking-wider text-[10px]">Tier Telemetry</span>
            <span className="text-primary font-extrabold">
              {character.currentXp.toLocaleString()} / {character.xpToNextLevel.toLocaleString()} XP
            </span>
          </div>

          <div className="my-2">
            <div className="h-2.5 w-full bg-surface-container-high rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-primary-container rounded-full transition-all duration-500"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-1 text-[11px] text-outline tabular-nums">
              <span>Level {character.level}</span>
              <span className="font-semibold text-tertiary">
                +{character.xpToNextLevel - character.currentXp} XP to Level {character.level + 1}
              </span>
            </div>
          </div>

          <NavLink
            to="/progression"
            className="text-xs font-bold text-primary hover:underline text-center flex items-center justify-center gap-1"
          >
            <span>View Full Progression Curve</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </NavLink>
        </div>
      </div>

      {/*  */}
      <EquipmentSlots equippedItems={equippedRewards} />

      {/*  */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/*  */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <CharacterRadarChart character={character} size={260} />

          {unallocatedPoints > 0 && (
            <div className="p-4 rounded-2xl bg-tertiary-fixed/30 border border-tertiary flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-on-surface">Unallocated Points</span>
                <p className="text-xs text-on-surface-variant">
                  {unallocatedPoints} points available from leveling up
                </p>
              </div>
              <NavLink
                to="/character/attributes"
                className="px-3 py-1.5 rounded-lg bg-tertiary text-on-tertiary text-xs font-bold"
              >
                Allocate
              </NavLink>
            </div>
          )}
        </div>

        {/*  */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-on-surface">RPG Core Attributes</h2>
              <p className="text-xs text-on-surface-variant">
                Real-world execution driving gamified attribute mastery
              </p>
            </div>
            <span className="text-xs font-bold text-primary bg-primary-fixed px-3 py-1 rounded-full">
              5 Active Vectors
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {Object.values(character.attributes).map((attr) => (
              <AttributeCard
                key={attr.key}
                attribute={attr}
                canAllocate={unallocatedPoints > 0}
                onAllocate={() => allocateAttributePoint(attr.key)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
