import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRiderJob, updateJobStatus, uploadProof, pingLocation } from '../../api/jobs'
import type { Job } from '../../api/jobs'

const NEXT_STATUS: Record<string, { label: string; next: string }> = {
  assigned: { label: 'Mark Picked Up', next: 'picked_up' },
  picked_up: { label: 'Start Delivery', next: 'in_transit' },
  in_transit: { label: 'Mark Delivered', next: 'delivered' },
}

const STATUS_COLOR: Record<string, string> = {
  assigned: 'bg-blue-100 text-blue-800',
  picked_up: 'bg-indigo-100 text-indigo-800',
  in_transit: 'bg-violet-100 text-violet-800',
  delivered: 'bg-green-100 text-green-800',
}

export default function RiderJobDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id) return
    getRiderJob(id).then((r) => setJob(r.data)).finally(() => setLoading(false))
  }, [id])

  // Broadcast GPS while in_transit
  useEffect(() => {
    if (!job || job.status !== 'in_transit' || !id) return
    if (!navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        pingLocation(id, pos.coords.latitude, pos.coords.longitude).catch(() => null)
      },
      null,
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [job?.status, id])

  const handleStatusUpdate = async () => {
    if (!job || !id) return
    const next = NEXT_STATUS[job.status]
    if (!next) return
    setUpdating(true)
    try {
      const res = await updateJobStatus(id, next.next)
      setJob(res.data)
    } finally {
      setUpdating(false)
    }
  }

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !id) return
    setUploading(true)
    try {
      await uploadProof(id, file)
      const res = await getRiderJob(id)
      setJob(res.data)
    } finally {
      setUploading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-on-surface border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!job) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-on-surface-variant">Job not found.</p>
    </div>
  )

  const nextAction = NEXT_STATUS[job.status]

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="sticky top-0 bg-surface-container-lowest border-b border-outline-variant/30 px-lg py-md z-10 flex items-center gap-md">
        <button onClick={() => navigate(-1)} className="text-on-surface-variant hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-h3 font-semibold text-on-surface">Job Details</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-lg flex flex-col gap-md">
        {/* Status badge */}
        <div className="flex items-center justify-between">
          <p className="text-mono-label font-mono uppercase text-on-surface-variant">Job #{job.id.slice(0, 8)}</p>
          <span className={`px-3 py-1.5 rounded-full text-label-caps font-semibold uppercase ${STATUS_COLOR[job.status] || 'bg-surface-container text-on-surface-variant'}`}>
            {job.status.replace('_', ' ')}
          </span>
        </div>

        {/* Customer */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-md shadow-card">
          <p className="text-mono-label font-mono uppercase text-on-surface-variant mb-sm">Customer</p>
          <p className="text-body-lg font-semibold text-on-surface">{job.customer_name}</p>
          <a href={`tel:${job.customer_phone}`} className="flex items-center gap-2 text-body-sm text-on-surface-variant mt-xs hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[16px]">phone</span>
            {job.customer_phone}
          </a>
        </div>

        {/* Route */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-md shadow-card flex flex-col gap-md">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px] mt-0.5">trip_origin</span>
            <div>
              <p className="text-mono-label font-mono uppercase text-on-surface-variant mb-xs">Pickup</p>
              <p className="text-body-md text-on-surface">{job.pickup_address}</p>
            </div>
          </div>
          <div className="border-l-2 border-dashed border-outline-variant ml-2.5 h-4" />
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-on-surface text-[20px] mt-0.5 fill">location_on</span>
            <div>
              <p className="text-mono-label font-mono uppercase text-on-surface-variant mb-xs">Delivery</p>
              <p className="text-body-md text-on-surface">{job.dropoff_address}</p>
            </div>
          </div>
        </div>

        {job.parcel_description && (
          <div className="bg-surface-container rounded-xl p-md">
            <p className="text-mono-label font-mono uppercase text-on-surface-variant mb-xs">Notes</p>
            <p className="text-body-sm text-on-surface">{job.parcel_description}</p>
          </div>
        )}

        {/* Proof photo */}
        {job.status === 'in_transit' && !job.proof_photo_url && (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-md shadow-card">
            <p className="text-mono-label font-mono uppercase text-on-surface-variant mb-sm">Delivery Proof</p>
            <p className="text-body-sm text-on-surface-variant mb-md">Upload a photo as proof of delivery.</p>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-outline-variant rounded-xl py-4 text-body-sm font-medium text-on-surface-variant hover:border-primary hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">camera_alt</span>
              {uploading ? 'Uploading…' : 'Upload Photo'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleProofUpload} />
          </div>
        )}

        {job.proof_photo_url && (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-md shadow-card">
            <p className="text-mono-label font-mono uppercase text-on-surface-variant mb-sm">Proof Photo</p>
            <img src={job.proof_photo_url} alt="Proof" className="w-full rounded-xl object-cover max-h-48" />
          </div>
        )}

        {job.status === 'delivered' && (
          <div className="bg-green-50 rounded-xl border border-green-200 p-md flex items-center gap-3">
            <span className="material-symbols-outlined text-green-700 text-[24px] fill">check_circle</span>
            <p className="text-body-md font-semibold text-green-800">Delivered successfully!</p>
          </div>
        )}
      </div>

      {/* Bottom action */}
      {nextAction && (
        <div className="sticky bottom-0 bg-surface-container-lowest border-t border-outline-variant/30 p-lg">
          <button
            onClick={handleStatusUpdate}
            disabled={updating}
            className="w-full bg-primary text-on-primary py-4 rounded-xl text-body-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {updating ? 'Updating…' : nextAction.label}
          </button>
        </div>
      )}
    </div>
  )
}
