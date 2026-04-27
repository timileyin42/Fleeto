import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { forgotPassword } from '../../api/auth'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await forgotPassword(email)
      navigate(`/reset-password?email=${encodeURIComponent(email)}`)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-[420px] bg-surface-container-lowest rounded-xl shadow-card p-xl border border-outline-variant/30">
        <div className="text-center mb-xl">
          <h1 className="text-h1 font-black tracking-tighter text-primary mb-sm">Delivra</h1>
          <h2 className="text-h3 text-on-surface">Forgot your password?</h2>
          <p className="text-body-sm text-on-surface-variant mt-sm">Enter your email and we'll send you a reset code.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
          <div className="flex flex-col gap-xs">
            <label className="font-mono text-mono-label text-on-surface-variant uppercase">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full border border-outline-variant rounded-xl px-md py-3 text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          {error && <p className="text-body-sm text-error">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary text-label-caps font-semibold uppercase py-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send Reset Code'}
          </button>
        </form>

        <div className="mt-lg text-center">
          <Link to="/login" className="text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
