import { DiscountCoupon } from '../types';
import { initialDiscountCoupons } from '../data/discountCoupons';
import { getItem, setItem, STORAGE_KEYS } from './storage';

export const STUDENT_COUPONS_STORAGE_KEY = 'rafaela_app_student_used_coupons_v1';

export interface CouponValidationOptions {
  code: string;
  planPrice: number;
  studentId?: string;
  hasOtherDiscount?: boolean;
}

export interface CouponValidationResult {
  isValid: boolean;
  discountAmount: number;
  finalPrice: number;
  message: string;
  coupon?: DiscountCoupon;
}

export interface CouponRepository {
  getCoupons(trainerId?: string): Promise<DiscountCoupon[]>;
  getCouponById(id: string): Promise<DiscountCoupon | null>;
  getCouponByCode(code: string): Promise<DiscountCoupon | null>;
  saveCoupon(coupon: Partial<DiscountCoupon> & { code: string; discountType: 'percentage' | 'fixed'; discountValue: number }): Promise<DiscountCoupon>;
  deleteCoupon(id: string): Promise<void>;
  toggleActive(id: string, active: boolean): Promise<DiscountCoupon>;
  recordUsage(code: string, studentId?: string): Promise<boolean>;
  removeCouponUsage(code: string, studentId?: string): Promise<boolean>;
  hasStudentUsedCoupon(studentId: string, code: string): boolean;
  validateCoupon(options: CouponValidationOptions | string, legacyPrice?: number): Promise<CouponValidationResult>;
}

class LocalCouponRepository implements CouponRepository {
  private getStoredCoupons(): DiscountCoupon[] {
    return getItem<DiscountCoupon[]>(STORAGE_KEYS.DISCOUNT_COUPONS, initialDiscountCoupons);
  }

  private setStoredCoupons(coupons: DiscountCoupon[]): void {
    setItem(STORAGE_KEYS.DISCOUNT_COUPONS, coupons);
  }

  private getStudentUsedCouponsMap(): Record<string, string[]> {
    return getItem<Record<string, string[]>>(STUDENT_COUPONS_STORAGE_KEY, {});
  }

  private setStudentUsedCouponsMap(map: Record<string, string[]>): void {
    setItem(STUDENT_COUPONS_STORAGE_KEY, map);
  }

  async getCoupons(trainerId?: string): Promise<DiscountCoupon[]> {
    const list = this.getStoredCoupons();
    if (trainerId && trainerId !== 'all') {
      return list.filter((c) => c.isGlobal || c.trainerId === trainerId);
    }
    return list;
  }

  async getCouponById(id: string): Promise<DiscountCoupon | null> {
    const coupons = this.getStoredCoupons();
    return coupons.find((c) => c.id === id) || null;
  }

  async getCouponByCode(code: string): Promise<DiscountCoupon | null> {
    if (!code) return null;
    const clean = code.trim().toUpperCase();
    const coupons = this.getStoredCoupons();
    return coupons.find((c) => c.code.trim().toUpperCase() === clean) || null;
  }

  hasStudentUsedCoupon(studentId: string, code: string): boolean {
    if (!studentId || !code) return false;
    const clean = code.trim().toUpperCase();
    const map = this.getStudentUsedCouponsMap();
    const usedList = map[studentId] || [];
    return usedList.includes(clean);
  }

  async saveCoupon(data: Partial<DiscountCoupon> & { code: string; discountType: 'percentage' | 'fixed'; discountValue: number }): Promise<DiscountCoupon> {
    const coupons = this.getStoredCoupons();
    const now = new Date().toISOString();
    const cleanCode = data.code.trim().toUpperCase();

    if (data.id) {
      // Atualização
      const index = coupons.findIndex((c) => c.id === data.id);
      if (index === -1) {
        throw new Error(`Cupom com ID ${data.id} não encontrado.`);
      }

      // Checa se o código já existe em outro cupom
      const duplicate = coupons.find((c) => c.id !== data.id && c.code.trim().toUpperCase() === cleanCode);
      if (duplicate) {
        throw new Error(`Já existe outro cupom cadastrado com o código "${cleanCode}".`);
      }

      const updated: DiscountCoupon = {
        ...coupons[index],
        ...data,
        code: cleanCode,
        isCumulative: data.isCumulative !== undefined ? data.isCumulative : (coupons[index].isCumulative ?? false),
        singleUsePerStudent: data.singleUsePerStudent !== undefined ? data.singleUsePerStudent : (coupons[index].singleUsePerStudent ?? true),
        updatedAt: now,
      };

      coupons[index] = updated;
      this.setStoredCoupons(coupons);
      return updated;
    } else {
      // Criação de novo cupom
      const duplicate = coupons.find((c) => c.code.trim().toUpperCase() === cleanCode);
      if (duplicate) {
        throw new Error(`Já existe um cupom cadastrado com o código "${cleanCode}".`);
      }

      const newCoupon: DiscountCoupon = {
        id: `coupon-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        code: cleanCode,
        description: data.description || '',
        discountType: data.discountType,
        discountValue: Number(data.discountValue) || 0,
        maxUses: data.maxUses !== undefined ? data.maxUses : null,
        usedCount: 0,
        expiresAt: data.expiresAt || null,
        minPlanPrice: data.minPlanPrice !== undefined ? data.minPlanPrice : null,
        isCumulative: data.isCumulative !== undefined ? data.isCumulative : false,
        singleUsePerStudent: data.singleUsePerStudent !== undefined ? data.singleUsePerStudent : true,
        active: data.active !== undefined ? data.active : true,
        createdAt: now,
        updatedAt: now,
      };

      coupons.unshift(newCoupon);
      this.setStoredCoupons(coupons);
      return newCoupon;
    }
  }

  async deleteCoupon(id: string): Promise<void> {
    const coupons = this.getStoredCoupons();
    const filtered = coupons.filter((c) => c.id !== id);
    this.setStoredCoupons(filtered);
  }

  async toggleActive(id: string, active: boolean): Promise<DiscountCoupon> {
    const coupons = this.getStoredCoupons();
    const index = coupons.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Cupom com ID ${id} não encontrado.`);
    }

    coupons[index] = {
      ...coupons[index],
      active,
      updatedAt: new Date().toISOString(),
    };

    this.setStoredCoupons(coupons);
    return coupons[index];
  }

  async recordUsage(code: string, studentId?: string): Promise<boolean> {
    if (!code) return false;
    const clean = code.trim().toUpperCase();
    const coupons = this.getStoredCoupons();
    const index = coupons.findIndex((c) => c.code.trim().toUpperCase() === clean);
    if (index === -1) return false;

    coupons[index] = {
      ...coupons[index],
      usedCount: (coupons[index].usedCount || 0) + 1,
      updatedAt: new Date().toISOString(),
    };
    this.setStoredCoupons(coupons);

    if (studentId) {
      const map = this.getStudentUsedCouponsMap();
      const existing = map[studentId] || [];
      if (!existing.includes(clean)) {
        map[studentId] = [...existing, clean];
        this.setStudentUsedCouponsMap(map);
      }
    }

    return true;
  }

  async removeCouponUsage(code: string, studentId?: string): Promise<boolean> {
    if (!code) return false;
    const clean = code.trim().toUpperCase();
    const coupons = this.getStoredCoupons();
    const index = coupons.findIndex((c) => c.code.trim().toUpperCase() === clean);
    if (index !== -1) {
      coupons[index] = {
        ...coupons[index],
        usedCount: Math.max(0, (coupons[index].usedCount || 1) - 1),
        updatedAt: new Date().toISOString(),
      };
      this.setStoredCoupons(coupons);
    }

    if (studentId) {
      const map = this.getStudentUsedCouponsMap();
      if (map[studentId]) {
        map[studentId] = map[studentId].filter((c) => c !== clean);
        this.setStudentUsedCouponsMap(map);
      }
    }

    return true;
  }

  async validateCoupon(
    options: CouponValidationOptions | string,
    legacyPrice?: number
  ): Promise<CouponValidationResult> {
    let code = '';
    let planPrice = 0;
    let studentId: string | undefined;
    let hasOtherDiscount = false;

    if (typeof options === 'string') {
      code = options;
      planPrice = legacyPrice || 0;
    } else {
      code = options.code;
      planPrice = options.planPrice;
      studentId = options.studentId;
      hasOtherDiscount = options.hasOtherDiscount || false;
    }

    if (!code || !code.trim()) {
      return {
        isValid: false,
        discountAmount: 0,
        finalPrice: planPrice,
        message: 'Código de cupom não informado.',
      };
    }

    const clean = code.trim().toUpperCase();
    const coupon = await this.getCouponByCode(clean);

    if (!coupon) {
      return {
        isValid: false,
        discountAmount: 0,
        finalPrice: planPrice,
        message: `Cupom "${clean}" não encontrado ou inexistente.`,
      };
    }

    if (!coupon.active) {
      return {
        isValid: false,
        discountAmount: 0,
        finalPrice: planPrice,
        message: `O cupom "${clean}" está inativo ou pausado.`,
        coupon,
      };
    }

    // Regra 1: Cupom Não Acumulativo
    if (!coupon.isCumulative && hasOtherDiscount) {
      return {
        isValid: false,
        discountAmount: 0,
        finalPrice: planPrice,
        message: `O cupom "${clean}" não é cumulativo com outros descontos ou cupons já aplicados.`,
        coupon,
      };
    }

    // Regra 2: Cupom de Uso Único por Aluno
    if (coupon.singleUsePerStudent && studentId) {
      const alreadyUsed = this.hasStudentUsedCoupon(studentId, clean);
      if (alreadyUsed) {
        return {
          isValid: false,
          discountAmount: 0,
          finalPrice: planPrice,
          message: `Este cupom é de uso único por aluno e já foi resgatado anteriormente por este aluno.`,
          coupon,
        };
      }
    }

    // Checar limite de utilizações globais
    if (coupon.maxUses !== null && coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      return {
        isValid: false,
        discountAmount: 0,
        finalPrice: planPrice,
        message: `O limite de utilizações deste cupom (${coupon.maxUses}) foi esgotado.`,
        coupon,
      };
    }

    // Checar data de validade
    if (coupon.expiresAt) {
      const today = new Date().toISOString().split('T')[0];
      if (coupon.expiresAt < today) {
        const [y, m, d] = coupon.expiresAt.split('-');
        return {
          isValid: false,
          discountAmount: 0,
          finalPrice: planPrice,
          message: `Este cupom expirou em ${d}/${m}/${y}.`,
          coupon,
        };
      }
    }

    // Checar valor mínimo do plano
    if (coupon.minPlanPrice !== null && coupon.minPlanPrice !== undefined && coupon.minPlanPrice > 0) {
      if (planPrice < coupon.minPlanPrice) {
        return {
          isValid: false,
          discountAmount: 0,
          finalPrice: planPrice,
          message: `Válido apenas para planos a partir de R$ ${coupon.minPlanPrice.toFixed(2)}.`,
          coupon,
        };
      }
    }

    // Calcular desconto
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      const pct = Math.min(Math.max(0, coupon.discountValue), 100);
      discountAmount = (planPrice * pct) / 100;
    } else {
      discountAmount = Math.max(0, coupon.discountValue);
    }

    discountAmount = Math.min(discountAmount, planPrice);
    const finalPrice = Math.max(0, Math.round((planPrice - discountAmount) * 100) / 100);

    return {
      isValid: true,
      discountAmount: Math.round(discountAmount * 100) / 100,
      finalPrice,
      message:
        coupon.discountType === 'percentage'
          ? `Cupom aplicado: ${coupon.discountValue}% de desconto!`
          : `Cupom aplicado: -R$ ${coupon.discountValue.toFixed(2)} de desconto!`,
      coupon,
    };
  }
}

export const couponRepository = new LocalCouponRepository();
