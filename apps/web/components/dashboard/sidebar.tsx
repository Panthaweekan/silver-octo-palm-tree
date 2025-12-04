'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Dumbbell,
  Home,
  Apple,
  Scale,
  Target,
  TrendingUp,
  Settings,
  LogOut,
  BookOpen,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/components/providers/LanguageProvider'


export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { t } = useLanguage()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/80 lg:hidden" 
          onClick={onClose}
          aria-hidden="true" 
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-background/95 backdrop-blur-xl border-r border-border transform transition-transform duration-300 ease-in-out lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4 h-full">
           <div className="flex h-16 shrink-0 items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-primary-foreground"
                >
                  <path
                    d="M13 3L11 21"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M5 11L19 11"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M5 6L19 18"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M5 18L19 6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
                {t('common.appName')}
              </span>
            </Link>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <span className="sr-only">Close sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <NavContent pathname={pathname} handleLogout={handleLogout} onItemClick={onClose} />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-background/60 backdrop-blur-xl border-r border-border px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-primary-foreground"
                >
                  <path
                    d="M13 3L11 21"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M5 11L19 11"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M5 6L19 18"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M5 18L19 6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
                {t('common.appName')}
              </span>
            </Link>
          </div>
          <NavContent pathname={pathname} handleLogout={handleLogout} />
        </div>
      </div>
    </>
  )
}

function NavContent({ pathname, handleLogout, onItemClick }: { pathname: string, handleLogout: () => void, onItemClick?: () => void }) {
  const { t } = useLanguage()
  
  const navigation = [
    { name: t('common.dashboard'), href: '/dashboard', icon: Home },
    { name: 'Diary', href: '/dashboard/diary', icon: BookOpen },
    { name: t('common.analytics'), href: '/dashboard/analytics', icon: TrendingUp },
    { name: t('common.settings'), href: '/dashboard/settings', icon: Settings },
  ]

  return (
    <nav className="flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
        <li>
          <ul role="list" className="-mx-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onItemClick}
                    className={cn(
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                      'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-all duration-200'
                    )}
                  >
                    <item.icon
                      className={cn(
                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                        'h-6 w-6 shrink-0 transition-colors duration-200'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </li>

        <li className="mt-auto">
          <button
            onClick={handleLogout}
            className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-muted-foreground hover:bg-destructive/10 hover:text-destructive w-full transition-all duration-200"
          >
            <LogOut
              className="h-6 w-6 shrink-0 text-muted-foreground group-hover:text-destructive transition-colors duration-200"
              aria-hidden="true"
            />
            {t('common.logout')}
          </button>
        </li>
      </ul>
    </nav>
  )
}
