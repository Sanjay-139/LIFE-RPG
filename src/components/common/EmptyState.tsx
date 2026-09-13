import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  subtitle,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`w-full py-12 px-6 flex flex-col items-center justify-center text-center bg-surface-container-low/50 rounded-xl border border-dashed border-outline-variant/50 ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-surface-container-high/60 flex items-center justify-center text-outline mb-4">
        <span className="material-symbols-outlined text-[30px]">{icon}</span>
      </div>
      <h3 className="font-bold text-base text-on-surface uppercase tracking-wide mb-1">
        {title}
      </h3>
      {subtitle && (
        <p className="text-sm text-on-surface-variant max-w-md mb-6 italic">
          "{subtitle}"
        </p>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-container text-on-primary font-semibold text-sm hover:opacity-95 shadow-sm active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
