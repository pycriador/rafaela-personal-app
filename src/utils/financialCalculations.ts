import {
  StudentPaymentRecord,
  PaymentMethod,
  PaymentStatus,
  DiscountType,
} from '../types';

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

/**
 * Retorna o número de dias de um determinado mês e ano
 */
function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Calcula a data de expiração com base na data de início e duração em meses
 */
export function calculateExpirationDate(startDateStr: string, durationMonths: number): string {
  if (!startDateStr) return '';
  const date = new Date(startDateStr);
  if (isNaN(date.getTime())) return '';

  const d = date.getDate();
  date.setMonth(date.getMonth() + durationMonths);
  if (date.getDate() !== d) {
    date.setDate(0); // clamp to last day of month
  }
  return date.toISOString().split('T')[0];
}

/**
 * Gera automaticamente as parcelas de um plano (1 a N parcelas)
 */
export function generateInstallments(params: {
  durationMonths: number;
  totalPrice: number;
  billingDay: number;
  startDate: string;
  paymentMethod: PaymentMethod;
  firstMonthPaid?: boolean;
}): StudentPaymentRecord[] {
  const {
    durationMonths,
    totalPrice,
    billingDay,
    startDate,
    paymentMethod,
    firstMonthPaid = false,
  } = params;

  const count = Math.max(1, durationMonths);
  const start = startDate ? new Date(startDate) : new Date();
  const startYear = start.getFullYear();
  const startMonth = start.getMonth();

  const baseAmount = Math.floor((totalPrice / count) * 100) / 100;
  let accumulated = 0;

  const records: StudentPaymentRecord[] = [];

  for (let i = 0; i < count; i++) {
    // Current installment month and year
    const targetDate = new Date(startYear, startMonth + i, 1);
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth();

    const maxDays = getDaysInMonth(targetYear, targetMonth);
    const clampedDay = Math.min(Math.max(1, billingDay), maxDays);
    const dayStr = String(clampedDay).padStart(2, '0');
    const monthStr = String(targetMonth + 1).padStart(2, '0');
    const dueDate = `${targetYear}-${monthStr}-${dayStr}`;

    const referenceMonth = `${MONTH_NAMES[targetMonth]}/${targetYear}`;

    // Last installment takes any rounding penny difference
    let amount = baseAmount;
    if (i === count - 1) {
      amount = Math.round((totalPrice - accumulated) * 100) / 100;
    } else {
      accumulated += baseAmount;
    }

    const isPaid = firstMonthPaid && i === 0;
    const todayStr = new Date().toISOString().split('T')[0];

    records.push({
      id: `pay-${Date.now()}-${i + 1}-${Math.random().toString(36).substring(2, 6)}`,
      referenceMonth,
      amount: Math.max(0, amount),
      dueDate,
      paidDate: isPaid ? (startDate || todayStr) : undefined,
      status: isPaid ? 'pago' : 'pendente',
      installments: count === 1 ? '1x à vista' : `Parcela ${i + 1} de ${count}`,
      paymentMethod,
    });
  }

  return records;
}

/**
 * Ao mudar o dia de vencimento (billingDay), atualiza automaticamente as datas
 * de todas as parcelas pendentes ou vencidas, preservando parcelas já pagas.
 */
export function recalculatePendingInstallmentsDueDay(
  payments: StudentPaymentRecord[],
  newBillingDay: number
): StudentPaymentRecord[] {
  const safeDay = Math.min(Math.max(1, newBillingDay), 31);

  return payments.map((p) => {
    // Preserva parcelas já pagas
    if (p.status === 'pago') {
      return p;
    }

    try {
      const parts = p.dueDate.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const maxDays = getDaysInMonth(year, month - 1);
        const clampedDay = Math.min(safeDay, maxDays);
        const newDueDate = `${year}-${String(month).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`;
        return {
          ...p,
          dueDate: newDueDate,
        };
      }
    } catch {
      // fallback safe
    }
    return p;
  });
}

/**
 * Cupons padrão reconhecidos pelo sistema
 */
export const KNOWN_COUPONS: Record<string, { type: 'percentage' | 'fixed'; value: number; label: string }> = {
  PROMO10: { type: 'percentage', value: 10, label: '10% de Desconto Promocional' },
  RAFAELA15: { type: 'percentage', value: 15, label: '15% de Desconto Consultoria' },
  VIP20: { type: 'percentage', value: 20, label: '20% de Desconto Aluno VIP' },
  BLACKFRIDAY: { type: 'percentage', value: 25, label: '25% de Desconto Especial' },
  OFF50: { type: 'fixed', value: 50, label: 'R$ 50,00 de Desconto' },
  OFF100: { type: 'fixed', value: 100, label: 'R$ 100,00 de Desconto' },
};

/**
 * Aplica desconto ao valor bruto do plano
 */
export function calculateDiscount(params: {
  originalPrice: number;
  discountType: DiscountType;
  discountValue?: number;
  couponCode?: string;
}): {
  discountAmount: number;
  finalPrice: number;
  isValidCoupon: boolean;
  appliedLabel: string;
} {
  const { originalPrice, discountType, discountValue = 0, couponCode = '' } = params;

  if (originalPrice <= 0 || discountType === 'none') {
    return {
      discountAmount: 0,
      finalPrice: Math.max(0, originalPrice),
      isValidCoupon: true,
      appliedLabel: '',
    };
  }

  let discountAmount = 0;
  let isValidCoupon = true;
  let appliedLabel = '';

  if (discountType === 'coupon') {
    const cleanCode = couponCode.trim().toUpperCase();
    const found = KNOWN_COUPONS[cleanCode];

    if (found) {
      if (found.type === 'percentage') {
        discountAmount = (originalPrice * found.value) / 100;
      } else {
        discountAmount = found.value;
      }
      appliedLabel = `${cleanCode} (${found.label})`;
    } else if (cleanCode.length > 0) {
      // Se não for pré-cadastrado mas foi informado um valor de desconto manual
      if (discountValue > 0) {
        discountAmount = discountValue;
        appliedLabel = `Cupom ${cleanCode} (-R$ ${discountValue.toFixed(2)})`;
      } else {
        isValidCoupon = false;
        appliedLabel = 'Cupom inválido ou expirado';
      }
    }
  } else if (discountType === 'percentage') {
    const pct = Math.min(Math.max(0, discountValue), 100);
    discountAmount = (originalPrice * pct) / 100;
    appliedLabel = `${pct}% de desconto`;
  } else if (discountType === 'fixed') {
    discountAmount = Math.max(0, discountValue);
    appliedLabel = `R$ ${discountAmount.toFixed(2)} de desconto`;
  }

  // Não permitir desconto maior que o preço total
  discountAmount = Math.min(discountAmount, originalPrice);
  const finalPrice = Math.max(0, Math.round((originalPrice - discountAmount) * 100) / 100);

  return {
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalPrice,
    isValidCoupon,
    appliedLabel,
  };
}

/**
 * Ao mudar o valor final líquido (por desconto ou alteração manual),
 * redistribui automaticamente o saldo restante nas parcelas pendentes!
 */
export function recalculatePendingInstallmentAmounts(
  payments: StudentPaymentRecord[],
  newTotalPrice: number
): StudentPaymentRecord[] {
  if (!payments || payments.length === 0) return [];

  const paidPayments = payments.filter((p) => p.status === 'pago');
  const pendingPayments = payments.filter((p) => p.status !== 'pago');

  if (pendingPayments.length === 0) {
    return payments;
  }

  const alreadyPaidTotal = paidPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const remainingTotal = Math.max(0, newTotalPrice - alreadyPaidTotal);

  const pendingCount = pendingPayments.length;
  const baseAmount = Math.floor((remainingTotal / pendingCount) * 100) / 100;
  let accumulated = 0;

  let pendingIndex = 0;
  return payments.map((p) => {
    if (p.status === 'pago') {
      return p;
    }

    let amount = baseAmount;
    if (pendingIndex === pendingCount - 1) {
      amount = Math.round((remainingTotal - accumulated) * 100) / 100;
    } else {
      accumulated += baseAmount;
    }
    pendingIndex++;

    return {
      ...p,
      amount: Math.max(0, amount),
    };
  });
}
