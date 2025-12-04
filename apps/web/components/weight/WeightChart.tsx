'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatDateShort } from '@/lib/formatters'

interface Weight {
  date: string
  weight_kg: number
}

interface WeightChartProps {
  weights: Weight[]
}

export function WeightChart({ weights }: WeightChartProps) {
  const [timeRange, setTimeRange] = useState(30) // days

  if (weights.length === 0) return null

  // Filter weights by time range
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - timeRange)

  const filteredWeights = weights
    .filter((w) => new Date(w.date) >= cutoffDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Prepare chart data
  const chartData = filteredWeights.map((w) => ({
    date: formatDateShort(w.date),
    weight: parseFloat(w.weight_kg.toFixed(1)),
    fullDate: new Date(w.date).toLocaleDateString(),
  }))

  // Calculate Y-axis domain (min/max with padding)
  const weightValues = filteredWeights.map((w) => w.weight_kg)
  const minWeight = Math.min(...weightValues)
  const maxWeight = Math.max(...weightValues)
  const padding = (maxWeight - minWeight) * 0.1 || 1
  const yMin = Math.floor(minWeight - padding)
  const yMax = Math.ceil(maxWeight + padding)

  if (chartData.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weight Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>Add at least 2 weight entries to see your trend</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Weight Trend</CardTitle>
          <div className="flex gap-2">
            {[30, 90, 365].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  timeRange === range
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range === 365 ? '1 Year' : `${range} Days`}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[yMin, yMax]}
                tickFormatter={(value) => `${value}`}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px' }}
                formatter={(value: number) => [`${value} kg`, 'Weight']}
                labelFormatter={(label, payload) => {
                  if (payload && payload.length > 0) {
                    return payload[0].payload.fullDate
                  }
                  return label
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#9333ea"
                strokeWidth={3}
                dot={{ fill: '#9333ea', strokeWidth: 2, r: 4, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
