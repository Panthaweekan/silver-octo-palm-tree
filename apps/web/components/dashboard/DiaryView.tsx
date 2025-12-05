'use client'

import { useRouter } from 'next/navigation'
import { format, addDays, subDays, parseISO } from 'date-fns'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Dumbbell, Scale, Utensils } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { Card, CardContent } from '@/components/ui/card'
import { MealFormDialog } from '@/components/meals/MealForm'
import { WorkoutFormDialog } from '@/components/workouts/WorkoutForm'
import { WeightFormDialog } from '@/components/weight/WeightForm'
import { DiaryTimeline } from './DiaryTimeline'
import { HabitList } from '@/components/habits/HabitList'
import { HabitForm } from '@/components/habits/HabitForm'
import { TodoList } from '@/components/diary/TodoList'
import { SleepTracker } from '@/components/diary/SleepTracker'
import { NutritionSummary } from './NutritionSummary'

interface DiaryViewProps {
  userId: string
  date: string
  summary: {
    caloriesConsumed: number
    caloriesBurned: number
    protein: number
    carbs: number
    fat: number
  }
  meals: any[]
  workouts: any[]
  weights: any[]
  habitLogs: any[]
  habits: any[]
  todos: any[]
  sleepLog: any
}

export function DiaryView({ 
  userId, 
  date, 
  summary,
  meals,
  workouts,
  weights,
  habitLogs,
  habits,
  todos,
  sleepLog
}: DiaryViewProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const currentDate = parseISO(date)

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      const formatted = format(newDate, 'yyyy-MM-dd')
      router.push(`/dashboard/diary?date=${formatted}`)
    }
  }

  const handlePrevDay = () => {
    const newDate = subDays(currentDate, 1)
    router.push(`/dashboard/diary?date=${format(newDate, 'yyyy-MM-dd')}`)
  }

  const handleNextDay = () => {
    const newDate = addDays(currentDate, 1)
    router.push(`/dashboard/diary?date=${format(newDate, 'yyyy-MM-dd')}`)
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Date Navigation */}
        <div className="flex items-center bg-card/50 backdrop-blur-sm p-1.5 rounded-xl border border-border/50 gap-1">
          <Button variant="ghost" size="icon" onClick={handlePrevDay} className="h-8 w-8 shrink-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "h-8 justify-start text-left font-medium min-w-[140px]",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">{format(currentDate, 'PPP')}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNextDay} 
            disabled={format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')} 
            className="h-8 w-8 shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <MealFormDialog userId={userId}>
            <Button size="sm" className="hidden md:flex lg:hidden">
              <Plus className="h-4 w-4 mr-2" /> Log Meal
            </Button>
          </MealFormDialog>
          <MealFormDialog userId={userId}>
             <Button size="icon" className="md:hidden h-9 w-9">
              <Plus className="h-4 w-4" />
            </Button>
          </MealFormDialog>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Main) - Span 8 */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Nutrition Hero - Full Width of Left Col */}
          <div className="h-[300px]">
            <NutritionSummary summary={summary} />
          </div>

          {/* Trackers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Habits - Span 2 (Full Width) on mobile, 1 on md */}
            <div className="md:col-span-2">
               <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold tracking-tight">Habits</h3>
                <HabitForm userId={userId} />
              </div>
              <HabitList userId={userId} habits={habits} logs={habitLogs} />
            </div>

            {/* Todo List */}
            <Card className="border-border/50 bg-card/40 backdrop-blur-xl h-fit">
              <CardContent className="p-6">
                <TodoList userId={userId} date={date} initialTodos={todos} />
              </CardContent>
            </Card>

            {/* Sleep Tracker */}
            <Card className="border-border/50 bg-card/40 backdrop-blur-xl h-fit">
              <CardContent className="p-6">
                <SleepTracker userId={userId} date={date} initialLog={sleepLog} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column (Sidebar) - Span 4 */}
        <div className="lg:col-span-4 space-y-4">
          {/* Mobile-only Quick Actions Row */}
          <div className="flex gap-2 lg:hidden overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
             <WorkoutFormDialog userId={userId} userWeight={70}>
              <Button size="sm" variant="outline" className="shrink-0">
                <Plus className="h-4 w-4 mr-2" /> Log Workout
              </Button>
            </WorkoutFormDialog>
            <WeightFormDialog userId={userId}>
               <Button size="sm" variant="outline" className="shrink-0">
                <Plus className="h-4 w-4 mr-2" /> Log Weight
              </Button>
            </WeightFormDialog>
          </div>

          {/* Desktop Sidebar Header */}
           <div className="hidden lg:flex items-center justify-between">
            <h3 className="text-lg font-semibold">Timeline</h3>
            <div className="flex gap-1">
              <MealFormDialog userId={userId}>
                <Button size="icon" variant="ghost" className="h-8 w-8" title="Log Meal">
                  <Utensils className="h-4 w-4" />
                </Button>
              </MealFormDialog>
              <WorkoutFormDialog userId={userId} userWeight={70}>
                <Button size="icon" variant="ghost" className="h-8 w-8" title="Log Workout">
                  <Dumbbell className="h-4 w-4" />
                </Button>
              </WorkoutFormDialog>
               <WeightFormDialog userId={userId}>
                <Button size="icon" variant="ghost" className="h-8 w-8" title="Log Weight">
                  <Scale className="h-4 w-4" />
                </Button>
              </WeightFormDialog>
            </div>
          </div>

          <Card className="border-border/50 bg-card/40 backdrop-blur-xl min-h-[calc(100vh-200px)]">
            <CardContent className="p-0">
              <div className="p-4 border-b border-border/50 lg:hidden">
                <h3 className="font-semibold">Recent Activity</h3>
              </div>
              <div className="p-4">
                <DiaryTimeline 
                  userId={userId}
                  meals={meals} 
                  workouts={workouts} 
                  weights={weights} 
                  habitLogs={habitLogs} 
                  habits={habits} 
                />
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
