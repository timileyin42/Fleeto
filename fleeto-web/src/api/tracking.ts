import client from './client'

export interface TrackingInfo {
  job_id: string
  status: string
  customer_name: string | null
  pickup_address: string
  dropoff_address: string
  parcel_description: string
  operator_name: string
  rider_name: string | null
  rider_phone: string | null
  last_lat: number | null
  last_lng: number | null
  last_seen: string | null
}

export const getTracking = (token: string) =>
  client.get<TrackingInfo>(`/tracking/${token}`)
