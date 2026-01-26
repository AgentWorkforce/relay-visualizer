import { NavLink } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/architecture', label: 'Architecture' },
  { path: '/message-flow', label: 'Message Flow' },
  { path: '/multi-agent', label: 'Multi-Agent Demo' },
  { path: '/code-examples', label: 'Code Examples' },
  { path: '/dashboard', label: 'Dashboard' },
]

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-800 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AR</span>
            </div>
            <span className="text-slate-50 font-semibold hidden sm:block">
              Agent Relay
            </span>
          </div>
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
