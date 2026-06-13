import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import authService from '@/services/authService'
import type { User } from '@/services/authService'

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  setIsAuthenticated: (v: boolean) => void
  setUser: (u: User | null) => void
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  setIsAuthenticated: () => {},
  setUser: () => {},
})

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    authService.isAuthenticated()
  )
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (authService.isAuthenticated()) {
      authService
        .getMe()
        .then((u) => {
          setUser(u)
          setIsAuthenticated(true)
        })
        .catch(() => {
          // Token invalid or expired — clear state
          setUser(null)
          setIsAuthenticated(false)
        })
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, setIsAuthenticated, setUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
