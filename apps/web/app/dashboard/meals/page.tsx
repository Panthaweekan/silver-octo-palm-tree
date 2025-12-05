'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Plus, Apple, Loader2 } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { MealList } from '@/components/meals/MealList'
import { MealFormDialog } from '@/components/meals/MealForm'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import type { Database } from '@/types/supabase'

type Meal = Database['public']['Tables']['meals']['Row']

export default function MealsPage() {
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

  const { data: mealsData, isLoading: dataLoading } = useQuery({
    queryKey: ['meals', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      const [
        { data: todayMeals },
        { data: recentMeals }
      ] = await Promise.all([
        supabase.from('meals').select('*').eq('user_id', user!.id).eq('date', today).order('created_at', { ascending: false }),
        supabase.from('meals').select('*').eq('user_id', user!.id).neq('date', today).order('date', { ascending: false }).limit(10)
      ])

      return {
        todayMeals: (todayMeals as unknown as Meal[]) || [],
        recentMeals: (recentMeals as unknown as Meal[]) || []
      }
    }
  })

  if (userLoading || !user || dataLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const allMeals = [...(mealsData?.todayMeals || []), ...(mealsData?.recentMeals || [])]
  const hasData = allMeals.length > 0

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
        <MealList meals={allMeals as any} userId={user.id} />
      )}
    </div>
  )
}
