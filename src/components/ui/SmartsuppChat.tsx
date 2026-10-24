'use client'

import { useEffect } from 'react'

/* Smartsupp live chat loader. Injected once on mount. */

const SMARTSUPP_KEY = '5b8b8405e86f140c7dc4ceb61b2bfe9260e858e3'

type SmartsuppFn = ((...args: unknown[]) => void) & { _: unknown[] }

export function SmartsuppChat() {
  useEffect(() => {
    const w = window as unknown as {
      smartsupp?: SmartsuppFn
      _smartsupp?: { key: string }
    }
    if (w.smartsupp) return

    w._smartsupp = { key: SMARTSUPP_KEY }

    const o = ((...args: unknown[]) => { o._.push(args) }) as SmartsuppFn
    o._ = []
    w.smartsupp = o

    const first = document.getElementsByTagName('script')[0]
    const c = document.createElement('script')
    c.type = 'text/javascript'
    c.charset = 'utf-8'
    c.async = true
    c.src = 'https://www.smartsuppchat.com/loader.js?'
    first.parentNode?.insertBefore(c, first)
  }, [])

  return null
}

/** Opens the Smartsupp chat window. */
export function openSmartsupp() {
  ;(window as unknown as { smartsupp?: (...a: unknown[]) => void }).smartsupp?.('chat:open')
}
