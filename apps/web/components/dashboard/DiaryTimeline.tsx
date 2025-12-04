'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Apple, Dumbbell, Scale, CheckCircle2, Circle, Clock, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { DeleteConfirmationDialog } from '@/components/shared/DeleteConfirmationDialog'
import { MealFormDialog } from '@/components/meals/MealForm'
import { WorkoutFormDialog } from '@/components/workouts/WorkoutForm'
import { WeightFormDialog } from '@/components/weight/WeightForm'

interface TimelineItem {
  id: string
  type: 'meal' | 'workout' | 'weight' | 'habit'
  title: string
  subtitle?: string
  time: string
  value?: string
  icon: React.ElementType
  color: string
  originalData: any
}

interface DiaryTimelineProps {
  userId: string
  meals: any[]
  workouts: any[]
  weights: any[]
  habitLogs: any[]
  habits: any[]
}

export function DiaryTimeline({ userId, meals, workouts, weights, habitLogs, habits }: DiaryTimelineProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Merge and transform data into timeline items
  const items: TimelineItem[] = [
    ...meals.map(m => ({
      id: m.id,
      type: 'meal' as const,
      title: m.food_name,
      subtitle: `${m.meal_type} • ${m.calories} kcal`,
      time: m.created_at,
      value: `${m.calories}`,
      icon: Apple,
      color: 'text-green-500 bg-green-500/10',
      originalData: m
    })),
    ...workouts.map(w => ({
      id: w.id,
      type: 'workout' as const,
      title: w.type,
      subtitle: `${w.duration_minutes} min • ${w.calories_burned} kcal`,
      time: w.created_at,
      value: `${w.calories_burned}`,
      icon: Dumbbell,
      color: 'text-orange-500 bg-orange-500/10',
      originalData: w
    })),
    ...weights.map(w => ({
      id: w.id,
      type: 'weight' as const,
      title: 'Weight Logged',
      subtitle: `${w.weight_kg} kg`,
      time: w.created_at,
      value: `${w.weight_kg}kg`,
      icon: Scale,
      color: 'text-blue-500 bg-blue-500/10',
      originalData: w
    })),
    ...habitLogs.map(l => {
      const habit = habits.find(h => h.id === l.habit_id)
      return {
        id: l.id,
        type: 'habit' as const,
        title: habit?.name || 'Habit',
        subtitle: l.completed ? 'Completed' : 'Logged',
        time: l.created_at,
        value: l.value.toString(),
        icon: l.completed ? CheckCircle2 : Circle,
        color: l.completed ? 'text-purple-500 bg-purple-500/10' : 'text-gray-400 bg-gray-500/10',
        originalData: l
      }
    })
  ].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

  const confirmDelete = (id: string, type: string) => {
    setItemToDelete({ id, type })
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!itemToDelete) return

    setIsDeleting(true)
    try {
      let table = ''
      switch (itemToDelete.type) {
        case 'meal': table = 'meals'; break
        case 'workout': table = 'workouts'; break
        case 'weight': table = 'weights'; break
        case 'habit': table = 'habit_logs'; break
      }

      if (table) {
        const { error } = await supabase.from(table).delete().eq('id', itemToDelete.id)
        if (error) throw error
        
        toast.success('Item deleted successfully')
        router.refresh()
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <div className="p-4 rounded-full bg-muted/50 mb-4">
          <Clock className="w-8 h-8 opacity-50" />
        </div>
        <h3 className="text-lg font-medium text-foreground">No activities yet</h3>
        <p className="text-sm max-w-xs mx-auto mt-1">
          Log your meals, workouts, or habits to see your daily timeline here.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="relative space-y-0">
        {/* Vertical Line - connects center of first icon to center of last icon */}
        <div 
          className="absolute left-6 top-[2.25rem] bottom-[2.25rem] w-px bg-border" 
          aria-hidden="true"
        />

        {items.map((item) => (
          <div key={`${item.type}-${item.id}`} className="relative flex items-start gap-4 py-3 group">
            {/* Time & Icon */}
            <div className="flex flex-col items-center z-10">
              {/* Icon Wrapper with solid background to mask the line */}
              <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-background border border-border/50 shadow-sm transition-colors duration-200 group-hover:border-primary/20">
                {/* Colored Tint Layer */}
                <div className={cn("absolute inset-0 rounded-xl opacity-10", item.color.split(' ')[1].replace('/10', ''))} />
                {/* Icon */}
                <item.icon className={cn("w-5 h-5 z-10", item.color.split(' ')[0])} />
              </div>
            </div>

            {/* Content Card */}
            <div className="flex-1 min-w-0 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-foreground truncate">{item.title}</h4>
                  <span className="text-xs text-muted-foreground font-mono">
                    {format(new Date(item.time), 'h:mm a')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{item.subtitle}</p>
              </div>

              {/* Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {item.type === 'meal' && (
                    <MealFormDialog userId={userId} initialData={item.originalData}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                    </MealFormDialog>
                  )}
                  {item.type === 'workout' && (
                    <WorkoutFormDialog userId={userId} userWeight={70} initialData={item.originalData}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                    </WorkoutFormDialog>
                  )}
                  {item.type === 'weight' && (
                    <WeightFormDialog userId={userId} initialData={item.originalData}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                    </WeightFormDialog>
                  )}
                  
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600"
                    onClick={() => confirmDelete(item.id, item.type)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      <DeleteConfirmationDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  )
}
