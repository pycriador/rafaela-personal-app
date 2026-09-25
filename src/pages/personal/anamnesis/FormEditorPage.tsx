import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Edit,
  Eye,
  Send,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MoveUp,
  MoveDown,
  Copy,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { formService } from '../../../services/anamnesis/formService';
import { formVersionService } from '../../../services/anamnesis/formVersionService';
import { formBuilderService } from '../../../services/anamnesis/formBuilderService';
import { formVersionRepository } from '../../../repositories/formVersionRepository';
import { initialFormVersions } from '../../../data/anamnesis/formVersions';
import {
  Form,
  FormVersion,
  FormSection,
  FormField,
  FormFieldType,
} from '../../../types';
import { FormStatusBadge } from '../../../components/forms/FormStatusBadge';
import { FormRenderer } from '../../../components/forms/FormRenderer';
import { FormApplicationModal } from '../../../components/forms/FormApplicationModal';
import { useToast } from '../../../context/ToastContext';

export const FormEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError, info } = useToast();

  const isNew = !id || id === 'new';

  const [form, setForm] = useState<Form | null>(null);
  const [currentVersion, setCurrentVersion] = useState<FormVersion | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form metadata states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Modal para Criar/Editar Seção
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<FormSection | null>(null);
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionDescription, setSectionDescription] = useState('');

  // Modal para Criar/Editar Campo
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [targetSectionId, setTargetSectionId] = useState<string>('');
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState<FormFieldType>('text');
  const [fieldDescription, setFieldDescription] = useState('');
  const [fieldPlaceholder, setFieldPlaceholder] = useState('');
  const [fieldRequired, setFieldRequired] = useState(true);
  const [fieldOptionsText, setFieldOptionsText] = useState(''); // separadas por vírgula

  // Regra Condicional
  const [hasCondition, setHasCondition] = useState(false);
  const [conditionFieldId, setConditionFieldId] = useState('');
  const [conditionOperator, setConditionOperator] = useState<'equals' | 'notEquals'>('equals');
  const [conditionValue, setConditionValue] = useState<string>('true');

  // Modal para Aplicar Formulário
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  // Modal para Pré-Visualização Completa
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      if (isNew) {
        // Inicializa novo formulário em rascunho
        const { form: newF, version: newV } = await formService.createForm({
          name: 'Novo Formulário de Anamnese',
          description: 'Descreva a finalidade clínica e de acompanhamento deste questionário...',
        });
        setForm(newF);
        setCurrentVersion(newV);
        setFormName(newF.name);
        setFormDescription(newF.description);
        setFields([]);
        setLoading(false);
      } else {
        const found = await formService.getFormById(id);
        if (!found) {
          toastError('Formulário não encontrado');
          navigate('/personal/forms');
          return;
        }
        setForm(found);
        setFormName(found.name);
        setFormDescription(found.description);

        let version: FormVersion | null = null;
        if (found.currentVersionId) {
          version = await formVersionService.getVersionById(found.currentVersionId);
        }
        if (!version) {
          const versions = await formVersionService.getVersionsByFormId(found.id);
          if (versions.length > 0) {
            version = versions[0];
          } else {
            const initV = initialFormVersions.find((v) => v.formId === found.id);
            if (initV) version = initV;
          }
        }
        setCurrentVersion(version);

        if (version) {
          const fList = await formVersionService.getFieldsForVersion(version.id);
          setFields(fList);
        }
        setLoading(false);
      }
    }
    load();
  }, [id, isNew]);

  // Salvar Informações Básicas do Formulário
  const handleSaveFormInfo = async () => {
    if (!form || !formName.trim()) return;
    setIsSaving(true);
    try {
      const updated = await formService.updateForm(form.id, {
        name: formName.trim(),
        description: formDescription.trim(),
      });
      if (updated) {
        setForm(updated);
        success('Informações do formulário atualizadas!');
      }
    } catch {
      toastError('Erro ao atualizar informações.');
    } finally {
      setIsSaving(false);
    }
  };

  // Publicar Nova Versão (ou a atual se em rascunho)
  const handlePublishVersion = async () => {
    if (!form || !currentVersion) return;
    setIsSaving(true);
    try {
      const published = await formVersionService.publishVersion(form.id, currentVersion.id);
      setCurrentVersion(published);
      const updatedF = await formService.getFormById(form.id);
      setForm(updatedF);
      success(`Versão v${published.version} publicada com sucesso! Formulário ativo.`);
    } catch {
      toastError('Erro ao publicar versão.');
    } finally {
      setIsSaving(false);
    }
  };

  // Criar Nova Versão (v2, v3...) a partir da versão atual
  const handleCreateNewVersion = async () => {
    if (!form || !currentVersion) return;
    setIsSaving(true);
    try {
      const newV = await formVersionService.createNewVersionFromExisting(form.id, currentVersion.id);
      setCurrentVersion(newV);
      const newFields = await formVersionService.getFieldsForVersion(newV.id);
      setFields(newFields);
      const updatedF = await formService.getFormById(form.id);
      setForm(updatedF);
      success(`Nova versão v${newV.version} criada em rascunho! A versão anterior continua intacta.`);
    } catch {
      toastError('Erro ao gerar nova versão.');
    } finally {
      setIsSaving(false);
    }
  };

  // Seção CRUD
  const handleOpenAddSection = () => {
    setEditingSection(null);
    setSectionTitle('');
    setSectionDescription('');
    setIsSectionModalOpen(true);
  };

  const handleOpenEditSection = (sec: FormSection) => {
    setEditingSection(sec);
    setSectionTitle(sec.title);
    setSectionDescription(sec.description || '');
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVersion || !sectionTitle.trim()) return;

    try {
      if (editingSection) {
        await formBuilderService.updateSection(currentVersion.id, editingSection.id, {
          title: sectionTitle.trim(),
          description: sectionDescription.trim() || undefined,
        });
        success('Seção atualizada!');
      } else {
        await formBuilderService.addSection(
          currentVersion.id,
          sectionTitle.trim(),
          sectionDescription.trim() || undefined
        );
        success('Nova seção adicionada!');
      }
      const updatedV = await formVersionService.getVersionById(currentVersion.id);
      setCurrentVersion(updatedV);
      setIsSectionModalOpen(false);
    } catch {
      toastError('Erro ao salvar seção.');
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!currentVersion) return;
    try {
      await formBuilderService.removeSection(currentVersion.id, sectionId);
      const updatedV = await formVersionService.getVersionById(currentVersion.id);
      setCurrentVersion(updatedV);
      const updatedF = await formVersionService.getFieldsForVersion(currentVersion.id);
      setFields(updatedF);
      success('Seção removida.');
    } catch {
      toastError('Erro ao remover seção.');
    }
  };

  // Campo CRUD
  const handleOpenAddField = (secId: string) => {
    setEditingField(null);
    setTargetSectionId(secId);
    setFieldLabel('');
    setFieldType('text');
    setFieldDescription('');
    setFieldPlaceholder('');
    setFieldRequired(true);
    setFieldOptionsText('');
    setHasCondition(false);
    setConditionFieldId('');
    setConditionValue('true');
    setIsFieldModalOpen(true);
  };

  const handleOpenEditField = (field: FormField) => {
    setEditingField(field);
    setTargetSectionId(field.sectionId);
    setFieldLabel(field.label);
    setFieldType(field.type);
    setFieldDescription(field.description || '');
    setFieldPlaceholder(field.placeholder || '');
    setFieldRequired(field.required);
    setFieldOptionsText((field.options || []).map((o) => o.label).join(', '));
    if (field.condition) {
      setHasCondition(true);
      setConditionFieldId(field.condition.fieldId);
      setConditionOperator(field.condition.operator);
      setConditionValue(String(field.condition.value));
    } else {
      setHasCondition(false);
      setConditionFieldId('');
    }
    setIsFieldModalOpen(true);
  };

  const handleSaveField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVersion || !fieldLabel.trim()) return;

    const options = fieldOptionsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((label, idx) => ({
        id: `opt-${idx + 1}-${label.toLowerCase().replace(/\s+/g, '-')}`,
        label,
        value: label,
      }));

    let condition = undefined;
    if (hasCondition && conditionFieldId) {
      const parsedVal =
        conditionValue === 'true'
          ? true
          : conditionValue === 'false'
          ? false
          : conditionValue;
      condition = {
        fieldId: conditionFieldId,
        operator: conditionOperator,
        value: parsedVal,
      };
    }

    try {
      if (editingField) {
        const updated: FormField = {
          ...editingField,
          label: fieldLabel.trim(),
          type: fieldType,
          description: fieldDescription.trim() || undefined,
          placeholder: fieldPlaceholder.trim() || undefined,
          required: fieldRequired,
          options: options.length > 0 ? options : undefined,
          condition,
        };
        await formBuilderService.updateField(updated);
        success('Campo atualizado!');
      } else {
        const sectionFields = fields.filter((f) => f.sectionId === targetSectionId);
        await formBuilderService.addField({
          versionId: currentVersion.id,
          sectionId: targetSectionId,
          type: fieldType,
          label: fieldLabel.trim(),
          description: fieldDescription.trim() || undefined,
          placeholder: fieldPlaceholder.trim() || undefined,
          required: fieldRequired,
          options: options.length > 0 ? options : undefined,
          order: sectionFields.length + 1,
          condition,
          active: true,
        });
        success('Novo campo adicionado!');
      }

      const updatedFields = await formVersionService.getFieldsForVersion(currentVersion.id);
      setFields(updatedFields);
      setIsFieldModalOpen(false);
    } catch {
      toastError('Erro ao salvar campo.');
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!currentVersion) return;
    try {
      await formBuilderService.removeField(fieldId);
      const updatedFields = await formVersionService.getFieldsForVersion(currentVersion.id);
      setFields(updatedFields);
      success('Campo removido.');
    } catch {
      toastError('Erro ao remover campo.');
    }
  };

  if (loading || !form || !currentVersion) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Carregando editor de formulário...</p>
      </div>
    );
  }

  const sections = currentVersion.sections || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/personal/forms')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="text-xs"
          >
            Voltar
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Editor de Formulário
              </h1>
              <span className="font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                v{currentVersion.version}
              </span>
              <FormStatusBadge status={currentVersion.status} type="form" />
            </div>
            <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
              Edite seções e campos com visualização em tempo real e versionamento imutável
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {currentVersion.status === 'published' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateNewVersion}
              disabled={isSaving}
              leftIcon={<Layers className="w-4 h-4 text-emerald-500" />}
              className="text-xs font-bold"
              title="Cria a versão seguinte (v2, v3) mantendo a atual publicada intacta"
            >
              Criar Versão v{currentVersion.version + 1}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handlePublishVersion}
              disabled={isSaving}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              className="text-xs font-bold"
            >
              Publicar Versão v{currentVersion.version}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewModalOpen(true)}
            leftIcon={<Eye className="w-3.5 h-3.5 text-emerald-500" />}
            className="text-xs font-bold"
            title="Abrir pré-visualização interativa em tela cheia"
          >
            Pré-visualizar
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsApplyModalOpen(true)}
            leftIcon={<Send className="w-3.5 h-3.5" />}
            className="text-xs font-bold"
          >
            Aplicar
          </Button>
        </div>
      </div>

      {/* Metadados Básicos do Formulário */}
      <Card className="p-4 sm:p-5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1 space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Nome do Formulário
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Ex: Anamnese Inicial"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Descrição / Finalidade
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Ex: Coleta de histórico clínico e hábitos..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveFormInfo}
                disabled={isSaving}
                className="shrink-0 text-xs font-bold"
              >
                Salvar
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid Principal do Editor (2 Colunas no Desktop: Builder à Esquerda, Preview à Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda: Construtor de Seções e Campos */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Estrutura de Seções & Perguntas
              </h2>
              <Badge variant="neutral" size="sm" className="font-mono text-[10px]">
                {sections.length} seções • {fields.length} campos
              </Badge>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenAddSection}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs font-bold"
            >
              Nova Seção
            </Button>
          </div>

          {sections.length === 0 ? (
            <Card className="py-12 text-center text-xs text-slate-400">
              Nenhuma seção adicionada ainda. Clique em "Nova Seção" para iniciar a montagem.
            </Card>
          ) : (
            <div className="space-y-4">
              {sections.map((section, secIdx) => {
                const sectionFields = fields.filter((f) => f.sectionId === section.id && f.active);

                return (
                  <Card key={section.id} className="p-4 sm:p-5 space-y-3 border-slate-200 dark:border-dark-border shadow-xs">
                    {/* Header da Seção */}
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-dark-border/60">
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">
                            Seção {secIdx + 1}
                          </span>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {section.title}
                          </h3>
                        </div>
                        {section.description && (
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {section.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditSection(section)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-cardElevated"
                          title="Editar Seção"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSection(section.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          title="Excluir Seção"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Lista de Campos da Seção */}
                    <div className="space-y-2">
                      {sectionFields.map((field, fIdx) => (
                        <div
                          key={field.id}
                          className="p-3 rounded-xl border border-slate-200/80 dark:border-dark-border/70 bg-slate-50/50 dark:bg-dark-cardElevated/30 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-slate-400 font-bold">{fIdx + 1}.</span>
                              <span className="font-bold text-slate-900 dark:text-white truncate">
                                {field.label}
                              </span>
                              {field.required && (
                                <span className="text-[10px] text-rose-500 font-extrabold">*</span>
                              )}
                              <Badge variant="neutral" size="sm" className="text-[9px] py-0 px-1 font-mono">
                                {field.type}
                              </Badge>
                            </div>

                            {field.condition && (
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-slate-400" />
                                <span>Condicional (exibido apenas se {field.condition.operator} {String(field.condition.value)})</span>
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEditField(field)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-cardElevated"
                              title="Editar Campo"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteField(field.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                              title="Excluir Campo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Botão Adicionar Campo na Seção */}
                    <button
                      type="button"
                      onClick={() => handleOpenAddField(section.id)}
                      className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-dark-border hover:border-emerald-500/60 rounded-xl text-xs font-bold text-slate-500 hover:text-emerald-500 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Pergunta nesta seção</span>
                    </button>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Coluna Direita: Pré-Visualização Interativa ao Vivo */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-500" />
              <span>Pré-Visualização ao Vivo</span>
            </h2>
            <button
              type="button"
              onClick={() => setIsPreviewModalOpen(true)}
              className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Expandir pré-visualização
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-slate-50/40 dark:bg-dark-card/30 p-2 sm:p-3">
            {currentVersion ? (
              <FormRenderer
                version={currentVersion}
                fields={fields}
                isPreview={true}
                readonly={false}
                onSubmit={async () => {
                  info('Pré-visualização: O formulário está pronto para ser publicado e respondido!');
                }}
              />
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Carregando formulário para pré-visualização...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: CRIAR / EDITAR SEÇÃO */}
      <Modal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        title={editingSection ? 'Editar Seção' : 'Nova Seção de Perguntas'}
        description="Organize o formulário dividindo as perguntas por áreas temáticas."
        size="sm"
      >
        <form onSubmit={handleSaveSection} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Título da Seção
            </label>
            <input
              type="text"
              required
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="Ex: Histórico Clínico"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Descrição / Orientação (opcional)
            </label>
            <textarea
              rows={2}
              value={sectionDescription}
              onChange={(e) => setSectionDescription(e.target.value)}
              placeholder="Instruções para o aluno preencher esta seção..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-dark-border/60">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsSectionModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Salvar Seção
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: CRIAR / EDITAR CAMPO */}
      <Modal
        isOpen={isFieldModalOpen}
        onClose={() => setIsFieldModalOpen(false)}
        title={editingField ? 'Editar Pergunta' : 'Adicionar Pergunta'}
        description="Defina a pergunta, tipo de entrada e regras condicionais."
        size="md"
      >
        <form onSubmit={handleSaveField} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Enunciado da Pergunta
            </label>
            <input
              type="text"
              required
              value={fieldLabel}
              onChange={(e) => setFieldLabel(e.target.value)}
              placeholder="Ex: Você possui alguma lesão anterior?"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Tipo do Campo
              </label>
              <select
                value={fieldType}
                onChange={(e) => setFieldType(e.target.value as FormFieldType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="text">Texto curto</option>
                <option value="textarea">Texto longo</option>
                <option value="number">Número inteiro</option>
                <option value="decimal">Número decimal (ex: peso/altura)</option>
                <option value="date">Data</option>
                <option value="boolean">Sim / Não</option>
                <option value="select">Seleção única</option>
                <option value="multiselect">Múltipla escolha</option>
                <option value="scale">Escala 1 a 5</option>
                <option value="checkbox">Checkbox individual</option>
                <option value="terms">Termo de aceite legal</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Texto de Exemplo (Placeholder)
              </label>
              <input
                type="text"
                value={fieldPlaceholder}
                onChange={(e) => setFieldPlaceholder(e.target.value)}
                placeholder="Ex: Descreva resumidamente..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {(fieldType === 'select' || fieldType === 'multiselect') && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Opções de Escolha (separadas por vírgula)
              </label>
              <input
                type="text"
                value={fieldOptionsText}
                onChange={(e) => setFieldOptionsText(e.target.value)}
                placeholder="Ex: Baixo, Moderado, Alto, Muito Alto"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Instrução / Explicação auxiliar (opcional)
            </label>
            <input
              type="text"
              value={fieldDescription}
              onChange={(e) => setFieldDescription(e.target.value)}
              placeholder="Ex: Marque apenas lesões diagnosticadas por médico..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Obrigatoriedade */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={fieldRequired}
              onChange={(e) => setFieldRequired(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Pergunta de resposta obrigatória
            </span>
          </label>

          {/* Regra Condicional */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-cardElevated/30 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasCondition}
                onChange={(e) => setHasCondition(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Exibir esta pergunta somente sob condição (Lógica Condicional)
              </span>
            </label>

            {hasCondition && (
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Quando o campo:</span>
                  <select
                    value={conditionFieldId}
                    onChange={(e) => setConditionFieldId(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="">Selecione a pergunta base...</option>
                    {fields
                      .filter((f) => f.id !== editingField?.id)
                      .map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">For igual a:</span>
                  <select
                    value={conditionValue}
                    onChange={(e) => setConditionValue(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="true">Sim (Verdadeiro)</option>
                    <option value="false">Não (Falso)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-dark-border/60">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsFieldModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Salvar Pergunta
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal para Aplicar Formulário */}
      {isApplyModalOpen && (
        <FormApplicationModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          form={form}
          version={currentVersion}
        />
      )}

      {/* Modal para Pré-visualização Completa */}
      {isPreviewModalOpen && currentVersion && (
        <Modal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title={`Pré-visualização: ${form?.name || 'Formulário'}`}
          description="Teste o questionário em modo interativo completo exatamente como o aluno verá."
          size="lg"
        >
          <div className="py-2 max-h-[75vh] overflow-y-auto pr-1">
            <FormRenderer
              version={currentVersion}
              fields={fields}
              isPreview={true}
              readonly={false}
              onSubmit={async () => {
                info('Pré-visualização: Formulário preenchido com sucesso!');
                setIsPreviewModalOpen(false);
              }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
