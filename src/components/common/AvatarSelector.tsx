import React, { useState } from 'react';
import { AVATAR_REGISTRY, AvatarOption, getAvatarOption } from '../../data/avatars';

interface AvatarSelectorProps {
  selectedAvatarId: string;
  onSelectAvatar: (avatarId: string) => void;
  showPreview?: boolean;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatarId,
  onSelectAvatar,
  showPreview = true,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const selectedOption = getAvatarOption(selectedAvatarId);

  const filterTabs = ['All', 'Warrior', 'Mage', 'Rogue', 'Cyber', 'Paladin', 'Scholar'];

  const filteredAvatars = AVATAR_REGISTRY.filter((av) => {
    if (activeFilter === 'All') return true;
    return av.archetype === activeFilter;
  });

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onSelectAvatar(id);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Optional Live Selection Banner */}
      {showPreview && selectedOption && (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-container shadow-md bg-surface-container-lowest">
              <img
                src={selectedOption.assetUrl}
                alt={selectedOption.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[14px]">check</span>
            </div>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm sm:text-base text-on-surface truncate">
                {selectedOption.name}
              </h4>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: selectedOption.accentColor }}
              >
                {selectedOption.archetype}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant line-clamp-2 mt-0.5">
              {selectedOption.description}
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveFilter(tab)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === tab
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-outline-variant/30'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Circular Avatar Grid */}
      <div
        role="radiogroup"
        aria-label="Choose your adventurer avatar"
        className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 max-h-[320px] overflow-y-auto pr-1 py-1 scrollbar-thin"
      >
        {filteredAvatars.map((av) => {
          const isSelected = selectedAvatarId === av.id || selectedOption.id === av.id;

          return (
            <div
              key={av.id}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${av.name} (${av.archetype})`}
              tabIndex={0}
              onClick={() => onSelectAvatar(av.id)}
              onKeyDown={(e) => handleKeyDown(e, av.id)}
              className={`group relative flex flex-col items-center gap-1 p-2 rounded-2xl cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isSelected
                  ? 'bg-surface-container-high/60 shadow-sm'
                  : 'hover:bg-surface-container-low/80'
              }`}
            >
              <div
                className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full p-0.5 transition-all ${
                  isSelected
                    ? 'ring-4 ring-primary-container shadow-md scale-105'
                    : 'ring-1 ring-outline-variant/40 group-hover:ring-outline group-hover:scale-105'
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-surface-container-lowest">
                  <img
                    src={av.assetUrl}
                    alt={av.name}
                    className="w-full h-full object-cover select-none"
                    loading="lazy"
                  />
                </div>

                {isSelected && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow">
                    <span className="material-symbols-outlined text-[10px]">check</span>
                  </div>
                )}
              </div>

              <span className="text-[10px] font-medium text-on-surface truncate w-full text-center leading-tight">
                {av.name.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
