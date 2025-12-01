'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  UtensilsCrossed, 
  ArrowLeft,
  Phone,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'
import { ORDER_STATUS_LABELS } from '@/types'

const statusSteps: { status: OrderStatus; label: string; icon: typeof Clock }[] = [
  { status: 'CONFIRMED', label: 'Order Placed', icon: CheckCircle2 },
  { status: 'PREPARING', label: 'Preparing', icon: ChefHat },
  { status: 'READY', label: 'Ready', icon: UtensilsCrossed },
  { status: 'SERVED', label: 'Served', icon: CheckCircle2 },
]

export default function OrderTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const orderId = params.id as string
  
  const { restaurant } = useAppStore()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const brandSettings = restaurant?.brandSettings

  useEffect(() => {
    fetchOrder()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrder, 30000)
    return () => clearInterval(interval)
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchOrder()
  }

  const getCurrentStepIndex = () => {
    if (!order) return 0
    const index = statusSteps.findIndex((s) => s.status === order.status)
    return index >= 0 ? index : 0
  }

  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: brandSettings?.backgroundColor || 'var(--background)' }}
      >
        <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-8"
        style={{ backgroundColor: brandSettings?.backgroundColor || 'var(--background)' }}
      >
        <h2 className="text-xl font-bold mb-4">Order not found</h2>
        <Button onClick={() => router.push(`/r/${slug}/menu`)}>
          Back to Menu
        </Button>
      </div>
    )
  }

  const currentStep = getCurrentStepIndex()

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: brandSettings?.backgroundColor || 'var(--background)' }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/r/${slug}/menu`)}
              className="p-2 hover:bg-gray-100 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold" style={{ color: brandSettings?.textColor || 'var(--text)' }}>
                {order.orderNumber}
              </h1>
              <p className="text-sm text-gray-500">Table {order.table?.number}</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 hover:bg-gray-100 rounded-xl"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <div className="text-center mb-8">
            <div 
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${brandSettings?.primaryColor || 'var(--primary)'}15` }}
            >
              {order.status === 'CANCELLED' ? (
                <span className="text-4xl">❌</span>
              ) : order.status === 'COMPLETED' || order.status === 'SERVED' ? (
                <CheckCircle2 
                  className="w-10 h-10" 
                  style={{ color: brandSettings?.primaryColor || 'var(--primary)' }}
                />
              ) : (
                <Clock 
                  className="w-10 h-10 animate-pulse" 
                  style={{ color: brandSettings?.primaryColor || 'var(--primary)' }}
                />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: brandSettings?.textColor || 'var(--text)' }}>
              {ORDER_STATUS_LABELS[order.status]}
            </h2>
            {order.estimatedTime && order.status === 'PREPARING' && (
              <p className="text-gray-500">
                Estimated time: ~{order.estimatedTime} mins
              </p>
            )}
          </div>

          {/* Progress Steps */}
          {order.status !== 'CANCELLED' && (
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
                <div 
                  className="h-full transition-all duration-500"
                  style={{ 
                    width: `${(currentStep / (statusSteps.length - 1)) * 100}%`,
                    backgroundColor: brandSettings?.primaryColor || 'var(--primary)'
                  }}
                />
              </div>

              {/* Steps */}
              <div className="relative flex justify-between">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon
                  const isActive = index <= currentStep
                  const isCurrent = index === currentStep

                  return (
                    <div key={step.status} className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          isActive 
                            ? 'text-white' 
                            : 'bg-gray-100 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-opacity-30' : ''}`}
                        style={{ 
                          backgroundColor: isActive ? brandSettings?.primaryColor || 'var(--primary)' : undefined,
                          ringColor: isCurrent ? brandSettings?.primaryColor || 'var(--primary)' : undefined
                        }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-xs mt-2 text-center ${isActive ? 'font-medium' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <h3 className="font-bold mb-4" style={{ color: brandSettings?.textColor || 'var(--text)' }}>
            Order Details
          </h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div className="flex items-center gap-2">
                  <div className={item.menuItem?.isVeg ? 'badge-veg' : 'badge-non-veg'} />
                  <span className="text-gray-600">
                    {item.quantity}x {item.menuItem?.name}
                  </span>
                </div>
                <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">Tax</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-3">
              <span>Total</span>
              <span style={{ color: brandSettings?.primaryColor || 'var(--primary)' }}>
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm text-center"
        >
          <p className="text-gray-500 mb-4">Need help with your order?</p>
          <Button variant="outline" className="gap-2">
            <Phone className="w-4 h-4" />
            Call Restaurant
          </Button>
        </motion.div>

        {/* Order Again */}
        <Button
          onClick={() => router.push(`/r/${slug}/menu`)}
          variant="outline"
          className="w-full"
        >
          Order More Items
        </Button>
      </div>
    </div>
  )
}

