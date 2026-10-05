'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sun, CheckSquare, Calendar, BarChart3, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const mobileNav = [
  { href: '/today', label: 'Today', icon: Sun },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'More', icon: MoreHorizontal },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all min-w-0',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'scale-110 transition-transform')} />
              <span className="text-[10px] font-medium truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
