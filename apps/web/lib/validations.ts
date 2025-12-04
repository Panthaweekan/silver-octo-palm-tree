/**
 * Validation utilities for form inputs
 */

export function validateWeight(weight: number): boolean {
  return weight > 0 && weight < 500
}

export function validateBodyFatPercentage(percentage: number): boolean {
  return percentage >= 0 && percentage <= 100
}

export function validateMeasurement(measurement: number): boolean {
  return measurement > 0 && measurement < 500
}

export function validateDate(date: string): boolean {
  const d = new Date(date)
  const now = new Date()
  now.setHours(23, 59, 59, 999) // End of today
  return d <= now && !isNaN(d.getTime())
}

export function validateCalories(calories: number): boolean {
  return calories >= 0 && calories <= 10000
}

export function validateDuration(minutes: number): boolean {
  return minutes > 0 && minutes < 1440 // Less than 24 hours
}

export function validateDistance(distance: number): boolean {
  return distance > 0 && distance < 1000 // Less than 1000km
}

export function validateMacro(macro: number): boolean {
  return macro >= 0 && macro <= 1000
}

export function validateHeight(height: number): boolean {
  return height >= 50 && height <= 300
}

export function validateAge(birthDate: string): boolean {
  const birth = new Date(birthDate)
  const today = new Date()
  const age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= 13
  }
  return age >= 13
}

export function validateTargetWeight(weight: number): boolean {
  return weight >= 20 && weight <= 300
}

export function validateTargetCalories(calories: number): boolean {
  return calories >= 800 && calories <= 10000
}

export function validateHabitName(name: string): boolean {
  return name.length >= 2 && name.length <= 100
}

export function validateHabitTargetValue(value: number): boolean {
  return value > 0 && value <= 100
}
