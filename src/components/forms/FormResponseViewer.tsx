import React from 'react';
import { FormResponse, FormVersion, FormField, Student, Form } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { FormStatusBadge } from './FormStatusBadge';
import {
  User,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface FormResponseViewerProps {
  response: FormResponse;
  form?: Form | null;
  version?: FormVersion | null;
  fields: FormField[];
  student?: Student | null;
  hideHeader?: boolean;
}

export const FormResponseViewer: React.FC<FormResponseViewerProps> = ({
  response,
  form,
  version,
  fields,
  student,
  hideHeader = false,
}) => {
  const sections = version?.sections || [];
  const answersMap = new Map<string, any>();
  (response.answers || []).forEach((a) => answersMap.set(a.fieldId, a.value));

  const submittedFormatted = response.submittedAt
    ? new Date(response.submittedAt).toLocaleString('pt-BR')
    : 'Não enviado';

  const renderFieldValue = (field: FormField) => {
    const val = answersMap.get(field.id);

    if (val === true || val === 'true') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          Sim
        </span>
      );
    }

    if (val === false || val === 'false') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
          Não
        </span>
      );
    }

    if (Array.isArray(val)) {
      if (val.length === 0) {
        return <span className="text-slate-400 dark:text-slate-500 font-normal italic">Nenhum</span>;
      }
      return (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {val.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
            >
              {item}
            </span>
          ))}
        </div>
      );
    }

    if (val !== undefined && val !== null && val !== '') {
      if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
        const [yyyy, mm, dd] = val.split('-');
        return <span>{`${dd}/${mm}/${yyyy}`}</span>;
      }
      return <span className="whitespace-pre-wrap">{String(val)}</span>;
    }

    return <span className="text-slate-400 dark:text-slate-500 font-normal italic">Não respondido</span>;
  };

  const sectionFieldIds = new Set<string>();
  sections.forEach((s) => {
    fields.filter((f) => f.sectionId === s.id).forEach((f) => sectionFieldIds.add(f.id));
  });
  const uncategorizedFields = fields.filter((f) => !sectionFieldIds.has(f.id) && f.active && f.type !== 'terms');

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full">
      {/* Header com Metadados da Resposta (ocultável se já exibido externamente) */}
      {!hideHeader && (
        <Card className="p-5 sm:p-6 border border-slate-200/80 dark:border-dark-border space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/70 dark:border-dark-border/60">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono">
                  Versão {version?.version || 1}
                </span>
                <FormStatusBadge status={response.status} type="response" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {form?.name || 'Formulário de Anamnese'}
              </h1>
            </div>

            <div className="flex items-center gap-3 bg-white dark:bg-dark-card p-2.5 rounded-2xl border border-slate-200/80 dark:border-dark-border shrink-0">
              <img
                src={student?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={student?.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/30"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {student?.name || 'Aluno'}
                </span>
                <span className="text-[11px] text-slate-500 block">{student?.email}</span>
              </div>
            </div>
          </div>

          {/* Informações de envio e carimbo temporal */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-cardElevated/50 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Data e Hora de Envio</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 font-mono">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>{submittedFormatted}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-cardElevated/50 space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Aceite do Termo</span>
              <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>{response.consentRecord?.accepted ? `Confirmado (v${response.consentRecord.termsVersion})` : 'Pendente'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-cardElevated/50 space-y-0.5 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Total de Respostas</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                {response.answers.length} campos respondidos
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Respostas estruturadas por seções */}
      <div className="space-y-4">
        {sections.map((section, secIdx) => {
          const sectionFields = fields.filter((f) => f.sectionId === section.id && f.active && f.type !== 'terms');
          if (sectionFields.length === 0) return null;

          return (
            <Card key={section.id} className="p-4 sm:p-5 space-y-3.5 shadow-xs border-slate-200/80 dark:border-dark-border">
              <div className="border-b border-slate-100 dark:border-dark-border/60 pb-2">
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider">
                  Seção {secIdx + 1}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {section.title}
                </h3>
                {section.description && (
                  <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
                    {section.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sectionFields.map((field) => {
                  const isTextarea = field.type === 'textarea';

                  return (
                    <div
                      key={field.id}
                      className={`p-3.5 rounded-xl border border-slate-200/70 dark:border-dark-border/60 bg-slate-50/70 dark:bg-dark-cardElevated/40 space-y-1 ${
                        isTextarea ? 'md:col-span-2' : ''
                      }`}
                    >
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                        {field.label}
                      </span>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                        {renderFieldValue(field)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}

        {/* Perguntas não categorizadas ou formulário sem seções */}
        {(sections.length === 0 || uncategorizedFields.length > 0) && uncategorizedFields.length > 0 && (
          <Card className="p-4 sm:p-5 space-y-3.5 shadow-xs border-slate-200/80 dark:border-dark-border">
            <div className="border-b border-slate-100 dark:border-dark-border/60 pb-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Respostas Gerais
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {uncategorizedFields.map((field) => {
                const isTextarea = field.type === 'textarea';
                return (
                  <div
                    key={field.id}
                    className={`p-3.5 rounded-xl border border-slate-200/70 dark:border-dark-border/60 bg-slate-50/70 dark:bg-dark-cardElevated/40 space-y-1 ${
                      isTextarea ? 'md:col-span-2' : ''
                    }`}
                  >
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                      {field.label}
                    </span>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                      {renderFieldValue(field)}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Comprovante Legal de Consentimento */}
        {response.consentRecord && (
          <Card className="p-5 border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                Registro Legal de Consentimento & Ciência
              </h4>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
              &ldquo;{response.consentRecord.statement}&rdquo;
            </p>

            <div className="pt-2 border-t border-emerald-500/20 flex flex-wrap items-center justify-between text-xs text-slate-500 font-mono gap-2">
              <span>Aceito por: <strong>{student?.name || response.studentId}</strong></span>
              <span>Timestamp: <strong>{new Date(response.consentRecord.acceptedAt).toLocaleString('pt-BR')}</strong></span>
              <span>Versão do Termo: <strong>v{response.consentRecord.termsVersion}</strong></span>
              <span>Versão do Formulário: <strong>v{response.consentRecord.formVersion}</strong></span>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
