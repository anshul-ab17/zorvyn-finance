'use client'

import { createContext, useContext, useState, useEffect } from 'react'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  monthlyLimit?: number
  smtpHost?: string
  smtpPort?: number
  smtpUser?: string
  smtpConfigured?: boolean
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  login: (token: string, user: AuthUser) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('pockit_token')
      const storedUser = localStorage.getItem('pockit_user')
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser) as AuthUser)
      }
    } catch {
      // ignore parse errors
    } finally {
      setIsLoading(false)
    }
  }, [])

  function login(newToken: string, newUser: AuthUser) {
    localStorage.setItem('pockit_token', newToken)
    localStorage.setItem('pockit_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  function logout() {
    localStorage.removeItem('pockit_token')
    localStorage.removeItem('pockit_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
