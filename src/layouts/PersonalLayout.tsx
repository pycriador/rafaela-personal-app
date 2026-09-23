import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Layers,
  Library,
  Apple,
  TrendingUp,
  FileText,
  Settings,
  LogOut,
  Moon,
  Sun,
  Bell,
  Menu,
  X,
  UserCheck,
  ChevronRight,
  FlaskConical,
  ChevronDown,
  Play,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { notificationRepository } from '../repositories/notificationRepository';
import { studentRepository } from '../repositories/studentRepository';
import { Student } from '../types';
import { NotificationDrawer } from '../components/NotificationDrawer';

export const PersonalLayout: React.FC = () => {
  const { user, logout, quickLogin, enterStudentSimulation } = useAuth();
  const { success, error: toastError } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Dynamic Students for Simulation Mode
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [isSimulatingLoading, setIsSimulatingLoading] = useState(false);

  useEffect(() => {
    if (user) {
      notificationRepository.getUnreadCount(user.id).then(setUnreadCount);
    }
    studentRepository.getAll().then((list) => {
      setStudents(list);
      if (list.length > 0) {
        setSelectedStudentId(list[0].id);
      }
    });
  }, [user, isNotifOpen]);

  const navItems = [
    { name: 'Dashboard', path: '/personal/dashboard', icon: LayoutDashboard },
    { name: 'Alunos', path: '/personal/students', icon: Users },
    { name: 'Treinos', path: '/personal/workouts/new', icon: Dumbbell },
    { name: 'Séries Prontas', path: '/personal/templates', icon: Layers },
    { name: 'Exercícios', path: '/personal/exercises', icon: Library },
    { name: 'Alimentação', path: '/personal/nutrition', icon: Apple },
    { name: 'Anamnese', path: '/personal/anamnesis', icon: ClipboardList },
    { name: 'Evolução', path: '/personal/evolution', icon: TrendingUp },
    { name: 'Relatórios', path: '/personal/reports', icon: FileText },
    { name: 'Configurações', path: '/personal/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleStartSimulation = async (studentIdToUse?: string) => {
    const targetId = studentIdToUse || selectedStudentId;
    if (!targetId) return;

    setIsSimulatingLoading(true);
    try {
      const ok = await enterStudentSimulation(targetId);
      if (ok) {
        setMobileMenuOpen(false);
        const targetStudent = students.find((s) => s.id === targetId);
        success(`Modo simulação iniciado para ${targetStudent?.name || 'aluno'} (sem gravação no banco).`);
        navigate('/student/dashboard');
      } else {
        toastError('Não foi possível iniciar a simulação para este aluno.');
      }
    } catch {
      toastError('Erro ao iniciar simulação.');
    } finally {
      setIsSimulatingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-dark-card border-b border-slate-200 dark:border-dark-border sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-500/20">
            R
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-sm text-slate-900 dark:text-white">RAFAELA</span>
            <span className="text-[10px] font-bold text-emerald-500 block -mt-1 tracking-wider uppercase">Personal</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-dark-cardElevated"
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsNotifOpen(true)}
            className="p-2 relative text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-dark-cardElevated"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-dark-card" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-cardElevated"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Desktop Sidebar & Mobile Drawer */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-dark-card border-r border-slate-200 dark:border-dark-border flex flex-col justify-between transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo & Brand */}
          <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-dark-border/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-500/25">
                R
              </div>
              <div>
                <h1 className="font-extrabold tracking-tight text-base text-slate-900 dark:text-white leading-tight">
                  RAFAELA
                </h1>
                <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">
                  Personal Trainer
                </p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-cardElevated hover:text-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Dynamic "Testar como Aluno" with Dropdown & Local Sandbox */}
          <div className="p-3 mx-3 mb-2 bg-slate-50 dark:bg-dark-cardElevated/60 rounded-2xl border border-slate-200/60 dark:border-dark-border text-left">
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <FlaskConical className="w-3.5 h-3.5 text-emerald-500" />
                <span>Testar como Aluno</span>
              </div>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                Sandbox
              </span>
            </div>

            <p className="text-[10px] text-slate-500 dark:text-dark-muted mb-2.5 leading-tight">
              Selecione qualquer aluno para validar o app sem gravar alterações no histórico.
            </p>

            <div className="space-y-2">
              <div className="relative">
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full text-xs font-semibold bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl px-2.5 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none pr-8 cursor-pointer"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.goals?.[0] || st.level || 'Aluno'})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                type="button"
                onClick={() => handleStartSimulation()}
                disabled={isSimulatingLoading || !selectedStudentId}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSimulatingLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-white" />
                    <span>Iniciar Simulação</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* User Profile & Footer Controls */}
          <div className="p-4 border-t border-slate-100 dark:border-dark-border/60 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=150'}
                alt={user?.name}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-emerald-500/30 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.name || 'Rafaela Personal'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                className="hidden md:flex p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-dark-cardElevated transition-colors"
                title="Alternar tema"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Desktop Topbar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/70 dark:bg-dark-card/70 backdrop-blur-md border-b border-slate-200/80 dark:border-dark-border sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Painel de Gestão • Online
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-dark-cardElevated text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
              title="Notificações"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-dark-card" />
              )}
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 md:p-8 flex-1 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </div>
  );
};
