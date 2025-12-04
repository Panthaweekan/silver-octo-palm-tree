'use client'

import { useState, FormEvent, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { validateDate, validateCalories } from '@/lib/validations'
import { MEAL_TYPES, MealType, CALORIES_PER_GRAM } from '@/lib/constants'
import { Calendar, Utensils, Flame, FileText, Beef, Wheat, Droplet } from 'lucide-react'

interface MealFormDialogProps {
  userId: string
  children: ReactNode
  initialData?: {
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
}

export function MealFormDialog({
  userId,
  children,
  initialData,
}: MealFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<MealType>(initialData?.meal_type || 'breakfast')
  
  // State for auto-calculation
  const [protein, setProtein] = useState(initialData?.protein_g?.toString() || '')
  const [carbs, setCarbs] = useState(initialData?.carbs_g?.toString() || '')
  const [fat, setFat] = useState(initialData?.fat_g?.toString() || '')
  const [calories, setCalories] = useState(initialData?.calories?.toString() || '')

  const router = useRouter()
  const supabase = createClient()

  const isEditing = !!initialData

  // Auto-calculate calories when macros change
  function calculateCalories() {
    const p = parseFloat(protein) || 0
    const c = parseFloat(carbs) || 0
    const f = parseFloat(fat) || 0
    
    if (p > 0 || c > 0 || f > 0) {
      const calculated = Math.round(
        p * CALORIES_PER_GRAM.protein +
        c * CALORIES_PER_GRAM.carbs +
        f * CALORIES_PER_GRAM.fat
      )
      setCalories(calculated.toString())
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const date = formData.get('date') as string
    const meal_type = formData.get('meal_type') as MealType
    const food_name = formData.get('food_name') as string
    const caloriesVal = parseInt(calories)
    const protein_g = protein ? parseFloat(protein) : 0
    const carbs_g = carbs ? parseFloat(carbs) : 0
    const fat_g = fat ? parseFloat(fat) : 0
    const notes = (formData.get('notes') as string) || null

    // Validate
    if (!validateDate(date)) {
      toast.error('Invalid date. Date cannot be in the future.')
      setLoading(false)
      return
    }

    if (!food_name.trim()) {
      toast.error('Please enter a food name.')
      setLoading(false)
      return
    }

    if (!validateCalories(caloriesVal)) {
      toast.error('Invalid calories. Must be between 0 and 10000.')
      setLoading(false)
      return
    }

    const data = {
      user_id: userId,
      date,
      meal_type,
      food_name,
      calories: caloriesVal,
      protein_g,
      carbs_g,
      fat_g,
      notes,
    }

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('meals')
          .update(data)
          .eq('id', initialData.id)

        if (error) {
          toast.error(error.message)
          setLoading(false)
          return
        }

        toast.success('Meal updated successfully!')
      } else {
        const { error } = await supabase.from('meals').insert(data)

        if (error) {
          toast.error(error.message)
          setLoading(false)
          return
        }

        toast.success('Meal logged successfully!')
      }

      setOpen(false)
      router.refresh()
      
      // Reset form if not editing
      if (!isEditing) {
        setProtein('')
        setCarbs('')
        setFat('')
        setCalories('')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Meal' : 'Log Meal'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update your meal details' : 'Record what you ate'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Date & Meal Type Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Date
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={initialData?.date || today}
                  max={today}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meal_type" className="flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-muted-foreground" />
                  Meal Type
                </Label>
                <Select
                  name="meal_type"
                  defaultValue={selectedType}
                  onValueChange={(value) => setSelectedType(value as MealType)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="mr-2">{type.emoji}</span>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Food Name */}
            <div className="space-y-2">
              <Label htmlFor="food_name" className="flex items-center gap-2">
                <Utensils className="h-4 w-4 text-muted-foreground" />
                Food Name
              </Label>
              <Input
                id="food_name"
                name="food_name"
                defaultValue={initialData?.food_name}
                required
                placeholder="e.g., Chicken Rice"
              />
            </div>

            {/* Macros Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">
                Macronutrients (Optional)
              </Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="protein_g" className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                    <Beef className="h-3 w-3" /> Protein
                  </Label>
                  <Input
                    id="protein_g"
                    name="protein_g"
                    type="number"
                    min="0"
                    step="0.1"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    onBlur={calculateCalories}
                    placeholder="0g"
                    className="border-blue-100 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="carbs_g" className="text-xs font-semibold text-green-600 flex items-center gap-1">
                    <Wheat className="h-3 w-3" /> Carbs
                  </Label>
                  <Input
                    id="carbs_g"
                    name="carbs_g"
                    type="number"
                    min="0"
                    step="0.1"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    onBlur={calculateCalories}
                    placeholder="0g"
                    className="border-green-100 focus-visible:ring-green-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fat_g" className="text-xs font-semibold text-yellow-600 flex items-center gap-1">
                    <Droplet className="h-3 w-3" /> Fat
                  </Label>
                  <Input
                    id="fat_g"
                    name="fat_g"
                    type="number"
                    min="0"
                    step="0.1"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    onBlur={calculateCalories}
                    placeholder="0g"
                    className="border-yellow-100 focus-visible:ring-yellow-500"
                  />
                </div>
              </div>
            </div>

            {/* Calories */}
            <div className="space-y-2">
              <Label htmlFor="calories" className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                Total Calories
              </Label>
              <Input
                id="calories"
                name="calories"
                type="number"
                min="0"
                max="10000"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                required
                className="font-bold text-lg"
                placeholder="0"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Notes
              </Label>
              <Input
                id="notes"
                name="notes"
                defaultValue={initialData?.notes || ''}
                placeholder="Optional notes"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Saving...' : isEditing ? 'Update Meal' : 'Log Meal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
