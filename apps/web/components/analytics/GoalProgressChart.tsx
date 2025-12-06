'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { Target, TrendingDown, TrendingUp } from 'lucide-react'

interface GoalProgressChartProps {
  goals: {
    currentWeight: number
    targetWeight: number | null
    startWeight: number
    avgCalories: number
    targetCalories: number | null
  }
}

export function GoalProgressChart({ goals }: GoalProgressChartProps) {
  const { t } = useLanguage()
  
  // Weight Progress Calculation
  const weightDiff = Math.abs(goals.startWeight - (goals.targetWeight || goals.startWeight))
  const currentDiff = Math.abs(goals.currentWeight - (goals.targetWeight || goals.currentWeight))
  const weightProgress = goals.targetWeight 
    ? Math.min(100, Math.max(0, ((weightDiff - currentDiff) / weightDiff) * 100))
    : 0

  // Calorie Adherence Calculation
  const calorieAdherence = goals.targetCalories 
    ? Math.min(100, (goals.avgCalories / goals.targetCalories) * 100)
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {t('analytics.goalProgress')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weight Goal */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('analytics.weightGoal')}</span>
            <span className="font-medium">
              {goals.currentWeight} / {goals.targetWeight || '--'} kg
            </span>
          </div>
          <Progress value={weightProgress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t('analytics.current')}</span>
            <span>{t('analytics.target')}</span>
          </div>
        </div>

        {/* Calorie Goal */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('analytics.calorieGoal')}</span>
            <span className={`font-medium ${goals.avgCalories > (goals.targetCalories || 0) ? 'text-red-500' : 'text-green-500'}`}>
              {Math.round(goals.avgCalories)} / {goals.targetCalories || '--'} kcal
            </span>
          </div>
          <Progress 
            value={calorieAdherence} 
            className="h-2" 
            indicatorClassName={goals.avgCalories > (goals.targetCalories || 0) ? 'bg-red-500' : 'bg-green-500'}
          />
           <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
