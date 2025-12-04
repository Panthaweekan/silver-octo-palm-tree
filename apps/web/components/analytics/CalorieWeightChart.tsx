'use client'

import { useState } from 'react'
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface CalorieWeightChartProps {
  data: {
    date: string
    weight: number | null
    calories: number
    bmr?: number
    tdee?: number
  }[]
}

export function CalorieWeightChart({ data }: CalorieWeightChartProps) {
  const [showBMR, setShowBMR] = useState(false)
  const [showTDEE, setShowTDEE] = useState(false)

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weight vs. Calories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No data available for the last 30 days.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <CardTitle>Weight vs. Calories</CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch id="show-bmr" checked={showBMR} onCheckedChange={setShowBMR} />
            <Label htmlFor="show-bmr">BMR</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="show-tdee" checked={showTDEE} onCheckedChange={setShowTDEE} />
            <Label htmlFor="show-tdee">TDEE</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                scale="point" 
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                yAxisId="left" 
                orientation="left" 
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
                domain={['auto', 'auto']}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Calories', angle: 90, position: 'insideRight' }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px' }}
              />
              <Legend />
              <Area 
                yAxisId="right"
                type="monotone" 
                dataKey="calories" 
                name="Calories Consumed"
                fill="#dcfce7" 
                stroke="#22c55e" 
              />
              {showBMR && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="bmr"
                  name="BMR"
                  stroke="#f59e0b"
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}
              {showTDEE && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="tdee"
                  name="TDEE"
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  dot={false}
                />
              )}
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="weight" 
                name="Weight"
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
