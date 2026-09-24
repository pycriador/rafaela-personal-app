import { MembershipPlan } from '../types';
import { initialMembershipPlans } from '../data/membershipPlans';
import { getItem, setItem, STORAGE_KEYS } from './storage';

export interface IPlanRepository {
  getPlans(): Promise<MembershipPlan[]>;
  getActivePlans(): Promise<MembershipPlan[]>;
  getLandingPagePlans(): Promise<MembershipPlan[]>;
  getPlanById(id: string): Promise<MembershipPlan | null>;
  createPlan(plan: Omit<MembershipPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<MembershipPlan>;
  updatePlan(id: string, updates: Partial<MembershipPlan>): Promise<MembershipPlan | null>;
  deletePlan(id: string): Promise<boolean>;
  toggleLandingPage(id: string, show: boolean): Promise<MembershipPlan | null>;
  toggleActive(id: string, active: boolean): Promise<MembershipPlan | null>;
}

export class LocalPlanRepository implements IPlanRepository {
  async getPlans(): Promise<MembershipPlan[]> {
    const list = getItem<MembershipPlan[]>(STORAGE_KEYS.MEMBERSHIP_PLANS, initialMembershipPlans);
    return list;
  }

  async getActivePlans(): Promise<MembershipPlan[]> {
    const list = await this.getPlans();
    return list.filter((p) => p.active);
  }

  async getLandingPagePlans(): Promise<MembershipPlan[]> {
    const list = await this.getActivePlans();
    return list.filter((p) => p.showOnLandingPage);
  }

  async getPlanById(id: string): Promise<MembershipPlan | null> {
    const list = await this.getPlans();
    return list.find((p) => p.id === id) || null;
  }

  async createPlan(planData: Omit<MembershipPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<MembershipPlan> {
    const list = await this.getPlans();
    const now = new Date().toISOString();
    const newPlan: MembershipPlan = {
      ...planData,
      id: `plan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newPlan, ...list];
    setItem(STORAGE_KEYS.MEMBERSHIP_PLANS, updated);
    return newPlan;
  }

  async updatePlan(id: string, updates: Partial<MembershipPlan>): Promise<MembershipPlan | null> {
    const list = await this.getPlans();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const updatedPlan: MembershipPlan = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updatedPlan;
    setItem(STORAGE_KEYS.MEMBERSHIP_PLANS, list);
    return updatedPlan;
  }

  async deletePlan(id: string): Promise<boolean> {
    const list = await this.getPlans();
    const filtered = list.filter((p) => p.id !== id);
    if (filtered.length === list.length) return false;

    setItem(STORAGE_KEYS.MEMBERSHIP_PLANS, filtered);
    return true;
  }

  async toggleLandingPage(id: string, show: boolean): Promise<MembershipPlan | null> {
    return this.updatePlan(id, { showOnLandingPage: show });
  }

  async toggleActive(id: string, active: boolean): Promise<MembershipPlan | null> {
    return this.updatePlan(id, { active });
  }
}

export const planRepository = new LocalPlanRepository();
