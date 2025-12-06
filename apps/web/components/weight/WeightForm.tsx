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
import { toast } from '@/hooks/use-toast'
import {
  validateWeight,
  validateBodyFatPercentage,
  validateMeasurement,
  validateDate,
} from '@/lib/validations'
import { Calendar, Scale, Activity, Ruler, FileText } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

interface WeightFormDialogProps {
  userId: string
  children: ReactNode
  initialData?: {
    id: string
    date: string
    weight_kg: number
    body_fat_percentage?: number
    waist_cm?: number
    hips_cm?: number
    chest_cm?: number
    notes?: string
  }
}

export function WeightFormDialog({ userId, children, initialData }: WeightFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const queryClient = useQueryClient()

  const isEditing = !!initialData

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const date = formData.get('date') as string
    const weight_kg = parseFloat(formData.get('weight_kg') as string)
    const body_fat_percentage = formData.get('body_fat_percentage')
      ? parseFloat(formData.get('body_fat_percentage') as string)
      : null
    const waist_cm = formData.get('waist_cm')
      ? parseFloat(formData.get('waist_cm') as string)
      : null
    const hips_cm = formData.get('hips_cm')
      ? parseFloat(formData.get('hips_cm') as string)
      : null
    const chest_cm = formData.get('chest_cm')
      ? parseFloat(formData.get('chest_cm') as string)
      : null
    const notes = (formData.get('notes') as string) || null

    // Validate
    if (!validateDate(date)) {
      toast.error('Invalid date. Date cannot be in the future.')
      setLoading(false)
      return
    }

    if (!validateWeight(weight_kg)) {
      toast.error('Invalid weight. Weight must be between 0 and 500 kg.')
      setLoading(false)
      return
    }

    if (body_fat_percentage && !validateBodyFatPercentage(body_fat_percentage)) {
      toast.error('Invalid body fat percentage. Must be between 0 and 100.')
      setLoading(false)
      return
    }

    if ((waist_cm && !validateMeasurement(waist_cm)) ||
        (hips_cm && !validateMeasurement(hips_cm)) ||
        (chest_cm && !validateMeasurement(chest_cm))) {
      toast.error('Invalid measurement. Must be a positive number less than 500.')
      setLoading(false)
      return
    }

    const data = {
      user_id: userId,
      date,
      weight_kg,
      body_fat_percentage,
      waist_cm,
      hips_cm,
      chest_cm,
      notes,
    }

    try {
      if (isEditing) {
        // Update existing weight entry
        const { error } = await (supabase
          .from('weights') as any)
          .update(data)
          .eq('id', initialData.id)

        if (error) {
          if (error.code === '23505') {
            toast.error('You already have a weight entry for this date.')
          } else {
            toast.error(error.message)
          }
          setLoading(false)
          return
        }

        toast.success('Weight updated successfully!')
      } else {
        // Insert new weight entry
        const { error } = await (supabase.from('weights') as any).insert(data)

        if (error) {
          if (error.code === '23505') {
            toast.error('You already have a weight entry for this date. Edit that entry instead.')
          } else {
            toast.error(error.message)
          }
          setLoading(false)
          return
        }

        toast.success('Weight logged successfully!')
      }

      setOpen(false)
      router.refresh()
      await queryClient.invalidateQueries({ queryKey: ['diary'] })
      await queryClient.invalidateQueries({ queryKey: ['weights'] })
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Weight Entry' : 'Log Weight'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update your weight and body measurements'
                : 'Record your weight and body measurements for today'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Date & Weight Row */}
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
                <Label htmlFor="weight_kg" className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  Weight (kg)
                </Label>
                <Input
                  id="weight_kg"
                  name="weight_kg"
                  type="number"
                  step="0.1"
                  min="1"
                  max="500"
                  defaultValue={initialData?.weight_kg}
                  required
                  placeholder="70.5"
                  className="font-bold"
                />
              </div>
            </div>

            {/* Body Fat % */}
            <div className="space-y-2">
              <Label htmlFor="body_fat_percentage" className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                Body Fat %
              </Label>
              <Input
                id="body_fat_percentage"
                name="body_fat_percentage"
                type="number"
                step="0.1"
                min="0"
                max="100"
                defaultValue={initialData?.body_fat_percentage || ''}
                placeholder="Optional"
              />
            </div>

            {/* Measurements Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Ruler className="h-4 w-4" /> Measurements (cm)
              </Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="waist_cm" className="text-xs text-muted-foreground">Waist</Label>
                  <Input
                    id="waist_cm"
                    name="waist_cm"
                    type="number"
                    step="0.1"
                    min="0"
                    defaultValue={initialData?.waist_cm || ''}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hips_cm" className="text-xs text-muted-foreground">Hips</Label>
                  <Input
                    id="hips_cm"
                    name="hips_cm"
                    type="number"
                    step="0.1"
                    min="0"
                    defaultValue={initialData?.hips_cm || ''}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="chest_cm" className="text-xs text-muted-foreground">Chest</Label>
                  <Input
                    id="chest_cm"
                    name="chest_cm"
                    type="number"
                    step="0.1"
                    min="0"
                    defaultValue={initialData?.chest_cm || ''}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

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
                placeholder="Optional notes"
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
              {loading ? 'Saving...' : isEditing ? 'Update' : 'Log Weight'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
