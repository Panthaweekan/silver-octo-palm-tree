import { BMR_CONSTANTS, ACTIVITY_LEVELS, GOAL_TYPES, GoalType, Gender } from './constants'

/**
 * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor Equation
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number {
  // Mifflin-St Jeor Equation
  // Men: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
  // Women: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161

  const constants = gender === 'female' ? BMR_CONSTANTS.female : BMR_CONSTANTS.male
  
  const bmr =
    constants.weight * weightKg +
    constants.height * heightCm -
    constants.age * age +
    constants.base

  return Math.round(bmr)
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE)
 */
export function calculateTDEE(bmr: number, activityLevelValue: number): number {
  return Math.round(bmr * activityLevelValue)
}

/**
 * Calculates Daily Calorie Target based on TDEE and Goal
 */
export function calculateCalorieTarget(tdee: number, goal: GoalType): number {
  const goalObj = GOAL_TYPES.find((g) => g.value === goal)
  const adjustment = goalObj ? goalObj.adjustment : 0
  return tdee + adjustment
}

/**
 * Calculates Age from Date of Birth
 */
export function calculateAge(dateOfBirth: string): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}
