'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Plus, Dumbbell, Loader2 } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { WorkoutStats } from '@/components/workouts/WorkoutStats'
import { WorkoutList } from '@/components/workouts/WorkoutList'
import { WorkoutFormDialog } from '@/components/workouts/WorkoutForm'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import type { Database } from '@/types/supabase'

type Workout = Database['public']['Tables']['workouts']['Row']

export default function WorkoutsPage() {
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

  const { data: workoutsData, isLoading: dataLoading } = useQuery({
    queryKey: ['workouts', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]

      const [
        { data: workouts },
        { data: latestWeight }
      ] = await Promise.all([
        supabase.from('workouts').select('*').eq('user_id', user!.id).gte('date', thirtyDaysAgoStr).order('date', { ascending: false }),
        supabase.from('weights').select('weight_kg').eq('user_id', user!.id).order('date', { ascending: false }).limit(1).single()
      ])

      return {
        workouts: (workouts as unknown as Workout[]) || [],
        userWeight: (latestWeight as any)?.weight_kg || 70
      }
    }
  })

  if (userLoading || !user || dataLoading || !workoutsData) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const { workouts, userWeight } = workoutsData
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
          <WorkoutStats workouts={workouts as any} />

          {/* Workout List (grouped by date) */}
          <WorkoutList workouts={workouts as any} userId={user.id} userWeight={userWeight} />
        </>
      )}
    </div>
  )
}
