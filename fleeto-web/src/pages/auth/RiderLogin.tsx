import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginRider } from '../../api/auth'
import { useAuth } from '../../contexts/AuthContext'

export default function RiderLogin() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await loginRider(phone, password)
      setAuth(res.data.access_token, 'rider')
      navigate('/rider')
    } catch {
      setError('Invalid phone or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-[420px] bg-surface-container-lowest rounded-xl shadow-card p-xl border border-outline-variant/30">
        <div className="text-center mb-xl">
          <div className="w-16 h-16 bg-on-surface rounded-2xl flex items-center justify-center mx-auto mb-md">
            <span className="material-symbols-outlined text-surface text-[32px] fill">local_shipping</span>
          </div>
          <h1 className="text-h1 font-black tracking-tighter text-primary mb-sm">Fleeto</h1>
          <h2 className="text-h3 text-on-surface">Rider Login</h2>
          <p className="text-body-sm text-on-surface-variant mt-xs">Access your delivery jobs</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
          <div className="flex flex-col gap-xs">
            <label className="font-mono text-mono-label text-on-surface-variant uppercase">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+2348012345678"
              className="w-full border border-outline-variant rounded-xl px-md py-3 text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label className="font-mono text-mono-label text-on-surface-variant uppercase">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-outline-variant rounded-xl px-md py-3 text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          {error && <p className="text-body-sm text-error">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary text-label-caps font-semibold uppercase py-4 rounded-lg hover:opacity-90 transition-opacity mt-sm disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>

        <p className="text-center text-body-sm text-on-surface-variant mt-lg">
          Operator?{' '}
          <a href="/login" className="text-on-surface font-semibold hover:underline">Operator login</a>
        </p>
      </div>
    </div>
  )
}
