'use client'

import { Menu, BadgeCheck } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useTopBarContext } from './TopBarContext'
import { NotificationBell } from './NotificationBell'
import { MessagesBell } from './MessagesBell'

interface TopBarProps {
  title: string
  subtitle?: string
  verified?: boolean
}

export function TopBar({ title, subtitle, verified }: TopBarProps) {
  const { onMenuOpen } = useTopBarContext()

  return (
    <header className="h-16 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between bg-[#F6F7F5]/80 dark:bg-[#0A0B0A]/80 backdrop-blur-xl border-b border-black/[0.05] dark:border-white/[0.06]">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuOpen}
          aria-label="Open menu"
          className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 transition"
        >
          <Menu size={19} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[15px] font-semibold text-dark-base dark:text-white">{title}</h1>
            {verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary/10 px-2 py-0.5 text-[11px] font-semibold text-brand-primary">
                <BadgeCheck size={12} /> Verified
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <MessagesBell />
        <NotificationBell />
        <ThemeToggle />
      </div>
    </header>
  )
}
