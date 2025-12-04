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
  const { data: meals } = await supabase
    .from('meals')
    .select('calories, protein_g, carbs_g, fat_g')
    .eq('user_id', user.id)
    .eq('date', date)

  const { data: workouts } = await supabase
    .from('workouts')
    .select('calories_burned')
    .eq('user_id', user.id)
    .eq('date', date)

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
      
      <DiaryView userId={user.id} date={date} summary={summary}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Meals</h3>
            <RecentMeals userId={user.id} date={date} />
          </div>
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Workouts</h3>
            <RecentWorkouts userId={user.id} date={date} />
          </div>
        </div>
      </DiaryView>
    </div>
  )
}
