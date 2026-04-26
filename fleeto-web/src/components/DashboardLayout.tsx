import type { ReactNode } from 'react'
import SideNav from './SideNav'

interface Props {
  children: ReactNode
  title?: string
}

export default function DashboardLayout({ children, title }: Props) {
  return (
    <div className="flex min-h-screen bg-background">
      <SideNav />
      <main className="ml-64 flex-1 flex flex-col">
        {title && (
          <header className="sticky top-0 bg-surface-container-lowest border-b border-outline-variant/30 px-8 py-4 z-40">
            <h1 className="text-h3 font-semibold text-on-surface">{title}</h1>
          </header>
        )}
        <div className="flex-1 p-8">{children}</div>
      </main>
    </div>
  )
}
