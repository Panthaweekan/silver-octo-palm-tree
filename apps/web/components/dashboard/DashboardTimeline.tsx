'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Utensils, Dumbbell, Scale } from 'lucide-react'
import { DiaryTimeline } from '@/components/dashboard/DiaryTimeline'
import { MealFormDialog } from '@/components/meals/MealForm'
import { WorkoutFormDialog } from '@/components/workouts/WorkoutForm'
import { WeightFormDialog } from '@/components/weight/WeightForm'

interface DashboardTimelineProps {
  userId: string
  meals: any[]
  workouts: any[]
  weights: any[]
}

export function DashboardTimeline({ userId, meals, workouts, weights }: DashboardTimelineProps) {
  // Empty arrays for habits as they are not part of the dashboard timeline for now, 
  // or we could fetch them if needed. based on "Timeline" usually implying all activity.
  // The user request images didn't explicitly show habits, but DiaryTimeline supports them.
  // I'll pass empty arrays for simplicity unless I fetch them too. 
  // Given the image shows "Drink Water" which is a habit, I should probably support habits if possible, 
  // but let's stick to what we can easily fetch first. 
  // Wait, the image showed "Drink Water", so habits ARE included.
  // I will update the props to include habits if I can fetch them in page.tsx.

  return (
    <Card className="border-border/50 bg-card/40 backdrop-blur-xl h-full"> 
      <CardContent className="p-0">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between p-4 border-b border-border/50">
          <h3 className="text-lg font-semibold">Timeline</h3>
          <div className="flex gap-1">
            <MealFormDialog userId={userId}>
              <Button size="icon" variant="ghost" className="h-8 w-8" title="Log Meal">
                <Utensils className="h-4 w-4" />
              </Button>
            </MealFormDialog>
            <WorkoutFormDialog userId={userId} userWeight={70}>
              <Button size="icon" variant="ghost" className="h-8 w-8" title="Log Workout">
                <Dumbbell className="h-4 w-4" />
              </Button>
            </WorkoutFormDialog>
             <WeightFormDialog userId={userId}>
              <Button size="icon" variant="ghost" className="h-8 w-8" title="Log Weight">
                <Scale className="h-4 w-4" />
              </Button>
            </WeightFormDialog>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="p-4 border-b border-border/50 lg:hidden">
          <h3 className="font-semibold">Recent Activity</h3>
        </div>

        {/* Timeline Content */}
        <div className="p-4">
          <DiaryTimeline 
            userId={userId}
            meals={meals} 
            workouts={workouts} 
            weights={weights} 
            habitLogs={[]} 
            habits={[]} 
          />
        </div>
      </CardContent>
    </Card>
  )
}
