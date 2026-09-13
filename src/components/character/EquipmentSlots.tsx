import React from 'react';
import { RewardItem } from '../../types';
import { useGame } from '../../context/GameContext';

interface EquipmentSlotsProps {
  equippedItems: RewardItem[];
}

export const EquipmentSlots: React.FC<EquipmentSlotsProps> = ({ equippedItems }) => {
  const { unequipItem } = useGame();

  const slots = [
    { key: 'torso', label: 'Torso Armor', icon: 'shield' },
    { key: 'head', label: 'Head Artifact', icon: 'timer' },
    { key: 'accessory', label: 'HUD Theme', icon: 'terminal' },
    { key: 'badge', label: 'Title Crest', icon: 'military_tech' },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/40 shadow-card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">
            sports_kabaddi
          </span>
          <h3 className="font-bold text-base text-on-surface">Active Equipment</h3>
        </div>
        <span className="text-xs text-outline tabular-nums">
          {equippedItems.length} / {slots.length} Active Slots
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {slots.map((slot) => {
          const item = equippedItems.find((i) => i.equipSlot === slot.key);

          return (
            <div
              key={slot.key}
              className={`p-3.5 rounded-xl border flex flex-col justify-between min-h-[105px] transition-all ${
                item
                  ? 'bg-surface-container-low border-primary-container/40'
                  : 'bg-surface-container-lowest border-dashed border-outline-variant/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-outline">
                  {slot.label}
                </span>
                <span className="material-symbols-outlined text-outline/60 text-[18px]">
                  {slot.icon}
                </span>
              </div>

              {item ? (
                <div className="flex items-center justify-between mt-2">
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-xs font-bold text-on-surface truncate">
                      {item.name}
                    </span>
                    {item.attributeBuff && (
                      <span className="text-[10px] text-tertiary font-bold">
                        +{item.attributeBuff.value} {item.attributeBuff.attribute.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => unequipItem(item.id)}
                    type="button"
                    className="p-1 rounded text-outline hover:text-error hover:bg-surface-container transition-colors shrink-0"
                    title="Unequip item"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center mt-2 py-1">
                  <span className="text-xs text-outline italic">Empty Slot</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
