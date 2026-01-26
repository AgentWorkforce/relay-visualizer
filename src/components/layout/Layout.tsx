import { Outlet } from 'react-router-dom'
import { Navigation } from './Navigation'

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      <Navigation />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
