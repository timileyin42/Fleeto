import { useState, useRef } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import client from '../../api/client'

export default function Settings() {
  const { operator } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(operator?.profile_picture_url || '')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await client.post<{ url: string }>('/uploads/operator/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setAvatarUrl(res.data.url)
    } finally {
      setUploading(false)
    }
  }

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-2xl flex flex-col gap-lg">
        {/* Profile */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-card p-xl">
          <h2 className="text-h3 font-semibold text-on-surface mb-lg">Profile</h2>
          <div className="flex items-center gap-lg mb-xl">
            <div className="w-20 h-20 rounded-2xl bg-surface-container-high flex items-center justify-center overflow-hidden shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <span className="material-symbols-outlined text-on-surface-variant text-[36px]">person</span>
              )}
            </div>
            <div>
              <p className="text-body-lg font-semibold text-on-surface">{operator?.name}</p>
              <p className="text-body-sm text-on-surface-variant">{operator?.email}</p>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="mt-sm text-body-sm font-medium text-on-surface hover:underline disabled:opacity-50"
              >
                {uploading ? 'Uploading…' : 'Change photo'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <label className="font-mono text-mono-label text-on-surface-variant uppercase">Business Name</label>
              <input
                defaultValue={operator?.name}
                className="border border-outline-variant rounded-xl px-md py-3 text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest"
              />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-mono text-mono-label text-on-surface-variant uppercase">Email</label>
              <input
                defaultValue={operator?.email} disabled
                className="border border-outline-variant rounded-xl px-md py-3 text-body-md bg-surface-container text-on-surface-variant cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Plan info */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-card p-xl">
          <h2 className="text-h3 font-semibold text-on-surface mb-md">Plan</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-lg font-semibold capitalize text-on-surface">{operator?.plan || 'Starter'}</p>
              <p className="text-body-sm text-on-surface-variant">Your current subscription</p>
            </div>
            <a href="/dashboard/billing" className="flex items-center gap-2 border border-outline-variant rounded-xl px-md py-3 text-body-sm font-medium text-on-surface hover:bg-surface-container transition-colors">
              Manage plan
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
