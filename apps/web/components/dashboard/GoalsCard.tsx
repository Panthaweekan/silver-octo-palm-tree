'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Flame, Utensils, AlertCircle } from 'lucide-react'
import { SmartCalculator } from './SmartCalculator'
import { Gender } from '@/lib/constants'
import { Progress } from '@/components/ui/progress'

import { useLanguage } from '@/components/providers/LanguageProvider'

interface GoalsCardProps {
  userId: string
  profile: {
    gender?: Gender
    date_of_birth?: string
    height_cm?: number
    target_calories?: number
    weight_kg?: number // Passed from latest weight entry
  }
  dailySummary: {
    total_calories_consumed: number
    total_calories_burned: number
  }
}

export function GoalsCard({ userId, profile, dailySummary }: GoalsCardProps) {
  const { t } = useLanguage()
  const target = profile.target_calories || 2000
  const consumed = dailySummary.total_calories_consumed
  const burned = dailySummary.total_calories_burned
  
  // Net calories = Consumed - Burned (simplified view)
  // Or typically for weight loss: Consumed vs Target (where Target accounts for TDEE)
  // Let's stick to Consumed vs Target for clarity, as TDEE includes exercise usually.
  // If we want "Net", we would do (Consumed - Exercise) vs (Target - Exercise)? 
  // No, usually Target is "Net Intake Goal" or "Total Intake Goal".
  // Let's assume Target is "Total Intake Goal" (TDEE + Goal Adjustment).
  
  const remaining = target - consumed
  const progress = Math.min((consumed / target) * 100, 100)
  
  const isOver = consumed > target
  const statusColor = isOver ? 'text-red-600' : 'text-green-600'
  const progressBarColor = isOver ? 'bg-red-600' : 'bg-green-600'

  return (
    <Card className="h-full flex flex-col border-border/50 bg-card/40 backdrop-blur-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />
      <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
        <CardTitle className="text-lg font-semibold text-foreground">{t('dashboard.dailyGoals')}</CardTitle>
        <SmartCalculator userId={userId} currentData={profile} />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between gap-6 relative">
        {/* Main Progress Circle or Bar */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <p className="text-sm text-muted-foreground">{t('dashboard.netIntake')}</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-bold ${statusColor}`}>
                  {consumed.toLocaleString()}
                </span>
                <span className="text-muted-foreground">/ {target.toLocaleString()} kcal</span>
              </div>
            </div>
            <div className={`text-sm font-medium ${remaining < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
              {remaining > 0 ? `${remaining.toLocaleString()} left` : `${Math.abs(remaining).toLocaleString()} over`}
            </div>
          </div>
          <Progress value={progress} className="h-3" indicatorClassName={progressBarColor} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-1 text-orange-600">
              <Flame className="h-4 w-4" />
              <span className="text-sm font-medium">{t('dashboard.burnedActive')}</span>
            </div>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-500">
              {burned.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">{t('dashboard.kcalFromWorkouts')}</p>
          </div>

          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-1 text-blue-600">
              <Utensils className="h-4 w-4" />
              <span className="text-sm font-medium">{t('dashboard.caloriesConsumed')}</span>
            </div>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-500">
              {consumed.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">{t('dashboard.kcalToday')}</p>
          </div>
        </div>

        {/* Smart Tip */}
        {!profile.target_calories && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>{t('dashboard.smartGoalTip')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
