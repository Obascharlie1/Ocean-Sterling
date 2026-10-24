'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Shield, Users, LineChart, Settings, LogOut, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin',          label: 'Users',    icon: Users,     exact: true },
  { href: '/admin/trading',  label: 'Trading',  icon: LineChart },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5">
      <span className="w-8 h-8 rounded-lg bg-brand-primary grid place-items-center flex-shrink-0">
        <Shield size={16} className="text-white" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold text-dark-base dark:text-white">Ocean Sterling</span>
        <span className="block text-[10px] font-bold text-brand-primary uppercase tracking-widest">Admin</span>
      </span>
    </Link>
  )
}

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 px-3 py-3 space-y-1">
      {NAV.map(item => {
        const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 h-11 px-3 rounded-xl text-sm font-medium transition',
              active
                ? 'bg-dark-base text-white dark:bg-white dark:text-dark-base'
                : 'text-slate-600 dark:text-slate-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-dark-base dark:hover:text-white'
            )}
          >
            <item.icon size={18} strokeWidth={active ? 2.25 : 1.9} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  if (pathname === '/admin/login') return <>{children}</>

  async function logout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
    router.refresh()
  }

  const logoutCls = 'flex items-center gap-3 h-11 px-3 w-full rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-dark-base dark:hover:text-white transition'

  return (
    <div className="min-h-screen bg-light-surface dark:bg-dark-surface">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-60 flex-col bg-light-base dark:bg-dark-card border-r border-light-border dark:border-dark-border z-40">
        <div className="h-16 flex items-center px-5 border-b border-light-border dark:border-dark-border"><Brand /></div>
        <NavList pathname={pathname} />
        <div className="p-3 border-t border-light-border dark:border-dark-border"><button onClick={logout} className={logoutCls}><LogOut size={18} /> Logout</button></div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 inset-x-0 h-14 z-40 flex items-center gap-3 px-4 bg-light-base dark:bg-dark-card border-b border-light-border dark:border-dark-border">
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="w-9 h-9 rounded-lg grid place-items-center text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10">
          <Menu size={19} />
        </button>
        <Brand />
      </header>

      {/* Mobile drawer */}
      <div className={cn('lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity', open ? 'opacity-100' : 'opacity-0 pointer-events-none')} onClick={() => setOpen(false)} />
      <aside className={cn('lg:hidden fixed left-0 top-0 h-full w-64 z-50 flex flex-col bg-light-base dark:bg-dark-card transition-transform duration-300 shadow-2xl', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-light-border dark:border-dark-border">
          <Brand />
          <button onClick={() => setOpen(false)} aria-label="Close menu" className="w-9 h-9 rounded-lg grid place-items-center text-slate-500 hover:bg-black/5 dark:hover:bg-white/10"><X size={18} /></button>
        </div>
        <NavList pathname={pathname} onNavigate={() => setOpen(false)} />
        <div className="p-3 border-t border-light-border dark:border-dark-border"><button onClick={() => { setOpen(false); logout() }} className={logoutCls}><LogOut size={18} /> Logout</button></div>
      </aside>

      {/* Content */}
      <div className="lg:ml-60 pt-14 lg:pt-0 min-h-screen">
        {children}
      </div>
    </div>
  )
}
