'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { WeeklyTrendsChart } from '@/components/analytics/WeeklyTrendsChart'
import { CalorieWeightChart } from '@/components/analytics/CalorieWeightChart'
import { HabitStreaks } from '@/components/analytics/HabitStreaks'
import { MacroDistributionChart } from '@/components/analytics/MacroDistributionChart'
import { SleepQualityChart } from '@/components/analytics/SleepQualityChart'
import { AnalyticsSummaryCards } from '@/components/analytics/AnalyticsSummaryCards'
import { GoalProgressChart } from '@/components/analytics/GoalProgressChart'
import { VolumeProgressChart } from '@/components/analytics/VolumeProgressChart'
import { format, subDays, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import type { Database } from '@/types/supabase'

type Meal = Database['public']['Tables']['meals']['Row']
type Workout = Database['public']['Tables']['workouts']['Row']
type Weight = Database['public']['Tables']['weights']['Row']
type Habit = Database['public']['Tables']['habits']['Row']
type HabitLog = Database['public']['Tables']['habit_logs']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type SleepLog = Database['public']['Tables']['sleep_logs']['Row']
type WorkoutSet = Database['public']['Tables']['workout_sets']['Row']
interface WorkoutWithSets extends Workout {
   workout_exercises: {
     workout_sets: WorkoutSet[]
   }[]
}

export default function AnalyticsPage() {
  const supabase = createClient()
  const router = useRouter()

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

  const { data: analyticsData, isLoading: dataLoading } = useQuery({
    queryKey: ['analytics', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const today = new Date()
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(today, 6 - i)
        return format(d, 'yyyy-MM-dd')
      })
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const d = subDays(today, 29 - i)
        return format(d, 'yyyy-MM-dd')
      })

      const [
        { data: meals },
        { data: workoutsData, error: workoutsError },
        { data: weights },
        { data: habits },
        { data: habitLogs },
        { data: profile },
        { data: sleepLogs }
      ] = await Promise.all([
        supabase.from('meals').select('*').eq('user_id', user!.id).gte('date', last30Days[0]),
        supabase.from('workouts').select('*').eq('user_id', user!.id).gte('date', last30Days[0]),
        supabase.from('weights').select('*').eq('user_id', user!.id).order('date', { ascending: true }),
        supabase.from('habits').select('*').eq('user_id', user!.id),
        supabase.from('habit_logs').select('*').eq('user_id', user!.id).gte('date', last7Days[0]),
        supabase.from('profiles').select('*').eq('id', user!.id).single(),
        supabase.from('sleep_logs').select('*').eq('user_id', user!.id).gte('date', last7Days[0])
      ])

      const workouts = workoutsData as Workout[] || []
      let workoutsWithSets: WorkoutWithSets[] = []

      if (workouts.length > 0) {
        const workoutIds = workouts.map(w => w.id)
        const { data: exercises } = await supabase
          .from('workout_exercises')
          .select('*, workout_sets(*)')
          .in('workout_id', workoutIds)

        workoutsWithSets = workouts.map(w => ({
          ...w,
          workout_exercises: ((exercises as any[])?.filter(e => e.workout_id === w.id)) || []
        }))
      }

      return {
        meals: (meals as unknown as Meal[]) || [],
        workouts: workoutsWithSets,
        weights: (weights as unknown as Weight[]) || [],
        habits: (habits as unknown as Habit[]) || [],
        habitLogs: (habitLogs as unknown as HabitLog[]) || [],
        profile: (profile as unknown as Profile) || null,
        sleepLogs: (sleepLogs as unknown as SleepLog[]) || [],
        last7Days,
        last30Days
      }
    }
  })

  if (userLoading || !user || dataLoading || !analyticsData) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const { meals, workouts, weights, habits, habitLogs, profile, sleepLogs, last7Days, last30Days } = analyticsData

  // Process Weekly Trends Data
  const weeklyTrendsData = last7Days.map(date => {
    const dayMeals = meals.filter(m => m.date === date)
    const dayWorkouts = workouts.filter(w => w.date === date)
    
    return {
      date: format(parseISO(date), 'EEE'),
      caloriesIn: dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0),
      caloriesBurned: dayWorkouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0)
    }
  })

  // Process Macro Distribution
  const recentMeals = meals.filter(m => last7Days.includes(m.date))
  const totalMacros = recentMeals.reduce((acc, meal) => ({
    protein: acc.protein + (Number(meal.protein_g) || 0),
    carbs: acc.carbs + (Number(meal.carbs_g) || 0),
    fat: acc.fat + (Number(meal.fat_g) || 0)
  }), { protein: 0, carbs: 0, fat: 0 })
  
  const daysCount = 7
  const macroData = [
    { name: 'Protein', value: totalMacros.protein / daysCount, color: '#3b82f6' },
    { name: 'Carbs', value: totalMacros.carbs / daysCount, color: '#22c55e' },
    { name: 'Fat', value: totalMacros.fat / daysCount, color: '#eab308' },
  ]

  // Process Sleep Data
  const sleepData = last7Days.map(date => {
    const log = sleepLogs.find(l => l.date === date)
    return {
      date: format(parseISO(date), 'EEE'),
      duration: log ? log.duration_minutes / 60 : 0,
      quality: log ? (log.quality || 'N/A') : 'N/A'
    }
  })

  // Calculate Summary Metrics
  const currentWeight = weights.length > 0 ? weights[weights.length - 1].weight_kg : 70
  const startWeight = weights.length > 0 ? weights[0].weight_kg : currentWeight
  const weightChange = currentWeight - startWeight
  
  const avgCalories = weeklyTrendsData.reduce((sum, day) => sum + day.caloriesIn, 0) / 7
  const workoutConsistency = workouts.filter(w => last7Days.includes(w.date)).length
  const avgSleep = (sleepLogs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0) || 0) / 60 / (sleepLogs.length || 1)

  const summaryMetrics = {
    currentWeight,
    weightChange,
    avgCalories,
    workoutConsistency,
    avgSleep: avgSleep || 0
  }

  // Helper to calculate BMR
  const calculateBMR = (weight: number, height: number, age: number, gender: string) => {
    if (!weight || !height || !age) return 0
    const s = gender === 'female' ? -161 : 5
    return (10 * weight) + (6.25 * height) - (5 * age) + s
  }

  // Helper to get Activity Multiplier
  const getActivityMultiplier = (level: string) => {
    const levels: Record<string, number> = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'active': 1.725,
      'very_active': 1.9
    }
    return levels[level] || 1.2
  }

  // Process Calorie vs Weight Data
  const calorieWeightData = last30Days.map(date => {
    const dayMeals = meals.filter(m => m.date === date)
    const dayWeight = weights.find(w => w.date === date)
    
    const weight = dayWeight?.weight_kg || 70
    const height = profile?.height_cm || 170
    const age = profile?.date_of_birth ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : 30
    const gender = profile?.gender || 'male'
    const activityLevel = (profile as any)?.activity_level || 'sedentary'

    const bmr = calculateBMR(weight, height, age, gender)
    const tdee = bmr * getActivityMultiplier(activityLevel)

    return {
      date: format(parseISO(date), 'MMM d'),
      calories: dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0),
      weight: dayWeight ? dayWeight.weight_kg : null,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee)
    }
  })

  // Process Habit Streaks
  const habitStreaksData = habits.map(habit => {
    const logs = habitLogs.filter(l => l.habit_id === habit.id)
    const last7DaysStatus = last7Days.map(date => {
      const log = logs.find(l => l.date === date)
      return log ? ((log.value || 0) >= (habit.target_value || 1)) : false
    })

    let streak = 0
    for (let i = last7DaysStatus.length - 1; i >= 0; i--) {
      if (last7DaysStatus[i]) streak++
      else break
    }

    const totalLogs = logs.length
    const completedLogs = logs.filter(l => (l.value || 0) >= (habit.target_value || 1)).length
    const completionRate = totalLogs > 0 ? (completedLogs / 7) * 100 : 0 

    return {
      id: habit.id,
      name: habit.name,
      streak,
      completionRate,
      last7Days: last7DaysStatus
    }
  })

  // Process Volume Data
  const volumeData = last30Days.map(date => {
      const dayWorkouts = workouts.filter(w => w.date === date)
      const dailyVolume = dayWorkouts.reduce((total, workout) => {
          let workoutVolume = 0
          
          if (Array.isArray(workout.workout_exercises)) {
              workout.workout_exercises.forEach(exercise => {
                  if (Array.isArray(exercise.workout_sets)) {
                      exercise.workout_sets.forEach((set: any) => {
                          const weight = Number(set.weight_kg) || 0
                          const reps = Number(set.reps) || 0
                          if (weight > 0 && reps > 0) {
                              workoutVolume += (weight * reps)
                          }
                      })
                  }
              })
          }
          return total + workoutVolume
      }, 0)
      
      return {
          date: format(parseISO(date), 'MMM d'),
          volume: dailyVolume
      }
  })

  // Goals Object
  const goals = {
    currentWeight,
    targetWeight: profile?.target_weight_kg || null,
    startWeight: startWeight,
    avgCalories,
    targetCalories: profile?.target_calories || null
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Visualize your progress and trends."
      />

      <AnalyticsSummaryCards metrics={summaryMetrics} />
      
      <div className="grid gap-6 md:grid-cols-2">
         <GoalProgressChart goals={goals} />
         <VolumeProgressChart data={volumeData} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <WeeklyTrendsChart data={weeklyTrendsData} targetCalories={profile?.target_calories} />
        <MacroDistributionChart data={macroData} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SleepQualityChart data={sleepData} />
        <HabitStreaks habits={habitStreaksData} />
      </div>

      <CalorieWeightChart 
        data={calorieWeightData} 
        goalWeight={profile?.target_weight_kg}
        targetCalories={profile?.target_calories}
      />
    </div>
  )
}
