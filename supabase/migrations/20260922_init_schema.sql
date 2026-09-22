-- ==============================================================================
-- RAFAELA TRAINING APP - SCHEMA INICIAL POSTGRESQL (SUPABASE)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS
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

-- 2. STUDENTS
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

-- 3. EXERCISES
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

-- 4. WORKOUT_PLANS
CREATE TABLE IF NOT EXISTS public.workout_plans (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  trainer_id TEXT NOT NULL,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  days JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. WORKOUT_SESSIONS
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. WORKOUT_MODIFICATIONS
CREATE TABLE IF NOT EXISTS public.workout_modifications (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
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

-- 7. NUTRITION_PLANS
CREATE TABLE IF NOT EXISTS public.nutrition_plans (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  goal TEXT NOT NULL,
  daily_calories NUMERIC,
  disclaimer TEXT,
  meals JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ACTIVITY_LOGS
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

-- 9. NOTIFICATIONS
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

-- 10. STUDENT_METRICS
CREATE TABLE IF NOT EXISTS public.student_metrics (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
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

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_metrics ENABLE ROW LEVEL SECURITY;

-- POLICIES
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for users') THEN
    CREATE POLICY "Allow all for users" ON public.users FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for students') THEN
    CREATE POLICY "Allow all for students" ON public.students FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for exercises') THEN
    CREATE POLICY "Allow all for exercises" ON public.exercises FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for workout_plans') THEN
    CREATE POLICY "Allow all for workout_plans" ON public.workout_plans FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for workout_sessions') THEN
    CREATE POLICY "Allow all for workout_sessions" ON public.workout_sessions FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for workout_modifications') THEN
    CREATE POLICY "Allow all for workout_modifications" ON public.workout_modifications FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for nutrition_plans') THEN
    CREATE POLICY "Allow all for nutrition_plans" ON public.nutrition_plans FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for activity_logs') THEN
    CREATE POLICY "Allow all for activity_logs" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for notifications') THEN
    CREATE POLICY "Allow all for notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for student_metrics') THEN
    CREATE POLICY "Allow all for student_metrics" ON public.student_metrics FOR ALL USING (true) WITH CHECK (true);
  END IF;
END
$$;
