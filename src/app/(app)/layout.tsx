import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { GlobalTimerWidget } from '@/components/layout/GlobalTimerWidget'
import { TimerProvider } from '@/components/providers/TimerProvider'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <TimerProvider>
      <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
        <Sidebar user={session.user} />

        <div className="flex-1 min-w-0 overflow-hidden lg:ml-60">
          <main className="h-full overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
          <GlobalTimerWidget />
        </div>

        <MobileNav />
      </div>
    </TimerProvider>
  )
}
