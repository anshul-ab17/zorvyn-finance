'use client'

import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'

interface Record {
  id: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
  notes?: string
  userId: string
  user?: { name: string; email: string }
}

interface RecordsResponse {
  records: Record[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const CATEGORIES = [
  'Salary', 'Freelance', 'Investment', 'Food', 'Rent', 'Transport',
  'Utilities', 'Health', 'Shopping', 'Entertainment', 'Education', 'Other',
]

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

const emptyForm = {
  amount: '',
  type: 'expense' as 'income' | 'expense',
  category: 'Food',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
}

export default function RecordsPage() {
  const { token, user } = useAuth()

  // Data
  const [records, setRecords] = useState<Record[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [filterType, setFilterType] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [page, setPage] = useState(1)

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Record | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const canWrite = user?.role === 'Admin' || user?.role === 'User'

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' })
      if (filterType) params.set('type', filterType)
      if (filterCategory) params.set('category', filterCategory)
      if (filterFrom) params.set('from', filterFrom)
      if (filterTo) params.set('to', filterTo)

      const res = await fetch(`/api/records?${params}`, { headers })
      const data = (await res.json()) as RecordsResponse
      setRecords(Array.isArray(data.records) ? data.records : [])
      setTotal(data.total ?? 0)
      setTotalPages(data.totalPages ?? 1)
    } catch {
      setError('Failed to load records')
    } finally {
      setLoading(false)
    }
  }, [token, page, filterType, filterCategory, filterFrom, filterTo])

  useEffect(() => {
    if (token) fetchRecords()
  }, [token, fetchRecords])

  function openAdd() {
    setEditing(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(r: Record) {
    setEditing(r)
    setForm({
      amount: String(r.amount),
      type: r.type,
      category: r.category,
      date: r.date.slice(0, 10),
      notes: r.notes ?? '',
    })
    setFormError('')
    setModalOpen(true)
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      const body = {
        amount: parseFloat(form.amount),
        type: form.type,
        category: form.category,
        date: form.date,
        notes: form.notes || undefined,
      }

      const res = editing
        ? await fetch(`/api/records/${editing.id}`, { method: 'PATCH', headers, body: JSON.stringify(body) })
        : await fetch('/api/records', { method: 'POST', headers, body: JSON.stringify(body) })

      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setFormError(data.error ?? 'Save failed')
        return
      }
      setModalOpen(false)
      fetchRecords()
    } catch {
      setFormError('Network error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      await fetch(`/api/records/${deleteId}`, { method: 'DELETE', headers })
      setDeleteId(null)
      fetchRecords()
    } catch {
      // ignore
    } finally {
      setDeleting(false)
    }
  }

  function resetFilters() {
    setFilterType('')
    setFilterCategory('')
    setFilterFrom('')
    setFilterTo('')
    setPage(1)
  }

  function setPreset(days: number) {
    const to = new Date()
    const from = new Date()
    if (days === 0) {
      from.setMonth(0, 1) // YTD
    } else {
      from.setDate(from.getDate() - days)
    }
    setFilterTo(to.toISOString().slice(0, 10))
    setFilterFrom(from.toISOString().slice(0, 10))
    setPage(1)
  }

  function exportCsv() {
    if (records.length === 0) return
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Notes']
    const rows = records.map((r) => [
      r.date.slice(0, 10),
      r.type,
      r.category,
      r.amount.toString(),
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ])
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `zorvyn-records-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Records</h1>
          <p>{total} total transactions</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={exportCsv} disabled={records.length === 0}>
            Export CSV
          </button>
          {canWrite && (
            <button className="btn btn-primary" onClick={openAdd} style={{ fontSize: '20px', lineHeight: 1, padding: '6px 14px' }}>
              +
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '16px', padding: '14px 20px' }}>
        <div className="filters-bar">
          <select
            className="filter-select"
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1) }}
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <input
            className="filter-input"
            placeholder="Category…"
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setPage(1) }}
          />

          <input
            type="date"
            className="filter-input"
            value={filterFrom}
            onChange={(e) => { setFilterFrom(e.target.value); setPage(1) }}
          />

          <input
            type="date"
            className="filter-input"
            value={filterTo}
            onChange={(e) => { setFilterTo(e.target.value); setPage(1) }}
          />

          <button className="btn btn-ghost btn-sm" onClick={resetFilters}>
            Clear
          </button>
        </div>
        <div className="flex gap-2" style={{ marginTop: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setPreset(7)}>7D</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setPreset(30)}>30D</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setPreset(0)}>YTD</button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {error && <div className="alert alert-error" style={{ margin: '16px' }}>{error}</div>}

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <p>No records found</p>
          </div>
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
                  {canWrite && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td className="text-muted text-sm">
                      {new Date(r.date).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </td>
                    <td style={{ fontWeight: 500 }}>{r.category}</td>
                    <td>
                      <span className={`badge ${r.type === 'income' ? 'badge-success' : 'badge-danger'}`}>
                        {r.type}
                      </span>
                    </td>
                    <td className="text-secondary text-sm">{r.notes ?? '—'}</td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        color: r.type === 'income' ? 'var(--success)' : 'var(--danger)',
                      }}
                    >
                      {r.type === 'income' ? '+' : '-'}{fmt(r.amount)}
                    </td>
                    {canWrite && (
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => openEdit(r)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setDeleteId(r.id)}
                            style={{ fontSize: '18px', lineHeight: 1, padding: '3px 10px' }}
                          >
                            −
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="pagination" style={{ padding: '12px 20px' }}>
            <span>
              Page {page} of {totalPages} &middot; {total} records
            </span>
            <div className="pagination-buttons">
              <button
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                ← Prev
              </button>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Record' : 'Add Record'}</span>
              <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>

            {formError && <div className="alert alert-error">{formError}</div>}

            <form onSubmit={handleSave}>
              <div className="grid-2" style={{ gap: '12px' }}>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    className="form-select"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as 'income' | 'expense' })}
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="form-input"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '12px' }}>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="form-select"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes (optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Short description…"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: '380px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Delete Record</span>
              <button className="modal-close" onClick={() => setDeleteId(null)}>×</button>
            </div>
            <p className="text-secondary text-sm">
              Are you sure you want to delete this record? This action cannot be undone.
            </p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
