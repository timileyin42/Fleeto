import client from './client'

export type BillingPlan = 'starter' | 'growth' | 'business'

export interface PaymentRecord {
  id: string
  reference: string
  plan: BillingPlan
  amount: number
  status: 'pending' | 'success' | 'failed'
  created_at: string
}

export interface BillingStatus {
  plan: BillingPlan
  payments: PaymentRecord[]
}

export async function getBillingStatus(): Promise<BillingStatus> {
  const res = await client.get<BillingStatus>('/billing/status')
  return res.data
}

export async function subscribeToPlan(plan: BillingPlan): Promise<{ checkout_url: string; reference: string }> {
  const res = await client.post('/billing/subscribe', { plan })
  return res.data
}
