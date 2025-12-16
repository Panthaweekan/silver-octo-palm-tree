'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { BottomNav } from '@/components/shared/BottomNav'
import { createClient } from '@/lib/supabase/client'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userId, setUserId] = useState<string | undefined>()
  const [userWeight, setUserWeight] = useState<number>(70)
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        // Fetch latest weight
        const { data: weight } = await supabase
          .from('weights')
          .select('weight_kg')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(1)
          .single()
        if ((weight as any)?.weight_kg) setUserWeight((weight as any).weight_kg)
      }
    }
    fetchUser()
  }, [supabase])

  return (
    <div className="min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        {/* Add bottom padding on mobile for bottom nav */}
        <main className="py-6 px-4 sm:px-6 lg:px-8 pb-24 lg:pb-6">{children}</main>
      </div>
      {/* Mobile Bottom Navigation */}
      <BottomNav userId={userId} userWeight={userWeight} />
    </div>
  )
}

