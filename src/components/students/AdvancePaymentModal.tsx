import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  Copy,
  Check,
  Share2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { StudentPaymentRecord, Student } from '../../types';
import { studentRepository } from '../../repositories/studentRepository';
import { useToast } from '../../context/ToastContext';

interface AdvancePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onPaymentUpdated: (updatedStudent: Student) => void;
}

export const AdvancePaymentModal: React.FC<AdvancePaymentModalProps> = ({
  isOpen,
  onClose,
  student,
  onPaymentUpdated,
}) => {
  const { success, error: toastError } = useToast();

  const pendingPayments = (student.financialPlan?.payments || []).filter(
    (p) => p.status !== 'pago'
  );

  const [selectedIds, setSelectedIds] = useState<string[]>(
    pendingPayments.length > 0 ? [pendingPayments[0].id] : []
  );
  const [copiedPix, setCopiedPix] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalAdvanceAmount = pendingPayments
    .filter((p) => selectedIds.includes(p.id))
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === pendingPayments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingPayments.map((p) => p.id));
    }
  };

  const pixKey = '00020126580014BR.GOV.BCB.PIX0136rafaela.personal.treinos@gmail.com520400005303986540' +
    totalAdvanceAmount.toFixed(2).replace('.', '') +
    '5802BR5925RAFAELA PERSONAL TRAINING6009SAO PAULO62070503***6304';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    success('Código PIX Copia e Cola copiado com sucesso!');
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleWhatsAppNotify = () => {
    const selectedCount = selectedIds.length;
    const installmentsLabel = pendingPayments
      .filter((p) => selectedIds.includes(p.id))
      .map((p) => `${p.installments} (${p.referenceMonth})`)
      .join(', ');

    const text = `Olá Rafaela! Gostaria de adiantar o pagamento de ${selectedCount} parcela(s): ${installmentsLabel}, no valor total de R$ ${totalAdvanceAmount.toFixed(
      2
    )}. Já fiz a transferência via PIX!`;
    window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleConfirmAdvance = async () => {
    if (selectedIds.length === 0) {
      toastError('Selecione pelo menos uma parcela para adiantar.');
      return;
    }

    setIsProcessing(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentPayments = student.financialPlan?.payments || [];

      const updatedPayments: StudentPaymentRecord[] = currentPayments.map((p) => {
        if (selectedIds.includes(p.id)) {
          return {
            ...p,
            status: 'pago',
            paidDate: today,
            notes: (p.notes ? `${p.notes} • ` : '') + 'Adiantado pelo aluno via App',
          };
        }
        return p;
      });

      const updatedStudent = await studentRepository.update(student.id, {
        financialPlan: {
          ...student.financialPlan!,
          payments: updatedPayments,
        },
      });

      const final = updatedStudent || {
        ...student,
        financialPlan: {
          ...student.financialPlan!,
          payments: updatedPayments,
        },
      };

      onPaymentUpdated(final);
      success(`${selectedIds.length} parcela(s) adiantada(s) com sucesso!`);
      onClose();
    } catch {
      toastError('Erro ao registrar adiantamento de parcela.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Solicitar Adiantamento de Parcelas"
      description="Selecione as parcelas que deseja adiantar para pagar com PIX ou Cartão"
      size="md"
    >
      <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {pendingPayments.length === 0 ? (
          <div className="p-8 text-center border-dashed border-2 border-slate-200 dark:border-white/[0.08] rounded-2xl">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Parabéns! Todas as parcelas estão quitadas
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Você não possui parcelas pendentes para adiantar neste momento.
            </p>
          </div>
        ) : (
          <>
            {/* Seleção de Parcelas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Parcelas Disponíveis para Adiantar ({pendingPayments.length})
                </span>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  {selectedIds.length === pendingPayments.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
                </button>
              </div>

              <div className="space-y-2">
                {pendingPayments.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  const isLate = p.dueDate ? new Date(p.dueDate) < new Date() : false;

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleToggleSelect(p.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-xs'
                          : 'border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // handled by parent div
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                            {p.installments} • {p.referenceMonth}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" /> Vencimento:{' '}
                            {p.dueDate ? p.dueDate.split('-').reverse().join('/') : 'A definir'}
                            {isLate && (
                              <span className="text-rose-500 font-bold ml-1">• Em atraso</span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                          R$ {p.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resumo do Total a Pagar */}
            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-dark-cardElevated/70 border border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Total Selecionado ({selectedIds.length}{' '}
                  {selectedIds.length === 1 ? 'parcela' : 'parcelas'})
                </span>
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                  R$ {totalAdvanceAmount.toFixed(2)}
                </span>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleWhatsAppNotify}
                leftIcon={<Share2 className="w-3.5 h-3.5 text-emerald-500" />}
                className="text-xs"
              >
                Avisar Personal
              </Button>
            </div>

            {/* PIX Copia e Cola / QR Code */}
            {totalAdvanceAmount > 0 && (
              <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/30 dark:bg-white/[0.01] space-y-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-500" />
                  PIX Copia e Cola para Pagamento
                </span>

                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white dark:bg-dark-cardElevated p-2 rounded-lg border border-slate-200/80 dark:border-white/[0.08] text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate">
                    {pixKey}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyPix}
                    leftIcon={
                      copiedPix ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )
                    }
                    className="text-xs"
                  >
                    {copiedPix ? 'Copiado!' : 'Copiar'}
                  </Button>
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Chave PIX: rafaela.personal.treinos@gmail.com
                </span>
              </div>
            )}

            {/* Botões do Rodapé */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/80 dark:border-white/[0.08]">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isProcessing}>
                Cancelar
              </Button>

              <Button
                type="button"
                variant="primary"
                onClick={handleConfirmAdvance}
                disabled={selectedIds.length === 0}
                isLoading={isProcessing}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Confirmar Pagamento
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
