import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { infoPages, infoSlugs } from '@/data/pages'

export function generateStaticParams() {
  return infoSlugs.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = infoPages[slug]
  if (!page) return { title: 'Not found · Ocean Sterling' }
  return { title: `${page.title} · Ocean Sterling`, description: page.subtitle }
}

export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = infoPages[slug]
  if (!page) notFound()

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Header */}
        <section className="pt-32 pb-12 border-b border-black/[0.06] dark:border-white/[0.06]">
          <div className="max-w-3xl mx-auto px-6">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-dark-base dark:hover:text-white transition-colors mb-6">
              <ArrowLeft size={15} /> Back home
            </Link>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">{page.category}</p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight text-dark-base dark:text-white leading-[1.05]">{page.title}</h1>
            <p className="mt-4 text-lg leading-relaxed text-slate-500 dark:text-slate-400">{page.subtitle}</p>
          </div>
        </section>

        {/* Body */}
        <section className="py-14">
          <div className="max-w-3xl mx-auto px-6 space-y-8">
            {page.sections.map((s, i) => (
              <div key={i}>
                {s.heading && <h2 className="text-lg font-semibold text-dark-base dark:text-white mb-2">{s.heading}</h2>}
                {s.body.split('\n').map((p, j) => (
                  <p key={j} className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">{p}</p>
                ))}
              </div>
            ))}

            <div className="pt-6 border-t border-black/[0.06] dark:border-white/[0.06]">
              <Link href="/auth/register" className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-dark-base text-white dark:bg-white dark:text-dark-base text-sm font-semibold hover:opacity-90 transition">
                Get started
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
