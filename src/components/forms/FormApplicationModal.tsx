import React, { useState, useEffect } from 'react';
import { Form, FormVersion, Student } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { studentRepository } from '../../repositories/studentRepository';
import { formService } from '../../services/anamnesis/formService';
import { formApplicationService } from '../../services/anamnesis/formApplicationService';
import { useToast } from '../../context/ToastContext';
import { Calendar, Users, Send, CheckSquare, Square } from 'lucide-react';

interface FormApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  form?: Form | null;
  version?: FormVersion | null;
  targetStudentId?: string; // se aberto a partir do perfil de um aluno específico
  onApplied?: () => void;
}

export const FormApplicationModal: React.FC<FormApplicationModalProps> = ({
  isOpen,
  onClose,
  form: initialForm,
  version: initialVersion,
  targetStudentId,
  onApplied,
}) => {
  const { success, error: toastError } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isMandatory, setIsMandatory] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [availableForms, setAvailableForms] = useState<Form[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>(initialForm?.id || '');

  useEffect(() => {
    if (isOpen) {
      if (initialForm) {
        setSelectedFormId(initialForm.id);
      } else {
        formService.getForms().then((forms: Form[]) => {
          const activeForms = forms.filter((form) => form.status === 'active');
          setAvailableForms(activeForms);
          if (activeForms.length > 0 && !selectedFormId) {
            setSelectedFormId(activeForms[0].id);
          }
        });
      }

      studentRepository.getAll().then((list) => {
        setStudents(list);
        if (targetStudentId) {
          setSelectedStudentIds([targetStudentId]);
        } else {
          setSelectedStudentIds([]);
        }
      });
      // Prazo padrão: 7 dias a partir de hoje
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setDueDate(nextWeek.toISOString().split('T')[0]);
    }
  }, [isOpen, targetStudentId, initialForm]);

  const activeForm = initialForm || availableForms.find((f) => f.id === selectedFormId);

  useEffect(() => {
    if (activeForm) {
      setMessage(`Olá! Por favor, responda o formulário "${activeForm.name}" para orientar seus treinos.`);
    }
  }, [activeForm]);

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map((s) => s.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeForm) {
      toastError('Nenhum formulário selecionado.');
      return;
    }
    if (selectedStudentIds.length === 0) {
      toastError('Selecione pelo menos um aluno para aplicar o formulário.');
      return;
    }

    setIsSubmitting(true);
    try {
      const versionId = initialVersion?.id || activeForm.currentVersionId;
      await formApplicationService.applyToMultipleStudents({
        formId: activeForm.id,
        formVersionId: versionId,
        studentIds: selectedStudentIds,
        dueAt: dueDate ? `${dueDate}T23:59:59.000Z` : null,
        message: message.trim() || undefined,
        isMandatory,
      });

      const count = selectedStudentIds.length;
      success(
        count === 1
          ? `Formulário aplicado com sucesso para o aluno!`
          : `Formulário aplicado com sucesso para ${count} alunos!`
      );

      if (onApplied) onApplied();
      onClose();
    } catch (err) {
      toastError('Erro ao aplicar formulário.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activeForm ? `Aplicar Formulário: ${activeForm.name}` : 'Aplicar Formulário'}
      description="Selecione os alunos e configure o prazo para resposta."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Seletor de Formulário (caso não tenha vindo pré-selecionado) */}
        {!initialForm && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Escolha o Formulário *
            </label>
            <select
              value={selectedFormId}
              onChange={(e) => setSelectedFormId(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-2.5 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
              required
            >
              {availableForms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Seleção de Alunos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              <span>Destinatários ({selectedStudentIds.length} selecionados)</span>
            </label>
            {!targetStudentId && (
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {selectedStudentIds.length === students.length ? 'Desmarcar todos' : 'Selecionar todos'}
              </button>
            )}
          </div>

          <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-dark-border/60 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-cardElevated/30">
            {students.map((st) => {
              const isSelected = selectedStudentIds.includes(st.id);
              return (
                <div
                  key={st.id}
                  onClick={() => !targetStudentId && handleToggleStudent(st.id)}
                  className={`p-2.5 flex items-center justify-between gap-3 text-xs transition-colors ${
                    targetStudentId
                      ? 'opacity-80'
                      : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-dark-cardElevated'
                  } ${isSelected ? 'bg-emerald-500/10' : ''}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={st.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={st.name}
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-emerald-500/20 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 dark:text-white block truncate">
                        {st.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {st.level} • {st.goals?.[0] || 'Treinos'}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-emerald-600 dark:text-emerald-400">
                    {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prazo Limite */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            <span>Prazo para resposta (opcional)</span>
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          />
        </div>

        {/* Mensagem para o aluno */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Mensagem de acompanhamento (opcional)
          </label>
          <textarea
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Instruções para o aluno ao receber..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-card text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
        </div>

        {/* Obrigatoriedade */}
        <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isMandatory}
            onChange={(e) => setIsMandatory(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600 cursor-pointer"
          />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Exigir preenchimento obrigatório para liberação dos novos ciclos
          </span>
        </label>

        {/* Ações */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-dark-border/60">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting || selectedStudentIds.length === 0}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            {isSubmitting ? 'Aplicando...' : `Confirmar Aplicação (${selectedStudentIds.length})`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
