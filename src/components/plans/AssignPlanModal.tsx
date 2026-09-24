import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Tag,
  ArrowRight,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import {
  MembershipPlan,
  Student,
  PaymentMethod,
  DiscountType,
  StudentFinancialPlan,
} from '../../types';
import { studentRepository } from '../../repositories/studentRepository';
import { activityRepository } from '../../repositories/activityRepository';
import { useToast } from '../../context/ToastContext';
import {
  generateInstallments,
  calculateExpirationDate,
  calculateDiscount,
  recalculatePendingInstallmentAmounts,
} from '../../utils/financialCalculations';

interface AssignPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: MembershipPlan | null;
  onPlanAssigned?: () => void;
}

export const AssignPlanModal: React.FC<AssignPlanModalProps> = ({
  isOpen,
  onClose,
  plan,
  onPlanAssigned,
}) => {
  const { success, error: toastError } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [billingDay, setBillingDay] = useState<number>(10);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [firstMonthPaid, setFirstMonthPaid] = useState<boolean>(false);

  // Discount
  const [discountType, setDiscountType] = useState<DiscountType>('none');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [couponCode, setCouponCode] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      studentRepository.getAll().then((list) => {
        setStudents(list);
        if (list.length > 0 && !selectedStudentId) {
          setSelectedStudentId(list[0].id);
        }
      });
      setStartDate(new Date().toISOString().split('T')[0]);
      setBillingDay(10);
      setPaymentMethod(plan?.allowedPaymentMethods[0] || 'pix');
      setFirstMonthPaid(false);
      setDiscountType('none');
      setDiscountValue(0);
      setCouponCode('');
    }
  }, [isOpen, plan]);

  const durationMonths = plan?.durationMonths || 1;

  // Auto calculate expiration date
  const expiresAt = useMemo(() => {
    return calculateExpirationDate(startDate, durationMonths);
  }, [startDate, durationMonths]);

  // Price & Discount calculation
  const originalPrice = plan?.price || 0;
  const discountInfo = useMemo(() => {
    return calculateDiscount({
      originalPrice,
      discountType,
      discountValue,
      couponCode,
    });
  }, [originalPrice, discountType, discountValue, couponCode]);

  const finalPrice = discountInfo.finalPrice;

  // Live generated installments preview
  const previewInstallments = useMemo(() => {
    return generateInstallments({
      durationMonths,
      totalPrice: finalPrice,
      billingDay,
      startDate,
      paymentMethod,
      firstMonthPaid,
    });
  }, [durationMonths, finalPrice, billingDay, startDate, paymentMethod, firstMonthPaid]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  if (!plan) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      toastError('Selecione um aluno para vincular o plano.');
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedPayments = generateInstallments({
        durationMonths,
        totalPrice: finalPrice,
        billingDay,
        startDate,
        paymentMethod,
        firstMonthPaid,
      });

      const updatedFinancialPlan: StudentFinancialPlan = {
        planId: plan.id,
        planName: plan.name,
        frequency: plan.frequency,
        durationMonths,
        originalPrice,
        price: finalPrice,
        discountType,
        discountValue: discountType !== 'none' ? discountValue : undefined,
        discountCouponCode: discountType === 'coupon' ? couponCode.toUpperCase().trim() : undefined,
        totalInstallments: durationMonths,
        billingDay,
        startDate,
        expiresAt,
        paymentMethod,
        notes: `Plano ${plan.name} vinculado pela Central de Planos em ${new Date().toLocaleDateString()}.${
          discountInfo.appliedLabel ? ` (${discountInfo.appliedLabel})` : ''
        }`,
        payments: generatedPayments,
      };

      await studentRepository.update(selectedStudentId, {
        hasActivePlan: true,
        planExpiresAt: expiresAt,
        financialPlan: updatedFinancialPlan,
      });

      await activityRepository.log({
        actorId: 'user-rafaela',
        actorName: 'Rafaela Personal',
        actorRole: 'personal',
        studentId: selectedStudentId,
        action: 'Plano vinculado',
        description: `Plano "${plan.name}" (${durationMonths} meses, ${durationMonths} parcelas de R$ ${(
          finalPrice / durationMonths
        ).toFixed(2)}) atribuído a ${selectedStudent?.name || 'aluno'}.`,
        iconType: 'nutrition',
      });

      success(`Plano "${plan.name}" vinculado com sucesso a ${selectedStudent?.name}! As ${durationMonths} parcelas foram geradas.`);
      if (onPlanAssigned) onPlanAssigned();
      onClose();
    } catch (err) {
      console.error(err);
      toastError('Erro ao vincular plano ao aluno.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vincular Plano ao Aluno"
      description={`Configurar vigência, parcelas automáticas e descontos para o plano: ${plan.name}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Banner do Plano Selecionado */}
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
              Plano Selecionado
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {plan.name} ({plan.durationMonths} {plan.durationMonths === 1 ? 'mês' : 'meses'})
            </h4>
            <p className="text-xs text-slate-500 dark:text-dark-muted">
              Preço Base: <strong className="font-mono text-emerald-600 dark:text-emerald-400">R$ {originalPrice.toFixed(2)}</strong> (
              {plan.durationMonths}x de R$ {(originalPrice / plan.durationMonths).toFixed(2)})
            </p>
          </div>
          <Badge variant="success" size="md">
            {plan.frequency.toUpperCase()}
          </Badge>
        </div>

        {/* Seleção do Aluno */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            Selecione o Aluno <span className="text-rose-500">*</span>
          </label>
          <div className="space-y-1.5">
            <Input
              type="text"
              placeholder="Filtrar aluno por nome ou e-mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs py-1.5"
            />
            <Select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              required
              className="text-xs"
            >
              {filteredStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.email}) {s.financialPlan ? `• Plano Atual: ${s.financialPlan.planName}` : '• Sem plano'}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Vigência & Vencimento */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Data de Início
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Data Fim (Automático)
            </label>
            <Input
              type="date"
              value={expiresAt}
              readOnly
              className="text-xs bg-slate-100 dark:bg-dark-cardElevated/50 font-mono text-emerald-600 dark:text-emerald-400 font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Dia de Vencimento
            </label>
            <Select
              value={billingDay}
              onChange={(e) => setBillingDay(parseInt(e.target.value, 10))}
              className="text-xs"
            >
              {[1, 5, 10, 15, 20, 25, 28, 30].map((d) => (
                <option key={d} value={d}>
                  Todo dia {d} do mês
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Forma de Pagamento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Forma de Pagamento Principal
            </label>
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="text-xs"
            >
              <option value="pix">PIX (Chave Instantânea)</option>
              <option value="cartao_credito">Cartão de Crédito</option>
              <option value="boleto">Boleto Bancário</option>
              <option value="dinheiro">Dinheiro</option>
            </Select>
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={firstMonthPaid}
                onChange={(e) => setFirstMonthPaid(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-700 dark:text-slate-200 font-medium">
                Marcar 1ª parcela como <strong>Paga</strong> (adesão na assinatura)
              </span>
            </label>
          </div>
        </div>

        {/* Módulo de Cupons e Descontos */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-dark-cardElevated/50 border border-slate-200/80 dark:border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Cupons de Desconto & Ofertas
              </span>
            </div>
            {discountInfo.appliedLabel && (
              <Badge variant="success" size="sm">
                {discountInfo.appliedLabel}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500 dark:text-dark-muted block mb-1">
                Tipo de Desconto
              </label>
              <Select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                className="text-xs"
              >
                <option value="none">Sem desconto</option>
                <option value="coupon">Cupom Promocional</option>
                <option value="percentage">Porcentagem (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </Select>
            </div>

            {discountType === 'coupon' && (
              <div className="sm:col-span-2">
                <label className="text-[11px] font-medium text-slate-500 dark:text-dark-muted block mb-1">
                  Código do Cupom (ex: PROMO10, RAFAELA15, BLACKFRIDAY, OFF50)
                </label>
                <Input
                  type="text"
                  placeholder="Digite o código..."
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="text-xs font-mono font-bold tracking-wider"
                />
              </div>
            )}

            {discountType === 'percentage' && (
              <div className="sm:col-span-2">
                <label className="text-[11px] font-medium text-slate-500 dark:text-dark-muted block mb-1">
                  Porcentagem de Desconto (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  className="text-xs font-mono font-bold"
                />
              </div>
            )}

            {discountType === 'fixed' && (
              <div className="sm:col-span-2">
                <label className="text-[11px] font-medium text-slate-500 dark:text-dark-muted block mb-1">
                  Valor do Desconto (R$)
                </label>
                <Input
                  type="number"
                  min="0"
                  max={originalPrice}
                  step="5"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  className="text-xs font-mono font-bold"
                />
              </div>
            )}
          </div>

          {/* Resumo Financeiro com Desconto */}
          {discountInfo.discountAmount > 0 && (
            <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-dark-muted">
                Preço Original: <span className="line-through">R$ {originalPrice.toFixed(2)}</span>
              </span>
              <span className="font-bold text-rose-500">
                Desconto: -R$ {discountInfo.discountAmount.toFixed(2)}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                Total Líquido: R$ {finalPrice.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Pré-visualização das N Parcelas Geradas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Parcelas que serão criadas automaticamente ({previewInstallments.length})</span>
            </label>
            <span className="text-[11px] text-slate-400">
              Vencimento: todo dia {billingDay}
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-white/[0.08] divide-y divide-slate-100 dark:divide-white/[0.04]">
            {previewInstallments.map((inst, idx) => (
              <div
                key={inst.id}
                className="p-2.5 px-3 flex items-center justify-between text-xs hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-dark-cardElevated flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {inst.installments} • {inst.referenceMonth}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Vencimento: {new Date(inst.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                    R$ {Number(inst.amount).toFixed(2)}
                  </span>
                  <Badge variant={inst.status === 'pago' ? 'success' : 'neutral'} size="sm">
                    {inst.status === 'pago' ? 'Paga ✓' : 'Pendente'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/80 dark:border-white/[0.08]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<ShieldCheck className="w-4 h-4" />}
          >
            Confirmar Vínculo & Gerar Parcelas
          </Button>
        </div>
      </form>
    </Modal>
  );
};
