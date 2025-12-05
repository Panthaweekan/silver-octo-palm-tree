
'use client'

import { createClient } from '@/lib/supabase/client'
import { RecentMealsView } from './RecentMealsView'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

export function RecentMeals({ userId, date }: { userId: string; date?: string }) {
  const supabase = createClient()
  const queryDate = date || new Date().toISOString().split('T')[0]

  const { data: meals, isLoading } = useQuery({
    queryKey: ['recent_meals', userId, queryDate],
    queryFn: async () => {
      const { data } = await supabase
        .from('meals')
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

  // Map database fields to View props if necessary, or ensure types match
  // The View expects: id, name, calories, protein?, carbs?, fat?, created_at
  // The DB returns: id, food_name (mapped to name?), calories, protein_g, carbs_g, fat_g, created_at
  
  const mappedMeals = ((meals as any) || []).map((m: any) => ({
    id: m.id,
    name: m.food_name,
    calories: m.calories,
    protein: m.protein_g,
    carbs: m.carbs_g,
    fat: m.fat_g,
    created_at: m.created_at
  }))

  return <RecentMealsView meals={mappedMeals} />
}
