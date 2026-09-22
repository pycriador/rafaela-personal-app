import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Home,
  Dumbbell,
  TrendingUp,
  Apple,
  User,
  Sun,
  Moon,
  Bell,
  LogOut,
  ArrowLeftRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationRepository } from '../repositories/notificationRepository';
import { NotificationDrawer } from '../components/NotificationDrawer';

export const StudentLayout: React.FC = () => {
  const { user, studentProfile, logout, quickLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      notificationRepository.getUnreadCount(user.id).then(setUnreadCount);
    }
  }, [user, isNotifOpen]);

  const navItems = [
    { name: 'Início', path: '/student/dashboard', icon: Home },
    { name: 'Treinos', path: '/student/workouts', icon: Dumbbell },
    { name: 'Evolução', path: '/student/evolution', icon: TrendingUp },
    { name: 'Alimentação', path: '/student/nutrition', icon: Apple },
    { name: 'Perfil', path: '/student/profile', icon: User },
  ];

  const handleSwitchToPersonal = async () => {
    await quickLogin('user-rafaela');
    navigate('/personal/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white flex flex-col pb-32 md:pb-16 w-full transition-colors duration-200">
      {/* Top Header - Mobile & Desktop aligned */}
      <header className="sticky top-0 z-30 bg-white/85 dark:bg-dark-card/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-dark-border px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.name}
              className="w-10 h-10 rounded-2xl object-cover ring-2 ring-emerald-500/30 shrink-0 shadow-sm"
            />
            <div className="min-w-0">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                {studentProfile?.name || user?.name || 'Aluno'}
              </h2>
              <p className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1 truncate">
                <span>{studentProfile?.goals?.[0] || 'Treinos Ativos'}</span>
                <span>•</span>
                <span>{studentProfile?.level || 'Aluno'}</span>
              </p>
            </div>
          </div>

          {/* Right header actions */}
          <div className="flex items-center gap-1.5">
            {/* Quick toggle to Personal for testing */}
            <button
              onClick={handleSwitchToPersonal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-colors"
              title="Trocar para visão da Rafaela (Personal)"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Modo Personal</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-dark-cardElevated transition-colors"
              aria-label="Tema"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsNotifOpen(true)}
              className="p-2 relative text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-dark-cardElevated transition-colors"
              aria-label="Notificações"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-dark-card" />
              )}
            </button>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-lg md:max-w-4xl mx-auto w-full px-4 pt-4 sm:pt-6 pb-28 sm:pb-16">
        <Outlet />
      </main>

      {/* Bottom Navigation - Mobile First (Section 46) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-dark-card/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-dark-border py-2 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'text-emerald-500 font-bold scale-105'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px] font-semibold">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </div>
  );
};
