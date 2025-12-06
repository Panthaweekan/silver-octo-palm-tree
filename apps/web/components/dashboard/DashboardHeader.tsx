'use client'

import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Dumbbell, Apple, Scale } from 'lucide-react'
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
              <Dumbbell className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('dashboard.logWorkout')}</span>
            </Button>
          </Link>
          <Link href="/dashboard/meals">
            <Button size="sm" variant="outline">
              <Apple className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('dashboard.logMeal')}</span>
            </Button>
          </Link>
          <Link href="/dashboard/weight">
            <Button size="sm" variant="outline">
              <Scale className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('dashboard.logWeight')}</span>
            </Button>
          </Link>
        </div>
      }
    />
  )
}
