import React from 'react';
import { useGame } from '../context/GameContext';
import { WeeklyCadence } from '../components/dashboard/WeeklyCadence';

export const StreaksPage: React.FC = () => {
  const { character, streakData, monthlyActivity } = useGame();

  const now = new Date();
  const currentYear = monthlyActivity?.year ?? now.getFullYear();
  const totalDaysInMonth = monthlyActivity?.totalDays ?? new Date(currentYear, now.getMonth() + 1, 0).getDate();
  const todayDayNumber = now.getDate();

  // Authoritative calendar days from backend (NO client-side fabricated streaks)
  const daysInMonth =
    monthlyActivity?.days && monthlyActivity.days.length > 0
      ? monthlyActivity.days.map((d) => ({
          day: d.day,
          date: d.date,
          completed: d.completed || d.active,
          questsCompleted: d.completedQuests ?? d.questsCompleted ?? 0,
          isToday: d.isToday,
          isFuture: d.isFuture,
        }))
      : Array.from({ length: totalDaysInMonth }, (_, i) => {
          const dayNumber = i + 1;
          const isToday = dayNumber === todayDayNumber;
          const isFuture = dayNumber > todayDayNumber;
          return {
            day: dayNumber,
            date: '',
            completed: false,
            questsCompleted: 0,
            isToday,
            isFuture,
          };
        });

  const activeDaysThisMonth =
    monthlyActivity?.activeDays ?? daysInMonth.filter((d) => d.completed).length;
  const daysElapsed = monthlyActivity?.elapsedDays ?? todayDayNumber;
  const consistencyRate =
    monthlyActivity?.consistencyRate ??
    (daysElapsed > 0 ? Math.round((activeDaysThisMonth / daysElapsed) * 100) : 0);

  const milestones = [
    { days: 3, title: 'Flame Spark', reward: '+50 XP', reached: (character.bestStreak || 0) >= 3 },
    { days: 7, title: 'Weekly Discipline', reward: '+150 XP • +50 Gold', reached: (character.bestStreak || 0) >= 7 },
    { days: 14, title: 'Fortnight Fortitude', reward: '+250 XP • Badge Unlocked', reached: (character.bestStreak || 0) >= 14 },
    { days: 21, title: 'Habit Neuroplasticity', reward: '+350 XP • +100 Gold', reached: (character.bestStreak || 0) >= 21 },
    { days: 30, title: 'Iron Will Paragon', reward: '+600 XP • Exclusive Title', reached: (character.bestStreak || 0) >= 30 },
    { days: 60, title: 'Ascended Consistency', reward: '+1,500 XP • Vault Theme', reached: (character.bestStreak || 0) >= 60 },
  ];

  const nextMilestone = milestones.find((m) => !m.reached);
  const nextMilestoneText = nextMilestone ? `${nextMilestone.days} Days` : 'Max Tier Reached';

  return (
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto flex flex-col gap-6">
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-error-container text-error flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[36px]">local_fire_department</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-error tracking-wider">
                Unbroken Discipline
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  character.streak > 0
                    ? 'bg-error/10 text-error'
                    : 'bg-surface-container-high text-outline'
                }`}
              >
                {character.streak > 0 ? 'Active Fire' : 'Kindle the Fire'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight mt-0.5 tabular-nums">
              {character.streak} Day Streak
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Every consecutive day builds compounding neural pathways and multiplies XP bonuses.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 tabular-nums">
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-center">
            <span className="text-[10px] text-outline uppercase font-bold">Personal Record</span>
            <p className="text-xl font-black text-on-surface">{character.bestStreak} Days</p>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-center">
            <span className="text-[10px] text-outline uppercase font-bold">Next Milestone</span>
            <p className="text-xl font-black text-secondary">{nextMilestoneText}</p>
          </div>
        </div>
      </div>

      <WeeklyCadence currentStreak={character.streak} bestStreak={character.bestStreak} />

      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-card flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-on-surface">Monthly Activity Matrix</h3>
            <p className="text-xs text-on-surface-variant">
              {activeDaysThisMonth} of {daysElapsed} days validated with real-world quest execution
            </p>
          </div>
          <span className="text-xs font-bold text-tertiary tabular-nums">
            {consistencyRate}% Consistency
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-2">
          {daysInMonth.map((d) => (
            <div
              key={d.day}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                d.completed
                  ? 'bg-tertiary-fixed/30 border-tertiary-fixed text-tertiary'
                  : d.isToday
                  ? 'bg-primary-container text-on-primary border-primary-container shadow-sm ring-2 ring-primary-fixed'
                  : 'bg-surface-container-low border-outline-variant/30 text-outline'
              }`}
            >
              <span className="text-[10px] font-bold">DAY {d.day}</span>
              <span className="material-symbols-outlined text-[16px]">
                {d.completed ? 'check' : d.isToday ? 'pending' : d.isFuture ? 'lock' : 'close'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-card flex flex-col gap-4">
        <h3 className="text-base font-bold text-on-surface">Consecutive Day Milestones</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {milestones.map((m) => (
            <div
              key={m.days}
              className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                m.reached
                  ? 'bg-surface-container-low border-tertiary-fixed'
                  : 'bg-surface-container-lowest border-outline-variant/30 opacity-70'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    m.reached
                      ? 'bg-tertiary text-on-tertiary'
                      : 'bg-surface-container-high text-outline'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {m.reached ? 'verified' : 'lock'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-on-surface">{m.title}</span>
                  <span className="text-[11px] text-outline font-medium">{m.reward}</span>
                </div>
              </div>

              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  m.reached
                    ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                    : 'bg-surface-container text-outline'
                }`}
              >
                {m.days}D
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
