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
  Type,
  AlignLeft,
  ListChecks,
  ToggleLeft,
  Hash,
  Activity,
  Star,
  Calendar,
  ShieldCheck,
  CheckSquare,
  X,
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
  FormFieldOption,
} from '../../../types';
import { FormStatusBadge } from '../../../components/forms/FormStatusBadge';
import { FormRenderer } from '../../../components/forms/FormRenderer';
import { FormApplicationModal } from '../../../components/forms/FormApplicationModal';
import { useToast } from '../../../context/ToastContext';

const OPTION_PRESETS = [
  { label: 'Sim / Não / Às vezes', options: ['Sim', 'Não', 'Às vezes'] },
  { label: 'Baixo / Moderado / Alto', options: ['Baixo', 'Moderado', 'Alto'] },
  { label: 'Nível de Experiência', options: ['Iniciante', 'Intermediário', 'Avançado'] },
  { label: 'Frequência de Treino', options: ['1 a 2x na semana', '3 a 4x na semana', '5x ou mais'] },
  { label: 'Objetivo Principal', options: ['Hipertrofia / Ganho de Massa', 'Emagrecimento / Queima de Gordura', 'Condicionamento & Saúde', 'Reabilitação / Postura'] },
];

interface FieldTypeDescriptor {
  value: FormFieldType;
  label: string;
  category: 'Texto' | 'Escolha' | 'Numérico' | 'Outros';
  icon: React.ComponentType<{ className?: string }>;
  hint: string;
}

const FIELD_TYPES: FieldTypeDescriptor[] = [
  { value: 'text', label: 'Texto curto', category: 'Texto', icon: Type, hint: '1 linha (nome, profissão)' },
  { value: 'textarea', label: 'Texto longo', category: 'Texto', icon: AlignLeft, hint: 'Parágrafo (rotina, histórico)' },
  { value: 'select', label: 'Seleção única', category: 'Escolha', icon: CheckCircle2, hint: 'Escolha 1 de várias opções' },
  { value: 'multiselect', label: 'Múltipla escolha', category: 'Escolha', icon: ListChecks, hint: 'Marcar várias opções' },
  { value: 'boolean', label: 'Sim / Não', category: 'Escolha', icon: ToggleLeft, hint: 'Pergunta direta Sim/Não' },
  { value: 'number', label: 'Número inteiro', category: 'Numérico', icon: Hash, hint: 'Sem casas decimais' },
  { value: 'decimal', label: 'Número decimal', category: 'Numérico', icon: Activity, hint: 'Com vírgula (peso, altura)' },
  { value: 'scale', label: 'Escala 1 a 5', category: 'Numérico', icon: Star, hint: 'Nível de intensidade / dor' },
  { value: 'date', label: 'Data', category: 'Outros', icon: Calendar, hint: 'Seleção de data no calendário' },
  { value: 'terms', label: 'Termo de Aceite', category: 'Outros', icon: ShieldCheck, hint: 'Concordância obrigatória' },
  { value: 'checkbox', label: 'Checkbox simples', category: 'Outros', icon: CheckSquare, hint: 'Confirmação individual' },
];

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
  const [fieldOptions, setFieldOptions] = useState<string[]>(['', '']);
  const [typeCategoryFilter, setTypeCategoryFilter] = useState<'Todos' | 'Texto' | 'Escolha' | 'Numérico' | 'Outros'>('Todos');

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

  // Opções para Campos de Seleção (Radio / Checkbox / Multiselect)
  const handleAddOption = () => {
    setFieldOptions((prev) => [...prev, '']);
  };

  const handleUpdateOption = (index: number, val: string) => {
    setFieldOptions((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleRemoveOption = (index: number) => {
    setFieldOptions((prev) => {
      if (prev.length <= 1) return [''];
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleApplyPreset = (presetOptions: string[]) => {
    setFieldOptions([...presetOptions]);
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
    setFieldOptions(['', '']);
    setHasCondition(false);
    setConditionFieldId('');
    setConditionValue('true');
    setTypeCategoryFilter('Todos');
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
    if (field.options && field.options.length > 0) {
      setFieldOptions(field.options.map((o) => o.label));
    } else {
      setFieldOptions(['', '']);
    }
    if (field.condition) {
      setHasCondition(true);
      setConditionFieldId(field.condition.fieldId);
      setConditionOperator(field.condition.operator);
      setConditionValue(String(field.condition.value));
    } else {
      setHasCondition(false);
      setConditionFieldId('');
    }
    setTypeCategoryFilter('Todos');
    setIsFieldModalOpen(true);
  };

  const handleSaveField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVersion || !fieldLabel.trim()) return;

    const isChoiceType = fieldType === 'select' || fieldType === 'multiselect';
    const cleanOptions: FormFieldOption[] = isChoiceType
      ? fieldOptions
          .map((s) => s.trim())
          .filter(Boolean)
          .map((label, idx) => ({
            id: `opt-${idx + 1}-${label.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'opt'}`,
            label,
            value: label,
          }))
      : [];

    if (isChoiceType && cleanOptions.length === 0) {
      toastError('Adicione pelo menos uma opção para a pergunta de seleção.');
      return;
    }

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
          options: cleanOptions.length > 0 ? cleanOptions : undefined,
          condition,
        };
        await formBuilderService.updateField(updated);
        success('Pergunta atualizada com sucesso!');
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
          options: cleanOptions.length > 0 ? cleanOptions : undefined,
          order: sectionFields.length + 1,
          condition,
          active: true,
        });
        success('Nova pergunta adicionada!');
      }

      const updatedFields = await formVersionService.getFieldsForVersion(currentVersion.id);
      setFields(updatedFields);
      setIsFieldModalOpen(false);
    } catch {
      toastError('Erro ao salvar pergunta.');
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
        description="Defina o enunciado, escolha o tipo de resposta visual e gerencie as opções."
        size="lg"
      >
        <form onSubmit={handleSaveField} className="space-y-5">
          {/* Enunciado da Pergunta */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>
                Enunciado da Pergunta <strong className="text-rose-500">*</strong>
              </span>
              <span className="text-[11px] font-normal text-slate-400">
                Texto principal exibido para o aluno
              </span>
            </label>
            <input
              type="text"
              required
              value={fieldLabel}
              onChange={(e) => setFieldLabel(e.target.value)}
              placeholder="Ex: Você possui alguma lesão anterior, cirurgia ou dor articular?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
            />
          </div>

          {/* Tipo de Resposta Visual */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Tipo de Resposta
                </label>
                <span className="text-[11px] text-slate-400">
                  Como o aluno preencherá a resposta desta pergunta
                </span>
              </div>

              {/* Categorias Rápidas */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-dark-cardElevated/50 p-1 rounded-xl">
                {(['Todos', 'Texto', 'Escolha', 'Numérico', 'Outros'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setTypeCategoryFilter(cat)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      typeCategoryFilter === cat
                        ? 'bg-emerald-500 text-white shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid dos Tipos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {FIELD_TYPES.filter(
                (t) => typeCategoryFilter === 'Todos' || t.category === typeCategoryFilter
              ).map((typeDef) => {
                const Icon = typeDef.icon;
                const isSelected = fieldType === typeDef.value;
                return (
                  <button
                    key={typeDef.value}
                    type="button"
                    onClick={() => {
                      setFieldType(typeDef.value);
                      if (
                        (typeDef.value === 'select' || typeDef.value === 'multiselect') &&
                        fieldOptions.every((o) => !o.trim())
                      ) {
                        setFieldOptions(['', '']);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/25 ring-2 ring-emerald-500/20 text-emerald-950 dark:text-emerald-100 shadow-xs'
                        : 'border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold block leading-snug">{typeDef.label}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 block leading-tight mt-0.5">
                        {typeDef.hint}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SESSÃO ELEGANTE DE OPÇÕES: SELEÇÃO ÚNICA OU MÚLTIPLA ESCOLHA */}
          {(fieldType === 'select' || fieldType === 'multiselect') && (
            <div className="p-4 rounded-2xl border border-emerald-500/30 dark:border-emerald-500/20 bg-gradient-to-b from-emerald-500/[0.04] to-transparent dark:from-emerald-500/[0.02] space-y-3.5 shadow-xs">
              {/* Cabeçalho das Opções */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    {fieldType === 'select' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <ListChecks className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {fieldType === 'select' ? 'Opções de Seleção Única' : 'Opções de Múltipla Escolha'}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold">
                      {fieldOptions.filter((o) => o.trim()).length} de {fieldOptions.length} preenchidas
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {fieldType === 'select'
                      ? 'O aluno poderá escolher exatamente 1 dentre as opções abaixo.'
                      : 'O aluno poderá marcar 1 ou mais alternativas.'}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  className="text-xs shrink-0 self-start sm:self-auto border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                >
                  Nova Opção
                </Button>
              </div>

              {/* Presets Rápidos */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Sugestões:
                </span>
                {OPTION_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleApplyPreset(preset.options)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 text-[11px] text-slate-600 dark:text-slate-300 transition-all cursor-pointer font-medium shadow-2xs"
                    title={`Inserir: ${preset.options.join(', ')}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Lista de Opções Editáveis */}
              <div className="space-y-2">
                {fieldOptions.map((opt, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200/80 dark:border-dark-border/80 bg-white dark:bg-dark-card focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-2xs"
                  >
                    {/* Indicador visual com número */}
                    <div
                      className={`w-6 h-6 shrink-0 flex items-center justify-center font-mono text-[11px] font-black ${
                        fieldType === 'select'
                          ? 'rounded-full bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-dark-border'
                          : 'rounded-md bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-dark-border'
                      }`}
                    >
                      {index + 1}
                    </div>

                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleUpdateOption(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddOption();
                        }
                      }}
                      placeholder={`Opção ${index + 1} (ex: ${index === 0 ? 'Baixo' : index === 1 ? 'Moderado' : 'Alto'})...`}
                      className="flex-1 bg-transparent px-2 py-1 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      disabled={fieldOptions.length <= 1}
                      title={fieldOptions.length <= 1 ? 'Mínimo de 1 opção' : 'Remover esta opção'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        fieldOptions.length <= 1
                          ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>
                  Dica: Pressione <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-dark-cardElevated font-mono text-[10px] text-slate-700 dark:text-slate-300">Enter</kbd> para criar rapidamente a próxima opção.
                </span>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Adicionar mais uma
                </button>
              </div>
            </div>
          )}

          {/* Placeholder e Instrução Auxiliar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Texto de Exemplo (Placeholder)
              </label>
              <input
                type="text"
                value={fieldPlaceholder}
                onChange={(e) => setFieldPlaceholder(e.target.value)}
                placeholder={
                  fieldType === 'select' || fieldType === 'multiselect'
                    ? 'Ex: Selecione uma opção...'
                    : 'Ex: Descreva resumidamente...'
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

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
          </div>

          {/* Obrigatoriedade */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-cardElevated/30 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={fieldRequired}
                onChange={(e) => setFieldRequired(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Pergunta de resposta obrigatória
                </span>
                <span className="text-[10px] text-slate-400">
                  O aluno não conseguirá prosseguir sem responder
                </span>
              </div>
            </label>
            {fieldRequired ? (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Obrigatório
              </span>
            ) : (
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-white/[0.05] px-2 py-0.5 rounded-full">
                Opcional
              </span>
            )}
          </div>

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
