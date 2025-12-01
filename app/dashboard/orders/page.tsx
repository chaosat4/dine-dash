'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ConciergeBell,
  RefreshCw,
  Users,
  Clock,
  MapPin,
  Phone,
  Check,
  X,
  Bell,
  DollarSign,
  Filter,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toaster'
import { useStaffStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import type { Order, OrderStatus, Table } from '@/types'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types'

type ViewMode = 'tables' | 'list'

export default function OrderDashboard() {
  const { restaurantId, role } = useStaffStore()
  const { addToast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('tables')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL')

  const fetchData = useCallback(async () => {
    try {
      const [ordersRes, tablesRes] = await Promise.all([
        fetch('/api/orders?status=PENDING,CONFIRMED,PREPARING,READY,SERVED'),
        fetch('/api/tables'),
      ])
      
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData)
      }
      if (tablesRes.ok) {
        const tablesData = await tablesRes.json()
        setTables(tablesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [fetchData])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchData()
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
        addToast({ title: `Order ${ORDER_STATUS_LABELS[newStatus]}`, type: 'success' })
        setSelectedOrder(null)
      } else {
        addToast({ title: 'Failed to update order', type: 'error' })
      }
    } catch (error) {
      addToast({ title: 'Failed to update order', type: 'error' })
    }
  }

  const getTableOrders = (tableId: string) => {
    return orders.filter((o) => o.tableId === tableId && !['COMPLETED', 'CANCELLED'].includes(o.status))
  }

  const getTableStatus = (tableId: string) => {
    const tableOrders = getTableOrders(tableId)
    if (tableOrders.length === 0) return 'empty'
    if (tableOrders.some((o) => o.status === 'READY')) return 'ready'
    if (tableOrders.some((o) => o.status === 'PREPARING')) return 'preparing'
    return 'active'
  }

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'ALL' && order.status !== statusFilter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        order.orderNumber.toLowerCase().includes(query) ||
        order.customerName?.toLowerCase().includes(query) ||
        order.customerPhone?.includes(query) ||
        order.table?.number.toString().includes(query)
      )
    }
    return true
  })

  const readyOrders = orders.filter((o) => o.status === 'READY')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <ConciergeBell className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-playfair)' }}>
              Order Management
            </h1>
            <p className="text-gray-500">Table service & order tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white rounded-lg p-1 flex gap-1 shadow-sm">
            <button
              onClick={() => setViewMode('tables')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'tables' ? 'bg-[var(--primary)] text-white' : 'text-gray-600'
              }`}
            >
              Tables
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-[var(--primary)] text-white' : 'text-gray-600'
              }`}
            >
              List
            </button>
          </div>
          <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Ready Orders Alert */}
      {readyOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center animate-pulse">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-emerald-800">{readyOrders.length} Order{readyOrders.length > 1 ? 's' : ''} Ready to Serve!</p>
            <p className="text-sm text-emerald-600">
              {readyOrders.map((o) => `Table ${o.table?.number}`).join(', ')}
            </p>
          </div>
          <Button
            onClick={() => {
              setViewMode('list')
              setStatusFilter('READY')
            }}
            size="sm"
          >
            View Orders
          </Button>
        </motion.div>
      )}

      {viewMode === 'tables' ? (
        /* Tables View */
        <div>
          <h2 className="font-semibold text-[var(--text)] mb-4">Restaurant Floor</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {tables.map((table) => {
              const status = getTableStatus(table.id)
              const tableOrders = getTableOrders(table.id)
              const total = tableOrders.reduce((sum, o) => sum + o.total, 0)

              return (
                <motion.button
                  key={table.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (tableOrders.length > 0) {
                      setSelectedOrder(tableOrders[0])
                    }
                  }}
                  className={`aspect-square rounded-2xl p-4 flex flex-col items-center justify-center transition-all ${
                    status === 'empty'
                      ? 'bg-gray-100 text-gray-400'
                      : status === 'ready'
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 animate-pulse'
                      : status === 'preparing'
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                      : 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  }`}
                >
                  <span className="text-2xl font-bold">{table.number}</span>
                  <span className="text-xs opacity-80 mt-1">
                    {status === 'empty' ? 'Available' : `${tableOrders.length} order${tableOrders.length > 1 ? 's' : ''}`}
                  </span>
                  {total > 0 && (
                    <span className="text-xs mt-1 font-medium">{formatPrice(total)}</span>
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6">
            {[
              { label: 'Available', color: 'bg-gray-100', textColor: 'text-gray-600' },
              { label: 'Active', color: 'bg-blue-500', textColor: 'text-white' },
              { label: 'Preparing', color: 'bg-orange-500', textColor: 'text-white' },
              { label: 'Ready', color: 'bg-emerald-500', textColor: 'text-white' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${item.color}`} />
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-5 h-5" />}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'ALL')}
              className="px-4 py-2 border rounded-xl bg-white"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PREPARING">Preparing</option>
              <option value="READY">Ready</option>
              <option value="SERVED">Served</option>
            </select>
          </div>

          {/* Orders List */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left text-sm text-gray-500">
                    <th className="px-6 py-4 font-medium">Order</th>
                    <th className="px-6 py-4 font-medium">Table</th>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Items</th>
                    <th className="px-6 py-4 font-medium">Total</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[var(--text)]">{order.orderNumber}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          Table {order.table?.number}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[var(--text)]">{order.customerName || 'Guest'}</p>
                        {order.customerPhone && (
                          <p className="text-xs text-gray-400">{order.customerPhone}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{order.items.length} items</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-[var(--text)]">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status]} text-white`}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {order.status === 'READY' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'SERVED')}
                              className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                              title="Mark Served"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {order.status === 'SERVED' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                              title="Complete"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                            title="View Details"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredOrders.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <ConciergeBell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No orders found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[var(--text)]">{selectedOrder.orderNumber}</h2>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> Table {selectedOrder.table?.number}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
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
                {(selectedOrder.customerName || selectedOrder.customerPhone) && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <Users className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text)]">{selectedOrder.customerName || 'Guest'}</p>
                      {selectedOrder.customerPhone && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {selectedOrder.customerPhone}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-[var(--text)] mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-xl">
                        <div className="flex gap-3">
                          <div className={item.menuItem?.isVeg ? 'badge-veg' : 'badge-non-veg'} style={{ marginTop: 3 }} />
                          <div>
                            <p className="font-medium text-[var(--text)]">
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
                  <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-[var(--primary)]">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {selectedOrder.status === 'READY' && (
                    <Button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'SERVED')}
                      className="flex-1"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Mark as Served
                    </Button>
                  )}
                  {selectedOrder.status === 'SERVED' && (
                    <Button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'COMPLETED')}
                      className="flex-1"
                    >
                      <DollarSign className="w-5 h-5 mr-2" />
                      Complete & Collect Payment
                    </Button>
                  )}
                  {!['COMPLETED', 'CANCELLED'].includes(selectedOrder.status) && (
                    <Button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'CANCELLED')}
                      variant="danger"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

