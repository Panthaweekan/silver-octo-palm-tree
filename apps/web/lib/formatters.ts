/**
 * Formatting utilities for display
 */

export function formatDate(date: string | Date, locale: string = 'en-US'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dateOnly = new Date(d)
  dateOnly.setHours(0, 0, 0, 0)

  const diffTime = today.getTime() - dateOnly.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  return formatDate(date)
}

export function formatNumber(num: number, decimals: number = 1): string {
  return num.toFixed(decimals)
}

export function formatWeight(kg: number): string {
  return `${formatNumber(kg, 1)} kg`
}

export function formatCalories(calories: number): string {
  return `${Math.round(calories)} kcal`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) {
    return `${hours} hr`
  }
  return `${hours} hr ${mins} min`
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`
  }
  return `${formatNumber(km, 2)} km`
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`
}

export function formatMacro(grams: number): string {
  return `${formatNumber(grams, 1)}g`
}
