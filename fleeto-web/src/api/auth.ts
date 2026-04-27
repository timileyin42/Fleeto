import client from './client'

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface OperatorResponse {
  id: string
  name: string
  email: string
  plan: string
  profile_picture_url: string | null
  created_at: string
}

export interface RiderResponse {
  id: string
  name: string
  phone: string
  status: string
  profile_picture_url: string | null
  operator_id: string
}

export const loginOperator = (email: string, password: string) =>
  client.post<LoginResponse>('/auth/operator/login', { email, password })

export interface OtpSentResponse {
  message: string
  email: string
}

export const registerOperator = (name: string, email: string, password: string) =>
  client.post<OtpSentResponse>('/auth/operator/register', { name, email, password })

export const verifyOtp = (email: string, code: string) =>
  client.post<LoginResponse>('/auth/verify-otp', { email, code })

export const resendOtp = (email: string) =>
  client.post<OtpSentResponse>('/auth/resend-otp', { email, code: '' })

export const forgotPassword = (email: string) =>
  client.post<OtpSentResponse>('/auth/forgot-password', { email })

export const resetPassword = (email: string, code: string, new_password: string) =>
  client.post('/auth/reset-password', { email, code, new_password })

export const googleSignIn = (idToken: string) =>
  client.post<LoginResponse>('/auth/google', { id_token: idToken })

export const loginRider = (phone: string, password: string) =>
  client.post<LoginResponse>('/auth/rider/login', { phone, password })

export const getMe = () => client.get<OperatorResponse>('/auth/me')

export const getRiderMe = () => client.get<RiderResponse>('/auth/rider/me')
