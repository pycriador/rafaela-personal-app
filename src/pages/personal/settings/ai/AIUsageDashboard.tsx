import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import {
  Activity,
  Zap,
  Clock,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Cpu,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { aiRequestRepository } from '../../../../repositories/aiRequestRepository';
import { AIRequest } from '../../../../types';

export const AIUsageDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<AIRequest[]>([]);
  const [stats, setStats] = useState<{
    totalRequests: number;
    totalTokens: number;
    avgLatencyMs: number;
    successRate: number;
    estimatedCostUsd: number;
  }>({
    totalRequests: 0,
    totalTokens: 0,
    avgLatencyMs: 0,
    successRate: 100,
    estimatedCostUsd: 0,
  });

  const loadStats = async () => {
    setLoading(true);
    try {
      const [allReqs, summary] = await Promise.all([
        aiRequestRepository.getAll(),
        aiRequestRepository.getStats(),
      ]);
      setRequests(allReqs);
      setStats(summary);
    } catch (err) {
      console.error('Erro ao carregar estatísticas de IA:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Agrupamento por Modelo
  const modelBreakdown = React.useMemo(() => {
    const map = new Map<string, { requests: number; tokens: number }>();
    requests.forEach((r) => {
      const current = map.get(r.model) || { requests: 0, tokens: 0 };
      current.requests += 1;
      current.tokens += r.tokenUsage?.totalTokens || 0;
      map.set(r.model, current);
    });
    return Array.from(map.entries()).map(([model, data]) => ({
      model,
      requests: data.requests,
      tokens: data.tokens,
    }));
  }, [requests]);

  // Agrupamento por Tipo de Tarefa
  const taskBreakdown = React.useMemo(() => {
    const map = new Map<string, number>();
    requests.forEach((r) => {
      map.set(r.task, (map.get(r.task) || 0) + 1);
    });
    return Array.from(map.entries()).map(([task, count]) => ({
      task,
      count,
      percentage: Math.round((count / (requests.length || 1)) * 100),
    }));
  }, [requests]);

  const taskLabels: Record<string, string> = {
    workout_generation: 'Geração de Treino Completo',
    exercise_substitution: 'Sugestão de Substituição',
    workout_review: 'Revisão & Ajuste de Cargas',
    progress_analysis: 'Análise de Aderência & Evolução',
    chat_assistant: 'Dúvidas & Bate-papo Aluno',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        Calculando métricas de uso e custos de IA...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            Consumo de Recursos & Custos de IA
          </h2>
          <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
            Métricas em tempo real de tokens consumidos, latência de inferência e projeção financeira.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={loadStats}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="text-xs"
        >
          Atualizar Métricas
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
          <div className="flex items-center justify-between text-slate-500 dark:text-dark-muted text-xs mb-1">
            <span>Requisições Totais</span>
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.totalRequests}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            {stats.successRate}% sucesso operacional
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/20">
          <div className="flex items-center justify-between text-slate-500 dark:text-dark-muted text-xs mb-1">
            <span>Tokens Consumidos</span>
            <TrendingUp className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.totalTokens.toLocaleString('pt-BR')}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-dark-muted mt-1">
            Prompt + Completion acumulados
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
          <div className="flex items-center justify-between text-slate-500 dark:text-dark-muted text-xs mb-1">
            <span>Latência Média</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {stats.avgLatencyMs} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-dark-muted mt-1">
            Tempo de resposta por chamada
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
          <div className="flex items-center justify-between text-slate-500 dark:text-dark-muted text-xs mb-1">
            <span>Custo Estimado</span>
            <DollarSign className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            ${stats.estimatedCostUsd.toFixed(4)}
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 font-semibold">
            ≈ R$ {(stats.estimatedCostUsd * 5.6).toFixed(2)} (BRL)
          </div>
        </Card>
      </div>

      {/* Breakdown em 2 Colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribuição por Modelo */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-dark-border">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-500" />
              Consumo por Modelo
            </CardTitle>
            <Badge variant="neutral" size="sm">{modelBreakdown.length} modelos</Badge>
          </div>

          <div className="space-y-3">
            {modelBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Nenhuma requisição registrada ainda.</p>
            ) : (
              modelBreakdown.map((item) => {
                const pct = stats.totalTokens > 0 ? Math.round((item.tokens / stats.totalTokens) * 100) : 0;
                return (
                  <div key={item.model} className="p-3 rounded-xl bg-slate-50 dark:bg-dark-bg space-y-2 border border-slate-100 dark:border-dark-border">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-white">{item.model}</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {item.requests} reqs • {item.tokens.toLocaleString('pt-BR')} tokens
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-dark-border h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                    <div className="text-right text-[10px] text-slate-400 font-semibold">{pct}% dos tokens</div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Distribuição por Tipo de Tarefa */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-dark-border">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-500" />
              Distribuição por Tipo de Tarefa
            </CardTitle>
            <Badge variant="neutral" size="sm">{taskBreakdown.length} tarefas</Badge>
          </div>

          <div className="space-y-3">
            {taskBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Nenhuma requisição registrada ainda.</p>
            ) : (
              taskBreakdown.map((t) => (
                <div key={t.task} className="p-3 rounded-xl bg-slate-50 dark:bg-dark-bg space-y-2 border border-slate-100 dark:border-dark-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-white">
                      {taskLabels[t.task] || t.task}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {t.count} chamadas
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-dark-border h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.max(t.percentage, 4)}%` }}
                    />
                  </div>
                  <div className="text-right text-[10px] text-slate-400 font-semibold">{t.percentage}% do total</div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
