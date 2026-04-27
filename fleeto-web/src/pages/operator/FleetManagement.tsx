import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { listRiders, createRider } from '../../api/riders'
import type { Rider } from '../../api/riders'

const STATUS_BADGE: Record<string, string> = {
  available: 'bg-green-100 text-green-800',
  busy: 'bg-amber-100 text-amber-800',
  offline: 'bg-surface-container text-on-surface-variant',
}

export default function FleetManagement() {
  const [riders, setRiders] = useState<Rider[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () =>
    listRiders()
      .then((r) => setRiders(r.data))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await createRider({ name, phone, password, ...(email ? { email } : {}) })
      setName(''); setPhone(''); setEmail(''); setPassword('')
      setShowModal(false)
      load()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to add rider.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout title="Fleet">
      <div className="flex items-center justify-between mb-xl">
        <p className="text-body-md text-on-surface-variant">{riders.length} rider{riders.length !== 1 ? 's' : ''} registered</p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-on-primary px-lg py-3 rounded-lg text-body-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add Rider
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-on-surface border-t-transparent rounded-full animate-spin" />
        </div>
      ) : riders.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-xxl flex flex-col items-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[48px] mb-md">group</span>
          <p className="text-body-md">No riders yet</p>
          <button onClick={() => setShowModal(true)} className="text-body-sm text-on-surface font-semibold mt-sm hover:underline">
            Add your first rider →
          </button>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="text-left px-lg py-md text-mono-label font-mono uppercase text-on-surface-variant">Rider</th>
                <th className="text-left px-lg py-md text-mono-label font-mono uppercase text-on-surface-variant">Phone</th>
                <th className="text-left px-lg py-md text-mono-label font-mono uppercase text-on-surface-variant">Email</th>
                <th className="text-left px-lg py-md text-mono-label font-mono uppercase text-on-surface-variant">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {riders.map((rider) => (
                <tr key={rider.id} className="hover:bg-surface-container transition-colors">
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden shrink-0">
                        {rider.profile_picture_url ? (
                          <img src={rider.profile_picture_url} className="w-full h-full object-cover" alt={rider.name} />
                        ) : (
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">person</span>
                        )}
                      </div>
                      <span className="text-body-md font-medium text-on-surface">{rider.name}</span>
                    </div>
                  </td>
                  <td className="px-lg py-md text-body-md text-on-surface-variant">{rider.phone}</td>
                  <td className="px-lg py-md text-body-md text-on-surface-variant">{rider.email || <span className="text-outline">—</span>}</td>
                  <td className="px-lg py-md">
                    <span className={`px-3 py-1 rounded-full text-label-caps font-semibold uppercase ${STATUS_BADGE[rider.status]}`}>
                      {rider.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Rider Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-surface-container-lowest rounded-xl p-xl w-full max-w-md shadow-elevated">
            <div className="flex items-center justify-between mb-xl">
              <h2 className="text-h3 font-semibold text-on-surface">Add Rider</h2>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col gap-md">
              <div className="flex flex-col gap-xs">
                <label className="font-mono text-mono-label text-on-surface-variant uppercase">Full Name</label>
                <input
                  required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Emeka Johnson"
                  className="border border-outline-variant rounded-xl px-md py-3 text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-mono text-mono-label text-on-surface-variant uppercase">Phone Number</label>
                <input
                  required value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="+2348012345678"
                  className="border border-outline-variant rounded-xl px-md py-3 text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-mono text-mono-label text-on-surface-variant uppercase">Email Address <span className="normal-case text-outline">(optional — for login & notifications)</span></label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="rider@email.com"
                  className="border border-outline-variant rounded-xl px-md py-3 text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-mono text-mono-label text-on-surface-variant uppercase">Password</label>
                <input
                  required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Temporary password"
                  className="border border-outline-variant rounded-xl px-md py-3 text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              {error && <p className="text-body-sm text-error">{error}</p>}
              <div className="flex gap-md mt-sm">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-outline-variant rounded-xl py-3 text-body-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-primary text-on-primary rounded-xl py-3 text-body-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                  {saving ? 'Adding…' : 'Add Rider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
