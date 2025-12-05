'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingDown, TrendingUp, Activity, Moon, Utensils } from 'lucide-react'

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
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
          {metrics.weightChange <= 0 ? (
             <TrendingDown className="h-4 w-4 text-green-500" />
          ) : (
             <TrendingUp className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.currentWeight} kg</div>
          <p className="text-xs text-muted-foreground">
            {metrics.weightChange > 0 ? '+' : ''}{metrics.weightChange.toFixed(1)} kg from start
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Calories</CardTitle>
          <Utensils className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(metrics.avgCalories)}</div>
          <p className="text-xs text-muted-foreground">
            Daily average (last 7 days)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Workouts</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.workoutConsistency}</div>
          <p className="text-xs text-muted-foreground">
            Workouts this week
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Sleep</CardTitle>
          <Moon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.avgSleep.toFixed(1)} h</div>
          <p className="text-xs text-muted-foreground">
            Daily average (last 7 days)
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
