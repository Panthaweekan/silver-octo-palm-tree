'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Flame, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HabitStreaksProps {
  habits: {
    id: string
    name: string
    streak: number
    completionRate: number
    last7Days: boolean[]
  }[]
}

export function HabitStreaks({ habits }: HabitStreaksProps) {
  if (habits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Habit Consistency</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No habits found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Habit Consistency</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {habits.map((habit) => (
          <div key={habit.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">{habit.name}</span>
                {habit.streak > 0 && (
                  <div className="flex items-center gap-1 text-xs font-medium text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                    <Flame className="h-3 w-3 fill-orange-500" />
                    {habit.streak} day streak
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {Math.round(habit.completionRate)}% completion
              </span>
            </div>

            <div className="flex gap-1">
              {habit.last7Days.map((completed, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-2 flex-1 rounded-full transition-colors",
                    completed ? "bg-green-500" : "bg-gray-100"
                  )}
                  title={completed ? "Completed" : "Missed"}
                />
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
