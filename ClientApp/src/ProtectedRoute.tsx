import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <span className="text-gray-400 text-sm">Loading…</span>
      </div>
    )
  }

  if (!user) return <Navigate to="/signin" replace />

  return <Outlet />
}
