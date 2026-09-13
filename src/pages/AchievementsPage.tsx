import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export const AchievementsPage: React.FC = () => {
  const { achievements, claimAchievement } = useGame();
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const handleClaim = async (id: string) => {
    try {
      setClaimingId(id);
      await claimAchievement(id);
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto flex flex-col gap-6">
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="text-xs text-outline uppercase font-bold tracking-wider">
              Hall of Milestones
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mt-0.5">
            Achievements & Badges
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Permanent legacy records commemorating peak discipline and breakthrough events.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-center tabular-nums shrink-0">
          <span className="text-[10px] text-outline uppercase font-bold">Unlocked</span>
          <p className="text-xl font-black text-primary">
            {unlockedCount} / {achievements.length}
          </p>
        </div>
      </div>

      {achievements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => {
            const max = ach.maxProgress || 1;
            const percentage = Math.min(100, Math.round(((ach.progress || 0) / max) * 100));

            return (
              <div
                key={ach.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
                  ach.unlocked
                    ? 'bg-surface-container-lowest border-outline-variant/40 shadow-card hover:shadow-card-hover'
                    : 'bg-surface-container-lowest border-outline-variant/30 opacity-75'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      ach.unlocked
                        ? 'bg-secondary-fixed text-on-secondary-fixed shadow-sm'
                        : 'bg-surface-container-high text-outline'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[24px]">
                      {ach.icon || 'military_tech'}
                    </span>
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-on-surface tracking-tight truncate">
                        {ach.title}
                      </span>
                      {ach.unlocked ? (
                        <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold">
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-[10px] text-outline font-bold flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[13px]">lock</span>
                          <span>Locked</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-primary uppercase mt-0.5">
                      {ach.badgeTitle || ach.category}
                    </span>
                    <p className="text-xs text-on-surface-variant line-clamp-2 mt-1 leading-relaxed">
                      {ach.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-surface-container-high">
                  <div className="flex justify-between text-[11px] tabular-nums font-semibold">
                    <span className="text-outline">Progress</span>
                    <span className="text-on-surface">
                      {(ach.progress || 0).toLocaleString()} / {max.toLocaleString()} ({percentage}%)
                    </span>
                  </div>

                  <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        ach.unlocked ? 'bg-tertiary' : 'bg-primary-container'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <div className="flex items-center gap-1.5 font-bold tabular-nums">
                      <span className="text-primary">+{ach.xpReward} XP</span>
                      <span className="text-secondary">+{ach.goldReward} G</span>
                    </div>
                    {ach.unlocked && (
                      <button
                        onClick={() => handleClaim(ach.id)}
                        disabled={claimingId === ach.id}
                        type="button"
                        className="px-2.5 py-1 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-[10px] font-bold transition-all disabled:opacity-50"
                      >
                        {claimingId === ach.id ? 'Claiming...' : 'Claimed'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-surface-container-high text-outline flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px]">military_tech</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-on-surface">No Achievements Found</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mt-1">
              Start clearing quests and building streaks to populate your trophy hall.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
