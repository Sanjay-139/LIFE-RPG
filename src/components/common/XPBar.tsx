import React from 'react';

interface XPBarProps {
  currentXp: number;
  xpToNextLevel: number;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

export const XPBar: React.FC<XPBarProps> = ({
  currentXp,
  xpToNextLevel,
  size = 'md',
  showLabels = true,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((currentXp / xpToNextLevel) * 100)));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {showLabels && (
        <div className="flex items-center justify-between text-xs font-semibold tabular-nums">
          <span className="text-on-surface-variant uppercase tracking-wider">XP Progress</span>
          <span className="text-primary-container font-bold">
            {currentXp.toLocaleString()} / {xpToNextLevel.toLocaleString()} ({percentage}%)
          </span>
        </div>
      )}
      <div
        className={`w-full bg-surface-container-high rounded-full overflow-hidden p-0.5 ${heightClasses[size]}`}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-primary-container rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
