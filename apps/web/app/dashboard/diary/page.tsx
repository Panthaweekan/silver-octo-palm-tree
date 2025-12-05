'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { DiaryView } from '@/components/dashboard/DiaryView'
import { PageHeader } from '@/components/shared/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import type { Database } from '@/types/supabase'

type Meal = Database['public']['Tables']['meals']['Row']
type Workout = Database['public']['Tables']['workouts']['Row']
type Todo = Database['public']['Tables']['todos']['Row']
type SleepLog = Database['public']['Tables']['sleep_logs']['Row']
type Habit = Database['public']['Tables']['habits']['Row']
type HabitLog = Database['public']['Tables']['habit_logs']['Row']

export default function DiaryPage() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    }
  })

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, userLoading, router])

  const { data: diaryData, isLoading: dataLoading } = useQuery({
    queryKey: ['diary', user?.id, date],
    enabled: !!user,
    queryFn: async () => {
      const [
        { data: meals },
        { data: workouts },
        { data: todos },
        { data: sleepLogs },
        { data: habits },
        { data: habitLogs },
        { data: weights }
      ] = await Promise.all([
        supabase.from('meals').select('*').eq('user_id', user!.id).eq('date', date),
        supabase.from('workouts').select('*').eq('user_id', user!.id).eq('date', date),
        supabase.from('todos').select('*').eq('user_id', user!.id).eq('date', date).order('created_at', { ascending: true }),
        supabase.from('sleep_logs').select('*').eq('user_id', user!.id).eq('date', date).single(),
        supabase.from('habits').select('*').eq('user_id', user!.id),
        supabase.from('habit_logs').select('*').eq('user_id', user!.id).eq('date', date),
        supabase.from('weights').select('*').eq('user_id', user!.id).eq('date', date).order('created_at', { ascending: true })
      ])

      return {
        meals: (meals as unknown as Meal[]) || [],
        workouts: (workouts as unknown as Workout[]) || [],
        habits: (habits as unknown as Habit[]) || [],
        habitLogs: (habitLogs as unknown as HabitLog[]) || [],
        todos: (todos as unknown as Todo[]) || [],
        sleepLog: (sleepLogs as unknown as SleepLog) || null,
        weights: (weights as unknown as any[]) || []
      }
    }
  })

  if (userLoading || !user || dataLoading || !diaryData) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const summary = {
    caloriesConsumed: diaryData.meals.reduce((sum, m) => sum + (m.calories || 0), 0),
    caloriesBurned: diaryData.workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0),
    protein: diaryData.meals.reduce((sum, m) => sum + (m.protein_g || 0), 0),
    carbs: diaryData.meals.reduce((sum, m) => sum + (m.carbs_g || 0), 0),
    fat: diaryData.meals.reduce((sum, m) => sum + (m.fat_g || 0), 0),
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Daily Diary" 
        description="Track your meals, workouts, and habits." 
      />
      
      <DiaryView 
        userId={user.id} 
        date={date} 
        summary={summary}
        meals={diaryData.meals}
        workouts={diaryData.workouts}
        weights={diaryData.weights}
        habitLogs={diaryData.habitLogs}
        habits={diaryData.habits}
        todos={diaryData.todos}
        sleepLog={diaryData.sleepLog}
      />
    </div>
  )
}
