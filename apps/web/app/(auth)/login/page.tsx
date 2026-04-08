'use client'

import { useState, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { theme } = useTheme()
  const router = useRouter()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = (await res.json()) as { token?: string; user?: { id: string; name: string; email: string; role: string }; error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Login failed')
        return
      }
      login(data.token!, data.user!)
      router.push('/dashboard')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Image src={theme === 'dark' ? "/logo-dark.png" : "/logo.png"} alt="Pockit" width={120} height={48} style={{ objectFit: 'contain', borderRadius: '8px' }} priority />
          <p>AI-Style Finance Dashboard</p>
        </div>

        <div className="auth-form">
          <h2>Sign in to your account</h2>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-primary-full"
              disabled={loading}
              style={{ marginTop: '6px' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="auth-link">
            Don&apos;t have an account?{' '}
            <Link href="/register">Create one</Link>
          </div>

          <div className="demo-box">
            <div className="demo-box-title">Demo accounts</div>
            <div className="demo-box-item">
              <strong>Admin:</strong> admin@pockit.dev / admin123
            </div>
            <div className="demo-box-item">
              <strong>User:</strong> user@pockit.dev / user123
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
