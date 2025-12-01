'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  ChefHat,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Play,
  Check,
  Timer,
  Flame,
  UtensilsCrossed,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toaster'
import { useStaffStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import type { Order, OrderStatus, KitchenStats } from '@/types'

const STATUS_COLUMNS: { status: OrderStatus[]; label: string; color: string; bgColor: string }[] = [
  { status: ['PENDING', 'CONFIRMED'], label: 'New Orders', color: 'text-amber-700', bgColor: 'bg-amber-500' },
  { status: ['PREPARING'], label: 'In Progress', color: 'text-orange-700', bgColor: 'bg-orange-500' },
  { status: ['READY'], label: 'Ready to Serve', color: 'text-emerald-700', bgColor: 'bg-emerald-500' },
]

export default function KitchenDashboard() {
  const { restaurantId } = useStaffStore()
  const { addToast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<KitchenStats | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/kitchen/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchOrders, 10000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchOrders()
    setIsRefreshing(false)
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
        addToast({ title: `Order marked as ${newStatus.toLowerCase()}`, type: 'success' })
        setSelectedOrder(null)
      } else {
        addToast({ title: 'Failed to update order', type: 'error' })
      }
    } catch (error) {
      addToast({ title: 'Failed to update order', type: 'error' })
    }
  }

  const getTimeSince = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m`
    return `${Math.floor(mins / 60)}h ${mins % 60}m`
  }

  const getTimeColor = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
    if (mins < 10) return 'text-emerald-600 bg-emerald-50'
    if (mins < 20) return 'text-amber-600 bg-amber-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-playfair)' }}>
              Kitchen Display
            </h1>
            <p className="text-gray-500">Real-time order queue</p>
          </div>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-amber-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-700">{stats?.pendingCount || 0}</p>
            <p className="text-sm text-amber-600">Pending</p>
          </div>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-700">{stats?.preparingCount || 0}</p>
            <p className="text-sm text-orange-600">Preparing</p>
          </div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-700">{stats?.readyCount || 0}</p>
            <p className="text-sm text-emerald-600">Ready</p>
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
            <Timer className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-700">{stats?.avgPrepTime || 0}m</p>
            <p className="text-sm text-blue-600">Avg Prep Time</p>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {STATUS_COLUMNS.map((column) => (
          <div key={column.label} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className={`${column.bgColor} text-white px-4 py-3 flex items-center justify-between`}>
              <span className="font-semibold">{column.label}</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                {orders.filter((o) => column.status.includes(o.status)).length}
              </span>
            </div>
            <div className="p-4 space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto">
              <AnimatePresence>
                {orders
                  .filter((o) => column.status.includes(o.status))
                  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  .map((order) => (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-[var(--text)]">{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">Table {order.table?.number}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getTimeColor(order.createdAt)}`}>
                          <Clock className="w-3 h-3 inline mr-1" />
                          {getTimeSince(order.createdAt)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-start gap-2">
                            <div className={item.menuItem?.isVeg ? 'badge-veg' : 'badge-non-veg'} style={{ marginTop: 3 }} />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[var(--text)]">
                                {item.quantity}x {item.menuItem?.name}
                              </p>
                              {item.notes && (
                                <p className="text-xs text-orange-600 italic">📝 {item.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {order.specialRequests && (
                        <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                          <p className="text-xs text-yellow-700">
                            <strong>Note:</strong> {order.specialRequests}
                          </p>
                        </div>
                      )}
                      {/* Quick Actions */}
                      <div className="mt-4 flex gap-2">
                        {column.status.includes('PENDING') || column.status.includes('CONFIRMED') ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateOrderStatus(order.id, 'PREPARING')
                            }}
                            className="flex-1 bg-orange-500 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors"
                          >
                            <Play className="w-4 h-4" />
                            Start
                          </button>
                        ) : column.status.includes('PREPARING') ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateOrderStatus(order.id, 'READY')
                            }}
                            className="flex-1 bg-emerald-500 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            Mark Ready
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateOrderStatus(order.id, 'SERVED')
                            }}
                            className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
                          >
                            <UtensilsCrossed className="w-4 h-4" />
                            Served
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
              {orders.filter((o) => column.status.includes(o.status)).length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <ChefHat className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No orders</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[var(--text)]">{selectedOrder.orderNumber}</h2>
                  <p className="text-sm text-gray-500">Table {selectedOrder.table?.number} • {getTimeSince(selectedOrder.createdAt)}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <h3 className="font-semibold text-[var(--text)]">Order Items</h3>
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className={item.menuItem?.isVeg ? 'badge-veg' : 'badge-non-veg'} style={{ marginTop: 3 }} />
                  <div className="flex-1">
                    <p className="font-medium text-[var(--text)]">
                      {item.quantity}x {item.menuItem?.name}
                    </p>
                    {item.customizations && Object.keys(item.customizations).length > 0 && (
                      <p className="text-sm text-gray-500">
                        {Object.entries(item.customizations).map(([k, v]) => `${k}: ${v}`).join(', ')}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-sm text-orange-600 italic mt-1">📝 {item.notes}</p>
                    )}
                  </div>
                </div>
              ))}
              {selectedOrder.specialRequests && (
                <div className="p-4 bg-yellow-50 rounded-xl">
                  <p className="text-sm font-medium text-yellow-800">Special Requests</p>
                  <p className="text-sm text-yellow-700 mt-1">{selectedOrder.specialRequests}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

