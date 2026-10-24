'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { TopBarContext } from '@/components/dashboard/TopBarContext'
import { CurrencyProvider } from '@/lib/currency'
import { DEMO_MODE } from '@/lib/demo'
import { storedLang, applyLanguage } from '@/lib/i18n'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  // Apply the user's saved language (set at signup or by an admin) on entry.
  useEffect(() => {
    if (DEMO_MODE) return
    fetch('/api/profile')
      .then(r => r.json())
      .then(({ data }) => {
        const lang = data?.language
        if (lang && lang !== storedLang()) applyLanguage(lang)
      })
      .catch(() => {})
  }, [])

  return (
    <TopBarContext.Provider value={{ onMenuOpen: () => setMobileOpen(true) }}>
      <CurrencyProvider>
        <div className="min-h-screen bg-[#F6F7F5] dark:bg-[#0A0B0A]">
          <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
          <div className="lg:ml-[260px]">{children}</div>
        </div>
      </CurrencyProvider>
    </TopBarContext.Provider>
  )
}
