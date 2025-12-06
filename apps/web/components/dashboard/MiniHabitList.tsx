'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { calculateStreak, HabitLog } from '@/lib/habits'
import confetti from 'canvas-confetti'

interface MiniHabitListProps {
  habits: any[]
  initialLogs: any[]
  userId: string
  allLogs?: any[] // New prop for history to calc streaks
}

export function MiniHabitList({ habits, initialLogs, userId, allLogs = [] }: MiniHabitListProps) {
  const { t } = useLanguage()
  const [logs, setLogs] = useState<HabitLog[]>(initialLogs)

  // Filter only active habits
  const activeHabits = habits.filter(h => h.is_active !== false)

    const handleHabitClick = async (habit: any, event: React.MouseEvent) => {
    const today = new Date().toISOString().split('T')[0]
    const target = habit.target_value || 1
    
    // Find the single log entry for today if it exists (Schema enforces unique habit_id+date)
    const existingLog = logs.find((l: HabitLog) => l.habit_id === habit.id && l.date === today)
    const currentValue = existingLog ? (existingLog.value ?? 1) : 0 // value could be 0 theoretically, use ??
    
    const isMultiValue = target > 1
    let newLogs = [...logs]
    const supabase = createClient()

    if (isMultiValue) {
        // Multi-value logic
        if (currentValue >= target) {
            // Decrement / Undo logic (Prevent going above target, or just toggle off if full)
            // If we are at target (or above), reducing by 1 "uncompletes" or just reduces count.
            const newValue = currentValue - 1
            
            if (newValue <= 0) {
                // Delete
                 newLogs = newLogs.filter((l: HabitLog) => l.id !== existingLog?.id)
                 setLogs(newLogs)
                 if (existingLog) await supabase.from('habit_logs').delete().eq('id', existingLog.id)
            } else {
                // Update
                if (existingLog) {
                    const updatedLog = { ...existingLog, value: newValue, completed: newValue >= target }
                    newLogs = newLogs.map(l => l.id === existingLog.id ? updatedLog : l)
                    setLogs(newLogs)
                    await (supabase.from('habit_logs') as any).update({ value: newValue, completed: newValue >= target }).eq('id', existingLog.id)
                }
            }
        } else {
            // Increment logic
            const newValue = currentValue + 1
            
            if (existingLog) {
                // Update existing
                const updatedLog = { ...existingLog, value: newValue, completed: newValue >= target }
                newLogs = newLogs.map(l => l.id === existingLog.id ? updatedLog : l)
                setLogs(newLogs)
                
                // Celebration if hitting target
                if (newValue === target) {
                     confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#22c55e', '#3b82f6', '#f59e0b']
                    })
                }

                await (supabase.from('habit_logs') as any).update({ value: newValue, completed: newValue >= target }).eq('id', existingLog.id)
            } else {
                // Insert new
                const newLog = { 
                    habit_id: habit.id, 
                    date: today, 
                    completed: newValue >= target, 
                    value: newValue,
                    id: 'temp-' + Date.now(), 
                    created_at: new Date().toISOString() 
                }
                newLogs.push(newLog)
                setLogs(newLogs)

                 // Celebration if hitting target (unlikely for 1st click unless target=1, but logic holds)
                 if (newValue === target) {
                     confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#22c55e', '#3b82f6', '#f59e0b']
                    })
                }

                // @ts-ignore
                const { data } = await supabase.from('habit_logs').insert({
                    user_id: userId,
                    habit_id: habit.id,
                    date: today,
                    completed: newValue >= target,
                    value: newValue
                }).select().single()
                
                if (data) {
                    setLogs((prev: HabitLog[]) => prev.map((l: HabitLog) => l.id === newLog.id ? data : l))
                }
            }
        }

    } else {
        // Toggle logic for single-value habits
        if (existingLog) {
            // Remove
            newLogs = newLogs.filter((l: HabitLog) => l.id !== existingLog.id)
            setLogs(newLogs)
            await supabase.from('habit_logs').delete().eq('id', existingLog.id)
        } else {
            // Add
            const newLog = { 
                habit_id: habit.id, 
                date: today, 
                completed: true, 
                value: 1,
                id: 'temp-' + Date.now(), 
                created_at: new Date().toISOString() 
            }
            newLogs.push(newLog)
            setLogs(newLogs)

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#22c55e', '#3b82f6', '#f59e0b']
            })
            
            // @ts-ignore
            const { data } = await supabase.from('habit_logs').insert({
                user_id: userId,
                habit_id: habit.id,
                date: today,
                completed: true,
                value: 1
            }).select().single()
            
            if (data) {
                setLogs((prev: HabitLog[]) => prev.map((l: HabitLog) => l.id === newLog.id ? data : l))
            }
        }
    }
  }

  if (activeHabits.length === 0) return null

  return (
    <Card className="border-border/50 bg-card/40 backdrop-blur-xl">
       <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {t('dashboard.todaysHabits')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {activeHabits.map(habit => {
                const target = habit.target_value || 1
                const existingLog = logs.find((l: HabitLog) => l.habit_id === habit.id && l.date === new Date().toISOString().split('T')[0])
                const currentValue = existingLog ? (existingLog.value || 1) : 0
                
                // For simplified display, if multi-value, "completed" visual if currentValue >= target
                const isCompleted = currentValue >= target
                const progressPercent = Math.min((currentValue / target) * 100, 100)

                // Calculate streak using ALL logs + current optimistic state
                const habitHistory = allLogs.filter(l => l.habit_id === habit.id && l.date !== new Date().toISOString().split('T')[0])
                
                // Determine if we should count today for streak. 
                // Simplistic: if single value, yes if logged. If multi, yes if target met? 
                // For now, let's say "Streak counts days where you did at least something" OR "Target met". 
                // Sticking to "Streak = Target Met" is harder if users partially do it. 
                // Let's assume Streak = Target Met for today logic.
                const streakLogsRaw = [...habitHistory]
                if (isCompleted && existingLog) {
                     // We need to shape 'habitLogsToday' into a single entry for streak calc if using simple date logic
                     // But calculateStreak just looks for unique dates. So ANY log today counts as "streak kept alive" in current logic.
                     // IMPORTANT: Current calculateStreak counts ANY presence of log as streak.
                     // This might be lenient for multi-value but it's okay for MVP.
                     streakLogsRaw.push(existingLog)
                }
                const streak = calculateStreak(streakLogsRaw)

                return (
                    <button
                        key={habit.id}
                        onClick={(e) => handleHabitClick(habit, e)}
                        className={cn(
                            "flex flex-col justify-between p-4 rounded-xl border transition-all min-w-[160px] h-[100px] flex-shrink-0 text-left relative overflow-hidden group",
                            isCompleted 
                                ? "bg-primary/10 border-primary/20" 
                                : "bg-muted/30 border-border hover:bg-muted/50"
                        )}
                    >
                         <div className="flex items-start justify-between w-full z-10">
                            <div className="relative flex items-center justify-center">
                                <div className={cn(
                                    "h-6 w-6 rounded-full flex items-center justify-center border transition-colors z-10",
                                    isCompleted ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 bg-background/50"
                                )}>
                                    {isCompleted && <Check className="h-3 w-3" />}
                                    {!isCompleted && target > 1 && (
                                        <span className="text-[10px] font-medium text-muted-foreground">{currentValue}</span>
                                    )}
                                </div>
                                
                                {/* Ring for partial progress if multi-value */}
                                {!isCompleted && target > 1 && (
                                    <svg className="absolute inset-0 h-full w-full -rotate-90 pointer-events-none" viewBox="0 0 32 32">
                                        <circle cx="16" cy="16" r="14" fill="none" strokeWidth="4" className="stroke-muted/20" />
                                        <circle 
                                            cx="16" cy="16" r="14" 
                                            fill="none" 
                                            strokeWidth="4" 
                                            className="stroke-primary transition-all duration-500"
                                            strokeDasharray={`${progressPercent * 0.88}, 100`} 
                                        />
                                    </svg>
                                )}
                            </div>
                            
                            {streak > 0 && (
                                <div className="flex items-center gap-0.5 text-xs font-medium text-orange-500">
                                    <Flame className="h-3 w-3 fill-orange-500" />
                                    <span>{streak}</span>
                                </div>
                            )}
                         </div>

                        <div className="overflow-hidden z-10 w-full">
                             <p className={cn("text-sm font-medium truncate transition-all", isCompleted ? "text-primary" : "text-foreground")}>
                                {habit.name}
                             </p>
                             {target > 1 && (
                                 <p className="text-xs text-muted-foreground">
                                     {currentValue} / {target} {habit.unit || ''}
                                 </p>
                             )}
                        </div>
                        
                        {/* Subtle background progression or effect */}
                        {isCompleted && (
                             <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                        )}
                         {!isCompleted && target > 1 && currentValue > 0 && (
                             <div 
                                className="absolute left-0 bottom-0 h-1 bg-primary/20 transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                             />
                        )}
                    </button>
                )
            })}
        </div>
      </CardContent>
    </Card>
  )
}
