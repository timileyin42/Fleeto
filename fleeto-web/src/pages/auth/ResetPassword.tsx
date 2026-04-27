import { useState, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { resetPassword, forgotPassword } from '../../api/auth'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resent, setResent] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  const navigate = useNavigate()

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const next = [...digits]
    next[index] = value.slice(-1)
    setDigits(next)
    if (value && index < 5) inputs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = [...digits]
    pasted.split('').forEach((ch, i) => { next[i] = ch })
    setDigits(next)
    inputs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = digits.join('')
    if (code.length < 6) { setError('Enter the full 6-digit code.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setError('')
    setLoading(true)
    try {
      await resetPassword(email, code, password)
      navigate('/login?reset=success')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Reset failed.')
      setDigits(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setResent(false)
    try {
      await forgotPassword(email)
      setResent(true)
      setDigits(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Could not resend code.')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-[420px] bg-surface-container-lowest rounded-xl shadow-card p-xl border border-outline-variant/30">
        <div className="text-center mb-xl">
          <h1 className="text-h1 font-black tracking-tighter text-primary mb-sm">Delivra</h1>
          <h2 className="text-h3 text-on-surface">Reset your password</h2>
          <p className="text-body-sm text-on-surface-variant mt-sm">
            Enter the code sent to <span className="font-semibold text-on-surface">{email}</span> and choose a new password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
          <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { inputs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            ))}
          </div>

          <div className="flex flex-col gap-xs">
            <label className="font-mono text-mono-label text-on-surface-variant uppercase">New Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full border border-outline-variant rounded-xl px-md py-3 text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label className="font-mono text-mono-label text-on-surface-variant uppercase">Confirm Password</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-outline-variant rounded-xl px-md py-3 text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          {error && <p className="text-body-sm text-error">{error}</p>}
          {resent && <p className="text-body-sm text-center" style={{ color: '#059669' }}>New code sent — check your inbox.</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary text-label-caps font-semibold uppercase py-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-lg flex flex-col gap-sm text-center">
          <button
            type="button"
            onClick={handleResend}
            className="text-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Didn't receive it? <span className="font-semibold text-on-surface">Resend code</span>
          </button>
          <Link to="/forgot-password" className="text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
            ← Use a different email
          </Link>
        </div>
      </div>
    </div>
  )
}
