import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { TrendingUp, Dumbbell, Flame, CheckCircle2 } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { workoutRepository } from '../../repositories/workoutRepository';
import { WorkoutSession } from '../../types';

export const StudentEvolutionPage: React.FC = () => {
  const { studentProfile } = useAuth();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!studentProfile) return;
      try {
        const data = await workoutRepository.getSessions(studentProfile.id);
        setSessions(data);
      } catch (err) {
        console.error('Erro ao carregar sessões:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentProfile]);

  // Compute dynamic progression from real sessions if available
  const completedSessions = sessions.filter((s) => s.status === 'completed');

  const progressionData = React.useMemo(() => {
    if (completedSessions.length >= 2) {
      return completedSessions.map((s, idx) => {
        const primarySet = s.setsCompleted?.find((set) => set.actualWeight > 0) || s.setsCompleted?.[0];
        return {
          treino: `Sessão ${idx + 1}`,
          data: s.date,
          supino: primarySet?.actualWeight || 30,
        };
      });
    }
    return [
      { treino: 'Sessão 1', data: '2026-03-01', supino: 28 },
      { treino: 'Sessão 2', data: '2026-03-03', supino: 30 },
      { treino: 'Sessão 3', data: '2026-03-05', supino: 30 },
      { treino: 'Sessão 4', data: '2026-03-08', supino: 32 },
    ];
  }, [completedSessions]);

  const weeklyVolume = React.useMemo(() => {
    if (completedSessions.length >= 2) {
      return completedSessions.slice(-6).map((s, idx) => ({
        semana: `Treino ${idx + 1}`,
        kg: s.totalVolumeKg || 4000,
      }));
    }
    return [
      { semana: 'Sem 1', kg: 3800 },
      { semana: 'Sem 2', kg: 4200 },
      { semana: 'Sem 3', kg: 4500 },
      { semana: 'Sem 4', kg: 5100 },
    ];
  }, [completedSessions]);

  const totalVolumeLifted = completedSessions.reduce((acc, s) => acc + s.totalVolumeKg, 0);
  const firstWeight = progressionData[0]?.supino || 28;
  const lastWeight = progressionData[progressionData.length - 1]?.supino || 32;
  const progressionDiff = lastWeight - firstWeight;
  const progressionSign = progressionDiff >= 0 ? `+${progressionDiff}` : `${progressionDiff}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Minha Evolução
        </h1>
        <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
          Acompanhe o ganho de força, sobrecarga progressiva e consistência
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Progressão de Carga"
          value={`${progressionSign} kg`}
          subtitle={`${completedSessions.length || 4} sessões registradas`}
          icon={<Dumbbell className="w-5 h-5 text-emerald-500" />}
          change={{ value: `${progressionSign} kg`, trend: progressionDiff >= 0 ? 'up' : 'down' }}
        />
        <StatCard
          title="Consistência"
          value={`${studentProfile?.adherencePercentage || 95}%`}
          subtitle="Taxa de assiduidade"
          icon={<Flame className="w-5 h-5 text-emerald-500" />}
        />
      </div>

      {/* Gráfico de Cargas ao longo do tempo */}
      <Card className="p-5">
        <CardHeader className="p-0 pb-3">
          <CardTitle className="text-sm">Evolução de Cargas (kg) por Sessão</CardTitle>
          <p className="text-xs text-slate-500">
            Acompanhamento de sobrecarga progressiva nos exercícios principais
          </p>
        </CardHeader>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={progressionData}>
              <defs>
                <linearGradient id="supinoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="treino" stroke="#888888" fontSize={10} />
              <YAxis stroke="#888888" fontSize={10} unit="kg" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#131b2a',
                  borderRadius: '12px',
                  borderColor: '#232e45',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="supino"
                name="Supino Máquina"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#supinoGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Volume semanal */}
      <Card className="p-5">
        <CardHeader className="p-0 pb-3">
          <CardTitle className="text-sm">Volume Total Movimentado por Semana (kg)</CardTitle>
          <p className="text-xs text-slate-500">Tonelagem acumulada</p>
        </CardHeader>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyVolume}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="semana" stroke="#888888" fontSize={10} />
              <YAxis stroke="#888888" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#131b2a',
                  borderRadius: '12px',
                  borderColor: '#232e45',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="kg" name="Kg Levantados" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
