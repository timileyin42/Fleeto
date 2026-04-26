import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getRiderJobs } from '../../api/jobs'
import type { Job } from '../../api/jobs'
import { useAuth } from '../../contexts/AuthContext'

const STATUS_COLOR: Record<string, string> = {
  assigned: 'bg-blue-100 text-blue-800',
  picked_up: 'bg-indigo-100 text-indigo-800',
  in_transit: 'bg-violet-100 text-violet-800',
  delivered: 'bg-green-100 text-green-800',
}

export default function RiderJobList() {
  const { rider, logout } = useAuth()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'active' | 'done'>('active')

  useEffect(() => {
    getRiderJobs().then((r) => setJobs(r.data)).finally(() => setLoading(false))
  }, [])

  const active = jobs.filter((j) => !['delivered', 'cancelled'].includes(j.status))
  const done = jobs.filter((j) => ['delivered', 'cancelled'].includes(j.status))
  const displayed = tab === 'active' ? active : done

  const handleLogout = () => {
    logout()
    navigate('/rider/login')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Top bar */}
      <header className="sticky top-0 bg-surface-container-lowest border-b border-outline-variant/30 px-lg py-md z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center">
            {rider?.profile_picture_url ? (
              <img src={rider.profile_picture_url} className="w-full h-full object-cover rounded-full" alt={rider.name} />
            ) : (
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">person</span>
            )}
          </div>
          <div>
            <p className="text-body-sm font-semibold text-on-surface">{rider?.name}</p>
            <p className="text-[11px] text-on-surface-variant uppercase tracking-wider">Rider</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-on-surface-variant hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-sm px-lg py-md border-b border-outline-variant/20">
        <button
          onClick={() => setTab('active')}
          className={`flex-1 py-2.5 rounded-xl text-label-caps font-semibold uppercase transition-colors ${
            tab === 'active' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
          }`}
        >
          Active ({active.length})
        </button>
        <button
          onClick={() => setTab('done')}
          className={`flex-1 py-2.5 rounded-xl text-label-caps font-semibold uppercase transition-colors ${
            tab === 'done' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
          }`}
        >
          Completed ({done.length})
        </button>
      </div>

      {/* Job list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-on-surface border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant px-lg">
            <span className="material-symbols-outlined text-[48px] mb-md">inbox</span>
            <p className="text-body-md text-center">
              {tab === 'active' ? 'No active jobs assigned to you' : 'No completed jobs yet'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-sm p-lg">
            {displayed.map((job) => (
              <Link
                key={job.id}
                to={`/rider/job/${job.id}`}
                className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-md flex flex-col gap-sm shadow-card active:scale-[0.98] transition-transform"
              >
                <div className="flex items-start justify-between">
                  <p className="text-body-md font-semibold text-on-surface">{job.customer_name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-label-caps font-semibold uppercase ${STATUS_COLOR[job.status] || 'bg-surface-container text-on-surface-variant'}`}>
                    {job.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex flex-col gap-xs">
                  <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px]">trip_origin</span>
                    <span className="truncate">{job.pickup_address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[14px] fill">location_on</span>
                    <span className="truncate">{job.dropoff_address}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
