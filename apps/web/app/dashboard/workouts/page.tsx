'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Plus, Dumbbell, Loader2, ChevronDown } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { WorkoutStats } from '@/components/workouts/WorkoutStats'
import { WorkoutList } from '@/components/workouts/WorkoutList'
import { WorkoutFormDialog } from '@/components/workouts/WorkoutForm'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import type { Database } from '@/types/supabase'

type Workout = Database['public']['Tables']['workouts']['Row']

const PAGE_SIZE = 10

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

  // 1. Stats Query (Last 30 Days Only)
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['workouts_stats', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]

      const [
        { data: workouts },
        { data: latestWeight }
      ] = await Promise.all([
        supabase
            .from('workouts')
            .select('id, duration_minutes, calories_burned, date')
            .eq('user_id', user!.id)
            .gte('date', thirtyDaysAgoStr),
        supabase.from('weights').select('weight_kg').eq('user_id', user!.id).order('date', { ascending: false }).limit(1).single()
      ])

      return {
        // We cast to Workout for compatibility with WorkoutStats, though we only fetched a subset of fields
        // This is safe because WorkoutStats only uses these specific fields calculate totals
        workouts: (workouts as unknown as Workout[]) || [],
        userWeight: (latestWeight as any)?.weight_kg || 70
      }
    }
  })

  // 2. Paginated List Query (All History)
  const { 
    data: listData, 
    isLoading: listLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['workouts_list', user?.id],
    enabled: !!user,
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
        const from = pageParam * PAGE_SIZE
        const to = from + PAGE_SIZE - 1
        
        const { data } = await supabase
            .from('workouts')
            .select('*')
            .eq('user_id', user!.id)
            .order('date', { ascending: false })
            .range(from, to)
            
        return (data as Workout[]) || []
    },
    getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === PAGE_SIZE ? allPages.length : undefined
    }
  })

  if (userLoading || !user || statsLoading || listLoading || !statsData) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const { workouts: statsWorkouts, userWeight } = statsData
  const listWorkouts = listData?.pages.flatMap(page => page) || []
  const hasData = (statsWorkouts && statsWorkouts.length > 0) || (listWorkouts && listWorkouts.length > 0)

  return (
    <div className="space-y-6 pb-8">
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
          {/* Stats Cards (Last 30 Days) */}
          <WorkoutStats workouts={statsWorkouts as any} />

          {/* Workout List (Infinite Scroll) */}
          <div className="space-y-4">
              <WorkoutList workouts={listWorkouts} userId={user.id} userWeight={userWeight} />

              {hasNextPage && (
                 <div className="flex justify-center pt-2">
                     <Button 
                        variant="outline" 
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="w-full max-w-xs"
                     >
                        {isFetchingNextPage ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            <>
                                <ChevronDown className="mr-2 h-4 w-4" />
                                Load More History
                            </>
                        )}
                     </Button>
                 </div>
             )}
          </div>
        </>
      )}
    </div>
  )
}
