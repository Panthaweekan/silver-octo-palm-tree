'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MealFormDialog } from '@/components/meals/MealForm'
import { WorkoutFormDialog } from '@/components/workouts/WorkoutForm'
import { WeightFormDialog } from '@/components/weight/WeightForm'
import { HabitForm } from '@/components/habits/HabitForm'

interface DiaryViewProps {
  userId: string
  date: string
  children: React.ReactNode
  summary: {
    caloriesConsumed: number
    caloriesBurned: number
    protein: number
    carbs: number
    fat: number
  }
}

export function DiaryView({ userId, date, children, summary }: DiaryViewProps) {
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
      <div className="flex items-center justify-between bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border/50">
        <Button variant="ghost" size="icon" onClick={handlePrevDay}>
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(currentDate, 'PPP')}
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

        <Button variant="ghost" size="icon" onClick={handleNextDay} disabled={format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Daily Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories</CardTitle>
            <span className="text-xs text-muted-foreground">Net</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.caloriesConsumed - summary.caloriesBurned}</div>
            <p className="text-xs text-muted-foreground">
              {summary.caloriesConsumed} in - {summary.caloriesBurned} out
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protein</CardTitle>
            <span className="text-xs text-muted-foreground">g</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{summary.protein.toFixed(1)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carbs</CardTitle>
            <span className="text-xs text-muted-foreground">g</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{summary.carbs.toFixed(1)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fat</CardTitle>
            <span className="text-xs text-muted-foreground">g</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{summary.fat.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="meals">Meals</TabsTrigger>
            <TabsTrigger value="workouts">Workouts</TabsTrigger>
            <TabsTrigger value="habits">Habits</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <MealFormDialog userId={userId}>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" /> Log Meal
              </Button>
            </MealFormDialog>
            <WorkoutFormDialog userId={userId} userWeight={70}>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" /> Log Workout
              </Button>
            </WorkoutFormDialog>
            <WeightFormDialog userId={userId}>
               <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" /> Log Weight
              </Button>
            </WeightFormDialog>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          {children}
        </TabsContent>
        
        <TabsContent value="meals" className="space-y-4">
          {/* Filtered view logic would go here, or just reuse the children which are already sections */}
          <div className="text-sm text-muted-foreground">
            Switch to 'All' to see the full timeline for now.
          </div>
        </TabsContent>
        
        {/* Other tabs placeholders */}
      </Tabs>
    </div>
  )
}
