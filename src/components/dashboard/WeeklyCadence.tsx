import React from 'react';
import { useGame } from '../../context/GameContext';

interface WeeklyCadenceProps {
  currentStreak: number;
  bestStreak: number;
}

export const WeeklyCadence: React.FC<WeeklyCadenceProps> = ({ currentStreak, bestStreak }) => {
  const { streakData } = useGame();

  // Authoritative weekly activity from backend (Monday to Sunday in user timezone)
  const weekDays =
    streakData?.weeklyActivity && streakData.weeklyActivity.length === 7
      ? streakData.weeklyActivity.map((d) => {
          const count = d.questsCompleted ?? d.completedQuests ?? 0;
          return {
            day: d.day.toUpperCase(),
            date: d.date,
            questsCompleted: count,
            isActive: d.active || count > 0,
            isToday: !!d.isToday,
            isFuture: !!d.isFuture,
          };
        })
      : (() => {
          const now = new Date();
          const currentDayIndex = now.getDay();
          const mondayOffset = (currentDayIndex + 6) % 7;
          const monday = new Date(now);
          monday.setDate(now.getDate() - mondayOffset);
          monday.setHours(0, 0, 0, 0);

          const dayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
          const todayStr = new Intl.DateTimeFormat('en-CA').format(now);

          return dayLabels.map((dayName, idx) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + idx);
            const dateStr = new Intl.DateTimeFormat('en-CA').format(d);
            const isToday = dateStr === todayStr;
            const isFuture = dateStr > todayStr;
            return {
              day: dayName,
              date: dateStr,
              questsCompleted: 0,
              isActive: false,
              isToday,
              isFuture,
            };
          });
        })();

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-card flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-bold text-base text-on-surface">Weekly Cadence & Streak</h3>
          <p className="text-xs text-on-surface-variant">
            {currentStreak === 0
              ? 'Complete your first quest today to ignite your streak fire.'
              : `${currentStreak} consecutive day${currentStreak === 1 ? '' : 's'} with validated quest execution.`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-error text-xs font-bold bg-error-container/60 px-3 py-1 rounded-full">
            <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
            <span>{currentStreak}-Day Active Streak</span>
          </div>
          <div className="flex items-center gap-1.5 text-secondary text-xs font-bold bg-secondary-fixed/60 px-3 py-1 rounded-full">
            <span className="material-symbols-outlined text-[16px]">trophy</span>
            <span>Best: {bestStreak} Days</span>
          </div>
        </div>
      </div>

      {/* 7-Day Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 pt-1">
        {weekDays.map((d) => (
          <div
            key={d.day}
            className={`rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 text-center border transition-all ${
              d.isToday
                ? 'bg-surface-container border-primary-container shadow-sm ring-2 ring-primary-fixed'
                : d.isActive
                ? 'bg-tertiary-fixed/20 border-tertiary-fixed'
                : 'bg-surface-container-low border-outline-variant/30'
            }`}
          >
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                d.isToday ? 'text-primary' : 'text-on-surface-variant'
              }`}
            >
              {d.day} {d.isToday && '(TODAY)'}
            </span>

            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                d.isActive
                  ? 'bg-tertiary text-on-tertiary font-bold shadow-sm'
                  : d.isToday
                  ? 'bg-primary-container text-on-primary'
                  : 'bg-surface-container-high text-outline'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {d.isActive ? 'check' : d.isFuture ? 'lock' : 'pending'}
              </span>
            </div>

            <span
              className={`text-[11px] font-semibold tabular-nums ${
                d.isActive
                  ? 'text-tertiary font-bold'
                  : d.isToday
                  ? 'text-primary font-bold'
                  : 'text-outline'
              }`}
            >
              {d.isFuture
                ? 'UPCOMING'
                : d.questsCompleted === 1
                ? '1 QUEST'
                : `${d.questsCompleted} QUESTS`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
