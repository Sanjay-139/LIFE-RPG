import React from 'react';
import { NavLink } from 'react-router-dom';
import { useGame } from '../../context/GameContext';

export const MobileNav: React.FC = () => {
  const { quests } = useGame();
  const activeCount = quests.filter((q) => q.status !== 'completed').length;

  const tabs = [
    { label: 'Home', path: '/dashboard', icon: 'space_dashboard' },
    { label: 'Quests', path: '/quests', icon: 'checklist', badge: activeCount },
    { label: 'Character', path: '/character', icon: 'person' },
    { label: 'Rewards', path: '/rewards', icon: 'military_tech' },
    { label: 'Profile', path: '/profile', icon: 'badge' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest border-t border-outline-variant/40 shadow-lg z-40 flex items-center justify-around px-2">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-14 py-1 rounded-lg transition-colors text-[10px] font-semibold relative ${
              isActive
                ? 'text-primary-container font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`
          }
        >
          <span className="material-symbols-outlined text-[22px]">{tab.icon}</span>
          <span className="mt-0.5">{tab.label}</span>
          {tab.badge !== undefined && tab.badge > 0 && (
            <span className="absolute top-1 right-2 bg-primary-container text-on-primary w-4 h-4 rounded-full text-[10px] flex items-center justify-center tabular-nums">
              {tab.badge}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
