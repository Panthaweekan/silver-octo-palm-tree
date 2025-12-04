import { createServerClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Plus, Apple } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { MealList } from '@/components/meals/MealList'
import { MealFormDialog } from '@/components/meals/MealForm'

export default async function MealsPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch meals for the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]

  const { data: meals } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', thirtyDaysAgoStr)
    .order('date', { ascending: false })

  const hasData = meals && meals.length > 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Food & Calorie Tracking"
        description="Log your meals and track your daily nutrition"
        action={
          <MealFormDialog userId={user.id}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Meal
            </Button>
          </MealFormDialog>
        }
      />

      {!hasData ? (
        <EmptyState
          icon={Apple}
          title="No meals logged yet"
          description="Start tracking your meals to monitor your calorie intake"
          actionLabel="Log your first meal"
          actionHref="#"
        />
      ) : (
        <MealList meals={meals || []} userId={user.id} />
      )}
    </div>
  )
}
