'use client'

import { format } from 'date-fns'
import { Apple, Dumbbell, Scale, CheckCircle2, Circle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimelineItem {
  id: string
  type: 'meal' | 'workout' | 'weight' | 'habit'
  title: string
  subtitle?: string
  time: string
  value?: string
  icon: React.ElementType
  color: string
}

interface DiaryTimelineProps {
  meals: any[]
  workouts: any[]
  weights: any[]
  habitLogs: any[]
  habits: any[]
}

export function DiaryTimeline({ meals, workouts, weights, habitLogs, habits }: DiaryTimelineProps) {
  // Merge and transform data into timeline items
  const items: TimelineItem[] = [
    ...meals.map(m => ({
      id: m.id,
      type: 'meal' as const,
      title: m.food_name,
      subtitle: `${m.meal_type} • ${m.calories} kcal`,
      time: m.created_at,
      value: `${m.calories}`,
      icon: Apple,
      color: 'text-green-500 bg-green-500/10'
    })),
    ...workouts.map(w => ({
      id: w.id,
      type: 'workout' as const,
      title: w.type,
      subtitle: `${w.duration_minutes} min • ${w.calories_burned} kcal`,
      time: w.created_at,
      value: `${w.calories_burned}`,
      icon: Dumbbell,
      color: 'text-orange-500 bg-orange-500/10'
    })),
    ...weights.map(w => ({
      id: w.id,
      type: 'weight' as const,
      title: 'Weight Logged',
      subtitle: `${w.weight_kg} kg`,
      time: w.created_at,
      value: `${w.weight_kg}kg`,
      icon: Scale,
      color: 'text-blue-500 bg-blue-500/10'
    })),
    ...habitLogs.map(l => {
      const habit = habits.find(h => h.id === l.habit_id)
      return {
        id: l.id,
        type: 'habit' as const,
        title: habit?.name || 'Habit',
        subtitle: l.completed ? 'Completed' : 'Logged',
        time: l.created_at,
        value: l.value.toString(),
        icon: l.completed ? CheckCircle2 : Circle,
        color: l.completed ? 'text-purple-500 bg-purple-500/10' : 'text-gray-400 bg-gray-500/10'
      }
    })
  ].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <div className="p-4 rounded-full bg-muted/50 mb-4">
          <Clock className="w-8 h-8 opacity-50" />
        </div>
        <h3 className="text-lg font-medium text-foreground">No activities yet</h3>
        <p className="text-sm max-w-xs mx-auto mt-1">
          Log your meals, workouts, or habits to see your daily timeline here.
        </p>
      </div>
    )
  }

  return (
    <div className="relative space-y-0">
      {/* Vertical Line */}
      <div className="absolute left-6 top-4 bottom-4 w-px bg-border/50" />

      {items.map((item, index) => (
        <div key={`${item.type}-${item.id}`} className="relative flex items-start gap-4 py-3 group">
          {/* Time & Icon */}
          <div className="flex flex-col items-center z-10">
            <div className={cn(
              "flex items-center justify-center w-12 h-12 rounded-xl border border-border/50 shadow-sm transition-colors duration-200",
              "bg-card group-hover:border-primary/20",
              item.color
            )}>
              <item.icon className="w-5 h-5" />
            </div>
          </div>

          {/* Content Card */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-foreground truncate">{item.title}</h4>
              <span className="text-xs text-muted-foreground font-mono">
                {format(new Date(item.time), 'h:mm a')}
              </span>
            </div>
            <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
