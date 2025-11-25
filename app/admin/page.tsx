'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Clock, ChefHat, Bell, Check, X, RefreshCw, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toaster'
import { formatPrice } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'
import { ORDER_STATUS_LABELS } from '@/types'

const columns: { status: OrderStatus[]; label: string; color: string }[] = [
  { status: ['PENDING', 'CONFIRMED'], label: 'New Orders', color: 'bg-yellow-500' },
  { status: ['PREPARING'], label: 'Preparing', color: 'bg-orange-500' },
  { status: ['READY'], label: 'Ready to Serve', color: 'bg-green-500' },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { addToast } = useToast()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders()
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchOrders, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/admin/verify')
      if (res.ok) {
        setIsAuthenticated(true)
      } else {
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/admin/login')
    } finally {
      setIsLoading(false)
    }
  }


  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders?status=PENDING,CONFIRMED,PREPARING,READY')
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      } else {
        console.error('Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchOrders()
    setIsRefreshing(false)
    addToast({ title: 'Orders refreshed', type: 'success' })
  }

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (res.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        )
        addToast({ title: `Order updated to ${ORDER_STATUS_LABELS[newStatus]}`, type: 'success' })
        setSelectedOrder(null)
      } else {
        addToast({ title: 'Failed to update order', type: 'error' })
      }
    } catch (error) {
      console.error('Error updating order:', error)
      addToast({ title: 'Failed to update order', type: 'error' })
    }
  }

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const flow: Record<OrderStatus, OrderStatus | null> = {
      PENDING: 'CONFIRMED',
      CONFIRMED: 'PREPARING',
      PREPARING: 'READY',
      READY: 'SERVED',
      SERVED: 'COMPLETED',
      COMPLETED: null,
      CANCELLED: null,
    }
    return flow[currentStatus]
  }

  const getTimeSince = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    return `${Math.floor(mins / 60)}h ${mins % 60}m ago`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Order Dashboard</h1>
          <p className="text-gray-500">Manage incoming orders in real-time</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'New Orders', value: orders.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED').length, color: 'text-yellow-500', bg: 'bg-yellow-50' },
          { label: 'Preparing', value: orders.filter((o) => o.status === 'PREPARING').length, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Ready', value: orders.filter((o) => o.status === 'READY').length, color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Total Today', value: orders.length, color: 'text-[var(--primary)]', bg: 'bg-red-50' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl p-4`}>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Kanban Board (Desktop) / Card List (Mobile) */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div key={column.label} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className={`${column.color} text-white px-4 py-3 flex items-center justify-between`}>
              <span className="font-semibold">{column.label}</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                {orders.filter((o) => column.status.includes(o.status)).length}
              </span>
            </div>
            <div className="p-4 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
              {orders
                .filter((o) => column.status.includes(o.status))
                .map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onClick={() => setSelectedOrder(order)}
                    getTimeSince={getTimeSince}
                  />
                ))}
              {orders.filter((o) => column.status.includes(o.status)).length === 0 && (
                <p className="text-center text-gray-400 py-8">No orders</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Card List */}
      <div className="lg:hidden space-y-4">
        {columns.map((column) => (
          <div key={column.label}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-3 h-3 rounded-full ${column.color}`} />
              <h3 className="font-semibold text-[var(--text)]">{column.label}</h3>
              <span className="text-sm text-gray-400">
                ({orders.filter((o) => column.status.includes(o.status)).length})
              </span>
            </div>
            <div className="space-y-3">
              {orders
                .filter((o) => column.status.includes(o.status))
                .map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onClick={() => setSelectedOrder(order)}
                    getTimeSince={getTimeSince}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedOrder(null)}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg">{selectedOrder.orderNumber}</h2>
                <p className="text-sm text-gray-500">
                  {getTimeSince(selectedOrder.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">Table {selectedOrder.table?.number}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{selectedOrder.customerPhone}</span>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold mb-3">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex items-start gap-2">
                        <div
                          className={item.menuItem?.isVeg ? 'badge-veg mt-1' : 'badge-non-veg mt-1'}
                          style={{ transform: 'scale(0.7)' }}
                        />
                        <div>
                          <p className="font-medium">
                            {item.quantity}x {item.menuItem?.name}
                          </p>
                          {item.notes && (
                            <p className="text-sm text-gray-500 italic">{item.notes}</p>
                          )}
                        </div>
                      </div>
                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-4 pt-4 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-[var(--primary)]">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {getNextStatus(selectedOrder.status) && (
                  <Button
                    onClick={() =>
                      updateOrderStatus(selectedOrder.id, getNextStatus(selectedOrder.status)!)
                    }
                    className="flex-1"
                  >
                    Move to {ORDER_STATUS_LABELS[getNextStatus(selectedOrder.status)!]}
                  </Button>
                )}
                {selectedOrder.status !== 'CANCELLED' && (
                  <Button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'CANCELLED')}
                    variant="danger"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function OrderCard({
  order,
  onClick,
  getTimeSince,
}: {
  order: Order
  onClick: () => void
  getTimeSince: (date: string) => string
}) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-gray-50 hover:bg-gray-100 rounded-xl p-4 text-left transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-[var(--text)]">{order.orderNumber}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="w-3 h-3" />
            <span>Table {order.table?.number}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{getTimeSince(order.createdAt)}</span>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-2">
        {order.items.map((i) => `${i.quantity}x ${i.menuItem?.name}`).join(', ')}
      </p>
      <div className="flex items-center justify-between">
        <span className="font-bold text-[var(--primary)]">{formatPrice(order.total)}</span>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            order.paymentStatus === 'PAID'
              ? 'bg-green-100 text-green-600'
              : 'bg-yellow-100 text-yellow-600'
          }`}
        >
          {order.paymentStatus}
        </span>
      </div>
    </button>
  )
}

