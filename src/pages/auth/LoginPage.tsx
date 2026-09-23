import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Dumbbell, Sparkles, User, Lock, ArrowRight, Sun, Moon } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickLogin } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toastError('Preencha seu e-mail e senha.');
      return;
    }
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      toastSuccess('Login efetuado com sucesso!');
      if (email.toLowerCase().includes('rafaela')) {
        navigate('/personal/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } else {
      toastError(res.error || 'Credenciais inválidas.');
    }
  };

  const handleQuick = async (userId: string, targetRole: 'personal' | 'student') => {
    setLoading(true);
    const ok = await quickLogin(userId);
    setLoading(false);
    if (ok) {
      toastSuccess(`Bem-vindo(a) ao sistema!`);
      navigate(targetRole === 'personal' ? '/personal/dashboard' : '/student/dashboard');
    }
  };

  const trainerUser = {
    id: 'user-rafaela',
    name: 'Rafaela Personal',
    email: 'rafaela@mock.com',
    role: 'personal' as const,
    tag: 'Personal Trainer',
    desc: 'Visão do Professor: gestão de alunos, fichas, biblioteca de exercícios e financeiro',
    color: 'border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 shadow-xs',
  };

  const studentUsers = [
    {
      id: 'user-joao',
      name: 'João Pedro Santos',
      email: 'joao@mock.com',
      role: 'student' as const,
      tag: 'Aluno • Emagrecimento',
      desc: 'Área do Aluno: ficha de treino, execução de séries e bate-papo de dúvidas',
      color: 'border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/15',
    },
    {
      id: 'user-mariana',
      name: 'Mariana Silva',
      email: 'mariana@mock.com',
      role: 'student' as const,
      tag: 'Aluna • Hipertrofia',
      desc: 'Área do Aluno: ficha de musculação, progressão de carga e alimentação',
      color: 'border-cyan-500/40 bg-cyan-500/5 hover:bg-cyan-500/15',
    },
    {
      id: 'user-carlos',
      name: 'Carlos Eduardo Souza',
      email: 'carlos@mock.com',
      role: 'student' as const,
      tag: 'Aluno • Condicionamento',
      desc: 'Área do Aluno: full body iniciante e acompanhamento de métricas',
      color: 'border-purple-500/40 bg-purple-500/5 hover:bg-purple-500/15',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Theme toggle in corner */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-3 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors shadow-sm"
        title="Alternar tema"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="max-w-md w-full space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-xl shadow-emerald-500/25 mb-1">
            <Dumbbell className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            RAFAELA TRAINING
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-dark-muted">
            Plataforma de Treinos Personalizados • Prescrição & Execução
          </p>
        </div>

        {/* Quick Demo Login Box */}
        <Card className="p-5 border-emerald-500/30 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-4 h-4" />
            Acesso Rápido com 1 Clique (Dados Mock)
          </div>

          {/* Section 1: Professor */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Entrar como Profissional (Personal Trainer)
            </span>
            <button
              type="button"
              onClick={() => handleQuick(trainerUser.id, trainerUser.role)}
              disabled={loading}
              className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between group ${trainerUser.color}`}
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {trainerUser.name}
                  </span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500 text-white shadow-xs">
                    {trainerUser.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-0.5 font-medium">
                  {trainerUser.desc}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-all shrink-0" />
            </button>
          </div>

          {/* Section 2: Alunos */}
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-dark-border/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Entrar como Aluno (Login Único & Funcional)
            </span>
            <div className="space-y-1.5">
              {studentUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuick(u.id, u.role)}
                  disabled={loading}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all duration-150 flex items-center justify-between group ${u.color}`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {u.name}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                        {u.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-dark-muted truncate mt-0.5">
                      {u.desc}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Manual Login Form */}
        <Card className="p-5">
          <form onSubmit={handleManualLogin} className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Ou faça login manualmente
            </h2>
            <Input
              label="E-mail"
              type="email"
              placeholder="ex: rafaela@mock.com ou mariana@mock.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
            />
            <Input
              label="Senha"
              type="password"
              placeholder="123456"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
            />
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={loading}
            >
              Entrar na Plataforma
            </Button>
          </form>
        </Card>

        {/* Disclaimer / Architecture Notice */}
        <div className="text-center">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
            Arquitetura preparada para substituição por Supabase Auth / JWT. Dados persistidos localmente via Repository Pattern.
          </p>
        </div>
      </div>
    </div>
  );
};
