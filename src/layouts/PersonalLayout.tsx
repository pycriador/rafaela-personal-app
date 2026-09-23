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
  PlusCircle,
  Send,
  Database,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { notificationRepository } from '../repositories/notificationRepository';
import { studentRepository } from '../repositories/studentRepository';
import { Student } from '../types';
import { NotificationDrawer } from '../components/NotificationDrawer';
import { BrandLogo } from '../components/ui/BrandLogo';
import { LanguageSelector } from '../components/ui/LanguageSelector';

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

const ANAMNESIS_SUB_NAV_ITEMS = [
  { id: 'visao-geral', label: 'Visão Geral', path: '/personal/anamnesis', icon: LayoutDashboard },
  { id: 'modelos', label: 'Modelos de Fichas', path: '/personal/anamnesis/forms', icon: FileText },
  { id: 'novo-formulario', label: 'Novo Formulário', path: '/personal/anamnesis/forms/new', icon: PlusCircle },
  { id: 'envios', label: 'Envios & Respostas', path: '/personal/anamnesis/applications', icon: Send },
];

const SETTINGS_SUB_NAV_ITEMS = [
  { id: 'usuarios', label: 'Gestão de Usuários', path: '/personal/settings?tab=usuarios', icon: Users },
  { id: 'backup', label: 'Exportação & Backups', path: '/personal/settings?tab=backup', icon: Database },
  { id: 'sistema', label: 'Aparência & Sistema', path: '/personal/settings?tab=sistema', icon: Layers },
  { id: 'ia', label: 'AI Copilot', path: '/personal/settings?tab=ia', icon: Sparkles },
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

  // Local persistent state for Formulários sub-menus (open by default)
  const [formsSubMenuOpen, setFormsSubMenuOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('rafaela_nav_forms_open');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleFormsSubMenu = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setFormsSubMenuOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('rafaela_nav_forms_open', String(next));
      } catch (err) {
        console.warn('Erro ao salvar preferencia de menu no localStorage', err);
      }
      return next;
    });
  };

  // Local persistent state for Configurações sub-menus (open by default)
  const [settingsSubMenuOpen, setSettingsSubMenuOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('rafaela_nav_settings_open');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleSettingsSubMenu = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSettingsSubMenuOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('rafaela_nav_settings_open', String(next));
      } catch (err) {
        console.warn('Erro ao salvar preferencia de menu no localStorage', err);
      }
      return next;
    });
  };

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
    { name: 'Grupos & Ranking', path: '/personal/ranking', icon: Trophy },
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
          <BrandLogo size="sm" />
          <div>
            <span className="font-semibold tracking-tight text-sm text-slate-900 dark:text-white leading-none block">RAFAELA</span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mt-0.5">Personal</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <LanguageSelector />
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-dark-cardElevated transition-colors"
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-slate-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsNotifOpen(true)}
            className="p-2 relative text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-dark-cardElevated transition-colors"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-dark-card" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-cardElevated transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Desktop Sidebar & Mobile Drawer */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-dark-card border-r border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo & Brand */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06]">
            <div className="flex items-center gap-3">
              <BrandLogo size="md" />
              <div>
                <h1 className="font-semibold tracking-tight text-sm text-slate-900 dark:text-white leading-tight">
                  RAFAELA
                </h1>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  Personal Trainer
                </p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-0.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isStudentsItem = item.path === '/personal/students';
              const isInsideStudent = isStudentsItem && !!currentStudentParam;
              const isAnamnesisItem = item.path === '/personal/anamnesis';
              const isInsideAnamnesis = isAnamnesisItem && location.pathname.startsWith('/personal/anamnesis');
              const isSettingsItem = item.path === '/personal/settings';
              const isInsideSettings = isSettingsItem && location.pathname.startsWith('/personal/settings');

              return (
                <div key={item.path} className="space-y-0.5">
                  <NavLink
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 ${
                        isActive || isInsideStudent || isInsideAnamnesis || isInsideSettings
                          ? 'bg-slate-900 text-white dark:bg-emerald-500/15 dark:text-emerald-300 shadow-2xs font-medium'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-dark-cardElevated/70 hover:text-slate-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    {isInsideStudent && (
                      <ChevronDown className="w-3.5 h-3.5 text-white/80" />
                    )}
                    {isAnamnesisItem && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={toggleFormsSubMenu}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFormsSubMenu();
                          }
                        }}
                        className={`p-1 -mr-1 rounded-md transition-colors cursor-pointer ${
                          location.pathname.startsWith('/personal/anamnesis')
                            ? 'text-white/90 hover:text-white hover:bg-emerald-600/60'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-dark-card'
                        }`}
                        title={formsSubMenuOpen ? 'Ocultar sub-menus de formulários' : 'Expandir sub-menus de formulários'}
                      >
                        {formsSubMenuOpen ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                    {isSettingsItem && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={toggleSettingsSubMenu}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleSettingsSubMenu();
                          }
                        }}
                        className={`p-1 -mr-1 rounded-md transition-colors cursor-pointer ${
                          location.pathname.startsWith('/personal/settings')
                            ? 'text-white/90 hover:text-white hover:bg-emerald-600/60'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-dark-card'
                        }`}
                        title={settingsSubMenuOpen ? 'Ocultar sub-menus de configurações' : 'Expandir sub-menus de configurações'}
                      >
                        {settingsSubMenuOpen ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                  </NavLink>

                  {/* SUBMENU DINÂMICO DO ALUNO ATIVO */}
                  {isStudentsItem && activeStudentContext && (
                    <div className="my-1 ml-3 pl-2.5 border-l border-slate-200 dark:border-white/[0.08] space-y-0.5 py-1 bg-slate-50/50 dark:bg-white/[0.02] rounded-r-xl">
                      <div className="flex items-center justify-between pr-2 py-0.5 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <img
                            src={
                              activeStudentContext.avatarUrl ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                            }
                            alt={activeStudentContext.name}
                            className="w-4 h-4 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/[0.1] shrink-0"
                          />
                          <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate">
                            {activeStudentContext.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            navigate('/personal/students');
                          }}
                          className="text-[10px] font-medium text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
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
                              className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-all cursor-pointer text-left ${
                                isTabActive
                                  ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-medium'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white font-normal'
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

                  {/* SUBMENU FIXO DE FORMULÁRIOS COM PERSISTÊNCIA LOCAL */}
                  {isAnamnesisItem && formsSubMenuOpen && (
                    <div className="my-1 ml-3 pl-2.5 border-l border-slate-200 dark:border-white/[0.08] space-y-0.5 py-1 bg-slate-50/50 dark:bg-white/[0.02] rounded-r-xl">
                      <div className="flex items-center justify-between pr-2 py-0.5 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <ClipboardList className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                            Opções Rápidas
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => toggleFormsSubMenu(e)}
                          className="text-[10px] font-medium text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                          title="Ocultar sub-menus de formulários"
                        >
                          Ocultar
                        </button>
                      </div>

                      {/* 4 Opções Fixas de Formulários */}
                      <div className="space-y-0.5">
                        {ANAMNESIS_SUB_NAV_ITEMS.map((sub) => {
                          const SubIcon = sub.icon;
                          const isSubActive = (() => {
                            if (sub.id === 'visao-geral') {
                              return location.pathname === '/personal/anamnesis' || location.pathname === '/personal/anamnesis/';
                            }
                            if (sub.id === 'novo-formulario') {
                              return location.pathname === '/personal/anamnesis/forms/new';
                            }
                            if (sub.id === 'modelos') {
                              return (
                                location.pathname === '/personal/anamnesis/forms' ||
                                (location.pathname.startsWith('/personal/anamnesis/forms/') &&
                                  location.pathname !== '/personal/anamnesis/forms/new')
                              );
                            }
                            if (sub.id === 'envios') {
                              return (
                                location.pathname.startsWith('/personal/anamnesis/applications') ||
                                location.pathname.startsWith('/personal/anamnesis/responses')
                              );
                            }
                            return false;
                          })();

                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                navigate(sub.path);
                              }}
                              className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-all cursor-pointer text-left ${
                                isSubActive
                                  ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-medium'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white font-normal'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <SubIcon
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isSubActive
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : 'text-slate-400 dark:text-slate-500'
                                  }`}
                                />
                                <span className="truncate">{sub.label}</span>
                              </div>
                              {isSubActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* SUBMENU FIXO DE CONFIGURAÇÕES COM PERSISTÊNCIA LOCAL */}
                  {isSettingsItem && settingsSubMenuOpen && (
                    <div className="my-1 ml-3 pl-2.5 border-l border-slate-200 dark:border-white/[0.08] space-y-0.5 py-1 bg-slate-50/50 dark:bg-white/[0.02] rounded-r-xl">
                      <div className="flex items-center justify-between pr-2 py-0.5 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Settings className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                            Configurações
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => toggleSettingsSubMenu(e)}
                          className="text-[10px] font-medium text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                          title="Ocultar sub-menus de configurações"
                        >
                          Ocultar
                        </button>
                      </div>

                      {/* 4 Opções de Configurações */}
                      <div className="space-y-0.5">
                        {SETTINGS_SUB_NAV_ITEMS.map((sub) => {
                          const SubIcon = sub.icon;
                          const currentSettingsTab = searchParams.get('tab') || 'usuarios';
                          const isSubActive =
                            location.pathname === '/personal/settings' &&
                            (currentSettingsTab === sub.id ||
                              (sub.id === 'usuarios' && !searchParams.get('tab')));

                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                navigate(sub.path);
                              }}
                              className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-all cursor-pointer text-left ${
                                isSubActive
                                  ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-medium'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white font-normal'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <SubIcon
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isSubActive
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : 'text-slate-400 dark:text-slate-500'
                                  }`}
                                />
                                <span className="truncate">{sub.label}</span>
                              </div>
                              {isSubActive && (
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
          <div className="p-3 mx-3 mb-2 bg-slate-50/60 dark:bg-dark-cardElevated/40 rounded-xl border border-slate-200/70 dark:border-white/[0.06] text-left">
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                <FlaskConical className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Testar como Aluno</span>
              </div>
              <span className="text-[9px] font-medium uppercase px-1.5 py-0.5 rounded-md bg-slate-200/60 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400">
                Sandbox
              </span>
            </div>

            <p className="text-[10px] text-slate-500 dark:text-dark-muted mb-2 leading-relaxed">
              Simule a visão de qualquer aluno sem gravar alterações.
            </p>

            <div className="space-y-1.5">
              <div className="relative">
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full text-xs font-normal bg-white dark:bg-dark-card border border-slate-200/90 dark:border-white/[0.08] rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 appearance-none pr-7 cursor-pointer"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.goals?.[0] || st.level || 'Aluno'})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                type="button"
                onClick={() => handleStartSimulation()}
                disabled={isSimulatingLoading || !selectedStudentId}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-slate-950 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSimulatingLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>Iniciar Simulação</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* User Profile & Footer Controls */}
          <div className="p-3.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=150'}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/[0.1] shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                  {user?.name || 'Rafaela Personal'}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                onClick={toggleTheme}
                className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-cardElevated transition-colors"
                title="Alternar tema"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-slate-400" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
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
          <header className="hidden md:flex items-center justify-between px-8 py-3.5 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-slate-200/70 dark:border-white/[0.06] sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Painel de Gestão
              </span>
            </div>

            <div className="flex items-center gap-2">
              <LanguageSelector />
              <button
                onClick={() => setIsNotifOpen(true)}
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-cardElevated transition-colors"
                title="Notificações"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
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
