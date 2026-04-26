import client from './client'

export interface Rider {
  id: string
  name: string
  phone: string
  status: 'available' | 'busy' | 'offline'
  profile_picture_url: string | null
  operator_id: string
}

export interface CreateRiderPayload {
  name: string
  phone: string
  password: string
}

export const listRiders = () => client.get<Rider[]>('/riders')

export const createRider = (payload: CreateRiderPayload) =>
  client.post<Rider>('/riders', payload)

export const uploadRiderAvatar = (file: File) => {
  const form = new FormData()
  form.append('file', file)
  return client.post<{ url: string }>('/uploads/rider/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
