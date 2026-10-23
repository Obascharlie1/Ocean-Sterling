'use client'

import { createContext, useContext } from 'react'

interface TopBarContextValue {
  onMenuOpen: () => void
}

export const TopBarContext = createContext<TopBarContextValue>({
  onMenuOpen: () => {},
})

export function useTopBarContext() {
  return useContext(TopBarContext)
}
