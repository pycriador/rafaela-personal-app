import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Trash2,
  DollarSign,
  Send,
  HelpCircle,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import {
  Student,
  StudentFinancialPlan,
  StudentPaymentRecord,
  PlanFrequency,
  PaymentMethod,
  PaymentStatus,
} from '../../types';
import { studentRepository } from '../../repositories/studentRepository';
import { useToast } from '../../context/ToastContext';

interface StudentFinancialModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onFinancialUpdated: (updatedStudent: Student) => void;
}

export const StudentFinancialModal: React.FC<StudentFinancialModalProps> = ({
  isOpen,
  onClose,
  student,
  onFinancialUpdated,
}) => {
  const { success, error: toastError, info } = useToast();

  const existingPlan = student.financialPlan;

  const [planName, setPlanName] = useState(
    existingPlan?.planName || 'Consultoria Mensal Personalizada'
  );
  const [frequency, setFrequency] = useState<PlanFrequency>(
    existingPlan?.frequency || 'mensal'
  );
  const [price, setPrice] = useState<number>(existingPlan?.price ?? 280);
  const [totalInstallments, setTotalInstallments] = useState<number>(
    existingPlan?.totalInstallments ?? 1
  );
  const [billingDay, setBillingDay] = useState<number>(
    existingPlan?.billingDay ?? 10
  );
  const [startDate, setStartDate] = useState(
    existingPlan?.startDate || new Date().toISOString().split('T')[0]
  );
  const [expiresAt, setExpiresAt] = useState(
    existingPlan?.expiresAt ||
      student.planExpiresAt ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    existingPlan?.paymentMethod || 'pix'
  );
  const [notes, setNotes] = useState(existingPlan?.notes || '');

  // Payment Records / Installments list
  const [payments, setPayments] = useState<StudentPaymentRecord[]>(
    existingPlan?.payments && existingPlan.payments.length > 0
      ? [...existingPlan.payments]
      : [
          {
            id: `pay-${Date.now()}-1`,
            referenceMonth: 'Março/2026',
            amount: 280,
            dueDate: '2026-03-10',
            paidDate: '2026-03-09',
            status: 'pago',
            installments: '1x à vista',
            paymentMethod: 'pix',
          },
          {
            id: `pay-${Date.now()}-2`,
            referenceMonth: 'Abril/2026',
            amount: 280,
            dueDate: '2026-04-10',
            status: 'pendente',
            installments: '1x à vista',
            paymentMethod: 'pix',
          },
        ]
  );

  const [isSaving, setIsSaving] = useState(false);

  // New payment entry state
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [newPayMonth, setNewPayMonth] = useState('');
  const [newPayAmount, setNewPayAmount] = useState<number>(280);
  const [newPayDueDate, setNewPayDueDate] = useState('');
  const [newPayInstallment, setNewPayInstallment] = useState('1x à vista');
  const [newPayMethod, setNewPayMethod] = useState<PaymentMethod>('pix');
  const [newPayStatus, setNewPayStatus] = useState<PaymentStatus>('pendente');

  useEffect(() => {
    if (student.financialPlan) {
      setPlanName(student.financialPlan.planName);
      setFrequency(student.financialPlan.frequency);
      setPrice(student.financialPlan.price);
      setTotalInstallments(student.financialPlan.totalInstallments);
      setBillingDay(student.financialPlan.billingDay);
      setStartDate(student.financialPlan.startDate);
      setExpiresAt(student.financialPlan.expiresAt);
      setPaymentMethod(student.financialPlan.paymentMethod);
      setNotes(student.financialPlan.notes || '');
      setPayments([...student.financialPlan.payments]);
    } else {
      setPlanName('Consultoria Mensal Personalizada');
      setFrequency('mensal');
      setPrice(280);
      setTotalInstallments(1);
      setBillingDay(10);
      setStartDate(new Date().toISOString().split('T')[0]);
      setExpiresAt(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setPaymentMethod('pix');
      setNotes('');
    }
    setIsAddingPayment(false);
  }, [student, isOpen]);

  // Frequency auto-adjust helper
  const handleFrequencyChange = (newFreq: PlanFrequency) => {
    setFrequency(newFreq);
    if (newFreq === 'mensal') {
      setTotalInstallments(1);
    } else if (newFreq === 'trimestral') {
      setTotalInstallments(3);
    } else if (newFreq === 'semestral') {
      setTotalInstallments(6);
    } else if (newFreq === 'anual') {
      setTotalInstallments(12);
    }
  };

  // Toggle payment status between 'pago' and 'pendente'
  const handleTogglePaymentStatus = (payId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setPayments((prev) =>
      prev.map((p) => {
        if (p.id !== payId) return p;
        if (p.status === 'pago') {
          return { ...p, status: 'pendente', paidDate: undefined };
        } else {
          return { ...p, status: 'pago', paidDate: today };
        }
      })
    );
  };

  // Remove a payment record
  const handleDeletePayment = (payId: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== payId));
  };

  // Add new payment entry
  const handleAddPaymentRecord = () => {
    if (!newPayMonth.trim() || !newPayDueDate) {
      toastError('Informe o mês de referência e a data de vencimento.');
      return;
    }

    const newRecord: StudentPaymentRecord = {
      id: `pay-${Date.now()}`,
      referenceMonth: newPayMonth.trim(),
      amount: newPayAmount || price,
      dueDate: newPayDueDate,
      paidDate: newPayStatus === 'pago' ? new Date().toISOString().split('T')[0] : undefined,
      status: newPayStatus,
      installments: newPayInstallment.trim() || '1x à vista',
      paymentMethod: newPayMethod,
    };

    setPayments((prev) => [newRecord, ...prev]);
    setIsAddingPayment(false);
    setNewPayMonth('');
    setNewPayDueDate('');
    success(`Mensalidade de "${newRecord.referenceMonth}" adicionada!`);
  };

  // Save all financial changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) {
      toastError('Informe o nome do plano.');
      return;
    }
    if (price <= 0) {
      toastError('Informe um valor de plano válido.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedPlan: StudentFinancialPlan = {
        planName: planName.trim(),
        frequency,
        price: Number(price),
        totalInstallments: Number(totalInstallments),
        billingDay: Number(billingDay),
        startDate,
        expiresAt,
        paymentMethod,
        notes: notes.trim() || undefined,
        payments,
      };

      const updated = await studentRepository.update(student.id, {
        financialPlan: updatedPlan,
        planExpiresAt: expiresAt,
        hasActivePlan: true,
      });

      const finalStudent = updated || {
        ...student,
        financialPlan: updatedPlan,
        planExpiresAt: expiresAt,
        hasActivePlan: true,
      };

      onFinancialUpdated(finalStudent);
      success('Plano e controle financeiro atualizados com sucesso!');
      onClose();
    } catch {
      toastError('Erro ao salvar plano financeiro.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestão de Planos & Mensalidades do Aluno"
      size="xl"
    >
      <form onSubmit={handleSave} className="space-y-6">
        {/* Banner do Aluno */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-cardElevated border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={
                student.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
              }
              alt={student.name}
              className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-white/[0.1]"
            />
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {student.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-dark-muted">
                {student.phone} • {student.email}
              </p>
            </div>
          </div>
          <Badge variant={student.status === 'Ativo' ? 'success' : 'warning'} size="sm">
            {student.status}
          </Badge>
        </div>

        {/* 1. Configuração do Plano */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              Dados do Plano Vigente
            </h3>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 font-mono">
              Valor: R$ {Number(price).toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nome do Plano *"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="Ex: Consultoria Premium Presencial"
              required
            />

            <Select
              label="Periodicidade do Plano *"
              value={frequency}
              onChange={(e) => handleFrequencyChange(e.target.value as PlanFrequency)}
              options={[
                { value: 'mensal', label: 'Mensal (Renovação a cada mês)' },
                { value: 'trimestral', label: 'Trimestral (Plano de 3 meses)' },
                { value: 'semestral', label: 'Semestral (Plano de 6 meses)' },
                { value: 'anual', label: 'Anual (Plano de 12 meses)' },
                { value: 'personalizado', label: 'Personalizado / Avulso' },
              ]}
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Valor Total (R$) *"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                required
              />

              <Select
                label="Parcelas"
                value={String(totalInstallments)}
                onChange={(e) => setTotalInstallments(parseInt(e.target.value, 10) || 1)}
                options={[
                  { value: '1', label: '1x à vista' },
                  { value: '2', label: '2x parcelas' },
                  { value: '3', label: '3x parcelas' },
                  { value: '4', label: '4x parcelas' },
                  { value: '6', label: '6x parcelas' },
                  { value: '10', label: '10x parcelas' },
                  { value: '12', label: '12x parcelas' },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Select
                label="Forma Principal"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                options={[
                  { value: 'pix', label: 'PIX' },
                  { value: 'cartao_credito', label: 'Cartão de Crédito' },
                  { value: 'cartao_debito', label: 'Cartão de Débito' },
                  { value: 'boleto', label: 'Boleto Bancário' },
                  { value: 'dinheiro', label: 'Dinheiro' },
                  { value: 'outro', label: 'Outro' },
                ]}
              />

              <Input
                label="Dia de Vencimento"
                type="number"
                min="1"
                max="31"
                value={billingDay}
                onChange={(e) => setBillingDay(parseInt(e.target.value, 10) || 10)}
                helperText="Dia fixo no mês"
              />
            </div>

            <Input
              label="Data de Início do Plano"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input
              label="Data de Término / Vencimento do Plano *"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              required
              helperText="Determina se o plano está em dia ou vencido"
            />
          </div>
        </div>

        {/* 2. Histórico de Mensalidades & Controle de Quem Pagou */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                Controle de Mensalidades & Meses Pagos / Pendentes
              </h3>
              <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
                Clique no botão de status para alternar entre &ldquo;Pago&rdquo; e &ldquo;Pendente&rdquo;
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsAddingPayment(true);
                setNewPayMonth(`Mês ${payments.length + 1}/2026`);
                setNewPayAmount(totalInstallments > 1 ? Math.round(price / totalInstallments) : price);
                setNewPayDueDate(new Date().toISOString().split('T')[0]);
                setNewPayInstallment(totalInstallments > 1 ? `${payments.length + 1} de ${totalInstallments}x` : '1x à vista');
              }}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs py-1"
            >
              Adicionar Mês / Parcela
            </Button>
          </div>

          {/* Sub-form to add payment record */}
          {isAddingPayment && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-cardElevated border border-emerald-500/30 space-y-3 animate-in fade-in">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Nova Cobrança de Mensalidade
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Input
                  label="Mês de Referência"
                  value={newPayMonth}
                  onChange={(e) => setNewPayMonth(e.target.value)}
                  placeholder="Ex: Maio/2026"
                />
                <Input
                  label="Valor (R$)"
                  type="number"
                  value={newPayAmount}
                  onChange={(e) => setNewPayAmount(parseFloat(e.target.value) || 0)}
                />
                <Input
                  label="Vencimento"
                  type="date"
                  value={newPayDueDate}
                  onChange={(e) => setNewPayDueDate(e.target.value)}
                />
                <Select
                  label="Status Inicial"
                  value={newPayStatus}
                  onChange={(e) => setNewPayStatus(e.target.value as PaymentStatus)}
                  options={[
                    { value: 'pendente', label: 'Pendente' },
                    { value: 'pago', label: 'Pago' },
                    { value: 'vencido', label: 'Vencido' },
                  ]}
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingPayment(false)}
                  className="text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleAddPaymentRecord}
                  className="text-xs"
                >
                  Confirmar Mês
                </Button>
              </div>
            </div>
          )}

          {/* Table of Monthly Payments */}
          <div className="border border-slate-200/80 dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-2xs">
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.06]">
              {payments.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Nenhum registro de mensalidade lançado. Clique em &ldquo;Adicionar Mês / Parcela&rdquo;.
                </div>
              ) : (
                payments.map((p) => {
                  const isPaid = p.status === 'pago';
                  const isOverdue = p.status === 'vencido';

                  return (
                    <div
                      key={p.id}
                      className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                        isOverdue
                          ? 'bg-rose-50/50 dark:bg-rose-950/10'
                          : isPaid
                          ? 'hover:bg-slate-50/70 dark:hover:bg-white/[0.02]'
                          : 'bg-amber-50/30 dark:bg-amber-950/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isPaid
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : isOverdue
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {isPaid ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : isOverdue ? (
                            <AlertTriangle className="w-5 h-5" />
                          ) : (
                            <Clock className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {p.referenceMonth}
                            </span>
                            <span className="font-mono text-xs font-black text-slate-700 dark:text-slate-300">
                              R$ {Number(p.amount).toFixed(2)}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-500 font-mono">
                              {p.installments}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>Vencimento: {new Date(p.dueDate).toLocaleDateString()}</span>
                            {p.paidDate && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                  Pago em: {new Date(p.paidDate).toLocaleDateString()}
                                </span>
                              </>
                            )}
                            {p.paymentMethod && (
                              <>
                                <span>•</span>
                                <span className="uppercase text-[10px]">
                                  {p.paymentMethod.replace('_', ' ')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleTogglePaymentStatus(p.id)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                            isPaid
                              ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-2xs'
                              : isOverdue
                              ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-2xs'
                              : 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-2xs'
                          }`}
                          title="Clique para alternar o status do pagamento"
                        >
                          {isPaid ? '✓ Pago' : isOverdue ? '⚠️ Vencido (Pagar)' : 'Pendente (Pagar)'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePayment(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                          title="Remover este lançamento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/[0.08]">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            Salvar Plano & Financeiro
          </Button>
        </div>
      </form>
    </Modal>
  );
};
