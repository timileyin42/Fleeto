import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { getTracking } from '../../api/tracking'
import type { TrackingInfo } from '../../api/tracking'
import 'leaflet/dist/leaflet.css'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Order Confirmed',
  assigned: 'Rider Assigned',
  picked_up: 'Package Picked Up',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const STATUS_STEPS = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered']

async function geocodeAddress(address: string): Promise<[number, number] | null> {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await r.json()
    if (data[0]) return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
  } catch {}
  return null
}

async function fetchRoute(from: [number, number], to: [number, number]): Promise<[number, number][]> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`
    const r = await fetch(url)
    const data = await r.json()
    if (data.routes?.[0]) {
      return data.routes[0].geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
      )
    }
  } catch {}
  return [from, to]
}

async function fetchEta(from: [number, number], to: [number, number]): Promise<number | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=false`
    const r = await fetch(url)
    const data = await r.json()
    if (data.routes?.[0]) return Math.round(data.routes[0].duration)
  } catch {}
  return null
}

function formatEta(seconds: number): string {
  if (seconds < 90) return '< 1 min'
  const mins = Math.round(seconds / 60)
  if (mins < 60) return `~${mins} min`
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  return rem > 0 ? `~${hrs} hr ${rem} min` : `~${hrs} hr`
}

function formatLastSeen(ts: string | null | undefined): string {
  if (!ts) return 'a while ago'
  const secs = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins} min ago`
  return `${Math.floor(mins / 60)} hr ago`
}

function calcBearing(from: [number, number], to: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLng = toRad(to[1] - from[1])
  const lat1 = toRad(from[0])
  const lat2 = toRad(to[0])
  const x = Math.sin(dLng) * Math.cos(lat2)
  const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return ((Math.atan2(x, y) * 180) / Math.PI + 360) % 360
}

function makeRiderIcon(deg: number, ghost = false) {
  const fill = ghost ? '#9E9E9E' : '#1A73E8'
  const pulse = ghost ? 'rgba(158,158,158,0.18)' : 'rgba(26,115,232,0.18)'
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:52px;height:52px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:52px;height:52px;border-radius:50%;background:${pulse};"></div>
        <div style="position:absolute;transform:rotate(${deg}deg);width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="18" fill="${fill}"/>
            <path d="M18 8 L24 26 L18 21.5 L12 26 Z" fill="white"/>
          </svg>
        </div>
      </div>`,
    iconSize: [52, 52],
    iconAnchor: [26, 26],
  })
}

function makePickupIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="width:18px;height:18px;background:#34A853;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"/>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

function makeDropoffIcon() {
  return L.divIcon({
    className: '',
    html: `<svg width="28" height="38" viewBox="0 0 28 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.8 14 24 14 24S28 23.8 28 14C28 6.268 21.732 0 14 0z" fill="#EA4335"/>
      <circle cx="14" cy="14" r="6" fill="white"/>
    </svg>`,
    iconSize: [28, 38],
    iconAnchor: [14, 38],
  })
}

// Centers the map on the rider once when they first appear, then hands control back to the user
function MapController({
  riderPos,
  fallbackCoords,
}: {
  riderPos: [number, number] | null
  fallbackCoords: [number, number][]
}) {
  const map = useMap()
  const initialised = useRef(false)

  useEffect(() => {
    if (initialised.current) return

    if (riderPos) {
      map.setView(riderPos, 15, { animate: false })
      initialised.current = true
    } else if (fallbackCoords.length >= 2) {
      try {
        map.fitBounds(L.latLngBounds(fallbackCoords), { padding: [60, 60], maxZoom: 15 })
        initialised.current = true
      } catch {}
    }
  }, [riderPos, fallbackCoords, map])

  return null
}

export default function TrackingPage() {
  const { token } = useParams<{ token: string }>()
  const [info, setInfo] = useState<TrackingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null)
  const [dropoffCoords, setDropoffCoords] = useState<[number, number] | null>(null)
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([])
  const [riderBearing, setRiderBearing] = useState(0)
  const [eta, setEta] = useState<number | null>(null)
  const [displayPos, setDisplayPos] = useState<[number, number] | null>(null)
  const displayPosRef = useRef<[number, number] | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const prevRiderPos = useRef<[number, number] | null>(null)
  const geocodeDone = useRef(false)

  useEffect(() => {
    if (!token) return
    const load = () =>
      getTracking(token)
        .then((r) => setInfo(r.data))
        .catch(() => setError('Tracking link not found or expired.'))
        .finally(() => setLoading(false))

    load()
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [token])

  // Geocode pickup + dropoff once
  useEffect(() => {
    if (!info || geocodeDone.current) return
    geocodeDone.current = true
    Promise.all([
      geocodeAddress(info.pickup_address),
      geocodeAddress(info.dropoff_address),
    ]).then(([pickup, dropoff]) => {
      if (pickup) setPickupCoords(pickup)
      if (dropoff) setDropoffCoords(dropoff)
    })
  }, [info])

  // Road-following route between pickup and dropoff
  useEffect(() => {
    if (!pickupCoords || !dropoffCoords) return
    fetchRoute(pickupCoords, dropoffCoords).then(setRouteCoords)
  }, [pickupCoords, dropoffCoords])

  // Bearing + ETA update on every rider position change
  useEffect(() => {
    if (!info?.last_lat || !info?.last_lng) return
    const pos: [number, number] = [info.last_lat, info.last_lng]
    if (prevRiderPos.current) {
      setRiderBearing(calcBearing(prevRiderPos.current, pos))
    }
    prevRiderPos.current = pos
  }, [info?.last_lat, info?.last_lng])

  useEffect(() => {
    if (!info?.last_lat || !info?.last_lng || !dropoffCoords) return
    if (info.status === 'delivered' || info.status === 'cancelled') return
    fetchEta([info.last_lat, info.last_lng], dropoffCoords).then((secs) => {
      if (secs !== null) setEta(secs)
    })
  }, [info?.last_lat, info?.last_lng, dropoffCoords, info?.status])

  // Smooth interpolation: animate marker from old position to new over 2000 ms
  useEffect(() => {
    if (!info?.last_lat || !info?.last_lng) return
    const target: [number, number] = [info.last_lat, info.last_lng]

    if (!displayPosRef.current) {
      // First fix — place instantly, no animation
      displayPosRef.current = target
      setDisplayPos([...target])
      return
    }

    const start: [number, number] = [...displayPosRef.current]
    const duration = 2000
    const t0 = performance.now()

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)

    function step(now: number) {
      const t = Math.min((now - t0) / duration, 1)
      const ease = 1 - (1 - t) ** 3 // ease-out cubic
      const interp: [number, number] = [
        start[0] + (target[0] - start[0]) * ease,
        start[1] + (target[1] - start[1]) * ease,
      ]
      displayPosRef.current = interp
      setDisplayPos([...interp])
      if (t < 1) animFrameRef.current = requestAnimationFrame(step)
    }

    animFrameRef.current = requestAnimationFrame(step)
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current) }
  }, [info?.last_lat, info?.last_lng])

  const currentStep = info ? STATUS_STEPS.indexOf(info.status) : 0
  const hasRider = !!(info?.last_lat && info?.last_lng)
  const riderPos: [number, number] | null = hasRider ? [info!.last_lat!, info!.last_lng!] : null

  // Ghost mode: rider hasn't sent a ping in over 2 minutes
  const isGhost = useMemo(() => {
    if (!info?.last_seen) return false
    return Date.now() - new Date(info.last_seen).getTime() > 2 * 60 * 1000
  }, [info?.last_seen])

  const fallbackCoords: [number, number][] = (
    [pickupCoords, dropoffCoords].filter(Boolean) as [number, number][]
  )

  const showEta =
    eta !== null && hasRider && !isGhost && info?.status !== 'delivered' && info?.status !== 'cancelled'

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
        {info?.status === 'in_transit' && !isGhost && (
          <div className="bg-surface/90 backdrop-blur-md px-4 py-2 rounded-full shadow-card border border-outline-variant/20 flex items-center gap-2 pointer-events-auto">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-body-sm font-medium text-on-surface">Live</span>
          </div>
        )}
      </header>

      {/* Map — clean white Google-style tiles */}
      <div className="flex-1 relative" style={{ minHeight: '60vh' }}>
        <MapContainer
          center={riderPos ?? pickupCoords ?? [6.5244, 3.3792]}
          zoom={riderPos ? 15 : 13}
          className="w-full h-full"
          style={{ minHeight: '60vh' }}
          zoomControl={false}
        >
          {/* CartoDB Positron — white minimal tiles, closest to Google Maps look */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          <MapController riderPos={riderPos} fallbackCoords={fallbackCoords} />

          {/* Route line in Google blue */}
          {routeCoords.length > 1 && (
            <Polyline
              positions={routeCoords}
              pathOptions={{ color: '#1A73E8', weight: 6, opacity: 0.85 }}
            />
          )}

          {/* Pickup pin */}
          {pickupCoords && (
            <Marker position={pickupCoords} icon={makePickupIcon()}>
              <Popup><strong>Pickup</strong><br />{info?.pickup_address}</Popup>
            </Marker>
          )}

          {/* Dropoff pin */}
          {dropoffCoords && (
            <Marker position={dropoffCoords} icon={makeDropoffIcon()}>
              <Popup><strong>Dropoff</strong><br />{info?.dropoff_address}</Popup>
            </Marker>
          )}

          {/* Rider — animated arrow; grey when signal is lost */}
          {displayPos && (
            <Marker position={displayPos} icon={makeRiderIcon(riderBearing, isGhost)}>
              <Popup>
                {info?.rider_name || 'Rider'}
                {info?.last_seen && <><br />Last seen {formatLastSeen(info.last_seen)}</>}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Ghost mode banner — floats above the bottom sheet when signal is lost */}
      {isGhost && riderPos && (
        <div className="absolute bottom-[calc(60vh-32px)] left-4 right-4 z-40 bg-surface/95 backdrop-blur-md border border-outline-variant/30 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-card">
          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">signal_wifi_off</span>
          </div>
          <div>
            <p className="text-body-sm font-semibold text-on-surface">Rider signal weak</p>
            <p className="text-[11px] text-on-surface-variant">Last seen {formatLastSeen(info?.last_seen)}</p>
          </div>
        </div>
      )}

      {/* Bottom sheet */}
      <div className="bg-surface w-full rounded-t-3xl shadow-sheet z-30 -mt-8 relative">
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 bg-outline-variant/40 rounded-full" />
        </div>

        <div className="px-lg pb-8 pt-md flex flex-col gap-lg">
          {/* ETA card */}
          {showEta && (
            <div className="bg-[#E8F0FE] border border-[#1A73E8]/20 rounded-2xl px-lg py-md flex items-center gap-md">
              <div className="w-10 h-10 rounded-full bg-[#1A73E8] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-white text-[20px]">schedule</span>
              </div>
              <div>
                <p className="text-mono-label font-mono uppercase text-[#1A73E8]/70 text-[10px]">Estimated arrival</p>
                <p className="text-h2 font-black text-[#1A73E8] leading-tight">{formatEta(eta!)}</p>
              </div>
            </div>
          )}

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

          {/* Route addresses */}
          <div className="bg-surface-container rounded-xl p-md flex flex-col gap-sm">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#34A853] text-[18px] mt-0.5">trip_origin</span>
              <div>
                <p className="text-mono-label font-mono uppercase text-on-surface-variant text-[10px]">From</p>
                <p className="text-body-sm text-on-surface">{info?.pickup_address}</p>
              </div>
            </div>
            <div className="border-l-2 border-dashed border-outline-variant ml-2 h-3" />
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#EA4335] text-[18px] mt-0.5">location_on</span>
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
