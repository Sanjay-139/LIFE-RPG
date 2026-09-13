import React from 'react';
import { useNotifications, ToastMessage } from '../../context/NotificationContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({
  toast,
  onDismiss,
}) => {
  const getIconAndBg = () => {
    switch (toast.type) {
      case 'level_up':
        return {
          icon: 'military_tech',
          bg: 'bg-primary-container text-on-primary border-primary-container',
          iconBg: 'bg-white/20 text-white',
        };
      case 'achievement_unlocked':
        return {
          icon: 'emoji_events',
          bg: 'bg-surface-container-lowest text-on-surface border-secondary shadow-md',
          iconBg: 'bg-secondary-fixed text-on-secondary-fixed',
        };
      case 'xp_drop':
        return {
          icon: 'swords',
          bg: 'bg-surface-container-lowest text-on-surface border-primary-container shadow-md',
          iconBg: 'bg-primary-fixed text-on-primary-fixed-variant',
        };
      case 'success':
        return {
          icon: 'check_circle',
          bg: 'bg-surface-container-lowest text-on-surface border-tertiary shadow-sm',
          iconBg: 'bg-tertiary-fixed text-on-tertiary-fixed',
        };
      case 'error':
        return {
          icon: 'error',
          bg: 'bg-surface-container-lowest text-on-surface border-error shadow-sm',
          iconBg: 'bg-error-container text-on-error-container',
        };
      default:
        return {
          icon: 'info',
          bg: 'bg-surface-container-lowest text-on-surface border-outline-variant shadow-sm',
          iconBg: 'bg-surface-container text-outline',
        };
    }
  };

  const { icon, bg, iconBg } = getIconAndBg();

  return (
    <div
      className={`pointer-events-auto p-4 rounded-xl border flex items-start gap-3 transition-all duration-300 animate-slide-up ${bg}`}
      role="alert"
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-sm leading-snug">{toast.title}</span>
          <button
            onClick={onDismiss}
            className="text-current opacity-60 hover:opacity-100 transition-opacity"
            type="button"
            aria-label="Dismiss alert"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
        <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{toast.message}</p>
        {(toast.xp !== undefined || toast.gold !== undefined) && (
          <div className="flex items-center gap-2 mt-2 tabular-nums">
            {toast.xp !== undefined && (
              <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant font-bold text-xs">
                +{toast.xp} XP
              </span>
            )}
            {toast.gold !== undefined && (
              <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-bold text-xs">
                +{toast.gold} Gold
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
