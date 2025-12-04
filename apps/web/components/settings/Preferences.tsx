'use client'

import { useTheme } from 'next-themes'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Moon, Sun, Monitor, Globe } from 'lucide-react'

export function Preferences() {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()

  return (
    <Card className="border-border/50 bg-card/40 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>{t('settings.preferences')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Setting */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base">{t('settings.theme')}</Label>
            <p className="text-sm text-muted-foreground">
              Select your preferred appearance
            </p>
          </div>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  <span>{t('settings.light')}</span>
                </div>
              </SelectItem>
              <SelectItem value="dark">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  <span>{t('settings.dark')}</span>
                </div>
              </SelectItem>
              <SelectItem value="system">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  <span>{t('settings.system')}</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Language Setting */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base">{t('settings.language')}</Label>
            <p className="text-sm text-muted-foreground">
              Select your preferred language
            </p>
          </div>
          <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>English</span>
                </div>
              </SelectItem>
              <SelectItem value="th">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>ไทย (Thai)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
