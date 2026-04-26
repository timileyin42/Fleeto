import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import { listJobs } from '../../api/jobs'
import type { Job } from '../../api/jobs'
import { listRiders } from '../../api/riders'
import type { Rider } from '../../api/riders'
import { useAuth } from '../../contexts/AuthContext'

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  assigned: 'bg-blue-100 text-blue-800',
  picked_up: 'bg-indigo-100 text-indigo-800',
  in_transit: 'bg-violet-100 text-violet-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-mono-label font-mono uppercase text-on-surface-variant">{label}</p>
          <p className="text-h2 font-black text-on-surface mt-xs">{value}</p>
        </div>
        <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{icon}</span>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { operator } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [riders, setRiders] = useState<Rider[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([listJobs(), listRiders()])
      .then(([jRes, rRes]) => {
        setJobs(jRes.data)
        setRiders(rRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const active = jobs.filter((j) => !['delivered', 'cancelled'].includes(j.status))
  const available = riders.filter((r) => r.status === 'available')

  return (
    <DashboardLayout>
      {/* Welcome header */}
      <div className="flex items-center justify-between mb-xl">
        <div>
          <h1 className="text-h2 font-black text-on-surface tracking-tight">
            Good day, {operator?.name?.split(' ')[0] || 'Operator'}
          </h1>
          <p className="text-body-md text-on-surface-variant mt-xs">Here's your fleet at a glance</p>
        </div>
        <Link
          to="/dashboard/jobs/new"
          className="flex items-center gap-2 bg-primary text-on-primary px-lg py-3 rounded-lg text-body-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Job
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-on-surface border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
            <StatCard label="Total Jobs" value={jobs.length} icon="receipt_long" />
            <StatCard label="Active Jobs" value={active.length} icon="local_shipping" />
            <StatCard label="Riders" value={riders.length} icon="people" />
            <StatCard label="Available" value={available.length} icon="check_circle" />
          </div>

          {/* Active jobs */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-card">
            <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant/30">
              <h2 className="text-h3 font-semibold text-on-surface">Active Jobs</h2>
              <Link to="/dashboard/jobs" className="text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
                View all →
              </Link>
            </div>

            {active.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-xxl text-on-surface-variant">
                <span className="material-symbols-outlined text-[48px] mb-md">inbox</span>
                <p className="text-body-md">No active jobs</p>
                <Link to="/dashboard/jobs/new" className="text-body-sm text-on-surface font-semibold mt-sm hover:underline">
                  Create your first job →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/20">
                {active.slice(0, 8).map((job) => (
                  <Link
                    key={job.id}
                    to={`/dashboard/jobs/${job.id}`}
                    className="flex items-center justify-between px-lg py-md hover:bg-surface-container transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-body-md font-semibold text-on-surface truncate">{job.customer_name}</p>
                      <p className="text-body-sm text-on-surface-variant truncate">{job.dropoff_address}</p>
                    </div>
                    <span
                      className={`ml-md px-3 py-1 rounded-full text-label-caps font-semibold uppercase ${STATUS_COLOR[job.status] || 'bg-surface-container text-on-surface-variant'}`}
                    >
                      {job.status.replace('_', ' ')}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
