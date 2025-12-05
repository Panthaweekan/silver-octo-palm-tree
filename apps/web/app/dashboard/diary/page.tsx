import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DiaryView } from '@/components/dashboard/DiaryView'
import { RecentMeals } from '@/components/dashboard/recent-meals'
import { RecentWorkouts } from '@/components/dashboard/recent-workouts'
import { PageHeader } from '@/components/shared/PageHeader'

export const dynamic = 'force-dynamic'

interface DiaryPageProps {
  searchParams: {
    date?: string
  }
}

export default async function DiaryPage({ searchParams }: DiaryPageProps) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const date = searchParams.date || new Date().toISOString().split('T')[0]

  // Fetch summary data for the top cards
  const [
    { data: meals },
    { data: workouts },
    { data: weights },
    { data: habits },
    { data: habitLogs },
    { data: todos },
    { data: sleepLogs }
  ] = await Promise.all([
    supabase.from('meals').select('*').eq('user_id', user.id).eq('date', date).order('created_at', { ascending: true }),
    supabase.from('workouts').select('*').eq('user_id', user.id).eq('date', date).order('created_at', { ascending: true }),
    supabase.from('weights').select('*').eq('user_id', user.id).eq('date', date).order('created_at', { ascending: true }),
    supabase.from('habits').select('*').eq('user_id', user.id),
    supabase.from('habit_logs').select('*').eq('user_id', user.id).eq('date', date).order('created_at', { ascending: true }),
    supabase.from('todos').select('*').eq('user_id', user.id).eq('date', date).order('created_at', { ascending: true }),
    supabase.from('sleep_logs').select('*').eq('user_id', user.id).eq('date', date).single()
  ])

  const summary = {
    caloriesConsumed: meals?.reduce((sum, m) => sum + (m.calories || 0), 0) || 0,
    caloriesBurned: workouts?.reduce((sum, w) => sum + (w.calories_burned || 0), 0) || 0,
    protein: meals?.reduce((sum, m) => sum + (m.protein_g || 0), 0) || 0,
    carbs: meals?.reduce((sum, m) => sum + (m.carbs_g || 0), 0) || 0,
    fat: meals?.reduce((sum, m) => sum + (m.fat_g || 0), 0) || 0,
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
        meals={meals || []}
        workouts={workouts || []}
        weights={weights || []}
        habitLogs={habitLogs || []}
        habits={habits || []}
        todos={todos || []}
        sleepLog={sleepLogs || null}
      />
    </div>
  )
}
