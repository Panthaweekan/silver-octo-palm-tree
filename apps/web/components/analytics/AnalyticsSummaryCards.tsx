'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingDown, TrendingUp, Activity, Moon, Utensils } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'

interface AnalyticsSummaryCardsProps {
  metrics: {
    currentWeight: number
    weightChange: number
    avgCalories: number
    workoutConsistency: number
    avgSleep: number
  }
}

export function AnalyticsSummaryCards({ metrics }: AnalyticsSummaryCardsProps) {
  const { t } = useLanguage()
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('analytics.currentWeight')}</CardTitle>
          {metrics.weightChange <= 0 ? (
             <TrendingDown className="h-4 w-4 text-green-500" />
          ) : (
             <TrendingUp className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.currentWeight} kg</div>
          <p className="text-xs text-muted-foreground">
            {metrics.weightChange > 0 ? '+' : ''}{metrics.weightChange.toFixed(1)} {t('analytics.weightChange')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('analytics.avgCalories')}</CardTitle>
          <Utensils className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(metrics.avgCalories)}</div>
          <p className="text-xs text-muted-foreground">
            {t('analytics.avgCaloriesDesc')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('analytics.workoutConsistency')}</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.workoutConsistency}</div>
          <p className="text-xs text-muted-foreground">
            {t('analytics.workoutConsistencyDesc')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('analytics.avgSleep')}</CardTitle>
          <Moon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.avgSleep.toFixed(1)} h</div>
          <p className="text-xs text-muted-foreground">
            {t('analytics.avgSleepDesc')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
