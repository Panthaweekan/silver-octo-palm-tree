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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { validateDate, validateDuration, validateDistance, validateCalories } from '@/lib/validations'
import { WORKOUT_TYPES, WorkoutType } from '@/lib/constants'
import { calculateCaloriesBurned, shouldShowDistance } from '@/lib/workout-utils'
import { Calendar, Clock, MapPin, Flame, FileText, Activity } from 'lucide-react'
import { useQueryClient, useQuery } from '@tanstack/react-query'

import { Database } from '@/types/supabase'

type Workout = Database['public']['Tables']['workouts']['Row']

interface WorkoutFormDialogProps {
  userId: string
  userWeight: number
  children: ReactNode
  initialData?: Workout
}

export function WorkoutFormDialog({
  userId,
  userWeight,
  children,
  initialData,
}: WorkoutFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<WorkoutType>((initialData?.type as WorkoutType) || 'cardio')
  const router = useRouter()
  const supabase = createClient()
  const queryClient = useQueryClient()

  const isEditing = !!initialData
  const showDistance = shouldShowDistance(selectedType)

  const [saveAsRoutine, setSaveAsRoutine] = useState(false)
  const [routineName, setRoutineName] = useState('')
  const [showLoadRoutine, setShowLoadRoutine] = useState(false)

  // Fetch routines
  const { data: routines } = useQuery({
    queryKey: ['workout-routines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_routines')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data
    },
    enabled: showLoadRoutine
  })

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const date = formData.get('date') as string
    const type = formData.get('type') as WorkoutType
    const duration_minutes = parseInt(formData.get('duration_minutes') as string)
    const distance_km = formData.get('distance_km')
      ? parseFloat(formData.get('distance_km') as string)
      : null
    const calories_burned_input = formData.get('calories_burned')
      ? parseInt(formData.get('calories_burned') as string)
      : null
    const notes = (formData.get('notes') as string) || null

    // Validate
    if (!validateDate(date)) {
      toast.error('Invalid date. Date cannot be in the future.')
      setLoading(false)
      return
    }

    if (!validateDuration(duration_minutes)) {
      toast.error('Invalid duration. Duration must be between 1 and 1440 minutes.')
      setLoading(false)
      return
    }

    if (distance_km && !validateDistance(distance_km)) {
      toast.error('Invalid distance. Distance must be a positive number less than 1000 km.')
      setLoading(false)
      return
    }

    // Calculate calories if not provided
    const calories_burned =
      calories_burned_input ||
      calculateCaloriesBurned(type, duration_minutes, userWeight)

    if (!validateCalories(calories_burned)) {
      toast.error('Invalid calories. Must be between 0 and 10000.')
      setLoading(false)
      return
    }

    const data = {
      user_id: userId,
      date,
      type,
      duration_minutes,
      distance_km,
      calories_burned,
      notes,
    }

    try {
      if (isEditing) {
        const { error } = await (supabase
          .from('workouts') as any)
          .update(data)
          .eq('id', initialData.id)

        if (error) throw error
        toast.success('Workout updated successfully!')
      } else {
        const { error } = await (supabase.from('workouts') as any).insert(data)
        if (error) throw error
        
        // Save as routine if checked
        if (saveAsRoutine && routineName.trim()) {
           const routineData = {
              user_id: userId,
              name: routineName.trim(),
              type,
              duration_minutes,
              distance_km,
              calories_burned,
              notes
           }
           const { error: routineError } = await (supabase.from('workout_routines') as any).insert(routineData)
           if (routineError) {
             console.error('Error saving routine:', routineError)
             toast.warning('Workout logged, but failed to save routine.')
           } else {
             toast.success('Workout and routine saved!')
             await queryClient.invalidateQueries({ queryKey: ['workout-routines'] })
           }
        } else {
          toast.success('Workout logged successfully!')
        }
      }

      setOpen(false)
      // Comprehensive query invalidation for state sync
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['diary'] }),
        queryClient.invalidateQueries({ queryKey: ['workouts'] }),
        queryClient.invalidateQueries({ queryKey: ['daily_summary'] }),
        queryClient.invalidateQueries({ queryKey: ['timeline_data'] }),
        queryClient.invalidateQueries({ queryKey: ['recent-items'] }),
        queryClient.invalidateQueries({ queryKey: ['favourites'] }),
      ])
      
      // Reset form defaults
      if (!isEditing) {
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
    setSelectedType(routine.type as WorkoutType)
    
    // Use DOM manipulation to populate uncontrolled inputs
    // We need to wait for a tick because if the type changes, content might change (distance vs calories)
    // However, distance/calories separation is handled by `showDistance` which depends on `selectedType`.
    // `selectedType` is state, so it triggers re-render.
    // We should probably delay setting values until after render, but React state updates can be tricky here.
    // Ideally we should convert these to controlled inputs, but for now we will try to set them.
    // Actually, since we are re-rendering with new `selectedType`, the inputs might be remounted or their defaultValues ignored.
    // Let's rely on standard HTML behavior. If we update the DOM elements, it should work if they exist.
    
    setTimeout(() => {
        const form = document.querySelector('form') as HTMLFormElement
        if (!form) return
        
        const durationInput = form.querySelector('[name="duration_minutes"]') as HTMLInputElement
        if (durationInput) durationInput.value = routine.duration_minutes
        
        const distanceInput = form.querySelector('[name="distance_km"]') as HTMLInputElement
        if (distanceInput) distanceInput.value = routine.distance_km || ''
        
        const caloriesInput = form.querySelector('[name="calories_burned"]') as HTMLInputElement
        if (caloriesInput) caloriesInput.value = routine.calories_burned || ''
        
        const notesInput = form.querySelector('[name="notes"]') as HTMLTextAreaElement
        if (notesInput) notesInput.value = routine.notes || ''
    }, 0)
    
    setShowLoadRoutine(false)
    toast.success(`Loaded routine: ${routine.name}`)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        {showLoadRoutine ? (
          <>
             <DialogHeader>
               <DialogTitle>Load Routine</DialogTitle>
               <DialogDescription>Select a saved routine to auto-fill details.</DialogDescription>
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
                         {routine.type} • {routine.duration_minutes}m {routine.distance_km ? `• ${routine.distance_km}km` : ''}
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
        <form onSubmit={handleSubmit}>
          <DialogHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <DialogTitle>{isEditing ? 'Edit Workout' : 'Log Workout'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update your workout details' : 'Record your workout for today'}
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
                <FileText className="h-3 w-3" /> Load Routine
              </Button>
            )}
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Date & Type Row */}
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
                <Label htmlFor="type" className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  Type
                </Label>
                <Select
                  name="type"
                  defaultValue={selectedType}
                  value={selectedType}
                  onValueChange={(value) => setSelectedType(value as WorkoutType)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKOUT_TYPES.map((workout) => (
                      <SelectItem key={workout.value} value={workout.value}>
                        {workout.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Duration & Distance Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration_minutes" className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Duration (min)
                </Label>
                <Input
                  id="duration_minutes"
                  name="duration_minutes"
                  type="number"
                  min="1"
                  max="1440"
                  defaultValue={initialData?.duration_minutes}
                  required
                  placeholder="30"
                />
              </div>

              {showDistance ? (
                <div className="space-y-2">
                  <Label htmlFor="distance_km" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Distance (km)
                  </Label>
                  <Input
                    id="distance_km"
                    name="distance_km"
                    type="number"
                    step="0.1"
                    min="0"
                    defaultValue={initialData?.distance_km || ''}
                    placeholder="Optional"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="calories_burned" className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    Calories
                  </Label>
                  <Input
                    id="calories_burned"
                    name="calories_burned"
                    type="number"
                    min="0"
                    max="10000"
                    defaultValue={initialData?.calories_burned || ''}
                    placeholder="Auto-calc"
                  />
                </div>
              )}
            </div>

            {/* Calories (if distance shown, show calories in full width or separate row) */}
            {showDistance && (
              <div className="space-y-2">
                <Label htmlFor="calories_burned" className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Calories Burned
                </Label>
                <Input
                  id="calories_burned"
                  name="calories_burned"
                  type="number"
                  min="0"
                  max="10000"
                  defaultValue={initialData?.calories_burned || ''}
                  placeholder="Auto-calculated if left empty"
                />
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                defaultValue={initialData?.notes || ''}
                placeholder="How did it feel? Any personal records?"
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Save as Routine (only for new entries) */}
            {!isEditing && (
               <div className="flex items-center space-x-2 border-t pt-4">
                 <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="save_routine" 
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={saveAsRoutine}
                      onChange={(e) => setSaveAsRoutine(e.target.checked)}
                    />
                    <Label htmlFor="save_routine" className="font-normal cursor-pointer">Save as Routine</Label>
                 </div>
                 {saveAsRoutine && (
                   <Input 
                      className="h-8 flex-1" 
                      placeholder="Routine Name (e.g. Morning 5k)" 
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
              {loading ? 'Saving...' : isEditing ? 'Update Workout' : 'Log Workout'}
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
