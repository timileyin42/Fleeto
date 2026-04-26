import client from './client'

export interface Job {
  id: string
  operator_id: string
  rider_id: string | null
  customer_name: string | null
  customer_phone: string | null
  pickup_address: string
  dropoff_address: string
  parcel_description: string
  status: 'created' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'cancelled'
  tracking_token: string
  item_photo_url: string | null
  proof_photo_url: string | null
  created_at: string
  updated_at: string
}

export interface CreateJobPayload {
  customer_name?: string
  customer_phone?: string
  pickup_address: string
  dropoff_address: string
  parcel_description?: string
  rider_id?: string
}

export const listJobs = (status?: string) =>
  client.get<Job[]>('/jobs', { params: status ? { status } : {} })

export const getJob = (id: string) =>
  client.get<Job>(`/jobs/${id}`)

export const createJob = (payload: CreateJobPayload) =>
  client.post<Job>('/jobs', payload)

export const assignJob = (jobId: string, riderId: string) =>
  client.patch<Job>(`/jobs/${jobId}/assign`, { rider_id: riderId })

export const updateJobStatus = (jobId: string, status: string) =>
  client.patch<Job>(`/jobs/${jobId}/status`, { status })

export const getRiderJobs = () =>
  client.get<Job[]>('/jobs/mine')

export const getRiderJob = (id: string) =>
  client.get<Job>(`/jobs/mine/${id}`)

export const pingLocation = (jobId: string, lat: number, lng: number) =>
  client.post(`/jobs/${jobId}/location`, null, { params: { lat, lng } })

export const uploadItemPhoto = (jobId: string, file: File) => {
  const form = new FormData()
  form.append('file', file)
  return client.post<{ url: string }>(`/uploads/jobs/${jobId}/item`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const uploadProof = (jobId: string, file: File) => {
  const form = new FormData()
  form.append('file', file)
  return client.post<{ url: string }>(`/uploads/jobs/${jobId}/proof`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
