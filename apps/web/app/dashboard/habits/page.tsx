'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { HabitForm } from '@/components/habits/HabitForm'
import { HabitList } from '@/components/habits/HabitList'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import type { Database } from '@/types/supabase'

type Habit = Database['public']['Tables']['habits']['Row']
type HabitLog = Database['public']['Tables']['habit_logs']['Row']

export default function HabitsPage() {
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

  const { data: habitsData, isLoading: dataLoading } = useQuery({
    queryKey: ['habits', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      const [
        { data: habits },
        { data: logs }
      ] = await Promise.all([
        supabase.from('habits').select('*').eq('user_id', user!.id).order('created_at', { ascending: true }),
        supabase.from('habit_logs').select('*').eq('user_id', user!.id).eq('date', today)
      ])

      return {
        habits: (habits as unknown as Habit[]) || [],
        logs: (logs as unknown as HabitLog[]) || []
      }
    }
  })

  if (userLoading || !user || dataLoading || !habitsData) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const { habits, logs } = habitsData

  return (
    <div className="space-y-6">
      <PageHeader
        title="Habits & Routines"
        description="Build consistency with daily habits."
        action={<HabitForm userId={user.id} />}
      />

      <HabitList
        userId={user.id}
        habits={habits}
        logs={logs}
      />
    </div>
  )
}
