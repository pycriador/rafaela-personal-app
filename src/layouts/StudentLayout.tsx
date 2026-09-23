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
  FlaskConical,
  MessageSquare,
  ChevronDown,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { notificationRepository } from '../repositories/notificationRepository';
import { studentRepository } from '../repositories/studentRepository';
import { Student } from '../types';
import { Badge } from '../components/ui/Badge';
import { NotificationDrawer } from '../components/NotificationDrawer';

export const StudentLayout: React.FC = () => {
  const {
    user,
    studentProfile,
    logout,
    quickLogin,
    isSimulationMode,
    enterStudentSimulation,
    exitStudentSimulation,
  } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isSwitchingSim, setIsSwitchingSim] = useState(false);

  useEffect(() => {
    if (user) {
      notificationRepository.getUnreadCount(user.id).then(setUnreadCount);
    }
    if (isSimulationMode) {
      studentRepository.getAll().then(setAllStudents);
    }
  }, [user, isNotifOpen, isSimulationMode]);

  const navItems = [
    { name: 'Início', path: '/student/dashboard', icon: Home },
    { name: 'Treinos', path: '/student/workouts', icon: Dumbbell },
    { name: 'Anamnese', path: '/student/anamnesis', icon: ClipboardList },
    { name: 'Bate-Papo', path: '/student/chat', icon: MessageSquare },
    { name: 'Evolução', path: '/student/evolution', icon: TrendingUp },
    { name: 'Alimentação', path: '/student/nutrition', icon: Apple },
    { name: 'Perfil', path: '/student/profile', icon: User },
  ];

  const handleSwitchToPersonal = async () => {
    if (isSimulationMode) {
      await exitStudentSimulation();
      success('Modo de teste encerrado com sucesso.');
    } else {
      await quickLogin('user-rafaela');
    }
    navigate('/personal/dashboard');
  };

  const handleSwitchSimulatedStudent = async (newStudentId: string) => {
    if (newStudentId === studentProfile?.id) return;
    setIsSwitchingSim(true);
    try {
      const ok = await enterStudentSimulation(newStudentId);
      if (ok) {
        const nextSt = allStudents.find((s) => s.id === newStudentId);
        success(`Perfil alternado para ${nextSt?.name || 'aluno'} (em simulação local).`);
      } else {
        toastError('Não foi possível carregar o aluno selecionado.');
      }
    } catch {
      toastError('Erro ao alternar aluno.');
    } finally {
      setIsSwitchingSim(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white flex flex-col pb-28 md:pb-8 w-full transition-colors duration-200">
      {/* Sticky Top Section containing Banner & Header */}
      <div className="sticky top-0 z-30 flex flex-col shadow-xs">
        {/* Top Banner when in Simulation Mode */}
        {isSimulationMode && (
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/15 to-emerald-500/15 border-b border-amber-500/40 px-3 sm:px-6 py-2 text-xs backdrop-blur-md">
            <div className="max-w-6xl xl:max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <FlaskConical className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="font-black text-[11px] uppercase tracking-wider text-amber-900 dark:text-amber-200">
                    Modo Simulação
                  </span>
                  <Badge variant="warning" size="sm" className="text-[9px] py-0 px-1">
                    Sem Gravação
                  </Badge>
                </div>
                <span className="hidden md:inline text-[11px] text-amber-900/80 dark:text-amber-200/80 truncate">
                  • Testando visão de: <strong>{studentProfile?.name}</strong> (nenhum dado será alterado)
                </span>
              </div>

              <div className="flex items-center gap-2 justify-between sm:justify-end shrink-0">
                {/* Dynamic Student Switcher Dropdown */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-amber-900/70 dark:text-amber-300/70 font-semibold hidden sm:inline">
                    Trocar aluno:
                  </span>
                  <div className="relative">
                    <select
                      value={studentProfile?.id || ''}
                      disabled={isSwitchingSim}
                      onChange={(e) => handleSwitchSimulatedStudent(e.target.value)}
                      className="text-xs font-bold bg-white dark:bg-dark-card border border-amber-500/40 rounded-lg px-2 py-1 pr-6 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none cursor-pointer disabled:opacity-50"
                    >
                      {allStudents.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.level})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Exit Simulation Button */}
                <button
                  type="button"
                  onClick={handleSwitchToPersonal}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                  title="Sair do modo de teste e voltar para a visão da Personal"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Encerrar Teste</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Header */}
        <header className="bg-white/85 dark:bg-dark-card/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-dark-border px-4 sm:px-6 py-2.5">
          <div className="max-w-6xl xl:max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            {/* Student Avatar & Basic Info */}
            <div className="flex items-center gap-3 min-w-0 shrink-0">
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

            {/* Desktop Navigation Menu (Elegant, Responsive, No mobile squeeze) */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-dark-cardElevated/70 p-1 rounded-2xl border border-slate-200/60 dark:border-dark-border">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-white dark:bg-dark-card text-emerald-600 dark:text-emerald-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Right header actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Only show Encerrar Teste button if actively simulating in Sandbox */}
              {isSimulationMode && (
                <button
                  onClick={handleSwitchToPersonal}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 text-xs font-bold transition-colors cursor-pointer"
                  title="Encerrar teste de simulação e voltar para a visão da Rafaela"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Encerrar Teste</span>
                </button>
              )}

              <button
                onClick={toggleTheme}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-dark-cardElevated transition-colors cursor-pointer"
                aria-label="Tema"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsNotifOpen(true)}
                className="p-2 relative text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-dark-cardElevated transition-colors cursor-pointer"
                aria-label="Notificações"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-dark-card" />
                )}
              </button>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Main Content Area - Full screen width responsive container */}
      <main className="flex-1 max-w-6xl xl:max-w-7xl mx-auto w-full px-4 sm:px-6 pt-5 pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Bottom Navigation - ONLY on mobile screens (Section 46) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-dark-card/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-dark-border py-2 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl">
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
