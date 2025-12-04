import { createServerClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Plus, Scale } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { WeightList } from '@/components/weight/WeightList'
import { WeightFormDialog } from '@/components/weight/WeightForm'
import { WeightChart } from '@/components/weight/WeightChart'
import { WeightStats } from '@/components/weight/WeightStats'

export default async function WeightPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch weight history
  const { data: weights } = await supabase
    .from('weights')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  // Fetch user profile for height (needed for BMI)
  const { data: profile } = await supabase
    .from('profiles')
    .select('height_cm')
    .eq('id', user.id)
    .single()

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
          <WeightStats weights={weights} heightCm={profile?.height_cm} />
          
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <WeightChart weights={weights} />
            </div>
            <div>
              <WeightList weights={weights} userId={user.id} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
