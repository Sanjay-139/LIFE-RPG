import React from 'react';
import { useGame } from '../context/GameContext';
import { AttributeCard } from '../components/character/AttributeCard';
import { CharacterRadarChart } from '../components/character/CharacterRadarChart';

export const AttributesPage: React.FC = () => {
  const { character, unallocatedPoints, allocateAttributePoint } = useGame();

  const mappings = [
    {
      action: 'Gym & Heavy Lifting',
      attribute: 'Strength',
      bonus: '+15 to +20 STR XP',
      icon: 'fitness_center',
      color: 'text-amber-700',
    },
    {
      action: 'LeetCode & System Architecture',
      attribute: 'Intellect',
      bonus: '+20 to +30 INT XP',
      icon: 'psychology',
      color: 'text-violet-700',
    },
    {
      action: 'Distance Running & VO2 Cardio',
      attribute: 'Vitality',
      bonus: '+15 to +25 VIT XP',
      icon: 'spa',
      color: 'text-sky-700',
    },
    {
      action: 'Pomodoro Blocks & Deep Reading',
      attribute: 'Discipline',
      bonus: '+10 to +20 DIS XP',
      icon: 'hourglass_top',
      color: 'text-emerald-700',
    },
    {
      action: 'Project Demos & Design Showcases',
      attribute: 'Charisma',
      bonus: '+15 to +25 CHA XP',
      icon: 'palette',
      color: 'text-rose-700',
    },
  ];

  return (
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-container" />
            <span className="text-xs text-outline uppercase font-bold tracking-wider">
              Telemetry Vectors
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mt-0.5">
            Core Attribute System
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Empirically mapped real-world tasks driving your character's multi-vector capabilities.
          </p>
        </div>

        {unallocatedPoints > 0 ? (
          <div className="flex items-center gap-3 p-3 bg-tertiary-fixed/30 border border-tertiary rounded-xl">
            <span className="material-symbols-outlined text-tertiary text-[24px]">add_circle</span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-on-surface">
                {unallocatedPoints} Attribute Points Ready
              </span>
              <span className="text-[11px] text-outline">Click (+) on any attribute to assign</span>
            </div>
          </div>
        ) : (
          <div className="px-3.5 py-1.5 rounded-xl bg-surface-container text-outline text-xs font-semibold">
            All points allocated
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/*  */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {Object.values(character.attributes).map((attr) => (
            <AttributeCard
              key={attr.key}
              attribute={attr}
              canAllocate={unallocatedPoints > 0}
              onAllocate={() => allocateAttributePoint(attr.key)}
            />
          ))}

          {/*  */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-card mt-2">
            <h3 className="text-base font-bold text-on-surface mb-3">
              Task Category to Attribute Translation Protocols
            </h3>
            <div className="divide-y divide-surface-container-high text-xs">
              {mappings.map((m) => (
                <div key={m.action} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className={`material-symbols-outlined text-[18px] ${m.color}`}>
                      {m.icon}
                    </span>
                    <span className="font-semibold text-on-surface">{m.action}</span>
                  </div>
                  <div className="flex items-center gap-3 tabular-nums">
                    <span className="font-bold text-on-surface-variant">{m.attribute}</span>
                    <span className="text-tertiary font-bold">{m.bonus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/*  */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <CharacterRadarChart character={character} size={260} />
        </div>
      </div>
    </div>
  );
};
