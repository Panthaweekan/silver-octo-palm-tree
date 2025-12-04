'use client'

import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Smile, Meh, Frown, ThumbsUp, ThumbsDown } from 'lucide-react'

const MOOD_ICONS = {
  great: ThumbsUp,
  good: Smile,
  okay: Meh,
  bad: Frown,
  terrible: ThumbsDown,
}

interface JournalHistoryProps {
  entries: any[]
}

export function JournalHistory({ entries }: JournalHistoryProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No past entries found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.map((entry) => {
          const MoodIcon = entry.mood ? MOOD_ICONS[entry.mood as keyof typeof MOOD_ICONS] : Meh
          
          return (
            <div key={entry.id} className="border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {format(new Date(entry.date), 'MMM d, yyyy')}
                  </span>
                  {entry.mood && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      <MoodIcon className="h-3 w-3" />
                      <span className="capitalize">{entry.mood}</span>
                    </div>
                  )}
                </div>
                {entry.energy_level && (
                  <span className="text-xs text-gray-500">
                    Energy: {entry.energy_level}/5
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-3">
                {entry.content}
              </p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
