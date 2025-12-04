'use client'

import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/components/providers/LanguageProvider'

interface DashboardHeaderProps {
  userName: string
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  const { t } = useLanguage()

  return (
    <PageHeader
      title={`${t('common.welcome')}, ${userName}`}
      description={t('dashboard.dailyOverview')}
      action={
        <div className="flex gap-2">
          <Link href="/dashboard/workouts">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t('dashboard.logWorkout')}
            </Button>
          </Link>
          <Link href="/dashboard/meals">
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              {t('dashboard.logMeal')}
            </Button>
          </Link>
        </div>
      }
    />
  )
}
