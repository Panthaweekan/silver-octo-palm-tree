import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { JournalForm } from '@/components/journal/JournalForm'
import { JournalHistory } from '@/components/journal/JournalHistory'

export default async function JournalPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const today = new Date().toISOString().split('T')[0]

  // Fetch today's entry
  const { data: todayEntry } = await supabase
    .from('daily_journals')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  // Fetch history (excluding today)
  const { data: history } = await supabase
    .from('daily_journals')
    .select('*')
    .eq('user_id', user.id)
    .neq('date', today)
    .order('date', { ascending: false })
    .limit(10)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Journal"
        description="Reflect on your day and track your well-being."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <JournalForm userId={user.id} existingEntry={todayEntry} />
        </div>
        <div>
          <JournalHistory entries={history || []} />
        </div>
      </div>
    </div>
  )
}
