import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { useLogout } from './queries'

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user } = useAuth()
  const logout = useLogout()
  const navigate = useNavigate()
  const isManager = user?.role === 'Manager'

  async function handleLogout() {
    await logout.mutateAsync()
    navigate('/signin', { replace: true })
  }

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-md text-sm no-underline transition-colors ${
      isActive ? 'bg-white/[0.12] text-white' : 'text-[#aaa] hover:bg-white/[0.06] hover:text-white'
    }`

  return (
    <div className="w-55 flex-shrink-0 bg-[#1a1a2e] text-gray-300 flex flex-col py-6 h-full">
      <div className="flex items-center justify-between px-5 pb-6 border-b border-white/10 mb-3">
        <span className="text-white font-bold tracking-wide">HeptaStore</span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl leading-none focus:outline-none md:hidden"
            aria-label="Close menu"
          >
            ✕
          </button>
        )}
      </div>
      <nav className="flex flex-col gap-1 px-3 flex-1">
        <NavLink to="/" end className={linkCls}>Products</NavLink>
        {isManager && <NavLink to="/products/new" className={linkCls}>Add Product</NavLink>}
      </nav>
      <div className="px-4 pt-4 border-t border-white/10 mt-auto">
        <p className="text-xs text-gray-400 truncate mb-0.5">{user?.email}</p>
        <p className="text-xs text-indigo-400 font-medium mb-2">{user?.role}</p>
        <NavLink
          to="/profile/edit"
          className={({ isActive }) =>
            `block text-center w-full px-3 py-1.5 rounded-md text-xs font-semibold mb-2 transition-colors no-underline ${
              isActive
                ? 'bg-white/[0.12] text-white'
                : 'bg-white/[0.05] text-gray-400 hover:bg-white/[0.10] hover:text-white'
            }`
          }
        >
          Edit Profile
        </NavLink>
        <button
          onClick={handleLogout}
          disabled={logout.isPending}
          className="w-full px-3 py-1.5 bg-white/[0.08] text-gray-300 rounded-md text-xs font-semibold cursor-pointer transition-colors hover:bg-white/[0.14] hover:text-white disabled:opacity-50"
        >
          {logout.isPending ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </div>
  )
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col transition-transform duration-250 md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#1a1a2e]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-300 hover:text-white transition-colors text-xl leading-none focus:outline-none"
            aria-label="Open menu"
          >
            ☰
          </button>
          <span className="text-white font-bold tracking-wide text-sm">HeptaStore</span>
        </header>

        <main className="flex-1 p-4 md:p-8 bg-gray-100 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
