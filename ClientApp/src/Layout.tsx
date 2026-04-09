import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { useLogout } from './queries'

export default function Layout() {
  const { user } = useAuth()
  const logout = useLogout()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout.mutateAsync()
    navigate('/signin', { replace: true })
  }

  const isManager = user?.role === 'Manager'

  return (
    <div className="flex min-h-screen">
      <aside className="w-55 flex-shrink-0 bg-[#1a1a2e] text-gray-300 flex flex-col py-6">
        <div className="text-white font-bold tracking-wide px-5 pb-6 border-b border-white/10 mb-3">
          HeptaStore
        </div>
        <nav className="flex flex-col gap-1 px-3 flex-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm no-underline transition-colors ${
                isActive
                  ? 'bg-white/[0.12] text-white'
                  : 'text-[#aaa] hover:bg-white/[0.06] hover:text-white'
              }`
            }
          >
            Products
          </NavLink>
          {isManager && (
            <NavLink
              to="/products/new"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm no-underline transition-colors ${
                  isActive
                    ? 'bg-white/[0.12] text-white'
                    : 'text-[#aaa] hover:bg-white/[0.06] hover:text-white'
                }`
              }
            >
              Add Product
            </NavLink>
          )}
        </nav>
        <div className="px-4 pt-4 border-t border-white/10 mt-auto">
          <p className="text-xs text-gray-400 truncate mb-0.5">{user?.email}</p>
          <p className="text-xs text-indigo-400 font-medium mb-3">{user?.role}</p>
          <button
            onClick={handleLogout}
            disabled={logout.isPending}
            className="w-full px-3 py-1.5 bg-white/[0.08] text-gray-300 rounded-md text-xs font-semibold cursor-pointer transition-colors hover:bg-white/[0.14] hover:text-white disabled:opacity-50"
          >
            {logout.isPending ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 bg-gray-100 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
