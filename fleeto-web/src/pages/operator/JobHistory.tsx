import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import { listJobs } from '../../api/jobs'
import type { Job } from '../../api/jobs'

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  assigned: 'bg-blue-100 text-blue-800',
  picked_up: 'bg-indigo-100 text-indigo-800',
  in_transit: 'bg-violet-100 text-violet-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const FILTERS = ['all', 'pending', 'assigned', 'in_transit', 'delivered', 'cancelled']

export default function JobHistory() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    listJobs().then((r) => setJobs(r.data)).finally(() => setLoading(false))
  }, [])

  const filtered = jobs
    .filter((j) => filter === 'all' || j.status === filter)
    .filter((j) =>
      !search ||
      (j.customer_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      j.dropoff_address.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <DashboardLayout title="Job History">
      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-md mb-xl">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer or address…"
            className="w-full border border-outline-variant rounded-xl pl-10 pr-md py-3 text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-xs overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-md py-2 rounded-full text-label-caps font-semibold uppercase whitespace-nowrap transition-colors ${
                filter === f ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-on-surface border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-xxl flex flex-col items-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[48px] mb-md">inbox</span>
          <p className="text-body-md">No jobs found</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="text-left px-lg py-md text-mono-label font-mono uppercase text-on-surface-variant">Customer</th>
                <th className="text-left px-lg py-md text-mono-label font-mono uppercase text-on-surface-variant hidden md:table-cell">Delivery Address</th>
                <th className="text-left px-lg py-md text-mono-label font-mono uppercase text-on-surface-variant">Status</th>
                <th className="text-left px-lg py-md text-mono-label font-mono uppercase text-on-surface-variant hidden lg:table-cell">Date</th>
                <th className="px-lg py-md" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filtered.map((job) => (
                <tr key={job.id} className="hover:bg-surface-container transition-colors">
                  <td className="px-lg py-md">
                    <p className="text-body-md font-medium text-on-surface">{job.customer_name}</p>
                    <p className="text-body-sm text-on-surface-variant">{job.customer_phone}</p>
                  </td>
                  <td className="px-lg py-md text-body-sm text-on-surface-variant hidden md:table-cell max-w-[200px] truncate">{job.dropoff_address}</td>
                  <td className="px-lg py-md">
                    <span className={`px-3 py-1 rounded-full text-label-caps font-semibold uppercase ${STATUS_COLOR[job.status] || ''}`}>
                      {job.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-lg py-md text-body-sm text-on-surface-variant hidden lg:table-cell">
                    {new Date(job.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-lg py-md text-right">
                    <Link
                      to={`/dashboard/jobs/${job.id}`}
                      className="text-body-sm font-medium text-on-surface hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  )
}
