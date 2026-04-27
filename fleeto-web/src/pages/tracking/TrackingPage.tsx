import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { getTracking } from '../../api/tracking'
import type { TrackingInfo } from '../../api/tracking'
import 'leaflet/dist/leaflet.css'

// Fix leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const STATUS_LABEL: Record<string, string> = {
  pending: 'Order Confirmed',
  assigned: 'Rider Assigned',
  picked_up: 'Package Picked Up',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const STATUS_STEPS = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered']

export default function TrackingPage() {
  const { token } = useParams<{ token: string }>()
  const [info, setInfo] = useState<TrackingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    const load = () =>
      getTracking(token)
        .then((r) => setInfo(r.data))
        .catch(() => setError('Tracking link not found or expired.'))
        .finally(() => setLoading(false))

    load()
    // Poll every 15s when in transit
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [token])

  const currentStep = info ? STATUS_STEPS.indexOf(info.status) : 0
  const hasLocation = info?.last_lat && info?.last_lng
  const center: [number, number] = hasLocation
    ? [info!.last_lat!, info!.last_lng!]
    : [6.5244, 3.3792] // Lagos default

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-on-surface border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <span className="material-symbols-outlined text-[64px] text-on-surface-variant mb-md block">location_off</span>
        <p className="text-h3 font-semibold text-on-surface">Tracking unavailable</p>
        <p className="text-body-md text-on-surface-variant mt-sm">{error}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Floating header */}
      <header className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center pointer-events-none">
        <div className="bg-surface/90 backdrop-blur-md px-6 py-3 rounded-full shadow-card pointer-events-auto border border-outline-variant/20">
          <span className="text-h3 font-black tracking-widest uppercase text-primary">Delivra</span>
        </div>
        {info?.status === 'in_transit' && (
          <div className="bg-surface/90 backdrop-blur-md px-4 py-2 rounded-full shadow-card border border-outline-variant/20 flex items-center gap-2 pointer-events-auto">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-body-sm font-medium text-on-surface">Live</span>
          </div>
        )}
      </header>

      {/* Map */}
      <div className="flex-1 relative" style={{ minHeight: '60vh' }}>
        <MapContainer center={center} zoom={14} className="w-full h-full" style={{ minHeight: '60vh' }} zoomControl={false}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          />
          {hasLocation && (
            <Marker position={[info!.last_lat!, info!.last_lng!]}>
              <Popup>{info?.rider_name || 'Rider'}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Bottom sheet */}
      <div className="bg-surface w-full rounded-t-3xl shadow-sheet z-30 -mt-8 relative">
        {/* Drag handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 bg-outline-variant/40 rounded-full" />
        </div>

        <div className="px-lg pb-8 pt-md flex flex-col gap-lg">
          {/* Status header */}
          <div className="flex flex-col gap-sm">
            <div className="flex items-center justify-between">
              <p className="text-mono-label font-mono uppercase text-on-surface-variant">Delivery Status</p>
              <span className="bg-surface-container px-3 py-1.5 rounded-full text-label-caps font-semibold uppercase text-on-surface">
                {STATUS_LABEL[info?.status || 'pending']}
              </span>
            </div>
            <h1 className="text-h1 font-black text-on-surface tracking-tighter">
              {info?.status === 'delivered' ? 'Delivered!' : 'In Progress'}
            </h1>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${Math.max(10, ((currentStep + 1) / STATUS_STEPS.length) * 100)}%` }}
            />
          </div>

          {/* Step timeline */}
          <div className="flex flex-col gap-sm">
            {STATUS_STEPS.map((step, idx) => {
              const done = idx <= currentStep
              return (
                <div key={step} className="flex items-center gap-md">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-primary' : 'bg-surface-container-high'}`}>
                    {done && <span className="material-symbols-outlined text-on-primary text-[14px]">check</span>}
                  </div>
                  <span className={`text-body-sm capitalize ${done ? 'text-on-surface font-medium' : 'text-on-surface-variant'}`}>
                    {STATUS_LABEL[step]}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Route */}
          <div className="bg-surface-container rounded-xl p-md flex flex-col gap-sm">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px] mt-0.5">trip_origin</span>
              <div>
                <p className="text-mono-label font-mono uppercase text-on-surface-variant text-[10px]">From</p>
                <p className="text-body-sm text-on-surface">{info?.pickup_address}</p>
              </div>
            </div>
            <div className="border-l-2 border-dashed border-outline-variant ml-2 h-3" />
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-on-surface text-[18px] mt-0.5 fill">location_on</span>
              <div>
                <p className="text-mono-label font-mono uppercase text-on-surface-variant text-[10px]">To</p>
                <p className="text-body-sm text-on-surface">{info?.dropoff_address}</p>
              </div>
            </div>
          </div>

          {/* Rider info */}
          {info?.rider_name && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">person</span>
                </div>
                <div>
                  <p className="text-body-sm font-semibold text-on-surface">{info.rider_name}</p>
                  <p className="text-[11px] text-on-surface-variant">Your delivery rider</p>
                </div>
              </div>
              {info?.rider_phone && (
                <a
                  href={`tel:${info.rider_phone}`}
                  className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary"
                >
                  <span className="material-symbols-outlined text-[18px]">phone</span>
                </a>
              )}
            </div>
          )}

          <p className="text-[10px] text-on-surface-variant text-center">
            Powered by <strong>Delivra</strong> · {info?.operator_name}
          </p>
        </div>
      </div>
    </div>
  )
}
