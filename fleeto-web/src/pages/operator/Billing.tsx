import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import { getBillingStatus, subscribeToPlan, type BillingPlan, type PaymentRecord } from '../../api/billing'

const PLANS: { name: string; plan: BillingPlan | null; price: string; features: string[]; highlight?: boolean }[] = [
  {
    name: 'Starter',
    plan: null,
    price: 'Free',
    features: ['Up to 50 jobs/month', '3 riders', 'WhatsApp tracking links', 'Basic analytics'],
  },
  {
    name: 'Growth',
    plan: 'growth',
    price: '₦15,000/mo',
    features: ['Unlimited jobs', '20 riders', 'WhatsApp + SMS', 'Priority support', 'Advanced analytics'],
    highlight: true,
  },
  {
    name: 'Enterprise',
    plan: 'business',
    price: 'Custom',
    features: ['Unlimited everything', 'Dedicated support', 'Custom integrations', 'SLA guarantee'],
  },
]

function formatAmount(kobo: number) {
  return `₦${(kobo / 100).toLocaleString('en-NG')}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Billing() {
  const { operator } = useAuth()
  const [searchParams] = useSearchParams()
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loadingPlan, setLoadingPlan] = useState<BillingPlan | null>(null)
  const [successBanner, setSuccessBanner] = useState(false)

  useEffect(() => {
    getBillingStatus()
      .then((data) => setPayments(data.payments))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (searchParams.get('status') === 'success') {
      setSuccessBanner(true)
    }
  }, [searchParams])

  const handleUpgrade = async (plan: BillingPlan) => {
    setLoadingPlan(plan)
    try {
      const { checkout_url } = await subscribeToPlan(plan)
      window.location.href = checkout_url
    } catch {
      setLoadingPlan(null)
    }
  }

  const currentPlan = operator?.plan || 'starter'

  return (
    <DashboardLayout title="Account & Billing">
      <div className="max-w-4xl flex flex-col gap-xl">

        {successBanner && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-xl px-lg py-md text-body-sm font-medium">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            Payment received — your plan will be updated shortly. Refresh if it hasn't changed yet.
            <button onClick={() => setSuccessBanner(false)} className="ml-auto text-green-600 hover:text-green-800">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        {/* Current plan */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-card p-xl">
          <p className="text-mono-label font-mono uppercase text-on-surface-variant mb-sm">Current Plan</p>
          <div className="flex items-center justify-between">
            <h2 className="text-h2 font-black text-on-surface capitalize">{currentPlan}</h2>
            <span className="px-3 py-1.5 bg-green-100 text-green-800 text-label-caps font-semibold uppercase rounded-full">Active</span>
          </div>
        </div>

        {/* Plans grid */}
        <div>
          <h2 className="text-h3 font-semibold text-on-surface mb-lg">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {PLANS.map((p) => {
              const isCurrent = currentPlan === (p.plan ?? 'starter')
              const isLoading = loadingPlan === p.plan

              return (
                <div
                  key={p.name}
                  className={`rounded-xl border p-xl flex flex-col gap-lg ${
                    p.highlight
                      ? 'border-primary bg-primary text-on-primary'
                      : 'border-outline-variant/30 bg-surface-container-lowest shadow-card'
                  }`}
                >
                  <div>
                    <p className={`text-mono-label font-mono uppercase mb-sm ${p.highlight ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>
                      {p.name}
                    </p>
                    <p className={`text-h2 font-black ${p.highlight ? 'text-on-primary' : 'text-on-surface'}`}>{p.price}</p>
                  </div>
                  <ul className="flex flex-col gap-sm flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-[16px] ${p.highlight ? 'text-on-primary/80' : 'text-on-surface-variant'}`}>check</span>
                        <span className={`text-body-sm ${p.highlight ? 'text-on-primary' : 'text-on-surface'}`}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => p.plan && !isCurrent && handleUpgrade(p.plan)}
                    disabled={isCurrent || isLoading || !p.plan}
                    className={`w-full py-3 rounded-xl text-body-sm font-semibold transition-all ${
                      p.highlight
                        ? 'bg-on-primary text-primary hover:opacity-90'
                        : 'border border-outline-variant hover:bg-surface-container text-on-surface'
                    } disabled:opacity-50 disabled:cursor-default`}
                  >
                    {isLoading ? 'Redirecting…' : isCurrent ? 'Current Plan' : p.plan ? 'Upgrade' : 'Contact Sales'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Payment history */}
        {payments.length > 0 && (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-card p-xl">
            <h2 className="text-h3 font-semibold text-on-surface mb-lg">Payment History</h2>
            <div className="flex flex-col divide-y divide-outline-variant/20">
              {payments.map((pay) => (
                <div key={pay.id} className="flex items-center justify-between py-md">
                  <div>
                    <p className="text-body-md font-medium text-on-surface capitalize">{pay.plan} plan</p>
                    <p className="text-body-sm text-on-surface-variant">{formatDate(pay.created_at)} · Ref: {pay.reference}</p>
                  </div>
                  <div className="flex items-center gap-md">
                    <p className="text-body-md font-semibold text-on-surface">{formatAmount(pay.amount)}</p>
                    <span className={`px-2 py-1 rounded-full text-label-caps font-semibold uppercase ${
                      pay.status === 'success' ? 'bg-green-100 text-green-800'
                      : pay.status === 'failed' ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                    }`}>
                      {pay.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
