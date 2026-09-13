import React from 'react';
import { AttributeStat } from '../../types';

interface AttributeCardProps {
  attribute: AttributeStat;
  canAllocate?: boolean;
  onAllocate?: () => void;
}

export const AttributeCard: React.FC<AttributeCardProps> = ({
  attribute,
  canAllocate,
  onAllocate,
}) => {
  const percentage = Math.min(100, attribute.value);

  const getBarColor = (key: string) => {
    switch (key) {
      case 'strength':
        return 'bg-amber-500';
      case 'intellect':
        return 'bg-violet-600';
      case 'vitality':
        return 'bg-sky-500';
      case 'discipline':
        return 'bg-emerald-500';
      case 'charisma':
        return 'bg-rose-500';
      default:
        return 'bg-primary-container';
    }
  };

  return (
    <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${attribute.bgClass} ${attribute.textClass}`}
          >
            <span className="material-symbols-outlined text-[22px]">{attribute.icon}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-on-surface">{attribute.name}</span>
              <span className="bg-surface-container text-primary text-[11px] font-bold px-2 py-0.5 rounded">
                Lvl {attribute.level}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant line-clamp-1">{attribute.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 tabular-nums">
          <div className="text-right">
            <span className="font-bold text-base text-on-surface">{attribute.value}</span>
            <span className="text-xs text-outline"> / {attribute.maxValue}</span>
          </div>

          {canAllocate && onAllocate && (
            <button
              onClick={onAllocate}
              type="button"
              className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center hover:opacity-90 shadow-sm transition-all"
              title="Allocate +1 point"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
          )}
        </div>
      </div>

      {/*  */}
      <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBarColor(attribute.key)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/*  */}
      <div className="flex items-center justify-between text-xs text-on-surface-variant pt-0.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-outline">Driven by:</span>
          {attribute.contributingCategories.map((cat) => (
            <span
              key={cat}
              className="px-1.5 py-0.5 rounded bg-surface-container text-outline text-[10px] uppercase font-semibold"
            >
              {cat}
            </span>
          ))}
        </div>
        <span className="text-tertiary font-bold tabular-nums">
          +{attribute.recentGain} Gain
        </span>
      </div>
    </div>
  );
};
