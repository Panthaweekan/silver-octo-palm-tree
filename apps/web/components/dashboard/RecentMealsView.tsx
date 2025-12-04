'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Apple } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'

interface Meal {
  id: string
  name: string
  calories: number
  protein?: number | null
  carbs?: number | null
  fat?: number | null
  created_at: string
}

interface RecentMealsViewProps {
  meals: Meal[]
}

export function RecentMealsView({ meals }: RecentMealsViewProps) {
  const { t } = useLanguage()

  return (
    <Card className="h-full border-border/50 bg-card/40 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>{t('meals.recentMeals')}</CardTitle>
      </CardHeader>
      <CardContent>
        {meals.length > 0 ? (
          <div className="space-y-3">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{meal.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(meal.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-600">
                    {meal.calories} kcal
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Apple className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
            <p>{t('meals.noMeals')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
