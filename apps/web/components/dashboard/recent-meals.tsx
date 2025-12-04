
import { createServerClient } from '@/lib/supabase/server'
import { RecentMealsView } from './RecentMealsView'

export async function RecentMeals({ userId }: { userId: string }) {
  const supabase = createServerClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: meals } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .order('created_at', { ascending: false })

  const todayMeals = meals || []

  return <RecentMealsView meals={todayMeals} />
}
