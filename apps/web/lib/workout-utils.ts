/**
 * Workout utility functions
 */

import { MET_VALUES, WorkoutType } from './constants'

/**
 * Calculate calories burned based on MET (Metabolic Equivalent of Task)
 * Formula: Calories = (MET × Weight in kg × Duration in hours)
 *
 * @param workoutType - Type of workout
 * @param durationMinutes - Duration in minutes
 * @param weightKg - User's weight in kg (optional, defaults to 70kg)
 * @returns Estimated calories burned
 */
export function calculateCaloriesBurned(
  workoutType: WorkoutType,
  durationMinutes: number,
  weightKg: number = 70
): number {
  const met = MET_VALUES[workoutType] || 5.0
  const durationHours = durationMinutes / 60
  const calories = met * weightKg * durationHours

  return Math.round(calories)
}

/**
 * Get the user's current weight from their latest weight entry
 * This is a helper to fetch weight for calorie calculations
 */
export async function getUserCurrentWeight(
  supabase: any,
  userId: string
): Promise<number | null> {
  const { data } = await supabase
    .from('weights')
    .select('weight_kg')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(1)
    .single()

  return data?.weight_kg || null
}

/**
 * Format workout type for display
 */
export function formatWorkoutType(type: WorkoutType): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

/**
 * Check if a workout type should show distance field
 */
export function shouldShowDistance(type: WorkoutType): boolean {
  const typesWithDistance: WorkoutType[] = ['cardio', 'walking', 'cycling', 'swimming']
  return typesWithDistance.includes(type)
}

/**
 * Get recommended MET value for a workout type
 */
export function getMETValue(workoutType: WorkoutType): number {
  return MET_VALUES[workoutType] || 5.0
}
