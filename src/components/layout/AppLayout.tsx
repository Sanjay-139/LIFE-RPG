import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { ToastContainer } from '../common/ToastContainer';
import { LevelUpModal } from '../common/LevelUpModal';
import { useAuth } from '../../context/AuthContext';

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased flex flex-col">
      {/*  */}
      <Sidebar />

      {/*  */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-on-surface/50 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 max-w-[80vw] h-full bg-surface-container-lowest p-6 flex flex-col justify-between shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center p-1">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      shield
                    </span>
                  </div>
                  <span className="font-bold text-base text-on-surface">LIFE RPG</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded flex items-center justify-center text-outline hover:text-on-surface"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {[
                  { label: 'Dashboard', path: '/dashboard', icon: 'space_dashboard' },
                  { label: 'Quests', path: '/quests', icon: 'checklist' },
                  { label: 'Character Sheet', path: '/character', icon: 'person' },
                  { label: 'Core Attributes', path: '/character/attributes', icon: 'tune' },
                  { label: 'XP Progression', path: '/progression', icon: 'auto_graph' },
                  { label: 'Streak Chamber', path: '/streaks', icon: 'local_fire_department' },
                  { label: 'Rewards Bazaar', path: '/rewards', icon: 'military_tech' },
                  { label: 'Inventory Vault', path: '/inventory', icon: 'backpack' },
                  { label: 'Achievements', path: '/achievements', icon: 'emoji_events' },
                  { label: 'Progress Analytics', path: '/progress', icon: 'trending_up' },
                  { label: 'Adventurer Profile', path: '/profile', icon: 'badge' },
                  { label: 'Notifications', path: '/notifications', icon: 'notifications' },
                ].map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary-container text-on-primary font-bold'
                          : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                      }`
                    }
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>

            <button
              onClick={handleLogout}
              type="button"
              className="flex items-center gap-2 p-3 text-error font-medium text-sm hover:bg-error-container/30 rounded-lg transition-colors mt-4"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span>Exit World / Log Out</span>
            </button>
          </div>
        </div>
      )}

      {/*  */}
      <Header onToggleMobileMenu={() => setMobileMenuOpen(true)} />

      {/*  */}
      <main className="flex-1 pt-16 lg:pl-64 pb-20 lg:pb-8 w-full min-h-screen">
        <Outlet />
      </main>

      {/*  */}
      <MobileNav />

      {/*  */}
      <ToastContainer />
      <LevelUpModal />
    </div>
  );
};
