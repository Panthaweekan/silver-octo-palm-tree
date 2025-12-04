import { createServerClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Plus, Dumbbell } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { WorkoutStats } from '@/components/workouts/WorkoutStats'
import { WorkoutList } from '@/components/workouts/WorkoutList'
import { WorkoutFormDialog } from '@/components/workouts/WorkoutForm'

export default async function WorkoutsPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch workouts for the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]

  const { data: workouts } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', thirtyDaysAgoStr)
    .order('date', { ascending: false })

  // Fetch user's current weight for calorie calculations
  const { data: latestWeight } = await supabase
    .from('weights')
    .select('weight_kg')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(1)
    .single()

  const userWeight = latestWeight?.weight_kg || 70 // Default to 70kg if no weight logged

  const hasData = workouts && workouts.length > 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workout Tracking"
        description="Log your workouts and track your fitness progress"
        action={
          <WorkoutFormDialog userId={user.id} userWeight={userWeight}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Workout
            </Button>
          </WorkoutFormDialog>
        }
      />

      {!hasData ? (
        <EmptyState
          icon={Dumbbell}
          title="No workouts logged yet"
          description="Start tracking your workouts to monitor your fitness progress"
          actionLabel="Log your first workout"
          actionHref="#"
        />
      ) : (
        <>
          {/* Stats Cards */}
          <WorkoutStats workouts={workouts || []} />

          {/* Workout List (grouped by date) */}
          <WorkoutList workouts={workouts || []} userId={user.id} userWeight={userWeight} />
        </>
      )}
    </div>
  )
}
