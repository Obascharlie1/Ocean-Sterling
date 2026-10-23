'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, X, Sparkles, ArrowRight, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { plans } from '@/data'
import { TopBar } from '@/components/dashboard/TopBar'
import { PageHeader, ErrorNote } from '@/components/dashboard/ui'
import { Money, EASE, staggerParent, staggerChild } from '@/components/dashboard/motion'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { DEMO_MODE, DEMO_PROFILE } from '@/lib/demo'

const planExtras: Record<string, { roi: string; minInvestment: number }> = {
  Starter:  { roi: '2–4% est. monthly',   minInvestment: 100    },
  Silver:   { roi: '5–7% est. monthly',   minInvestment: 1000   },
  Gold:     { roi: '8–12% est. monthly',  minInvestment: 5000   },
  Platinum: { roi: '15–20% est. monthly', minInvestment: 25000  },
}

export default function PlansPage() {
  const [currentPlan, setCurrentPlan]   = useState<string>('None')
  const [userId,      setUserId]        = useState<string | null>(null)
  const [loading,     setLoading]       = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [saving,      setSaving]        = useState(false)
  const [saveError,   setSaveError]     = useState('')
  const [justSwitched, setJustSwitched] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (DEMO_MODE) {
        setCurrentPlan(DEMO_PROFILE.plan)
        setLoading(false)
        return
      }
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
      setCurrentPlan(data?.plan ?? 'None')
      setLoading(false)
    }
    load()
  }, [])

  function closeModal() {
    setSelectedPlan(null)
    setSaveError('')
  }

  async function confirmSwitch() {
    if (!selectedPlan) return
    setSaving(true)
    setSaveError('')

    if (DEMO_MODE) {
      await new Promise(r => setTimeout(r, 700))
    } else {
      if (!userId) return
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ plan: selectedPlan })
        .eq('id', userId)

      if (error) {
        setSaveError(error.message)
        setSaving(false)
        return
      }
    }

    setCurrentPlan(selectedPlan)
    setJustSwitched(selectedPlan)
    setTimeout(() => setJustSwitched(null), 2400)
    setSaving(false)
    closeModal()
  }

  const selectedPlanData = plans.find(p => p.name === selectedPlan)
  const curIdx = plans.findIndex(p => p.name === currentPlan)

  return (
    <div>
      <TopBar title="Plans" />

      <div className="px-4 sm:px-8 py-6 sm:py-10 max-w-6xl mx-auto">
        <PageHeader
          eyebrow="Investment tiers"
          title="Choose your plan"
          subtitle="Higher tiers unlock bigger portfolios, sharper signals and priority service. Switch any time."
        />

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={22} className="animate-spin text-brand-primary" />
          </div>
        ) : (
          <motion.div variants={staggerParent} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {plans.map((plan, planIdx) => {
              const isCurrent = plan.name === currentPlan
              const extras    = planExtras[plan.name]
              const isUpgrade = planIdx > curIdx

              return (
                <motion.div
                  key={plan.name}
                  variants={staggerChild}
                  whileHover={isCurrent ? undefined : { y: -4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className={cn(
                    'relative flex flex-col rounded-3xl p-6 overflow-hidden',
                    isCurrent
                      ? 'bg-[#0B0F0D] text-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]'
                      : 'bg-white dark:bg-[#111312] ring-1 ring-black/[0.06] dark:ring-white/[0.07] hover:ring-black/15 dark:hover:ring-white/20 hover:shadow-[0_24px_48px_-28px_rgba(0,0,0,0.35)] transition-shadow'
                  )}
                >
                  {isCurrent && (
                    <>
                      <div className="pointer-events-none absolute -top-24 -right-16 w-64 h-64 rounded-full bg-brand-primary/25 blur-[80px]" />
                      {justSwitched === plan.name && (
                        <motion.span
                          className="pointer-events-none absolute inset-0 rounded-3xl ring-2 ring-brand-secondary"
                          initial={{ opacity: 1 }}
                          animate={{ opacity: 0 }}
                          transition={{ duration: 2.2, ease: 'easeOut' }}
                        />
                      )}
                    </>
                  )}

                  <div className="relative flex items-center justify-between">
                    <h3 className={cn('text-sm font-semibold', isCurrent ? 'text-white/70' : 'text-slate-500 dark:text-slate-400')}>{plan.name}</h3>
                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary/20 text-brand-secondary px-2.5 py-1 text-[11px] font-semibold">
                        <Check size={11} strokeWidth={3} /> Current
                      </span>
                    ) : plan.highlighted ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-dark-base text-white dark:bg-white dark:text-dark-base px-2.5 py-1 text-[11px] font-semibold">
                        <Sparkles size={11} /> Popular
                      </span>
                    ) : null}
                  </div>

                  <div className="relative mt-4 flex items-baseline gap-1">
                    {plan.price === 0 ? (
                      <span className="text-4xl font-semibold tracking-tight">Free</span>
                    ) : (
                      <>
                        <span className={cn('text-4xl font-semibold tracking-tight tabular-nums', !isCurrent && 'text-dark-base dark:text-white')}>
                          <Money usd={plan.price} cents={false} />
                        </span>
                        <span className={cn('text-sm', isCurrent ? 'text-white/50' : 'text-slate-500 dark:text-slate-400')}>/mo</span>
                      </>
                    )}
                  </div>
                  <p className={cn('relative mt-2 text-sm leading-relaxed', isCurrent ? 'text-white/60' : 'text-slate-500 dark:text-slate-400')}>{plan.description}</p>

                  <div className={cn('relative mt-5 grid grid-cols-2 rounded-2xl text-xs', isCurrent ? 'bg-white/[0.06]' : 'bg-black/[0.03] dark:bg-white/[0.04]')}>
                    <div className="px-3.5 py-3">
                      <p className={isCurrent ? 'text-white/50' : 'text-slate-500 dark:text-slate-400'}>Returns</p>
                      <p className={cn('mt-0.5 font-semibold', isCurrent ? 'text-brand-secondary' : 'text-brand-primary')}>{extras.roi}</p>
                    </div>
                    <div className="px-3.5 py-3">
                      <p className={isCurrent ? 'text-white/50' : 'text-slate-500 dark:text-slate-400'}>Minimum</p>
                      <p className={cn('mt-0.5 font-semibold tabular-nums', !isCurrent && 'text-dark-base dark:text-white')}>
                        <Money usd={extras.minInvestment} cents={false} />
                      </p>
                    </div>
                  </div>

                  <ul className="relative mt-5 space-y-2.5 flex-1">
                    {plan.features.map(feature => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm">
                        <span className={cn(
                          'mt-0.5 w-4 h-4 rounded-full grid place-items-center flex-shrink-0',
                          isCurrent ? 'bg-brand-primary text-white' : 'bg-brand-primary/12 text-brand-primary'
                        )}>
                          <Check size={10} strokeWidth={3} />
                        </span>
                        <span className={cn('leading-snug', isCurrent ? 'text-white/85' : 'text-dark-base dark:text-slate-200')}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <div className="relative mt-6 h-11 rounded-full bg-white/[0.08] text-sm font-semibold text-white/70 grid place-items-center">
                      Your current plan
                    </div>
                  ) : (
                    <button
                      onClick={() => { setSaveError(''); setSelectedPlan(plan.name) }}
                      className={cn(
                        'group relative mt-6 h-11 rounded-full text-sm font-semibold inline-flex items-center justify-center gap-2 active:scale-[0.98] transition',
                        isUpgrade
                          ? 'bg-dark-base text-white dark:bg-white dark:text-dark-base hover:opacity-90'
                          : 'ring-1 ring-black/10 dark:ring-white/15 text-dark-base dark:text-white hover:ring-black/25 dark:hover:ring-white/30'
                      )}
                    >
                      {curIdx < 0 ? 'Choose plan' : isUpgrade ? 'Upgrade' : 'Downgrade'}
                      <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
                    </button>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        )}

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
          Plan changes take effect immediately. Returns are estimates, not guarantees.
        </p>
      </div>

      {/* Confirmation modal */}
      <AnimatePresence>
        {selectedPlanData && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={saving ? undefined : closeModal} />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#111312] ring-1 ring-black/[0.06] dark:ring-white/[0.08] p-7 shadow-2xl"
            >
              <button onClick={closeModal} aria-label="Close" className="absolute top-4 right-4 w-8 h-8 rounded-full grid place-items-center text-slate-400 hover:bg-black/5 dark:hover:bg-white/10 transition">
                <X size={16} />
              </button>

              {(() => {
                const up = plans.findIndex(p => p.name === selectedPlanData.name) > curIdx
                const Icon = up ? ArrowUpRight : ArrowDownRight
                return (
                  <span className={cn('w-12 h-12 rounded-2xl grid place-items-center', up ? 'bg-brand-primary/10 text-brand-primary' : 'bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300')}>
                    <Icon size={22} />
                  </span>
                )
              })()}

              <h3 className="mt-5 text-xl font-semibold tracking-tight text-dark-base dark:text-white">Switch to {selectedPlanData.name}?</h3>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                You&apos;re moving from <span className="font-medium text-dark-base dark:text-white">{currentPlan === 'None' ? 'no plan' : currentPlan}</span> to{' '}
                <span className="font-medium text-dark-base dark:text-white">{selectedPlanData.name}</span>. The change applies straight away.
              </p>

              <div className="mt-5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] divide-y divide-black/[0.06] dark:divide-white/[0.07] text-sm">
                <ModalRow label="Price" value={selectedPlanData.price === 0 ? 'Free' : <><Money usd={selectedPlanData.price} cents={false} /> / month</>} />
                <ModalRow label="Est. returns" value={<span className="text-brand-primary">{planExtras[selectedPlanData.name].roi}</span>} />
                <ModalRow label="Minimum investment" value={<Money usd={planExtras[selectedPlanData.name].minInvestment} cents={false} />} />
              </div>

              {saveError && <div className="mt-4"><ErrorNote>{saveError}</ErrorNote></div>}

              <div className="mt-6 flex gap-2.5">
                <button
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 h-11 rounded-full ring-1 ring-black/10 dark:ring-white/15 text-sm font-semibold text-dark-base dark:text-white hover:ring-black/25 dark:hover:ring-white/30 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSwitch}
                  disabled={saving}
                  className="flex-1 h-11 rounded-full bg-dark-base text-white dark:bg-white dark:text-dark-base text-sm font-semibold inline-flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition disabled:opacity-60"
                >
                  {saving ? <><Loader2 size={15} className="animate-spin" /> Switching…</> : 'Confirm switch'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ModalRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-semibold tabular-nums text-dark-base dark:text-white">{value}</span>
    </div>
  )
}
