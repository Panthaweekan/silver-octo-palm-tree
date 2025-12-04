import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { StatTile } from '@/components/dashboard/stats'
import { RecentWorkouts } from '@/components/dashboard/recent-workouts'
import { RecentMeals } from '@/components/dashboard/recent-meals'
import { GoalsCard } from '@/components/dashboard/GoalsCard'
import { Button } from '@/components/ui/button'
import { Plus, Dumbbell, TrendingUp, Apple, Scale } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Overview of your daily fitness progress',
}

export default async function DashboardPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch today's summary
  const { data: summary } = await supabase
    .from('daily_summary')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', new Date().toISOString().split('T')[0])
    .single()

  // Fetch latest weight for the calculator
  const { data: latestWeight } = await supabase
    .from('weights')
    .select('weight_kg')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(1)
    .single()

  // Combine profile with latest weight if available
  const profileWithWeight = {
    ...profile,
    weight_kg: latestWeight?.weight_kg || profile?.target_weight_kg || 70, // Fallback
  }

  const defaultSummary = {
    total_calories_consumed: 0,
    total_calories_burned: 0,
    total_workout_minutes: 0,
    workout_count: 0,
    meal_count: 0,
  }

  const currentSummary = summary || defaultSummary

  return (
    <div className="space-y-6">
      <DashboardHeader userName={profile?.full_name || 'User'} />

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">
        
        {/* Hero: Goals Card (2x2) */}
        <div className="md:col-span-2 md:row-span-2 h-full">
          <GoalsCard 
            userId={user.id} 
            profile={profileWithWeight} 
            dailySummary={currentSummary} 
          />
        </div>

        {/* Stat: Workouts (1x1) */}
        <StatTile
          title="Workouts"
          value={currentSummary.workout_count}
          description={`${currentSummary.total_workout_minutes} mins`}
          icon={<Dumbbell className="h-4 w-4 text-blue-600" />}
          className="h-full"
        />

        {/* Stat: Calories Burned (1x1) */}
        <StatTile
          title="Burned"
          value={currentSummary.total_calories_burned}
          description="kcal total"
          icon={<TrendingUp className="h-4 w-4 text-orange-600" />}
          className="h-full"
        />

        {/* Stat: Calories Consumed (1x1) */}
        <StatTile
          title="Consumed"
          value={currentSummary.total_calories_consumed}
          description="kcal today"
          icon={<Apple className="h-4 w-4 text-green-600" />}
          className="h-full"
        />

         {/* Stat: Weight (1x1) */}
         <StatTile
          title="Weight"
          value={latestWeight?.weight_kg ? `${latestWeight.weight_kg} kg` : '--'}
          description="Latest"
          icon={<Scale className="h-4 w-4 text-purple-600" />}
          className="h-full"
        />

        {/* List: Recent Workouts (2x2) */}
        <div className="md:col-span-2 md:row-span-2 h-full">
          <RecentWorkouts userId={user.id} />
        </div>

        {/* List: Recent Meals (2x2) */}
        <div className="md:col-span-2 md:row-span-2 h-full">
          <RecentMeals userId={user.id} />
        </div>

      </div>
    </div>
  )
}
