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
  ChevronRight,
  ClipboardList,
  Menu,
  X,
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

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
    <div className="min-h-screen min-h-[100dvh] bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white flex flex-col pb-8 w-full transition-colors duration-200">
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
        <header className="bg-white/90 dark:bg-dark-card/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-dark-border px-4 sm:px-6 py-2.5">
          <div className="max-w-6xl xl:max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            {/* Student Avatar & Basic Info */}
            <div className="flex items-center gap-3 min-w-0 shrink-0">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={user?.name}
                className="w-10 h-10 rounded-2xl object-cover ring-2 ring-emerald-500/30 shrink-0 shadow-xs"
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

            {/* Desktop Navigation Menu (Visible on lg and larger screens for elegant fit) */}
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-dark-cardElevated/70 p-1 rounded-2xl border border-slate-200/60 dark:border-dark-border">
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
              {/* Only show Encerrar Teste button on header if actively simulating in Sandbox */}
              {isSimulationMode && (
                <button
                  onClick={handleSwitchToPersonal}
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 text-xs font-bold transition-colors cursor-pointer"
                  title="Encerrar teste de simulação e voltar para a visão da Rafaela"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Encerrar Teste</span>
                </button>
              )}

              <button
                onClick={toggleTheme}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-dark-cardElevated transition-colors cursor-pointer"
                aria-label="Alternar tema"
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

              {/* Desktop Logout Button */}
              <button
                onClick={handleLogout}
                className="hidden lg:flex p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                title="Sair da Conta"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Hamburger Button for Small & Tablet Screens (< lg) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-cardElevated rounded-xl transition-colors cursor-pointer"
                aria-label="Abrir menu de navegação"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-emerald-500" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Main Content Area - Full screen width responsive container without bottom bar padding */}
      <main className="flex-1 max-w-6xl xl:max-w-7xl mx-auto w-full px-4 sm:px-6 py-5">
        <Outlet />
      </main>

      {/* Small Screen / Mobile Slide-Over Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Small Screen / Mobile Slide-Over Drawer ("Aquele menu que abre na versão de tela pequena") */}
      <aside
        className={`fixed top-0 right-0 z-50 h-screen w-80 max-w-[85vw] bg-white dark:bg-dark-card border-l border-slate-200 dark:border-dark-border flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Menu móvel do aluno"
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Drawer Header with Student Identity & Close Button */}
          <div className="p-4 border-b border-slate-100 dark:border-dark-border/60 flex items-center justify-between bg-slate-50/60 dark:bg-dark-cardElevated/40">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={user?.name}
                className="w-11 h-11 rounded-2xl object-cover ring-2 ring-emerald-500/40 shadow-xs shrink-0"
              />
              <div className="min-w-0">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  {studentProfile?.name || user?.name || 'Aluno'}
                </h3>
                <p className="text-[11px] font-bold text-emerald-500 truncate">
                  {studentProfile?.goals?.[0] || 'Treinos Personalizados'}
                </p>
                <span className="text-[10px] text-slate-400 dark:text-dark-muted font-medium">
                  {studentProfile?.level || 'Nível Ativo'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-200/60 dark:hover:bg-dark-border transition-colors cursor-pointer shrink-0 ml-2"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Simulation Box in Mobile Drawer if active */}
          {isSimulationMode && (
            <div className="m-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                <FlaskConical className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Modo Simulação Ativo</span>
              </div>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                Você está visualizando a interface como aluno sem alterar dados reais.
              </p>
              <div className="relative">
                <select
                  value={studentProfile?.id || ''}
                  disabled={isSwitchingSim}
                  onChange={(e) => {
                    handleSwitchSimulatedStudent(e.target.value);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-xs font-bold bg-white dark:bg-dark-card border border-amber-500/40 rounded-xl px-2.5 py-1.5 pr-7 text-slate-800 dark:text-slate-200 appearance-none cursor-pointer"
                >
                  {allStudents.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.level})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSwitchToPersonal();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Encerrar Teste e Voltar</span>
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 flex-1">
            <p className="px-3 pt-2 pb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-dark-muted">
              Navegação do Aluno
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-150 ${
                      isActive
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-cardElevated hover:text-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </NavLink>
              );
            })}
          </nav>

          {/* Quick theme & notification actions inside drawer */}
          <div className="p-3 border-t border-slate-100 dark:border-dark-border/60 space-y-1">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-cardElevated transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                <span>Tema {theme === 'dark' ? 'Escuro' : 'Claro'}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-normal capitalize">{theme}</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsNotifOpen(true);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-cardElevated transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-emerald-500" />
                <span>Notificações</span>
              </div>
              {unreadCount > 0 && (
                <Badge variant="success" size="sm">
                  {unreadCount} novas
                </Badge>
              )}
            </button>
          </div>

          {/* Drawer Footer with Logout */}
          <div className="p-4 border-t border-slate-100 dark:border-dark-border/60 bg-slate-50/70 dark:bg-dark-cardElevated/40">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-extrabold transition-colors cursor-pointer border border-rose-200/50 dark:border-rose-900/30"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>
      </aside>

      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </div>
  );
};
