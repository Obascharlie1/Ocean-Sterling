/* Content for the short, standalone footer pages (rendered by app/[slug]). */

export interface InfoSection { heading?: string; body: string }
export interface InfoPage {
  category: string
  title: string
  subtitle: string
  sections: InfoSection[]
}

export const infoPages: Record<string, InfoPage> = {
  /* ── Product ─────────────────────────────────────────────────────────── */
  markets: {
    category: 'Product',
    title: 'Markets',
    subtitle: 'Trade across every major asset class from a single account.',
    sections: [
      { body: 'Ocean Sterling gives you access to 140+ markets — crypto, equities, forex, indices and commodities — with institutional-grade routing and sub-50ms execution.' },
      { heading: 'Crypto', body: 'Bitcoin, Ethereum and hundreds of altcoins, traded 24/7 with deep liquidity.' },
      { heading: 'Stocks & indices', body: 'US and global equities plus the major indices, with fractional investing.' },
      { heading: 'Forex & commodities', body: 'Major and minor FX pairs, gold, oil and more, with tight spreads.' },
    ],
  },
  developers: {
    category: 'Product',
    title: 'Developer API',
    subtitle: 'Build on top of Ocean Sterling with a clean, modern REST API.',
    sections: [
      { body: 'Programmatic access to market data, orders, positions and account balances. REST and WebSocket endpoints, generous rate limits, and SDKs for popular languages.' },
      { heading: 'Get access', body: 'API access is available on paid plans. Generate keys from your dashboard and read the reference to get started.' },
      { heading: 'Status', body: 'The API is currently in private preview. Contact us to join the waitlist.' },
    ],
  },
  changelog: {
    category: 'Product',
    title: 'Changelog',
    subtitle: "What's new on Ocean Sterling.",
    sections: [
      { heading: 'Copy trading & AI bot', body: 'Mirror top traders automatically, and run an autonomous AI trading bot with configurable risk.' },
      { heading: 'Multi-currency display', body: 'View your balance and activity in eight currencies.' },
      { heading: 'Redesigned dashboard', body: 'A faster, cleaner overview with live markets and an interactive balance chart.' },
    ],
  },

  /* ── Company ─────────────────────────────────────────────────────────── */
  about: {
    category: 'Company',
    title: 'About us',
    subtitle: 'Hedge-fund firepower, handed to every trader.',
    sections: [
      { body: 'Ocean Sterling was founded to close the gap between institutional and retail trading. We build the AI, execution and automation that used to be reserved for hedge funds, and put it in the hands of everyone.' },
      { heading: 'Our mission', body: 'Give every trader the tools, speed and intelligence to compete — and win — in modern markets.' },
    ],
  },
  blog: {
    category: 'Company',
    title: 'Blog',
    subtitle: 'Market insight, product updates and trading education.',
    sections: [
      { body: 'Our team shares research, strategy breakdowns and platform news here. New articles are published regularly — check back soon.' },
    ],
  },
  careers: {
    category: 'Company',
    title: 'Careers',
    subtitle: 'Help us build the future of trading.',
    sections: [
      { body: "We're a small, senior team moving fast. If you care about markets, performance and craft, we'd love to hear from you." },
      { heading: 'Open roles', body: 'We hire across engineering, quant research, design and support. Send your details to careers@oceansterling.com.' },
    ],
  },
  press: {
    category: 'Company',
    title: 'Press',
    subtitle: 'Media resources and company news.',
    sections: [
      { body: 'For press enquiries, interviews or brand assets, reach us at press@oceansterling.com and we’ll get back to you within two business days.' },
    ],
  },
  contact: {
    category: 'Company',
    title: 'Contact',
    subtitle: "We'd love to hear from you.",
    sections: [
      { heading: 'Support', body: 'The fastest way to reach us is live chat, available in the bottom-right of every page.' },
      { heading: 'Email', body: 'General: hello@oceansterling.com · Support: support@oceansterling.com' },
    ],
  },

  /* ── Legal ───────────────────────────────────────────────────────────── */
  privacy: {
    category: 'Legal',
    title: 'Privacy Policy',
    subtitle: 'How we collect, use and protect your data.',
    sections: [
      { heading: 'What we collect', body: 'Account details you provide (name, email, verification documents) and usage data needed to run the platform securely.' },
      { heading: 'How we use it', body: 'To provide the service, verify identity, prevent fraud and comply with legal obligations. We do not sell your personal data.' },
      { heading: 'Your rights', body: 'You can request access to, correction of, or deletion of your data at any time by contacting privacy@oceansterling.com.' },
      { body: 'This is a summary. The full policy is available on request.' },
    ],
  },
  terms: {
    category: 'Legal',
    title: 'Terms of Service',
    subtitle: 'The agreement that governs your use of Ocean Sterling.',
    sections: [
      { heading: 'Eligibility', body: 'You must be of legal age and able to form a binding contract in your jurisdiction to use the platform.' },
      { heading: 'Your account', body: 'You are responsible for keeping your credentials secure and for all activity under your account.' },
      { heading: 'Risk', body: 'Trading involves substantial risk of loss. You trade at your own discretion and risk.' },
      { body: 'This is a summary. The full terms are available on request.' },
    ],
  },
  cookies: {
    category: 'Legal',
    title: 'Cookie Policy',
    subtitle: 'How we use cookies and similar technologies.',
    sections: [
      { heading: 'Essential cookies', body: 'Required to keep you signed in and to secure your session. These cannot be turned off.' },
      { heading: 'Analytics', body: 'Optional cookies help us understand how the product is used so we can improve it. You can decline these.' },
    ],
  },
  disclosures: {
    category: 'Legal',
    title: 'Disclosures',
    subtitle: 'Important information about trading and risk.',
    sections: [
      { body: 'Investing involves risk, including the possible loss of principal. Past performance does not guarantee future results. Returns shown are illustrative and not a promise of future performance.' },
      { body: 'Ocean Sterling does not provide personalized investment advice. Consider your objectives and risk tolerance, and seek independent advice where appropriate.' },
    ],
  },

  /* ── Support ─────────────────────────────────────────────────────────── */
  help: {
    category: 'Support',
    title: 'Help Center',
    subtitle: 'Answers to common questions, fast.',
    sections: [
      { body: 'Browse guides on deposits, withdrawals, verification, copy trading and the AI bot. Most topics are covered in our on-site FAQ.' },
      { heading: 'Still stuck?', body: 'Open live chat any time — our support team typically replies within the hour.' },
    ],
  },
  community: {
    category: 'Support',
    title: 'Community',
    subtitle: 'Trade and learn alongside millions of members.',
    sections: [
      { body: 'Join the conversation, share setups and follow top traders. Community channels are rolling out across Discord and X — links coming soon.' },
    ],
  },
  status: {
    category: 'Support',
    title: 'System Status',
    subtitle: 'Live platform and execution health.',
    sections: [
      { heading: 'All systems operational', body: 'Trading, deposits, withdrawals and the API are running normally. Current execution uptime is 99.97%.' },
      { body: 'Incidents and maintenance windows are posted here as they happen.' },
    ],
  },
  security: {
    category: 'Support',
    title: 'Security',
    subtitle: 'How we keep your account and funds safe.',
    sections: [
      { heading: 'Encryption', body: '256-bit encryption protects your data in transit and at rest.' },
      { heading: 'Segregated funds', body: 'Client funds are held separately from company operating accounts.' },
      { heading: 'Verification', body: 'Withdrawals are protected by one-time authorization codes and identity checks.' },
    ],
  },
  compliance: {
    category: 'Support',
    title: 'Compliance',
    subtitle: 'Our commitment to operating to the highest standards.',
    sections: [
      { body: 'Ocean Sterling operates a KYC and AML program, segregates client funds and maintains independent security audits.' },
      { body: 'For compliance enquiries, contact compliance@oceansterling.com.' },
    ],
  },
}

export const infoSlugs = Object.keys(infoPages)
