'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Habit name must be at least 2 characters.',
  }),
  description: z.string().optional(),
  target_count: z.number().min(1),
})

type FormValues = z.infer<typeof formSchema>

export function HabitForm({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      target_count: 1,
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      const { error } = await (supabase.from('habits') as any).insert({
        user_id: userId,
        name: values.name,
        description: values.description,
        target_value: values.target_count,
        // frequency: 'daily', // Removed as column doesn't exist
      })

      if (error) throw error

      toast.success('Habit created successfully!')
      setOpen(false)
      reset()
      router.refresh()
    } catch (error) {
      console.error('Error creating habit:', error)
      toast.error('Failed to create habit')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Habit</DialogTitle>
          <DialogDescription>
            Add a new daily habit to track.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              placeholder="e.g., Drink Water" 
              {...register('name')} 
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="e.g., Drink 3 liters of water throughout the day"
              {...register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_count">Daily Target</Label>
            <Input 
              id="target_count" 
              type="number" 
              min={1} 
              {...register('target_count', { valueAsNumber: true })} 
            />
            <p className="text-sm text-muted-foreground">
              How many times per day? (Default: 1)
            </p>
            {errors.target_count && (
              <p className="text-sm text-red-500">{errors.target_count.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit">Create Habit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
