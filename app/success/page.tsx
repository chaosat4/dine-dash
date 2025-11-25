'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, Receipt, Share2, Home, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { useAppStore } from '@/lib/store'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order')
  const paymentMethod = searchParams.get('method')
  const { clearTable } = useAppStore()

  useEffect(() => {
    // Optionally clear session after successful payment
  }, [])

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Dine & Dash Order',
        text: `I just ordered at Dine & Dash! Order: ${orderId}`,
        url: window.location.origin,
      })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleNewOrder = () => {
    clearTable()
    router.push('/')
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center"
      >
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="relative w-24 h-24 mx-auto mb-6"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-green-100"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-[var(--text)] mb-2"
        >
          {paymentMethod === 'cash' ? 'Order Confirmed!' : 'Payment Successful!'}
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-500 mb-6"
        >
          {paymentMethod === 'cash'
            ? 'Please pay at the counter when your order is ready'
            : 'Thank you for dining with us!'}
        </motion.p>

        {/* Order Receipt */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-50 rounded-2xl p-6 mb-6 print:bg-white"
        >
          <div className="flex items-center justify-center gap-2 text-gray-500 mb-4">
            <Receipt className="w-5 h-5" />
            <span className="font-medium">Order Receipt</span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Order ID</span>
              <span className="font-medium font-mono">{orderId || 'ORD-DEMO'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment</span>
              <span className="font-medium capitalize">{paymentMethod || 'Card'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Time</span>
              <span className="font-medium">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="border-t mt-4 pt-4">
            <div className="flex justify-between">
              <span className="font-semibold">Total Paid</span>
              <span className="font-bold text-[var(--primary)]">{formatPrice(1046.85)}</span>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <div className="flex gap-3">
            <Button onClick={handlePrint} variant="outline" className="flex-1 no-print">
              <Receipt className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={handleShare} variant="outline" className="flex-1 no-print hidden sm:flex">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          <Button onClick={() => router.push('/menu')} fullWidth className="no-print">
            <Home className="w-4 h-4 mr-2" />
            Continue Ordering
          </Button>

          <button
            onClick={handleNewOrder}
            className="text-gray-500 text-sm hover:text-[var(--primary)] no-print"
          >
            Start new session
          </button>
        </motion.div>

        {/* Rating prompt */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 pt-6 border-t no-print"
        >
          <p className="text-gray-500 text-sm mb-3">How was your experience?</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="p-2 hover:bg-yellow-50 rounded-lg transition-colors group"
              >
                <Star className="w-8 h-8 text-gray-300 group-hover:text-yellow-400 group-hover:fill-yellow-400 transition-colors" />
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen gradient-hero flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}

