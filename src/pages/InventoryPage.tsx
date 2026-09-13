import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { EquipmentSlots } from '../components/character/EquipmentSlots';
import { EmptyState } from '../components/common/EmptyState';
import { NavLink } from 'react-router-dom';

export const InventoryPage: React.FC = () => {
  const { rewards, equipItem, unequipItem } = useGame();
  const [filter, setFilter] = useState<'all' | 'equipped' | 'owned'>('all');

  const ownedItems = rewards.filter((r) => r.owned);
  const equippedItems = rewards.filter((r) => r.equipped);

  const displayedItems = rewards.filter((item) => {
    if (filter === 'equipped') return item.equipped;
    if (filter === 'owned') return item.owned;
    return true;
  });

  return (
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto flex flex-col gap-6">
      {/*  */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-container" />
            <span className="text-xs text-outline uppercase font-bold tracking-wider">
              Item Storage
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mt-0.5">
            Adventurer Vault
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Persistent gear inventory, equipped active artifacts, and unlocked cosmetics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <NavLink
            to="/rewards"
            className="px-4 py-2 rounded-xl bg-primary-container text-on-primary text-xs font-bold hover:bg-primary shadow-sm flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">storefront</span>
            <span>Visit Bazaar</span>
          </NavLink>
        </div>
      </div>

      {/*  */}
      <EquipmentSlots equippedItems={equippedItems} />

      {/*  */}
      <div className="flex items-center justify-between bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            All Items ({rewards.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('owned')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'owned'
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Owned in Vault ({ownedItems.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('equipped')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'equipped'
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Equipped ({equippedItems.length})
          </button>
        </div>

        <span className="text-xs text-outline tabular-nums">
          {ownedItems.length} items acquired
        </span>
      </div>

      {/*  */}
      {displayedItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between gap-4 transition-all ${
                item.equipped
                  ? 'bg-surface-container-low border-primary-container ring-1 ring-primary-container'
                  : item.owned
                  ? 'bg-surface-container-lowest border-outline-variant/40'
                  : 'bg-surface-container-lowest border-outline-variant/30 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-xl bg-surface-container-low overflow-hidden flex items-center justify-center shrink-0 border border-outline-variant/30">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-[24px] text-outline">
                      {item.icon}
                    </span>
                  )}
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface truncate">{item.name}</span>
                    {item.equipped && (
                      <span className="px-2 py-0.5 rounded bg-tertiary text-on-tertiary text-[10px] font-bold">
                        Equipped
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-outline uppercase font-semibold mt-0.5">
                    {item.category.replace('_', ' ')}
                  </span>
                  {item.attributeBuff && (
                    <span className="text-[11px] text-tertiary font-bold mt-1">
                      +{item.attributeBuff.value} {item.attributeBuff.attribute.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/*  */}
              <div className="pt-2 border-t border-surface-container-high">
                {item.owned ? (
                  item.equipped ? (
                    <button
                      type="button"
                      onClick={() => unequipItem(item.id)}
                      className="w-full py-1.5 px-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-colors"
                    >
                      Unequip
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => equipItem(item.id)}
                      className="w-full py-1.5 px-3 rounded-lg bg-primary-container hover:bg-primary text-xs font-bold text-on-primary shadow-sm transition-all"
                    >
                      Equip to Loadout
                    </button>
                  )
                ) : (
                  <NavLink
                    to="/rewards"
                    className="w-full py-1.5 px-3 rounded-lg bg-surface-container text-xs font-bold text-outline hover:text-on-surface flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    <span>Acquire in Bazaar</span>
                  </NavLink>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="backpack"
          title="YOUR VAULT IS WAITING FOR ITS FIRST REWARD"
          subtitle="Acquire items in the Bazaar using your earned quest Gold."
          actionText="Visit Rewards Bazaar"
          onAction={() => {}}
        />
      )}
    </div>
  );
};
