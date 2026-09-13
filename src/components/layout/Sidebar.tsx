import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const Sidebar: React.FC = () => {
  const { character, quests } = useGame();
  const { logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const activeQuestsCount = quests.filter((q) => q.status !== 'completed').length;
  const xpPercentage = Math.min(
    100,
    Math.round((character.currentXp / character.xpToNextLevel) * 100)
  );

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'space_dashboard' },
    { label: 'Quests', path: '/quests', icon: 'checklist', badge: activeQuestsCount },
    { label: 'Character', path: '/character', icon: 'person' },
    { label: 'Progression', path: '/progression', icon: 'auto_graph' },
    { label: 'Streaks', path: '/streaks', icon: 'local_fire_department' },
    { label: 'Progress', path: '/progress', icon: 'trending_up' },
    { label: 'Rewards', path: '/rewards', icon: 'military_tech' },
    { label: 'Inventory', path: '/inventory', icon: 'backpack' },
    { label: 'Achievements', path: '/achievements', icon: 'emoji_events' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest border-r border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 hidden lg:flex flex-col justify-between pt-4 pb-6 select-none">
      <div className="flex flex-col gap-5 overflow-y-auto">
        {/*  */}
        <NavLink to="/dashboard" className="flex items-center gap-3 px-6 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center p-1 shrink-0">
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
              <path
                d="M50 12L76 22V52C76 68.5 65 81.5 50 86C35 81.5 24 68.5 24 52V22L50 12Z"
                stroke="#3525cd"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="7"
                fill="#f2f3ff"
              />
              <path
                d="M38 68L32 74C30 76 27 76 25 74L24 73C22 71 22 68 24 66L30 60"
                stroke="#855300"
                strokeLinecap="round"
                strokeWidth="5"
              />
              <path d="M37 55L69 23L77 31L45 63" fill="#4f46e5" />
              <path d="M69 23L79 17L81 27L77 31L69 23Z" fill="#fea619" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-on-surface">LIFE RPG</span>
            <span className="text-[10px] text-outline uppercase font-semibold tracking-wider">
              System v2.4
            </span>
          </div>
        </NavLink>

        {/*  */}
        <div className="px-4">
          <div className="bg-surface-container-low p-3 rounded-xl flex flex-col gap-2 border border-outline-variant/30">
            <div className="flex items-center justify-between text-xs tabular-nums font-bold">
              <span className="text-on-surface-variant uppercase tracking-wider text-[11px]">
                EXP Progress
              </span>
              <span className="text-primary">
                {character.currentXp.toLocaleString()} / {character.xpToNextLevel.toLocaleString()}
              </span>
            </div>
            <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-container rounded-full transition-all duration-500"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
              <span className="font-medium">{character.rank}</span>
              <span className="text-tertiary-container font-semibold">
                +{character.xpToNextLevel - character.currentXp} XP to Lvl {character.level + 1}
              </span>
            </div>
          </div>
        </div>

        {/*  */}
        <nav className="flex flex-col gap-0.5 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm ${
                  isActive
                    ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="ml-auto bg-surface-container-high text-primary px-1.5 py-0.2 rounded text-xs font-bold tabular-nums">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/*  */}
      <div className="px-3 flex flex-col gap-0.5">
        <div className="h-px bg-surface-container-high mx-2 my-2" />
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm ${
              isActive
                ? 'bg-primary-container text-on-primary font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`
          }
        >
          <span className="material-symbols-outlined text-[20px]">badge</span>
          <span>Dossier Profile</span>
        </NavLink>
        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm ${
              isActive
                ? 'bg-primary-container text-on-primary font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`
          }
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="ml-auto w-2 h-2 rounded-full bg-primary-container" />
          )}
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm ${
              isActive
                ? 'bg-primary-container text-on-primary font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`
          }
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span>Settings</span>
        </NavLink>
        <button
          onClick={handleLogout}
          type="button"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-error-container/30 hover:text-error transition-colors font-medium text-sm text-left w-full"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Exit World</span>
        </button>
      </div>
    </aside>
  );
};
