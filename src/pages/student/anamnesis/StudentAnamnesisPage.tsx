import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { formApplicationService } from '../../../services/anamnesis/formApplicationService';
import { formResponseService } from '../../../services/anamnesis/formResponseService';
import { formService } from '../../../services/anamnesis/formService';
import { formVersionRepository } from '../../../repositories/formVersionRepository';
import { Form, FormVersion, FormApplication, FormResponse } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { FormStatusBadge } from '../../../components/forms/FormStatusBadge';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  ArrowRight,
  Eye,
  AlertTriangle,
  FileText,
  ShieldCheck,
} from 'lucide-react';

export const StudentAnamnesisPage: React.FC = () => {
  const navigate = useNavigate();
  const { studentProfile } = useAuth();

  const [applications, setApplications] = useState<FormApplication[]>([]);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [formsMap, setFormsMap] = useState<Record<string, Form>>({});
  const [versionsMap, setVersionsMap] = useState<Record<string, FormVersion>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!studentProfile) return;
      const targetId = studentProfile.userId || studentProfile.id;

      try {
        const [apps, resps, allForms, allVers] = await Promise.all([
          formApplicationService.getApplicationsByStudentId(targetId).then(async (res) => {
            if (res && res.length > 0) return res;
            return studentProfile.id ? formApplicationService.getApplicationsByStudentId(studentProfile.id) : [];
          }),
          formResponseService.getResponsesByStudentId(targetId).then(async (res) => {
            if (res && res.length > 0) return res;
            return studentProfile.id ? formResponseService.getResponsesByStudentId(studentProfile.id) : [];
          }),
          formService.getForms(),
          formVersionRepository.getAll(),
        ]);

        setApplications(apps);
        setResponses(resps);

        const fMap: Record<string, Form> = {};
        allForms.forEach((f: Form) => {
          fMap[f.id] = f;
        });
        setFormsMap(fMap);

        const vMap: Record<string, FormVersion> = {};
        allVers.forEach((v: FormVersion) => {
          vMap[v.id] = v;
        });
        setVersionsMap(vMap);
      } catch (err) {
        console.error('Erro ao carregar anamneses do aluno:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [studentProfile]);

  const pendingApplications = applications.filter(
    (a) => a.status === 'pending' || a.status === 'in_progress'
  );

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Carregando seus formulários de saúde...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <ClipboardList className="w-6 h-6 text-emerald-500" />
          Minhas Anamneses & Questionários
        </h1>
        <p className="text-xs text-slate-500 dark:text-dark-muted mt-1 max-w-2xl leading-relaxed">
          Preencha os formulários de saúde solicitados pela sua treinadora. Suas respostas orientam as prescrições de treino e ficam registradas com total privacidade (LGPD).
        </p>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-500">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pendentes
            </p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {pendingApplications.length}
            </h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Enviadas
            </p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {responses.length}
            </h3>
          </div>
        </Card>
      </div>

      {/* Seção 1: Formulários Pendentes */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {pendingApplications.length > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          )}
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Aguardando seu Preenchimento ({pendingApplications.length})
          </h2>
        </div>

        {pendingApplications.length === 0 ? (
          <Card className="p-6 text-center text-xs text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Nenhum formulário pendente!
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Você está em dia com todas as solicitações de anamnese da sua treinadora.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingApplications.map((app) => {
              const form = formsMap[app.formId];
              const version = versionsMap[app.formVersionId];
              const isOverdue = app.dueAt && new Date(app.dueAt) < new Date();

              return (
                <Card
                  key={app.id}
                  className="p-5 border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {form?.name || 'Formulário Personalizado'}
                      </h3>
                      {version && (
                        <Badge variant="neutral" size="sm" className="font-mono text-[10px]">
                          v{version.version}
                        </Badge>
                      )}
                      <FormStatusBadge status={app.status} />
                      {app.isMandatory && (
                        <Badge variant="warning" size="sm" className="text-[10px]">
                          Obrigatório
                        </Badge>
                      )}
                    </div>

                    {form?.description && (
                      <p className="text-xs text-slate-600 dark:text-dark-muted">
                        {form.description}
                      </p>
                    )}

                    {app.message && (
                      <div className="text-xs text-amber-900 dark:text-amber-200 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 italic">
                        Mensagem da treinadora: &ldquo;{app.message}&rdquo;
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-dark-muted font-mono">
                      <span>
                        Enviado em: {new Date(app.assignedAt).toLocaleDateString('pt-BR')}
                      </span>
                      {app.dueAt && (
                        <span className={isOverdue ? 'text-rose-500 font-bold' : ''}>
                          • Prazo: {new Date(app.dueAt).toLocaleDateString('pt-BR')}
                          {isOverdue && ' (Atrasado)'}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/student/anamnesis/fill/${app.id}`)}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-none shrink-0"
                  >
                    {app.status === 'in_progress' ? 'Continuar Preenchimento' : 'Responder Agora'}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Seção 2: Histórico de Formulários Enviados */}
      <div className="space-y-3 pt-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          Histórico de Respostas Enviadas ({responses.length})
        </h2>

        {responses.length === 0 ? (
          <Card className="p-6 text-center text-xs text-slate-400">
            <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Nenhuma resposta concluída no histórico
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Conforme você preencher seus questionários, eles ficarão salvos aqui para consulta futura.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {responses.map((resp) => {
              const form = formsMap[resp.formId];
              const version = versionsMap[resp.formVersionId];

              return (
                <Card
                  key={resp.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-500/40 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {form?.name || 'Questionário'}
                      </h3>
                      {version && (
                        <Badge variant="neutral" size="sm" className="font-mono text-[10px]">
                          v{version.version}
                        </Badge>
                      )}
                      <FormStatusBadge status="completed" />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-dark-muted font-mono">
                      <span>
                        Enviado em:{' '}
                        <strong className="text-slate-700 dark:text-slate-300">
                          {resp.submittedAt
                            ? new Date(resp.submittedAt).toLocaleString('pt-BR', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })
                            : '—'}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>{resp.answers.length} respostas registradas</span>
                      {resp.consentRecord && (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Termo Aceito
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/student/anamnesis/responses/${resp.id}`)}
                    leftIcon={<Eye className="w-4 h-4 text-emerald-500" />}
                    className="text-xs shrink-0"
                  >
                    Ver Minhas Respostas
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
