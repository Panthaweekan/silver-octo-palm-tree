import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { WeeklyTrendsChart } from '@/components/analytics/WeeklyTrendsChart'
import { CalorieWeightChart } from '@/components/analytics/CalorieWeightChart'
import { HabitStreaks } from '@/components/analytics/HabitStreaks'
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
    { data: habitLogs }
  ] = await Promise.all([
    supabase.from('meals').select('*').eq('user_id', user.id).gte('date', last30Days[0]),
    supabase.from('workouts').select('*').eq('user_id', user.id).gte('date', last30Days[0]),
    supabase.from('weights').select('*').eq('user_id', user.id).gte('date', last30Days[0]).order('date', { ascending: true }),
    supabase.from('habits').select('*').eq('user_id', user.id),
    supabase.from('habit_logs').select('*').eq('user_id', user.id).gte('date', last7Days[0])
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

  // Process Calorie vs Weight Data
  const calorieWeightData = last30Days.map(date => {
    const dayMeals = meals?.filter(m => m.date === date) || []
    const dayWeight = weights?.find(w => w.date === date)
    
    return {
      date: format(parseISO(date), 'MMM d'),
      calories: dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0),
      weight: dayWeight ? dayWeight.weight_kg : null
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
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Visualize your progress and trends."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <WeeklyTrendsChart data={weeklyTrendsData} />
        <HabitStreaks habits={habitStreaksData} />
      </div>

      <CalorieWeightChart data={calorieWeightData} />
    </div>
  )
}
