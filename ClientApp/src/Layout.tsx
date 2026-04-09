import { NavLink, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-55 flex-shrink-0 bg-[#1a1a2e] text-gray-300 flex flex-col py-6">
        <div className="text-white font-bold tracking-wide px-5 pb-6 border-b border-white/10 mb-3">
          HeptaStore
        </div>
        <nav className="flex flex-col gap-1 px-3">
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
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-gray-100 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
