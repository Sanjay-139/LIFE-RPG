import React from 'react';
import { AttributeKey } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'neutral' | AttributeKey;
  size?: 'sm' | 'md';
  icon?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  icon,
  className = '',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'strength':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/25';
      case 'intellect':
        return 'bg-violet-500/10 text-violet-700 border-violet-500/25';
      case 'vitality':
        return 'bg-sky-500/10 text-sky-700 border-sky-500/25';
      case 'discipline':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25';
      case 'charisma':
        return 'bg-rose-500/10 text-rose-700 border-rose-500/25';
      case 'primary':
        return 'bg-primary-fixed text-on-primary-fixed-variant border-primary/20';
      case 'secondary':
        return 'bg-secondary-fixed text-on-secondary-fixed border-secondary/20';
      case 'tertiary':
        return 'bg-tertiary-fixed text-on-tertiary-fixed border-tertiary/20';
      case 'error':
        return 'bg-error-container text-on-error-container border-error/20';
      case 'neutral':
      default:
        return 'bg-surface-container text-on-surface-variant border-outline-variant/40';
    }
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 tracking-wider',
    md: 'text-xs px-2.5 py-1 tracking-normal',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold uppercase rounded border transition-colors ${getVariantStyles()} ${
        sizeStyles[size]
      } ${className}`}
    >
      {icon && <span className="material-symbols-outlined text-[14px] leading-none">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
