import React from 'react';
import { NavLink } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { getAvatarAsset } from '../../data/avatars';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { character } = useGame();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface-container-lowest border-b border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-4 sm:px-8">
      {/*  */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-1 scrollbar-none">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="w-9 h-9 rounded-lg flex lg:hidden items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
            type="button"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
        )}

        {/*  */}
        <NavLink
          to="/progression"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-xs font-bold hover:opacity-90 transition-opacity shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">military_tech</span>
          <span>Lvl {character.level} {character.title}</span>
        </NavLink>

        {/*  */}
        <NavLink
          to="/rewards"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold hover:opacity-90 transition-opacity shrink-0"
        >
          <span className="material-symbols-outlined text-[16px] text-secondary">
            monetization_on
          </span>
          <span className="tabular-nums">{character.gold.toLocaleString()} G</span>
        </NavLink>

        {/*  */}
        <NavLink
          to="/streaks"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-container text-on-error-container text-xs font-bold hover:opacity-90 transition-opacity shrink-0"
        >
          <span className="material-symbols-outlined text-[16px] text-error">
            local_fire_department
          </span>
          <span className="tabular-nums">{character.streak} Days Streak</span>
        </NavLink>
      </div>

      {/*  */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <NavLink
          to="/notifications"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors relative"
          aria-label="View notifications"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-container" />
          )}
        </NavLink>

        <div className="h-6 w-px bg-surface-container-high hidden sm:block" />

        <NavLink
          to="/profile"
          className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-surface-container transition-colors"
        >
          <img
            alt={user?.fullName || character.name}
            className="w-8 h-8 rounded-full object-cover border border-outline-variant/40 bg-surface-container"
            src={getAvatarAsset(user?.avatar || character.avatar)}
          />
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-on-surface leading-tight">
              {user?.fullName || character.name}
            </span>
            <span className="text-[11px] text-outline leading-tight">
              Class: {user?.classType?.split(' ')[0] || 'Sage'}
            </span>
          </div>
        </NavLink>
      </div>
    </header>
  );
};
