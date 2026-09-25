import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  ArrowLeft,
  Calendar,
  Layers,
  Archive,
  ChevronLeft,
  ChevronRight,
  Filter,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { formService } from '../../../services/anamnesis/formService';
import { formVersionRepository } from '../../../repositories/formVersionRepository';
import { formApplicationRepository } from '../../../repositories/formApplicationRepository';
import { formResponseRepository } from '../../../repositories/formResponseRepository';
import { Form, FormVersion } from '../../../types';
import { FormStatusBadge } from '../../../components/forms/FormStatusBadge';
import { FormApplicationModal } from '../../../components/forms/FormApplicationModal';
import { useToast } from '../../../context/ToastContext';

export const FormsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [forms, setForms] = useState<Form[]>([]);
  const [versionsMap, setVersionsMap] = useState<Record<string, FormVersion>>({});
  const [responsesCountMap, setResponsesCountMap] = useState<Record<string, number>>({});
  const [applicationsCountMap, setApplicationsCountMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Modal para aplicar e excluir
  const [selectedFormToApply, setSelectedFormToApply] = useState<Form | null>(null);
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtros & Paginação via URL
  const searchQuery = searchParams.get('q') || '';
  const statusFilter = searchParams.get('status') || 'todos';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const pageSize = 6;

  useEffect(() => {
    async function loadData() {
      try {
        const [formList, allVersions, allApps, allResps] = await Promise.all([
          formService.getForms(),
          formVersionRepository.getAll(),
          formApplicationRepository.getAll(),
          formResponseRepository.getAll(),
        ]);

        setForms(formList);

        const vMap: Record<string, FormVersion> = {};
        allVersions.forEach((v) => {
          vMap[v.id] = v;
        });
        setVersionsMap(vMap);

        const rMap: Record<string, number> = {};
        allResps.forEach((r) => {
          rMap[r.formId] = (rMap[r.formId] || 0) + 1;
        });
        setResponsesCountMap(rMap);

        const aMap: Record<string, number> = {};
        allApps.forEach((a) => {
          aMap[a.formId] = (aMap[a.formId] || 0) + 1;
        });
        setApplicationsCountMap(aMap);
      } catch (err) {
        console.error('Erro ao listar formulários:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearchChange = (query: string) => {
    const next = new URLSearchParams(searchParams);
    if (query) next.set('q', query);
    else next.delete('q');
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleStatusChange = (status: string) => {
    const next = new URLSearchParams(searchParams);
    if (status !== 'todos') next.set('status', status);
    else next.delete('status');
    next.set('page', '1');
    setSearchParams(next);
  };

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
  };

  const handleArchive = async (formId: string) => {
    try {
      await formService.archiveForm(formId);
      const updated = await formService.getForms();
      setForms(updated);
      success('Formulário arquivado com sucesso. Histórico preservado.');
    } catch {
      toastError('Erro ao arquivar formulário.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!formToDelete) return;
    setIsDeleting(true);
    try {
      const ok = await formService.deleteForm(formToDelete.id);
      if (ok) {
        success('Formulário excluído com sucesso.');
        const updated = await formService.getForms();
        setForms(updated);
        setFormToDelete(null);
      } else {
        toastError('Não foi possível excluir o formulário.');
      }
    } catch (err) {
      console.error('Erro ao excluir formulário:', err);
      toastError('Erro ao excluir formulário.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredForms = useMemo(() => {
    return forms.filter((f) => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'todos' || f.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [forms, searchQuery, statusFilter]);

  const totalItems = filteredForms.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const pagedForms = filteredForms.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Carregando formulários...</p>
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
            onClick={() => navigate('/personal/forms/geral')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="text-xs"
          >
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Gerenciar Formulários
            </h1>
            <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
              Crie, edite, versione e aplique modelos de anamnese para seus alunos
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/personal/forms/fichas/new')}
          leftIcon={<Plus className="w-4 h-4" />}
          className="text-xs font-bold self-start sm:self-auto"
        >
          Novo Formulário
        </Button>
      </div>

      {/* Barra de Filtros e Busca */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por título ou descrição..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500 font-semibold hidden sm:inline">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-xs font-bold bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="todos">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="draft">Rascunhos</option>
            <option value="inactive">Inativos</option>
            <option value="archived">Arquivados</option>
          </select>
        </div>
      </Card>

      {/* Grid de Formulários */}
      {pagedForms.length === 0 ? (
        <Card className="py-12 text-center text-xs text-slate-400">
          Nenhum formulário encontrado com os filtros atuais.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pagedForms.map((form) => {
            const currentVer = versionsMap[form.currentVersionId];
            const responsesCount = responsesCountMap[form.id] || 0;
            const applicationsCount = applicationsCountMap[form.id] || 0;

            return (
              <Card
                key={form.id}
                className="p-5 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <FormStatusBadge status={form.status} type="form" />
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold">
                      v{currentVer?.version || 1}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {form.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-dark-muted mt-1 line-clamp-2">
                      {form.description}
                    </p>
                  </div>

                  {/* Metadados e contadores */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-dark-border/60 text-xs">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-dark-cardElevated/40">
                      <span className="text-[10px] text-slate-400 block font-semibold">Aplicações</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                        {applicationsCount} alunos
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-dark-cardElevated/40">
                      <span className="text-[10px] text-slate-400 block font-semibold">Respostas</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {responsesCount} enviadas
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-dark-border/60 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => navigate(`/personal/forms/fichas/${form.id}/edit`)}
                    className="text-xs"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => setSelectedFormToApply(form)}
                    className="text-xs"
                  >
                    Aplicar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormToDelete(form)}
                    className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 p-2 shrink-0 text-xs"
                    title="Excluir formulário"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500 font-mono">
            Página {validCurrentPage} de {totalPages} ({totalItems} itens)
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(validCurrentPage - 1)}
              disabled={validCurrentPage === 1}
              className="text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(validCurrentPage + 1)}
              disabled={validCurrentPage === totalPages}
              className="text-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal para aplicar */}
      {selectedFormToApply && (
        <FormApplicationModal
          isOpen={!!selectedFormToApply}
          onClose={() => setSelectedFormToApply(null)}
          form={selectedFormToApply}
          onApplied={() => {
            formService.getForms().then(setForms);
          }}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={!!formToDelete}
        onClose={() => !isDeleting && setFormToDelete(null)}
        title="Excluir Formulário"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-300">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold">Atenção: Ação irreversível!</p>
              <p className="text-rose-700/90 dark:text-rose-300/90 leading-relaxed">
                Deseja realmente excluir o formulário <strong className="font-semibold text-rose-950 dark:text-white">"{formToDelete?.name}"</strong>?
                Esta ação removerá o modelo permanentemente da lista.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-dark-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFormToDelete(null)}
              disabled={isDeleting}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              isLoading={isDeleting}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              className="text-xs font-bold"
            >
              Excluir Formulário
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
