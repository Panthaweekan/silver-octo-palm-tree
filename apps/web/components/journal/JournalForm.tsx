'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { toast } from '@/hooks/use-toast'
import { Smile, Meh, Frown, ThumbsUp, ThumbsDown } from 'lucide-react'

const MOODS = [
  { value: 'great', label: 'Great', icon: ThumbsUp },
  { value: 'good', label: 'Good', icon: Smile },
  { value: 'okay', label: 'Okay', icon: Meh },
  { value: 'bad', label: 'Bad', icon: Frown },
  { value: 'terrible', label: 'Terrible', icon: ThumbsDown },
] as const

const formSchema = z.object({
  content: z.string().min(1, 'Journal content cannot be empty'),
  mood: z.enum(['great', 'good', 'okay', 'bad', 'terrible']),
  energy_level: z.number().min(1).max(5),
})

type JournalFormProps = {
  userId: string
  existingEntry?: {
    id: string
    content: string
    mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible' | null
    energy_level: number | null
  } | null
}

export function JournalForm({ userId, existingEntry }: JournalFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: existingEntry?.content || '',
      mood: existingEntry?.mood || 'good',
      energy_level: existingEntry?.energy_level || 3,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const data = {
        content: values.content,
        mood: values.mood,
        energy_level: values.energy_level,
      }

      if (existingEntry) {
        const { error } = await (supabase
          .from('daily_journals') as any)
          .update(data)
          .eq('id', existingEntry.id)

        if (error) throw error
        toast.success('Journal updated successfully')
      } else {
        const { error } = await (supabase
          .from('daily_journals') as any)
          .insert({
            user_id: userId,
            date: today,
            content: values.content,
            mood: values.mood,
            energy_level: values.energy_level,
          })

        if (error) throw error
        toast.success('Journal entry created!')
      }

      router.refresh()
    } catch (error) {
      console.error('Error saving journal:', error)
      toast.error('Failed to save journal entry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Journal</CardTitle>
        <CardDescription>
          Record your thoughts, mood, and energy for today.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="mood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How are you feeling?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a mood" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MOODS.map((mood) => (
                        <SelectItem key={mood.value} value={mood.value}>
                          <div className="flex items-center gap-2">
                            <mood.icon className="h-4 w-4" />
                            <span>{mood.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="energy_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Energy Level (1-5)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">Low</span>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-500">High</span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Current level: {field.value}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thoughts & Reflections</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write about your day, goals, or anything on your mind..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : existingEntry ? 'Update Entry' : 'Save Entry'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
