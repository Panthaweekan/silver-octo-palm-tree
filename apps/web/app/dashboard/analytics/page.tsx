import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { WeeklyTrendsChart } from '@/components/analytics/WeeklyTrendsChart'
import { CalorieWeightChart } from '@/components/analytics/CalorieWeightChart'
import { HabitStreaks } from '@/components/analytics/HabitStreaks'
import { MacroDistributionChart } from '@/components/analytics/MacroDistributionChart'
import { SleepQualityChart } from '@/components/analytics/SleepQualityChart'
import { AnalyticsSummaryCards } from '@/components/analytics/AnalyticsSummaryCards'
import { format, subDays, isSameDay, parseISO } from 'date-fns'

export default async function AnalyticsPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const today = new Date()
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i)
    return format(d, 'yyyy-MM-dd')
  })
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = subDays(today, 29 - i)
    return format(d, 'yyyy-MM-dd')
  })

  // Fetch data
  const [
    { data: meals },
    { data: workouts },
    { data: weights },
    { data: habits },
    { data: habitLogs },
    { data: profile },
    { data: sleepLogs }
  ] = await Promise.all([
    supabase.from('meals').select('*').eq('user_id', user.id).gte('date', last30Days[0]),
    supabase.from('workouts').select('*').eq('user_id', user.id).gte('date', last30Days[0]),
    supabase.from('weights').select('*').eq('user_id', user.id).order('date', { ascending: true }),
    supabase.from('habits').select('*').eq('user_id', user.id),
    supabase.from('habit_logs').select('*').eq('user_id', user.id).gte('date', last7Days[0]),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('sleep_logs').select('*').eq('user_id', user.id).gte('date', last7Days[0])
  ])

  // Process Weekly Trends Data
  const weeklyTrendsData = last7Days.map(date => {
    const dayMeals = meals?.filter(m => m.date === date) || []
    const dayWorkouts = workouts?.filter(w => w.date === date) || []
    
    return {
      date: format(parseISO(date), 'EEE'),
      caloriesIn: dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0),
      caloriesBurned: dayWorkouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0)
    }
  })

  // Process Macro Distribution (Last 7 Days)
  const recentMeals = meals?.filter(m => last7Days.includes(m.date)) || []
  const totalMacros = recentMeals.reduce((acc, meal) => ({
    protein: acc.protein + (Number(meal.protein_g) || 0),
    carbs: acc.carbs + (Number(meal.carbs_g) || 0),
    fat: acc.fat + (Number(meal.fat_g) || 0)
  }), { protein: 0, carbs: 0, fat: 0 })
  
  const daysCount = 7 // Averaging over 7 days
  const macroData = [
    { name: 'Protein', value: totalMacros.protein / daysCount, color: '#3b82f6' },
    { name: 'Carbs', value: totalMacros.carbs / daysCount, color: '#22c55e' },
    { name: 'Fat', value: totalMacros.fat / daysCount, color: '#eab308' },
  ]

  // Process Sleep Data
  const sleepData = last7Days.map(date => {
    const log = sleepLogs?.find(l => l.date === date)
    return {
      date: format(parseISO(date), 'EEE'),
      duration: log ? log.duration_minutes / 60 : 0,
      quality: log ? log.quality : 'N/A'
    }
  })

  // Calculate Summary Metrics
  const currentWeight = weights && weights.length > 0 ? weights[weights.length - 1].weight_kg : (profile?.weight_kg || 0)
  const startWeight = weights && weights.length > 0 ? weights[0].weight_kg : currentWeight
  const weightChange = currentWeight - startWeight
  
  const avgCalories = weeklyTrendsData.reduce((sum, day) => sum + day.caloriesIn, 0) / 7
  const workoutConsistency = workouts?.filter(w => last7Days.includes(w.date)).length || 0
  const avgSleep = (sleepLogs?.reduce((sum, log) => sum + (log.duration_minutes || 0), 0) || 0) / 60 / (sleepLogs?.length || 1)

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
    // Mifflin-St Jeor Equation
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
    const dayMeals = meals?.filter(m => m.date === date) || []
    const dayWeight = weights?.find(w => w.date === date)
    
    // Use current weight if day weight is missing, or fallback to profile weight
    const weight = dayWeight?.weight_kg || profile?.weight_kg || 70
    const height = profile?.height_cm || 170
    const age = profile?.date_of_birth ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : 30
    const gender = profile?.gender || 'male'
    const activityLevel = profile?.activity_level || 'sedentary'

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
  const habitStreaksData = habits?.map(habit => {
    const logs = habitLogs?.filter(l => l.habit_id === habit.id) || []
    
    // Calculate last 7 days status
    const last7DaysStatus = last7Days.map(date => {
      const log = logs.find(l => l.date === date)
      return log ? (log.value >= habit.target_value) : false
    })

    // Calculate current streak (simplified)
    let streak = 0
    for (let i = last7DaysStatus.length - 1; i >= 0; i--) {
      if (last7DaysStatus[i]) streak++
      else break
    }

    // Calculate completion rate (last 30 days would be better, but using available data)
    const totalLogs = logs.length
    const completedLogs = logs.filter(l => l.value >= habit.target_value).length
    const completionRate = totalLogs > 0 ? (completedLogs / 7) * 100 : 0 // Normalized to last 7 days for now

    return {
      id: habit.id,
      name: habit.name,
      streak,
      completionRate,
      last7Days: last7DaysStatus
    }
  }) || []

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Visualize your progress and trends."
      />

      <AnalyticsSummaryCards metrics={summaryMetrics} />

      <div className="grid gap-6 md:grid-cols-2">
        <WeeklyTrendsChart data={weeklyTrendsData} />
        <MacroDistributionChart data={macroData} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SleepQualityChart data={sleepData} />
        <HabitStreaks habits={habitStreaksData} />
      </div>

      <CalorieWeightChart data={calorieWeightData} />
    </div>
  )
}
