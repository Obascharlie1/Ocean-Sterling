import Link from 'next/link'
import { Wordmark } from '@/components/ui/Wordmark'

const footerLinks: Record<string, { label: string; href: string }[]> = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'Markets', href: '/markets' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'API', href: '/developers' },
    { label: 'Changelog', href: '/changelog' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Disclosures', href: '/disclosures' },
  ],
  Support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Community', href: '/community' },
    { label: 'Status', href: '/status' },
    { label: 'Security', href: '/security' },
    { label: 'Compliance', href: '/compliance' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-light-surface dark:bg-dark-surface border-t border-light-border dark:border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <Wordmark href={null} className="h-12" />
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 max-w-xs">
              Hedge-fund firepower for every trader. AI signals, sub-50ms execution, and the edge to move first.
            </p>

          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-xs font-semibold text-dark-base dark:text-light-base uppercase tracking-wider mb-4">
                {group}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-slate-500 dark:text-slate-400 hover:text-brand-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-light-border dark:border-dark-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © 2026 Ocean Sterling Technologies Inc. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-right max-w-md">
            Ocean Sterling is registered with the SEC and FINRA. Investing involves risk. Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </footer>
  )
}
