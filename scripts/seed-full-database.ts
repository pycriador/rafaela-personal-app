import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Import initial dataset
import { initialUsers } from '../src/data/users';
import { initialStudents } from '../src/data/students';
import { initialExercises } from '../src/data/exercises';
import { initialWorkoutPlans, initialSessions, initialModifications } from '../src/data/workouts';
import { initialWorkoutTemplates } from '../src/repositories/workoutTemplateRepository';
import { initialNutritionPlans } from '../src/data/nutrition';
import { initialActivities } from '../src/data/activities';
import { initialNotifications } from '../src/data/notifications';
import { initialForms } from '../src/data/anamnesis/forms';
import { initialFormVersions } from '../src/data/anamnesis/formVersions';
import { initialFormFields } from '../src/data/anamnesis/formFields';
import { initialFormApplications } from '../src/data/anamnesis/formApplications';
import { initialFormResponses } from '../src/data/anamnesis/formResponses';
import { initialConsents } from '../src/data/anamnesis/consents';
import { initialAIModels } from '../src/data/ai/aiModels';
import { initialAIConfig } from '../src/data/ai/aiDefaultConfig';
import { initialAIProposals } from '../src/data/ai/aiProposals';
import { initialAIRequests } from '../src/data/ai/aiRequests';

// Load .env
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const env: Record<string, string> = {};
envContent.split(/\r?\n/).forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) env[match[1]] = (match[2] || '').trim();
});

const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL || 'https://kcplxaltdqqruurefdnf.supabase.co';
const SUPABASE_KEY = env.SUPABASE_SECRET_KEY || env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERRO: SUPABASE_URL ou SUPABASE_KEY não encontrados no .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

async function upsertBatch(table: string, records: any[], chunkSize = 100): Promise<{ ok: boolean; count: number; error?: string }> {
  if (records.length === 0) return { ok: true, count: 0 };
  let total = 0;
  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    const { error } = await supabase.from(table).upsert(chunk, { onConflict: 'id' });
    if (error) {
      return { ok: false, count: total, error: `${error.code}: ${error.message}` };
    }
    total += chunk.length;
  }
  return { ok: true, count: total };
}

async function runSeed() {
  console.log('================================================================');
  console.log('--- SINCRONIZAÇÃO COMPLETA: DADOS INICIAIS -> SUPABASE POSTGRES ---');
  console.log('================================================================');
  console.log('Endpoint Supabase:', SUPABASE_URL);

  const results: Record<string, string> = {};

  // 1. USERS
  const mappedUsers = initialUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar_url: u.avatarUrl || null,
    phone: u.phone || null,
    student_profile_id: u.studentProfileId || null,
  }));
  const rUsers = await upsertBatch('users', mappedUsers);
  results['users'] = rUsers.ok ? `✓ ${rUsers.count} registros` : `✗ ${rUsers.error}`;

  // 2. STUDENTS
  const mappedStudents = initialStudents.map((s) => ({
    id: s.id,
    user_id: s.userId || s.id,
    name: s.name,
    birth_date: s.birthDate || null,
    gender: s.gender || null,
    phone: s.phone || null,
    email: s.email,
    goals: s.goals || [],
    available_days: s.availableDays || [],
    level: s.level || 'Iniciante',
    experience: s.experience || null,
    notes: s.notes || null,
    restrictions: s.restrictions || null,
    preferences: s.preferences || null,
    avatar_url: s.avatarUrl || null,
    status: s.status || 'Ativo',
    adherence_percentage: s.adherencePercentage ?? 90,
    created_at: s.createdAt || new Date().toISOString(),
    last_active: s.lastActive || new Date().toISOString(),
  }));
  const rStudents = await upsertBatch('students', mappedStudents);
  results['students'] = rStudents.ok ? `✓ ${rStudents.count} registros` : `✗ ${rStudents.error}`;

  // 3. EXERCISES (302)
  const mappedExercises = initialExercises.map((e) => ({
    id: e.id,
    name: e.name,
    category: e.category,
    type: e.type,
    muscle_groups: e.muscleGroups || [],
    equipment: e.equipment,
    difficulty: e.difficulty,
    instructions: e.instructions,
    video_url: e.videoUrl || null,
    image_url: e.imageUrl || null,
    alternatives: e.alternatives || [],
  }));
  const rExercises = await upsertBatch('exercises', mappedExercises, 50);
  results['exercises'] = rExercises.ok ? `✓ ${rExercises.count} registros` : `✗ ${rExercises.error}`;

  // 4. WORKOUT_PLANS
  const mappedPlans = initialWorkoutPlans.map((p) => ({
    id: p.id,
    student_id: p.studentId,
    trainer_id: p.trainerId || 'user-rafaela',
    name: p.name,
    active: p.active ?? true,
    days: p.days || [],
    created_at: p.createdAt || new Date().toISOString(),
    updated_at: p.updatedAt || new Date().toISOString(),
  }));
  const rPlans = await upsertBatch('workout_plans', mappedPlans);
  results['workout_plans'] = rPlans.ok ? `✓ ${rPlans.count} registros` : `✗ ${rPlans.error}`;

  // 5. WORKOUT_SESSIONS
  const mappedSessions = initialSessions.map((s) => ({
    id: s.id,
    student_id: s.studentId,
    workout_plan_id: s.workoutPlanId || null,
    workout_day_id: s.workoutDayId || null,
    workout_day_name: s.workoutDayName || null,
    date: s.date,
    status: s.status,
    start_time: s.startTime || null,
    end_time: s.endTime || null,
    duration_minutes: s.durationMinutes || null,
    rating: s.rating || null,
    rpe: s.rpe || null,
    energy_level: s.energyLevel || null,
    notes: s.notes || null,
    sets_completed: s.setsCompleted || [],
    skipped_exercises: s.skippedExercises || [],
    substituted_exercises: s.substitutedExercises || [],
    total_volume_kg: s.totalVolumeKg || 0,
    total_sets: s.totalSets || 0,
    total_exercises: s.totalExercises || 0,
    trainer_feedback: s.trainerFeedback || null,
    trainer_feedback_tag: s.trainerFeedbackTag || null,
    trainer_feedback_rating: s.trainerFeedbackRating || null,
    trainer_feedback_at: s.trainerFeedbackAt || null,
  }));
  const rSessions = await upsertBatch('workout_sessions', mappedSessions);
  results['workout_sessions'] = rSessions.ok ? `✓ ${rSessions.count} registros` : `✗ ${rSessions.error}`;

  // 6. WORKOUT_MODIFICATIONS
  const mappedMods = initialModifications.map((m) => ({
    id: m.id,
    student_id: m.studentId,
    student_name: m.studentName,
    session_id: m.sessionId || null,
    exercise_name: m.exerciseName,
    action: m.action,
    before_value: m.beforeValue || null,
    after_value: m.afterValue || null,
    difference: m.difference || null,
    reason: m.reason || null,
    timestamp: m.timestamp || new Date().toISOString(),
  }));
  const rMods = await upsertBatch('workout_modifications', mappedMods);
  results['workout_modifications'] = rMods.ok ? `✓ ${rMods.count} registros` : `✗ ${rMods.error}`;

  // 7. WORKOUT_TEMPLATES
  const mappedTemplates = initialWorkoutTemplates.map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    level: t.level,
    muscle_focus: t.muscleFocus,
    exercises: t.exercises || [],
  }));
  const rTemplates = await upsertBatch('workout_templates', mappedTemplates);
  results['workout_templates'] = rTemplates.ok ? `✓ ${rTemplates.count} registros` : `✗ ${rTemplates.error}`;

  // 8. NUTRITION_PLANS
  const mappedNutrition = initialNutritionPlans.map((n) => ({
    id: n.id,
    student_id: n.studentId,
    goal: n.goal,
    daily_calories: n.dailyCalories || null,
    disclaimer: n.disclaimer || null,
    meals: n.meals || [],
  }));
  const rNutrition = await upsertBatch('nutrition_plans', mappedNutrition);
  results['nutrition_plans'] = rNutrition.ok ? `✓ ${rNutrition.count} registros` : `✗ ${rNutrition.error}`;

  // 9. ACTIVITY_LOGS
  const mappedActivities = initialActivities.map((a) => ({
    id: a.id,
    actor_id: a.actorId,
    actor_name: a.actorName,
    actor_role: a.actorRole,
    action: a.action,
    description: a.description,
    student_id: a.studentId || null,
    icon_type: a.iconType || null,
    timestamp: a.timestamp || new Date().toISOString(),
  }));
  const rActivities = await upsertBatch('activity_logs', mappedActivities);
  results['activity_logs'] = rActivities.ok ? `✓ ${rActivities.count} registros` : `✗ ${rActivities.error}`;

  // 10. NOTIFICATIONS
  const mappedNotifs = initialNotifications.map((notif) => ({
    id: notif.id,
    recipient_id: notif.recipientId,
    recipient_role: notif.recipientRole,
    title: notif.title,
    message: notif.message,
    read: notif.read ?? false,
    type: notif.type || 'info',
    link: notif.link || null,
    timestamp: notif.timestamp || new Date().toISOString(),
  }));
  const rNotifs = await upsertBatch('notifications', mappedNotifs);
  results['notifications'] = rNotifs.ok ? `✓ ${rNotifs.count} registros` : `✗ ${rNotifs.error}`;

  // 11. FORMS & ANAMNESE
  const mappedForms = initialForms.map((f) => ({
    id: f.id,
    title: f.title,
    description: f.description || null,
    category: f.category,
    status: f.status,
    current_version_id: f.currentVersionId || null,
    created_at: f.createdAt || new Date().toISOString(),
    updated_at: f.updatedAt || new Date().toISOString(),
  }));
  const rForms = await upsertBatch('forms', mappedForms);
  results['forms'] = rForms.ok ? `✓ ${rForms.count} registros` : `✗ ${rForms.error}`;

  const mappedFormVersions = initialFormVersions.map((v) => ({
    id: v.id,
    form_id: v.formId,
    version_number: v.versionNumber,
    status: v.status,
    sections: v.sections || [],
    created_at: v.createdAt || new Date().toISOString(),
  }));
  const rFormVersions = await upsertBatch('form_versions', mappedFormVersions);
  results['form_versions'] = rFormVersions.ok ? `✓ ${rFormVersions.count} registros` : `✗ ${rFormVersions.error}`;

  const mappedFormFields = initialFormFields.map((fld) => ({
    id: fld.id,
    version_id: fld.versionId,
    label: fld.label,
    type: fld.type,
    required: fld.required ?? false,
    order_index: fld.orderIndex ?? 0,
    options: fld.options || null,
    validation: {
      description: fld.description || null,
      placeholder: fld.placeholder || null,
      sectionId: fld.sectionId,
      condition: fld.condition || null,
    },
  }));
  const rFormFields = await upsertBatch('form_fields', mappedFormFields);
  results['form_fields'] = rFormFields.ok ? `✓ ${rFormFields.count} registros` : `✗ ${rFormFields.error}`;

  const mappedApps = initialFormApplications.map((app) => ({
    id: app.id,
    form_id: app.formId,
    form_version_id: app.formVersionId,
    student_id: app.studentId,
    status: app.status,
    applied_at: app.assignedAt || new Date().toISOString(),
    completed_at: app.status === 'completed' ? new Date().toISOString() : null,
    allow_progress_save: true,
    notes: app.notes || app.message || null,
  }));
  const rApps = await upsertBatch('form_applications', mappedApps);
  results['form_applications'] = rApps.ok ? `✓ ${rApps.count} registros` : `✗ ${rApps.error}`;

  const mappedResponses = initialFormResponses.map((resp) => ({
    id: resp.id,
    application_id: resp.applicationId,
    form_id: resp.formId,
    form_version_id: resp.formVersionId,
    student_id: resp.studentId,
    answers: resp.answers || [],
    submitted_at: resp.submittedAt || new Date().toISOString(),
    is_draft: resp.status === 'draft',
    review_status: resp.status === 'reviewed' ? 'reviewed' : 'pending',
    reviewer_notes: null,
  }));
  const rResponses = await upsertBatch('form_responses', mappedResponses);
  results['form_responses'] = rResponses.ok ? `✓ ${rResponses.count} registros` : `✗ ${rResponses.error}`;

  const mappedConsents = initialConsents.map((c) => ({
    id: c.id,
    student_id: c.studentId,
    form_id: c.responseId,
    accepted: c.accepted ?? true,
    terms_text: c.termsVersion || null,
    timestamp: c.acceptedAt || new Date().toISOString(),
    ip_address: null,
  }));
  const rConsents = await upsertBatch('consents', mappedConsents);
  results['consents'] = rConsents.ok ? `✓ ${rConsents.count} registros` : `✗ ${rConsents.error}`;

  // 12. AI COPILOT
  const mappedAiConfig = [
    {
      id: 'default-ai-config',
      active_model: initialAIConfig.selectedModel,
      temperature: initialAIConfig.temperature,
      max_tokens: initialAIConfig.maxOutputTokens,
      system_instructions: initialAIConfig.systemPrompt || null,
      api_mode: initialAIConfig.mode || 'mock',
      updated_at: initialAIConfig.updatedAt || new Date().toISOString(),
    },
  ];
  const rAiConfig = await upsertBatch('ai_config', mappedAiConfig);
  results['ai_config'] = rAiConfig.ok ? `✓ ${rAiConfig.count} registros` : `✗ ${rAiConfig.error}`;

  const mappedAiModels = initialAIModels.map((m) => ({
    id: m.id,
    name: m.name,
    provider: m.provider,
    context_window: m.inputTokenLimit || 1048576,
    is_active: m.status !== 'indisponivel',
    pricing: {},
  }));
  const rAiModels = await upsertBatch('ai_models', mappedAiModels);
  results['ai_models'] = rAiModels.ok ? `✓ ${rAiModels.count} registros` : `✗ ${rAiModels.error}`;

  const mappedAiProposals = initialAIProposals.map((p) => ({
    id: p.id,
    student_id: p.studentId,
    title: p.workoutName || 'Treino Sugerido',
    status: p.status,
    data: p,
    clinical_notes: p.warnings?.join('; ') || null,
    created_at: p.createdAt || new Date().toISOString(),
    updated_at: p.reviewedAt || p.createdAt || new Date().toISOString(),
  }));
  const rAiProposals = await upsertBatch('ai_proposals', mappedAiProposals);
  results['ai_proposals'] = rAiProposals.ok ? `✓ ${rAiProposals.count} registros` : `✗ ${rAiProposals.error}`;

  const mappedAiRequests = initialAIRequests.map((r) => ({
    id: r.id,
    student_id: r.studentId || null,
    task_type: r.task,
    model: r.model,
    prompt_tokens: r.tokenUsage?.promptTokens || 0,
    completion_tokens: r.tokenUsage?.completionTokens || 0,
    latency_ms: r.latencyMs || 0,
    status: r.status || 'success',
    error_message: r.error || null,
    created_at: r.createdAt || new Date().toISOString(),
  }));
  const rAiRequests = await upsertBatch('ai_requests', mappedAiRequests);
  results['ai_requests'] = rAiRequests.ok ? `✓ ${rAiRequests.count} registros` : `✗ ${rAiRequests.error}`;

  console.log('\n--- RESUMO DA MIGRAÇÃO PARA SUPABASE ---');
  let failures = 0;
  for (const [table, status] of Object.entries(results)) {
    console.log(`  ${table.padEnd(25)}: ${status}`);
    if (status.startsWith('✗')) failures++;
  }

  if (failures > 0) {
    console.log(`\n[AVISO] ${failures} tabela(s) ainda não foram criadas no Supabase.`);
    console.log('Execute o script SQL "supabase/migrations/20260923_full_database_schema.sql" no SQL Editor do Supabase.');
  } else {
    console.log('\n[SUCESSO] Todas as tabelas foram sincronizadas perfeitamente com o Supabase!');
  }
}

runSeed().catch((err) => {
  console.error('Erro fatal durante a migração:', err);
  process.exit(1);
});
