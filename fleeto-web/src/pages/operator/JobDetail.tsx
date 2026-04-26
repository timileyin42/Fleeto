import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import { getJob, assignJob } from '../../api/jobs'
import type { Job } from '../../api/jobs'
import { listRiders } from '../../api/riders'
import type { Rider } from '../../api/riders'

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  assigned: 'bg-blue-100 text-blue-800',
  picked_up: 'bg-indigo-100 text-indigo-800',
  in_transit: 'bg-violet-100 text-violet-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const TIMELINE = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered']

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [riders, setRiders] = useState<Rider[]>([])
  const [riderId, setRiderId] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([getJob(id), listRiders()])
      .then(([jRes, rRes]) => {
        setJob(jRes.data)
        setRiders(rRes.data.filter((r) => r.status === 'available'))
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleAssign = async () => {
    if (!id || !riderId) return
    setAssigning(true)
    try {
      const res = await assignJob(id, riderId)
      setJob(res.data)
    } finally {
      setAssigning(false)
    }
  }

  const trackingUrl = job ? `${window.location.origin}/track/${job.tracking_token}` : ''
  const currentStep = job ? TIMELINE.indexOf(job.status) : 0

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-on-surface border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  )

  if (!job) return (
    <DashboardLayout><p className="text-on-surface-variant">Job not found.</p></DashboardLayout>
  )

  return (
    <DashboardLayout>
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-body-sm text-on-surface-variant hover:text-on-surface mb-lg transition-colors">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Left: details */}
        <div className="lg:col-span-2 flex flex-col gap-lg">
          {/* Header card */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-card p-xl">
            <div className="flex items-start justify-between mb-lg">
              <div>
                <p className="text-mono-label font-mono uppercase text-on-surface-variant mb-xs">Job #{job.id.slice(0, 8)}</p>
                <h1 className="text-h2 font-black text-on-surface tracking-tight">{job.customer_name}</h1>
                <p className="text-body-md text-on-surface-variant">{job.customer_phone}</p>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-label-caps font-semibold uppercase ${STATUS_COLOR[job.status]}`}>
                {job.status.replace('_', ' ')}
              </span>
            </div>

            {/* Route */}
            <div className="flex flex-col gap-sm">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px] mt-0.5">trip_origin</span>
                <div>
                  <p className="text-mono-label font-mono uppercase text-on-surface-variant">Pickup</p>
                  <p className="text-body-md text-on-surface">{job.pickup_address}</p>
                </div>
              </div>
              <div className="ml-2.5 border-l-2 border-dashed border-outline-variant h-4" />
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-on-surface text-[20px] mt-0.5 fill">location_on</span>
                <div>
                  <p className="text-mono-label font-mono uppercase text-on-surface-variant">Delivery</p>
                  <p className="text-body-md text-on-surface">{job.dropoff_address}</p>
                </div>
              </div>
            </div>

            {job.parcel_description && (
              <div className="mt-lg pt-lg border-t border-outline-variant/30">
                <p className="text-mono-label font-mono uppercase text-on-surface-variant mb-xs">Notes</p>
                <p className="text-body-md text-on-surface">{job.parcel_description}</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-card p-xl">
            <h2 className="text-h3 font-semibold text-on-surface mb-lg">Timeline</h2>
            <div className="flex flex-col gap-md">
              {TIMELINE.map((step, idx) => {
                const done = idx <= currentStep
                return (
                  <div key={step} className="flex items-center gap-md">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-primary' : 'bg-surface-container-high'}`}>
                      {done ? (
                        <span className="material-symbols-outlined text-on-primary text-[16px]">check</span>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-outline" />
                      )}
                    </div>
                    <span className={`text-body-md capitalize ${done ? 'text-on-surface font-medium' : 'text-on-surface-variant'}`}>
                      {step.replace('_', ' ')}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Item photo */}
          {job.item_photo_url && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-card p-xl">
              <h2 className="text-h3 font-semibold text-on-surface mb-md">Item Photo</h2>
              <img src={job.item_photo_url} alt="Item to be dispatched" className="w-full max-w-sm rounded-xl object-cover" />
            </div>
          )}

          {/* Proof photo */}
          {job.proof_photo_url && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-card p-xl">
              <h2 className="text-h3 font-semibold text-on-surface mb-md">Delivery Proof</h2>
              <img src={job.proof_photo_url} alt="Proof of delivery" className="w-full max-w-sm rounded-xl object-cover" />
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-lg">
          {/* Assign rider */}
          {!job.rider_id && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-card p-xl">
              <h2 className="text-h3 font-semibold text-on-surface mb-md">Assign Rider</h2>
              <select
                value={riderId} onChange={(e) => setRiderId(e.target.value)}
                className="w-full border border-outline-variant rounded-xl px-md py-3 text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white mb-md"
              >
                <option value="">Select rider…</option>
                {riders.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <button
                onClick={handleAssign} disabled={!riderId || assigning}
                className="w-full bg-primary text-on-primary py-3 rounded-xl text-body-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {assigning ? 'Assigning…' : 'Assign'}
              </button>
            </div>
          )}

          {/* Tracking link */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-card p-xl">
            <h2 className="text-h3 font-semibold text-on-surface mb-md">Tracking Link</h2>
            <p className="text-body-sm text-on-surface-variant mb-md">Share this link with the customer to track their delivery.</p>
            <div className="bg-surface-container rounded-xl px-md py-3 mb-md">
              <p className="text-body-sm text-on-surface-variant break-all">{trackingUrl}</p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(trackingUrl)}
              className="w-full flex items-center justify-center gap-2 border border-outline-variant rounded-xl py-3 text-body-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">content_copy</span>
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
