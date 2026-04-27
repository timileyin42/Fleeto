import { Link, useLocation } from 'react-router-dom'

const links = [
  { label: 'Fleet App', to: '/fleet-app' },
  { label: 'Rider App', to: '/rider-app' },
  { label: 'Pricing', to: '/pricing' },
]

export default function MarketingNav() {
  const { pathname } = useLocation()

  return (
    <nav className="bg-white/80 backdrop-blur-md w-full top-0 sticky z-50 border-b border-zinc-100 shadow-sm">
      <div className="flex justify-between items-center h-16 w-full px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold tracking-tighter text-zinc-950 uppercase">Delivra</Link>
          <div className="hidden md:flex gap-6">
            {links.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`text-sm font-medium tracking-tight pb-1 transition-colors ${
                  pathname === to
                    ? 'text-zinc-950 font-semibold border-b-2 border-zinc-950'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="hidden md:block text-sm font-medium tracking-tight text-zinc-900 hover:bg-zinc-50 rounded-md px-4 py-2 transition-all">Log In</Link>
          <Link to="/signup" className="bg-zinc-950 text-white text-sm font-medium tracking-tight px-4 py-2 rounded-md hover:opacity-90 transition-opacity">Get Started</Link>
        </div>
      </div>
    </nav>
  )
}
