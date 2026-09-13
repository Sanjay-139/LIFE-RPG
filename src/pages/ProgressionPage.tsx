import React from 'react';
import { useGame } from '../context/GameContext';
import { LEVEL_MILESTONES } from '../data/progressionMilestones';

export const ProgressionPage: React.FC = () => {
  const { character } = useGame();

  const xpPercentage = Math.min(
    100,
    Math.round((character.currentXp / character.xpToNextLevel) * 100)
  );

  // SVG Non-Linear Curve Points for levels 0 to 15
  const levels = Array.from({ length: 16 }, (_, i) => i);
  const getXp = (lvl: number) => (lvl === 0 ? 0 : Math.round(100 * Math.pow(1.4, lvl - 1)));

  const maxLvl = 15;
  const maxXp = getXp(maxLvl);

  const curvePoints = levels
    .map((lvl) => {
      const x = 50 + (lvl / maxLvl) * 600;
      const y = 200 - (getXp(lvl) / maxXp) * 160;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto flex flex-col gap-6">
      {/*  */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-container" />
            <span className="text-xs text-outline uppercase font-bold tracking-wider">
              Mathematical Telemetry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mt-0.5">
            Non-Linear XP Progression
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Higher levels require exponentially deeper discipline and higher-tier quest completions.
          </p>
        </div>

        <div className="flex items-center gap-3 tabular-nums">
          <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-center">
            <span className="text-[10px] text-outline uppercase font-bold">Total Lifetime XP</span>
            <p className="text-lg font-black text-primary">{character.totalXp.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-center">
            <span className="text-[10px] text-outline uppercase font-bold">Current Tier</span>
            <p className="text-lg font-black text-on-surface">Level {character.level}</p>
          </div>
        </div>
      </div>

      {/*  */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-card flex flex-col gap-4">
        <div className="flex items-center justify-between text-xs font-bold tabular-nums">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">
              military_tech
            </span>
            <span className="text-base text-on-surface">Level {character.level} Progression</span>
          </div>
          <span className="text-primary text-sm font-black">
            {character.currentXp.toLocaleString()} / {character.xpToNextLevel.toLocaleString()} XP
            ({xpPercentage}%)
          </span>
        </div>

        <div className="h-4 w-full bg-surface-container-high rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-primary-container rounded-full transition-all duration-700 ease-out"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-xs text-on-surface-variant tabular-nums">
          <span>Current: Level {character.level} ({character.title})</span>
          <span className="font-bold text-tertiary">
            +{character.xpToNextLevel - character.currentXp} XP Needed for Level {character.level + 1}
          </span>
        </div>
      </div>

      {/*  */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-card flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-on-surface">XP Exponential Threshold Model</h3>
            <p className="text-xs text-on-surface-variant">
              Curve model: XP Required = 100 × (1.4)^(Level - 1)
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-surface-container text-xs font-mono font-bold text-primary">
            Exponential Scaling
          </span>
        </div>

        <div className="w-full overflow-x-auto bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
          <svg viewBox="0 0 700 240" className="w-full min-w-[600px] h-auto overflow-visible">
            {/*  */}
            <line x1="50" y1="40" x2="650" y2="40" stroke="#eaedff" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="50" y1="90" x2="650" y2="90" stroke="#eaedff" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="50" y1="140" x2="650" y2="140" stroke="#eaedff" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="50" y1="200" x2="650" y2="200" stroke="#c7c4d8" strokeWidth="1.5" />

            {/*  */}
            <polyline
              fill="none"
              stroke="#4f46e5"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={curvePoints}
            />

            {/*  */}
            {levels.map((lvl) => {
              const x = 50 + (lvl / maxLvl) * 600;
              const y = 200 - (getXp(lvl) / maxXp) * 160;
              const isCurrent = lvl === character.level;

              return (
                <g key={lvl} className="cursor-pointer">
                  <circle
                    cx={x}
                    cy={y}
                    r={isCurrent ? 7 : 3.5}
                    fill={isCurrent ? '#4f46e5' : '#ffffff'}
                    stroke="#4f46e5"
                    strokeWidth={isCurrent ? 3 : 1.5}
                  />
                  {isCurrent && (
                    <text
                      x={x}
                      y={y - 12}
                      textAnchor="middle"
                      className="text-[11px] font-bold fill-primary"
                    >
                      YOU (Lvl {character.level})
                    </text>
                  )}
                  <text
                    x={x}
                    y="218"
                    textAnchor="middle"
                    className={`text-[10px] font-semibold ${isCurrent ? 'fill-primary font-bold' : 'fill-outline'}`}
                  >
                    L{lvl}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/*  */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-card flex flex-col gap-4">
        <h3 className="text-base font-bold text-on-surface">Level Milestones & Tier Perks</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LEVEL_MILESTONES.map((ms) => {
            const isReached = character.level >= ms.level;
            const isCurrent = character.level === ms.level;

            return (
              <div
                key={ms.level}
                className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                  isCurrent
                    ? 'bg-primary-fixed/20 border-primary-container shadow-md ring-2 ring-primary-container'
                    : isReached
                    ? 'bg-surface-container-low border-tertiary-fixed'
                    : 'bg-surface-container-lowest border-outline-variant/30 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black uppercase text-primary">
                      Level {ms.level}
                    </span>
                    {isReached ? (
                      <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold">
                        {isCurrent ? 'Current' : 'Unlocked'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-outline font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">lock</span>
                        <span>Locked</span>
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-on-surface">{ms.title}</h4>
                  <span className="text-[11px] text-outline tabular-nums font-medium">
                    {ms.xpRequired.toLocaleString()} XP Threshold
                  </span>
                </div>

                <div className="space-y-1 text-xs text-on-surface-variant pt-2 border-t border-surface-container-high">
                  {ms.perks.map((p) => (
                    <div key={p} className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-tertiary text-[14px]">
                        verified
                      </span>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
