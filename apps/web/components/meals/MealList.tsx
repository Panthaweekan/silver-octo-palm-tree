'use client'

import { MealCard } from './MealCard'
import { MealType } from '@/lib/constants'
import { formatCalories } from '@/lib/formatters'
import { useLanguage } from '@/components/providers/LanguageProvider'

interface Meal {
  id: string
  date: string
  meal_type: MealType
  food_name: string
  calories: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
  notes?: string
}

interface MealListProps {
  meals: Meal[]
  userId: string
}

export function MealList({ meals, userId }: MealListProps) {
  const { t, language } = useLanguage()
  // Group meals by date
  const groupedMeals = meals.reduce((groups, meal) => {
    const date = meal.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(meal)
    return groups
  }, {} as Record<string, Meal[]>)

  // Sort dates descending
  const sortedDates = Object.keys(groupedMeals).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )

  function formatDateHeading(dateString: string) {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    if (dateString === today.toISOString().split('T')[0]) {
      return t('common.today')
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return t('common.yesterday')
    } else {
      return date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }
  }

  function calculateDailyTotal(meals: Meal[]) {
    return meals.reduce((sum, meal) => sum + meal.calories, 0)
  }

  return (
    <div className="space-y-8">
      {sortedDates.map((date) => {
        const dayMeals = groupedMeals[date]
        const totalCalories = calculateDailyTotal(dayMeals)

        return (
          <div key={date} className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h2 className="text-lg font-semibold text-foreground">
                {formatDateHeading(date)}
              </h2>
              <span className="text-sm font-medium text-muted-foreground">
                {t('common.total')}: <span className="text-foreground font-bold">{formatCalories(totalCalories)}</span>
              </span>
            </div>
            <div className="grid gap-4">
              {dayMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  userId={userId}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
