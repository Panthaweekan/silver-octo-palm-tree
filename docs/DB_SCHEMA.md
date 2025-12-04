# 🗄️ FitJourney - Database Schema Design

## Overview

PostgreSQL 15+ with time-series optimization and JSONB support.

**Design Principles:**
- Normalized schema (3NF) for transactional data
- Denormalized for analytics/reporting tables
- Soft deletes for audit trail
- UUID primary keys for distributed systems
- Timestamps on all tables

---

## 1. Core Tables

### 1.1 Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Profile Information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(20), -- 'male', 'female', 'other', 'prefer_not_to_say'
    
    -- Physical Stats (current)
    height_cm DECIMAL(5,2),
    current_weight_kg DECIMAL(5,2),
    
    -- Goals
    target_weight_kg DECIMAL(5,2),
    daily_calorie_goal INTEGER,
    daily_protein_goal INTEGER,
    daily_carbs_goal INTEGER,
    daily_fat_goal INTEGER,
    
    -- Settings
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    unit_system VARCHAR(10) DEFAULT 'metric', -- 'metric' or 'imperial'
    
    -- Profile Image
    avatar_url TEXT,
    
    -- OAuth
    google_id VARCHAR(255) UNIQUE,
    apple_id VARCHAR(255) UNIQUE,
    facebook_id VARCHAR(255) UNIQUE,
    
    -- Account Status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    premium_expires_at TIMESTAMP,
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT check_height CHECK (height_cm > 0 AND height_cm < 300),
    CONSTRAINT check_weight CHECK (current_weight_kg > 0 AND current_weight_kg < 500)
);

-- Indexes
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_username ON users(username) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at);
```

---

## 2. Workout Tracking

### 2.1 Exercise Types Table

```sql
CREATE TABLE exercise_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'cardio', 'strength', 'hiit', 'yoga', 'sports', 'other'
    description TEXT,
    
    -- Calorie Estimation
    met_value DECIMAL(4,2), -- Metabolic Equivalent of Task
    
    -- Common Metrics
    tracks_sets BOOLEAN DEFAULT FALSE,
    tracks_reps BOOLEAN DEFAULT FALSE,
    tracks_weight BOOLEAN DEFAULT FALSE,
    tracks_duration BOOLEAN DEFAULT TRUE,
    tracks_distance BOOLEAN DEFAULT FALSE,
    
    -- System or User-created
    is_system BOOLEAN DEFAULT FALSE,
    created_by_user_id UUID REFERENCES users(id),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(name, created_by_user_id)
);

-- Pre-populate system exercises
INSERT INTO exercise_types (name, category, met_value, tracks_sets, tracks_reps, tracks_weight, is_system) VALUES
('Running', 'cardio', 8.0, FALSE, FALSE, FALSE, TRUE),
('Cycling', 'cardio', 7.5, FALSE, FALSE, FALSE, TRUE),
('Swimming', 'cardio', 8.0, FALSE, FALSE, FALSE, TRUE),
('Walking', 'cardio', 3.5, FALSE, FALSE, FALSE, TRUE),
('Bench Press', 'strength', 5.0, TRUE, TRUE, TRUE, TRUE),
('Squats', 'strength', 5.0, TRUE, TRUE, TRUE, TRUE),
('Deadlift', 'strength', 6.0, TRUE, TRUE, TRUE, TRUE),
('Pull-ups', 'strength', 4.0, TRUE, TRUE, FALSE, TRUE),
('Push-ups', 'strength', 3.8, TRUE, TRUE, FALSE, TRUE),
('Yoga', 'yoga', 2.5, FALSE, FALSE, FALSE, TRUE),
('HIIT Training', 'hiit', 8.0, FALSE, FALSE, FALSE, TRUE);

CREATE INDEX idx_exercise_types_category ON exercise_types(category);
```

### 2.2 Workouts Table

```sql
CREATE TABLE workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Workout Info
    title VARCHAR(200),
    workout_date DATE NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_minutes INTEGER GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (end_time - start_time)) / 60
    ) STORED,
    
    -- Overall Stats
    total_calories_burned INTEGER,
    average_heart_rate INTEGER,
    max_heart_rate INTEGER,
    
    -- Notes
    notes TEXT,
    mood VARCHAR(20), -- 'excellent', 'good', 'okay', 'tired', 'exhausted'
    
    -- Location (optional)
    location VARCHAR(200),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_workouts_user_date ON workouts(user_id, workout_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_workouts_user_id ON workouts(user_id) WHERE deleted_at IS NULL;
```

### 2.3 Workout Exercises Table

```sql
CREATE TABLE workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_type_id UUID NOT NULL REFERENCES exercise_types(id),
    
    -- Order in workout
    exercise_order INTEGER NOT NULL,
    
    -- Metrics
    duration_minutes INTEGER,
    distance_km DECIMAL(6,2),
    calories_burned INTEGER,
    
    -- For strength training
    sets INTEGER,
    reps INTEGER,
    weight_kg DECIMAL(6,2),
    
    -- Notes for this specific exercise
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workout_exercises_workout ON workout_exercises(workout_id);
```

### 2.4 Exercise Sets Table (detailed strength tracking)

```sql
CREATE TABLE exercise_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_exercise_id UUID NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
    
    set_number INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    weight_kg DECIMAL(6,2),
    
    -- RPE (Rate of Perceived Exertion) 1-10
    rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
    
    -- Rest time before next set (seconds)
    rest_seconds INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_exercise_sets_workout_exercise ON exercise_sets(workout_exercise_id);
```

---

## 3. Nutrition Tracking

### 3.1 Food Database Table

```sql
CREATE TABLE food_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Food Info
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100),
    description TEXT,
    
    -- Serving Info
    serving_size DECIMAL(8,2) NOT NULL, -- e.g., 100
    serving_unit VARCHAR(20) NOT NULL, -- 'g', 'ml', 'piece', 'cup', 'tbsp'
    
    -- Macronutrients (per serving)
    calories INTEGER NOT NULL,
    protein_g DECIMAL(6,2) NOT NULL,
    carbs_g DECIMAL(6,2) NOT NULL,
    fat_g DECIMAL(6,2) NOT NULL,
    fiber_g DECIMAL(6,2),
    sugar_g DECIMAL(6,2),
    sodium_mg DECIMAL(8,2),
    
    -- Micronutrients (optional)
    vitamins JSONB,
    minerals JSONB,
    
    -- Categorization
    category VARCHAR(50), -- 'protein', 'vegetable', 'fruit', 'grain', 'dairy', 'snack', 'beverage'
    tags TEXT[], -- ['high-protein', 'low-carb', 'gluten-free', 'vegan']
    
    -- Source
    is_system BOOLEAN DEFAULT FALSE, -- Pre-populated database
    is_verified BOOLEAN DEFAULT FALSE, -- Verified nutritional data
    created_by_user_id UUID REFERENCES users(id),
    
    -- Image
    image_url TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_food_items_name ON food_items USING gin(to_tsvector('english', name));
CREATE INDEX idx_food_items_category ON food_items(category);
CREATE INDEX idx_food_items_tags ON food_items USING gin(tags);
```

### 3.2 Meals Table

```sql
CREATE TABLE meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Meal Info
    meal_date DATE NOT NULL,
    meal_type VARCHAR(20) NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
    meal_time TIMESTAMP NOT NULL,
    
    -- Optional
    meal_name VARCHAR(200),
    notes TEXT,
    
    -- Image (if user uploaded)
    image_url TEXT,
    
    -- AI-generated insights
    ai_analysis JSONB, -- { "detected_foods": [], "estimated_calories": 500, "confidence": 0.85 }
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_meals_user_date ON meals(user_id, meal_date DESC) WHERE deleted_at IS NULL;
```

### 3.3 Meal Food Items Table

```sql
CREATE TABLE meal_food_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_id UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    food_item_id UUID NOT NULL REFERENCES food_items(id),
    
    -- Quantity
    quantity DECIMAL(8,2) NOT NULL,
    serving_unit VARCHAR(20) NOT NULL,
    
    -- Calculated values (denormalized for performance)
    calories INTEGER NOT NULL,
    protein_g DECIMAL(6,2) NOT NULL,
    carbs_g DECIMAL(6,2) NOT NULL,
    fat_g DECIMAL(6,2) NOT NULL,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_meal_food_items_meal ON meal_food_items(meal_id);
```

---

## 4. Body Metrics

### 4.1 Weight Logs Table

```sql
CREATE TABLE weight_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    log_date DATE NOT NULL,
    log_time TIMESTAMP NOT NULL DEFAULT NOW(),
    
    weight_kg DECIMAL(5,2) NOT NULL,
    
    -- Body Composition (optional)
    body_fat_percentage DECIMAL(4,2),
    muscle_mass_kg DECIMAL(5,2),
    body_water_percentage DECIMAL(4,2),
    bone_mass_kg DECIMAL(4,2),
    
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    
    CONSTRAINT check_weight_log CHECK (weight_kg > 0 AND weight_kg < 500),
    UNIQUE(user_id, log_date)
);

CREATE INDEX idx_weight_logs_user_date ON weight_logs(user_id, log_date DESC) WHERE deleted_at IS NULL;
```

### 4.2 Body Measurements Table

```sql
CREATE TABLE body_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    measurement_date DATE NOT NULL,
    
    -- Measurements (cm)
    neck_cm DECIMAL(5,2),
    chest_cm DECIMAL(5,2),
    waist_cm DECIMAL(5,2),
    hips_cm DECIMAL(5,2),
    thigh_cm DECIMAL(5,2),
    calf_cm DECIMAL(5,2),
    bicep_cm DECIMAL(5,2),
    forearm_cm DECIMAL(5,2),
    
    -- Photos (optional)
    front_photo_url TEXT,
    side_photo_url TEXT,
    back_photo_url TEXT,
    
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    
    UNIQUE(user_id, measurement_date)
);

CREATE INDEX idx_body_measurements_user_date ON body_measurements(user_id, measurement_date DESC);
```

---

## 5. Habits & Routines

### 5.1 Habit Templates Table

```sql
CREATE TABLE habit_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- 'hydration', 'sleep', 'activity', 'nutrition', 'mindfulness', 'custom'
    
    -- Default tracking type
    tracking_type VARCHAR(20) NOT NULL, -- 'boolean', 'numeric', 'duration'
    unit VARCHAR(20), -- 'glasses', 'hours', 'steps', 'minutes'
    default_target DECIMAL(8,2),
    
    -- Recommended frequency
    frequency VARCHAR(20), -- 'daily', 'weekly', 'custom'
    
    icon_name VARCHAR(50),
    
    is_system BOOLEAN DEFAULT FALSE,
    created_by_user_id UUID REFERENCES users(id),
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- System habits
INSERT INTO habit_templates (name, description, category, tracking_type, unit, default_target, is_system) VALUES
('Drink Water', 'Track daily water intake', 'hydration', 'numeric', 'glasses', 8, TRUE),
('Sleep', 'Track hours of sleep', 'sleep', 'duration', 'hours', 7, TRUE),
('Steps', 'Track daily steps', 'activity', 'numeric', 'steps', 8000, TRUE),
('Meditation', 'Daily meditation practice', 'mindfulness', 'duration', 'minutes', 10, TRUE),
('Vegetables', 'Servings of vegetables', 'nutrition', 'numeric', 'servings', 5, TRUE);
```

### 5.2 User Habits Table

```sql
CREATE TABLE user_habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    habit_template_id UUID REFERENCES habit_templates(id),
    
    -- Custom habit details
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    
    tracking_type VARCHAR(20) NOT NULL,
    unit VARCHAR(20),
    target_value DECIMAL(8,2),
    
    -- Schedule
    frequency VARCHAR(20) DEFAULT 'daily',
    reminder_time TIME,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE NOT NULL,
    end_date DATE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_user_habits_user ON user_habits(user_id) WHERE is_active = TRUE AND deleted_at IS NULL;
```

### 5.3 Habit Logs Table

```sql
CREATE TABLE habit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_habit_id UUID NOT NULL REFERENCES user_habits(id) ON DELETE CASCADE,
    
    log_date DATE NOT NULL,
    log_time TIMESTAMP DEFAULT NOW(),
    
    -- Value depends on tracking_type
    completed BOOLEAN DEFAULT FALSE,
    value DECIMAL(8,2),
    
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_habit_id, log_date)
);

CREATE INDEX idx_habit_logs_user_habit_date ON habit_logs(user_habit_id, log_date DESC);
```

---

## 6. Daily Journal

### 6.1 Journal Entries Table

```sql
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    entry_date DATE NOT NULL,
    
    -- Content
    title VARCHAR(200),
    content TEXT,
    
    -- Mood tracking
    mood VARCHAR(20), -- 'excellent', 'good', 'neutral', 'bad', 'terrible'
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
    
    -- AI Insights
    ai_summary TEXT,
    ai_recommendations JSONB,
    
    -- Tags
    tags TEXT[],
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    
    UNIQUE(user_id, entry_date)
);

CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, entry_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_journal_entries_tags ON journal_entries USING gin(tags);
```

---

## 7. Analytics & Aggregation Tables

### 7.1 Daily Summary Table (Materialized)

```sql
CREATE TABLE daily_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary_date DATE NOT NULL,
    
    -- Workout Stats
    total_workouts INTEGER DEFAULT 0,
    total_workout_minutes INTEGER DEFAULT 0,
    total_calories_burned INTEGER DEFAULT 0,
    
    -- Nutrition Stats
    total_meals INTEGER DEFAULT 0,
    total_calories_consumed INTEGER DEFAULT 0,
    total_protein_g DECIMAL(8,2) DEFAULT 0,
    total_carbs_g DECIMAL(8,2) DEFAULT 0,
    total_fat_g DECIMAL(8,2) DEFAULT 0,
    
    -- Net Calories
    net_calories INTEGER GENERATED ALWAYS AS (
        total_calories_consumed - total_calories_burned
    ) STORED,
    
    -- Weight
    weight_kg DECIMAL(5,2),
    
    -- Habits
    habits_completed INTEGER DEFAULT 0,
    habits_total INTEGER DEFAULT 0,
    
    -- Journal
    has_journal_entry BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, summary_date)
);

CREATE INDEX idx_daily_summaries_user_date ON daily_summaries(user_id, summary_date DESC);

-- Function to refresh daily summary
CREATE OR REPLACE FUNCTION refresh_daily_summary(p_user_id UUID, p_date DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO daily_summaries (user_id, summary_date, total_workouts, total_workout_minutes, total_calories_burned)
    SELECT 
        p_user_id,
        p_date,
        COUNT(*),
        SUM(duration_minutes),
        SUM(total_calories_burned)
    FROM workouts
    WHERE user_id = p_user_id AND workout_date = p_date AND deleted_at IS NULL
    ON CONFLICT (user_id, summary_date) 
    DO UPDATE SET
        total_workouts = EXCLUDED.total_workouts,
        total_workout_minutes = EXCLUDED.total_workout_minutes,
        total_calories_burned = EXCLUDED.total_calories_burned,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
```

### 7.2 Weekly Summary Table

```sql
CREATE TABLE weekly_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    
    -- Aggregated Stats
    total_workouts INTEGER DEFAULT 0,
    total_workout_minutes INTEGER DEFAULT 0,
    total_calories_burned INTEGER DEFAULT 0,
    avg_calories_consumed INTEGER DEFAULT 0,
    
    -- Weight Change
    start_weight_kg DECIMAL(5,2),
    end_weight_kg DECIMAL(5,2),
    weight_change_kg DECIMAL(5,2),
    
    -- Progress
    workout_days INTEGER DEFAULT 0,
    habit_completion_rate DECIMAL(5,2), -- percentage
    
    -- AI Insights
    ai_weekly_summary TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, week_start_date)
);

CREATE INDEX idx_weekly_summaries_user_date ON weekly_summaries(user_id, week_start_date DESC);
```

---

## 8. AI & ML Tables

### 8.1 AI Insights Table

```sql
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    insight_type VARCHAR(50) NOT NULL, -- 'recommendation', 'trend', 'alert', 'achievement'
    category VARCHAR(50), -- 'workout', 'nutrition', 'weight', 'habit'
    
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    
    -- Metadata
    priority INTEGER DEFAULT 1, -- 1 (low) to 5 (high)
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    
    -- Associated data
    related_data JSONB,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    
    valid_from TIMESTAMP DEFAULT NOW(),
    valid_until TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_insights_user_unread ON ai_insights(user_id, created_at DESC) 
    WHERE is_read = FALSE AND is_dismissed = FALSE;
```

### 8.2 Food Image Recognition Cache

```sql
CREATE TABLE food_recognition_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    image_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 hash
    
    -- Recognition Results
    detected_foods JSONB NOT NULL, -- [{ "name": "rice", "confidence": 0.95, "calories": 200 }]
    total_estimated_calories INTEGER,
    
    model_version VARCHAR(20),
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_food_recognition_image_hash ON food_recognition_cache(image_hash);
```

---

## 9. System Tables

### 9.1 Refresh Tokens (Sessions)

```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    
    device_info JSONB, -- { "device": "iPhone 14", "os": "iOS 17", "app_version": "1.0.0" }
    ip_address INET,
    user_agent TEXT,
    
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
```

### 9.2 Audit Logs

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    user_id UUID REFERENCES users(id),
    
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout'
    entity_type VARCHAR(50), -- 'workout', 'meal', 'user'
    entity_id UUID,
    
    -- Changes
    old_data JSONB,
    new_data JSONB,
    
    -- Request Info
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
```

---

## 10. Database Functions & Triggers

### 10.1 Updated At Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON workouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... (repeat for other tables)
```

### 10.2 Calculate Daily Summary Trigger

```sql
CREATE OR REPLACE FUNCTION trigger_refresh_daily_summary()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM refresh_daily_summary(NEW.user_id, NEW.workout_date);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_workout_insert_update AFTER INSERT OR UPDATE ON workouts
    FOR EACH ROW EXECUTE FUNCTION trigger_refresh_daily_summary();
```

---

## 11. Indexes Summary

**Critical Indexes for Performance:**

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;

-- Workout queries
CREATE INDEX idx_workouts_user_date ON workouts(user_id, workout_date DESC);

-- Meal queries
CREATE INDEX idx_meals_user_date ON meals(user_id, meal_date DESC);

-- Weight tracking
CREATE INDEX idx_weight_logs_user_date ON weight_logs(user_id, log_date DESC);

-- Full-text search
CREATE INDEX idx_food_items_name_fts ON food_items USING gin(to_tsvector('english', name));
```

---

## 12. Data Retention & Archival

```sql
-- Archive old data (> 2 years)
CREATE TABLE archived_workouts (LIKE workouts INCLUDING ALL);
CREATE TABLE archived_meals (LIKE meals INCLUDING ALL);

-- Scheduled job to archive
CREATE OR REPLACE FUNCTION archive_old_data()
RETURNS VOID AS $$
BEGIN
    -- Move workouts older than 2 years
    INSERT INTO archived_workouts
    SELECT * FROM workouts
    WHERE workout_date < NOW() - INTERVAL '2 years';
    
    DELETE FROM workouts
    WHERE workout_date < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;
```

---

## 13. Migration Strategy

**Tools**: Alembic (Python) or Prisma (Node.js)

**Migration Files Structure**:
```
migrations/
├── 001_initial_schema.sql
├── 002_add_workout_tables.sql
├── 003_add_nutrition_tables.sql
├── 004_add_habits_tables.sql
└── ...
```

---

**Document Version**: 1.0  
**Last Updated**: December 4, 2025  
**Total Tables**: 20+  
**Estimated DB Size** (1M users, 1 year): ~50-100 GB
