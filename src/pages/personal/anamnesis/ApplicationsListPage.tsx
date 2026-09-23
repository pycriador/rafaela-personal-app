import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  ArrowLeft,
  Calendar,
  Clock,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  Plus,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { formApplicationService } from '../../../services/anamnesis/formApplicationService';
import { formService } from '../../../services/anamnesis/formService';
import { formVersionRepository } from '../../../repositories/formVersionRepository';
import { formResponseRepository } from '../../../repositories/formResponseRepository';
import { studentRepository } from '../../../repositories/studentRepository';
import {
  FormApplication,
  Form,
  FormVersion,
  FormResponse,
  Student,
} from '../../../types';
import { FormStatusBadge } from '../../../components/forms/FormStatusBadge';
import { useToast } from '../../../context/ToastContext';

export const ApplicationsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [applications, setApplications] = useState<FormApplication[]>([]);
  const [formsMap, setFormsMap] = useState<Record<string, Form>>({});
  const [versionsMap, setVersionsMap] = useState<Record<string, FormVersion>>({});
  const [studentsMap, setStudentsMap] = useState<Record<string, Student>>({});
  const [responsesMap, setResponsesMap] = useState<Record<string, FormResponse>>({});
  const [loading, setLoading] = useState(true);

  // Filtros
  const studentFilter = searchParams.get('student') || 'todos';
  const formFilter = searchParams.get('form') || 'todos';
  const statusFilter = searchParams.get('status') || 'todos';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const pageSize = 8;

  useEffect(() => {
    async function loadData() {
      try {
        const [appList, fList, vList, stList, rList] = await Promise.all([
          formApplicationService.getAllApplications(),
          formService.getForms(),
          formVersionRepository.getAll(),
          studentRepository.getAll(),
          formResponseRepository.getAll(),
        ]);

        setApplications(appList);

        const fMap: Record<string, Form> = {};
        fList.forEach((f) => {
          fMap[f.id] = f;
        });
        setFormsMap(fMap);

        const vMap: Record<string, FormVersion> = {};
        vList.forEach((v) => {
          vMap[v.id] = v;
        });
        setVersionsMap(vMap);

        const sMap: Record<string, Student> = {};
        stList.forEach((s) => {
          sMap[s.id] = s;
        });
        setStudentsMap(sMap);

        const rMap: Record<string, FormResponse> = {};
        rList.forEach((r) => {
          rMap[r.applicationId] = r;
        });
        setResponsesMap(rMap);
      } catch (err) {
        console.error('Erro ao listar aplicações:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'todos') next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleReapply = async (studentId: string, formId: string) => {
    try {
      await formApplicationService.reapplyToStudent(studentId, formId);
      const updated = await formApplicationService.getAllApplications();
      setApplications(updated);
      success('Formulário reaplicado com sucesso! Uma nova aplicação foi gerada sem afetar a anterior.');
    } catch {
      toastError('Erro ao reaplicar formulário.');
    }
  };

  const handleCancelApp = async (appId: string) => {
    try {
      await formApplicationService.cancelApplication(appId);
      const updated = await formApplicationService.getAllApplications();
      setApplications(updated);
      success('Aplicação cancelada.');
    } catch {
      toastError('Erro ao cancelar aplicação.');
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesStudent = studentFilter === 'todos' || app.studentId === studentFilter;
      const matchesForm = formFilter === 'todos' || app.formId === formFilter;
      const matchesStatus = statusFilter === 'todos' || app.status === statusFilter;
      return matchesStudent && matchesForm && matchesStatus;
    });
  }, [applications, studentFilter, formFilter, statusFilter]);

  const totalItems = filteredApplications.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const pagedApplications = filteredApplications.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Carregando aplicações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/personal/anamnesis')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="text-xs"
          >
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Aplicações de Formulários
            </h1>
            <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
              Histórico de envios, status de resposta, prazos e reaplicação por aluno
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <Card className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 shadow-xs">
        <div>
          <label className="text-[11px] font-bold text-slate-500 block mb-1">Filtrar por Aluno:</label>
          <select
            value={studentFilter}
            onChange={(e) => handleFilterChange('student', e.target.value)}
            className="w-full text-xs font-bold bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="todos">Todos os alunos</option>
            {Object.values(studentsMap).map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500 block mb-1">Filtrar por Formulário:</label>
          <select
            value={formFilter}
            onChange={(e) => handleFilterChange('form', e.target.value)}
            className="w-full text-xs font-bold bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="todos">Todos os formulários</option>
            {Object.values(formsMap).map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500 block mb-1">Filtrar por Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full text-xs font-bold bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="todos">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="completed">Respondida</option>
            <option value="expired">Expirada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>
      </Card>

      {/* Tabela de Aplicações (Seção 24) */}
      <Card className="overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-dark-cardElevated/60 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200/80 dark:border-dark-border">
              <tr>
                <th className="py-3 px-4">Aluno</th>
                <th className="py-3 px-4">Formulário</th>
                <th className="py-3 px-4">Versão</th>
                <th className="py-3 px-4">Aplicado em</th>
                <th className="py-3 px-4">Prazo</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Respondido em</th>
                <th className="py-3 px-4">Aceite</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
              {pagedApplications.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Nenhuma aplicação encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                pagedApplications.map((app) => {
                  const student = studentsMap[app.studentId];
                  const form = formsMap[app.formId];
                  const version = versionsMap[app.formVersionId];
                  const response = responsesMap[app.id];

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-dark-cardElevated/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <img
                            src={student?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={student?.name}
                            className="w-7 h-7 rounded-lg object-cover ring-1 ring-emerald-500/20"
                          />
                          <span className="truncate max-w-[130px]">{student?.name || 'Aluno'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {form?.name || 'Formulário'}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        v{version?.version || 1}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(app.assignedAt).toLocaleDateString('pt-BR')}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {app.dueAt ? new Date(app.dueAt).toLocaleDateString('pt-BR') : '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        <FormStatusBadge status={app.status} type="application" />
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {response?.submittedAt
                          ? new Date(response.submittedAt).toLocaleDateString('pt-BR')
                          : '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        {response?.consentRecord?.accepted ? (
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase">
                            Aceito ✅
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 uppercase">Pendente</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {response && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/personal/anamnesis/responses/${response.id}`)}
                              className="text-xs font-bold text-emerald-500 hover:text-emerald-600"
                              title="Visualizar Resposta"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Ver</span>
                            </Button>
                          )}

                          {app.status === 'completed' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleReapply(app.studentId, app.formId)}
                              className="text-xs font-bold"
                              title="Reaplicar formulário gerando nova solicitação sem sobrescrever esta"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-cyan-500" />
                              <span className="hidden sm:inline">Reaplicar</span>
                            </Button>
                          )}

                          {app.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancelApp(app.id)}
                              className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                              title="Cancelar Aplicação"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Cancelar</span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
