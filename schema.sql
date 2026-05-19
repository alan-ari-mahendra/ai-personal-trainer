-- ============================================================
-- AI PERSONAL TRAINER SCHEMA - Neon PostgreSQL
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    display_name    VARCHAR(100),
    goal            VARCHAR(50) DEFAULT 'maintenance'
                    CHECK (goal IN ('bulking', 'cutting', 'maintenance', 'health')),
    activity_level  VARCHAR(20) DEFAULT 'moderate'
                    CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    height_cm       DECIMAL(5,1),
    weight_kg       DECIMAL(5,2),
    age             INTEGER,
    gender          VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    exercise_history TEXT,
    injuries        TEXT,
    address         TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================================
-- WORKOUTS (Strength Training)
-- ============================================================
CREATE TABLE workouts (
    id              SERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_name   VARCHAR(100) NOT NULL,
    weight_kg       DECIMAL(6,2),
    sets            INTEGER NOT NULL DEFAULT 1,
    reps            INTEGER NOT NULL DEFAULT 1,
    duration_min    INTEGER,
    notes           TEXT,
    rpe             INTEGER CHECK (rpe BETWEEN 1 AND 10),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workouts_user_date ON workouts(user_id, created_at DESC);
CREATE INDEX idx_workouts_exercise ON workouts(exercise_name);

-- ============================================================
-- CARDIO LOGS
-- ============================================================
CREATE TABLE cardio_logs (
    id              SERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(30) NOT NULL
                    CHECK (type IN ('running', 'cycling', 'swimming', 'walking', 'hiit', 'other')),
    distance_km     DECIMAL(6,2),
    duration_min    INTEGER NOT NULL,
    pace_min_km     DECIMAL(4,2),
    calories_burned INTEGER,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cardio_user_date ON cardio_logs(user_id, created_at DESC);

-- ============================================================
-- MEALS (Nutrition)
-- ============================================================
CREATE TABLE meals (
    id              SERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_type       VARCHAR(20) NOT NULL
                    CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    food_name       TEXT NOT NULL,
    calories        INTEGER,
    protein_g       DECIMAL(5,1),
    carbs_g         DECIMAL(5,1),
    fat_g           DECIMAL(5,1),
    portion_size    VARCHAR(50),
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meals_user_date ON meals(user_id, created_at DESC);

-- ============================================================
-- BODY STATS
-- ============================================================
CREATE TABLE body_stats (
    id              SERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight_kg       DECIMAL(5,2) NOT NULL,
    waist_cm        DECIMAL(5,2),
    notes           TEXT,
    recorded_at     DATE NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT unique_weight_per_day UNIQUE (user_id, recorded_at)
);

CREATE INDEX idx_body_stats_user_date ON body_stats(user_id, recorded_at DESC);

-- ============================================================
-- CHAT HISTORY (Context Retention)
-- ============================================================
CREATE TABLE chat_history (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role            VARCHAR(10) NOT NULL
                    CHECK (role IN ('user', 'assistant', 'system')),
    content         TEXT NOT NULL,
    tool_calls      JSONB,
    tokens_used     INTEGER,
    model_used      VARCHAR(50),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_user_date ON chat_history(user_id, created_at DESC);
CREATE INDEX idx_chat_user_role ON chat_history(user_id, created_at DESC)
    WHERE role != 'system';
