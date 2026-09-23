-- ==============================================================================
-- RAFAELA TRAINING APP - SCHEMA COMPLETO POSTGRESQL (SUPABASE)
-- Data: 2026-09-23
-- Todas as 23 tabelas com RLS habilitado e políticas públicas para a aplicação
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS (Personal e Alunos)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('personal', 'student')),
  avatar_url TEXT,
  phone TEXT,
  student_profile_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STUDENTS (Perfis Clínicos e Cadastrais dos Alunos)
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  birth_date TEXT,
  gender TEXT,
  phone TEXT,
  email TEXT NOT NULL,
  goals JSONB NOT NULL DEFAULT '[]'::jsonb,
  available_days JSONB NOT NULL DEFAULT '[]'::jsonb,
  level TEXT NOT NULL DEFAULT 'Iniciante',
  experience TEXT,
  notes TEXT,
  restrictions TEXT,
  preferences TEXT,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo', 'Atenção', 'Pausado', 'Arquivado')),
  adherence_percentage NUMERIC DEFAULT 90,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EXERCISES (Biblioteca Oficial com 302 Exercícios)
CREATE TABLE IF NOT EXISTS public.exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  muscle_groups JSONB NOT NULL DEFAULT '[]'::jsonb,
  equipment TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  instructions TEXT NOT NULL,
  video_url TEXT,
  image_url TEXT,
  alternatives JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. WORKOUT_PLANS (Planos e Fichas de Treino dos Alunos)
CREATE TABLE IF NOT EXISTS public.workout_plans (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  trainer_id TEXT NOT NULL DEFAULT 'user-rafaela',
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  days JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. WORKOUT_SESSIONS (Histórico de Execuções e Avaliações de Treino)
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  workout_plan_id TEXT,
  workout_day_id TEXT,
  workout_day_name TEXT,
  date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'incomplete', 'skipped', 'in_progress')),
  start_time TEXT,
  end_time TEXT,
  duration_minutes NUMERIC,
  rating NUMERIC,
  rpe NUMERIC,
  energy_level NUMERIC,
  notes TEXT,
  sets_completed JSONB NOT NULL DEFAULT '[]'::jsonb,
  skipped_exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  substituted_exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_volume_kg NUMERIC DEFAULT 0,
  total_sets NUMERIC DEFAULT 0,
  total_exercises NUMERIC DEFAULT 0,
  trainer_feedback TEXT,
  trainer_feedback_tag TEXT,
  trainer_feedback_rating NUMERIC,
  trainer_feedback_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. WORKOUT_MODIFICATIONS (Auditoria de Alterações e Substituições)
CREATE TABLE IF NOT EXISTS public.workout_modifications (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  session_id TEXT,
  exercise_name TEXT NOT NULL,
  action TEXT NOT NULL,
  before_value JSONB,
  after_value JSONB,
  difference TEXT,
  reason TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 7. WORKOUT_TEMPLATES (Séries Prontas / Modelos de Treino)
CREATE TABLE IF NOT EXISTS public.workout_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT NOT NULL,
  muscle_focus TEXT NOT NULL,
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. NUTRITION_PLANS (Diretrizes Nutricionais e Cardápios)
CREATE TABLE IF NOT EXISTS public.nutrition_plans (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  goal TEXT NOT NULL,
  daily_calories NUMERIC,
  disclaimer TEXT,
  meals JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ACTIVITY_LOGS (Linha do Tempo de Atividades da Personal e Alunos)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  student_id TEXT,
  icon_type TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 10. NOTIFICATIONS (Central de Notificações do Sistema)
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  recipient_id TEXT NOT NULL,
  recipient_role TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  type TEXT NOT NULL DEFAULT 'info',
  link TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 11. STUDENT_MESSAGES (Chat em Tempo Real Personal ↔ Aluno)
CREATE TABLE IF NOT EXISTS public.student_messages (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('personal', 'student')),
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  metadata JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. STUDENT_METRICS (Acompanhamento Antropométrico e Medidas)
CREATE TABLE IF NOT EXISTS public.student_metrics (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  date TEXT NOT NULL,
  weight_kg NUMERIC NOT NULL,
  body_fat_percentage NUMERIC,
  chest_cm NUMERIC,
  waist_cm NUMERIC,
  arms_cm NUMERIC,
  legs_cm NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. FORMS (Formulários de Anamnese)
CREATE TABLE IF NOT EXISTS public.forms (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  current_version_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. FORM_VERSIONS (Versões Históricas dos Formulários)
CREATE TABLE IF NOT EXISTS public.form_versions (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL,
  version_number NUMERIC NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft',
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. FORM_FIELDS (Campos e Perguntas de Formulários)
CREATE TABLE IF NOT EXISTS public.form_fields (
  id TEXT PRIMARY KEY,
  version_id TEXT NOT NULL,
  label TEXT NOT NULL,
  type TEXT NOT NULL,
  required BOOLEAN DEFAULT FALSE,
  order_index NUMERIC DEFAULT 0,
  options JSONB,
  validation JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. FORM_APPLICATIONS (Aplicações de Formulário para Alunos)
CREATE TABLE IF NOT EXISTS public.form_applications (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL,
  form_version_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  allow_progress_save BOOLEAN DEFAULT TRUE,
  notes TEXT
);

-- 17. FORM_RESPONSES (Respostas dos Alunos às Anamneses)
CREATE TABLE IF NOT EXISTS public.form_responses (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  form_id TEXT NOT NULL,
  form_version_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  is_draft BOOLEAN DEFAULT FALSE,
  review_status TEXT NOT NULL DEFAULT 'pending',
  reviewer_notes TEXT
);

-- 18. CONSENTS (Termos e Consentimento de Anamnese)
CREATE TABLE IF NOT EXISTS public.consents (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  form_id TEXT NOT NULL,
  accepted BOOLEAN DEFAULT TRUE,
  terms_text TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT
);

-- 19. AI_CONFIG (Configurações Gerais do AI Copilot)
CREATE TABLE IF NOT EXISTS public.ai_config (
  id TEXT PRIMARY KEY,
  active_model TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
  temperature NUMERIC DEFAULT 0.35,
  max_tokens NUMERIC DEFAULT 4000,
  system_instructions TEXT,
  api_mode TEXT NOT NULL DEFAULT 'mock',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. AI_MODELS (Modelos Disponíveis para Inferência)
CREATE TABLE IF NOT EXISTS public.ai_models (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'google',
  context_window NUMERIC DEFAULT 1048576,
  is_active BOOLEAN DEFAULT TRUE,
  pricing JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 21. AI_PROPOSALS (Propostas de Treino e Estrutura Geradas pela IA)
CREATE TABLE IF NOT EXISTS public.ai_proposals (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'reviewed', 'modified', 'approved', 'rejected')),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  clinical_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. AI_REQUESTS (Auditoria, Métricas e Telemetria de Chamadas de IA)
CREATE TABLE IF NOT EXISTS public.ai_requests (
  id TEXT PRIMARY KEY,
  student_id TEXT,
  task_type TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_tokens NUMERIC DEFAULT 0,
  completion_tokens NUMERIC DEFAULT 0,
  latency_ms NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. AI_STUDENT_CONSENTS (Termos de Consentimento de IA - LGPD)
CREATE TABLE IF NOT EXISTS public.ai_student_consents (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL UNIQUE,
  allowed BOOLEAN DEFAULT TRUE,
  consented BOOLEAN DEFAULT TRUE,
  updated_by TEXT DEFAULT 'user-rafaela',
  terms_version TEXT DEFAULT '1.0',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- HABILITAR ROW LEVEL SECURITY (RLS) EM TODAS AS TABELAS
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_student_consents ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- POLÍTICAS DE ACESSO UNIVERSAL PARA A APLICAÇÃO (ANON & AUTHENTICATED)
-- ==============================================================================
DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'users', 'students', 'exercises', 'workout_plans', 'workout_sessions',
    'workout_modifications', 'workout_templates', 'nutrition_plans', 'activity_logs',
    'notifications', 'student_messages', 'student_metrics', 'forms', 'form_versions',
    'form_fields', 'form_applications', 'form_responses', 'consents', 'ai_config',
    'ai_models', 'ai_proposals', 'ai_requests', 'ai_student_consents'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Allow all for %s" ON public.%I;', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow all for %s" ON public.%I FOR ALL USING (true) WITH CHECK (true);', tbl, tbl);
  END LOOP;
END
$$;

-- Notificar recarga de schema cache do PostgREST
NOTIFY pgrst, 'reload schema';
