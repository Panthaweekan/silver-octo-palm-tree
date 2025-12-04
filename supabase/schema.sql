-- =====================================================
-- FitJourney Database Schema for Supabase
-- =====================================================
-- This schema creates all tables needed for the MVP
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE
-- Extends auth.users with additional user information
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  height_cm NUMERIC(5,2),
  target_weight_kg NUMERIC(5,2),
  target_calories INTEGER DEFAULT 2000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

-- =====================================================
-- 2. WORKOUTS TABLE
-- Track all exercise activities
-- =====================================================

CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('cardio', 'strength', 'hiit', 'yoga', 'sports', 'walking', 'cycling', 'swimming', 'other')),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  distance_km NUMERIC(6,2),
  calories_burned INTEGER CHECK (calories_burned >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS workouts_user_id_idx ON public.workouts(user_id);
CREATE INDEX IF NOT EXISTS workouts_date_idx ON public.workouts(date DESC);
CREATE INDEX IF NOT EXISTS workouts_user_date_idx ON public.workouts(user_id, date DESC);

-- =====================================================
-- 3. MEALS TABLE
-- Track food intake and nutrition
-- =====================================================

CREATE TABLE IF NOT EXISTS public.meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name TEXT NOT NULL,
  portion TEXT,
  calories INTEGER NOT NULL CHECK (calories >= 0),
  protein_g NUMERIC(6,2) DEFAULT 0,
  carbs_g NUMERIC(6,2) DEFAULT 0,
  fat_g NUMERIC(6,2) DEFAULT 0,
  image_url TEXT,
  ai_estimated BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS meals_user_id_idx ON public.meals(user_id);
CREATE INDEX IF NOT EXISTS meals_date_idx ON public.meals(date DESC);
CREATE INDEX IF NOT EXISTS meals_user_date_idx ON public.meals(user_id, date DESC);

-- =====================================================
-- 4. WEIGHTS TABLE
-- Track body weight and measurements
-- =====================================================

CREATE TABLE IF NOT EXISTS public.weights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg NUMERIC(5,2) NOT NULL CHECK (weight_kg > 0),
  body_fat_percentage NUMERIC(4,2) CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 100),
  waist_cm NUMERIC(5,2),
  hips_cm NUMERIC(5,2),
  chest_cm NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one weight entry per user per day
  UNIQUE(user_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS weights_user_id_idx ON public.weights(user_id);
CREATE INDEX IF NOT EXISTS weights_date_idx ON public.weights(date DESC);

-- =====================================================
-- 5. HABITS TABLE
-- Define user habits to track
-- =====================================================

CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_value INTEGER DEFAULT 1,
  unit TEXT DEFAULT 'times',
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS habits_user_id_idx ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS habits_active_idx ON public.habits(user_id, is_active) WHERE is_active = TRUE;

-- =====================================================
-- 6. HABIT_LOGS TABLE
-- Track daily habit completions
-- =====================================================

CREATE TABLE IF NOT EXISTS public.habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  value INTEGER DEFAULT 1,
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one log per habit per day
  UNIQUE(habit_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS habit_logs_habit_id_idx ON public.habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS habit_logs_date_idx ON public.habit_logs(date DESC);
CREATE INDEX IF NOT EXISTS habit_logs_user_date_idx ON public.habit_logs(user_id, date DESC);

-- =====================================================
-- 7. DAILY_JOURNALS TABLE
-- Daily notes and reflections
-- =====================================================

CREATE TABLE IF NOT EXISTS public.daily_journals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  content TEXT NOT NULL,
  mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'bad', 'terrible')),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  ai_summary TEXT,
  ai_insights TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One journal per user per day
  UNIQUE(user_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS journals_user_id_idx ON public.daily_journals(user_id);
CREATE INDEX IF NOT EXISTS journals_date_idx ON public.daily_journals(date DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures users can only access their own data
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_journals ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- WORKOUTS POLICIES
-- =====================================================

-- Users can view their own workouts
CREATE POLICY "Users can view own workouts"
  ON public.workouts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own workouts
CREATE POLICY "Users can insert own workouts"
  ON public.workouts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own workouts
CREATE POLICY "Users can update own workouts"
  ON public.workouts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own workouts
CREATE POLICY "Users can delete own workouts"
  ON public.workouts
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- MEALS POLICIES
-- =====================================================

CREATE POLICY "Users can view own meals"
  ON public.meals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals"
  ON public.meals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals"
  ON public.meals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals"
  ON public.meals FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- WEIGHTS POLICIES
-- =====================================================

CREATE POLICY "Users can view own weights"
  ON public.weights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weights"
  ON public.weights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weights"
  ON public.weights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weights"
  ON public.weights FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- HABITS POLICIES
-- =====================================================

CREATE POLICY "Users can view own habits"
  ON public.habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits"
  ON public.habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
  ON public.habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits"
  ON public.habits FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- HABIT_LOGS POLICIES
-- =====================================================

CREATE POLICY "Users can view own habit logs"
  ON public.habit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habit logs"
  ON public.habit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habit logs"
  ON public.habit_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habit logs"
  ON public.habit_logs FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- DAILY_JOURNALS POLICIES
-- =====================================================

CREATE POLICY "Users can view own journals"
  ON public.daily_journals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journals"
  ON public.daily_journals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journals"
  ON public.daily_journals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journals"
  ON public.daily_journals FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at column
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON public.workouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meals_updated_at
  BEFORE UPDATE ON public.meals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON public.habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journals_updated_at
  BEFORE UPDATE ON public.daily_journals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTION: Auto-create profile on signup
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- VIEWS: Helpful aggregated data
-- =====================================================

-- View: Daily summary for a user
CREATE OR REPLACE VIEW daily_summary AS
SELECT
  p.id AS user_id,
  CURRENT_DATE AS date,
  COALESCE((SELECT SUM(calories) FROM public.meals m WHERE m.user_id = p.id AND m.date = CURRENT_DATE), 0) AS total_calories_consumed,
  COALESCE((SELECT SUM(calories_burned) FROM public.workouts w WHERE w.user_id = p.id AND w.date = CURRENT_DATE), 0) AS total_calories_burned,
  COALESCE((SELECT SUM(duration_minutes) FROM public.workouts w WHERE w.user_id = p.id AND w.date = CURRENT_DATE), 0) AS total_workout_minutes,
  COALESCE((SELECT COUNT(*) FROM public.workouts w WHERE w.user_id = p.id AND w.date = CURRENT_DATE), 0) AS workout_count,
  COALESCE((SELECT COUNT(*) FROM public.meals m WHERE m.user_id = p.id AND m.date = CURRENT_DATE), 0) AS meal_count
FROM public.profiles p;

-- =====================================================
-- SEED DATA: Common food items
-- =====================================================

-- Create a food database table (optional for MVP)
CREATE TABLE IF NOT EXISTS public.food_database (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT,
  serving_size TEXT,
  calories INTEGER NOT NULL,
  protein_g NUMERIC(6,2) DEFAULT 0,
  carbs_g NUMERIC(6,2) DEFAULT 0,
  fat_g NUMERIC(6,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for food database (public read, admin write)
ALTER TABLE public.food_database ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read food database"
  ON public.food_database FOR SELECT
  USING (true);

-- Add search index for food names
CREATE INDEX IF NOT EXISTS food_database_name_idx ON public.food_database USING GIN(to_tsvector('english', name));

-- Insert common foods (sample data)
INSERT INTO public.food_database (name, category, serving_size, calories, protein_g, carbs_g, fat_g)
VALUES
  ('ข้าวผัด', 'Thai Food', '1 จาน (300g)', 400, 8, 60, 12),
  ('ข้าวเปล่า', 'Staples', '1 ทัพพี (100g)', 130, 2.7, 28, 0.3),
  ('ไข่ดาว', 'Protein', '1 ฟอง', 90, 6, 0.4, 7),
  ('ไก่ย่าง', 'Protein', '100g', 165, 31, 0, 3.6),
  ('ผัดไทย', 'Thai Food', '1 จาน (300g)', 450, 15, 50, 20),
  ('ต้มยำกุ้ง', 'Thai Food', '1 ชาม (250ml)', 120, 10, 8, 5),
  ('ส้มตำ', 'Thai Food', '1 จาน (150g)', 100, 3, 18, 2),
  ('กล้วยหอม', 'Fruits', '1 ผล', 105, 1.3, 27, 0.4),
  ('แอปเปิ้ล', 'Fruits', '1 ผล (182g)', 95, 0.5, 25, 0.3),
  ('น้ำ', 'Beverages', '1 แก้ว (250ml)', 0, 0, 0, 0),
  ('กาแฟดำ', 'Beverages', '1 แก้ว (240ml)', 2, 0.3, 0, 0),
  ('นมสด', 'Beverages', '1 แก้ว (240ml)', 150, 8, 12, 8);

-- =====================================================
-- STORAGE BUCKETS
-- Run these commands in Supabase Dashboard > Storage
-- =====================================================

-- 1. Create 'avatars' bucket (public)
-- 2. Create 'food-images' bucket (private)
-- 3. Create 'workout-images' bucket (private)

-- Storage policies (apply in Dashboard):
-- avatars: Public read, authenticated users can upload their own
-- food-images: Users can upload and read their own images
-- workout-images: Users can upload and read their own images

-- =====================================================
-- COMPLETION
-- =====================================================

-- Schema setup complete!
-- Next steps:
-- 1. Run this script in Supabase SQL Editor
-- 2. Verify all tables are created
-- 3. Check RLS policies are enabled
-- 4. Create storage buckets manually in Dashboard
-- 5. Copy API keys to your Next.js .env.local file
