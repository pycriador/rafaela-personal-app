import React from 'react';
import { CheckCircle2, Printer, Download, Share2, ShieldCheck, CreditCard, Calendar, User, FileText, ArrowRight } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { StudentPaymentRecord, Student } from '../../types';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: StudentPaymentRecord | null;
  student: Student;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
  student,
}) => {
  if (!payment) return null;

  const plan = student.financialPlan;
  const receiptCode = `REC-${payment.id ? payment.id.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase() : '84729102'}`;
  const paidDateFormatted = payment.paidDate
    ? payment.paidDate.split('-').reverse().join('/')
    : new Date().toLocaleDateString('pt-BR');

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `Olá Rafaela! Segue meu comprovante de pagamento referente à ${payment.installments} (${payment.referenceMonth}) no valor de R$ ${payment.amount.toFixed(2)}. Código de autenticação: ${receiptCode}.`;
    window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Comprovante de Pagamento"
      description="Recibo digital de quitação emitido por Rafaela Personal Trainer"
      size="md"
    >
      <div className="space-y-4 print:p-6" id="printable-receipt">
        {/* Recibo Header */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center relative overflow-hidden">
          <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-2 shadow-sm">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block">
            Quitação Confirmada
          </span>
          <h3 className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-0.5">
            R$ {payment.amount.toFixed(2)}
          </h3>
          <p className="text-xs text-slate-500 dark:text-dark-muted mt-1">
            {payment.installments} • {payment.referenceMonth}
          </p>
        </div>

        {/* Detalhes do Pagamento em Grid */}
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.01] space-y-2.5 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-white/[0.04]">
            <span className="text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" /> Aluno(a):
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{student.name}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-white/[0.04]">
            <span className="text-slate-400 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Plano Contratado:
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {plan?.planName || 'Consultoria Personal Trainer'}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-white/[0.04]">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Data de Pagamento:
            </span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{paidDateFormatted}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-white/[0.04]">
            <span className="text-slate-400">Forma de Pagamento:</span>
            <span className="font-semibold uppercase text-slate-800 dark:text-slate-200">
              {payment.paymentMethod === 'pix'
                ? 'PIX Instantâneo'
                : payment.paymentMethod === 'cartao_credito'
                ? 'Cartão de Crédito'
                : 'Boleto'}
            </span>
          </div>

          {plan?.discountCouponCode && (
            <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-white/[0.04]">
              <span className="text-slate-400">Cupom Aplicado:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {plan.discountCouponCode}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Protocolo / Autenticação:
            </span>
            <span className="font-mono font-bold text-slate-500 dark:text-dark-muted">
              {receiptCode}
            </span>
          </div>
        </div>

        {/* Rodapé institucional */}
        <div className="text-center text-[10px] text-slate-400 space-y-0.5 pt-1">
          <p>Rafaela Personal Trainer • CREF 012345-G/SP</p>
          <p>Documento gerado eletronicamente para fins de comprovação financeira.</p>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/80 dark:border-white/[0.08] print:hidden">
          <Button type="button" variant="ghost" onClick={onClose} size="sm">
            Fechar
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={handleShareWhatsApp}
            size="sm"
            leftIcon={<Share2 className="w-3.5 h-3.5 text-emerald-500" />}
          >
            Enviar no WhatsApp
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handlePrint}
            size="sm"
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Imprimir / Salvar PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
};
