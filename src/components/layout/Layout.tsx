import { Outlet } from 'react-router-dom'
import { Navigation } from './Navigation'

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {/* Skip link for keyboard users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navigation />
      <main id="main-content" className="pt-16" tabIndex={-1}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
