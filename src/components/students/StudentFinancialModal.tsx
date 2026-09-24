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
  Tag,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
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
  MembershipPlan,
  DiscountType,
} from '../../types';
import { studentRepository } from '../../repositories/studentRepository';
import { planRepository } from '../../repositories/planRepository';
import { activityRepository } from '../../repositories/activityRepository';
import { useToast } from '../../context/ToastContext';
import {
  generateInstallments,
  recalculatePendingInstallmentsDueDay,
  calculateDiscount,
  recalculatePendingInstallmentAmounts,
  calculateExpirationDate,
} from '../../utils/financialCalculations';

interface StudentFinancialModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onFinancialUpdated: (updatedStudent: Student) => void;
  initialMode?: 'default' | 'renew';
}

export const StudentFinancialModal: React.FC<StudentFinancialModalProps> = ({
  isOpen,
  onClose,
  student,
  onFinancialUpdated,
  initialMode = 'default',
}) => {
  const { success, error: toastError, info } = useToast();

  const [catalogPlans, setCatalogPlans] = useState<MembershipPlan[]>([]);
  const existingPlan = student.financialPlan;

  const [selectedCatalogPlanId, setSelectedCatalogPlanId] = useState<string>(
    existingPlan?.planId || ''
  );
  const [planName, setPlanName] = useState(
    existingPlan?.planName || 'Consultoria Mensal Personalizada'
  );
  const [frequency, setFrequency] = useState<PlanFrequency>(
    existingPlan?.frequency || 'mensal'
  );
  const [durationMonths, setDurationMonths] = useState<number>(
    existingPlan?.durationMonths || (existingPlan?.totalInstallments ?? 1)
  );

  // Prices and Discounts
  const [originalPrice, setOriginalPrice] = useState<number>(
    existingPlan?.originalPrice ?? existingPlan?.price ?? 280
  );
  const [price, setPrice] = useState<number>(existingPlan?.price ?? 280);
  const [discountType, setDiscountType] = useState<DiscountType>(
    existingPlan?.discountType || 'none'
  );
  const [discountValue, setDiscountValue] = useState<number>(
    existingPlan?.discountValue ?? 0
  );
  const [discountCouponCode, setDiscountCouponCode] = useState<string>(
    existingPlan?.discountCouponCode || ''
  );

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
      : []
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

  // Load catalog plans
  useEffect(() => {
    if (isOpen) {
      planRepository.getPlans().then(setCatalogPlans);
    }
  }, [isOpen]);

  // Initialize or reset state
  useEffect(() => {
    if (student.financialPlan) {
      setSelectedCatalogPlanId(student.financialPlan.planId || '');
      setPlanName(student.financialPlan.planName);
      setFrequency(student.financialPlan.frequency);
      const months = student.financialPlan.durationMonths || student.financialPlan.totalInstallments || 1;
      setDurationMonths(months);
      setOriginalPrice(student.financialPlan.originalPrice ?? student.financialPlan.price);
      setPrice(student.financialPlan.price);
      setDiscountType(student.financialPlan.discountType || 'none');
      setDiscountValue(student.financialPlan.discountValue ?? 0);
      setDiscountCouponCode(student.financialPlan.discountCouponCode || '');
      setTotalInstallments(student.financialPlan.totalInstallments);
      setBillingDay(student.financialPlan.billingDay);
      setStartDate(student.financialPlan.startDate);
      setExpiresAt(student.financialPlan.expiresAt);
      setPaymentMethod(student.financialPlan.paymentMethod);
      setNotes(student.financialPlan.notes || '');
      setPayments([...student.financialPlan.payments]);
    } else {
      setSelectedCatalogPlanId('');
      setPlanName('Consultoria Mensal Personalizada');
      setFrequency('mensal');
      setDurationMonths(1);
      setOriginalPrice(280);
      setPrice(280);
      setDiscountType('none');
      setDiscountValue(0);
      setDiscountCouponCode('');
      setTotalInstallments(1);
      setBillingDay(10);
      const todayStr = new Date().toISOString().split('T')[0];
      setStartDate(todayStr);
      setExpiresAt(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setPaymentMethod('pix');
      setNotes('');
      setPayments(
        generateInstallments({
          durationMonths: 1,
          totalPrice: 280,
          billingDay: 10,
          startDate: todayStr,
          paymentMethod: 'pix',
        })
      );
    }
    setIsAddingPayment(false);

    // If modal opened in renew mode
    if (initialMode === 'renew') {
      handlePrepareRenewal();
    }
  }, [student, isOpen, initialMode]);

  // When personal selects a plan from the catalog
  const handleSelectCatalogPlan = (planId: string) => {
    setSelectedCatalogPlanId(planId);
    if (!planId) return;

    const found = catalogPlans.find((p) => p.id === planId);
    if (!found) return;

    setPlanName(found.name);
    setFrequency(found.frequency);
    setDurationMonths(found.durationMonths);
    setOriginalPrice(found.price);
    setPrice(found.price);
    setTotalInstallments(found.durationMonths);
    if (found.allowedPaymentMethods && found.allowedPaymentMethods.length > 0) {
      setPaymentMethod(found.allowedPaymentMethods[0]);
    }

    // Auto-calculate expiration date
    const calculatedExpires = calculateExpirationDate(startDate, found.durationMonths);
    setExpiresAt(calculatedExpires);

    // Automatically generate the N installments
    const newPayments = generateInstallments({
      durationMonths: found.durationMonths,
      totalPrice: found.price,
      billingDay,
      startDate,
      paymentMethod: found.allowedPaymentMethods[0] || paymentMethod,
      firstMonthPaid: false,
    });
    setPayments(newPayments);

    info(`Plano "${found.name}" carregado! ${found.durationMonths} parcelas foram geradas automaticamente.`);
  };

  // Change billingDay: automatically update all pending installments to the new day!
  const handleBillingDayChange = (newDay: number) => {
    setBillingDay(newDay);
    setPayments((prev) => recalculatePendingInstallmentsDueDay(prev, newDay));
  };

  // Reapply discount and recalculate pending installment amounts
  const handleApplyDiscount = (
    type: DiscountType,
    val: number,
    code: string,
    basePrice: number = originalPrice
  ) => {
    setDiscountType(type);
    setDiscountValue(val);
    setDiscountCouponCode(code);

    const result = calculateDiscount({
      originalPrice: basePrice,
      discountType: type,
      discountValue: val,
      couponCode: code,
    });

    setPrice(result.finalPrice);
    // Automatically recalculate pending installments with the new total
    setPayments((prev) => recalculatePendingInstallmentAmounts(prev, result.finalPrice));
  };

  // Frequency auto-adjust helper
  const handleFrequencyChange = (newFreq: PlanFrequency) => {
    setFrequency(newFreq);
    let months = 1;
    if (newFreq === 'mensal') months = 1;
    else if (newFreq === 'trimestral') months = 3;
    else if (newFreq === 'semestral') months = 6;
    else if (newFreq === 'anual') months = 12;

    setDurationMonths(months);
    setTotalInstallments(months);
    const newExp = calculateExpirationDate(startDate, months);
    setExpiresAt(newExp);
  };

  // Regeneration of all installments from scratch
  const handleRegenerateAllInstallments = () => {
    const fresh = generateInstallments({
      durationMonths,
      totalPrice: price,
      billingDay,
      startDate,
      paymentMethod,
      firstMonthPaid: false,
    });
    setPayments(fresh);
    success(`${durationMonths} parcelas recalculadas e geradas com sucesso!`);
  };

  // Prepare Renewal Mode
  const handlePrepareRenewal = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newStart = todayStr;
    const newExp = calculateExpirationDate(newStart, durationMonths);
    setStartDate(newStart);
    setExpiresAt(newExp);

    // Keep previously paid installments and generate new cycle installments
    const paidPast = payments.filter((p) => p.status === 'pago');
    const newCycle = generateInstallments({
      durationMonths,
      totalPrice: price,
      billingDay,
      startDate: newStart,
      paymentMethod,
      firstMonthPaid: false,
    });

    setPayments([...newCycle, ...paidPast]);
    info(`Modo de Renovação ativo! Nova vigência calculada até ${new Date(newExp).toLocaleDateString()}.`);
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

  // Add custom payment entry
  const handleAddPaymentRecord = () => {
    if (!newPayMonth.trim() || !newPayDueDate) {
      toastError('Informe o mês de referência e a data de vencimento.');
      return;
    }

    const newRecord: StudentPaymentRecord = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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
        planId: selectedCatalogPlanId || undefined,
        planName: planName.trim(),
        frequency,
        durationMonths,
        originalPrice,
        price: Number(price),
        discountType,
        discountValue: discountType !== 'none' ? discountValue : undefined,
        discountCouponCode: discountType === 'coupon' ? discountCouponCode.toUpperCase().trim() : undefined,
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

      await activityRepository.log({
        actorId: 'user-rafaela',
        actorName: 'Rafaela Personal',
        actorRole: 'personal',
        studentId: student.id,
        action: 'Plano atualizado',
        description: `Plano financeiro de ${student.name} atualizado: ${planName} (R$ ${price.toFixed(2)} em ${payments.length} parcelas).`,
        iconType: 'nutrition',
      });

      onFinancialUpdated(finalStudent);
      success('Plano e controle financeiro atualizados com sucesso!');
      onClose();
    } catch {
      toastError('Erro ao salvar plano financeiro.');
    } finally {
      setIsSaving(false);
    }
  };

  const isExpired = student.planExpiresAt ? new Date(student.planExpiresAt) < new Date() : false;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestão de Planos & Mensalidades do Aluno"
      description="Gerencie vigência, parcelas automáticas, dia do vencimento e cupons de desconto"
      size="xl"
    >
      <form onSubmit={handleSave} className="space-y-6">
        {/* Banner do Aluno & Status */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-cardElevated border border-slate-200/80 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

          <div className="flex items-center gap-2">
            {isExpired && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handlePrepareRenewal}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                className="text-xs py-1"
              >
                Renovar Plano Agora
              </Button>
            )}

            <Badge variant={isExpired ? 'danger' : 'success'} size="sm">
              {isExpired ? 'Plano Vencido' : 'Plano Vigente'}
            </Badge>
          </div>
        </div>

        {/* 1. Seleção Rápida de Plano do Catálogo */}
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-500" />
              <span>Vincular Plano Pré-cadastrado do Catálogo</span>
            </label>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
              Gera parcelas e vigência automaticamente
            </span>
          </div>

          <Select
            value={selectedCatalogPlanId}
            onChange={(e) => handleSelectCatalogPlan(e.target.value)}
            className="text-xs bg-white dark:bg-dark-card font-medium"
          >
            <option value="">-- Personalizar Manualmente (Sem modelo fixo) --</option>
            {catalogPlans.map((cp) => (
              <option key={cp.id} value={cp.id}>
                {cp.name} ({cp.durationMonths} {cp.durationMonths === 1 ? 'mês' : 'meses'} • R${' '}
                {cp.price.toFixed(2)}) {cp.isPopular ? '★ Destaque' : ''}
              </option>
            ))}
          </Select>
        </div>

        {/* 2. Configuração do Plano */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              Dados do Plano & Vigência
            </h3>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 font-mono">
              Valor Líquido: R$ {Number(price).toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nome do Plano *"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="Ex: Semestral Foco & Consistência"
              required
            />

            <Select
              label="Periodicidade do Plano *"
              value={frequency}
              onChange={(e) => handleFrequencyChange(e.target.value as PlanFrequency)}
              options={[
                { value: 'mensal', label: 'Mensal (1 Mês)' },
                { value: 'trimestral', label: 'Trimestral (3 Meses)' },
                { value: 'semestral', label: 'Semestral (6 Meses)' },
                { value: 'anual', label: 'Anual (12 Meses)' },
                { value: 'personalizado', label: 'Personalizado' },
              ]}
            />

            {/* Duração em Meses & Parcelas */}
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Duração (Meses) *"
                type="number"
                min="1"
                max="36"
                value={durationMonths}
                onChange={(e) => {
                  const m = parseInt(e.target.value, 10) || 1;
                  setDurationMonths(m);
                  setTotalInstallments(m);
                  setExpiresAt(calculateExpirationDate(startDate, m));
                }}
                required
              />

              <Input
                label="Qtd. Parcelas *"
                type="number"
                min="1"
                max="36"
                value={totalInstallments}
                onChange={(e) => setTotalInstallments(parseInt(e.target.value, 10) || 1)}
                required
              />
            </div>

            {/* Forma de Pagamento & Dia de Vencimento com Automação */}
            <div className="grid grid-cols-2 gap-2">
              <Select
                label="Forma Principal"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                options={[
                  { value: 'pix', label: 'PIX Instantâneo' },
                  { value: 'cartao_credito', label: 'Cartão de Crédito' },
                  { value: 'cartao_debito', label: 'Cartão de Débito' },
                  { value: 'boleto', label: 'Boleto Bancário' },
                  { value: 'dinheiro', label: 'Dinheiro' },
                ]}
              />

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Dia de Vencimento *
                </label>
                <Select
                  value={billingDay}
                  onChange={(e) => handleBillingDayChange(parseInt(e.target.value, 10))}
                  className="text-xs"
                >
                  {[1, 5, 10, 15, 20, 25, 28, 30].map((d) => (
                    <option key={d} value={d}>
                      Todo dia {d} do mês
                    </option>
                  ))}
                </Select>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  Atualiza parcelas pendentes automaticamente!
                </span>
              </div>
            </div>

            {/* Data de Início e Data Fim */}
            <Input
              label="Data de Início do Plano *"
              type="date"
              value={startDate}
              onChange={(e) => {
                const newStart = e.target.value;
                setStartDate(newStart);
                setExpiresAt(calculateExpirationDate(newStart, durationMonths));
              }}
              required
            />

            <Input
              label="Data de Fim / Vencimento do Plano *"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              required
              helperText="Calculado automaticamente com base na duração"
            />
          </div>
        </div>

        {/* 3. Módulo de Cupons e Descontos (Atualiza automaticamente parcelas pendentes) */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-cardElevated border border-slate-200/80 dark:border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-emerald-500" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Descontos & Cupons Promocionais
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">
              Muda automaticamente os valores das parcelas pendentes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500 dark:text-dark-muted block mb-1">
                Tipo de Desconto
              </label>
              <Select
                value={discountType}
                onChange={(e) => {
                  const t = e.target.value as DiscountType;
                  handleApplyDiscount(t, discountValue, discountCouponCode);
                }}
                className="text-xs"
              >
                <option value="none">Sem desconto</option>
                <option value="coupon">Cupom de Desconto</option>
                <option value="percentage">Porcentagem (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </Select>
            </div>

            {discountType === 'coupon' && (
              <div className="sm:col-span-2">
                <label className="text-[11px] font-medium text-slate-500 dark:text-dark-muted block mb-1">
                  Cupom (ex: PROMO10, RAFAELA15, BLACKFRIDAY, OFF50)
                </label>
                <Input
                  type="text"
                  placeholder="Código do cupom..."
                  value={discountCouponCode}
                  onChange={(e) => {
                    const code = e.target.value.toUpperCase();
                    handleApplyDiscount('coupon', discountValue, code);
                  }}
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
                  value={discountValue}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    handleApplyDiscount('percentage', val, discountCouponCode);
                  }}
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
                  value={discountValue}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    handleApplyDiscount('fixed', val, discountCouponCode);
                  }}
                  className="text-xs font-mono font-bold"
                />
              </div>
            )}
          </div>

          {/* Resumo com Desconto */}
          <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-dark-muted">
              Preço Bruto: <span className={discountType !== 'none' ? 'line-through' : 'font-mono'}>R$ {originalPrice.toFixed(2)}</span>
            </span>
            {discountType !== 'none' && (
              <span className="font-bold text-rose-500">
                Desconto Aplicado: -R$ {(originalPrice - price).toFixed(2)}
              </span>
            )}
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
              Valor Final Líquido: R$ {price.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 4. Histórico de Mensalidades & Controle de Quem Pagou */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                Parcelas do Plano ({payments.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
                Clique no botão de status para dar baixa ou alternar entre &ldquo;Pago&rdquo; e &ldquo;Pendente&rdquo;
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRegenerateAllInstallments}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                className="text-xs py-1"
                title="Regera todas as parcelas do zero com base na duração e preço atual"
              >
                Regerar Parcelas
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsAddingPayment(true);
                  setNewPayMonth(`Mês ${payments.length + 1}/2026`);
                  setNewPayAmount(totalInstallments > 1 ? Math.round(price / totalInstallments) : price);
                  setNewPayDueDate(new Date().toISOString().split('T')[0]);
                  setNewPayInstallment(
                    totalInstallments > 1
                      ? `Parcela ${payments.length + 1} de ${totalInstallments}`
                      : '1x à vista'
                  );
                }}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="text-xs py-1"
              >
                Adicionar Parcela Manual
              </Button>
            </div>
          </div>

          {/* Sub-form to add payment record */}
          {isAddingPayment && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-cardElevated border border-emerald-500/30 space-y-3 animate-in fade-in">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Nova Parcela de Mensalidade
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
                  Confirmar Parcela
                </Button>
              </div>
            </div>
          )}

          {/* Table of Monthly Payments */}
          <div className="border border-slate-200/80 dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-2xs">
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.06]">
              {payments.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Nenhuma parcela lançada. Clique em &ldquo;Regerar Parcelas&rdquo; ou &ldquo;Adicionar Parcela Manual&rdquo;.
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
                          {isPaid ? '✓ Pago' : isOverdue ? '⚠️ Vencido (Dar baixa)' : 'Pendente (Dar baixa)'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePayment(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                          title="Remover esta parcela"
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
          <Button type="submit" variant="primary" isLoading={isSaving} leftIcon={<ShieldCheck className="w-4 h-4" />}>
            Salvar Plano & Mensalidades
          </Button>
        </div>
      </form>
    </Modal>
  );
};
