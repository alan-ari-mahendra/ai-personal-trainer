import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  timestamp,
  date,
  serial,
  bigserial,
  jsonb,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ===== USERS =====

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
    email: varchar('email', { length: 255 }).unique().notNull(),
    passwordHash: text('password_hash').notNull(),
    displayName: varchar('display_name', { length: 100 }),
    goal: varchar('goal', { length: 50 }).default('maintenance'),
    activityLevel: varchar('activity_level', { length: 20 }).default('moderate'),
    heightCm: decimal('height_cm', { precision: 5, scale: 1 }),
    weightKg: decimal('weight_kg', { precision: 5, scale: 2 }),
    age: integer('age'),
    gender: varchar('gender', { length: 10 }),
    exerciseHistory: text('exercise_history'),
    injuries: text('injuries'),
    address: text('address'),
    onboardingCompleted: boolean('onboarding_completed').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [index('idx_users_email').on(t.email)],
);

// ===== WORKOUTS =====

export const workouts = pgTable(
  'workouts',
  {
    id: serial('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    exerciseName: varchar('exercise_name', { length: 100 }).notNull(),
    weightKg: decimal('weight_kg', { precision: 6, scale: 2 }),
    sets: integer('sets').notNull().default(1),
    reps: integer('reps').notNull().default(1),
    durationMin: integer('duration_min'),
    notes: text('notes'),
    rpe: integer('rpe'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index('idx_workouts_user_date').on(t.userId, t.createdAt),
    index('idx_workouts_exercise').on(t.exerciseName),
  ],
);

// ===== CARDIO LOGS =====

export const cardioLogs = pgTable(
  'cardio_logs',
  {
    id: serial('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 30 }).notNull(),
    distanceKm: decimal('distance_km', { precision: 6, scale: 2 }),
    durationMin: integer('duration_min').notNull(),
    paceMinKm: decimal('pace_min_km', { precision: 4, scale: 2 }),
    caloriesBurned: integer('calories_burned'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [index('idx_cardio_user_date').on(t.userId, t.createdAt)],
);

// ===== MEALS =====

export const meals = pgTable(
  'meals',
  {
    id: serial('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    mealType: varchar('meal_type', { length: 20 }).notNull(),
    foodName: text('food_name').notNull(),
    calories: integer('calories'),
    proteinG: decimal('protein_g', { precision: 5, scale: 1 }),
    carbsG: decimal('carbs_g', { precision: 5, scale: 1 }),
    fatG: decimal('fat_g', { precision: 5, scale: 1 }),
    portionSize: varchar('portion_size', { length: 50 }),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [index('idx_meals_user_date').on(t.userId, t.createdAt)],
);

// ===== BODY STATS =====

export const bodyStats = pgTable(
  'body_stats',
  {
    id: serial('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    weightKg: decimal('weight_kg', { precision: 5, scale: 2 }).notNull(),
    waistCm: decimal('waist_cm', { precision: 5, scale: 2 }),
    notes: text('notes'),
    recordedAt: date('recorded_at').notNull().defaultNow(),
  },
  (t) => [
    unique('unique_weight_per_day').on(t.userId, t.recordedAt),
    index('idx_body_stats_user_date').on(t.userId, t.recordedAt),
  ],
);

// ===== CHAT HISTORY =====

export const chatHistory = pgTable(
  'chat_history',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 10 }).notNull(),
    content: text('content').notNull(),
    toolCalls: jsonb('tool_calls'),
    tokensUsed: integer('tokens_used'),
    modelUsed: varchar('model_used', { length: 50 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [index('idx_chat_user_date').on(t.userId, t.createdAt)],
);
