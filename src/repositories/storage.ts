import { initialUsers } from '../data/users';
import { initialStudents } from '../data/students';
import { initialExercises } from '../data/exercises';
import { initialWorkoutPlans, initialSessions, initialModifications } from '../data/workouts';
import { initialNutritionPlans } from '../data/nutrition';
import { initialActivities } from '../data/activities';
import { initialNotifications } from '../data/notifications';

const STORAGE_KEYS = {
  USERS: 'rafaela_app_users_v1',
  STUDENTS: 'rafaela_app_students_v1',
  EXERCISES: 'rafaela_app_exercises_v3', // bumped to v3 for cartoon vector illustrations
  WORKOUT_PLANS: 'rafaela_app_workout_plans_v1',
  SESSIONS: 'rafaela_app_sessions_v1',
  MODIFICATIONS: 'rafaela_app_modifications_v1',
  NUTRITION: 'rafaela_app_nutrition_v1',
  ACTIVITIES: 'rafaela_app_activities_v1',
  NOTIFICATIONS: 'rafaela_app_notifications_v1',
  CURRENT_USER: 'rafaela_app_current_user_v1',
  THEME: 'rafaela_app_theme_v1',
  CUSTOM_MEDIA: 'rafaela_app_custom_media_v1',
  STUDENT_MESSAGES: 'rafaela_app_student_messages_v1',
  WORKOUT_TEMPLATES: 'rafaela_app_workout_templates_v1',
};

// Seed storage if empty
export function initStorage() {
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
}

export function getItem<T>(key: string, fallback: T): T {
  try {
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
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

export { STORAGE_KEYS };
