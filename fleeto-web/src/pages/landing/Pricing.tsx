import { Link } from 'react-router-dom'
import MarketingNav from '../../components/MarketingNav'

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    period: null,
    subtitle: 'For testing and tiny fleets.',
    features: ['Up to 2 riders', 'Standard dispatching', 'Community support'],
    cta: 'Start Free',
    ctaTo: '/signup',
    highlighted: false,
    badge: null,
  },
  {
    name: 'Professional',
    price: '$0.15',
    period: '/ job',
    subtitle: 'For growing operations.',
    features: [
      'Unlimited riders',
      'Multi-user access',
      'Advanced API access',
      'Priority email support',
    ],
    cta: 'Get Professional',
    ctaTo: '/signup',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: null,
    subtitle: 'For massive scale.',
    features: [
      'Volume discounts',
      'Dedicated infrastructure',
      'Custom integrations',
      '24/7 Phone support & SLAs',
    ],
    cta: 'Contact Sales',
    ctaTo: '#',
    highlighted: false,
    badge: null,
  },
]

type CompareRow = {
  feature: string
  starter: string | boolean | null
  pro: string | boolean | null
  enterprise: string | boolean | null
}

const COMPARISON: CompareRow[] = [
  { feature: 'Rider Limit', starter: '2 Riders', pro: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Multi-user Access', starter: null, pro: true, enterprise: true },
  { feature: 'API Access', starter: null, pro: 'Standard', enterprise: 'Advanced & Webhooks' },
  { feature: 'Support Level', starter: 'Community', pro: 'Priority Email', enterprise: '24/7 Phone + SLA' },
  { feature: 'Custom Reporting', starter: null, pro: null, enterprise: true },
]

function Cell({ value }: { value: string | boolean | null }) {
  if (value === null) return <span className="material-symbols-outlined text-outline-variant">remove</span>
  if (value === true) return <span className="material-symbols-outlined text-primary">check</span>
  return <>{value}</>
}

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <MarketingNav />

      <main className="flex-grow w-full max-w-7xl mx-auto px-8 py-xxl flex flex-col gap-xxl">

        {/* Hero */}
        <header className="text-center max-w-3xl mx-auto flex flex-col gap-md">
          <h1 className="text-h1 font-black text-on-background tracking-tighter">
            Infrastructure for modern logistics.
          </h1>
          <p className="text-body-lg text-on-surface-variant">
            Simple, predictable pricing designed to scale with your operations. No hidden fees, just raw throughput.
          </p>
        </header>

        {/* Plan Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-xl flex flex-col gap-lg relative ${
                plan.highlighted
                  ? 'bg-surface-container-low border-2 border-primary shadow-[0_4px_12px_rgba(0,0,0,0.08)]'
                  : 'bg-surface-container-lowest border border-outline-variant shadow-[0_4px_12px_rgba(0,0,0,0.05)]'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-sm py-xs rounded-full text-label-caps font-semibold uppercase whitespace-nowrap">
                  {plan.badge}
                </div>
              )}
              <div>
                <h3 className="text-h3 font-semibold text-on-background">{plan.name}</h3>
                <p className="text-body-sm text-on-surface-variant mt-sm">{plan.subtitle}</p>
              </div>
              <div className="flex items-baseline gap-sm">
                <span className="text-h1 font-black text-on-background">{plan.price}</span>
                {plan.period && (
                  <span className="text-body-sm text-on-surface-variant">{plan.period}</span>
                )}
              </div>
              <ul className="flex flex-col gap-md flex-grow text-body-sm text-on-surface">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-sm">
                    <span
                      className="material-symbols-outlined text-primary text-[18px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={plan.ctaTo}
                className={`w-full text-center py-md rounded-lg text-label-caps font-semibold uppercase transition-opacity hover:opacity-90 ${
                  plan.highlighted
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-variant text-on-surface'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </section>

        {/* Feature Comparison Table */}
        <section>
          <h2 className="text-h2 font-semibold text-on-background mb-lg text-center">
            Compare Features
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="text-label-caps font-semibold text-on-surface-variant uppercase pb-md border-b border-outline-variant w-1/4">Features</th>
                  <th className="text-label-caps font-semibold text-on-surface-variant uppercase pb-md border-b border-outline-variant w-1/4">Starter</th>
                  <th className="text-label-caps font-semibold text-primary uppercase pb-md border-b border-primary w-1/4">Professional</th>
                  <th className="text-label-caps font-semibold text-on-surface-variant uppercase pb-md border-b border-outline-variant w-1/4">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-body-sm text-on-background">
                {COMPARISON.map((row) => (
                  <tr key={row.feature} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-md border-b border-outline-variant font-medium">{row.feature}</td>
                    <td className="py-md border-b border-outline-variant text-on-surface-variant">
                      <Cell value={row.starter} />
                    </td>
                    <td className="py-md border-b border-outline-variant">
                      <Cell value={row.pro} />
                    </td>
                    <td className="py-md border-b border-outline-variant">
                      <Cell value={row.enterprise} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white w-full border-t pt-16 pb-8 border-zinc-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto px-8 w-full">
          <div className="flex flex-col gap-4">
            <span className="text-lg font-black tracking-tighter text-zinc-900 uppercase">Delivra</span>
            <span className="text-xs tracking-wide uppercase font-semibold text-zinc-400">
              © 2026 Delivra. All rights reserved.
            </span>
          </div>
          <div className="flex flex-col gap-3 text-xs tracking-wide uppercase font-semibold">
            <a href="#" className="text-zinc-500 hover:text-zinc-900 transition-colors">Product</a>
            <a href="#" className="text-zinc-500 hover:text-zinc-900 transition-colors">Network</a>
          </div>
          <div className="flex flex-col gap-3 text-xs tracking-wide uppercase font-semibold">
            <a href="#" className="text-zinc-500 hover:text-zinc-900 transition-colors">Status</a>
            <a href="#" className="text-zinc-500 hover:text-zinc-900 transition-colors">Legal</a>
          </div>
          <div className="flex flex-col gap-3 text-xs tracking-wide uppercase font-semibold">
            <a href="#" className="text-zinc-500 hover:text-zinc-900 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
