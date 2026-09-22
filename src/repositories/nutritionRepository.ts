import { NutritionPlan, Meal, FoodItem } from '../types';
import { getItem, setItem, STORAGE_KEYS } from './storage';
import { initialNutritionPlans } from '../data/nutrition';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface INutritionRepository {
  getAll(): Promise<NutritionPlan[]>;
  getByStudentId(studentId: string): Promise<NutritionPlan | null>;
  save(plan: NutritionPlan): Promise<NutritionPlan>;
  addMeal(studentId: string, meal: Omit<Meal, 'id'>): Promise<NutritionPlan>;
  updateMeal(studentId: string, mealId: string, updates: Partial<Meal>): Promise<NutritionPlan>;
  deleteMeal(studentId: string, mealId: string): Promise<NutritionPlan>;
  addFoodItem(studentId: string, mealId: string, item: Omit<FoodItem, 'id'>): Promise<NutritionPlan>;
  updateFoodItem(studentId: string, mealId: string, itemId: string, updates: Partial<FoodItem>): Promise<NutritionPlan>;
  deleteFoodItem(studentId: string, mealId: string, itemId: string): Promise<NutritionPlan>;
}

function mapFromDb(row: any): NutritionPlan {
  return {
    id: row.id,
    studentId: row.student_id || row.studentId,
    goal: row.goal,
    dailyCalories: row.daily_calories ? Number(row.daily_calories) : undefined,
    disclaimer: row.disclaimer,
    meals: Array.isArray(row.meals) ? row.meals : JSON.parse(row.meals || '[]'),
    updatedAt: row.updated_at || row.updatedAt,
  };
}

function mapToDb(plan: NutritionPlan): any {
  return {
    id: plan.id,
    student_id: plan.studentId,
    goal: plan.goal,
    daily_calories: plan.dailyCalories,
    disclaimer: plan.disclaimer,
    meals: plan.meals,
    updated_at: new Date().toISOString(),
  };
}

export class SupabaseNutritionRepository implements INutritionRepository {
  async getAll(): Promise<NutritionPlan[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('nutrition_plans').select('*');
        if (!error && data && data.length > 0) {
          const plans = data.map(mapFromDb);
          setItem(STORAGE_KEYS.NUTRITION, plans);
          return plans;
        }
      } catch (err) {
        // fallback
      }
    }
    return getItem<NutritionPlan[]>(STORAGE_KEYS.NUTRITION, initialNutritionPlans);
  }

  async getByStudentId(studentId: string): Promise<NutritionPlan | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('nutrition_plans')
          .select('*')
          .eq('student_id', studentId)
          .single();
        if (!error && data) {
          return mapFromDb(data);
        }
      } catch (err) {
        // fallback
      }
    }
    const plans = await this.getAll();
    return plans.find((p) => p.studentId === studentId) || null;
  }

  async save(plan: NutritionPlan): Promise<NutritionPlan> {
    const updatedPlan: NutritionPlan = {
      ...plan,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('nutrition_plans').upsert(mapToDb(updatedPlan));
      } catch (err) {
        console.error('Supabase save nutrition error:', err);
      }
    }

    const plans = await this.getAll();
    const index = plans.findIndex((p) => p.studentId === plan.studentId);
    if (index === -1) {
      plans.push(updatedPlan);
    } else {
      plans[index] = updatedPlan;
    }
    setItem(STORAGE_KEYS.NUTRITION, plans);
    return updatedPlan;
  }

  async addMeal(studentId: string, mealData: Omit<Meal, 'id'>): Promise<NutritionPlan> {
    let plan = await this.getByStudentId(studentId);
    if (!plan) {
      plan = {
        id: `nutri-${studentId}`,
        studentId,
        goal: 'Plano Nutricional Personalizado',
        dailyCalories: 2000,
        disclaimer: 'Orientações individualizadas devem ser prescritas por nutricionista habilitado.',
        meals: [],
        updatedAt: new Date().toISOString().split('T')[0],
      };
    }

    const newMeal: Meal = {
      ...mealData,
      id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      items: mealData.items || [],
    };

    plan.meals.push(newMeal);
    return this.save(plan);
  }

  async updateMeal(studentId: string, mealId: string, updates: Partial<Meal>): Promise<NutritionPlan> {
    const plan = await this.getByStudentId(studentId);
    if (!plan) throw new Error('Plano nutricional não encontrado');

    const mealIdx = plan.meals.findIndex((m) => m.id === mealId);
    if (mealIdx === -1) throw new Error('Refeição não encontrada');

    plan.meals[mealIdx] = { ...plan.meals[mealIdx], ...updates };
    return this.save(plan);
  }

  async deleteMeal(studentId: string, mealId: string): Promise<NutritionPlan> {
    const plan = await this.getByStudentId(studentId);
    if (!plan) throw new Error('Plano nutricional não encontrado');

    plan.meals = plan.meals.filter((m) => m.id !== mealId);
    return this.save(plan);
  }

  async addFoodItem(studentId: string, mealId: string, itemData: Omit<FoodItem, 'id'>): Promise<NutritionPlan> {
    const plan = await this.getByStudentId(studentId);
    if (!plan) throw new Error('Plano nutricional não encontrado');

    const meal = plan.meals.find((m) => m.id === mealId);
    if (!meal) throw new Error('Refeição não encontrada');

    const newItem: FoodItem = {
      ...itemData,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      substitutions: itemData.substitutions || [],
    };

    meal.items.push(newItem);
    return this.save(plan);
  }

  async updateFoodItem(
    studentId: string,
    mealId: string,
    itemId: string,
    updates: Partial<FoodItem>
  ): Promise<NutritionPlan> {
    const plan = await this.getByStudentId(studentId);
    if (!plan) throw new Error('Plano nutricional não encontrado');

    const meal = plan.meals.find((m) => m.id === mealId);
    if (!meal) throw new Error('Refeição não encontrada');

    const itemIdx = meal.items.findIndex((it) => it.id === itemId);
    if (itemIdx === -1) throw new Error('Alimento não encontrado');

    meal.items[itemIdx] = { ...meal.items[itemIdx], ...updates };
    return this.save(plan);
  }

  async deleteFoodItem(studentId: string, mealId: string, itemId: string): Promise<NutritionPlan> {
    const plan = await this.getByStudentId(studentId);
    if (!plan) throw new Error('Plano nutricional não encontrado');

    const meal = plan.meals.find((m) => m.id === mealId);
    if (!meal) throw new Error('Refeição não encontrada');

    meal.items = meal.items.filter((it) => it.id !== itemId);
    return this.save(plan);
  }
}

export const nutritionRepository = new SupabaseNutritionRepository();

