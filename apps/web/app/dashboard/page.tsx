'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { DashboardTimeline } from '@/components/dashboard/DashboardTimeline'
import { GoalsCard } from '@/components/dashboard/GoalsCard'
import { WorkoutQuickStartCard } from '@/components/dashboard/WorkoutQuickStartCard'
import { MiniWeightChart } from '@/components/dashboard/MiniWeightChart'
import { MiniHabitList } from '@/components/dashboard/MiniHabitList'
import { SmartReminder } from '@/components/dashboard/SmartReminder'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { getSmartSuggestions, Habit, HabitLog } from '@/lib/habits'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()
  const [dismissedReminder, setDismissedReminder] = useState(false)
  
  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // --- 1. User & Profile ---
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    }
  })

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
      return data
    }
  })

  // --- 2. Daily Summary ---
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['daily_summary', user?.id, today],
    enabled: !!user,
    queryFn: async () => {
       const { data } = await supabase.from('daily_summary').select('*').eq('user_id', user!.id).eq('date', today).single()
       return data || {
            total_calories_consumed: 0,
            total_calories_burned: 0,
            total_workout_minutes: 0,
            workout_count: 0,
            meal_count: 0,
        }
    }
  })

  // --- 3. Weight Data ---
  const { data: weightData, isLoading: weightLoading } = useQuery({
    queryKey: ['weight_data', user?.id],
    enabled: !!user,
    queryFn: async () => {
        const [latest, history] = await Promise.all([
             supabase.from('weights').select('weight_kg').eq('user_id', user!.id).order('date', { ascending: false }).limit(1).single(),
             supabase.from('weights').select('date, weight_kg').eq('user_id', user!.id).order('date', { ascending: false }).limit(14)
        ])
        return {
            latest: latest.data,
            history: history.data || []
        }
    }
  })

  // --- 4. Habits & Logs ---
  const { data: habitsData, isLoading: habitsLoading, refetch: refetchHabits } = useQuery({
    queryKey: ['habits_data', user?.id],
    enabled: !!user,
    queryFn: async () => {
         const [habits, logs] = await Promise.all([
            supabase.from('habits').select('*').eq('user_id', user!.id).eq('is_active', true).order('created_at', { ascending: true }),
            supabase.from('habit_logs').select('*').eq('user_id', user!.id).gte('date', thirtyDaysAgo)
         ])
         return {
             habits: habits.data || [],
             logs: logs.data || []
         }
    }
  })

  // --- 5. Timeline --- 
  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: ['timeline_data', user?.id, today],
    enabled: !!user,
    queryFn: async () => {
         const [ { data: m }, { data: w }, { data: we } ] = await Promise.all([
                supabase.from('meals').select('*').eq('user_id', user!.id).eq('date', today).order('created_at', { ascending: false }),
                supabase.from('workouts').select('*').eq('user_id', user!.id).eq('date', today).order('created_at', { ascending: false }),
                supabase.from('weights').select('*').eq('user_id', user!.id).order('date', { ascending: false }).limit(5)
            ])
            return { 
                meals: (m || []) as any[], 
                workouts: (w || []) as any[], 
                weights: (we || []) as any[] 
            }
    }
  })

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login')
    }
  }, [user, userLoading, router])

  // Smart Suggestion Logic
  const suggestion = (!dismissedReminder && habitsData?.habits && habitsData?.logs) 
    ? getSmartSuggestions(habitsData.habits as Habit[], habitsData.logs as HabitLog[]) 
    : null

  const handleSmartLog = async (habitId: string) => {
      // @ts-ignore
      await supabase.from('habit_logs').insert({
          user_id: user!.id,
          habit_id: habitId,
          date: today,
          completed: true,
          value: 1
      })
      refetchHabits()
      setDismissedReminder(true)
  }

  if (userLoading) {
       return null // Start with nothing or a minimal page skeleton if preferable, but layout handles it via loading.tsx mostly
       // Actually let's return a basic shell to avoid flicker if loading.tsx isn't catching standard navigation
  }

  if (!user) return null

  const defaultProfile = {
    full_name: user?.user_metadata?.full_name || 'User',
    height_cm: null,
    target_weight_kg: null,
    activity_level: 'moderate',
    gender: 'other',
    date_of_birth: null
  }

  const currentProfile = profile || defaultProfile
  const profileWithWeight = {
    ...(currentProfile as any),
    weight_kg: (weightData?.latest as any)?.weight_kg || (currentProfile as any)?.target_weight_kg || 70,
  }

  // Find last workout name if any
  const lastWorkout = timeline?.workouts.length && timeline?.workouts.length > 0 ? timeline.workouts[0] : null
  
  // Filter today logs for MiniHabitList strict today's status
  const todayLogs = habitsData?.logs.filter((l: any) => l.date === today) || []

  return (
    <div className="space-y-4 pb-8">
      <DashboardHeader userName={(currentProfile as any)?.full_name || 'User'} />

      {suggestion && (
          <SmartReminder 
            suggestion={suggestion} 
            onLog={handleSmartLog}
            onDismiss={() => setDismissedReminder(true)}
          />
      )}

      {/* Modern Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">
        
        {/* -- PRIMARY FOCUS -- */}

        {/* 1. Goals/Nutrition Card (Top Left - 2x2) */}
        <div className="md:col-span-2 md:row-span-2 h-full">
            {summaryLoading || !summary ? (
                <Skeleton className="w-full h-full rounded-3xl" />
            ) : (
              <GoalsCard 
                userId={user.id} 
                profile={profileWithWeight} 
                dailySummary={summary} 
              />
            )}
        </div>

        {/* 2. Workout Quick Start (Top Right - 2x1) */}
        <div className="md:col-span-2 lg:col-span-1 md:row-span-1 h-full min-h-[180px]">
           {summaryLoading ? (
               <Skeleton className="w-full h-full rounded-3xl" />
           ) : (
              <WorkoutQuickStartCard 
                workoutCount={summary?.workout_count || 0} 
                lastWorkoutName={lastWorkout?.name || lastWorkout?.type}
              />
           )}
        </div>

        {/* 3. Weight Mini Chart (Top Far Right - 1x1) */}
        <div className="md:col-span-2 lg:col-span-1 md:row-span-1 h-full min-h-[180px]">
            {weightLoading || !weightData ? (
                 <Skeleton className="w-full h-full rounded-3xl" />
            ) : (
                <MiniWeightChart 
                    data={weightData.history.map((w: any) => ({ date: w.date, weight: w.weight_kg }))}
                    currentWeight={(weightData.latest as any)?.weight_kg}
                    goalWeight={(currentProfile as any)?.target_weight_kg}
                />
            )}
        </div>

        {/* -- SECONDARY / CONTEXT -- */}

        {/* 4. Habits (Span full width below top row or 2 cols) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-1">
             {habitsLoading || !habitsData ? (
                 <Skeleton className="w-full h-[140px] rounded-3xl" />
             ) : (
                habitsData.habits.length > 0 && (
                    <MiniHabitList 
                        userId={user.id}
                        habits={habitsData.habits}
                        initialLogs={todayLogs} 
                        allLogs={habitsData.logs}
                    />
                )
             )}
        </div>

        {/* Timeline (Full Width at Bottom) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 mt-4">
             {timelineLoading || !timeline ? (
                 <div className="space-y-4">
                     <Skeleton className="w-full h-12 rounded-xl" />
                     <Skeleton className="w-full h-24 rounded-xl" />
                     <Skeleton className="w-full h-24 rounded-xl" />
                 </div>
             ) : (
                  <DashboardTimeline 
                    userId={user.id}
                    meals={timeline.meals}
                    workouts={timeline.workouts}
                    weights={timeline.weights}
                  />
             )}
        </div>

      </div>
    </div>
  )
}
