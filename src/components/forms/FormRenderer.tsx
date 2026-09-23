import React, { useState, useMemo } from 'react';
import { FormVersion, FormField, FormSection, FormAnswer } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ConsentBlock } from './ConsentBlock';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Save,
  Layers,
  ListOrdered,
} from 'lucide-react';

interface FormRendererProps {
  version: FormVersion;
  fields: FormField[];
  initialAnswers?: Record<string, any>;
  onSaveDraft?: (answers: FormAnswer[]) => Promise<void>;
  onSubmit: (answers: FormAnswer[], consentAccepted: boolean) => Promise<void>;
  isSubmitting?: boolean;
  isSavingDraft?: boolean;
  readonly?: boolean;
  isPreview?: boolean;
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  version,
  fields,
  initialAnswers = {},
  onSaveDraft,
  onSubmit,
  isSubmitting = false,
  isSavingDraft = false,
  readonly = false,
  isPreview = false,
}) => {
  const [answers, setAnswers] = useState<Record<string, any>>(initialAnswers);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);
  const [consentAccepted, setConsentAccepted] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState<boolean>(false);
  const [previewViewMode, setPreviewViewMode] = useState<'stepper' | 'full'>('stepper');

  const rawSections = version?.sections || [];
  const sections: FormSection[] = useMemo(() => {
    if (rawSections && rawSections.length > 0) return rawSections;
    return [
      {
        id: 'sec-default',
        versionId: version?.id || '',
        title: 'Perguntas do Formulário',
        description: 'Perguntas configuradas neste questionário.',
        order: 1,
      },
    ];
  }, [rawSections, version?.id]);

  const totalSteps = sections.length;
  const currentSection = sections[currentSectionIndex] || sections[0];

  // Helper para checar se um campo deve estar visível com base na sua condição
  const isFieldVisible = (field: FormField): boolean => {
    if (!field.condition) return true;
    const parentValue = answers[field.condition.fieldId];
    if (field.condition.operator === 'equals') {
      return parentValue === field.condition.value;
    }
    if (field.condition.operator === 'notEquals') {
      return parentValue !== field.condition.value;
    }
    return true;
  };

  // Campos da seção atual que estão visíveis
  const currentSectionVisibleFields = useMemo(() => {
    if (!currentSection) return [];
    return fields
      .filter((f) => {
        if (f.active === false) return false;
        if (sections.length === 1 && sections[0].id === 'sec-default') return true;
        return f.sectionId === currentSection.id;
      })
      .filter(isFieldVisible)
      .sort((a, b) => a.order - b.order);
  }, [fields, currentSection, answers, sections]);

  // Atualização de resposta de um campo
  const handleAnswerChange = (fieldId: string, value: any) => {
    if (readonly) return;
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    if (validationErrors[fieldId]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  // Validação da seção atual
  const validateCurrentSection = (): boolean => {
    const errors: Record<string, string> = {};
    for (const field of currentSectionVisibleFields) {
      if (field.required && field.type !== 'terms') {
        const val = answers[field.id];
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          errors[field.id] = 'Este campo é obrigatório.';
        }
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextSection = () => {
    if (!isPreview && !validateCurrentSection()) return;
    if (currentSectionIndex < totalSteps - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
      if (!isPreview) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      setIsReviewMode(true);
      if (!isPreview) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePreviousSection = () => {
    if (isReviewMode) {
      setIsReviewMode(false);
      if (!isPreview) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
      if (!isPreview) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const formatAnswersArray = (): FormAnswer[] => {
    return Object.entries(answers).map(([fieldId, value]) => ({
      id: `ans-${Date.now()}-${fieldId}`,
      responseId: '',
      fieldId,
      value,
    }));
  };

  const handleTriggerSaveDraft = async () => {
    if (!onSaveDraft) return;
    await onSaveDraft(formatAnswersArray());
  };

  const handleTriggerSubmit = async () => {
    setAttemptedSubmit(true);
    if (!consentAccepted && !isPreview) {
      return;
    }
    await onSubmit(formatAnswersArray(), consentAccepted);
  };

  // Percentual de progresso
  const progressPercent = totalSteps === 0
    ? 100
    : isReviewMode
    ? 100
    : Math.round(((currentSectionIndex + 1) / totalSteps) * 100);

  // Renderizador comum de campos de formulário
  const renderField = (field: FormField) => {
    const val = answers[field.id];
    const hasError = validationErrors[field.id];

    return (
      <div key={field.id} className="space-y-1.5 pb-3 border-b border-slate-100 dark:border-dark-border/40 last:border-b-0 last:pb-0">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>{field.label}</span>
            {field.required && <span className="text-rose-500 font-black">*</span>}
          </label>
        </div>

        {field.description && (
          <p className="text-[11px] text-slate-500 dark:text-dark-muted">
            {field.description}
          </p>
        )}

        {/* Campo Tipo: Text */}
        {field.type === 'text' && (
          <input
            type="text"
            value={val || ''}
            disabled={readonly}
            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
            placeholder={field.placeholder || 'Digite sua resposta...'}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        )}

        {/* Campo Tipo: Textarea */}
        {field.type === 'textarea' && (
          <textarea
            rows={3}
            value={val || ''}
            disabled={readonly}
            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
            placeholder={field.placeholder || 'Descreva detalhadamente...'}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
        )}

        {/* Campo Tipo: Number / Decimal */}
        {(field.type === 'number' || field.type === 'decimal') && (
          <input
            type="number"
            step={field.type === 'decimal' ? '0.1' : '1'}
            value={val !== undefined ? val : ''}
            disabled={readonly}
            onChange={(e) => handleAnswerChange(field.id, e.target.value ? Number(e.target.value) : '')}
            placeholder={field.placeholder || '0'}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        )}

        {/* Campo Tipo: Date */}
        {field.type === 'date' && (
          <input
            type="date"
            value={val || ''}
            disabled={readonly}
            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          />
        )}

        {/* Campo Tipo: Boolean (Sim / Não) */}
        {field.type === 'boolean' && (
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              disabled={readonly}
              onClick={() => handleAnswerChange(field.id, true)}
              className={`flex-1 py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                val === true
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-cardElevated/50 text-slate-700 dark:text-slate-300'
              }`}
            >
              Sim
            </button>
            <button
              type="button"
              disabled={readonly}
              onClick={() => handleAnswerChange(field.id, false)}
              className={`flex-1 py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                val === false
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-cardElevated/50 text-slate-700 dark:text-slate-300'
              }`}
            >
              Não
            </button>
          </div>
        )}

        {/* Campo Tipo: Select Único */}
        {field.type === 'select' && (
          <select
            value={val || ''}
            disabled={readonly}
            onChange={(e) => handleAnswerChange(field.id, e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="">Selecione uma opção...</option>
            {(field.options || []).map((opt) => (
              <option key={opt.id} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {/* Campo Tipo: Multiselect */}
        {field.type === 'multiselect' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {(field.options || []).map((opt) => {
              const selectedList: string[] = Array.isArray(val) ? val : [];
              const isSelected = selectedList.includes(opt.value);
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={readonly}
                  onClick={() => {
                    if (isSelected) {
                      handleAnswerChange(field.id, selectedList.filter((item) => item !== opt.value));
                    } else {
                      handleAnswerChange(field.id, [...selectedList, opt.value]);
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-cardElevated/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Campo Tipo: Scale (1 a 5) */}
        {field.type === 'scale' && (
          <div className="flex items-center justify-between gap-1 sm:gap-2 pt-1">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                disabled={readonly}
                onClick={() => handleAnswerChange(field.id, num)}
                className={`w-11 h-11 sm:w-14 sm:h-12 rounded-2xl border text-sm sm:text-base font-black transition-all cursor-pointer flex items-center justify-center font-mono ${
                  val === num
                    ? 'border-emerald-500 bg-emerald-500 text-white shadow-md'
                    : 'border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-cardElevated text-slate-700 dark:text-slate-300 hover:border-emerald-500/40'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        )}

        {/* Campo Tipo: Checkbox Individual */}
        {field.type === 'checkbox' && (
          <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!!val}
              disabled={readonly}
              onChange={(e) => handleAnswerChange(field.id, e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
              {field.placeholder || 'Sim, confirmo esta informação.'}
            </span>
          </label>
        )}

        {/* Exibição de Erro de Validação */}
        {hasError && (
          <div className="flex items-center gap-1.5 text-xs text-rose-500 font-bold pt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{hasError}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto w-full">
      {/* BANNER DO MODO PRÉ-VISUALIZAÇÃO COM CONTROLES */}
      {isPreview && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2 text-xs font-extrabold">
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Pré-Visualização Interativa</span>
          </div>

          <div className="flex items-center gap-1 bg-white/70 dark:bg-dark-card/70 p-1 rounded-xl border border-emerald-500/20 text-xs">
            <button
              type="button"
              onClick={() => setPreviewViewMode('stepper')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                previewViewMode === 'stepper'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-500'
              }`}
            >
              <ListOrdered className="w-3 h-3" />
              <span>Passo a Passo</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewViewMode('full')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                previewViewMode === 'full'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-500'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Todas as Seções</span>
            </button>
          </div>
        </div>
      )}

      {/* SELETOR RÁPIDO DE SEÇÕES NO MODO STEPPER DO PREVIEW */}
      {isPreview && previewViewMode === 'stepper' && sections.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {sections.map((sec, idx) => {
            const isActive = !isReviewMode && currentSectionIndex === idx;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  setIsReviewMode(false);
                  setCurrentSectionIndex(idx);
                }}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400 hover:border-emerald-500/50 hover:text-emerald-500'
                }`}
              >
                {idx + 1}. {sec.title}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setIsReviewMode(true)}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              isReviewMode
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-600 dark:text-slate-400 hover:border-emerald-500/50 hover:text-emerald-500'
            }`}
          >
            Revisão Final
          </button>
        </div>
      )}

      {/* VISÃO 1: TODAS AS SEÇÕES (CONTINUO) */}
      {isPreview && previewViewMode === 'full' ? (
        <div className="space-y-4">
          {sections.map((sec, secIdx) => {
            const secFields = fields
              .filter((f) => {
                if (f.active === false) return false;
                if (sections.length === 1 && sections[0].id === 'sec-default') return true;
                return f.sectionId === sec.id;
              })
              .filter(isFieldVisible)
              .sort((a, b) => a.order - b.order);

            return (
              <Card key={sec.id} className="p-4 sm:p-5 space-y-4">
                <div className="border-b border-slate-100 dark:border-dark-border/60 pb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Seção {secIdx + 1}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {sec.title}
                  </h3>
                  {sec.description && (
                    <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
                      {sec.description}
                    </p>
                  )}
                </div>

                {secFields.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    Nenhuma pergunta vinculada a esta seção.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {secFields.map(renderField)}
                  </div>
                )}
              </Card>
            );
          })}

          {/* Bloco de Consentimento e Envio na visão completa */}
          <ConsentBlock
            accepted={consentAccepted}
            onChange={setConsentAccepted}
            termsVersion={version.termsVersion || '1.0'}
            requiredError={attemptedSubmit && !consentAccepted}
          />

          <div className="pt-2">
            <Button
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isSubmitting || readonly}
              onClick={handleTriggerSubmit}
              leftIcon={<CheckCircle2 className="w-5 h-5 fill-current" />}
              className="text-sm font-black shadow-lg shadow-emerald-500/25 cursor-pointer"
            >
              {isSubmitting ? 'Enviando...' : 'Confirmar e Enviar (Simulação)'}
            </Button>
          </div>
        </div>
      ) : (
        /* VISÃO 2: PASSO A PASSO (STEPPER DO ALUNO) */
        <div className="space-y-4">
          {/* Header com Barra de Progresso */}
          <div className="bg-white dark:bg-dark-card p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-dark-border shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                  {isReviewMode ? 'Etapa Final' : `Seção ${currentSectionIndex + 1} de ${totalSteps}`}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {isReviewMode ? 'Revisão das Informações' : currentSection?.title || 'Formulário'}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-sm font-black font-mono text-emerald-500">
                  {progressPercent}%
                </span>
                <span className="text-[10px] text-slate-400 block">Concluído</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-dark-cardElevated h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {currentSection?.description && !isReviewMode && (
              <p className="text-xs text-slate-500 dark:text-dark-muted">
                {currentSection.description}
              </p>
            )}
          </div>

          {/* MODO REVISÃO PRÉ-ENVIO */}
          {isReviewMode ? (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
                <span>
                  <strong>Revise suas respostas:</strong> Confira os dados preenchidos antes de confirmar o envio com a treinadora Rafaela.
                </span>
              </div>

              <Card className="p-5 space-y-6">
                {sections.map((sec, secIdx) => {
                  const secFields = fields
                    .filter((f) => {
                      if (f.active === false || f.type === 'terms') return false;
                      if (sections.length === 1 && sections[0].id === 'sec-default') return true;
                      return f.sectionId === sec.id;
                    })
                    .filter(isFieldVisible);

                  if (secFields.length === 0) return null;

                  return (
                    <div key={sec.id} className="space-y-3 pb-4 border-b border-slate-100 dark:border-dark-border/60 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          {secIdx + 1}. {sec.title}
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setIsReviewMode(false);
                            setCurrentSectionIndex(secIdx);
                          }}
                          className="text-[11px] font-bold text-slate-500 hover:text-emerald-500 cursor-pointer"
                        >
                          Editar seção
                        </button>
                      </div>

                      <div className="space-y-2">
                        {secFields.map((f) => {
                          const val = answers[f.id];
                          let displayVal = 'Não respondido';
                          if (val === true) displayVal = 'Sim';
                          else if (val === false) displayVal = 'Não';
                          else if (Array.isArray(val)) displayVal = val.join(', ') || 'Nenhum';
                          else if (val !== undefined && val !== null && val !== '') displayVal = String(val);

                          return (
                            <div key={f.id} className="text-xs flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 p-2 rounded-xl bg-slate-50 dark:bg-dark-cardElevated/40">
                              <span className="font-semibold text-slate-600 dark:text-slate-400">{f.label}:</span>
                              <span className="font-bold text-slate-900 dark:text-white sm:text-right">{displayVal}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </Card>

              {/* Bloco de Consentimento e Aceite */}
              <ConsentBlock
                accepted={consentAccepted}
                onChange={setConsentAccepted}
                termsVersion={version.termsVersion || '1.0'}
                requiredError={attemptedSubmit && !consentAccepted}
              />
            </div>
          ) : (
            /* MODO DE PREENCHIMENTO DA SEÇÃO ATUAL */
            <Card className="p-5 sm:p-6 space-y-5">
              {currentSectionVisibleFields.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Nenhuma pergunta configurada nesta seção.
                </div>
              ) : (
                currentSectionVisibleFields.map(renderField)
              )}
            </Card>
          )}

          {/* Barra de Ações Inferior */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {onSaveDraft && !readonly && (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleTriggerSaveDraft}
                  disabled={isSavingDraft || isSubmitting}
                  leftIcon={<Save className="w-4 h-4 text-emerald-500" />}
                  className="w-full sm:w-auto text-xs font-bold cursor-pointer"
                >
                  {isSavingDraft ? 'Salvando...' : 'Salvar Rascunho'}
                </Button>
              )}

              {(currentSectionIndex > 0 || isReviewMode) && (
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={handlePreviousSection}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                  className="w-full sm:w-auto text-xs font-bold cursor-pointer"
                >
                  Voltar
                </Button>
              )}
            </div>

            <div className="w-full sm:w-auto">
              {isReviewMode ? (
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={isSubmitting || readonly}
                  onClick={handleTriggerSubmit}
                  leftIcon={<CheckCircle2 className="w-5 h-5 fill-current" />}
                  className="text-sm font-black shadow-lg shadow-emerald-500/25 cursor-pointer"
                >
                  {isSubmitting ? 'Enviando Formulário...' : (isPreview ? 'Confirmar e Enviar (Simulação)' : 'Confirmar e Enviar')}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={handleNextSection}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                  className="text-xs font-bold cursor-pointer"
                >
                  {currentSectionIndex === totalSteps - 1 ? 'Revisar Informações' : 'Continuar'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
