'use client'

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/components/providers/LanguageProvider'

interface WeeklyTrendsChartProps {
  data: {
    date: string
    caloriesIn: number
    caloriesBurned: number
  }[]
  targetCalories?: number | null
}

export function WeeklyTrendsChart({ data, targetCalories }: WeeklyTrendsChartProps) {
  const { t } = useLanguage()

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No data available for the last 7 days.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px' }}
                formatter={(value: number, name: string) => [
                   value, 
                   name === 'caloriesIn' ? t('dashboard.caloriesConsumed') : t('dashboard.caloriesBurned')
                ]}
              />
              <Legend />
              {targetCalories && (
                 <ReferenceLine 
                    y={targetCalories} 
                    stroke="#22c55e" 
                    strokeDasharray="3 3" 
                    label={{ position: 'right', value: 'Target', fill: '#22c55e', fontSize: 10 }}
                 />
              )}
              <Bar 
                dataKey="caloriesIn" 
                name="Calories In" 
                fill="#22c55e" 
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="caloriesBurned" 
                name="Calories Burned" 
                fill="#ef4444" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
