import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { formApplicationService } from '../../../services/anamnesis/formApplicationService';
import { formResponseService } from '../../../services/anamnesis/formResponseService';
import { formService } from '../../../services/anamnesis/formService';
import { formVersionRepository } from '../../../repositories/formVersionRepository';
import { FormRenderer } from '../../../components/forms/FormRenderer';
import { Form, FormVersion, FormField, FormApplication, FormAnswer } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { ArrowLeft, ClipboardList, Shield, AlertTriangle } from 'lucide-react';

export const StudentFillFormPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { studentProfile } = useAuth();
  const { success, error: toastError, info } = useToast();

  const [application, setApplication] = useState<FormApplication | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [version, setVersion] = useState<FormVersion | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [initialAnswers, setInitialAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  useEffect(() => {
    async function loadFormToFill() {
      if (!applicationId) return;

      try {
        const app = await formApplicationService.getApplicationById(applicationId);
        if (!app) {
          toastError('Solicitação de formulário não encontrada.');
          navigate('/student/anamnesis');
          return;
        }

        if (app.status === 'completed') {
          info('Este formulário já foi respondido e enviado.');
          navigate('/student/anamnesis');
          return;
        }

        const [f, v, flds, draft] = await Promise.all([
          formService.getFormById(app.formId),
          formVersionRepository.getById(app.formVersionId),
          formVersionRepository.getFieldsByVersionId(app.formVersionId),
          formResponseService.getResponseByApplicationId(app.id),
        ]);

        setApplication(app);
        setForm(f);
        setVersion(v);
        setFields(flds);

        if (draft && draft.answers) {
          const map: Record<string, any> = {};
          draft.answers.forEach((ans) => {
            map[ans.fieldId] = ans.value;
          });
          setInitialAnswers(map);
        }
      } catch (err) {
        console.error('Erro ao carregar formulário para preenchimento:', err);
        toastError('Não foi possível abrir o formulário.');
      } finally {
        setLoading(false);
      }
    }

    loadFormToFill();
  }, [applicationId, navigate]);

  const handleSaveDraft = async (answers: FormAnswer[]) => {
    if (!application || !form || !version) return;
    const studentId = studentProfile?.userId || studentProfile?.id || application.studentId;

    setIsSavingDraft(true);
    try {
      await formResponseService.saveDraft({
        applicationId: application.id,
        formId: form.id,
        formVersionId: version.id,
        studentId,
        answers,
      });
      success('Progresso salvo em rascunho com sucesso!');
    } catch (err) {
      toastError('Erro ao salvar rascunho.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async (answers: FormAnswer[], consentAccepted: boolean) => {
    if (!application || !form || !version) return;
    const studentId = studentProfile?.userId || studentProfile?.id || application.studentId;

    setIsSubmitting(true);
    try {
      await formResponseService.submitResponse({
        applicationId: application.id,
        formId: form.id,
        formVersionId: version.id,
        studentId,
        answers,
        consentAccepted,
        termsVersion: version.termsVersion || '1.0',
        formVersionNumber: version.version,
        termsStatement: 'Declaro que as informações prestadas são verdadeiras.',
      });

      success('Formulário enviado com sucesso para a treinadora!');
      navigate('/student/anamnesis');
    } catch (err: any) {
      toastError(err.message || 'Erro ao enviar respostas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !form || !version) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Preparando formulário para preenchimento...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/student/anamnesis')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          Voltar para Minhas Anamneses
        </Button>
        <Badge variant="neutral" size="sm" className="font-mono text-[10px]">
          Versão {version.version}.0
        </Badge>
      </div>

      {/* Header Banner */}
      <Card className="p-6 border border-slate-200/80 dark:border-dark-border shadow-xs">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/[0.06] text-slate-800 dark:text-slate-200 shrink-0">
            <ClipboardList className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {form.name}
              </h1>
              {application?.isMandatory && (
                <Badge variant="warning" size="sm" className="text-[10px]">
                  Obrigatório
                </Badge>
              )}
            </div>
            {form.description && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-dark-muted leading-relaxed">
                {form.description}
              </p>
            )}
            {application?.message && (
              <div className="mt-3 p-3 rounded-xl bg-white/70 dark:bg-dark-card/70 border border-slate-200/60 dark:border-dark-border text-xs text-slate-700 dark:text-slate-300 italic">
                <strong>Recado da Rafaela:</strong> &ldquo;{application.message}&rdquo;
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Security Reassurance */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-dark-card border border-slate-200/60 dark:border-dark-border text-xs text-slate-500 dark:text-dark-muted flex items-center gap-2.5">
        <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>
          <strong>Privacidade Garantida:</strong> Suas respostas de saúde e histórico clínico são confidenciais e acessíveis exclusivamente pela sua treinadora habilitada para ajuste seguro da sua rotina de treinos.
        </span>
      </div>

      {/* Form Renderer Component */}
      <FormRenderer
        version={version}
        fields={fields}
        initialAnswers={initialAnswers}
        onSaveDraft={handleSaveDraft}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isSavingDraft={isSavingDraft}
      />
    </div>
  );
};
