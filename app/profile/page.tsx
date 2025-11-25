'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Phone, Mail, Clock, ChevronRight, LogOut, Package, Settings } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAppStore } from '@/lib/store'
import { useToast } from '@/components/ui/Toaster'
import { formatPrice } from '@/lib/utils'
import type { Order } from '@/types'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types'

// Demo orders
const demoOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-ABC123',
    status: 'COMPLETED',
    tableId: '1',
    items: [],
    subtotal: 897,
    tax: 44.85,
    total: 941.85,
    paymentStatus: 'PAID',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '2',
    orderNumber: 'ORD-DEF456',
    status: 'PREPARING',
    tableId: '1',
    items: [],
    subtotal: 599,
    tax: 29.95,
    total: 628.95,
    paymentStatus: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export default function ProfilePage() {
  const router = useRouter()
  const { user, setUser, clearUser, clearTable, clearCart } = useAppStore()
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile')
  const [orders, setOrders] = useState<Order[]>(demoOrders)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: '',
  })

  useEffect(() => {
    if (user?.phone) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders?phone=${user?.phone}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch {
      // Use demo orders
    }
  }

  const handleSave = () => {
    setUser({
      ...user,
      name: formData.name,
      phone: formData.phone,
      verified: true,
    })
    addToast({ title: 'Profile updated', type: 'success' })
    setIsEditing(false)
  }

  const handleLogout = () => {
    clearUser()
    clearTable()
    clearCart()
    addToast({ title: 'Logged out successfully', type: 'success' })
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header title="Profile" showBack />

      {/* Tab Navigation (Mobile) */}
      <div className="sticky top-16 z-20 glass border-b border-gray-100 sm:hidden">
        <div className="flex">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                : 'text-gray-500'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeTab === 'orders'
                ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                : 'text-gray-500'
            }`}
          >
            My Orders
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Sidebar (Desktop) */}
          <div className="hidden sm:block">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              {/* User Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mb-3">
                  <User className="w-10 h-10 text-[var(--primary)]" />
                </div>
                <h2 className="font-semibold text-lg text-[var(--text)]">
                  {user?.name || 'Guest'}
                </h2>
                {user?.phone && (
                  <p className="text-gray-500 text-sm">+91 {user.phone}</p>
                )}
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span>Profile Settings</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  <span>Order History</span>
                </button>
              </nav>

              <div className="mt-6 pt-6 border-t">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="sm:col-span-2">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-lg text-[var(--text)]">
                      Personal Information
                    </h3>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-[var(--primary)] font-medium text-sm"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <Input
                        label="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        icon={<User className="w-5 h-5" />}
                      />
                      <Input
                        label="Phone Number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        icon={<Phone className="w-5 h-5" />}
                        disabled
                      />
                      <Input
                        label="Email (Optional)"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        icon={<Mail className="w-5 h-5" />}
                      />
                      <div className="flex gap-3 pt-4">
                        <Button onClick={handleSave} className="flex-1">
                          Save Changes
                        </Button>
                        <Button
                          onClick={() => setIsEditing(false)}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="font-medium">{user?.name || 'Not set'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{user?.phone ? `+91 ${user.phone}` : 'Not set'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Logout Button (Mobile) */}
                <div className="sm:hidden">
                  <Button onClick={handleLogout} variant="danger" fullWidth>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="font-semibold text-lg text-[var(--text)] mb-4">
                  Order History
                </h3>

                {orders.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                    <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500">No orders yet</p>
                    <Button onClick={() => router.push('/menu')} className="mt-4">
                      Start Ordering
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <button
                        key={order.id}
                        onClick={() => router.push(`/order/${order.orderNumber}`)}
                        className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow text-left"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-[var(--text)]">
                              {order.orderNumber}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                              ORDER_STATUS_COLORS[order.status]
                            }`}
                          >
                            {ORDER_STATUS_LABELS[order.status]}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[var(--primary)]">
                            {formatPrice(order.total)}
                          </span>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

