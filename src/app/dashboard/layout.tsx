'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { TopBarContext } from '@/components/dashboard/TopBarContext'
import { CurrencyProvider } from '@/lib/currency'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

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
