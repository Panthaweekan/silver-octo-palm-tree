'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Line, LineChart, ResponsiveContainer, YAxis, Tooltip } from 'recharts'
import { Scale, TrendingDown, TrendingUp, Minus } from 'lucide-react'

interface MiniWeightChartProps {
  data: { date: string; weight: number }[]
  currentWeight?: number | null
  goalWeight?: number | null
}

export function MiniWeightChart({ data, currentWeight, goalWeight }: MiniWeightChartProps) {
  // Calculate trend
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  // Need at least 2 points for a trend
  let trendIcon = <Minus className="h-4 w-4 text-muted-foreground" />
  let trendText = "Stable"
  let trendColor = "text-muted-foreground"

  if (sortedData.length >= 2) {
      const latest = sortedData[sortedData.length - 1].weight
      const previous = sortedData[0].weight // Compare with oldest in this range (e.g. 14 days ago)
      const diff = latest - previous
      
      if (diff < -0.5) {
          trendIcon = <TrendingDown className="h-4 w-4 text-green-500" />
          trendText = `${Math.abs(diff).toFixed(1)}kg`
          trendColor = "text-green-500"
      } else if (diff > 0.5) {
          trendIcon = <TrendingUp className="h-4 w-4 text-red-500" /> // Gaining weight red? Assume weight loss goal.
          trendText = `+${diff.toFixed(1)}kg`
          trendColor = "text-red-500"
      }
  }

  return (
    <Card className="h-full flex flex-col relative overflow-hidden border-border/50 bg-card/40 backdrop-blur-xl">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">Weight Trend</CardTitle>
        <Scale className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <div className="flex items-baseline justify-between mb-4">
             <div>
                <span className="text-2xl font-bold">{currentWeight ?? '--'}</span>
                <span className="text-sm font-medium text-muted-foreground ml-1">kg</span>
             </div>
             <div className={`flex items-center gap-1 text-sm font-medium ${trendColor} bg-muted/30 px-2 py-0.5 rounded-full`}>
                {trendIcon}
                {trendText} 
             </div>
        </div>
        
        <div className="h-[60px] w-full mt-auto">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sortedData}>
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                    <Tooltip 
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                            return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm text-xs">
                                    <span className="font-bold">{payload[0].value} kg</span>
                                </div>
                            );
                            }
                            return null;
                        }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2} 
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
