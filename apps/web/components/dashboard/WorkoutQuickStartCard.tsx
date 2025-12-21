'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dumbbell, Plus, ChevronRight, Clock } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { WorkoutFormDialog } from '@/components/workouts/WorkoutForm'

interface WorkoutQuickStartCardProps {
  workoutCount: number
  lastWorkoutName?: string | null
  userId: string
  userWeight?: number
}

export function WorkoutQuickStartCard({ 
  workoutCount, 
  lastWorkoutName, 
  userId,
  userWeight = 70 
}: WorkoutQuickStartCardProps) {
  const { t } = useLanguage()

  const hasWorkoutToday = workoutCount > 0

  return (
    <Card className="h-full flex flex-col relative overflow-hidden transition-all hover:shadow-lg hover:shadow-indigo-500/10 border-border/60 bg-card/60 backdrop-blur-xl group">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 rounded-full">
            <Dumbbell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          {t('workouts.title')}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between gap-4 relative z-10">
        {hasWorkoutToday ? (
          <div className="space-y-4 animate-fade-in-up">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 relative overflow-hidden group/success">
               <div className="absolute inset-0 bg-green-500/10 translate-y-full group-hover/success:translate-y-0 transition-transform duration-500" />
               <p className="font-medium text-sm relative">Great job!</p>
               <p className="text-xl font-bold relative">Workout Completed</p>
               {lastWorkoutName && <p className="text-xs opacity-80 mt-1 capitalize relative">{lastWorkoutName}</p>}
            </div>
            <Link href="/dashboard/workouts" className="block">
              <Button 
                  variant="outline" 
                  className="w-full justify-between hover:bg-green-500/5 hover:border-green-500/30 transition-all duration-300"
              >
                View Details <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-5 animate-fade-in-up">
            <div>
              <p className="text-muted-foreground text-sm font-medium">No workouts logged yet today.</p>
              <p className="font-semibold text-lg mt-0.5 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                Ready to sweat?
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {/* Use WorkoutFormDialog for logging - no navigation needed */}
              <WorkoutFormDialog userId={userId} userWeight={userWeight}>
                <Button 
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 border-0 transition-transform active:scale-[0.98]"
                >
                    <Plus className="h-4 w-4 mr-2" /> Log Workout
                </Button>
              </WorkoutFormDialog>
              
              <Link href="/dashboard/workouts" className="block">
                <Button 
                    variant="ghost" 
                    className="w-full text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10"
                >
                    <Clock className="h-4 w-4 mr-2" /> View History
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
