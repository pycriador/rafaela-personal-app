import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Moon, Sun, Menu, X, ArrowRight, UserCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export const LandingNavbar: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDashboardRedirect = () => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'personal') {
      navigate('/personal/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 dark:bg-dark-bg/80 border-b border-slate-200/80 dark:border-dark-border/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight leading-none">
                Rafaela
              </span>
              <span className="text-xs font-black px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Personal
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block">
              Biomecânica & Performance
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-600 dark:text-slate-300">
          <button
            onClick={() => scrollToSection('recursos')}
            className="hover:text-emerald-500 transition-colors cursor-pointer"
          >
            Recursos do App
          </button>
          <button
            onClick={() => scrollToSection('metodologia')}
            className="hover:text-emerald-500 transition-colors cursor-pointer"
          >
            Metodologia
          </button>
          <button
            onClick={() => scrollToSection('demonstracao')}
            className="hover:text-emerald-500 transition-colors cursor-pointer"
          >
            Demonstração Ao Vivo
          </button>
          <button
            onClick={() => scrollToSection('planos')}
            className="hover:text-emerald-500 transition-colors cursor-pointer"
          >
            Planos & Preços
          </button>
          <button
            onClick={() => scrollToSection('depoimentos')}
            className="hover:text-emerald-500 transition-colors cursor-pointer"
          >
            Resultados
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className="hover:text-emerald-500 transition-colors cursor-pointer"
          >
            Dúvidas
          </button>
        </nav>

        {/* Action Controls & Theme Toggle */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Theme Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-card transition-colors"
            title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleDashboardRedirect}
              leftIcon={<UserCheck className="w-4 h-4" />}
            >
              Meu Dashboard ({user.role === 'personal' ? 'Personal' : 'Aluno'})
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Entrar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => scrollToSection('planos')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Começar Agora
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-card"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden px-4 pt-3 pb-6 border-t border-slate-200/80 dark:border-dark-border/80 bg-white dark:bg-dark-bg space-y-3">
          <nav className="flex flex-col space-y-2 text-sm font-bold text-slate-700 dark:text-slate-200">
            <button
              onClick={() => scrollToSection('recursos')}
              className="py-2 text-left hover:text-emerald-500"
            >
              Recursos do App
            </button>
            <button
              onClick={() => scrollToSection('metodologia')}
              className="py-2 text-left hover:text-emerald-500"
            >
              Metodologia
            </button>
            <button
              onClick={() => scrollToSection('demonstracao')}
              className="py-2 text-left hover:text-emerald-500"
            >
              Demonstração Ao Vivo
            </button>
            <button
              onClick={() => scrollToSection('planos')}
              className="py-2 text-left hover:text-emerald-500"
            >
              Planos & Preços
            </button>
            <button
              onClick={() => scrollToSection('depoimentos')}
              className="py-2 text-left hover:text-emerald-500"
            >
              Depoimentos de Alunos
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="py-2 text-left hover:text-emerald-500"
            >
              Perguntas Frequentes
            </button>
          </nav>

          <div className="pt-3 border-t border-slate-100 dark:border-dark-border/60 flex flex-col gap-2">
            {user ? (
              <Button
                variant="primary"
                className="w-full"
                onClick={handleDashboardRedirect}
              >
                Meu Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => navigate('/login')}
                >
                  Entrar na Conta
                </Button>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => scrollToSection('planos')}
                >
                  Começar Agora
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
