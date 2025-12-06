'use client'

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { Dumbbell } from 'lucide-react'

interface VolumeProgressChartProps {
  data: {
    date: string
    volume: number
  }[]
}

export function VolumeProgressChart({ data }: VolumeProgressChartProps) {
  const { t } = useLanguage()

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
           <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            {t('analytics.volumeTrend')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {t('workouts.noWorkouts')}
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalVolume = data.reduce((sum, item) => sum + item.volume, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            {t('analytics.volumeTrend')}
          </CardTitle>
          <div className="text-sm font-medium text-muted-foreground">
            {t('analytics.total')}: {totalVolume.toLocaleString()} kg
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: number) => [`${value} kg`, t('analytics.volumeLifted')]}
              />
              <Area 
                type="monotone" 
                dataKey="volume" 
                stroke="#8b5cf6" 
                fillOpacity={1} 
                fill="url(#colorVolume)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
