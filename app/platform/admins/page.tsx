'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldQuestion,
  X,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toaster'

interface PlatformAdmin {
  id: string
  name: string
  email: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT'
  isActive: boolean
  lastLogin?: string
  createdAt: string
}

const ROLE_ICONS = {
  SUPER_ADMIN: ShieldCheck,
  ADMIN: Shield,
  SUPPORT: ShieldQuestion,
}

const ROLE_COLORS = {
  SUPER_ADMIN: 'bg-purple-500/10 text-purple-400',
  ADMIN: 'bg-indigo-500/10 text-indigo-400',
  SUPPORT: 'bg-slate-500/10 text-slate-400',
}

export default function AdminsPage() {
  const { addToast } = useToast()
  const [admins, setAdmins] = useState<PlatformAdmin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<PlatformAdmin | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN' as PlatformAdmin['role'],
  })

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/platform/admins')
      if (res.ok) {
        const data = await res.json()
        setAdmins(data)
      }
    } catch (error) {
      console.error('Error fetching admins:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = (admin?: PlatformAdmin) => {
    if (admin) {
      setEditingAdmin(admin)
      setFormData({
        name: admin.name,
        email: admin.email,
        password: '',
        role: admin.role,
      })
    } else {
      setEditingAdmin(null)
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'ADMIN',
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const url = editingAdmin
        ? `/api/platform/admins/${editingAdmin.id}`
        : '/api/platform/admins'
      const method = editingAdmin ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        addToast({
          title: editingAdmin ? 'Admin updated' : 'Admin created',
          type: 'success',
        })
        fetchAdmins()
        setShowModal(false)
      } else {
        const data = await res.json()
        addToast({ title: data.error || 'Operation failed', type: 'error' })
      }
    } catch (error) {
      addToast({ title: 'Something went wrong', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this admin?')) return

    try {
      const res = await fetch(`/api/platform/admins/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        addToast({ title: 'Admin deleted', type: 'success' })
        setAdmins((prev) => prev.filter((a) => a.id !== id))
      } else {
        addToast({ title: 'Failed to delete admin', type: 'error' })
      }
    } catch (error) {
      addToast({ title: 'Something went wrong', type: 'error' })
    }
  }

  const filteredAdmins = admins.filter((admin) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      admin.name.toLowerCase().includes(query) ||
      admin.email.toLowerCase().includes(query)
    )
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Platform Admins</h1>
            <p className="text-slate-400">Manage platform administrators</p>
          </div>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-5 h-5 mr-2" />
          Add Admin
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search admins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Admins List */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700/50">
            <tr className="text-left text-sm text-slate-400">
              <th className="px-6 py-4 font-medium">Admin</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Last Login</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredAdmins.map((admin) => {
              const RoleIcon = ROLE_ICONS[admin.role]
              return (
                <tr key={admin.id} className="hover:bg-slate-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                        <span className="font-bold text-white">
                          {admin.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{admin.name}</p>
                        <p className="text-sm text-slate-500">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[admin.role]}`}>
                      <RoleIcon className="w-3 h-3" />
                      {admin.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      admin.isActive
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {admin.lastLogin
                      ? new Date(admin.lastLogin).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(admin)}
                        className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"
                        disabled={admin.role === 'SUPER_ADMIN'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(admin.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400"
                        disabled={admin.role === 'SUPER_ADMIN'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filteredAdmins.length === 0 && (
          <div className="px-6 py-12 text-center text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No admins found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowModal(false)} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-slate-800 rounded-2xl shadow-xl w-full max-w-md border border-slate-700"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h2 className="text-lg font-bold text-white">
                {editingAdmin ? 'Edit Admin' : 'Add Admin'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  disabled={!!editingAdmin}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  {editingAdmin ? 'New Password (leave empty to keep)' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required={!editingAdmin}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as PlatformAdmin['role'] })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="SUPPORT">Support</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-600 text-white rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingAdmin ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

