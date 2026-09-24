import { initialUsers } from '../data/users';
import { initialStudents } from '../data/students';
import { initialExercises } from '../data/exercises';
import { initialWorkoutPlans, initialSessions, initialModifications } from '../data/workouts';
import { initialNutritionPlans } from '../data/nutrition';
import { initialActivities } from '../data/activities';
import { initialNotifications } from '../data/notifications';
import { initialForms } from '../data/anamnesis/forms';
import { initialFormVersions } from '../data/anamnesis/formVersions';
import { initialFormFields } from '../data/anamnesis/formFields';
import { initialFormApplications } from '../data/anamnesis/formApplications';
import { initialFormResponses } from '../data/anamnesis/formResponses';
import { initialConsents } from '../data/anamnesis/consents';
import { initialAIModels } from '../data/ai/aiModels';
import { initialAIConfig } from '../data/ai/aiDefaultConfig';
import { initialAIProposals } from '../data/ai/aiProposals';
import { initialAIRequests } from '../data/ai/aiRequests';
import { initialRankingGroups } from '../data/rankingGroups';
import { initialMembershipPlans } from '../data/membershipPlans';
import { initialDiscountCoupons } from '../data/discountCoupons';

export const STORAGE_KEYS = {
  USERS: 'rafaela_app_users_v2',
  STUDENTS: 'rafaela_app_students_v3',
  EXERCISES: 'rafaela_app_exercises_v3', // bumped to v3 for cartoon vector illustrations
  WORKOUT_PLANS: 'rafaela_app_workout_plans_v2',
  SESSIONS: 'rafaela_app_sessions_v2',
  MODIFICATIONS: 'rafaela_app_modifications_v2',
  NUTRITION: 'rafaela_app_nutrition_v2',
  ACTIVITIES: 'rafaela_app_activities_v2',
  NOTIFICATIONS: 'rafaela_app_notifications_v2',
  CURRENT_USER: 'rafaela_app_current_user_v1',
  THEME: 'rafaela_app_theme_v1',
  CUSTOM_MEDIA: 'rafaela_app_custom_media_v1',
  STUDENT_MESSAGES: 'rafaela_app_student_messages_v1',
  WORKOUT_TEMPLATES: 'rafaela_app_workout_templates_v1',
  FORMS: 'rafaela_app_forms_v1',
  FORM_VERSIONS: 'rafaela_app_form_versions_v1',
  FORM_FIELDS: 'rafaela_app_form_fields_v1',
  FORM_APPLICATIONS: 'rafaela_app_form_applications_v2',
  FORM_RESPONSES: 'rafaela_app_form_responses_v2',
  CONSENTS: 'rafaela_app_consents_v2',
  AI_CONFIG: 'rafaela_app_ai_config_v1',
  AI_MODELS: 'rafaela_app_ai_models_v1',
  AI_PROPOSALS: 'rafaela_app_ai_proposals_v2',
  AI_REQUESTS: 'rafaela_app_ai_requests_v2',
  AI_STUDENT_CONSENTS: 'rafaela_app_ai_student_consents_v1',
  RANKING_GROUPS: 'rafaela_app_ranking_groups_v2',
  MEMBERSHIP_PLANS: 'rafaela_app_membership_plans_v1',
  DISCOUNT_COUPONS: 'rafaela_app_discount_coupons_v1',
};

/**
 * Verifica se a aplicação está em modo simulação ("Testar como Aluno")
 */
export function isSimulationModeActive(): boolean {
  try {
    return (
      typeof sessionStorage !== 'undefined' &&
      sessionStorage.getItem('rafaela_simulation_mode') === 'true'
    );
  } catch {
    return false;
  }
}

/**
 * Retorna o ID do aluno atualmente simulado
 */
export function getSimulatingStudentId(): string | null {
  try {
    return typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem('rafaela_simulation_student_id')
      : null;
  } catch {
    return null;
  }
}

/**
 * Ativa ou encerra o modo de simulação, limpando o sandbox temporário ao desativar
 */
export function setSimulationMode(active: boolean, studentId?: string): void {
  try {
    if (typeof sessionStorage === 'undefined') return;

    if (active) {
      sessionStorage.setItem('rafaela_simulation_mode', 'true');
      if (studentId) {
        sessionStorage.setItem('rafaela_simulation_student_id', studentId);
      }
    } else {
      sessionStorage.removeItem('rafaela_simulation_mode');
      sessionStorage.removeItem('rafaela_simulation_student_id');
      sessionStorage.removeItem('rafaela_sim_user');

      // Limpa todas as chaves do sandbox de simulação
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith('sim_sandbox_')) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));
    }
  } catch (err) {
    console.error('Erro ao alternar modo de simulação:', err);
  }
}

// Seed storage if empty
export function initStorage() {
  if (typeof localStorage === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(initialStudents));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EXERCISES)) {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(initialExercises));
  }
  if (!localStorage.getItem(STORAGE_KEYS.WORKOUT_PLANS)) {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_PLANS, JSON.stringify(initialWorkoutPlans));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(initialSessions));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MODIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.MODIFICATIONS, JSON.stringify(initialModifications));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NUTRITION)) {
    localStorage.setItem(STORAGE_KEYS.NUTRITION, JSON.stringify(initialNutritionPlans));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(initialActivities));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifications));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FORMS)) {
    localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(initialForms));
  } else {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORMS) || '[]');
      const ids = new Set(stored.map((f: any) => f.id));
      const missing = initialForms.filter((f) => !ids.has(f.id));
      if (missing.length > 0) {
        localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify([...stored, ...missing]));
      }
    } catch {
      localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(initialForms));
    }
  }
  if (!localStorage.getItem(STORAGE_KEYS.FORM_VERSIONS)) {
    localStorage.setItem(STORAGE_KEYS.FORM_VERSIONS, JSON.stringify(initialFormVersions));
  } else {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORM_VERSIONS) || '[]');
      const ids = new Set(stored.map((v: any) => v.id));
      const missing = initialFormVersions.filter((v) => !ids.has(v.id));
      if (missing.length > 0) {
        localStorage.setItem(STORAGE_KEYS.FORM_VERSIONS, JSON.stringify([...stored, ...missing]));
      }
    } catch {
      localStorage.setItem(STORAGE_KEYS.FORM_VERSIONS, JSON.stringify(initialFormVersions));
    }
  }
  if (!localStorage.getItem(STORAGE_KEYS.FORM_FIELDS)) {
    localStorage.setItem(STORAGE_KEYS.FORM_FIELDS, JSON.stringify(initialFormFields));
  } else {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORM_FIELDS) || '[]');
      const ids = new Set(stored.map((f: any) => f.id));
      const missing = initialFormFields.filter((f) => !ids.has(f.id));
      if (missing.length > 0) {
        localStorage.setItem(STORAGE_KEYS.FORM_FIELDS, JSON.stringify([...stored, ...missing]));
      }
    } catch {
      localStorage.setItem(STORAGE_KEYS.FORM_FIELDS, JSON.stringify(initialFormFields));
    }
  }
  if (!localStorage.getItem(STORAGE_KEYS.FORM_APPLICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.FORM_APPLICATIONS, JSON.stringify(initialFormApplications));
  } else {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORM_APPLICATIONS) || '[]');
      const ids = new Set(stored.map((a: any) => a.id));
      const missing = initialFormApplications.filter((a) => !ids.has(a.id));
      if (missing.length > 0) {
        localStorage.setItem(STORAGE_KEYS.FORM_APPLICATIONS, JSON.stringify([...stored, ...missing]));
      }
    } catch {
      localStorage.setItem(STORAGE_KEYS.FORM_APPLICATIONS, JSON.stringify(initialFormApplications));
    }
  }
  if (!localStorage.getItem(STORAGE_KEYS.FORM_RESPONSES)) {
    localStorage.setItem(STORAGE_KEYS.FORM_RESPONSES, JSON.stringify(initialFormResponses));
  } else {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORM_RESPONSES) || '[]');
      const ids = new Set(stored.map((r: any) => r.id));
      const missing = initialFormResponses.filter((r) => !ids.has(r.id));
      if (missing.length > 0) {
        localStorage.setItem(STORAGE_KEYS.FORM_RESPONSES, JSON.stringify([...stored, ...missing]));
      }
    } catch {
      localStorage.setItem(STORAGE_KEYS.FORM_RESPONSES, JSON.stringify(initialFormResponses));
    }
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONSENTS)) {
    localStorage.setItem(STORAGE_KEYS.CONSENTS, JSON.stringify(initialConsents));
  } else {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONSENTS) || '[]');
      const ids = new Set(stored.map((c: any) => c.id));
      const missing = initialConsents.filter((c) => !ids.has(c.id));
      if (missing.length > 0) {
        localStorage.setItem(STORAGE_KEYS.CONSENTS, JSON.stringify([...stored, ...missing]));
      }
    } catch {
      localStorage.setItem(STORAGE_KEYS.CONSENTS, JSON.stringify(initialConsents));
    }
  }
  if (!localStorage.getItem(STORAGE_KEYS.AI_CONFIG)) {
    localStorage.setItem(STORAGE_KEYS.AI_CONFIG, JSON.stringify(initialAIConfig));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AI_MODELS)) {
    localStorage.setItem(STORAGE_KEYS.AI_MODELS, JSON.stringify(initialAIModels));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AI_PROPOSALS)) {
    localStorage.setItem(STORAGE_KEYS.AI_PROPOSALS, JSON.stringify(initialAIProposals));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AI_REQUESTS)) {
    localStorage.setItem(STORAGE_KEYS.AI_REQUESTS, JSON.stringify(initialAIRequests));
  }
  if (!localStorage.getItem(STORAGE_KEYS.RANKING_GROUPS)) {
    localStorage.setItem(STORAGE_KEYS.RANKING_GROUPS, JSON.stringify(initialRankingGroups));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MEMBERSHIP_PLANS)) {
    localStorage.setItem(STORAGE_KEYS.MEMBERSHIP_PLANS, JSON.stringify(initialMembershipPlans));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DISCOUNT_COUPONS)) {
    localStorage.setItem(STORAGE_KEYS.DISCOUNT_COUPONS, JSON.stringify(initialDiscountCoupons));
  }
}

export function getItem<T>(key: string, fallback: T): T {
  try {
    // Se o modo simulação estiver ativo, verifica primeiro se há alteração no sandbox temporário
    // EXCEÇÃO: mensagens de chat (STUDENT_MESSAGES) são sempre mantidas no localStorage real
    // para permitir comunicação contínua e testes fiéis entre Personal e Aluno.
    if (
      isSimulationModeActive() &&
      typeof sessionStorage !== 'undefined' &&
      key !== STORAGE_KEYS.STUDENT_MESSAGES
    ) {
      const sandboxed = sessionStorage.getItem(`sim_sandbox_${key}`);
      if (sandboxed !== null) {
        return JSON.parse(sandboxed);
      }
    }

    if (typeof localStorage === 'undefined') return fallback;
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    // Se estiver em modo de simulação, grava SOMENTE no sandbox temporário de sessão!
    // EXCEÇÃO: mensagens de chat (STUDENT_MESSAGES) são sempre persistidas no localStorage real.
    if (
      isSimulationModeActive() &&
      typeof sessionStorage !== 'undefined' &&
      key !== STORAGE_KEYS.STUDENT_MESSAGES
    ) {
      sessionStorage.setItem(`sim_sandbox_${key}`, JSON.stringify(value));
      return;
    }

    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}
