'use client'

import { useRouter } from 'next/navigation'
import { format, addDays, subDays, parseISO } from 'date-fns'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MealFormDialog } from '@/components/meals/MealForm'
import { WorkoutFormDialog } from '@/components/workouts/WorkoutForm'
import { WeightFormDialog } from '@/components/weight/WeightForm'
import { DiaryTimeline } from './DiaryTimeline'
import { HabitList } from '@/components/habits/HabitList'
import { TodoList } from '@/components/diary/TodoList'
import { SleepTracker } from '@/components/diary/SleepTracker'

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
      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border/50 gap-2">
        <Button variant="ghost" size="icon" onClick={handlePrevDay} className="shrink-0">
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "flex-1 justify-start text-left font-normal min-w-[140px]",
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

        <Button variant="ghost" size="icon" onClick={handleNextDay} disabled={format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')} className="shrink-0">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Daily Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-sm font-medium">Calories</CardTitle>
            <span className="text-xs text-muted-foreground">Net</span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{summary.caloriesConsumed - summary.caloriesBurned}</div>
            <p className="text-xs text-muted-foreground truncate">
              {summary.caloriesConsumed} in - {summary.caloriesBurned} out
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-sm font-medium">Protein</CardTitle>
            <span className="text-xs text-muted-foreground">g</span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-blue-500">{summary.protein.toFixed(1)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-sm font-medium">Carbs</CardTitle>
            <span className="text-xs text-muted-foreground">g</span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-green-500">{summary.carbs.toFixed(1)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-sm font-medium">Fat</CardTitle>
            <span className="text-xs text-muted-foreground">g</span>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-yellow-500">{summary.fat.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Timeline */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">Timeline</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
            <MealFormDialog userId={userId}>
              <Button size="sm" variant="outline" className="shrink-0">
                <Plus className="h-4 w-4 mr-2" /> Log Meal
              </Button>
            </MealFormDialog>
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
        </div>

        <Card className="border-border/50 bg-card/40 backdrop-blur-xl">
          <CardContent className="p-6">
            <DiaryTimeline 
              userId={userId}
              meals={meals} 
              workouts={workouts} 
              weights={weights} 
              habitLogs={habitLogs} 
              habits={habits} 
            />
          </CardContent>
        </Card>
      </div>

      {/* Habits, Todos, Sleep Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Habits Column */}
        <div className="lg:col-span-3">
          <h2 className="text-lg font-semibold tracking-tight mb-4">Habits</h2>
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
  )
}
