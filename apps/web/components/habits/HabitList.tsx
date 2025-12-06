'use client'

import { HabitCard } from './HabitCard'

interface HabitListProps {
  userId: string
  habits: any[]
  logs: any[]
}

export function HabitList({ userId, habits, logs }: HabitListProps) {
  if (habits.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border border-dashed border-border">
        <h3 className="mt-2 text-sm font-semibold text-foreground">No habits defined</h3>
        <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new habit.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {habits.map((habit) => {
        const log = logs.find((l) => l.habit_id === habit.id) || null
        return (
          <HabitCard
            key={habit.id}
            habit={habit}
            log={log}
            userId={userId}
          />
        )
      })}
    </div>
  )
}
