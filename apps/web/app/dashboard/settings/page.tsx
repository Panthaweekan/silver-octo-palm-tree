import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { ProfileForm } from '@/components/settings/ProfileForm'
import { Preferences } from '@/components/settings/Preferences'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function SettingsPage() {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your profile and app preferences"
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <ProfileForm user={user} />
        </TabsContent>
        
        <TabsContent value="preferences">
          <Preferences />
        </TabsContent>
      </Tabs>
    </div>
  )
}
