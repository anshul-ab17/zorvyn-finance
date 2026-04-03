'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Shield, User as UserIcon, Mail, Hash, Bell, Users, Pencil, Trash2, X, Check, Server } from 'lucide-react'

interface UserRecord {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

const ROLE_COLORS: Record<string, string> = {
  Admin: 'var(--warning)',
  User: 'var(--accent)',
}

type SettingsTab = 'profile' | 'permissions' | 'users'

export default function SettingsPage() {
  const { user, token } = useAuth()

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')

  // Admin user management
  const [users, setUsers] = useState<UserRecord[]>([])
  const [usersLoading, setUsersLoading] = useState(false)

  // Self Profile Update
  const [selfLimit, setSelfLimit] = useState(user?.monthlyLimit?.toString() ?? '')
  const [selfSaving, setSelfSaving] = useState(false)
  const [selfMsg, setSelfMsg] = useState('')

  // SMTP Config
  const [smtpHost, setSmtpHost] = useState(user?.smtpHost ?? '')
  const [smtpPort, setSmtpPort] = useState(user?.smtpPort?.toString() ?? '587')
  const [smtpUser, setSmtpUser] = useState(user?.smtpUser ?? '')
  const [smtpPass, setSmtpPass] = useState('')
  const [smtpSaving, setSmtpSaving] = useState(false)
  const [smtpMsg, setSmtpMsg] = useState('')

  // Edit user modal
  const [editUser, setEditUser] = useState<UserRecord | null>(null)
  const [editName, setEditName] = useState('')
  const [editRole, setEditRole] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

  // Delete confirm
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const isAdmin = user?.role === 'Admin'
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  useEffect(() => {
    if (isAdmin && token) {
      setUsersLoading(true)
      fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d: { users?: UserRecord[] }) => setUsers(Array.isArray(d.users) ? d.users : []))
        .catch(() => {})
        .finally(() => setUsersLoading(false))
    }
  }, [isAdmin, token])

  function openEdit(u: UserRecord) {
    setEditUser(u)
    setEditName(u.name)
    setEditRole(u.role)
    setEditError('')
  }

  async function handleEditSave(e: FormEvent) {
    e.preventDefault()
    if (!editUser) return
    setEditSaving(true)
    setEditError('')
    try {
      const res = await fetch(`/api/users/${editUser.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ name: editName, role: editRole }),
      })
      const data = (await res.json()) as { error?: string; user?: UserRecord }
      if (!res.ok) {
        setEditError(data.error ?? 'Update failed')
        return
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editUser.id ? { ...u, name: editName, role: editRole } : u
        )
      )
      setEditUser(null)
    } catch {
      setEditError('Network error')
    } finally {
      setEditSaving(false)
    }
  }

  async function handleSaveLimit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setSelfSaving(true)
    setSelfMsg('')
    try {
      const parsed = parseFloat(selfLimit)
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ monthlyLimit: isNaN(parsed) ? undefined : parsed }),
      })
      if (!res.ok) {
        setSelfMsg('Failed to update limit')
        return
      }
      setSelfMsg('Limit updated successfully')
    } catch {
      setSelfMsg('Network error')
    } finally {
      setSelfSaving(false)
    }
  }

  async function handleSaveSmtp(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setSmtpSaving(true)
    setSmtpMsg('')
    try {
      const body: Record<string, string | number> = {
        smtpHost,
        smtpPort: parseInt(smtpPort) || 587,
        smtpUser,
      }
      if (smtpPass) body.smtpPass = smtpPass
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
      })
      if (!res.ok) { setSmtpMsg('Failed to save SMTP config'); return }
      setSmtpMsg('SMTP config saved')
      setSmtpPass('')
    } catch {
      setSmtpMsg('Network error')
    } finally {
      setSmtpSaving(false)
    }
  }

  async function handleDeleteUser() {
    if (!deleteUserId) return
    setDeleting(true)
    try {
      await fetch(`/api/users/${deleteUserId}`, { method: 'DELETE', headers })
      setUsers((prev) => prev.filter((u) => u.id !== deleteUserId))
      setDeleteUserId(null)
    } catch {
      // ignore
    } finally {
      setDeleting(false)
    }
  }

  const tabs: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { key: 'profile', label: 'Profile', icon: <UserIcon size={16} /> },
    { key: 'permissions', label: 'Permissions', icon: <Shield size={16} /> },
    ...(isAdmin ? [{ key: 'users' as SettingsTab, label: 'Users', icon: <Users size={16} /> }] : []),
  ]

  const permData = [
    {
      role: 'User',
      desc: 'Standard access for individual tracking',
      perms: [
        { label: 'View own records', enabled: true },
        { label: 'Create & edit records', enabled: true },
        { label: 'View dashboard', enabled: true },
        { label: 'Access AI insights', enabled: true },
        { label: 'Manage other users', enabled: false },
      ],
    },
    {
      role: 'Admin',
      desc: 'Full platform access with management',
      perms: [
        { label: 'All user records', enabled: true },
        { label: 'Full CRUD on records', enabled: true },
        { label: 'Dashboard & insights', enabled: true },
        { label: 'User management', enabled: true },
        { label: 'System configuration', enabled: true },
      ],
    },
  ]

  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Settings</h1>
          <p>Manage your profile, permissions, and team</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`settings-tab ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="settings-content">
          {/* Profile Card */}
          <div className="card settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <UserIcon size={20} />
              </div>
              <div>
                <div className="settings-card-title">Profile Information</div>
                <div className="settings-card-desc">Your personal details and account info</div>
              </div>
            </div>

            <div className="settings-grid">
              <div className="settings-field">
                <div className="settings-field-icon"><UserIcon size={14} /></div>
                <div>
                  <div className="settings-field-label">Full Name</div>
                  <div className="settings-field-value">{user?.name}</div>
                </div>
              </div>
              <div className="settings-field">
                <div className="settings-field-icon"><Mail size={14} /></div>
                <div>
                  <div className="settings-field-label">Email Address</div>
                  <div className="settings-field-value">{user?.email}</div>
                </div>
              </div>
              <div className="settings-field">
                <div className="settings-field-icon"><Shield size={14} /></div>
                <div>
                  <div className="settings-field-label">Role</div>
                  <div className="settings-field-value" style={{ color: ROLE_COLORS[user?.role ?? ''] ?? 'var(--text-primary)', fontWeight: 600 }}>
                    {user?.role}
                  </div>
                </div>
              </div>
              <div className="settings-field">
                <div className="settings-field-icon"><Hash size={14} /></div>
                <div>
                  <div className="settings-field-label">User ID</div>
                  <div className="settings-field-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {user?.id}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alert Threshold Card */}
          <div className="card settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon" style={{ background: 'rgba(251, 191, 36, 0.15)', color: 'var(--warning)' }}>
                <Bell size={20} />
              </div>
              <div>
                <div className="settings-card-title">Spending Alert</div>
                <div className="settings-card-desc">Get notified when your monthly expenses exceed a threshold</div>
              </div>
            </div>

            <form onSubmit={handleSaveLimit} className="settings-alert-form">
              <div className="settings-input-group">
                <span className="settings-input-prefix">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="e.g. 10000"
                  value={selfLimit}
                  onChange={(e) => setSelfLimit(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={selfSaving} style={{ whiteSpace: 'nowrap' }}>
                {selfSaving ? 'Saving...' : 'Save Threshold'}
              </button>
            </form>
            {selfMsg && (
              <div style={{
                fontSize: '13px',
                color: selfMsg.includes('Failed') || selfMsg.includes('error') ? 'var(--danger)' : 'var(--success)',
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <Check size={14} />
                {selfMsg}
              </div>
            )}
          </div>

          {/* SMTP Config Card */}
          <div className="card settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--info)' }}>
                <Server size={20} />
              </div>
              <div>
                <div className="settings-card-title">Email (SMTP) Config</div>
                <div className="settings-card-desc">
                  Used to send spending alert emails.&nbsp;
                  {user?.smtpConfigured
                    ? <span style={{ color: 'var(--success)', fontWeight: 600 }}>● Configured</span>
                    : <span style={{ color: 'var(--text-muted)' }}>Not configured</span>}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveSmtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="grid-2" style={{ gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>SMTP Host</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="smtp.gmail.com"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>SMTP Port</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="587"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid-2" style={{ gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>SMTP User</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@gmail.com"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>SMTP Password {user?.smtpConfigured && <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>(leave blank to keep current)</span>}</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder={user?.smtpConfigured ? '••••••••' : 'App password'}
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" disabled={smtpSaving} style={{ whiteSpace: 'nowrap' }}>
                  {smtpSaving ? 'Saving...' : 'Save SMTP Config'}
                </button>
                {smtpMsg && (
                  <span style={{
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: smtpMsg.includes('Failed') || smtpMsg.includes('error') ? 'var(--danger)' : 'var(--success)',
                  }}>
                    <Check size={14} />
                    {smtpMsg}
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PERMISSIONS TAB */}
      {activeTab === 'permissions' && (
        <div className="settings-content">
          <div className="settings-perm-grid">
            {permData.map((role) => (
              <div
                key={role.role}
                className={`card settings-perm-card ${user?.role === role.role ? 'current' : ''}`}
              >
                {user?.role === role.role && (
                  <div className="settings-perm-badge">Your Role</div>
                )}
                <div className="settings-perm-header">
                  <div className="settings-perm-icon" style={{ color: ROLE_COLORS[role.role] }}>
                    {role.role === 'Admin' ? <Shield size={28} /> : <UserIcon size={28} />}
                  </div>
                  <div className="settings-perm-role" style={{ color: ROLE_COLORS[role.role] }}>{role.role}</div>
                  <div className="settings-perm-desc">{role.desc}</div>
                </div>
                <div className="settings-perm-list">
                  {role.perms.map((p) => (
                    <div key={p.label} className={`settings-perm-item ${p.enabled ? 'enabled' : 'disabled'}`}>
                      <div className={`settings-perm-check ${p.enabled ? 'on' : 'off'}`}>
                        {p.enabled ? <Check size={12} /> : <X size={12} />}
                      </div>
                      {p.label}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USERS TAB (Admin only) */}
      {activeTab === 'users' && isAdmin && (
        <div className="settings-content">
          <div className="card settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon" style={{ background: 'rgba(96, 165, 250, 0.15)', color: '#60a5fa' }}>
                <Users size={20} />
              </div>
              <div>
                <div className="settings-card-title">Team Members</div>
                <div className="settings-card-desc">{users.length} user{users.length !== 1 ? 's' : ''} registered on the platform</div>
              </div>
            </div>

            {usersLoading ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : (
              <div className="settings-user-list">
                {users.map((u) => (
                  <div key={u.id} className="settings-user-row">
                    <div className="settings-user-avatar">
                      {u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="settings-user-info">
                      <div className="settings-user-name">{u.name}</div>
                      <div className="settings-user-email">{u.email}</div>
                    </div>
                    <div className="settings-user-role" style={{ color: ROLE_COLORS[u.role] ?? 'var(--text-muted)' }}>
                      {u.role}
                    </div>
                    <div className="settings-user-date">
                      {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="settings-user-actions">
                      <button className="settings-action-btn" onClick={() => openEdit(u)} title="Edit">
                        <Pencil size={14} />
                      </button>
                      {u.id !== user?.id && (
                        <button className="settings-action-btn danger" onClick={() => setDeleteUserId(u.id)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit user modal */}
      {editUser && (
        <div className="modal-overlay" onClick={() => setEditUser(null)}>
          <div className="modal" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Edit User</span>
              <button className="modal-close" onClick={() => setEditUser(null)}>
                <X size={18} />
              </button>
            </div>

            {editError && <div className="alert alert-error">{editError}</div>}

            <form onSubmit={handleEditSave}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  minLength={2}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  className="form-select"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={editSaving}>
                  {editSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete user confirm */}
      {deleteUserId && (
        <div className="modal-overlay" onClick={() => setDeleteUserId(null)}>
          <div className="modal" style={{ maxWidth: '380px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Delete User</span>
              <button className="modal-close" onClick={() => setDeleteUserId(null)}>
                <X size={18} />
              </button>
            </div>
            <p className="text-secondary" style={{ padding: '0 20px', lineHeight: 1.6 }}>
              Are you sure you want to delete this user? All their records will also be permanently removed.
            </p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteUserId(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteUser} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
