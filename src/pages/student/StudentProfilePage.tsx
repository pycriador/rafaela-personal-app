import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { User, Sun, Moon, LogOut, ArrowLeftRight, Calendar, Target, Shield } from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { user, studentProfile, logout, quickLogin, isSimulationMode, exitStudentSimulation } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchToPersonal = async () => {
    if (isSimulationMode) {
      await exitStudentSimulation();
    } else {
      await quickLogin('user-rafaela');
    }
    navigate('/personal/dashboard');
  };

  if (!studentProfile) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Meu Perfil
        </h1>
        <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
          Suas informações cadastrais e preferências de treino
        </p>
      </div>

      <Card className="p-6 text-center space-y-4">
        <div className="flex justify-center">
          <img
            src={studentProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={studentProfile.name}
            className="w-24 h-24 rounded-3xl object-cover ring-2 ring-slate-200 dark:ring-white/10 shadow-sm"
          />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {studentProfile.name}
          </h2>
          <p className="text-xs text-slate-500">{studentProfile.email}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-1.5 pt-1">
          {studentProfile.goals.map((g) => (
            <Badge key={g} variant="brand" size="sm">
              {g}
            </Badge>
          ))}
          <Badge variant="neutral" size="sm">
            Nível {studentProfile.level}
          </Badge>
        </div>
      </Card>

      {/* Routine details */}
      <Card className="p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Rotina de Treinos
        </h3>
        <div className="space-y-2 text-xs text-slate-600 dark:text-dark-muted">
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-border/60">
            <span>Dias de treino:</span>
            <strong className="text-slate-900 dark:text-white">
              {studentProfile.availableDays.join(', ')} ({studentProfile.availableDays.length}x/semana)
            </strong>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100 dark:border-dark-border/60">
            <span>Personal Trainer:</span>
            <strong className="text-emerald-500">Rafaela Personal</strong>
          </div>
          <div className="flex justify-between py-1">
            <span>Adesão Geral:</span>
            <strong className="text-emerald-500 font-mono">
              {studentProfile.adherencePercentage}%
            </strong>
          </div>
        </div>
      </Card>

      {/* Settings & actions */}
      <Card className="p-4 space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-cardElevated text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
        >
          <span className="flex items-center gap-2">
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            Tema Visual
          </span>
          <span className="text-slate-400 capitalize">{theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}</span>
        </button>

        {isSimulationMode && (
          <button
            onClick={handleSwitchToPersonal}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-cardElevated text-xs font-bold text-emerald-600 dark:text-emerald-400 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4" />
              Sair do Modo de Teste (Voltar ao Painel da Personal)
            </span>
            <span className="text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded">Ambiente Sandbox</span>
          </button>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-bold text-rose-500 transition-colors"
        >
          <span className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Sair da Conta
          </span>
        </button>
      </Card>
    </div>
  );
};
