'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from 'next-themes'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

interface Summary {
  income: number
  expenses: number
  balance: number
  totalRecords: number
}

interface CategoryItem {
  category: string
  income: number
  expense: number
  net: number
}

interface TrendItem {
  month: string
  income: number
  expense: number
  net: number
}

interface RecentRecord {
  id: string
  amount: number
  type: string
  category: string
  date: string
  notes?: string
}

interface Insight {
  type: 'warning' | 'info' | 'success'
  title: string
  message: string
}

type Tab = 'revenue' | 'records' | 'insights'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)
}

function fmtMonth(m: string) {
  const [y, mo] = m.split('-')
  return new Date(Number(y), Number(mo) - 1).toLocaleString('default', {
    month: 'short',
    year: '2-digit',
  })
}

export default function DashboardPage() {
  const { token, user } = useAuth()
  const { theme } = useTheme()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [trends, setTrends] = useState<TrendItem[]>([])
  const [recent, setRecent] = useState<RecentRecord[]>([])
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('revenue')
  const [whatsNewOpen, setWhatsNewOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [range, setRange] = useState('All Time')
  const [recType, setRecType] = useState('All records')

  const canInsights = user?.role === 'Admin' || user?.role === 'User'

  const fetchAll = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const h = { Authorization: `Bearer ${token}` }
      const qs = `?range=${encodeURIComponent(range)}&type=${encodeURIComponent(recType)}`
      const [sumRes, catRes, trendRes, recentRes] = await Promise.all([
        fetch(`/api/dashboard/summary${qs}`, { headers: h }),
        fetch(`/api/dashboard/category-wise${qs}`, { headers: h }),
        fetch(`/api/dashboard/trends${qs}`, { headers: h }),
        fetch(`/api/dashboard/recent?limit=10&range=${encodeURIComponent(range)}&type=${encodeURIComponent(recType)}`, { headers: h }),
      ])
      const [sumData, catData, trendData, recentData] = await Promise.all([
        sumRes.json(),
        catRes.json(),
        trendRes.json(),
        recentRes.json(),
      ])

      setSummary(sumData as Summary)
      setCategories(Array.isArray(catData) ? catData : [])
      setTrends(Array.isArray(trendData) ? (trendData as TrendItem[]).slice(-6) : [])
      setRecent(Array.isArray(recentData) ? recentData : [])

      if (canInsights) {
        const insRes = await fetch(`/api/dashboard/insights${qs}`, { headers: h })
        const insData = (await insRes.json()) as { insights: Insight[] }
        setInsights(Array.isArray(insData.insights) ? insData.insights : [])
      }
    } catch {
      /* silently degrade */
    } finally {
      setLoading(false)
    }
  }, [token, canInsights, range, recType])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const COLORS = ['#bfeb3b', '#60a5fa', '#f472b6', '#fbbf24', '#34d399', '#a78bfa', '#fb923c', '#9ca3af']

  const savingsRate =
    summary && summary.income > 0
      ? Math.round(((summary.income - summary.expenses) / summary.income) * 100)
      : null

  return (
    <>
      {/* What's New */}
      <div className="whats-new" onClick={() => setWhatsNewOpen((v) => !v)}>
        <div className="whats-new-left">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent)' }}>
            <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" />
          </svg>
          What&apos;s New?
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ color: 'var(--text-muted)', transform: whatsNewOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {whatsNewOpen && (
        <div className="card" style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Pockit v1.0 — Initial Release
          </div>
          Full-stack finance dashboard with AI-style rule-based insights, RBAC roles (User &amp; Admin), Redis caching, paginated records, and monthly trend analytics.
        </div>
      )}

      {/* Tabs */}
      <div className="dash-tabs">
        {([
          { key: 'revenue', label: 'Revenue' },
          { key: 'records', label: 'Transactions' },
          ...(canInsights ? [{ key: 'insights', label: 'AI Insights' }] : []),
        ] as { key: Tab; label: string }[]).map((t) => (
          <button
            key={t.key}
            className={`dash-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filter pills */}
      <div className="filter-pills-row">
        <select className="filter-select" value={range} onChange={e => setRange(e.target.value)}>
          <option value="All Time">All Time</option>
          <option value="7D">Last 7 Days (7D)</option>
          <option value="30D">Last 30 Days (30D)</option>
          <option value="YTD">Year to Date (YTD)</option>
        </select>

        <select className="filter-select" value={recType} onChange={e => setRecType(e.target.value)}>
          <option value="All records">All records</option>
          <option value="Income">Income only</option>
          <option value="Expense">Expense only</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <>
          {/* REVENUE TAB */}
          {tab === 'revenue' && (
            <>
              {/* Summary cards */}
              <div className="summary-grid" style={{ marginBottom: '16px' }}>
                <div className="summary-card">
                  <div className="summary-card-label">Total Income</div>
                  <div className="summary-card-value text-success">{fmt(summary?.income ?? 0)}</div>
                  <div className="summary-card-sub">{summary?.totalRecords ?? 0} records total</div>
                </div>
                <div className="summary-card">
                  <div className="summary-card-label">Total Expenses</div>
                  <div className="summary-card-value text-danger">{fmt(summary?.expenses ?? 0)}</div>
                  <div className="summary-card-sub">across all categories</div>
                </div>
                <div className="summary-card">
                  <div className="summary-card-label">Net Balance</div>
                  <div
                    className="summary-card-value"
                    style={{ color: (summary?.balance ?? 0) >= 0 ? 'var(--success)' : 'var(--danger)' }}
                  >
                    {fmt(summary?.balance ?? 0)}
                  </div>
                  <div className="summary-card-sub">income minus expenses</div>
                </div>
                <div className="summary-card">
                  <div className="summary-card-label">Savings Rate</div>
                  <div
                    className="summary-card-value"
                    style={{ color: savingsRate !== null && savingsRate >= 20 ? 'var(--success)' : 'var(--warning)' }}
                  >
                    {savingsRate !== null ? `${savingsRate}%` : '—'}
                  </div>
                  <div className="summary-card-sub">of income saved</div>
                </div>
              </div>

              {/* Charts row */}
              <div className="grid-2">
                {/* Monthly trends */}
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Monthly Trends</span>
                    <div className="flex gap-2" style={{ fontSize: '11px' }}>
                      <span style={{ color: 'var(--success)' }}>● Income</span>
                      <span style={{ color: 'var(--danger)' }}>● Expenses</span>
                    </div>
                  </div>
                  {trends.length === 0 ? (
                    <div className="empty-state"><p>No trend data yet</p></div>
                  ) : (
                    <div style={{ width: '100%', height: 260, marginTop: '20px' }}>
                      <ResponsiveContainer>
                        <BarChart data={trends.map(t => ({ ...t, formattedMonth: fmtMonth(t.month) }))}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#333' : '#eee'} />
                          <XAxis dataKey="formattedMonth" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} tickFormatter={(val) => `₹${val >= 1000 ? val / 1000 + 'k' : val}`} width={55} />
                          <RechartsTooltip 
                            cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                            contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
                            formatter={(val: any) => fmt(Number(val))}
                          />
                          <Bar dataKey="income" name="Income" fill="var(--success)" radius={[4, 4, 0, 0]} barSize={18} />
                          <Bar dataKey="expense" name="Expense" fill="var(--danger)" radius={[4, 4, 0, 0]} barSize={18} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Category breakdown */}
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Spending by Category</span>
                  </div>
                  {categories.filter((c) => c.expense > 0).length === 0 ? (
                    <div className="empty-state"><p>No category data yet</p></div>
                  ) : (
                    <div style={{ width: '100%', height: 260, marginTop: '20px' }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={categories.filter(c => c.expense > 0).sort((a, b) => b.expense - a.expense).slice(0, 8)}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="expense"
                            nameKey="category"
                            stroke="none"
                            onClick={(data: any) => setActiveCategory(activeCategory === data.name ? null : data.name)}
                            style={{ cursor: 'pointer' }}
                          >
                            {categories.filter(c => c.expense > 0).sort((a, b) => b.expense - a.expense).slice(0, 8).map((entry, index) => {
                              const isDimmed = activeCategory && activeCategory !== entry.category;
                              const isActive = activeCategory === entry.category;
                              return (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={COLORS[categories.findIndex(c => c.category === entry.category) % COLORS.length]} 
                                  stroke={isActive ? (theme === 'dark' ? '#fff' : '#000') : "none"}
                                  strokeWidth={isActive ? 2 : 0}
                                  style={{ opacity: isDimmed ? 0.15 : 1, transition: 'all 0.2s' }}
                                />
                              )
                            })}
                          </Pie>
                          <RechartsTooltip
                            formatter={(val: any) => fmt(Number(val))}
                            contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
                          />
                          <Legend 
                            iconType="circle" 
                            wrapperStyle={{ cursor: 'pointer' }} 
                            onClick={(data) => setActiveCategory(activeCategory === data.value ? null : String(data.value))} 
                            formatter={(value) => {
                              const isDimmed = activeCategory && activeCategory !== value;
                              return <span style={{ opacity: isDimmed ? 0.3 : 1, transition: 'opacity 0.2s' }}>{value}</span>;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* RECORDS TAB */}
          {tab === 'records' && (
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <span className="card-title">Recent Transactions</span>
              </div>
              {recent.length === 0 ? (
                <div className="empty-state"><p>No transactions yet</p></div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Type</th>
                        <th>Notes</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((r) => (
                        <tr key={r.id}>
                          <td className="text-muted text-sm">
                            {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td style={{ fontWeight: 500 }}>{r.category}</td>
                          <td>
                            <span className={`badge ${r.type === 'income' ? 'badge-success' : 'badge-danger'}`}>
                              {r.type}
                            </span>
                          </td>
                          <td className="text-secondary text-sm">{r.notes ?? '—'}</td>
                          <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: r.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                            {r.type === 'income' ? '+' : '-'}{fmt(r.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* INSIGHTS TAB */}
          {tab === 'insights' && canInsights && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">AI Insights</span>
                <span className="badge badge-accent">Rule Engine</span>
              </div>
              {insights.length === 0 ? (
                <div className="empty-state"><p>No insights available yet</p></div>
              ) : (
                <div className="insights-list">
                  {insights.map((ins, i) => (
                    <div key={i} className={`insight-item ${ins.type}`}>
                      <span className="insight-icon">
                        {ins.type === 'warning' ? '!' : ins.type === 'success' ? '+' : 'i'}
                      </span>
                      <div>
                        <div className="insight-title">{ins.title}</div>
                        <div className="insight-message">{ins.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  )
}
