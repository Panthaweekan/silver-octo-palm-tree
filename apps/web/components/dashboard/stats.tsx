import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell, Apple, Scale, TrendingUp } from 'lucide-react'

interface DashboardStatsProps {
  summary: {
    total_calories_consumed: number
    total_calories_burned: number
    total_workout_minutes: number
    workout_count: number
    meal_count: number
  }
}

export function DashboardStats({ summary }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatTile
        title="Workouts Today"
        value={summary.workout_count}
        description={`${summary.total_workout_minutes} minutes total`}
        icon={<Dumbbell className="h-4 w-4 text-blue-600" />}
      />
      <StatTile
        title="Calories Consumed"
        value={summary.total_calories_consumed}
        description="kcal today"
        icon={<Apple className="h-4 w-4 text-green-600" />}
      />
      <StatTile
        title="Calories Burned"
        value={summary.total_calories_burned}
        description="kcal from workouts"
        icon={<TrendingUp className="h-4 w-4 text-orange-600" />}
      />
    </div>
  )
}

export function StatTile({
  title,
  value,
  description,
  icon,
  className,
}: {
  title: string
  value: number | string
  description: string
  icon: React.ReactNode
  className?: string
}) {
  return (
    <Card className={`relative overflow-hidden border-border/50 bg-card/40 backdrop-blur-xl transition-all hover:shadow-md ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="p-2 bg-primary/10 rounded-full">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}
