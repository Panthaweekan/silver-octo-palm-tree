'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dumbbell, Plus, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/components/providers/LanguageProvider'

interface WorkoutQuickStartCardProps {
  workoutCount: number
  lastWorkoutName?: string | null
}

export function WorkoutQuickStartCard({ workoutCount, lastWorkoutName }: WorkoutQuickStartCardProps) {
  const router = useRouter()
  const { t } = useLanguage()

  const hasWorkoutToday = workoutCount > 0

  return (
    <Card className="h-full flex flex-col relative overflow-hidden transition-all hover:shadow-md border-border/50 bg-card/40 backdrop-blur-xl">
       <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-50 pointer-events-none" />
      
      <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-blue-500" />
          {t('workouts.title')}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between gap-4 relative">
        {hasWorkoutToday ? (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400">
               <p className="font-medium text-sm">Great job!</p>
               <p className="text-xl font-bold">Workout Completed</p>
               {lastWorkoutName && <p className="text-xs opacity-80 mt-1">{lastWorkoutName}</p>}
            </div>
            <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => router.push('/dashboard/workouts')}
            >
              View Details <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground text-sm">No workouts logged yet today.</p>
              <p className="font-medium mt-1">Ready to sweat?</p>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
                <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20"
                    onClick={() => router.push('/dashboard/workouts/new')}
                >
                    <Plus className="h-4 w-4 mr-2" /> Start Workout
                </Button>
                 <Button 
                    variant="ghost" 
                    className="w-full text-muted-foreground hover:text-foreground"
                    onClick={() => router.push('/dashboard/workouts/log')}
                >
                    Log Past Workout
                </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
