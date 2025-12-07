'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { WeightFormDialog } from './WeightForm'
import { formatDate, formatWeight, formatPercentage } from '@/lib/formatters'
import { toast } from '@/hooks/use-toast'

import { Database } from '@/types/supabase'

type Weight = Database['public']['Tables']['weights']['Row']

interface WeightListProps {
  weights: Weight[]
  userId: string
}

export function WeightList({ weights, userId }: WeightListProps) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this weight entry?')) {
      return
    }

    setDeleting(id)
    const { error } = await supabase.from('weights').delete().eq('id', id)

    if (error) {
      toast.error('Failed to delete weight entry')
      setDeleting(null)
      return
    }

    toast.success('Weight entry deleted')
    setDeleting(null)
    router.refresh()
  }

  function getTrendIndicator(currentWeight: number, previousWeight?: number) {
    if (!previousWeight) return null

    if (currentWeight > previousWeight) {
      return <TrendingUp className="h-4 w-4 text-red-500" />
    } else if (currentWeight < previousWeight) {
      return <TrendingDown className="h-4 w-4 text-green-500" />
    } else {
      return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {weights.map((weight, index) => {
            const previousWeight = weights[index + 1]?.weight_kg
            const hasMeasurements = weight.waist_cm || weight.hips_cm || weight.chest_cm

            return (
              <div
                key={weight.id}
                className="flex items-center justify-between p-4 bg-card/40 backdrop-blur-sm rounded-lg border border-border/50 hover:border-border transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg text-foreground">
                      {formatWeight(weight.weight_kg)}
                    </span>
                    {getTrendIndicator(weight.weight_kg, previousWeight)}
                    {weight.body_fat_percentage && (
                      <span className="text-sm text-muted-foreground ml-2">
                        BF: {formatPercentage(weight.body_fat_percentage)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    {formatDate(weight.date)}
                  </p>
                  {weight.notes && (
                    <p className="text-sm text-muted-foreground/80 mt-1">{weight.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <WeightFormDialog userId={userId} initialData={weight}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </WeightFormDialog>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(weight.id)}
                    disabled={deleting === weight.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
