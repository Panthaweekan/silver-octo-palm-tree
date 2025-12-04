import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { HabitForm } from '@/components/habits/HabitForm'
import { HabitList } from '@/components/habits/HabitList'

export default async function HabitsPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch habits
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  // Fetch today's logs
  const today = new Date().toISOString().split('T')[0]
  const { data: logs } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Habits & Routines"
        description="Build consistency with daily habits."
        action={<HabitForm userId={user.id} />}
      />

      <HabitList
        userId={user.id}
        habits={habits || []}
        logs={logs || []}
      />
    </div>
  )
}
