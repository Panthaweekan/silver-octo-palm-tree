-- Create exercises table for the ExerciseSelector component
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  muscle_group TEXT,
  target_muscle TEXT,
  equipment TEXT,
  video_url TEXT,
  is_custom BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Everyone can read standard (non-custom) exercises
CREATE POLICY "Public exercises are viewable by everyone" ON public.exercises
  FOR SELECT USING (is_custom = FALSE OR created_by IS NULL);

-- 2. Users can read their own custom exercises
CREATE POLICY "Users can view own custom exercises" ON public.exercises
  FOR SELECT USING (auth.uid() = created_by);

-- 3. Users can create their own custom exercises
-- The CHECK ensures they can only create exercises assigned to themselves
CREATE POLICY "Users can insert own custom exercises" ON public.exercises
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS exercises_name_trgm_idx ON public.exercises using gin (name gin_trgm_ops); -- Requires pg_trgm extension, or just btree for ilike with prefix
-- Fallback to standard index if trgm not available
CREATE INDEX IF NOT EXISTS exercises_name_idx ON public.exercises(name);
CREATE INDEX IF NOT EXISTS exercises_muscle_idx ON public.exercises(muscle_group);
