'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CreditCard, Wallet, Banknote, QrCode, Shield, ArrowRight, Check } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toaster'
import { formatPrice } from '@/lib/utils'

const paymentMethods = [
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, RuPay' },
  { id: 'upi', name: 'UPI', icon: QrCode, description: 'GPay, PhonePe, Paytm' },
  { id: 'wallet', name: 'Wallet', icon: Wallet, description: 'Paytm, Amazon Pay' },
  { id: 'cash', name: 'Pay at Counter', icon: Banknote, description: 'Cash payment' },
]

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()
  const orderId = searchParams.get('order')

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [orderTotal, setOrderTotal] = useState(1046.85) // Demo total

  useEffect(() => {
    if (orderId) {
      // Fetch order total
      fetchOrderTotal()
    }
  }, [orderId])

  const fetchOrderTotal = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      if (res.ok) {
        const order = await res.json()
        setOrderTotal(order.total)
      }
    } catch {
      // Use demo total
    }
  }

  const handlePayment = async () => {
    if (!selectedMethod) {
      addToast({ title: 'Please select a payment method', type: 'error' })
      return
    }

    setIsLoading(true)
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      if (selectedMethod === 'cash') {
        addToast({ title: 'Please pay at the counter', type: 'info' })
      } else {
        addToast({ title: 'Payment successful!', type: 'success' })
      }

      // Update order payment status
      if (orderId) {
        try {
          await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              paymentStatus: selectedMethod === 'cash' ? 'PENDING' : 'PAID',
              paymentMethod: selectedMethod 
            }),
          })
        } catch {
          // Demo mode
        }
      }

      router.push(`/success?order=${orderId}&method=${selectedMethod}`)
    } catch {
      addToast({ title: 'Payment failed', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-32">
      <Header title="Payment" showBack showCart={false} />

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm mb-6"
        >
          <h3 className="font-semibold text-[var(--text)] mb-4">Bill Summary</h3>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Total Amount</span>
            <span className="text-2xl font-bold text-[var(--primary)]">
              {formatPrice(orderTotal)}
            </span>
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="font-semibold text-[var(--text)] mb-4">Select Payment Method</h3>
          <div className="space-y-3">
            {paymentMethods.map((method, index) => {
              const Icon = method.icon
              return (
                <motion.button
                  key={method.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    selectedMethod === method.id
                      ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedMethod === method.id
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-[var(--text)]">{method.name}</p>
                    <p className="text-sm text-gray-500">{method.description}</p>
                  </div>
                  {selectedMethod === method.id && (
                    <div className="w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-6"
        >
          <Shield className="w-4 h-4" />
          <span>Secure & encrypted payment</span>
        </motion.div>
      </main>

      {/* Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-gray-100 p-4">
        <div className="max-w-lg mx-auto">
          <Button
            onClick={handlePayment}
            disabled={!selectedMethod}
            loading={isLoading}
            fullWidth
            size="lg"
          >
            {selectedMethod === 'cash' ? 'Confirm & Pay at Counter' : 'Pay Now'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)] flex items-center justify-center">Loading...</div>}>
      <PaymentContent />
    </Suspense>
  )
}

