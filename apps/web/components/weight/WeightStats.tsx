import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Scale, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { formatWeight } from '@/lib/formatters'

import { Database } from '@/types/supabase'

type Weight = Database['public']['Tables']['weights']['Row']

interface WeightStatsProps {
  weights: Weight[]
  heightCm?: number
}

export function WeightStats({ weights, heightCm }: WeightStatsProps) {
  if (weights.length === 0) return null

  // Current (most recent) weight
  const currentWeight = weights[0]

  // Starting (oldest) weight
  const startingWeight = weights[weights.length - 1]

  // Weight change
  const weightChange = currentWeight.weight_kg - startingWeight.weight_kg
  const isGain = weightChange > 0
  const isLoss = weightChange < 0

  // Calculate BMI if height is available
  let bmi: number | null = null
  let bmiCategory = ''
  if (heightCm) {
    const heightM = heightCm / 100
    bmi = currentWeight.weight_kg / (heightM * heightM)

    if (bmi < 18.5) {
      bmiCategory = 'Underweight'
    } else if (bmi < 25) {
      bmiCategory = 'Normal'
    } else if (bmi < 30) {
      bmiCategory = 'Overweight'
    } else {
      bmiCategory = 'Obese'
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Current Weight */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
          <Scale className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatWeight(currentWeight.weight_kg)}</div>
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(currentWeight.date).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      {/* Starting Weight */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Starting Weight</CardTitle>
          <Activity className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatWeight(startingWeight.weight_kg)}</div>
          <p className="text-xs text-gray-500">
            Since {new Date(startingWeight.date).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      {/* Weight Change */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Change</CardTitle>
          {isGain && <TrendingUp className="h-4 w-4 text-red-600" />}
          {isLoss && <TrendingDown className="h-4 w-4 text-green-600" />}
          {!isGain && !isLoss && <Activity className="h-4 w-4 text-gray-600" />}
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              isGain ? 'text-red-600' : isLoss ? 'text-green-600' : 'text-gray-600'
            }`}
          >
            {weightChange > 0 && '+'}
            {formatWeight(Math.abs(weightChange))}
          </div>
          <p className="text-xs text-gray-500">
            {isGain && 'Weight gained'}
            {isLoss && 'Weight lost'}
            {!isGain && !isLoss && 'No change'}
          </p>
        </CardContent>
      </Card>

      {/* BMI */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">BMI</CardTitle>
          <Activity className="h-4 w-4 text-indigo-600" />
        </CardHeader>
        <CardContent>
          {bmi ? (
            <>
              <div className="text-2xl font-bold">{bmi.toFixed(1)}</div>
              <p className="text-xs text-gray-500">{bmiCategory}</p>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-gray-400">--</div>
              <p className="text-xs text-gray-500">Add height in settings</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
