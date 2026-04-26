import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  requiredRole: 'operator' | 'rider'
  redirectTo?: string
}

export default function ProtectedRoute({ children, requiredRole, redirectTo }: Props) {
  const { role, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-on-surface border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (role !== requiredRole) {
    const fallback = redirectTo || (requiredRole === 'operator' ? '/login' : '/rider/login')
    return <Navigate to={fallback} replace />
  }

  return <>{children}</>
}
