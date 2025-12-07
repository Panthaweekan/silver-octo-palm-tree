'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell, Flame, Timer } from 'lucide-react'
import { formatDuration, formatCalories } from '@/lib/formatters'
import { WorkoutType } from '@/lib/constants'

import { Database } from '@/types/supabase'

type Workout = Database['public']['Tables']['workouts']['Row']

interface WorkoutStatsProps {
  workouts: Workout[]
}

export function WorkoutStats({ workouts }: WorkoutStatsProps) {
  const totalWorkouts = workouts.length
  const totalDuration = workouts.reduce((acc, curr) => acc + curr.duration_minutes, 0)
  const totalCalories = workouts.reduce((acc, curr) => acc + (curr.calories_burned || 0), 0)

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
          <Dumbbell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalWorkouts}</div>
          <p className="text-xs text-muted-foreground">
            in the last 30 days
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Time</CardTitle>
          <Timer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatDuration(totalDuration)}</div>
          <p className="text-xs text-muted-foreground">
            total duration
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
          <Flame className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCalories(totalCalories)}</div>
          <p className="text-xs text-muted-foreground">
            estimated total
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
