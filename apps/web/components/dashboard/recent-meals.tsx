
import { createServerClient } from '@/lib/supabase/server'
import { RecentMealsView } from './RecentMealsView'

export async function RecentMeals({ userId, date }: { userId: string; date?: string }) {
  const supabase = createServerClient()
  const queryDate = date || new Date().toISOString().split('T')[0]

  const { data: meals } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', userId)
    .eq('date', queryDate)
    .order('created_at', { ascending: false })

  const todayMeals = meals || []

  return <RecentMealsView meals={todayMeals} />
}
