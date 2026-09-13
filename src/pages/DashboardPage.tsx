import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { WelcomeHero } from '../components/dashboard/WelcomeHero';
import { WeeklyCadence } from '../components/dashboard/WeeklyCadence';
import { QuestCard } from '../components/quests/QuestCard';
import { QuestDrawer } from '../components/quests/QuestDrawer';
import { EmptyState } from '../components/common/EmptyState';
import { NavLink } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { character, quests, dailyMissions, toggleDailyMission, achievements } = useGame();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Today's active quests
  const todayQuests = quests.slice(0, 5);

  const allMissionsCompleted = dailyMissions.length > 0 && dailyMissions.every((m) => m.completed);

  // Dynamic daily attribute gain
  const dailyAttrGain = Object.values(character.attributes).reduce(
    (acc, curr) => acc + (curr.recentGain || 0),
    0
  );

  // Dynamic unlocked achievements
  const unlockedAchievements = achievements.filter((a) => a.unlocked);

  return (
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto flex flex-col gap-6">
      <WelcomeHero character={character} user={user} />

      {drawerOpen && (
        <QuestDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-card flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-6 bg-primary-container rounded-full" />
                <div>
                  <h2 className="font-bold text-lg text-on-surface tracking-tight">
                    Today's Focus Quests
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Curated mission priorities for peak productivity today
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDrawerOpen(!drawerOpen)}
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container text-on-primary text-xs font-bold hover:bg-primary transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>New Quest</span>
                </button>
              </div>
            </div>

            {todayQuests.length > 0 ? (
              <div className="flex flex-col gap-3">
                {todayQuests.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="checklist"
                title="YOUR QUEST BOARD IS EMPTY"
                subtitle="Every legend starts with one quest."
                actionText="Commission Quest"
                onAction={() => setDrawerOpen(true)}
              />
            )}

            <div className="mt-4 pt-3 border-t border-surface-container-high flex justify-between items-center text-xs">
              <span className="text-outline">Showing primary mission deck</span>
              <NavLink
                to="/quests"
                className="text-primary font-bold hover:underline flex items-center gap-1"
              >
                <span>View Full Quest Board ({quests.length})</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </NavLink>
            </div>
          </div>

          <WeeklyCadence
            currentStreak={character.streak}
            bestStreak={character.bestStreak}
          />

          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">
                  task_alt
                </span>
                <div>
                  <h3 className="font-bold text-base text-on-surface">Daily Missions</h3>
                  <p className="text-xs text-on-surface-variant">
                    Complete all daily habits to trigger the Daily Bonus
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 tabular-nums">
                <span className="px-2.5 py-1 rounded bg-secondary-fixed text-on-secondary-fixed text-xs font-bold">
                  Bonus: +250 XP • +100 G
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {dailyMissions.map((mission) => (
                <div
                  key={mission.id}
                  onClick={() => toggleDailyMission(mission.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    mission.completed
                      ? 'bg-tertiary-fixed/30 border-tertiary-fixed text-on-surface'
                      : 'bg-surface-container-low border-outline-variant/30 hover:border-outline-variant'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                        mission.completed
                          ? 'bg-tertiary text-on-tertiary'
                          : 'border border-outline text-transparent'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">check</span>
                    </div>
                    <span
                      className={`text-xs font-semibold leading-tight truncate ${
                        mission.completed ? 'line-through text-outline' : 'text-on-surface'
                      }`}
                    >
                      {mission.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-bold tabular-nums">
                    <span className="text-primary">+{mission.xp} XP</span>
                    <span className="text-secondary">+{mission.gold} G</span>
                  </div>
                </div>
              ))}
            </div>

            {allMissionsCompleted && (
              <div className="p-3 rounded-xl bg-tertiary-fixed/50 border border-tertiary flex items-center justify-between text-xs font-bold text-on-tertiary-fixed">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Daily Bonus Complete! 100% Habit Discipline.</span>
                </span>
                <span className="text-secondary font-extrabold">+250 XP CLAIMED</span>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-on-surface">Attributes</h3>
                <p className="text-xs text-on-surface-variant">Core competencies & active growth</p>
              </div>
              <NavLink
                to="/character/attributes"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                title="Manage Attributes"
              >
                <span className="material-symbols-outlined text-[20px]">tune</span>
              </NavLink>
            </div>

            <div className="flex flex-col gap-3.5">
              {Object.values(character.attributes).map((attr) => (
                <div key={attr.key} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-[18px] ${attr.textClass}`}>
                        {attr.icon}
                      </span>
                      <span className="font-bold text-on-surface">{attr.name}</span>
                      <span className="text-[11px] text-outline">Lvl {attr.level}</span>
                    </div>
                    <div className="flex items-center gap-1.5 tabular-nums font-bold">
                      <span className="text-on-surface">{attr.value}/100</span>
                      <span className="text-tertiary text-[11px] font-semibold">
                        (+{attr.recentGain || 0} XP)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        attr.key === 'strength'
                          ? 'bg-amber-500'
                          : attr.key === 'intellect'
                          ? 'bg-violet-600'
                          : attr.key === 'vitality'
                          ? 'bg-sky-500'
                          : attr.key === 'discipline'
                          ? 'bg-emerald-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, attr.value)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 pt-3 bg-surface-container-low rounded-xl p-3 flex items-center justify-between text-xs border border-outline-variant/30">
              <span className="text-on-surface-variant font-medium">Daily Attribute Gain:</span>
              <span className="font-bold text-tertiary tabular-nums">
                +{dailyAttrGain} XP Acquired
              </span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-on-surface">Achievements</h3>
                <p className="text-xs text-on-surface-variant">Milestones recently unlocked</p>
              </div>
              <NavLink
                to="/achievements"
                className="text-xs font-bold text-primary hover:underline"
              >
                View All
              </NavLink>
            </div>

            {unlockedAchievements.length > 0 ? (
              <div className="flex flex-col gap-3">
                {unlockedAchievements.slice(0, 2).map((ach) => (
                  <div
                    key={ach.id}
                    className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">
                        {ach.icon || 'military_tech'}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-on-surface truncate">
                          {ach.title}
                        </span>
                        <span className="text-[10px] text-tertiary font-bold">Unlocked</span>
                      </div>
                      <p className="text-xs text-on-surface-variant line-clamp-1">
                        {ach.description}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-secondary tabular-nums">
                        <span>+{ach.xpReward} XP</span> • <span>+{ach.goldReward} Gold</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-surface-container-low border border-dashed border-outline-variant/40 text-center flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-surface-container-high text-outline flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">military_tech</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">No achievements unlocked yet</p>
                  <p className="text-[11px] text-on-surface-variant">
                    Complete your first quest to unlock the First Quest milestone!
                  </p>
                </div>
                <NavLink
                  to="/quests"
                  className="mt-1 text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <span>Explore Quests</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
