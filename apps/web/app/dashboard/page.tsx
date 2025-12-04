import { createServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell, Apple, Scale, Target, TrendingUp, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch today's data
  const today = new Date().toISOString().split('T')[0]

  const [workoutsData, mealsData, weightsData] = await Promise.all([
    supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today),
    supabase
      .from('meals')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today),
    supabase
      .from('weights')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(1),
  ])

  const todayWorkouts = workoutsData.data || []
  const todayMeals = mealsData.data || []
  const latestWeight = weightsData.data?.[0]

  // Calculate today's stats
  const totalCaloriesConsumed = todayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0)
  const totalCaloriesBurned = todayWorkouts.reduce(
    (sum, workout) => sum + (workout.calories_burned || 0),
    0
  )
  const totalWorkoutMinutes = todayWorkouts.reduce(
    (sum, workout) => sum + (workout.duration_minutes || 0),
    0
  )

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Workouts Today"
          value={todayWorkouts.length}
          description={`${totalWorkoutMinutes} minutes total`}
          icon={<Dumbbell className="h-4 w-4 text-blue-600" />}
        />
        <StatCard
          title="Calories Consumed"
          value={totalCaloriesConsumed}
          description="kcal today"
          icon={<Apple className="h-4 w-4 text-green-600" />}
        />
        <StatCard
          title="Calories Burned"
          value={totalCaloriesBurned}
          description="kcal from workouts"
          icon={<TrendingUp className="h-4 w-4 text-orange-600" />}
        />
        <StatCard
          title="Current Weight"
          value={latestWeight ? `${latestWeight.weight_kg} kg` : 'Not set'}
          description={latestWeight ? 'Latest measurement' : 'Add your weight'}
          icon={<Scale className="h-4 w-4 text-purple-600" />}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Log your activities quickly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button asChild variant="outline" className="h-24">
              <Link href="/dashboard/workouts" className="flex flex-col items-center gap-2">
                <Dumbbell className="h-8 w-8 text-blue-600" />
                <span>Log Workout</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-24">
              <Link href="/dashboard/meals" className="flex flex-col items-center gap-2">
                <Apple className="h-8 w-8 text-green-600" />
                <span>Log Meal</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-24">
              <Link href="/dashboard/weight" className="flex flex-col items-center gap-2">
                <Scale className="h-8 w-8 text-purple-600" />
                <span>Log Weight</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Workouts */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Workouts</CardTitle>
          </CardHeader>
          <CardContent>
            {todayWorkouts.length > 0 ? (
              <div className="space-y-3">
                {todayWorkouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium capitalize">{workout.type}</p>
                      <p className="text-sm text-gray-600">
                        {workout.duration_minutes} min
                        {workout.distance_km && ` • ${workout.distance_km} km`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-orange-600">
                        {workout.calories_burned} kcal
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Dumbbell className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No workouts logged today</p>
                <Button asChild variant="link" className="mt-2">
                  <Link href="/dashboard/workouts">Log your first workout</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Meals */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Meals</CardTitle>
          </CardHeader>
          <CardContent>
            {todayMeals.length > 0 ? (
              <div className="space-y-3">
                {todayMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{meal.food_name}</p>
                      <p className="text-sm text-gray-600 capitalize">{meal.meal_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">{meal.calories} kcal</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Apple className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No meals logged today</p>
                <Button asChild variant="link" className="mt-2">
                  <Link href="/dashboard/meals">Log your first meal</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Calorie Balance */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Calorie Balance</CardTitle>
          <CardDescription>Track your energy intake vs expenditure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Calories In</span>
              <span className="text-lg font-bold text-green-600">+{totalCaloriesConsumed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Calories Out</span>
              <span className="text-lg font-bold text-orange-600">-{totalCaloriesBurned}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Net Calories</span>
                <span
                  className={`text-xl font-bold ${
                    totalCaloriesConsumed - totalCaloriesBurned > 0
                      ? 'text-green-600'
                      : 'text-orange-600'
                  }`}
                >
                  {totalCaloriesConsumed - totalCaloriesBurned > 0 ? '+' : ''}
                  {totalCaloriesConsumed - totalCaloriesBurned}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string
  value: number | string
  description: string
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
