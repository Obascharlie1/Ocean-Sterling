'use client'

import { Wordmark } from '@/components/ui/Wordmark'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  History,
  User,
  LogOut,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DEMO_MODE, DEMO_USER } from '@/lib/demo'

const navItems = [
  { href: '/dashboard',              label: 'Dashboard',    icon: LayoutDashboard, exact: true },
  { href: '/dashboard/deposit',      label: 'Deposit',      icon: ArrowDownToLine },
  { href: '/dashboard/withdraw',     label: 'Withdraw',     icon: ArrowUpFromLine },
  { href: '/dashboard/plans',        label: 'My Plans',     icon: TrendingUp },
  { href: '/dashboard/transactions', label: 'Transactions', icon: History },
  { href: '/dashboard/profile',      label: 'Profile',      icon: User },
]

interface SidebarProps {
  mobileOpen: boolean
  onClose: () => void
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const [userName,    setUserName]    = useState('')
  const [userEmail,   setUserEmail]   = useState('')

  // Close on route change
  useEffect(() => { onClose() }, [pathname])

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Fetch current user info
  useEffect(() => {
    if (DEMO_MODE) { setUserName(DEMO_USER.name); setUserEmail(DEMO_USER.email); return }
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserEmail(user.email ?? '')
      supabase.from('profiles').select('full_name').eq('id', user.id).single()
        .then(({ data }) => { if (data?.full_name) setUserName(data.full_name) })
    })
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  const initials = userName ? userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '··'

  const NavContent = () => (
    <>
      <nav className="flex-1 px-3 pt-2 pb-4 space-y-1 overflow-y-auto">
        <p className="px-3 pt-3 pb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">Menu</p>
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 h-11 px-3 rounded-xl text-sm font-medium transition',
                active
                  ? 'bg-dark-base text-white shadow-sm dark:bg-white dark:text-dark-base'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-dark-base dark:hover:text-white'
              )}
            >
              <item.icon size={18} strokeWidth={active ? 2.25 : 1.9} />
              <span className="flex-1">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-3">
        <div className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] p-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-secondary to-brand-primary grid place-items-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-dark-base dark:text-white truncate">{userName || 'Your account'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userEmail || '—'}</p>
            </div>
            <button
              onClick={handleSignOut}
              aria-label="Sign out"
              className="w-8 h-8 rounded-full grid place-items-center text-slate-500 hover:text-dark-base dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-[260px] flex-col bg-white dark:bg-[#0E100F] border-r border-black/[0.06] dark:border-white/[0.06] z-40">
        <div className="flex items-center h-20 px-6">
          <Wordmark href="/dashboard" className="h-14" />
        </div>
        <NavContent />
      </aside>

      <div
        className={cn(
          'lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          'lg:hidden fixed left-0 top-0 h-full w-[280px] flex flex-col bg-white dark:bg-[#0E100F] z-50 transition-transform duration-300 ease-out shadow-2xl',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-20 px-5">
          <Wordmark href="/dashboard" className="h-11" />
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="w-9 h-9 rounded-full grid place-items-center text-slate-500 hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            <X size={18} />
          </button>
        </div>
        <NavContent />
      </aside>
    </>
  )
}
