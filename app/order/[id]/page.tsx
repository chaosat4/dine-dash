'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Copy, Clock, MapPin, Phone, Bell, Receipt, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { OrderStatusStepper } from '@/components/order/OrderStatusStepper'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toaster'
import { formatPrice } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'

// Demo order for when API is not available
const createDemoOrder = (id: string): Order => ({
  id,
  orderNumber: id,
  status: 'CONFIRMED',
  tableId: '1',
  customerName: 'Guest',
  customerPhone: '9876543210',
  items: [
    { id: '1', orderId: id, menuItemId: '1', quantity: 2, price: 299, menuItem: { id: '1', name: 'Paneer Tikka', price: 299, isVeg: true, isAvailable: true, categoryId: '1' } },
    { id: '2', orderId: id, menuItemId: '4', quantity: 1, price: 399, menuItem: { id: '4', name: 'Butter Chicken', price: 399, isVeg: false, isAvailable: true, categoryId: '2' } },
  ],
  subtotal: 997,
  tax: 49.85,
  total: 1046.85,
  estimatedTime: 25,
  paymentStatus: 'PENDING',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { addToast } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrder, 30000)
    return () => clearInterval(interval)
  }, [resolvedParams.id])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${resolvedParams.id}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      } else {
        // Use demo order
        setOrder(createDemoOrder(resolvedParams.id))
      }
    } catch {
      // Use demo order
      setOrder(createDemoOrder(resolvedParams.id))
    } finally {
      setIsLoading(false)
    }
  }

  const copyOrderNumber = () => {
    if (order) {
      navigator.clipboard.writeText(order.orderNumber)
      addToast({ title: 'Order number copied!', type: 'success' })
    }
  }

  const handleCallWaiter = () => {
    addToast({ title: 'Waiter has been notified', description: 'Someone will be with you shortly', type: 'success' })
  }

  const handleRequestBill = () => {
    router.push(`/payment?order=${resolvedParams.id}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header title="Order" showBack />
        <div className="flex flex-col items-center justify-center px-4 py-16">
          <p className="text-gray-500">Order not found</p>
          <Button onClick={() => router.push('/menu')} className="mt-4">
            Back to Menu
          </Button>
        </div>
      </div>
    )
  }

  const isCompleted = order.status === 'COMPLETED' || order.status === 'SERVED'

  return (
    <div className="min-h-screen bg-[var(--background)] pb-32">
      <Header showBack showCart={false} showProfile={false} />

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Success Animation (shown for new orders) */}
        {order.status === 'CONFIRMED' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Check className="w-10 h-10 text-green-500" />
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Order Number Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm text-center mb-6"
        >
          <p className="text-gray-500 mb-2">Order Number</p>
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--text)]">{order.orderNumber}</h1>
            <button
              onClick={copyOrderNumber}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Copy className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {order.estimatedTime && !isCompleted && (
            <div className="flex items-center justify-center gap-2 mt-4 text-[var(--accent)]">
              <Clock className="w-5 h-5" />
              <span className="font-medium">~{order.estimatedTime} mins</span>
            </div>
          )}

          {order.table && (
            <div className="flex items-center justify-center gap-2 mt-2 text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>Table {order.table.number}</span>
            </div>
          )}
        </motion.div>

        {/* Order Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm mb-6"
        >
          <h3 className="font-semibold text-[var(--text)] mb-6 text-center">Order Status</h3>
          
          {/* Mobile: Vertical stepper */}
          <div className="sm:hidden">
            <OrderStatusStepper status={order.status} vertical />
          </div>
          
          {/* Desktop: Horizontal stepper */}
          <div className="hidden sm:block">
            <OrderStatusStepper status={order.status} />
          </div>
        </motion.div>

        {/* Order Details (Collapsible) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6"
        >
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <Receipt className="w-5 h-5 text-gray-400" />
              <span className="font-semibold text-[var(--text)]">Order Details</span>
            </div>
            {showDetails ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="border-t px-4 pb-4"
            >
              <div className="py-4 space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div className="flex items-start gap-2">
                      <div
                        className={item.menuItem?.isVeg ? 'badge-veg mt-1' : 'badge-non-veg mt-1'}
                        style={{ transform: 'scale(0.7)' }}
                      />
                      <div>
                        <p className="font-medium text-[var(--text)]">
                          {item.quantity}x {item.menuItem?.name}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-gray-400 italic">{item.notes}</p>
                        )}
                      </div>
                    </div>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-[var(--primary)]">{formatPrice(order.total)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-gray-100 p-4">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button
            onClick={handleCallWaiter}
            variant="outline"
            className="flex-1"
          >
            <Bell className="w-4 h-4 mr-2" />
            Call Waiter
          </Button>
          <Button
            onClick={handleRequestBill}
            className="flex-1"
          >
            <Receipt className="w-4 h-4 mr-2" />
            Request Bill
          </Button>
        </div>
      </div>
    </div>
  )
}

