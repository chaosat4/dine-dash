'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, User, Phone, MessageSquare, CreditCard, Banknote, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAppStore } from '@/lib/store'
import { useToast } from '@/components/ui/Toaster'
import { formatPrice } from '@/lib/utils'

const paymentMethods = [
  { id: 'cash', label: 'Cash', icon: Banknote },
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'upi', label: 'UPI', icon: Wallet },
]

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { addToast } = useToast()
  
  const { 
    restaurant, 
    cart, 
    tableId, 
    tableNumber, 
    getCartTotal, 
    clearCart, 
    setCurrentOrderId,
    user,
    setUser
  } = useAppStore()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    specialRequests: '',
    paymentMethod: 'cash',
  })

  const brandSettings = restaurant?.brandSettings
  const subtotal = getCartTotal()
  const tax = subtotal * 0.05
  const total = subtotal + tax

  const handleSubmit = async () => {
    if (!formData.phone || formData.phone.length < 10) {
      addToast({ title: 'Please enter a valid phone number', type: 'error' })
      return
    }

    if (!tableId) {
      addToast({ title: 'Please scan a table QR code first', type: 'error' })
      router.push(`/r/${slug}/scan`)
      return
    }

    setIsSubmitting(true)
    try {
      // Save user info to store
      if (formData.phone) {
        setUser({
          phone: formData.phone,
          name: formData.name || undefined,
          verified: false,
        })
      }

      const orderData = {
        restaurantId: restaurant?.id,
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
        specialRequests: formData.specialRequests,
        paymentMethod: formData.paymentMethod,
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (res.ok) {
        const order = await res.json()
        setCurrentOrderId(order.id)
        clearCart()
        addToast({ title: 'Order placed successfully!', type: 'success' })
        router.push(`/r/${slug}/order/${order.id}`)
      } else {
        addToast({ title: 'Failed to place order', type: 'error' })
      }
    } catch (error) {
      addToast({ title: 'Something went wrong', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div 
      className="min-h-screen pb-32"
      style={{ backgroundColor: brandSettings?.backgroundColor || 'var(--background)' }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 
              className="text-xl font-bold"
              style={{ color: brandSettings?.textColor || 'var(--text)' }}
            >
              Checkout
            </h1>
            {tableNumber && (
              <p className="text-sm text-gray-500">Table {tableNumber}</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Contact Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <h2 className="font-bold mb-4" style={{ color: brandSettings?.textColor || 'var(--text)' }}>
            Contact Details
          </h2>
          <div className="space-y-4">
            <Input
              label="Name"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              icon={<User className="w-5 h-5" />}
            />
            <Input
              label="Phone Number *"
              placeholder="10-digit mobile number"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              icon={<Phone className="w-5 h-5" />}
              required
            />
          </div>
        </motion.div>

        {/* Special Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <h2 className="font-bold mb-4" style={{ color: brandSettings?.textColor || 'var(--text)' }}>
            Special Requests
          </h2>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              placeholder="Any dietary requirements or special instructions?"
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              rows={3}
            />
          </div>
        </motion.div>

        {/* Payment Method */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <h2 className="font-bold mb-4" style={{ color: brandSettings?.textColor || 'var(--text)' }}>
            Payment Method
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon
              const isSelected = formData.paymentMethod === method.id
              return (
                <button
                  key={method.id}
                  onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-[var(--primary)] bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={isSelected ? { borderColor: brandSettings?.primaryColor } : {}}
                >
                  <Icon 
                    className="w-6 h-6 mx-auto mb-2" 
                    style={{ color: isSelected ? brandSettings?.primaryColor || 'var(--primary)' : '#9CA3AF' }}
                  />
                  <span className={`text-sm font-medium ${isSelected ? 'text-[var(--text)]' : 'text-gray-500'}`}>
                    {method.label}
                  </span>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <h2 className="font-bold mb-4" style={{ color: brandSettings?.textColor || 'var(--text)' }}>
            Order Summary
          </h2>
          <div className="space-y-2">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}x {item.name}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax (5%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2">
              <span>Total</span>
              <span style={{ color: brandSettings?.primaryColor || 'var(--primary)' }}>
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Place Order Button - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={isSubmitting || !formData.phone}
          style={{ backgroundColor: brandSettings?.primaryColor }}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Placing Order...
            </div>
          ) : (
            `Place Order • ${formatPrice(total)}`
          )}
        </Button>
      </div>
    </div>
  )
}

