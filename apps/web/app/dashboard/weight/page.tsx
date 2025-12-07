'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Plus, Scale, Loader2, ChevronDown } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { WeightList } from '@/components/weight/WeightList'
import { WeightFormDialog } from '@/components/weight/WeightForm'
import { WeightChart } from '@/components/weight/WeightChart'
import { WeightStats } from '@/components/weight/WeightStats'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, Fragment } from 'react'
import type { Database } from '@/types/supabase'

type Weight = Database['public']['Tables']['weights']['Row']

const PAGE_SIZE = 10

export default function WeightPage() {
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

  // 1. Lightweight Query for Stats & Charts (All History)
  // We only need date and weight/body fat for the charts/stats, not notes or measurements
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['weight_chart', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [
        { data: weights },
        { data: profile }
      ] = await Promise.all([
        supabase
            .from('weights')
            .select('date, weight_kg, body_fat_percentage')
            .eq('user_id', user!.id)
            .order('date', { ascending: false }),
        supabase.from('profiles').select('height_cm').eq('id', user!.id).single()
      ])

      return {
        weights: (weights as Pick<Weight, 'date' | 'weight_kg' | 'body_fat_percentage'>[]) || [],
        heightCm: (profile as any)?.height_cm
      }
    }
  })

  // 2. Paginated Query for the List (Detailed View)
  const { 
    data: listData, 
    isLoading: listLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['weight_list', user?.id],
    enabled: !!user,
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
        const from = pageParam * PAGE_SIZE
        const to = from + PAGE_SIZE - 1
        
        const { data } = await supabase
            .from('weights')
            .select('*')
            .eq('user_id', user!.id)
            .order('date', { ascending: false })
            .range(from, to)
            
        return (data as Weight[]) || []
    },
    getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === PAGE_SIZE ? allPages.length : undefined
    }
  })

  if (userLoading || !user || chartLoading || listLoading || !chartData) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const { weights: chartWeights, heightCm } = chartData
  const hasData = chartWeights && chartWeights.length > 0
  
  // Flatten pages for the list
  const listWeights = listData?.pages.flatMap(page => page) || []

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Weight & Body Metrics"
        description="Track your weight, body fat, and measurements"
        action={
          <WeightFormDialog userId={user.id}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Weight
            </Button>
          </WeightFormDialog>
        }
      />

      {!hasData ? (
        <EmptyState
          icon={Scale}
          title="No weight entries yet"
          description="Start tracking your weight to see your progress over time"
          actionLabel="Log your first entry"
          actionHref="#"
        />
      ) : (
        <>
          {/* Stats & Chart use the lightweight full history */}
          <WeightStats weights={chartWeights as any} heightCm={heightCm} />
          
          <div className="grid gap-6 lg:grid-cols-1">
            <div className="lg:col-span-1">
              <WeightChart weights={chartWeights as any} />
            </div>
          </div>
          
          {/* List uses the paginated detailed history */}
          <div className="space-y-4">
             <WeightList weights={listWeights} userId={user.id} />
             
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
