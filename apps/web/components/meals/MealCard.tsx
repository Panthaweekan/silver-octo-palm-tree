'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Utensils, Coffee, Cookie, UtensilsCrossed } from 'lucide-react'
import { MealFormDialog } from './MealForm'
import { formatCalories } from '@/lib/formatters'
import { toast } from '@/hooks/use-toast'
import { MealType } from '@/lib/constants'

interface Meal {
  id: string
  date: string
  meal_type: MealType
  food_name: string
  calories: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
  notes?: string
}

interface MealCardProps {
  meal: Meal
  userId: string
}

function getMealIcon(type: MealType) {
  const icons = {
    breakfast: Coffee,
    lunch: UtensilsCrossed,
    dinner: Utensils,
    snack: Cookie,
  }
  return icons[type] || Utensils
}

function getMealColor(type: MealType) {
  const colors = {
    breakfast: 'text-orange-600 bg-orange-500/10 dark:bg-orange-500/20',
    lunch: 'text-blue-600 bg-blue-500/10 dark:bg-blue-500/20',
    dinner: 'text-indigo-600 bg-indigo-500/10 dark:bg-indigo-500/20',
    snack: 'text-green-600 bg-green-500/10 dark:bg-green-500/20',
  }
  return colors[type] || 'text-muted-foreground bg-muted'
}

export function MealCard({ meal, userId }: MealCardProps) {
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const Icon = getMealIcon(meal.meal_type)
  const colorClass = getMealColor(meal.meal_type)

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this meal?')) {
      return
    }

    setDeleting(true)
    const { error } = await supabase.from('meals').delete().eq('id', meal.id)

    if (error) {
      toast.error('Failed to delete meal')
      setDeleting(false)
      return
    }

    toast.success('Meal deleted')
    router.refresh()
  }

  return (
    <div className="flex items-center justify-between p-4 bg-card/40 backdrop-blur-sm rounded-lg border border-border/50 hover:border-border transition-colors">
      <div className="flex items-center gap-4 flex-1">
        {/* Icon */}
        <div className={`p-3 rounded-lg ${colorClass}`}>
          <Icon className="h-6 w-6" />
        </div>

        {/* Details */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">{meal.food_name}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
              {meal.meal_type}
            </span>
          </div>

          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {formatCalories(meal.calories)}
            </span>

            {(meal.protein_g || meal.carbs_g || meal.fat_g) && (
              <div className="flex gap-2 text-xs">
                {meal.protein_g && <span className="text-blue-600 dark:text-blue-400">P: {meal.protein_g}g</span>}
                {meal.carbs_g && <span className="text-green-600 dark:text-green-400">C: {meal.carbs_g}g</span>}
                {meal.fat_g && <span className="text-yellow-600 dark:text-yellow-400">F: {meal.fat_g}g</span>}
              </div>
            )}
          </div>

          {meal.notes && (
            <p className="text-sm text-muted-foreground/80 mt-1 italic">{meal.notes}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <MealFormDialog userId={userId} initialData={meal}>
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4" />
          </Button>
        </MealFormDialog>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    </div>
  )
}
