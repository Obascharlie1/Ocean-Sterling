'use client'

import { useEffect, useRef, useState } from 'react'
import { animate, motion, useReducedMotion, type Variants } from 'framer-motion'
import { useCurrency } from '@/lib/currency'

/* Subtle motion primitives shared across the dashboard. All respect reduced-motion. */

export const EASE = [0.16, 1, 0.3, 1] as const

/** Animates from the last shown value to `target` (from 0 on first mount). */
export function useCountUp(target: number, duration = 1.1) {
  const reduce = useReducedMotion()
  const [value, setValue] = useState(0)
  const last = useRef(0)

  useEffect(() => {
    if (reduce) { last.current = target; return }
    const controls = animate(last.current, target, {
      duration,
      ease: EASE,
      onUpdate: v => { last.current = v; setValue(v) },
    })
    return () => controls.stop()
  }, [target, duration, reduce])

  return reduce ? target : value
}

/** A USD amount shown in the selected currency, counting up on load and on currency change. */
export function Money({ usd, cents = true, sign, duration }: {
  usd: number
  cents?: boolean
  sign?: '+' | '−'
  duration?: number
}) {
  const { convert, formatValue } = useCurrency()
  const v = useCountUp(convert(usd), duration)
  return <>{sign}{formatValue(v, { cents })}</>
}

/** Plain animated number (counts, percentages). */
export function CountUp({ value, decimals = 0, prefix = '', suffix = '', duration }: {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
}) {
  const v = useCountUp(value, duration)
  return <>{prefix}{v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</>
}

/** Fade-and-rise on mount. */
export function Reveal({ children, delay = 0, className, as = 'div' }: {
  children: React.ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'li'
}) {
  const reduce = useReducedMotion()
  const M = motion[as]
  return (
    <M
      className={className}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE, delay }}
    >
      {children}
    </M>
  )
}

export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } },
}

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
}
