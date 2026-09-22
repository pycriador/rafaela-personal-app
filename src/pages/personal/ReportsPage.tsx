import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Download,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Scale,
  Calendar,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../context/ToastContext';
import { workoutRepository } from '../../repositories/workoutRepository';
import { studentRepository } from '../../repositories/studentRepository';
import { WorkoutModification, Student } from '../../types';

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const content = [
    headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, info } = useToast();

  const [modifications, setModifications] = useState<WorkoutModification[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // URL state
  const currentSearch = searchParams.get('search') || '';
  const currentAction = searchParams.get('action') || 'all';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const pageSize = 6;

  const loadData = async () => {
    setLoading(true);
    try {
      const [mods, studs] = await Promise.all([
        workoutRepository.getModifications(),
        studentRepository.getAll(),
      ]);
      setModifications(mods);
      setStudents(studs);
    } catch (err) {
      console.error('Erro ao carregar dados de relatórios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '' || v === 'all') {
        next.delete(k);
      } else {
        next.set(k, v);
      }
    });
    setSearchParams(next);
  };

  const handleSearchChange = (val: string) => {
    updateParams({ search: val, page: '1' });
  };

  const handleActionFilter = (action: string) => {
    updateParams({ action, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: String(newPage) });
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  // Filtered modifications
  const filteredModifications = useMemo(() => {
    return modifications.filter((mod) => {
      const matchesSearch =
        !currentSearch ||
        mod.studentName.toLowerCase().includes(currentSearch.toLowerCase()) ||
        mod.exerciseName.toLowerCase().includes(currentSearch.toLowerCase()) ||
        (mod.reason && mod.reason.toLowerCase().includes(currentSearch.toLowerCase()));

      const matchesAction = currentAction === 'all' || mod.action === currentAction;

      return matchesSearch && matchesAction;
    });
  }, [modifications, currentSearch, currentAction]);

  const totalItems = filteredModifications.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const pagedModifications = filteredModifications.slice(startIndex, startIndex + pageSize);

  // CSV Export Handlers
  const handleExportAdherence = () => {
    const headers = ['Nome do Aluno', 'Status', 'Objetivos', 'Frequência Semanal', 'Taxa de Adesão (%)'];
    const rows = students.map((s) => [
      s.name,
      s.status,
      s.goals.join('; '),
      `${s.availableDays.length}x (${s.availableDays.join(', ')})`,
      `${s.adherencePercentage ?? 0}%`,
    ]);
    downloadCsv(`relatorio_adesao_alunos_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    success('Relatório de adesão exportado com sucesso!');
  };

  const handleExportLoadsAudit = () => {
    const headers = ['Data/Hora', 'Aluno', 'Ação', 'Exercício', 'Carga Prescrita (kg)', 'Carga Executada (kg)', 'Variação', 'Justificativa / Motivo'];
    const rows = modifications.map((m) => [
      new Date(m.timestamp).toLocaleString('pt-BR'),
      m.studentName,
      m.action,
      m.exerciseName,
      m.before ?? '-',
      m.after ?? '-',
      m.difference ?? '-',
      m.reason || '-',
    ]);
    downloadCsv(`auditoria_cargas_modificacoes_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    success('Auditoria de cargas exportada com sucesso!');
  };

  const handleExportLgpd = () => {
    const headers = ['ID Aluno', 'Nome', 'Email', 'Telefone', 'Status', 'Objetivo', 'Consentimento LGPD', 'Data Cadastro'];
    const rows = students.map((s) => [
      s.id,
      s.name,
      s.email || '-',
      s.phone || '-',
      s.status,
      s.goals.join(', '),
      'Sim (Registrado em Termo de Adesão Digital)',
      s.createdAt || new Date().toISOString().split('T')[0],
    ]);
    downloadCsv(`pacote_conformidade_lgpd_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    info('Pacote de conformidade LGPD gerado e baixado.');
  };

  const actionOptions = [
    { value: 'all', label: 'Todas as Ações Auditadas' },
    { value: 'WEIGHT_CHANGED', label: 'Carga Alterada' },
    { value: 'EXERCISE_SKIPPED', label: 'Exercício Pulado' },
    { value: 'EXERCISE_SUBSTITUTED', label: 'Substituição' },
    { value: 'DIFFICULTY_REPORTED', label: 'Dificuldade Reportada' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-emerald-500" />
            Relatórios & Auditoria de Prescrição
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-muted mt-0.5">
            Histórico completo de alterações dos alunos, conformidade LGPD e exportações oficiais
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
        >
          Atualizar Dados
        </Button>
      </div>

      {/* 3 Quick Export Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Relatório de Adesão Mensal</h3>
            <p className="text-xs text-slate-500 dark:text-dark-muted mt-1 leading-relaxed">
              Consolidação de treinos prescritos, executados e frequência semanal de todos os {students.length} alunos.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={handleExportAdherence}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Exportar CSV de Adesão
          </Button>
        </Card>

        <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center mb-3">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Auditoria de Cargas & Variações</h3>
            <p className="text-xs text-slate-500 dark:text-dark-muted mt-1 leading-relaxed">
              Histórico com {modifications.length} registros de alterações Prescrito vs. Executado e justificativas.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={handleExportLoadsAudit}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Exportar Auditoria Completa
          </Button>
        </Card>

        <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Conformidade & LGPD (Dados)</h3>
            <p className="text-xs text-slate-500 dark:text-dark-muted mt-1 leading-relaxed">
              Portabilidade e consentimento de dados cadastrais dos alunos para auditoria legal.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={handleExportLgpd}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Gerar Pacote LGPD
          </Button>
        </Card>
      </div>

      {/* Main Card: Interactive Audit Table with URL Pagination & Filters */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle>Histórico de Auditoria & Alterações dos Alunos</CardTitle>
            <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
              Eventos registrados em tempo real sincronizados via Supabase e LocalStorage
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-full sm:w-64">
              <Input
                placeholder="Buscar por aluno, exercício..."
                value={currentSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                className="text-xs"
              />
            </div>
            <div className="w-full sm:w-56">
              <Select
                value={currentAction}
                onChange={(e) => handleActionFilter(e.target.value)}
                options={actionOptions}
              />
            </div>
            {(currentSearch || currentAction !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs text-rose-500 hover:text-rose-600"
                leftIcon={<X className="w-3.5 h-3.5" />}
              >
                Limpar
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 flex justify-center items-center gap-3">
              <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              <span className="text-xs text-slate-500">Carregando auditoria...</span>
            </div>
          ) : pagedModifications.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold">Nenhum registro encontrado</p>
              <p className="text-xs text-slate-500">Tente ajustar os filtros ou a busca na URL.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-dark-cardElevated/50 text-slate-500 dark:text-dark-muted border-y border-slate-100 dark:border-dark-border/60">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Data / Hora</th>
                    <th className="py-3 px-4 font-semibold">Aluno</th>
                    <th className="py-3 px-4 font-semibold">Ação Auditada</th>
                    <th className="py-3 px-4 font-semibold">Exercício</th>
                    <th className="py-3 px-4 font-semibold">Variação / Detalhes</th>
                    <th className="py-3 px-4 font-semibold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-border/60">
                  {pagedModifications.map((mod) => (
                    <tr
                      key={mod.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-dark-cardElevated/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-dark-muted whitespace-nowrap">
                        {new Date(mod.timestamp).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <button
                          type="button"
                          onClick={() => navigate(`/personal/students/${mod.studentId}`)}
                          className="hover:text-emerald-500 hover:underline text-left transition-colors"
                        >
                          {mod.studentName}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge
                          variant={
                            mod.action === 'EXERCISE_SKIPPED'
                              ? 'danger'
                              : mod.action === 'EXERCISE_SUBSTITUTED'
                              ? 'info'
                              : mod.action === 'WEIGHT_CHANGED'
                              ? 'warning'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {mod.action === 'WEIGHT_CHANGED' && 'Carga Alterada'}
                          {mod.action === 'EXERCISE_SKIPPED' && 'Exercício Pulado'}
                          {mod.action === 'EXERCISE_SUBSTITUTED' && 'Substituição'}
                          {mod.action === 'DIFFICULTY_REPORTED' && 'Dificuldade'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {mod.exerciseName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-dark-muted">
                        {mod.action === 'WEIGHT_CHANGED' ? (
                          <span className="font-mono text-xs">
                            <span className="text-slate-400">{mod.before}kg</span> →{' '}
                            <strong className="text-emerald-600 dark:text-emerald-400">{mod.after}kg</strong>{' '}
                            <span className="text-[11px] text-emerald-500 font-bold">({mod.difference})</span>
                          </span>
                        ) : mod.reason ? (
                          <span className="italic text-slate-500">&ldquo;{mod.reason}&rdquo;</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/personal/students/${mod.studentId}`)}
                          className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        >
                          Perfil
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* URL Pagination Footer */}
          {!loading && totalItems > 0 && (
            <div className="p-4 border-t border-slate-100 dark:border-dark-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 dark:text-dark-muted font-mono">
                Exibindo <strong>{startIndex + 1}</strong> a{' '}
                <strong>{Math.min(startIndex + pageSize, totalItems)}</strong> de{' '}
                <strong>{totalItems}</strong> registros
                {totalPages > 1 && (
                  <span className="ml-1 text-slate-400">
                    (Página {validCurrentPage} de {totalPages})
                  </span>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={validCurrentPage <= 1}
                    className="px-2"
                    title="Primeira Página"
                  >
                    <ChevronsLeft className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(validCurrentPage - 1)}
                    disabled={validCurrentPage <= 1}
                    leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                  >
                    Anterior
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePageChange(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold font-mono transition-all ${
                        p === validCurrentPage
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-cardElevated'
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(validCurrentPage + 1)}
                    disabled={validCurrentPage >= totalPages}
                    rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  >
                    Próximo
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={validCurrentPage >= totalPages}
                    className="px-2"
                    title="Última Página"
                  >
                    <ChevronsRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
