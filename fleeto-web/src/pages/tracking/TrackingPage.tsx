import { useEffect, useRef, useState } from 'react'
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

function calcBearing(from: [number, number], to: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLng = toRad(to[1] - from[1])
  const lat1 = toRad(from[0])
  const lat2 = toRad(to[0])
  const x = Math.sin(dLng) * Math.cos(lat2)
  const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return ((Math.atan2(x, y) * 180) / Math.PI + 360) % 360
}

function makeRiderIcon(deg: number) {
  return L.divIcon({
    className: '',
    html: `<div style="width:48px;height:48px;display:flex;align-items:center;justify-content:center;">
      <div style="transform:rotate(${deg}deg);width:48px;height:48px;display:flex;align-items:center;justify-content:center;">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="24" fill="#1558D6" fill-opacity="0.15"/>
          <circle cx="24" cy="24" r="17" fill="#1558D6"/>
          <path d="M24 11 L30 33 L24 28.5 L18 33 Z" fill="white"/>
        </svg>
      </div>
    </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  })
}

function makePickupIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="width:22px;height:22px;background:#22c55e;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);"/>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })
}

function makeDropoffIcon() {
  return L.divIcon({
    className: '',
    html: `<svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 25 15 25S30 25.5 30 15C30 6.716 23.284 0 15 0z" fill="#ef4444"/>
      <circle cx="15" cy="15" r="7" fill="white"/>
    </svg>`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
  })
}

function MapFitter({ coords }: { coords: [number, number][] }) {
  const map = useMap()
  const fitted = useRef(false)
  useEffect(() => {
    if (coords.length >= 2 && !fitted.current) {
      try {
        map.fitBounds(L.latLngBounds(coords), { padding: [70, 70], maxZoom: 16 })
        fitted.current = true
      } catch {}
    }
  }, [coords, map])
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

  // Fetch road-following route when both endpoints are known
  useEffect(() => {
    if (!pickupCoords || !dropoffCoords) return
    fetchRoute(pickupCoords, dropoffCoords).then(setRouteCoords)
  }, [pickupCoords, dropoffCoords])

  // Update rider bearing + ETA whenever the rider moves
  useEffect(() => {
    if (!info?.last_lat || !info?.last_lng) return
    const pos: [number, number] = [info.last_lat, info.last_lng]
    if (prevRiderPos.current) {
      setRiderBearing(calcBearing(prevRiderPos.current, pos))
    }
    prevRiderPos.current = pos
  }, [info?.last_lat, info?.last_lng])

  // ETA: route from rider's current position to dropoff
  useEffect(() => {
    if (!info?.last_lat || !info?.last_lng || !dropoffCoords) return
    if (info.status === 'delivered' || info.status === 'cancelled') return
    fetchEta([info.last_lat, info.last_lng], dropoffCoords).then((secs) => {
      if (secs !== null) setEta(secs)
    })
  }, [info?.last_lat, info?.last_lng, dropoffCoords, info?.status])

  const currentStep = info ? STATUS_STEPS.indexOf(info.status) : 0
  const hasRider = !!(info?.last_lat && info?.last_lng)
  const center: [number, number] = hasRider
    ? [info!.last_lat!, info!.last_lng!]
    : pickupCoords ?? [6.5244, 3.3792]

  const fitCoords: [number, number][] = routeCoords.length >= 2
    ? routeCoords
    : ([pickupCoords, dropoffCoords, hasRider ? ([info!.last_lat!, info!.last_lng!] as [number, number]) : null]
        .filter(Boolean) as [number, number][])

  const showEta = eta !== null && hasRider && info?.status !== 'delivered' && info?.status !== 'cancelled'

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
        <MapContainer
          center={center}
          zoom={13}
          className="w-full h-full"
          style={{ minHeight: '60vh' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          <MapFitter coords={fitCoords} />

          {/* Road-following route line */}
          {routeCoords.length > 1 && (
            <Polyline
              positions={routeCoords}
              pathOptions={{ color: '#1558D6', weight: 5, opacity: 0.75 }}
            />
          )}

          {/* Pickup pin (green dot) */}
          {pickupCoords && (
            <Marker position={pickupCoords} icon={makePickupIcon()}>
              <Popup><strong>Pickup</strong><br />{info?.pickup_address}</Popup>
            </Marker>
          )}

          {/* Dropoff pin (red teardrop) */}
          {dropoffCoords && (
            <Marker position={dropoffCoords} icon={makeDropoffIcon()}>
              <Popup><strong>Dropoff</strong><br />{info?.dropoff_address}</Popup>
            </Marker>
          )}

          {/* Rider arrow — rotates with direction of travel */}
          {hasRider && (
            <Marker
              position={[info!.last_lat!, info!.last_lng!]}
              icon={makeRiderIcon(riderBearing)}
            >
              <Popup>
                {info?.rider_name || 'Rider'}
                {info?.last_seen && <><br />Last seen {new Date(info.last_seen).toLocaleTimeString()}</>}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Bottom sheet */}
      <div className="bg-surface w-full rounded-t-3xl shadow-sheet z-30 -mt-8 relative">
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 bg-outline-variant/40 rounded-full" />
        </div>

        <div className="px-lg pb-8 pt-md flex flex-col gap-lg">
          {/* ETA card — shown when rider is en-route */}
          {showEta && (
            <div className="bg-primary/10 border border-primary/20 rounded-2xl px-lg py-md flex items-center gap-md">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-primary text-[20px]">schedule</span>
              </div>
              <div>
                <p className="text-mono-label font-mono uppercase text-on-surface-variant text-[10px]">Estimated arrival</p>
                <p className="text-h2 font-black text-primary leading-tight">{formatEta(eta!)}</p>
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
              <span className="material-symbols-outlined text-green-500 text-[18px] mt-0.5">trip_origin</span>
              <div>
                <p className="text-mono-label font-mono uppercase text-on-surface-variant text-[10px]">From</p>
                <p className="text-body-sm text-on-surface">{info?.pickup_address}</p>
              </div>
            </div>
            <div className="border-l-2 border-dashed border-outline-variant ml-2 h-3" />
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-red-500 text-[18px] mt-0.5">location_on</span>
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
