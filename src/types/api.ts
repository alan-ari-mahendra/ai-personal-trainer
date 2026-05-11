export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  content: string;
}

// ===== Parse API (Phase 2) =====

export type ParseType = 'nutrition' | 'workout' | 'cardio';

export interface ParseRequest {
  type: ParseType;
  input: string;
}

export interface NutritionItem {
  food_name: string;
  portion_size: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
}

export interface NutritionParseResult {
  items: NutritionItem[];
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface WorkoutExercise {
  exercise_name: string;
  sets: number;
  reps: number;
  weight_kg: number | null;
  rpe: number | null;
  notes: string | null;
}

export interface WorkoutParseResult {
  exercises: WorkoutExercise[];
}

export interface CardioParseResult {
  type: 'running' | 'cycling' | 'swimming' | 'walking' | 'hiit' | 'other';
  distance_km: number | null;
  duration_min: number | null;
  notes: string | null;
}

export type ParseResult = NutritionParseResult | WorkoutParseResult | CardioParseResult;
