'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { StatTile } from '@/components/dashboard/stats'
import { DashboardTimeline } from '@/components/dashboard/DashboardTimeline'
import { GoalsCard } from '@/components/dashboard/GoalsCard'
import { Dumbbell, TrendingUp, Apple, Scale, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    }
  })

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, userLoading, router])

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single()
      return data
    }
  })

  const { data: summary } = useQuery({
    queryKey: ['daily_summary', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('daily_summary')
        .select('*')
        .eq('user_id', user!.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .single()
      return data
    }
  })

  const { data: latestWeight } = useQuery({
    queryKey: ['latest_weight', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('weights')
        .select('weight_kg')
        .eq('user_id', user!.id)
        .order('date', { ascending: false })
        .limit(1)
        .single()
      return data
    }
  })

  const { data: timelineData } = useQuery({
    queryKey: ['dashboard_timeline', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      const [
        { data: meals },
        { data: workouts },
        { data: weights }
      ] = await Promise.all([
        supabase.from('meals').select('*').eq('user_id', user!.id).eq('date', today).order('created_at', { ascending: false }),
        supabase.from('workouts').select('*').eq('user_id', user!.id).eq('date', today).order('created_at', { ascending: false }),
        supabase.from('weights').select('*').eq('user_id', user!.id).order('date', { ascending: false }).limit(5)
      ])

      return {
        meals: meals || [],
        workouts: workouts || [],
        weights: weights || []
      }
    }
  })

  if (userLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  const defaultProfile = {
    full_name: user?.user_metadata?.full_name || 'User',
    height_cm: null,
    target_weight_kg: null,
    activity_level: 'moderate',
    gender: 'other',
    date_of_birth: null
  }

  const currentProfile = profile || defaultProfile

  const profileWithWeight = {
    ...(currentProfile as any),
    weight_kg: (latestWeight as any)?.weight_kg || (currentProfile as any)?.target_weight_kg || 70,
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
      <DashboardHeader userName={(currentProfile as any)?.full_name || 'User'} />

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
          value={(latestWeight as any)?.weight_kg ? `${(latestWeight as any).weight_kg} kg` : '--'}
          description="Latest"
          icon={<Scale className="h-4 w-4 text-purple-600" />}
          className="h-full"
        />

        {/* Timeline (4x2) - Spans full width at bottom */}
        <div className="md:col-span-2 lg:col-span-4 md:row-span-2 h-full">
          <DashboardTimeline 
            userId={user.id}
            meals={timelineData?.meals || []}
            workouts={timelineData?.workouts || []}
            weights={timelineData?.weights || []}
          />
        </div>

      </div>
    </div>
  )
}
