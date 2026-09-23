import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  RefreshCw,
  Eye,
  FileCode,
  X,
} from 'lucide-react';
import { aiRequestRepository } from '../../../../repositories/aiRequestRepository';
import { studentRepository } from '../../../../repositories/studentRepository';
import { AIRequest, Student } from '../../../../types';

export const AIRequestHistoryPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<AIRequest[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [taskFilter, setTaskFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<AIRequest | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqs, stds] = await Promise.all([
        aiRequestRepository.getAll(),
        studentRepository.getAll(),
      ]);
      setRequests(reqs);
      setStudents(stds);
    } catch (err) {
      console.error('Erro ao carregar histórico de requisições:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const studentMap = React.useMemo(() => {
    const map = new Map<string, string>();
    students.forEach((s) => map.set(s.id, s.name));
    return map;
  }, [students]);

  const filteredRequests = React.useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (taskFilter !== 'all' && r.task !== taskFilter) return false;

      if (search.trim()) {
        const query = search.toLowerCase();
        const studentName = (r.studentId ? studentMap.get(r.studentId) || '' : '').toLowerCase();
        const model = r.model.toLowerCase();
        const task = r.task.toLowerCase();
        return studentName.includes(query) || model.includes(query) || task.includes(query) || r.id.toLowerCase().includes(query);
      }

      return true;
    });
  }, [requests, statusFilter, taskFilter, search, studentMap]);

  const taskLabels: Record<string, string> = {
    workout_generation: 'Geração de Treino',
    exercise_substitution: 'Substituição de Exercício',
    workout_review: 'Revisão de Cargas',
    progress_analysis: 'Análise de Progresso',
    chat_assistant: 'Chat / Dúvidas',
  };

  const getStatusBadge = (status: AIRequest['status']) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="success" size="sm">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Sucesso
          </Badge>
        );
      case 'validation_failed':
        return (
          <Badge variant="warning" size="sm">
            <AlertTriangle className="w-3 h-3 mr-1" /> Rejeitado por Validação
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="danger" size="sm">
            <AlertTriangle className="w-3 h-3 mr-1" /> Erro de API
          </Badge>
        );
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-500" />
            Auditoria & Log de Requisições de IA
          </h2>
          <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
            Registro detalhado e imutável de todas as inferências, tokens consumidos, latência e conformidade LGPD.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={loadData}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          className="text-xs"
        >
          Recarregar Logs
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por aluno, modelo, ID ou tarefa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="all">Todos os Status</option>
              <option value="success">Sucesso</option>
              <option value="validation_failed">Validação Falhou</option>
              <option value="error">Erro de Execução</option>
            </select>

            <select
              value={taskFilter}
              onChange={(e) => setTaskFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="all">Todas as Tarefas</option>
              <option value="workout_generation">Geração de Treino</option>
              <option value="exercise_substitution">Substituição</option>
              <option value="workout_review">Revisão</option>
              <option value="progress_analysis">Progresso</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tabela de Logs */}
      <Card className="overflow-hidden border border-slate-200 dark:border-dark-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-dark-bg text-slate-500 dark:text-dark-muted font-bold border-b border-slate-200 dark:border-dark-border">
              <tr>
                <th className="py-3 px-4">Data / Hora</th>
                <th className="py-3 px-4">Tarefa</th>
                <th className="py-3 px-4">Aluno</th>
                <th className="py-3 px-4">Modelo</th>
                <th className="py-3 px-4">Tokens</th>
                <th className="py-3 px-4">Latência</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border/40">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Carregando auditoria...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Nenhum registro de inferência encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r) => {
                  const studentName = (r.studentId && studentMap.get(r.studentId)) || r.studentId || 'Geral';
                  const dateStr = new Date(r.createdAt).toLocaleString('pt-BR');
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-card/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{dateStr}</td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {taskLabels[r.task] || r.task}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{studentName}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">{r.model}</td>
                      <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400">
                        {r.tokenUsage?.totalTokens ? r.tokenUsage.totalTokens.toLocaleString('pt-BR') : '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-amber-600 dark:text-amber-400">
                        {r.latencyMs}ms
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(r.status)}</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRequest(r)}
                          className="text-xs p-1"
                          title="Ver detalhes da auditoria"
                        >
                          <Eye className="w-4 h-4 text-slate-500 hover:text-emerald-500" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Detalhes da Requisição */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-dark-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Detalhes do Log de Auditoria ({selectedRequest.id})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-border text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 dark:bg-dark-bg rounded-xl border border-slate-100 dark:border-dark-border font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Data / Hora:</span>
                  <span className="text-slate-800 dark:text-slate-200">{new Date(selectedRequest.createdAt).toLocaleString('pt-BR')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Modelo / Versão:</span>
                  <span className="text-slate-800 dark:text-slate-200">{selectedRequest.model} ({selectedRequest.promptVersion})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Latência:</span>
                  <span className="text-amber-500 font-bold">{selectedRequest.latencyMs} ms</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Tokens (Prompt / Conclusão / Total):</span>
                  <span className="text-emerald-500 font-bold">
                    {selectedRequest.tokenUsage?.promptTokens || 0} / {selectedRequest.tokenUsage?.completionTokens || 0} / {selectedRequest.tokenUsage?.totalTokens || 0}
                  </span>
                </div>
              </div>

              {selectedRequest.error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl space-y-1">
                  <span className="font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Erro / Motivo de Falha de Validação:
                  </span>
                  <p className="text-rose-600 dark:text-rose-400 font-mono text-[11px] leading-relaxed">
                    {selectedRequest.error}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">Auditoria Completa (JSON):</span>
                <pre className="p-3 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] overflow-auto max-h-60 leading-relaxed">
                  {JSON.stringify(selectedRequest, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 dark:border-dark-border flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSelectedRequest(null)} className="text-xs">
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
