'use client'

import { WorkoutCard } from './WorkoutCard'
import { WorkoutType } from '@/lib/constants'

interface Workout {
  id: string
  date: string
  type: WorkoutType
  duration_minutes: number
  distance_km?: number
  calories_burned?: number
  notes?: string
}

interface WorkoutListProps {
  workouts: Workout[]
  userId: string
  userWeight: number
}

export function WorkoutList({ workouts, userId, userWeight }: WorkoutListProps) {
  // Group workouts by date
  const groupedWorkouts = workouts.reduce((groups, workout) => {
    const date = workout.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(workout)
    return groups
  }, {} as Record<string, Workout[]>)

  // Sort dates descending
  const sortedDates = Object.keys(groupedWorkouts).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )

  function formatDateHeading(dateString: string) {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today'
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }
  }

  return (
    <div className="space-y-8">
      {sortedDates.map((date) => {
        const workoutsForDate = groupedWorkouts[date];
        const totalDuration = workoutsForDate.reduce((sum, workout) => sum + workout.duration_minutes, 0);

        return (
          <div key={date} className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h2 className="text-lg font-semibold text-foreground">
                {formatDateHeading(date)}
              </h2>
              <span className="text-sm font-medium text-muted-foreground">
                Total: <span className="text-foreground font-bold">{totalDuration} min</span>
              </span>
            </div>
            <div className="grid gap-4">
              {workoutsForDate.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  userId={userId}
                  userWeight={userWeight}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
