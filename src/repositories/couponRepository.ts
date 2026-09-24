import { DiscountCoupon } from '../types';
import { initialDiscountCoupons } from '../data/discountCoupons';
import { getItem, setItem, STORAGE_KEYS } from './storage';

export interface CouponValidationResult {
  isValid: boolean;
  discountAmount: number;
  finalPrice: number;
  message: string;
  coupon?: DiscountCoupon;
}

export interface CouponRepository {
  getCoupons(): Promise<DiscountCoupon[]>;
  getCouponById(id: string): Promise<DiscountCoupon | null>;
  getCouponByCode(code: string): Promise<DiscountCoupon | null>;
  saveCoupon(coupon: Partial<DiscountCoupon> & { code: string; discountType: 'percentage' | 'fixed'; discountValue: number }): Promise<DiscountCoupon>;
  deleteCoupon(id: string): Promise<void>;
  toggleActive(id: string, active: boolean): Promise<DiscountCoupon>;
  recordUsage(code: string): Promise<boolean>;
  validateCoupon(code: string, planPrice: number): Promise<CouponValidationResult>;
}

class LocalCouponRepository implements CouponRepository {
  private getStoredCoupons(): DiscountCoupon[] {
    return getItem<DiscountCoupon[]>(STORAGE_KEYS.DISCOUNT_COUPONS, initialDiscountCoupons);
  }

  private setStoredCoupons(coupons: DiscountCoupon[]): void {
    setItem(STORAGE_KEYS.DISCOUNT_COUPONS, coupons);
  }

  async getCoupons(): Promise<DiscountCoupon[]> {
    return this.getStoredCoupons();
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

  async recordUsage(code: string): Promise<boolean> {
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
    return true;
  }

  async validateCoupon(code: string, planPrice: number): Promise<CouponValidationResult> {
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
        message: `O cupom "${clean}" está desativado no momento.`,
        coupon,
      };
    }

    // Checar limite de usos
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
