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

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FoodSearch } from './FoodSearch'
import { useQueryClient, useQuery } from '@tanstack/react-query'

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
  const [foodName, setFoodName] = useState(initialData?.food_name || '')
  const [protein, setProtein] = useState(initialData?.protein_g?.toString() || '')
  const [carbs, setCarbs] = useState(initialData?.carbs_g?.toString() || '')
  const [fat, setFat] = useState(initialData?.fat_g?.toString() || '')
  const [calories, setCalories] = useState(initialData?.calories?.toString() || '')

  const router = useRouter()
  const supabase = createClient()
  const queryClient = useQueryClient()
  
  const [saveAsRoutine, setSaveAsRoutine] = useState(false)
  const [routineName, setRoutineName] = useState('')
  const [showLoadRoutine, setShowLoadRoutine] = useState(false)

  // Fetch routines
  const { data: routines } = useQuery({
    queryKey: ['meal-routines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meal_routines')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data
    },
    enabled: showLoadRoutine
  })

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
    // food_name is now controlled state
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

    if (!foodName.trim()) {
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
      food_name: foodName,
      calories: caloriesVal,
      protein_g,
      carbs_g,
      fat_g,
      notes,
    }

    try {
      if (isEditing) {
        const { error } = await (supabase
          .from('meals') as any)
          .update(data)
          .eq('id', initialData.id)

        if (error) {
          toast.error(error.message)
          setLoading(false)
          return
        }


        toast.success('Meal updated successfully!')
      } else {
        const { error } = await (supabase.from('meals') as any).insert(data)

        if (error) throw error
        
        // Save as routine if checked
        if (saveAsRoutine && routineName.trim()) {
           const routineData = {
              user_id: userId,
              name: routineName.trim(),
              meal_type,
              food_name: foodName,
              calories: caloriesVal,
              protein_g,
              carbs_g,
              fat_g,
              notes
           }
           const { error: routineError } = await (supabase.from('meal_routines') as any).insert(routineData)
           if (routineError) {
             console.error('Error saving routine:', routineError)
             toast.warning('Meal logged, but failed to save routine.')
           } else {
             toast.success('Meal and routine saved!')
             await queryClient.invalidateQueries({ queryKey: ['meal-routines'] })
           }
        } else {
          toast.success('Meal logged successfully!')
        }
      }

      setOpen(false)
      // Comprehensive query invalidation for state sync
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['diary'] }),
        queryClient.invalidateQueries({ queryKey: ['meals'] }),
        queryClient.invalidateQueries({ queryKey: ['daily_summary'] }),
        queryClient.invalidateQueries({ queryKey: ['timeline_data'] }),
        queryClient.invalidateQueries({ queryKey: ['recent-items'] }),
        queryClient.invalidateQueries({ queryKey: ['favourites'] }),
      ])
      
      // Reset form if not editing
      if (!isEditing) {
        setFoodName('')
        setProtein('')
        setCarbs('')
        setFat('')
        setCalories('')
        setSaveAsRoutine(false)
        setRoutineName('')
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadRoutine = (routine: any) => {
    setSelectedType(routine.meal_type as MealType)
    setFoodName(routine.food_name)
    setCalories(routine.calories.toString())
    setProtein(routine.protein_g.toString())
    setCarbs(routine.carbs_g.toString())
    setFat(routine.fat_g.toString())
    
    // Also update notes if possible, but notes is input
    setTimeout(() => {
        const form = document.querySelector('form') as HTMLFormElement
        if (!form) return
        
        const notesInput = form.querySelector('[name="notes"]') as HTMLInputElement
        if (notesInput) notesInput.value = routine.notes || ''
    }, 0)
    
    setShowLoadRoutine(false)
    toast.success(`Loaded routine: ${routine.name}`)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        {showLoadRoutine ? (
          <>
             <DialogHeader>
               <DialogTitle>Load Routine</DialogTitle>
               <DialogDescription>Select a saved meal routine.</DialogDescription>
             </DialogHeader>
             <div className="py-4 max-h-[300px] overflow-y-auto space-y-2">
                {routines?.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm">No routines found.</p>
                ) : (
                  routines?.map((routine: any) => (
                    <Button 
                      key={routine.id} 
                      variant="outline" 
                      className="w-full justify-start text-left flex flex-col items-start h-auto py-2"
                      onClick={() => loadRoutine(routine)}
                    >
                      <span className="font-semibold">{routine.name}</span>
                       <span className="text-xs text-muted-foreground">
                         {routine.meal_type} • {routine.food_name} ({routine.calories} kcal)
                       </span>
                    </Button>
                  ))
                )}
             </div>
             <DialogFooter>
               <Button variant="ghost" onClick={() => setShowLoadRoutine(false)}>Back</Button>
             </DialogFooter>
          </>
        ) : (
        <>
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <DialogTitle>{isEditing ? 'Edit Meal' : 'Log Meal'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update your meal details' : 'Record what you ate'}
            </DialogDescription>
          </div>
          {!isEditing && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="text-primary gap-1"
                onClick={() => setShowLoadRoutine(true)}
              >
                <FileText className="h-3 w-3" /> Load
              </Button>
            )}
        </DialogHeader>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="search">Search Food</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <FoodSearch onSelect={(food) => {
              setFoodName(food.product_name)
              setCalories(Math.round(food.nutriments['energy-kcal_100g'] || 0).toString())
              setProtein(Math.round(food.nutriments.proteins_100g || 0).toString())
              setCarbs(Math.round(food.nutriments.carbohydrates_100g || 0).toString())
              setFat(Math.round(food.nutriments.fat_100g || 0).toString())
              
              // Switch back to manual tab to review/edit
              const manualTab = document.querySelector('[value="manual"]') as HTMLElement
              if (manualTab) manualTab.click()
            }} />
            <p className="text-xs text-muted-foreground text-center">
              Powered by OpenFoodFacts. Data is per 100g/ml.
            </p>
          </TabsContent>

          <TabsContent value="manual">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6 py-4">
                {/* Date & Meal Type Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      value={selectedType}
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
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
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
                
                 {/* Save as Routine (only for new entries) */}
               {!isEditing && (
                 <div className="flex items-center space-x-2 border-t pt-4">
                   <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="save_routine_meal" 
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={saveAsRoutine}
                        onChange={(e) => setSaveAsRoutine(e.target.checked)}
                      />
                      <Label htmlFor="save_routine_meal" className="font-normal cursor-pointer">Save as Routine</Label>
                   </div>
                   {saveAsRoutine && (
                     <Input 
                        className="h-8 flex-1" 
                        placeholder="Routine Name (e.g. My Breakfast)" 
                        value={routineName}
                        onChange={(e) => setRoutineName(e.target.value)}
                        required={saveAsRoutine}
                     />
                   )}
                 </div>
               )}

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
          </TabsContent>
        </Tabs>
        </>
        )}
      </DialogContent>
    </Dialog>
  )
}
