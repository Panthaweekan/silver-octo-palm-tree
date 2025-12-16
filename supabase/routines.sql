-- =====================================================
-- ROUTINES TABLE
-- Reusable templates for workouts and meals
-- =====================================================

-- 1. WORKOUT ROUTINES

CREATE TABLE IF NOT EXISTS public.workout_routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cardio', 'strength', 'hiit', 'yoga', 'sports', 'walking', 'cycling', 'swimming', 'other')),
  duration_minutes INTEGER CHECK (duration_minutes > 0),
  distance_km NUMERIC(6,2),
  calories_burned INTEGER CHECK (calories_burned >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS workout_routines_user_id_idx ON public.workout_routines(user_id);

-- RLS
ALTER TABLE public.workout_routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workout routines"
  ON public.workout_routines FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own workout routines"
  ON public.workout_routines FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own workout routines"
  ON public.workout_routines FOR UPDATE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own workout routines"
  ON public.workout_routines FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_workout_routines_updated_at
  BEFORE UPDATE ON public.workout_routines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 2. MEAL ROUTINES

CREATE TABLE IF NOT EXISTS public.meal_routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')), -- Optional preferred type
  food_name TEXT NOT NULL,
  portion TEXT,
  calories INTEGER NOT NULL CHECK (calories >= 0),
  protein_g NUMERIC(6,2) DEFAULT 0,
  carbs_g NUMERIC(6,2) DEFAULT 0,
  fat_g NUMERIC(6,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS meal_routines_user_id_idx ON public.meal_routines(user_id);

-- RLS
ALTER TABLE public.meal_routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meal routines"
  ON public.meal_routines FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own meal routines"
  ON public.meal_routines FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own meal routines"
  ON public.meal_routines FOR UPDATE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own meal routines"
  ON public.meal_routines FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_meal_routines_updated_at
  BEFORE UPDATE ON public.meal_routines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
