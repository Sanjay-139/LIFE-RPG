import React from 'react';

interface LevelBadgeProps {
  level: number;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  title,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-bold shadow-sm ${sizeClasses[size]} ${className}`}
    >
      <span className="material-symbols-outlined text-[16px]">military_tech</span>
      <span>LVL {level}</span>
      {title && <span className="font-medium text-on-primary-fixed-variant/80">• {title}</span>}
    </div>
  );
};
