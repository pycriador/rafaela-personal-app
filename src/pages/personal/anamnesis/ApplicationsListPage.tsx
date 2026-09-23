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
  Trash2,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  Copy,
  Check,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { formApplicationService } from '../../../services/anamnesis/formApplicationService';
import { formService } from '../../../services/anamnesis/formService';
import { formVersionRepository } from '../../../repositories/formVersionRepository';
import { formResponseRepository } from '../../../repositories/formResponseRepository';
import { studentRepository } from '../../../repositories/studentRepository';
import {
  FormApplication,
  Form,
  FormVersion,
  FormField,
  FormResponse,
  Student,
} from '../../../types';
import { FormStatusBadge } from '../../../components/forms/FormStatusBadge';
import { FormResponseViewer } from '../../../components/forms/FormResponseViewer';
import { FormApplicationModal } from '../../../components/forms/FormApplicationModal';
import { useToast } from '../../../context/ToastContext';

interface ViewingResponseState {
  response: FormResponse;
  form: Form | null;
  version: FormVersion | null;
  fields: FormField[];
  student: Student | null;
}

interface ViewingPendingState {
  application: FormApplication;
  student: Student | null;
  form: Form | null;
  version: FormVersion | null;
}

export const ApplicationsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [applications, setApplications] = useState<FormApplication[]>([]);
  const [allResponses, setAllResponses] = useState<FormResponse[]>([]);
  const [allFields, setAllFields] = useState<FormField[]>([]);
  const [formsMap, setFormsMap] = useState<Record<string, Form>>({});
  const [versionsMap, setVersionsMap] = useState<Record<string, FormVersion>>({});
  const [studentsMap, setStudentsMap] = useState<Record<string, Student>>({});
  const [responsesMap, setResponsesMap] = useState<Record<string, FormResponse>>({});
  const [loading, setLoading] = useState(true);

  // Modais de ação
  const [viewingResponseData, setViewingResponseData] = useState<ViewingResponseState | null>(null);
  const [viewingPendingApp, setViewingPendingApp] = useState<ViewingPendingState | null>(null);
  const [deletingApp, setDeletingApp] = useState<FormApplication | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Filtros
  const studentFilter = searchParams.get('student') || 'todos';
  const formFilter = searchParams.get('form') || 'todos';
  const statusFilter = searchParams.get('status') || 'todos';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const pageSize = 8;

  async function loadData() {
    try {
      const [appList, fList, vList, stList, rList, fldList] = await Promise.all([
        formApplicationService.getAllApplications(),
        formService.getForms(),
        formVersionRepository.getAll(),
        studentRepository.getAll(),
        formResponseRepository.getAll(),
        formVersionRepository.getAllFields(),
      ]);

      setApplications(appList);
      setAllResponses(rList);
      setAllFields(fldList);

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
        if (r.applicationId) {
          rMap[r.applicationId] = r;
        }
      });
      setResponsesMap(rMap);
    } catch (err) {
      console.error('Erro ao listar aplicações:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'todos') next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  // Encontra a resposta vinculada à aplicação de forma segura e abrangente
  const getResponseForApp = (app: FormApplication): FormResponse | undefined => {
    // 1. Pelo ID direto da aplicação
    if (responsesMap[app.id]) return responsesMap[app.id];

    // 2. Busca pelo applicationId em allResponses
    const byApp = allResponses.find((r) => r.applicationId === app.id);
    if (byApp) return byApp;

    // 3. Fallback: resposta do mesmo aluno para o mesmo formulário e versão
    const byStudentAndVer = allResponses.find(
      (r) => r.studentId === app.studentId && r.formId === app.formId && r.formVersionId === app.formVersionId
    );
    if (byStudentAndVer) return byStudentAndVer;

    // 4. Fallback mais recente do aluno para este formulário
    return allResponses.find(
      (r) => r.studentId === app.studentId && r.formId === app.formId
    );
  };

  // Abrir visualização da resposta do aluno ou detalhes do envio
  const handleView = (app: FormApplication) => {
    const resp = getResponseForApp(app);
    const student = studentsMap[app.studentId] || null;
    const form = formsMap[app.formId] || null;
    const version = versionsMap[app.formVersionId] || (resp ? versionsMap[resp.formVersionId] : null) || null;

    if (resp) {
      const targetVersionId = resp.formVersionId || app.formVersionId;
      const versionFields = allFields.filter((f) => f.versionId === targetVersionId);

      setViewingResponseData({
        response: resp,
        form,
        version,
        fields: versionFields.length > 0 ? versionFields : allFields.filter((f) => f.versionId === 'ver-init-v1'),
        student,
      });
    } else {
      setViewingPendingApp({
        application: app,
        student,
        form,
        version,
      });
    }
  };

  // Exclusão do envio
  const handleConfirmDelete = async () => {
    if (!deletingApp) return;
    setIsDeleting(true);
    try {
      const ok = await formApplicationService.deleteApplication(deletingApp.id);
      if (ok) {
        setApplications((prev) => prev.filter((a) => a.id !== deletingApp.id));
        success('Envio excluído com sucesso.');
        setDeletingApp(null);
      } else {
        toastError('Não foi possível excluir este envio.');
      }
    } catch (err) {
      console.error('Erro ao excluir envio:', err);
      toastError('Erro ao excluir envio.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Reaplicar formulário para o aluno
  const handleReapply = async (studentId: string, formId: string) => {
    try {
      await formApplicationService.reapplyToStudent(studentId, formId);
      await loadData();
      success('Formulário reaplicado com sucesso! Uma nova aplicação foi gerada sem afetar o histórico anterior.');
    } catch {
      toastError('Erro ao reaplicar formulário.');
    }
  };

  const handleCopyLink = (appId: string) => {
    const url = `${window.location.origin}/student/anamnesis/fill/${appId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    success('Link de preenchimento copiado para a área de transferência!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSendWhatsApp = (student: Student | null, form: Form | null, appId: string) => {
    if (!student?.phone) {
      toastError('Este aluno não possui número de telefone/WhatsApp cadastrado.');
      return;
    }
    const cleanPhone = student.phone.replace(/\D/g, '');
    const text = `Olá ${student.name}! A treinadora Rafaela enviou o formulário "${form?.name || 'de Treino'}" para você preencher. Acesse o aplicativo para responder: ${window.location.origin}/student/anamnesis/fill/${appId}`;
    const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
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
        <p className="text-xs font-semibold text-slate-400">Carregando aplicações e envios...</p>
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
              Envios & Respostas de Formulários
            </h1>
            <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
              Acompanhe respostas dos alunos, visualize detalhes e gerencie envios da plataforma
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="text-xs font-bold"
          >
            Novo Envio
          </Button>
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
            <option value="todos">Todos os alunos ({applications.length})</option>
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
            <option value="completed">Respondida</option>
            <option value="pending">Pendente</option>
            <option value="expired">Expirada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>
      </Card>

      {/* Tabela de Aplicações / Envios */}
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
                    Nenhum envio encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                pagedApplications.map((app) => {
                  const student = studentsMap[app.studentId];
                  const form = formsMap[app.formId];
                  const version = versionsMap[app.formVersionId];
                  const response = getResponseForApp(app);

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
                            className="w-7 h-7 rounded-lg object-cover ring-1 ring-emerald-500/20 shrink-0"
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
                          {/* Botão Ver Respostas */}
                          <Button
                            variant={response ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => handleView(app)}
                            className={`text-xs font-bold ${
                              response
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                : 'text-slate-700 dark:text-slate-200'
                            }`}
                            title={response ? 'Visualizar respostas do aluno' : 'Ver detalhes do envio pendente'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{response ? 'Ver' : 'Detalhes'}</span>
                          </Button>

                          {/* Reaplicar se finalizado */}
                          {app.status === 'completed' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleReapply(app.studentId, app.formId)}
                              className="text-xs font-bold"
                              title="Reaplicar formulário gerando nova solicitação"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                              <span className="hidden sm:inline">Reaplicar</span>
                            </Button>
                          )}

                          {/* Botão Deletar Envio */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingApp(app)}
                            className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            title="Excluir este envio"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Excluir</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-dark-border flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Página {validCurrentPage} de {totalPages} ({totalItems} envios)
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={validCurrentPage <= 1}
                onClick={() => handleFilterChange('page', String(validCurrentPage - 1))}
                className="text-xs"
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={validCurrentPage >= totalPages}
                onClick={() => handleFilterChange('page', String(validCurrentPage + 1))}
                className="text-xs"
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ================= MODAL 1: VISUALIZAR RESPOSTAS DO ALUNO ================= */}
      {viewingResponseData && (
        <Modal
          isOpen={!!viewingResponseData}
          onClose={() => setViewingResponseData(null)}
          size="xl"
          allowFullscreenToggle={true}
          title={`Respostas de ${viewingResponseData.student?.name || 'Aluno'}`}
          description={`${viewingResponseData.form?.name || 'Formulário'} • Versão ${viewingResponseData.version?.version || 1}`}
        >
          <div className="space-y-6 pt-2">
            {/* Barra de Ações do Topo do Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-border">
              <div className="flex items-center gap-2">
                <Badge variant="success">Respondido</Badge>
                <span className="text-xs text-slate-500 font-mono">
                  Enviado em {new Date(viewingResponseData.response.submittedAt || '').toLocaleString('pt-BR')}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/personal/forms/responses/${viewingResponseData.response.id}`)}
                rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Abrir em Tela Cheia
              </Button>
            </div>

            {/* Visualizador Completo com Todas as Perguntas e Respostas */}
            <FormResponseViewer
              response={viewingResponseData.response}
              form={viewingResponseData.form}
              version={viewingResponseData.version}
              fields={viewingResponseData.fields}
              student={viewingResponseData.student}
              hideHeader={false}
            />

            <div className="pt-4 border-t border-slate-100 dark:border-dark-border flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setViewingResponseData(null)}
                className="text-xs font-bold"
              >
                Fechar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ================= MODAL 2: DETALHES DO ENVIO PENDENTE ================= */}
      {viewingPendingApp && (
        <Modal
          isOpen={!!viewingPendingApp}
          onClose={() => setViewingPendingApp(null)}
          size="md"
          title="Envio Aguardando Resposta"
          description={`O aluno ${viewingPendingApp.student?.name || 'selecionado'} ainda não preencheu este formulário.`}
        >
          <div className="space-y-4 pt-2">
            <Card className="p-4 bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                Status: Pendente de Resposta
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                Assim que o aluno preencher e aceitar os termos pelo aplicativo, as respostas completas aparecerão aqui automaticamente.
              </p>
            </Card>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-dark-border">
                <span className="text-slate-500">Aluno:</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {viewingPendingApp.student?.name} ({viewingPendingApp.student?.email})
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-dark-border">
                <span className="text-slate-500">Formulário:</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {viewingPendingApp.form?.name}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-dark-border">
                <span className="text-slate-500">Data de Envio:</span>
                <span className="font-mono text-slate-800 dark:text-white">
                  {new Date(viewingPendingApp.application.assignedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-dark-border">
                <span className="text-slate-500">Prazo Limite:</span>
                <span className="font-mono text-slate-800 dark:text-white">
                  {viewingPendingApp.application.dueAt
                    ? new Date(viewingPendingApp.application.dueAt).toLocaleDateString('pt-BR')
                    : 'Sem prazo estipulado'}
                </span>
              </div>
              {viewingPendingApp.application.message && (
                <div className="py-1.5 border-b border-slate-100 dark:border-dark-border">
                  <span className="text-slate-500 block mb-0.5">Mensagem encaminhada:</span>
                  <span className="italic text-slate-700 dark:text-slate-300">
                    "{viewingPendingApp.application.message}"
                  </span>
                </div>
              )}
            </div>

            {/* Ações Rápidas de Lembrete */}
            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleSendWhatsApp(
                    viewingPendingApp.student,
                    viewingPendingApp.form,
                    viewingPendingApp.application.id
                  )
                }
                leftIcon={<MessageSquare className="w-4 h-4 text-emerald-500" />}
                className="w-full text-xs font-bold"
              >
                Cobrar / Enviar Lembrete no WhatsApp
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyLink(viewingPendingApp.application.id)}
                leftIcon={copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                className="w-full text-xs"
              >
                {copiedLink ? 'Link Copiado!' : 'Copiar Link de Preenchimento do Aluno'}
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-dark-border flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const target = viewingPendingApp.application;
                  setViewingPendingApp(null);
                  setDeletingApp(target);
                }}
                className="text-xs text-rose-500 hover:text-rose-600"
              >
                Excluir Envio
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setViewingPendingApp(null)}
                className="text-xs font-bold"
              >
                Fechar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ================= MODAL 3: CONFIRMAÇÃO DE EXCLUSÃO ================= */}
      {deletingApp && (
        <Modal
          isOpen={!!deletingApp}
          onClose={() => setDeletingApp(null)}
          size="sm"
          title="Excluir Envio de Formulário"
        >
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
              <div>
                <p className="font-bold">Atenção: Ação Irreversível</p>
                <p className="mt-0.5 text-[11px]">
                  Tem certeza que deseja excluir o envio do formulário{' '}
                  <strong className="underline">
                    "{formsMap[deletingApp.formId]?.name || 'Formulário'}"
                  </strong>{' '}
                  para o aluno{' '}
                  <strong className="underline">
                    "{studentsMap[deletingApp.studentId]?.name || 'Aluno'}"
                  </strong>
                  ? Este registro será removido permanentemente da listagem.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-dark-border flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={isDeleting}
                onClick={() => setDeletingApp(null)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white border-transparent"
              >
                {isDeleting ? 'Excluindo...' : 'Sim, Excluir Envio'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ================= MODAL 4: NOVO ENVIO ================= */}
      <FormApplicationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onApplied={() => {
          setIsCreateModalOpen(false);
          loadData();
        }}
      />
    </div>
  );
};
