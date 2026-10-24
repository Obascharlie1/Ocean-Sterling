'use client'

import { partners } from '@/data'

export function TrustBar() {
  const row = [...partners, ...partners]
  return (
    <section className="py-10 border-b border-black/[0.06] dark:border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-7">
          Powering traders alongside the world&apos;s best
        </p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
          <div className="flex items-center gap-14 w-max animate-[os-marquee_32s_linear_infinite]">
            {row.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${p.name}-${i}`}
                src={p.logo}
                data-dark={p.logoDark}
                alt={p.name}
                className="h-6 w-auto object-contain opacity-50 hover:opacity-90 transition-opacity dark:invert"
              />
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes os-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </section>
  )
}
