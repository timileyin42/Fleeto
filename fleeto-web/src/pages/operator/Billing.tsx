import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    features: ['Up to 50 jobs/month', '3 riders', 'WhatsApp tracking links', 'Basic analytics'],
  },
  {
    name: 'Growth',
    price: '₦15,000/mo',
    features: ['Unlimited jobs', '20 riders', 'WhatsApp + SMS', 'Priority support', 'Advanced analytics'],
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: ['Unlimited everything', 'Dedicated support', 'Custom integrations', 'SLA guarantee'],
  },
]

export default function Billing() {
  const { operator } = useAuth()

  return (
    <DashboardLayout title="Account & Billing">
      <div className="max-w-4xl">
        {/* Current plan */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-card p-xl mb-xl">
          <p className="text-mono-label font-mono uppercase text-on-surface-variant mb-sm">Current Plan</p>
          <div className="flex items-center justify-between">
            <h2 className="text-h2 font-black text-on-surface capitalize">{operator?.plan || 'Starter'}</h2>
            <span className="px-3 py-1.5 bg-green-100 text-green-800 text-label-caps font-semibold uppercase rounded-full">Active</span>
          </div>
        </div>

        {/* Plans grid */}
        <h2 className="text-h3 font-semibold text-on-surface mb-lg">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-xl flex flex-col gap-lg ${
                plan.highlight
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-outline-variant/30 bg-surface-container-lowest shadow-card'
              }`}
            >
              <div>
                <p className={`text-mono-label font-mono uppercase mb-sm ${plan.highlight ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>
                  {plan.name}
                </p>
                <p className={`text-h2 font-black ${plan.highlight ? 'text-on-primary' : 'text-on-surface'}`}>{plan.price}</p>
              </div>
              <ul className="flex flex-col gap-sm flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[16px] ${plan.highlight ? 'text-on-primary/80' : 'text-on-surface-variant'}`}>check</span>
                    <span className={`text-body-sm ${plan.highlight ? 'text-on-primary' : 'text-on-surface'}`}>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-xl text-body-sm font-semibold transition-all ${
                  plan.highlight
                    ? 'bg-on-primary text-primary hover:opacity-90'
                    : 'border border-outline-variant hover:bg-surface-container text-on-surface'
                } ${operator?.plan?.toLowerCase() === plan.name.toLowerCase() ? 'opacity-50 cursor-default' : ''}`}
                disabled={operator?.plan?.toLowerCase() === plan.name.toLowerCase()}
              >
                {operator?.plan?.toLowerCase() === plan.name.toLowerCase() ? 'Current Plan' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
