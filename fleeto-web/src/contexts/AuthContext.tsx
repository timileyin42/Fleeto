import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { getMe, getRiderMe } from '../api/auth'
import type { OperatorResponse, RiderResponse } from '../api/auth'

type UserRole = 'operator' | 'rider' | null

interface AuthContextType {
  role: UserRole
  operator: OperatorResponse | null
  rider: RiderResponse | null
  token: string | null
  setAuth: (token: string, role: 'operator' | 'rider') => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(null)
  const [operator, setOperator] = useState<OperatorResponse | null>(null)
  const [rider, setRider] = useState<RiderResponse | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedRole = localStorage.getItem('role') as UserRole
    if (!savedToken || !savedRole) {
      setLoading(false)
      return
    }
    setToken(savedToken)
    setRole(savedRole)

    if (savedRole === 'operator') {
      getMe()
        .then((r) => setOperator(r.data))
        .catch(() => logout())
        .finally(() => setLoading(false))
    } else {
      getRiderMe()
        .then((r) => setRider(r.data))
        .catch(() => logout())
        .finally(() => setLoading(false))
    }
  }, [])

  const setAuth = (newToken: string, newRole: 'operator' | 'rider') => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('role', newRole)
    setToken(newToken)
    setRole(newRole)

    if (newRole === 'operator') {
      getMe().then((r) => setOperator(r.data))
    } else {
      getRiderMe().then((r) => setRider(r.data))
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    setToken(null)
    setRole(null)
    setOperator(null)
    setRider(null)
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ role, operator, rider, token, setAuth, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
