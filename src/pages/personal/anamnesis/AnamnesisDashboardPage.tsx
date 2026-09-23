import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  ClipboardList,
  Users,
  Search,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { StatCard } from '../../../components/ui/StatCard';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Tabs } from '../../../components/ui/Tabs';
import { formService } from '../../../services/anamnesis/formService';
import { formApplicationService } from '../../../services/anamnesis/formApplicationService';
import { formResponseService } from '../../../services/anamnesis/formResponseService';
import { studentRepository } from '../../../repositories/studentRepository';
import {
  Form,
  FormApplication,
  FormResponse,
  Student,
  AnamnesisStats,
} from '../../../types';
import { FormStatusBadge } from '../../../components/forms/FormStatusBadge';
import { FormApplicationModal } from '../../../components/forms/FormApplicationModal';

export const AnamnesisDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'visao-geral';

  const [stats, setStats] = useState<AnamnesisStats>({
    activeFormsCount: 0,
    pendingApplicationsCount: 0,
    submittedResponsesCount: 0,
    expiredApplicationsCount: 0,
  });

  const [forms, setForms] = useState<Form[]>([]);
  const [applications, setApplications] = useState<FormApplication[]>([]);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [studentsMap, setStudentsMap] = useState<Record<string, Student>>({});
  const [loading, setLoading] = useState(true);

  // Modal para aplicar formulário selecionado
  const [selectedFormToApply, setSelectedFormToApply] = useState<Form | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [statData, formList, appList, respList, allStudents] = await Promise.all([
          formService.getStats(),
          formService.getForms(),
          formApplicationService.getAllApplications(),
          formResponseService.getResponsesByStudentId(''), // traz todas
          studentRepository.getAll(),
        ]);

        setStats(statData);
        setForms(formList);
        setApplications(appList);
        setResponses(respList);

        const map: Record<string, Student> = {};
        allStudents.forEach((st) => {
          map[st.id] = st;
        });
        setStudentsMap(map);
      } catch (err) {
        console.error('Erro ao carregar dados de anamnese:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleTabChange = (newTab: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', newTab);
    setSearchParams(next);
  };

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Carregando módulo de anamnese e saúde...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Anamnese & Formulários de Saúde
              </h1>
              <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
                Crie questionários clínicos, colete consentimentos e acompanhe histórico de respostas dos alunos
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/personal/anamnesis/applications')}
            leftIcon={<Users className="w-4 h-4" />}
            className="text-xs font-bold"
          >
            Ver Aplicações
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/personal/anamnesis/forms/new')}
            leftIcon={<Plus className="w-4 h-4" />}
            className="text-xs font-bold"
          >
            Novo Formulário
          </Button>
        </div>
      </div>

      {/* 4 StatCards da Anamnese (Seção 23) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Formulários Ativos"
          value={stats.activeFormsCount}
          icon={<FileText className="w-6 h-6 text-emerald-500" />}
          subtitle="Modelos disponíveis para aplicação"
        />
        <StatCard
          title="Aplicações Pendentes"
          value={stats.pendingApplicationsCount}
          icon={<Clock className="w-6 h-6 text-amber-500" />}
          subtitle="Aguardando resposta do aluno"
        />
        <StatCard
          title="Respostas Recebidas"
          value={stats.submittedResponsesCount}
          icon={<CheckCircle2 className="w-6 h-6 text-cyan-500" />}
          subtitle="Anamneses preenchidas com aceite"
        />
        <StatCard
          title="Formulários Vencidos"
          value={stats.expiredApplicationsCount}
          icon={<AlertTriangle className="w-6 h-6 text-rose-500" />}
          subtitle="Necessitam reaplicação ou lembrete"
        />
      </div>

      {/* Sub-abas de Navegação */}
      <Tabs
        activeTab={activeTab}
        onChange={handleTabChange}
        tabs={[
          { id: 'visao-geral', label: 'Visão Geral & Recentes', icon: <ClipboardList className="w-4 h-4" /> },
          { id: 'formularios', label: `Formulários (${forms.length})`, icon: <FileText className="w-4 h-4" /> },
          { id: 'aplicacoes', label: `Aplicações Pendentes (${applications.filter((a) => a.status === 'pending').length})`, icon: <Clock className="w-4 h-4" /> },
          { id: 'respostas', label: `Respostas Enviadas (${responses.length})`, icon: <CheckCircle2 className="w-4 h-4" /> },
        ]}
      />

      {/* ABA 1: VISÃO GERAL */}
      {activeTab === 'visao-geral' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Coluna Esquerda: Formulários Principais */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Modelos de Formulários
                  </h3>
                  <p className="text-xs text-slate-500">Formulários prontos para envio aos alunos</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/personal/anamnesis/forms')}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="text-xs text-emerald-600 dark:text-emerald-400"
                >
                  Gerenciar
                </Button>
              </div>

              <div className="space-y-3">
                {forms.slice(0, 4).map((form) => (
                  <div
                    key={form.id}
                    className="p-4 rounded-2xl border border-slate-200/80 dark:border-dark-border bg-slate-50/50 dark:bg-dark-cardElevated/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-500/40 transition-colors"
                  >
                    <div className="space-y-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {form.name}
                        </span>
                        <FormStatusBadge status={form.status} type="form" />
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {form.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/personal/anamnesis/forms/${form.id}/edit`)}
                        className="text-xs"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedFormToApply(form)}
                        className="text-xs"
                      >
                        Aplicar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Coluna Direita: Últimas Respostas & Alertas */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Respostas Recebidas
                  </h3>
                  <p className="text-xs text-slate-500">Últimas submissões de anamnese</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTabChange('respostas')}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="text-xs text-emerald-600 dark:text-emerald-400"
                >
                  Ver todas
                </Button>
              </div>

              {responses.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Nenhuma resposta recebida até o momento.
                </div>
              ) : (
                <div className="space-y-3">
                  {responses.slice(0, 4).map((resp) => {
                    const st = studentsMap[resp.studentId];
                    const formItem = forms.find((f) => f.id === resp.formId);

                    return (
                      <div
                        key={resp.id}
                        onClick={() => navigate(`/personal/anamnesis/responses/${resp.id}`)}
                        className="p-3.5 rounded-2xl border border-slate-200/70 dark:border-dark-border bg-white dark:bg-dark-card flex items-center justify-between gap-3 hover:border-emerald-500/40 transition-colors cursor-pointer shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={st?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={st?.name}
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-emerald-500/20 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
                              {st?.name || 'Aluno'}
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate">
                              {formItem?.name || 'Formulário'} • {new Date(resp.submittedAt || '').toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-black uppercase text-emerald-500 block">
                            Aceite OK ✅
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {resp.answers.length} respostas
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ABA 2: FORMULÁRIOS */}
      {activeTab === 'formularios' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {forms.map((form) => (
            <Card key={form.id} className="p-5 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all shadow-xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <FormStatusBadge status={form.status} type="form" />
                  <span className="text-[11px] font-mono text-slate-400">
                    Criado em {new Date(form.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {form.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-dark-muted mt-1 line-clamp-3">
                    {form.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-dark-border/60 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => navigate(`/personal/anamnesis/forms/${form.id}/edit`)}
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
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ABA 3: APLICAÇÕES PENDENTES */}
      {activeTab === 'aplicacoes' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-dark-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Aplicações Pendentes de Resposta
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {applications.filter((a) => a.status === 'pending').length} aguardando envio
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-dark-border">
            {applications.filter((a) => a.status === 'pending').map((app) => {
              const st = studentsMap[app.studentId];
              const formItem = forms.find((f) => f.id === app.formId);

              return (
                <div key={app.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={st?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={st?.name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-emerald-500/20 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {st?.name || 'Aluno'}
                      </h4>
                      <p className="text-slate-500">
                        {formItem?.name || 'Formulário'} • Aplicado em {new Date(app.assignedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {app.dueAt && (
                      <span className="text-slate-500 font-mono text-[11px]">
                        Prazo: <strong>{new Date(app.dueAt).toLocaleDateString('pt-BR')}</strong>
                      </span>
                    )}
                    <FormStatusBadge status={app.status} type="application" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ABA 4: RESPOSTAS ENVIADAS */}
      {activeTab === 'respostas' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-dark-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Histórico Completo de Respostas
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {responses.length} respostas registradas
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-dark-border">
            {responses.map((resp) => {
              const st = studentsMap[resp.studentId];
              const formItem = forms.find((f) => f.id === resp.formId);

              return (
                <div
                  key={resp.id}
                  onClick={() => navigate(`/personal/anamnesis/responses/${resp.id}`)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50 dark:hover:bg-dark-cardElevated/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={st?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={st?.name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-emerald-500/20 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {st?.name || 'Aluno'}
                      </h4>
                      <p className="text-slate-500">
                        {formItem?.name || 'Formulário'} • Enviado em {new Date(resp.submittedAt || '').toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="text-emerald-500 font-bold">Aceite Confirmado ✅</span>
                    <FormStatusBadge status={resp.status} type="response" />
                    <Button variant="ghost" size="sm" className="text-xs font-bold text-emerald-500">
                      Visualizar Resposta →
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Modal para aplicar formulário */}
      {selectedFormToApply && (
        <FormApplicationModal
          isOpen={!!selectedFormToApply}
          onClose={() => setSelectedFormToApply(null)}
          form={selectedFormToApply}
          onApplied={() => {
            formService.getStats().then(setStats);
            formApplicationService.getAllApplications().then(setApplications);
          }}
        />
      )}
    </div>
  );
};
