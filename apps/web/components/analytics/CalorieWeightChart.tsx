'use client'

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

interface CalorieWeightChartProps {
  data: {
    date: string
    weight: number | null
    calories: number
  }[]
}

export function CalorieWeightChart({ data }: CalorieWeightChartProps) {
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
      <CardHeader>
        <CardTitle>Weight vs. Calories</CardTitle>
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
                name="Calories"
                fill="#dcfce7" 
                stroke="#22c55e" 
              />
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
