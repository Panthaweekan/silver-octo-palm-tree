'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface NutritionSummaryProps {
  summary: {
    caloriesConsumed: number
    caloriesBurned: number
    protein: number
    carbs: number
    fat: number
  }
}

export function NutritionSummary({ summary }: NutritionSummaryProps) {
  const netCalories = summary.caloriesConsumed - summary.caloriesBurned
  const calorieTarget = 2000 // TODO: Get from user settings eventually
  const calorieProgress = Math.min((netCalories / calorieTarget) * 100, 100)

  // Macro targets (approximate standard breakdown)
  const proteinTarget = 150
  const carbsTarget = 250
  const fatTarget = 70

  return (
    <Card className="h-full border-border/50 bg-card/40 backdrop-blur-xl overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      
      <CardHeader className="pag-6 pb-2 relative">
        <CardTitle className="text-lg font-semibold">Nutrition Overview</CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 pt-2 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* Main Calorie Ring / Display */}
          <div className="flex flex-col items-center justify-center space-y-2 p-4 rounded-2xl bg-background/50 border border-border/50">
            <div className="relative flex items-center justify-center w-32 h-32">
              {/* Circular Progress Placeholder - utilizing SVG for a quick ring */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-muted/20"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className={cn(
                    "transition-all duration-1000 ease-out",
                    netCalories > calorieTarget ? "text-red-500" : "text-primary"
                  )}
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * calorieProgress) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-bold tracking-tighter">
                  {netCalories}
                </span>
                <span className="text-[10px] uppercase text-muted-foreground font-medium">
                  Net Cals
                </span>
              </div>
            </div>
            
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>{summary.caloriesConsumed} In</span>
              <span>•</span>
              <span>{summary.caloriesBurned} Out</span>
            </div>
          </div>

          {/* Macros List */}
          <div className="space-y-5">
            <MacroRow 
              label="Protein" 
              value={summary.protein} 
              target={proteinTarget} 
              color="bg-blue-500" 
              textColor="text-blue-500"
            />
            <MacroRow 
              label="Carbs" 
              value={summary.carbs} 
              target={carbsTarget} 
              color="bg-green-500" 
              textColor="text-green-500"
            />
            <MacroRow 
              label="Fat" 
              value={summary.fat} 
              target={fatTarget} 
              color="bg-yellow-500" 
              textColor="text-yellow-500"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MacroRow({ 
  label, 
  value, 
  target, 
  color,
  textColor
}: { 
  label: string
  value: number
  target: number
  color: string
  textColor: string
}) {
  const percentage = Math.min((value / target) * 100, 100)
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="font-bold">
          {Math.round(value)}
          <span className="text-muted-foreground font-normal ml-1">/ {target}g</span>
        </span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-500", color)} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
