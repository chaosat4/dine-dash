'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Shield,
  ChefHat,
  UtensilsCrossed,
  UserCog,
  X,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toaster'
import { useStaffStore } from '@/lib/store'
import { STAFF_ROLE_LABELS, type Staff, type StaffRole } from '@/types'

const ROLE_ICONS: Record<StaffRole, typeof Shield> = {
  OWNER: Shield,
  MANAGER: UserCog,
  CHEF: ChefHat,
  WAITER: UtensilsCrossed,
}

const ROLE_COLORS: Record<StaffRole, string> = {
  OWNER: 'bg-purple-100 text-purple-700',
  MANAGER: 'bg-blue-100 text-blue-700',
  CHEF: 'bg-orange-100 text-orange-700',
  WAITER: 'bg-green-100 text-green-700',
}

export default function StaffPage() {
  const { restaurantId } = useStaffStore()
  const { addToast } = useToast()
  const [staff, setStaff] = useState<Staff[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'WAITER' as StaffRole,
  })

  useEffect(() => {
    fetchStaff()
  }, [restaurantId])

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/dashboard/staff')
      if (res.ok) {
        const data = await res.json()
        setStaff(data)
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = (staffMember?: Staff) => {
    if (staffMember) {
      setEditingStaff(staffMember)
      setFormData({
        name: staffMember.name,
        email: staffMember.email,
        phone: staffMember.phone || '',
        password: '',
        role: staffMember.role,
      })
    } else {
      setEditingStaff(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'WAITER',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingStaff(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'WAITER',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingStaff
        ? `/api/dashboard/staff/${editingStaff.id}`
        : '/api/dashboard/staff'
      const method = editingStaff ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        addToast({
          title: editingStaff ? 'Staff updated successfully' : 'Staff added successfully',
          type: 'success',
        })
        fetchStaff()
        handleCloseModal()
      } else {
        const data = await res.json()
        addToast({ title: data.error || 'Operation failed', type: 'error' })
      }
    } catch (error) {
      addToast({ title: 'Something went wrong', type: 'error' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return

    try {
      const res = await fetch(`/api/dashboard/staff/${id}`, { method: 'DELETE' })

      if (res.ok) {
        addToast({ title: 'Staff removed successfully', type: 'success' })
        setStaff((prev) => prev.filter((s) => s.id !== id))
      } else {
        addToast({ title: 'Failed to remove staff', type: 'error' })
      }
    } catch (error) {
      addToast({ title: 'Something went wrong', type: 'error' })
    }
  }

  const filteredStaff = staff.filter((s) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      s.name.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query) ||
      s.role.toLowerCase().includes(query)
    )
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-playfair)' }}>
              Staff Management
            </h1>
            <p className="text-gray-500">Manage your team members</p>
          </div>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-5 h-5 mr-2" />
          Add Staff
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(['OWNER', 'MANAGER', 'CHEF', 'WAITER'] as StaffRole[]).map((role) => {
          const Icon = ROLE_ICONS[role]
          const count = staff.filter((s) => s.role === role).length
          return (
            <div key={role} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ROLE_COLORS[role]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--text)]">{count}</p>
                  <p className="text-sm text-gray-500">{STAFF_ROLE_LABELS[role]}s</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search staff..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-5 h-5" />}
        />
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-500">
              <th className="px-6 py-4 font-medium">Staff Member</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Last Login</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredStaff.map((member) => {
              const Icon = ROLE_ICONS[member.role]
              return (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="font-bold text-gray-600">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text)]">{member.name}</p>
                        <p className="text-sm text-gray-400">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${ROLE_COLORS[member.role]}`}>
                      <Icon className="w-4 h-4" />
                      {STAFF_ROLE_LABELS[member.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {member.lastLogin
                      ? new Date(member.lastLogin).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(member)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        disabled={member.role === 'OWNER'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={member.role === 'OWNER'}
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
        {filteredStaff.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No staff members found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={handleCloseModal} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold text-[var(--text)]">
                {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={!!editingStaff}
              />

              <Input
                label="Phone (Optional)"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />

              <div className="relative">
                <Input
                  label={editingStaff ? 'New Password (leave empty to keep current)' : 'Password'}
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingStaff}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20"
                >
                  <option value="MANAGER">Manager</option>
                  <option value="CHEF">Kitchen Staff</option>
                  <option value="WAITER">Waiter</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingStaff ? 'Update' : 'Add Staff'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

