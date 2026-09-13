import React from 'react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'COULD NOT SAVE QUEST',
  message = "We couldn't save your quest. Your progress has not been lost.",
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`w-full p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-error-container/40 border border-error-container rounded-xl text-on-surface ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-error text-on-error flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[22px]">warning</span>
        </div>
        <div className="flex flex-col">
          <h4 className="font-bold text-sm text-error tracking-tight">{title}</h4>
          <p className="text-sm text-on-surface-variant">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="px-4 py-2 rounded-lg bg-error text-on-error text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shrink-0"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
