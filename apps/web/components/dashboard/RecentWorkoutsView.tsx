'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'

interface Workout {
  id: string
  type: string
  duration_minutes: number
  distance_km?: number | null
  calories_burned: number
}

interface RecentWorkoutsViewProps {
  workouts: Workout[]
}

export function RecentWorkoutsView({ workouts }: RecentWorkoutsViewProps) {
  const { t } = useLanguage()

  return (
    <Card className="h-full border-border/50 bg-card/40 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>{t('dashboard.workoutsToday')}</CardTitle>
      </CardHeader>
      <CardContent>
        {workouts.length > 0 ? (
          <div className="space-y-3">
            {workouts.map((workout) => (
              <div
                key={workout.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div>
                  <p className="font-medium capitalize">{workout.type}</p>
                  <p className="text-sm text-muted-foreground">
                    {workout.duration_minutes} min
                    {workout.distance_km && ` • ${workout.distance_km} km`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-orange-600">
                    {workout.calories_burned} kcal
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Dumbbell className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
            <p>{t('workouts.noWorkouts')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
