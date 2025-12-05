export interface Exercise {
  id: string
  name: string
  muscle_group: string
  created_by?: string
  is_custom?: boolean
  created_at?: string
}

export const WORKOUT_TYPES = [
  'cardio',
  'strength', 
  'hiit',
  'yoga',
  'sports',
  'walking',
  'cycling',
  'swimming',
  'other'
] as const

export type WorkoutType = typeof WORKOUT_TYPES[number]
