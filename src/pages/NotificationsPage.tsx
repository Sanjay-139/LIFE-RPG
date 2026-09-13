import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { EmptyState } from '../components/common/EmptyState';

export const NotificationsPage: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotifications();

  return (
    <div className="px-4 sm:px-8 py-6 max-w-4xl mx-auto flex flex-col gap-6">
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-container" />
            <span className="text-xs text-outline uppercase font-bold tracking-wider">
              Telemetry Feed
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mt-0.5">
            Transmission Log
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Chronological audit trail of quest drops, leveling milestones, and system notices.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={markAllAsRead}
            className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-colors"
          >
            Mark All Read
          </button>
          <button
            type="button"
            onClick={clearNotifications}
            className="px-3 py-1.5 rounded-lg text-error hover:bg-error-container/30 text-xs font-bold transition-colors"
          >
            Clear Log
          </button>
        </div>
      </div>

      {/*  */}
      {notifications.length > 0 ? (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all cursor-pointer ${
                n.read
                  ? 'bg-surface-container-lowest border-outline-variant/30 opacity-75'
                  : 'bg-surface-container-lowest border-primary-container shadow-sm ring-1 ring-primary-container/30'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  n.type === 'level_up'
                    ? 'bg-primary-fixed text-on-primary-fixed-variant'
                    : n.type === 'streak_increased'
                    ? 'bg-error-container text-on-error-container'
                    : n.type === 'quest_completed'
                    ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                    : 'bg-surface-container-low text-outline'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {n.type === 'level_up'
                    ? 'military_tech'
                    : n.type === 'streak_increased'
                    ? 'local_fire_department'
                    : n.type === 'quest_completed'
                    ? 'check_circle'
                    : 'notifications'}
                </span>
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface">{n.title}</span>
                  <span className="text-[10px] text-outline tabular-nums">{n.timestamp}</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                  {n.message}
                </p>
                {(n.rewardXp !== undefined || n.rewardGold !== undefined) && (
                  <div className="flex items-center gap-2 mt-2 text-[11px] font-bold tabular-nums">
                    {n.rewardXp ? <span className="text-primary">+{n.rewardXp} XP</span> : null}
                    {n.rewardGold ? <span className="text-secondary">+{n.rewardGold} G</span> : null}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="notifications_off"
          title="NO TRANSMISSIONS LOGGED"
          subtitle="All recent telemetry feeds have been acknowledged."
        />
      )}
    </div>
  );
};
