'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Dumbbell, Heart, Zap, Wind, Trophy, Footprints, Bike, Waves, Activity } from 'lucide-react'
import { WorkoutFormDialog } from './WorkoutForm'
import { formatDuration, formatCalories, formatDistance } from '@/lib/formatters'
import { toast } from '@/hooks/use-toast'
import { WorkoutType } from '@/lib/constants'

import { Database } from '@/types/supabase'

type Workout = Database['public']['Tables']['workouts']['Row']

interface WorkoutCardProps {
  workout: Workout
  userId: string
  userWeight: number
}

function getWorkoutIcon(type: string) {
  const icons: Record<string, any> = {
    cardio: Heart,
    strength: Dumbbell,
    hiit: Zap,
    yoga: Wind,
    sports: Trophy,
    walking: Footprints,
    cycling: Bike,
    swimming: Waves,
    other: Activity,
  }
  return icons[type] || Activity
}

function getWorkoutColor(type: string) {
  const colors: Record<string, string> = {
    cardio: 'text-red-600 bg-red-500/10 dark:bg-red-500/20',
    strength: 'text-blue-600 bg-blue-500/10 dark:bg-blue-500/20',
    hiit: 'text-orange-600 bg-orange-500/10 dark:bg-orange-500/20',
    yoga: 'text-purple-600 bg-purple-500/10 dark:bg-purple-500/20',
    sports: 'text-yellow-600 bg-yellow-500/10 dark:bg-yellow-500/20',
    walking: 'text-green-600 bg-green-500/10 dark:bg-green-500/20',
    cycling: 'text-indigo-600 bg-indigo-500/10 dark:bg-indigo-500/20',
    swimming: 'text-cyan-600 bg-cyan-500/10 dark:bg-cyan-500/20',
    other: 'text-muted-foreground bg-muted',
  }
  return colors[type] || 'text-muted-foreground bg-muted'
}

export function WorkoutCard({ workout, userId, userWeight }: WorkoutCardProps) {
  const [deleting, setDeleting] = useState(false)
  const queryClient = useQueryClient()
  const supabase = createClient()

  const Icon = getWorkoutIcon(workout.type)
  const colorClass = getWorkoutColor(workout.type)

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this workout?')) {
      return
    }

    setDeleting(true)
    const { error } = await supabase.from('workouts').delete().eq('id', workout.id)

    if (error) {
      toast.error('Failed to delete workout')
      setDeleting(false)
      return
    }

    toast.success('Workout deleted')
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['workouts'] }),
      queryClient.invalidateQueries({ queryKey: ['diary'] }),
      queryClient.invalidateQueries({ queryKey: ['daily_summary'] }),
      queryClient.invalidateQueries({ queryKey: ['timeline_data'] }),
      queryClient.invalidateQueries({ queryKey: ['recent-items'] }),
    ])
    setDeleting(false)
  }

  return (
    <div className="flex items-center justify-between p-4 bg-card/40 backdrop-blur-sm rounded-lg border border-border/50 hover:border-border transition-colors">
      <div className="flex items-center gap-4 flex-1">
        {/* Icon */}
        <div className={`p-3 rounded-lg ${colorClass}`}>
          <Icon className="h-6 w-6" />
        </div>

        {/* Details */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground capitalize">{workout.type}</h3>
          </div>

          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>{formatDuration(workout.duration_minutes)}</span>

            {workout.distance_km && (
              <span>• {formatDistance(workout.distance_km)}</span>
            )}

            {workout.calories_burned && (
              <span className="font-semibold text-orange-600">
                {formatCalories(workout.calories_burned)}
              </span>
            )}
          </div>

          {workout.notes && (
            <p className="text-sm text-muted-foreground/80 mt-1 italic">{workout.notes}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <WorkoutFormDialog userId={userId} userWeight={userWeight} initialData={workout}>
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4" />
          </Button>
        </WorkoutFormDialog>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    </div>
  )
}
