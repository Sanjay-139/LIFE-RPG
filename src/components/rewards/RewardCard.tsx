import React from 'react';
import { RewardItem } from '../../types';
import { useGame } from '../../context/GameContext';

interface RewardCardProps {
  item: RewardItem;
  currentGold: number;
  characterLevel: number;
}

export const RewardCard: React.FC<RewardCardProps> = ({
  item,
  currentGold,
  characterLevel,
}) => {
  const { purchaseReward, equipItem, unequipItem } = useGame();

  const isLevelLocked = item.requiredLevel ? characterLevel < item.requiredLevel : false;
  const isInsufficientGold = !item.owned && currentGold < item.price;
  const canAfford = !item.owned && !isLevelLocked && currentGold >= item.price;

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/40 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
      <div className="flex flex-col gap-3.5">
        {/*  */}
        <div className="relative w-full h-44 rounded-xl bg-surface-container-low overflow-hidden flex items-center justify-center border border-outline-variant/30">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-outline">
              <span className="material-symbols-outlined text-[36px]">{item.icon}</span>
            </div>
          )}

          <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-primary text-[11px] font-bold uppercase tracking-wider shadow-sm">
            {item.category.replace('_', ' ')}
          </div>

          {/*  */}
          {item.equipped && (
            <div className="absolute top-3 right-3 bg-tertiary text-on-tertiary px-2.5 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 shadow">
              <span className="material-symbols-outlined text-[13px]">check</span>
              <span>Equipped</span>
            </div>
          )}

          {!item.equipped && item.owned && (
            <div className="absolute top-3 right-3 bg-surface-container-lowest text-tertiary px-2.5 py-0.5 rounded text-[11px] font-bold border border-tertiary/30">
              In Vault
            </div>
          )}

          {!item.owned && isLevelLocked && (
            <div className="absolute top-3 right-3 bg-error-container text-on-error-container px-2.5 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">lock</span>
              <span>Lvl {item.requiredLevel}</span>
            </div>
          )}

          {!item.owned && !isLevelLocked && isInsufficientGold && (
            <div className="absolute top-3 right-3 bg-error-container text-on-error-container px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">lock</span>
              <span>Needs {item.price - currentGold} G</span>
            </div>
          )}

          {!item.owned && !isLevelLocked && canAfford && (
            <div className="absolute top-3 right-3 bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">verified</span>
              <span>Available</span>
            </div>
          )}
        </div>

        {/*  */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-on-surface tracking-tight">{item.name}</h3>
            <div className="flex items-center gap-1 text-secondary font-bold text-base tabular-nums">
              <span>{item.price.toLocaleString()}</span>
              <span className="text-xs font-semibold">G</span>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/*  */}
        <div className="flex items-center gap-2 flex-wrap">
          {item.attributeBuff && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant text-[11px] font-bold">
              <span className="material-symbols-outlined text-[13px]">bolt</span>
              <span>
                {item.attributeBuff.attribute.toUpperCase()} +{item.attributeBuff.value}
              </span>
            </span>
          )}
          {item.equipSlot && (
            <span className="text-[11px] text-outline">
              Slot: {item.equipSlot.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/*  */}
      <div className="mt-5 pt-3 border-t border-surface-container-high">
        {item.owned ? (
          item.equipped ? (
            <button
              onClick={() => unequipItem(item.id)}
              type="button"
              className="w-full py-2 px-3 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              <span>Unequip</span>
            </button>
          ) : (
            <button
              onClick={() => equipItem(item.id)}
              type="button"
              className="w-full py-2 px-3 rounded-lg bg-primary-container text-on-primary hover:bg-primary text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">sports_kabaddi</span>
              <span>Equip Item</span>
            </button>
          )
        ) : isLevelLocked ? (
          <button
            disabled
            type="button"
            className="w-full py-2 px-3 rounded-lg bg-surface-container-low text-outline text-xs font-bold cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span>Unlocked at Level {item.requiredLevel}</span>
          </button>
        ) : isInsufficientGold ? (
          <button
            disabled
            type="button"
            className="w-full py-2 px-3 rounded-lg bg-surface-container-low text-outline text-xs font-bold cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span>Insufficient Gold ({item.price} G)</span>
          </button>
        ) : (
          <button
            onClick={() => purchaseReward(item.id)}
            type="button"
            className="w-full py-2 px-3 rounded-lg bg-secondary-container text-on-secondary-container hover:opacity-90 text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
            <span>Acquire for {item.price} Gold</span>
          </button>
        )}
      </div>
    </div>
  );
};
