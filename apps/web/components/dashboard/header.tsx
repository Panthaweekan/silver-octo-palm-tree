import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Menu, Globe, Sun, Moon } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()
  const { t, language, setLanguage } = useLanguage()
  const { setTheme } = useTheme()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  return (
    <header className="sticky top-0 z-40 bg-background/60 backdrop-blur-xl border-b border-border">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-muted-foreground hover:text-foreground lg:hidden"
              onClick={onMenuClick}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <h1 className="text-2xl font-semibold text-foreground">{t('common.dashboard')}</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Globe className="h-4 w-4" />
                  <span className="sr-only">Switch language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('en')} className={language === 'en' ? 'bg-accent' : ''}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('th')} className={language === 'th' ? 'bg-accent' : ''}>
                  ไทย (Thai)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden sm:block text-sm text-right">
              <p className="text-muted-foreground">{t('common.welcome')},</p>
              <p className="font-semibold text-foreground">
                {user?.user_metadata?.full_name || user?.email || 'User'}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold ring-2 ring-background">
              {(user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
