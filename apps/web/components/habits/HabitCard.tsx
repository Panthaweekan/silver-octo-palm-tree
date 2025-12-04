'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Plus, Minus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface HabitCardProps {
  habit: {
    id: string
    name: string
    description: string | null
    target_value: number
  }
  log: {
    id?: string
    value: number
  } | null
  userId: string
}

export function HabitCard({ habit, log, userId }: HabitCardProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  // const { toast } = useToast() // Removed, importing directly

  const currentCount = log?.value || 0
  const isCompleted = currentCount >= habit.target_value
  const progress = Math.min((currentCount / habit.target_value) * 100, 100)

  async function updateProgress(newCount: number) {
    if (loading) return
    setLoading(true)

    try {
      const today = new Date().toISOString().split('T')[0]
      
      if (log?.id) {
        // Update existing log
        const { error } = await supabase
          .from('habit_logs')
          .update({ value: newCount })
          .eq('id', log.id)

        if (error) throw error
      } else {
        // Create new log
        const { error } = await supabase
          .from('habit_logs')
          .insert({
            user_id: userId,
            habit_id: habit.id,
            date: today,
            value: newCount,
          })

        if (error) throw error
      }

      router.refresh()
    } catch (error) {
      console.error('Error updating habit:', error)
      toast.error('Failed to update habit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={cn("transition-all", isCompleted ? "bg-green-50 border-green-200" : "")}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className={cn("text-lg", isCompleted ? "text-green-900" : "")}>
              {habit.name}
            </CardTitle>
            {habit.description && (
              <p className="text-sm text-gray-500 mt-1">{habit.description}</p>
            )}
          </div>
          {isCompleted && (
            <div className="bg-green-100 p-1.5 rounded-full">
              <Check className="h-4 w-4 text-green-600" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm font-medium text-gray-600">
            {currentCount} / {habit.target_value}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateProgress(Math.max(0, currentCount - 1))}
              disabled={loading || currentCount === 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              variant={isCompleted ? "default" : "outline"}
              size="icon"
              className={cn("h-8 w-8", isCompleted ? "bg-green-600 hover:bg-green-700" : "")}
              onClick={() => updateProgress(currentCount + 1)}
              disabled={loading}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-500", isCompleted ? "bg-green-500" : "bg-blue-500")}
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
