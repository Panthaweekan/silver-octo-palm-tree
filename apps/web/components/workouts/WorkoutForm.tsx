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

interface WorkoutFormDialogProps {
  userId: string
  userWeight: number
  children: ReactNode
  initialData?: {
    id: string
    date: string
    type: WorkoutType
    duration_minutes: number
    distance_km?: number
    calories_burned?: number
    notes?: string
  }
}

export function WorkoutFormDialog({
  userId,
  userWeight,
  children,
  initialData,
}: WorkoutFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<WorkoutType>(initialData?.type || 'cardio')
  const router = useRouter()
  const supabase = createClient()

  const isEditing = !!initialData
  const showDistance = shouldShowDistance(selectedType)

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
          .insert(data)
          .eq('id', initialData.id)

        if (error) {
          toast.error(error.message)
          setLoading(false)
          return
        }

        toast.success('Workout updated successfully!')
      } else {
        const { error } = await (supabase.from('workouts') as any).insert(data)

        if (error) {
          toast.error(error.message)
          setLoading(false)
          return
        }

        toast.success('Workout logged successfully!')
      }

      setOpen(false)
      router.refresh()
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
            <DialogTitle>{isEditing ? 'Edit Workout' : 'Log Workout'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update your workout details' : 'Record your workout for today'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Date & Type Row */}
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
                <Label htmlFor="type" className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  Type
                </Label>
                <Select
                  name="type"
                  defaultValue={selectedType}
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
            <div className="grid grid-cols-2 gap-4">
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
      </DialogContent>
    </Dialog>
  )
}
