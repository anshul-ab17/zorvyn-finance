'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

const FEATURES = [
  {
    label: 'Analytics',
    title: 'Smart Money Tracking',
    desc: 'See exactly where your money goes. Beautiful charts and category breakdowns make your spending patterns crystal clear without any effort.',
  },
  {
    label: 'Insights',
    title: 'Your Personal Assistant',
    desc: 'Our intelligent engine automatically spots creeping subscriptions, celebrates your savings, and alerts you before you overspend.',
  },
  {
    label: 'Access',
    title: 'Secure & Private',
    desc: 'Share view-only access with your partner or financial advisor, while keeping total control over who can edit your transactions.',
  },
  {
    label: 'Fast',
    title: 'Lightning Fast Sync',
    desc: 'Record a transaction on your phone and see it instantly on your laptop. No waiting, no loading spinners, just speed.',
  },
]

const STATS = [
  { value: '100%', label: 'Secure & Private' },
  { value: 'Zero', label: 'Hidden Fees' },
  { value: '24/7', label: 'Smart Insights' },
  { value: 'Instant', label: 'Data Sync' },
]

export default function LandingPage() {
  const { user, isLoading } = useAuth()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch for theme
  useEffect(() => setMounted(true), [])

  if (isLoading) {
    return (
      <div className="loading-center" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="landing">
      {/* NAV */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Image src="/logo.jpeg" alt="Zorvyn" width={32} height={32} style={{ objectFit: 'contain', borderRadius: '6px' }} priority />
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.5px' }}>Zorvyn</span>
          </div>
          <div className="landing-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {mounted && (
              <button
                className="btn btn-ghost"
                style={{ padding: '6px' }}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
            {user ? (
              <Link href="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost">Sign in</Link>
                <Link href="/register" className="btn btn-primary">Get started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-badge">
            Your personal finance assistant
          </div>
          <h1 className="landing-hero-title">
            Take Control Of<br />
            <span className="text-accent">Your Financial Future</span>
          </h1>
          <p className="landing-hero-sub">
            Zorvyn analyzes your spending habits automatically, notifying you when you overspend and forecasting your monthly savings — no messy spreadsheets required.
          </p>
          <div className="landing-hero-cta">
            <Link href="/register" className="btn btn-primary" style={{ padding: '13px 28px', fontSize: '15px' }}>
              Start tracking
            </Link>
            <Link href="/login" className="btn btn-secondary" style={{ padding: '13px 24px', fontSize: '15px' }}>
              Sign in
            </Link>
          </div>

          {/* Stats */}
          <div className="landing-stats">
            {STATS.map((s) => (
              <div key={s.label} className="landing-stat">
                <div className="landing-stat-value">{s.value}</div>
                <div className="landing-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="landing-features">
        <div className="landing-section-inner">
          <div className="landing-section-header">
            <h2>Everything you need to understand your finances</h2>
            <p>From raw transaction data to actionable intelligence — all in one place.</p>
          </div>
          <div className="landing-features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="landing-feature-card">
                <div className="landing-feature-label">{f.label}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES SECTION */}
      <section className="landing-roles">
        <div className="landing-section-inner">
          <div className="landing-section-header">
            <h2>Built for teams with clear roles</h2>
            <p>Two access tiers — User for individuals, Admin for total control.</p>
          </div>
          <div className="landing-roles-grid">
            <div className="landing-role-card">
              <div className="landing-role-badge" style={{ color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid rgba(191,235,59,0.2)' }}>User</div>
              <h3>For individual contributors</h3>
              <ul className="landing-role-list">
                <li>Create and manage own records</li>
                <li>View personal dashboard and trends</li>
                <li>Access AI-powered financial insights</li>
                <li>Filter and export transaction history</li>
              </ul>
            </div>
            <div className="landing-role-card landing-role-card-featured">
              <div className="landing-role-badge" style={{ color: 'var(--warning)', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>Admin</div>
              <h3>For full control</h3>
              <ul className="landing-role-list">
                <li>Everything in User</li>
                <li>View all users&apos; records</li>
                <li>Full CRUD on all transactions</li>
                <li>User management (create, edit, delete)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="landing-cta-section">
        <div className="landing-section-inner" style={{ textAlign: 'center' }}>
          <h2>Ready to take control of your finances?</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '10px', marginBottom: '32px' }}>
            Create your account and start tracking in under 2 minutes.
          </p>
          <div className="flex gap-3" style={{ justifyContent: 'center' }}>
            <Link href="/register" className="btn btn-primary" style={{ padding: '13px 32px', fontSize: '15px' }}>
              Get started free
            </Link>
            <Link href="/login" className="btn btn-secondary" style={{ padding: '13px 24px', fontSize: '15px' }}>
              Sign in
            </Link>
          </div>
          <div className="landing-demo-hint">
            <span>Try the demo: </span>
            <code>admin@zorvyn.dev</code> / <code>admin123</code>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="landing-nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Image src="/logo.jpeg" alt="Zorvyn" width={72} height={26} style={{ objectFit: 'contain', borderRadius: '4px', opacity: 0.6 }} />
            <span className="text-muted text-sm">Personal Finance Assistant</span>
          </div>
          <span className="text-muted text-sm">Built by Anshul Bharat</span>
        </div>
      </footer>
    </div>
  )
}
