import { createContext, useContext } from 'react'
import { useMe, type AuthUser } from './queries'

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue>({ user: null, isLoading: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user = null, isLoading } = useMe()
  return <AuthContext.Provider value={{ user, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
