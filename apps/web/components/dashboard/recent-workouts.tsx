import { createServerClient } from '@/lib/supabase/server'
import { RecentWorkoutsView } from './RecentWorkoutsView'

export async function RecentWorkouts({ userId, date }: { userId: string; date?: string }) {
  const supabase = createServerClient()
  const queryDate = date || new Date().toISOString().split('T')[0]

  const { data: workouts } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .eq('date', queryDate)
    .order('created_at', { ascending: false })

  const todayWorkouts = workouts || []

  return <RecentWorkoutsView workouts={todayWorkouts} />
}
