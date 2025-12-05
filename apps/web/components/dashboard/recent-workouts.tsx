'use client'

import { createClient } from '@/lib/supabase/client'
import { RecentWorkoutsView } from './RecentWorkoutsView'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

export function RecentWorkouts({ userId, date }: { userId: string; date?: string }) {
  const supabase = createClient()
  const queryDate = date || new Date().toISOString().split('T')[0]

  const { data: workouts, isLoading } = useQuery({
    queryKey: ['recent_workouts', userId, queryDate],
    queryFn: async () => {
      const { data } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .eq('date', queryDate)
        .order('created_at', { ascending: false })
      return data || []
    }
  })

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <RecentWorkoutsView workouts={(workouts as any) || []} />
}
