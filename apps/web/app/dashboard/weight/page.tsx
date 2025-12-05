'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Plus, Scale, Loader2 } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { WeightList } from '@/components/weight/WeightList'
import { WeightFormDialog } from '@/components/weight/WeightForm'
import { WeightChart } from '@/components/weight/WeightChart'
import { WeightStats } from '@/components/weight/WeightStats'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import type { Database } from '@/types/supabase'

type Weight = Database['public']['Tables']['weights']['Row']

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

  const { data: weightData, isLoading: dataLoading } = useQuery({
    queryKey: ['weight', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [
        { data: weights },
        { data: profile }
      ] = await Promise.all([
        supabase.from('weights').select('*').eq('user_id', user!.id).order('date', { ascending: false }),
        supabase.from('profiles').select('height_cm').eq('id', user!.id).single()
      ])

      return {
        weights: (weights as unknown as Weight[]) || [],
        heightCm: (profile as any)?.height_cm
      }
    }
  })

  if (userLoading || !user || dataLoading || !weightData) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const { weights, heightCm } = weightData
  const hasData = weights && weights.length > 0

  return (
    <div className="space-y-6">
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
          <WeightStats weights={weights as any} heightCm={heightCm} />
          
          <div className="grid gap-6 lg:grid-cols-1">
            <div className="lg:col-span-1">
              <WeightChart weights={weights as any} />
            </div>
          </div>
          
          <WeightList weights={weights as any} userId={user.id} />
        </>
      )}
    </div>
  )
}
