'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const profileSchema = z.object({
  height_cm: z.coerce.number().min(0).max(300).optional(),
  target_weight_kg: z.coerce.number().min(0).max(500).optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function ProfileForm({ user }: { user: any }) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      height_cm: undefined,
      target_weight_kg: undefined,
      date_of_birth: undefined,
      gender: undefined,
    },
  })

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        form.reset({
          height_cm: data.height_cm || undefined,
          target_weight_kg: data.target_weight_kg || undefined,
          date_of_birth: data.date_of_birth || undefined,
          gender: data.gender || undefined,
        })
      }
    }

    fetchProfile()
  }, [user.id, supabase, form])

  const onSubmit = async (data: ProfileFormValues) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)

      if (error) throw error

      toast.success(t('settings.profileUpdated'))
    } catch (error) {
      toast.error('Failed to update profile')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border/50 bg-card/40 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>{t('settings.profile')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="height_cm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.height')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="175" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_weight_kg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.weight')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="70" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.age')}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.gender')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">{t('settings.male')}</SelectItem>
                        <SelectItem value="female">{t('settings.female')}</SelectItem>
                        <SelectItem value="other">{t('settings.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? t('common.loading') : t('settings.updateProfile')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
