import { createServerClient } from '@/lib/supabase/server'
import { RecentWorkoutsView } from './RecentWorkoutsView'

export async function RecentWorkouts({ userId }: { userId: string }) {
  const supabase = createServerClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: workouts } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .order('created_at', { ascending: false })

  const todayWorkouts = workouts || []

  return <RecentWorkoutsView workouts={todayWorkouts} />
}
