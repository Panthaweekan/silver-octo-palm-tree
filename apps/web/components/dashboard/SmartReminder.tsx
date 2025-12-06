'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Sparkles, X } from 'lucide-react'
import { Habit } from '@/lib/habits'
import { useState } from 'react'

interface SmartReminderProps {
  suggestion: Habit | null
  onLog: (habitId: string) => void
  onDismiss: () => void
}

export function SmartReminder({ suggestion, onLog, onDismiss }: SmartReminderProps) {
  if (!suggestion) return null

  return (
    <Alert className="mb-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-blue-500/20 relative animate-in fade-in slide-in-from-top-2">
      <Sparkles className="h-4 w-4 text-purple-500" />
      <div className="flex items-start justify-between w-full">
          <div>
            <AlertTitle className="text-purple-700 dark:text-purple-400 font-semibold">Smart Reminder</AlertTitle>
            <AlertDescription className="text-muted-foreground mt-1">
                You usually <span className="font-medium text-foreground">{suggestion.name}</span> around this time. Want to log it now?
            </AlertDescription>
          </div>
          <div className="flex gap-2">
            <Button 
                size="sm" 
                variant="outline" 
                className="h-8"
                onClick={() => onLog(suggestion.id)}
            >
                Log now
            </Button>
            <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0 hover:bg-transparent"
                onClick={onDismiss}
            >
                <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
      </div>
    </Alert>
  )
}
