'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Moon, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface SleepLog {
  id: string
  duration_minutes: number
  quality: 'poor' | 'fair' | 'good' | 'excellent'
}

interface SleepTrackerProps {
  userId: string
  date: string
  initialLog?: SleepLog | null
}

export function SleepTracker({ userId, date, initialLog }: SleepTrackerProps) {
  const [log, setLog] = useState<SleepLog | null>(initialLog || null)
  const [duration, setDuration] = useState(initialLog?.duration_minutes || 480) // Default 8 hours
  const [quality, setQuality] = useState<SleepLog['quality']>(initialLog?.quality || 'good')
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    if (initialLog) {
      setLog(initialLog)
      setDuration(initialLog.duration_minutes)
      setQuality(initialLog.quality)
    } else {
      setLog(null)
      // Reset defaults if no log
      setDuration(480) 
      setQuality('good')
    }
  }, [initialLog, date])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (log) {
        // Update
        const { error } = await supabase
          .from('sleep_logs')
          .update({
            duration_minutes: duration,
            quality: quality
          })
          .eq('id', log.id)

        if (error) throw error
        toast.success('Sleep log updated')
      } else {
        // Insert
        const { data, error } = await supabase
          .from('sleep_logs')
          .insert({
            user_id: userId,
            date: date,
            duration_minutes: duration,
            quality: quality
          })
          .select()
          .single()

        if (error) throw error
        setLog(data)
        toast.success('Sleep logged')
      }
    } catch (error) {
      console.error('Error saving sleep log:', error)
      toast.error('Failed to save sleep log')
    } finally {
      setIsSaving(false)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`
  }

  const qualities: { value: SleepLog['quality']; label: string; icon: string }[] = [
    { value: 'poor', label: 'Poor', icon: '😫' },
    { value: 'fair', label: 'Fair', icon: '😐' },
    { value: 'good', label: 'Good', icon: '🙂' },
    { value: 'excellent', label: 'Excellent', icon: '🤩' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
            <Moon className="h-4 w-4" />
          </div>
          <h3 className="font-semibold text-lg">Sleep Tracker</h3>
        </div>
        {log && (
          <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
            Logged
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Duration</Label>
            <span className="font-medium text-indigo-600">{formatDuration(duration)}</span>
          </div>
          <Slider
            value={[duration]}
            onValueChange={(vals) => setDuration(vals[0])}
            min={0}
            max={720} // 12 hours
            step={15}
            className="py-4"
          />
        </div>

        <div className="space-y-2">
          <Label>Quality</Label>
          <div className="grid grid-cols-4 gap-2">
            {qualities.map((q) => (
              <button
                key={q.value}
                onClick={() => setQuality(q.value)}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg border transition-all hover:bg-accent",
                  quality === q.value
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500"
                    : "border-muted bg-card"
                )}
              >
                <span className="text-xl mb-1">{q.icon}</span>
                <span className="text-xs font-medium">{q.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={isSaving} 
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isSaving ? 'Saving...' : log ? 'Update Sleep Log' : 'Log Sleep'}
        </Button>
      </div>
    </div>
  )
}
