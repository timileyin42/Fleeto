import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import { createJob, assignJob, uploadItemPhoto } from '../../api/jobs'
import { listRiders } from '../../api/riders'
import type { Rider } from '../../api/riders'

export default function NewJob() {
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [pickup, setPickup] = useState('')
  const [delivery, setDelivery] = useState('')
  const [notes, setNotes] = useState('')
  const [riderId, setRiderId] = useState('')
  const [itemFile, setItemFile] = useState<File | null>(null)
  const [itemPreview, setItemPreview] = useState<string | null>(null)
  const [riders, setRiders] = useState<Rider[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    listRiders().then((r) => setRiders(r.data.filter((rd) => rd.status === 'available')))
  }, [])

  const handleFileChange = (file: File | null) => {
    if (!file) return
    setItemFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setItemPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handleFileChange(file)
  }

  const clearPhoto = () => {
    setItemFile(null)
    setItemPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await createJob({
        customer_name: customerName || undefined,
        customer_phone: customerPhone || undefined,
        pickup_address: pickup,
        dropoff_address: delivery,
        parcel_description: notes || undefined,
      })
      const jobId = res.data.id
      if (riderId) await assignJob(jobId, riderId)
      if (itemFile) await uploadItemPhoto(jobId, itemFile)
      navigate(`/dashboard/jobs/${jobId}`)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to create job.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="New Job">
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-card p-xl flex flex-col gap-lg">

          {/* Customer */}
          <div>
            <h3 className="text-body-lg font-semibold text-on-surface mb-md">Customer Details</h3>
            <div className="grid grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs">
                <label className="font-mono text-mono-label text-on-surface-variant uppercase">Full Name</label>
                <input
                  required value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Amara Okafor"
                  className="border border-outline-variant rounded-xl px-md py-3 text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-mono text-mono-label text-on-surface-variant uppercase">Phone</label>
                <input
                  required value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+2348012345678"
                  className="border border-outline-variant rounded-xl px-md py-3 text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div>
            <h3 className="text-body-lg font-semibold text-on-surface mb-md">Delivery Route</h3>
            <div className="flex flex-col gap-md">
              <div className="flex flex-col gap-xs">
                <label className="font-mono text-mono-label text-on-surface-variant uppercase">Pickup Address</label>
                <input
                  required value={pickup} onChange={(e) => setPickup(e.target.value)}
                  placeholder="14 Admiralty Way, Lekki Phase 1"
                  className="border border-outline-variant rounded-xl px-md py-3 text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-mono text-mono-label text-on-surface-variant uppercase">Delivery Address</label>
                <input
                  required value={delivery} onChange={(e) => setDelivery(e.target.value)}
                  placeholder="22 Allen Avenue, Ikeja"
                  className="border border-outline-variant rounded-xl px-md py-3 text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Item Photo */}
          <div>
            <h3 className="text-body-lg font-semibold text-on-surface mb-md">Item Photo <span className="text-on-surface-variant font-normal text-body-sm">(optional)</span></h3>
            {itemPreview ? (
              <div className="relative w-full rounded-xl overflow-hidden border border-outline-variant">
                <img src={itemPreview} alt="Item preview" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="absolute top-2 right-2 bg-inverse-surface text-inverse-on-surface w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity shadow"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[11px] px-2 py-1 rounded-full truncate max-w-[80%]">
                  {itemFile?.name}
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="w-full h-36 border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center gap-sm cursor-pointer hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[36px] text-on-surface-variant">add_photo_alternate</span>
                <p className="text-body-sm text-on-surface-variant">Click or drag & drop to upload</p>
                <p className="text-[11px] text-outline">JPG, PNG, WEBP — max 100MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
          </div>

          {/* Assign rider */}
          <div className="flex flex-col gap-xs">
            <label className="font-mono text-mono-label text-on-surface-variant uppercase">Assign Rider (optional)</label>
            <select
              value={riderId} onChange={(e) => setRiderId(e.target.value)}
              className="border border-outline-variant rounded-xl px-md py-3 text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
            >
              <option value="">Assign later</option>
              {riders.map((r) => (
                <option key={r.id} value={r.id}>{r.name} — {r.phone}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-xs">
            <label className="font-mono text-mono-label text-on-surface-variant uppercase">Notes (optional)</label>
            <textarea
              value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Fragile items, call before delivery…"
              rows={3}
              className="border border-outline-variant rounded-xl px-md py-3 text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {error && <p className="text-body-sm text-error">{error}</p>}

          <div className="flex gap-md pt-sm">
            <button
              type="button" onClick={() => navigate(-1)}
              className="flex-1 border border-outline-variant rounded-xl py-3 text-body-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 bg-primary text-on-primary rounded-xl py-3 text-body-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Creating…' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
