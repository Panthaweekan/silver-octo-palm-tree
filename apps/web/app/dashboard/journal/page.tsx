'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { JournalForm } from '@/components/journal/JournalForm'
import { JournalHistory } from '@/components/journal/JournalHistory'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import type { Database } from '@/types/supabase'

type JournalEntry = Database['public']['Tables']['daily_journals']['Row']

export default function JournalPage() {
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

  const { data: journalData, isLoading: dataLoading } = useQuery({
    queryKey: ['journal', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      const [
        { data: todayEntry },
        { data: history }
      ] = await Promise.all([
        supabase.from('daily_journals').select('*').eq('user_id', user!.id).eq('date', today).single(),
        supabase.from('daily_journals').select('*').eq('user_id', user!.id).neq('date', today).order('date', { ascending: false }).limit(10)
      ])

      return {
        todayEntry: (todayEntry as unknown as JournalEntry) || null,
        history: (history as unknown as JournalEntry[]) || []
      }
    }
  })

  if (userLoading || !user || dataLoading || !journalData) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const { todayEntry, history } = journalData

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Journal"
        description="Reflect on your day and track your well-being."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <JournalForm userId={user.id} existingEntry={todayEntry as any} />
        </div>
        <div>
          <JournalHistory entries={history} />
        </div>
      </div>
    </div>
  )
}
