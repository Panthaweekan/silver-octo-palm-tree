'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  BookOpen,
  User,
  Plus,
  X,
  Utensils,
  Dumbbell,
  Scale,
  Star,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { MealFormDialog } from '@/components/meals/MealForm'
import { WorkoutFormDialog } from '@/components/workouts/WorkoutForm'
import { WeightFormDialog } from '@/components/weight/WeightForm'
import { toast } from '@/hooks/use-toast'

interface BottomNavProps {
  userId?: string
  userWeight?: number
}

export function BottomNav({ userId, userWeight = 70 }: BottomNavProps) {
  const pathname = usePathname()
  const [quickLogOpen, setQuickLogOpen] = useState(false)
  const supabase = createClient()

  // Fetch recent items for quick log
  const { data: recentItems } = useQuery({
    queryKey: ['recent-items', userId],
    enabled: !!userId && quickLogOpen,
    queryFn: async () => {
      const [meals, workouts] = await Promise.all([
        supabase
          .from('meals')
          .select('id, food_name, calories, meal_type')
          .eq('user_id', userId!)
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('workouts')
          .select('id, type, duration_minutes, calories_burned')
          .eq('user_id', userId!)
          .order('created_at', { ascending: false })
          .limit(3),
      ])
      return {
        meals: meals.data || [],
        workouts: workouts.data || [],
      }
    },
  })

  // Fetch favourite routines
  const { data: favourites } = useQuery({
    queryKey: ['favourites', userId],
    enabled: !!userId && quickLogOpen,
    queryFn: async () => {
      const [mealRoutines, workoutRoutines] = await Promise.all([
        supabase
          .from('meal_routines')
          .select('id, name, food_name, calories, meal_type, protein_g, carbs_g, fat_g')
          .eq('user_id', userId!)
          .order('name')
          .limit(5),
        supabase
          .from('workout_routines')
          .select('id, name, type, duration_minutes, calories_burned')
          .eq('user_id', userId!)
          .order('name')
          .limit(5),
      ])
      return {
        meals: mealRoutines.data || [],
        workouts: workoutRoutines.data || [],
      }
    },
  })

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Diary', href: '/dashboard/diary', icon: BookOpen },
    { name: 'Profile', href: '/dashboard/settings', icon: User },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Quick Log Overlay */}
      {quickLogOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setQuickLogOpen(false)}
        />
      )}

      {/* Quick Log Menu */}
      <div
        className={cn(
          'fixed bottom-20 left-1/2 -translate-x-1/2 z-50 lg:hidden transition-all duration-300 ease-out',
          quickLogOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4 pointer-events-none'
        )}
      >
        <div className="bg-card border border-border rounded-2xl shadow-xl p-4 min-w-[280px]">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm text-muted-foreground">Quick Log</span>
            <button
              onClick={() => setQuickLogOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <MealFormDialog userId={userId || ''}>
              <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 transition-colors">
                <Utensils className="h-6 w-6 text-orange-500" />
                <span className="text-xs font-medium">Meal</span>
              </button>
            </MealFormDialog>

            <WorkoutFormDialog userId={userId || ''} userWeight={userWeight}>
              <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 transition-colors">
                <Dumbbell className="h-6 w-6 text-green-500" />
                <span className="text-xs font-medium">Workout</span>
              </button>
            </WorkoutFormDialog>

            <WeightFormDialog userId={userId || ''}>
              <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 transition-colors">
                <Scale className="h-6 w-6 text-blue-500" />
                <span className="text-xs font-medium">Weight</span>
              </button>
            </WeightFormDialog>
          </div>

          {/* Favourites (Routines) */}
          {favourites && (favourites.meals.length > 0 || favourites.workouts.length > 0) && (
            <div className="border-t border-border pt-3">
              <span className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                Favourites
              </span>
              <div className="space-y-2 max-h-[120px] overflow-y-auto">
                {favourites.meals.map((routine: any) => (
                  <QuickFavouriteMeal key={routine.id} routine={routine} userId={userId || ''} />
                ))}
                {favourites.workouts.map((routine: any) => (
                  <QuickFavouriteWorkout key={routine.id} routine={routine} userId={userId || ''} />
                ))}
              </div>
            </div>
          )}

          {/* Recent Items */}
          {recentItems && (recentItems.meals.length > 0 || recentItems.workouts.length > 0) && (
            <div className="border-t border-border pt-3">
              <span className="text-xs text-muted-foreground mb-2 block">Recent</span>
              <div className="space-y-2 max-h-[120px] overflow-y-auto">
                {recentItems.meals.slice(0, 2).map((meal: any) => (
                  <QuickRepeatMeal key={meal.id} meal={meal} userId={userId || ''} />
                ))}
                {recentItems.workouts.slice(0, 2).map((workout: any) => (
                  <QuickRepeatWorkout
                    key={workout.id}
                    workout={workout}
                    userId={userId || ''}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed-bottom-ios left-0 right-0 z-30 bg-background/95 backdrop-blur-xl border-t border-border lg:hidden">
        <div className="flex items-center justify-around h-16 px-4">
          {/* Home */}
          <Link
            href={navItems[0].href}
            className={cn(
              'flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors',
              isActive(navItems[0].href)
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs font-medium">{navItems[0].name}</span>
          </Link>

          {/* Diary */}
          <Link
            href={navItems[1].href}
            className={cn(
              'flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors',
              isActive(navItems[1].href) || pathname.startsWith('/dashboard/diary')
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-xs font-medium">{navItems[1].name}</span>
          </Link>

          {/* FAB - Quick Log */}
          <button
            onClick={() => setQuickLogOpen(!quickLogOpen)}
            className={cn(
              'flex items-center justify-center w-14 h-14 -mt-6 rounded-full shadow-lg transition-all duration-200',
              quickLogOpen
                ? 'bg-muted rotate-45'
                : 'bg-primary hover:bg-primary/90'
            )}
          >
            <Plus
              className={cn(
                'h-7 w-7 transition-colors',
                quickLogOpen ? 'text-foreground' : 'text-primary-foreground'
              )}
            />
          </button>

          {/* Empty spacer for symmetry */}
          <div className="w-16" />

          {/* Profile */}
          <Link
            href={navItems[2].href}
            className={cn(
              'flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors',
              isActive(navItems[2].href)
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <User className="h-5 w-5" />
            <span className="text-xs font-medium">{navItems[2].name}</span>
          </Link>
        </div>
      </nav>
    </>
  )
}

// Quick repeat components
function QuickRepeatMeal({ meal, userId }: { meal: any; userId: string }) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)

  const handleRepeat = async () => {
    setLoading(true)
    try {
      const { error } = await (supabase.from('meals') as any).insert({
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        food_name: meal.food_name,
        calories: meal.calories,
        meal_type: meal.meal_type,
      })
      if (error) throw error
      
      // Invalidate all related queries to sync UI
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['meals'] }),
        queryClient.invalidateQueries({ queryKey: ['diary'] }),
        queryClient.invalidateQueries({ queryKey: ['daily_summary'] }),
        queryClient.invalidateQueries({ queryKey: ['timeline_data'] }),
        queryClient.invalidateQueries({ queryKey: ['recent-items'] }),
      ])
      toast.success(`Added ${meal.food_name}!`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to add meal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleRepeat}
      disabled={loading}
      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors text-left"
    >
      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
        <Utensils className="h-4 w-4 text-orange-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{meal.food_name}</p>
        <p className="text-xs text-muted-foreground">{meal.calories} cal</p>
      </div>
      <Plus className="h-4 w-4 text-muted-foreground" />
    </button>
  )
}

function QuickRepeatWorkout({ workout, userId }: { workout: any; userId: string }) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)

  const handleRepeat = async () => {
    setLoading(true)
    try {
      const { error } = await (supabase.from('workouts') as any).insert({
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        type: workout.type,
        duration_minutes: workout.duration_minutes,
        calories_burned: workout.calories_burned,
      })
      if (error) throw error
      
      // Invalidate all related queries to sync UI
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['workouts'] }),
        queryClient.invalidateQueries({ queryKey: ['diary'] }),
        queryClient.invalidateQueries({ queryKey: ['daily_summary'] }),
        queryClient.invalidateQueries({ queryKey: ['timeline_data'] }),
        queryClient.invalidateQueries({ queryKey: ['recent-items'] }),
      ])
      toast.success(`Added ${workout.type} workout!`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to add workout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleRepeat}
      disabled={loading}
      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors text-left"
    >
      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
        <Dumbbell className="h-4 w-4 text-green-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium capitalize">{workout.type}</p>
        <p className="text-xs text-muted-foreground">{workout.duration_minutes} min</p>
      </div>
      <Plus className="h-4 w-4 text-muted-foreground" />
    </button>
  )
}

// Favourite (Routine) components
function QuickFavouriteMeal({ routine, userId }: { routine: any; userId: string }) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    setLoading(true)
    try {
      const { error } = await (supabase.from('meals') as any).insert({
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        food_name: routine.food_name,
        calories: routine.calories,
        meal_type: routine.meal_type,
        protein_g: routine.protein_g,
        carbs_g: routine.carbs_g,
        fat_g: routine.fat_g,
      })
      if (error) throw error
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['meals'] }),
        queryClient.invalidateQueries({ queryKey: ['diary'] }),
        queryClient.invalidateQueries({ queryKey: ['daily_summary'] }),
        queryClient.invalidateQueries({ queryKey: ['timeline_data'] }),
        queryClient.invalidateQueries({ queryKey: ['recent-items'] }),
      ])
      toast.success(`Added ${routine.name}!`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to add meal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors text-left"
    >
      <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{routine.name}</p>
        <p className="text-xs text-muted-foreground">{routine.calories} cal</p>
      </div>
      <Plus className="h-4 w-4 text-muted-foreground" />
    </button>
  )
}

function QuickFavouriteWorkout({ routine, userId }: { routine: any; userId: string }) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    setLoading(true)
    try {
      const { error } = await (supabase.from('workouts') as any).insert({
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        type: routine.type,
        duration_minutes: routine.duration_minutes,
        calories_burned: routine.calories_burned,
      })
      if (error) throw error
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['workouts'] }),
        queryClient.invalidateQueries({ queryKey: ['diary'] }),
        queryClient.invalidateQueries({ queryKey: ['daily_summary'] }),
        queryClient.invalidateQueries({ queryKey: ['timeline_data'] }),
        queryClient.invalidateQueries({ queryKey: ['recent-items'] }),
      ])
      toast.success(`Added ${routine.name}!`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to add workout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors text-left"
    >
      <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{routine.name}</p>
        <p className="text-xs text-muted-foreground">{routine.duration_minutes} min</p>
      </div>
      <Plus className="h-4 w-4 text-muted-foreground" />
    </button>
  )
}
