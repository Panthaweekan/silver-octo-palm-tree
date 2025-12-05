import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'

export type FoodItem = Database['public']['Tables']['food_database']['Row']
export type Meal = Database['public']['Tables']['meals']['Row']
export type MealInsert = Database['public']['Tables']['meals']['Insert']

export async function searchFoods(query: string) {
  const supabase = createClient()
  
  if (!query) return []

  const { data, error } = await supabase
    .from('food_database')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(20)

  if (error) {
    console.error('Error searching foods:', error)
    return []
  }

  return data
}

export async function logMeal(meal: MealInsert) {
  const supabase = createClient()

  const { data, error } = await (supabase
    .from('meals') as any)
    .insert(meal)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getDailyNutrition(userId: string, date: string) {
  const supabase = createClient()

  const { data, error } = await (supabase
    .from('meals') as any)
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: true })

  if (error) throw error

  const meals = (data as Meal[]) || []

  // Calculate totals
  const totals = meals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + (meal.protein_g || 0),
    carbs: acc.carbs + (meal.carbs_g || 0),
    fat: acc.fat + (meal.fat_g || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

  return { meals, totals }
}

export async function deleteMeal(mealId: string) {
    const supabase = createClient()
    const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId)
    
    if (error) throw error
}
