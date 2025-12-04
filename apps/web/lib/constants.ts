/**
 * Application constants
 */

export const WORKOUT_TYPES = [
  { value: 'cardio', label: 'Cardio', icon: 'Heart', hasDistance: true },
  { value: 'strength', label: 'Strength', icon: 'Dumbbell', hasDistance: false },
  { value: 'hiit', label: 'HIIT', icon: 'Zap', hasDistance: false },
  { value: 'yoga', label: 'Yoga', icon: 'Wind', hasDistance: false },
  { value: 'sports', label: 'Sports', icon: 'Trophy', hasDistance: false },
  { value: 'walking', label: 'Walking', icon: 'Footprints', hasDistance: true },
  { value: 'cycling', label: 'Cycling', icon: 'Bike', hasDistance: true },
  { value: 'swimming', label: 'Swimming', icon: 'Waves', hasDistance: true },
  { value: 'other', label: 'Other', icon: 'Activity', hasDistance: false },
] as const

export type WorkoutType = (typeof WORKOUT_TYPES)[number]['value']

export const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast', icon: 'Coffee', emoji: '🍳' },
  { value: 'lunch', label: 'Lunch', icon: 'UtensilsCrossed', emoji: '🍱' },
  { value: 'dinner', label: 'Dinner', icon: 'Utensils', emoji: '🍽️' },
  { value: 'snack', label: 'Snack', icon: 'Cookie', emoji: '🍎' },
] as const

export type MealType = (typeof MEAL_TYPES)[number]['value']

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const

export type Gender = (typeof GENDER_OPTIONS)[number]['value']

export const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'Sedentary', description: 'Little or no exercise' },
  { value: 1.375, label: 'Light', description: 'Exercise 1-3 times/week' },
  { value: 1.55, label: 'Moderate', description: 'Exercise 4-5 times/week' },
  { value: 1.725, label: 'Active', description: 'Daily exercise or intense exercise 3-4 times/week' },
  { value: 1.9, label: 'Very Active', description: 'Intense exercise 6-7 times/week' },
] as const

export const TIME_RANGES = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
  { value: 365, label: '1 year' },
] as const

// MET (Metabolic Equivalent of Task) values for calorie calculation
// Reference: https://sites.google.com/site/compendiumofphysicalactivities/
export const MET_VALUES: Record<WorkoutType, number> = {
  cardio: 8.0, // Running 8 km/h
  strength: 6.0, // Weight lifting, vigorous
  hiit: 10.0, // High intensity interval training
  yoga: 3.0, // Hatha yoga
  sports: 7.0, // General sports
  walking: 3.5, // Walking 5.5 km/h
  cycling: 7.5, // Cycling 19-22 km/h
  swimming: 8.0, // Swimming, freestyle, moderate
  other: 5.0, // General exercise
}

// Macro ratios (protein/carbs/fat)
export const MACRO_RATIOS = {
  balanced: { protein: 30, carbs: 40, fat: 30 },
  highProtein: { protein: 40, carbs: 30, fat: 30 },
  lowCarb: { protein: 35, carbs: 25, fat: 40 },
  lowFat: { protein: 30, carbs: 50, fat: 20 },
} as const

// Calorie conversion factors
export const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
} as const

// BMI categories
export const BMI_CATEGORIES = [
  { max: 18.5, label: 'Underweight', color: 'text-blue-600' },
  { max: 24.9, label: 'Normal', color: 'text-green-600' },
  { max: 29.9, label: 'Overweight', color: 'text-yellow-600' },
  { max: Infinity, label: 'Obese', color: 'text-red-600' },
] as const

// BMR Calculation Constants (Mifflin-St Jeor Equation)
export const BMR_CONSTANTS = {
  male: { base: 5, weight: 10, height: 6.25, age: 5 },
  female: { base: -161, weight: 10, height: 6.25, age: 5 },
} as const

export const GOAL_TYPES = [
  { value: 'lose_weight', label: 'Lose Weight', adjustment: -500 },
  { value: 'maintain_weight', label: 'Maintain Weight', adjustment: 0 },
  { value: 'gain_weight', label: 'Gain Muscle', adjustment: 500 },
] as const

export type GoalType = (typeof GOAL_TYPES)[number]['value']
