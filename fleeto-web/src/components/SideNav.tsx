import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface NavItem {
  label: string
  icon: string
  to: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', to: '/dashboard' },
  { label: 'Fleet', icon: 'local_shipping', to: '/dashboard/fleet' },
  { label: 'Job History', icon: 'history', to: '/dashboard/jobs' },
  { label: 'Settings', icon: 'settings', to: '/dashboard/settings' },
  { label: 'Account', icon: 'person', to: '/dashboard/billing' },
]

export default function SideNav() {
  const { operator, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-outline-variant/40 flex flex-col z-50">
      <div className="px-6 py-8">
        {/* Brand + operator info */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden shrink-0">
            {operator?.profile_picture_url ? (
              <img src={operator.profile_picture_url} className="w-full h-full object-cover" alt="avatar" />
            ) : (
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">person</span>
            )}
          </div>
          <div>
            <p className="text-xl font-black tracking-widest uppercase text-on-surface">Delivra</p>
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant truncate max-w-[130px]">
              {operator?.name || 'Operator'}
            </p>
          </div>
        </div>

        {/* Nav items */}
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-body-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-on-surface text-surface'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Logout at bottom */}
      <div className="mt-auto px-6 pb-8">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-body-sm font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Logout
        </button>
      </div>
    </nav>
  )
}
