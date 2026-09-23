import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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
  MessageSquare,
  History,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { notificationRepository } from '../repositories/notificationRepository';
import { studentRepository } from '../repositories/studentRepository';
import { Student } from '../types';
import { NotificationDrawer } from '../components/NotificationDrawer';

const STUDENT_SUB_NAV_ITEMS = [
  { id: 'resumo', label: 'Resumo', icon: LayoutDashboard },
  { id: 'treinos', label: 'Treinos', icon: Dumbbell },
  { id: 'conversa', label: 'Conversa', icon: MessageSquare },
  { id: 'evolucao', label: 'Evolução Cargas', icon: TrendingUp },
  { id: 'anamnese', label: 'Formulários', icon: ClipboardList },
  { id: 'alimentacao', label: 'Plano Alimentar', icon: Apple },
  { id: 'historico', label: 'Histórico & Sessões', icon: History },
  { id: 'ia', label: 'AI Copilot', icon: Sparkles },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
];

export const PersonalLayout: React.FC = () => {
  const { user, logout, quickLogin, enterStudentSimulation } = useAuth();
  const { success, error: toastError } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Dynamic Students for Simulation Mode & Contextual Sidebar
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [isSimulatingLoading, setIsSimulatingLoading] = useState(false);

  // Detect if currently viewing a specific student:
  const studentPathMatch = location.pathname.match(/^\/personal\/students\/([^/?#]+)/);
  const currentStudentParam = studentPathMatch && studentPathMatch[1] !== 'new' ? studentPathMatch[1] : null;
  const [activeStudentContext, setActiveStudentContext] = useState<Student | null>(null);

  const rawStudentTab = searchParams.get('tab') || 'resumo';
  const activeStudentTab =
    rawStudentTab === 'chat' ? 'conversa'
    : (rawStudentTab === 'nutricao' || rawStudentTab === 'alimentacao') ? 'alimentacao'
    : (rawStudentTab === 'copilot' || rawStudentTab === 'ia') ? 'ia'
    : (rawStudentTab === 'config' || rawStudentTab === 'configuracoes') ? 'configuracoes'
    : rawStudentTab;

  const isPersonalChatTab = Boolean(
    currentStudentParam && (activeStudentTab === 'conversa' || activeStudentTab === 'chat')
  );

  useEffect(() => {
    if (!currentStudentParam) {
      setActiveStudentContext(null);
      return;
    }
    const found = students.find((s) => s.id === currentStudentParam || s.userId === currentStudentParam);
    if (found) {
      setActiveStudentContext(found);
    } else {
      studentRepository.getById(currentStudentParam).then((res) => {
        if (res) setActiveStudentContext(res);
        else {
          studentRepository.getByUserId(currentStudentParam).then(setActiveStudentContext);
        }
      });
    }
  }, [currentStudentParam, students]);

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
    { name: 'Formulários', path: '/personal/anamnesis', icon: ClipboardList },
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
    <div
      className={`bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white flex flex-col md:flex-row ${
        isPersonalChatTab ? 'h-screen h-[100dvh] overflow-hidden' : 'min-h-screen'
      }`}
    >
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
              const isStudentsItem = item.path === '/personal/students';
              const isInsideStudent = isStudentsItem && !!currentStudentParam;

              return (
                <div key={item.path} className="space-y-1">
                  <NavLink
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                        isActive || isInsideStudent
                          ? 'bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-cardElevated hover:text-slate-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    {isInsideStudent && (
                      <ChevronDown className="w-3.5 h-3.5 text-white/80" />
                    )}
                  </NavLink>

                  {/* SUBMENU DINÂMICO DO ALUNO ATIVO */}
                  {isStudentsItem && activeStudentContext && (
                    <div className="my-1.5 ml-2.5 pl-2.5 border-l-2 border-emerald-500/50 space-y-1 py-1 bg-slate-50/50 dark:bg-dark-cardElevated/20 rounded-r-xl">
                      <div className="flex items-center justify-between pr-2 py-0.5 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <img
                            src={
                              activeStudentContext.avatarUrl ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                            }
                            alt={activeStudentContext.name}
                            className="w-5 h-5 rounded-full object-cover ring-1 ring-emerald-500/40 shrink-0"
                          />
                          <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 truncate">
                            {activeStudentContext.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            navigate('/personal/students');
                          }}
                          className="text-[10px] font-bold text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
                          title="Voltar para a lista geral de alunos"
                        >
                          Todos
                        </button>
                      </div>

                      {/* 9 Abas Dinâmicas do Aluno */}
                      <div className="space-y-0.5">
                        {STUDENT_SUB_NAV_ITEMS.map((tab) => {
                          const TabIcon = tab.icon;
                          const isTabActive =
                            activeStudentTab === tab.id ||
                            (tab.id === 'conversa' && activeStudentTab === 'chat');

                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                const targetId = activeStudentContext.userId || activeStudentContext.id;
                                navigate(`/personal/students/${targetId}?tab=${tab.id}`);
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer text-left ${
                                isTabActive
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-extrabold shadow-2xs'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-cardElevated hover:text-slate-900 dark:hover:text-white font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <TabIcon
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isTabActive
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : 'text-slate-400 dark:text-slate-500'
                                  }`}
                                />
                                <span className="truncate">{tab.label}</span>
                              </div>
                              {isTabActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
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
      <div className={`flex-1 flex flex-col min-w-0 ${isPersonalChatTab ? 'h-full overflow-hidden' : 'overflow-x-hidden'}`}>
        {/* Desktop Topbar */}
        {!isPersonalChatTab && (
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
        )}

        <main
          className={`flex-1 w-full min-h-0 ${
            isPersonalChatTab
              ? 'p-0 flex flex-col overflow-hidden max-w-none'
              : 'p-4 sm:p-6 md:p-8 max-w-7xl mx-auto'
          }`}
        >
          <Outlet />
        </main>
      </div>

      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </div>
  );
};
