'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Phone, User as UserIcon, Mail, ArrowRight, Shield } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAppStore } from '@/lib/store'
import { useToast } from '@/components/ui/Toaster'
import { formatPrice, generateOrderNumber, getEstimatedTime } from '@/lib/utils'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, tableId, tableNumber, getCartTotal, user, setUser, clearCart, setCurrentOrderId } = useAppStore()
  const { addToast } = useToast()

  const [step, setStep] = useState<'info' | 'otp'>('info')
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: '',
  })
  const [otp, setOtp] = useState('')
  const [sentOtp, setSentOtp] = useState('')

  useEffect(() => {
    if (cart.length === 0) {
      router.push('/menu')
    }
  }, [cart, router])

  const subtotal = getCartTotal()
  const tax = subtotal * 0.05
  const total = subtotal + tax

  const handleSendOtp = async () => {
    if (!formData.name || !formData.phone) {
      addToast({ title: 'Please fill all required fields', type: 'error' })
      return
    }

    if (formData.phone.length !== 10) {
      addToast({ title: 'Please enter a valid 10-digit phone number', type: 'error' })
      return
    }

    setIsLoading(true)
    try {
      // Generate dummy OTP (in production, send via SMS)
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
      setSentOtp(generatedOtp)
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      addToast({ 
        title: 'OTP Sent', 
        description: `Demo OTP: ${generatedOtp} (In production, this would be sent via SMS)`,
        type: 'success' 
      })
      setStep('otp')
    } catch {
      addToast({ title: 'Failed to send OTP', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (otp !== sentOtp) {
      addToast({ title: 'Invalid OTP', type: 'error' })
      return
    }

    setIsLoading(true)
    try {
      // Create order
      const specialRequests = typeof window !== 'undefined' 
        ? sessionStorage.getItem('specialRequests') || ''
        : ''

      const orderNumber = generateOrderNumber()
      const estimatedTime = getEstimatedTime(cart.length)

      const orderData = {
        orderNumber,
        tableId,
        customerName: formData.name,
        customerPhone: formData.phone,
        items: cart.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
          customizations: item.customizations,
          notes: item.notes,
        })),
        subtotal,
        tax,
        total,
        specialRequests,
        estimatedTime,
      }

      // Try to create order via API
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        })
        if (res.ok) {
          const order = await res.json()
          setCurrentOrderId(order.id)
        }
      } catch {
        // Demo mode - use generated order number
        setCurrentOrderId(orderNumber)
      }

      // Save user info
      setUser({
        name: formData.name,
        phone: formData.phone,
        verified: true,
      })

      // Clear cart
      clearCart()
      sessionStorage.removeItem('specialRequests')

      // Navigate to order confirmation
      addToast({ title: 'Order placed successfully!', type: 'success' })
      router.push(`/order/${orderNumber}`)
    } catch {
      addToast({ title: 'Failed to place order', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header title="Checkout" showBack showCart={false} />

      <main className="max-w-lg mx-auto px-4 py-6">
        {step === 'info' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Order Summary */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
              <h3 className="font-semibold text-[var(--text)] mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-[var(--primary)]">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Customer Info Form */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <h3 className="font-semibold text-[var(--text)] mb-4">Your Details</h3>
              <div className="space-y-4">
                <Input
                  label="Name *"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  icon={<UserIcon className="w-5 h-5" />}
                />
                <Input
                  label="Phone Number *"
                  placeholder="10-digit mobile number"
                  type="tel"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  icon={<Phone className="w-5 h-5" />}
                />
                <Input
                  label="Email (Optional)"
                  placeholder="For order updates"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  icon={<Mail className="w-5 h-5" />}
                />
              </div>
            </div>

            {/* Table Info */}
            <div className="bg-[var(--primary)]/10 rounded-xl p-4 mb-6 text-center">
              <span className="text-[var(--primary)] font-medium">
                Table {tableNumber}
              </span>
            </div>

            <Button
              onClick={handleSendOtp}
              loading={isLoading}
              fullWidth
              size="lg"
            >
              Send OTP
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* OTP Verification */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-[var(--primary)]" />
              </div>
              <h3 className="font-semibold text-xl text-[var(--text)] mb-2">
                Verify Your Phone
              </h3>
              <p className="text-gray-500 mb-6">
                We sent a 6-digit code to +91 {formData.phone}
              </p>

              <div className="flex justify-center gap-2 mb-6">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    value={otp[i] || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '')
                      const newOtp = otp.split('')
                      newOtp[i] = val
                      setOtp(newOtp.join(''))
                      if (val && e.target.nextElementSibling) {
                        (e.target.nextElementSibling as HTMLInputElement).focus()
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[i] && e.currentTarget.previousElementSibling) {
                        (e.currentTarget.previousElementSibling as HTMLInputElement).focus()
                      }
                    }}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-[var(--primary)] focus:outline-none"
                  />
                ))}
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Demo OTP: <span className="font-mono font-bold">{sentOtp}</span>
              </p>

              <button
                onClick={() => setStep('info')}
                className="text-[var(--primary)] font-medium text-sm"
              >
                Change phone number
              </button>
            </div>

            <Button
              onClick={handleVerifyOtp}
              loading={isLoading}
              disabled={otp.length !== 6}
              fullWidth
              size="lg"
            >
              Verify & Place Order
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  )
}

